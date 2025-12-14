/**
 * Document Analysis Service
 * Analyzes required documents based on plant type, request type, and application data
 * 
 * This service powers the dynamic document checklist in the mobile app
 * and can be updated without releasing a new app version.
 */

const DocumentRequirement = require('../models/DocumentRequirementModel');
const PlantMaster = require('../models/PlantMasterModel');

class DocumentAnalysisService {
    /**
     * Get base document requirements for a plant and request type
     * @param {string} plantId - Plant identifier (CAN, KRA, TUR, etc.)
     * @param {string} requestType - NEW, RENEW, or AMEND
     * @returns {Promise<Array>} List of document requirements
     */
    async getBaseRequirements(plantId, requestType = 'NEW') {
        const docs = await DocumentRequirement.getRequirementsForPlant(plantId, requestType);
        return docs.map(doc => ({
            id: doc._id.toString(),
            slotId: doc.documentName.toLowerCase().replace(/\s+/g, '_'),
            name: doc.documentName,
            nameTH: doc.documentNameTH,
            category: doc.category,
            isRequired: doc.isRequired,
            description: doc.description || doc.descriptionTH,
            allowedFileTypes: doc.allowedFileTypes || ['pdf', 'jpg', 'png'],
            maxFileSizeMB: doc.maxFileSizeMB || 10,
        }));
    }

    /**
     * Analyze and generate dynamic document requirements
     * Based on application data, adds conditional documents
     * 
     * @param {string} plantId - Plant identifier
     * @param {string} requestType - NEW, RENEW, or AMEND
     * @param {Object} applicationData - Form data from mobile app
     * @returns {Promise<Object>} Analysis result with categorized documents
     */
    async analyzeRequiredDocuments(plantId, requestType, applicationData = {}) {
        // 1. Get plant configuration
        const plant = await PlantMaster.getPlantById(plantId);
        if (!plant) {
            throw new Error(`Plant not found: ${plantId}`);
        }

        const isGroupA = plant.group === 'HIGH_CONTROL';

        // 2. Get base requirements from database
        const baseRequirements = await this.getBaseRequirements(plantId, requestType);

        // 3. Generate conditional requirements
        const conditionalDocs = this._generateConditionalDocs(
            isGroupA,
            requestType,
            applicationData
        );

        // 4. Merge and deduplicate
        const allDocs = this._mergeDocuments(baseRequirements, conditionalDocs);

        // 5. Categorize
        const categorized = this._categorizeDocuments(allDocs);

        return {
            plantId,
            plantName: plant.nameEN,
            plantNameTH: plant.nameTH,
            plantGroup: plant.group,
            requestType,
            totalRequired: allDocs.filter(d => d.isRequired).length,
            totalOptional: allDocs.filter(d => !d.isRequired).length,
            categories: categorized,
            documents: allDocs,
        };
    }

    /**
     * Generate conditional documents based on application data
     * @private
     */
    _generateConditionalDocs(isGroupA, requestType, data) {
        const docs = [];

        // === REPLACEMENT CASE ===
        if (requestType === 'AMEND' || requestType === 'REPLACEMENT') {
            if (data.replacementReason === 'Lost' || data.replacementReason?.reason === 'Lost') {
                docs.push({
                    slotId: 'police_report',
                    name: 'Police Report Copy',
                    nameTH: 'สำเนาใบแจ้งความ',
                    category: 'OTHER',
                    isRequired: true,
                    description: 'จำเป็นสำหรับกรณีสูญหาย',
                });
            } else {
                docs.push({
                    slotId: 'damaged_cert_photo',
                    name: 'Photo of Damaged Certificate',
                    nameTH: 'รูปถ่ายใบรับรองที่ชำรุด',
                    category: 'OTHER',
                    isRequired: true,
                    description: 'จำเป็นสำหรับกรณีชำรุด',
                });
            }
            // Early return for replacement - simpler document set
            docs.push({
                slotId: 'id_card',
                name: 'ID Card Copy',
                nameTH: 'สำเนาบัตรประชาชน',
                category: 'IDENTITY',
                isRequired: true,
            });
            return docs;
        }

        // === NEW/RENEW CASE ===

        // Group A: License documents
        if (isGroupA) {
            const plantingStatus = data.licenseInfo?.plantingStatus || data.plantingStatus;

            if (plantingStatus === 'Notify') {
                docs.push({
                    slotId: 'notify_receipt',
                    name: 'Notification Receipt',
                    nameTH: 'ใบรับจดแจ้ง',
                    category: 'LICENSE',
                    isRequired: true,
                    description: 'สำหรับกรณีจดแจ้ง',
                });
            } else {
                docs.push({
                    slotId: 'license_copy',
                    name: 'License Copy (BhT)',
                    nameTH: 'สำเนาใบอนุญาต BhT',
                    category: 'LICENSE',
                    isRequired: true,
                    description: 'ใบอนุญาต BhT 11/13/16',
                });
            }

            // CCTV check
            const hasCCTV = data.securityMeasures?.hasCCTV || data.hasCCTV;
            if (hasCCTV) {
                docs.push({
                    slotId: 'cctv_plan',
                    name: 'CCTV Installation Plan',
                    nameTH: 'ผังการติดตั้งกล้องวงจรปิด',
                    category: 'COMPLIANCE',
                    isRequired: true,
                });
            }
        } else {
            // Group B: Optional GAP/Organic
            docs.push({
                slotId: 'gap_certificate',
                name: 'GAP Certificate',
                nameTH: 'ใบรับรอง GAP',
                category: 'OTHER',
                isRequired: false,
                description: 'ถ้ามี',
            });
        }

        // Tuber check (Arsenic test)
        const plantParts = data.production?.plantParts || data.plantParts || [];
        const hasTuber = plantParts.some(p =>
            p.toLowerCase().includes('tuber') ||
            p.includes('หัว') ||
            p.includes('เหง้า')
        );
        if (hasTuber) {
            docs.push({
                slotId: 'arsenic_test',
                name: 'Arsenic Test Result',
                nameTH: 'ผลวิเคราะห์สารหนู',
                category: 'OTHER',
                isRequired: true,
                description: 'จำเป็นสำหรับพืชหัว/เหง้า',
            });
        }

        // Source type check
        const sourceType = data.production?.sourceType || data.sourceType;
        if (sourceType === 'Buy') {
            docs.push({
                slotId: 'seed_receipt',
                name: 'Seed Purchase Receipt',
                nameTH: 'ใบเสร็จรับเงินค่าเมล็ดพันธุ์',
                category: 'FINANCIAL',
                isRequired: true,
            });
        } else if (sourceType === 'Import') {
            docs.push({
                slotId: 'import_license',
                name: 'Import License',
                nameTH: 'ใบอนุญาตนำเข้า',
                category: 'LICENSE',
                isRequired: true,
            });
        }

        return docs;
    }

    /**
     * Merge base and conditional documents, avoid duplicates
     * @private
     */
    _mergeDocuments(baseDocs, conditionalDocs) {
        const merged = [...baseDocs];
        const existingSlots = new Set(baseDocs.map(d => d.slotId));

        for (const doc of conditionalDocs) {
            if (!existingSlots.has(doc.slotId)) {
                merged.push(doc);
                existingSlots.add(doc.slotId);
            }
        }

        // Sort by category and required status
        return merged.sort((a, b) => {
            if (a.category !== b.category) {
                const categoryOrder = ['IDENTITY', 'LICENSE', 'PROPERTY', 'COMPLIANCE', 'FINANCIAL', 'OTHER'];
                return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
            }
            return (b.isRequired ? 1 : 0) - (a.isRequired ? 1 : 0);
        });
    }

    /**
     * Group documents by category
     * @private
     */
    _categorizeDocuments(docs) {
        const categories = {};
        for (const doc of docs) {
            const cat = doc.category || 'OTHER';
            if (!categories[cat]) {
                categories[cat] = {
                    name: this._getCategoryName(cat),
                    documents: [],
                };
            }
            categories[cat].documents.push(doc);
        }
        return categories;
    }

    /**
     * Get human-readable category name
     * @private
     */
    _getCategoryName(category) {
        const names = {
            IDENTITY: 'เอกสารระบุตัวตน (Identity)',
            LICENSE: 'ใบอนุญาต (License)',
            PROPERTY: 'เอกสารสถานที่ (Property)',
            COMPLIANCE: 'เอกสาร SOP/ความปลอดภัย (Compliance)',
            FINANCIAL: 'เอกสารการเงิน (Financial)',
            OTHER: 'เอกสารอื่นๆ (Other)',
        };
        return names[category] || category;
    }

    /**
     * Validate uploaded documents against requirements
     * @param {Array} uploadedDocs - List of uploaded document slot IDs
     * @param {Array} requirements - Required documents from analysis
     * @returns {Object} Validation result
     */
    validateDocuments(uploadedDocs, requirements) {
        const uploaded = new Set(uploadedDocs);
        const requiredDocs = requirements.filter(d => d.isRequired);
        const missing = requiredDocs.filter(d => !uploaded.has(d.slotId));

        return {
            isComplete: missing.length === 0,
            totalRequired: requiredDocs.length,
            totalUploaded: uploadedDocs.length,
            missingDocuments: missing.map(d => ({
                slotId: d.slotId,
                name: d.name,
                nameTH: d.nameTH,
            })),
        };
    }
}

module.exports = new DocumentAnalysisService();
