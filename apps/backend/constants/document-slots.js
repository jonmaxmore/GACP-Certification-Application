/**
 * GACP Document Slots
 * กำหนด slot IDs สำหรับเอกสารที่ต้องแนบใน Application
 * 
 * Note: ใบอนุญาต (บท.11/13/16) รวมอยู่ในนี้เพื่อรีวิวพร้อมกับเอกสารอื่น
 * จ่าย 5,000 บาท ต่อ 1 area type = 1 ชุดเอกสาร = 1 การรีวิว
 * 
 * IMPORTANT: Conditional License Requirements
 * - บท.11: บังคับเสมอ (พืชควบคุม: กัญชา/กระท่อม)
 * - บท.13: บังคับถ้าเลือก objective = PROCESSING (แปรรูปผลิตภัณฑ์)
 * - บท.16: บังคับถ้าเลือก objective = EXPORT (ส่งออกต่างประเทศ)
 */

const DOCUMENT_SLOTS = {
    // ===== เอกสารใบอนุญาต (DTAM License) =====
    LICENSE_BT11: {
        slotId: 'license_bt11',
        name: 'ใบอนุญาต บท.11 (อนุญาตปลูก)',
        description: 'สำเนาใบอนุญาตปลูกพืชกัญชา/กระท่อม',
        required: true, // ✅ บังคับเสมอ สำหรับพืชควบคุม
        requiredFor: { plantTypes: ['cannabis', 'kratom'] },
        warningText: '⚠️ พืชควบคุมต้องมีใบอนุญาต บท.11 จาก กรมการแพทย์แผนไทยฯ'
    },
    LICENSE_BT13: {
        slotId: 'license_bt13',
        name: 'ใบอนุญาต บท.13 (แปรรูปผลิตภัณฑ์)',
        description: 'สำเนาใบอนุญาตแปรรูป (บังคับถ้าเลือกแปรรูป)',
        required: false, // Optional by default
        conditionalRequired: true, // บังคับตามเงื่อนไข
        requiredFor: { objectives: ['PROCESSING', 'COMMERCIAL_PROCESSING'] },
        warningText: '⚠️ หากเลือก "แปรรูปผลิตภัณฑ์" ต้องแนบใบอนุญาต บท.13'
    },
    LICENSE_BT16: {
        slotId: 'license_bt16',
        name: 'ใบอนุญาต บท.16 (ส่งออกต่างประเทศ)',
        description: 'สำเนาใบอนุญาตส่งออก (บังคับถ้าเลือกส่งออก)',
        required: false, // Optional by default
        conditionalRequired: true, // บังคับตามเงื่อนไข
        requiredFor: { objectives: ['EXPORT', 'COMMERCIAL_EXPORT'] },
        warningText: '⚠️ หากเลือก "ส่งออกต่างประเทศ" ต้องแนบใบอนุญาต บท.16'
    },

    // ===== เอกสารที่ดิน =====
    LAND_DEED: {
        slotId: 'land_deed',
        name: 'โฉนดที่ดิน / น.ส.3 / น.ส.4',
        description: 'สำเนาเอกสารสิทธิ์ที่ดิน',
        required: true
    },
    LAND_LEASE: {
        slotId: 'land_lease',
        name: 'สัญญาเช่าที่ดิน',
        description: 'สัญญาเช่า (กรณีเช่าที่ดิน)',
        required: false
    },

    // ===== เอกสารบุคคล/นิติบุคคล =====
    ID_CARD: {
        slotId: 'id_card',
        name: 'สำเนาบัตรประชาชน',
        description: 'ผู้ยื่นขอหรือผู้มีอำนาจลงนาม',
        required: true
    },
    HOUSE_REG: {
        slotId: 'house_reg',
        name: 'สำเนาทะเบียนบ้าน',
        description: 'ทะเบียนบ้านผู้ยื่นขอ',
        required: true
    },
    COMPANY_REG: {
        slotId: 'company_reg',
        name: 'หนังสือรับรองบริษัท',
        description: 'กรณีนิติบุคคล',
        required: false
    },

    // ===== เอกสาร SOP =====
    SOP_CULTIVATION: {
        slotId: 'sop_cultivation',
        name: 'SOP การปลูก',
        description: 'มาตรฐานการปฏิบัติงานด้านการปลูก',
        required: true
    },
    SOP_HARVEST: {
        slotId: 'sop_harvest',
        name: 'SOP การเก็บเกี่ยว',
        description: 'มาตรฐานการเก็บเกี่ยว',
        required: true
    },
    SOP_PROCESSING: {
        slotId: 'sop_processing',
        name: 'SOP การแปรรูป',
        description: 'มาตรฐานการแปรรูป (ถ้ามี)',
        required: false
    },
    SOP_STORAGE: {
        slotId: 'sop_storage',
        name: 'SOP การเก็บรักษา',
        description: 'มาตรฐานการเก็บรักษาผลผลิต',
        required: true
    },
    SOP_PEST: {
        slotId: 'sop_pest',
        name: 'SOP การจัดการศัตรูพืช',
        description: 'การควบคุมศัตรูพืช/โรค',
        required: true
    },

    // ===== แผนผัง =====
    SITE_MAP: {
        slotId: 'site_map',
        name: 'แผนผังแปลงปลูก',
        description: 'แผนที่/แผนผังพื้นที่ปลูก',
        required: true
    },
    FACILITY_MAP: {
        slotId: 'facility_map',
        name: 'แผนผังอาคาร',
        description: 'แผนผังอาคารแปรรูป/เก็บ (ถ้ามี)',
        required: false
    },

    // ===== รูปถ่าย =====
    PHOTOS_SITE: {
        slotId: 'photos_site',
        name: 'ภาพถ่ายพื้นที่',
        description: 'ภาพถ่ายแปลงปลูกปัจจุบัน',
        required: true
    },

    // ===== แบบฟอร์ม GACP =====
    FORM_09: {
        slotId: 'form_09',
        name: 'แบบฟอร์ม 09',
        description: 'แบบคำขอรับรอง GACP (Form 4.3)',
        required: true
    },
    FORM_10: {
        slotId: 'form_10',
        name: 'แบบฟอร์ม 10',
        description: 'แบบสรุปข้อมูลฟาร์ม',
        required: true
    },
    FORM_11: {
        slotId: 'form_11',
        name: 'แบบฟอร์ม 11 (Self Assessment)',
        description: 'แบบประเมินตนเอง (ตัวเลือก)',
        required: false
    }
};

// Get all required slots for a plant type
const getRequiredSlots = (plantType = 'general') => {
    return Object.values(DOCUMENT_SLOTS).filter(slot => {
        if (!slot.required) return false;
        if (slot.requiredFor?.plantTypes && !slot.requiredFor.plantTypes.includes(plantType?.toLowerCase())) return false;
        return true;
    });
};

// Get all slot IDs
const getAllSlotIds = () => Object.values(DOCUMENT_SLOTS).map(s => s.slotId);

// Check if license is required for plant type
const requiresLicense = (plantType) => {
    return ['cannabis', 'kratom'].includes(plantType?.toLowerCase());
};

/**
 * Get required documents based on selections
 * @param {Object} options - { plantType, objectives, applicantType }
 * @returns {Array} List of required document slots
 */
const getRequiredDocuments = (options = {}) => {
    const { plantType = 'general', objectives = [], applicantType = 'INDIVIDUAL' } = options;
    const required = [];

    for (const [key, slot] of Object.entries(DOCUMENT_SLOTS)) {
        let isRequired = slot.required === true;

        // Check plant-type specific requirements
        if (slot.requiredFor?.plantTypes) {
            const plant = plantType?.toLowerCase();
            if (slot.requiredFor.plantTypes.includes(plant)) {
                isRequired = true;
            }
        }

        // Check objective-specific requirements (conditional)
        if (slot.conditionalRequired && slot.requiredFor?.objectives) {
            const matchingObjective = slot.requiredFor.objectives.some(obj =>
                objectives.includes(obj) || objectives.includes(obj.toUpperCase())
            );
            if (matchingObjective) {
                isRequired = true;
            }
        }

        // Check applicant type specific (e.g., company registration for juristic)
        if (key === 'COMPANY_REG' && applicantType === 'JURISTIC') {
            isRequired = true;
        }

        if (isRequired) {
            required.push({
                ...slot,
                isRequired: true,
                key
            });
        }
    }

    return required;
};

/**
 * Validate that user has all required documents for their selections
 * Returns warnings for missing conditional docs before they select objectives
 * @param {Object} options - { objectives }
 * @returns {Array} List of warnings about required documents
 */
const getObjectiveWarnings = (objectives = []) => {
    const warnings = [];

    // Check if processing objective requires BT13
    const processingObjectives = ['PROCESSING', 'COMMERCIAL_PROCESSING', 'COMMERCIAL'];
    if (objectives.some(o => processingObjectives.includes(o?.toUpperCase()))) {
        warnings.push({
            slotId: 'license_bt13',
            text: '⚠️ คุณเลือก "แปรรูปผลิตภัณฑ์" - ต้องมีใบอนุญาต บท.13 แนบพร้อมเอกสาร',
            canProceedWithout: false // ห้ามไปต่อถ้าไม่มี
        });
    }

    // Check if export objective requires BT16
    const exportObjectives = ['EXPORT', 'COMMERCIAL_EXPORT'];
    if (objectives.some(o => exportObjectives.includes(o?.toUpperCase()))) {
        warnings.push({
            slotId: 'license_bt16',
            text: '⚠️ คุณเลือก "ส่งออกต่างประเทศ" - ต้องมีใบอนุญาต บท.16 แนบพร้อมเอกสาร',
            canProceedWithout: false
        });
    }

    return warnings;
};

/**
 * Check if user can proceed with their objective selections
 * @param {Array} objectives - Selected objectives
 * @param {Array} uploadedSlots - List of uploaded document slot IDs
 * @returns {Object} { canProceed, missingDocs }
 */
const canProceedWithObjectives = (objectives = [], uploadedSlots = []) => {
    const warnings = getObjectiveWarnings(objectives);
    const missingDocs = warnings
        .filter(w => !w.canProceedWithout && !uploadedSlots.includes(w.slotId))
        .map(w => ({
            slotId: w.slotId,
            message: w.text
        }));

    return {
        canProceed: missingDocs.length === 0,
        missingDocs
    };
};

module.exports = {
    DOCUMENT_SLOTS,
    getRequiredSlots,
    getAllSlotIds,
    requiresLicense,
    getRequiredDocuments,
    getObjectiveWarnings,
    canProceedWithObjectives
};


