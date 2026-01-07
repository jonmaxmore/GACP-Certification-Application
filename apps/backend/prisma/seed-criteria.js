/**
 * Seed Supplementary Criteria
 * Run: node prisma/seed-criteria.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const criteriaData = [
    // หมวดการทดสอบและตรวจสอบ
    {
        code: 'CONTAMINANT_TEST',
        category: 'TESTING',
        categoryTH: 'การทดสอบและตรวจสอบ',
        label: 'ผลตรวจสารปนเปื้อน',
        description: 'รายงานการตรวจสารปนเปื้อน เช่น โลหะหนัก ยาฆ่าแมลง',
        icon: '🧪',
        sortOrder: 1,
        inputType: 'checkbox'
    },
    {
        code: 'IDENTITY_TEST',
        category: 'TESTING',
        categoryTH: 'การทดสอบและตรวจสอบ',
        label: 'ผลตรวจอัตลักษณ์',
        description: 'รายงานยืนยันชนิดพืช/สายพันธุ์',
        icon: '🧪',
        sortOrder: 2,
        inputType: 'checkbox'
    },
    {
        code: 'MOISTURE_TEST',
        category: 'TESTING',
        categoryTH: 'การทดสอบและตรวจสอบ',
        label: 'ผลตรวจความชื้น',
        description: 'รายงานวัดความชื้นผลิตภัณฑ์',
        icon: '🧪',
        sortOrder: 3,
        inputType: 'checkbox'
    },

    // หมวดขั้นตอนการผลิต
    {
        code: 'POST_HARVEST_RECORD',
        category: 'PRODUCTION',
        categoryTH: 'ขั้นตอนการผลิต',
        label: 'บันทึกขั้นตอนหลังเก็บเกี่ยว',
        description: 'เอกสารกระบวนการอบแห้ง บรรจุ เก็บรักษา',
        icon: '⚙️',
        sortOrder: 1,
        inputType: 'checkbox'
    },
    {
        code: 'MANUFACTURING_RECORD',
        category: 'PRODUCTION',
        categoryTH: 'ขั้นตอนการผลิต',
        label: 'บันทึกการผลิตหลัก',
        description: 'เอกสาร Master Manufacturing Record',
        icon: '⚙️',
        sortOrder: 2,
        inputType: 'checkbox'
    },

    // หมวดแหล่งที่มาเมล็ดพันธุ์
    {
        code: 'SEED_SOURCE_DOC',
        category: 'SEED_SOURCE',
        categoryTH: 'แหล่งที่มาเมล็ดพันธุ์',
        label: 'เอกสารแหล่งที่มาเมล็ดพันธุ์',
        description: 'ใบรับรองแหล่งที่มา/ใบเสร็จซื้อเมล็ด',
        icon: '🌱',
        sortOrder: 1,
        inputType: 'checkbox'
    },
    {
        code: 'PROPAGATION_RECORD',
        category: 'SEED_SOURCE',
        categoryTH: 'แหล่งที่มาเมล็ดพันธุ์',
        label: 'บันทึกการขยายพันธุ์',
        description: 'เอกสารวิธีการขยายพันธุ์',
        icon: '🌱',
        sortOrder: 2,
        inputType: 'checkbox'
    },

    // หมวดสุขอนามัยและความปลอดภัย  
    {
        code: 'PERSONNEL_HYGIENE',
        category: 'HYGIENE',
        categoryTH: 'สุขอนามัยและความปลอดภัย',
        label: 'เอกสารสุขอนามัยพนักงาน',
        description: 'ใบรับรองสุขภาพ/การอบรมสุขอนามัย',
        icon: '🛡️',
        sortOrder: 1,
        inputType: 'checkbox'
    },
    {
        code: 'RECALL_PROCEDURE',
        category: 'HYGIENE',
        categoryTH: 'สุขอนามัยและความปลอดภัย',
        label: 'แผนการเรียกคืนสินค้า',
        description: 'เอกสารขั้นตอนเรียกคืนสินค้า',
        icon: '🛡️',
        sortOrder: 2,
        inputType: 'checkbox'
    },
    {
        code: 'COMPLAINT_RECORD',
        category: 'HYGIENE',
        categoryTH: 'สุขอนามัยและความปลอดภัย',
        label: 'ระบบบันทึกข้อร้องเรียน',
        description: 'เอกสารขั้นตอนรับเรื่องร้องเรียน',
        icon: '🛡️',
        sortOrder: 3,
        inputType: 'checkbox'
    }
];

async function seedCriteria() {
    console.log('🌱 Seeding supplementary criteria...');

    for (const criterion of criteriaData) {
        try {
            await prisma.supplementaryCriterion.upsert({
                where: { code: criterion.code },
                update: criterion,
                create: criterion
            });
            console.log(`  ✓ ${criterion.code}: ${criterion.label}`);
        } catch (error) {
            console.error(`  ✗ ${criterion.code}: ${error.message}`);
        }
    }

    console.log('✅ Seeding complete!');

    const count = await prisma.supplementaryCriterion.count();
    console.log(`📊 Total criteria: ${count}`);
}

seedCriteria()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
