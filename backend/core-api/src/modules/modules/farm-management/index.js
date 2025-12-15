/**
 * 🌱 Farm Management Module Entry Point
 * Exports all farm management module components
 */

const logger = require('../../shared/shared/logger/logger');
const FarmManagementService = require('./services/FarmManagement.service');
const FarmManagementController = require('./controllers/FarmManagement.controller');
const farmRoutes = require('./routes/farm.routes');
const CultivationCycle = require('./models/cultivation-cycle');
const validators = require('./validators/FarmManagement.validators');

/**
 * Initialize farm management module
 * @param {Object} dependencies - Module dependencies
 * @param {Object} dependencies.db - MongoDB database instance
 * @param {Function} dependencies.auth - Auth middleware
 * @returns {Object} Module exports
 */
function initializeFarmManagement(dependencies = {}) {
  const { db, auth } = dependencies;

  if (!db) {
    throw new Error('[FarmManagement] Database connection required');
  }

  if (!auth) {
    throw new Error('[FarmManagement] Auth middleware required');
  }

  // Create service instance
  const farmService = new FarmManagementService(db);

  // Create routes
  const router = farmRoutes({ farmService, auth });

  logger.info('[FarmManagement] ✅ Module initialized successfully');

  return {
    router,
    service: farmService,
    models: {
      CultivationCycle,
    },
    validators,
  };
}

module.exports = {
  initializeFarmManagement,
  FarmManagementService,
  FarmManagementController,
  CultivationCycle,
  validators,
};
