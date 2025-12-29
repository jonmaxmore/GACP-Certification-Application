/**
 * GACP Business Rules Validator
 *
 * ระบบตรวจสอบกฎเกณฑ์ทางธุรกิจตามมาตรฐาน GACP
 * ใช้ข้อมูลจริงจากกรมวิชาการเกษตร และ WHO GMP Standards
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 * @purpose Ensure business logic compliance with government standards
 */

class GACPBusinessRulesValidator {
  constructor() {
    // กฎเกณฑ์พื้นฐานตามกฎหมายและมาตรฐาน
    this.GOVERNMENT_STANDARDS = {
      // ตามพระราชบัญญัติยา พ.ศ. 2510
      LEGAL_BASIS: 'Drug_Act_1967',

      // ตามมาตรฐาน WHO GMP
      QUALITY_STANDARDS: 'WHO_GMP',

      // ตามกฎกระทรวงกรมวิชาการเกษตร
      AGRICULTURAL_STANDARDS: 'DOA_Standards',
    };

    // ค่าธรรมเนียมตามประกาศทางราชการ
    this.OFFICIAL_FEES = {
      PHASE1_DOCUMENT_REVIEW: 5000, // บาท
      PHASE2_INSPECTION_CERTIFICATE: 25000, // บาท
      RESUBMISSION_FEE: 5000, // บาท (ครั้งที่ 3 เป็นต้นไป)
      TOTAL_STANDARD_FEE: 30000, // บาท
    };

    // ระยะเวลาดำเนินการตาม SLA ภาครัฐ
    this.SLA_REQUIREMENTS = {
      DOCUMENT_REVIEW_DAYS: 3, // วันทำการ
      INSPECTION_SCHEDULE_DAYS: 7, // วันทำการ
      FINAL_APPROVAL_DAYS: 2, // วันทำการ
      CERTIFICATE_VALIDITY_YEARS: 3, // ปี
      MAX_REVISION_ATTEMPTS: 3, // ครั้ง
    };
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูลเกษตรกร
   * ตามเกณฑ์กรมวิชาการเกษตร
   */
  validateFarmerEligibility(farmerData) {
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      businessRuleViolations: [],
    };

    try {
      // กฎที่ 1: เกษตรกรต้องมีบัตรประชาชนไทย
      if (!this._validateThaiNationalID(farmerData.nationalId)) {
        validationResult.errors.push({
          rule: 'THAI_CITIZENSHIP_REQUIRED',
          message: 'เกษตรกรต้องเป็นพลเมืองไทย (ตามพระราชบัญญัติยา)',
          field: 'nationalId',
          severity: 'CRITICAL',
        });
        validationResult.isValid = false;
      }

      // กฎที่ 2: ต้องมีการจดทะเบียนเกษตรกร
      if (!farmerData.farmerRegistrationNumber) {
        validationResult.errors.push({
          rule: 'FARMER_REGISTRATION_REQUIRED',
          message: 'ต้องมีหมายเลขทะเบียนเกษตรกร (ตามกฎกระทรวงเกษตรฯ)',
          field: 'farmerRegistrationNumber',
          severity: 'CRITICAL',
        });
        validationResult.isValid = false;
      }

      // กฎที่ 3: พื้นที่เพาะปลูกต้องชัดเจน
      if (!this._validateFarmArea(farmerData.farmArea)) {
        validationResult.errors.push({
          rule: 'VALID_FARM_AREA_REQUIRED',
          message: 'พื้นที่เพาะปลูกต้องระบุขนาดและพิกัดที่ชัดเจน',
          field: 'farmArea',
          severity: 'HIGH',
        });
        validationResult.isValid = false;
      }

      // กฎที่ 4: พืชที่ปลูกต้องอยู่ในรายการที่อนุญาต
      if (!this._validateCropTypes(farmerData.cropTypes)) {
        validationResult.errors.push({
          rule: 'APPROVED_CROP_TYPES_ONLY',
          message: 'สามารถปลูกได้เฉพาะสมุนไพรที่อยู่ในรายการอนุญาต',
          field: 'cropTypes',
          severity: 'HIGH',
        });
        validationResult.isValid = false;
      }

      return validationResult;
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        rule: 'SYSTEM_ERROR',
        message: `ข้อผิดพลาดในการตรวจสอบ: ${error.message}`,
        severity: 'CRITICAL',
      });
      return validationResult;
    }
  }

  /**
   * ตรวจสอบความครบถ้วนของเอกสาร
   * ตามเกณฑ์ WHO GMP และกรมวิชาการเกษตร
   */
  validateDocumentCompleteness(applicationId, documents) {
    const validationResult = {
      isValid: true,
      missingDocuments: [],
      invalidDocuments: [],
      completionPercentage: 0,
      businessRuleViolations: [],
    };

    // เอกสารที่จำเป็นตามกฎหมาย
    const REQUIRED_DOCUMENTS = [
      {
        type: 'FARMER_REGISTRATION',
        name: 'ใบทะเบียนเกษตรกร',
        formats: ['pdf', 'jpg', 'png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        required: true,
        legalBasis: 'กฎกระทรวงเกษตรและสหกรณ์',
      },
      {
        type: 'LAND_OWNERSHIP_PROOF',
        name: 'หลักฐานกรรมสิทธิ์ที่ดิน',
        formats: ['pdf'],
        maxSize: 10 * 1024 * 1024, // 10MB
        required: true,
        legalBasis: 'พระราชบัญญัติที่ดิน',
      },
      {
        type: 'WATER_QUALITY_REPORT',
        name: 'รายงานคุณภาพน้ำ',
        formats: ['pdf'],
        maxSize: 5 * 1024 * 1024,
        required: true,
        legalBasis: 'มาตรฐาน WHO GMP',
      },
      {
        type: 'SOIL_ANALYSIS',
        name: 'ผลวิเคราะห์ดิน',
        formats: ['pdf'],
        maxSize: 5 * 1024 * 1024,
        required: true,
        legalBasis: 'มาตรฐาน WHO GMP',
      },
      {
        type: 'CULTIVATION_PLAN',
        name: 'แผนการเพาะปลูก',
        formats: ['pdf', 'doc', 'docx'],
        maxSize: 10 * 1024 * 1024,
        required: true,
        legalBasis: 'มาตรฐาน GACP',
      },
      {
        type: 'STORAGE_FACILITY_PHOTOS',
        name: 'รูปถ่ายคลังเก็บ',
        formats: ['jpg', 'png'],
        maxSize: 20 * 1024 * 1024, // 20MB total
        required: true,
        legalBasis: 'มาตรฐาน WHO GMP',
      },
    ];

    try {
      let validDocumentCount = 0;
      const totalRequiredDocs = REQUIRED_DOCUMENTS.length;

      for (const requiredDoc of REQUIRED_DOCUMENTS) {
        const uploadedDoc = documents.find(doc => doc.type === requiredDoc.type);

        if (!uploadedDoc) {
          // เอกสารหายไป
          validationResult.missingDocuments.push({
            type: requiredDoc.type,
            name: requiredDoc.name,
            legalBasis: requiredDoc.legalBasis,
            severity: 'CRITICAL',
          });
          validationResult.isValid = false;
        } else {
          // ตรวจสอบรูปแบบไฟล์
          const fileExtension = uploadedDoc.filename.split('.').pop().toLowerCase();
          if (!requiredDoc.formats.includes(fileExtension)) {
            validationResult.invalidDocuments.push({
              type: requiredDoc.type,
              name: requiredDoc.name,
              error: `รูปแบบไฟล์ไม่ถูกต้อง (ต้องเป็น: ${requiredDoc.formats.join(', ')})`,
              severity: 'HIGH',
            });
            validationResult.isValid = false;
          }

          // ตรวจสอบขนาดไฟล์
          if (uploadedDoc.size > requiredDoc.maxSize) {
            validationResult.invalidDocuments.push({
              type: requiredDoc.type,
              name: requiredDoc.name,
              error: `ไฟล์ใหญ่เกินไป (สูงสุด: ${requiredDoc.maxSize / 1024 / 1024}MB)`,
              severity: 'MEDIUM',
            });
            validationResult.isValid = false;
          }

          if (
            uploadedDoc &&
            requiredDoc.formats.includes(fileExtension) &&
            uploadedDoc.size <= requiredDoc.maxSize
          ) {
            validDocumentCount++;
          }
        }
      }

      // คำนวณเปอร์เซ็นต์ความสมบูรณ์
      validationResult.completionPercentage = (validDocumentCount / totalRequiredDocs) * 100;

      return validationResult;
    } catch (error) {
      validationResult.isValid = false;
      validationResult.businessRuleViolations.push({
        rule: 'DOCUMENT_VALIDATION_ERROR',
        message: `ข้อผิดพลาดในการตรวจสอบเอกสาร: ${error.message}`,
        severity: 'CRITICAL',
      });
      return validationResult;
    }
  }

  /**
   * ตรวจสอบกระบวนการชำระเงิน
   * ตามระเบียบการเงินภาครัฐ
   */
  validatePaymentProcess(applicationId, paymentData, currentState) {
    const validationResult = {
      isValid: true,
      errors: [],
      requiredAmount: 0,
      paymentPhase: null,
      businessRuleViolations: [],
    };

    try {
      // กำหนดเฟสการชำระเงินตามสถานะปัจจุบัน
      if (currentState === 'PAYMENT_PENDING') {
        // เฟส 1: ค่าตรวจสอบเอกสาร
        validationResult.paymentPhase = 'PHASE_1';
        validationResult.requiredAmount = this.OFFICIAL_FEES.PHASE1_DOCUMENT_REVIEW;

        // กฎธุรกิจ: ต้องชำระก่อนเริ่มกระบวนการตรวจสอบ
        if (!paymentData || paymentData.amount !== validationResult.requiredAmount) {
          validationResult.errors.push({
            rule: 'PHASE1_PAYMENT_REQUIRED',
            message: `ต้องชำระค่าตรวจสอบเอกสาร ${validationResult.requiredAmount} บาท`,
            legalBasis: 'ประกาศกรมวิชาการเกษตร เรื่อง อัตราค่าธรรมเนียม',
            severity: 'CRITICAL',
          });
          validationResult.isValid = false;
        }
      } else if (currentState === 'PHASE2_PAYMENT_PENDING') {
        // เฟส 2: ค่าตรวจประเมินและออกใบรับรอง
        validationResult.paymentPhase = 'PHASE_2';
        validationResult.requiredAmount = this.OFFICIAL_FEES.PHASE2_INSPECTION_CERTIFICATE;

        // กฎธุรกิจ: ต้องชำระก่อนออกใบรับรอง
        if (!paymentData || paymentData.amount !== validationResult.requiredAmount) {
          validationResult.errors.push({
            rule: 'PHASE2_PAYMENT_REQUIRED',
            message: `ต้องชำระค่าตรวจประเมินและออกใบรับรอง ${validationResult.requiredAmount} บาท`,
            legalBasis: 'ประกาศกรมวิชาการเกษตร เรื่อง อัตราค่าธรรมเนียม',
            severity: 'CRITICAL',
          });
          validationResult.isValid = false;
        }
      }

      // ตรวจสอบการชำระเงินผ่าน PromptPay
      if (paymentData && paymentData.method === 'PROMPTPAY') {
        if (!paymentData.transactionId || !paymentData.paymentTimestamp) {
          validationResult.errors.push({
            rule: 'PROMPTPAY_VERIFICATION_REQUIRED',
            message: 'ต้องมีหลักฐานการชำระเงินผ่าน PromptPay',
            severity: 'HIGH',
          });
          validationResult.isValid = false;
        }
      }

      return validationResult;
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        rule: 'PAYMENT_VALIDATION_ERROR',
        message: `ข้อผิดพลาดในการตรวจสอบการชำระเงิน: ${error.message}`,
        severity: 'CRITICAL',
      });
      return validationResult;
    }
  }

  /**
   * ตรวจสอบกระบวนการตรวจประเมิน
   * ตามมาตรฐาน WHO GMP และ GACP
   */
  validateInspectionProcess(applicationId, inspectionData) {
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      complianceScore: 0,
      requiredActions: [],
    };

    // เกณฑ์การตรวจประเมินตามมาตรฐาน GACP
    const INSPECTION_CRITERIA = [
      {
        category: 'CULTIVATION_PRACTICES',
        name: 'การปฏิบัติการเพาะปลูก',
        weight: 25,
        requirements: [
          'ใช้เมล็ดพันธุ์ที่ได้มาตรฐาน',
          'ควบคุมการใช้สารเคมี',
          'จัดการน้ำอย่างเหมาะสม',
          'ป้องกันการปนเปื้อน',
        ],
      },
      {
        category: 'POST_HARVEST_HANDLING',
        name: 'การจัดการหลังการเก็บเกี่ยว',
        weight: 25,
        requirements: [
          'การทำความสะอาดที่เหมาะสม',
          'การแยกแยะผลผลิต',
          'การป้องกันการปนเปื้อน',
          'การควบคุมอุณหภูมิและความชื้น',
        ],
      },
      {
        category: 'STORAGE_CONDITIONS',
        name: 'สภาพการเก็บรักษา',
        weight: 20,
        requirements: [
          'คลังเก็บสะอาดและแห้ง',
          'ป้องกันสัตว์รบกวน',
          'ระบบระบายอากาศเหมาะสม',
          'การจัดเก็บแยกประเภท',
        ],
      },
      {
        category: 'RECORD_KEEPING',
        name: 'การเก็บบันทึกข้อมูล',
        weight: 20,
        requirements: [
          'บันทึกการเพาะปลูกครบถ้วน',
          'บันทึกการใช้สารเคมี',
          'บันทึกผลผลิตและการจำหน่าย',
          'เอกสารสามารถตรวจสอบได้',
        ],
      },
      {
        category: 'WORKER_SAFETY',
        name: 'ความปลอดภัยของผู้ปฏิบัติงาน',
        weight: 10,
        requirements: [
          'อุปกรณ์ป้องกันอันตรายส่วนบุคคล',
          'การฝึกอบรมผู้ปฏิบัติงาน',
          'การดูแลสุขภาพผู้ปฏิบัติงาน',
          'มาตรการฉุกเฉิน',
        ],
      },
    ];

    try {
      let totalScore = 0;
      let maxScore = 0;

      for (const criteria of INSPECTION_CRITERIA) {
        const categoryData = inspectionData.categories?.[criteria.category];

        if (!categoryData) {
          validationResult.errors.push({
            rule: 'MISSING_INSPECTION_CATEGORY',
            message: `ไม่พบข้อมูลการตรวจประเมิน: ${criteria.name}`,
            category: criteria.category,
            severity: 'HIGH',
          });
          validationResult.isValid = false;
          continue;
        }

        // คำนวณคะแนนในหมวดนี้
        const categoryScore = categoryData.score || 0;
        const weightedScore = (categoryScore * criteria.weight) / 100;

        totalScore += weightedScore;
        maxScore += criteria.weight;

        // ตรวจสอบความต้องการขั้นต่ำ (70% ในแต่ละหมวด)
        if (categoryScore < 70) {
          validationResult.errors.push({
            rule: 'INSUFFICIENT_COMPLIANCE_SCORE',
            message: `คะแนนหมวด ${criteria.name} ต่ำกว่าเกณฑ์ (${categoryScore}% < 70%)`,
            category: criteria.category,
            score: categoryScore,
            severity: 'HIGH',
          });
          validationResult.isValid = false;
        }

        // เช็คข้อกำหนดที่ขาด
        for (const requirement of criteria.requirements) {
          if (!categoryData.requirements?.[requirement]) {
            validationResult.requiredActions.push({
              category: criteria.name,
              action: requirement,
              priority: 'HIGH',
            });
          }
        }
      }

      // คำนวณคะแนนรวม
      validationResult.complianceScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      // เกณฑ์การผ่าน: คะแนนรวม >= 80%
      if (validationResult.complianceScore < 80) {
        validationResult.errors.push({
          rule: 'OVERALL_COMPLIANCE_INSUFFICIENT',
          message: `คะแนนรวมต่ำกว่าเกณฑ์ (${validationResult.complianceScore.toFixed(1)}% < 80%)`,
          overallScore: validationResult.complianceScore,
          severity: 'CRITICAL',
        });
        validationResult.isValid = false;
      }

      // ตรวจสอบหลักฐานการตรวจประเมิน
      if (!inspectionData.evidencePhotos || inspectionData.evidencePhotos.length === 0) {
        validationResult.errors.push({
          rule: 'INSPECTION_EVIDENCE_REQUIRED',
          message: 'ต้องมีรูปถ่ายหลักฐานการตรวจประเมิน',
          severity: 'HIGH',
        });
        validationResult.isValid = false;
      }

      return validationResult;
    } catch (error) {
      validationResult.isValid = false;
      validationResult.errors.push({
        rule: 'INSPECTION_VALIDATION_ERROR',
        message: `ข้อผิดพลาดในการตรวจสอบการประเมิน: ${error.message}`,
        severity: 'CRITICAL',
      });
      return validationResult;
    }
  }

  /**
   * ตรวจสอบ SLA และระยะเวลา
   */
  validateSLACompliance(applicationId, workflowHistory) {
    const validationResult = {
      isValid: true,
      warnings: [],
      slaBreaches: [],
      currentSLAStatus: {},
    };

    try {
      // ตรวจสอบ SLA ของแต่ละขั้นตอน
      const slaChecks = [
        {
          fromState: 'SUBMITTED',
          toState: 'UNDER_REVIEW',
          maxDays: this.SLA_REQUIREMENTS.DOCUMENT_REVIEW_DAYS,
          description: 'การตรวจสอบเอกสาร',
        },
        {
          fromState: 'PAYMENT_VERIFIED',
          toState: 'INSPECTION_SCHEDULED',
          maxDays: this.SLA_REQUIREMENTS.INSPECTION_SCHEDULE_DAYS,
          description: 'การนัดหมายตรวจประเมิน',
        },
        {
          fromState: 'INSPECTION_COMPLETED',
          toState: 'APPROVED',
          maxDays: this.SLA_REQUIREMENTS.FINAL_APPROVAL_DAYS,
          description: 'การอนุมัติขั้นสุดท้าย',
        },
      ];

      for (const slaCheck of slaChecks) {
        const fromTransition = workflowHistory.find(h => h.toState === slaCheck.fromState);
        const toTransition = workflowHistory.find(h => h.toState === slaCheck.toState);

        if (fromTransition && toTransition) {
          const timeDiff = new Date(toTransition.timestamp) - new Date(fromTransition.timestamp);
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

          if (daysDiff > slaCheck.maxDays) {
            validationResult.slaBreaches.push({
              process: slaCheck.description,
              expectedDays: slaCheck.maxDays,
              actualDays: Math.ceil(daysDiff),
              delay: Math.ceil(daysDiff - slaCheck.maxDays),
              severity: 'HIGH',
            });
          }
        }
      }

      // คำเนิ่น: ถ้ามี SLA breach ให้เตือน แต่ไม่ block กระบวนการ
      if (validationResult.slaBreaches.length > 0) {
        validationResult.warnings.push({
          rule: 'SLA_BREACH_DETECTED',
          message: `พบการล่าช้าในกระบวนการ ${validationResult.slaBreaches.length} ขั้นตอน`,
          breaches: validationResult.slaBreaches,
        });
      }

      return validationResult;
    } catch (error) {
      validationResult.warnings.push({
        rule: 'SLA_VALIDATION_ERROR',
        message: `ไม่สามารถตรวจสอบ SLA ได้: ${error.message}`,
      });
      return validationResult;
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  _validateThaiNationalID(nationalId) {
    if (!nationalId || nationalId.length !== 13) {
      return false;
    }

    // ตรวจสอบ checksum ของบัตรประชาชนไทย
    const digits = nationalId.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (13 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[12];
  }

  _validateFarmArea(farmArea) {
    if (!farmArea) {
      return false;
    }

    return (
      farmArea.size > 0 &&
      farmArea.coordinates &&
      farmArea.coordinates.latitude &&
      farmArea.coordinates.longitude &&
      this._isValidThaiCoordinates(farmArea.coordinates.latitude, farmArea.coordinates.longitude)
    );
  }

  _isValidThaiCoordinates(lat, lng) {
    // พิกัดของประเทศไทย
    return (
      lat >= 5.5 &&
      lat <= 20.5 && // ละติจูด
      lng >= 97.0 &&
      lng <= 106.0 // ลองจิจูด
    );
  }

  _validateCropTypes(cropTypes) {
    if (!cropTypes || !Array.isArray(cropTypes)) {
      return false;
    }

    // รายการสมุนไพรที่อนุญาตตามกฎหมาย
    const APPROVED_HERBS = [
      'ขมิ้นชัน',
      'ขิง',
      'กะชาย',
      'ตะไคร้',
      'ใบเตย',
      'กะเพรา',
      'โหระพา',
      'สะระแหน่',
      'ผักชี',
      'ผักชีฝรั่ง',
    ];

    return cropTypes.every(crop => APPROVED_HERBS.includes(crop));
  }
}

module.exports = GACPBusinessRulesValidator;
