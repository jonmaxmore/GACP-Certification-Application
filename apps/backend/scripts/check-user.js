const p = require('./services/prisma-database').prisma;
p.dTAMStaff.findFirst({ where: { username: 'accountant' } })
    .then(u => console.log(JSON.stringify(u, null, 2)))
    .catch(e => console.log('ERROR:', e.message))
    .finally(() => p.$disconnect());
