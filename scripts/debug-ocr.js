const ocrService = require('../apps/backend/services/ocr-service');
const path = require('path');

async function runDebug() {
    console.log('--- OCR Debug Tool ---');
    const imagePath = path.join(__dirname, '../apps/backend/__tests__/fixtures/test-id-card.jpg');

    console.log('Target Image:', imagePath);
    console.time('OCR_Execution_Time');

    try {
        console.log('Testing verifyIdCard (Full Logic)...');
        const expectedID = "1234567890123"; // Matches create-mock-id.js

        const result = await ocrService.verifyIdCard(imagePath, expectedID);
        console.timeEnd('OCR_Execution_Time');

        console.log('\n--- Verification Result ---');
        console.log('Match:', result.match);
        console.log('Message:', result.message);
        console.log('Confidence:', result.confidence);
        console.log('Extracted Snippet:', result.extractedText);
        console.log('-'.repeat(40));

        if (result.match && result.confidence > 0) {
            console.log('✅ OCR Logic Verification PASSED');
            process.exit(0);
        } else {
            console.log('❌ OCR Logic verification FAILED');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Debug Failed:', error);
        process.exit(1);
    }
}

runDebug();
