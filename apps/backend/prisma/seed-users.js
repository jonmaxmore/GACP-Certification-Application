/**
 * Seed Test Users for Development
 * Run: node prisma/seed-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding test users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test farmer user
    const farmer = await prisma.user.upsert({
        where: { email: 'farmer@test.com' },
        update: {},
        create: {
            email: 'farmer@test.com',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'Farmer',
            role: 'FARMER',
            status: 'ACTIVE',
            isEmailVerified: true,
            accountType: 'INDIVIDUAL',
        },
    });

    console.log('✅ Created farmer:', farmer.email);

    // Create another test farmer
    const farmer2 = await prisma.user.upsert({
        where: { email: 'farmer5@test.com' },
        update: {},
        create: {
            email: 'farmer5@test.com',
            password: hashedPassword,
            firstName: 'Farmer',
            lastName: 'Five',
            role: 'FARMER',
            status: 'ACTIVE',
            isEmailVerified: true,
            accountType: 'INDIVIDUAL',
        },
    });

    console.log('✅ Created farmer:', farmer2.email);

    console.log('🎉 Seeding completed!');
    console.log('📋 Test credentials:');
    console.log('   Email: farmer@test.com');
    console.log('   Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
