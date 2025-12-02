/**
 * Seed Admin Script
 * Creates a Super Admin user for system management.
 */

const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path if needed
require('dotenv').config();

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Check if admin exists
    const adminEmail = 'admin@gacp.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
    } else {
      const adminData = {
        email: adminEmail,
        password: 'AdminPassword123!', // Change this in production!
        fullName: 'Super Admin',
        phone: '0812345678',
        nationalId: '1100000000000', // Valid 13 digits
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      };

      await User.create(adminData);
      console.log('✅ Created Super Admin user.');
    }

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seedAdmin();
