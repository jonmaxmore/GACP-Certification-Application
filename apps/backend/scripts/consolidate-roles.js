/**
 * Consolidate staff roles to 4 roles:
 * - admin
 * - scheduler
 * - assessor (replaces inspector, auditor, reviewer)
 * - accountant
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function consolidateRoles() {
    console.log('=== Role Consolidation ===\n');

    // 1. Update existing users with old roles to 'assessor'
    const result = await prisma.dTAMStaff.updateMany({
        where: {
            role: { in: ['inspector', 'auditor', 'reviewer'] }
        },
        data: { role: 'assessor' }
    });
    console.log(`Updated ${result.count} users from inspector/auditor/reviewer to assessor`);

    // 2. Create a main assessor user if not exists
    const existingAssessor = await prisma.dTAMStaff.findFirst({
        where: { username: 'assessor' }
    });

    if (!existingAssessor) {
        const passwordHash = await bcrypt.hash('Gacp@2024', 12);
        await prisma.dTAMStaff.create({
            data: {
                username: 'assessor',
                email: 'assessor@dtam.test',
                password: passwordHash,
                firstName: 'ผู้ประเมิน',
                lastName: 'หลัก',
                role: 'assessor',
                userType: 'DTAM_STAFF',
                department: 'กรมการแพทย์แผนไทย',
                isActive: true,
                isDeleted: false
            }
        });
        console.log('Created new assessor user: assessor / Gacp@2024');
    } else {
        console.log('Assessor user already exists');
    }

    // 3. List all current roles
    const users = await prisma.dTAMStaff.findMany({
        select: { username: true, role: true, isActive: true },
        orderBy: { role: 'asc' }
    });

    console.log('\n=== Current Staff Roles ===');
    users.forEach(u => console.log(
        u.username.padEnd(15),
        u.role.padEnd(15),
        u.isActive ? '✅' : '❌'
    ));

    const uniqueRoles = [...new Set(users.map(u => u.role))];
    console.log('\n=== Unique Roles ===');
    uniqueRoles.forEach(r => console.log(' -', r));

    await prisma.$disconnect();
}

consolidateRoles().catch(console.error);
