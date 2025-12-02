/**
 * Dashboard API Routes for GACP System
 * Provides role-based dashboard data and analytics
 */
const express = require('express');
const logger = require('../shared/logger').createLogger('dashboard');
const router = express.Router();

// Mock data for development
const mockStats = {
  farmer: {
    totalApplications: 3,
    pendingReviews: 1,
    approvedApplications: 2,
    rejectedApplications: 0,
    activeUsers: 1,
    todayApplications: 0,
    averageProcessingTime: 15,
    totalRevenue: 0,
  },
  reviewer: {
    totalApplications: 25,
    pendingReviews: 8,
    approvedApplications: 15,
    rejectedApplications: 2,
    activeUsers: 12,
    todayApplications: 3,
    averageProcessingTime: 12,
    totalRevenue: 0,
  },
  auditor: {
    totalApplications: 45,
    pendingReviews: 5,
    approvedApplications: 38,
    rejectedApplications: 2,
    activeUsers: 25,
    todayApplications: 2,
    averageProcessingTime: 18,
    totalRevenue: 0,
  },
  admin: {
    totalApplications: 128,
    pendingReviews: 15,
    approvedApplications: 98,
    rejectedApplications: 15,
    activeUsers: 45,
    todayApplications: 7,
    averageProcessingTime: 14,
    totalRevenue: 2580000,
  },
};

const mockActivities = {
  farmer: [
    {
      id: '1',
      userId: 'farmer1',
      action: 'ส่งคำขอรับรอง',
      description: 'ส่งคำขอรับรอง GACP สำหรับกัญชาทางการแพทย์',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'application',
    },
    {
      id: '2',
      userId: 'farmer1',
      action: 'อัพโหลดเอกสาร',
      description: 'อัพโหลดใบรับรองการปลูก',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'document',
    },
  ],
  reviewer: [
    {
      id: '1',
      userId: 'reviewer1',
      action: 'ตรวจสอบเอกสาร',
      description: 'ตรวจสอบเอกสารคำขอ GACP-2025-003',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'review',
    },
    {
      id: '2',
      userId: 'reviewer1',
      action: 'อนุมัติคำขอ',
      description: 'อนุมัติคำขอรับรอง GACP-2025-002',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'approval',
    },
  ],
  auditor: [
    {
      id: '1',
      userId: 'auditor1',
      action: 'ตรวจสอบภาคสนาม',
      description: 'ตรวจสอบฟาร์มสำหรับคำขอ GACP-2025-001',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: 'review',
    },
  ],
  admin: [
    {
      id: '1',
      userId: 'admin1',
      action: 'สร้างผู้ใช้ใหม่',
      description: 'สร้างบัญชีผู้ตรวจสอบใหม่',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'application',
    },
    {
      id: '2',
      userId: 'admin1',
      action: 'อัพเดทระบบ',
      description: 'อัพเดทระบบรายงานและวิเคราะห์',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: 'application',
    },
  ],
};

const mockApplications = {
  farmer: [
    {
      id: 'app1',
      applicationNumber: 'GACP-2025-001',
      farmerName: 'นายสมชาย ใจดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'กัญชาทางการแพทย์',
    },
  ],
  reviewer: [
    {
      id: 'app2',
      applicationNumber: 'GACP-2025-003',
      farmerName: 'นางสาวมาลี สวนดอก',
      farmName: 'ฟาร์มสมุนไพรธรรมชาติ',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'สมุนไพรพื้นบ้าน',
    },
    {
      id: 'app3',
      applicationNumber: 'GACP-2025-004',
      farmerName: 'นายวิชัย เกษตรกร',
      farmName: 'สวนผักปลอดสาร',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'ผักสมุนไพร',
    },
  ],
  auditor: [
    {
      id: 'app4',
      applicationNumber: 'GACP-2025-001',
      farmerName: 'นายสมชาย ใจดี',
      farmName: 'ฟาร์มกัญชาอินทรีย์',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'กัญชาทางการแพทย์',
    },
  ],
  admin: [],
};

const mockNotifications = {
  farmer: [
    {
      id: 'n1',
      title: 'การรับรองในระหว่างการตรวจสอบ',
      message: 'คำขอรับรอง GACP-2025-001 อยู่ในระหว่างการตรวจสอบโดยผู้ตรวจ',
      type: 'info',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  reviewer: [
    {
      id: 'n2',
      title: 'คำขอใหม่ต้องตรวจสอบ',
      message: 'มีคำขอรับรอง 3 รายการรอการตรวจสอบ',
      type: 'warning',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ],
  auditor: [
    {
      id: 'n3',
      title: 'กำหนดการตรวจสอบภาคสนาม',
      message: 'มีการตรวจสอบภาคสนาม 2 แห่งในสัปดาห์หน้า',
      type: 'info',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  admin: [
    {
      id: 'n4',
      title: 'รายงานประจำเดือน',
      message: 'รายงานประจำเดือนกันยายน พร้อมแล้ว',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'n5',
      title: 'ระบบบำรุงรักษา',
      message: 'ระบบจะหยุดให้บริการเพื่อบำรุงรักษาในวันอาทิตย์',
      type: 'warning',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

/**
 * Get dashboard data based on user role
 */
router.get('/:role', (req, res) => {
  try {
    const { role } = req.params;
    const userRole =
      role === 'document_reviewer' || role === 'inspector' || role === 'staff'
        ? 'reviewer'
        : role === 'field_auditor' || role === 'approver'
          ? 'auditor'
          : role === 'super_admin' || role === 'system_admin'
            ? 'admin'
            : role;

    const dashboardData = {
      stats: mockStats[userRole] || mockStats.farmer,
      recentActivities: mockActivities[userRole] || [],
      applications: mockApplications[userRole] || [],
      notifications: mockNotifications[userRole] || [],
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * Get farmer-specific dashboard data
 */
router.get('/farmer/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const dashboardData = {
      stats: mockStats.farmer,
      recentActivities: mockActivities.farmer,
      applications: mockApplications.farmer,
      notifications: mockNotifications.farmer,
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Farmer dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch farmer dashboard data' });
  }
});

/**
 * Get reviewer dashboard data
 */
router.get('/reviewer', (req, res) => {
  try {
    const dashboardData = {
      stats: mockStats.reviewer,
      recentActivities: mockActivities.reviewer,
      applications: mockApplications.reviewer,
      notifications: mockNotifications.reviewer,
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Reviewer dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch reviewer dashboard data' });
  }
});

/**
 * Get auditor dashboard data
 */
router.get('/auditor', (req, res) => {
  try {
    const dashboardData = {
      stats: mockStats.auditor,
      recentActivities: mockActivities.auditor,
      applications: mockApplications.auditor,
      notifications: mockNotifications.auditor,
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Auditor dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch auditor dashboard data' });
  }
});

/**
 * Get admin dashboard data
 */
router.get('/admin', (req, res) => {
  try {
    const dashboardData = {
      stats: mockStats.admin,
      recentActivities: mockActivities.admin,
      applications: mockApplications.admin,
      notifications: mockNotifications.admin,
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Admin dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
});

/**
 * Get real-time system statistics
 */
router.get('/stats/realtime', (req, res) => {
  try {
    const stats = {
      totalApplications: 128,
      pendingReviews: 15,
      activeInspections: 5,
      recentLogins: 12,
      systemHealth: 'healthy',
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    logger.error('Realtime stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch realtime statistics' });
  }
});

module.exports = router;
