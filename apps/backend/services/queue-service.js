const Queue = require('bull');
const logger = require('../shared/logger');
const redisService = require('./redis-service');
const checkSlaBreaches = require('../jobs/sla-processor');

let slaQueue = null;

const initQueues = () => {
    // Only start if Redis is available (or try to connect)
    // Bull creates its own connection, so we just use the URL
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    try {
        logger.info('[Queue] Initializing SLA Monitor Queue...');

        slaQueue = new Queue('sla-monitor', redisUrl, {
            redis: {
                maxRetriesPerRequest: 3,
                enableReadyCheck: false
            },
            defaultJobOptions: {
                removeOnComplete: true, // Keep memory clean
                removeOnFail: 100
            }
        });

        // Register Processor
        slaQueue.process(checkSlaBreaches);

        // Events
        slaQueue.on('ready', () => {
            logger.info('✅ SLA Queue Ready');
            // Schedule the recurring job (Daily at 8 AM)
            slaQueue.add({}, { repeat: { cron: '0 8 * * *' }, jobId: 'daily-sla-check' })
                .then(() => logger.info('[Queue] SLA Daily Check Scheduled'))
                .catch(err => logger.error('[Queue] Schedule Error:', err));
        });

        slaQueue.on('error', (error) => {
            logger.warn('⚠️ SLA Queue Redis Error:', error.message);
        });

        slaQueue.on('failed', (job, err) => {
            logger.error(`[Queue] Job ${job.id} failed:`, err.message);
        });

    } catch (error) {
        logger.error('[Queue] Failed to initialize queues:', error);
    }
};

const getSlaQueue = () => slaQueue;

module.exports = {
    initQueues,
    getSlaQueue
};
