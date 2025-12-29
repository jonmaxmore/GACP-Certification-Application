/**
 * Cleanup test users - delete all users for fresh start
 * 
 * ⚠️ DANGER: This script DELETES ALL USERS from the database!
 * Only run this in development/test environments.
 * 
 * Usage: node scripts/cleanup-test-users.js --confirm
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

// Safety Check 1: Block production environment
const env = process.env.NODE_ENV || 'development';
if (env === 'production') {
    console.error('❌ BLOCKED: Cannot run cleanup script in production environment!');
    console.error('   Set NODE_ENV to "test" or "development" if you really need to run this.');
    process.exit(1);
}

// Safety Check 2: Require --confirm flag
if (!process.argv.includes('--confirm')) {
    console.log('');
    console.log('⚠️  WARNING: This script will DELETE ALL USERS from the database!');
    console.log('');
    console.log('   Current NODE_ENV:', env);
    console.log('   Database:', process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-development');
    console.log('');
    console.log('   To proceed, run with --confirm flag:');
    console.log('   node scripts/cleanup-test-users.js --confirm');
    console.log('');
    process.exit(0);
}

async function cleanupTestUsers() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-development';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // First, list all users
        const users = await usersCollection.find({}).toArray();
        console.log(`\n📋 Found ${users.length} users in database:`);
        users.forEach((u, i) => {
            console.log(`  ${i + 1}. ${u.firstName || u.companyName || 'Unknown'} - Type: ${u.accountType} - Email: ${u.email === undefined ? 'undefined' : u.email === null ? 'null' : u.email}`);
        });

        // Delete all test users
        console.log('\n⚠️ Deleting all users...');
        const result = await usersCollection.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users`);

        // Drop email index
        try {
            await usersCollection.dropIndex('email_1');
            console.log('✅ Dropped email_1 index');
        } catch (e) {
            console.log('ℹ️ email_1 index not found');
        }

        // Recreate indexes
        await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
        await usersCollection.createIndex({ idCardHash: 1 }, { unique: true, sparse: true });
        await usersCollection.createIndex({ taxIdHash: 1 }, { unique: true, sparse: true });
        await usersCollection.createIndex({ communityRegistrationNoHash: 1 }, { unique: true, sparse: true });
        console.log('✅ Recreated sparse indexes');

        console.log('\n✅ Cleanup completed! You can now register fresh users.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupTestUsers();

