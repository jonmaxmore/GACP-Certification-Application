/**
 * Fix password hash and unlock accounts for test users
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPasswords() {
    // Correct bcrypt hash for 'Gacp@2024'
    const correctHash = '$2b$12$JQC2Pft7ZnsK/e8QQZB.TupuFHp8MyfzzfCfuIrF3W52Jusgf/EicC';

    const result = await prisma.dTAMStaff.updateMany({
        where: {
            username: { in: ['accountant', 'scheduler', 'admin', 'inspector1', 'auditor1', 'reviewer1'] }
        },
        data: {
            password: correctHash,
            isActive: true,
            failedLoginAttempts: 0,
            lockedAt: null
        }
    });

    console.log('Updated', result.count, 'users: password, isActive=true, failedAttempts=0, lockedAt=null');
    await prisma.$disconnect();
}

fixPasswords().catch(console.error);
