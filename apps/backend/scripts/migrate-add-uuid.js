/**
 * Migration Script: Add UUID to Existing Documents
 * Run: node scripts/migrate-add-uuid.js
 * 
 * This script adds uuid field to all existing documents that don't have one
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const COLLECTIONS = ['users', 'applications', 'certificates', 'invoices', 'quotes', 'farms'];

async function migrateAddUuid() {
    console.log('🔄 Starting UUID Migration...');
    console.log(`📦 Collections to process: ${COLLECTIONS.join(', ')}`);

    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_dev_db';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const results = {};

        for (const collName of COLLECTIONS) {
            try {
                const collection = db.collection(collName);

                // Find documents without uuid
                const docsWithoutUuid = await collection.countDocuments({ uuid: { $exists: false } });

                if (docsWithoutUuid === 0) {
                    console.log(`⏭️  ${collName}: No documents need migration`);
                    results[collName] = { updated: 0, skipped: true };
                    continue;
                }

                console.log(`📝 ${collName}: Found ${docsWithoutUuid} documents without UUID`);

                // Update each document individually with unique UUID
                const cursor = collection.find({ uuid: { $exists: false } });
                let updatedCount = 0;

                while (await cursor.hasNext()) {
                    const doc = await cursor.next();
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { uuid: uuidv4() } }
                    );
                    updatedCount++;

                    if (updatedCount % 100 === 0) {
                        console.log(`   Processed ${updatedCount}/${docsWithoutUuid}...`);
                    }
                }

                console.log(`✅ ${collName}: Updated ${updatedCount} documents`);
                results[collName] = { updated: updatedCount };
            } catch (err) {
                console.log(`⚠️  ${collName}: Collection might not exist - ${err.message}`);
                results[collName] = { error: err.message };
            }
        }

        // Summary
        console.log('\n📊 Migration Summary:');
        console.log('='.repeat(50));
        for (const [coll, result] of Object.entries(results)) {
            if (result.error) {
                console.log(`  ${coll}: ⚠️ Error - ${result.error}`);
            } else if (result.skipped) {
                console.log(`  ${coll}: ⏭️ Skipped (all have UUID)`);
            } else {
                console.log(`  ${coll}: ✅ ${result.updated} updated`);
            }
        }
        console.log('='.repeat(50));
        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run migration
migrateAddUuid();

