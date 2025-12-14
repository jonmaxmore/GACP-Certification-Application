/**
 * Job Queue Service using Bull
 * Handles background processing for notifications and other async tasks
 */

const Bull = require('bull');
const logger = require('../../shared/logger');
const notification-service = require('../notification/notification-service');
const cache-service = require('../cache/cache-service');
const DTAMApplication = require('../../models/application-model');

class QueueService {
  constructor() {
    if (process.env.NODE_ENV === 'test') {
      logger.info('Queue Service disabled in test mode');
      return;
    }

    // Initialize queues with Redis connection
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    // Email Notification Queue
    this.emailQueue = new Bull('email-notifications', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    });

    // Calendar Sync Queue
    this.calendarQueue = new Bull('calendar-sync', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });

    // Report Generation Queue
    this.reportQueue = new Bull('report-generation', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 2,
        timeout: 300000, // 5 minutes
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    });

    // Document Processing Queue
    this.documentQueue = new Bull('document-processing', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });

    // Setup processors
    this.setupProcessors();

    // Setup event listeners
    this.setupEventListeners();

    logger.info('Queue Service initialized with 4 queues');
  }

  /**
   * Setup queue processors
   */
  setupProcessors() {
    // Email Processor
    this.emailQueue.process('send-email', async job => {
      const { type, applicationId, data } = job.data;
      logger.info(`Sending ${type} email for application ${applicationId}`);

      try {
        const application = await DTAMApplication.findById(applicationId)
          .populate('inspector')
          .populate('reviewer');

        if (!application) {
          throw new Error('Application not found');
        }

        let result;
        switch (type) {
          case 'new-application':
            result = await notification-service.notifyNewApplication(application);
            break;
          case 'inspector-assignment':
            result = await notification-service.notifyInspectorAssignment(
              application,
              application.inspector,
            );
            break;
          case 'inspection-complete':
            result = await notification-service.notifyApproverInspectionComplete(application);
            break;
          case 'status-change':
            result = await notification-service.notifyFarmerStatusChange(
              application,
              data.newStatus,
            );
            break;
          case 'inspection-reminder':
            result = await notification-service.sendInspectionReminder(application);
            break;
          default:
            throw new Error(`Unknown email type: ${type}`);
        }

        return result;
      } catch (error) {
        logger.error('Email sending failed:', error);
        throw error;
      }
    });

    // Calendar Processor
    this.calendarQueue.process('create-event', async job => {
      const { applicationId, eventData } = job.data;
      logger.info(`Creating calendar event for application ${applicationId}`);

      try {
        const googleCalendarService = require('../calendar/googleCalendarService');
        const result = await googleCalendarService.createInspectionEvent(eventData);

        if (result.success) {
          // Update application with event ID
          await DTAMApplication.findByIdAndUpdate(applicationId, {
            'inspectionSchedule.calendarEventId': result.data.eventId,
            'inspectionSchedule.meetLink': result.data.meetLink,
          });
        }

        return result;
      } catch (error) {
        logger.error('Calendar event creation failed:', error);
        throw error;
      }
    });

    // Report Processor
    this.reportQueue.process('generate-report', async job => {
      const { reportType, startDate, endDate } = job.data;
      logger.info(`Generating ${reportType} report from ${startDate} to ${endDate}`);

      // TODO: Implement report generation
      // This will be implemented in monitoring phase
      return { success: true, message: 'Report generation not yet implemented' };
    });

    // Document Processor
    this.documentQueue.process('process-document', async job => {
      const { type, applicationId, certificateNumber, approvedBy } = job.data;
      logger.info(`Processing document job: ${type} for application ${applicationId}`);

      try {
        if (type === 'certificate-pdf-generation') {
          // Circular dependency check: We need gacp-certificateService here
          // But gacp-certificateService depends on QueueService
          // We should require it inside the processor or use dependency injection
          // For now, let's dynamic require
          const gacp-certificateService = require('../gacp-certificate');
          const applicationRepository = require('../../repositories/application-repository');
          const appRepo = new applicationRepository();

          const application = await appRepo.findById(applicationId);
          if (!application) throw new Error('Application not found');

          // Call the sync generation method
          return await gacp-certificateService._generateCertificateSync(application, certificateNumber, approvedBy);
        }

        throw new Error(`Unknown document job type: ${type}`);
      } catch (error) {
        logger.error('Document processing failed:', error);
        throw error;
      }
    });

    logger.info('Queue processors registered');
  }

  /**
   * Setup event listeners for monitoring
   */
  setupEventListeners() {
    // Email Queue Events
    this.emailQueue.on('completed', job => {
      logger.info(`Email job ${job.id} completed`);
    });

    this.emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} failed:`, err.message);
    });

    // Calendar Queue Events
    this.calendarQueue.on('completed', job => {
      logger.info(`Calendar job ${job.id} completed`);
    });

    this.calendarQueue.on('failed', (job, err) => {
      logger.error(`Calendar job ${job.id} failed:`, err.message);
    });

    // Report Queue Events
    this.reportQueue.on('completed', job => {
      logger.info(`Report job ${job.id} completed`);
    });

    this.reportQueue.on('failed', (job, err) => {
      logger.error(`Report job ${job.id} failed:`, err.message);
    });

    // Document Queue Events
    this.documentQueue.on('completed', job => {
      logger.info(`Document job ${job.id} completed`);
    });

    this.documentQueue.on('failed', (job, err) => {
      logger.error(`Document job ${job.id} failed:`, err.message);
    });

    logger.info('Queue event listeners registered');
  }

  /**
   * Add email job to queue
   */
  async addEmailJob({ type, applicationId, data = {} }, options = {}) {
    return this.emailQueue.add(
      'send-email',
      {
        type,
        applicationId,
        data,
      },
      {
        priority: options.priority || 5,
        delay: options.delay || 0,
        ...options,
      },
    );
  }

  /**
   * Add calendar job to queue
   */
  async addCalendarJob(applicationId, eventData, options = {}) {
    return this.calendarQueue.add(
      'create-event',
      {
        applicationId,
        eventData,
      },
      {
        priority: options.priority || 5,
        ...options,
      },
    );
  }

  /**
   * Add report generation job to queue
   */
  async addReportJob(reportType, startDate, endDate, options = {}) {
    return this.reportQueue.add(
      'generate-report',
      {
        reportType,
        startDate,
        endDate,
      },
      {
        priority: options.priority || 3,
        ...options,
      },
    );
  }

  /**
   * Add document processing job to queue
   */
  async addDocumentJob(data, options = {}) {
    return this.documentQueue.add(
      'process-document',
      data,
      {
        priority: options.priority || 5,
        delay: options.delay || 0,
        ...options,
      },
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [
      emailWaiting,
      emailActive,
      calendarWaiting,
      calendarActive,
      reportWaiting,
      reportActive,
      documentWaiting,
      documentActive,
    ] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.calendarQueue.getWaitingCount(),
      this.calendarQueue.getActiveCount(),
      this.reportQueue.getWaitingCount(),
      this.reportQueue.getActiveCount(),
      this.documentQueue.getWaitingCount(),
      this.documentQueue.getActiveCount(),
    ]);

    return {
      email: {
        waiting: emailWaiting,
        active: emailActive,
      },
      calendar: {
        waiting: calendarWaiting,
        active: calendarActive,
      },
      report: {
        waiting: reportWaiting,
        active: reportActive,
      },
      document: {
        waiting: documentWaiting,
        active: documentActive,
      },
    };
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs() {
    const grace = 7 * 24 * 3600 * 1000; // 7 days

    await Promise.all([
      this.emailQueue.clean(grace, 'completed'),
      this.emailQueue.clean(grace, 'failed'),
      this.calendarQueue.clean(grace, 'completed'),
      this.calendarQueue.clean(grace, 'failed'),
      this.reportQueue.clean(grace, 'completed'),
      this.reportQueue.clean(grace, 'failed'),
      this.documentQueue.clean(grace, 'completed'),
      this.documentQueue.clean(grace, 'failed'),
    ]);

    logger.info('Old jobs cleaned (>7 days)');
  }

  /**
   * Pause all queues
   */
  async pauseAll() {
    await Promise.all([
      this.emailQueue.pause(),
      this.calendarQueue.pause(),
      this.reportQueue.pause(),
      this.documentQueue.pause(),
    ]);
    logger.info('All queues paused');
  }

  /**
   * Resume all queues
   */
  async resumeAll() {
    await Promise.all([
      this.emailQueue.resume(),
      this.calendarQueue.resume(),
      this.reportQueue.resume(),
      this.documentQueue.resume(),
    ]);
    logger.info('All queues resumed');
  }

  /**
   * Close all queues
   */
  async closeAll() {
    await Promise.all([
      this.emailQueue.close(),
      this.calendarQueue.close(),
      this.reportQueue.close(),
      this.documentQueue.close(),
    ]);
    logger.info('All queues closed');
  }
}

module.exports = new QueueService();
