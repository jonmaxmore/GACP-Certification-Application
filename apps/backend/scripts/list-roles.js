const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.dTAMStaff.findMany({
    select: { username: true, role: true, userType: true, isActive: true },
    orderBy: { role: 'asc' },
}).then(users => {
    console.log('=== Staff Roles in Database ===');
    users.forEach(u => console.log(
        u.username.padEnd(15),
        u.role.padEnd(20),
        u.userType.padEnd(12),
        u.isActive ? 'Active' : 'Inactive',
    ));
    console.log('\n=== Unique Roles ===');
    const roles = [...new Set(users.map(u => u.role))];
    roles.forEach(r => console.log(' -', r));
}).finally(() => p.$disconnect());
