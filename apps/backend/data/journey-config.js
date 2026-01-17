/**
 * Journey Configuration Data
 * 
 * Defines dynamic GACP application journeys based on:
 * - Purpose: domestic (จำหน่ายในประเทศ), export (ส่งออก), research (วิจัย)
 * - Cultivation Method: outdoor (กลางแจ้ง), greenhouse (โรงเรือน), indoor (ระบบปิด)
 * 
 * Each combination has different field requirements, documents, and security specs.
 */

// =====================
// PURPOSE OPTIONS
// =====================
const PURPOSES = [
    {
        id: 'domestic',
        nameTH: 'จำหน่ายในประเทศ',
        nameEN: 'Domestic Sales (B2B)',
        description: 'จำหน่ายให้กับผู้ประกอบการในประเทศ โรงพยาบาล คลินิก',
        requirements: ['GACP'],
        sortOrder: 1,
    },
    {
        id: 'export',
        nameTH: 'ส่งออก',
        nameEN: 'Export (International)',
        description: 'ส่งออกไปต่างประเทศ ต้องผ่านมาตรฐาน GACP ขั้นสูง',
        requirements: ['GACP_ADVANCED'],
        sortOrder: 2,
    },
    {
        id: 'research',
        nameTH: 'วิจัย',
        nameEN: 'Research',
        description: 'การวิจัยและพัฒนา ต้องมี Protocol การวิจัย',
        requirements: ['GACP', 'RESEARCH_PROTOCOL'],
        sortOrder: 3,
    },
];

// =====================
// CULTIVATION METHODS
// =====================
const CULTIVATION_METHODS = [
    {
        id: 'outdoor',
        nameTH: 'กลางแจ้ง',
        nameEN: 'Outdoor',
        description: 'ปลูกในแปลงกลางแจ้ง อาศัยแสงแดดธรรมชาติ',
        icon: 'sun',
        pros: ['ต้นทุนต่ำ', 'เหมาะกับพื้นที่กว้าง'],
        cons: ['ควบคุมสภาพแวดล้อมยาก', 'เสี่ยงศัตรูพืช'],
        feeMultiplier: 1.0,
        sortOrder: 1,
    },
    {
        id: 'greenhouse',
        nameTH: 'โรงเรือน',
        nameEN: 'Greenhouse',
        description: 'ปลูกในโรงเรือนที่มีหลังคาโปร่งแสง',
        icon: 'home',
        pros: ['ควบคุมสภาพแวดล้อมได้บางส่วน', 'ปลูกได้ตลอดปี'],
        cons: ['ต้นทุนสูงกว่ากลางแจ้ง'],
        feeMultiplier: 1.0,
        sortOrder: 2,
    },
    {
        id: 'indoor',
        nameTH: 'ระบบปิด',
        nameEN: 'Indoor Controlled',
        description: 'ปลูกในอาคารปิดที่ควบคุมสภาพแวดล้อมทั้งหมด',
        icon: 'building',
        pros: ['ควบคุมทุกปัจจัยได้', 'คุณภาพสม่ำเสมอ'],
        cons: ['ต้นทุนสูง', 'ค่าไฟฟ้าสูง'],
        feeMultiplier: 1.0,
        sortOrder: 3,
    },
];

// =====================
// FARM LAYOUTS
// =====================
const FARM_LAYOUTS = [
    // OUTDOOR layouts
    {
        id: 'row_cultivation',
        nameTH: 'แปลงยาว',
        nameEN: 'Row Cultivation',
        description: 'ปลูกเป็นแถวยาว ระยะห่างต้น 0.5-1 เมตร',
        applicableTo: ['outdoor'],
        plantsPerSqm: 1,
        spacingRowCm: 100,
        spacingPlantCm: 100,
        icon: 'rows',
    },
    {
        id: 'raised_bed',
        nameTH: 'แปลงยกร่อง',
        nameEN: 'Raised Bed',
        description: 'แปลงยกสูงเพื่อระบายน้ำ ระยะห่าง 50 ซม.',
        applicableTo: ['outdoor'],
        plantsPerSqm: 4,
        spacingRowCm: 50,
        spacingPlantCm: 50,
        icon: 'layer',
    },
    {
        id: 'block_plot',
        nameTH: 'แปลงบล็อก',
        nameEN: 'Block Plot',
        description: 'แปลงสี่เหลี่ยมแบ่งโซน ปลูกหลากหลายสายพันธุ์',
        applicableTo: ['outdoor'],
        plantsPerSqm: 1,
        spacingRowCm: 100,
        spacingPlantCm: 100,
        icon: 'grid',
    },
    {
        id: 'container',
        nameTH: 'ปลูกในกระถาง',
        nameEN: 'Container Growing',
        description: 'ปลูกในกระถางหรือภาชนะ สามารถเคลื่อนย้ายได้',
        applicableTo: ['outdoor', 'greenhouse'],
        plantsPerSqm: 0, // Manual input
        manualPlantCount: true,
        icon: 'pot',
    },
    // GREENHOUSE layouts
    {
        id: 'ground_rows',
        nameTH: 'แปลงพื้น',
        nameEN: 'Ground Rows',
        description: 'ปลูกลงดินภายในโรงเรือน',
        applicableTo: ['greenhouse'],
        plantsPerSqm: 1,
        spacingRowCm: 100,
        spacingPlantCm: 100,
        icon: 'rows',
    },
    {
        id: 'raised_tables',
        nameTH: 'โต๊ะยกสูง',
        nameEN: 'Raised Tables',
        description: 'ปลูกบนโต๊ะระดับเอว สะดวกในการดูแล',
        applicableTo: ['greenhouse'],
        plantsPerSqm: 2,
        spacingRowCm: 70,
        spacingPlantCm: 70,
        icon: 'table',
    },
    {
        id: 'hydroponic',
        nameTH: 'ไฮโดรโปนิกส์',
        nameEN: 'Hydroponic',
        description: 'ปลูกในระบบน้ำวน ไม่ใช้ดิน',
        applicableTo: ['greenhouse', 'indoor'],
        plantsPerSqm: 4,
        spacingRowCm: 50,
        spacingPlantCm: 50,
        icon: 'drop',
        subTypes: ['nft', 'dwc', 'drip'],
    },
];

// =====================
// GROWING STYLES (INDOOR ONLY)
// =====================
const GROWING_STYLES = [
    {
        id: 'traditional',
        nameTH: 'แบบดั้งเดิม',
        nameEN: 'Traditional',
        description: 'ปลูกแบบธรรมชาติ ให้ต้นโตเต็มที่',
        applicableTo: ['indoor'],
        plantsPerSqm: 2,
        icon: 'plant',
    },
    {
        id: 'sog',
        nameTH: 'Sea of Green (SOG)',
        nameEN: 'SOG',
        description: 'ปลูกต้นเล็กจำนวนมาก เก็บเกี่ยวเร็ว',
        applicableTo: ['indoor'],
        plantsPerSqm: 12,
        icon: 'grid-3x3',
    },
    {
        id: 'scrog',
        nameTH: 'Screen of Green (ScrOG)',
        nameEN: 'ScrOG',
        description: 'ใช้ตาข่ายบังคับทิศทางการเติบโต',
        applicableTo: ['indoor'],
        plantsPerSqm: 2,
        icon: 'net',
    },
    {
        id: 'vertical',
        nameTH: 'ชั้นวางแนวตั้ง',
        nameEN: 'Vertical Rack',
        description: 'ปลูกหลายชั้น เพิ่มพื้นที่ปลูกหลายเท่า',
        applicableTo: ['indoor'],
        plantsPerSqm: 6,
        supportsMultipleTiers: true,
        maxTiers: 5,
        icon: 'layers',
    },
];

// =====================
// JOURNEY CONFIGS (PURPOSE × METHOD)
// =====================
const JOURNEY_CONFIGS = [
    // DOMESTIC × OUTDOOR
    {
        id: 'domestic_outdoor',
        purpose: 'domestic',
        method: 'outdoor',
        level: 'basic',
        requiredFields: [
            'soilAnalysis',
            'waterSource',
            'waterQuality',
            'ipmPlan',
            'weatherProtection',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'plot_map',
            'soil_analysis_report',
        ],
        securityRequirements: [
            'fence_2m',
            'barbed_wire',
            'cctv_entry',
            'cctv_plot',
            'warning_signs',
        ],
        availableLayouts: ['row_cultivation', 'raised_bed', 'block_plot', 'container'],
    },
    // DOMESTIC × GREENHOUSE
    {
        id: 'domestic_greenhouse',
        purpose: 'domestic',
        method: 'greenhouse',
        level: 'standard',
        requiredFields: [
            'greenhouseStructure',
            'ventilationSystem',
            'temperatureControl',
            'waterSource',
            'ipmPlan',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'plot_map',
            'greenhouse_specs',
            'sop_cultivation',
        ],
        securityRequirements: [
            'fence_2m',
            'cctv_entry',
            'cctv_plot',
            'access_control',
            'warning_signs',
        ],
        availableLayouts: ['ground_rows', 'raised_tables', 'hydroponic', 'container'],
    },
    // DOMESTIC × INDOOR
    {
        id: 'domestic_indoor',
        purpose: 'domestic',
        method: 'indoor',
        level: 'advanced',
        requiredFields: [
            'hvacSystem',
            'lightingSystem',
            'temperatureHumidityControl',
            'co2Supplementation',
            'airFiltration',
            'growingStyle',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'building_permit',
            'floor_plan',
            'hvac_specs',
            'lighting_specs',
            'sop_cultivation',
            'sop_environmental_control',
        ],
        securityRequirements: [
            'fence_2m',
            'cctv_entry',
            'cctv_plot',
            'cctv_rooms',
            'biometric_access',
            'access_log',
            'warning_signs',
        ],
        availableLayouts: ['hydroponic'],
        availableGrowingStyles: ['traditional', 'sog', 'scrog', 'vertical'],
    },
    // EXPORT × OUTDOOR
    {
        id: 'export_outdoor',
        purpose: 'export',
        method: 'outdoor',
        level: 'gacp_export',
        requiredFields: [
            'soilAnalysis',
            'waterSource',
            'waterQuality',
            'ipmPlan',
            'weatherProtection',
            'traceabilitySystem',
            'qualityControlPlan',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'plot_map',
            'soil_analysis_report',
            'water_quality_report',
            'gacp_certificate',
            'export_license',
            'cites_permit',
            'lab_analysis_thc_cbd',
            'sop_cultivation',
            'sop_quality_control',
            'traceability_plan',
        ],
        securityRequirements: [
            'fence_2m',
            'barbed_wire',
            'cctv_entry',
            'cctv_plot',
            'cctv_perimeter',
            'access_control',
            'access_log',
            'warning_signs',
            'guard_24h',
        ],
        availableLayouts: ['row_cultivation', 'raised_bed', 'block_plot'],
    },
    // EXPORT × GREENHOUSE
    {
        id: 'export_greenhouse',
        purpose: 'export',
        method: 'greenhouse',
        level: 'gacp_export_advanced',
        requiredFields: [
            'greenhouseStructure',
            'ventilationSystem',
            'temperatureControl',
            'waterSource',
            'waterQuality',
            'ipmPlan',
            'traceabilitySystem',
            'qualityControlPlan',
            'batchTracking',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'plot_map',
            'greenhouse_specs',
            'water_quality_report',
            'gacp_certificate',
            'gmp_certificate',
            'export_license',
            'cites_permit',
            'lab_analysis_thc_cbd',
            'lab_analysis_heavy_metals',
            'lab_analysis_pesticides',
            'sop_cultivation',
            'sop_quality_control',
            'sop_batch_management',
            'traceability_plan',
        ],
        securityRequirements: [
            'fence_2m',
            'cctv_entry',
            'cctv_plot',
            'cctv_perimeter',
            'biometric_access',
            'access_log',
            'warning_signs',
            'guard_24h',
        ],
        availableLayouts: ['ground_rows', 'raised_tables', 'hydroponic'],
    },
    // EXPORT × INDOOR
    {
        id: 'export_indoor',
        purpose: 'export',
        method: 'indoor',
        level: 'gacp_export_premium',
        requiredFields: [
            'hvacSystem',
            'lightingSystem',
            'temperatureHumidityControl',
            'co2Supplementation',
            'airFiltration',
            'cleanroomClass',
            'traceabilitySystem',
            'qualityControlPlan',
            'batchTracking',
            'growingStyle',
        ],
        requiredDocuments: [
            'id_card',
            'house_registration',
            'land_document',
            'building_permit',
            'floor_plan',
            'hvac_specs',
            'lighting_specs',
            'cleanroom_certification',
            'gacp_certificate',
            'eu_gmp_certificate',
            'export_license',
            'cites_permit',
            'lab_analysis_thc_cbd',
            'lab_analysis_heavy_metals',
            'lab_analysis_pesticides',
            'lab_analysis_microbial',
            'sop_cultivation',
            'sop_environmental_control',
            'sop_quality_control',
            'sop_batch_management',
            'sop_cleanroom',
            'traceability_plan',
            'validation_reports',
        ],
        securityRequirements: [
            'fence_2m',
            'cctv_entry',
            'cctv_plot',
            'cctv_rooms',
            'cctv_perimeter',
            'biometric_access',
            'access_log',
            'mantrap_entry',
            'warning_signs',
            'guard_24h',
        ],
        availableLayouts: ['hydroponic'],
        availableGrowingStyles: ['traditional', 'sog', 'scrog', 'vertical'],
    },
    // RESEARCH × ALL (simplified)
    {
        id: 'research_outdoor',
        purpose: 'research',
        method: 'outdoor',
        level: 'research',
        requiredFields: ['researchProtocol', 'principalInvestigator', 'institutionAffiliation'],
        requiredDocuments: ['id_card', 'research_protocol', 'institution_letter', 'ethics_approval'],
        securityRequirements: ['fence_2m', 'cctv_entry', 'access_log', 'warning_signs'],
        availableLayouts: ['row_cultivation', 'raised_bed', 'container'],
    },
    {
        id: 'research_greenhouse',
        purpose: 'research',
        method: 'greenhouse',
        level: 'research',
        requiredFields: ['researchProtocol', 'principalInvestigator', 'institutionAffiliation', 'greenhouseStructure'],
        requiredDocuments: ['id_card', 'research_protocol', 'institution_letter', 'ethics_approval', 'greenhouse_specs'],
        securityRequirements: ['fence_2m', 'cctv_entry', 'access_control', 'access_log', 'warning_signs'],
        availableLayouts: ['ground_rows', 'raised_tables', 'hydroponic'],
    },
    {
        id: 'research_indoor',
        purpose: 'research',
        method: 'indoor',
        level: 'research_advanced',
        requiredFields: ['researchProtocol', 'principalInvestigator', 'institutionAffiliation', 'hvacSystem', 'lightingSystem'],
        requiredDocuments: ['id_card', 'research_protocol', 'institution_letter', 'ethics_approval', 'floor_plan', 'hvac_specs'],
        securityRequirements: ['fence_2m', 'cctv_entry', 'cctv_rooms', 'biometric_access', 'access_log', 'warning_signs'],
        availableLayouts: ['hydroponic'],
        availableGrowingStyles: ['traditional', 'sog', 'scrog', 'vertical'],
    },
];

// =====================
// DOCUMENT DEFINITIONS
// =====================
const DOCUMENT_DEFINITIONS = {
    id_card: { nameTH: 'บัตรประชาชน', nameEN: 'ID Card', category: 'identity', required: true },
    house_registration: { nameTH: 'ทะเบียนบ้าน', nameEN: 'House Registration', category: 'identity', required: true },
    land_document: { nameTH: 'เอกสารสิทธิ์ที่ดิน', nameEN: 'Land Document', category: 'land', required: true },
    plot_map: { nameTH: 'แผนที่แปลงปลูก', nameEN: 'Plot Map', category: 'land', required: true },
    building_permit: { nameTH: 'ใบอนุญาตก่อสร้าง', nameEN: 'Building Permit', category: 'land', required: false },
    floor_plan: { nameTH: 'แบบแปลนอาคาร', nameEN: 'Floor Plan', category: 'land', required: false },
    soil_analysis_report: { nameTH: 'ผลวิเคราะห์ดิน', nameEN: 'Soil Analysis Report', category: 'environmental', required: false },
    water_quality_report: { nameTH: 'ผลวิเคราะห์คุณภาพน้ำ', nameEN: 'Water Quality Report', category: 'environmental', required: false },
    greenhouse_specs: { nameTH: 'รายละเอียดโรงเรือน', nameEN: 'Greenhouse Specifications', category: 'facility', required: false },
    hvac_specs: { nameTH: 'รายละเอียดระบบ HVAC', nameEN: 'HVAC Specifications', category: 'facility', required: false },
    lighting_specs: { nameTH: 'รายละเอียดระบบแสง', nameEN: 'Lighting Specifications', category: 'facility', required: false },
    sop_cultivation: { nameTH: 'SOP การปลูก', nameEN: 'Cultivation SOP', category: 'operations', required: false },
    sop_environmental_control: { nameTH: 'SOP ควบคุมสิ่งแวดล้อม', nameEN: 'Environmental Control SOP', category: 'operations', required: false },
    sop_quality_control: { nameTH: 'SOP ควบคุมคุณภาพ', nameEN: 'Quality Control SOP', category: 'operations', required: false },
    sop_batch_management: { nameTH: 'SOP จัดการ Batch', nameEN: 'Batch Management SOP', category: 'operations', required: false },
    sop_cleanroom: { nameTH: 'SOP ห้องสะอาด', nameEN: 'Cleanroom SOP', category: 'operations', required: false },
    gacp_certificate: { nameTH: 'ใบรับรอง GACP', nameEN: 'GACP Certificate', category: 'certification', required: false },
    gmp_certificate: { nameTH: 'ใบรับรอง GMP', nameEN: 'GMP Certificate', category: 'certification', required: false },
    eu_gmp_certificate: { nameTH: 'ใบรับรอง EU-GMP', nameEN: 'EU-GMP Certificate', category: 'certification', required: false },
    export_license: { nameTH: 'ใบอนุญาตส่งออก', nameEN: 'Export License', category: 'license', required: false },
    cites_permit: { nameTH: 'ใบอนุญาต CITES', nameEN: 'CITES Permit', category: 'license', required: false },
    cleanroom_certification: { nameTH: 'ใบรับรองห้องสะอาด', nameEN: 'Cleanroom Certification', category: 'certification', required: false },
    lab_analysis_thc_cbd: { nameTH: 'ผลตรวจ THC/CBD', nameEN: 'THC/CBD Lab Analysis', category: 'lab', required: false },
    lab_analysis_heavy_metals: { nameTH: 'ผลตรวจโลหะหนัก', nameEN: 'Heavy Metals Analysis', category: 'lab', required: false },
    lab_analysis_pesticides: { nameTH: 'ผลตรวจสารเคมีตกค้าง', nameEN: 'Pesticide Analysis', category: 'lab', required: false },
    lab_analysis_microbial: { nameTH: 'ผลตรวจเชื้อจุลินทรีย์', nameEN: 'Microbial Analysis', category: 'lab', required: false },
    traceability_plan: { nameTH: 'แผนการตรวจสอบย้อนกลับ', nameEN: 'Traceability Plan', category: 'operations', required: false },
    validation_reports: { nameTH: 'รายงาน Validation', nameEN: 'Validation Reports', category: 'operations', required: false },
    research_protocol: { nameTH: 'โปรโตคอลวิจัย', nameEN: 'Research Protocol', category: 'research', required: false },
    institution_letter: { nameTH: 'หนังสือรับรองจากสถาบัน', nameEN: 'Institution Letter', category: 'research', required: false },
    ethics_approval: { nameTH: 'การอนุมัติจริยธรรม', nameEN: 'Ethics Approval', category: 'research', required: false },
};

// =====================
// SECURITY DEFINITIONS
// =====================
const SECURITY_DEFINITIONS = {
    fence_2m: { nameTH: 'รั้วรอบขอบชิด สูง 2 เมตร', nameEN: 'Perimeter Fence 2m', category: 'perimeter' },
    barbed_wire: { nameTH: 'ลวดหนาม/กันปีน', nameEN: 'Barbed Wire', category: 'perimeter' },
    cctv_entry: { nameTH: 'กล้อง CCTV ทางเข้า-ออก', nameEN: 'CCTV Entry/Exit', category: 'surveillance' },
    cctv_plot: { nameTH: 'กล้อง CCTV แปลงปลูก', nameEN: 'CCTV Cultivation Area', category: 'surveillance' },
    cctv_rooms: { nameTH: 'กล้อง CCTV ห้องปฏิบัติการ', nameEN: 'CCTV Rooms', category: 'surveillance' },
    cctv_perimeter: { nameTH: 'กล้อง CCTV รอบแนวรั้ว', nameEN: 'CCTV Perimeter', category: 'surveillance' },
    access_control: { nameTH: 'ระบบควบคุมการเข้าออก', nameEN: 'Access Control', category: 'access' },
    biometric_access: { nameTH: 'ระบบ Biometric', nameEN: 'Biometric Access', category: 'access' },
    access_log: { nameTH: 'บันทึกการเข้าออก', nameEN: 'Access Log', category: 'access' },
    mantrap_entry: { nameTH: 'ประตู Mantrap', nameEN: 'Mantrap Entry', category: 'access' },
    warning_signs: { nameTH: 'ป้ายเตือน', nameEN: 'Warning Signs', category: 'signage' },
    guard_24h: { nameTH: 'รปภ. 24 ชั่วโมง', nameEN: '24h Security Guard', category: 'personnel' },
};

// =====================
// GACP 14 CATEGORIES (กรมการแพทย์แผนไทยฯ)
// =====================
const GACP_CATEGORIES = [
    { id: 1, nameTH: 'ข้อมูลทั่วไป', nameEN: 'General Information', steps: [1, 2, 3] },
    { id: 2, nameTH: 'พื้นที่เพาะปลูก', nameEN: 'Cultivation Area', steps: [4] },
    { id: 3, nameTH: 'แหล่งน้ำและคุณภาพน้ำ', nameEN: 'Water Source and Quality', steps: [4] },
    { id: 4, nameTH: 'วัสดุปลูกและเมล็ดพันธุ์', nameEN: 'Planting Materials and Seeds', steps: [5] },
    { id: 5, nameTH: 'การจัดการการผลิต', nameEN: 'Production Management', steps: [5, 6] },
    { id: 6, nameTH: 'การป้องกันและกำจัดศัตรูพืช (IPM)', nameEN: 'Integrated Pest Management', steps: [5] },
    { id: 7, nameTH: 'การเก็บเกี่ยว', nameEN: 'Harvesting', steps: [7] },
    { id: 8, nameTH: 'การจัดการหลังเก็บเกี่ยว', nameEN: 'Post-Harvest Management', steps: [7] },
    { id: 9, nameTH: 'บุคลากรและสุขอนามัย', nameEN: 'Personnel and Hygiene', steps: [2, 4] },
    { id: 10, nameTH: 'อุปกรณ์และเครื่องมือ', nameEN: 'Equipment and Tools', steps: [5] },
    { id: 11, nameTH: 'การบันทึกข้อมูล', nameEN: 'Record Keeping', steps: [6] },
    { id: 12, nameTH: 'ความปลอดภัย', nameEN: 'Security', steps: [4] },
    { id: 13, nameTH: 'การควบคุมคุณภาพ', nameEN: 'Quality Control', steps: [7] },
    { id: 14, nameTH: 'เอกสารและ SOP', nameEN: 'Documents and SOP', steps: [8] },
];

// =====================
// ENVIRONMENT CHECKLIST (สำหรับ Step 4)
// =====================
const ENVIRONMENT_CHECKLIST = [
    { id: 'no_waste_dump', nameTH: 'พื้นที่ไม่เคยเป็นที่ทิ้งขยะ/สารเคมี', nameEN: 'Not former waste/chemical dump', required: true, gacpCategory: 2 },
    { id: 'no_contamination', nameTH: 'ไม่อยู่ใกล้แหล่งปนเปื้อน (โรงงาน/โรงพยาบาล/คอกสัตว์)', nameEN: 'Not near contamination sources', required: true, gacpCategory: 2 },
    { id: 'no_chemicals_3y', nameTH: 'ไม่เคยใช้สารเคมีเข้มข้นในช่วง 3 ปี', nameEN: 'No intensive chemicals in last 3 years', required: false, gacpCategory: 2 },
    { id: 'suitable_environment', nameTH: 'สภาพแวดล้อมเหมาะสมสำหรับการปลูกพืชสมุนไพร', nameEN: 'Suitable environment for herb cultivation', required: true, gacpCategory: 2 },
];

// =====================
// WATER SOURCES
// =====================
const WATER_SOURCES = [
    { id: 'WELL', nameTH: 'บ่อบาดาล', nameEN: 'Well' },
    { id: 'RAIN', nameTH: 'น้ำฝน', nameEN: 'Rainwater' },
    { id: 'RIVER', nameTH: 'แม่น้ำ/ลำคลอง', nameEN: 'River/Canal' },
    { id: 'TAP', nameTH: 'น้ำประปา', nameEN: 'Tap Water' },
    { id: 'POND', nameTH: 'สระ/อ่างเก็บน้ำ', nameEN: 'Pond/Reservoir' },
];

// =====================
// GACP STEP MAPPING (ข้อมูลที่ต้องกรอกต่อ Step)
// =====================
const GACP_STEP_REQUIREMENTS = {
    // Step 4: Farm
    4: {
        gacpCategories: [2, 3, 9, 12],
        fields: ['farmName', 'address', 'totalArea', 'landOwnership', 'waterSource', 'security'],
        documents: ['land_title', 'farm_map', 'water_quality_report'],
        docRequired: ['land_title', 'farm_map'],
        docOptional: ['water_quality_report'],
    },
    // Step 5: Plots
    5: {
        gacpCategories: [4, 5, 6, 10],
        fields: ['plotName', 'plotArea', 'gps', 'cultivationSystem', 'seedSource', 'ipmPlan'],
        documents: ['soil_analysis_report', 'seed_certificate'],
        docRequired: [],
        docOptional: ['soil_analysis_report', 'seed_certificate'],
    },
    // Step 6: Lots
    6: {
        gacpCategories: [5, 11],
        fields: ['lotCode', 'plotId', 'plantCount', 'plantingDate'],
        documents: ['production_plan'],
        docRequired: [],
        docOptional: ['production_plan'],
    },
    // Step 7: Harvest & QC
    7: {
        gacpCategories: [7, 8, 13],
        fields: ['harvestMethod', 'dryingMethod', 'storage', 'qcPlan'],
        documents: ['sop_cultivation', 'sop_quality_control'],
        docRequired: ['sop_cultivation'],
        docOptional: ['sop_quality_control'],
    },
    // Step 8: Documents
    8: {
        gacpCategories: [14],
        fields: [],
        documents: [], // Will be calculated dynamically
        docRequired: [],
        docOptional: [],
    },
};

// =====================
// SOIL TYPES (สำหรับ Step 5)
// =====================
const SOIL_TYPES = [
    { id: 'clay', nameTH: 'ดินเหนียว', nameEN: 'Clay' },
    { id: 'loam', nameTH: 'ดินร่วน', nameEN: 'Loam' },
    { id: 'sandy_loam', nameTH: 'ดินร่วนปนทราย', nameEN: 'Sandy Loam' },
    { id: 'sandy', nameTH: 'ดินทราย', nameEN: 'Sandy' },
    { id: 'peat', nameTH: 'ดินพีท', nameEN: 'Peat' },
    { id: 'organic', nameTH: 'ดินอินทรีย์', nameEN: 'Organic' },
    { id: 'hydroponic', nameTH: 'ไฮโดรโปนิกส์ (ไม่ใช้ดิน)', nameEN: 'Hydroponic (Soilless)' },
];

// =====================
// SEED SOURCES (สำหรับ Step 5)
// =====================
const SEED_SOURCES = [
    { id: 'own', nameTH: 'เพาะเอง', nameEN: 'Self-propagated' },
    { id: 'certified', nameTH: 'ซื้อจากร้านพันธุ์พืชรับรอง', nameEN: 'Certified Seed Shop' },
    { id: 'government', nameTH: 'จากหน่วยงานราชการ', nameEN: 'Government Agency' },
    { id: 'research', nameTH: 'จากสถาบันวิจัย', nameEN: 'Research Institute' },
    { id: 'import', nameTH: 'นำเข้าจากต่างประเทศ', nameEN: 'Imported' },
];

// =====================
// IPM METHODS (สำหรับ Step 5)
// =====================
const IPM_METHODS = [
    { id: 'biological', nameTH: 'การควบคุมทางชีวภาพ', nameEN: 'Biological Control', description: 'ใช้แมลงศัตรูธรรมชาติ เช่น ตัวห้ำ ตัวเบียน' },
    { id: 'cultural', nameTH: 'การจัดการทางเขตกรรม', nameEN: 'Cultural Control', description: 'หมุนเวียนพืช ปลูกพืชคลุมดิน' },
    { id: 'mechanical', nameTH: 'การควบคุมโดยกล', nameEN: 'Mechanical Control', description: 'กับดัก กาว ตาข่าย' },
    { id: 'physical', nameTH: 'การควบคุมทางกายภาพ', nameEN: 'Physical Control', description: 'คลุมพลาสติก ใช้ความร้อน' },
    { id: 'botanical', nameTH: 'สารสกัดจากพืช', nameEN: 'Botanical Pesticides', description: 'สะเดา หางไหล ขมิ้น' },
    { id: 'organic', nameTH: 'สารอินทรีย์อนุญาต', nameEN: 'Approved Organic Substances', description: 'ตามรายการที่กรมวิชาการเกษตรอนุญาต' },
];

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get journey config by purpose and method
 */
function getJourneyConfig(purpose, method) {
    return JOURNEY_CONFIGS.find(j => j.purpose === purpose && j.method === method);
}

/**
 * Get available layouts for a cultivation method
 */
function getLayoutsForMethod(method) {
    return FARM_LAYOUTS.filter(l => l.applicableTo.includes(method));
}

/**
 * Get growing styles for indoor cultivation
 */
function getGrowingStyles() {
    return GROWING_STYLES;
}

/**
 * Calculate plant count based on area and layout
 * @param {number} areaSqm - Area in square meters
 * @param {string} layoutId - Layout ID
 * @param {string} styleId - Growing style ID (for indoor)
 * @param {number} tiers - Number of tiers (for vertical)
 * @returns {{ count: number, formula: string, density: number }}
 */
function calculatePlantCount(areaSqm, layoutId, styleId = null, tiers = 1) {
    const layout = FARM_LAYOUTS.find(l => l.id === layoutId);

    if (!layout) {
        return { count: 0, formula: 'Unknown layout', density: 0 };
    }

    if (layout.manualPlantCount) {
        return { count: 0, formula: 'กรุณากรอกจำนวนต้นด้วยตนเอง', density: 0, manualInput: true };
    }

    let density = layout.plantsPerSqm;
    let tierMultiplier = 1;
    let densitySource = 'layout';

    // If indoor and has style, use style's density
    if (styleId) {
        const style = GROWING_STYLES.find(s => s.id === styleId);
        if (style) {
            density = style.plantsPerSqm;
            densitySource = 'style';

            // If vertical with multiple tiers
            if (style.supportsMultipleTiers && tiers > 1) {
                tierMultiplier = Math.min(tiers, style.maxTiers);
            }
        }
    }

    const count = Math.floor(areaSqm * density * tierMultiplier);
    const formula = tierMultiplier > 1
        ? `${areaSqm} ㎡ × ${density} ต้น/㎡ × ${tierMultiplier} ชั้น = ${count} ต้น`
        : `${areaSqm} ㎡ × ${density} ต้น/㎡ = ${count} ต้น`;

    return { count, formula, density, tiers: tierMultiplier, densitySource };
}

/**
 * Convert area units to square meters
 */
function convertToSqm(value, unit) {
    switch (unit) {
        case 'Rai':
            return value * 1600;
        case 'Ngan':
            return value * 400;
        case 'Sqm':
        default:
            return value;
    }
}

/**
 * Get document details by IDs
 */
function getDocumentDetails(docIds) {
    return docIds
        .filter(id => DOCUMENT_DEFINITIONS[id])
        .map(id => ({ id, ...DOCUMENT_DEFINITIONS[id] }));
}

/**
 * Get security details by IDs
 */
function getSecurityDetails(secIds) {
    return secIds
        .filter(id => SECURITY_DEFINITIONS[id])
        .map(id => ({ id, ...SECURITY_DEFINITIONS[id] }));
}

module.exports = {
    PURPOSES,
    CULTIVATION_METHODS,
    FARM_LAYOUTS,
    GROWING_STYLES,
    JOURNEY_CONFIGS,
    DOCUMENT_DEFINITIONS,
    SECURITY_DEFINITIONS,
    // NEW: GACP 14 Categories
    GACP_CATEGORIES,
    ENVIRONMENT_CHECKLIST,
    WATER_SOURCES,
    GACP_STEP_REQUIREMENTS,
    // NEW: Step 5 Plot Data
    SOIL_TYPES,
    SEED_SOURCES,
    IPM_METHODS,
    // Helper functions
    getJourneyConfig,
    getLayoutsForMethod,
    getGrowingStyles,
    calculatePlantCount,
    convertToSqm,
    getDocumentDetails,
    getSecurityDetails,
};
