const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Ensure DB connection string if not in env
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://gacp:gacp2024@localhost:5432/gacp_db';
}

async function main() {
    console.log('🌱 Seeding Staff & Test Data...');
    const hashedPassword = await bcrypt.hash('gacp2024', 10);

    try {
        // 1. Create Users (Parallel)
        console.log('...Upserting Users');
        const [reviewer, scheduler, auditor, farmer] = await Promise.all([
            prisma.user.upsert({
                where: { email: 'reviewer@dtam.go.th' },
                update: {},
                create: {
                    email: 'reviewer@dtam.go.th',
                    password: hashedPassword,
                    firstName: 'Somsak',
                    lastName: 'Reviewer',
                    role: 'REVIEWER_AUDITOR',
                    accountType: 'STAFF',
                    status: 'ACTIVE',
                    phoneNumber: '020001234'
                }
            }),
            prisma.user.upsert({
                where: { email: 'scheduler@dtam.go.th' },
                update: {},
                create: {
                    email: 'scheduler@dtam.go.th',
                    password: hashedPassword,
                    firstName: 'Somying',
                    lastName: 'Scheduler',
                    role: 'SCHEDULER',
                    accountType: 'STAFF',
                    status: 'ACTIVE'
                }
            }),
            prisma.user.upsert({
                where: { email: 'auditor@dtam.go.th' },
                update: {},
                create: {
                    email: 'auditor@dtam.go.th',
                    password: hashedPassword,
                    firstName: 'Somsak',
                    lastName: 'Auditor',
                    role: 'REVIEWER_AUDITOR',
                    accountType: 'STAFF',
                    status: 'ACTIVE'
                }
            }),
            prisma.user.upsert({
                where: { email: 'farmer_test@gacp.com' },
                update: {},
                create: {
                    email: 'farmer_test@gacp.com',
                    password: hashedPassword,
                    firstName: 'Somsak',
                    lastName: 'Farmer',
                    role: 'FARMER',
                    accountType: 'INDIVIDUAL',
                    status: 'ACTIVE'
                }
            })
        ]);

        // 2. Create Applications
        console.log('...Upserting Applications');

        // Define Scenarios
        const scenarios = [
            {
                appNum: 'APP-TEST-001',
                status: 'SUBMITTED',
                plantId: 'CAN',
                phase1Config: { phase1Status: 'PAID' }
            },
            {
                appNum: 'APP-TEST-SCHED-01',
                status: 'PENDING_SCHEDULE',
                plantId: 'KRA',
                phase1Config: { phase1Status: 'PAID', phase2Status: 'PAID' }
            },
            {
                appNum: 'APP-TEST-AUDIT-01',
                status: 'PENDING_AUDIT',
                plantId: 'TUR',
                phase1Config: { phase1Status: 'PAID', phase2Status: 'PAID' },
                auditorId: auditor.id
            }
        ];

        // Process Applications
        for (const scenario of scenarios) {
            await prisma.application.upsert({
                where: { applicationNumber: scenario.appNum },
                update: {
                    status: scenario.status,
                    auditorId: scenario.auditorId || undefined
                },
                create: {
                    applicationNumber: scenario.appNum,
                    farmerId: farmer.id,
                    status: scenario.status,
                    serviceType: 'new_application',
                    areaType: scenario.plantId === 'KRA' ? 'INDOOR' : 'OUTDOOR',
                    ...scenario.phase1Config,
                    formData: { plantId: scenario.plantId },
                    auditorId: scenario.auditorId
                }
            });
        }

        console.log('✅ Seeding Complete.');

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
