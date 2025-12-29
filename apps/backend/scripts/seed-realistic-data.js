/**
 * 🌱 Seed Realistic GACP Mock Data to MongoDB
 * ============================================
 *
 * Uses PRODUCTION Models (User, Application, Certificate)
 * Implements 3 Service Types: NEW, RENEW, SUBSTITUTE
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seedRealisticData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import Production Models
const User = require('../models/UserModel');
const Application = require('../models/ApplicationModel');
const Certificate = require('../models/CertificateModel');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_production';

console.log('🔌 Connecting to MongoDB...');
console.log(`📡 URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);

// ============================================================================
// 🎭 MOCK DATA GENERATORS
// ============================================================================

async function generateUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  return [
    {
      email: 'farmer@example.com',
      password: hashedPassword,
      role: 'FARMER',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phoneNumber: '081-111-2222',
      idCard: '1-5099-00123-45-6',
      laserCode: 'ME0-9988776-55',
      farmerType: 'INDIVIDUAL',
      status: 'ACTIVE',
      isEmailVerified: true
    },
    {
      email: 'farmer2@example.com',
      password: hashedPassword,
      role: 'FARMER',
      firstName: 'สมศรี',
      lastName: 'รักษ์ดิน',
      phoneNumber: '081-222-3333',
      idCard: '1-5799-00234-56-7',
      laserCode: 'ME0-1122334-55',
      farmerType: 'INDIVIDUAL',
      status: 'ACTIVE',
      isEmailVerified: true
    },
    {
      email: 'officer@example.com',
      password: hashedPassword,
      role: 'DTAM_ADMIN', // Changed to match UserModel Enum
      firstName: 'พิมพ์ใจ',
      lastName: 'ตรวจสอบ',
      phoneNumber: '081-333-4444',
      idCard: '1-1099-00345-67-8',
      laserCode: 'ME0-5555555-55',
      status: 'ACTIVE',
      isEmailVerified: true
    },
    {
      email: 'inspector@example.com',
      password: hashedPassword,
      role: 'INSPECTOR',
      firstName: 'วิชัย',
      lastName: 'ตรวจการ',
      phoneNumber: '081-444-5555',
      idCard: '1-1199-00456-78-9',
      laserCode: 'ME0-6666666-66',
      status: 'ACTIVE',
      isEmailVerified: true
    },
    {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN', // Changed to match UserModel Enum
      firstName: 'ผู้จัดการ',
      lastName: 'ระบบ',
      phoneNumber: '081-555-6666',
      idCard: '1-1010-00567-89-0',
      laserCode: 'ME0-7777777-77',
      status: 'ACTIVE',
      isEmailVerified: true
    },
  ];
}

function generateApplications(users) {
  const farmer1 = users.find(u => u.email === 'farmer@example.com');
  const farmer2 = users.find(u => u.email === 'farmer2@example.com');

  // Helper to generate App No
  const genAppNo = (prefix) => `REQ-2568-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  return [
    // 1. APPROVED (NEW) - ยื่นคำขอใหม่ (สำเร็จ)
    {
      applicationNumber: genAppNo(),
      farmerId: farmer1._id,
      status: 'CERTIFIED',
      forms: { form09: true, form10: true, form11: true },
      data: {
        requestType: 'NEW',
        certificationType: 'CULTIVATION',
        objective: 'COMMERCIAL_DOMESTIC',
        applicantType: 'INDIVIDUAL',
        applicantInfo: {
          name: `${farmer1.firstName} ${farmer1.lastName}`,
          idCard: farmer1.idCard,
          address: farmer1.address || '123 หมู่ 1 เชียงใหม่',
          mobile: farmer1.phoneNumber,
          email: farmer1.email
        },
        siteInfo: {
          areaType: 'GREENHOUSE',
          address: '123/45 หมู่ 5 ถนนเชียงใหม่-ลำปาง',
          titleDeedNo: 'NS4-12345',
          coordinates: '18.7883, 98.9853'
        },
        formData: {
          farmName: 'ฟาร์มกัญชาเชียงใหม่ออร์แกนิค', // Legacy/Display support
          cropType: 'Cannabis Sativa',
          province: 'เชียงใหม่'
        }
      },
      payment: {
        phase1: { status: 'PAID', amount: 5000, paidAt: new Date() },
        phase2: { status: 'PAID', amount: 25000, paidAt: new Date() }
      },
      audit: {
        result: 'PASS',
        scheduledDate: new Date()
      }
    },

    // 2. REVIEW_PENDING (RENEW) - ต่ออายุ (รอตรวจสอบ)
    {
      applicationNumber: genAppNo(),
      farmerId: farmer2._id,
      status: 'REVIEW_PENDING',
      forms: { form09: true, form10: true },
      data: {
        requestType: 'RENEW',  // <--- KEY REQUIREMENT
        certificationType: 'CULTIVATION',
        objective: 'RESEARCH',
        applicantType: 'INDIVIDUAL',
        applicantInfo: {
          name: `${farmer2.firstName} ${farmer2.lastName}`,
          idCard: farmer2.idCard,
          mobile: farmer2.phoneNumber,
          email: farmer2.email
        },
        siteInfo: {
          areaType: 'INDOOR',
          address: '456/78 เชียงราย',
          titleDeedNo: 'NS4-99887'
        },
        formData: {
          farmName: 'ฟาร์มกัญชาเชียงราย',
          cropType: 'Cannabis Indica',
          province: 'เชียงราย'
        }
      }
    },

    // 3. PAYMENT_1_PENDING (SUBSTITUTE) - ออกใบแทน (รอจ่ายเงิน)
    {
      applicationNumber: genAppNo(),
      farmerId: farmer1._id,
      status: 'PAYMENT_1_PENDING',
      data: {
        requestType: 'SUBSTITUTE', // <--- KEY REQUIREMENT
        certificationType: 'CULTIVATION',
        objective: 'COMMERCIAL_EXPORT',
        applicantType: 'INDIVIDUAL',
        applicantInfo: {
          name: `${farmer1.firstName} ${farmer1.lastName}`,
          idCard: farmer1.idCard,
          mobile: farmer1.phoneNumber,
          email: farmer1.email
        },
        siteInfo: {
          areaType: 'OUTDOOR',
          address: '777 ลำปาง'
        },
        formData: {
          farmName: 'ฟาร์มกัญชาลำปาง',
          reason: 'Lost original certificate'
        }
      }
    },

    // 4. AUDIT_SCHEDULED (NEW) - ยื่นใหม่ (รอตรวจ)
    {
      applicationNumber: genAppNo(),
      farmerId: farmer2._id,
      status: 'AUDIT_SCHEDULED',
      data: {
        requestType: 'NEW',
        certificationType: 'PROCESSING',
        objective: 'COMMERCIAL_DOMESTIC',
        applicantType: 'INDIVIDUAL',
        applicantInfo: {
          name: `${farmer2.firstName} ${farmer2.lastName}`,
          idCard: farmer2.idCard,
          mobile: farmer2.phoneNumber,
          email: farmer2.email
        },
        siteInfo: {
          areaType: 'INDOOR',
          address: '999 น่าน'
        }
      },
      payment: {
        phase1: { status: 'PAID', amount: 5000, paidAt: new Date() },
        phase2: { status: 'PAID', amount: 25000, paidAt: new Date() }
      },
      audit: {
        scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
      }
    },

    // 5. DRAFT (NEW)
    {
      applicationNumber: genAppNo(),
      farmerId: farmer1._id,
      status: 'DRAFT',
      data: {
        requestType: 'NEW',
        applicantType: 'INDIVIDUAL'
      }
    }
  ];
}

async function generateCertificate(app, users) {
  const farmer = users.find(u => u._id.equals(app.farmerId));

  // Extract info from nested data or fallback
  const farmName = app.data.formData?.farmName || 'Unknown Farm';
  const province = app.data.formData?.province || 'Bangkok';

  return {
    certificateNumber: `GACP-2025-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    verificationCode: Math.random().toString(36).substring(7).toUpperCase(),
    qrData: `https://gacp.dtam.go.th/verify/${app._id}`,
    applicationId: app._id,
    farmId: `FARM-${String(Math.floor(Math.random() * 999))}`,
    userId: farmer._id, // Use MongoDB ObjectId for API queries
    siteName: farmName, // Add siteName for frontend display
    plantType: app.data?.formData?.cropType || 'Cannabis', // Add plantType for frontend
    farmName: farmName,
    farmerName: `${farmer.firstName} ${farmer.lastName}`,
    location: {
      province: province,
      district: 'เมือง',
      subDistrict: 'ในเมือง',
      address: app.data.siteInfo?.address || 'N/A'
    },
    cropType: app.data?.formData?.cropType || 'Cannabis',
    farmSize: 10,
    standardId: 'GACP-2024',
    standardName: 'Good Agricultural and Collection Practices',
    score: 95,
    status: 'active',
    issuedDate: new Date(),
    expiryDate: new Date(Date.now() + 31536000000 * 3), // 3 Years
    issuedBy: 'DTAM Director'
  };
}

// ============================================================================
// 🚀 SEED FUNCTION
// ============================================================================

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding (Production Models)...\n');

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
    // Use unordered insert to skip duplicate errors if any (though we cleared first)
    const users = await User.insertMany(usersData, { ordered: false });
    console.log(`✅ Created ${users.length} users`);

    // Create applications
    console.log('📝 Creating applications (with NEW, RENEW, SUBSTITUTE)...');
    const appsData = generateApplications(users);
    const applications = await Application.insertMany(appsData, { ordered: false });
    console.log(`✅ Created ${applications.length} applications`);

    // Log types for verification
    applications.forEach(app => {
      console.log(`   - ${app.applicationNumber}: ${app.data.requestType} (${app.status})`);
    });

    // Create Certificate for Certified App
    const certifiedApp = applications.find(a => a.status === 'CERTIFIED');
    if (certifiedApp) {
      console.log('📜 Creating certificate for CERTIFIED app...');
      const certData = await generateCertificate(certifiedApp, users);
      await Certificate.create(certData);
      console.log(`✅ Certificate created: ${certData.certificateNumber}`);
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

