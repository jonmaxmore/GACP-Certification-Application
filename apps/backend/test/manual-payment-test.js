
const { PrismaClient } = require('@prisma/client');
const paymentController = require('../controllers/payment-controller');

// Mock Express Req/Res
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        console.log('Response:', JSON.stringify(data, null, 2));
        this.data = data;
        return this;
    },
};

async function testPayment() {
    console.log('🧪 Testing PaymentController...');
    const prisma = new PrismaClient();

    try {
        // 1. Create a Test User and Application
        const user = await prisma.user.upsert({
            where: { email: 'test_payment@example.com' },
            create: {
                email: 'test_payment@example.com',
                password: 'hash',
                firstName: 'Test',
                lastName: 'Payment',
                role: 'FARMER',
                status: 'ACTIVE',
            },
            update: {},
        });
        console.log('User ID:', user.id);

        const app = await prisma.application.create({
            data: {
                applicationNumber: 'TEST-APP-' + Date.now(),
                status: 'PAYMENT_2_PENDING',
                farmerId: user.id,
                areaType: 'OUTDOOR', // Required field
            },
        });
        console.log('Application Created:', app.applicationNumber);

        // 2. Create an Invoice (Pending)
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: 'INV-TEST-' + Date.now(),
                applicationId: app.id,
                farmerId: user.id,
                // amount: 25000, // Invalid field
                subtotal: 25000,
                totalAmount: 25000,
                dueDate: new Date(),
                status: 'pending', // Pending
                serviceType: 'AUDIT_FEE',
                // phase: 2 // Not in Invoice schema
            },
        });
        console.log('Invoice Created:', invoice.invoiceNumber);

        // 3. Call confirmPayment
        const req = {
            body: {
                invoiceId: invoice.id,
                applicationId: app.id,
                phase: 2,
                amount: 25000,
            },
            file: { filename: 'test-slip.jpg' }, // Mock file
            user: { id: user.id },
        };

        console.log('Run confirmPayment...');
        await paymentController.confirmPayment(req, mockRes);

        if (mockRes.data && mockRes.data.success) {
            console.log('✅ Payment Confirmed!');
        } else {
            console.error('❌ Payment Failed:', mockRes.data);
        }

        // 4. Verify Database State
        const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
        console.log('Invoice Status:', updatedInvoice.status); // Should be 'paid'

        const updatedApp = await prisma.application.findUnique({ where: { id: app.id } });
        console.log('Application Status:', updatedApp.status); // Should be 'PENDING_AUDIT'

        // Cleanup
        await prisma.invoice.delete({ where: { id: invoice.id } });
        await prisma.application.delete({ where: { id: app.id } });
        // await prisma.user.delete({ where: { id: user.id } });

    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testPayment();
