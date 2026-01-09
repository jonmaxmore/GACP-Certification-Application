const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for application GACP-2569-000001...');
    try {
        const app = await prisma.application.findFirst({
            where: { applicationNumber: 'GACP-2569-000001' }
        });
        console.log('Result:', JSON.stringify(app, null, 2));

        // Also count all applications
        const count = await prisma.application.count();
        console.log('Total applications:', count);

        // Check recent ones
        const recent = await prisma.application.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, applicationNumber: true, status: true }
        });
        console.log('Recent 5 apps:', JSON.stringify(recent, null, 2));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
