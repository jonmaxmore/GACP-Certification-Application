/**
 * Quick Seed Script - Farmer + 1 Application
 * สร้าง user เกษตรกร 1 คน + ใบสมัคร 1 ใบเพื่อทดสอบ UI
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user-model');
const Application = require('../models/application');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development';

async function quickSeed() {
  try {
    console.log('🌱 Starting quick seed...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Farmer User
    const farmer = new User({
      email: 'farmer@gacp.th',
      password: 'demo1234', // Will be hashed automatically by model
      fullName: 'สมชาย ใจดี',
      phone: '081-234-5678',
      nationalId: '1234567890123',
      role: 'farmer',
      farmerType: 'individual',
      farmingExperience: 5,
      farmerId: {
        farmLocation: {
          province: 'เชียงใหม่',
          district: 'แม่ริม',
          subdistrict: 'ริมใต้',
          address: '123 หมู่ 5',
          latitude: 18.8826,
          longitude: 98.9191,
        },
        farmSize: 5.5,
        crops: ['กัญชา', 'กัญชง'],
        organicCertified: false,
      },
    });

    await farmer.save();
    console.log('✅ Created farmer user:', farmer.email);

    // Create Application (DRAFT state)
    const application = new Application({
      applicant: farmer._id,
      applicationNumber: `GACP-${Date.now()}`,
      currentState: 'DRAFT',
      currentStep: 1,
      farmInformation: {
        farmName: 'ฟาร์มกัญชาอินทรีย์สมชาย',
        location: {
          type: 'Point',
          coordinates: [98.9191, 18.8826],
          address: '123 หมู่ 5 ต.ริมใต้ อ.แม่ริม จ.เชียงใหม่',
          province: 'เชียงใหม่',
          district: 'แม่ริม',
          subdistrict: 'ริมใต้',
          postalCode: '50180',
        },
        farmSize: 5.5,
        landOwnership: 'owned',
        waterSource: 'well',
        soilType: 'clay',
      },
      cropInformation: [
        {
          cropType: 'cannabis_sativa',
          variety: 'Thai Stick',
          plantingMethod: 'direct_seeding',
          cultivationArea: 3.0,
          expectedYield: 500,
          harvestSeason: '2025-11-01T00:00:00.000Z',
          organicCertification: false,
        },
      ],
      documents: [],
    });

    await application.save();
    console.log('✅ Created application:', application.applicationNumber);

    // Create more demo users
    const officer = new User({
      email: 'officer@gacp.th',
      password: 'demo1234',
      fullName: 'สมหญิง จริงใจ',
      phone: '082-345-6789',
      nationalId: '2345678901234',
      role: 'dtam_officer',
      dtamOfficer: {
        department: 'GACP Certification',
        position: 'Senior Officer',
        workLocation: {
          province: 'เชียงใหม่',
          office: 'DTAM Chiang Mai Branch',
        },
      },
    });

    const inspector = new User({
      email: 'inspector@gacp.th',
      password: 'demo1234',
      fullName: 'สมศักดิ์ ละเอียด',
      phone: '083-456-7890',
      nationalId: '3456789012345',
      role: 'inspector',
      inspector: {
        licenseNumber: 'INSP-2025-001',
        specialization: ['cannabis', 'herbs'],
        certifications: ['WHO-GACP', 'ASEAN-GACP'],
        workArea: {
          provinces: ['เชียงใหม่', 'ลำพูน', 'ลำปาง'],
        },
      },
    });

    const admin = new User({
      email: 'admin@gacp.th',
      password: 'demo1234',
      fullName: 'ผู้ดูแลระบบ',
      phone: '084-567-8901',
      nationalId: '4567890123456',
      role: 'admin',
      permissions: ['all'],
    });

    await officer.save();
    await inspector.save();
    await admin.save();

    console.log('✅ Created all demo users');
    console.log('\n📋 Demo Accounts:');
    console.log('   Farmer:    farmer@gacp.th / demo1234');
    console.log('   Officer:   officer@gacp.th / demo1234');
    console.log('   Inspector: inspector@gacp.th / demo1234');
    console.log('   Admin:     admin@gacp.th / demo1234');

    console.log('\n🎉 Quick seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

quickSeed();
