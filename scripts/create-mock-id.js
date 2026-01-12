const sharp = require('../apps/backend/node_modules/sharp');
const path = require('path');
const fs = require('fs');

async function createMockId() {
    try {
        console.log('Generating Mock ID Card...');
        const width = 1000;
        const height = 630;
        const idNumber = "1 2345 67890 12 3"; // Typical format

        // Simple SVG representation of an ID card
        const svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <!-- Card Background -->
            <rect width="100%" height="100%" fill="#f8f9fa" rx="20" ry="20"/>
            <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="#e6f7ff" rx="15" ry="15" stroke="#333" stroke-width="2"/>
            
            <!-- Photo Placeholder -->
            <rect x="50" y="150" width="180" height="220" fill="#ddd" stroke="#999" />
            <text x="100" y="270" font-family="Arial" font-size="20" fill="#666">PHOTO</text>

            <!-- Garuda Emblem (Mock) -->
            <circle cx="140" cy="80" r="40" fill="#d32f2f" />
            
            <!-- Header -->
            <text x="250" y="60" font-family="Arial" font-size="24" fill="#000">Thai National ID Card</text>
            <text x="250" y="90" font-family="Arial" font-size="24" fill="#000">บัตรประจำตัวประชาชนไทย</text>

            <!-- ID Number (The target for OCR) -->
            <text x="380" y="150" font-family="Arial" font-size="48" font-weight="bold" fill="#000">${idNumber}</text>

            <!-- Name Details -->
            <text x="260" y="220" font-family="Arial" font-size="24" fill="#333">Name: Mr. Somsak Jaidee</text>
            <text x="260" y="260" font-family="Arial" font-size="24" fill="#333">Date of Birth: 01 Jan 1980</text>
            <text x="260" y="300" font-family="Arial" font-size="24" fill="#333">Address: 123 Bangkok, Thailand</text>

            <!-- Laser Code (Back info usually, but putting here for test) -->
            <text x="700" y="580" font-family="Arial" font-size="18" fill="#555">ME0-1234567-89</text>
        </svg>
        `;

        const outputPath = path.join(__dirname, '../apps/backend/__tests__/fixtures/test-id-card.jpg');

        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await sharp(Buffer.from(svg))
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        console.log(`✅ Mock ID created at: ${outputPath}`);
    } catch (error) {
        console.error('❌ Failed to generate image:', error);
        process.exit(1);
    }
}

createMockId();
