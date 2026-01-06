/**
 * Document Analysis Controller
 * API endpoints for document requirement analysis
 */

const DocumentAnalysisService = require('../services/document-analysis-service');
const PlantMaster = require('../models-mongoose-legacy/PlantMaster-model');

/**
 * GET /api/v2/documents/requirements/:plantId
 * Get base document requirements for a plant type
 */
async function getPlantRequirements(req, res) {
    try {
        const { plantId } = req.params;
        const { requestType = 'NEW' } = req.query;

        // Validate plant exists
        const plant = await PlantMaster.getPlantById(plantId);
        if (!plant) {
            return res.status(404).json({
                success: false,
                error: 'PLANT_NOT_FOUND',
                message: `Plant with ID '${plantId}' not found`,
            });
        }

        const requirements = await DocumentAnalysisService.getBaseRequirements(plantId, requestType);

        return res.json({
            success: true,
            data: {
                plantId: plant.plantId,
                plantName: plant.nameEN,
                plantNameTH: plant.nameTH,
                plantGroup: plant.group,
                requestType,
                requirements,
            },
        });
    } catch (error) {
        console.error('[DocumentAnalysisController] getPlantRequirements error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to fetch document requirements',
        });
    }
}

/**
 * POST /api/v2/documents/analyze
 * Analyze required documents based on application data
 */
async function analyzeDocuments(req, res) {
    try {
        const { plantId, requestType = 'NEW', applicationData = {} } = req.body;

        if (!plantId) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'plantId is required',
            });
        }

        const analysis = await DocumentAnalysisService.analyzeRequiredDocuments(
            plantId,
            requestType,
            applicationData
        );

        return res.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error('[DocumentAnalysisController] analyzeDocuments error:', error);

        if (error.message?.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'PLANT_NOT_FOUND',
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to analyze document requirements',
        });
    }
}

/**
 * POST /api/v2/documents/validate
 * Validate that all required documents have been uploaded
 */
async function validateDocuments(req, res) {
    try {
        const { plantId, requestType = 'NEW', applicationData = {}, uploadedDocs = [] } = req.body;

        if (!plantId) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: 'plantId is required',
            });
        }

        const analysis = await DocumentAnalysisService.analyzeRequiredDocuments(
            plantId,
            requestType,
            applicationData
        );

        const validation = DocumentAnalysisService.validateDocuments(
            uploadedDocs,
            analysis.documents
        );

        return res.json({
            success: true,
            data: validation,
        });
    } catch (error) {
        console.error('[DocumentAnalysisController] validateDocuments error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to validate documents',
        });
    }
}

/**
 * GET /api/v2/documents/plants
 * Get all available plants for document configuration
 */
async function getAvailablePlants(req, res) {
    try {
        const plants = await PlantMaster.getActivePlants();

        return res.json({
            success: true,
            data: plants.map(p => ({
                plantId: p.plantId,
                nameEN: p.nameEN,
                nameTH: p.nameTH,
                group: p.group,
                requiresStrictLicense: p.requiresStrictLicense,
            })),
        });
    } catch (error) {
        console.error('[DocumentAnalysisController] getAvailablePlants error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: 'Failed to fetch plants',
        });
    }
}

module.exports = {
    getPlantRequirements,
    analyzeDocuments,
    validateDocuments,
    getAvailablePlants,
};

