const { prisma } = require('./prisma-database');

/**
 * Service for managing Planting Cycles
 */
class PlantingService {

    /**
     * List planting cycles for a farm
     * @param {string} farmId 
     * @param {string} status (Optional)
     */
    async listByFarm(farmId, status) {
        const whereClause = { farmId, isDeleted: false };
        if (status) {
            whereClause.status = status.toUpperCase();
        }

        return prisma.plantingCycle.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                plantSpecies: {
                    select: { code: true, nameTH: true, nameEN: true },
                },
                certificate: {
                    select: { certificateNumber: true, expiryDate: true },
                },
                _count: { select: { batches: true } },
            },
        });
    }

    /**
     * Get single cycle by ID
     * @param {string} id 
     */
    async getById(id) {
        return prisma.plantingCycle.findUnique({
            where: { id },
            include: {
                farm: {
                    select: {
                        id: true,
                        farmName: true,
                        farmNameTH: true,
                        province: true,
                        district: true,
                    },
                },
                plantSpecies: {
                    select: { code: true, nameTH: true, nameEN: true },
                },
                certificate: {
                    select: {
                        certificateNumber: true,
                        expiryDate: true,
                        status: true,
                    },
                },
                batches: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { lots: true } },
                    },
                },
            },
        });
    }

    /**
     * Create a new planting cycle
     * @param {object} data 
     */
    async createCycle(data) {
        const {
            farmId, certificateId, plantSpeciesId, cycleName,
            startDate, expectedHarvestDate, plotId, plotName,
            plotArea, areaUnit, seedSource, seedQuantity,
            cultivationType, notes
        } = data;

        // Verify Active Certificate
        if (certificateId) {
            const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
            if (!cert || cert.status !== 'active') {
                throw new Error('Certificate is invalid or not active');
            }
        }

        return prisma.plantingCycle.create({
            data: {
                farmId,
                certificateId,
                plantSpeciesId,
                cycleName,
                startDate: new Date(startDate),
                expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
                plotId,
                plotName,
                plotArea: plotArea ? parseFloat(plotArea) : null,
                seedSource,
                seedQuantity: seedQuantity ? parseFloat(seedQuantity) : null,
                cultivationType: cultivationType || 'SELF_GROWN',
                notes,
                status: 'PLANTED',
            },
        });
    }

    /**
     * Update planting cycle
     * @param {string} id 
     * @param {object} data 
     */
    async updateCycle(id, data) {
        const updateData = { ...data };

        // Remove immutable fields
        delete updateData.id;
        delete updateData.uuid;
        delete updateData.createdAt;
        delete updateData.farmId;

        // Format Dates
        if (updateData.actualHarvestDate) updateData.actualHarvestDate = new Date(updateData.actualHarvestDate);
        if (updateData.expectedHarvestDate) updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);

        // Format Numbers
        if (updateData.actualYield) updateData.actualYield = parseFloat(updateData.actualYield);

        return prisma.plantingCycle.update({
            where: { id },
            data: updateData,
        });
    }
}

module.exports = new PlantingService();
