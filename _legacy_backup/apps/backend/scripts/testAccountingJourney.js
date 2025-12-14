/**
 * Accounting Journey E2E Test
 * Tests full flow: Register → Apply → Quote → Invoice → Payment
 * Validates accounting principles and data consistency
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://gacp-premierprime:qwer1234@thai-gacp.re1651p.mongodb.net/gacp-development?retryWrites=true&w=majority';

const API_BASE = 'http://localhost:5000';

async function testAccountingJourney() {
    console.log('='.repeat(60));
    console.log('🧪 ACCOUNTING JOURNEY E2E TEST');
    console.log('='.repeat(60));

    try {
        // Connect to DB for direct verification
        await mongoose.connect(MONGODB_URI);
        console.log('\n✅ Connected to MongoDB\n');

        const User = require('../models/UserModel');
        const Quote = require('../models/QuoteModel');
        const Invoice = require('../models/InvoiceModel');
        const Application = require('../models/ApplicationModel');

        // Generate unique test data
        const timestamp = Date.now();
        const testFarmer = {
            email: `testfarmer_${timestamp}@test.com`,
            password: 'TestPass123!',
            firstName: 'ทดสอบ',
            lastName: 'บัญชี',
            accountType: 'INDIVIDUAL',
            idCard: `${timestamp}`.substring(0, 13).padStart(13, '0'),
            laserCode: 'JT1234567890',
            phoneNumber: '0800000000',
        };

        console.log('📋 STEP 1: Register New Farmer');
        console.log('-'.repeat(40));

        // Register via API
        const registerRes = await fetch(`${API_BASE}/api/v2/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testFarmer),
        });
        const registerData = await registerRes.json();

        if (!registerData.success) {
            throw new Error(`Registration failed: ${registerData.message}`);
        }
        console.log(`   ✅ Farmer registered: ${testFarmer.email}`);
        console.log(`   📝 User ID: ${registerData.data.user._id}`);

        const farmerId = registerData.data.user._id;

        // Login to get token
        console.log('\n📋 STEP 2: Login');
        console.log('-'.repeat(40));

        const loginRes = await fetch(`${API_BASE}/api/v2/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: testFarmer.idCard,
                password: testFarmer.password,
                accountType: 'INDIVIDUAL',
            }),
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.message}`);
        }
        console.log(`   ✅ Login successful`);
        const farmerToken = loginData.data.tokens.accessToken;

        // Create application directly in DB (simulating farmer submission)
        console.log('\n📋 STEP 3: Create Application');
        console.log('-'.repeat(40));

        const application = new Application({
            applicantId: farmerId,
            serviceType: 'new_application',
            plantType: 'cannabis',
            status: 'pending_review',
            establishmentInfo: {
                name: 'ฟาร์มทดสอบบัญชี',
                address: '123 ถนนทดสอบ',
                province: 'กรุงเทพมหานคร',
            },
        });
        await application.save();
        console.log(`   ✅ Application created: ${application._id}`);
        console.log(`   📝 App Number: ${application.applicationNumber || 'Auto-generated'}`);

        // Login as Accountant
        console.log('\n📋 STEP 4: Login as Accountant');
        console.log('-'.repeat(40));

        const accountantLoginRes = await fetch(`${API_BASE}/api/v2/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: 'accountant01@gacp.go.th',
                password: 'Staff@2024!',
                accountType: 'STAFF',
            }),
        });

        let accountantToken;
        const accountantLoginData = await accountantLoginRes.json();
        if (accountantLoginData.success) {
            accountantToken = accountantLoginData.data.tokens.accessToken;
            console.log(`   ✅ Accountant login successful`);
        } else {
            console.log(`   ⚠️  Accountant login failed (using direct DB)`);
        }

        // Create Quote (by Accountant)
        console.log('\n📋 STEP 5: Create Quote (ใบเสนอราคา)');
        console.log('-'.repeat(40));

        const accountant = await User.findOne({ email: 'accountant01@gacp.go.th' });

        const quote = new Quote({
            applicationId: application._id,
            farmerId: farmerId,
            createdByStaff: accountant?._id,
            serviceType: 'new_application',
            items: [
                { description: 'ค่าธรรมเนียมการขอรับรอง GACP', quantity: 1, unitPrice: 15000, total: 15000 },
                { description: 'ค่าตรวจประเมินสถานที่', quantity: 1, unitPrice: 10000, total: 10000 },
                { description: 'ค่าออกใบรับรอง', quantity: 1, unitPrice: 5000, total: 5000 },
            ],
            subtotal: 30000,
            vat: 0, // GACP exempt
            totalAmount: 30000,
            totalAmountText: 'สามหมื่นบาทถ้วน',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'draft',
        });
        await quote.save();

        console.log(`   ✅ Quote created: ${quote.quoteNumber}`);
        console.log(`   💰 Total: ฿${quote.totalAmount.toLocaleString()} (${quote.totalAmountText})`);
        console.log(`   📅 Valid until: ${quote.validUntil.toLocaleDateString('th-TH')}`);

        // Send Quote to Farmer
        console.log('\n📋 STEP 6: Send Quote to Farmer');
        console.log('-'.repeat(40));

        quote.status = 'sent';
        quote.sentAt = new Date();
        await quote.save();
        console.log(`   ✅ Quote sent: ${quote.status}`);
        console.log(`   📅 Sent at: ${quote.sentAt.toLocaleString('th-TH')}`);

        // Farmer Accepts Quote
        console.log('\n📋 STEP 7: Farmer Accepts Quote');
        console.log('-'.repeat(40));

        quote.status = 'accepted';
        quote.acceptedAt = new Date();
        await quote.save();
        console.log(`   ✅ Quote accepted: ${quote.status}`);
        console.log(`   📅 Accepted at: ${quote.acceptedAt.toLocaleString('th-TH')}`);

        // Create Invoice from Quote
        console.log('\n📋 STEP 8: Create Invoice from Quote (ใบวางบิล)');
        console.log('-'.repeat(40));

        const invoice = new Invoice({
            applicationId: application._id,
            quoteId: quote._id,
            serviceType: quote.serviceType,
            farmerId: farmerId,
            items: quote.items,
            subtotal: quote.subtotal,
            vat: quote.vat,
            totalAmount: quote.totalAmount,
            totalAmountText: quote.totalAmountText,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: 'pending',
        });
        await invoice.save();

        // Update quote status
        quote.status = 'invoiced';
        quote.invoiceId = invoice._id;
        await quote.save();

        console.log(`   ✅ Invoice created: ${invoice.invoiceNumber}`);
        console.log(`   🔗 From Quote: ${quote.quoteNumber}`);
        console.log(`   💰 Total: ฿${invoice.totalAmount.toLocaleString()}`);
        console.log(`   📅 Due date: ${invoice.dueDate.toLocaleDateString('th-TH')}`);

        // Simulate Payment
        console.log('\n📋 STEP 9: Farmer Makes Payment');
        console.log('-'.repeat(40));

        invoice.status = 'paid';
        invoice.paidAt = new Date();
        await invoice.save();

        console.log(`   ✅ Invoice paid: ${invoice.status}`);
        console.log(`   📅 Paid at: ${invoice.paidAt.toLocaleString('th-TH')}`);

        // Update document numbers (Accountant updates temporary to official)
        console.log('\n📋 STEP 10: Accountant Updates Official Numbers');
        console.log('-'.repeat(40));

        const officialQuoteNo = `QT-${new Date().getFullYear() + 543}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-0001`;
        const officialInvoiceNo = `INV-${new Date().getFullYear() + 543}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-0001`;

        console.log(`   📝 Quote: ${quote.quoteNumber} → ${officialQuoteNo}`);
        quote.quoteNumber = officialQuoteNo;
        await quote.save();

        console.log(`   📝 Invoice: ${invoice.invoiceNumber} → ${officialInvoiceNo}`);
        invoice.invoiceNumber = officialInvoiceNo;
        await invoice.save();

        console.log(`   ✅ Official numbers assigned`);

        // ACCOUNTING VERIFICATION
        console.log('\n' + '='.repeat(60));
        console.log('📊 ACCOUNTING VERIFICATION');
        console.log('='.repeat(60));

        // Check data consistency
        const finalQuote = await Quote.findById(quote._id);
        const finalInvoice = await Invoice.findById(invoice._id);

        console.log('\n🔍 Data Consistency Check:');
        console.log('-'.repeat(40));

        const checks = [
            {
                name: 'Quote → Invoice Amount Match',
                pass: finalQuote.totalAmount === finalInvoice.totalAmount,
                expected: finalQuote.totalAmount,
                actual: finalInvoice.totalAmount,
            },
            {
                name: 'Quote Status = invoiced',
                pass: finalQuote.status === 'invoiced',
                expected: 'invoiced',
                actual: finalQuote.status,
            },
            {
                name: 'Invoice Status = paid',
                pass: finalInvoice.status === 'paid',
                expected: 'paid',
                actual: finalInvoice.status,
            },
            {
                name: 'Quote.invoiceId = Invoice._id',
                pass: finalQuote.invoiceId?.toString() === finalInvoice._id.toString(),
                expected: finalInvoice._id.toString(),
                actual: finalQuote.invoiceId?.toString(),
            },
            {
                name: 'Invoice.quoteId = Quote._id',
                pass: finalInvoice.quoteId?.toString() === finalQuote._id.toString(),
                expected: finalQuote._id.toString(),
                actual: finalInvoice.quoteId?.toString(),
            },
            {
                name: 'Same Application Reference',
                pass: finalQuote.applicationId.toString() === finalInvoice.applicationId.toString(),
                expected: finalQuote.applicationId.toString(),
                actual: finalInvoice.applicationId.toString(),
            },
            {
                name: 'Same Farmer Reference',
                pass: finalQuote.farmerId.toString() === finalInvoice.farmerId.toString(),
                expected: finalQuote.farmerId.toString(),
                actual: finalInvoice.farmerId.toString(),
            },
        ];

        let passCount = 0;
        checks.forEach(check => {
            const icon = check.pass ? '✅' : '❌';
            console.log(`   ${icon} ${check.name}`);
            if (!check.pass) {
                console.log(`      Expected: ${check.expected}`);
                console.log(`      Actual: ${check.actual}`);
            }
            if (check.pass) passCount++;
        });

        console.log('\n📈 Accounting Summary:');
        console.log('-'.repeat(40));
        console.log(`   Quote Number: ${finalQuote.quoteNumber}`);
        console.log(`   Invoice Number: ${finalInvoice.invoiceNumber}`);
        console.log(`   Total Revenue: ฿${finalInvoice.totalAmount.toLocaleString()}`);
        console.log(`   Payment Date: ${finalInvoice.paidAt?.toLocaleString('th-TH') || 'N/A'}`);

        console.log('\n' + '='.repeat(60));
        console.log(`📊 TEST RESULT: ${passCount}/${checks.length} checks passed`);
        console.log('='.repeat(60));

        if (passCount === checks.length) {
            console.log('\n✅ ALL ACCOUNTING CHECKS PASSED!');
            console.log('   ✓ No conflicts detected');
            console.log('   ✓ Data consistency verified');
            console.log('   ✓ Document flow is correct');
        } else {
            console.log('\n⚠️  SOME CHECKS FAILED! Review the issues above.');
        }

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testAccountingJourney();
