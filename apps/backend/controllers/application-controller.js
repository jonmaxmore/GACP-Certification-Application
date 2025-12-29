const Application = require('../models/ApplicationModel');
const Notification = require('../models/NotificationModel');
const PaymentTransaction = require('../models/PaymentTransaction');
const KsherService = require('../services/KsherService');

/**
 * GACP V2 Application Controller
 * Integrated with Ksher Payment Gateway
 */
class ApplicationController {

    // Stage 1: Create Draft (Auto-select Form 09/10)
    async createDraft(req, res) {
        try {
            console.log('[ApplicationController] createDraft called');
            console.log('[ApplicationController] req.user:', req.user);
            console.log('[ApplicationController] req.body:', JSON.stringify(req.body).substring(0, 500));

            // Updated to accept GACP V2 Data Payload
            const {
                farmId,
                formData,
                requestType,
                certificationType,
                objective,
                applicantType,
                applicantInfo,
                siteInfo
            } = req.body;

            if (!req.user || !req.user.id) {
                console.error('[ApplicationController] No user ID found in request');
                return res.status(401).json({ success: false, error: 'Unauthorized - no user found' });
            }

            // Map certificationType to valid enum values (schema expects array of ['CULTIVATION', 'PROCESSING'])
            let mappedCertType = [];
            if (certificationType === 'GACP' || !certificationType) {
                mappedCertType = ['CULTIVATION']; // Default for GACP
            } else if (Array.isArray(certificationType)) {
                mappedCertType = certificationType;
            } else {
                mappedCertType = [certificationType];
            }

            // Map objective to valid enum values (schema expects array)
            let mappedObjective = [];
            if (objective) {
                const objMap = { RESEARCH: 'RESEARCH', COMMERCIAL: 'COMMERCIAL_DOMESTIC', EXPORT: 'COMMERCIAL_EXPORT', OTHER: 'OTHER' };
                if (Array.isArray(objective)) {
                    mappedObjective = objective.map(o => objMap[o] || o);
                } else {
                    mappedObjective = [objMap[objective] || objective];
                }
            } else {
                mappedObjective = ['COMMERCIAL_DOMESTIC'];
            }

            const application = await Application.create({
                farmerId: req.user.id,
                status: 'DRAFT',
                data: {
                    farmId,
                    requestType: requestType ? requestType.toUpperCase() : 'NEW',
                    certificationType: mappedCertType,
                    objective: mappedObjective,
                    applicantType: applicantType ? applicantType.toUpperCase() : 'INDIVIDUAL',
                    applicantInfo,
                    siteInfo,
                    formData: formData || {}
                },
                forms: { form09: true, form10: true, form11: false }
            });
            console.log('[ApplicationController] Draft created:', application._id);

            // Invalidate user's applications cache
            const redisService = require('../services/RedisService');
            await redisService.del(`apps:user:${req.user.id}`);

            res.status(201).json({ success: true, data: application });
        } catch (error) {
            console.error('[ApplicationController] createDraft error:', error.message, error.stack);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Get current user's applications (with Redis caching)
    async getMyApplications(req, res) {
        try {
            const redisService = require('../services/RedisService');
            const cacheKey = `apps:user:${req.user.id}`;

            // Try cache first
            const cached = await redisService.get(cacheKey);
            if (cached) {
                console.log('[ApplicationController] Cache HIT for', cacheKey);
                return res.json({
                    success: true,
                    data: cached.data,
                    total: cached.total,
                    cached: true
                });
            }

            // Cache miss - query database
            const applications = await Application.find({ farmerId: req.user.id })
                .sort({ createdAt: -1 })
                .select('applicationNumber status data.applicantInfo.name data.formData.plantId createdAt')
                .lean();

            const result = { data: applications, total: applications.length };

            // Store in cache (60 seconds TTL)
            await redisService.set(cacheKey, result, 60);
            console.log('[ApplicationController] Cache SET for', cacheKey);

            res.json({
                success: true,
                data: applications,
                total: applications.length,
                cached: false
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Stage 1: Pre-Submission Review (Web View Trigger)
    async confirmReview(req, res) {
        try {
            const { id } = req.params;
            const app = await Application.findById(id);

            // Logic: Unlock Payment 1
            app.status = 'PAYMENT_1_PENDING';
            await app.save();

            res.json({ success: true, message: 'Review Confirmed. Payment Unlocked.', data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Generic Status Update (for step-11 demo payment and admin updates)
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            // Valid status values from schema
            const validStatuses = [
                'DRAFT', 'REVIEW_PENDING', 'PAYMENT_1_PENDING', 'SUBMITTED',
                'REVISION_REQ', 'PAYMENT_1_RETRY', 'PAYMENT_2_PENDING',
                'AUDIT_PENDING', 'AUDIT_SCHEDULED', 'CERTIFIED', 'REJECTED'
            ];

            if (!status || !validStatuses.includes(status.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            const app = await Application.findById(id);
            if (!app) {
                return res.status(404).json({ success: false, error: 'Application not found' });
            }

            // Update status
            const prevStatus = app.status;
            app.status = status.toUpperCase();
            app.lastModifiedBy = req.user?.id;

            // Store notes in data if provided
            if (notes) {
                app.data = app.data || {};
                app.data.statusNotes = notes;
            }

            await app.save();

            // Invalidate cache
            const redisService = require('../services/RedisService');
            await redisService.del(`apps:user:${app.farmerId}`);

            console.log(`[ApplicationController] Status updated: ${prevStatus} -> ${status}`);
            res.json({ success: true, data: app, previousStatus: prevStatus });
        } catch (error) {
            console.error('[ApplicationController] updateStatus error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Helper: Initiate Payment (Phase 1 or 2)
     */
    async _initiatePayment(app, phase, amount, res) {
        const txId = `PAY${phase}-${app.applicationNumber}-${Date.now()}`;
        const notifyUrl = `${process.env.API_BASE_URL}/api/v2/applications/ksher/webhook`;
        const redirectUrl = `${process.env.FRONTEND_URL}/payment-complete?tx=${txId}`;

        // 1. Create Transaction Record
        const tx = await PaymentTransaction.create({
            applicationId: app._id,
            transactionId: txId,
            amount: amount,
            status: 'PENDING'
        });

        // 2. Call Ksher API
        const ksherRes = await KsherService.createOrder(txId, amount, redirectUrl, notifyUrl);

        if (!ksherRes.ok) {
            tx.status = 'FAILED';
            tx.responsePayload = ksherRes.error;
            await tx.save();
            return res.status(500).json({ success: false, error: 'Payment Gateway Failed', details: ksherRes.error });
        }

        // 3. Update Transaction with Ksher Data
        tx.ksherOrderId = ksherRes.data.prepay_id || ksherRes.data.reserved_id; // Mapping varies by API
        tx.requestPayload = ksherRes.data;
        await tx.save();

        // 4. Update Application Link
        if (phase === 1) app.payment.phase1.transactionId = tx._id;
        else app.payment.phase2.transactionId = tx._id;
        await app.save();

        return res.json({
            success: true,
            message: 'Payment Initiated',
            data: {
                transactionId: txId,
                paymentUrl: ksherRes.data.order_content, // Redirect Link
                qrCode: ksherRes.data.code_url // QR Image URL
            }
        });
    }

    // Stage 2: Payment Phase 1 (Initiate)
    async submitPayment1(req, res) {
        try {
            const { id } = req.params;
            const app = await Application.findById(id);

            if (app.status !== 'PAYMENT_1_PENDING' && app.status !== 'PAYMENT_1_RETRY') {
                return res.status(400).json({ error: 'Invalid State for Payment 1' });
            }

            return this._initiatePayment(app, 1, 5000, res);

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Stage 4: Payment Phase 2 (Initiate)
    async submitPayment2(req, res) {
        try {
            const { id } = req.params;
            const app = await Application.findById(id);

            if (app.status !== 'PAYMENT_2_PENDING') {
                return res.status(400).json({ error: 'Invalid State for Payment 2' });
            }

            return this._initiatePayment(app, 2, 25000, res);

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Ksher Webhook Handler
     * Updates Payment Status when money is received
     */
    async ksherWebhook(req, res) {
        try {
            const data = req.body;
            const signature = data.sign;

            console.log('[Ksher Webhook] Received:', data);

            // 1. Verify Signature
            if (!KsherService.verifySignature(data, signature)) {
                console.error('[Ksher Webhook] Invalid Signature');
                return res.status(400).json({ result: 'FAIL', msg: 'Invalid Sign' });
            }

            // 2. Find Transaction
            const txId = data.mch_order_no;
            const tx = await PaymentTransaction.findOne({ transactionId: txId }).populate('applicationId');

            if (!tx) {
                return res.status(404).json({ result: 'FAIL', msg: 'Tx Not Found' });
            }

            // 3. Update Status
            if (data.result === 'SUCCESS') {
                tx.status = 'SUCCESS';
                tx.paidAt = new Date();
                tx.responsePayload = data;
                tx.paymentChannel = data.channel; // promptpay/creditcard
                await tx.save();

                const app = tx.applicationId;

                // Determine Phase (Check prefix PAY1 or PAY2)
                if (txId.startsWith('PAY1')) {
                    app.payment.phase1.status = 'PAID';
                    app.payment.phase1.paidAt = new Date();
                    app.status = 'SUBMITTED'; // Auto-move to next step

                    // Notify Officer
                    Notification.create({
                        recipientId: 'OFFICER', role: 'OFFICER',
                        title: 'มีคำขอใหม่ (New Application)',
                        message: `คำขอ ${app.applicationNumber} ชำระเงิน Phase 1 แล้ว (${data.channel})`,
                        applicationId: app._id
                    });
                } else if (txId.startsWith('PAY2')) {
                    app.payment.phase2.status = 'PAID';
                    app.payment.phase2.paidAt = new Date();
                    app.status = 'AUDIT_PENDING'; // Auto-move

                    Notification.create({
                        recipientId: 'ADMIN', role: 'ADMIN',
                        title: 'ชำระเงิน Phase 2 สำเร็จ',
                        message: `คำขอ ${app.applicationNumber} พร้อมสำหรับการนัดหมาย Auditor`,
                        applicationId: app._id
                    });
                }

                await app.save();
                return res.json({ result: 'SUCCESS', msg: 'OK' });

            } else {
                tx.status = 'FAILED';
                tx.responsePayload = data;
                await tx.save();
                return res.json({ result: 'SUCCESS', msg: 'Ack Failed' }); // Ack receipt even if fail
            }

        } catch (error) {
            console.error('[Ksher Webhook] Error:', error);
            res.status(500).json({ result: 'FAIL', msg: error.message });
        }
    }

    // Check Status Helper (Polling)
    async checkPaymentStatus(req, res) {
        try {
            const { id } = req.params; // Transaction ID or App ID? Let's use TxID for precision
            const tx = await PaymentTransaction.findOne({ transactionId: id });
            if (!tx) return res.status(404).json({ success: false });

            res.json({ success: true, status: tx.status });
        } catch (e) {
            res.status(500).json({ success: false });
        }
    }

    // --- READ-ONLY METHODS (Not Changed) ---
    // Stage 3: Get Pending Reviews (Officer Dashboard)
    async getPendingReviews(req, res) {
        try {
            const applications = await Application.find({ status: 'SUBMITTED' });
            res.json({ success: true, data: applications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Auditor: Get Assigned Inspections
    async getAuditorAssignments(req, res) {
        try {
            // Find apps where audit.auditorId matches current user
            const applications = await Application.find({
                'audit.auditorId': req.user.id,
                status: { $in: ['AUDIT_SCHEDULED', 'AUDIT_PENDING'] } // Broaden match if needed
            });
            res.json({ success: true, data: applications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Get Single Application by ID
    async getApplicationById(req, res) {
        try {
            const app = await Application.findById(req.params.id);
            if (!app) return res.status(404).json({ success: false, error: 'Not Found' });
            res.json({ success: true, data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Stage 3: Officer Review
    async reviewDocument(req, res) {
        try {
            const { id } = req.params;
            const { action, comment } = req.body;
            const app = await Application.findById(id);

            // Validate Status
            if (app.status !== 'SUBMITTED' && app.status !== 'REVISION_REQ') {
                return res.status(400).json({ success: false, error: 'Invalid Application Status for Review' });
            }

            if (action === 'APPROVE') {
                app.status = 'PAYMENT_2_PENDING';
            } else if (action === 'REJECT') {
                app.rejectCount += 1;
                if (app.rejectCount >= 3) {
                    app.status = 'PAYMENT_1_RETRY';
                    app.payment.phase1.status = 'PENDING';
                } else {
                    app.status = 'REVISION_REQ';
                }
            }
            await app.save();
            Notification.create({
                recipientId: app.farmerId, role: 'FARMER',
                title: action === 'APPROVE' ? 'เอกสารผ่านการอนุมัติ (Approved)' : 'เอกสารต้องแก้ไข (Revision Request)',
                message: action === 'APPROVE' ? 'กรุณาดำเนินการชำระเงิน Phase 2' : `เหตุผล: ${comment || 'เอกสารไม่ถูกต้อง'}`,
                applicationId: app._id
            });
            res.json({ success: true, data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Stage 5: Scheduling
    async assignAuditor(req, res) {
        try {
            const { id } = req.params;
            const { auditorId, date } = req.body;
            const app = await Application.findById(id);

            // Validate Status
            if (app.status !== 'AUDIT_PENDING' && app.status !== 'AUDIT_SCHEDULED') {
                return res.status(400).json({ success: false, error: 'Invalid Status for Assignment' });
            }

            app.audit = { auditorId, scheduledDate: date, status: 'SCHEDULED' };
            app.status = 'AUDIT_SCHEDULED';

            await app.save();

            // Notify Auditor
            Notification.create({
                recipientId: auditorId, role: 'AUDITOR',
                title: 'คุณมีงานตรวจสอบใหม่ (New Assignment)',
                message: `กรุณาตรวจสอบฟาร์มวันที่ ${date}`,
                applicationId: app._id
            });

            res.json({ success: true, message: 'Auditor Assigned.', data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Stage 6: Audit Result & Certification
    async submitAuditResult(req, res) {
        try {
            const { id } = req.params;
            const { result, notes } = req.body; // 'PASS' or 'FAIL'
            const app = await Application.findById(id);

            // Validate Status
            if (app.status !== 'AUDIT_SCHEDULED') {
                return res.status(400).json({ success: false, error: 'Application must be Scheduled for Audit first' });
            }

            if (result === 'PASS') {
                app.status = 'CERTIFIED';
            } else {
                app.status = 'REJECTED';
            }

            app.audit.result = result;
            app.audit.notes = notes;
            app.audit.completedAt = new Date();

            await app.save();

            // Notify Farmer
            Notification.create({
                recipientId: app.farmerId,
                role: 'FARMER',
                title: result === 'PASS' ? 'ยินดีด้วย! ผ่านการรับรอง (Certified)' : 'ไม่ผ่านการรับรอง (Audit Failed)',
                message: result === 'PASS' ? 'ใบรับรองของคุณถูกออกแล้ว' : `หมายเหตุ/ปรับปรุง: ${notes}`,
                applicationId: app._id
            });

            res.json({ success: true, message: `Application ${app.status}`, data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Fetch Notifications
    async getNotifications(req, res) {
        try {
            const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
            res.json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Admin/Officer Dashboard Stats
    async getDashboardStats(req, res) {
        try {
            const total = await Application.countDocuments({});
            const pending = await Application.countDocuments({ status: { $in: ['SUBMITTED', 'AUDIT_PENDING', 'PAYMENT_1_PENDING'] } });
            const approved = await Application.countDocuments({ status: 'CERTIFIED' });

            // Simple Revenue Aggregation
            const paidPhase1 = await Application.countDocuments({ 'payment.phase1.status': 'PAID' });
            const paidPhase2 = await Application.countDocuments({ 'payment.phase2.status': 'PAID' });
            const revenue = (paidPhase1 * 5000) + (paidPhase2 * 25000);

            res.json({
                success: true,
                data: {
                    total,
                    pending,
                    approved,
                    revenue
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    /**
     * Admin Force Update Status
     * PATCH /:id/status
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            // TODO: checkPermission('ADMIN') - dependent on middleware setup
            // For now, allow authenticated users (Logic should strictly be Admin only)

            const app = await Application.findById(id);
            if (!app) return res.status(404).json({ success: false, error: 'Application Not Found' });

            // Validate Status Enum
            if (!Application.schema.path('status').enumValues.includes(status)) {
                return res.status(400).json({ success: false, error: `Invalid Status. Allowed: ${Application.schema.path('status').enumValues.join(', ')}` });
            }

            app.status = status;
            // app.notes = notes; // If notes field exists
            await app.save();

            res.json({ success: true, message: 'Status Updated', data: app });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Document Upload Handler
    // POST /applications/:id/documents/:docType
    async uploadDocument(req, res) {
        try {
            const { id, docType } = req.params;
            const app = await Application.findById(id);

            if (!app) {
                return res.status(404).json({
                    success: false,
                    error: 'Application not found'
                });
            }

            // Check ownership
            if (app.farmerId.toString() !== req.user.id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }

            // Handle file upload (multer middleware should process this)
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            // Store document reference in application
            if (!app.documents) {
                app.documents = [];
            }

            // Add or update document entry
            const docEntry = {
                type: docType,
                filename: req.file.filename || req.file.originalname,
                path: req.file.path || `/uploads/${req.file.filename}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
                uploadedAt: new Date()
            };

            // Replace if same type exists
            const existingIndex = app.documents.findIndex(d => d.type === docType);
            if (existingIndex >= 0) {
                app.documents[existingIndex] = docEntry;
            } else {
                app.documents.push(docEntry);
            }

            await app.save();

            res.json({
                success: true,
                message: 'Document uploaded successfully',
                data: docEntry
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ApplicationController();

