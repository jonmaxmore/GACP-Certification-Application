const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_ID_CARD = '4310100001149';

async function main() {
    console.log(`🛠️ Migrating Status for ID: ${TARGET_ID_CARD}...`);

    const user = await prisma.user.findFirst({
        where: { idCard: TARGET_ID_CARD },
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log(`Current Status: ${user.verificationStatus}`);

    if (user.verificationStatus === 'VERIFIED') {
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationStatus: 'APPROVED' },
        });
        console.log('✅ Updated to APPROVED');
    } else {
        console.log('ℹ️ No update needed');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
