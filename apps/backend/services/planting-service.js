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
                plantUnits: {
                    orderBy: { code: 'asc' },
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
            cultivationType, notes, productionInputs, // [NEW] GACP Inputs
        } = data;

        // Verify Active Certificate
        if (certificateId) {
            const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
            if (!cert || cert.status !== 'active') {
                throw new Error('Certificate is invalid or not active');
            }
        }

        // Prepare Production Inputs if any
        const inputsCreate = productionInputs && Array.isArray(productionInputs)
            ? {
                create: productionInputs.map(input => ({
                    type: input.type,
                    name: input.name,
                    sourceType: input.sourceType,
                    usageStage: input.usageStage,
                    quantity: input.quantity ? parseFloat(input.quantity) : null,
                    unit: input.unit,
                    frequency: input.frequency,
                    isOrganic: input.isOrganic || false,
                    manufacturer: input.manufacturer,
                    certNumber: input.certNumber,
                })),
            }
            : undefined;

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
                productionInputs: inputsCreate, // [NEW]
            },
            include: { // Return inputs in response
                productionInputs: true,
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
        const { productionInputs } = data; // Extract inputs

        // Remove immutable fields & extracted relations
        delete updateData.id;
        delete updateData.uuid;
        delete updateData.createdAt;
        delete updateData.farmId;
        delete updateData.productionInputs;

        // Format Dates
        if (updateData.actualHarvestDate) {updateData.actualHarvestDate = new Date(updateData.actualHarvestDate);}
        if (updateData.expectedHarvestDate) {updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);}

        // Format Numbers
        if (updateData.actualYield) {updateData.actualYield = parseFloat(updateData.actualYield);}

        // Transaction for GACP Inputs (Sync: Delete All + Create New)
        // Only trigger if productionInputs is provided (not undefined)
        if (productionInputs && Array.isArray(productionInputs)) {
            return prisma.$transaction(async (tx) => {
                // 1. Update basic info
                const cycle = await tx.plantingCycle.update({
                    where: { id },
                    data: updateData,
                });

                // 2. Replace inputs
                await tx.productionInput.deleteMany({ where: { plantingCycleId: id } });

                if (productionInputs.length > 0) {
                    await tx.productionInput.createMany({
                        data: productionInputs.map(input => ({
                            plantingCycleId: id,
                            type: input.type,
                            name: input.name,
                            sourceType: input.sourceType,
                            usageStage: input.usageStage,
                            quantity: input.quantity ? parseFloat(input.quantity) : null,
                            unit: input.unit,
                            frequency: input.frequency,
                            isOrganic: input.isOrganic || false,
                            manufacturer: input.manufacturer,
                            certNumber: input.certNumber,
                        })),
                    });
                }

                // 3. Return updated cycle with inputs
                return tx.plantingCycle.findUnique({
                    where: { id },
                    include: { productionInputs: true },
                });
            });
        }

        // Standard update if no inputs provided
        return prisma.plantingCycle.update({
            where: { id },
            data: updateData,
            include: { productionInputs: true },
        });
    }

    /**
     * Generate individual PlantUnit records for a cycle (Post-Approval)
     * @param {string} cycleId
     */
    async generatePlantUnits(cycleId) {
        return prisma.$transaction(async (tx) => {
            // 1. Get Cycle info
            const cycle = await tx.plantingCycle.findUnique({
                where: { id: cycleId },
                include: { plantUnits: { select: { id: true } } }, // Check existing units
            });

            if (!cycle) {throw new Error('Planting cycle not found');}

            // 2. Check if units already exist
            if (cycle.plantUnits && cycle.plantUnits.length > 0) {
                return {
                    success: false,
                    message: `Units already generated (${cycle.plantUnits.length} units)`,
                    count: cycle.plantUnits.length,
                };
            }

            // 3. Determine count (Internal Estimate)
            const count = cycle.estimatedPlantCount || 0;
            if (count <= 0) {
                throw new Error('Estimated plant count is 0 or invalid');
            }

            // 4. Generate Units in Batch
            // Format: CYCLE-[Last4]-TREE-[Index]
            const cycleCodeSuffix = cycle.id.slice(-4).toUpperCase();
            const year = new Date().getFullYear();

            // Prepare large data array
            const unitsData = Array.from({ length: count }, (_, i) => ({
                cycleId: cycle.id,
                code: `UNIT-${year}-${cycleCodeSuffix}-${String(i + 1).padStart(4, '0')}`,
                status: 'GROWING',
            }));

            // Use createMany for performance
            await tx.plantUnit.createMany({
                data: unitsData,
            });

            return {
                success: true,
                message: `Successfully generated ${count} plant units`,
                count: count,
            };
        });
    }
}


module.exports = new PlantingService();
