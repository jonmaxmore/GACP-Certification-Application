// Check DTAM Staff in database
const { prisma } = require('./services/prisma-database');

async function checkStaff() {
    try {
        const staff = await prisma.dTAMStaff.findMany();
        console.log('=== DTAM Staff in Database ===');
        console.log('Total staff:', staff.length);

        if (staff.length === 0) {
            console.log('No staff accounts found in database!');
        } else {
            staff.forEach(s => {
                console.log('---');
                console.log('ID:', s.id);
                console.log('Username:', s.username);
                console.log('Email:', s.email);
                console.log('Name:', s.firstName, s.lastName);
                console.log('Role:', s.role);
                console.log('Active:', s.isActive);
                console.log('Created:', s.createdAt);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
    process.exit(0);
}

checkStaff();
