/**
 * Seed UAT Users Script
 * Creates realistic UAT users for testing.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedUatUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const uatUsers = [
      {
        email: 'farmer_individual@test.com',
        password: 'Password123!',
        fullName: 'Somchai Jai-dee',
        phone: '0891234567',
        nationalId: '1509900123456',
        role: 'farmer',
        farmerType: 'individual',
        farmingExperience: 5,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        // Mocking extra fields that might be needed by frontend but handled by schema strictness
        // Note: Laser Code is usually not stored in User model directly but in verification logs or separate profile
        // If it needs to be here, schema must be updated. For now, we stick to User model schema.
      },
      {
        email: 'farmer_company@test.com',
        password: 'Password123!',
        fullName: 'Green Herb Co., Ltd.',
        phone: '021234567',
        nationalId: '0105550001234', // Juristic ID
        role: 'farmer',
        farmerType: 'company',
        farmingExperience: 10,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      }
    ];

    for (const userData of uatUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`✅ Created UAT User: ${userData.email}`);
      } else {
        console.log(`User ${userData.email} already exists.`);
      }
    }

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seedUatUsers();
