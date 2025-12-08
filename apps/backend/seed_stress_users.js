const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

async function seedUsers() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const User = mongoose.connection.collection('users');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                email: 'farmer@gacp.com',
                password: hashedPassword,
                firstName: 'Somchai',
                lastName: 'Farmer',
                role: 'FARMER',
                phoneNumber: '0812345678',
                idCard: '8044033063981',
                laserCode: 'ME4167877950',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'officer@gacp.com',
                password: hashedPassword,
                firstName: 'Somying',
                lastName: 'Officer',
                role: 'INSPECTOR',
                phoneNumber: '0899999999',
                idCard: '1100702484461', // Valid ID
                laserCode: 'ME4167877951',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                email: 'admin@gacp.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'System',
                role: 'SUPER_ADMIN',
                phoneNumber: '0800000000',
                idCard: '3640751912440', // Valid ID
                laserCode: 'ME4167877952',
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.insertOne(u);
                console.log(`Seeded: ${u.email}`);
            } else {
                console.log(`Exists: ${u.email}`);
                // Update password to ensure test works
                await User.updateOne({ email: u.email }, { $set: { password: hashedPassword, role: u.role } });
                console.log(`Updated Password/Role: ${u.email}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

seedUsers();
