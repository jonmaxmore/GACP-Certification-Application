/**
 * Payment Workflow Verification Script
 *
 * ทดสอบความถูกต้องของ Payment Workflow หลังจากแก้ไข inconsistency
 * เพื่อยืนยันว่าระบบใช้ 2-Phase Payment เท่านั้น
 */

const logger = require('../shared/logger');
const { PAYMENT_FEES } = require('../config/payment-fees');

class PaymentWorkflowVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * ทดสอบ Payment Configuration ที่ถูกต้อง
   */
  verifyPaymentConfiguration() {
    logger.info('🔍 Verifying Payment Configuration...');

    // Test 1: ตรวจสอบว่ามีแค่ 2 phases
    const phases = Object.keys(PAYMENT_FEES.PAYMENT_PHASES);
    if (phases.length === 2 && phases.includes('PHASE_1') && phases.includes('PHASE_2')) {
      this.passed.push('✅ Payment phases count correct (2 phases)');
    } else {
      this.errors.push('❌ Wrong number of payment phases');
    }

    // Test 2: ตรวจสอบว่าไม่มี PHASE_3
    if (!phases.includes('PHASE_3')) {
      this.passed.push('✅ PHASE_3 correctly removed');
    } else {
      this.errors.push('❌ PHASE_3 still exists');
    }

    // Test 3: ตรวจสอบ amounts
    const phase1Amount = PAYMENT_FEES.PAYMENT_PHASES.PHASE_1.amount;
    const phase2Amount = PAYMENT_FEES.PAYMENT_PHASES.PHASE_2.amount;

    if (phase1Amount === 5000) {
      this.passed.push('✅ Phase 1 amount correct (5,000 THB)');
    } else {
      this.errors.push(`❌ Phase 1 amount wrong: ${phase1Amount}`);
    }

    if (phase2Amount === 25000) {
      this.passed.push('✅ Phase 2 amount correct (25,000 THB)');
    } else {
      this.errors.push(`❌ Phase 2 amount wrong: ${phase2Amount}`);
    }

    // Test 4: ตรวจสอบ total fee
    const totalFee = PAYMENT_FEES.TOTAL_STANDARD_FEE;
    if (totalFee === 30000) {
      this.passed.push('✅ Total fee correct (30,000 THB)');
    } else {
      this.errors.push(`❌ Total fee wrong: ${totalFee}`);
    }
  }

  /**
   * ทดสอบ Helper Functions
   */
  verifyHelperFunctions() {
    logger.info('🔧 Verifying Helper Functions...');

    // Test getTotalFee
    const totalFee = require('../config/payment-fees').getTotalFee();
    if (totalFee === 30000) {
      this.passed.push('✅ getTotalFee() returns correct amount');
    } else {
      this.errors.push(`❌ getTotalFee() returns wrong amount: ${totalFee}`);
    }

    // Test getPhaseAmount
    const getPhaseAmount = require('../config/payment-fees').getPhaseAmount;

    if (getPhaseAmount(1) === 5000) {
      this.passed.push('✅ getPhaseAmount(1) correct');
    } else {
      this.errors.push(`❌ getPhaseAmount(1) wrong: ${getPhaseAmount(1)}`);
    }

    if (getPhaseAmount(2) === 25000) {
      this.passed.push('✅ getPhaseAmount(2) correct');
    } else {
      this.errors.push(`❌ getPhaseAmount(2) wrong: ${getPhaseAmount(2)}`);
    }

    if (getPhaseAmount(3) === 0) {
      this.passed.push('✅ getPhaseAmount(3) returns 0 (phase not exists)');
    } else {
      this.errors.push(`❌ getPhaseAmount(3) should return 0, got: ${getPhaseAmount(3)}`);
    }

    // Test isValidPhase
    const isValidPhase = require('../config/payment-fees').isValidPhase;

    if (isValidPhase(1) && isValidPhase(2) && !isValidPhase(3)) {
      this.passed.push('✅ isValidPhase() correctly validates phases 1,2 only');
    } else {
      this.errors.push('❌ isValidPhase() validation wrong');
    }
  }

  /**
   * ทดสอบ Business Logic Flow
   */
  verifyBusinessFlow() {
    logger.info('💼 Verifying Business Flow...');

    // Simulate application flow
    const phases = [];
    phases.push(1); // Phase 1 payment
    phases.push(2); // Phase 2 payment

    const calculateTotalPaid = require('../config/payment-fees').calculateTotalPaid;
    const totalPaid = calculateTotalPaid(phases);

    if (totalPaid === 30000) {
      this.passed.push('✅ Total payment calculation correct for full flow');
    } else {
      this.errors.push(`❌ Total payment calculation wrong: ${totalPaid}`);
    }

    // Test partial payment
    const partialPaid = calculateTotalPaid([1]);
    if (partialPaid === 5000) {
      this.passed.push('✅ Partial payment calculation correct');
    } else {
      this.errors.push(`❌ Partial payment calculation wrong: ${partialPaid}`);
    }

    // Test next phase logic
    const getNextPhase = require('../config/payment-fees').getNextPhase;

    if (getNextPhase(1) === 2) {
      this.passed.push('✅ Next phase logic correct (1→2)');
    } else {
      this.errors.push(`❌ Next phase logic wrong for phase 1: ${getNextPhase(1)}`);
    }

    if (getNextPhase(2) === null) {
      this.passed.push('✅ Next phase logic correct (2→null)');
    } else {
      this.errors.push(`❌ Next phase logic wrong for phase 2: ${getNextPhase(2)}`);
    }
  }

  /**
   * ทดสอบ Payment Timeouts
   */
  verifyPaymentTimeouts() {
    logger.info('⏰ Verifying Payment Timeouts...');

    const timeouts = PAYMENT_FEES.PAYMENT_TIMEOUT;

    // ตรวจสอบว่ามีแค่ 2 timeout periods
    const timeoutPhases = Object.keys(timeouts);
    if (
      timeoutPhases.length === 2 &&
      timeoutPhases.includes('PHASE_1') &&
      timeoutPhases.includes('PHASE_2')
    ) {
      this.passed.push('✅ Payment timeout phases correct');
    } else {
      this.errors.push('❌ Payment timeout phases wrong');
    }

    // ตรวจสอบ timeout values
    if (timeouts.PHASE_1 === 7 * 24 * 60 * 60 * 1000) {
      this.passed.push('✅ Phase 1 timeout correct (7 days)');
    } else {
      this.errors.push('❌ Phase 1 timeout wrong');
    }

    if (timeouts.PHASE_2 === 14 * 24 * 60 * 60 * 1000) {
      this.passed.push('✅ Phase 2 timeout correct (14 days)');
    } else {
      this.errors.push('❌ Phase 2 timeout wrong');
    }
  }

  /**
   * ทดสอบ Business Process Descriptions
   */
  verifyDescriptions() {
    logger.info('📝 Verifying Payment Descriptions...');

    const phase1Desc = PAYMENT_FEES.PAYMENT_PHASES.PHASE_1.description;
    const phase2Desc = PAYMENT_FEES.PAYMENT_PHASES.PHASE_2.description;

    if (phase1Desc.includes('เอกสาร')) {
      this.passed.push('✅ Phase 1 description correct (document review)');
    } else {
      this.errors.push('❌ Phase 1 description wrong');
    }

    if (phase2Desc.includes('ภาคสนาม')) {
      this.passed.push('✅ Phase 2 description correct (field audit)');
    } else {
      this.errors.push('❌ Phase 2 description wrong');
    }
  }

  /**
   * รันการทดสอบทั้งหมด
   */
  async runAllTests() {
    logger.info('🚀 Starting Payment Workflow Verification...\n');

    try {
      this.verifyPaymentConfiguration();
      this.verifyHelperFunctions();
      this.verifyBusinessFlow();
      this.verifyPaymentTimeouts();
      this.verifyDescriptions();

      this.generateReport();
    } catch (error) {
      logger.error('❌ Verification failed with error:', error.message);
      this.errors.push(`System Error: ${error.message}`);
      this.generateReport();
    }
  }

  /**
   * สร้างรายงานผลการทดสอบ
   */
  generateReport() {
    logger.info('\n' + '='.repeat(60));
    logger.info('📊 PAYMENT WORKFLOW VERIFICATION REPORT');
    logger.info('='.repeat(60));

    logger.info(`\n✅ PASSED TESTS (${this.passed.length});:`);
    this.passed.forEach(test => logger.info(`   ${test}`));

    if (this.warnings.length > 0) {
      logger.info(`\n⚠️  WARNINGS (${this.warnings.length});:`);
      this.warnings.forEach(warning => logger.info(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      logger.info(`\n❌ FAILED TESTS (${this.errors.length});:`);
      this.errors.forEach(error => logger.info(`   ${error}`));
    }

    logger.info('\n' + '='.repeat(60));

    const totalTests = this.passed.length + this.warnings.length + this.errors.length;
    const successRate = ((this.passed.length / totalTests) * 100).toFixed(1);

    logger.info(`📈 SUCCESS RATE: ${successRate}% (${this.passed.length}/${totalTests});`);

    if (this.errors.length === 0) {
      logger.info('🎉 ALL PAYMENT WORKFLOW TESTS PASSED! ');
      logger.info('✅ Payment system is consistent and ready for production.');
    } else {
      logger.info('🚨 PAYMENT WORKFLOW HAS ISSUES!');
      logger.info('❌ Please fix the errors before proceeding.');
    }

    logger.info('='.repeat(60) + '\n');

    return {
      success: this.errors.length === 0,
      passed: this.passed.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      successRate: successRate,
    };
  }
}

// Export สำหรับใช้ในไฟล์อื่น
module.exports = PaymentWorkflowVerifier;

// รันทดสอบถ้า execute ตรง ๆ
if (require.main === module) {
  const verifier = new PaymentWorkflowVerifier();
  verifier.runAllTests();
}
