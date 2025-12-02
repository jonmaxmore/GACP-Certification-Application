/**
 * Job Queue Service using Bull
 * Handles background processing for AI QC, notifications, and other async tasks
 */

const Bull = require('bull');
const logger = require('../../shared/logger');
const geminiService = require('../ai/geminiService');
const notificationService = require('../notification/notificationService');
const cacheService = require('../cache/cacheService');
const DTAMApplication = require('../../models/Application');

class QueueService {
  constructor() {
    // Initialize queues with Redis connection
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    // AI QC Processing Queue
    this.aiQcQueue = new Bull('ai-qc-processing', {
      redis: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs
      },
    });

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
    // AI QC Processor
    this.aiQcQueue.process('run-ai-qc', async job => {
      const { applicationId } = job.data;
      logger.info(`Processing AI QC for application ${applicationId}`);

      try {
        const application = await DTAMApplication.findById(applicationId)
          .populate('documents')
          .populate('images');

        if (!application) {
          throw new Error('Application not found');
        }

        // Run AI QC
        const qcResult = await geminiService.performAIQC({
          id: application._id,
          lotId: application.lotId,
          farmer: {
            name: application.farmer.name,
            idCard: application.farmer.idCard,
          },
          farm: {
            name: application.farmer.farmName,
            location: application.farmer.farmLocation,
            area: application.farmArea,
          },
          documents: application.documents || [],
          images: application.images || [],
        });

        if (qcResult.success) {
          // Update application with results
          application.aiQc = {
            completedAt: new Date(),
            overallScore: qcResult.data.overallScore,
            scores: qcResult.data.scores,
            inspectionType: qcResult.data.inspectionType,
            issues: qcResult.data.issues,
            recommendations: qcResult.data.recommendations,
          };
          application.inspectionType = qcResult.data.inspectionType;
          application.status = 'IN_REVIEW';
          application.aiQcCompletedAt = new Date();
          await application.save();

          // Cache AI QC result
          await cacheService.cacheAIQCResult(applicationId, qcResult.data);

          // Invalidate application cache
          await cacheService.invalidateApplication(applicationId);

          // Queue notification
          await this.addEmailJob({
            type: 'new-application',
            applicationId: application._id,
          });

          return { success: true, result: qcResult.data };
        } else {
          throw new Error(qcResult.error);
        }
      } catch (error) {
        logger.error('AI QC processing failed:', error);
        throw error;
      }
    });

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
            result = await notificationService.notifyNewApplication(application);
            break;
          case 'inspector-assignment':
            result = await notificationService.notifyInspectorAssignment(
              application,
              application.inspector,
            );
            break;
          case 'inspection-complete':
            result = await notificationService.notifyApproverInspectionComplete(application);
            break;
          case 'status-change':
            result = await notificationService.notifyFarmerStatusChange(
              application,
              data.newStatus,
            );
            break;
          case 'inspection-reminder':
            result = await notificationService.sendInspectionReminder(application);
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
          // Circular dependency check: We need GACPCertificateService here
          // But GACPCertificateService depends on QueueService
          // We should require it inside the processor or use dependency injection
          // For now, let's dynamic require
          const gacpCertificateService = require('../gacp-certificate');
          const applicationRepository = require('../../repositories/ApplicationRepository');
          const appRepo = new applicationRepository();

          const application = await appRepo.findById(applicationId);
          if (!application) throw new Error('Application not found');

          // Call the sync generation method
          return await gacpCertificateService._generateCertificateSync(application, certificateNumber, approvedBy);
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
    // AI QC Queue Events
    this.aiQcQueue.on('completed', (job, result) => {
      logger.info(`AI QC job ${job.id} completed:`, result);
    });

    this.aiQcQueue.on('failed', (job, err) => {
      logger.error(`AI QC job ${job.id} failed:`, err.message);
    });

    this.aiQcQueue.on('stalled', job => {
      logger.warn(`AI QC job ${job.id} stalled`);
    });

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
   * Add AI QC job to queue
   */
  async addAIQCJob(applicationId, options = {}) {
    return this.aiQcQueue.add(
      'run-ai-qc',
      {
        applicationId,
      },
      {
        priority: options.priority || 5,
        delay: options.delay || 0,
        ...options,
      },
    );
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
      aiQcWaiting,
      aiQcActive,
      aiQcCompleted,
      aiQcFailed,
      emailWaiting,
      emailActive,
      calendarWaiting,
      calendarActive,
      reportWaiting,
      reportActive,
    ] = await Promise.all([
      this.aiQcQueue.getWaitingCount(),
      this.aiQcQueue.getActiveCount(),
      this.aiQcQueue.getCompletedCount(),
      this.aiQcQueue.getFailedCount(),
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
      aiQc: {
        waiting: aiQcWaiting,
        active: aiQcActive,
        completed: aiQcCompleted,
        failed: aiQcFailed,
      },
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
        waiting: arguments[10], // Result from Promise.all index 10
        active: arguments[11], // Result from Promise.all index 11
      },
    };
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs() {
    const grace = 7 * 24 * 3600 * 1000; // 7 days

    await Promise.all([
      this.aiQcQueue.clean(grace, 'completed'),
      this.aiQcQueue.clean(grace, 'failed'),
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
      this.aiQcQueue.pause(),
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
      this.aiQcQueue.resume(),
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
      this.aiQcQueue.close(),
      this.emailQueue.close(),
      this.calendarQueue.close(),
      this.reportQueue.close(),
      this.documentQueue.close(),
    ]);
    logger.info('All queues closed');
  }
}

module.exports = new QueueService();
