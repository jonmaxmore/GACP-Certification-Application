require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function resetSystem() {
    console.log('🚨 STARTING SYSTEM FACTORY RESET 🚨');

    // 1. Connect and Wipe DB
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');

    console.log('Connecting to DB...');
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    console.log('💥 Dropping Database...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database Wiped.');

    await mongoose.disconnect();

    // 2. Wipe Uploads
    const uploadDirs = ['slips', 'id-cards', 'documents'];
    const baseUploadDir = path.join(__dirname, 'uploads');

    uploadDirs.forEach(dir => {
        const fullPath = path.join(baseUploadDir, dir);
        if (fs.existsSync(fullPath)) {
            console.log(`Cleaning ${dir}...`);
            // Delete all files in the directory
            const files = fs.readdirSync(fullPath);
            for (const file of files) {
                if (file === '.gitkeep') continue; // Optional: Keep .gitkeep
                fs.unlinkSync(path.join(fullPath, file));
            }
        } else {
            // Create if missing
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
    console.log('✅ Uploads Directory Cleaned.');

    console.log('✨ SYSTEM RESET COMPLETE ✨');
    console.log('Ready for Fresh Registration.');
}

resetSystem().catch(err => {
    console.error('❌ Reset Failed:', err);
    process.exit(1);
});
