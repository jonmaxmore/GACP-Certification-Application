/**
 * 🌱 Seed Realistic GACP Mock Data to MongoDB
 * ============================================
 *
 * สร้าง Mock Data ที่สมจริงและใส่ลงใน MongoDB จริง
 * Mock Data ผ่าน GACP Workflow 8 steps แบบสมบูรณ์
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-realistic-data.js
 *
 * Features:
 * - 5 Users (Farmer x2, Officer, Inspector, Admin)
 * - 5 Applications (ครบทุก workflow state)
 * - 1 Certificate (สำหรับ application ที่ APPROVED)
 * - Realistic relationships และ timestamps
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority&ssl=true&authSource=admin';

console.log('🔌 Connecting to MongoDB...');
console.log(`📡 URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);

// ============================================================================
// 📊 SCHEMAS (ตรงตาม Backend Models)
// ============================================================================

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['FARMER', 'DTAM_OFFICER', 'INSPECTOR', 'ADMIN'], required: true },
  name: { type: String, required: true },
  phoneNumber: String,
  nationalId: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema({
  // Basic Info
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: String,
  farmName: String,
  farmSize: Number,
  farmAddress: String,
  province: String,
  district: String,
  subDistrict: String,
  postalCode: String,
  latitude: Number,
  longitude: Number,
  cropType: String,
  estimatedYield: Number,
  email: String,
  phoneNumber: String,
  idCardNumber: String,
  experience: Number,
  previousCertification: String,
  remarks: String,

  // Workflow
  workflowState: {
    type: String,
    enum: [
      'DRAFT',
      'SUBMITTED',
      'PAYMENT_PENDING',
      'DOCUMENT_REVIEW',
      'DOCUMENT_APPROVED',
      'DOCUMENT_REJECTED',
      'DOCUMENT_REVISION',
      'AUTO_APPROVED',
      'INSPECTION_PAYMENT_PENDING',
      'INSPECTION_SCHEDULED',
      'VDO_CALL_COMPLETED',
      'ON_SITE_REQUIRED',
      'ON_SITE_COMPLETED',
      'PENDING_APPROVAL',
      'APPROVED',
      'REJECTED',
      'CERTIFICATE_ISSUED',
    ],
    default: 'DRAFT',
  },
  currentStep: { type: Number, default: 1 },

  // Documents
  documents: {
    idCard: { url: String, status: String, uploadedAt: Date },
    houseRegistration: { url: String, status: String, uploadedAt: Date },
    landDeed: { url: String, status: String, uploadedAt: Date },
    farmMap: { url: String, status: String, uploadedAt: Date },
    waterQuality: { url: String, status: String, uploadedAt: Date },
  },

  // Review Data (Officer)
  reviewData: {
    officerId: mongoose.Schema.Types.ObjectId,
    officerName: String,
    completenessScore: Number,
    accuracyScore: Number,
    riskLevel: String,
    comments: String,
    decision: String,
    reviewedAt: Date,
  },

  // Inspection Data (Inspector)
  inspectionData: {
    inspectorId: mongoose.Schema.Types.ObjectId,
    inspectorName: String,
    type: String,
    scheduledDate: Date,
    completedDate: Date,
    vdoCallData: {
      checklistItems: [{ id: Number, label: String, checked: Boolean }],
      decision: String,
      notes: String,
      estimatedScore: Number,
    },
    onSiteData: {
      ccpScores: [
        {
          id: Number,
          name: String,
          score: Number,
          maxScore: Number,
          notes: String,
        },
      ],
      totalScore: Number,
      passStatus: String,
      finalNotes: String,
      photos: [String],
    },
  },

  // Approval Data (Admin)
  approvalData: {
    adminId: mongoose.Schema.Types.ObjectId,
    adminName: String,
    decision: String,
    notes: String,
    approvedAt: Date,
  },

  // Certificate
  certificateId: mongoose.Schema.Types.ObjectId,

  // Payments
  payments: [
    {
      id: String,
      amount: Number,
      type: String,
      status: String,
      paidAt: Date,
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const certificateSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  certificateNumber: { type: String, required: true, unique: true },
  farmName: String,
  farmerName: String,
  province: String,
  cropType: String,
  farmSize: Number,
  issueDate: Date,
  expiryDate: Date,
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'REVOKED'], default: 'ACTIVE' },
  qrCode: String,
  pdfUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', userSchema);
const Application = mongoose.model('Application', applicationSchema);
const Certificate = mongoose.model('Certificate', certificateSchema);

// ============================================================================
// 🎭 MOCK DATA GENERATORS
// ============================================================================

async function generateUsers() {
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);

  return [
    {
      email: 'farmer@example.com',
      password: hashedPassword,
      role: 'FARMER',
      name: 'สมชาย ใจดี',
      phoneNumber: '081-111-2222',
      nationalId: '1-5099-00123-45-6',
      isActive: true,
    },
    {
      email: 'farmer2@example.com',
      password: hashedPassword,
      role: 'FARMER',
      name: 'สมศรี รักษ์ดิน',
      phoneNumber: '081-222-3333',
      nationalId: '1-5799-00234-56-7',
      isActive: true,
    },
    {
      email: 'officer@example.com',
      password: hashedPassword,
      role: 'DTAM_OFFICER',
      name: 'นางสาว พิมพ์ใจ ตรวจสอบ',
      phoneNumber: '081-333-4444',
      nationalId: '1-1099-00345-67-8',
      isActive: true,
    },
    {
      email: 'inspector@example.com',
      password: hashedPassword,
      role: 'INSPECTOR',
      name: 'นาย วิชัย ตรวจการ',
      phoneNumber: '081-444-5555',
      nationalId: '1-1199-00456-78-9',
      isActive: true,
    },
    {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'ผู้จัดการ ระบบ',
      phoneNumber: '081-555-6666',
      nationalId: '1-1010-00567-89-0',
      isActive: true,
    },
  ];
}

function generateApplications(users) {
  const farmer1 = users.find(u => u.email === 'farmer@example.com');
  const farmer2 = users.find(u => u.email === 'farmer2@example.com');
  const officer = users.find(u => u.email === 'officer@example.com');
  const inspector = users.find(u => u.email === 'inspector@example.com');
  const admin = users.find(u => u.email === 'admin@example.com');

  const now = Date.now();

  return [
    // Application 1: APPROVED (ผ่านครบทุก step)
    {
      farmerId: farmer1._id,
      farmerName: farmer1.name,
      farmName: 'ฟาร์มกัญชาเชียงใหม่ออร์แกนิค',
      farmSize: 25.5,
      farmAddress: '123/45 หมู่ 5 ถนนเชียงใหม่-ลำปาง',
      province: 'เชียงใหม่',
      district: 'สันทราย',
      subDistrict: 'แม่แฝก',
      postalCode: '50290',
      latitude: 18.7883,
      longitude: 98.9853,
      cropType: 'Cannabis Sativa',
      estimatedYield: 500,
      email: farmer1.email,
      phoneNumber: farmer1.phoneNumber,
      idCardNumber: farmer1.nationalId,
      experience: 5,
      previousCertification: 'GAP',
      remarks: 'ฟาร์มตัวอย่างที่ผ่านการรับรองแล้ว - ระบบปลูกแบบออร์แกนิค',

      workflowState: 'APPROVED',
      currentStep: 8,

      documents: {
        idCard: {
          url: '/uploads/id-card-001.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
        },
        houseRegistration: {
          url: '/uploads/house-001.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
        },
        landDeed: {
          url: '/uploads/land-001.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
        },
        farmMap: {
          url: '/uploads/map-001.jpg',
          status: 'APPROVED',
          uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
        },
        waterQuality: {
          url: '/uploads/water-001.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 60 * 24 * 60 * 60 * 1000),
        },
      },

      reviewData: {
        officerId: officer._id,
        officerName: officer.name,
        completenessScore: 5,
        accuracyScore: 5,
        riskLevel: 'low',
        comments: 'เอกสารครบถ้วน ถูกต้องทุกประการ',
        decision: 'APPROVED',
        reviewedAt: new Date(now - 55 * 24 * 60 * 60 * 1000),
      },

      inspectionData: {
        inspectorId: inspector._id,
        inspectorName: inspector.name,
        type: 'ON_SITE',
        scheduledDate: new Date(now - 30 * 24 * 60 * 60 * 1000),
        completedDate: new Date(now - 25 * 24 * 60 * 60 * 1000),
        vdoCallData: {
          checklistItems: [
            { id: 1, label: 'ตรวจสอบพื้นที่ปลูก', checked: true },
            { id: 2, label: 'ตรวจสอบระบบน้ำ', checked: true },
            { id: 3, label: 'ตรวจสอบโครงสร้าง', checked: true },
          ],
          decision: 'ON_SITE_REQUIRED',
          notes: 'ต้องลงพื้นที่เพิ่มเติม',
        },
        onSiteData: {
          ccpScores: [
            {
              id: 1,
              name: 'Seed Selection & Planting',
              score: 14,
              maxScore: 15,
              notes: 'เมล็ดพันธุ์มีคุณภาพดี',
            },
            { id: 2, name: 'Soil Management', score: 15, maxScore: 15, notes: 'ดินอุดมสมบูรณ์' },
            { id: 3, name: 'Pest Management', score: 14, maxScore: 15, notes: 'ใช้ IPM' },
            { id: 4, name: 'Harvesting', score: 14, maxScore: 15, notes: 'กระบวนการถูกต้อง' },
            { id: 5, name: 'Post-Harvest', score: 15, maxScore: 15, notes: 'ดีมาก' },
            { id: 6, name: 'Storage', score: 9, maxScore: 10, notes: 'อุณหภูมิเหมาะสม' },
            { id: 7, name: 'Record Keeping', score: 10, maxScore: 10, notes: 'บันทึกครบถ้วน' },
            { id: 8, name: 'Worker Safety', score: 5, maxScore: 5, notes: 'มาตรการครบ' },
          ],
          totalScore: 96,
          passStatus: 'PASS',
          finalNotes: 'ฟาร์มมีมาตรฐานสูงมาก แนะนำให้รับรอง ⭐⭐⭐⭐⭐',
          photos: ['photo1.jpg', 'photo2.jpg'],
        },
      },

      approvalData: {
        adminId: admin._id,
        adminName: admin.name,
        decision: 'APPROVED',
        notes: 'อนุมัติการรับรอง - คะแนน 96/100',
        approvedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
      },

      payments: [
        {
          id: 'pay-001',
          amount: 5000,
          type: 'APPLICATION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 58 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'pay-002',
          amount: 8000,
          type: 'INSPECTION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 35 * 24 * 60 * 60 * 1000),
        },
      ],

      createdAt: new Date(now - 65 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
    },

    // Application 2: PENDING_APPROVAL (รอ Admin)
    {
      farmerId: farmer2._id,
      farmerName: farmer2.name,
      farmName: 'ฟาร์มกัญชาเชียงราย',
      farmSize: 15.0,
      farmAddress: '456/78 หมู่ 3 ถนนพหลโยธิน',
      province: 'เชียงราย',
      district: 'เมือง',
      subDistrict: 'วังหิน',
      postalCode: '57000',
      latitude: 19.9105,
      longitude: 99.8406,
      cropType: 'Cannabis Indica',
      estimatedYield: 300,
      email: farmer2.email,
      phoneNumber: farmer2.phoneNumber,
      idCardNumber: farmer2.nationalId,
      experience: 3,
      previousCertification: 'ไม่มี',
      remarks: 'เริ่มปลูกใหม่',

      workflowState: 'PENDING_APPROVAL',
      currentStep: 7,

      documents: {
        idCard: {
          url: '/uploads/id-card-002.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        },
        houseRegistration: {
          url: '/uploads/house-002.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        },
        landDeed: {
          url: '/uploads/land-002.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        },
        farmMap: {
          url: '/uploads/map-002.jpg',
          status: 'APPROVED',
          uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        },
        waterQuality: {
          url: '/uploads/water-002.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
        },
      },

      reviewData: {
        officerId: officer._id,
        officerName: officer.name,
        completenessScore: 4,
        accuracyScore: 4,
        riskLevel: 'medium',
        comments: 'เอกสารครบถ้วน',
        decision: 'APPROVED',
        reviewedAt: new Date(now - 25 * 24 * 60 * 60 * 1000),
      },

      inspectionData: {
        inspectorId: inspector._id,
        inspectorName: inspector.name,
        type: 'VDO_CALL',
        scheduledDate: new Date(now - 10 * 24 * 60 * 60 * 1000),
        completedDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
        vdoCallData: {
          checklistItems: [
            { id: 1, label: 'ตรวจสอบพื้นที่ปลูก', checked: true },
            { id: 2, label: 'ตรวจสอบระบบน้ำ', checked: true },
            { id: 3, label: 'ตรวจสอบโครงสร้าง', checked: true },
          ],
          decision: 'SUFFICIENT',
          notes: 'ผ่าน VDO Call',
          estimatedScore: 85,
        },
      },

      payments: [
        {
          id: 'pay-003',
          amount: 5000,
          type: 'APPLICATION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 28 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'pay-004',
          amount: 8000,
          type: 'INSPECTION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 15 * 24 * 60 * 60 * 1000),
        },
      ],

      createdAt: new Date(now - 35 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },

    // Application 3: DOCUMENT_REVIEW (รอ Officer)
    {
      farmerId: farmer1._id,
      farmerName: farmer1.name,
      farmName: 'ฟาร์มกัญชาลำปาง',
      farmSize: 8.5,
      farmAddress: '789/12 หมู่ 7',
      province: 'ลำปาง',
      district: 'เกาะคา',
      subDistrict: 'ท่าผา',
      postalCode: '52130',
      latitude: 18.4,
      longitude: 99.5,
      cropType: 'Hybrid Strain',
      estimatedYield: 150,
      email: farmer1.email,
      phoneNumber: farmer1.phoneNumber,
      idCardNumber: farmer1.nationalId,
      experience: 5,
      previousCertification: 'GAP',
      remarks: 'ฟาร์มใหม่',

      workflowState: 'DOCUMENT_REVIEW',
      currentStep: 3,

      documents: {
        idCard: {
          url: '/uploads/id-card-003.pdf',
          status: 'PENDING',
          uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        },
        houseRegistration: {
          url: '/uploads/house-003.pdf',
          status: 'PENDING',
          uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        },
        landDeed: {
          url: '/uploads/land-003.pdf',
          status: 'PENDING',
          uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        },
        farmMap: {
          url: '/uploads/map-003.jpg',
          status: 'PENDING',
          uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        },
        waterQuality: {
          url: '/uploads/water-003.pdf',
          status: 'PENDING',
          uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        },
      },

      payments: [
        {
          id: 'pay-005',
          amount: 5000,
          type: 'APPLICATION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
        },
      ],

      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },

    // Application 4: INSPECTION_SCHEDULED (รอ Inspector)
    {
      farmerId: farmer2._id,
      farmerName: farmer2.name,
      farmName: 'ฟาร์มกัญชาน่าน',
      farmSize: 12.0,
      farmAddress: '321/55 หมู่ 2',
      province: 'น่าน',
      district: 'เมือง',
      subDistrict: 'บ่อ',
      postalCode: '55000',
      latitude: 18.7768,
      longitude: 100.7722,
      cropType: 'Cannabis Sativa',
      estimatedYield: 250,
      email: farmer2.email,
      phoneNumber: farmer2.phoneNumber,
      idCardNumber: farmer2.nationalId,
      experience: 3,
      previousCertification: 'ไม่มี',
      remarks: 'พร้อมรับการตรวจสอบ',

      workflowState: 'INSPECTION_SCHEDULED',
      currentStep: 6,

      documents: {
        idCard: {
          url: '/uploads/id-card-004.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
        },
        houseRegistration: {
          url: '/uploads/house-004.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
        },
        landDeed: {
          url: '/uploads/land-004.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
        },
        farmMap: {
          url: '/uploads/map-004.jpg',
          status: 'APPROVED',
          uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
        },
        waterQuality: {
          url: '/uploads/water-004.pdf',
          status: 'APPROVED',
          uploadedAt: new Date(now - 20 * 24 * 60 * 60 * 1000),
        },
      },

      reviewData: {
        officerId: officer._id,
        officerName: officer.name,
        completenessScore: 5,
        accuracyScore: 4,
        riskLevel: 'low',
        comments: 'เอกสารครบถ้วน',
        decision: 'APPROVED',
        reviewedAt: new Date(now - 15 * 24 * 60 * 60 * 1000),
      },

      inspectionData: {
        inspectorId: inspector._id,
        inspectorName: inspector.name,
        type: 'VDO_CALL',
        scheduledDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
      },

      payments: [
        {
          id: 'pay-006',
          amount: 5000,
          type: 'APPLICATION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 22 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'pay-007',
          amount: 8000,
          type: 'INSPECTION_FEE',
          status: 'PAID',
          paidAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
        },
      ],

      createdAt: new Date(now - 25 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
    },

    // Application 5: DRAFT (ยังไม่ส่ง)
    {
      farmerId: farmer1._id,
      farmerName: farmer1.name,
      farmName: 'ฟาร์มกัญชาพะเยา (ใหม่)',
      farmSize: 20.0,
      farmAddress: '555/99 หมู่ 8',
      province: 'พะเยา',
      district: '',
      subDistrict: '',
      postalCode: '',
      latitude: null,
      longitude: null,
      cropType: 'Cannabis Sativa',
      estimatedYield: 400,
      email: farmer1.email,
      phoneNumber: farmer1.phoneNumber,
      idCardNumber: farmer1.nationalId,
      experience: 5,
      previousCertification: '',
      remarks: '',

      workflowState: 'DRAFT',
      currentStep: 1,

      documents: {},

      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
    },
  ];
}

function generateCertificate(application) {
  return {
    applicationId: application._id,
    certificateNumber: `GACP-2025-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    farmName: application.farmName,
    farmerName: application.farmerName,
    province: application.province,
    cropType: application.cropType,
    farmSize: application.farmSize,
    issueDate: application.approvalData.approvedAt,
    expiryDate: new Date(
      new Date(application.approvalData.approvedAt).setFullYear(new Date().getFullYear() + 1),
    ),
    status: 'ACTIVE',
    qrCode: `https://gacp.example.com/verify/${application._id}`,
    pdfUrl: `/certificates/${application._id}.pdf`,
  };
}

// ============================================================================
// 🚀 SEED FUNCTION
// ============================================================================

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Application.deleteMany({});
    await Certificate.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create users
    console.log('👥 Creating users...');
    const usersData = await generateUsers();
    const users = await User.insertMany(usersData);
    console.log(`✅ Created ${users.length} users:`);
    users.forEach(u => console.log(`   - ${u.role}: ${u.email} (${u.name})`));
    console.log('');

    // Create applications
    console.log('📝 Creating applications...');
    const applicationsData = generateApplications(users);
    const applications = await Application.insertMany(applicationsData);
    console.log(`✅ Created ${applications.length} applications:`);
    applications.forEach(a =>
      console.log(`   - ${a.id || a._id}: ${a.farmName} (${a.workflowState})`),
    );
    console.log('');

    // Create certificate for approved application
    console.log('📜 Creating certificate...');
    const approvedApp = applications.find(a => a.workflowState === 'APPROVED');
    if (approvedApp) {
      const certData = generateCertificate(approvedApp);
      const certificate = await Certificate.create(certData);

      // Update application with certificate ID
      approvedApp.certificateId = certificate._id;
      approvedApp.workflowState = 'CERTIFICATE_ISSUED';
      await approvedApp.save();

      console.log(`✅ Created certificate: ${certificate.certificateNumber}`);
    }
    console.log('');

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Applications: ${applications.length}`);
    console.log(`   - Certificates: ${await Certificate.countDocuments()}`);
    console.log('');

    console.log('✅ Database seeding completed successfully!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error('\nError details:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
