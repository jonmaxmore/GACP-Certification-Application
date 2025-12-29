/**
 * Reset and Seed Staff Accounts
 * CLEARS ALL EXISTING STAFF and creates fresh test accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🗑️ Reset and Seed Staff Script...');

const DTAMStaff = require('../modules/AuthDtam/models/DTAMStaff');

const testStaffAccounts = [
    {
        email: 'testadmin@gacp.go.th',
        username: 'testadmin',
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
        department: 'IT',
    },
    {
        email: 'testauditor@gacp.go.th',
        username: 'testauditor',
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'Auditor',
        role: 'auditor',
        department: 'Inspection',
    },
    {
        email: 'testofficer@gacp.go.th',
        username: 'testofficer',
        password: 'Test1234!',
        firstName: 'Test',
        lastName: 'Officer',
        role: 'officer',
        department: 'Operations',
    },
];

async function resetAndSeed() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_development';

    console.log('🔌 Connecting to MongoDB...');

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected');

        // Delete ALL existing staff
        console.log('🗑️ Deleting ALL existing staff...');
        const deleteResult = await DTAMStaff.deleteMany({});
        console.log(`   Deleted: ${deleteResult.deletedCount} accounts`);

        // Create new accounts
        console.log('✨ Creating fresh test accounts...');

        for (const staffData of testStaffAccounts) {
            const staff = new DTAMStaff({
                ...staffData,
                isActive: true,
                userType: 'DTAM_STAFF',
            });

            await staff.save();
            console.log(`✅ Created: ${staffData.username} / ${staffData.password}`);
        }

        console.log('\n🔑 Test Credentials:');
        console.log('   testadmin / Test1234!');
        console.log('   testauditor / Test1234!');
        console.log('   testofficer / Test1234!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Done!');
    }
}

resetAndSeed();
