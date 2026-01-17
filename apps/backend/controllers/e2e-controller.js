const { prisma } = require('../services/prisma-database');
const CertificateService = require('../services/certificate-service');
const crypto = require('crypto');

class E2EController {

    /**
     * Reset test data (Be careful!)
     * Only deletes data for specific test users or environments
     */
    async reset(req, res) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Not allowed in production' });
        }

        try {
            console.log('[E2E] Resetting Test Data...');

            const { farmerEmail, farmerIdCard } = req.body;

            let user;
            if (farmerEmail) {
                user = await prisma.user.findFirst({ where: { email: farmerEmail } });
            } else if (farmerIdCard) {
                // Calculate Hash to find User (since idCard might be encrypted)
                const idCardHash = crypto.createHash('sha256').update(farmerIdCard).digest('hex');

                user = await prisma.user.findFirst({
                    where: { idCardHash: idCardHash }
                });
            }

            if (user) {
                await prisma.invoice.deleteMany({ where: { farmerId: user.id } });
                await prisma.certificate.deleteMany({ where: { userId: user.id } });
                await prisma.plantingCycle.deleteMany({ where: { farm: { ownerId: user.id } } });
                await prisma.harvestBatch.deleteMany({ where: { farm: { ownerId: user.id } } });
                await prisma.application.deleteMany({ where: { farmerId: user.id } });
                await prisma.user.delete({ where: { id: user.id } }); // Also delete the user for Loop Test cleanliness!
                console.log(`[E2E] Cleared data for ${farmerEmail || farmerIdCard}`);
            }

            res.json({ success: true, message: 'Test data cleared' });
        } catch (error) {
            console.error('[E2E] Reset Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Force Approve Documents for Application
     * Transitions: SUBMITTED -> PAYMENT_2_PENDING
     */
    async approveDocuments(req, res) {
        const { id } = req.params;
        try {
            console.log(`[E2E] Approving Documents for App ${id}`);

            const app = await prisma.application.findUnique({ where: { id } });
            if (!app) return res.status(404).json({ error: 'Application not found' });

            // Simulate Staff Review
            await prisma.application.update({
                where: { id },
                data: {
                    status: 'PAYMENT_2_PENDING',
                    workflowHistory: {
                        push: {
                            action: 'DOC_APPROVED',
                            by: 'E2E_BOT',
                            at: new Date(),
                            note: 'Auto-approved by E2E Controller'
                        }
                    }
                }
            });

            // Check if Invoice 2 exists or generate it
            const existingInvoice = await prisma.invoice.findFirst({
                where: { applicationId: id, serviceType: 'AUDIT_FEE' }
            });

            if (!existingInvoice) {
                const year = new Date().getFullYear() + 543;
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                await prisma.invoice.create({
                    data: {
                        invoiceNumber: `INV-P2-${year}-${random}`,
                        applicationId: id,
                        farmerId: app.farmerId,
                        serviceType: 'AUDIT_FEE',
                        totalAmount: 25000,
                        subtotal: 25000,
                        status: 'pending',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        items: [{ description: 'ค่าธรรมเนียมการตรวจประเมิน (Audit Fee)', amount: 25000, quantity: 1 }],
                        notes: 'Auto-generated Phase 2 Invoice via E2E'
                    }
                });
            }

            res.json({ success: true, status: 'PAYMENT_2_PENDING' });

        } catch (error) {
            console.error('[E2E] Approve Doc Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Force Pass Audit and Certify
     * Transitions: ANY -> CERTIFIED
     */
    async passAudit(req, res) {
        const { id } = req.params;
        try {
            console.log(`[E2E] Passing Audit for App ${id}`);

            await prisma.application.update({
                where: { id },
                data: {
                    status: 'APPROVED', // Ready for Certification
                    auditResult: 'PASS',
                    auditNotes: 'Passed via E2E Automation',
                    workflowHistory: {
                        push: {
                            action: 'AUDIT_PASSED',
                            by: 'E2E_BOT',
                            at: new Date(),
                            note: 'Auto-passed audit by E2E Controller'
                        }
                    }
                }
            });

            // Generate Certificate
            const cert = await CertificateService.generateCertificate(id, 'E2E_BOT');

            // Update Application to CERTIFIED
            await prisma.application.update({
                where: { id },
                data: { status: 'CERTIFIED' }
            });

            res.json({ success: true, certificate: cert, status: 'CERTIFIED' });

        } catch (error) {
            console.error('[E2E] Pass Audit Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new E2EController();
