const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_ID_CARD = '4310100001149';

async function main() {
    console.log(`🔄 Resetting verification for ID Card: ${TARGET_ID_CARD}...`);

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
            verificationStatus: 'UNVERIFIED',
            status: 'PENDING_VERIFICATION',
            verificationDocuments: {}, // Clear docs
            verificationSubmittedAt: null,
            verificationNote: null,
            verificationAttempts: 0,      // Reset attempts
            verificationLockedUntil: null, // Unlock if locked
        },
    });

    console.log(`✅ User ${user.firstName} (ID: ${user.id}) reset to UNVERIFIED.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
