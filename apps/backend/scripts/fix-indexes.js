/**
 * Fix Database Indexes
 * Drops problematic idCard_1 index that prevents staff creation
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority';

async function fixIndexes() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // List all indexes
        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => console.log(`   - ${idx.name}`));

        // Drop problematic idCard_1 index if exists
        try {
            await collection.dropIndex('idCard_1');
            console.log('\n✅ Dropped idCard_1 index');
        } catch (e) {
            if (e.code === 27) {
                console.log('\n⏭️ idCard_1 index does not exist (already dropped or never created)');
            } else {
                throw e;
            }
        }

        // List indexes again
        console.log('\n📋 Remaining indexes:');
        const afterIndexes = await collection.indexes();
        afterIndexes.forEach(idx => console.log(`   - ${idx.name}`));

        console.log('\n🎉 Done!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixIndexes();
