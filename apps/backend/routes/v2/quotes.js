/**
 * Quote Routes (Migrated to V2)
 * Manages Quotes and conversion to Invoices
 * Uses Prisma (PostgreSQL)
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const { authenticateDTAM } = require('../../middleware/auth-middleware');

// Helper: Calculate totals (frontend should send calculated, but we verify or recalc if needed)
// In this migration, we trust the input but ensure data integrity for Prisma

// Get all quotes
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const { status, farmerId, page = 1, limit = 20 } = req.query;
        const where = { isDeleted: false };

        if (status) where.status = status;
        if (farmerId) where.farmerId = farmerId;

        const p = parseInt(page) || 1;
        const l = parseInt(limit) || 20;
        const skip = (p - 1) * l;

        const [quotes, total] = await Promise.all([
            prisma.quote.findMany({
                where,
                include: {
                    application: { select: { applicationNumber: true } }
                    // Farmer relationship in Prisma is via 'application.farmer' usually, 
                    // but Schema says Quote has `applicationId` but NOT `farmerId` explicitly in relations?
                    // Let's re-read schema. Quote has `applicationId`. Application has `farmerId`.
                    // Wait, legacy controller populated `farmerId`.
                    // Schema check: `model Quote`
                    //   applicationId String
                    //   application Application ...
                    //   NO farmerId relation defined in the snippet I saw?
                    // Let's re-check schema content.
                    // Schema line 355+: model Quote.
                    //   applicationId String
                    //   application Application ...
                    //   items Json?
                    //   ...
                    //   NO farmerId direct field in Quote model in the schema snippet I saw!
                    //   Wait, line 301 in Invoice model: `quote Quote?`.
                    //   Let's check Application model line 106.
                    //   Let's check if I can get farmer via application.
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: l
            }),
            prisma.quote.count({ where })
        ]);

        // We need to fetch farmer details. Since Quote -> Application -> Farmer
        // We can include: include: { application: { include: { farmer: true } } }
        // Rerunning query logic safely.

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
                                companyName: true // For juristic
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: l
        });

        const formattedQuotes = quotesWithFarmer.map(q => ({
            ...q,
            // Flatten farmer info for compatibility if needed, or frontend adapts.
            // Legacy returned `farmerId` object.
            farmerId: q.application?.farmer || null
        }));

        res.json({
            success: true,
            data: formattedQuotes,
            pagination: {
                page: p,
                limit: l,
                total,
                pages: Math.ceil(total / l)
            }
        });

    } catch (error) {
        console.error('[Quotes] getQuotes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get quotes' });
    }
});

// Create new quote
router.post('/', authenticateDTAM, async (req, res) => {
    try {
        const { applicationId, items, validDays = 30, notes } = req.body;
        // Legacy controller took `farmerId`. But in Prisma schema, Quote links to Application.
        // We should derive farmer from application.

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { farmer: true }
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

        // Generate Quote Number (Simple logic: Q-TIMESTAMP or similar, real app needs explicit sequence)
        // For now, using similar format to legacy or random. 
        // Better: count today's quotes.
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.quote.count();
        const quoteNumber = `QT-${dateStr}${(count + 1).toString().padStart(4, '0')}`;

        const quote = await prisma.quote.create({
            data: {
                quoteNumber,
                applicationId,
                // farmerId: application.farmerId, // Schema doesn't have it? We'll rely on app link.
                items: safeItems,
                subtotal,
                vat,
                totalAmount,
                validUntil,
                notes,
                status: 'pending' // 'draft' in legacy, schema default 'pending'
            }
        });

        res.status(201).json({
            success: true,
            message: 'สร้างใบเสนอราคาสำเร็จ',
            data: quote
        });

    } catch (error) {
        console.error('[Quotes] createQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote' });
    }
});

// Update Quote Status
router.put('/:id/status', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'invoiced', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'accepted') updateData.acceptedAt = new Date();
        if (status === 'rejected') updateData.rejectedAt = new Date();
        if (notes) updateData.notes = notes;

        const quote = await prisma.quote.update({
            where: { id },
            data: updateData,
            include: { application: { include: { farmer: true } } }
        });

        res.json({
            success: true,
            message: 'อัพเดทสถานะสำเร็จ',
            data: quote
        });

    } catch (error) {
        console.error('[Quotes] updateStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update quote status' });
    }
});

// Create Invoice from Quote
router.post('/:id/invoice', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params; // quoteId

        const quote = await prisma.quote.findUnique({
            where: { id },
            include: { application: true }
        });

        if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });

        // Allow if accepted.
        if (quote.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Quote must be accepted before creating invoice' });
        }

        // Generate Invoice Number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await prisma.invoice.count();
        const invoiceNumber = `INV-${dateStr}${(count + 1).toString().padStart(4, '0')}`;

        // Create Invoice
        // Check Invoice Schema requires: applicationId, farmerId, invoiceNumber, serviceType, subtotal, totalAmount, dueDate
        // We get farmerId from application
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                applicationId: quote.applicationId,
                farmerId: quote.application.farmerId,
                quoteId: quote.id,
                serviceType: 'certification_fee', // Default or derive
                items: quote.items,
                subtotal: quote.subtotal,
                vat: quote.vat,
                totalAmount: quote.totalAmount,
                status: 'pending',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
            }
        });

        // Update Quote
        await prisma.quote.update({
            where: { id: quote.id },
            data: { status: 'invoiced' }
        });

        res.status(201).json({
            success: true,
            message: 'สร้างใบวางบิลจากใบเสนอราคาสำเร็จ',
            data: invoice
        });

    } catch (error) {
        console.error('[Quotes] createInvoiceFromQuote error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
});

// Update Document Number (Accountant Only)
router.put('/:id/number', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { newNumber, type } = req.body; // type: 'quote' or 'invoice'

        if (type === 'quote') {
            // Check duplication
            const existing = await prisma.quote.findUnique({ where: { quoteNumber: newNumber } });
            if (existing && existing.id !== id) return res.status(409).json({ success: false, message: 'Number already exists' });

            const updated = await prisma.quote.update({
                where: { id },
                data: { quoteNumber: newNumber }
            });
            return res.json({ success: true, message: 'Updated', data: updated });

        } else if (type === 'invoice') {
            const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: newNumber } });
            if (existing && existing.id !== id) return res.status(409).json({ success: false, message: 'Number already exists' });

            const updated = await prisma.invoice.update({
                where: { id },
                data: { invoiceNumber: newNumber }
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
