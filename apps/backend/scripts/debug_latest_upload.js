const path = require('path');
const ocrService = require('../services/ocr-service');
const fs = require('fs');

const LATEST_IMAGE = '20456e0b-7c99-46d8-a497-da47836a5951-1768137390327-628543036.png';
const IMAGE_PATH = path.join(__dirname, '../public/uploads/identity', LATEST_IMAGE);
const TARGET_ID = '4310100001149';

async function main() {
    console.log('==========================================');
    console.log('🕵️‍♀️ DEBUG: REAL VERIFICATION TEST');
    console.log('==========================================');
    console.log(`Image: ${LATEST_IMAGE}`);
    console.log(`Target ID: ${TARGET_ID}`);

    if (!fs.existsSync(IMAGE_PATH)) {
        console.error('❌ File not found!');
        return;
    }

    try {
        console.log('⏳ Running ocrService.verifyIdCard()...');
        const result = await ocrService.verifyIdCard(IMAGE_PATH, TARGET_ID);

        console.log('------------------------------------------');
        console.log('📊 RESULT:');
        console.log(`Match: ${result.match}`);
        console.log(`Message: ${result.message}`);
        console.log('------------------------------------------');
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

main();
