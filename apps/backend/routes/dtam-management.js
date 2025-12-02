/**
 * DTAM Management Routes
 * Routes for DTAM staff to manage farmer applications
 * Requires DTAM authentication
 */

const logger = require('../shared/logger');
const express = require('express');
const router = express.Router();
const {
  verifyDTAMToken,
  requireDTAMRole,
  requireDTAMAdmin,
} = require('../modules/auth-dtam/middleware/dtam-auth');

// Mock applications data (will be replaced with MongoDB queries)
const mockApplications = [
  {
    id: 'APP-2025-001',
    applicationId: 'APP-2025-001',
    farmerName: 'สมชาย ใจดี',
    farmName: 'ฟาร์มกัญชาอินทรีย์',
    region: 'ภาคเหนือ',
    province: 'เชียงใหม่',
    status: 'pending_review',
    submittedAt: '2025-10-10T08:30:00.000Z',
    farmArea: '5 ไร่',
    cropType: 'กัญชาอินทรีย์',
    score: null,
  },
  {
    id: 'APP-2025-002',
    applicationId: 'APP-2025-002',
    farmerName: 'สมหญิง รักษ์ดี',
    farmName: 'ฟาร์มกัญชาภูผา',
    region: 'ภาคอีสาน',
    province: 'อุบลราชธานี',
    status: 'approved',
    submittedAt: '2025-10-08T14:20:00.000Z',
    reviewedAt: '2025-10-09T10:15:00.000Z',
    reviewedBy: 'dtam-002',
    farmArea: '10 ไร่',
    cropType: 'กัญชาเพื่อการแพทย์',
    score: 85,
  },
  {
    id: 'APP-2025-003',
    applicationId: 'APP-2025-003',
    farmerName: 'วิชัย มั่นคง',
    farmName: 'ฟาร์มกัญชาใต้',
    region: 'ภาคใต้',
    province: 'สงขลา',
    status: 'pending_review',
    submittedAt: '2025-10-09T16:45:00.000Z',
    farmArea: '8 ไร่',
    cropType: 'กัญชาสกัด',
    score: null,
  },
];

/**
 * GET /api/dtam/applications
 * Get all applications (with filters)
 * Requires: DTAM Staff authentication
 */
router.get('/applications', verifyDTAMToken, (req, res) => {
  try {
    const { status, region, province, page = 1, limit = 10 } = req.query;

    // Filter applications
    let filteredApps = [...mockApplications];

    if (status) {
      filteredApps = filteredApps.filter(app => app.status === status);
    }

    if (region) {
      filteredApps = filteredApps.filter(app => app.region === region);
    }

    if (province) {
      filteredApps = filteredApps.filter(app => app.province === province);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedApps = filteredApps.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        applications: paginatedApps,
        pagination: {
          total: filteredApps.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(filteredApps.length / limit),
        },
        filters: { status, region, province },
      },
    });
  } catch (error) {
    logger.error('[DTAM] Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
    });
  }
});

/**
 * GET /api/dtam/applications/:id
 * Get application details
 * Requires: DTAM Staff authentication
 */
router.get('/applications/:id', verifyDTAMToken, (req, res) => {
  try {
    const { id } = req.params;

    const application = mockApplications.find(app => app.id === id || app.applicationId === id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบคำขอนี้',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error('[DTAM] Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาด',
    });
  }
});

/**
 * PUT /api/dtam/applications/:id/review
 * Review and approve/reject application
 * Requires: DTAM Staff (reviewer or higher)
 */
router.put(
  '/applications/:id/review',
  verifyDTAMToken,
  requireDTAMRole(['reviewer', 'manager', 'admin']),
  (req, res) => {
    try {
      const { id } = req.params;
      const { action, score, comment, reason } = req.body;

      // Validate action
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'action ต้องเป็น approve หรือ reject',
        });
      }

      // Find application
      const application = mockApplications.find(app => app.id === id || app.applicationId === id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบคำขอนี้',
        });
      }

      // Check if already reviewed
      if (application.status !== 'pending_review') {
        return res.status(400).json({
          success: false,
          error: 'คำขอนี้ได้รับการตรวจสอบแล้ว',
        });
      }

      // Update application
      application.status = action === 'approve' ? 'approved' : 'rejected';
      application.reviewedAt = new Date().toISOString();
      application.reviewedBy = req.user.userId;
      application.reviewerName = `${req.user.username}`;
      application.score = score || null;
      application.reviewComment = comment || '';
      application.rejectionReason = action === 'reject' ? reason : null;

      res.json({
        success: true,
        message: action === 'approve' ? 'อนุมัติคำขอสำเร็จ' : 'ไม่อนุมัติคำขอสำเร็จ',
        data: application,
      });

      logger.info(`[DTAM] Application ${id} ${action}ed by ${req.user.username}`);
    } catch (error) {
      logger.error('[DTAM] Error reviewing application:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาด',
      });
    }
  },
);

/**
 * GET /api/dtam/statistics
 * Get dashboard statistics
 * Requires: DTAM Staff authentication
 */
router.get('/statistics', verifyDTAMToken, (req, res) => {
  try {
    const stats = {
      totalApplications: mockApplications.length,
      pendingReview: mockApplications.filter(app => app.status === 'pending_review').length,
      approved: mockApplications.filter(app => app.status === 'approved').length,
      rejected: mockApplications.filter(app => app.status === 'rejected').length,
      byRegion: {
        north: mockApplications.filter(app => app.region === 'ภาคเหนือ').length,
        northeast: mockApplications.filter(app => app.region === 'ภาคอีสาน').length,
        central: mockApplications.filter(app => app.region === 'ภาคกลาง').length,
        south: mockApplications.filter(app => app.region === 'ภาคใต้').length,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('[DTAM] Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาด',
    });
  }
});

/**
 * POST /api/dtam/staff/create
 * Create new DTAM staff account (admin only)
 * Requires: DTAM Admin
 */
router.post('/staff/create', verifyDTAMToken, requireDTAMAdmin, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role, department } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
    }

    // TODO: Save to database
    const newStaff = {
      id: `dtam-${Date.now()}`,
      username,
      email,
      firstName,
      lastName,
      userType: 'DTAM_STAFF',
      role: role || 'reviewer',
      department: department || 'กรมส่งเสริมการเกษตร',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.userId,
    };

    res.status(201).json({
      success: true,
      message: 'สร้างบัญชีเจ้าหน้าที่สำเร็จ',
      data: {
        userId: newStaff.id,
        username: newStaff.username,
        email: newStaff.email,
        role: newStaff.role,
      },
    });

    logger.info(`[DTAM] New staff created: ${username} by ${req.user.username}`);
  } catch (error) {
    logger.error('[DTAM] Error creating staff:', error);
    res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาด',
    });
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'dtam-management',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
