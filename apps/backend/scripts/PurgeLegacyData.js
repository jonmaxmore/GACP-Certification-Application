/**
 * Purge Legacy Data Script
 * DROPS all data in users, facilities, applications, inspections, and transactions collections.
 * Use with EXTREME CAUTION.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const collectionsToDrop = [
  'users',
  'facilities',
  'applications',
  'inspections',
  'transactions'
];

async function purgeData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';
    console.log(`Connecting to ${mongoUri}...`);

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const db = mongoose.connection.db;

    for (const collectionName of collectionsToDrop) {
      try {
        const collection = db.collection(collectionName);
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length > 0) {
          await collection.drop();
          console.log(`✅ Dropped collection: ${collectionName}`);
        } else {
          console.log(`⚠️ Collection not found (skipping): ${collectionName}`);
        }
      } catch (err) {
        console.error(`❌ Error dropping ${collectionName}:`, err.message);
      }
    }

    console.log('Purge complete.');
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

// Safety check: Require an environment variable to run
if (process.env.CONFIRM_PURGE !== 'true') {
  console.error('⛔ SAFETY LOCK: You must set CONFIRM_PURGE=true environment variable to run this script.');
  console.error('Example: CONFIRM_PURGE=true node scripts/purge-legacy-data.js');
  process.exit(1);
}

purgeData();
