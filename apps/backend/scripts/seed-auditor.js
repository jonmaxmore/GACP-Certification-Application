const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

const seedAuditor = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const User = mongoose.connection.collection('users');

        const auditorData = {
            email: 'inspector@gacp.com',
            firstName: 'Wichai',
            lastName: 'Inspector',
            phoneNumber: '0898765432',
            role: 'auditor', // Matches OfficerController
            status: 'ACTIVE',
            workLocation: { provinces: ['Chiang Mai'] },
            isActive: true,
            id: 'inspector-001', // Helper for finding by ID
            updatedAt: new Date()
        };

        // UI needs string ID often, ensuring it exists
        if (!auditorData.id) auditorData.id = new mongoose.Types.ObjectId().toString();

        await User.updateOne(
            { email: 'inspector@gacp.com' },
            { $set: auditorData },
            { upsert: true }
        );

        console.log('✅ Auditor Seeded: inspector@gacp.com');

        await mongoose.disconnect();
        console.log('Seed Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Seed Failed:', err);
        process.exit(1);
    }
};

seedAuditor();
