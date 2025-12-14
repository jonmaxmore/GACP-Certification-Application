/**
 * Drop nationalId unique index to allow multiple null values
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp';

async function dropIndex() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // List indexes
    // eslint-disable-next-line no-console
    console.log('📋 Current indexes:');
    const indexes = await users.indexes();
    indexes.forEach(idx => {
      // eslint-disable-next-line no-console
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Drop nationalId_1 index if it exists
    try {
      await users.dropIndex('nationalId_1');
      // eslint-disable-next-line no-console
      console.log('\n✅ Dropped nationalId_1 index');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('\n⏭️  nationalId_1 index does not exist');
    }

    // eslint-disable-next-line no-console
    console.log('\n✅ Done');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('👋 Disconnected');
  }
}

dropIndex();
