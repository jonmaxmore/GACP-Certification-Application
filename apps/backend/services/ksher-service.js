const crypto = require('crypto');

/**
 * GACP Certification - Ksher Payment Service (Mock)
 * Simulates Ksher API interactions for development/testing without real credentials.
 */
class KsherService {
    constructor() {
        // Mock Config
        this.apiBaseUrl = process.env.KSHER_API_URL || 'https://api.mch.ksher.net/KsherPay';
        this.appid = process.env.KSHER_APP_ID || 'gh_mock_appid';
        this.privateKey = process.env.KSHER_PRIVATE_KEY || 'mock_private_key';
    }

    /**
     * Create a Native Pay Order (Generates Payment URL)
     * @param {Object} orderData 
     * @returns {Promise<string>} payment_url
     */
    async createOrder(orderData) {
        console.log('[KsherService] Creating Order:', orderData);

        // In a real implementation, we would sign the payload and call Ksher API.
        // For this MOCK, we just generate a local URL to our mock payment page.

        const mockPaymentUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/mock-payment/pay/${orderData.mch_order_no}?amount=${orderData.total_fee}`;

        return {
            success: true,
            payment_url: mockPaymentUrl,
            mch_order_no: orderData.mch_order_no,
            reference_id: `ksher_ref_${Date.now()}`,
        };
    }

    /**
     * Verify Webhook Signature
     * @param {Object} payload 
     * @returns {boolean}
     */
    verifySignature(payload) {
        // Mock validation - always true for testing
        console.log('[KsherService] Verifying Signature for:', payload);
        return true;
    }
}

module.exports = new KsherService();
