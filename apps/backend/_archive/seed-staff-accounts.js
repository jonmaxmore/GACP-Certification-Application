/**
 * Seed Staff Accounts
 * Creates test staff accounts for development
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('📦 Loading seed script...');

// Import DTAMStaff model
const DTAMStaff = require('../modules/AuthDtam/models/DTAMStaff');

const testStaffAccounts = [
    {
        email: 'admin@dtam.go.th',
        username: 'admin',
        password: 'admin123',
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
    },
    {
        email: 'reviewer@dtam.go.th',
        username: 'reviewer',
        password: 'reviewer123',
        firstName: 'ผู้ตรวจสอบ',
        lastName: 'เอกสาร',
        role: 'auditor',
        department: 'Quality Assurance',
        position: 'Document Reviewer',
    },
    {
        email: 'scheduler@dtam.go.th',
        username: 'scheduler',
        password: 'scheduler123',
        firstName: 'ผู้จัดตาราง',
        lastName: 'ตรวจประเมิน',
        role: 'officer',
        department: 'Operations',
        position: 'Audit Scheduler',
    },
    {
        email: 'accountant@dtam.go.th',
        username: 'accountant',
        password: 'accountant123',
        firstName: 'นักบัญชี',
        lastName: 'การเงิน',
        role: 'officer',
        department: 'Finance',
        position: 'Accountant',
    },
    {
        email: 'auditor@dtam.go.th',
        username: 'auditor',
        password: 'auditor123',
        firstName: 'ผู้ตรวจประเมิน',
        lastName: 'ภาคสนาม',
        role: 'auditor',
        department: 'Inspection',
        position: 'Field Auditor',
    },
];

async function seedStaffAccounts() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_development';

    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB');

        // Log existing staff count
        const existingCount = await DTAMStaff.countDocuments();
        console.log(`📊 Existing staff accounts: ${existingCount}`);

        // Create accounts
        let created = 0;
        let skipped = 0;

        for (const staffData of testStaffAccounts) {
            try {
                // Check if already exists
                const existing = await DTAMStaff.findOne({
                    $or: [
                        { email: staffData.email },
                        { username: staffData.username }
                    ]
                });

                if (existing) {
                    console.log(`⏭️  Skip: ${staffData.email} (already exists)`);
                    skipped++;
                    continue;
                }

                // Create new staff
                const staff = new DTAMStaff({
                    ...staffData,
                    isActive: true,
                    userType: 'DTAM_STAFF',
                    status: 'active',
                    phoneNumber: '02-123-4567',
                    employeeId: `EMP-${staffData.role.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                });

                await staff.save();
                console.log(`✅ Created: ${staffData.email} (${staffData.role})`);
                created++;
            } catch (error) {
                console.error(`❌ Error creating ${staffData.email}:`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${created + skipped}`);

        console.log('\n🔑 Test Credentials:');
        console.log('   admin@dtam.go.th / admin123');
        console.log('   reviewer@dtam.go.th / reviewer123');
        console.log('   scheduler@dtam.go.th / scheduler123');
        console.log('   accountant@dtam.go.th / accountant123');
        console.log('   auditor@dtam.go.th / auditor123');

    } catch (error) {
        console.error('❌ Seed error:', error.message);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run
seedStaffAccounts()
    .then(() => {
        console.log('✅ Seed completed!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    });

