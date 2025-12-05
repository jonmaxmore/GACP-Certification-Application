/**
 * Metrics Tracking Middleware
 *
 * Automatically track API requests, response times, and status codes
 * Integrates with metricsService for centralized monitoring
 */

const metricsService = require('../services/monitoring/metricsService');

/**
 * Middleware to track all API requests
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, path } = req;
    const { statusCode } = res;

    // Track API request metrics
    metricsService.trackAPIRequest(method, path, statusCode, duration);
  });

  next();
};

/**
 * Middleware to track database queries
 * Wrap mongoose queries to capture execution time
 */
const trackQuery = (model, operation) => {
  return async function (...args) {
    const startTime = Date.now();

    try {
      const result = await model[operation](...args);
      const duration = Date.now() - startTime;

      // Track query metrics
      metricsService.trackQuery(operation, duration, duration > 500);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      metricsService.trackQuery(operation, duration, true);
      throw error;
    }
  };
};

/**
 * Mongoose plugin to track all queries
 */
const mongooseMetricsPlugin = schema => {
  // Track find queries
  schema.pre('find', function () {
    this._startTime = Date.now();
  });

  schema.post('find', function (_docs) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      metricsService.trackQuery('find', duration, duration > 500);
    }
  });

  // Track findOne queries
  schema.pre('findOne', function () {
    this._startTime = Date.now();
  });

  schema.post('findOne', function (_doc) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      metricsService.trackQuery('find', duration, duration > 500);
    }
  });

  // Track save operations
  schema.pre('save', function () {
    this._startTime = Date.now();
  });

  schema.post('save', function (_doc) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      metricsService.trackQuery('insert', duration, duration > 500);
    }
  });

  // Track update operations
  schema.pre('updateOne', function () {
    this._startTime = Date.now();
  });

  schema.post('updateOne', function (_result) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      metricsService.trackQuery('update', duration, duration > 500);
    }
  });

  // Track delete operations
  schema.pre('deleteOne', function () {
    this._startTime = Date.now();
  });

  schema.post('deleteOne', function (_result) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      metricsService.trackQuery('delete', duration, duration > 500);
    }
  });
};

module.exports = {
  metricsMiddleware,
  trackQuery,
  mongooseMetricsPlugin,
};
