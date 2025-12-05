require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed
const bcrypt = require('bcrypt');

const auditors = [
    {
        email: 'auditor1@gacp.com',
        firstName: 'Somchai',
        lastName: 'Auditor',
        role: 'auditor',
        password: 'password123',
        phoneNumber: '0811111111'
    },
    {
        email: 'auditor2@gacp.com',
        firstName: 'Somsak',
        lastName: 'Inspector',
        role: 'auditor',
        password: 'password123',
        phoneNumber: '0822222222'
    },
    {
        email: 'auditor3@gacp.com',
        firstName: 'Suda',
        lastName: 'Checker',
        role: 'auditor',
        password: 'password123',
        phoneNumber: '0833333333'
    }
];

async function seedAuditors() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-db');
        console.log('Connected to MongoDB');

        for (const auditor of auditors) {
            const existing = await User.findOne({ email: auditor.email });
            if (!existing) {
                const hashedPassword = await bcrypt.hash(auditor.password, 10);
                await User.create({
                    ...auditor,
                    password: hashedPassword,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`Created auditor: ${auditor.email}`);
            } else {
                console.log(`Auditor already exists: ${auditor.email}`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedAuditors();
