/**
 * Document Analysis Controller - API endpoints for document verification (Prisma Refactor)
 * 
 * POST /api/v2/documents/analyze - Analyze required documents
 * POST /api/v2/documents/validate - Validate uploaded documents
 * GET /api/v2/documents/requirements - Get base requirements
 */

const documentAnalysisService = require('../services/document-analysis-service');
const { prisma } = require('../services/prisma-database');

class DocumentAnalysisController {
    /**
     * GET /api/v2/documents/plants
     * Get all available plants for documentation
     */
    async getAvailablePlants(req, res) {
        try {
            const plants = await prisma.plantSpecies.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                    code: true,
                    nameTH: true,
                    nameEN: true,
                    group: true
                }
            });

            res.json({
                success: true,
                data: plants.map(p => ({
                    id: p.code,
                    code: p.code,
                    nameTH: p.nameTH,
                    nameEN: p.nameEN,
                    group: p.group
                }))
            });
        } catch (error) {
            console.error('Error fetching plants:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch plants',
                error: error.message
            });
        }
    }

    /**
     * GET /api/v2/documents/requirements/:plantId
     * Get base document requirements for a plant type
     */
    async getPlantRequirements(req, res) {
        try {
            const { plantId } = req.params;
            const { requestType = 'NEW' } = req.query;

            const requirements = await documentAnalysisService.getBaseRequirements(plantId, requestType.toUpperCase());

            res.json({
                success: true,
                data: requirements
            });
        } catch (error) {
            console.error('Error fetching requirements:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch requirements',
                error: error.message
            });
        }
    }

    /**
     * POST /api/v2/documents/analyze
     * Analyze required documents based on application data
     */
    async analyzeDocuments(req, res) {
        try {
            const { plantId, requestType, applicationData } = req.body;

            if (!plantId || !requestType) {
                return res.status(400).json({
                    success: false,
                    message: 'plantId and requestType are required'
                });
            }

            const analysis = await documentAnalysisService.analyzeRequiredDocuments(
                plantId,
                requestType.toUpperCase(),
                applicationData || {}
            );

            res.json({
                success: true,
                data: analysis
            });
        } catch (error) {
            console.error('Error analyzing documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to analyze documents',
                error: error.message
            });
        }
    }

    /**
     * POST /api/v2/documents/validate
     * Validate that all required documents have been uploaded
     */
    async validateDocuments(req, res) {
        try {
            const { uploadedDocs, requirements } = req.body;

            if (!Array.isArray(uploadedDocs) || !Array.isArray(requirements)) {
                return res.status(400).json({
                    success: false,
                    message: 'uploadedDocs and requirements must be arrays'
                });
            }

            const validation = documentAnalysisService.validateDocuments(uploadedDocs, requirements);

            res.json({
                success: true,
                data: validation
            });
        } catch (error) {
            console.error('Error validating documents:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to validate documents',
                error: error.message
            });
        }
    }

    /**
     * POST /api/v2/documents/verify
     * Verify an uploaded document using OCR and AI classification
     * Expects multipart/form-data with 'file' and 'expectedType' fields
     */
    async verifyDocument(req, res) {
        try {
            const { expectedType } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded. Use multipart/form-data with "file" field.'
                });
            }

            if (!expectedType) {
                return res.status(400).json({
                    success: false,
                    message: 'expectedType is required (e.g., ID_CARD, LAND_TITLE, HOUSE_REGISTRATION)'
                });
            }

            // Use file buffer for verification
            const verification = await documentAnalysisService.verifyUploadedDocument(
                file.buffer,
                expectedType.toUpperCase()
            );

            res.json({
                success: true,
                data: {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    verification
                }
            });
        } catch (error) {
            console.error('Error verifying document:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify document',
                error: error.message
            });
        }
    }
}

module.exports = new DocumentAnalysisController();
