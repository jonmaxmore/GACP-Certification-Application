require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Config
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-development'; // Default if not in .env

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    try {
        const db = mongoose.connection.db;

        console.log('🧹 Clearing Collections...');
        await db.collection('users').deleteMany({});
        await db.collection('establishments').deleteMany({});
        await db.collection('applications').deleteMany({});
        await db.collection('payments').deleteMany({});
        await db.collection('certificates').deleteMany({});
        await db.collection('notifications').deleteMany({});
        await db.collection('productbatches').deleteMany({});
        await db.collection('tickets').deleteMany({});

        console.log('🌱 Seeding Users...');

        // 1. Officer (Required for Golden Loop submission)
        const officerPassword = await bcrypt.hash('password123', 10);
        await db.collection('users').insertOne({
            email: 'officer@gacp.com',
            password: officerPassword,
            firstName: 'Somchai',
            lastName: 'Officer',
            phoneNumber: '0812345678',
            idCard: '1100000000001',
            laserCode: 'ME0-9999999-99',
            role: 'officer', // Lowercase to match ApplicationWorkflowService query
            status: 'ACTIVE',
            workLocation: { provinces: ['Chiang Mai', 'Chiang Rai'] }, // Essential for assignment logic
            isActive: true, // Legacy flag
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 2. Farmer
        const farmerPassword = await bcrypt.hash('password123', 10);
        const farmerId = new mongoose.Types.ObjectId();
        await db.collection('users').insertOne({
            _id: farmerId,
            email: 'farmer@gacp.com',
            password: farmerPassword,
            firstName: 'Kasem',
            lastName: 'Farmer',
            phoneNumber: '0898765432',
            idCard: '1200000000002',
            laserCode: 'ME0-8888888-88',
            role: 'FARMER', // Uppercase
            status: 'ACTIVE',
            farmerType: 'INDIVIDUAL',
            address: '123 Farm Rd, Chiang Mai',
            province: 'Chiang Mai',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // 3. Admin
        const adminPassword = await bcrypt.hash('password123', 10);
        await db.collection('users').insertOne({
            email: 'admin@gacp.com',
            password: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            phoneNumber: '0800000000',
            idCard: '1300000000003',
            laserCode: 'ME0-7777777-77',
            role: 'SUPER_ADMIN', // Uppercase
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('🌱 Seeding Establishment...');
        // 4. Establishment (For the Farmer)
        await db.collection('establishments').insertOne({
            id: uuidv4(), // Matches EstablishmentService logic
            name: 'Golden Harvest Farm',
            type: 'farm',
            owner: farmerId.toString(), // Link to farmer
            address: {
                street: '123 Farm Rd',
                city: 'Chiang Mai',
                zipCode: '50000'
            },
            coordinates: { lat: 18.7883, lng: 98.9853 },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ Seeding Complete!');
        console.log('   Officer: officer@gacp.com / password123');
        console.log('   Farmer:  farmer@gacp.com  / password123');
        console.log('   Admin:   admin@gacp.com   / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seed();
