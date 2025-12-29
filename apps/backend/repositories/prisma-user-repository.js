/**
 * User Repository - Prisma (PostgreSQL)
 * 
 * Repository pattern for User model using Prisma ORM
 * Replaces Mongoose-based user repository
 */

const { prisma } = require('../services/prisma-database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class UserRepository {
    /**
     * Create a new user
     */
    async create(userData) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                uuid: uuidv4(),
            },
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Find user by ID
     */
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find user by UUID (for API responses)
     */
    async findByUuid(uuid) {
        return prisma.user.findUnique({
            where: { uuid },
        });
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }

    /**
     * Find user by ID card hash
     */
    async findByIdCardHash(idCardHash) {
        return prisma.user.findUnique({
            where: { idCardHash },
        });
    }

    /**
     * Find user by tax ID hash
     */
    async findByTaxIdHash(taxIdHash) {
        return prisma.user.findUnique({
            where: { taxIdHash },
        });
    }

    /**
     * Update user
     */
    async update(id, updateData) {
        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }

        return prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Soft delete user
     */
    async softDelete(id, deletedBy, reason) {
        return prisma.user.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy,
                deleteReason: reason,
            },
        });
    }

    /**
     * Compare password
     */
    async comparePassword(userId, candidatePassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) return false;
        return bcrypt.compare(candidatePassword, user.password);
    }

    /**
     * Update login info
     */
    async updateLoginInfo(id, ipAddress) {
        return prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                loginAttempts: 0,
                isLocked: false,
                lockedUntil: null,
            },
        });
    }

    /**
     * Increment failed login attempts
     */
    async incrementLoginAttempts(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        const attempts = (user?.loginAttempts || 0) + 1;

        const updateData = {
            loginAttempts: attempts,
        };

        // Lock after 5 failed attempts
        if (attempts >= 5) {
            updateData.isLocked = true;
            updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }

        return prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Find all users (with pagination and filters)
     */
    async findAll({ page = 1, limit = 20, role, status, search } = {}) {
        const skip = (page - 1) * limit;

        const where = {
            isDeleted: false,
        };

        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    uuid: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    accountType: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Count users by role
     */
    async countByRole() {
        const counts = await prisma.user.groupBy({
            by: ['role'],
            _count: true,
            where: { isDeleted: false },
        });

        return counts.reduce((acc, item) => {
            acc[item.role] = item._count;
            return acc;
        }, {});
    }
}

module.exports = new UserRepository();

