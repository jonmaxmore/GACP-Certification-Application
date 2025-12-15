/**
 * Migration 002: Add workflow fields to Application model
 *
 * Date: 2025-11-05
 * Author: GACP Platform Team
 * Description: Add AI Pre-Check, QC Review, Routing, QA Verification fields
 *
 * Changes:
 * 1. Add aiPreCheck field (AI validation results)
 * 2. Add qcReview field (QC Officer review)
 * 3. Add routing field (Smart Router decisions)
 * 4. Add qaVerification field (QA Verifier checks)
 * 5. Add metrics field (processing time tracking)
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../apps/backend/.env') });

/**
 * Migration UP - Apply changes
 */
async function up() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Migration 002: Add Application Workflow Fields       ║');
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
    const applicationsCollection = db.collection('applications');

    // Count existing applications
    const totalApps = await applicationsCollection.countDocuments();
    console.log(`📊 Found ${totalApps} applications\n`);

    // 1. Add new workflow fields
    console.log('📝 Step 1: Adding workflow fields...');
    const result = await applicationsCollection.updateMany(
      {},
      {
        $set: {
          // AI Pre-Check results
          aiPreCheck: {
            completenessScore: null,
            riskLevel: null,
            flags: [],
            recommendation: null,
            checkedAt: null,
            processingTimeMs: null
          },

          // QC Officer review
          qcReview: {
            officerId: null,
            preScore: null,
            classification: null, // FAST_TRACK, NORMAL, COMPLEX
            issues: [],
            recommendation: null,
            reviewedAt: null,
            timeSpentMinutes: null
          },

          // Smart Router decision
          routing: {
            priority: 'NORMAL', // FAST_TRACK, NORMAL, HIGH_RISK
            inspectionType: null, // VIDEO_ONLY, HYBRID, FULL_ONSITE
            assignedInspectorId: null,
            estimatedDuration: null,
            routedAt: null,
            routingReason: null
          },

          // QA Verification
          qaVerification: {
            verifierId: null,
            samplingType: null, // MANDATORY, RANDOM, NONE
            verificationStatus: null, // PASSED, FAILED, PENDING, SKIPPED
            issues: [],
            verifiedAt: null,
            needsReinspection: false
          },

          // Processing metrics
          metrics: {
            totalProcessingDays: null,
            aiCheckDuration: null,        // milliseconds
            qcReviewDuration: null,       // minutes
            reviewerDuration: null,       // minutes
            inspectionDuration: null,     // minutes
            qaVerificationDuration: null, // minutes
            approvalDuration: null        // minutes
          }
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} applications\n`);

    // 2. Create indexes for new fields
    console.log('📝 Step 2: Creating indexes...');
    await applicationsCollection.createIndex({ 'aiPreCheck.riskLevel': 1 });
    await applicationsCollection.createIndex({ 'aiPreCheck.recommendation': 1 });
    await applicationsCollection.createIndex({ 'qcReview.classification': 1 });
    await applicationsCollection.createIndex({ 'qcReview.officerId': 1 });
    await applicationsCollection.createIndex({ 'routing.priority': 1 });
    await applicationsCollection.createIndex({ 'routing.inspectionType': 1 });
    await applicationsCollection.createIndex({ 'routing.assignedInspectorId': 1 });
    await applicationsCollection.createIndex({ 'qaVerification.verifierId': 1 });
    await applicationsCollection.createIndex({ 'qaVerification.verificationStatus': 1 });
    console.log('✅ Indexes created\n');

    // 3. Verify migration
    console.log('📝 Step 3: Verifying migration...');
    const sampleApp = await applicationsCollection.findOne({});
    if (sampleApp) {
      console.log('Sample application record:');
      console.log('- AI Pre-Check:', sampleApp.aiPreCheck ? '✅' : '❌');
      console.log('- QC Review:', sampleApp.qcReview ? '✅' : '❌');
      console.log('- Routing:', sampleApp.routing ? '✅' : '❌');
      console.log('- QA Verification:', sampleApp.qaVerification ? '✅' : '❌');
      console.log('- Metrics:', sampleApp.metrics ? '✅' : '❌');
    }
    console.log('');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 002 completed successfully!              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    return { success: true, modifiedCount: result.modifiedCount };

  } catch (error) {
    console.error('❌ Migration 002 failed:', error);
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
  console.log('║  Migration 002 ROLLBACK: Remove Workflow Fields       ║');
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
    const applicationsCollection = db.collection('applications');

    // 1. Remove workflow fields
    console.log('📝 Step 1: Removing workflow fields...');
    const result = await applicationsCollection.updateMany(
      {},
      {
        $unset: {
          aiPreCheck: '',
          qcReview: '',
          routing: '',
          qaVerification: '',
          metrics: ''
        }
      }
    );
    console.log(`✅ Removed fields from ${result.modifiedCount} applications\n`);

    // 2. Drop indexes
    console.log('📝 Step 2: Removing indexes...');
    try {
      await applicationsCollection.dropIndex('aiPreCheck.riskLevel_1');
      await applicationsCollection.dropIndex('aiPreCheck.recommendation_1');
      await applicationsCollection.dropIndex('qcReview.classification_1');
      await applicationsCollection.dropIndex('qcReview.officerId_1');
      await applicationsCollection.dropIndex('routing.priority_1');
      await applicationsCollection.dropIndex('routing.inspectionType_1');
      await applicationsCollection.dropIndex('routing.assignedInspectorId_1');
      await applicationsCollection.dropIndex('qaVerification.verifierId_1');
      await applicationsCollection.dropIndex('qaVerification.verificationStatus_1');
      console.log('✅ Indexes removed\n');
    } catch (error) {
      console.log('⚠️  Some indexes not found (this is OK)\n');
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 002 rollback completed!                  ║');
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
    console.log('  node 002-add-application-workflow-fields.js up    - Apply migration');
    console.log('  node 002-add-application-workflow-fields.js down  - Rollback migration');
    process.exit(1);
  }
}

module.exports = { up, down };
