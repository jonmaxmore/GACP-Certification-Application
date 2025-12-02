/**
 * GACP Platform - Enhanced Payment Fees Configuration
 * ค่าธรรมเนียมที่ปรับปรุงตาม workflow ใหม่ (October 2025)
 *
 * กฎการชำระเงิน:
 * - Phase 1 (5,000 บาท): ค่าธรรมเนียมตรวจสอบเอกสาร
 * - Phase 2 (25,000 บาท): ค่าธรรมเนียมตรวจสอบภาคสนาม
 * - หากเอกสารถูกปฏิเสธครบ 2 ครั้ง ต้องจ่าย Phase 1 ใหม่
 * - ไม่มี Phase 3 (ไม่เก็บค่าออกใบรับรอง)
 */

const PAYMENT_FEES = {
  // ระบบค่าธรรมเนียม 2 เฟส
  DOCUMENT_REVIEW_FEE: 5000, // ค่าธรรมเนียมตรวจสอบเอกสาร (Phase 1)
  FIELD_AUDIT_FEE: 25000, // ค่าธรรมเนียมตรวจสอบภาคสนาม (Phase 2)

  // ค่าธรรมเนียมพิเศษ
  RE_SUBMISSION_FEE: 5000, // ค่าธรรมเนียมยื่นซ้ำ (เมื่อถูกปฏิเสธครบ 2 ครั้ง)
  URGENT_PROCESSING_FEE: 3000, // ค่าธรรมเนียมเร่งด่วน (ไม่บังคับ)

  // การคำนวณยอดรวม
  TOTAL_STANDARD_FEE: 30000, // รวมทั้งหมด (5,000 + 25,000)

  // ขั้นตอนการชำระเงิน (2 Phase เท่านั้น)
  PAYMENT_PHASES: {
    PHASE_1: {
      phase: 1,
      amount: 5000,
      description: 'ค่าธรรมเนียมตรวจสอบเอกสาร',
      description_en: 'Document Review Fee',
      when: 'หลังจากส่งใบสมัคร',
      when_en: 'After application submission',
      triggers: ['APPLICATION_SUBMITTED'],
      next_states: ['DOCUMENT_REVIEW'],
      required: true,
    },
    PHASE_2: {
      phase: 2,
      amount: 25000,
      description: 'ค่าธรรมเนียมตรวจสอบภาคสนาม',
      description_en: 'Field Inspection Fee',
      when: 'หลังจากเอกสารผ่านการตรวจสอบ',
      when_en: 'After document approval',
      triggers: ['DOCUMENT_APPROVED'],
      next_states: ['INSPECTION_SCHEDULED'],
      required: true,
    },
  },

  // กฎการชำระเงินใหม่
  RE_PAYMENT_RULES: {
    DOCUMENT_REJECTION_LIMIT: 2, // จำกัดการปฏิเสธเอกสาร
    RE_PAYMENT_TRIGGERS: [
      {
        condition: 'DOCUMENT_REJECTED_MAX',
        description: 'เอกสารถูกปฏิเสธครบ 2 ครั้ง',
        action: 'REQUIRE_NEW_PHASE_1_PAYMENT',
        amount: 5000,
        reset_rejection_count: true,
      },
    ],
  },

  // สถานะการชำระเงิน
  PAYMENT_STATUS: {
    PENDING: 'pending', // รอชำระ
    PROCESSING: 'processing', // กำลังตรวจสอบ
    COMPLETED: 'completed', // ชำระแล้ว
    FAILED: 'failed', // ชำระไม่สำเร็จ
    EXPIRED: 'expired', // หมดอายุ
    REFUNDED: 'refunded', // คืนเงินแล้ว
    CANCELLED: 'cancelled', // ยกเลิก
  },

  // ระยะเวลาชำระเงิน
  PAYMENT_TIMEOUT: {
    PHASE_1: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    PHASE_2: 14 * 24 * 60 * 60 * 1000, // 14 วัน
  },

  // Gateway และช่องทางการชำระเงิน
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    INTERNET_BANKING: 'internet_banking',
    MOBILE_BANKING: 'mobile_banking',
    QR_CODE: 'qr_code',
    BANK_TRANSFER: 'bank_transfer',
    COUNTER_SERVICE: 'counter_service',
  },

  // ข้อมูลธนาคารรับเงิน
  BANK_ACCOUNTS: {
    PRIMARY: {
      bank: 'ธนาคารกรุงไทย',
      account_number: '123-4-56789-0',
      account_name: 'กรมวิชาการเกษตร',
      branch: 'สำนักงานใหญ่',
    },
  },
};

module.exports = {
  PAYMENT_FEES,

  // Helper functions
  getTotalFee: () => PAYMENT_FEES.TOTAL_STANDARD_FEE,

  getPhaseAmount: phase => {
    const phases = PAYMENT_FEES.PAYMENT_PHASES;
    switch (phase) {
      case 1:
        return phases.PHASE_1.amount;
      case 2:
        return phases.PHASE_2.amount;
      // case 3: Phase 3 ถูกยกเลิก
      default:
        return 0;
    }
  },

  getPhaseDescription: phase => {
    const phases = PAYMENT_FEES.PAYMENT_PHASES;
    switch (phase) {
      case 1:
        return phases.PHASE_1.description;
      case 2:
        return phases.PHASE_2.description;
      // case 3: Phase 3 ถูกยกเลิก
      default:
        return 'Unknown phase';
    }
  },

  isValidPhase: phase => {
    return [1, 2].includes(parseInt(phase)); // เหลือแค่ Phase 1 และ 2
  },

  calculateTotalPaid: (paidPhases = []) => {
    return paidPhases.reduce((total, phase) => {
      return total + (PAYMENT_FEES.PAYMENT_PHASES[`PHASE_${phase}`]?.amount || 0);
    }, 0);
  },

  getNextPhase: currentPhase => {
    const phase = parseInt(currentPhase);
    return phase < 2 ? phase + 1 : null; // เหลือแค่ Phase 1 → 2
  },

  getRemainingAmount: (paidPhases = []) => {
    const totalPaid = module.exports.calculateTotalPaid(paidPhases);
    return PAYMENT_FEES.TOTAL_STANDARD_FEE - totalPaid;
  },

  // กฎการชำระเงินใหม่เมื่อเอกสารถูกปฏิเสธ
  requiresNewPayment: (rejectionCount, maxRejections = 2) => {
    return rejectionCount >= maxRejections;
  },

  // ตรวจสอบว่าการชำระเงินหมดอายุหรือไม่
  isPaymentExpired: (paymentDate, phase = 1) => {
    if (!paymentDate) {
      return false;
    }
    const now = new Date();
    const expiry = new Date(paymentDate.getTime() + PAYMENT_FEES.PAYMENT_TIMEOUT[`PHASE_${phase}`]);
    return now > expiry;
  },
};
