/**
 * Google Calendar Service
 * For inspection scheduling and calendar management
 */

const { google } = require('googleapis');
const logger = require('../../utils/logger');

class GoogleCalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri =
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/v1/calendar/oauth2callback';

    if (!this.clientId || !this.clientSecret) {
      logger.error('Google Calendar credentials not configured');
      throw new Error('Google Calendar credentials are required');
    }

    this.oauth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth2 URL for user authorization
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      logger.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Set credentials from stored tokens
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Create inspection event in calendar
   */
  async createInspectionEvent(eventData) {
    try {
      const event = {
        summary: `[GACP] ${eventData.type} Inspection - ${eventData.applicationNumber}`,
        description: `
GACP Inspection Details:
- Application: ${eventData.applicationNumber}
- Lot ID: ${eventData.lotId}
- Farmer: ${eventData.farmerName}
- Farm: ${eventData.farmName}
- Type: ${eventData.type}
- Inspector: ${eventData.inspectorName}

Location: ${eventData.farmLocation || 'See application details'}
        `.trim(),
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'Asia/Bangkok',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'Asia/Bangkok',
        },
        location: eventData.farmLocation,
        attendees: [
          { email: eventData.inspectorEmail },
          ...(eventData.farmerEmail ? [{ email: eventData.farmerEmail }] : []),
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        colorId: this.getColorIdByType(eventData.type),
          conferenceData: undefined,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: eventData.type === 'VIDEO' ? 1 : 0,
        sendUpdates: 'all',
      });

      logger.info(`Calendar event created: ${response.data.id}`);

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (error) {
      logger.error('Error creating calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update inspection event
   */
  async updateInspectionEvent(eventId, updates) {
    try {
      const event = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      const updatedEvent = {
        ...event.data,
        ...updates,
        start: updates.startDateTime
          ? {
              dateTime: updates.startDateTime,
              timeZone: 'Asia/Bangkok',
            }
          : event.data.start,
        end: updates.endDateTime
          ? {
              dateTime: updates.endDateTime,
              timeZone: 'Asia/Bangkok',
            }
          : event.data.end,
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'all',
      });

      return {
        success: true,
        eventId: response.data.id,
      };
    } catch (error) {
      logger.error('Error updating calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete inspection event
   */
  async deleteInspectionEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Error deleting calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get inspector availability
   */
  async getInspectorAvailability(inspectorEmail, startDate, endDate) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          timeZone: 'Asia/Bangkok',
          items: [{ id: inspectorEmail }],
        },
      });

      const busySlots = response.data.calendars[inspectorEmail]?.busy || [];

      return {
        success: true,
        busySlots,
        availableSlots: this.calculateAvailableSlots(startDate, endDate, busySlots),
      };
    } catch (error) {
      logger.error('Error checking availability:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Find best available time slot
   */
  async findBestTimeSlot(inspectorEmails, preferredDate, duration) {
    try {
      const startDate = new Date(preferredDate);
      startDate.setHours(8, 0, 0, 0); // Start at 8 AM

      const endDate = new Date(preferredDate);
      endDate.setHours(17, 0, 0, 0); // End at 5 PM

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          timeZone: 'Asia/Bangkok',
          items: inspectorEmails.map(email => ({ id: email })),
        },
      });

      // Find common free slots
      const allBusySlots = [];
      for (const email of inspectorEmails) {
        const busy = response.data.calendars[email]?.busy || [];
        allBusySlots.push(...busy);
      }

      const freeSlots = this.calculateAvailableSlots(
        startDate.toISOString(),
        endDate.toISOString(),
        allBusySlots,
      );

      // Filter slots that can accommodate the duration
      const suitableSlots = freeSlots.filter(slot => {
        const slotDuration = (new Date(slot.end) - new Date(slot.start)) / (1000 * 60);
        return slotDuration >= duration;
      });

      return {
        success: true,
        availableSlots: suitableSlots,
        bestSlot: suitableSlots[0] || null,
      };
    } catch (error) {
      logger.error('Error finding time slot:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List upcoming inspections
   */
  async listUpcomingInspections(inspectorEmail, maxResults = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
        q: '[GACP]',
        attendees: inspectorEmail ? [inspectorEmail] : undefined,
      });

      return {
        success: true,
        events: response.data.items || [],
      };
    } catch (error) {
      logger.error('Error listing events:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get event details
   */
  async getEvent(eventId) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      return {
        success: true,
        event: response.data,
      };
    } catch (error) {
      logger.error('Error getting event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate available time slots from busy slots
   */
  calculateAvailableSlots(startTime, endTime, busySlots) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const available = [];

    // Sort busy slots by start time
    busySlots.sort((a, b) => new Date(a.start) - new Date(b.start));

    let currentTime = start;

    for (const busy of busySlots) {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);

      // If there's a gap before this busy slot
      if (currentTime < busyStart) {
        available.push({
          start: currentTime.toISOString(),
          end: busyStart.toISOString(),
        });
      }

      currentTime = busyEnd > currentTime ? busyEnd : currentTime;
    }

    // Add remaining time after last busy slot
    if (currentTime < end) {
      available.push({
        start: currentTime.toISOString(),
        end: end.toISOString(),
      });
    }

    return available;
  }

  /**
   * Get color ID by inspection type
   */
  getColorIdByType(type) {
    const colorMap = {
      VIDEO: '7', // Peacock blue
      HYBRID: '5', // Yellow
      ONSITE: '11', // Red
    };
    return colorMap[type] || '1'; // Default lavender
  }

  /**
   * Send reminder for upcoming inspection
   */
  async sendInspectionReminder(eventId) {
    try {
      const event = await this.getEvent(eventId);
      if (!event.success) {
        throw new Error('Event not found');
      }

      // Calendar API automatically handles reminders based on event settings
      // This method is for custom reminder logic if needed
      logger.info(`Reminder processed for event: ${eventId}`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Error sending reminder:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get inspector workload (events count in date range)
   */
  async getInspectorWorkload(inspectorEmail, startDate, endDate) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        q: '[GACP]',
      });

      const events = response.data.items || [];
      const inspectorEvents = events.filter(event =>
        event.attendees?.some(a => a.email === inspectorEmail),
      );

      return {
        success: true,
        totalEvents: inspectorEvents.length,
        events: inspectorEvents,
      };
    } catch (error) {
      logger.error('Error getting workload:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new GoogleCalendarService();
