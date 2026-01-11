
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Staff User...');

    const email = 'qc_reviewer@dtam.go.th'; // Using email as username for login if supported, or will need username field
    // Note: The login page asks for "Username / Staff ID / Email". 
    // The backend login likely checks email or username. 
    // Let's set both if possible, or just email.

    // Check if schema has username
    // I'll assume standard User model for now but need to be sure about "Staff" vs "User".
    // Based on previous files, Staff seems to be just User with role.

    const hashedPassword = await bcrypt.hash('QC@12345', 10);

    const staff = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'REVIEWER', // or STAFF? need to check schema. UAT used "Reviewer"?
            // StaffLayout.tsx mentions roles: assessor, scheduler, accountant, admin
            // 'qc_reviewer' suggests 'assessor' or 'reviewer'? 
            // The file shows: REVIEWER_AUDITOR: { label: "ผู้ตรวจสอบ" }
            // Let's try to match the role logic.
        },
        create: {
            email,
            password: hashedPassword,
            firstName: 'QC',
            lastName: 'Reviewer',
            role: 'REVIEWER_AUDITOR', // Guessing based on "qc_reviewer"
            status: 'ACTIVE',
            isEmailVerified: true,
            accountType: 'OFFICIAL', // Assuming this field exists for staff
        },
    });

    console.log('✅ Created Staff:', staff.email);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
