const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function fixAdmin() {
    // Generate new hash with native bcrypt (same as auth-dtam uses)
    const password = await bcrypt.hash("Admin@2024", 12);

    const user = await prisma.dTAMStaff.update({
        where: { username: "admin" },
        data: { password: password }
    });

    console.log("Admin password updated with native bcrypt!");
    console.log("Username:", user.username);

    // Verify immediately
    const valid = await bcrypt.compare("Admin@2024", user.password);
    console.log("Verification:", valid ? "SUCCESS" : "FAILED");
}

fixAdmin()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
