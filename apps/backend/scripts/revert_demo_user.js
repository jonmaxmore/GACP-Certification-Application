
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function revertUser() {
    console.log('Reverting fixverify@test.com to NEW status...');
    try {
        const target = await prisma.user.findFirst({ where: { idCard: '3100602493394' } });
        if (!target) {throw new Error('User not found');}

        const user = await prisma.user.update({
            where: { id: target.id },
            data: {
                verificationStatus: 'NEW',
                status: 'PENDING_VERIFICATION',
            },
        });
        console.log(`✅ Reverted User: ${user.id} | Status: ${user.verificationStatus}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

revertUser();
