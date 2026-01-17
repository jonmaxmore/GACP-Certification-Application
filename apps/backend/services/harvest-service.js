const { prisma } = require('./prisma-database');

/**
 * Service for managing Harvest Batches (Lots)
 */
class HarvestService {

    /**
     * List harvest batches
     * @param {object} filter - { farmId, status, speciesId }
     */
    async list(filter = {}) {
        const where = {};
        if (filter.farmId) {where.farmId = filter.farmId;}
        if (filter.status) {where.status = filter.status;}
        if (filter.speciesId) {where.speciesId = filter.speciesId;}

        return prisma.harvestBatch.findMany({
            where,
            include: {
                species: {
                    select: { id: true, thaiName: true, englishName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get batch by ID
     * @param {string} id 
     */
    async getById(id) {
        return prisma.harvestBatch.findUnique({
            where: { id },
            include: {
                species: true,
            },
        });
    }

    /**
     * Get batch by Lot Number (Traceability)
     * @param {string} batchNumber 
     */
    async getByBatchNumber(batchNumber) {
        return prisma.harvestBatch.findUnique({
            where: { batchNumber },
            include: {
                species: {
                    select: {
                        id: true,
                        thaiName: true,
                        englishName: true,
                        scientificName: true,
                    },
                },
            },
        });
    }

    /**
     * Create new harvest batch (Growing phase)
     * @param {object} data 
     */
    async createBatch(data) {
        const {
            farmId, speciesId, plantingDate, cultivationType,
            seedSource, plotName, plotArea, areaUnit, notes,
        } = data;

        const year = new Date().getFullYear();
        const count = await prisma.harvestBatch.count({
            where: { farmId },
        });
        const batchNumber = `LOT-${farmId.substring(0, 8).toUpperCase()}-${year}-${String(count + 1).padStart(3, '0')}`;

        return prisma.harvestBatch.create({
            data: {
                batchNumber,
                farmId,
                speciesId,
                plantingDate: new Date(plantingDate),
                cultivationType: cultivationType || 'SELF_GROWN',
                seedSource,
                plotName,
                plotArea: plotArea ? parseFloat(plotArea) : null,
                areaUnit: areaUnit || 'rai',
                notes,
                status: 'GROWING',
            },
            include: {
                species: { select: { thaiName: true } },
            },
        });
    }

    /**
     * Update existing batch
     * @param {string} id 
     * @param {object} data 
     */
    async updateBatch(id, data) {
        const updateData = { ...data };

        // Handle dates
        if (updateData.plantingDate) {updateData.plantingDate = new Date(updateData.plantingDate);}
        if (updateData.harvestDate) {updateData.harvestDate = new Date(updateData.harvestDate);}
        if (updateData.expectedHarvestDate) {updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);}

        return prisma.harvestBatch.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Record Harvest (Complete the batch)
     * @param {string} id 
     * @param {object} data 
     */
    async recordHarvest(id, data) {
        const { harvestDate, actualYield, yieldUnit, qualityGrade, notes } = data;

        const existing = await this.getById(id);
        if (!existing) {throw new Error('Harvest batch not found');}
        if (existing.status === 'HARVESTED') {throw new Error('This batch has already been harvested');}

        return prisma.harvestBatch.update({
            where: { id },
            data: {
                harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
                actualYield: actualYield ? parseFloat(actualYield) : null,
                yieldUnit: yieldUnit || 'kg',
                qualityGrade,
                status: 'HARVESTED',
                notes: notes || existing.notes,
            },
        });
    }

    /**
     * Get Stats for Farm
     * @param {string} farmId 
     */
    async getStats(farmId) {
        const [total, growing, harvested] = await Promise.all([
            prisma.harvestBatch.count({ where: { farmId } }),
            prisma.harvestBatch.count({ where: { farmId, status: 'GROWING' } }),
            prisma.harvestBatch.count({ where: { farmId, status: 'HARVESTED' } }),
        ]);

        return {
            farmId,
            totalBatches: total,
            growing,
            harvested,
            pending: total - growing - harvested,
        };
    }
}

module.exports = new HarvestService();
