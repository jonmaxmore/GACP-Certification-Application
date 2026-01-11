const path = require('path');
const Tesseract = require('tesseract.js');

const IMAGE_PATH = 'C:/Users/usEr/.gemini/antigravity/brain/cbced983-1282-417a-b9fd-0c31e31d37ac/uploaded_image_1768136651089.png';

async function main() {
    console.log(`🖼️ Analyzing Image: ${IMAGE_PATH}`);
    console.log('⏳ Running OCR (Thai + English)...');

    try {
        const result = await Tesseract.recognize(
            IMAGE_PATH,
            'tha+eng', // Dual language
            {
                logger: m => {
                    if (m.status === 'recognizing text' && (m.progress * 100) % 20 === 0) {
                        console.log(`... ${Math.round(m.progress * 100)}%`);
                    }
                },
            },
        );

        const text = result.data.text;
        const confidence = result.data.confidence;

        console.log('--------------------------------------------------');
        console.log(`📊 AI Confidence: ${confidence}%`);
        console.log('--------------------------------------------------');
        console.log('📝 Extracted Text Preview:');
        console.log(text);
        console.log('--------------------------------------------------');

        // Check for specific ID
        const targetID = '4310100001149';
        const cleanText = text.replace(/[^0-9]/g, '');

        if (cleanText.includes(targetID)) {
            console.log(`✅ MATCH FOUND! ID ${targetID} detected.`);
        } else {
            console.log(`❌ MATCH FAILED. ID ${targetID} NOT detected in cleaned digits.`);
            console.log(`Cleaned Digits Snippet: ${cleanText.substring(0, 50)}...`);
        }

    } catch (err) {
        console.error('❌ OCR Error:', err);
    }
}

main();
