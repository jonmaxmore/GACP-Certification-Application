/**
 * Migration 003: Create AI Config collection
 *
 * Date: 2025-11-05
 * Author: GACP Platform Team
 * Description: Create AI configuration collection for Pre-Check and Smart Router
 *
 * Changes:
 * 1. Create aiconfigs collection
 * 2. Insert default AI Pre-Check config
 * 3. Insert default Smart Router config
 * 4. Create indexes
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../apps/backend/.env') });

// AI Config Schema
const aiConfigSchema = new mongoose.Schema({
  module: {
    type: String,
    enum: ['PRE_CHECK', 'SMART_ROUTER', 'DOCUMENT_OCR'],
    required: true,
    unique: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  config: {
    thresholds: {
      autoReject: Number,
      fastTrack: Number,
      complexCase: Number,
      videoOnly: Number,
      hybrid: Number,
      fullOnsite: Number
    },
    weights: {
      documentCompleteness: Number,
      farmerHistory: Number,
      farmSize: Number,
      cropType: Number,
      paymentStatus: Number,
      reviewScore: Number
    },
    routingRules: [{
      condition: String,
      action: String,
      priority: Number
    }]
  },
  performance: {
    accuracy: { type: Number, default: 0 },
    totalProcessed: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 },
    falseNegatives: { type: Number, default: 0 }
  },
  lastTrainedAt: Date,
  version: String
}, {
  timestamps: true,
  collection: 'aiconfigs'
});

/**
 * Migration UP - Apply changes
 */
async function up() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Migration 003: Create AI Config Collection           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Create model
    const AIConfig = mongoose.model('AIConfig', aiConfigSchema);

    // 1. Create AI Pre-Check config
    console.log('📝 Step 1: Creating AI Pre-Check config...');
    await AIConfig.create({
      module: 'PRE_CHECK',
      enabled: true,
      config: {
        thresholds: {
          autoReject: 50,      // Score < 50 → Auto reject
          fastTrack: 90,       // Score >= 90 → Fast track
          complexCase: 70      // Score < 70 → Complex case
        },
        weights: {
          documentCompleteness: 30,  // 30% weight
          farmerHistory: 20,         // 20% weight
          farmSize: 15,              // 15% weight
          cropType: 10,              // 10% weight
          paymentStatus: 25          // 25% weight
        },
        routingRules: []
      },
      performance: {
        accuracy: 0,
        totalProcessed: 0,
        correctPredictions: 0,
        falsePositives: 0,
        falseNegatives: 0
      },
      version: '1.0.0'
    });
    console.log('✅ AI Pre-Check config created\n');

    // 2. Create Smart Router config
    console.log('📝 Step 2: Creating Smart Router config...');
    await AIConfig.create({
      module: 'SMART_ROUTER',
      enabled: true,
      config: {
        thresholds: {
          videoOnly: 90,       // Score >= 90 → Video only
          hybrid: 70,          // Score >= 70 → Hybrid
          fullOnsite: 0        // Score < 70 → Full onsite
        },
        weights: {
          reviewScore: 40,     // 40% weight
          farmerHistory: 30,   // 30% weight
          farmSize: 20,        // 20% weight
          cropType: 10         // 10% weight
        },
        routingRules: [
          {
            condition: 'reviewScore >= 90 AND farmerHistory.previousCertified',
            action: 'VIDEO_ONLY',
            priority: 1
          },
          {
            condition: 'reviewScore >= 70',
            action: 'HYBRID',
            priority: 2
          },
          {
            condition: 'reviewScore < 70',
            action: 'FULL_ONSITE',
            priority: 3
          },
          {
            condition: 'farmSize > 20',
            action: 'FULL_ONSITE',
            priority: 4
          }
        ]
      },
      performance: {
        accuracy: 0,
        totalProcessed: 0,
        correctPredictions: 0,
        falsePositives: 0,
        falseNegatives: 0
      },
      version: '1.0.0'
    });
    console.log('✅ Smart Router config created\n');

    // 3. Create indexes
    console.log('📝 Step 3: Creating indexes...');
    await AIConfig.collection.createIndex({ module: 1 }, { unique: true });
    await AIConfig.collection.createIndex({ enabled: 1 });
    await AIConfig.collection.createIndex({ version: 1 });
    console.log('✅ Indexes created\n');

    // 4. Verify migration
    console.log('📝 Step 4: Verifying migration...');
    const configs = await AIConfig.find({});
    console.log(`Found ${configs.length} AI configs:`);
    configs.forEach(config => {
      console.log(`  - ${config.module}: ${config.enabled ? 'Enabled' : 'Disabled'} (v${config.version})`);
    });
    console.log('');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 003 completed successfully!              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    return { success: true, configsCreated: configs.length };

  } catch (error) {
    console.error('❌ Migration 003 failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed\n');
  }
}

/**
 * Migration DOWN - Rollback changes
 */
async function down() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Migration 003 ROLLBACK: Remove AI Config             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Drop collection
    console.log('📝 Step 1: Dropping aiconfigs collection...');
    try {
      await db.dropCollection('aiconfigs');
      console.log('✅ Collection dropped\n');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('⚠️  Collection not found (already removed)\n');
      } else {
        throw error;
      }
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 003 rollback completed!                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    return { success: true };

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed\n');
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'down') {
    down()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node 003-create-ai-config.js up    - Apply migration');
    console.log('  node 003-create-ai-config.js down  - Rollback migration');
    process.exit(1);
  }
}

module.exports = { up, down };
