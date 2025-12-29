require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models-mongoose-legacy/user-model');
const Application = require('../models-mongoose-legacy/application-model');
const Certificate = require('../models-mongoose-legacy/certificate-model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_production';

async function clearDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing Users...');
        await User.deleteMany({});

        console.log('Clearing Applications...');
        await Application.deleteMany({});

        console.log('Clearing Certificates...');
        await Certificate.deleteMany({});

        console.log('All data cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
}

clearDatabase();

