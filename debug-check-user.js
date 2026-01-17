const { prisma } = require('./apps/backend/services/prisma-database');

async function checkUser() {
    const user = await prisma.user.findFirst({
        where: { username: '1100702334033' }
    });
    console.log('User status:', user ? 'FOUND' : 'NOT_FOUND');
    if (user) console.log(user);
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
