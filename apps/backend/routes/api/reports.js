/**
 * Reports API Routes
 * Export and analytics endpoints for government officials
 * 
 * Features:
 * - Application statistics
 * - Monthly/yearly reports
 * - Export to JSON/CSV
 * - Dashboard analytics
 */

const express = require('express');
const router = express.Router();
const { authenticateFarmer } = require('../../middleware/auth-middleware');

// Mock data for demo (replace with real DB queries)
const generateMockStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return {
        overview: {
            totalApplications: 1234,
            pendingReview: 45,
            approved: 1089,
            rejected: 100,
            pendingPayment: 67,
        },
        byStatus: {
            DRAFT: 23,
            PAYMENT_1_PENDING: 34,
            SUBMITTED: 45,
            REVISION_REQ: 12,
            PAYMENT_2_PENDING: 33,
            AUDIT_PENDING: 56,
            AUDIT_SCHEDULED: 28,
            CERTIFIED: 1003,
        },
        byPlantType: {
            'กัญชา': 450,
            'กระท่อม': 320,
            'ขมิ้นชัน': 180,
            'ขิง': 120,
            'กระชายดำ': 90,
            'ไพล': 74,
        },
        byProvince: {
            'กรุงเทพมหานคร': 120,
            'เชียงใหม่': 98,
            'นครราชสีมา': 87,
            'ขอนแก่น': 76,
            'อุบลราชธานี': 65,
            'อื่นๆ': 788,
        },
        monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            year: currentYear,
            applications: Math.floor(Math.random() * 100) + 50,
            approved: Math.floor(Math.random() * 80) + 30,
        })),
        lastUpdated: now.toISOString(),
        period: {
            month: currentMonth,
            year: currentYear,
        },
    };
};

/**
 * @route GET /api/v2/reports/overview
 * @desc Get application overview statistics
 * @access Private (Staff only)
 */
router.get('/overview', authenticateFarmer, async (req, res) => {
    try {
        const stats = generateMockStats();

        res.json({
            success: true,
            data: {
                overview: stats.overview,
                lastUpdated: stats.lastUpdated,
            },
        });
    } catch (error) {
        console.error('Reports overview error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูลสถิติได้',
        });
    }
});

/**
 * @route GET /api/v2/reports/dashboard
 * @desc Get full dashboard data for analytics
 * @access Private (Staff only)
 */
router.get('/dashboard', authenticateFarmer, async (req, res) => {
    try {
        const stats = generateMockStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูล Dashboard ได้',
        });
    }
});

/**
 * @route GET /api/v2/reports/monthly
 * @desc Get monthly statistics
 * @query month (1-12), year
 * @access Private (Staff only)
 */
router.get('/monthly', authenticateFarmer, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = parseInt(month) || (now.getMonth() + 1);
        const targetYear = parseInt(year) || now.getFullYear();

        const monthNames = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
        ];

        res.json({
            success: true,
            data: {
                period: {
                    month: targetMonth,
                    monthName: monthNames[targetMonth - 1],
                    year: targetYear,
                },
                stats: {
                    newApplications: Math.floor(Math.random() * 100) + 50,
                    approved: Math.floor(Math.random() * 80) + 30,
                    rejected: Math.floor(Math.random() * 20) + 5,
                    pendingAudit: Math.floor(Math.random() * 40) + 10,
                    auditsCompleted: Math.floor(Math.random() * 30) + 15,
                    revenue: {
                        phase1: Math.floor(Math.random() * 500000) + 100000,
                        phase2: Math.floor(Math.random() * 500000) + 100000,
                        total: 0,
                    },
                },
                comparedToPreviousMonth: {
                    applications: '+12%',
                    approved: '+8%',
                    revenue: '+15%',
                },
            },
        });
    } catch (error) {
        console.error('Monthly report error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงรายงานรายเดือนได้',
        });
    }
});

/**
 * @route GET /api/v2/reports/export
 * @desc Export data as JSON or CSV
 * @query format (json|csv), type (applications|certificates|payments)
 * @access Private (Staff only)
 */
router.get('/export', authenticateFarmer, async (req, res) => {
    try {
        const { format = 'json', type = 'applications' } = req.query;

        // Generate mock export data
        const mockData = {
            applications: [
                { id: 'APP-001', status: 'CERTIFIED', plantType: 'กัญชา', province: 'กรุงเทพมหานคร', createdAt: '2024-01-01' },
                { id: 'APP-002', status: 'AUDIT_PENDING', plantType: 'กระท่อม', province: 'เชียงใหม่', createdAt: '2024-01-02' },
                { id: 'APP-003', status: 'SUBMITTED', plantType: 'ขมิ้นชัน', province: 'ขอนแก่น', createdAt: '2024-01-03' },
            ],
            certificates: [
                { certificateNo: 'GACP-2024-001', siteName: 'ฟาร์มสมุนไพร A', plantType: 'กัญชา', issuedAt: '2024-01-15', expiresAt: '2027-01-15' },
                { certificateNo: 'GACP-2024-002', siteName: 'ฟาร์มสมุนไพร B', plantType: 'กระท่อม', issuedAt: '2024-02-01', expiresAt: '2027-02-01' },
            ],
            payments: [
                { invoiceNo: 'INV-001', amount: 5000, status: 'PAID', paidAt: '2024-01-10' },
                { invoiceNo: 'INV-002', amount: 15000, status: 'PAID', paidAt: '2024-01-20' },
            ],
        };

        const data = mockData[type] || mockData.applications;

        if (format === 'csv') {
            // Convert to CSV
            const headers = Object.keys(data[0] || {});
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')),
            ];
            const csv = csvRows.join('\n');

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.csv"`);
            return res.send('\ufeff' + csv); // BOM for Excel
        }

        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.json"`);
        res.json({
            success: true,
            exportedAt: new Date().toISOString(),
            type,
            count: data.length,
            data,
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถ Export ข้อมูลได้',
        });
    }
});

/**
 * @route GET /api/v2/reports/by-province
 * @desc Get statistics grouped by province
 * @access Private (Staff only)
 */
router.get('/by-province', authenticateFarmer, async (req, res) => {
    try {
        const stats = generateMockStats();

        res.json({
            success: true,
            data: {
                byProvince: stats.byProvince,
                totalProvinces: Object.keys(stats.byProvince).length,
            },
        });
    } catch (error) {
        console.error('Province stats error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูลตามจังหวัดได้',
        });
    }
});

/**
 * @route GET /api/v2/reports/by-plant
 * @desc Get statistics grouped by plant type
 * @access Private (Staff only)
 */
router.get('/by-plant', authenticateFarmer, async (req, res) => {
    try {
        const stats = generateMockStats();

        res.json({
            success: true,
            data: {
                byPlantType: stats.byPlantType,
                totalPlantTypes: Object.keys(stats.byPlantType).length,
            },
        });
    } catch (error) {
        console.error('Plant stats error:', error);
        res.status(500).json({
            success: false,
            message: 'ไม่สามารถดึงข้อมูลตามประเภทพืชได้',
        });
    }
});

module.exports = router;

