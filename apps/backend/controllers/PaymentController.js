/**
 * Payment Controller
 * Handles payment document operations for GACP applications
 */

const logger = require('../shared/logger');
const PaymentDocument = require('../models/PaymentDocument');
// ApplicationModel may not exist in development - handle gracefully
let Application;
try {
    Application = require('../models/ApplicationModel');
} catch (e) {
    logger.warn('ApplicationModel not found, payment document auto-generation will use demo data');
    Application = null;
}

class PaymentController {
    /**
     * Get user's payment documents
     * GET /api/v2/payments/my
     */
    async getMyPayments(req, res) {
        try {
            const userId = req.user?.id || req.user?._id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            // Get payment documents for this user
            let documents = await PaymentDocument.find({ userId })
                .sort({ createdAt: -1 })
                .lean();

            // If no documents exist, generate from applications
            if (documents.length === 0) {
                documents = await this.generateDocumentsFromApplications(userId);
            }

            // Transform to frontend format
            const formattedDocs = documents.map(doc => ({
                id: doc._id,
                type: doc.type,
                documentNumber: doc.documentNumber,
                applicationId: doc.applicationId?.toString() || doc.applicationId,
                amount: doc.amount,
                status: doc.status,
                createdAt: doc.issueDate || doc.createdAt,
                paidAt: doc.paidAt || null
            }));

            res.json({
                success: true,
                data: formattedDocs
            });
        } catch (error) {
            logger.error('Error fetching payment documents:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get single payment document by ID
     * GET /api/v2/payments/:id
     */
    async getPaymentById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || req.user?._id;

            const document = await PaymentDocument.findOne({ _id: id, userId })
                .populate('applicationId', 'applicationNumber')
                .lean();

            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            res.json({
                success: true,
                data: document
            });
        } catch (error) {
            logger.error('Error fetching payment document:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Generate payment documents from existing applications
     */
    async generateDocumentsFromApplications(userId) {
        try {
            // Find user's applications
            const applications = await Application.find({
                $or: [
                    { userId: userId },
                    { 'user': userId },
                    { 'applicant.userId': userId }
                ]
            }).lean();

            if (applications.length === 0) {
                return [];
            }

            const documents = [];
            const FEE_PHASE1 = 5000; // ค่าตรวจสอบคำขอเบื้องต้น
            const FEE_PHASE2 = 25000; // ค่ารับรองมาตรฐาน

            for (const app of applications) {
                const appId = app._id;

                // Generate QUOTATION (always)
                const quotationNumber = await PaymentDocument.generateDocumentNumber('QUOTATION');
                const quotation = await PaymentDocument.create({
                    type: 'QUOTATION',
                    documentNumber: quotationNumber,
                    applicationId: appId,
                    userId,
                    phase: 1,
                    amount: FEE_PHASE1 + FEE_PHASE2,
                    items: [
                        { order: 1, description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น', quantity: 1, unit: 'ต่อคำขอ', unitPrice: FEE_PHASE1, amount: FEE_PHASE1 },
                        { order: 2, description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน', quantity: 1, unit: 'ต่อคำขอ', unitPrice: FEE_PHASE2, amount: FEE_PHASE2 }
                    ],
                    status: 'APPROVED',
                    recipientName: app.applicantName || app.companyName || 'ผู้ยื่นคำขอ',
                    issueDate: app.createdAt
                });
                documents.push(quotation);

                // Generate INVOICE Phase 1 (if app is submitted)
                if (app.status && app.status !== 'DRAFT') {
                    const invoiceNumber = await PaymentDocument.generateDocumentNumber('INVOICE');
                    const invoice = await PaymentDocument.create({
                        type: 'INVOICE',
                        documentNumber: invoiceNumber,
                        applicationId: appId,
                        userId,
                        phase: 1,
                        amount: FEE_PHASE1,
                        items: [
                            { order: 1, description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น (งวดที่ 1)', quantity: 1, unit: 'ต่อคำขอ', unitPrice: FEE_PHASE1, amount: FEE_PHASE1 }
                        ],
                        status: app.payment?.phase1?.status === 'PAID' ? 'DELIVERED' : 'PENDING',
                        recipientName: app.applicantName || app.companyName || 'ผู้ยื่นคำขอ',
                        issueDate: app.createdAt,
                        dueDate: new Date(new Date(app.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
                    });
                    documents.push(invoice);

                    // Generate RECEIPT if Phase 1 paid
                    if (app.payment?.phase1?.status === 'PAID') {
                        const receiptNumber = await PaymentDocument.generateDocumentNumber('RECEIPT');
                        const receipt = await PaymentDocument.create({
                            type: 'RECEIPT',
                            documentNumber: receiptNumber,
                            applicationId: appId,
                            userId,
                            phase: 1,
                            amount: FEE_PHASE1,
                            relatedInvoiceId: invoice._id,
                            items: invoice.items,
                            status: 'ISSUED',
                            recipientName: app.applicantName || app.companyName || 'ผู้ยื่นคำขอ',
                            issueDate: app.payment?.phase1?.paidAt || new Date(),
                            paidAt: app.payment?.phase1?.paidAt || new Date()
                        });
                        documents.push(receipt);
                    }
                }
            }

            logger.info(`Generated ${documents.length} payment documents for user ${userId}`);
            return documents;
        } catch (error) {
            logger.error('Error generating documents from applications:', error);
            return [];
        }
    }

    /**
     * Confirm payment with slip upload
     * POST /api/v2/payments/confirm
     */
    async confirmPayment(req, res) {
        try {
            const { applicationId, phase, amount } = req.body;
            const slipImage = req.file;
            const userId = req.user?.id || req.user?._id;

            if (!applicationId || !phase) {
                return res.status(400).json({
                    success: false,
                    error: 'Application ID and phase are required'
                });
            }

            logger.info(`Processing payment confirmation for app ${applicationId}, phase ${phase}`);

            // Find the invoice
            const invoice = await PaymentDocument.findOne({
                applicationId,
                type: 'INVOICE',
                phase: parseInt(phase),
                status: 'PENDING'
            });

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found or already paid'
                });
            }

            // Update invoice status
            invoice.status = 'DELIVERED';
            invoice.paidAt = new Date();
            await invoice.save();

            // Generate receipt
            const receiptNumber = await PaymentDocument.generateDocumentNumber('RECEIPT');
            const receipt = await PaymentDocument.create({
                type: 'RECEIPT',
                documentNumber: receiptNumber,
                applicationId,
                userId,
                phase: parseInt(phase),
                amount: invoice.amount,
                relatedInvoiceId: invoice._id,
                items: invoice.items,
                status: 'ISSUED',
                recipientName: invoice.recipientName,
                issueDate: new Date(),
                paidAt: new Date(),
                note: slipImage ? `Slip: ${slipImage.filename}` : null
            });

            res.json({
                success: true,
                data: {
                    invoice,
                    receipt,
                    message: 'Payment confirmed successfully'
                }
            });
        } catch (error) {
            logger.error('Payment confirmation error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();
