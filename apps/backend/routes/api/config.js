/**
 * Config API Routes
 * Provides API endpoints for configuration data (document slots, templates, pricing)
 * Eliminates frontend hardcoding - all config data comes from API
 * 
 * @version 1.0.0
 * @testable Postman
 */

const express = require('express');
const router = express.Router();

// Import hardcoded data (will migrate to DB later)
const {
    DOCUMENT_SLOTS,
    getRequiredDocuments,
    getObjectiveWarnings,
    canProceedWithObjectives
} = require('../../constants/document-slots');

// LEGACY: cannabisTemplates was in root config/, now deleted
// TODO: Migrate form templates to Prisma database
const cannabisTemplatesData = [];

// ============================================================================
// DOCUMENT SLOTS API
// ============================================================================

/**
 * @route   GET /api/v2/config/document-slots
 * @desc    Get all document slots
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/document-slots
 */
router.get('/document-slots', (req, res) => {
    try {
        const slots = Object.entries(DOCUMENT_SLOTS).map(([key, slot]) => ({
            key,
            ...slot
        }));

        res.json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/document-slots/required
 * @desc    Get required documents based on criteria
 * @query   plantType, objectives[], applicantType
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/document-slots/required?plantType=cannabis&applicantType=INDIVIDUAL
 */
router.get('/document-slots/required', (req, res) => {
    try {
        const { plantType, objectives, applicantType } = req.query;

        // Parse objectives if string
        const objectivesArray = objectives
            ? (Array.isArray(objectives) ? objectives : objectives.split(','))
            : [];

        const requiredDocs = getRequiredDocuments({
            plantType: plantType || 'general',
            objectives: objectivesArray,
            applicantType: applicantType || 'INDIVIDUAL'
        });

        res.json({
            success: true,
            count: requiredDocs.length,
            query: { plantType, objectives: objectivesArray, applicantType },
            data: requiredDocs
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/document-slots/warnings
 * @desc    Get warnings for selected objectives
 * @query   objectives[]
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/document-slots/warnings?objectives=PROCESSING,EXPORT
 */
router.get('/document-slots/warnings', (req, res) => {
    try {
        const { objectives } = req.query;
        const objectivesArray = objectives
            ? (Array.isArray(objectives) ? objectives : objectives.split(','))
            : [];

        const warnings = getObjectiveWarnings(objectivesArray);

        res.json({
            success: true,
            count: warnings.length,
            objectives: objectivesArray,
            data: warnings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/v2/config/document-slots/validate
 * @desc    Validate if user can proceed with objectives
 * @body    { objectives: [], uploadedSlots: [] }
 * @access  Public
 * @test    POST http://localhost:3000/api/v2/config/document-slots/validate
 */
router.post('/document-slots/validate', (req, res) => {
    try {
        const { objectives = [], uploadedSlots = [] } = req.body;

        const result = canProceedWithObjectives(objectives, uploadedSlots);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// FORM TEMPLATES API
// ============================================================================

/**
 * @route   GET /api/v2/config/templates
 * @desc    Get all form templates (metadata only)
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/templates
 */
router.get('/templates', (req, res) => {
    try {
        // Get templates from cannabisTemplates
        const templates = cannabisTemplatesData;

        const templateList = templates.map((t, index) => ({
            id: index,
            title: t.template?.title,
            titleTH: t.template?.titleTH,
            type: t.template?.cannabisMetadata?.surveyType,
            questionCount: t.questions?.length || 0,
            status: t.template?.status
        }));

        res.json({
            success: true,
            count: templateList.length,
            data: templateList
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/templates/:type
 * @desc    Get template by type with all questions
 * @param   type - pre_cultivation_assessment, cultivation_practices, harvest_processing
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/templates/pre_cultivation_assessment
 */
router.get('/templates/:type', (req, res) => {
    try {
        const { type } = req.params;
        const templates = cannabisTemplatesData;

        const template = templates.find(t =>
            t.template?.cannabisMetadata?.surveyType === type
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                error: `Template type '${type}' not found`,
                availableTypes: templates.map(t => t.template?.cannabisMetadata?.surveyType)
            });
        }

        res.json({
            success: true,
            data: {
                template: template.template,
                questions: template.questions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/templates/:type/questions
 * @desc    Get only questions for a template type
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/templates/pre_cultivation_assessment/questions
 */
router.get('/templates/:type/questions', (req, res) => {
    try {
        const { type } = req.params;
        const templates = cannabisTemplatesData;

        const template = templates.find(t =>
            t.template?.cannabisMetadata?.surveyType === type
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                error: `Template type '${type}' not found`
            });
        }

        res.json({
            success: true,
            type,
            count: template.questions?.length || 0,
            data: template.questions
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// STANDARDS API
// ============================================================================

/**
 * @route   GET /api/v2/config/standards
 * @desc    Get list of available GACP standards
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/standards
 */
router.get('/standards', (req, res) => {
    try {
        const standards = [
            { code: 'thai', name: 'Thai GACP', file: 'gacp-thailand.json' },
            { code: 'who', name: 'WHO GAP', file: 'who-gap.json' },
            { code: 'eu', name: 'EU Organic', file: 'eu-organic.json' }
        ];

        res.json({
            success: true,
            count: standards.length,
            data: standards
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/standards/:code
 * @desc    Get specific standard details
 * @param   code - thai, who, eu
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/standards/thai
 */
router.get('/standards/:code', (req, res) => {
    try {
        const { code } = req.params;
        const fs = require('fs');
        const path = require('path');

        const fileMap = {
            thai: 'gacp-thailand.json',
            who: 'who-gap.json',
            eu: 'eu-organic.json'
        };

        if (!fileMap[code]) {
            return res.status(404).json({
                success: false,
                error: `Standard '${code}' not found`,
                availableCodes: Object.keys(fileMap)
            });
        }

        const filePath = path.join(__dirname, '../../../data/standards', fileMap[code]);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Standard file not found: ${fileMap[code]}`
            });
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        res.json({
            success: true,
            code,
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// PRICING API
// ============================================================================

/**
 * @route   GET /api/v2/config/pricing
 * @desc    Get pricing information
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/pricing
 */
router.get('/pricing', (req, res) => {
    try {
        const pricing = {
            phase1: {
                amount: 5000,
                description: 'ค่าตรวจเอกสาร SOP (ต่อประเภทพื้นที่)',
                descriptionEN: 'Document review fee per area type'
            },
            phase2: {
                amount: 30000,
                description: 'ค่าตรวจประเมินแปลงปลูก',
                descriptionEN: 'Site inspection fee'
            },
            licenses: {
                bt11_cultivation: 50000,
                bt13_processing: 50000,
                bt16_export: 90000,
                bt_trading: 4000
            },
            notes: [
                'ผู้ยื่นรับผิดชอบค่าเดินทางและที่พัก Auditor 3 ท่าน',
                'ค่าธรรมเนียมอาจเปลี่ยนแปลงตามประกาศ'
            ]
        };

        res.json({
            success: true,
            data: pricing
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/config/pricing/calculate
 * @desc    Calculate total cost
 * @query   areaTypes[], serviceType, hasProcessing, hasExport
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/config/pricing/calculate?areaTypes=OUTDOOR,INDOOR&serviceType=new
 */
router.get('/pricing/calculate', (req, res) => {
    try {
        const { areaTypes, serviceType, hasProcessing, hasExport } = req.query;

        const areaTypesArray = areaTypes
            ? (Array.isArray(areaTypes) ? areaTypes : areaTypes.split(','))
            : ['OUTDOOR'];

        // Calculate
        const phase1PerType = 5000;
        const phase2 = 30000;

        const phase1Total = areaTypesArray.length * phase1PerType;
        const total = phase1Total + phase2;

        // Additional licenses
        let licenseFees = 0;
        const licenseBreakdown = [];

        if (hasProcessing === 'true') {
            licenseFees += 50000;
            licenseBreakdown.push({ type: 'BT13 (Processing)', amount: 50000 });
        }
        if (hasExport === 'true') {
            licenseFees += 90000;
            licenseBreakdown.push({ type: 'BT16 (Export)', amount: 90000 });
        }

        res.json({
            success: true,
            calculation: {
                areaTypes: areaTypesArray,
                serviceType: serviceType || 'new',
                phase1: {
                    perType: phase1PerType,
                    count: areaTypesArray.length,
                    subtotal: phase1Total
                },
                phase2: {
                    amount: phase2
                },
                licenses: {
                    items: licenseBreakdown,
                    subtotal: licenseFees
                },
                total: total + licenseFees,
                currency: 'THB'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
