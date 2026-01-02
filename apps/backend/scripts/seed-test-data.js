/**
 * Seed Test Data for Staff Workflow Testing
 * Creates sample applications, audits for testing the workflow
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestData() {
    console.log('🌱 Seeding test data for workflow testing...\n');

    try {
        // 1. Create sample applications in different statuses
        const statuses = [
            { status: 'SUBMITTED', count: 3 },
            { status: 'PENDING_REVIEW', count: 2 },
            { status: 'DOCUMENT_APPROVED', count: 2 },
            { status: 'AWAITING_SCHEDULE', count: 2 },
            { status: 'AUDIT_SCHEDULED', count: 1 },
            { status: 'APPROVED', count: 5 },
        ];

        const plantTypes = ['กัญชา', 'กระท่อม', 'ขมิ้น', 'ขิง', 'กระชายดำ'];
        const provinces = ['เชียงใหม่', 'เชียงราย', 'ลำพูน', 'กรุงเทพ', 'ขอนแก่น'];
        let totalCreated = 0;

        for (const { status, count } of statuses) {
            for (let i = 0; i < count; i++) {
                const appNumber = `APP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
                const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
                const province = provinces[Math.floor(Math.random() * provinces.length)];

                await prisma.application.create({
                    data: {
                        applicationNumber: appNumber,
                        status: status,
                        applicationType: 'NEW',
                        data: {
                            applicantInfo: {
                                name: `เกษตรกร ทดสอบ ${i + 1}`,
                                firstName: 'ทดสอบ',
                                lastName: `หมายเลข${i + 1}`,
                                province: province
                            },
                            formData: {
                                plantId: plantType,
                                farmArea: Math.floor(Math.random() * 50) + 5
                            }
                        },
                        isDeleted: false
                    }
                });
                totalCreated++;
            }
        }

        console.log(`✅ Created ${totalCreated} test applications\n`);

        // 2. Create sample invoices
        const invoiceStatuses = ['pending', 'paid', 'overdue'];
        let invoicesCreated = 0;

        for (let i = 0; i < 10; i++) {
            const invoiceStatus = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
            await prisma.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${i}`,
                    status: invoiceStatus,
                    totalAmount: Math.floor(Math.random() * 15000) + 5000,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    paidAt: invoiceStatus === 'paid' ? new Date() : null,
                    isDeleted: false
                }
            });
            invoicesCreated++;
        }

        console.log(`✅ Created ${invoicesCreated} test invoices\n`);

        // Print summary
        const appCounts = await prisma.application.groupBy({
            by: ['status'],
            _count: true,
            where: { isDeleted: false }
        });

        console.log('📊 Application Summary:');
        appCounts.forEach(g => console.log(`   ${g.status}: ${g._count}`));

        const invoiceCounts = await prisma.invoice.groupBy({
            by: ['status'],
            _count: true,
            where: { isDeleted: false }
        });

        console.log('\n💰 Invoice Summary:');
        invoiceCounts.forEach(g => console.log(`   ${g.status}: ${g._count}`));

        console.log('\n🎉 Test data seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding test data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData();
