const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test farmer
  const testFarmer = await prisma.user.upsert({
    where: { email: 'farmer@test.com' },
    update: {},
    create: {
      email: 'farmer@test.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phoneNumber: '0801234567',
      idCard: '1234567890123',
      idCardHash: require('crypto').createHash('sha256').update('1234567890123').digest('hex'),
      accountType: 'INDIVIDUAL',
      role: 'FARMER',
      status: 'ACTIVE',
      verificationStatus: 'APPROVED',
      verificationNote: 'Test user for development',
    },
  });

  console.log('✅ Created test farmer:', testFarmer.email);

  // Create test admin
  const testAdmin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      phoneNumber: '0809876543',
      idCard: '9876543210987',
      idCardHash: require('crypto').createHash('sha256').update('9876543210987').digest('hex'),
      accountType: 'STAFF',
      role: 'ADMIN',
      status: 'ACTIVE',
      verificationStatus: 'APPROVED',
      verificationNote: 'Test admin for development',
    },
  });

  console.log('✅ Created test admin:', testAdmin.email);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
