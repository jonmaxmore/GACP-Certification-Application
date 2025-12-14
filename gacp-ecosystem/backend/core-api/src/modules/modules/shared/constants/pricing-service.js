/**
 * Pricing Service - Dynamic Fee Calculation
 * คำนวณค่าธรรมเนียมตามประเภทบริการ และจำนวนพื้นที่
 */

const { SERVICE_TYPES, FIXED_FEES } = require('./service-type-enum');

/**
 * Fee Configuration
 * Formula: (5,000 doc review + 25,000 inspection) × number of areas
 * = 30,000 × number of areas
 */
const FEE_CONFIG = {
    // ค่าตรวจเอกสารต่อพื้นที่
    docReviewPerArea: 5000,

    // ค่าตรวจประเมินแปลงต่อพื้นที่
    inspectionPerArea: 25000,

    // รวมต่อพื้นที่
    totalPerArea: 30000,

    // Maximum areas allowed
    maxAreas: 3
};

/**
 * Area Types
 */
const AREA_TYPES = {
    OUTDOOR: { id: 'outdoor', label: 'กลางแจ้ง', labelEn: 'Outdoor' },
    GREENHOUSE: { id: 'greenhouse', label: 'โรงเรือน', labelEn: 'Greenhouse' },
    INDOOR: { id: 'indoor', label: 'อินดอร์ (ระบบปิด)', labelEn: 'Indoor' }
};

/**
 * Objective Types
 */
const OBJECTIVES = {
    RESEARCH: { id: 'research', label: 'วิจัย/ทดลอง', labelEn: 'Research' },
    DOMESTIC: { id: 'domestic', label: 'ขายในประเทศ', labelEn: 'Domestic Sale' },
    EXPORT: { id: 'export', label: 'ส่งออก', labelEn: 'Export' }
};

/**
 * Calculate fee for application
 * Formula: 25,000 (base) + 5,000 × (number of areas)
 * Same for new_application and renewal
 */
function calculateFee(serviceType, areaTypes = [], options = {}) {
    const breakdown = {
        items: [],
        subtotal: 0,
        vat: 0,
        total: 0,
        requiresTeamReview: false
    };

    // Services that require team review don't have fixed pricing
    if (serviceType === SERVICE_TYPES.REPLACEMENT || serviceType === SERVICE_TYPES.AMENDMENT) {
        breakdown.requiresTeamReview = true;
        breakdown.message = 'ทีมงานจะประเมินและส่งใบเสนอราคาให้ภายหลัง';
        return breakdown;
    }

    // Validate area types
    const validAreas = areaTypes.filter(a => Object.keys(AREA_TYPES).includes(a.toUpperCase()));
    const areaCount = Math.min(validAreas.length || 1, FEE_CONFIG.maxAreas);
    const areaLabels = validAreas.map(a => AREA_TYPES[a.toUpperCase()]?.label || a).join(', ');

    // Doc Review per area: 5,000 × areas
    breakdown.items.push({
        description: `ค่าตรวจเอกสาร (${areaLabels || 'ลักษณะพื้นที่'})`,
        quantity: areaCount,
        unitPrice: FEE_CONFIG.docReviewPerArea,
        total: FEE_CONFIG.docReviewPerArea * areaCount
    });

    // Inspection per area: 25,000 × areas
    breakdown.items.push({
        description: `ค่าตรวจประเมินแปลง (${areaLabels || 'ลักษณะพื้นที่'})`,
        quantity: areaCount,
        unitPrice: FEE_CONFIG.inspectionPerArea,
        total: FEE_CONFIG.inspectionPerArea * areaCount
    });

    // Calculate totals
    breakdown.subtotal = breakdown.items.reduce((sum, item) => sum + item.total, 0);
    breakdown.vat = 0; // No VAT for government fees
    breakdown.total = breakdown.subtotal + breakdown.vat;

    // Convert to Thai text
    breakdown.totalText = numberToThaiText(breakdown.total);

    return breakdown;
}

/**
 * Convert number to Thai text
 */
function numberToThaiText(num) {
    const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    if (num === 0) return 'ศูนย์บาทถ้วน';

    // Simple cases for common amounts
    const commonAmounts = {
        35000: 'สามหมื่นห้าพันบาทถ้วน',
        40000: 'สี่หมื่นบาทถ้วน',
        45000: 'สี่หมื่นห้าพันบาทถ้วน',
        50000: 'ห้าหมื่นบาทถ้วน',
        30000: 'สามหมื่นบาทถ้วน',
        5000: 'ห้าพันบาทถ้วน'
    };

    return commonAmounts[num] || `${num.toLocaleString()}บาทถ้วน`;
}

/**
 * Get fee summary for display
 */
function getFeeSummary(serviceType, areaTypes = []) {
    const fee = calculateFee(serviceType, areaTypes);

    return {
        serviceType,
        areaCount: areaTypes.length,
        ...fee
    };
}

/**
 * Validate application data completeness
 */
function validateApplicationData(data) {
    const errors = [];

    if (!data.plantType) {
        errors.push({ field: 'plantType', message: 'กรุณาเลือกประเภทสมุนไพร' });
    }

    if (!data.objective) {
        errors.push({ field: 'objective', message: 'กรุณาเลือกวัตถุประสงค์' });
    }

    if (!data.areaTypes || data.areaTypes.length === 0) {
        errors.push({ field: 'areaTypes', message: 'กรุณาเลือกลักษณะพื้นที่อย่างน้อย 1 ประเภท' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    FEE_CONFIG,
    AREA_TYPES,
    OBJECTIVES,
    calculateFee,
    getFeeSummary,
    numberToThaiText,
    validateApplicationData
};
