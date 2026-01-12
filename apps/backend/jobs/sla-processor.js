const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../shared/logger');

/**
 * Check for applications pending for > 5 Days
 */
const checkSlaBreaches = async (job) => {
    logger.info('[SLA-Monitor] Starting SLA Check Job...');

    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Find stale applications
        const staleApps = await prisma.application.findMany({
            where: {
                status: {
                    in: ['PENDING_AUDIT', 'DOCUMENT_APPROVED', 'SUBMITTED', 'AWAITING_SCHEDULE']
                },
                updatedAt: {
                    lt: fiveDaysAgo
                },
                isDeleted: false
            },
            select: {
                id: true,
                applicationNumber: true,
                status: true,
                updatedAt: true,
                farmer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (staleApps.length === 0) {
            logger.info('[SLA-Monitor] No SLA breaches found.');
            return { processed: 0, breaches: [] };
        }

        // Log Breaches (In production, this would trigger emails/SMS)
        logger.warn(`[SLA-Monitor] 🚨 FOUND ${staleApps.length} SLA BREACHES!`);

        const breaches = [];
        for (const app of staleApps) {
            const daysStuck = Math.floor((new Date() - new Date(app.updatedAt)) / (1000 * 60 * 60 * 24));

            logger.warn(`[SLA-Monitor] ⚠️ App ${app.applicationNumber} (${app.status}) stuck for ${daysStuck} days. Farmer: ${app.farmer?.firstName}`);

            // [TODO] Send Email to Admin
            // await emailService.sendSlaAlert(app);

            breaches.push({
                appNo: app.applicationNumber,
                days: daysStuck
            });
        }

        return { processed: staleApps.length, breaches };

    } catch (error) {
        logger.error('[SLA-Monitor] Job Failed:', error);
        throw error;
    }
};

module.exports = checkSlaBreaches;
