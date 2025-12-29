/**
 * Renewal Controller
 * Handles application renewal process with pre-fill logic
 */

const Application = require('../models/ApplicationModel');
const ApplicationSnapshot = require('../models/ApplicationSnapshotModel');
const DocumentRequirement = require('../models/DocumentRequirementModel');
const response = require('../shared/response');
const logger = require('../shared/logger');

class RenewalController {
    /**
     * Get renewal data for pre-filling form
     * GET /api/v2/applications/:id/renewal-data
     */
    async getRenewalData(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Find the previous approved application
            const prevApp = await Application.findOne({
                _id: id,
                userId: userId,
                status: 'APPROVED',
            });

            if (!prevApp) {
                return response.error(
                    res,
                    'Application not found or not approved',
                    404
                );
            }

            // Get the latest snapshot (immutable record)
            const snapshot = await ApplicationSnapshot.getLatestSnapshot(prevApp._id);

            // Get document requirements for this plant type
            const docRequirements = await DocumentRequirement.getRequirementsForPlant(
                prevApp.plantId,
                'RENEW'
            );

            // Determine which documents need to be re-uploaded
            const documentsToUpdate = await this.getExpiredDocuments(prevApp, docRequirements);

            // Build pre-fill data
            const prefillData = {
                // Identity (locked)
                userId: prevApp.userId,

                // Establishment (editable)
                establishmentId: prevApp.establishmentId,

                // Plant (locked for renewal)
                plantId: prevApp.plantId,
                plantGroup: prevApp.plantGroup,

                // License info (may need update)
                licenseType: snapshot?.data?.licenseType,
                licenseNumber: snapshot?.data?.licenseNumber,
                licenseExpiry: snapshot?.data?.licenseExpiry,

                // Security (needs re-confirmation)
                securityMeasures: [], // Reset - user must re-confirm

                // Production (editable)
                productionData: snapshot?.data?.productionData,

                // GAP/Organic history
                hasGapHistory: snapshot?.data?.hasGapHistory,
                gapCertificateNumber: snapshot?.data?.gapCertificateNumber,
            };

            return response.success(res, 'Renewal data retrieved', {
                prefill: prefillData,
                previousApplicationId: prevApp._id,
                previousSubmittedAt: snapshot?.submittedAt,
                schemaVersion: snapshot?.schemaVersion,
                documentsToUpdate,
                lockedFields: ['plantId', 'userId'],
                editableFields: [
                    'establishmentId',
                    'licenseNumber',
                    'licenseExpiry',
                    'productionData',
                    'securityMeasures',
                ],
            });
        } catch (error) {
            logger.error('Renewal data retrieval error:', error);
            return response.error(res, 'Failed to retrieve renewal data', 500);
        }
    }

    /**
     * Get documents that have expired or need re-upload
     */
    async getExpiredDocuments(prevApp, docRequirements) {
        const expiredDocs = [];
        const now = new Date();
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

        for (const req of docRequirements) {
            // Find existing document for this requirement
            const existingDoc = prevApp.documents?.find(
                (d) => d.requirementId?.toString() === req._id?.toString()
            );

            if (!existingDoc) {
                // Document was never uploaded
                expiredDocs.push({
                    requirementId: req._id,
                    documentName: req.documentName,
                    documentNameTH: req.documentNameTH,
                    reason: 'MISSING',
                    isRequired: req.isRequired,
                });
            } else if (existingDoc.uploadedAt < oneYearAgo) {
                // Document is older than 1 year
                expiredDocs.push({
                    requirementId: req._id,
                    documentName: req.documentName,
                    documentNameTH: req.documentNameTH,
                    reason: 'EXPIRED',
                    isRequired: req.isRequired,
                    previousUploadAt: existingDoc.uploadedAt,
                });
            }
        }

        return expiredDocs;
    }

    /**
     * Submit renewal application
     * POST /api/v2/applications/renewal
     */
    async submitRenewal(req, res) {
        try {
            const { previousApplicationId, formData } = req.body;
            const userId = req.user.id;

            // Verify previous application exists and belongs to user
            const prevApp = await Application.findOne({
                _id: previousApplicationId,
                userId: userId,
                status: 'APPROVED',
            });

            if (!prevApp) {
                return response.error(
                    res,
                    'Previous application not found',
                    404
                );
            }

            // Create new renewal application
            const newApp = new Application({
                userId,
                establishmentId: formData.establishmentId || prevApp.establishmentId,
                plantId: prevApp.plantId, // Locked
                plantGroup: prevApp.plantGroup,
                requestType: 'RENEW',
                previousApplicationId: prevApp._id,
                status: 'SUBMITTED',
                formData: formData,
                submittedAt: new Date(),
            });

            await newApp.save();

            // Create immutable snapshot
            await ApplicationSnapshot.createSnapshot(
                newApp._id,
                formData,
                userId,
                prevApp.plantId,
                'RENEW'
            );

            logger.info(`Renewal application created: ${newApp._id}`);

            return response.success(res, 'Renewal submitted successfully', {
                applicationId: newApp._id,
                status: newApp.status,
                previousApplicationId: prevApp._id,
            }, 201);
        } catch (error) {
            logger.error('Renewal submission error:', error);
            return response.error(res, 'Failed to submit renewal', 500);
        }
    }
}

module.exports = new RenewalController();

