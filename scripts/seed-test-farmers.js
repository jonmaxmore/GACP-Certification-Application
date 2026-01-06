/**
 * Seed Test Farmer Accounts for Cannabis Application Testing
 * Run from apps/backend: node seed-test-farmers.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌿 Creating test farmer accounts for Cannabis testing...\n');

    const password = await bcrypt.hash('Test1234', 12);

    // Test accounts for all 3 types
    const testFarmers = [
        {
            // บุคคลธรรมดา (Individual)
            email: 'farmer.individual@test.gacp.go.th',
            password,
            accountType: 'INDIVIDUAL',
            idCard: '1234567890121', // Valid checksum
            idCardHash: '1234567890121_hash',
            firstName: 'สมชาย',
            lastName: 'ทดสอบ',
            phoneNumber: '0812345678',
            status: 'ACTIVE',
            role: 'FARMER',
            isEmailVerified: true,
        },
        {
            // นิติบุคคล (Corporate)
            email: 'farmer.corporate@test.gacp.go.th',
            password,
            accountType: 'JURISTIC',
            taxId: '0105556012345',
            taxIdHash: '0105556012345_hash',
            companyName: 'บริษัท ทดสอบสมุนไพร จำกัด',
            representativeName: 'นายประสิทธิ์ ทดสอบ',
            phoneNumber: '0823456789',
            status: 'ACTIVE',
            role: 'FARMER',
            isEmailVerified: true,
        },
        {
            // วิสาหกิจชุมชน (Community Enterprise)
            email: 'farmer.community@test.gacp.go.th',
            password,
            accountType: 'COMMUNITY_ENTERPRISE',
            communityRegistrationNo: '5-01-01-50/001',
            communityRegistrationNoHash: '5010150001_hash',
            communityName: 'กลุ่มวิสาหกิจทดสอบสมุนไพร',
            representativeName: 'นางสาวสมหญิง ทดสอบ',
            phoneNumber: '0834567890',
            status: 'ACTIVE',
            role: 'FARMER',
            isEmailVerified: true,
        }
    ];

    for (const farmer of testFarmers) {
        try {
            // Check if exists
            const existing = await prisma.user.findFirst({
                where: { email: farmer.email }
            });

            if (existing) {
                console.log(`⚠️  ${farmer.accountType} already exists: ${farmer.email}`);
                continue;
            }

            // Create user
            await prisma.user.create({ data: farmer });

            console.log(`✅ Created ${farmer.accountType}:`);
            console.log(`   Email: ${farmer.email}`);
            console.log(`   ID: ${farmer.idCard || farmer.taxId || farmer.communityRegistrationNo}`);
            console.log(`   Password: Test1234\n`);

        } catch (error) {
            console.error(`❌ Error creating ${farmer.accountType}:`, error.message);
        }
    }

    console.log('\n🎉 Done! You can now login at http://47.129.167.71/login');
    console.log('\n📋 Test Accounts:');
    console.log('   Individual: 1234567890121 / Test1234');
    console.log('   Corporate: 0105556012345 / Test1234');
    console.log('   Community: 5-01-01-50/001 / Test1234');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
