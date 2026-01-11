const PDFDocument = require('pdfkit');

class PdfService {
    /**
     * Generates a PDF invoice/receipt buffer
     * @param {Object} invoice - Invoice data (prisma model)
     * @returns {Promise<Buffer>}
     */
    async generateInvoicePdf(invoice) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // -- Header --
                this.generateHeader(doc, invoice);

                // -- Customer Details --
                this.generateCustomerInformation(doc, invoice);

                // -- Table --
                this.generateInvoiceTable(doc, invoice);

                // -- Footer --
                this.generateFooter(doc, invoice);

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    generateHeader(doc, invoice) {
        // Logo (Placeholder if no file)
        // doc.image('logo.png', 50, 45, { width: 50 })

        const isReceipt = invoice.status === 'paid';
        const title = isReceipt ? 'RECEIPT / ใบเสร็จรับเงิน' : 'INVOICE / ใบแจ้งหนี้';

        doc.fillColor('#444444')
            .fontSize(20)
            .text(title, 50, 57)
            .fontSize(10)
            .text('Department of Thai Traditional and Alternative Medicine', 200, 50, { align: 'right' })
            .text('88/23 Tiwanon Road, Talat Khwan', 200, 65, { align: 'right' })
            .text('Mueang, Nonthaburi 11000', 200, 80, { align: 'right' })
            .moveDown();
    }

    generateCustomerInformation(doc, invoice) {
        doc.fillColor('#444444')
            .fontSize(20)
            .text(isReceipt(invoice) ? 'To:' : 'Invoice To:', 50, 160);

        this.generateHr(doc, 185);

        const customerName = invoice.application?.farmer?.firstName
            ? `${invoice.application.farmer.firstName} ${invoice.application.farmer.lastName}`
            : 'N/A';

        const customerAddress = invoice.application?.farmer?.address || 'N/A';

        const customerInformationTop = 200;

        doc.fontSize(10)
            .text('Invoice Number:', 50, customerInformationTop)
            .font('Helvetica-Bold')
            .text(invoice.invoiceNumber, 150, customerInformationTop)
            .font('Helvetica')
            .text('Invoice Date:', 50, customerInformationTop + 15)
            .text(formatDate(invoice.createdAt), 150, customerInformationTop + 15)
            .text('Total Amount:', 50, customerInformationTop + 30)
            .text(formatCurrency(invoice.totalAmount), 150, customerInformationTop + 30)

            .font('Helvetica-Bold')
            .text(customerName, 300, customerInformationTop)
            .font('Helvetica')
            .text(customerAddress, 300, customerInformationTop + 15)
            .moveDown();

        this.generateHr(doc, 252);
    }

    /**
     * Generates a GACP Certificate PDF buffer
     * @param {Object} certificate - Certificate data
     * @returns {Promise<Buffer>}
     */
    async generateCertificatePdf(certificate) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                // -- Border --
                doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                    .lineWidth(3)
                    .stroke('#10b981'); // Emerald

                doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
                    .lineWidth(1)
                    .stroke('#d1fae5'); // Light Emerald

                // -- Header --
                doc.moveDown(2);
                doc.font('Helvetica-Bold').fontSize(24).fillColor('#065f46')
                    .text('CERTIFICATE OF COMPLIANCE', { align: 'center' });

                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(12).fillColor('#374151')
                    .text('Thailand Good Agricultural and Collection Practices (GACP)', { align: 'center' });

                doc.moveDown(2);

                // -- Body --
                doc.fontSize(14).text('This is to certify that', { align: 'center' });

                doc.moveDown(1);
                doc.font('Helvetica-Bold').fontSize(28).fillColor('#000000')
                    .text(certificate.farmerName, { align: 'center' });

                doc.moveDown(1);
                doc.font('Helvetica').fontSize(14).fillColor('#374151')
                    .text('has successfully demonstrated compliance with the standards for', { align: 'center' });

                doc.moveDown(0.5);
                doc.font('Helvetica-Bold').fontSize(20)
                    .text(certificate.cropType || 'Medicinal Plants', { align: 'center' });

                // -- Details Table --
                doc.moveDown(2);
                const startX = 150;
                let currentY = doc.y;

                const drawRow = (label, value) => {
                    doc.font('Helvetica-Bold').fontSize(11).text(label, startX, currentY);
                    doc.font('Helvetica').text(value, startX + 150, currentY);
                    currentY += 20;
                };

                drawRow('Certificate Number:', certificate.certificateNumber);
                drawRow('Farm Name:', certificate.farmName);
                drawRow('Location:', `${certificate.province}, ${certificate.address}`);
                drawRow('Issued Date:', formatDate(certificate.issuedDate));
                drawRow('Valid Until:', formatDate(certificate.expiryDate));

                // -- Signature --
                doc.moveDown(4);
                const signatureY = doc.page.height - 120;

                doc.moveTo(doc.page.width / 2 - 100, signatureY)
                    .lineTo(doc.page.width / 2 + 100, signatureY)
                    .strokeColor('#000000').lineWidth(1).stroke();

                doc.fontSize(10).text('Authorized Signature', doc.page.width / 2 - 100, signatureY + 10, { width: 200, align: 'center' });
                doc.fontSize(10).text('Department of Thai Traditional and Alternative Medicine', doc.page.width / 2 - 150, signatureY + 25, { width: 300, align: 'center' });

                // -- QR Code Placeholder --
                doc.rect(doc.page.width - 120, doc.page.height - 120, 80, 80).stroke();
                doc.fontSize(8).text('Scan to Verify', doc.page.width - 120, doc.page.height - 35, { width: 80, align: 'center' });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    generateInvoiceTable(doc, invoice) {
        let i;
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Item',
            'Description',
            'Unit Cost',
            'Quantity',
            'Line Total',
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        // Static item based on serviceType for now, assuming 1 item per invoice
        const itemDescription = invoice.serviceType === 'APPLICATION_FEE' ? 'Application Fee' : 'Audit Fee';

        const position = invoiceTableTop + 30;
        this.generateTableRow(
            doc,
            position,
            '1',
            itemDescription,
            formatCurrency(invoice.totalAmount),
            '1',
            formatCurrency(invoice.totalAmount),
        );

        this.generateHr(doc, position + 20);

        const subtotalPosition = position + 30;
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            'Subtotal',
            '',
            '',
            formatCurrency(invoice.totalAmount),
        );

        const paidToDatePosition = subtotalPosition + 20;
        this.generateTableRow(
            doc,
            paidToDatePosition,
            '',
            'Total',
            '',
            '',
            formatCurrency(invoice.totalAmount),
        );
    }

    generateFooter(doc, invoice) {
        doc.fontSize(10)
            .text(
                'Payment is due within 7 days. Thank you for your business.',
                50,
                780,
                { align: 'center', width: 500 },
            );
    }

    generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
        doc.fontSize(10)
            .text(item, 50, y)
            .text(description, 150, y)
            .text(unitCost, 280, y, { width: 90, align: 'right' })
            .text(quantity, 370, y, { width: 90, align: 'right' })
            .text(lineTotal, 0, y, { align: 'right' });
    }

    generateHr(doc, y) {
        doc.strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }
}

function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatCurrency(amount) {
    return 'THB ' + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function isReceipt(invoice) {
    return invoice.status === 'paid';
}

module.exports = new PdfService();
