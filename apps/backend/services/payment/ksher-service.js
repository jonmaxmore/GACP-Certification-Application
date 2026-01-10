const crypto = require('crypto');
const fs = require('fs');

/**
 * Ksher Payment Service
 * Handles API interaction with Ksher Gateway
 * URL: https://api.ksher.net/KsherAPI/dev/index.html
 */
class KsherService {
    constructor() {
        this.appId = process.env.KSHER_APP_ID || 'mch35689'; // Mock ID
        this.privateKey = process.env.KSHER_PRIVATE_KEY_PATH
            ? fs.readFileSync(process.env.KSHER_PRIVATE_KEY_PATH)
            : 'MOCK_PRIVATE_KEY';
        this.apiUrl = process.env.KSHER_API_URL || 'https://api.ksher.net/KsherAPI';
        this.environment = process.env.NODE_ENV || 'development';
    }

    /**
     * Generate Signature for Ksher API
     */
    _sign(data) {
        // Mock Signature: Real logic requires sorting keys + signing
        // For production, implement exact logic from docs: Sort -> Key=Value -> Sign
        if (this.appId === 'mch35689') {return 'MOCK_SIGNATURE';}

        try {
            const sortedKeys = Object.keys(data).sort().filter(k => k !== 'sign');
            const str = sortedKeys.map(k => `${k}=${data[k]}`).join('&');
            return crypto.createHmac('sha256', this.privateKey).update(str).digest('hex').toUpperCase();
        } catch (e) {
            console.error('Sign Error:', e);
            return 'ERROR_SIGN';
        }
    }

    /**
     * Create Native Order (QR / Redirect Link)
     * @param {string} orderId - Merchant Order No
     * @param {number} amount - Amount in THB (e.g. 5000)
     * @param {string} redirectUrl - URL to return to after payment
     * @param {string} notifyUrl - Webhook URL
     * @returns {Promise<{ ok: boolean, payload: any }>}
     */
    async createOrder(orderId, amount, redirectUrl, notifyUrl) {
        try {
            const payload = {
                appid: this.appId,
                mch_order_no: orderId,
                total_fee: Math.round(amount * 100), // Convert to cents
                fee_type: 'THB',
                channel_list: 'promptpay,credit_card,truemoney', // Enable all generic
                mch_redirect_url: redirectUrl,
                mch_notify_url: notifyUrl,
                nonce_str: crypto.randomBytes(16).toString('hex'),
                time_stamp: Math.floor(Date.now() / 1000).toString(),
            };

            payload.sign = this._sign(payload);

            console.log(`[KsherService] Creating Order: ${orderId}, Amount: ${amount}`);

            // MOCK MODE: Return fake QR if no real credentials
            if (this.appId === 'mch35689') {
                return {
                    ok: true,
                    data: {
                        prepay_id: 'PRE_' + orderId,
                        reserved_id: 'RES_' + orderId,
                        order_content: `https://gateway.ksher.com/mock_pay/${orderId}`,
                        // Generate a Google Chart QR for testing
                        code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://gateway.ksher.com/mock_pay/${orderId}`,
                    },
                };
            }

            // Real Call using fetch
            const response = await fetch(`${this.apiUrl}/native_pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.code === 0 || data.result === 'SUCCESS') {
                return { ok: true, data: data.data || data };
            } else {
                return { ok: false, error: data.msg || 'Ksher API Error' };
            }

        } catch (error) {
            console.error('[KsherService] Create Order Failed:', error.message);
            return { ok: false, error: error.message };
        }
    }

    /**
     * Verify Webhook Signature
     */
    verifySignature(data, signature) {
        if (this.appId === 'mch35689') {return true;}
        const calcSign = this._sign(data);
        return calcSign === signature;
    }
}

module.exports = new KsherService();

