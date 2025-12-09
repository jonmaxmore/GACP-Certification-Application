const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, '.env.example');

const content = `NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin
JWT_SECRET=dev_secret_key_123
LOG_LEVEL=info
`;

try {
    console.log('🔧 Fixing .env configuration...');
    fs.writeFileSync(envPath, content);
    console.log('✅ .env file has been restored successfully.');
    console.log('Checking content:');
    console.log(fs.readFileSync(envPath, 'utf8'));
} catch (error) {
    console.error('❌ Failed to write .env file:', error);
    process.exit(1);
}
