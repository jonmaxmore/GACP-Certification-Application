/**
 * Queue Service - Background Job Processing with Bull
 * 
 * Provides message queue functionality similar to enterprise apps.
 * Uses Bull (Redis-based) for reliable job processing.
 * 
 * Features:
 * - Multiple named queues (email, pdf, notification)
 * - Automatic retries with exponential backoff
 * - Job progress tracking
 * - Graceful degradation when Redis unavailable
 * 
 * Usage:
 *   const queue = require('./services/QueueService');
 *   await queue.addEmailJob({ to: 'user@example.com', template: 'welcome' });
 */

const Queue = require('bull');
const { createLogger } = require('../shared/logger');
const logger = createLogger('queue-service');

// Queue configuration
const QUEUE_CONFIG = {
    redis: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500,     // Keep last 500 failed jobs for debugging
    },
};

class QueueService {
    constructor() {
        this.queues = {};
        this.processors = {};
        this.isReady = false;
    }

    /**
     * Initialize all queues
     */
    async init() {
        try {
            // Create queues
            this.queues.email = new Queue('email', QUEUE_CONFIG.redis);
            this.queues.notification = new Queue('notification', QUEUE_CONFIG.redis);
            this.queues.pdf = new Queue('pdf', QUEUE_CONFIG.redis);
            this.queues.general = new Queue('general', QUEUE_CONFIG.redis);

            // Setup event handlers for each queue
            for (const [name, queue] of Object.entries(this.queues)) {
                this.setupQueueEvents(name, queue);
            }

            // Register default processors
            this.registerProcessors();

            this.isReady = true;
            logger.info('✅ Queue Service initialized successfully');
            return true;
        } catch (error) {
            logger.warn('⚠️ Queue Service unavailable (graceful degradation):', error.message);
            this.isReady = false;
            return false;
        }
    }

    /**
     * Setup event handlers for a queue
     */
    setupQueueEvents(name, queue) {
        queue.on('completed', (job, result) => {
            logger.debug(`[${name}] Job ${job.id} completed`, { result });
        });

        queue.on('failed', (job, err) => {
            logger.warn(`[${name}] Job ${job.id} failed`, { error: err.message, attempts: job.attemptsMade });
        });

        queue.on('error', (error) => {
            logger.error(`[${name}] Queue error`, { error: error.message });
        });

        queue.on('stalled', (job) => {
            logger.warn(`[${name}] Job ${job.id} stalled`);
        });
    }

    /**
     * Register job processors
     */
    registerProcessors() {
        // Email processor
        this.queues.email.process(async (job) => {
            const { to, subject, template, data } = job.data;
            logger.info(`[Email] Sending ${template} to ${to}`);

            // TODO: Integrate with actual email service (SendGrid, SES, etc.)
            // For now, just simulate
            await this.simulateWork(500);

            return { sent: true, to, template };
        });

        // Notification processor
        this.queues.notification.process(async (job) => {
            const { userId, type, message } = job.data;
            logger.info(`[Notification] Sending ${type} to user ${userId}`);

            // TODO: Save to notification table, send push notification
            await this.simulateWork(200);

            return { delivered: true, userId, type };
        });

        // PDF processor
        this.queues.pdf.process(async (job) => {
            const { applicationId, templateType } = job.data;
            logger.info(`[PDF] Generating ${templateType} for application ${applicationId}`);

            // TODO: Integrate with PDF generation service
            await this.simulateWork(2000); // PDF generation takes longer

            return { generated: true, applicationId };
        });

        // General job processor
        this.queues.general.process(async (job) => {
            const { task, data } = job.data;
            logger.info(`[General] Processing ${task}`);
            await this.simulateWork(100);
            return { processed: true, task };
        });
    }

    /**
     * Simulate work (for testing)
     */
    simulateWork(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================
    // Public API
    // ========================

    /**
     * Add email job to queue
     */
    async addEmailJob(data, options = {}) {
        if (!this.isReady) {
            logger.warn('Queue not ready, executing synchronously');
            // Fallback: execute immediately (no retry)
            return this.queues.email?.process?.(data);
        }

        return this.queues.email.add(data, {
            ...QUEUE_CONFIG.defaultJobOptions,
            ...options,
        });
    }

    /**
     * Add notification job to queue
     */
    async addNotificationJob(data, options = {}) {
        if (!this.isReady) return null;

        return this.queues.notification.add(data, {
            ...QUEUE_CONFIG.defaultJobOptions,
            ...options,
        });
    }

    /**
     * Add PDF generation job to queue
     */
    async addPdfJob(data, options = {}) {
        if (!this.isReady) return null;

        return this.queues.pdf.add(data, {
            ...QUEUE_CONFIG.defaultJobOptions,
            ...options,
            attempts: 2, // PDF generation is expensive, fewer retries
        });
    }

    /**
     * Add delayed job (execute after specified time)
     */
    async addDelayedJob(queueName, data, delayMs) {
        if (!this.isReady || !this.queues[queueName]) return null;

        return this.queues[queueName].add(data, {
            ...QUEUE_CONFIG.defaultJobOptions,
            delay: delayMs,
        });
    }

    /**
     * Get queue statistics
     */
    async getStats() {
        if (!this.isReady) {
            return { ready: false };
        }

        const stats = {};
        for (const [name, queue] of Object.entries(this.queues)) {
            const [waiting, active, completed, failed] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
            ]);
            stats[name] = { waiting, active, completed, failed };
        }

        return { ready: true, queues: stats };
    }

    /**
     * Graceful shutdown
     */
    async close() {
        for (const queue of Object.values(this.queues)) {
            await queue.close();
        }
        logger.info('🔌 Queue Service closed gracefully');
    }
}

// Singleton instance
const queueService = new QueueService();

module.exports = queueService;
