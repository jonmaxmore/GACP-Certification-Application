/**
 * Seed Certification Standards Data
 * Seeds FDA, WHO, ASEAN, and Thai GACP standards into the database
 * 
 * Run: node prisma/seed-standards.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STANDARDS = [
    {
        code: 'THAI_GACP',
        name: 'Thai GACP',
        nameTH: 'มาตรฐาน GACP ไทย',
        description: 'Good Agricultural and Collection Practice for Medicinal Plants - Thailand Department of Thai Traditional and Alternative Medicine',
        version: 'v2024',
        isActive: true,
        sortOrder: 1,
        logoUrl: null,
        targetMarket: 'DOMESTIC',
        requirements: [
            { category: 'FACILITY', name: 'Farm Registration', nameTH: 'ทะเบียนฟาร์ม', isRequired: true },
            { category: 'DOCUMENTATION', name: 'Cultivation Records', nameTH: 'บันทึกการเพาะปลูก', isRequired: true },
            { category: 'PROCESS', name: 'Harvest Procedures', nameTH: 'ขั้นตอนการเก็บเกี่ยว', isRequired: true },
            { category: 'TESTING', name: 'Quality Testing', nameTH: 'การตรวจสอบคุณภาพ', isRequired: true },
            { category: 'DOCUMENTATION', name: 'Traceability Records', nameTH: 'บันทึกการตรวจสอบย้อนกลับ', isRequired: true },
        ]
    },
    {
        code: 'FDA',
        name: 'FDA GMP/GAP',
        nameTH: 'มาตรฐาน FDA สหรัฐอเมริกา',
        description: 'US Food and Drug Administration Good Manufacturing Practice for Dietary Supplements (21 CFR Part 111)',
        version: 'CFR-21-111',
        isActive: true,
        sortOrder: 2,
        logoUrl: null,
        targetMarket: 'USA',
        requirements: [
            { category: 'FACILITY', name: 'Master Manufacturing Record', nameTH: 'บันทึกการผลิตหลัก', isRequired: true },
            { category: 'FACILITY', name: 'Batch Production Record', nameTH: 'บันทึกการผลิตแต่ละรุ่น', isRequired: true },
            { category: 'PROCESS', name: 'Component Specifications', nameTH: 'ข้อกำหนดส่วนประกอบ', isRequired: true },
            { category: 'TESTING', name: 'Identity Testing', nameTH: 'การทดสอบอัตลักษณ์', isRequired: true },
            { category: 'TESTING', name: 'Contaminant Testing', nameTH: 'การทดสอบสารปนเปื้อน', isRequired: true },
            { category: 'DOCUMENTATION', name: 'Complaint Records', nameTH: 'บันทึกการร้องเรียน', isRequired: true },
            { category: 'DOCUMENTATION', name: 'Returned Product Records', nameTH: 'บันทึกสินค้าคืน', isRequired: true },
        ]
    },
    {
        code: 'WHO',
        name: 'WHO GACP',
        nameTH: 'มาตรฐาน WHO',
        description: 'World Health Organization Guidelines on Good Agricultural and Collection Practices for Medicinal Plants',
        version: 'v2003',
        isActive: true,
        sortOrder: 3,
        logoUrl: null,
        targetMarket: 'GLOBAL',
        requirements: [
            { category: 'FACILITY', name: 'Site Selection', nameTH: 'การเลือกพื้นที่ปลูก', isRequired: true },
            { category: 'PROCESS', name: 'Seeds and Propagation', nameTH: 'เมล็ดพันธุ์และการขยายพันธุ์', isRequired: true },
            { category: 'PROCESS', name: 'Cultivation', nameTH: 'การเพาะปลูก', isRequired: true },
            { category: 'PROCESS', name: 'Irrigation', nameTH: 'การชลประทาน', isRequired: true },
            { category: 'PROCESS', name: 'Harvest', nameTH: 'การเก็บเกี่ยว', isRequired: true },
            { category: 'PROCESS', name: 'Post-harvest Processing', nameTH: 'การแปรรูปหลังเก็บเกี่ยว', isRequired: true },
            { category: 'TESTING', name: 'Quality Assurance', nameTH: 'การประกันคุณภาพ', isRequired: true },
        ]
    },
    {
        code: 'ASEAN',
        name: 'ASEAN GHP',
        nameTH: 'มาตรฐาน ASEAN',
        description: 'ASEAN Good Hygiene Practice for Traditional Medicines and Health Supplements',
        version: 'v2021',
        isActive: true,
        sortOrder: 4,
        logoUrl: null,
        targetMarket: 'ASEAN',
        requirements: [
            { category: 'FACILITY', name: 'Personnel Hygiene', nameTH: 'สุขอนามัยบุคลากร', isRequired: true },
            { category: 'FACILITY', name: 'Premises and Facilities', nameTH: 'สถานที่และอุปกรณ์', isRequired: true },
            { category: 'PROCESS', name: 'Production Control', nameTH: 'การควบคุมการผลิต', isRequired: true },
            { category: 'TESTING', name: 'Quality Control', nameTH: 'การควบคุมคุณภาพ', isRequired: true },
            { category: 'DOCUMENTATION', name: 'Product Recall', nameTH: 'การเรียกคืนสินค้า', isRequired: true },
        ]
    }
];

async function seedStandards() {
    console.log('🌱 Seeding Certification Standards...');

    for (const standardData of STANDARDS) {
        const { requirements, ...standard } = standardData;

        // Upsert Standard
        const created = await prisma.certificationStandard.upsert({
            where: { code: standard.code },
            update: standard,
            create: standard
        });

        console.log(`  ✅ ${created.code}: ${created.name}`);

        // Create Requirements
        for (let i = 0; i < requirements.length; i++) {
            const req = requirements[i];
            await prisma.standardRequirement.create({
                data: {
                    standardId: created.id,
                    category: req.category,
                    name: req.name,
                    nameTH: req.nameTH,
                    isRequired: req.isRequired,
                    sortOrder: i + 1
                }
            }).catch(() => {
                // Ignore duplicate errors on re-run
            });
        }
    }

    console.log('✅ Seeding complete!');
}

seedStandards()
    .catch(e => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
