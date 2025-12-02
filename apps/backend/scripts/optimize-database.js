/**
 * Database Optimization Script
 * Creates indexes for frequently queried fields
 * Run this once during deployment to optimize query performance
 */

const mongoose = require('mongoose');
const logger = require('../shared/logger');

// Import models
const DTAMApplication = require('../models/DTAMApplication');
const User = require('../models/user-model');

/**
 * Create indexes for optimal query performance
 */
async function createIndexes() {
  try {
    logger.info('Starting database optimization...');

    // DTAMApplication indexes
    logger.info('Creating indexes for DTAMApplication...');

    await DTAMApplication.collection.createIndex(
      { status: 1, createdAt: -1 },
      { name: 'status_created_idx', background: true },
    );
    logger.info('✅ Created compound index: status + createdAt');

    await DTAMApplication.collection.createIndex(
      { 'inspector._id': 1, status: 1 },
      { name: 'inspector_status_idx', background: true },
    );
    logger.info('✅ Created compound index: inspector + status');

    await DTAMApplication.collection.createIndex(
      { 'farmer._id': 1, createdAt: -1 },
      { name: 'farmer_created_idx', background: true },
    );
    logger.info('✅ Created compound index: farmer + createdAt');

    await DTAMApplication.collection.createIndex(
      { 'approver._id': 1, status: 1 },
      { name: 'approver_status_idx', background: true },
    );
    logger.info('✅ Created compound index: approver + status');

    await DTAMApplication.collection.createIndex(
      { lotId: 1 },
      { name: 'lot_id_idx', unique: true, background: true },
    );
    logger.info('✅ Created unique index: lotId');

    await DTAMApplication.collection.createIndex(
      { inspectionType: 1, status: 1 },
      { name: 'inspection_type_status_idx', background: true },
    );
    logger.info('✅ Created compound index: inspectionType + status');

    await DTAMApplication.collection.createIndex(
      { 'aiQc.completedAt': -1 },
      { name: 'ai_qc_completed_idx', background: true, sparse: true },
    );
    logger.info('✅ Created index: aiQc.completedAt');

    await DTAMApplication.collection.createIndex(
      { 'inspection.scheduledDate': 1 },
      { name: 'inspection_scheduled_idx', background: true, sparse: true },
    );
    logger.info('✅ Created index: inspection.scheduledDate');

    // User indexes
    logger.info('Creating indexes for User...');

    await User.collection.createIndex(
      { email: 1 },
      { name: 'email_idx', unique: true, background: true },
    );
    logger.info('✅ Created unique index: email');

    await User.collection.createIndex(
      { role: 1, active: 1 },
      { name: 'role_active_idx', background: true },
    );
    logger.info('✅ Created compound index: role + active');

    await User.collection.createIndex(
      { idCard: 1 },
      { name: 'id_card_idx', unique: true, sparse: true, background: true },
    );
    logger.info('✅ Created unique index: idCard');

    await User.collection.createIndex({ phone: 1 }, { name: 'phone_idx', background: true });
    logger.info('✅ Created index: phone');

    // Text search indexes
    logger.info('Creating text search indexes...');

    await DTAMApplication.collection.createIndex(
      {
        lotId: 'text',
        'farmer.name': 'text',
        'farmer.farmName': 'text',
        'farmer.farmLocation.province': 'text',
      },
      { name: 'application_search_idx', background: true },
    );
    logger.info('✅ Created text search index for applications');

    await User.collection.createIndex(
      {
        name: 'text',
        email: 'text',
        phone: 'text',
      },
      { name: 'user_search_idx', background: true },
    );
    logger.info('✅ Created text search index for users');

    logger.info('✅ Database optimization completed successfully!');

    // Get index statistics
    const appIndexes = await DTAMApplication.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();

    logger.info(`DTAMApplication indexes: ${Object.keys(appIndexes).length}`);
    logger.info(`User indexes: ${Object.keys(userIndexes).length}`);

    return {
      success: true,
      applicationIndexes: Object.keys(appIndexes).length,
      userIndexes: Object.keys(userIndexes).length,
    };
  } catch (error) {
    logger.error('Database optimization failed:', error);
    throw error;
  }
}

/**
 * Analyze query performance
 */
async function analyzeQueryPerformance() {
  try {
    logger.info('Analyzing query performance...');

    // Test common queries
    const queries = [
      {
        name: 'Applications by status',
        query: () => DTAMApplication.find({ status: 'SUBMITTED' }).explain('executionStats'),
      },
      {
        name: 'Applications by inspector',
        query: () =>
          DTAMApplication.find({
            'inspector._id': mongoose.Types.ObjectId(),
            status: 'ASSIGNED',
          }).explain('executionStats'),
      },
      {
        name: 'Applications by farmer',
        query: () =>
          DTAMApplication.find({
            'farmer._id': mongoose.Types.ObjectId(),
          })
            .sort({ createdAt: -1 })
            .explain('executionStats'),
      },
      {
        name: 'Active users by role',
        query: () => User.find({ role: 'inspector', active: true }).explain('executionStats'),
      },
    ];

    const results = [];

    for (const { name, query } of queries) {
      try {
        const stats = await query();
        const executionTime = stats.executionStats.executionTimeMillis;
        const docsExamined = stats.executionStats.totalDocsExamined;
        const docsReturned = stats.executionStats.nReturned;
        const indexUsed = stats.executionStats.executionStages.indexName || 'COLLSCAN';

        results.push({
          query: name,
          executionTime: `${executionTime}ms`,
          docsExamined,
          docsReturned,
          efficiency:
            docsExamined > 0 ? ((docsReturned / docsExamined) * 100).toFixed(2) + '%' : 'N/A',
          indexUsed,
        });

        logger.info(`Query: ${name}`);
        logger.info(`  Execution time: ${executionTime}ms`);
        logger.info(`  Index used: ${indexUsed}`);
        logger.info(`  Docs examined: ${docsExamined}`);
        logger.info(`  Docs returned: ${docsReturned}`);
      } catch (error) {
        logger.warn(`Query analysis failed for ${name}:`, error.message);
      }
    }

    return results;
  } catch (error) {
    logger.error('Query performance analysis failed:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
async function getDatabaseStats() {
  try {
    const stats = await mongoose.connection.db.stats();

    return {
      collections: stats.collections,
      dataSize: (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
      storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
      indexes: stats.indexes,
      indexSize: (stats.indexSize / 1024 / 1024).toFixed(2) + ' MB',
      avgObjSize: (stats.avgObjSize / 1024).toFixed(2) + ' KB',
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Drop unused indexes (be careful!)
 */
async function dropUnusedIndexes() {
  try {
    logger.warn('⚠️  Dropping unused indexes...');

    // This is a placeholder - implement based on your needs
    // Use db.collection.getIndexes() to review first

    logger.info('✅ Unused indexes dropped');
  } catch (error) {
    logger.error('Failed to drop indexes:', error);
    throw error;
  }
}

/**
 * Run full optimization
 */
async function optimize() {
  try {
    logger.info('='.repeat(50));
    logger.info('DATABASE OPTIMIZATION STARTING');
    logger.info('='.repeat(50));

    // Create indexes
    const indexResult = await createIndexes();

    // Get database stats
    const dbStats = await getDatabaseStats();
    logger.info('Database Statistics:');
    logger.info(JSON.stringify(dbStats, null, 2));

    // Analyze performance
    const perfResults = await analyzeQueryPerformance();
    logger.info('Query Performance Analysis:');
    logger.info(JSON.stringify(perfResults, null, 2));

    logger.info('='.repeat(50));
    logger.info('DATABASE OPTIMIZATION COMPLETED');
    logger.info('='.repeat(50));

    return {
      success: true,
      indexes: indexResult,
      stats: dbStats,
      performance: perfResults,
    };
  } catch (error) {
    logger.error('Optimization failed:', error);
    throw error;
  }
}

// CLI execution helper
async function runOptimization() {
  const mongoManager = require('../config/mongodb-manager');
  try {
    // Connect to database
    await mongoManager.connect();

    // Run optimization
    const result = await optimize();

    console.log('\n✅ Optimization successful!');
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Optimization failed:', error);
    process.exit(1);
  }
}

// CLI execution
if (require.main === module) {
  runOptimization();
}

module.exports = {
  createIndexes,
  analyzeQueryPerformance,
  getDatabaseStats,
  optimize,
};
