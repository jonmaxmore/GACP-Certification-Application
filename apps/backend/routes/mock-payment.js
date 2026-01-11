const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');

// GET /api/mock-payment/pay/:orderId
// Renders a simple HTML page for the user to "Confirm Payment"
router.get('/pay/:orderId', (req, res) => {
    const { orderId } = req.params;
    const { amount } = req.query;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Ksher Mock Payment</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <h1 class="text-2xl font-bold mb-2">Ksher Payment Gateway (Mock)</h1>
            <p class="text-gray-500 mb-6">Order ID: <span class="font-mono text-gray-800">${orderId}</span></p>
            
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <p class="text-sm text-gray-500">Total Amount</p>
                <p class="text-3xl font-bold text-green-600">฿${parseInt(amount || 0).toLocaleString()}</p>
            </div>

            <button id="payBtn" onclick="confirmPayment()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
                Simulate "Payment Success"
            </button>
            <p id="status" class="mt-4 text-sm text-gray-500 hidden">Processing...</p>
        </div>

        <script>
            async function confirmPayment() {
                const btn = document.getElementById('payBtn');
                const status = document.getElementById('status');
                
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                status.innerText = "Processing Payment...";
                status.classList.remove('hidden');

                try {
                    // Call backend to trigger webhook logic
                    const res = await fetch('/api/mock-payment/pay/${orderId}/confirm', { method: 'POST' });
                    const data = await res.json();
                    
                    if (data.success) {
                        status.innerText = "Payment Successful! Redirecting...";
                        status.classList.add('text-green-600');
                        setTimeout(() => {
                            // Redirect back to main app (Success)
                            window.location.href = 'http://localhost:3000/payments?status=success';
                        }, 1500);
                    } else {
                        throw new Error(data.message || 'Payment Failed');
                    }
                } catch (err) {
                    status.innerText = "Error: " + err.message;
                    status.classList.add('text-red-600');
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// POST /api/mock-payment/pay/:orderId/confirm
// Internal endpoint called by the Mock Page to simulate a successful webhook trigger
router.post('/pay/:orderId/confirm', async (req, res) => {
    const { orderId } = req.params;

    // Simulate Webook Payload from Ksher
    const webhookPayload = {
        mch_order_no: orderId,
        ksher_order_no: `KSHER-${Date.now()}`,
        total_fee: 5000,
        fee_type: 'THB',
        result: 'SUCCESS',
        pay_mch_order_no: orderId,
        time_end: new Date().toISOString(),
        channel: 'TRUEMONEY', // Exampl
        sign: 'mock_signature',
    };

    try {
        // Call our own webhook endpoint to process the payment
        // We use localhost:5000 explicitly here as we are on the server
        const webhookUrl = `http://localhost:${process.env.PORT || 5000}/api/webhooks/ksher`;
        await axios.post(webhookUrl, webhookPayload);

        res.json({ success: true, message: 'Webhook Triggered' });
    } catch (error) {
        console.error('Mock Webhook Trigger Failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to trigger webhook' });
    }
});

module.exports = router;
