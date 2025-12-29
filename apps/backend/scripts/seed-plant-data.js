/**
 * Seed Script: PlantMaster and DocumentRequirement Data
 * Populates 6 GACP medicinal plants with complete specifications
 * Run: node scripts/seedPlantData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const PlantMaster = require('../models/PlantMasterModel');
const DocumentRequirement = require('../models/DocumentRequirementModel');

// ===================== PLANT DATA =====================

const plantsData = [
    // ==================== GROUP A: HIGH CONTROL ====================
    {
        plantId: 'CAN',
        nameEN: 'Cannabis',
        nameTH: 'กัญชา',
        group: 'HIGH_CONTROL',
        requiresStrictLicense: true,
        units: ['ต้น', 'Tree'],
        plantParts: ['ช่อดอก (Flower)', 'ใบ (Leaf)', 'เมล็ด (Seed)', 'ลำต้น (Stem)'],
        securityRequirements: [
            { label: 'CCTV 24/7 (Medical Grade)', required: true, description: 'กล้องวงจรปิดบันทึก 24 ชม.' },
            { label: 'รั้วแข็งแรง ≥2 เมตร', required: true, description: 'High Security Fence' },
            { label: 'สมุดลงชื่อเข้า-ออก', required: true, description: 'Access Log Book' },
            { label: 'Biometric/Key Card Access', required: true, description: 'ระบบสแกนนิ้ว/บัตร' },
            { label: 'เจ้าหน้าที่รักษาความปลอดภัย', required: false, description: 'Security Guard (Optional)' },
        ],
        productionInputs: [
            { fieldName: 'treeCount', fieldType: 'number', label: 'จำนวนต้น (Tree Count)', required: true },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (Harvest Cycle)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./รอบ)', required: true },
            { fieldName: 'licenseType', fieldType: 'select', label: 'ประเภทใบอนุญาต', required: true, options: ['BhT 11', 'BhT 13', 'BhT 16'] },
            { fieldName: 'licenseNumber', fieldType: 'text', label: 'เลขที่ใบอนุญาต', required: true },
            { fieldName: 'licenseExpiry', fieldType: 'text', label: 'วันหมดอายุใบอนุญาต', required: true },
        ],
        sortOrder: 1,
        isActive: true,
    },
    {
        plantId: 'KRA',
        nameEN: 'Kratom',
        nameTH: 'กระท่อม',
        group: 'HIGH_CONTROL',
        requiresStrictLicense: true,
        units: ['ต้น', 'Tree'],
        plantParts: ['ใบสด (Fresh Leaf)', 'ใบแห้ง (Dried Leaf)', 'ผง (Powder)'],
        securityRequirements: [
            { label: 'CCTV', required: true, description: 'กล้องวงจรปิด' },
            { label: 'รั้วแข็งแรง', required: true, description: 'Security Fence' },
            { label: 'สมุดลงชื่อเข้า-ออก', required: true, description: 'Access Log Book' },
            { label: 'Biometric Access', required: false, description: 'ระบบสแกนนิ้ว (Optional)' },
        ],
        productionInputs: [
            { fieldName: 'treeCount', fieldType: 'number', label: 'จำนวนต้น (Tree Count)', required: true },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (ทุก 2-3 เดือน)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./รอบ)', required: true },
            { fieldName: 'licenseNumber', fieldType: 'text', label: 'เลขที่ใบอนุญาต', required: true },
        ],
        sortOrder: 2,
        isActive: true,
    },

    // ==================== GROUP B: GENERAL HERBS ====================
    {
        plantId: 'TUR',
        nameEN: 'Turmeric',
        nameTH: 'ขมิ้นชัน',
        group: 'GENERAL',
        requiresStrictLicense: false,
        units: ['ไร่', 'Rai'],
        plantParts: ['เหง้า (Rhizome)', 'ผง (Powder)', 'น้ำมันหอมระเหย (Essential Oil)'],
        securityRequirements: [
            { label: 'รั้วกั้นสัตว์', required: true, description: 'Animal Barrier' },
            { label: 'ป้ายบ่งเขตแปลง', required: true, description: 'Zoning Markers' },
            { label: 'รั้วธรรมดา', required: false, description: 'Basic Fence (Optional)' },
        ],
        productionInputs: [
            { fieldName: 'areaSizeRai', fieldType: 'number', label: 'ขนาดพื้นที่ (ไร่)', required: true },
            { fieldName: 'seedlingPerRai', fieldType: 'number', label: 'จำนวนต้นพันธุ์ (กก./ไร่)', required: false },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (8-10 เดือน)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./ไร่/ปี)', required: true },
            { fieldName: 'hasGapCert', fieldType: 'checkbox', label: 'มีใบรับรอง GAP', required: false },
            { fieldName: 'hasOrganicCert', fieldType: 'checkbox', label: 'มีใบรับรอง Organic', required: false },
        ],
        sortOrder: 3,
        isActive: true,
    },
    {
        plantId: 'GIN',
        nameEN: 'Ginger',
        nameTH: 'ขิง',
        group: 'GENERAL',
        requiresStrictLicense: false,
        units: ['ไร่', 'Rai'],
        plantParts: ['เหง้าสด (Fresh Rhizome)', 'เหง้าแห้ง (Dried Rhizome)', 'ผง (Powder)'],
        securityRequirements: [
            { label: 'รั้วกั้นสัตว์', required: true, description: 'Animal Barrier' },
            { label: 'ป้ายบ่งเขตแปลง', required: true, description: 'Zoning Markers' },
        ],
        productionInputs: [
            { fieldName: 'areaSizeRai', fieldType: 'number', label: 'ขนาดพื้นที่ (ไร่)', required: true },
            { fieldName: 'seedlingPerRai', fieldType: 'number', label: 'จำนวนต้นพันธุ์ (กก./ไร่)', required: false },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (8-12 เดือน)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./ไร่/ปี)', required: true },
        ],
        sortOrder: 4,
        isActive: true,
    },
    {
        plantId: 'GAL',
        nameEN: 'Black Galingale',
        nameTH: 'กระชายดำ',
        group: 'GENERAL',
        requiresStrictLicense: false,
        units: ['ไร่', 'Rai'],
        plantParts: ['เหง้า (Rhizome)', 'ผง (Powder)', 'สารสกัด (Extract)'],
        securityRequirements: [
            { label: 'รั้วกั้นสัตว์', required: true, description: 'Animal Barrier' },
            { label: 'ป้ายบ่งเขตแปลง', required: true, description: 'Zoning Markers' },
        ],
        productionInputs: [
            { fieldName: 'areaSizeRai', fieldType: 'number', label: 'ขนาดพื้นที่ (ไร่)', required: true },
            { fieldName: 'bulbsPerRai', fieldType: 'number', label: 'จำนวนหัว/ไร่', required: false },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (10-12 เดือน)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./ไร่/ปี)', required: true },
        ],
        sortOrder: 5,
        isActive: true,
    },
    {
        plantId: 'PLA',
        nameEN: 'Plai',
        nameTH: 'ไพล',
        group: 'GENERAL',
        requiresStrictLicense: false,
        units: ['ไร่', 'Rai'],
        plantParts: ['เหง้าสด (Fresh Rhizome)', 'น้ำมันหอมระเหย (Essential Oil)', 'สารสกัด (Extract)'],
        securityRequirements: [
            { label: 'รั้วกั้นสัตว์', required: true, description: 'Animal Barrier' },
            { label: 'ป้ายบ่งเขตแปลง', required: true, description: 'Zoning Markers' },
        ],
        productionInputs: [
            { fieldName: 'areaSizeRai', fieldType: 'number', label: 'ขนาดพื้นที่ (ไร่)', required: true },
            { fieldName: 'seedlingPerRai', fieldType: 'number', label: 'จำนวนต้นพันธุ์ (กก./ไร่)', required: false },
            { fieldName: 'harvestCycle', fieldType: 'text', label: 'รอบการเก็บเกี่ยว (8-12 เดือน)', required: true },
            { fieldName: 'estimatedYield', fieldType: 'number', label: 'ผลผลิตโดยประมาณ (กก./ไร่/ปี)', required: true },
        ],
        sortOrder: 6,
        isActive: true,
    },
];

// ===================== DOCUMENT REQUIREMENTS DATA =====================

const documentsData = [
    // ==================== CANNABIS (CAN) DOCUMENTS ====================
    // Route A: New Application
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'BhT License', documentNameTH: 'ใบอนุญาต BhT 11/13/16', category: 'LICENSE', isRequired: true, sortOrder: 1 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง/พิกัด GPS', category: 'PROPERTY', isRequired: true, sortOrder: 3 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Building Plan', documentNameTH: 'แบบแปลนโรงเรือน', category: 'PROPERTY', isRequired: true, sortOrder: 4 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Exterior Photos', documentNameTH: 'ภาพถ่ายภายนอก', category: 'PROPERTY', isRequired: true, sortOrder: 5 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Interior Photos', documentNameTH: 'ภาพถ่ายภายใน', category: 'PROPERTY', isRequired: true, sortOrder: 6 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'CCTV Plan', documentNameTH: 'แผนผังกล้อง CCTV', category: 'COMPLIANCE', isRequired: true, sortOrder: 7 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Security Measures', documentNameTH: 'มาตรการรักษาความปลอดภัย', category: 'COMPLIANCE', isRequired: true, sortOrder: 8 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'SOP Document', documentNameTH: 'เอกสาร SOP', category: 'COMPLIANCE', isRequired: true, sortOrder: 9, description: 'ต้องครอบคลุม: เพาะ, เก็บเกี่ยว, ทำแห้ง, ทริม, บรรจุ, จัดเก็บ, กำจัดของเสีย' },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Production Plan', documentNameTH: 'แผนการผลิต', category: 'COMPLIANCE', isRequired: true, sortOrder: 10 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'CP/CCP Analysis', documentNameTH: 'ตารางวิเคราะห์ CP/CCP', category: 'COMPLIANCE', isRequired: true, sortOrder: 11 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Lab Result - Soil', documentNameTH: 'ผลตรวจวัสดุปลูก', category: 'OTHER', isRequired: true, sortOrder: 12 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Lab Result - Water', documentNameTH: 'ผลตรวจน้ำ', category: 'OTHER', isRequired: true, sortOrder: 13 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Lab Result - Flower', documentNameTH: 'ผลตรวจช่อดอก', category: 'OTHER', isRequired: true, sortOrder: 14 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'GACP Training Cert', documentNameTH: 'หนังสือรับรองอบรม GACP', category: 'OTHER', isRequired: true, sortOrder: 15 },
    { plantId: 'CAN', requestTypes: ['NEW'], documentName: 'Video Link', documentNameTH: 'ลิงค์วิดีโอสถานที่', category: 'OTHER', isRequired: false, sortOrder: 16 },

    // Route B: Renewal
    { plantId: 'CAN', requestTypes: ['RENEW'], documentName: 'Original Certificate', documentNameTH: 'ต้นฉบับใบรับรองเก่า', category: 'LICENSE', isRequired: true, sortOrder: 1 },
    { plantId: 'CAN', requestTypes: ['RENEW'], documentName: 'Performance Report', documentNameTH: 'รายงานผลการดำเนินงาน', category: 'COMPLIANCE', isRequired: true, sortOrder: 2 },
    { plantId: 'CAN', requestTypes: ['RENEW'], documentName: 'Updated SOP', documentNameTH: 'SOP ฉบับปรับปรุง (ถ้ามี)', category: 'COMPLIANCE', isRequired: false, sortOrder: 3 },
    { plantId: 'CAN', requestTypes: ['RENEW'], documentName: 'Current Lab Results', documentNameTH: 'ผลตรวจวิเคราะห์ปัจจุบัน', category: 'OTHER', isRequired: true, sortOrder: 4 },

    // Route C: Replacement (AMEND)
    { plantId: 'CAN', requestTypes: ['AMEND'], documentName: 'Police Report', documentNameTH: 'ใบแจ้งความ (กรณีสูญหาย)', category: 'OTHER', isRequired: false, sortOrder: 1, description: 'จำเป็นเฉพาะกรณีสูญหาย' },
    { plantId: 'CAN', requestTypes: ['AMEND'], documentName: 'Damaged Cert Photo', documentNameTH: 'ภาพถ่ายใบรับรองเดิม (กรณีชำรุด)', category: 'OTHER', isRequired: false, sortOrder: 2, description: 'จำเป็นเฉพาะกรณีชำรุด' },

    // ==================== KRATOM (KRA) DOCUMENTS ====================
    // Similar to Cannabis
    { plantId: 'KRA', requestTypes: ['NEW'], documentName: 'License', documentNameTH: 'ใบอนุญาต', category: 'LICENSE', isRequired: true, sortOrder: 1 },
    { plantId: 'KRA', requestTypes: ['NEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'KRA', requestTypes: ['NEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง', category: 'PROPERTY', isRequired: true, sortOrder: 3 },
    { plantId: 'KRA', requestTypes: ['NEW'], documentName: 'SOP', documentNameTH: 'เอกสาร SOP', category: 'COMPLIANCE', isRequired: true, sortOrder: 4 },
    { plantId: 'KRA', requestTypes: ['NEW'], documentName: 'Strain Certificate', documentNameTH: 'หนังสือรับรองสายพันธุ์', category: 'OTHER', isRequired: true, sortOrder: 5 },

    // ==================== TURMERIC (TUR) DOCUMENTS ====================
    { plantId: 'TUR', requestTypes: ['NEW', 'RENEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 1 },
    { plantId: 'TUR', requestTypes: ['NEW', 'RENEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'TUR', requestTypes: ['NEW', 'RENEW'], documentName: 'Basic SOP', documentNameTH: 'SOP พื้นฐาน', category: 'COMPLIANCE', isRequired: true, sortOrder: 3 },
    { plantId: 'TUR', requestTypes: ['NEW'], documentName: 'Soil/Water Analysis', documentNameTH: 'ผลวิเคราะห์ดิน/น้ำ', category: 'OTHER', isRequired: false, sortOrder: 4 },
    { plantId: 'TUR', requestTypes: ['NEW', 'RENEW'], documentName: 'GAP Certificate', documentNameTH: 'ใบรับรอง GAP', category: 'OTHER', isRequired: false, sortOrder: 5, description: 'Optional - if available' },
    { plantId: 'TUR', requestTypes: ['NEW', 'RENEW'], documentName: 'Organic Certificate', documentNameTH: 'ใบรับรอง Organic', category: 'OTHER', isRequired: false, sortOrder: 6, description: 'Optional - if available' },

    // ==================== GINGER (GIN) DOCUMENTS ====================
    { plantId: 'GIN', requestTypes: ['NEW', 'RENEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 1 },
    { plantId: 'GIN', requestTypes: ['NEW', 'RENEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'GIN', requestTypes: ['NEW', 'RENEW'], documentName: 'Basic SOP', documentNameTH: 'SOP พื้นฐาน', category: 'COMPLIANCE', isRequired: true, sortOrder: 3 },
    { plantId: 'GIN', requestTypes: ['NEW', 'RENEW'], documentName: 'GAP Certificate', documentNameTH: 'ใบรับรอง GAP', category: 'OTHER', isRequired: false, sortOrder: 4 },

    // ==================== BLACK GALINGALE (GAL) DOCUMENTS ====================
    { plantId: 'GAL', requestTypes: ['NEW', 'RENEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 1 },
    { plantId: 'GAL', requestTypes: ['NEW', 'RENEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'GAL', requestTypes: ['NEW', 'RENEW'], documentName: 'Basic SOP', documentNameTH: 'SOP พื้นฐาน', category: 'COMPLIANCE', isRequired: true, sortOrder: 3 },

    // ==================== PLAI (PLA) DOCUMENTS ====================
    { plantId: 'PLA', requestTypes: ['NEW', 'RENEW'], documentName: 'Land Title/Lease', documentNameTH: 'โฉนด/สัญญาเช่า', category: 'PROPERTY', isRequired: true, sortOrder: 1 },
    { plantId: 'PLA', requestTypes: ['NEW', 'RENEW'], documentName: 'Site Map', documentNameTH: 'แผนที่ตั้ง', category: 'PROPERTY', isRequired: true, sortOrder: 2 },
    { plantId: 'PLA', requestTypes: ['NEW', 'RENEW'], documentName: 'Basic SOP', documentNameTH: 'SOP พื้นฐาน', category: 'COMPLIANCE', isRequired: true, sortOrder: 3 },
];

// ===================== SEED FUNCTIONS =====================

async function seedPlants() {
    console.log('🌱 Seeding PlantMaster data...');

    for (const plant of plantsData) {
        const existing = await PlantMaster.findOne({ plantId: plant.plantId });
        if (existing) {
            await PlantMaster.updateOne({ plantId: plant.plantId }, { $set: plant });
            console.log(`  ✅ Updated: ${plant.plantId} - ${plant.nameTH}`);
        } else {
            await PlantMaster.create(plant);
            console.log(`  ✅ Created: ${plant.plantId} - ${plant.nameTH}`);
        }
    }

    console.log(`🌱 Seeded ${plantsData.length} plants`);
}

async function seedDocuments() {
    console.log('📄 Seeding DocumentRequirement data...');

    // Clear existing and re-seed
    await DocumentRequirement.deleteMany({});

    await DocumentRequirement.insertMany(documentsData);

    console.log(`📄 Seeded ${documentsData.length} document requirements`);
}

async function main() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        await seedPlants();
        await seedDocuments();

        console.log('\n🎉 Seed completed successfully!');

        // Summary
        const plantCount = await PlantMaster.countDocuments();
        const docCount = await DocumentRequirement.countDocuments();
        console.log(`\n📊 Summary:`);
        console.log(`   Plants: ${plantCount}`);
        console.log(`   Documents: ${docCount}`);

    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
        process.exit(0);
    }
}

main();

