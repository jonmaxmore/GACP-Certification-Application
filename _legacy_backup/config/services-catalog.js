/**
 * GACP Platform - Main Services Definition
 * กำหนดบริการหลักทั้งหมดของแพลตฟอร์ม
 *
 * @version 2.0.0
 * @date October 21, 2025
 */

/**
 * Main Services Catalog
 * รายการบริการหลัก 6 อย่าง
 */
const MAIN_SERVICES = {
  // 1. ระบบสมาชิกและ SSO
  AUTH_SSO: {
    id: 'AUTH-SSO-001',
    name: 'Authentication & Single Sign-On System',
    nameTH: 'ระบบสมาชิกและการยืนยันตัวตน (SSO)',
    type: 'CORE_INFRASTRUCTURE',
    status: 'PRODUCTION',
    standalone: false,
    modules: [
      'apps/backend/modules/auth-farmer/',
      'apps/backend/modules/auth-dtam/',
      'apps/backend/modules/user-management/'
    ],
    apiEndpoints: ['/api/auth/*', '/api/users/*'],
    features: [
      'Single Sign-On (SSO)',
      'JWT Authentication',
      'Role-based Access Control',
      'Multi-factor Authentication',
      'Session Management'
    ],
    usedBy: 'ALL_SERVICES',
    dependencies: []
  },

  // 2. ระบบยื่นเอกสารขอรับรอง GACP
  GACP_APPLICATION: {
    id: 'GACP-APP-002',
    name: 'GACP Cannabis Certification Application System',
    nameTH: 'ระบบยื่นเอกสารเพื่อขอรับรองการปลูกกัญชา',
    type: 'CORE_BUSINESS',
    status: 'PRODUCTION',
    standalone: false,
    modules: [
      'apps/backend/modules/application-workflow/',
      'apps/backend/modules/cannabis-survey/',
      'apps/backend/modules/document-management/',
      'business-logic/gacp-workflow-engine.js'
    ],
    portals: {
      farmer: 'apps/farmer-portal/',
      admin: 'apps/admin-portal/'
    },
    apiEndpoints: ['/api/applications/*', '/api/cannabis-survey/*'],
    features: [
      '7-Step Application Wizard',
      'Document Upload & Management',
      'Multi-stage Approval Workflow',
      'Payment Integration',
      'Notification System',
      'Status Tracking'
    ],
    workflow: ['เกษตรกรยื่นคำขอ', 'ตรวจสอบเอกสาร', 'ตรวจสอบภาคสนาม', 'อนุมัติ', 'ออกใบรับรอง'],
    usedBy: ['CERTIFICATE_MANAGEMENT'],
    dependencies: ['AUTH-SSO-001', 'FARM-MGT-003', 'TRACK-004']
  },

  // 3. ระบบบริหารจัดการฟาร์ม
  FARM_MANAGEMENT: {
    id: 'FARM-MGT-003',
    name: 'Farm Management & Monitoring System',
    nameTH: 'ระบบบริหารจัดการฟาร์ม',
    type: 'STANDALONE_WITH_CONTROL',
    status: 'PRODUCTION',
    standalone: true,
    hasBackendControl: true,
    modules: [
      'apps/backend/modules/farm-management/',
      'business-logic/gacp-business-rules-engine.js',
      'business-logic/gacp-field-inspection-system.js'
    ],
    apiEndpoints: ['/api/farm-management/*', '/api/farms/*'],
    features: [
      'Farm Registration & Profile',
      'Crop Management (Cannabis)',
      'Cultivation Cycle Tracking',
      'GAP/GACP Compliance',
      'Inspection Scheduling',
      'Digital Documentation',
      'Backend Control Panel'
    ],
    controlFeatures: {
      farmer: 'จัดการฟาร์มของตัวเอง (Standalone)',
      admin: 'ควบคุม/ตรวจสอบฟาร์มทั้งหมด (Backend Control)'
    },
    usedBy: ['GACP-APP-002', 'TRACK-004'],
    dependencies: ['AUTH-SSO-001', 'TRACK-004']
  },

  // 4. ระบบ Track and Trace
  TRACK_AND_TRACE: {
    id: 'TRACK-004',
    name: 'Cannabis Track and Trace System',
    nameTH: 'ระบบติดตามสินค้า (Track and Trace)',
    type: 'CORE_BUSINESS',
    status: 'PRODUCTION',
    standalone: false,
    modules: ['apps/backend/modules/track-trace/', 'business-logic/gacp-workflow-engine.js'],
    apiEndpoints: ['/api/track-trace/*', '/api/traceability/*'],
    features: [
      'Seed-to-Sale Tracking',
      'QR Code Generation & Scanning',
      'Batch/Lot Tracking',
      'Real-time Location Tracking',
      'Supply Chain Visibility',
      'Product Genealogy',
      'Compliance Reporting'
    ],
    trackingFlow: ['เมล็ด', 'การปลูก', 'การเก็บเกี่ยว', 'การแปรรูป', 'การจำหน่าย'],
    usedBy: ['GACP-APP-002', 'FARM-MGT-003'],
    dependencies: ['AUTH-SSO-001', 'FARM-MGT-003']
  },

  // 5. ระบบสำรวจและแบบสอบถาม
  SURVEY_SYSTEM: {
    id: 'SURVEY-005',
    name: 'GACP Survey & Questionnaire System',
    nameTH: 'ระบบทำเอกสารแบบสอบถาม',
    type: 'STANDALONE',
    status: 'PRODUCTION',
    standalone: true,
    hasBackendControl: false,
    modules: ['business-logic/gacp-survey-system.js', 'apps/backend/modules/survey-system/'],
    apiEndpoints: ['/api/survey/*', '/api/surveys-4regions/*'],
    features: [
      '7-Step Survey Wizard',
      '4-Region Analytics (เหนือ, อีสาน, กลาง, ใต้)',
      'Multi-language (Thai/English)',
      'Pre-built Templates',
      'Real-time Analytics',
      'Response Management',
      'Data Export (Excel, PDF, CSV)',
      'Custom Survey Builder'
    ],
    regions: ['เหนือ', 'อีสาน', 'กลาง', 'ใต้'],
    standaloneNote: '100% Standalone - ไม่เชื่อมต่อกับระบบอื่น ใช้เฉพาะ Auth สำหรับ Login',
    usedBy: [],
    dependencies: ['AUTH-SSO-001'] // Only for login
  },

  // 6. ระบบเปรียบเทียบมาตรฐาน GACP
  STANDARDS_COMPARISON: {
    id: 'STD-CMP-006',
    name: 'GACP Multi-Standards Comparison System',
    nameTH: 'ระบบเปรียบเทียบมาตรฐาน GACP',
    type: 'STANDALONE',
    status: 'PRODUCTION',
    standalone: true,
    hasBackendControl: false,
    modules: [
      'business-logic/gacp-standards-comparison-system.js',
      'apps/backend/modules/standards-comparison/'
    ],
    apiEndpoints: ['/api/standards-comparison/*', '/api/standards/*'],
    supportedStandards: [
      { code: 'GACP', name: 'Good Agricultural and Collection Practices' },
      { code: 'GAP', name: 'Good Agricultural Practices (Thailand)' },
      { code: 'Organic', name: 'Organic Agriculture Standards' },
      { code: 'EU-GMP', name: 'European Good Manufacturing Practice' },
      { code: 'USP', name: 'United States Pharmacopeia' },
      { code: 'WHO-GMP', name: 'World Health Organization GMP' },
      { code: 'ISO-22000', name: 'Food Safety Management' },
      { code: 'HACCP', name: 'Hazard Analysis Critical Control Points' }
    ],
    features: [
      'Multi-Standards Comparison',
      'Gap Analysis',
      'Implementation Roadmap',
      'Cost Analysis',
      'Compliance Assessment',
      'Certification Planning',
      'Requirements Mapping'
    ],
    standaloneNote: '100% Standalone - ไม่เชื่อมต่อกับระบบอื่น ใช้เฉพาะ Auth สำหรับ Login',
    usedBy: [],
    dependencies: ['AUTH-SSO-001'] // Only for login
  }
};

/**
 * Supporting Services
 * บริการเสริม
 */
const SUPPORTING_SERVICES = {
  CERTIFICATE_MANAGEMENT: {
    id: 'CERT-007',
    name: 'Certificate Management System',
    nameTH: 'ระบบออกใบรับรอง',
    type: 'SUPPORTING',
    modules: ['apps/certificate-portal/', 'apps/backend/modules/certificate-management/'],
    dependencies: ['GACP-APP-002']
  },
  NOTIFICATION: {
    id: 'NOTIFY-008',
    name: 'Notification System',
    nameTH: 'ระบบแจ้งเตือน',
    type: 'SUPPORTING',
    modules: ['apps/backend/modules/notification/'],
    usedBy: 'ALL_SERVICES'
  },
  REPORTING: {
    id: 'REPORT-009',
    name: 'Reporting & Analytics System',
    nameTH: 'ระบบรายงานและวิเคราะห์',
    type: 'SUPPORTING',
    modules: ['apps/backend/modules/reporting-analytics/'],
    usedBy: 'ALL_SERVICES'
  },
  SOP_WIZARD: {
    id: 'SOP-010',
    name: 'SOP Wizard System',
    nameTH: 'ระบบ SOP Wizard',
    type: 'SUPPORTING',
    modules: ['business-logic/gacp-sop-wizard-system.js'],
    dependencies: ['FARM-MGT-003']
  }
};

/**
 * Service Types
 */
const SERVICE_TYPES = {
  CORE_INFRASTRUCTURE: 'Core Infrastructure Service',
  CORE_BUSINESS: 'Core Business Service',
  STANDALONE: 'Standalone Service',
  STANDALONE_WITH_CONTROL: 'Standalone Service with Backend Control',
  SUPPORTING: 'Supporting Service'
};

/**
 * Service Status
 */
const SERVICE_STATUS = {
  PRODUCTION: 'Production Ready',
  BETA: 'Beta Testing',
  DEVELOPMENT: 'In Development',
  DEPRECATED: 'Deprecated'
};

/**
 * Helper Functions
 */

/**
 * Get all main services
 */
function getAllMainServices() {
  return Object.values(MAIN_SERVICES);
}

/**
 * Get service by ID
 */
function getServiceById(serviceId) {
  const allServices = { ...MAIN_SERVICES, ...SUPPORTING_SERVICES };
  return Object.values(allServices).find(service => service.id === serviceId);
}

/**
 * Get standalone services
 */
function getStandaloneServices() {
  return Object.values(MAIN_SERVICES).filter(service => service.standalone === true);
}

/**
 * Get services by type
 */
function getServicesByType(type) {
  const allServices = { ...MAIN_SERVICES, ...SUPPORTING_SERVICES };
  return Object.values(allServices).filter(service => service.type === type);
}

/**
 * Get service dependencies
 */
function getServiceDependencies(serviceId) {
  const service = getServiceById(serviceId);
  if (!service || !service.dependencies) return [];

  return service.dependencies.map(depId => getServiceById(depId)).filter(Boolean);
}

/**
 * Get services that use this service
 */
function getServiceConsumers(serviceId) {
  const allServices = { ...MAIN_SERVICES, ...SUPPORTING_SERVICES };
  return Object.values(allServices).filter(
    service =>
      service.usedBy === 'ALL_SERVICES' ||
      (Array.isArray(service.usedBy) && service.usedBy.includes(serviceId))
  );
}

/**
 * Generate service summary
 */
function generateServiceSummary() {
  const mainServices = getAllMainServices();
  const supportingServices = Object.values(SUPPORTING_SERVICES);

  return {
    summary: {
      totalMainServices: mainServices.length,
      totalSupportingServices: supportingServices.length,
      totalServices: mainServices.length + supportingServices.length,
      standaloneServices: getStandaloneServices().length,
      productionServices: mainServices.filter(s => s.status === 'PRODUCTION').length
    },
    mainServices: mainServices.map(service => ({
      id: service.id,
      name: service.name,
      nameTH: service.nameTH,
      type: service.type,
      status: service.status,
      standalone: service.standalone,
      features: service.features?.length || 0
    })),
    supportingServices: supportingServices.map(service => ({
      id: service.id,
      name: service.name,
      nameTH: service.nameTH,
      type: service.type
    }))
  };
}

/**
 * Display service catalog
 */
function displayServiceCatalog() {
  console.log('\n🏢 GACP Platform - Main Services Catalog');
  console.log('═'.repeat(60));

  console.log('\n📋 Main Services (บริการหลัก):');
  Object.values(MAIN_SERVICES).forEach((service, index) => {
    const standalone = service.standalone ? ' [STANDALONE]' : '';
    console.log(`\n${index + 1}. ${service.nameTH}${standalone}`);
    console.log(`   ID: ${service.id}`);
    console.log(`   Type: ${service.type}`);
    console.log(`   Status: ${service.status}`);
    if (service.features) {
      console.log(`   Features: ${service.features.length} features`);
    }
  });

  console.log('\n\n🔧 Supporting Services (บริการเสริม):');
  Object.values(SUPPORTING_SERVICES).forEach((service, index) => {
    console.log(`${index + 7}. ${service.nameTH} (${service.id})`);
  });

  const summary = generateServiceSummary();
  console.log('\n\n📊 Summary:');
  console.log(`   Total Main Services: ${summary.summary.totalMainServices}`);
  console.log(`   Standalone Services: ${summary.summary.standaloneServices}`);
  console.log(`   Supporting Services: ${summary.summary.totalSupportingServices}`);
  console.log(`   Total Services: ${summary.summary.totalServices}`);

  console.log('\n═'.repeat(60));
}

// Export
module.exports = {
  MAIN_SERVICES,
  SUPPORTING_SERVICES,
  SERVICE_TYPES,
  SERVICE_STATUS,
  getAllMainServices,
  getServiceById,
  getStandaloneServices,
  getServicesByType,
  getServiceDependencies,
  getServiceConsumers,
  generateServiceSummary,
  displayServiceCatalog
};

// Display catalog if run directly
if (require.main === module) {
  displayServiceCatalog();
}
