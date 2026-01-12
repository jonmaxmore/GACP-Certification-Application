const metricsService = require('../apps/backend/services/metrics-service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerification() {
    console.log('--- Verifying Metrics Service ---');
    try {
        const stats = await metricsService.getDashboardStats();
        console.log('✅ Metrics Service Returned Data:');
        console.log(JSON.stringify(stats, null, 2));

        if (!stats.overview || !stats.byStatus || !stats.byPlantType) {
            throw new Error('Missing required keys in response');
        }

        console.log('✅ Verification Passed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

runVerification();
