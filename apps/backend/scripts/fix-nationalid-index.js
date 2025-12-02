/**
 * Fix NationalID Null Index Issue
 * Updates existing users with null nationalId
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp';

async function fixNationalIdIndex() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log('✅ Connected\n');

    // Update users with null nationalId
    const User = mongoose.connection.collection('users');

    // eslint-disable-next-line no-console
    console.log('🔍 Finding users with null nationalId...');
    const nullUsers = await User.find({ nationalId: null }).toArray();
    // eslint-disable-next-line no-console
    console.log(`Found ${nullUsers.length} users with null nationalId\n`);

    if (nullUsers.length > 0) {
      // eslint-disable-next-line no-console
      console.log('🔧 Generating unique nationalIds for existing users...');

      // Find max existing nationalId to avoid conflicts
      const maxUser = await User.find({ nationalId: { $ne: null } })
        .sort({ nationalId: -1 })
        .limit(1)
        .toArray();

      let counter = maxUser.length > 0 ? parseInt(maxUser[0].nationalId, 10) : 9000000000000;

      for (const user of nullUsers) {
        counter++;
        await User.updateOne({ _id: user._id }, { $set: { nationalId: counter.toString() } });
        // eslint-disable-next-line no-console
        console.log(`✅ Updated ${user.email} with nationalId: ${counter}`);
      }

      // eslint-disable-next-line no-console
      console.log('\n✅ All users updated successfully!');
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ No users need updating');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('\n👋 Disconnected');
  }
}

fixNationalIdIndex();
