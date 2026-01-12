const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../shared/logger');

class MetricsService {
    /**
     * Get Main Dashboard Statistics
     */
    async getDashboardStats() {
        try {
            const [
                totalApplications,
                statusGroups,
                plantGroups,
                provinceGroups,
                monthlyTrend
            ] = await Promise.all([
                this.getTotalApplications(),
                this.getStatusDistribution(),
                this.getPlantTypeDistribution(),
                this.getProvinceDistribution(),
                this.getMonthlyTrend()
            ]);

            // Process Status Groups
            const byStatus = {};
            let pendingReview = 0;
            let pendingAudit = 0;
            let approved = 0;
            let rejected = 0;

            statusGroups.forEach(g => {
                const s = g.status;
                const c = g._count.status;
                byStatus[s] = c;

                if (['DOCUMENT_CHECKING', 'SUBMITTED', 'REVISION_REQUIRED', 'PAYMENT_1_PENDING'].includes(s)) pendingReview += c;
                if (['PAYMENT_2_PENDING', 'AUDIT_PENDING', 'AUDIT_SCHEDULED', 'AUDIT_IN_PROGRESS', 'AWAITING_SCHEDULE', 'PENDING_AUDIT'].includes(s)) pendingAudit += c;
                if (s === 'APPROVED') approved += c;
                if (s === 'REJECTED') rejected += c;
            });

            return {
                overview: {
                    totalApplications,
                    pendingReview,
                    pendingAudit: 0, // Frontend interface calls this 'pendingReview' too? No, let's map to existing cards
                    // AnalyticsPage.tsx expects: overview: { totalApplications, pendingReview, approved, rejected }
                    // So we combine review + audit? Or just show review? 
                    // Let's stick to the high level buckets.
                    approved,
                    rejected
                },
                byStatus,
                byPlantType: plantGroups,
                byProvince: provinceGroups,
                monthlyTrend
            };

        } catch (error) {
            logger.error('[Metrics] Failed to aggregate stats:', error);
            throw error;
        }
    }

    async getTotalApplications() {
        return await prisma.application.count({ where: { isDeleted: false } });
    }

    async getStatusDistribution() {
        return await prisma.application.groupBy({
            by: ['status'],
            _count: { status: true },
            where: { isDeleted: false }
        });
    }

    async getPlantTypeDistribution() {
        // PostgreSQL JSON extraction
        // Assuming formData -> plantId
        try {
            const result = await prisma.$queryRaw`
                SELECT "formData"->>'plantId' as name, COUNT(*) as count
                FROM applications
                WHERE "isDeleted" = false AND "formData"->>'plantId' IS NOT NULL
                GROUP BY "formData"->>'plantId'
                ORDER BY count DESC
                LIMIT 5;
            `;

            // Convert BigInt to Number if needed (Prisma returns BigInt for count)
            const map = {};
            result.forEach(r => {
                const count = Number(r.count);
                if (r.name) map[r.name] = count;
            });
            return map;
        } catch (e) {
            logger.warn('[Metrics] Plant stats failed (JSON query), returning empty:', e.message);
            return {};
        }
    }

    async getProvinceDistribution() {
        // Try getting province from User/Farmer for stability
        try {
            const result = await prisma.$queryRaw`
                SELECT u.province as name, COUNT(a.id) as count
                FROM applications a
                JOIN users u ON a."farmerId" = u.id
                WHERE a."isDeleted" = false AND u.province IS NOT NULL
                GROUP BY u.province
                ORDER BY count DESC
                LIMIT 5;
            `;

            const map = {};
            result.forEach(r => {
                const count = Number(r.count);
                if (r.name) map[r.name] = count;
            });
            return map;
        } catch (e) {
            logger.warn('[Metrics] Province stats failed:', e.message);
            return {};
        }
    }

    async getMonthlyTrend() {
        // Last 12 months
        try {
            const result = await prisma.$queryRaw`
                SELECT 
                    TO_CHAR("createdAt", 'MM') as month,
                    COUNT(*) as applications,
                    SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved
                FROM applications
                WHERE "isDeleted" = false
                  AND "createdAt" > NOW() - INTERVAL '1 year'
                GROUP BY TO_CHAR("createdAt", 'MM')
                ORDER BY month ASC;
            `;

            return result.map(r => ({
                month: Number(r.month),
                applications: Number(r.applications),
                approved: Number(r.approved)
            }));
        } catch (e) {
            logger.warn('[Metrics] Monthly Trend failed:', e.message);
            return [];
        }
    }
}

module.exports = new MetricsService();
