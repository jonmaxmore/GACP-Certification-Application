/**
 * Fix password hash and unlock accounts for test users
 * Generates fresh bcrypt hash at runtime
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixPasswords() {
    // Generate fresh bcrypt hash for 'Gacp@2024'
    const password = 'Gacp@2024';
    const freshHash = await bcrypt.hash(password, 12);

    console.log('Generated fresh hash for', password);
    console.log('Hash:', freshHash);

    const result = await prisma.dTAMStaff.updateMany({
        where: {
            username: { in: ['accountant', 'scheduler', 'admin', 'inspector1', 'auditor1', 'reviewer1'] }
        },
        data: {
            password: freshHash,
            isActive: true,
            failedLoginAttempts: 0,
            lockedAt: null
        }
    });

    console.log('Updated', result.count, 'users with fresh hash, isActive=true, unlocked');

    // Verify by reading back
    const accountant = await prisma.dTAMStaff.findFirst({ where: { username: 'accountant' } });
    console.log('Verified accountant:', accountant.username, 'isActive:', accountant.isActive);

    await prisma.$disconnect();
}

fixPasswords().catch(console.error);
