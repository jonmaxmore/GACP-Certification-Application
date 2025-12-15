/**
 * Mongoose Plugins
 * Common plugins for all models
 */

/**
 * Timestamp plugin
 * Adds createdAt and updatedAt fields
 */
const timestampPlugin = schema => {
  schema.add({
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });

  schema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
  });
};

/**
 * Soft delete plugin
 * Adds deletedAt field and isDeleted flag
 */
const softDeletePlugin = schema => {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  });

  // Override remove method
  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    return this.save();
  };

  // Add query helper to exclude deleted documents
  schema.query.notDeleted = function () {
    return this.where({ isDeleted: false });
  };
};

/**
 * Pagination plugin
 * Adds pagination methods to queries
 */
const paginationPlugin = schema => {
  schema.statics.paginate = async function (query = {}, options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.find(query).sort(sort).skip(skip).limit(limit).lean(),
      this.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  };
};

module.exports = {
  timestampPlugin,
  softDeletePlugin,
  paginationPlugin,
};
