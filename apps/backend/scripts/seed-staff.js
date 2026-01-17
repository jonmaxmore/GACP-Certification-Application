process.env.DATABASE_URL = 'postgresql://gacp:gacp2024@localhost:5432/gacp_db';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const email = 'reviewer@dtam.go.th';
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        const upsertUser = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                firstName: 'Somchai',
                lastName: 'Reviewer',
                role: 'REVIEWER_AUDITOR',
                accountType: 'STAFF',
                status: 'ACTIVE',
                phoneNumber: '020001234'
            },
        });
        console.log('Seeded Staff:', upsertUser.email);

        // Seed Farmer
        const farmerEmail = 'farmer_test@gacp.com';
        const farmerUser = await prisma.user.upsert({
            where: { email: farmerEmail },
            update: {},
            create: {
                email: farmerEmail,
                password: hashedPassword,
                firstName: 'Somsak',
                lastName: 'Farmer',
                role: 'FARMER',
                accountType: 'INDIVIDUAL',
                status: 'ACTIVE'
            },
        });

        // Seed Application
        const appNum = 'APP-TEST-001';
        await prisma.application.upsert({
            where: { applicationNumber: appNum },
            update: { status: 'SUBMITTED' },
            create: {
                applicationNumber: appNum,
                farmerId: farmerUser.id,
                status: 'SUBMITTED',
                serviceType: 'new_application',
                areaType: 'OUTDOOR',
                phase1Status: 'PAID',
                formData: { plantId: 'CAN' }
            }
        });
        console.log('Seeded Application:', appNum);

        // Seed Scheduler
        await prisma.user.upsert({
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
            },
        });

        // Seed Auditor
        await prisma.user.upsert({
            where: { email: 'auditor@dtam.go.th' },
            update: {},
            create: {
                email: 'auditor@dtam.go.th',
                password: hashedPassword,
                firstName: 'Somsak',
                lastName: 'Auditor',
                role: 'REVIEWER_AUDITOR', // Same role as Reviewer usually, or specific? Controller check uses REVIEWER_AUDITOR for both.
                accountType: 'STAFF',
                status: 'ACTIVE'
            },
        });

        // Seed App for Scheduling
        const appSched = 'APP-TEST-SCHED-01';
        await prisma.application.upsert({
            where: { applicationNumber: appSched },
            update: { status: 'PENDING_SCHEDULE' },
            create: {
                applicationNumber: appSched,
                farmerId: farmerUser.id,
                status: 'PENDING_SCHEDULE',
                serviceType: 'new_application',
                areaType: 'INDOOR',
                phase1Status: 'PAID',
                phase2Status: 'PAID', // Must be paid to schedule
                formData: { plantId: 'KRA' }
            }
        });
        console.log('Seeded Scheduler Data');

        // Seed App for Audit
        const appAudit = 'APP-TEST-AUDIT-01';
        await prisma.application.upsert({
            where: { applicationNumber: appAudit },
            update: { status: 'PENDING_AUDIT', auditorId: upsertUser.id }, // upsertUser is Auditor/Reviewer? No, upsertUser is Staff Reviewer (first one).
            // Wait, I need Auditor ID.
            // I'll assume 'auditor@dtam.go.th' is the one logging in. get its ID?
            // Since seed-staff script runs sequentially, I can fetch it or use the one created.
            // upsertUser is the first one (Reviewer).
            // Use Reviewer as Auditor for simplicity (Dual role).
            create: {
                applicationNumber: appAudit,
                farmerId: farmerUser.id,
                status: 'PENDING_AUDIT',
                serviceType: 'new_application',
                areaType: 'OUTDOOR',
                phase1Status: 'PAID',
                phase2Status: 'PAID',
                formData: { plantId: 'TUR' }
                // auditorId: upsertUser.id // Optional if we test assignment logic
            }
        });
        console.log('Seeded Auditor Data');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
