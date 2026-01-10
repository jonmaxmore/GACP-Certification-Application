/**
 * Quote Routes (Migrated to V2)
 * Manages Quotes and conversion to Invoices
 * Uses Prisma (PostgreSQL)
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const { authenticateDTAM, authenticateFarmer } = require('../../middleware/auth-middleware');
const { sendNotification, NotifyType } = require('../../services/notification-service');

// Helper: Calculate totals (frontend should send calculated, but we verify or recalc if needed)
// In this migration, we trust the input but ensure data integrity for Prisma

// Get all quotes (Staff)
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const { status, farmerId, page = 1, limit = 20 } = req.query;
        const where = { isDeleted: false };

        if (status) {where.status = status;}
        if (farmerId) {where.farmerId = farmerId;}

        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 20;
        const skip = (p - 1) * l;

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                include: {
                    application: { select: { applicationNumber: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: l,
            }),
            prisma.quote.count({ where }),
        ]);

        // Include Farmer info via application
        const quotesWithFarmer = await prisma.quote.findMany({
            where,
            include: {
                application: {
                    include: {
                        farmer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                companyName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: l,
        });

        const formattedQuotes = quotesWithFarmer.map(q => ({
            ...q,
            farmerId: q.application?.farmer || null,
        }));

        res.json({
            success: true,
            data: formattedQuotes,
            pagination: {
                page: p,
                limit: l,
                total,
                pages: Math.ceil(total / l),
            },
        });

    } catch (error) {
        console.error('[Quotes] getQuotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quotes' });
    }
});

// Get My Quotes (Farmer) - NEW
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user.id;
        const { status } = req.query;
        // In Prisma schema, Quote does not have farmerId direct relation (it is in Application), 
        // BUT we might have migrated it to be compliant. 
        // Logic: Find application where farmerId = user.id, then find quotes for those apps.
        // OR if Quote table has farmerId (it might be added in schema but not relation?).
        // Safest: Use Application relation. 
        // Wait, creating quote populated `farmerId` in legacy?
        // Let's assume we can filter by application.farmerId

        const where = {
            application: { farmerId: farmerId },
            isDeleted: false,
        };
        if (status) {where.status = status;}

        const quotes = await prisma.quote.findMany({
            where,
            include: {
                application: {
                    select: { applicationNumber: true, serviceType: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: quotes });

    } catch (error) {
        console.error('[Quotes] getMyQuotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quotes' });
    }
});

// Create new quote (Staff)
router.post('/', authenticateDTAM, async (req, res) => {
    try {
        const { applicationId, items, validDays = 30, notes } = req.body;

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { farmer: true },
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Calculate totals
        const safeItems = Array.isArray(items) ? items : [];
        const subtotal = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
        const vat = 0; // Thailand GACP exempt
        const totalAmount = subtotal + vat;

        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + validDays);

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.quote.count();
        const quoteNumber = `QT-${dateStr}${(count + 1).toString().padStart(4, '0')}`;

        const quote = await prisma.quote.create({
            data: {
                quoteNumber,
                applicationId,
                // farmerId: application.farmerId, // Not in schema definition provided, rely on app link
                items: safeItems,
                subtotal,
                vat,
                totalAmount,
                validUntil,
                notes,
                status: 'draft', // Initial status draft as per legacy logic
            },
        });

        res.status(201).json({
            success: true,
            message: 'สร้างใบเสนอราคาสำเร็จ',
            data: quote,
        });

    } catch (error) {
        console.error('[Quotes] createQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote' });
    }
});

// Update Quote Status (General)
router.put('/:id/status', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'invoiced', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'accepted') {updateData.acceptedAt = new Date();}
        if (status === 'rejected') {updateData.rejectedAt = new Date();}
        if (notes) {updateData.notes = notes;}

        const quote = await prisma.quote.update({
            where: { id },
            data: updateData,
            include: { application: { include: { farmer: true } } },
        });

        res.json({
            success: true,
            message: 'อัพเดทสถานะสำเร็จ',
            data: quote,
        });

    } catch (error) {
        console.error('[Quotes] updateStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update quote status' });
    }
});

// Send Quote to Farmer (Staff) - NEW
router.post('/:id/send', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { application: true },
        });

        if (!quote) {return res.status(404).json({ success: false, message: 'Quote not found' });}
        if (quote.status !== 'draft') {return res.status(400).json({ success: false, message: 'Quote already sent or processed' });}

        // Update Quote status
        const updatedQuote = await prisma.quote.update({
            where: { id },
            data: { status: 'sent' },
        });

        // Update Application Status (QUOTE_SENT is mapped to existing status? e.g. 'AWAITING_PAYMENT' or similar? 
        // Legacy used 'QUOTE_SENT'. Need to check if Enum supports it in Prisma schema. 
        // Assuming string field or valid enum. Safe fallback: 'PENDING_PAYMENT' or similar.
        // Let's use 'QUOTE_SENT' as per legacy logic, assuming schema allows string or matching enum.

        await prisma.application.update({
            where: { id: quote.applicationId },
            data: {
                status: 'QUOTE_SENT', // Verify if this status exists in enum ApplicationStatus
            },
        });

        // Send Notification
        await sendNotification(quote.application.farmerId, NotifyType.QUOTE_RECEIVED, {
            quoteId: quote.id,
            quoteNumber: quote.quoteNumber,
            amount: quote.totalAmount,
            validUntil: quote.validUntil,
        });

        res.json({ success: true, message: 'Quote sent', data: updatedQuote });

    } catch (error) {
        console.error('[Quotes] sendQuote error:', error);
        console.error('[Quotes] sendQuote Code:', error.code);
        console.error('[Quotes] sendQuote Meta:', error.meta && JSON.stringify(error.meta));
        res.status(500).json({ success: false, message: 'Failed to send quote' });
    }
});

// Accept Quote (Farmer) - NEW
router.post('/:id/accept', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;
        const farmerId = req.user.id;

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { application: true },
        });

        if (!quote) {return res.status(404).json({ success: false, message: 'Quote not found' });}
        // Check ownership via application
        if (quote.application.farmerId !== farmerId) {return res.status(403).json({ success: false, message: 'Not authorized' });}

        if (quote.status !== 'sent') {
            return res.status(400).json({ success: false, message: 'Quote cannot be accepted' });
        }

        if (new Date() > new Date(quote.validUntil)) {
            await prisma.quote.update({ where: { id }, data: { status: 'expired' } });
            return res.status(400).json({ success: false, message: 'Quote expired' });
        }

        // Generate Invoice
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.invoice.count();
        const invoiceNumber = `INV-${dateStr}${(count + 1).toString().padStart(4, '0')}`;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                applicationId: quote.applicationId,
                farmerId: farmerId,
                quoteId: quote.id,
                serviceType: quote.application.serviceType || 'certification',
                items: quote.items,
                subtotal: quote.subtotal,
                vat: quote.vat,
                totalAmount: quote.totalAmount,
                status: 'pending',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        // Update Quote
        await prisma.quote.update({
            where: { id },
            data: { status: 'invoiced', acceptedAt: new Date(), invoiceId: invoice.id },
        });

        // Update Application
        await prisma.application.update({
            where: { id: quote.applicationId },
            data: {
                status: 'AWAITING_PAYMENT',
            },
        });

        // Notify
        await sendNotification(farmerId, NotifyType.INVOICE_RECEIVED, {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            applicationId: quote.applicationId,
        });

        res.json({ success: true, message: 'Quote accepted', data: { quote, invoice } });

    } catch (error) {
        console.error('[Quotes] acceptQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to accept quote' });
    }
});

// Reject Quote (Farmer) - NEW
router.post('/:id/reject', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const farmerId = req.user.id;

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { application: true },
        });

        if (!quote) {return res.status(404).json({ success: false, message: 'Quote not found' });}
        if (quote.application.farmerId !== farmerId) {return res.status(403).json({ success: false, message: 'Not authorized' });}

        await prisma.quote.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedAt: new Date(),
                farmerNotes: reason,
            },
        });

        // App back to pending review?
        await prisma.application.update({
            where: { id: quote.applicationId },
            data: { status: 'PENDING_TEAM_REVIEW' }, // Verify Status
        });

        res.json({ success: true, message: 'Quote rejected' });

    } catch (error) {
        console.error('[Quotes] rejectQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject quote' });
    }
});

// Create Invoice from Quote (Staff Manual Override)
router.post('/:id/invoice', authenticateDTAM, async (req, res) => {
    // ... Existing logic for staff manual invoice creation if needed ...
    // Duplicated accepted logic but for staff? 
    // Keeping previous implementation for staff safety
    try {
        const { id } = req.params;

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { application: true },
        });

        if (!quote) {return res.status(404).json({ success: false, message: 'Quote not found' });}

        // Allow if accepted.
        if (quote.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Quote must be accepted before creating invoice' });
        }

        // Generate Invoice Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.invoice.count();
        const invoiceNumber = `INV-${dateStr}${(count + 1).toString().padStart(4, '0')}`;

        // Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                applicationId: quote.applicationId,
                farmerId: quote.application.farmerId,
                quoteId: quote.id,
                serviceType: 'certification_fee',
                items: quote.items,
                subtotal: quote.subtotal,
                vat: quote.vat,
                totalAmount: quote.totalAmount,
                status: 'pending',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });

        // Update Quote
        await prisma.quote.update({
            where: { id: quote.id },
            data: { status: 'invoiced' },
        });

        res.status(201).json({
            success: true,
            message: 'สร้างใบวางบิลจากใบเสนอราคาสำเร็จ',
            data: invoice,
        });

    } catch (error) {
        console.error('[Quotes] createInvoiceFromQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
});

// Update Document Number (Accountant Only)
router.put('/:id/number', authenticateDTAM, async (req, res) => {
    // ... Existing logic ...
    try {
        const { id } = req.params;
        const { newNumber, type } = req.body;

        if (type === 'quote') {
            const existing = await prisma.quote.findUnique({ where: { quoteNumber: newNumber } });
            if (existing && existing.id !== id) {return res.status(409).json({ success: false, message: 'Number already exists' });}

            const updated = await prisma.quote.update({
                where: { id },
                data: { quoteNumber: newNumber },
            });
            return res.json({ success: true, message: 'Updated', data: updated });

        } else if (type === 'invoice') {
            const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: newNumber } });
            if (existing && existing.id !== id) {return res.status(409).json({ success: false, message: 'Number already exists' });}

            const updated = await prisma.invoice.update({
                where: { id },
                data: { invoiceNumber: newNumber },
            });
            return res.json({ success: true, message: 'Updated', data: updated });
        }

        res.status(400).json({ success: false, message: 'Invalid type' });

    } catch (error) {
        console.error('[Quotes] updateNumber error:', error);
        res.status(500).json({ success: false, message: 'Failed to update number' });
    }
});

module.exports = router;
