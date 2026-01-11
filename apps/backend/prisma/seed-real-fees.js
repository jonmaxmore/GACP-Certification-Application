const { PrismaClient } = require('@prisma/client');
const feeService = require('../services/fee-service');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Split-Scope Application Data...');

    // 1. Get Existing Farmer
    const farmer = await prisma.user.findFirst({
        where: { role: 'FARMER' },
    });

    if (!farmer) {
        console.error('❌ No FARMER found. Please run "npm run seed" first.');
        return;
    }
    console.log(`✅ Using Farmer: ${farmer.email}`);

    // Generate specific timestamp for this batch
    const batchId = `BATCH-${Date.now()}`;

    // Scenario: Farmer applies for BOTH Outdoor and Indoor (Greenhouse)
    // Results in 2 Separate Applications
    const scopes = [
        { type: 'OUTDOOR', nameTH: 'กลางแจ้ง (Outdoor)' },
        { type: 'GREENHOUSE', nameTH: 'โรงเรือน (Greenhouse)' },
    ];

    console.log(`🔹 Simulating Batch Submission: ${batchId} (2 Scopes)`);

    for (const [index, scope] of scopes.entries()) {
        const globalCount = await prisma.application.count();
        const appNumber = `GACP-SPLIT-${globalCount + 1}`;

        // Calculate Fees
        const phase1Fee = feeService.calculatePhase1Fee();
        const phase2Fee = feeService.calculatePhase2Fee({ auditMode: 'ONSITE' });

        await prisma.application.create({
            data: {
                farmerId: farmer.id,
                applicationNumber: appNumber,
                status: 'PAYMENT_2_PENDING', // Ready to see 25k bill
                serviceType: 'new_application',

                // SPLIT LOGIC
                batchId: batchId,
                areaType: scope.type,
                areaTypeIndex: index + 1,
                totalAreaTypes: scopes.length,

                // FEES
                phase1Amount: phase1Fee.total,
                phase2Amount: phase2Fee.total,

                formData: {
                    plantName: 'Cannabis (Batch Split)',
                    scope: scope.nameTH,
                    fees: {
                        phase1: phase1Fee,
                        phase2: phase2Fee,
                    },
                },
            },
        });

        console.log(`   ✅ Created App #${index + 1}: ${scope.type} [${appNumber}] - Fee: ${phase2Fee.total} THB`);
    }

    console.log('✨ Batch Simulation Complete. Check Dashboard for 2 new entries.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
