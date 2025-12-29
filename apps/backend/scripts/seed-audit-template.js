/**
 * Seed GACP Audit Checklist Template
 * Creates the 14-category GACP checklist with items
 * Based on field_audit_system_design.md
 * 
 * Run: node scripts/seedAuditTemplate.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuditChecklistTemplate = require('../models/AuditChecklistTemplateModel');

// GACP Categories with items
const GACP_CATEGORIES = [
    {
        categoryCode: 'CAT01',
        name: 'General Information',
        nameTh: 'ข้อมูลทั่วไป',
        descriptionTh: 'ข้อมูลพื้นฐานของฟาร์มและผู้ประกอบการ',
        order: 1,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT01-001', title: 'Farm Registration', titleTh: 'ทะเบียนฟาร์ม', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT01-002', title: 'License Validity', titleTh: 'ใบอนุญาตถูกต้อง', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT01-003', title: 'GPS Coordinates Verified', titleTh: 'พิกัด GPS ถูกต้อง', checkType: 'GPS', requiresGPS: true },
            { itemCode: 'CAT01-004', title: 'Area Measurement', titleTh: 'พื้นที่ตรงตามที่ขอ', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT01-005', title: 'Farm Layout Map', titleTh: 'มีแผนผังฟาร์ม', checkType: 'PASS_FAIL', requiresPhoto: true },
        ],
    },
    {
        categoryCode: 'CAT02',
        name: 'Cultivation Site',
        nameTh: 'สถานที่เพาะปลูก',
        descriptionTh: 'สภาพแวดล้อมและสถานที่เพาะปลูก',
        order: 2,
        weight: 1.5,
        minimumScore: 80, // Zero Tolerance
        isZeroTolerance: true,
        items: [
            { itemCode: 'CAT02-001', title: 'Site Accessibility', titleTh: 'ทางเข้าออกสะดวก', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT02-002', title: 'Clear Boundary', titleTh: 'มีรั้วกั้นชัดเจน', checkType: 'PASS_FAIL', isCritical: true, isZeroTolerance: true },
            { itemCode: 'CAT02-003', title: 'No Contamination Risk', titleTh: 'ไม่มีแหล่งปนเปื้อนใกล้', checkType: 'PASS_FAIL', isCritical: true, isZeroTolerance: true },
            { itemCode: 'CAT02-004', title: 'Signage', titleTh: 'มีป้ายบอกชื่อฟาร์ม', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT02-005', title: 'CCTV Coverage', titleTh: 'มีกล้องวงจรปิดครอบคลุม', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT02-006', title: 'Access Control', titleTh: 'มีระบบควบคุมการเข้าออก', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT03',
        name: 'Water Supply',
        nameTh: 'แหล่งน้ำ',
        descriptionTh: 'คุณภาพและแหล่งน้ำสำหรับการเพาะปลูก',
        order: 3,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT03-001', title: 'Water Source Identified', titleTh: 'มีแหล่งน้ำชัดเจน', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT03-002', title: 'Water Quality Test', titleTh: 'มีผลตรวจคุณภาพน้ำ', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT03-003', title: 'Water Storage', titleTh: 'มีถังเก็บน้ำสำรอง', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT03-004', title: 'Irrigation System', titleTh: 'ระบบให้น้ำเหมาะสม', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT04',
        name: 'Seedling/Planting Material',
        nameTh: 'วัสดุเพาะปลูก',
        descriptionTh: 'แหล่งที่มาและคุณภาพของพันธุ์พืช',
        order: 4,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT04-001', title: 'Seed Source Record', titleTh: 'มีบันทึกแหล่งเมล็ดพันธุ์', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT04-002', title: 'Seed Quality Certificate', titleTh: 'มีใบรับรองคุณภาพ', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT04-003', title: 'Seed Storage', titleTh: 'การเก็บรักษาเมล็ดพันธุ์ถูกต้อง', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT04-004', title: 'Propagation Area', titleTh: 'มีพื้นที่เพาะกล้าแยก', checkType: 'PASS_FAIL', requiresPhoto: true },
        ],
    },
    {
        categoryCode: 'CAT05',
        name: 'Cultivation',
        nameTh: 'การเพาะปลูก',
        descriptionTh: 'กระบวนการเพาะปลูกและดูแลรักษา',
        order: 5,
        weight: 1.2,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT05-001', title: 'Planting Record', titleTh: 'มีบันทึกการปลูก', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT05-002', title: 'Growth Monitoring', titleTh: 'มีการติดตามการเจริญเติบโต', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT05-003', title: 'Fertilizer Record', titleTh: 'มีบันทึกการใส่ปุ๋ย', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT05-004', title: 'Fertilizer Storage', titleTh: 'การเก็บปุ๋ยถูกต้อง', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT05-005', title: 'Organic Fertilizer Use', titleTh: 'ใช้ปุ๋ยอินทรีย์ (ถ้ามี)', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT05-006', title: 'Soil Analysis', titleTh: 'มีผลวิเคราะห์ดิน', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT06',
        name: 'Pest Control',
        nameTh: 'การป้องกันศัตรูพืช',
        descriptionTh: 'การจัดการศัตรูพืชและโรค',
        order: 6,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT06-001', title: 'Pest Control Plan', titleTh: 'มีแผนการป้องกันศัตรูพืช', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT06-002', title: 'Pesticide Record', titleTh: 'มีบันทึกการใช้ยา (ถ้ามี)', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT06-003', title: 'Chemical Storage', titleTh: 'การเก็บสารเคมีถูกต้อง', checkType: 'PASS_FAIL', isCritical: true, requiresPhoto: true },
            { itemCode: 'CAT06-004', title: 'IPM Implementation', titleTh: 'มีการจัดการศัตรูพืชแบบผสมผสาน', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT07',
        name: 'Harvest',
        nameTh: 'การเก็บเกี่ยว',
        descriptionTh: 'ขั้นตอนและวิธีการเก็บเกี่ยว',
        order: 7,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT07-001', title: 'Harvest SOP', titleTh: 'มี SOP การเก็บเกี่ยว', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT07-002', title: 'Harvest Record', titleTh: 'มีบันทึกการเก็บเกี่ยว', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT07-003', title: 'Clean Tools', titleTh: 'อุปกรณ์สะอาด', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT07-004', title: 'Batch Identification', titleTh: 'มีการระบุ Lot/Batch', checkType: 'PASS_FAIL', isCritical: true },
        ],
    },
    {
        categoryCode: 'CAT08',
        name: 'Post-Harvest',
        nameTh: 'หลังการเก็บเกี่ยว',
        descriptionTh: 'การจัดการผลผลิตหลังเก็บเกี่ยว',
        order: 8,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT08-001', title: 'Processing Area', titleTh: 'มีพื้นที่แปรรูปแยก', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT08-002', title: 'Drying Method', titleTh: 'วิธีการอบแห้งเหมาะสม', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT08-003', title: 'Processing SOP', titleTh: 'มี SOP การแปรรูป', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT08-004', title: 'Quality Check', titleTh: 'มีการตรวจคุณภาพ', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT09',
        name: 'Storage',
        nameTh: 'การเก็บรักษา',
        descriptionTh: 'การเก็บรักษาผลผลิต',
        order: 9,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT09-001', title: 'Storage Room', titleTh: 'มีห้องเก็บแยก', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT09-002', title: 'Temperature Control', titleTh: 'มีการควบคุมอุณหภูมิ', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT09-003', title: 'Humidity Control', titleTh: 'มีการควบคุมความชื้น', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT09-004', title: 'FIFO System', titleTh: 'ใช้ระบบ FIFO', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT09-005', title: 'Stock Record', titleTh: 'มีบันทึกสต๊อก', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT10',
        name: 'Transport',
        nameTh: 'การขนส่ง',
        descriptionTh: 'การขนส่งผลผลิต',
        order: 10,
        weight: 0.8,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT10-001', title: 'Transport Plan', titleTh: 'มีแผนการขนส่ง', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT10-002', title: 'Vehicle Condition', titleTh: 'ยานพาหนะสะอาด', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT10-003', title: 'Transport Record', titleTh: 'มีบันทึกการขนส่ง', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT11',
        name: 'Quality Assurance',
        nameTh: 'การประกันคุณภาพ',
        descriptionTh: 'ระบบประกันคุณภาพ',
        order: 11,
        weight: 1.5,
        minimumScore: 80, // Zero Tolerance
        isZeroTolerance: true,
        items: [
            { itemCode: 'CAT11-001', title: 'QA System', titleTh: 'มีระบบ QA', checkType: 'PASS_FAIL', isCritical: true, isZeroTolerance: true },
            { itemCode: 'CAT11-002', title: 'Lab Test Results', titleTh: 'มีผลตรวจห้องปฏิบัติการ', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT11-003', title: 'Traceability System', titleTh: 'มีระบบตามสอบย้อนกลับ', checkType: 'PASS_FAIL', isCritical: true, isZeroTolerance: true },
            { itemCode: 'CAT11-004', title: 'Complaint Handling', titleTh: 'มีระบบรับเรื่องร้องเรียน', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT11-005', title: 'Quality Manual', titleTh: 'มีคู่มือคุณภาพ', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT12',
        name: 'Personnel',
        nameTh: 'บุคลากร',
        descriptionTh: 'การจัดการบุคลากร',
        order: 12,
        weight: 0.8,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT12-001', title: 'Personnel Training', titleTh: 'มีการอบรมพนักงาน', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT12-002', title: 'Training Record', titleTh: 'มีบันทึกการอบรม', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT12-003', title: 'PPE Available', titleTh: 'มีอุปกรณ์ป้องกันตัว', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT12-004', title: 'Health Check', titleTh: 'มีการตรวจสุขภาพพนักงาน', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT13',
        name: 'Documentation',
        nameTh: 'เอกสาร',
        descriptionTh: 'ระบบเอกสารและบันทึก',
        order: 13,
        weight: 1,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT13-001', title: 'SOP Available', titleTh: 'มี SOP ครบถ้วน', checkType: 'PASS_FAIL', isCritical: true },
            { itemCode: 'CAT13-002', title: 'Record Keeping', titleTh: 'การจัดเก็บเอกสารเป็นระบบ', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT13-003', title: 'Document Control', titleTh: 'มีการควบคุมเอกสาร', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT13-004', title: 'Retention Period', titleTh: 'เก็บเอกสารตามระยะเวลา', checkType: 'PASS_FAIL' },
        ],
    },
    {
        categoryCode: 'CAT14',
        name: 'Environment',
        nameTh: 'สิ่งแวดล้อม',
        descriptionTh: 'การจัดการสิ่งแวดล้อม',
        order: 14,
        weight: 0.8,
        minimumScore: 0,
        items: [
            { itemCode: 'CAT14-001', title: 'Waste Management', titleTh: 'มีการจัดการขยะ', checkType: 'PASS_FAIL', requiresPhoto: true },
            { itemCode: 'CAT14-002', title: 'No Pollution', titleTh: 'ไม่ก่อมลพิษ', checkType: 'PASS_FAIL' },
            { itemCode: 'CAT14-003', title: 'Environmental Plan', titleTh: 'มีแผนจัดการสิ่งแวดล้อม', checkType: 'PASS_FAIL' },
        ],
    },
];

async function seedAuditTemplate() {
    try {
        // Connect to database
        const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_dev';
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB');

        // Check if template already exists
        const existingTemplate = await AuditChecklistTemplate.findOne({
            templateCode: 'GACP-FULL-2025',
        });

        if (existingTemplate) {
            console.log('Template already exists. Updating...');
            existingTemplate.categories = GACP_CATEGORIES;
            existingTemplate.updatedAt = new Date();
            await existingTemplate.save();
            console.log(`Updated template: ${existingTemplate.templateCode}`);
        } else {
            // Create FULL template
            const fullTemplate = new AuditChecklistTemplate({
                templateCode: 'GACP-FULL-2025',
                name: 'GACP Full Audit Checklist 2025',
                nameTh: 'รายการตรวจ GACP ฉบับเต็ม ปี 2568',
                description: 'Complete GACP audit checklist for initial certification',
                descriptionTh: 'รายการตรวจประเมิน GACP ครบถ้วนสำหรับการขอรับรองใหม่',
                version: '1.0',
                templateType: 'FULL',
                plantType: 'ALL',
                passThreshold: 90,
                zeroToleranceThreshold: 80,
                categories: GACP_CATEGORIES,
                isActive: true,
                effectiveFrom: new Date('2025-01-01'),
            });

            await fullTemplate.save();
            console.log(`Created template: ${fullTemplate.templateCode}`);
            console.log(`Total categories: ${fullTemplate.categories.length}`);
            console.log(`Total items: ${fullTemplate.totalItems}`);
        }

        // Create QUICK template (25 items for renewal)
        const quickItems = GACP_CATEGORIES.map(cat => ({
            ...cat,
            items: cat.items.filter(item => item.isCritical || item.isZeroTolerance),
        })).filter(cat => cat.items.length > 0);

        const existingQuick = await AuditChecklistTemplate.findOne({
            templateCode: 'GACP-QUICK-2025',
        });

        if (!existingQuick) {
            const quickTemplate = new AuditChecklistTemplate({
                templateCode: 'GACP-QUICK-2025',
                name: 'GACP Quick Audit Checklist 2025',
                nameTh: 'รายการตรวจ GACP ฉบับย่อ ปี 2568',
                description: 'Quick audit checklist for annual surveillance',
                descriptionTh: 'รายการตรวจประเมิน GACP ฉบับย่อสำหรับตรวจประจำปี',
                version: '1.0',
                templateType: 'QUICK',
                plantType: 'ALL',
                passThreshold: 90,
                zeroToleranceThreshold: 80,
                categories: quickItems,
                isActive: true,
                effectiveFrom: new Date('2025-01-01'),
            });

            await quickTemplate.save();
            console.log(`Created template: ${quickTemplate.templateCode}`);
            console.log(`Total items: ${quickTemplate.totalItems}`);
        }

        console.log('\n✅ Audit template seeding completed!');
    } catch (error) {
        console.error('Error seeding audit template:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    seedAuditTemplate();
}

module.exports = { seedAuditTemplate, GACP_CATEGORIES };

