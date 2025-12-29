/**
 * Pre-submission Validation API
 * ตรวจสอบความพร้อมก่อนส่งใบสมัคร GACP
 *
 * Based on DTAM Requirements Document
 * Provides comprehensive checklist for application submission
 *
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');
const { DOCUMENT_SLOTS, getRequiredDocuments } = require('../../constants/document-slots');

// ============================================================================
// PRE-SUBMISSION VALIDATION API
// ============================================================================

/**
 * @route   POST /api/v2/validation/pre-submission
 * @desc    Validate application before submission
 * @access  Farmer
 * @test    POST http://localhost:3000/api/v2/validation/pre-submission
 */
router.post('/pre-submission', async (req, res) => {
    try {
        const {
            applicationId,
            plantType = 'cannabis',
            applicantType = 'INDIVIDUAL',
            objectives = [],
            landOwnership = 'owned',
            applicationType = 'NEW',
            uploadedDocuments = []
        } = req.body;

        const validationResults = {
            isReady: true,
            completionPercentage: 0,
            sections: [],
            missingRequired: [],
            missingConditional: [],
            warnings: [],
            recommendations: []
        };

        // ─────────────────────────────────────────────────────────
        // 1. Document Validation
        // ─────────────────────────────────────────────────────────
        const requiredDocs = getRequiredDocuments({
            plantType,
            applicantType,
            objectives,
            landOwnership,
            applicationType
        });

        const uploadedSlotIds = uploadedDocuments.map(d => d.slotId || d);
        const missingDocs = requiredDocs.filter(doc =>
            !uploadedSlotIds.includes(doc.slotId)
        );

        const docSection = {
            name: 'เอกสารประกอบ',
            nameEN: 'Documents',
            total: requiredDocs.length,
            completed: requiredDocs.length - missingDocs.length,
            percentage: Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100) || 0,
            missing: missingDocs.map(d => ({
                slotId: d.slotId,
                name: d.name,
                isConditional: d.conditionalRequired || false
            }))
        };
        validationResults.sections.push(docSection);

        // Add to missing lists
        missingDocs.forEach(doc => {
            if (doc.conditionalRequired) {
                validationResults.missingConditional.push({
                    slotId: doc.slotId,
                    name: doc.name,
                    reason: doc.warningText || 'บังคับตามเงื่อนไขที่เลือก'
                });
            } else {
                validationResults.missingRequired.push({
                    slotId: doc.slotId,
                    name: doc.name
                });
            }
        });

        // ─────────────────────────────────────────────────────────
        // 2. Applicant Type Validation
        // ─────────────────────────────────────────────────────────
        const applicantSection = {
            name: 'ข้อมูลผู้ยื่น',
            nameEN: 'Applicant Info',
            total: 3,
            completed: 0,
            checks: []
        };

        // Check Thai ID
        const hasIdCard = uploadedSlotIds.includes('id_card');
        applicantSection.checks.push({
            item: 'สำเนาบัตรประชาชน',
            status: hasIdCard ? 'passed' : 'missing'
        });
        if (hasIdCard) applicantSection.completed++;

        // Check House Registration
        const hasHouseReg = uploadedSlotIds.includes('house_reg');
        applicantSection.checks.push({
            item: 'สำเนาทะเบียนบ้าน',
            status: hasHouseReg ? 'passed' : 'missing'
        });
        if (hasHouseReg) applicantSection.completed++;

        // Check Criminal Background (DTAM Required)
        const hasCriminalBg = uploadedSlotIds.includes('criminal_bg');
        applicantSection.checks.push({
            item: 'ผลตรวจประวัติอาชญากรรม',
            status: hasCriminalBg ? 'passed' : 'missing',
            warning: !hasCriminalBg ? 'กรมการแพทย์แผนไทยกำหนดให้ต้องมี' : null
        });
        if (hasCriminalBg) applicantSection.completed++;

        applicantSection.percentage = Math.round((applicantSection.completed / applicantSection.total) * 100);
        validationResults.sections.push(applicantSection);

        // ─────────────────────────────────────────────────────────
        // 3. Land Ownership Validation
        // ─────────────────────────────────────────────────────────
        const landSection = {
            name: 'เอกสารที่ดิน',
            nameEN: 'Land Documents',
            total: 1,
            completed: 0,
            checks: []
        };

        const hasLandDeed = uploadedSlotIds.includes('land_deed');
        const hasLandLease = uploadedSlotIds.includes('land_lease');
        const hasLandConsent = uploadedSlotIds.includes('land_consent');

        if (landOwnership === 'owned') {
            landSection.checks.push({
                item: 'โฉนดที่ดิน / น.ส.3 / น.ส.4',
                status: hasLandDeed ? 'passed' : 'missing'
            });
            if (hasLandDeed) landSection.completed++;
        } else if (landOwnership === 'leased') {
            landSection.total = 2;
            landSection.checks.push({
                item: 'โฉนดที่ดิน',
                status: hasLandDeed ? 'passed' : 'missing'
            });
            landSection.checks.push({
                item: 'สัญญาเช่าที่ดิน',
                status: hasLandLease ? 'passed' : 'missing'
            });
            if (hasLandDeed) landSection.completed++;
            if (hasLandLease) landSection.completed++;
        } else if (landOwnership === 'permitted_use') {
            landSection.total = 2;
            landSection.checks.push({
                item: 'โฉนดที่ดิน',
                status: hasLandDeed ? 'passed' : 'missing'
            });
            landSection.checks.push({
                item: 'หนังสือยินยอมให้ใช้ที่ดิน',
                status: hasLandConsent ? 'passed' : 'missing'
            });
            if (hasLandDeed) landSection.completed++;
            if (hasLandConsent) landSection.completed++;
        }

        landSection.percentage = Math.round((landSection.completed / landSection.total) * 100) || 0;
        validationResults.sections.push(landSection);

        // ─────────────────────────────────────────────────────────
        // 4. License Validation (for controlled plants)
        // ─────────────────────────────────────────────────────────
        if (['cannabis', 'kratom'].includes(plantType.toLowerCase())) {
            const licenseSection = {
                name: 'ใบอนุญาต',
                nameEN: 'Licenses',
                total: 1,
                completed: 0,
                checks: []
            };

            // BT.11 is always required for controlled plants
            const hasBt11 = uploadedSlotIds.includes('license_bt11');
            licenseSection.checks.push({
                item: 'ใบอนุญาต บท.11 (ปลูก)',
                status: hasBt11 ? 'passed' : 'missing',
                critical: true
            });
            if (hasBt11) licenseSection.completed++;

            // BT.13 if processing
            if (objectives.includes('PROCESSING')) {
                licenseSection.total++;
                const hasBt13 = uploadedSlotIds.includes('license_bt13');
                licenseSection.checks.push({
                    item: 'ใบอนุญาต บท.13 (แปรรูป)',
                    status: hasBt13 ? 'passed' : 'missing'
                });
                if (hasBt13) licenseSection.completed++;
            }

            // BT.16 if export
            if (objectives.includes('EXPORT')) {
                licenseSection.total++;
                const hasBt16 = uploadedSlotIds.includes('license_bt16');
                licenseSection.checks.push({
                    item: 'ใบอนุญาต บท.16 (ส่งออก)',
                    status: hasBt16 ? 'passed' : 'missing'
                });
                if (hasBt16) licenseSection.completed++;
            }

            licenseSection.percentage = Math.round((licenseSection.completed / licenseSection.total) * 100);
            validationResults.sections.push(licenseSection);
        }

        // ─────────────────────────────────────────────────────────
        // 5. Photos Validation
        // ─────────────────────────────────────────────────────────
        const photoSection = {
            name: 'รูปถ่าย',
            nameEN: 'Photos',
            total: 2,
            completed: 0,
            checks: []
        };

        const hasExterior = uploadedSlotIds.includes('photos_exterior');
        const hasSignage = uploadedSlotIds.includes('photos_signage');

        photoSection.checks.push({
            item: 'ภาพถ่ายภายนอก/แปลงปลูก',
            status: hasExterior ? 'passed' : 'missing'
        });
        photoSection.checks.push({
            item: 'ภาพถ่ายป้าย',
            status: hasSignage ? 'passed' : 'missing'
        });

        if (hasExterior) photoSection.completed++;
        if (hasSignage) photoSection.completed++;

        photoSection.percentage = Math.round((photoSection.completed / photoSection.total) * 100);
        validationResults.sections.push(photoSection);

        // ─────────────────────────────────────────────────────────
        // Calculate Overall
        // ─────────────────────────────────────────────────────────
        const totalItems = validationResults.sections.reduce((sum, s) => sum + s.total, 0);
        const completedItems = validationResults.sections.reduce((sum, s) => sum + s.completed, 0);
        validationResults.completionPercentage = Math.round((completedItems / totalItems) * 100);
        validationResults.isReady = validationResults.missingRequired.length === 0 &&
            validationResults.sections.every(s => s.percentage >= 100);

        // Add warnings
        if (!hasCriminalBg) {
            validationResults.warnings.push({
                type: 'document',
                message: 'ยังไม่ได้อัปโหลดผลตรวจประวัติอาชญากรรม (ต้องได้จาก สตช. อายุไม่เกิน 3 เดือน)',
                priority: 'high'
            });
        }

        // Add recommendations
        if (validationResults.completionPercentage >= 80 && validationResults.completionPercentage < 100) {
            validationResults.recommendations.push('เหลืออีกเพียงเล็กน้อย! กรุณาเพิ่มเอกสารที่ขาดเพื่อให้ครบ 100%');
        }

        res.json({
            success: true,
            data: validationResults
        });
    } catch (error) {
        console.error('[Validation API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/validation/checklist
 * @desc    Get submission checklist template
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/validation/checklist
 */
router.get('/checklist', async (req, res) => {
    try {
        const { plantType = 'cannabis', applicantType = 'INDIVIDUAL' } = req.query;

        const checklist = {
            plantType,
            applicantType,
            sections: [
                {
                    name: 'เอกสารบุคคล',
                    items: [
                        { slotId: 'id_card', name: 'สำเนาบัตรประชาชน', required: true },
                        { slotId: 'house_reg', name: 'สำเนาทะเบียนบ้าน', required: true },
                        { slotId: 'criminal_bg', name: 'ผลตรวจประวัติอาชญากรรม', required: true }
                    ]
                },
                {
                    name: 'เอกสารที่ดิน',
                    items: [
                        { slotId: 'land_deed', name: 'โฉนดที่ดิน / น.ส.3 / น.ส.4', required: true },
                        { slotId: 'land_lease', name: 'สัญญาเช่า (กรณีเช่า)', required: false },
                        { slotId: 'land_consent', name: 'หนังสือยินยอม (กรณีขอใช้)', required: false }
                    ]
                },
                {
                    name: 'ใบอนุญาต',
                    items: [
                        { slotId: 'license_bt11', name: 'บท.11 (ปลูก)', required: ['cannabis', 'kratom'].includes(plantType) },
                        { slotId: 'license_bt13', name: 'บท.13 (แปรรูป)', required: false },
                        { slotId: 'license_bt16', name: 'บท.16 (ส่งออก)', required: false }
                    ]
                },
                {
                    name: 'SOP',
                    items: [
                        { slotId: 'sop_cultivation', name: 'SOP การปลูก', required: true },
                        { slotId: 'sop_harvest', name: 'SOP การเก็บเกี่ยว', required: true },
                        { slotId: 'sop_storage', name: 'SOP การเก็บรักษา', required: true },
                        { slotId: 'sop_pest', name: 'SOP การจัดการศัตรูพืช', required: true }
                    ]
                },
                {
                    name: 'รูปถ่าย',
                    items: [
                        { slotId: 'photos_exterior', name: 'ภาพถ่ายภายนอก', required: true },
                        { slotId: 'photos_signage', name: 'ภาพถ่ายป้าย', required: true },
                        { slotId: 'photos_interior', name: 'ภาพถ่ายภายใน', required: false },
                        { slotId: 'photos_storage', name: 'ภาพถ่ายคลังเก็บ', required: false }
                    ]
                },
                {
                    name: 'แบบฟอร์ม',
                    items: [
                        { slotId: 'form_09', name: 'แบบคำขอ (Form 09)', required: true },
                        { slotId: 'form_10', name: 'แบบสรุปข้อมูลฟาร์ม (Form 10)', required: true },
                        { slotId: 'site_map', name: 'แผนผังแปลงปลูก', required: true }
                    ]
                }
            ]
        };

        // Add juristic documents if applicable
        if (applicantType === 'JURISTIC') {
            checklist.sections.splice(1, 0, {
                name: 'เอกสารนิติบุคคล',
                items: [
                    { slotId: 'company_reg', name: 'หนังสือรับรองบริษัท', required: true }
                ]
            });
        } else if (applicantType === 'COMMUNITY_ENTERPRISE') {
            checklist.sections.splice(1, 0, {
                name: 'เอกสารวิสาหกิจชุมชน',
                items: [
                    { slotId: 'community_cert', name: 'หนังสือจดทะเบียนวิสาหกิจชุมชน', required: true },
                    { slotId: 'gov_support', name: 'หนังสือสนับสนุนจากหน่วยงาน', required: true }
                ]
            });
        }

        res.json({
            success: true,
            data: checklist
        });
    } catch (error) {
        console.error('[Validation API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
