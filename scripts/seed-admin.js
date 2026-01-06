const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
    const password = await bcrypt.hash("Admin@2024", 10);
    const admin = await prisma.dTAMStaff.upsert({
        where: { username: "admin" },
        update: {},
        create: {
            username: "admin",
            password: password,
            email: "admin@dtam.go.th",
            firstName: "System",
            lastName: "Admin",
            role: "ADMIN",
            employeeId: "ADM001",
            department: "IT",
            isActive: true
        }
    });
    console.log("Admin user created:", admin.username);
}

seed()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
