/**
 * Field Audit Controller
 * API endpoints for field audit operations
 * Based on field_audit_system_design.md
 */

const FieldAuditService = require('../services/FieldAuditService');
const AuditChecklistTemplate = require('../models/AuditChecklistTemplateModel');
const AuditReportService = require('../services/pdf/AuditReportService');
const CARReportService = require('../services/pdf/CARReportService');
const PhotoUploadService = require('../services/media/PhotoUploadService');
const SignatureService = require('../services/media/SignatureService');
const { createLogger } = require('../shared/logger');
const logger = createLogger('field-audit-controller');

class FieldAuditController {
    /**
     * Create new audit
     * POST /api/v2/field-audits
     */
    async createAudit(req, res) {
        try {
            const {
                applicationId,
                templateType,
                auditType,
                auditMode,
                auditorId,
                scheduledDate,
                scheduledTime,
            } = req.body;

            if (!applicationId || !auditorId || !scheduledDate) {
                return res.status(400).json({
                    success: false,
                    message: 'applicationId, auditorId, and scheduledDate are required',
                });
            }

            const result = await FieldAuditService.createAudit({
                applicationId,
                templateType,
                auditType,
                auditMode,
                auditorId,
                scheduledDate,
                scheduledTime,
                createdBy: req.user?.userId,
            });

            return res.status(201).json({
                success: true,
                message: 'สร้างการตรวจประเมินสำเร็จ',
                data: result,
            });
        } catch (error) {
            logger.error('Create audit error:', error);

            if (error.message === 'APPLICATION_CANCELLED_3_STRIKES') {
                return res.status(400).json({
                    success: false,
                    error: 'APPLICATION_CANCELLED_3_STRIKES',
                    message: 'คำขอถูกยกเลิกเนื่องจากไม่ผ่านการตรวจประเมิน 3 ครั้ง',
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการสร้างการตรวจประเมิน',
            });
        }
    }

    /**
     * Get audit by ID
     * GET /api/v2/field-audits/:id
     */
    async getAuditById(req, res) {
        try {
            const audit = await FieldAuditService.getAuditById(req.params.id);

            return res.json({
                success: true,
                data: audit,
            });
        } catch (error) {
            if (error.message === 'Audit not found') {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            logger.error('Get audit error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get audits by application
     * GET /api/v2/field-audits/application/:applicationId
     */
    async getAuditsByApplication(req, res) {
        try {
            const result = await FieldAuditService.getAuditsByApplication(req.params.applicationId);

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            logger.error('Get audits by application error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get auditor's schedule for today
     * GET /api/v2/field-audits/my-schedule
     */
    async getMySchedule(req, res) {
        try {
            const auditorId = req.user?.userId;
            const date = req.query.date ? new Date(req.query.date) : new Date();

            const audits = await FieldAuditService.getAuditorSchedule(auditorId, date);

            return res.json({
                success: true,
                data: {
                    date: date.toISOString().split('T')[0],
                    count: audits.length,
                    audits,
                },
            });
        } catch (error) {
            logger.error('Get auditor schedule error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Start audit (check-in)
     * POST /api/v2/field-audits/:id/start
     */
    async startAudit(req, res) {
        try {
            const { lat, lng, accuracy } = req.body;
            const auditorId = req.user?.userId;

            const audit = await FieldAuditService.startAudit(
                req.params.id,
                auditorId,
                { lat, lng, accuracy }
            );

            return res.json({
                success: true,
                message: 'เริ่มการตรวจประเมินแล้ว',
                data: {
                    auditId: audit._id,
                    auditNumber: audit.auditNumber,
                    status: audit.status,
                    startTime: audit.actualStartTime,
                },
            });
        } catch (error) {
            logger.error('Start audit error:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Submit single response
     * POST /api/v2/field-audits/:id/responses/:itemCode
     */
    async submitResponse(req, res) {
        try {
            const { id, itemCode } = req.params;
            const auditorId = req.user?.userId;
            const responseData = req.body;

            const response = await FieldAuditService.submitResponse(
                id,
                auditorId,
                itemCode,
                responseData
            );

            return res.json({
                success: true,
                data: response,
            });
        } catch (error) {
            logger.error('Submit response error:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Submit all responses (batch)
     * POST /api/v2/field-audits/:id/responses
     */
    async submitAllResponses(req, res) {
        try {
            const auditorId = req.user?.userId;
            const { responses } = req.body;

            if (!responses || !Array.isArray(responses)) {
                return res.status(400).json({
                    success: false,
                    message: 'responses array is required',
                });
            }

            const audit = await FieldAuditService.submitAllResponses(
                req.params.id,
                auditorId,
                responses
            );

            return res.json({
                success: true,
                message: `บันทึกคำตอบ ${responses.length} รายการสำเร็จ`,
                data: {
                    auditId: audit._id,
                    totalResponses: audit.responses.length,
                    completedResponses: audit.responses.filter(r => r.response !== 'PENDING').length,
                },
            });
        } catch (error) {
            logger.error('Submit all responses error:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Complete audit (check-out)
     * POST /api/v2/field-audits/:id/complete
     */
    async completeAudit(req, res) {
        try {
            const auditorId = req.user?.userId;
            const completionData = req.body;

            const result = await FieldAuditService.completeAudit(
                req.params.id,
                auditorId,
                completionData
            );

            return res.json({
                success: true,
                message: this._getResultMessage(result.result),
                data: result,
            });
        } catch (error) {
            logger.error('Complete audit error:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get result message in Thai
     */
    _getResultMessage(result) {
        const messages = {
            PASS: '✅ ผ่านการตรวจประเมิน',
            MINOR: '⚠️ ผ่านแบบมีเงื่อนไข - ต้องแก้ไขตาม CAR',
            MAJOR: '❌ ไม่ผ่านการตรวจประเมิน',
            CRITICAL_FAIL: '🚫 ไม่ผ่าน - พบข้อบกพร่องร้ายแรง',
        };
        return messages[result] || 'ตรวจประเมินเสร็จสิ้น';
    }

    /**
     * Sync offline audit
     * POST /api/v2/field-audits/:id/sync
     */
    async syncOfflineAudit(req, res) {
        try {
            const offlineData = req.body;

            const audit = await FieldAuditService.syncOfflineAudit(
                req.params.id,
                offlineData
            );

            return res.json({
                success: true,
                message: 'ซิงค์ข้อมูลสำเร็จ',
                data: {
                    auditId: audit._id,
                    syncedAt: audit.syncedAt,
                },
            });
        } catch (error) {
            logger.error('Sync offline audit error:', error);
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get audit statistics
     * GET /api/v2/field-audits/stats
     */
    async getStats(req, res) {
        try {
            const { startDate, endDate, auditorId } = req.query;

            const stats = await FieldAuditService.getAuditStats({
                startDate,
                endDate,
                auditorId,
            });

            return res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            logger.error('Get stats error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get checklist templates
     * GET /api/v2/field-audits/templates
     */
    async getTemplates(req, res) {
        try {
            const { type, plantType } = req.query;

            const query = { isActive: true };
            if (type) query.templateType = type;
            if (plantType) query.plantType = plantType;

            const templates = await AuditChecklistTemplate.find(query)
                .select('templateCode name nameTh templateType plantType totalItems version')
                .sort({ templateType: 1, version: -1 });

            return res.json({
                success: true,
                data: templates,
            });
        } catch (error) {
            logger.error('Get templates error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get template by code
     * GET /api/v2/field-audits/templates/:code
     */
    async getTemplateByCode(req, res) {
        try {
            const template = await AuditChecklistTemplate.findOne({
                templateCode: req.params.code,
                isActive: true,
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบ Template',
                });
            }

            return res.json({
                success: true,
                data: template,
            });
        } catch (error) {
            logger.error('Get template error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Download audit report as PDF
     * GET /api/v2/field-audits/:id/report
     */
    async downloadReport(req, res) {
        try {
            const audit = await FieldAuditService.getAuditById(req.params.id);

            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            // Check if audit is completed
            if (audit.status !== 'COMPLETED') {
                return res.status(400).json({
                    success: false,
                    message: 'สามารถออกรายงานได้เฉพาะการตรวจประเมินที่เสร็จสิ้นแล้ว',
                });
            }

            // Generate PDF
            const pdfBuffer = await AuditReportService.generateAuditReport(audit);

            // Set response headers for PDF download
            const filename = `AuditReport_${audit.auditNumber}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            logger.error('Download report error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน',
            });
        }
    }

    /**
     * Preview audit report (returns HTML)
     * GET /api/v2/field-audits/:id/report/preview
     */
    async previewReport(req, res) {
        try {
            const audit = await FieldAuditService.getAuditById(req.params.id);

            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            // Generate HTML preview
            const html = AuditReportService.generateAuditReportHTML(audit);

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
        } catch (error) {
            logger.error('Preview report error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Upload photo with GPS geotag
     * POST /api/v2/field-audits/:id/photos
     */
    async uploadPhoto(req, res) {
        try {
            const upload = PhotoUploadService.getMulterConfig().single('photo');

            upload(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'ไม่พบไฟล์รูปภาพ',
                    });
                }

                const { itemCode, lat, lng, accuracy } = req.body;

                // Validate GPS
                if (lat && lng && !PhotoUploadService.validateGPS(lat, lng)) {
                    return res.status(400).json({
                        success: false,
                        message: 'พิกัด GPS ไม่ถูกต้อง',
                    });
                }

                const photoRecord = await PhotoUploadService.savePhotoWithMetadata(
                    req.file,
                    {
                        auditId: req.params.id,
                        itemCode,
                        lat,
                        lng,
                        accuracy,
                        capturedBy: req.user?.userId,
                    }
                );

                return res.json({
                    success: true,
                    message: 'อัปโหลดรูปภาพสำเร็จ',
                    data: photoRecord,
                });
            });
        } catch (error) {
            logger.error('Upload photo error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get all photos for audit
     * GET /api/v2/field-audits/:id/photos
     */
    async getAuditPhotos(req, res) {
        try {
            const audit = await FieldAuditService.getAuditById(req.params.id);

            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            // Get photos from responses that have photos
            const photos = audit.responses
                .filter(r => r.photos && r.photos.length > 0)
                .flatMap(r => r.photos.map(p => ({
                    ...p,
                    itemCode: r.itemCode,
                })));

            return res.json({
                success: true,
                data: photos,
            });
        } catch (error) {
            logger.error('Get audit photos error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Submit digital signature
     * POST /api/v2/field-audits/:id/signature
     */
    async submitSignature(req, res) {
        try {
            const { signatureData, signerRole } = req.body;

            if (!signatureData || !signerRole) {
                return res.status(400).json({
                    success: false,
                    message: 'signatureData และ signerRole จำเป็น',
                });
            }

            if (!['FARMER', 'AUDITOR'].includes(signerRole)) {
                return res.status(400).json({
                    success: false,
                    message: 'signerRole ต้องเป็น FARMER หรือ AUDITOR',
                });
            }

            if (!SignatureService.validateSignatureData(signatureData)) {
                return res.status(400).json({
                    success: false,
                    message: 'ข้อมูลลายเซ็นไม่ถูกต้อง',
                });
            }

            const audit = await FieldAuditService.getAuditById(req.params.id);
            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            const signerName = signerRole === 'AUDITOR'
                ? `${audit.auditorName || req.user?.firstName}`
                : audit.farmerName;

            const signatureRecord = await SignatureService.saveSignature(
                signatureData,
                {
                    auditId: req.params.id,
                    signerId: req.user?.userId,
                    signerName,
                    signerRole,
                }
            );

            return res.json({
                success: true,
                message: 'บันทึกลายเซ็นสำเร็จ',
                data: signatureRecord,
            });
        } catch (error) {
            logger.error('Submit signature error:', error);
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Download CAR (Corrective Action Request) PDF
     * GET /api/v2/field-audits/:id/car
     */
    async downloadCAR(req, res) {
        try {
            const audit = await FieldAuditService.getAuditById(req.params.id);

            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลการตรวจประเมิน',
                });
            }

            // Get failed items
            const failedItems = audit.responses.filter(r => r.response === 'FAIL');

            if (failedItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ไม่มีรายการที่ต้องแก้ไข',
                });
            }

            // Generate CAR data
            const carData = {
                carNumber: CARReportService.generateCARNumber(audit.auditNumber),
                auditNumber: audit.auditNumber,
                applicationNumber: audit.applicationNumber,
                farmerName: audit.farmerName,
                farmName: audit.farmName,
                auditDate: audit.scheduledDate,
                auditorName: audit.auditorName,
                failedItems,
                deadline: audit.carDeadline || this._calculateCARDeadline(audit.scheduledDate),
            };

            const pdfBuffer = await CARReportService.generateCARReport(carData);

            const filename = `CAR_${carData.carNumber}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            return res.send(pdfBuffer);
        } catch (error) {
            logger.error('Download CAR error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการสร้าง CAR',
            });
        }
    }

    /**
     * Calculate CAR deadline (14 days from audit date)
     */
    _calculateCARDeadline(auditDate) {
        const date = new Date(auditDate);
        date.setDate(date.getDate() + 14);
        return date;
    }
}

module.exports = new FieldAuditController();

