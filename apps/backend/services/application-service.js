const { prisma } = require('./prisma-database');
const feeService = require('./fee-service');

/**
 * Service for managing GACP Applications
 * Encapsulates all business logic for creation, updates, and retrieval.
 */
class ApplicationService {

    /**
     * Create or Update a Draft Application
     * @param {string} farmerId 
     * @param {object} data 
     * @returns {Promise<object>} Created/Updated Application
     */
    async saveDraft(farmerId, data) {
        const {
            plantId, plantName,
            purpose, areaType, serviceType,
            applicantData, locationData, productionData,
            documents, youtubeUrl,
            requestedInspectionDate,
            estimatedProcessingDays, estimatedFee,
        } = data;

        // Validation
        if (!plantId || !serviceType) {
            throw new Error('Missing required fields: plantId, serviceType');
        }

        // Check for existing draft
        const existingDraft = await prisma.application.findFirst({
            where: {
                farmerId,
                status: 'DRAFT',
            },
        });

        // Generate application number if new
        const year = new Date().getFullYear() + 543;
        const globalCount = await prisma.application.count();
        const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
        const applicationNumber = `GACP-${year}-${String(globalCount + 1).padStart(5, '0')}-${timestamp}`;

        const applicationData = {
            farmerId,
            applicationNumber: existingDraft ? undefined : applicationNumber, // Don't overwrite if exists
            serviceType,
            areaType,
            status: 'SUBMITTED', // Direct submission as per previous logic (or DRAFT if saved?) - Logic borrowed from route said "SUBMITTED"
            phase1Amount: feeService.calculatePhase1Fee().total,
            formData: {
                plantId,
                plantName: plantName || plantId,
                purpose,
                applicantData,
                locationData,
                productionData,
                documents,
                youtubeUrl,
                estimatedFee,
                estimatedProcessingDays,
                requestedInspectionDate,
                submissionDate: new Date(),
                fees: {
                    phase1: feeService.calculatePhase1Fee(),
                    phase2: null,
                },
            },
        };

        let application;
        if (existingDraft) {
            application = await prisma.application.update({
                where: { id: existingDraft.id },
                data: applicationData,
            });
        } else {
            application = await prisma.application.create({
                data: applicationData,
            });
        }

        // Auto-generate Invoice if Submitted
        if (application.status === 'SUBMITTED') {
            await this._generatePhase1Invoice(application, farmerId);
        }

        return application;
    }

    /**
     * Helper: Generate Phase 1 Invoice
     * @private
     */
    async _generatePhase1Invoice(application, farmerId) {
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                applicationId: application.id,
                serviceType: 'APPLICATION_FEE',
                isDeleted: false,
            },
        });

        if (!existingInvoice) {
            const year = new Date().getFullYear() + 543;
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const invoiceNumber = `INV-P1-${year}-${random}`;
            const phase1Fee = feeService.calculatePhase1Fee();

            await prisma.invoice.create({
                data: {
                    invoiceNumber,
                    applicationId: application.id,
                    farmerId,
                    serviceType: 'APPLICATION_FEE',
                    totalAmount: phase1Fee.total,
                    subtotal: phase1Fee.total,
                    status: 'pending',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    items: phase1Fee.items,
                    notes: 'Auto-generated Phase 1 Invoice (Application Fee)',
                },
            });
        }
    }

    /**
     * Get Current Draft for Farmer
     * @param {string} farmerId 
     */
    async getDraft(farmerId) {
        return prisma.application.findFirst({
            where: { farmerId, status: 'DRAFT' },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get All Applications for Farmer
     * @param {string} farmerId 
     */
    async getFarmerApplications(farmerId) {
        return prisma.application.findMany({
            where: { farmerId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    /**
     * Get Application by ID (With Ownership Check)
     * @param {string} id 
     * @param {string} farmerId 
     */
    async getById(id, farmerId) {
        const where = { id };
        if (farmerId) where.farmerId = farmerId;

        return prisma.application.findFirst({
            where,
            include: {
                farmer: {
                    select: { firstName: true, lastName: true, email: true, phoneNumber: true, province: true }
                }
            }
        });
    }
}

module.exports = new ApplicationService();
