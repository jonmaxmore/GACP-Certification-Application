const path = require('path');
process.env.DAILY_API_KEY = '89fbab8d9ecc24bba7c8ff3648fd075aa6ea80068ebc458d7549bec11b855f39';
const videoService = require(path.resolve(__dirname, '../apps/backend/services/videoService'));

async function verify() {
  try {
    console.log('Testing VideoService with Daily.co...');
    const result = await videoService.createRoom('test-room-' + Date.now(), 'Test Room');
    console.log('Success! Room created:', result);
  } catch (error) {
    console.error('Verification Failed:', error.message);
    process.exit(1);
  }
}

verify();
