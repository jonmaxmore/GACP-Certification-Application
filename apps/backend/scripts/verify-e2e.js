/**
 * E2E Verification Script: Full Golden Loop
 * 
 * Usage: node scripts/verify-e2e.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const certificateService = require('../services/certificate-service');

async function main() {
    console.log('🚀 Starting E2E Verification...');

    // 1. Create a Mock User (Farmer)
    const farmer = await prisma.user.create({
        data: {
            email: `verify_${Date.now()}@test.com`,
            password: 'hashed_password',
            firstName: 'Somchai',
            lastName: 'Mee-ngan',
            role: 'FARMER',
            accountType: 'INDIVIDUAL',
            status: 'ACTIVE',
        },
    });
    console.log(`✅ Farmer Created: ${farmer.id}`);

    // 2. Submit Application (Step 1-6 Simulation)
    const app = await prisma.application.create({
        data: {
            applicationNumber: `APP-${Date.now()}`,
            farmerId: farmer.id,
            areaType: 'GREENHOUSE',
            serviceType: 'new_application',
            status: 'PENDING_AUDIT', // Jump to Audit
            phase1Status: 'PAID',
            formData: {
                plantName: 'Cannabis',
                locationData: { address: '123 Farm Rd', province: 'Chiang Mai', subDistrict: 'Mae Rim' },
                productionData: { growingArea: '5' }, // 5 Rai
            },
        },
    });
    console.log(`✅ Application Submitted: ${app.applicationNumber}`);

    // 3. Mock Staff Scheduling Audit
    const staffId = 'STAFF-001';
    await prisma.application.update({
        where: { id: app.id },
        data: {
            status: 'AUDIT_SCHEDULED',
            scheduledDate: new Date(),
            auditorId: staffId,
            formData: {
                ...app.formData,
                auditMode: 'ONLINE',
                meetingUrl: 'https://meet.google.com/abc-defg-hij',
            },
        },
    });
    console.log('✅ Audit Scheduled');

    // 4. Mock Audit Pass (Trigger Certificate Generation)
    // This replicates the logic in audits.js router.post('/:id/result')
    console.log('🔄 Executing Audit Pass Logic...');

    // Simulate API logic
    await prisma.application.update({
        where: { id: app.id },
        data: { status: 'APPROVED' },
    });

    // Call Certificate Service
    const cert = await certificateService.generateCertificate(app.id, staffId);
    console.log(`✅ Certificate Generated: ${cert.certificateNumber}`);

    // 5. Verify Assets
    const farm = await prisma.farm.findFirst({ where: { ownerId: farmer.id } });
    if (!farm) {throw new Error('Farm not created!');}
    console.log(`✅ Farm Created: ${farm.farmName} (${farm.status})`);

    const cycle = await prisma.plantingCycle.findFirst({ where: { farmId: farm.id } });
    if (!cycle) {throw new Error('Planting Cycle not created!');}
    console.log(`✅ Cycle Created: ${cycle.cycleName}`);

    const batch = await prisma.harvestBatch.findFirst({ where: { cycleId: cycle.id } });
    if (!batch) {throw new Error('Harvest Batch not created!');}
    console.log(`✅ Batch Created: ${batch.batchNumber}`);
    console.log(`   QR Code: ${batch.qrCode ? 'Yes' : 'No'}`);

    console.log('🎉 E2E Verification PASSED!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
