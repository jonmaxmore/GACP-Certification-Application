/**
 * Zoom Meeting Service
 * Server-to-Server OAuth integration for creating audit meetings
 * 
 * Required Environment Variables:
 * - ZOOM_ACCOUNT_ID
 * - ZOOM_CLIENT_ID
 * - ZOOM_CLIENT_SECRET
 */

const axios = require('axios');
const { createLogger } = require('../../../shared/logger');
const logger = createLogger('zoom-service');

class ZoomService {
    constructor() {
        this.accountId = process.env.ZOOM_ACCOUNT_ID;
        this.clientId = process.env.ZOOM_CLIENT_ID;
        this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
        this.baseUrl = 'https://api.zoom.us/v2';
    }

    /**
     * Get OAuth access token using Server-to-Server OAuth
     */
    async getAccessToken() {
        // Return cached token if still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (!this.accountId || !this.clientId || !this.clientSecret) {
            throw new Error('ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET are required');
        }

        try {
            const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await axios.post(
                'https://zoom.us/oauth/token',
                null,
                {
                    params: {
                        grant_type: 'account_credentials',
                        account_id: this.accountId,
                    },
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            this.accessToken = response.data.access_token;
            // Token expires in 1 hour, refresh 5 minutes early
            this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

            logger.info('Zoom access token obtained successfully');
            return this.accessToken;
        } catch (error) {
            logger.error('Failed to get Zoom access token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Zoom API');
        }
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(method, endpoint, data = null) {
        const token = await this.getAccessToken();

        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        } catch (error) {
            logger.error(`Zoom API error (${endpoint}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create a meeting for audit
     * @param {Object} options Meeting options
     */
    async createMeeting(options) {
        const {
            topic,
            startTime,
            duration = 60,
            timezone = 'Asia/Bangkok',
            agenda,
            hostEmail,
        } = options;

        const meetingData = {
            topic: topic || 'GACP Field Audit Meeting',
            type: 2, // Scheduled meeting
            start_time: startTime,
            duration,
            timezone,
            agenda: agenda || 'การตรวจประเมินแปลงตามมาตรฐาน GACP',
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                waiting_room: true,
                mute_upon_entry: true,
                audio: 'both',
                auto_recording: 'cloud',
                alternative_hosts: '',
                meeting_authentication: false,
            },
        };

        try {
            // Create meeting for the host user or default 'me'
            const endpoint = hostEmail
                ? `/users/${hostEmail}/meetings`
                : '/users/me/meetings';

            const meeting = await this.apiRequest('post', endpoint, meetingData);

            logger.info(`Zoom meeting created: ${meeting.id}`);

            return {
                meetingId: meeting.id,
                meetingUrl: meeting.join_url,
                startUrl: meeting.start_url,
                password: meeting.password,
                hostEmail: meeting.host_email,
                topic: meeting.topic,
                startTime: meeting.start_time,
                duration: meeting.duration,
            };
        } catch (error) {
            logger.error('Failed to create Zoom meeting:', error.response?.data || error.message);
            throw new Error('Failed to create Zoom meeting: ' + (error.response?.data?.message || error.message));
        }
    }

    /**
     * Create audit meeting with standard format
     */
    async createAuditMeeting(auditData) {
        const {
            auditNumber,
            farmerName,
            scheduledDate,
            scheduledTime,
            auditorEmail,
        } = auditData;

        const startTime = this.formatStartTime(scheduledDate, scheduledTime);

        return this.createMeeting({
            topic: `[GACP] ตรวจประเมิน ${auditNumber} - ${farmerName}`,
            startTime,
            duration: 90,
            agenda: `การตรวจประเมินแปลงตามมาตรฐาน GACP\n\nเลขที่: ${auditNumber}\nผู้ประกอบการ: ${farmerName}`,
            hostEmail: auditorEmail,
        });
    }

    /**
     * Format date and time for Zoom API
     */
    formatStartTime(date, time) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const timeStr = time || '09:00';
        return `${dateStr}T${timeStr}:00`;
    }

    /**
     * Get meeting details
     */
    async getMeeting(meetingId) {
        return this.apiRequest('get', `/meetings/${meetingId}`);
    }

    /**
     * Delete meeting
     */
    async deleteMeeting(meetingId) {
        return this.apiRequest('delete', `/meetings/${meetingId}`);
    }

    /**
     * Update meeting
     */
    async updateMeeting(meetingId, updates) {
        return this.apiRequest('patch', `/meetings/${meetingId}`, updates);
    }

    /**
     * Get meeting recordings
     */
    async getRecordings(meetingId) {
        try {
            return await this.apiRequest('get', `/meetings/${meetingId}/recordings`);
        } catch (error) {
            if (error.response?.status === 404) {
                return { recording_files: [] };
            }
            throw error;
        }
    }

    /**
     * Check if Zoom is configured
     */
    isConfigured() {
        return !!(this.accountId && this.clientId && this.clientSecret);
    }

    /**
     * Generate a mock meeting link (fallback when Zoom not configured)
     */
    generateMockMeetingLink() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        return {
            meetingId: `mock-${Date.now()}`,
            meetingUrl: `https://meet.google.com/${part1}-${part2}-${part3}`,
            startUrl: `https://meet.google.com/${part1}-${part2}-${part3}`,
            password: '',
            isMock: true,
        };
    }

    /**
     * Create meeting or fallback to mock
     */
    async createMeetingOrMock(auditData) {
        if (this.isConfigured()) {
            try {
                return await this.createAuditMeeting(auditData);
            } catch (error) {
                logger.warn('Zoom API failed, using mock link:', error.message);
                return this.generateMockMeetingLink();
            }
        }

        logger.info('Zoom not configured, generating mock meeting link');
        return this.generateMockMeetingLink();
    }
}

module.exports = new ZoomService();
