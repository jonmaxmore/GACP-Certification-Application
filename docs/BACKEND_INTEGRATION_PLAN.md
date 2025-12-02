# Backend Integration Plan - Phase 5

**Date**: October 22, 2025  
**Status**: Planning  
**Current**: Frontend (Mock Data) ✅ | Backend (Existing) ⚠️

---

## 📊 Current State Analysis

### Frontend Status: ✅ Complete

- **18 Pages** created (~7,950 lines)
- **Mock Authentication** via AuthContext
- **Mock Data** via ApplicationContext
- **No Backend Connection** (all data in React state)

### Backend Status: ⚠️ Existing but Needs Updates

- **Server**: Express.js running on port 5000
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT-based (routes/auth.js)
- **File Upload**: Multer configured
- **Routes Exist**:
  - ✅ `/api/auth` (login, register)
  - ✅ `/api/applications` (CRUD)
  - ⚠️ `/api/inspections` (commented out)
  - ⚠️ `/api/notifications` (commented out)
  - ⚠️ Document upload endpoints

---

## 🎯 Integration Goals

### Primary Objectives:

1. **Replace Mock Authentication** with real JWT auth
2. **Connect ApplicationContext** to backend API
3. **Implement File Upload** for documents/photos
4. **Add Missing Endpoints** for review/inspection/approval
5. **Real-time Updates** via Socket.IO (optional)

### Success Criteria:

- ✅ Login/Register works with real database
- ✅ Applications persist across page refreshes
- ✅ Documents upload to server storage
- ✅ Workflow state changes save to database
- ✅ All 4 roles can perform their tasks end-to-end

---

## 🗺️ Integration Roadmap

### Phase 5A: Authentication (2-3 hours)

**Priority**: 🔥 **CRITICAL**

**Tasks**:

1. **Update AuthContext** (`frontend-nextjs/src/contexts/AuthContext.tsx`):

   ```typescript
   // Replace mock login with API call
   const login = async (email: string, password: string) => {
     const response = await fetch('http://localhost:5000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password })
     });
     const data = await response.json();
     if (data.success) {
       setUser(data.data.user);
       localStorage.setItem('token', data.data.token);
       return data.data.user;
     }
     throw new Error(data.message);
   };
   ```

2. **Create API Client** (`frontend-nextjs/src/lib/api-client.ts`):

   ```typescript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

   export const apiClient = {
     get: (url: string) =>
       fetch(`${API_URL}${url}`, {
         headers: {
           Authorization: `Bearer ${localStorage.getItem('token')}`
         }
       }),
     post: (url: string, data: any) =>
       fetch(`${API_URL}${url}`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${localStorage.getItem('token')}`
         },
         body: JSON.stringify(data)
       })
     // ... put, delete
   };
   ```

3. **Update Backend Auth Routes**:
   - Check `/apps/backend/routes/auth.js`
   - Ensure roles match: FARMER, DTAM_OFFICER, INSPECTOR, ADMIN
   - Test login/register endpoints

4. **Environment Variables**:
   ```bash
   # frontend-nextjs/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

**Testing**:

- [ ] Register new user → saves to MongoDB
- [ ] Login with valid credentials → returns JWT token
- [ ] Login with invalid credentials → returns error
- [ ] Refresh page → restore user from token
- [ ] Logout → clears token

---

### Phase 5B: Applications API (3-4 hours)

**Priority**: 🔥 **HIGH**

**Tasks**:

1. **Review Existing Application Model** (`apps/backend/models/application.js` or similar):
   - Check schema matches frontend Application interface
   - Add missing fields:
     - `workflowState` (enum)
     - `currentStep` (number 1-8)
     - `reviewData` (object)
     - `inspectionData` (object)
     - `approvalData` (object)
     - `documents` (array)
     - `payments` (array)

2. **Update Application Routes** (`apps/backend/routes/applications.js`):
   - ✅ POST `/api/applications` - Create application
   - ✅ GET `/api/applications` - List with filters
   - ✅ GET `/api/applications/:id` - Get single
   - ✅ PUT `/api/applications/:id` - Update
   - ⚠️ Add workflow-specific endpoints:
     - POST `/api/applications/:id/documents` - Upload documents
     - POST `/api/applications/:id/payment` - Submit payment
     - POST `/api/applications/:id/review` - Officer review
     - POST `/api/applications/:id/inspection/vdo-call` - VDO Call
     - POST `/api/applications/:id/inspection/on-site` - On-Site
     - POST `/api/applications/:id/approve` - Admin approval

3. **Update ApplicationContext** (`frontend-nextjs/src/contexts/ApplicationContext.tsx`):

   ```typescript
   // Replace mock data with API calls
   const createApplication = async (farmInfo, farmerInfo) => {
     const response = await apiClient.post('/applications', {
       farmInfo,
       farmerInfo
     });
     const newApp = response.data.application;
     setApplications(prev => [...prev, newApp]);
     return newApp;
   };

   const updateApplication = async updatedApp => {
     const response = await apiClient.put(`/applications/${updatedApp.id}`, updatedApp);
     setApplications(prev =>
       prev.map(app => (app.id === updatedApp.id ? response.data.application : app))
     );
   };

   const fetchApplications = async () => {
     const response = await apiClient.get('/applications');
     setApplications(response.data.applications);
   };
   ```

4. **Application Service** (Backend):
   ```javascript
   // apps/backend/services/gacp-application.js
   class GACPApplicationService {
     async createApplication(userId, data) {
       const application = new Application({
         applicant: userId,
         farmInfo: data.farmInfo,
         farmerInfo: data.farmerInfo,
         workflowState: 'DRAFT',
         currentStep: 1,
         submittedAt: new Date()
       });
       await application.save();
       return application;
     }

     async updateWorkflowState(applicationId, newState, step, data) {
       const application = await Application.findById(applicationId);
       application.workflowState = newState;
       application.currentStep = step;
       if (data.reviewData) application.reviewData = data.reviewData;
       if (data.inspectionData) application.inspectionData = data.inspectionData;
       if (data.approvalData) application.approvalData = data.approvalData;
       await application.save();
       return application;
     }
   }
   ```

**Testing**:

- [ ] Create application → saves to MongoDB
- [ ] Fetch applications → returns from database
- [ ] Update application → persists changes
- [ ] Refresh page → data still there
- [ ] Filter by status → works correctly
- [ ] Pagination → works correctly

---

### Phase 5C: File Upload (2-3 hours)

**Priority**: 🟡 **MEDIUM**

**Tasks**:

1. **Backend File Upload Route**:

   ```javascript
   // apps/backend/routes/applications.js
   router.post('/:id/documents/upload', authenticate, upload.single('file'), async (req, res) => {
     const { documentType } = req.body;
     const fileUrl = `/storage/documents/${req.file.filename}`;

     const application = await Application.findById(req.params.id);
     application.documents.push({
       type: documentType,
       url: fileUrl,
       filename: req.file.originalname,
       uploadedAt: new Date()
     });
     await application.save();

     res.json({ success: true, url: fileUrl });
   });
   ```

2. **Frontend File Upload Component**:

   ```typescript
   // Update document upload page
   const handleFileUpload = async (file: File, documentType: string) => {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('documentType', documentType);

     const response = await fetch(`${API_URL}/applications/${applicationId}/documents/upload`, {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${localStorage.getItem('token')}`
       },
       body: formData
     });

     const data = await response.json();
     return data.url;
   };
   ```

3. **Static File Serving** (Backend):
   ```javascript
   // apps/backend/server.js
   app.use('/storage', express.static(path.join(__dirname, 'storage')));
   ```

**Testing**:

- [ ] Upload PDF → saves to storage/documents/
- [ ] Upload Image → saves correctly
- [ ] File size limit → rejects >10MB
- [ ] Invalid file type → rejects
- [ ] Download file → URL works

---

### Phase 5D: Review/Inspection Endpoints (3-4 hours)

**Priority**: 🟡 **MEDIUM**

**Tasks**:

1. **Officer Review Endpoint**:

   ```javascript
   // POST /api/applications/:id/review
   router.post('/:id/review', authenticate, authorize(['dtam_officer']), async (req, res) => {
     const { completeness, accuracy, riskLevel, comments, documents, decision } = req.body;

     const application = await Application.findById(req.params.id);

     application.reviewData = {
       completeness,
       accuracy,
       riskLevel,
       comments,
       documents,
       reviewedAt: new Date(),
       reviewedBy: req.user.id
     };

     // Update workflow state based on decision
     if (decision === 'approve') {
       application.workflowState = 'DOCUMENT_APPROVED';
       application.currentStep = 4;
     } else if (decision === 'revision') {
       application.workflowState = 'DOCUMENT_REVISION';
     } else if (decision === 'reject') {
       application.workflowState = 'DOCUMENT_REJECTED';
     }

     await application.save();
     res.json({ success: true, application });
   });
   ```

2. **VDO Call Inspection Endpoint**:

   ```javascript
   // POST /api/applications/:id/inspection/vdo-call
   router.post(
     '/:id/inspection/vdo-call',
     authenticate,
     authorize(['inspector']),
     async (req, res) => {
       const { checklist, decision, notes, photos } = req.body;

       const application = await Application.findById(req.params.id);

       application.inspectionData = {
         type: 'VDO_CALL',
         checklist,
         decision,
         notes,
         photos,
         inspectedAt: new Date(),
         inspectedBy: req.user.id
       };

       if (decision === 'sufficient') {
         application.workflowState = 'INSPECTION_COMPLETED';
         application.currentStep = 7;
       } else {
         application.workflowState = 'INSPECTION_ON_SITE';
       }

       await application.save();
       res.json({ success: true, application });
     }
   );
   ```

3. **On-Site Inspection Endpoint**:

   ```javascript
   // POST /api/applications/:id/inspection/on-site
   router.post(
     '/:id/inspection/on-site',
     authenticate,
     authorize(['inspector']),
     async (req, res) => {
       const { ccps, totalScore, passStatus, finalNotes } = req.body;

       const application = await Application.findById(req.params.id);

       application.inspectionData = {
         type: 'ON_SITE',
         ccps,
         totalScore,
         passStatus,
         finalNotes,
         inspectedAt: new Date(),
         inspectedBy: req.user.id
       };

       application.workflowState = 'INSPECTION_COMPLETED';
       application.currentStep = 7;

       await application.save();
       res.json({ success: true, application });
     }
   );
   ```

4. **Admin Approval Endpoint**:
   ```javascript
   // POST /api/applications/:id/approve
   router.post('/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
     const { decision, notes } = req.body;

     const application = await Application.findById(req.params.id);

     application.approvalData = {
       decision,
       notes,
       approvedAt: new Date(),
       approvedBy: req.user.id
     };

     if (decision === 'approve') {
       application.workflowState = 'APPROVED';
       application.currentStep = 8;
       // Trigger certificate generation
       await CertificateService.generateCertificate(application);
     } else if (decision === 'reject') {
       application.workflowState = 'REJECTED';
     }

     await application.save();
     res.json({ success: true, application });
   });
   ```

**Testing**:

- [ ] Officer reviews → reviewData saves
- [ ] Inspector VDO Call → inspectionData saves
- [ ] Inspector On-Site → 8 CCPs save correctly
- [ ] Admin approves → triggers certificate generation
- [ ] Workflow states update correctly

---

### Phase 5E: Certificate Generation (2 hours)

**Priority**: 🟢 **LOW** (can be Phase 6)

**Tasks**:

1. **Certificate Service** (Backend):

   ```javascript
   // apps/backend/services/certificate-service.js
   const PDFDocument = require('pdfkit');
   const QRCode = require('qrcode');

   class CertificateService {
     async generateCertificate(application) {
       const certificateNumber = `GACP-${new Date().getFullYear()}-${String(application.id).slice(-4)}`;

       const certificate = new Certificate({
         applicationId: application._id,
         certificateNumber,
         farmName: application.farmInfo.name,
         farmerName: application.farmerInfo.name,
         score: application.inspectionData.totalScore,
         issuedAt: new Date(),
         expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
       });

       await certificate.save();

       // Generate PDF
       await this.generatePDF(certificate, application);

       return certificate;
     }

     async generatePDF(certificate, application) {
       const doc = new PDFDocument();
       const pdfPath = path.join(
         __dirname,
         '..',
         'storage',
         'certificates',
         `${certificate.certificateNumber}.pdf`
       );

       doc.pipe(fs.createWriteStream(pdfPath));

       // Header
       doc.fontSize(20).text('GACP Certificate', { align: 'center' });
       doc.moveDown();

       // Certificate Number
       doc.fontSize(12).text(`Certificate No: ${certificate.certificateNumber}`);

       // Farm Info
       doc.text(`Farm: ${certificate.farmName}`);
       doc.text(`Farmer: ${certificate.farmerName}`);
       doc.text(`Score: ${certificate.score}/100`);

       // QR Code
       const qrCodeData = await QRCode.toDataURL(certificate.certificateNumber);
       doc.image(qrCodeData, { width: 100 });

       doc.end();
     }
   }
   ```

**Testing**:

- [ ] Certificate generates on approval
- [ ] PDF creates correctly
- [ ] QR code works
- [ ] Certificate visible in admin page

---

### Phase 5F: Real-time Updates (Optional - 2 hours)

**Priority**: 🟢 **OPTIONAL**

**Tasks**:

1. **Backend Socket.IO**:

   ```javascript
   // apps/backend/services/socket-service.js
   io.on('connection', socket => {
     socket.on('join-application', applicationId => {
       socket.join(`app-${applicationId}`);
     });
   });

   // Emit on workflow state change
   const notifyWorkflowChange = (applicationId, newState) => {
     io.to(`app-${applicationId}`).emit('workflow-updated', { newState });
   };
   ```

2. **Frontend Socket Client**:

   ```typescript
   // frontend-nextjs/src/lib/socket-client.ts
   import io from 'socket.io-client';

   export const socket = io('http://localhost:5000', {
     auth: { token: localStorage.getItem('token') }
   });

   // In ApplicationContext
   useEffect(() => {
     socket.on('workflow-updated', ({ newState }) => {
       setApplications(prev =>
         prev.map(app =>
           app.workflowState === newState ? { ...app, workflowState: newState } : app
         )
       );
     });
   }, []);
   ```

---

## 🗂️ Database Schema Updates

### Application Model

```javascript
// apps/backend/models/application.js
const applicationSchema = new Schema({
  // Existing fields
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicationNumber: { type: String, unique: true, required: true },

  // Farm Information
  farmInfo: {
    name: String,
    size: Number,
    cropType: String,
    province: String,
    address: String
  },

  // Farmer Information
  farmerInfo: {
    name: String,
    nationalId: String,
    phone: String,
    email: String,
    experience: Number
  },

  // Workflow Management
  workflowState: {
    type: String,
    enum: [
      'DRAFT',
      'PAYMENT_PROCESSING_1',
      'DOCUMENT_REVIEW',
      'DOCUMENT_REVISION',
      'DOCUMENT_APPROVED',
      'DOCUMENT_REJECTED',
      'PAYMENT_PROCESSING_2',
      'INSPECTION_SCHEDULED',
      'INSPECTION_VDO_CALL',
      'INSPECTION_ON_SITE',
      'INSPECTION_COMPLETED',
      'PENDING_APPROVAL',
      'APPROVED',
      'REJECTED',
      'CERTIFICATE_ISSUED'
    ],
    default: 'DRAFT'
  },
  currentStep: { type: Number, min: 1, max: 8, default: 1 },

  // Documents
  documents: [
    {
      type: {
        type: String,
        enum: ['ID_CARD', 'HOUSE_REGISTRATION', 'LAND_DEED', 'FARM_MAP', 'WATER_PERMIT']
      },
      url: String,
      filename: String,
      uploadedAt: Date
    }
  ],

  // Payments
  payments: [
    {
      paymentType: { type: String, enum: ['PAYMENT_1', 'PAYMENT_2'] },
      amount: Number,
      method: String,
      slipUrl: String,
      paidAt: Date
    }
  ],

  // Review Data (Step 3 - Officer)
  reviewData: {
    completeness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    comments: String,
    documents: Object,
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  // Inspection Data (Step 6 - Inspector)
  inspectionData: {
    type: { type: String, enum: ['VDO_CALL', 'ON_SITE'] },

    // VDO Call
    checklist: Array,
    decision: String,

    // On-Site
    ccps: [
      {
        id: String,
        name: String,
        description: String,
        maxScore: Number,
        score: Number,
        notes: String,
        photos: [String]
      }
    ],
    totalScore: Number,
    passStatus: { type: String, enum: ['pass', 'conditional', 'fail'] },

    // Common
    notes: String,
    photos: [String],
    finalNotes: String,
    inspectedAt: Date,
    inspectedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  // Approval Data (Step 7 - Admin)
  approvalData: {
    decision: { type: String, enum: ['approve', 'reject', 'info'] },
    notes: String,
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },

  // Timestamps
  submittedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 📋 Integration Checklist

### Phase 5A: Authentication

- [ ] Create API client utility
- [ ] Update AuthContext with real API calls
- [ ] Test login/register endpoints
- [ ] Add token refresh logic
- [ ] Handle auth errors

### Phase 5B: Applications

- [ ] Update Application model schema
- [ ] Create/update application routes
- [ ] Update ApplicationContext with API calls
- [ ] Test CRUD operations
- [ ] Add error handling

### Phase 5C: File Upload

- [ ] Configure multer storage
- [ ] Create upload endpoints
- [ ] Update frontend upload components
- [ ] Test file upload/download
- [ ] Add file validation

### Phase 5D: Workflows

- [ ] Create review endpoint
- [ ] Create VDO Call endpoint
- [ ] Create On-Site endpoint
- [ ] Create approval endpoint
- [ ] Test workflow state transitions

### Phase 5E: Certificate

- [ ] Create Certificate model
- [ ] Implement PDF generation
- [ ] Add QR code
- [ ] Test certificate download

### Phase 5F: Real-time (Optional)

- [ ] Setup Socket.IO
- [ ] Add workflow notifications
- [ ] Test real-time updates

---

## ⏱️ Time Estimates

| Phase     | Tasks            | Estimated Time     |
| --------- | ---------------- | ------------------ |
| 5A        | Authentication   | 2-3 hours          |
| 5B        | Applications API | 3-4 hours          |
| 5C        | File Upload      | 2-3 hours          |
| 5D        | Workflows        | 3-4 hours          |
| 5E        | Certificate      | 2 hours            |
| 5F        | Real-time        | 2 hours (optional) |
| **Total** | **All**          | **14-18 hours**    |

---

## 🚀 Quick Start Commands

### Start Backend:

```powershell
cd apps/backend
npm install
# Setup .env file
npm run dev  # Port 5000
```

### Start Frontend:

```powershell
cd frontend-nextjs
npm install
# Create .env.local
npm run dev  # Port 3000
```

### Environment Files:

**backend/.env**:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gacp-db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGINS=http://localhost:3000
```

**frontend-nextjs/.env.local**:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📝 Next Actions

1. **UI Testing** (Today):
   - Follow UI_TESTING_GUIDE.md
   - Document bugs
   - Prioritize fixes

2. **Backend Setup** (Tomorrow):
   - Review existing backend code
   - Update schemas
   - Test existing endpoints

3. **Integration** (This Week):
   - Start with Phase 5A (Auth)
   - Then 5B (Applications)
   - Continue sequentially

4. **Testing** (Next Week):
   - End-to-end tests
   - Load testing
   - Security audit

---

**Status**: Ready to Begin Phase 5A (Authentication) ✅
