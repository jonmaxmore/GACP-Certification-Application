/**
 * Application Repository - Prisma (PostgreSQL)
 * 
 * Repository pattern for Application model using Prisma ORM
 */

const { prisma } = require('../services/prisma-database');
const { v4: uuidv4 } = require('uuid');

class ApplicationRepository {
    /**
     * Create a new application
     */
    async create(applicationData) {
        const year = new Date().getFullYear() + 543; // Thai year
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        const applicationNumber = `REQ-${year}-${random}`;

        return prisma.application.create({
            data: {
                ...applicationData,
                applicationNumber,
                uuid: uuidv4(),
            },
        });
    }

    /**
     * Find by ID
     */
    async findById(id) {
        return prisma.application.findUnique({
            where: { id },
            include: {
                farmer: {
                    select: { id: true, uuid: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }

    /**
     * Find by UUID
     */
    async findByUuid(uuid) {
        return prisma.application.findUnique({
            where: { uuid },
            include: {
                farmer: {
                    select: { id: true, uuid: true, firstName: true, lastName: true, email: true },
                },
            },
        });
    }

    /**
     * Find by application number
     */
    async findByNumber(applicationNumber) {
        return prisma.application.findUnique({
            where: { applicationNumber },
        });
    }

    /**
     * Find by farmer ID
     */
    async findByFarmerId(farmerId, options = {}) {
        const { status, page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;

        const where = { farmerId, isDeleted: false };
        if (status) {where.status = status;}

        return prisma.application.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Update application
     */
    async update(id, updateData, updatedBy) {
        // Add to workflow history
        const existing = await prisma.application.findUnique({ where: { id } });
        const workflowHistory = existing?.workflowHistory || [];

        if (updateData.status && updateData.status !== existing?.status) {
            workflowHistory.push({
                action: 'STATUS_CHANGE',
                previousStatus: existing?.status,
                newStatus: updateData.status,
                performedBy: updatedBy,
                performedAt: new Date().toISOString(),
            });
        }

        return prisma.application.update({
            where: { id },
            data: {
                ...updateData,
                workflowHistory,
                updatedBy,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Update status
     */
    async updateStatus(id, status, updatedBy, notes) {
        return this.update(id, { status }, updatedBy);
    }

    /**
     * Find all with pagination
     */
    async findAll({ page = 1, limit = 20, status, serviceType } = {}) {
        const skip = (page - 1) * limit;
        const where = { isDeleted: false };

        if (status) {where.status = status;}
        if (serviceType) {where.serviceType = serviceType;}

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    farmer: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
            }),
            prisma.application.count({ where }),
        ]);

        return {
            applications,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    /**
     * Count by status
     */
    async countByStatus() {
        const counts = await prisma.application.groupBy({
            by: ['status'],
            _count: true,
            where: { isDeleted: false },
        });

        return counts.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {});
    }
}

module.exports = new ApplicationRepository();

