/**
 * Fix password hash for test users
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
            isActive: true  // Also ensure account is active
        }
    });

    console.log('Updated', result.count, 'users with correct password hash and isActive=true');
    await prisma.$disconnect();
}

fixPasswords().catch(console.error);
