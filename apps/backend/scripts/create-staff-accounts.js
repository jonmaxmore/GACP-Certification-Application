/**
 * Create Additional Staff Accounts Script
 * Run: node scripts/createStaffAccounts.js
 */

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use command line MONGODB_URI or default
const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority';

// Staff accounts to create
const staffAccounts = [
    {
        email: 'auditor@dtam.go.th',
        username: 'auditor',
        password: 'Auditor@123',
        firstName: 'ผู้ตรวจสอบ',
        lastName: 'GACP',
        role: 'auditor',
        department: 'ฝ่ายตรวจสอบ',
        userType: 'DTAM_STAFF',
        isActive: true,
    },
    {
        email: 'officer@dtam.go.th',
        username: 'officer',
        password: 'Officer@123',
        firstName: 'เจ้าหน้าที่',
        lastName: 'GACP',
        role: 'officer',
        department: 'ฝ่ายดำเนินการ',
        userType: 'DTAM_STAFF',
        isActive: true,
    },
];

async function createStaff() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Define schema inline (matches DTAMStaff)
        const dtamStaffSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true, lowercase: true },
            email: { type: String, required: true, unique: true, lowercase: true },
            password: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            userType: { type: String, enum: ['DTAM_STAFF'], default: 'DTAM_STAFF' },
            role: { type: String, enum: ['admin', 'auditor', 'officer'], default: 'auditor' },
            department: { type: String, default: 'กรมส่งเสริมการเกษตร' },
            isActive: { type: Boolean, default: true },
        }, { timestamps: true, collection: 'dtam_staff' });

        const DTAMStaff = mongoose.models.DTAMStaff || mongoose.model('DTAMStaff', dtamStaffSchema);

        for (const account of staffAccounts) {
            // Check if exists
            const existing = await DTAMStaff.findOne({
                $or: [{ email: account.email }, { username: account.username }]
            });

            if (existing) {
                console.log(`⏭️  ${account.username} already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(account.password, 12);

            // Create account
            const staff = new DTAMStaff({
                ...account,
                password: hashedPassword,
            });
            await staff.save();

            console.log(`✅ Created: ${account.username} (${account.role})`);
        }

        console.log('\n🎉 All staff accounts processed!');
        console.log('\n📋 Staff Accounts:');
        console.log('----------------------------------------');
        console.log('| Username  | Password      | Role     |');
        console.log('----------------------------------------');
        console.log('| admin     | Admin@123     | admin    |');
        console.log('| auditor   | Auditor@123   | auditor  |');
        console.log('| officer   | Officer@123   | officer  |');
        console.log('----------------------------------------');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

createStaff();
