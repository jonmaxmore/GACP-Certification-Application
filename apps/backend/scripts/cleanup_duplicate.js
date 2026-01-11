
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupUser() {
    console.log('🧹 Cleaning up user: 4310100001149');

    try {
        const { count } = await prisma.user.deleteMany({
            where: {
                idCard: '4310100001149',
            },
        });

        console.log(`✅ Deleted ${count} user(s). DB is clean for this ID.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupUser();
