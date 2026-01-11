const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_ID_CARD = '4310100001149';

async function main() {
    console.log(`🔓 Force Verifying ID: ${TARGET_ID_CARD}...`);

    const user = await prisma.user.findFirst({
        where: { idCard: TARGET_ID_CARD },
    });

    if (!user) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            verificationStatus: 'VERIFIED', // Force Pass
            status: 'ACTIVE',
            verificationNote: 'Manual Override: AI OCR could not read image clearly.',
        },
    });

    console.log(`✅ User ${user.firstName} is now VERIFIED.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
