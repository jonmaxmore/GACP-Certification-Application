/**
 * Global teardown for backend Jest environment.
 * Ensures database connections are closed even if individual test suites fail.
 */

module.exports = async () => {
  try {
    const mongoManager = require('./config/mongodb-manager');
    if (mongoManager && typeof mongoManager.reset === 'function') {
      await mongoManager.reset();
    } else if (mongoManager && typeof mongoManager.disconnect === 'function') {
      await mongoManager.disconnect();
    }
  } catch (error) {
    console.warn(`[jest-teardown] MongoDB manager cleanup warning: ${error.message}`);
  }

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(false);
    }
  } catch (error) {
    console.warn(`[jest-teardown] Mongoose close warning: ${error.message}`);
  }

  await new Promise(resolve => setTimeout(resolve, 250));
};
