/**
 * Migration 001: Add new roles and fields to DTAMStaff
 *
 * Date: 2025-11-05
 * Author: GACP Platform Team
 * Description: Upgrade system to support 6 roles + AI
 *
 * Changes:
 * 1. Add new role enums: qc_officer, qa_verifier, approver
 * 2. Add workloadMetrics field
 * 3. Add specializations field
 * 4. Add aiAssistanceEnabled field
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../apps/backend/.env') });

// Import models
const DTAMStaff = require('../../apps/backend/modules/auth-dtam/models/DTAMStaff');

/**
 * Migration UP - Apply changes
 */
async function up() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Migration 001: Add New Roles and Fields              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // 1. Update collection schema validation
    console.log('📝 Step 1: Updating schema validation...');
    try {
      await mongoose.connection.db.command({
        collMod: 'dtam_staff',
        validator: {
          $jsonSchema: {
            properties: {
              role: {
                enum: [
                  'admin',
                  'qc_officer',    // NEW
                  'reviewer',
                  'inspector',
                  'qa_verifier',   // NEW
                  'approver',      // NEW
                  'manager',
                  'operator'
                ]
              }
            }
          }
        }
      });
      console.log('✅ Schema validation updated\n');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('⚠️  Collection not found, will be created on first insert\n');
      } else {
        throw error;
      }
    }

    // 2. Add new fields to existing documents
    console.log('📝 Step 2: Adding new fields to existing staff...');
    const result = await DTAMStaff.updateMany(
      {},
      {
        $set: {
          workloadMetrics: {
            assignedCases: 0,
            completedToday: 0,
            completedThisMonth: 0,
            averageCompletionTime: 0,
            qualityScore: 100,
            lastAssignedAt: null
          },
          specializations: [],
          aiAssistanceEnabled: true
        }
      }
    );
    console.log(`✅ Updated ${result.modifiedCount} staff records\n`);

    // 3. Create indexes
    console.log('📝 Step 3: Creating indexes...');
    await DTAMStaff.collection.createIndex({ role: 1 });
    await DTAMStaff.collection.createIndex({ 'workloadMetrics.assignedCases': 1 });
    await DTAMStaff.collection.createIndex({ 'workloadMetrics.qualityScore': -1 });
    await DTAMStaff.collection.createIndex({ specializations: 1 });
    console.log('✅ Indexes created\n');

    // 4. Verify migration
    console.log('📝 Step 4: Verifying migration...');
    const sampleStaff = await DTAMStaff.findOne({});
    if (sampleStaff) {
      console.log('Sample staff record:');
      console.log('- Role:', sampleStaff.role);
      console.log('- WorkloadMetrics:', sampleStaff.workloadMetrics ? '✅' : '❌');
      console.log('- Specializations:', sampleStaff.specializations ? '✅' : '❌');
      console.log('- AI Assistance:', sampleStaff.aiAssistanceEnabled ? '✅' : '❌');
    }
    console.log('');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 001 completed successfully!              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    return { success: true, modifiedCount: result.modifiedCount };

  } catch (error) {
    console.error('❌ Migration 001 failed:', error);
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
  console.log('║  Migration 001 ROLLBACK: Remove New Roles             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // 1. Remove new fields
    console.log('📝 Step 1: Removing new fields...');
    const result = await DTAMStaff.updateMany(
      {},
      {
        $unset: {
          workloadMetrics: '',
          specializations: '',
          aiAssistanceEnabled: ''
        }
      }
    );
    console.log(`✅ Removed fields from ${result.modifiedCount} records\n`);

    // 2. Revert schema validation
    console.log('📝 Step 2: Reverting schema validation...');
    await mongoose.connection.db.command({
      collMod: 'dtam_staff',
      validator: {
        $jsonSchema: {
          properties: {
            role: {
              enum: [
                'admin',
                'reviewer',
                'manager',
                'inspector',
                'operator'
              ]
            }
          }
        }
      }
    });
    console.log('✅ Schema validation reverted\n');

    // 3. Remove indexes
    console.log('📝 Step 3: Removing indexes...');
    try {
      await DTAMStaff.collection.dropIndex('workloadMetrics.assignedCases_1');
      await DTAMStaff.collection.dropIndex('workloadMetrics.qualityScore_-1');
      await DTAMStaff.collection.dropIndex('specializations_1');
      console.log('✅ Indexes removed\n');
    } catch (error) {
      console.log('⚠️  Some indexes not found (this is OK)\n');
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Migration 001 rollback completed!                  ║');
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
    console.log('  node 001-add-new-roles.js up    - Apply migration');
    console.log('  node 001-add-new-roles.js down  - Rollback migration');
    process.exit(1);
  }
}

module.exports = { up, down };
