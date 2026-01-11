const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_ID_CARD = '4310100001149';

async function main() {
    console.log(`🔍 Checking Status for ID: ${TARGET_ID_CARD}...`);

    const user = await prisma.user.findFirst({
        where: { idCard: TARGET_ID_CARD },
    });

    if (!user) {
        console.log('❌ User not found');
        return;
    }

    console.log('--------------------------------------------------');
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`Status: ${user.status}`);
    console.log(`Verification Status: ${user.verificationStatus}`);
    console.log(`Verification Note: ${user.verificationNote}`);
    console.log(`Attempts: ${user.verificationAttempts}`);
    console.log('--------------------------------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
