/**
 * DTAM Application Entity
 * Domain Layer - Clean Architecture
 *
 * Purpose: Core business entity for GACP certification applications
 * - Application lifecycle management
 * - Status transitions
 * - Document tracking
 * - Workflow state management
 */

class DTAMApplication {
  constructor({
    id = null,
    applicationNumber = null,
    lotId = null,

    // Farmer Information
    farmerId,
    farmerName,
    farmerIdCard,
    farmerPhone,
    farmerEmail = null,

    // Farm Information
    farmName,
    farmAddress,
    farmProvince,
    farmDistrict,
    farmSubDistrict,
    farmPostalCode,
    farmArea, // in rai
    farmGPS = null,
    cropType,
    cultivationMethod = null,

    // Application Status
    status = DTAMApplication.STATUS.DRAFT,
    currentStage = DTAMApplication.STAGE.SUBMISSION,

    // Documents
    uploadedDocuments = [],
    requiredDocuments = DTAMApplication.REQUIRED_DOCUMENTS,

    // AI QC Results
    aiQcScore = null,
    aiQcGrade = null,
    aiQcInspectionMode = null,
    aiQcIssues = [],
    aiQcCompletedAt = null,

    // Review Stage
    reviewerId = null,
    reviewerName = null,
    reviewStatus = null,
    reviewComments = null,
    reviewedAt = null,

    // Inspection Stage
    inspectorId = null,
    inspectorName = null,
    inspectionType = null, // VIDEO, HYBRID, ONSITE
    inspectionScheduledDate = null,
    inspectionCompletedDate = null,
    inspectionScore = null,
    inspectionStatus = null,
    inspectionReport = null,
    inspectionEvidence = [],

    // Approval Stage
    approverId = null,
    approverName = null,
    approvalStatus = null,
    approvalComments = null,
    approvedAt = null,

    // Certificate
    certificateNumber = null,
    certificateIssuedAt = null,
    certificateExpiresAt = null,
    certificateStatus = null,

    // Payment
    paymentRequired = true,
    paymentAmount = 0,
    paymentStatus = DTAMApplication.PAYMENT_STATUS.PENDING,
    paymentReceipt = null,
    paymentDate = null,

    // Metadata
    submittedAt = null,
    createdAt = new Date(),
    updatedAt = new Date(),
    createdBy = null,
    updatedBy = null,
  }) {
    this.id = id;
    this.applicationNumber = applicationNumber;
    this.lotId = lotId;

    this.farmerId = farmerId;
    this.farmerName = farmerName;
    this.farmerIdCard = farmerIdCard;
    this.farmerPhone = farmerPhone;
    this.farmerEmail = farmerEmail;

    this.farmName = farmName;
    this.farmAddress = farmAddress;
    this.farmProvince = farmProvince;
    this.farmDistrict = farmDistrict;
    this.farmSubDistrict = farmSubDistrict;
    this.farmPostalCode = farmPostalCode;
    this.farmArea = farmArea;
    this.farmGPS = farmGPS;
    this.cropType = cropType;
    this.cultivationMethod = cultivationMethod;

    this.status = status;
    this.currentStage = currentStage;

    this.uploadedDocuments = uploadedDocuments;
    this.requiredDocuments = requiredDocuments;

    this.aiQcScore = aiQcScore;
    this.aiQcGrade = aiQcGrade;
    this.aiQcInspectionMode = aiQcInspectionMode;
    this.aiQcIssues = aiQcIssues;
    this.aiQcCompletedAt = aiQcCompletedAt;

    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.reviewStatus = reviewStatus;
    this.reviewComments = reviewComments;
    this.reviewedAt = reviewedAt;

    this.inspectorId = inspectorId;
    this.inspectorName = inspectorName;
    this.inspectionType = inspectionType;
    this.inspectionScheduledDate = inspectionScheduledDate;
    this.inspectionCompletedDate = inspectionCompletedDate;
    this.inspectionScore = inspectionScore;
    this.inspectionStatus = inspectionStatus;
    this.inspectionReport = inspectionReport;
    this.inspectionEvidence = inspectionEvidence;

    this.approverId = approverId;
    this.approverName = approverName;
    this.approvalStatus = approvalStatus;
    this.approvalComments = approvalComments;
    this.approvedAt = approvedAt;

    this.certificateNumber = certificateNumber;
    this.certificateIssuedAt = certificateIssuedAt;
    this.certificateExpiresAt = certificateExpiresAt;
    this.certificateStatus = certificateStatus;

    this.paymentRequired = paymentRequired;
    this.paymentAmount = paymentAmount;
    this.paymentStatus = paymentStatus;
    this.paymentReceipt = paymentReceipt;
    this.paymentDate = paymentDate;

    this.submittedAt = submittedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }

  // Status constants
  static STATUS = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SUBMITTED',
    IN_REVIEW: 'IN_REVIEW',
    REVIEW_PASSED: 'REVIEW_PASSED',
    REVIEW_FAILED: 'REVIEW_FAILED',
    INSPECTION_SCHEDULED: 'INSPECTION_SCHEDULED',
    INSPECTION_IN_PROGRESS: 'INSPECTION_IN_PROGRESS',
    INSPECTION_COMPLETED: 'INSPECTION_COMPLETED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CERTIFICATE_ISSUED: 'CERTIFICATE_ISSUED',
  };

  // Stage constants
  static STAGE = {
    SUBMISSION: 'SUBMISSION',
    AI_QC: 'AI_QC',
    REVIEW: 'REVIEW',
    INSPECTION: 'INSPECTION',
    APPROVAL: 'APPROVAL',
    CERTIFICATE: 'CERTIFICATE',
  };

  // Inspection type constants
  static INSPECTION_TYPE = {
    VIDEO: 'VIDEO',
    HYBRID: 'HYBRID',
    ONSITE: 'ONSITE',
  };

  // Payment status constants
  static PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    VERIFIED: 'VERIFIED',
    REFUNDED: 'REFUNDED',
  };

  // Required documents
  static REQUIRED_DOCUMENTS = [
    'id_card',
    'house_registration',
    'land_deed',
    'farm_map',
    'water_source_photo',
    'crop_photo',
    'storage_facility_photo',
    'farmer_photo',
  ];

  /**
   * Submit application
   */
  submit() {
    if (this.status !== DTAMApplication.STATUS.DRAFT) {
      throw new Error('Only draft applications can be submitted');
    }

    // Validate all required documents uploaded
    const missingDocs = this.getMissingDocuments();
    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    this.status = DTAMApplication.STATUS.SUBMITTED;
    this.currentStage = DTAMApplication.STAGE.AI_QC;
    this.submittedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Complete AI QC
   */
  completeAIQC(qcResult) {
    if (this.currentStage !== DTAMApplication.STAGE.AI_QC) {
      throw new Error('Application must be in AI_QC stage');
    }

    this.aiQcScore = qcResult.score;
    this.aiQcGrade = qcResult.grade;
    this.aiQcInspectionMode = qcResult.inspectionMode;
    this.aiQcIssues = qcResult.issues || [];
    this.aiQcCompletedAt = new Date();
    this.currentStage = DTAMApplication.STAGE.REVIEW;
    this.status = DTAMApplication.STATUS.IN_REVIEW;
    this.updatedAt = new Date();
  }

  /**
   * Assign to reviewer
   */
  assignToReviewer(reviewerId, reviewerName) {
    if (this.currentStage !== DTAMApplication.STAGE.REVIEW) {
      throw new Error('Application must be in REVIEW stage');
    }

    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.updatedAt = new Date();
  }

  /**
   * Complete review
   */
  completeReview(reviewStatus, comments, reviewerId) {
    if (!this.reviewerId) {
      throw new Error('Application must be assigned to a reviewer first');
    }

    this.reviewStatus = reviewStatus;
    this.reviewComments = comments;
    this.reviewedAt = new Date();
    this.updatedAt = new Date();

    if (reviewStatus === 'PASSED') {
      this.status = DTAMApplication.STATUS.REVIEW_PASSED;
      this.currentStage = DTAMApplication.STAGE.INSPECTION;
    } else if (reviewStatus === 'FAILED') {
      this.status = DTAMApplication.STATUS.REVIEW_FAILED;
    }
  }

  /**
   * Assign to inspector
   */
  assignToInspector(inspectorId, inspectorName, inspectionType) {
    if (this.currentStage !== DTAMApplication.STAGE.INSPECTION) {
      throw new Error('Application must be in INSPECTION stage');
    }

    this.inspectorId = inspectorId;
    this.inspectorName = inspectorName;
    this.inspectionType = inspectionType || this.aiQcInspectionMode;
    this.updatedAt = new Date();
  }

  /**
   * Schedule inspection
   */
  scheduleInspection(scheduledDate, inspectorId) {
    if (!this.inspectorId) {
      throw new Error('Application must be assigned to an inspector first');
    }

    this.inspectionScheduledDate = scheduledDate;
    this.status = DTAMApplication.STATUS.INSPECTION_SCHEDULED;
    this.updatedAt = new Date();
  }

  /**
   * Start inspection
   */
  startInspection() {
    if (this.status !== DTAMApplication.STATUS.INSPECTION_SCHEDULED) {
      throw new Error('Inspection must be scheduled first');
    }

    this.status = DTAMApplication.STATUS.INSPECTION_IN_PROGRESS;
    this.inspectionStatus = 'IN_PROGRESS';
    this.updatedAt = new Date();
  }

  /**
   * Complete inspection
   */
  completeInspection(score, report, evidence) {
    if (this.status !== DTAMApplication.STATUS.INSPECTION_IN_PROGRESS) {
      throw new Error('Inspection must be in progress');
    }

    this.inspectionScore = score;
    this.inspectionReport = report;
    this.inspectionEvidence = evidence || [];
    this.inspectionCompletedDate = new Date();
    this.inspectionStatus = 'COMPLETED';
    this.status = DTAMApplication.STATUS.INSPECTION_COMPLETED;
    this.currentStage = DTAMApplication.STAGE.APPROVAL;
    this.updatedAt = new Date();
  }

  /**
   * Assign to approver
   */
  assignToApprover(approverId, approverName) {
    if (this.currentStage !== DTAMApplication.STAGE.APPROVAL) {
      throw new Error('Application must be in APPROVAL stage');
    }

    this.approverId = approverId;
    this.approverName = approverName;
    this.status = DTAMApplication.STATUS.PENDING_APPROVAL;
    this.updatedAt = new Date();
  }

  /**
   * Approve application
   */
  approve(comments, approverId) {
    if (this.status !== DTAMApplication.STATUS.PENDING_APPROVAL) {
      throw new Error('Application must be pending approval');
    }

    if (this.paymentStatus !== DTAMApplication.PAYMENT_STATUS.VERIFIED) {
      throw new Error('Payment must be verified before approval');
    }

    this.approvalStatus = 'APPROVED';
    this.approvalComments = comments;
    this.approvedAt = new Date();
    this.status = DTAMApplication.STATUS.APPROVED;
    this.currentStage = DTAMApplication.STAGE.CERTIFICATE;
    this.updatedAt = new Date();
  }

  /**
   * Reject application
   */
  reject(comments, approverId) {
    if (this.status !== DTAMApplication.STATUS.PENDING_APPROVAL) {
      throw new Error('Application must be pending approval');
    }

    this.approvalStatus = 'REJECTED';
    this.approvalComments = comments;
    this.approvedAt = new Date();
    this.status = DTAMApplication.STATUS.REJECTED;
    this.updatedAt = new Date();
  }

  /**
   * Issue certificate
   */
  issueCertificate(certificateNumber) {
    if (this.status !== DTAMApplication.STATUS.APPROVED) {
      throw new Error('Application must be approved first');
    }

    this.certificateNumber = certificateNumber;
    this.certificateIssuedAt = new Date();

    // Certificate valid for 3 years
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    this.certificateExpiresAt = expiryDate;

    this.certificateStatus = 'ACTIVE';
    this.status = DTAMApplication.STATUS.CERTIFICATE_ISSUED;
    this.updatedAt = new Date();
  }

  /**
   * Verify payment
   */
  verifyPayment(receipt, amount) {
    this.paymentReceipt = receipt;
    this.paymentAmount = amount;
    this.paymentStatus = DTAMApplication.PAYMENT_STATUS.VERIFIED;
    this.paymentDate = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Get missing documents
   */
  getMissingDocuments() {
    const uploaded = this.uploadedDocuments.map(doc => doc.type);
    return this.requiredDocuments.filter(req => !uploaded.includes(req));
  }

  /**
   * Check if ready for submission
   */
  isReadyForSubmission() {
    return this.getMissingDocuments().length === 0;
  }

  /**
   * Calculate processing time (in days)
   */
  getProcessingTime() {
    if (!this.submittedAt) {
      return 0;
    }
    const endDate = this.certificateIssuedAt || new Date();
    const diffTime = Math.abs(endDate - this.submittedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get current stage display name
   */
  getCurrentStageDisplay() {
    const stageNames = {
      [DTAMApplication.STAGE.SUBMISSION]: 'รอส่งเอกสาร',
      [DTAMApplication.STAGE.AI_QC]: 'ตรวจสอบเอกสารอัตโนมัติ',
      [DTAMApplication.STAGE.REVIEW]: 'กำลังตรวจสอบ',
      [DTAMApplication.STAGE.INSPECTION]: 'กำลังตรวจประเมิน',
      [DTAMApplication.STAGE.APPROVAL]: 'รออนุมัติ',
      [DTAMApplication.STAGE.CERTIFICATE]: 'ออกใบรับรอง',
    };
    return stageNames[this.currentStage] || this.currentStage;
  }

  /**
   * Validate entity
   */
  validate() {
    const errors = [];

    if (!this.farmerId) {
      errors.push('Farmer ID is required');
    }

    if (!this.farmerName || this.farmerName.trim().length === 0) {
      errors.push('Farmer name is required');
    }

    if (!this.farmerIdCard || this.farmerIdCard.length !== 13) {
      errors.push('Valid farmer ID card (13 digits) is required');
    }

    if (!this.farmName || this.farmName.trim().length === 0) {
      errors.push('Farm name is required');
    }

    if (!this.farmArea || this.farmArea <= 0) {
      errors.push('Valid farm area is required');
    }

    if (!this.cropType || this.cropType.trim().length === 0) {
      errors.push('Crop type is required');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      applicationNumber: this.applicationNumber,
      lotId: this.lotId,

      farmer: {
        id: this.farmerId,
        name: this.farmerName,
        idCard: this.farmerIdCard,
        phone: this.farmerPhone,
        email: this.farmerEmail,
      },

      farm: {
        name: this.farmName,
        address: this.farmAddress,
        province: this.farmProvince,
        district: this.farmDistrict,
        subDistrict: this.farmSubDistrict,
        postalCode: this.farmPostalCode,
        area: this.farmArea,
        gps: this.farmGPS,
        cropType: this.cropType,
        cultivationMethod: this.cultivationMethod,
      },

      status: this.status,
      currentStage: this.currentStage,
      currentStageDisplay: this.getCurrentStageDisplay(),

      documents: {
        uploaded: this.uploadedDocuments,
        required: this.requiredDocuments,
        missing: this.getMissingDocuments(),
      },

      aiQc: this.aiQcScore
        ? {
            score: this.aiQcScore,
            grade: this.aiQcGrade,
            inspectionMode: this.aiQcInspectionMode,
            issues: this.aiQcIssues,
            completedAt: this.aiQcCompletedAt,
          }
        : null,

      review: this.reviewerId
        ? {
            reviewerId: this.reviewerId,
            reviewerName: this.reviewerName,
            status: this.reviewStatus,
            comments: this.reviewComments,
            reviewedAt: this.reviewedAt,
          }
        : null,

      inspection: this.inspectorId
        ? {
            inspectorId: this.inspectorId,
            inspectorName: this.inspectorName,
            type: this.inspectionType,
            scheduledDate: this.inspectionScheduledDate,
            completedDate: this.inspectionCompletedDate,
            score: this.inspectionScore,
            status: this.inspectionStatus,
            report: this.inspectionReport,
            evidence: this.inspectionEvidence,
          }
        : null,

      approval: this.approverId
        ? {
            approverId: this.approverId,
            approverName: this.approverName,
            status: this.approvalStatus,
            comments: this.approvalComments,
            approvedAt: this.approvedAt,
          }
        : null,

      certificate: this.certificateNumber
        ? {
            number: this.certificateNumber,
            issuedAt: this.certificateIssuedAt,
            expiresAt: this.certificateExpiresAt,
            status: this.certificateStatus,
          }
        : null,

      payment: {
        required: this.paymentRequired,
        amount: this.paymentAmount,
        status: this.paymentStatus,
        receipt: this.paymentReceipt,
        date: this.paymentDate,
      },

      processingTime: this.getProcessingTime(),
      submittedAt: this.submittedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = DTAMApplication;
