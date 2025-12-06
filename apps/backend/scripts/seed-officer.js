const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

const seedOfficer = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const User = mongoose.connection.collection('users');

        const officerData = {
            email: 'officer@gacp.com',
            firstName: 'Somchai',
            lastName: 'Officer',
            phoneNumber: '0812345678',
            role: 'officer', // Lowercase!
            status: 'ACTIVE',
            workLocation: { provinces: ['Chiang Mai', 'Chiang Rai'] },
            isActive: true,
            updatedAt: new Date()
        };

        // Upsert
        await User.updateOne(
            { email: 'officer@gacp.com' },
            { $set: officerData },
            { upsert: true }
        );

        // Set Password if new (or update hashing manually? Skipping password hash logic for now, assuming existing password works or I can't login as officer in sim anyway so it doesn't matter for Assignment logic)
        // Wait, assignment logic only checks DB records. Doesn't need password.

        console.log('✅ Officer Seeded/Updated: officer@gacp.com');

        await mongoose.disconnect();
        console.log('Seed Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seed Failed:', err);
        process.exit(1);
    }
};

seedOfficer();
