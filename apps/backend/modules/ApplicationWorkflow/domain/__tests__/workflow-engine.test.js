const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ApplicationWorkflowEngine = require('../workflow-engine');
const Application = require('../../../../../models/ApplicationModel');
const User = require('../../../../../models/UserModel');
const DTAMStaff = require('../../../auth-dtam/models/DTAMStaff');

// Mock Repositories (Simple wrappers for Mongoose models)
class MockRepository {
    constructor(model) {
        this.model = model;
    }
    async findById(id) { return this.model.findById(id); }
    async create(data) { return this.model.create(data); }
    async update(id, data) { return this.model.findByIdAndUpdate(id, { $set: data }, { new: true }); }
    async countToday() { return 0; } // Simplified
    async findActiveByFarmer(farmerId) {
        return this.model.find({
            farmerId,
            status: { $nin: ['rejected', 'certificate_issued', 'expired'] }
        });
    }
    async findRecentRejections(farmerId) { return []; }
    async findAll() { return this.model.find({}); }
    async findByFarmerId(farmerId) { return this.model.find({ farmerId }); }
}

class MockUserRepository {
    constructor(userModel, staffModel) {
        this.userModel = userModel;
        this.staffModel = staffModel;
    }
    async findById(id) {
        let user = await this.userModel.findById(id);
        if (!user) {
            user = await this.staffModel.findById(id);
        }
        return user;
    }
}

// Mock Services
const mockNotificationService = { send: jest.fn() };
const mockPaymentService = {
    generatePayment: jest.fn().mockResolvedValue({
        paymentUrl: 'http://mock-payment.com',
        qrCode: 'mock-qr',
        transactionId: 'mock-txn'
    })
};
const mockAuditService = { log: jest.fn() };
const mockJobTicketService = { create: jest.fn() };
const mockCertificateService = {
    generateCertificate: jest.fn().mockResolvedValue({
        id: new mongoose.Types.ObjectId(),
        certificateNumber: 'CERT-2025-001'
    })
};

describe('ApplicationWorkflowEngine Integration', () => {
    let mongoServer;
    let engine;
    let farmer;
    let auditor;
    let admin;

    beforeAll(async () => {
        console.log('Starting MongoMemoryServer...');
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        console.log('Connecting to Mongoose:', uri);
        await mongoose.connect(uri);
        console.log('Connected to Mongoose');
    });

    afterAll(async () => {
        console.log('Disconnecting Mongoose...');
        await mongoose.disconnect();
        await mongoServer.stop();
        console.log('Stopped MongoMemoryServer');
    });

    beforeEach(async () => {
        await Application.deleteMany({});
        await User.deleteMany({});
        await DTAMStaff.deleteMany({});

        // Setup Engine with Dependencies
        engine = new ApplicationWorkflowEngine({
            applicationRepository: new MockRepository(Application),
            userRepository: new MockUserRepository(User, DTAMStaff),
            documentRepository: {}, // Not used in core logic yet
            notificationService: mockNotificationService,
            paymentService: mockPaymentService,
            auditService: mockAuditService,
            jobTicketService: mockJobTicketService,
            certificateService: mockCertificateService,
        });

        // Create Test Users
        farmer = await User.create({
            firstName: 'Somchai', lastName: 'Farmer', email: 'farmer@test.com',
            role: 'FARMER', status: 'ACTIVE', isActive: true, verificationStatus: 'approved',
            phoneNumber: '0812345678',
            idCard: '1234567890123',
            laserCode: 'ME1234567890',
            password: 'password123',
            profile: { farmInfo: { name: 'Test Farm' } }
        });

        auditor = await DTAMStaff.create({
            username: 'auditor1', email: 'auditor@dtam.go.th', firstName: 'Auditor', lastName: 'One',
            role: 'auditor', userType: 'DTAM_STAFF', password: 'password123'
        });

        admin = await DTAMStaff.create({
            username: 'admin1', email: 'admin@dtam.go.th', firstName: 'Admin', lastName: 'One',
            role: 'admin', userType: 'DTAM_STAFF', password: 'password123'
        });
    });

    describe('New Application Flow', () => {
        it('should complete the full happy path', async () => {
            // 1. Create Application
            const appData = {
                type: 'NEW',
                userType: 'individual',
                farm: {
                    name: 'My Farm',
                    address: {
                        province: 'CHIANG_MAI',
                        district: 'Muang',
                        subdistrict: 'Suthep',
                        street: '123 Main St',
                        postalCode: '50200'
                    },
                    area: {
                        total: 10,
                        cultivated: 5
                    },
                    owner: 'Somchai Farmer',
                    farmType: 'ORGANIC',
                    coordinates: { latitude: 18.7, longitude: 98.9 }
                }
            };

            let app = await engine.createApplication(appData, farmer._id.toString());
            expect(app.status).toBe('draft');
            expect(app.applicationNumber).toBeDefined();

            // 2. Submit Application (Phase 1 Payment Required)
            // Mock documents
            app.documents = [
                { type: 'farm_license', url: 'doc1.pdf', uploadedAt: new Date() },
                { type: 'land_deed', url: 'doc2.pdf', uploadedAt: new Date() },
                { type: 'farmer_id', url: 'doc3.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'p1.jpg', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'p2.jpg', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'p3.jpg', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'p4.jpg', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'p5.jpg', uploadedAt: new Date() },
                { type: 'water_test_report', url: 'doc4.pdf', uploadedAt: new Date() }
            ];
            await Application.findByIdAndUpdate(app._id, { documents: app.documents });

            app = await engine.submitApplication(app._id.toString(), farmer._id.toString());
            // Should auto-transition to UNDER_REVIEW
            await new Promise(resolve => setTimeout(resolve, 1100));
            app = await Application.findById(app._id);
            expect(app.status).toBe('under_review');

            // 3. Reviewer Approves for Payment
            app = await engine.approveForPayment(app._id.toString(), auditor._id.toString(), { notes: 'Good' });
            expect(app.status).toBe('payment_pending');
            expect(mockPaymentService.generatePayment).toHaveBeenCalled();

            // 4. Confirm Phase 1 Payment
            app = await engine.confirmPayment(app._id.toString(), {
                phase: 1, amount: 5000, transactionId: 'TXN-1'
            });
            expect(app.status).toBe('payment_verified');

            // 5. Schedule Inspection (Officer/Auditor)
            // Workaround: Manually update state to INSPECTION_SCHEDULED to test inspection logic
            await Application.findByIdAndUpdate(app._id, { status: 'inspection_scheduled' });

            // 6. Complete Inspection
            const inspectionReport = {
                checklist: { item1: { passed: true }, item2: { passed: true } },
                findings: [],
                passed: true
            };
            app = await engine.completeInspection(app._id.toString(), auditor._id.toString(), inspectionReport);
            expect(app.status).toBe('inspection_completed');

            // 7. Auto-transition to Phase 2 Payment
            await new Promise(resolve => setTimeout(resolve, 1100));
            app = await Application.findById(app._id);
            expect(app.status).toBe('phase2_payment_pending');

            // 8. Confirm Phase 2 Payment
            app = await engine.confirmPayment(app._id.toString(), {
                phase: 2, amount: 25000, transactionId: 'TXN-2'
            });
            expect(app.status).toBe('phase2_payment_verified');

            // 9. Final Approval
            app = await engine.finalApproval(app._id.toString(), admin._id.toString(), {
                signature: 'admin-sig', notes: 'Approved'
            });
            expect(app.status).toBe('approved');

            // 10. Certificate Issuance
            await new Promise(resolve => setTimeout(resolve, 2000));
            app = await Application.findById(app._id);
            expect(app.status).toBe('certificate_issued');
            expect(app.certificateId).toBeDefined();
        });
    });

    describe('Penalty Logic', () => {
        it('should trigger penalty after 3 revisions', async () => {
            // Create and Submit
            const appData = {
                type: 'NEW',
                userType: 'individual',
                farm: {
                    name: 'Penalty Farm',
                    address: {
                        province: 'CHIANG_MAI',
                        district: 'Muang',
                        subdistrict: 'Suthep',
                        street: '123 Main St',
                        postalCode: '50200'
                    },
                    area: { total: 10, cultivated: 5 },
                    owner: 'Somchai Farmer',
                    farmType: 'ORGANIC',
                    coordinates: { latitude: 18.7, longitude: 98.9 }
                }
            };
            let app = await engine.createApplication(appData, farmer._id.toString());
            // Mock docs
            app.documents = [
                { type: 'farm_license', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'land_deed', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farmer_id', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'farm_photos', url: 'd.pdf', uploadedAt: new Date() },
                { type: 'water_test_report', url: 'd.pdf', uploadedAt: new Date() }
            ];
            await Application.findByIdAndUpdate(app._id, { documents: app.documents });

            app = await engine.submitApplication(app._id.toString(), farmer._id.toString());
            await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for auto-review

            // Revision 1
            app = await engine.requestRevision(app._id.toString(), auditor._id.toString(), { reasons: ['Fix 1'], notes: 'Note 1' });
            expect(app.status).toBe('revision_required');
            expect(app.revisionCount).toBe(1);

            // Resubmit 1
            app = await engine.submitApplication(app._id.toString(), farmer._id.toString());
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Revision 2
            app = await engine.requestRevision(app._id.toString(), auditor._id.toString(), { reasons: ['Fix 2'], notes: 'Note 2' });
            expect(app.revisionCount).toBe(2);

            // Resubmit 2
            app = await engine.submitApplication(app._id.toString(), farmer._id.toString());
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Revision 3 (Should trigger penalty)
            app = await engine.requestRevision(app._id.toString(), auditor._id.toString(), { reasons: ['Fix 3'], notes: 'Note 3' });
            expect(app.status).toBe('penalty_payment_pending');
            expect(app.payment.penalty).toBeDefined();
            expect(mockPaymentService.generatePayment).toHaveBeenCalled();
        });
    });

    describe('Renewal Application Flow', () => {
        let originalCertId;

        beforeEach(async () => {
            originalCertId = new mongoose.Types.ObjectId();
        });

        it('should process replacement application successfully', async () => {
            const appData = {
                type: 'REPLACEMENT',
                userType: 'individual',
                previousCertificateId: originalCertId,
                replacementDetails: {
                    reason: 'lost',
                    evidence: ['police_report.pdf']
                },
                farm: {
                    name: 'My Farm',
                    address: {
                        province: 'CHIANG_MAI',
                        district: 'Muang',
                        subdistrict: 'Suthep',
                        street: '123 Main St',
                        postalCode: '50200'
                    },
                    area: { total: 10, cultivated: 5 },
                    owner: 'Somchai Farmer',
                    farmType: 'ORGANIC',
                    coordinates: { latitude: 18.7, longitude: 98.9 }
                }
            };

            let app = await engine.createApplication(appData, farmer._id.toString());
            expect(app.type).toBe('REPLACEMENT');
            expect(app.status).toBe('draft');

            // Mock documents - Must include 'police_report' as per validation
            app.documents = [
                { type: 'police_report', url: 'police_report.pdf', uploadedAt: new Date() }
            ];
            await Application.findByIdAndUpdate(app._id, { documents: app.documents });

            app = await engine.submitApplication(app._id.toString(), farmer._id.toString());
            await new Promise(resolve => setTimeout(resolve, 1100));
            app = await Application.findById(app._id);

            // Should be REPLACEMENT_PAYMENT_PENDING (auto-transitioned)
            expect(app.status).toBe('replacement_payment_pending');

            // Pay Replacement Fee
            app = await engine.confirmPayment(app._id.toString(), {
                phase: 'REPLACEMENT', amount: 500, transactionId: 'TXN-REP-1'
            });
            expect(app.status).toBe('replacement_admin_check');

            // Admin Approval
            app = await engine.finalApproval(app._id.toString(), admin._id.toString(), {
                signature: 'AdminSig', notes: 'Replacement Approved'
            });
            expect(app.status).toBe('approved');

            // Certificate Issued
            await new Promise(resolve => setTimeout(resolve, 2000));
            app = await Application.findById(app._id);
            expect(app.status).toBe('certificate_issued');
        });
    });
});
