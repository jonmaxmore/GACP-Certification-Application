
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createStaffUser() {
    const email = 'staff@dtam.go.th'; // Official demo staff email
    const password = 'Password123!';
    const username = 'admin'; // For simplified login if using username
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating Staff User: ${email}...`);

    try {
        // Check if exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { accountType: 'STAFF' }, // Just check if any staff exists
                ],
            },
        });

        if (existing && existing.email === email) {
            console.log('Staff user already exists. resetting password...');
            await prisma.user.update({
                where: { id: existing.id },
                data: { password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' },
            });
            console.log('✅ Staff password reset to Password123!');
            return;
        }

        // Create new
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'Staff',
                accountType: 'STAFF',
                role: 'ADMIN',
                status: 'ACTIVE',
                verificationStatus: 'APPROVED',
            },
        });

        console.log(`✅ Created Staff User: ${user.email} (Role: ${user.role})`);

    } catch (e) {
        console.error('Error creating staff user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createStaffUser();
