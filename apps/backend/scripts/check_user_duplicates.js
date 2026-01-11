const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_ID_CARD = '4310100001149';

async function main() {
    console.log(`🔍 Checking duplicates for ID: ${TARGET_ID_CARD}...`);

    const users = await prisma.user.findMany({
        where: { idCard: TARGET_ID_CARD },
    });

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`- User: ${user.firstName} ${user.lastName} (ID: ${user.id}) | Status: ${user.verificationStatus}`);

        // Force Reset
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationStatus: 'UNVERIFIED',
                status: 'PENDING_VERIFICATION', // Ensure they can login but not active
                verificationDocuments: {},
                verificationSubmittedAt: null,
            },
        });
        console.log(`  -> 🔄 Reset to UNVERIFIED.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
