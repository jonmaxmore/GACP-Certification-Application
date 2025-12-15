/**
 * Pagination and Lazy Loading Utilities
 * Optimizes query performance and reduces payload size
 */

const logger = require('../utils/logger');

/**
 * Parse pagination parameters from request
 */
function parsePaginationParams(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 items per page
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

/**
 * Parse field selection from request
 * Supports both include and exclude modes
 */
function parseFieldSelection(req) {
  const { fields, exclude } = req.query;

  if (fields) {
    // Include only specified fields
    return fields.split(',').join(' ');
  }

  if (exclude) {
    // Exclude specified fields
    return exclude
      .split(',')
      .map(f => `-${f}`)
      .join(' ');
  }

  // Return null to include all fields (default)
  return null;
}

/**
 * Parse sorting parameters
 */
function parseSortParams(req) {
  const { sort, order = 'desc' } = req.query;

  if (!sort) {
    return { createdAt: -1 }; // Default sort
  }

  const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
  return { [sort]: sortOrder };
}

/**
 * Build paginated response
 */
function buildPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
}

/**
 * Paginate Mongoose query
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 */
async function paginateQuery(model, query = {}, options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = null,
      populate = null,
    } = options;

    const skip = (page - 1) * limit;

    // Build query
    let mongoQuery = model.find(query);

    // Apply field selection
    if (select) {
      mongoQuery = mongoQuery.select(select);
    }

    // Apply population
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => {
          mongoQuery = mongoQuery.populate(pop);
        });
      } else {
        mongoQuery = mongoQuery.populate(populate);
      }
    }

    // Apply sorting, skip, and limit
    mongoQuery = mongoQuery.sort(sort).skip(skip).limit(limit).lean(); // Use lean() for better performance

    // Execute query and count in parallel
    const [data, total] = await Promise.all([mongoQuery.exec(), model.countDocuments(query)]);

    return buildPaginatedResponse(data, total, page, limit);
  } catch (error) {
    logger.error('Pagination error:', error);
    throw error;
  }
}

/**
 * Cursor-based pagination (better for real-time data)
 */
async function paginateByCursor(model, query = {}, options = {}) {
  try {
    const { cursor = null, limit = 10, sort = { createdAt: -1 }, select = null } = options;

    // Build query with cursor
    const cursorQuery = cursor ? { ...query, _id: { $lt: cursor } } : query;

    // Build and execute query
    let mongoQuery = model
      .find(cursorQuery)
      .sort(sort)
      .limit(limit + 1) // Fetch one extra to check if there's more
      .lean();

    if (select) {
      mongoQuery = mongoQuery.select(select);
    }

    const data = await mongoQuery.exec();
    const hasMore = data.length > limit;

    // Remove extra item if exists
    if (hasMore) {
      data.pop();
    }

    // Get next cursor
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1]._id : null;

    return {
      data,
      cursor: {
        next: nextCursor,
        hasMore,
      },
    };
  } catch (error) {
    logger.error('Cursor pagination error:', error);
    throw error;
  }
}

/**
 * Optimized field selection presets
 */
const fieldPresets = {
  // Application list view (minimal data)
  applicationList:
    'lotId status farmer.name farmer.farmName createdAt inspectionType aiQc.overallScore',

  // Application detail view (full data)
  applicationDetail: '-__v', // Exclude only version key

  // User list view
  userList: 'name email role active createdAt',

  // User profile view
  userProfile: '-password -__v', // Exclude sensitive fields

  // Inspector dashboard
  inspectorDashboard: 'lotId status farmer.name inspection.scheduledDate createdAt',

  // Approver dashboard
  approverDashboard: 'lotId status farmer.name inspector.name aiQc.overallScore createdAt',
};

/**
 * Lazy loading middleware
 * Automatically applies pagination and field selection
 */
function lazyLoadMiddleware(modelName, preset = null) {
  return async (req, res, next) => {
    try {
      // Parse parameters
      const { page, limit, skip } = parsePaginationParams(req);
      const sort = parseSortParams(req);
      const fields = parseFieldSelection(req) || (preset ? fieldPresets[preset] : null);

      // Attach to request for use in controller
      req.pagination = {
        page,
        limit,
        skip,
        sort,
        fields,
      };

      next();
    } catch (error) {
      logger.error('Lazy load middleware error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
        error: error.message,
      });
    }
  };
}

/**
 * Optimize query for large datasets
 * Use indexes and projections
 */
function optimizeQuery(query) {
  // Add hint to use specific index if needed
  // query.hint({ status: 1, createdAt: -1 });

  // Use lean() for read-only operations
  query.lean();

  // Set read preference for better load distribution
  query.read('secondaryPreferred');

  return query;
}

/**
 * Batch load related documents
 * Reduces N+1 query problem
 */
async function batchLoad(model, ids, options = {}) {
  try {
    const { select = null, populate = null } = options;

    let query = model.find({ _id: { $in: ids } }).lean();

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    const documents = await query.exec();

    // Create map for O(1) lookup
    const docMap = new Map();
    documents.forEach(doc => {
      docMap.set(doc._id.toString(), doc);
    });

    return docMap;
  } catch (error) {
    logger.error('Batch load error:', error);
    throw error;
  }
}

/**
 * Stream large result sets
 * Memory-efficient for exports
 */
async function streamResults(model, query, options = {}) {
  const { select = null, batchSize = 100 } = options;

  let mongoQuery = model.find(query).lean();

  if (select) {
    mongoQuery = mongoQuery.select(select);
  }

  return mongoQuery.cursor({ batchSize }).on('error', error => {
    logger.error('Stream error:', error);
  });
}

module.exports = {
  parsePaginationParams,
  parseFieldSelection,
  parseSortParams,
  buildPaginatedResponse,
  paginateQuery,
  paginateByCursor,
  fieldPresets,
  lazyLoadMiddleware,
  optimizeQuery,
  batchLoad,
  streamResults,
};
