/**
 * Migration 002: Update DTAM Roles to Auditor and Officer
 *
 * Date: 2025-12-03
 * Author: GACP Platform Team
 * Description: Consolidate Reviewer/Inspector/Approver to Auditor, and Manager to Officer.
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
    console.log('║  Migration 002: Update DTAM Roles                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
        // Connect to database
        console.log('📡 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-certification';
        console.log(`Using URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Mask credentials

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // 1. Update Schema Validation (if needed, but usually handled by code)
        // We skip this as we updated the code model already.

        // 2. Migrate Roles
        console.log('📝 Step 1: Migrating roles...');

        // Reviewer, Inspector, Approver -> Auditor
        const auditorResult = await DTAMStaff.updateMany(
            { role: { $in: ['reviewer', 'inspector', 'approver', 'qc_officer', 'qa_verifier'] } },
            { $set: { role: 'auditor' } }
        );
        console.log(`✅ Migrated ${auditorResult.modifiedCount} staff to 'auditor'`);

        // Manager -> Officer
        const officerResult = await DTAMStaff.updateMany(
            { role: 'manager' },
            { $set: { role: 'officer' } }
        );
        console.log(`✅ Migrated ${officerResult.modifiedCount} staff to 'officer'`);

        // Operator -> Officer (Optional, or keep as Officer?)
        // Let's migrate Operator to Officer as well for simplicity based on "Officer handles queue"
        const operatorResult = await DTAMStaff.updateMany(
            { role: 'operator' },
            { $set: { role: 'officer' } }
        );
        console.log(`✅ Migrated ${operatorResult.modifiedCount} staff to 'officer'`);


        // 3. Verify migration
        console.log('\n📝 Step 2: Verifying migration...');
        const staffCounts = await DTAMStaff.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('Current Role Distribution:');
        staffCounts.forEach(stat => {
            console.log(`- ${stat._id}: ${stat.count}`);
        });
        console.log('');

        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║  ✅ Migration 002 completed successfully!              ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

        return { success: true };

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
    console.log('║  Migration 002 ROLLBACK: Revert Roles                  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
        // Connect to database
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Note: Rollback is imperfect because we lost the original specific roles.
        // We will revert 'auditor' to 'reviewer' as a safe default, and 'officer' to 'manager'.

        console.log('📝 Step 1: Reverting roles (Best Effort)...');

        const auditorResult = await DTAMStaff.updateMany(
            { role: 'auditor' },
            { $set: { role: 'reviewer' } }
        );
        console.log(`✅ Reverted ${auditorResult.modifiedCount} auditors to 'reviewer'`);

        const officerResult = await DTAMStaff.updateMany(
            { role: 'officer' },
            { $set: { role: 'manager' } }
        );
        console.log(`✅ Reverted ${officerResult.modifiedCount} officers to 'manager'`);

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
        console.log('  node 002-update-dtam-roles.js up    - Apply migration');
        console.log('  node 002-update-dtam-roles.js down  - Rollback migration');
        process.exit(1);
    }
}

module.exports = { up, down };
