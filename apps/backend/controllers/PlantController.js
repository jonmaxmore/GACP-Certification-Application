/**
 * Plant Controller - API endpoints for plant data
 * 
 * GET /api/v2/plants - Get all active plants
 * GET /api/v2/plants/:plantId - Get single plant by ID
 * GET /api/v2/plants/:plantId/documents - Get document requirements for plant
 */

const PlantMaster = require('../models/PlantMasterModel');
const DocumentRequirement = require('../models/DocumentRequirementModel');

class PlantController {
    /**
     * GET /api/v2/plants
     * Get all active plants
     */
    async getAllPlants(req, res) {
        try {
            const { group } = req.query;

            let plants;
            if (group) {
                plants = await PlantMaster.getPlantsByGroup(group.toUpperCase());
            } else {
                plants = await PlantMaster.getActivePlants();
            }

            res.json({
                success: true,
                data: plants,
                count: plants.length,
            });
        } catch (error) {
            console.error('Error fetching plants:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plants',
                error: error.message,
            });
        }
    }

    /**
     * GET /api/v2/plants/:plantId
     * Get single plant by ID
     */
    async getPlantById(req, res) {
        try {
            const { plantId } = req.params;

            const plant = await PlantMaster.getPlantById(plantId);

            if (!plant) {
                return res.status(404).json({
                    success: false,
                    message: `Plant not found: ${plantId}`,
                });
            }

            res.json({
                success: true,
                data: plant,
            });
        } catch (error) {
            console.error('Error fetching plant:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plant',
                error: error.message,
            });
        }
    }

    /**
     * GET /api/v2/plants/:plantId/documents
     * Get document requirements for a plant
     */
    async getPlantDocuments(req, res) {
        try {
            const { plantId } = req.params;
            const { requestType = 'NEW' } = req.query;

            // Verify plant exists
            const plant = await PlantMaster.getPlantById(plantId);
            if (!plant) {
                return res.status(404).json({
                    success: false,
                    message: `Plant not found: ${plantId}`,
                });
            }

            const documents = await DocumentRequirement.getRequirementsForPlant(plantId, requestType.toUpperCase());

            // Group by category
            const grouped = documents.reduce((acc, doc) => {
                const category = doc.category || 'OTHER';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(doc);
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    plantId: plant.plantId,
                    plantName: plant.nameTH,
                    requestType: requestType.toUpperCase(),
                    documents: documents,
                    groupedByCategory: grouped,
                },
                count: documents.length,
            });
        } catch (error) {
            console.error('Error fetching plant documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plant documents',
                error: error.message,
            });
        }
    }

    /**
     * GET /api/v2/plants/:plantId/production-inputs
     * Get production input fields for a plant
     */
    async getPlantProductionInputs(req, res) {
        try {
            const { plantId } = req.params;

            const plant = await PlantMaster.getPlantById(plantId);

            if (!plant) {
                return res.status(404).json({
                    success: false,
                    message: `Plant not found: ${plantId}`,
                });
            }

            res.json({
                success: true,
                data: {
                    plantId: plant.plantId,
                    plantName: plant.nameTH,
                    group: plant.group,
                    units: plant.units,
                    plantParts: plant.plantParts,
                    productionInputs: plant.productionInputs,
                    securityRequirements: plant.securityRequirements,
                },
            });
        } catch (error) {
            console.error('Error fetching plant production inputs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plant production inputs',
                error: error.message,
            });
        }
    }

    /**
     * GET /api/v2/plants/summary
     * Get summary of all plants (for dropdown selections)
     */
    async getPlantsSummary(req, res) {
        try {
            const plants = await PlantMaster.getActivePlants();

            const summary = plants.map(p => ({
                id: p.plantId,
                nameTH: p.nameTH,
                nameEN: p.nameEN,
                group: p.group,
                requiresLicense: p.requiresStrictLicense,
                unit: p.units[0] || 'ไร่',
            }));

            res.json({
                success: true,
                data: summary,
                count: summary.length,
            });
        } catch (error) {
            console.error('Error fetching plants summary:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plants summary',
                error: error.message,
            });
        }
    }
}

module.exports = new PlantController();
