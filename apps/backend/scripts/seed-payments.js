/**
 * 🌱 Seed Payment Documents for Demo
 * Links payments to existing applications
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/UserModel');
const Application = require('../models/ApplicationModel');
const PaymentDocument = require('../models/PaymentDocument');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_production';

async function seedPayments() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        // Find farmer user
        const farmer = await User.findOne({ email: 'farmer@example.com' });
        if (!farmer) {
            console.log('❌ Farmer not found. Run seedRealisticData.js first!');
            process.exit(1);
        }
        console.log(`👤 Found farmer: ${farmer.firstName} ${farmer.lastName}`);

        // Find applications for this farmer
        const applications = await Application.find({ farmerId: farmer._id });
        console.log(`📝 Found ${applications.length} applications\n`);

        // Clear existing payment documents for this user
        await PaymentDocument.deleteMany({ userId: farmer._id });
        console.log('🗑️  Cleared existing payment documents\n');

        const now = new Date();
        const payments = [];

        // Simple counter for unique document numbers
        let docCounter = { QUOTATION: 1, INVOICE: 1, RECEIPT: 1 };
        const genDocNo = (type) => {
            const year = (now.getFullYear() + 543).toString().slice(-2);
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const prefix = type === 'QUOTATION' ? 'G' : type === 'INVOICE' ? 'GI' : 'REC';
            return `${prefix}-${year}${month}${(docCounter[type]++).toString().padStart(4, '0')}`;
        };

        for (const app of applications) {
            const appId = app._id;
            const appNo = app.applicationNumber;
            const farmName = app.data?.formData?.farmName || 'ฟาร์ม';

            // Get area count from application
            let areaCount = 1;
            if (app.areaType) {
                areaCount = 1; // New format: single areaType per app
            } else if (app.data?.siteInfo?.areaType && Array.isArray(app.data.siteInfo.areaType)) {
                areaCount = app.data.siteInfo.areaType.length || 1;
            } else if (app.siteTypes && Array.isArray(app.siteTypes)) {
                areaCount = app.siteTypes.length || 1;
            }

            const FEE_DOC_REVIEW = 5000;
            const FEE_INSPECTION = 25000;
            const docReviewTotal = FEE_DOC_REVIEW * areaCount;
            const inspectionTotal = FEE_INSPECTION * areaCount;
            const totalAmount = docReviewTotal + inspectionTotal;

            // Generate Quotation for all apps
            const quotationNumber = genDocNo('QUOTATION');
            const quotation = {
                type: 'QUOTATION',
                documentNumber: quotationNumber,
                applicationId: appId,
                userId: farmer._id,
                phase: 1,
                amount: totalAmount,
                items: [
                    { order: 1, description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_DOC_REVIEW, amount: docReviewTotal },
                    { order: 2, description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_INSPECTION, amount: inspectionTotal }
                ],
                status: 'APPROVED',
                recipientName: farmName,
                issueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            };
            payments.push(quotation);

            // Generate Invoice & Receipt for CERTIFIED and AUDIT_SCHEDULED apps (they paid)
            if (app.status === 'CERTIFIED' || app.status === 'AUDIT_SCHEDULED') {
                // Full Invoice with all areas
                const invoiceNumber = genDocNo('INVOICE');
                const invoice = {
                    type: 'INVOICE',
                    documentNumber: invoiceNumber,
                    applicationId: appId,
                    userId: farmer._id,
                    phase: 1,
                    amount: totalAmount,
                    items: [
                        { order: 1, description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_DOC_REVIEW, amount: docReviewTotal },
                        { order: 2, description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_INSPECTION, amount: inspectionTotal }
                    ],
                    status: 'DELIVERED',
                    recipientName: farmName,
                    issueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                    paidAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
                };
                payments.push(invoice);

                // Receipt
                const receiptNumber = genDocNo('RECEIPT');
                const receipt = {
                    type: 'RECEIPT',
                    documentNumber: receiptNumber,
                    applicationId: appId,
                    userId: farmer._id,
                    phase: 1,
                    amount: totalAmount,
                    items: invoice.items,
                    status: 'ISSUED',
                    recipientName: farmName,
                    issueDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
                    paidAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
                };
                payments.push(receipt);
            }

            // Generate pending invoice for PAYMENT_1_PENDING
            if (app.status === 'PAYMENT_1_PENDING') {
                const invoiceNumber = genDocNo('INVOICE');
                const invoice = {
                    type: 'INVOICE',
                    documentNumber: invoiceNumber,
                    applicationId: appId,
                    userId: farmer._id,
                    phase: 1,
                    amount: totalAmount,
                    items: [
                        { order: 1, description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_DOC_REVIEW, amount: docReviewTotal },
                        { order: 2, description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน', quantity: areaCount, unit: 'ต่อคำขอ', unitPrice: FEE_INSPECTION, amount: inspectionTotal }
                    ],
                    status: 'PENDING',
                    recipientName: farmName,
                    issueDate: now,
                    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                };
                payments.push(invoice);
            }

            console.log(`   ${appNo}: Added ${app.status === 'CERTIFIED' ? 3 : app.status === 'PAYMENT_1_PENDING' ? 2 : 1} documents`);
        }

        // Insert all payments
        await PaymentDocument.insertMany(payments);
        console.log(`\n✅ Created ${payments.length} payment documents\n`);

        // Summary
        const summary = {
            quotations: payments.filter(p => p.type === 'QUOTATION').length,
            invoices: payments.filter(p => p.type === 'INVOICE').length,
            receipts: payments.filter(p => p.type === 'RECEIPT').length,
        };
        console.log('📊 Summary:');
        console.log(`   - ${summary.quotations} Quotations`);
        console.log(`   - ${summary.invoices} Invoices`);
        console.log(`   - ${summary.receipts} Receipts`);
        console.log('\n✅ Payment seeding completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedPayments();

