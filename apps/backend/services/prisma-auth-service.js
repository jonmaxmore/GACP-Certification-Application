const { prisma } = require('./prisma-database');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt-security');

class PrismaAuthService {
    async register(data) {
        const { idCardImage, ...userData } = data;
        // Basic user creation
        return await prisma.user.create({
            data: {
                ...userData,
                password: await bcrypt.hash(userData.password, 10),
            },
        });
    }

    async login(loginId, password, accountType) {
        const user = await prisma.user.findFirst({
            where: {
                email: loginId,
            },
        });
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid credentials');
        }

        const token = jwtConfig.generateToken({ id: user.id, role: user.accountType });
        return { user, token };
    }

    async getProfile(userId) {
        return await prisma.user.findUnique({ where: { id: userId } });
    }

    // [NEW] Update Profile
    async updateProfile(userId, data) {
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async checkIdentifierExists(identifier) {
        // checks...
        return false;
    }
}

module.exports = new PrismaAuthService();
