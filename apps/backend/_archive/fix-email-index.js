/**
 * MongoDB Migration Script: Fix Email Index Issue
 * 
 * Problem: The email unique sparse index fails when email is null (not undefined)
 * Solution: 
 * 1. Remove email field from documents where email is null
 * 2. Drop and recreate the email index
 * 
 * Run with: node scripts/fix-email-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixEmailIndex() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-development';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Step 1: Count affected documents
        const nullEmailCount = await usersCollection.countDocuments({
            $or: [
                { email: null },
                { email: "" },
                { email: { $exists: true, $eq: null } }
            ]
        });
        console.log(`Found ${nullEmailCount} users with email: null or empty`);

        // Step 2: Remove email field from documents where email is null or empty
        if (nullEmailCount > 0) {
            console.log('Removing null/empty email fields...');
            const result = await usersCollection.updateMany(
                { $or: [{ email: null }, { email: "" }] },
                { $unset: { email: 1 } }
            );
            console.log(`✅ Updated ${result.modifiedCount} documents (removed null/empty email)`);
        }

        // Step 3: Drop the old email index if it exists
        try {
            console.log('Dropping old email_1 index...');
            await usersCollection.dropIndex('email_1');
            console.log('✅ Dropped email_1 index');
        } catch (e) {
            if (e.codeName === 'IndexNotFound') {
                console.log('ℹ️ email_1 index not found, skipping drop');
            } else {
                console.log('⚠️ Could not drop index:', e.message);
            }
        }

        // Step 4: Create new sparse unique index
        console.log('Creating new sparse email index...');
        await usersCollection.createIndex(
            { email: 1 },
            { unique: true, sparse: true, background: true }
        );
        console.log('✅ Created new email index (sparse: true)');

        // Step 5: List all indexes to confirm
        const indexes = await usersCollection.indexes();
        console.log('\n📋 Current indexes on users collection:');
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.sparse ? '(sparse)' : ''} ${idx.unique ? '(unique)' : ''}`);
        });

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixEmailIndex();

