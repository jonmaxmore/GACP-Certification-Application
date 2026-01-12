/**
 * Master Data Controller
 * Serves system configuration and static options to frontend
 * 
 * API-First Design: All configurable data comes from here
 * This allows changing fees, options, etc without frontend deployment
 */

const getMasterData = async (req, res) => {
    try {
        const data = {
            // ============================================
            // Certification Purposes (วัตถุประสงค์การปลูก)
            // ============================================
            purposes: [
                {
                    id: 'RESEARCH',
                    name: 'เพื่อการวิจัย',
                    nameEn: 'Research',
                    icon: '🔬',
                    description: 'ปลูกเพื่อการวิจัยและพัฒนาภายใต้หน่วยงานที่ได้รับอนุญาต',
                    requiredDocs: [
                        'แผนการปลูกและใช้ประโยชน์',
                        'หนังสือรับรองจากหน่วยงานสนับสนุน',
                    ],
                },
                {
                    id: 'COMMERCIAL',
                    name: 'เพื่อจำหน่าย',
                    nameEn: 'Commercial Sale',
                    icon: '🏪',
                    description: 'ปลูกเพื่อจำหน่ายภายในประเทศตามใบอนุญาต',
                    requiredDocs: [
                        'แบบ ภ.ท. 11 (คำขออนุญาตจำหน่าย/แปรรูป)',
                        'หนังสือแสดงกรรมสิทธิ์ที่ดิน/สัญญาเช่า',
                        'แผนที่แสดงที่ตั้ง + พิกัด GPS',
                        'แบบแปลนอาคารโรงเรือน',
                        'มาตรการรักษาความปลอดภัย',
                        'หนังสือผลตรวจประวัติอาชญากรรม',
                    ],
                },
                {
                    id: 'EXPORT',
                    name: 'เพื่อส่งออก',
                    nameEn: 'Export',
                    icon: '🌍',
                    description: 'ปลูกเพื่อส่งออกต่างประเทศ ต้องมีใบรับรอง GACP',
                    requiredDocs: [
                        'ทุกเอกสารของ "เพื่อจำหน่าย" +',
                        'แบบ ภ.ท. 10 (คำขออนุญาตส่งออก)',
                        'ใบรับรอง GACP',
                        'ใบรับรองห้องปฏิบัติการ (Lab Certificate)',
                        'หนังสือรับรองประเทศปลายทาง',
                    ],
                },
            ],

            // ============================================
            // Cultivation Methods (รูปแบบการปลูก - 3 หลัก)
            // ============================================
            cultivationMethods: [
                {
                    id: 'outdoor',
                    name: 'ปลูกกลางแจ้ง',
                    nameEn: 'Outdoor',
                    icon: '🌞',
                    description: 'ปลูกในแปลงกลางแจ้ง อาศัยแสงแดดธรรมชาติ',
                    pros: ['ต้นทุนต่ำ', 'เหมาะกับพื้นที่กว้าง', 'แสงธรรมชาติเต็มที่'],
                    cons: ['ควบคุมสภาพแวดล้อมยาก', 'เสี่ยงต่อศัตรูพืช', 'ขึ้นกับสภาพอากาศ'],
                    yieldMultiplier: 1.0,
                },
                {
                    id: 'greenhouse',
                    name: 'โรงเรือน',
                    nameEn: 'Greenhouse',
                    icon: '🏠',
                    description: 'ปลูกในโรงเรือนที่มีหลังคาโปร่งแสง',
                    pros: ['ควบคุมสภาพแวดล้อมได้บางส่วน', 'ป้องกันฝนและแมลง', 'ปลูกได้ตลอดปี'],
                    cons: ['ต้นทุนสูงกว่ากลางแจ้ง', 'ต้องมีระบบระบายอากาศ'],
                    yieldMultiplier: 1.2,
                },
                {
                    id: 'indoor',
                    name: 'ฟาร์มแบบปิด',
                    nameEn: 'Indoor Controlled',
                    icon: '🏭',
                    description: 'ปลูกในอาคารปิดที่ควบคุมสภาพแวดล้อมทั้งหมด',
                    pros: ['ควบคุมทุกปัจจัยได้', 'คุณภาพสม่ำเสมอ', 'ปลอดภัยจากศัตรูพืช'],
                    cons: ['ต้นทุนสูงมาก', 'ค่าไฟฟ้าสูง', 'ต้องการความชำนาญ'],
                    yieldMultiplier: 1.5,
                },
            ],

            // ============================================
            // Sub Cultivation Methods (รูปแบบเสริม)
            // ============================================
            subCultivationMethods: [
                {
                    id: 'none',
                    name: 'ไม่มี',
                    nameEn: 'None',
                    icon: '➖',
                    description: 'ใช้วิธีการปลูกปกติ',
                    applicableTo: ['outdoor', 'greenhouse', 'indoor'],
                },
                {
                    id: 'vertical',
                    name: 'ฟาร์มแนวตั้ง',
                    nameEn: 'Vertical Farm',
                    icon: '🗼',
                    description: 'ปลูกเป็นชั้นๆ ในแนวตั้ง ประหยัดพื้นที่',
                    applicableTo: ['greenhouse', 'indoor'],
                },
                {
                    id: 'hydroponic',
                    name: 'ไฮโดรโปนิกส์',
                    nameEn: 'Hydroponic',
                    icon: '💧',
                    description: 'ปลูกในน้ำยาธาตุอาหารโดยไม่ใช้ดิน',
                    applicableTo: ['greenhouse', 'indoor'],
                },
            ],

            // ============================================
            // GACP Fees (ค่าธรรมเนียม - ควบคุมจาก Backend)
            // ============================================
            fees: {
                documentReview: 5000,    // ค่าตรวจเอกสาร (per cultivation type)
                siteInspection: 25000,   // ค่าตรวจพื้นที่ (per cultivation type)
                perTypeTotal: 30000,     // Total per cultivation type
                platformFeePercent: 10,  // Platform service fee percentage
                notes: {
                    th: 'ฟาร์มที่มีหลายรูปแบบการปลูกจะแยกเป็นหลายเคสและหลายบิล',
                    en: 'Farms with multiple cultivation types will be split into separate cases and bills',
                },
            },

            // ============================================
            // QR Code Pricing (อัตราค่า QR ตามจำนวน)
            // ============================================
            qrPricing: [
                { min: 1, max: 100, pricePerQR: 5 },
                { min: 101, max: 500, pricePerQR: 4 },
                { min: 501, max: 1000, pricePerQR: 3 },
                { min: 1001, max: 999999, pricePerQR: 2 },
            ],

            // ============================================
            // Existing Data (Retained from original)
            // ============================================

            // Soil Types
            soilTypes: [
                { id: 'LOAM', label: 'ดินร่วน', labelEN: 'Loam' },
                { id: 'CLAY', label: 'ดินเหนียว', labelEN: 'Clay' },
                { id: 'SANDY', label: 'ดินทราย', labelEN: 'Sandy' },
                { id: 'PEAT', label: 'ดินอินทรีย์', labelEN: 'Peat' },
                { id: 'OTHER', label: 'อื่นๆ', labelEN: 'Other' },
            ],

            // Water Sources
            waterSources: [
                { id: 'RAIN', label: 'น้ำฝน', labelEN: 'Rain Water' },
                { id: 'RIVER', label: 'แม่น้ำ/ลำคลอง', labelEN: 'River/Canal' },
                { id: 'WELL', label: 'น้ำบาดาล', labelEN: 'Ground Water' },
                { id: 'TAP', label: 'น้ำประปา', labelEN: 'Tap Water' },
                { id: 'IRRIGATION', label: 'ระบบชลประทาน', labelEN: 'Irrigation System' },
            ],

            // Cultivation Systems (Legacy - kept for backwards compatibility)
            cultivationSystems: [
                { id: 'OUTDOOR', label: 'กลางแจ้ง', labelEN: 'Outdoor' },
                { id: 'INDOOR', label: 'ในโรงเรือน (Indoor)', labelEN: 'Indoor' },
                { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', labelEN: 'Greenhouse' },
            ],

            // Plot Types (Zoning)
            plotTypes: [
                { id: 'INDOOR', label: 'โรงเรือนปิด (Indoor)', icon: '🏠' },
                { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', icon: '🏡' },
                { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', icon: '🌤️' },
            ],

            // Plant Parts
            plantParts: [
                { id: 'SEED', label: 'เมล็ด', labelEN: 'Seed' },
                { id: 'STEM', label: 'ลำต้น', labelEN: 'Stem' },
                { id: 'FLOWER', label: 'ช่อดอก', labelEN: 'Flower' },
                { id: 'LEAF', label: 'ใบ', labelEN: 'Leaf' },
                { id: 'ROOT', label: 'ราก/หัว', labelEN: 'Root/Tuber' },
                { id: 'OTHER', label: 'อื่นๆ', labelEN: 'Other' },
            ],

            // Ownership Types
            ownershipTypes: [
                { id: 'OWN', label: 'เจ้าของ', labelEN: 'Owner' },
                { id: 'RENT', label: 'เช่า', labelEN: 'Renter' },
                { id: 'CONSENT', label: 'ได้รับยินยอม', labelEN: 'Consent' },
            ],

            // Applicant Types
            applicantTypes: [
                { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', labelEN: 'Individual', icon: '👤' },
                { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', labelEN: 'Community Enterprise', icon: '👥' },
                { id: 'JURISTIC', label: 'นิติบุคคล', labelEN: 'Juristic Person', icon: '🏢' },
            ],

            // API Version
            _version: '2.1.0',
            _lastUpdated: new Date().toISOString(),
        };

        res.json({
            success: true,
            data: data,
        });
    } catch (error) {
        console.error('Master Data Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch master data' });
    }
};

// Individual endpoint getters for more granular API access
const getFees = async (req, res) => {
    res.json({
        success: true,
        data: {
            documentReview: 5000,
            siteInspection: 25000,
            perTypeTotal: 30000,
            platformFeePercent: 10,
        },
    });
};

const getCultivationMethods = async (req, res) => {
    const masterData = await getMasterDataInternal();
    res.json({
        success: true,
        data: {
            main: masterData.cultivationMethods,
            sub: masterData.subCultivationMethods,
        },
    });
};

const getPurposes = async (req, res) => {
    const masterData = await getMasterDataInternal();
    res.json({
        success: true,
        data: masterData.purposes,
    });
};

const getQrPricing = async (req, res) => {
    const masterData = await getMasterDataInternal();
    res.json({
        success: true,
        data: masterData.qrPricing,
    });
};

// Internal helper to get master data object
const getMasterDataInternal = async () => {
    // Return the same data structure as getMasterData
    return {
        purposes: [
            { id: 'RESEARCH', name: 'เพื่อการวิจัย', nameEn: 'Research', icon: '🔬' },
            { id: 'COMMERCIAL', name: 'เพื่อจำหน่าย', nameEn: 'Commercial Sale', icon: '🏪' },
            { id: 'EXPORT', name: 'เพื่อส่งออก', nameEn: 'Export', icon: '🌍' },
        ],
        cultivationMethods: [
            { id: 'outdoor', name: 'ปลูกกลางแจ้ง', nameEn: 'Outdoor', icon: '🌞', yieldMultiplier: 1.0 },
            { id: 'greenhouse', name: 'โรงเรือน', nameEn: 'Greenhouse', icon: '🏠', yieldMultiplier: 1.2 },
            { id: 'indoor', name: 'ฟาร์มแบบปิด', nameEn: 'Indoor Controlled', icon: '🏭', yieldMultiplier: 1.5 },
        ],
        subCultivationMethods: [
            { id: 'none', name: 'ไม่มี', nameEn: 'None', applicableTo: ['outdoor', 'greenhouse', 'indoor'] },
            { id: 'vertical', name: 'ฟาร์มแนวตั้ง', nameEn: 'Vertical Farm', applicableTo: ['greenhouse', 'indoor'] },
            { id: 'hydroponic', name: 'ไฮโดรโปนิกส์', nameEn: 'Hydroponic', applicableTo: ['greenhouse', 'indoor'] },
        ],
        qrPricing: [
            { min: 1, max: 100, pricePerQR: 5 },
            { min: 101, max: 500, pricePerQR: 4 },
            { min: 501, max: 1000, pricePerQR: 3 },
            { min: 1001, max: 999999, pricePerQR: 2 },
        ],
    };
};

module.exports = {
    getMasterData,
    getFees,
    getCultivationMethods,
    getPurposes,
    getQrPricing,
};
