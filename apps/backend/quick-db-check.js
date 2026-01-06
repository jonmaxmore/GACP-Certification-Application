const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
    .then(() => { console.log('DB_UP'); process.exit(0); })
    .catch((e) => { console.log('DB_DOWN'); process.exit(1); });
