/**
 * Staff Account Seeder
 * Creates real staff accounts in production database
 * Run: node scripts/seedStaff.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority';

// Staff accounts to create
const staffAccounts = [
    {
        email: 'reviewer01@gacp.go.th',
        password: 'Staff@2024!',
        firstName: 'สมชาย',
        lastName: 'ตรวจเอกสาร',
        accountType: 'STAFF',
        role: 'REVIEWER_AUDITOR',
        departmentId: 'DOC_REVIEW',
        teamId: 'TEAM_A',
        region: 'CENTRAL',
        status: 'ACTIVE',
        verificationStatus: 'approved',
        idCardHash: 'staff_reviewer_001_hash',
    },
    {
        email: 'scheduler01@gacp.go.th',
        password: 'Staff@2024!',
        firstName: 'สมหญิง',
        lastName: 'จัดตารางงาน',
        accountType: 'STAFF',
        role: 'SCHEDULER',
        departmentId: 'SCHEDULING',
        teamId: 'TEAM_B',
        region: 'CENTRAL',
        status: 'ACTIVE',
        verificationStatus: 'approved',
        idCardHash: 'staff_scheduler_001_hash',
    },
    {
        email: 'accountant01@gacp.go.th',
        password: 'Staff@2024!',
        firstName: 'สมศรี',
        lastName: 'บัญชี',
        accountType: 'STAFF',
        role: 'ACCOUNTANT',
        departmentId: 'ACCOUNTING',
        teamId: 'TEAM_C',
        region: 'CENTRAL',
        status: 'ACTIVE',
        verificationStatus: 'approved',
        idCardHash: 'staff_accountant_001_hash',
    },
];

async function seedStaff() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get User model
        const User = require('../models/UserModel');

        console.log('\n📝 Creating staff accounts...\n');

        for (const staff of staffAccounts) {
            // Check if already exists
            const existing = await User.findOne({ email: staff.email.toLowerCase() });
            if (existing) {
                console.log(`⏭️  Skipped: ${staff.email} (already exists)`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(staff.password, 12);

            // Create user with direct insert to bypass index issues for staff
            const userData = {
                ...staff,
                email: staff.email.toLowerCase(),
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Use insertOne to bypass mongoose hooks
            await mongoose.connection.collection('users').insertOne(userData);
            console.log(`✅ Created: ${staff.email} (${staff.role})`);
        }

        console.log('\n🎉 Staff seeding complete!\n');
        console.log('='.repeat(50));
        console.log('LOGIN CREDENTIALS:');
        console.log('='.repeat(50));
        staffAccounts.forEach(s => {
            console.log(`\n📧 Email: ${s.email}`);
            console.log(`🔑 Password: ${s.password}`);
            console.log(`👤 Role: ${s.role}`);
        });
        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seedStaff();

