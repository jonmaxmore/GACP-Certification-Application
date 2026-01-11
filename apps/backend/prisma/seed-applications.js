const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Applications...');

    // 1. Find or Create a Mock Farmer
    let farmer = await prisma.user.findFirst({ where: { email: 'somchai@farmer.com' } });

    if (!farmer) {
        console.log('Creating mock farmer...');
        farmer = await prisma.user.create({
            data: {
                // User model does not have 'username'
                email: 'somchai@farmer.com',
                password: '$2a$12$GwF/sD7.1t5E.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0', // Mock hash
                firstName: 'Somchai',
                lastName: 'Jaidee',
                role: 'FARMER',
                phoneNumber: '0812345678', // mobile -> phoneNumber
                address: '123 Farm Rd, Chiang Mai',
                province: 'Chiang Mai',
                zipCode: '50000',
                status: 'ACTIVE', // isActive -> status
            },
        });
    }

    // 2. Define Mock Applications with explicit IDs that match Frontend Mocks if possible.
    // We use 'applicationNumber' to upsert.

    const mockApps = [
        {
            applicationNumber: 'APP-67-001',
            farmerId: farmer.id,
            status: 'PENDING_REVIEW',
            serviceType: 'CERTIFICATION',
            areaType: 'INDOOR',
            // plantName, plantId, estimatedFee moved to formData
            formData: {
                plantName: 'Cannabis (กัญชา)',
                plantId: 'plant-cannabis',
                estimatedFee: 5000,
                applicantData: { name: 'Somchai Jaidee' },
                locationData: { address: 'Chiang Mai' },
            },
            phase1Amount: 5000, // Optional, matches schema
            createdAt: new Date('2024-12-08T10:00:00Z'), // approximate submission
        },
        {
            applicationNumber: 'APP-67-002',
            farmerId: farmer.id,
            status: 'APPROVED',
            serviceType: 'CERTIFICATION',
            areaType: 'OUTDOOR',
            formData: {
                plantName: 'Andrographis (ฟ้าทะลายโจร)',
                plantId: 'plant-andrographis',
                estimatedFee: 3000,
                applicantData: { name: 'Somchai Jaidee' },
                locationData: { address: 'Chiang Mai' },
            },
            phase1Amount: 3000,
            createdAt: new Date('2024-12-05T14:30:00Z'),
        },
        {
            applicationNumber: 'APP-67-003',
            farmerId: farmer.id,
            status: 'REVISION_REQUIRED',
            serviceType: 'CERTIFICATION',
            areaType: 'GREENHOUSE',
            formData: {
                plantName: 'Turmeric (ขมิ้นชัน)',
                plantId: 'plant-turmeric',
                estimatedFee: 4000,
                applicantData: { name: 'Somchai Jaidee' },
                locationData: { address: 'Chiang Mai' },
            },
            phase1Amount: 4000,
            createdAt: new Date('2024-12-01T09:15:00Z'),
        },
        {
            applicationNumber: 'APP-67-004',
            farmerId: farmer.id,
            status: 'PENDING_AUDIT',
            serviceType: 'CERTIFICATION',
            areaType: 'INDOOR',
            formData: {
                plantName: 'Hemp (กัญชง)',
                plantId: 'plant-hemp',
                estimatedFee: 6000,
                applicantData: { name: 'Somchai Jaidee' },
                locationData: { address: 'Chiang Mai' },
            },
            phase1Amount: 6000,
            createdAt: new Date('2024-12-10T11:45:00Z'),
        },
    ];

    for (const app of mockApps) {
        await prisma.application.upsert({
            where: { applicationNumber: app.applicationNumber },
            update: {
                status: app.status,
                formData: app.formData,
                // created/submitted dates might not be easily updatable if we want to keep them fixed, but strictly:
                // submittedAt is not in Schema based on my snippet? 
                // Wait, schema check: I didn't see submittedAt in top level.
                // It was in router.get('/') map though.
                // Assuming it might be missing or I missed it. I'll omit submittedAt top level for safety,
                // rely on createdAt.
            },
            create: {
                applicationNumber: app.applicationNumber,
                farmerId: app.farmerId,
                status: app.status,
                serviceType: app.serviceType,
                areaType: app.areaType,
                formData: app.formData,
                phase1Amount: app.phase1Amount,
                createdAt: app.createdAt,
            },
        });
        console.log(`✅ Upserted application: ${app.applicationNumber}`);
    }

    console.log('✨ Seeding Completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
