/**
 * Video Service - Daily.co Integration
 * Handles creation of video rooms using Daily.co API
 */

const https = require('https');

class VideoService {
  constructor() {
    this.apiKey = process.env.DAILY_API_KEY;
    this.hostname = 'api.daily.co';
    this.path = '/v1/rooms';
  }

  /**
   * Create a new video room
   * @param {string} roomId - Unique identifier for the room
   * @param {string} title - Room title
   * @returns {Promise<Object>} Room details including url
   */
  async createRoom(roomId, title) {
    if (!this.apiKey) {
      throw new Error('DAILY_API_KEY is not configured');
    }

    const sanitizedName = `inspection-${roomId}`;
    const postData = JSON.stringify({
      name: sanitizedName,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        exp: Math.round(Date.now() / 1000) + 3600, // Expires in 1 hour
      }
    });

    const options = {
      hostname: this.hostname,
      path: this.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                roomId: response.name,
                roomUrl: response.url,
                token: response.token
              });
            } else if (response.error === 'room_already_exists') {
              resolve({
                roomId: sanitizedName,
                roomUrl: `https://${process.env.DAILY_DOMAIN || 'your-domain'}.daily.co/${sanitizedName}`
              });
            } else {
              reject(new Error(`Daily.co API Error: ${response.info || res.statusMessage}`));
            }
          } catch (e) {
            reject(new Error('Failed to parse response from Daily.co'));
          }
        });
      });

      req.on('error', (e) => {
        console.error('Video Service Request Error:', e);
        reject(new Error('Failed to connect to video service'));
      });

      req.write(postData);
      req.end();
    });
  }
}

module.exports = new VideoService();
