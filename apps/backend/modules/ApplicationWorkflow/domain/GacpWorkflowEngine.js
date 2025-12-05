/**
 * 🏭 GACP Workflow Engine - Core Business Logic
 * ระบบจัดการ workflow หลักสำหรับ GACP Certification Process
 *
 * 8 ขั้นตอนหลัก:
 * 1. สมัครและส่งคำขอ (Application Submission)
 * 2. จ่ายเงินรอบแรก - 5,000 บาท (First Payment - Document Review Fee)
 * 3. ตรวจเอกสาร (Document Review)
 * 4. เอกสารผ่าน (Document Approved)
 * 5. จ่ายเงินรอบสอง - 25,000 บาท (Second Payment - Field Inspection Fee)
 * 6. ตรวจฟาร์ม (Field Inspection - VDO Call + On-site if needed)
 * 7. อนุมัติรับรอง (Final Approval)
 * 8. รับใบรับรอง (Certificate Issuance)
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

// Define workflow states with Thai names for clarity
const WORKFLOW_STATES = {
  // 1. เริ่มต้น
  DRAFT: 'draft', // ร่าง (ยังกรอกไม่เสร็จ)
  SUBMITTED: 'submitted', // ส่งคำขอแล้ว

  // 2. ระยะการชำระเงินรอบแรก
  PAYMENT_PENDING_1: 'payment_pending_1', // รอจ่ายเงินรอบแรก (5,000 บาท)
  PAYMENT_PROCESSING_1: 'payment_processing_1', // กำลังตรวจสอบการจ่ายเงินรอบแรก

  // 3. ระยะตรวจเอกสาร
  DOCUMENT_REVIEW: 'document_review', // กำลังตรวจเอกสาร
  DOCUMENT_REVISION: 'document_revision', // ต้องแก้ไขเอกสาร
  DOCUMENT_REJECTED: 'document_rejected', // เอกสารถูกปฏิเสธ (ต้องจ่ายเงินใหม่)
  DOCUMENT_APPROVED: 'document_approved', // เอกสารผ่าน

  // 4. ระยะการชำระเงินรอบสอง
  PAYMENT_PENDING_2: 'payment_pending_2', // รอจ่ายเงินรอบสอง (25,000 บาท)
  PAYMENT_PROCESSING_2: 'payment_processing_2', // กำลังตรวจสอบการจ่ายเงินรอบสอง

  // 5. ระยะตรวจฟาร์ม
  INSPECTION_SCHEDULED: 'inspection_scheduled', // นัดหมายตรวจฟาร์มแล้ว
  INSPECTION_VDO_CALL: 'inspection_vdo_call', // VDO Call
  INSPECTION_ON_SITE: 'inspection_on_site', // ลงพื้นที่ตรวจจริง
  INSPECTION_COMPLETED: 'inspection_completed', // ตรวจฟาร์มเสร็จแล้ว

  // 6. ระยะอนุมัติ
  PENDING_APPROVAL: 'pending_approval', // รออนุมัติ
  APPROVED: 'approved', // อนุมัติแล้ว
  REJECTED: 'rejected', // ปฏิเสธ

  // 7. ออกใบรับรอง
  CERTIFICATE_GENERATING: 'certificate_generating', // กำลังสร้างใบรับรอง
  CERTIFICATE_ISSUED: 'certificate_issued', // ออกใบรับรองแล้ว

  // สถานะพิเศษ
  CANCELLED: 'cancelled', // ยกเลิก
  EXPIRED: 'expired', // หมดอายุ
  ON_HOLD: 'on_hold', // พักการดำเนินการ
};

// Workflow steps with clear Thai descriptions
const WORKFLOW_STEPS = {
  1: {
    step: 1,
    name: 'สมัครและส่งคำขอ',
    description: 'เกษตรกรสมัครใช้งานระบบและอัปโหลดเอกสารที่จำเป็น',
    states: [WORKFLOW_STATES.DRAFT, WORKFLOW_STATES.SUBMITTED],
    nextStep: 2,
    requiredActions: ['submit_application'],
  },
  2: {
    step: 2,
    name: 'จ่ายเงินรอบแรก (5,000 บาท)',
    description: 'ชำระค่าธรรมเนียมตรวจสอบเอกสาร',
    states: [WORKFLOW_STATES.PAYMENT_PENDING_1, WORKFLOW_STATES.PAYMENT_PROCESSING_1],
    nextStep: 3,
    requiredActions: ['payment_first_phase'],
    amount: 5000,
  },
  3: {
    step: 3,
    name: 'ตรวจเอกสาร',
    description: 'เจ้าหน้าที่ตรวจสอบเอกสารและอนุมัติ',
    states: [
      WORKFLOW_STATES.DOCUMENT_REVIEW,
      WORKFLOW_STATES.DOCUMENT_REVISION,
      WORKFLOW_STATES.DOCUMENT_REJECTED,
    ],
    nextStep: [4, 2], // หากผ่าน ไป step 4, หากไม่ผ่าน 2 ครั้ง กลับไป step 2
    requiredActions: ['document_review_approve', 'document_review_reject'],
    maxRejections: 2,
  },
  4: {
    step: 4,
    name: 'เอกสารผ่าน',
    description: 'เอกสารได้รับการอนุมัติแล้ว',
    states: [WORKFLOW_STATES.DOCUMENT_APPROVED],
    nextStep: 5,
    requiredActions: ['proceed_to_payment_2'],
  },
  5: {
    step: 5,
    name: 'จ่ายเงินรอบสอง (25,000 บาท)',
    description: 'ชำระค่าธรรมเนียมตรวจสอบภาคสนาม',
    states: [WORKFLOW_STATES.PAYMENT_PENDING_2, WORKFLOW_STATES.PAYMENT_PROCESSING_2],
    nextStep: 6,
    requiredActions: ['payment_second_phase'],
    amount: 25000,
  },
  6: {
    step: 6,
    name: 'ตรวจฟาร์ม (VDO Call + ลงพื้นที่ถ้าจำเป็น)',
    description: 'พนักงานตรวจสอบฟาร์มผ่าน VDO Call และลงพื้นที่ตรวจจริงหากจำเป็น',
    states: [
      WORKFLOW_STATES.INSPECTION_SCHEDULED,
      WORKFLOW_STATES.INSPECTION_VDO_CALL,
      WORKFLOW_STATES.INSPECTION_ON_SITE,
      WORKFLOW_STATES.INSPECTION_COMPLETED,
    ],
    nextStep: 7,
    requiredActions: [
      'schedule_inspection',
      'conduct_vdo_call',
      'conduct_on_site_inspection',
      'complete_inspection',
    ],
  },
  7: {
    step: 7,
    name: 'อนุมัติรับรอง',
    description: 'ผู้อนุมัติพิจารณาผลการตรวจสอบทั้งหมด',
    states: [WORKFLOW_STATES.PENDING_APPROVAL, WORKFLOW_STATES.APPROVED, WORKFLOW_STATES.REJECTED],
    nextStep: 8,
    requiredActions: ['final_approval', 'final_rejection'],
  },
  8: {
    step: 8,
    name: 'รับใบรับรอง',
    description: 'ระบบออกใบรับรองและเกษตรกรสามารถดาวน์โหลดได้',
    states: [WORKFLOW_STATES.CERTIFICATE_GENERATING, WORKFLOW_STATES.CERTIFICATE_ISSUED],
    nextStep: null, // จบกระบวนการ
    requiredActions: ['generate_certificate', 'issue_certificate'],
  },
};

class GACPWorkflowEngine extends EventEmitter {
  constructor(database = null) {
    super();
    this.db = database;
    this.applications = new Map(); // In-memory storage if no database

    console.log('🏭 GACP Workflow Engine initialized');
  }

  /**
   * สร้างใบสมัครใหม่
   */
  async createApplication(farmerData) {
    const applicationId = uuidv4();

    const application = {
      id: applicationId,
      applicationNumber: this.generateApplicationNumber(),
      farmerId: farmerData.farmerId,
      farmerName: farmerData.name,
      farmerEmail: farmerData.email,
      farmerPhone: farmerData.phone,
      farmDetails: farmerData.farmDetails,

      // Workflow status
      currentState: WORKFLOW_STATES.DRAFT,
      currentStep: 1,

      // Payment tracking
      payments: {
        phase1: { amount: 5000, status: 'pending', paidAt: null },
        phase2: { amount: 25000, status: 'pending', paidAt: null },
      },

      // Document review tracking
      documentReview: {
        rejectionCount: 0,
        maxRejections: 2,
        reviews: [],
      },

      // Inspection tracking
      inspection: {
        vdoCallScheduled: null,
        vdoCallCompleted: null,
        onSiteRequired: false,
        onSiteScheduled: null,
        onSiteCompleted: null,
        findings: [],
      },

      // Approval tracking
      approval: {
        approved: false,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
      },

      // Certificate
      certificate: {
        number: null,
        generatedAt: null,
        downloadUrl: null,
      },

      // Audit trail
      history: [
        {
          action: 'APPLICATION_CREATED',
          timestamp: new Date(),
          actor: farmerData.farmerId,
          state: WORKFLOW_STATES.DRAFT,
          note: 'ใบสมัครถูกสร้างขึ้น',
        },
      ],

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to storage
    if (this.db) {
      await this.db.collection('applications').insertOne(application);
    } else {
      this.applications.set(applicationId, application);
    }

    // Emit event
    this.emit('application_created', application);

    console.log(`📝 Application created: ${applicationId} for farmer: ${farmerData.name}`);
    return application;
  }

  /**
   * ส่งคำขอเพื่อเริ่มกระบวนการ (Step 1 -> Step 2)
   */
  async submitApplication(applicationId, documents) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.DRAFT) {
      throw new Error('ใบสมัครนี้ถูกส่งไปแล้ว');
    }

    // Validate required documents
    if (!this.validateRequiredDocuments(documents)) {
      throw new Error('เอกสารไม่ครบถ้วน');
    }

    // Update state
    application.currentState = WORKFLOW_STATES.SUBMITTED;
    application.documents = documents;
    application.submittedAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'APPLICATION_SUBMITTED',
      timestamp: new Date(),
      actor: application.farmerId,
      state: WORKFLOW_STATES.SUBMITTED,
      note: 'ส่งใบสมัครแล้ว - รอการชำระเงินรอบแรก',
    });

    await this.saveApplication(application);

    // Auto-transition to payment phase 1
    await this.requestFirstPayment(applicationId);

    this.emit('application_submitted', application);
    console.log(`📤 Application submitted: ${applicationId}`);

    return application;
  }

  /**
   * ขอการชำระเงินรอบแรก (Step 2)
   */
  async requestFirstPayment(applicationId) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.SUBMITTED) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการชำระเงินรอบแรก');
    }

    // Update state
    application.currentState = WORKFLOW_STATES.PAYMENT_PENDING_1;
    application.currentStep = 2;
    application.payments.phase1.status = 'pending';
    application.payments.phase1.requestedAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'PAYMENT_1_REQUESTED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.PAYMENT_PENDING_1,
      note: 'ระบบแจ้งให้ชำระเงินรอบแรก 5,000 บาท',
    });

    await this.saveApplication(application);

    this.emit('payment_requested', {
      application,
      phase: 1,
      amount: 5000,
      description: 'ค่าธรรมเนียมตรวจสอบเอกสาร',
    });

    console.log(`💰 First payment requested: ${applicationId} - 5,000 THB`);
    return application;
  }

  /**
   * บันทึกการชำระเงินรอบแรก
   */
  async recordFirstPayment(applicationId, paymentData) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.PAYMENT_PENDING_1) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการบันทึกการชำระเงิน');
    }

    // Update payment status
    application.currentState = WORKFLOW_STATES.PAYMENT_PROCESSING_1;
    application.payments.phase1.status = 'processing';
    application.payments.phase1.transactionId = paymentData.transactionId;
    application.payments.phase1.paidAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'PAYMENT_1_PROCESSING',
      timestamp: new Date(),
      actor: application.farmerId,
      state: WORKFLOW_STATES.PAYMENT_PROCESSING_1,
      note: 'ได้รับการชำระเงินรอบแรก - กำลังตรวจสอบ',
      details: { transactionId: paymentData.transactionId },
    });

    await this.saveApplication(application);

    // Auto-confirm payment (in real system, this would be async)
    await this.confirmFirstPayment(applicationId);

    return application;
  }

  /**
   * ยืนยันการชำระเงินรอบแรกและเริ่มตรวจเอกสาร
   */
  async confirmFirstPayment(applicationId) {
    const application = await this.getApplication(applicationId);

    // Update payment and start document review
    application.currentState = WORKFLOW_STATES.DOCUMENT_REVIEW;
    application.currentStep = 3;
    application.payments.phase1.status = 'completed';
    application.payments.phase1.confirmedAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'PAYMENT_1_CONFIRMED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.DOCUMENT_REVIEW,
      note: 'การชำระเงินรอบแรกสำเร็จ - ส่งเรื่องไปตรวจเอกสาร',
    });

    await this.saveApplication(application);

    this.emit('payment_confirmed', {
      application,
      phase: 1,
      amount: 5000,
    });

    console.log(`✅ First payment confirmed: ${applicationId} - Starting document review`);
    return application;
  }

  /**
   * ตรวจสอบเอกสาร (Step 3)
   */
  async reviewDocuments(applicationId, reviewerId, reviewResult) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.DOCUMENT_REVIEW) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการตรวจเอกสาร');
    }

    const { approved, findings, corrections } = reviewResult;

    // Create review record
    const review = {
      reviewerId,
      reviewedAt: new Date(),
      approved,
      findings,
      corrections,
    };

    application.documentReview.reviews.push(review);
    application.updatedAt = new Date();

    if (approved) {
      // Document approved - proceed to next step
      application.currentState = WORKFLOW_STATES.DOCUMENT_APPROVED;
      application.currentStep = 4;

      application.history.push({
        action: 'DOCUMENT_APPROVED',
        timestamp: new Date(),
        actor: reviewerId,
        state: WORKFLOW_STATES.DOCUMENT_APPROVED,
        note: 'เอกสารผ่านการตรวจสอบ - รอการชำระเงินรอบสอง',
      });

      // Auto-request second payment
      await this.saveApplication(application);
      await this.requestSecondPayment(applicationId);
    } else {
      // Document rejected
      application.documentReview.rejectionCount++;

      if (application.documentReview.rejectionCount >= application.documentReview.maxRejections) {
        // Too many rejections - require new payment
        application.currentState = WORKFLOW_STATES.DOCUMENT_REJECTED;
        application.currentStep = 2; // Go back to payment step
        application.payments.phase1.status = 'expired'; // Mark previous payment as expired

        application.history.push({
          action: 'DOCUMENT_REJECTED_MAX',
          timestamp: new Date(),
          actor: reviewerId,
          state: WORKFLOW_STATES.DOCUMENT_REJECTED,
          note: `เอกสารถูกปฏิเสธครบ ${application.documentReview.maxRejections} ครั้ง - ต้องชำระเงินใหม่`,
        });
      } else {
        // Allow correction
        application.currentState = WORKFLOW_STATES.DOCUMENT_REVISION;

        application.history.push({
          action: 'DOCUMENT_REVISION_REQUIRED',
          timestamp: new Date(),
          actor: reviewerId,
          state: WORKFLOW_STATES.DOCUMENT_REVISION,
          note: `เอกสารต้องแก้ไข (ครั้งที่ ${application.documentReview.rejectionCount}/${application.documentReview.maxRejections})`,
        });
      }
    }

    await this.saveApplication(application);

    this.emit('document_reviewed', {
      application,
      approved,
      rejectionCount: application.documentReview.rejectionCount,
    });

    console.log(`📋 Document reviewed: ${applicationId} - ${approved ? 'APPROVED' : 'REJECTED'}`);
    return application;
  }

  /**
   * ขอการชำระเงินรอบสอง (Step 5)
   */
  async requestSecondPayment(applicationId) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.DOCUMENT_APPROVED) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการชำระเงินรอบสอง');
    }

    // Update state
    application.currentState = WORKFLOW_STATES.PAYMENT_PENDING_2;
    application.currentStep = 5;
    application.payments.phase2.status = 'pending';
    application.payments.phase2.requestedAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'PAYMENT_2_REQUESTED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.PAYMENT_PENDING_2,
      note: 'ระบบแจ้งให้ชำระเงินรอบสอง 25,000 บาท',
    });

    await this.saveApplication(application);

    this.emit('payment_requested', {
      application,
      phase: 2,
      amount: 25000,
      description: 'ค่าธรรมเนียมตรวจสอบภาคสนาม',
    });

    console.log(`💰 Second payment requested: ${applicationId} - 25,000 THB`);
    return application;
  }

  /**
   * บันทึกและยืนยันการชำระเงินรอบสอง
   */
  async recordSecondPayment(applicationId, paymentData) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.PAYMENT_PENDING_2) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการชำระเงินรอบสอง');
    }

    // Update payment and start inspection
    application.currentState = WORKFLOW_STATES.INSPECTION_SCHEDULED;
    application.currentStep = 6;
    application.payments.phase2.status = 'completed';
    application.payments.phase2.transactionId = paymentData.transactionId;
    application.payments.phase2.paidAt = new Date();
    application.payments.phase2.confirmedAt = new Date();
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'PAYMENT_2_CONFIRMED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.INSPECTION_SCHEDULED,
      note: 'การชำระเงินรอบสองสำเร็จ - เตรียมนัดตรวจฟาร์ม',
    });

    await this.saveApplication(application);

    this.emit('payment_confirmed', {
      application,
      phase: 2,
      amount: 25000,
    });

    console.log(`✅ Second payment confirmed: ${applicationId} - Ready for inspection`);
    return application;
  }

  /**
   * นัดหมาย VDO Call (Step 6)
   */
  async scheduleVDOCall(applicationId, inspectorId, scheduledDateTime) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.INSPECTION_SCHEDULED) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการนัดหมาย VDO Call');
    }

    // Update inspection details
    application.currentState = WORKFLOW_STATES.INSPECTION_VDO_CALL;
    application.inspection.vdoCallScheduled = scheduledDateTime;
    application.inspection.inspectorId = inspectorId;
    application.updatedAt = new Date();

    // Add to history
    application.history.push({
      action: 'VDO_CALL_SCHEDULED',
      timestamp: new Date(),
      actor: inspectorId,
      state: WORKFLOW_STATES.INSPECTION_VDO_CALL,
      note: `นัดหมาย VDO Call วันที่ ${scheduledDateTime.toLocaleDateString('th-TH')}`,
    });

    await this.saveApplication(application);

    this.emit('vdo_call_scheduled', {
      application,
      inspector: inspectorId,
      scheduledDateTime,
    });

    console.log(`📹 VDO Call scheduled: ${applicationId} at ${scheduledDateTime}`);
    return application;
  }

  /**
   * ดำเนินการ VDO Call และตัดสินใจว่าต้องลงพื้นที่หรือไม่
   */
  async conductVDOCall(applicationId, vdoResult) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.INSPECTION_VDO_CALL) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการทำ VDO Call');
    }

    const { inspectorId, findings, onSiteRequired, completed } = vdoResult;

    // Update inspection
    application.inspection.vdoCallCompleted = new Date();
    application.inspection.onSiteRequired = onSiteRequired;
    application.inspection.findings.push({
      type: 'VDO_CALL',
      inspectorId,
      completedAt: new Date(),
      findings,
      onSiteRequired,
    });

    if (onSiteRequired) {
      // Need on-site inspection
      application.currentState = WORKFLOW_STATES.INSPECTION_ON_SITE;

      application.history.push({
        action: 'VDO_CALL_COMPLETED_ONSITE_REQUIRED',
        timestamp: new Date(),
        actor: inspectorId,
        state: WORKFLOW_STATES.INSPECTION_ON_SITE,
        note: 'VDO Call เสร็จแล้ว - ต้องลงพื้นที่ตรวจเพิ่มเติม',
      });
    } else if (completed) {
      // VDO Call sufficient
      application.currentState = WORKFLOW_STATES.INSPECTION_COMPLETED;

      application.history.push({
        action: 'INSPECTION_COMPLETED_VDO_ONLY',
        timestamp: new Date(),
        actor: inspectorId,
        state: WORKFLOW_STATES.INSPECTION_COMPLETED,
        note: 'การตรวจสอบเสร็จสิ้นด้วย VDO Call',
      });

      // Auto-proceed to approval phase
      await this.saveApplication(application);
      await this.requestFinalApproval(applicationId);
      return application;
    }

    application.updatedAt = new Date();
    await this.saveApplication(application);

    this.emit('vdo_call_completed', {
      application,
      onSiteRequired,
      findings,
    });

    console.log(`📹 VDO Call completed: ${applicationId} - On-site required: ${onSiteRequired}`);
    return application;
  }

  /**
   * นัดหมายและดำเนินการตรวจพื้นที่จริง
   */
  async scheduleOnSiteInspection(applicationId, inspectorId, scheduledDateTime) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.INSPECTION_ON_SITE) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการนัดตรวจพื้นที่');
    }

    application.inspection.onSiteScheduled = scheduledDateTime;
    application.updatedAt = new Date();

    application.history.push({
      action: 'ON_SITE_INSPECTION_SCHEDULED',
      timestamp: new Date(),
      actor: inspectorId,
      state: WORKFLOW_STATES.INSPECTION_ON_SITE,
      note: `นัดหมายตรวจพื้นที่จริง วันที่ ${scheduledDateTime.toLocaleDateString('th-TH')}`,
    });

    await this.saveApplication(application);

    this.emit('on_site_inspection_scheduled', {
      application,
      inspector: inspectorId,
      scheduledDateTime,
    });

    console.log(`🚗 On-site inspection scheduled: ${applicationId} at ${scheduledDateTime}`);
    return application;
  }

  /**
   * ดำเนินการตรวจพื้นที่และสรุปผล
   */
  async completeOnSiteInspection(applicationId, inspectionResult) {
    const application = await this.getApplication(applicationId);

    const { inspectorId, findings, complianceScore, photos, passed } = inspectionResult;

    // Update inspection
    application.currentState = WORKFLOW_STATES.INSPECTION_COMPLETED;
    application.inspection.onSiteCompleted = new Date();
    application.inspection.findings.push({
      type: 'ON_SITE',
      inspectorId,
      completedAt: new Date(),
      findings,
      complianceScore,
      photos,
      passed,
    });

    application.history.push({
      action: 'ON_SITE_INSPECTION_COMPLETED',
      timestamp: new Date(),
      actor: inspectorId,
      state: WORKFLOW_STATES.INSPECTION_COMPLETED,
      note: `การตรวจพื้นที่เสร็จสิ้น - คะแนน: ${complianceScore}%`,
    });

    application.updatedAt = new Date();
    await this.saveApplication(application);

    // Auto-proceed to approval
    await this.requestFinalApproval(applicationId);

    this.emit('on_site_inspection_completed', {
      application,
      complianceScore,
      passed,
    });

    console.log(`🚗 On-site inspection completed: ${applicationId} - Score: ${complianceScore}%`);
    return application;
  }

  /**
   * ส่งให้ผู้อนุมัติพิจารณา (Step 7)
   */
  async requestFinalApproval(applicationId) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.INSPECTION_COMPLETED) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการขออนุมัติ');
    }

    application.currentState = WORKFLOW_STATES.PENDING_APPROVAL;
    application.currentStep = 7;
    application.updatedAt = new Date();

    application.history.push({
      action: 'APPROVAL_REQUESTED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.PENDING_APPROVAL,
      note: 'ส่งเรื่องให้ผู้อนุมัติพิจารณา',
    });

    await this.saveApplication(application);

    this.emit('approval_requested', { application });

    console.log(`📋 Final approval requested: ${applicationId}`);
    return application;
  }

  /**
   * อนุมัติหรือปฏิเสธใบสมัคร (Step 7)
   */
  async finalApproval(applicationId, approverId, decision) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.PENDING_APPROVAL) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการอนุมัติ');
    }

    const { approved, reason } = decision;

    application.approval.approved = approved;
    application.approval.approvedBy = approverId;
    application.approval.approvedAt = new Date();
    application.updatedAt = new Date();

    if (approved) {
      // Approved - generate certificate
      application.currentState = WORKFLOW_STATES.APPROVED;
      application.currentStep = 8;

      application.history.push({
        action: 'FINAL_APPROVAL_GRANTED',
        timestamp: new Date(),
        actor: approverId,
        state: WORKFLOW_STATES.APPROVED,
        note: 'ใบสมัครได้รับการอนุมัติ - เตรียมออกใบรับรอง',
      });

      // Auto-generate certificate
      await this.saveApplication(application);
      await this.generateCertificate(applicationId);
    } else {
      // Rejected
      application.currentState = WORKFLOW_STATES.REJECTED;
      application.approval.rejectionReason = reason;

      application.history.push({
        action: 'FINAL_APPROVAL_REJECTED',
        timestamp: new Date(),
        actor: approverId,
        state: WORKFLOW_STATES.REJECTED,
        note: `ใบสมัครถูกปฏิเสธ: ${reason}`,
      });
    }

    await this.saveApplication(application);

    this.emit('final_approval_decided', {
      application,
      approved,
      reason,
    });

    console.log(`✅ Final approval: ${applicationId} - ${approved ? 'APPROVED' : 'REJECTED'}`);
    return application;
  }

  /**
   * สร้างใบรับรอง (Step 8)
   */
  async generateCertificate(applicationId) {
    const application = await this.getApplication(applicationId);

    if (application.currentState !== WORKFLOW_STATES.APPROVED) {
      throw new Error('สถานะไม่ถูกต้องสำหรับการสร้างใบรับรอง');
    }

    application.currentState = WORKFLOW_STATES.CERTIFICATE_GENERATING;

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    application.certificate.number = certificateNumber;
    application.certificate.generatedAt = new Date();

    // Simulate certificate generation process
    application.history.push({
      action: 'CERTIFICATE_GENERATING',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.CERTIFICATE_GENERATING,
      note: `กำลังสร้างใบรับรอง หมายเลข: ${certificateNumber}`,
    });

    await this.saveApplication(application);

    // Simulate async certificate generation
    setTimeout(async () => {
      await this.issueCertificate(applicationId);
    }, 2000); // 2 second delay

    console.log(`📜 Certificate generation started: ${applicationId} - ${certificateNumber}`);
    return application;
  }

  /**
   * ออกใบรับรอง (Step 8 - Final)
   */
  async issueCertificate(applicationId) {
    const application = await this.getApplication(applicationId);

    // Finalize certificate
    application.currentState = WORKFLOW_STATES.CERTIFICATE_ISSUED;
    application.certificate.downloadUrl = `/certificates/${application.certificate.number}.pdf`;
    application.updatedAt = new Date();

    application.history.push({
      action: 'CERTIFICATE_ISSUED',
      timestamp: new Date(),
      actor: 'SYSTEM',
      state: WORKFLOW_STATES.CERTIFICATE_ISSUED,
      note: `ใบรับรองออกเรียบร้อยแล้ว - หมายเลข: ${application.certificate.number}`,
    });

    await this.saveApplication(application);

    this.emit('certificate_issued', {
      application,
      certificateNumber: application.certificate.number,
      downloadUrl: application.certificate.downloadUrl,
    });

    console.log(`🎉 Certificate issued: ${applicationId} - ${application.certificate.number}`);
    return application;
  }

  // ==================== Helper Methods ====================

  /**
   * ดึงข้อมูลใบสมัคร
   */
  async getApplication(applicationId) {
    let application;

    if (this.db) {
      application = await this.db.collection('applications').findOne({ id: applicationId });
    } else {
      application = this.applications.get(applicationId);
    }

    if (!application) {
      throw new Error(`ไม่พบใบสมัคร: ${applicationId}`);
    }

    return application;
  }

  /**
   * บันทึกใบสมัคร
   */
  async saveApplication(application) {
    if (this.db) {
      await this.db.collection('applications').replaceOne({ id: application.id }, application);
    } else {
      this.applications.set(application.id, application);
    }
  }

  /**
   * ตรวจสอบเอกสารที่จำเป็น
   */
  validateRequiredDocuments(documents) {
    const required = [
      'id_card',
      'house_registration',
      'land_deed',
      'farm_map',
      'water_source_permit',
    ];

    return required.every(doc => documents && documents[doc]);
  }

  /**
   * สร้างหมายเลขใบสมัคร
   */
  generateApplicationNumber() {
    const year = new Date().getFullYear() + 543; // Buddhist year
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    return `GACP${year}${month}${random}`;
  }

  /**
   * สร้างหมายเลขใบรับรอง
   */
  generateCertificateNumber() {
    const year = new Date().getFullYear() + 543; // Buddhist year
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');
    return `CERT-GACP-${year}${month}${day}-${random}`;
  }

  /**
   * ดึงข้อมูลสถิติ
   */
  async getStatistics() {
    let applications;

    if (this.db) {
      applications = await this.db.collection('applications').find({}).toArray();
    } else {
      applications = Array.from(this.applications.values());
    }

    const stats = {
      total: applications.length,
      byState: {},
      byStep: {},
      payments: {
        phase1: { completed: 0, pending: 0, total: 0 },
        phase2: { completed: 0, pending: 0, total: 0 },
      },
      certificatesIssued: 0,
    };

    applications.forEach(app => {
      // Count by state
      stats.byState[app.currentState] = (stats.byState[app.currentState] || 0) + 1;

      // Count by step
      stats.byStep[app.currentStep] = (stats.byStep[app.currentStep] || 0) + 1;

      // Payment stats
      if (app.payments.phase1.status === 'completed') {
        stats.payments.phase1.completed++;
      }
      if (app.payments.phase1.status === 'pending') {
        stats.payments.phase1.pending++;
      }
      stats.payments.phase1.total += app.payments.phase1.amount || 0;

      if (app.payments.phase2.status === 'completed') {
        stats.payments.phase2.completed++;
      }
      if (app.payments.phase2.status === 'pending') {
        stats.payments.phase2.pending++;
      }
      stats.payments.phase2.total += app.payments.phase2.amount || 0;

      // Certificates
      if (app.currentState === WORKFLOW_STATES.CERTIFICATE_ISSUED) {
        stats.certificatesIssued++;
      }
    });

    return stats;
  }

  /**
   * ดึงรายการใบสมัครตามสถานะ
   */
  async getApplicationsByState(state, limit = 10, skip = 0) {
    let applications;

    if (this.db) {
      applications = await this.db
        .collection('applications')
        .find({ currentState: state })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } else {
      applications = Array.from(this.applications.values())
        .filter(app => app.currentState === state)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(skip, skip + limit);
    }

    return applications;
  }
}

// Export constants and class
module.exports = {
  GACPWorkflowEngine,
  WORKFLOW_STATES,
  WORKFLOW_STEPS,
};
