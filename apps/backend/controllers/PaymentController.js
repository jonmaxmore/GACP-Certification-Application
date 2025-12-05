const gacpService = require('../services/ApplicationWorkflowService');
const logger = require('../utils/logger'); // Assuming logger exists

class PaymentController {
    /**
     * Confirm payment with slip upload
     * POST /api/v2/payments/confirm
     */
    async confirmPayment(req, res) {
        try {
            const { applicationId, phase, amount } = req.body;
            const slipImage = req.file;

            if (!applicationId || !phase) {
                return res.status(400).json({
                    success: false,
                    error: 'Application ID and phase are required'
                });
            }

            logger.info(`Processing payment confirmation for app ${applicationId}, phase ${phase}`);

            // Prepare payment details including slip path if uploaded
            const paymentDetails = {
                amount: parseFloat(amount),
                method: 'transfer',
                paidAt: new Date(),
                slipImagePath: slipImage ? slipImage.path : null, // Store path
                slipImageFilename: slipImage ? slipImage.filename : null
            };

            // Call service
            const application = await gacpService.processPayment(applicationId, phase, paymentDetails);

            res.json({
                success: true,
                data: {
                    applicationId: application.id,
                    payment: application.payment[phase],
                    message: 'Payment confirmed successfully'
                }
            });
        } catch (error) {
            logger.error('Payment confirmation error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();
