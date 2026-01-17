/**
 * OCR Service
 * Uses Tesseract.js to extract text from images (ID Cards, Documents)
 */
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // The new Vision Engine
const pdf = require('pdf-parse');


class OcrService {
    constructor() {
        this.worker = null;
    }

    /**
     * Pre-process image for better OCR
     * - Grayscale (remove color noise)
     * - Resize (Standardize DPI)
     * - Sharpen (Enhance edges)
     * - Threshold/Normalize (High contrast)
     */
    async preprocessImage(imagePath) {
        try {
            console.log(`🖼️ Pre-processing Image with Sharp...`);
            const buffer = await sharp(imagePath)
                .grayscale() // Convert to B&W
                .threshold(128) // Binary B&W - FORCE HIGH CONTRAST
                //.normalize() // Stretch logic removed in favor of threshold
                .sharpen() // Make edges crisp
                .resize(1000, null, { fit: 'inside' }) // Standard resolution
                .toBuffer();

            return buffer;
        } catch (error) {
            console.error('Sharp Error:', error);
            return imagePath; // Fallback to original path if sharp fails
        }
    }

    /**
     * Extract text from an image file
     * @param {string} imagePath - Absolute path to image
     * @param {string} lang - 'tha' or 'eng' or 'tha+eng'
     * @returns {Promise<{text: string, confidence: number}>}
     */
    async extractText(imagePath, lang = 'tha+eng') {
        try {
            console.log(`🔍 OCR Processing: ${path.basename(imagePath)}`);

            const ext = path.extname(imagePath).toLowerCase();
            if (ext === '.pdf') {
                return await this.extractTextFromPdf(imagePath);
            }

            // 1. IMPROVED: Use Sharp to clean image
            const imageBuffer = await this.preprocessImage(imagePath);

            // 2. Tesseract with custom config
            const result = await Tesseract.recognize(
                imageBuffer,
                lang,
                {
                    logger: m => {
                        if (m.status === 'recognizing text' && (m.progress * 100) % 50 === 0) {
                            // quiet logs
                        }
                    },
                    // [NEW] Optimize for document logic
                    tessedit_char_whitelist: ' 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:/กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮฯะัาำิีึืฺุูเแโใไๅๆ็่้๊๋์',
                },
            );

            const text = result.data.text.replace(/\s+/g, ' ').trim();
            const confidence = result.data.confidence;

            // Debug Log (First 100 chars)
            console.log(`✅ OCR Complete (Conf: ${confidence.toFixed(1)}%): "${text.substring(0, 100).replace(/\n/g, ' ')}..."`);

            return {
                text,
                confidence,
                words: result.data.words,
            };
        } catch (error) {
            console.error('❌ OCR Failed:', error);
            throw new Error('OCR processing failed');
        }
    }

    /**
     * Extract text from PDF file
     */
    async extractTextFromPdf(filePath) {
        try {
            console.log(`📄 parsing PDF: ${path.basename(filePath)}`);
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            // Basic confidence mock for PDF (since it's digital text, it's 100% accurate usually)
            const text = data.text.replace(/\s+/g, ' ').trim();
            console.log(`✅ PDF Parse Complete: "${text.substring(0, 100).replace(/\n/g, ' ')}..."`);

            return {
                text: text,
                confidence: 95, // Digital text is high confidence
                isPdf: true,
            };
        } catch (error) {
            console.error('❌ PDF Parse Failed:', error);
            throw new Error('PDF processing failed');
        }
    }

    /**
     * Verify if ID Card image contains the expected ID Number (Fuzzy Match Replaced)
     * ... (Keep existing verifyIdCard logic) ...

    /**
     * Verify if ID Card image contains the expected ID Number (Fuzzy Match Replaced)
     * @param {string} imagePath 
     * @param {string} expectedIdNumber 
     */
    async verifyIdCard(imagePath, expectedIdNumber) {
        const { text, confidence } = await this.extractText(imagePath, 'tha+eng');

        // 1. Strict Clean: Only Digits
        const cleanText = text.replace(/[^0-9]/g, '');
        const cleanId = expectedIdNumber.replace(/[^0-9]/g, '');

        console.log(`🔍 Fuzzy Check: UserID=${cleanId} vs Extracted=${cleanText.substring(0, 20)}...`);

        // Base result object
        const result = {
            match: false,
            message: 'ไม่พบเลขบัตรประชาชน หรือภาพไม่ชัดเจน',
            confidence: confidence,
            extractedText: text.substring(0, 100), // Return snippet for debug
        };

        // 2. Direct Match
        if (cleanText.includes(cleanId)) {
            result.match = true;
            result.message = 'Exact Match Found';
            return result;
        }

        // 3. Fuzzy Match (Sliding Window)
        if (cleanId.length === 13) {
            const threshold = 4; // Allow 4 differences (Increased from 2)
            for (let i = 0; i < cleanText.length - 12; i++) {
                const chunk = cleanText.substring(i, i + 13);
                const diff = this.levenshtein(cleanId, chunk);
                if (diff <= threshold) {
                    result.match = true;
                    result.message = `Fuzzy Match Found (Diff: ${diff})`;
                    return result;
                }
            }
        }

        return result;
    }

    // Algorithm to calculate difference between strings
    levenshtein(a, b) {
        if (a.length === 0) { return b.length; }
        if (b.length === 0) { return a.length; }
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1,
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
}

module.exports = new OcrService();
