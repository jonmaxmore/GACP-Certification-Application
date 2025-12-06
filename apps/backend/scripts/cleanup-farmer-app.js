const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

const cleanup = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const User = mongoose.connection.collection('users');
        const Application = mongoose.connection.collection('applications');

        const farmer = await User.findOne({ email: 'farmer@gacp.com' });
        if (!farmer) {
            console.log('Farmer not found. Nothing to cleanup.');
        } else {
            console.log(`Found Farmer ID: ${farmer._id}`);
            const result = await Application.deleteMany({
                $or: [
                    { farmerId: farmer._id },
                    { applicant: farmer._id },
                    { farmerEmail: 'farmer@gacp.com' }
                ]
            });
            console.log(`Deleted ${result.deletedCount} applications.`);
        }

        await mongoose.disconnect();
        console.log('Cleanup Complete.');
        process.exit(0);

    } catch (err) {
        console.error('Cleanup Failed:', err);
        process.exit(1);
    }
};

cleanup();
