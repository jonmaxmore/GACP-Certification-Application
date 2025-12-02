/**
 * GACP Application Model
 * Core business entity for certification applications
 *
 * Based on Thailand Cannabis GACP Guidelines (Official)
 */

const mongoose = require('mongoose');

// Application Status Enum
const ApplicationStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  DOCUMENTS_PENDING: 'documents_pending', // Request for more docs
  INSPECTION_SCHEDULED: 'inspection_scheduled',
  INSPECTION_IN_PROGRESS: 'inspection_in_progress',
  INSPECTION_COMPLETED: 'inspection_completed',
  EVALUATION: 'evaluation',
  DECISION_PENDING: 'decision_pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CERTIFICATE_ISSUED: 'certificate_issued',
};

// Applicant Types
const ApplicantType = {
  INDIVIDUAL: 'individual',
  COMMUNITY_ENTERPRISE: 'community_enterprise',
  JURISTIC: 'juristic', // Company/Corporate
};

// Request Types
const RequestType = {
  NEW: 'new',
  RENEWAL: 'renewal',
  REPLACEMENT: 'replacement', // Substitute
};

// Certification Scopes
const CertificationScope = {
  CULTIVATION: 'cultivation',
  PROCESSING: 'processing',
  BOTH: 'both',
};

// Document Types (Mapped from GACP Requirements)
const DocumentType = {
  // General
  APPLICATION_FORM: 'application_form', // 1
  LAND_TITLE_DEED: 'land_title_deed', // 2
  LAND_USE_CONSENT: 'land_use_consent', // 3
  LOCATION_MAP: 'location_map', // 4
  BUILDING_PLAN: 'building_plan', // 5
  PHOTOS_EXTERIOR: 'photos_exterior', // 6
  PRODUCTION_PLAN: 'production_plan', // 7
  SECURITY_WASTE_PLAN: 'security_waste_plan', // 8
  PHOTOS_INTERIOR: 'photos_interior', // 9
  SOP_MANUAL: 'sop_manual', // 10 (Critical)

  // Juristic / Corporate Specific
  COMPANY_REGISTRATION: 'company_registration', // 11
  SHAREHOLDER_LIST: 'shareholder_list', // 12
  AUTHORIZED_REP_LETTER: 'authorized_rep_letter', // 13
  POWER_OF_ATTORNEY: 'power_of_attorney', // 14 (Optional)

  // Technical / QA
  TRAINING_CERT_GACP: 'training_cert_gacp', // 15
  STRAIN_CERT: 'strain_cert', // 16
  TRAINING_RECORDS_INTERNAL: 'training_records_internal', // 17
  STAFF_TEST_RESULTS: 'staff_test_results', // 18
  TEST_PLANTING_MATERIAL: 'test_planting_material', // 19
  TEST_WATER: 'test_water', // 20
  TEST_FLOWER: 'test_flower', // 21
  INPUT_MATERIALS_REPORT: 'input_materials_report', // 22
  CONTROL_PLAN_CP_CCP: 'control_plan_cp_ccp', // 23
  CALIBRATION_CERT_SCALE: 'calibration_cert_scale', // 24
  PROCESS_VIDEO: 'process_video', // 25 (File upload option)

  // Other
  OTHER: 'other', // 26
};

// Applicant Information Schema (Snapshot)
const ApplicantInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ApplicantType),
    required: true,
  },
  name: { type: String, required: true }, // Name or Company Name
  registrationId: { type: String, required: true }, // ID Card or Tax ID
  address: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  lineId: String,

  // Juristic Specific
  phone: String, // Office phone
  representativeName: String, // Director/Authorized Person
}, { _id: false });

// Contact Person Schema (Coordinator)
const ContactPersonSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  lineId: String,
  email: String,
}, { _id: false });

// Farm Information Schema
const FarmInformationSchema = new mongoose.Schema(
  {
    farmName: { type: String, required: true, trim: true },
    location: {
      address: { type: String, required: true },
      province: { type: String, required: true },
      district: { type: String, required: true },
      subDistrict: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    locationType: {
      type: String,
      enum: ['outdoor', 'indoor', 'greenhouse', 'other'],
      required: true,
    },
    farmSize: {
      totalArea: { type: Number, required: true },
      unit: { type: String, default: 'rai' },
    },
    landHistory: {
      description: String, // Usage history > 2 years
      hasContaminationRisk: Boolean,
    },
    waterSource: {
      type: String,
      required: true,
    },
    processingFacility: { // For Processing Scope
      location: String,
      hygieneMeasures: [String],
    }
  },
  { _id: false },
);

// Crop Information Schema
const CropInformationSchema = new mongoose.Schema(
  {
    strainName: { type: String, required: true },
    sourceOrigin: { type: String, required: true }, // Company/Farm source
    partUsed: [{
      type: String,
      required: true,
    }],
    expectedQuantity: {
      value: Number,
      unit: String,
    },
    plantingDate: Date,
    harvestDate: Date,
  },
  { _id: false },
);

// Self Assessment Schema (GACP Checklist)
const SelfAssessmentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'qa', 'hygiene', 'document', 'equipment', 'site',
      'water', 'fertilizer', 'seeds', 'cultivation', 'harvest',
      'processing', 'facility', 'packaging', 'storage'
    ],
    required: true
  },
  items: [{
    questionId: String,
    requirement: String,
    compliant: { type: Boolean, default: false },
    evidence: String,
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }
  }]
}, { _id: false });

// Document Reference Schema
const DocumentReferenceSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      enum: Object.values(DocumentType),
    },
    fileName: String,
    fileUrl: String, // Path or URL
    fileSize: Number,
    uploadDate: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'verified', 'rejected'],
    },
    notes: String,
  },
  { _id: false },
);

// Form Specific Data Schema (For ภ.ท.9, 10, 11)
const FormSpecificDataSchema = new mongoose.Schema({
  // ภ.ท.9 (Production/Cultivation)
  production: {
    securityMeasures: {
      fenceDescription: String, // ลักษณะรั้ว
      cctvCount: Number, // จำนวนกล้องวงจรปิด
      guardCount: Number, // จำนวนเจ้าหน้าที่รักษาความปลอดภัย
      accessControl: String, // ระบบควบคุมการเข้า-ออก
    },
    storageFacility: {
      location: String, // สถานที่เก็บรักษา
      security: String, // ระบบความปลอดภัยคลัง
      temperatureControl: Boolean, // การควบคุมอุณหภูมิ
    }
  },
  // ภ.ท.10 (Sale)
  sale: {
    dispensingMethod: { type: String, enum: ['pharmacy', 'clinic', 'other'] }, // วิธีการจำหน่าย
    pharmacist: {
      name: String, // ชื่อเภสัชกร/ผู้มีหน้าที่ปฏิบัติการ
      licenseNumber: String, // เลขที่ใบอนุญาตประกอบวิชาชีพ
    },
    storageDetails: String // รายละเอียดสถานที่เก็บ
  },
  // ภ.ท.11 (Import/Export)
  importExport: {
    type: { type: String, enum: ['import', 'export'] },
    country: String, // ประเทศต้นทาง/ปลายทาง
    portOfEntryExit: String, // ด่านศุลกากร
    transportMode: { type: String, enum: ['air', 'sea', 'land'] }, // ช่องทางการขนส่ง
    carrierName: String, // ชื่อผู้ขนส่ง
    expectedDate: Date // วันที่คาดว่าจะนำเข้า/ส่งออก
  }
}, { _id: false });

// Main Application Schema
const ApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Request Details
    requestType: {
      type: String,
      enum: Object.values(RequestType),
      default: RequestType.NEW,
      required: true,
    },
    certificationScope: {
      type: String,
      enum: Object.values(CertificationScope),
      required: true,
    },
    purpose: {
      type: String,
      enum: ['research', 'commercial_domestic', 'commercial_export', 'other'],
      required: true,
    },

    // Applicant
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicantInfo: { // Snapshot at time of application
      type: ApplicantInfoSchema,
      required: true,
    },
    contactPerson: ContactPersonSchema,

    // Farm & Crop
    farmInformation: {
      type: FarmInformationSchema,
      required: true,
    },
    cropInformation: [CropInformationSchema],

    // Form Specific Data (ภ.ท.9, 10, 11)
    formSpecificData: {
      type: FormSpecificDataSchema,
      default: {}
    },

    // GACP Compliance
    selfAssessment: [SelfAssessmentSchema],

    // Documents
    documents: [DocumentReferenceSchema],
    processVideoLink: String, // Item 25

    // Process Management
    currentStatus: {
      type: String,
      required: true,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.DRAFT,
    },
    statusHistory: [{
      status: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date, default: Date.now },
      notes: String,
    }],

    // Audit & Inspection
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAuditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inspectionDate: Date,
    inspectionReport: { type: mongoose.Schema.Types.ObjectId, ref: 'InspectionReport' },

    // Scoring
    totalScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },

    // System
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'gacp_applications',
  },
);

// Indexes
ApplicationSchema.index({ applicationNumber: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1 });
ApplicationSchema.index({ currentStatus: 1 });

// Generate Application Number
ApplicationSchema.statics.generateApplicationNumber = function () {
  const year = new Date().getFullYear() + 543; // Thai Year
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return `GACP-${year}-${randomNum}`;
};

ApplicationSchema.pre('save', function (next) {
  if (!this.applicationNumber) {
    this.applicationNumber = this.constructor.generateApplicationNumber();
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
module.exports.ApplicationStatus = ApplicationStatus;
module.exports.DocumentType = DocumentType;
module.exports.ApplicantType = ApplicantType;
