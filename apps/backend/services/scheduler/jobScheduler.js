/**
 * Job Scheduler
 * Manages background jobs and scheduled tasks
 */

const cron = require('node-cron');
const logger = require('../../utils/logger');
const aiQcTrigger = require('../services/ai/aiQcTrigger');

class JobScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    logger.info('Starting job scheduler');

    // AI QC Queue Processing - Every 5 minutes
    if (process.env.ENABLE_AI_QC === 'true') {
      const aiQcJob = cron.schedule('*/5 * * * *', async () => {
        try {
          logger.info('Running scheduled AI QC queue processing');
          await aiQcTrigger.processAIQCQueue();
        } catch (error) {
          logger.error('Scheduled AI QC processing failed:', error);
        }
      });

      this.jobs.push({ name: 'AI QC Queue', job: aiQcJob });
      logger.info('Scheduled: AI QC Queue Processing (every 5 minutes)');
    }

    // Certificate Expiry Check - Daily at 8 AM
    const certExpiryJob = cron.schedule('0 8 * * *', async () => {
      try {
        logger.info('Running certificate expiry check');
        // TODO: Implement certificate expiry check
      } catch (error) {
        logger.error('Certificate expiry check failed:', error);
      }
    });

    this.jobs.push({ name: 'Certificate Expiry', job: certExpiryJob });
    logger.info('Scheduled: Certificate Expiry Check (daily at 8 AM)');

    // Inspection Reminder - Daily at 7 AM
    const inspectionReminderJob = cron.schedule('0 7 * * *', async () => {
      try {
        logger.info('Running inspection reminder job');
        // TODO: Implement inspection reminder
      } catch (error) {
        logger.error('Inspection reminder failed:', error);
      }
    });

    this.jobs.push({ name: 'Inspection Reminder', job: inspectionReminderJob });
    logger.info('Scheduled: Inspection Reminder (daily at 7 AM)');

    // Database Cleanup - Weekly on Sunday at 2 AM
    const cleanupJob = cron.schedule('0 2 * * 0', async () => {
      try {
        logger.info('Running database cleanup');
        // TODO: Implement database cleanup (old temp files, expired sessions, etc.)
      } catch (error) {
        logger.error('Database cleanup failed:', error);
      }
    });

    this.jobs.push({ name: 'Database Cleanup', job: cleanupJob });
    logger.info('Scheduled: Database Cleanup (weekly on Sunday at 2 AM)');

    // Report Generation - Monthly on 1st at 1 AM
    const monthlyReportJob = cron.schedule('0 1 1 * *', async () => {
      try {
        logger.info('Generating monthly reports');
        // TODO: Implement monthly report generation
      } catch (error) {
        logger.error('Monthly report generation failed:', error);
      }
    });

    this.jobs.push({ name: 'Monthly Reports', job: monthlyReportJob });
    logger.info('Scheduled: Monthly Reports (1st of each month at 1 AM)');

    logger.info(`Job scheduler started with ${this.jobs.length} jobs`);
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    logger.info('Stopping job scheduler');

    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });

    this.jobs = [];
    logger.info('Job scheduler stopped');
  }

  /**
   * Get list of active jobs
   */
  getJobs() {
    return this.jobs.map(({ name }) => name);
  }

  /**
   * Run a job manually
   */
  async runJob(jobName) {
    const job = this.jobs.find(({ name }) => name === jobName);

    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    logger.info(`Manually running job: ${jobName}`);

    // Jobs are functions, so we need to extract and call them
    // This is a workaround since cron jobs don't expose their callback directly
    switch (jobName) {
      case 'AI QC Queue':
        await aiQcTrigger.processAIQCQueue();
        break;
      default:
        throw new Error(`Manual execution not implemented for: ${jobName}`);
    }

    logger.info(`Job completed: ${jobName}`);
  }
}

module.exports = new JobScheduler();
