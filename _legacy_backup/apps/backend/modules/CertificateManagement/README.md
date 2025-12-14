# Certificate Management Module

ระบบจัดการใบรับรอง GACP แบบครบวงจร รองรับการสร้าง ตรวจสอบ ต่ออายุ และเพิกถอนใบรับรอง

## 📋 คุณสมบัติหลัก

### 1. Certificate Generation (สร้างใบรับรอง)

- เลขที่ใบรับรองอัตโนมัติ: `GACP-YYYY-NNNN` (เช่น GACP-2025-0001)
- Verification Code แบบเข้ารหัส 32 ตัวอักษร
- QR Code สำหรับการตรวจสอบออนไลน์
- อายุใบรับรอง 3 ปี (ปรับแต่งได้)
- บันทึกข้อมูลฟาร์ม เกษตรกร และมาตรฐานครบถ้วน

### 2. Certificate Verification (ตรวจสอบใบรับรอง)

- ตรวจสอบสาธารณะผ่าน URL และ QR Code
- ตรวจสอบสถานะ: ใช้งานได้, หมดอายุ, ถูกเพิกถอน
- Verification Code เพื่อความปลอดภัย
- นับจำนวนการตรวจสอบ

### 3. Certificate Renewal (ต่ออายุใบรับรอง)

- ต่ออายุได้ล่วงหน้า 90 วันก่อนหมดอายุ
- สร้างใบรับรองใหม่และเชื่อมโยงกับใบเก่า
- เก็บประวัติการต่ออายุ

### 4. Certificate Revocation (เพิกถอนใบรับรอง)

- เพิกถอนพร้อมระบุเหตุผล
- บันทึกผู้เพิกถอนและวันที่
- Audit trail ครบถ้วน

### 5. PDF Management (จัดการ PDF)

- ดาวน์โหลดใบรับรอง PDF
- นับจำนวนการดาวน์โหลด
- อัพเดท URL หลังจากสร้าง PDF

### 6. Statistics & Reporting (สถิติและรายงาน)

- สถิติใบรับรองทั้งหมด
- ใบรับรองที่ใช้งานได้, หมดอายุ, ถูกเพิกถอน
- ใบรับรองที่ออกในเดือนนี้
- แจ้งเตือนใบรับรองที่ใกล้หมดอายุ (90 วัน)
- สถิติแยกตามมาตรฐาน (GAP/GACP)

## 🗂️ โครงสร้างโมดูล

```
certificate-management/
├── controllers/
│   └── certificate.controller.js   # HTTP request handlers (11 methods)
├── services/
│   └── certificate.service.js      # Business logic (12 methods)
├── routes/
│   └── certificate.routes.js       # API endpoints (11 routes)
├── models/
│   └── Certificate.js              # Mongoose schema
├── templates/
│   └── (PDF templates - future)
├── tests/
│   └── (Unit tests - future)
├── index.js                        # Module entry point
└── README.md                       # Documentation
```

## 🔌 API Endpoints

### Public Endpoints (ไม่ต้อง authentication)

#### 1. Verify Certificate

```http
GET /api/certificates/verify/:certificateNumber?code=VERIFICATION_CODE
```

**Request:**

```bash
curl https://api.example.com/api/certificates/verify/GACP-2025-0001?code=ABC123...
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate is valid",
  "data": {
    "valid": true,
    "certificate": {
      "certificateNumber": "GACP-2025-0001",
      "farmName": "ฟาร์มสมหมาย",
      "farmerName": "นายสมหมาย ใจดี",
      "standardName": "GACP Cannabis",
      "issuedDate": "2025-01-15",
      "expiryDate": "2028-01-15",
      "status": "active"
    }
  }
}
```

#### 2. Download Certificate PDF

```http
GET /api/certificates/:id/download
```

**Request:**

```bash
curl https://api.example.com/api/certificates/507f1f77bcf86cd799439011/download
```

**Response:**

- Redirects to PDF URL
- Increments download counter

### Private Endpoints (ต้อง authentication)

#### 3. Create Certificate

```http
POST /api/certificates
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "applicationId": "507f1f77bcf86cd799439011",
  "farmId": "F-2025-001",
  "userId": "U-2025-001",
  "farmName": "ฟาร์มสมหมาย",
  "farmerName": "นายสมหมาย ใจดี",
  "location": {
    "province": "เชียงใหม่",
    "district": "เมือง",
    "subDistrict": "สุเทพ",
    "address": "123 หมู่ 5"
  },
  "cropType": "กัญชา",
  "farmSize": 10,
  "standardId": "GACP-001",
  "standardName": "GACP Cannabis",
  "score": 85,
  "issuedBy": "Department of Agriculture",
  "validityYears": 3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "certificateNumber": "GACP-2025-0001",
    "verificationCode": "ABC123...",
    "qrData": "https://gacp-certify.go.th/verify/GACP-2025-0001?code=ABC123...",
    "status": "active",
    "issuedDate": "2025-01-15",
    "expiryDate": "2028-01-15",
    ...
  }
}
```

#### 4. Get Certificate by ID

```http
GET /api/certificates/:id
Authorization: Bearer <token>
```

#### 5. Get Certificate by Number

```http
GET /api/certificates/number/:certificateNumber
Authorization: Bearer <token>
```

#### 6. Get User's Certificates

```http
GET /api/certificates/user/:userId?status=active&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): active, expired, revoked, renewed
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### 7. Get All Certificates

```http
GET /api/certificates?page=1&limit=20&status=active&search=ฟาร์ม
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `search` (optional): Search in farm name, farmer name, certificate number

#### 8. Renew Certificate

```http
POST /api/certificates/:id/renew
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "issuedBy": "Department of Agriculture"
}
```

**Requirements:**

- Certificate must be within 90 days before expiry
- Certificate must have status "active"

**Response:**

```json
{
  "success": true,
  "message": "Certificate renewed successfully",
  "data": {
    "oldCertificate": { ... },
    "newCertificate": {
      "certificateNumber": "GACP-2025-0234",
      "previousCertificateId": "507f1f77bcf86cd799439011",
      ...
    }
  }
}
```

#### 9. Revoke Certificate

```http
POST /api/certificates/:id/revoke
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "revokedBy": "admin-001",
  "reason": "ตรวจพบการไม่ปฏิบัติตามมาตรฐาน"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "data": {
    "status": "revoked",
    "revokedAt": "2025-01-20",
    "revokedBy": "admin-001",
    "revokedReason": "ตรวจพบการไม่ปฏิบัติตามมาตรฐาน"
  }
}
```

#### 10. Update PDF Info

```http
PUT /api/certificates/:id/pdf
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "pdfUrl": "https://storage.example.com/certificates/GACP-2025-0001.pdf"
}
```

#### 11. Get Certificate Statistics

```http
GET /api/certificates/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate statistics retrieved",
  "data": {
    "total": 1250,
    "active": 1050,
    "expired": 150,
    "revoked": 50,
    "thisMonth": 45,
    "expiringSoon": 120,
    "byStandard": [
      { "_id": "GACP-001", "count": 800 },
      { "_id": "GAP-001", "count": 450 }
    ]
  }
}
```

#### 12. Get Expiring Certificates

```http
GET /api/certificates/expiring?days=90
Authorization: Bearer <token>
```

**Query Parameters:**

- `days` (optional): Number of days threshold (default: 90)

## 🔐 Certificate Security

### Certificate Number Format

- Pattern: `GACP-YYYY-NNNN`
- Example: `GACP-2025-0001`
- Auto-incrementing per year
- 4-digit zero-padded sequence

### Verification Code

- 32-character hexadecimal string
- Generated using crypto.randomBytes(16)
- Uppercase format
- Example: `A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6`

### QR Code Data

- Format: `{baseUrl}/verify/{certificateNumber}?code={verificationCode}`
- Example: `https://gacp-certify.go.th/verify/GACP-2025-0001?code=A1B2C3...`
- Enables one-scan verification

## 📊 Database Schema

### Certificate Model

```javascript
{
  // Identification
  certificateNumber: String (unique, GACP-YYYY-NNNN),
  verificationCode: String (32-char hex),
  qrData: String (verification URL),

  // Relations
  applicationId: ObjectId,
  farmId: String,
  userId: String,

  // Farm Info
  farmName: String,
  farmerName: String,
  location: { province, district, subDistrict, address },
  cropType: String,
  farmSize: Number,

  // Standard
  standardId: String,
  standardName: String,
  score: Number (0-100),

  // Status
  status: Enum [active, expired, revoked, renewed],

  // Dates
  issuedDate: Date,
  expiryDate: Date,
  validityYears: Number (default: 3),

  // Authority
  issuedBy: String,

  // PDF
  pdfGenerated: Boolean,
  pdfUrl: String,
  pdfGeneratedAt: Date,

  // Tracking
  downloadCount: Number,
  verificationCount: Number,
  lastDownloadedAt: Date,
  lastVerifiedAt: Date,

  // Revocation
  revokedAt: Date,
  revokedBy: String,
  revokedReason: String,

  // Renewal
  renewedCertificateId: ObjectId,
  previousCertificateId: ObjectId,

  // Meta
  notes: String,
  metadata: Mixed,

  timestamps: true
}
```

### Indexes

```javascript
// Single field indexes
certificateNumber(unique);
applicationId;
farmId;
userId;
status;
expiryDate;
verificationCode;
issuedDate(descending);

// Compound indexes
{
  (userId, status);
}
{
  (status, expiryDate);
}
{
  (farmId, status);
}
```

### Virtuals

```javascript
isExpired; // Boolean: expiryDate < now
isActive; // Boolean: status === 'active' && !isExpired
daysUntilExpiry; // Number: days until expiry
isExpiringSoon; // Boolean: expires within 90 days
canRenew; // Boolean: active && expiring soon
fullLocation; // String: formatted location
```

## 💼 Business Logic

### Certificate Lifecycle

1. **Creation (สร้าง)**
   - Application must be approved
   - Generate unique certificate number
   - Create verification code and QR data
   - Set 3-year validity (configurable)
   - Status: `active`

2. **Active Period (ใช้งาน)**
   - Can be verified publicly
   - Can be downloaded
   - Counters track usage
   - Expires after validity period

3. **Renewal Window (ช่วงต่ออายุ)**
   - Opens 90 days before expiry
   - Create new certificate
   - Mark old certificate as `renewed`
   - Link certificates together

4. **Expiry (หมดอายุ)**
   - Auto-update status to `expired`
   - No longer valid for verification
   - Can create new application for renewal

5. **Revocation (เพิกถอน)**
   - Admin action only
   - Status: `revoked`
   - Record reason and responsible person
   - Cannot be un-revoked (audit trail)

### Renewal Rules

- **Eligible Period**: 90 days before expiry
- **Requirements**:
  - Certificate must be `active`
  - Within renewal window
  - Valid application data
- **Process**:
  1. Validate renewal eligibility
  2. Create new certificate (new number, new code)
  3. Copy farm and farmer data
  4. Set new 3-year validity
  5. Mark old certificate as `renewed`
  6. Link old → new certificates

### Revocation Rules

- **Authorization**: Admin or authorized staff only
- **Requirements**:
  - Must provide reason
  - Must record responsible person
- **Effects**:
  - Status changes to `revoked`
  - Verification returns invalid
  - Cannot be renewed
  - Audit trail preserved

## 🔧 Integration Guide

### 1. Module Initialization

```javascript
const { initializeCertificateManagement } = require('./modules/certificate-management');

// Initialize module
const certificateModule = await initializeCertificateManagement(
  db, // MongoDB instance
  authMiddleware, // Authentication middleware
);

// Use in Express app
app.use('/api/certificates', certificateModule.router);
```

### 2. Service Usage

```javascript
// Get service instance
const { service } = certificateModule;

// Create certificate
const certificate = await service.createCertificate({
  applicationId: '...',
  farmId: 'F-2025-001',
  // ... other data
});

// Verify certificate
const verification = await service.verifyCertificate('GACP-2025-0001', 'VERIFICATION_CODE');

// Get statistics
const stats = await service.getCertificateStats();
```

### 3. Integration with Application Workflow

```javascript
// After application approval
const application = await applicationService.approve(applicationId);

// Auto-create certificate
const certificate = await certificateService.createCertificate({
  applicationId: application._id,
  farmId: application.farmId,
  userId: application.userId,
  farmName: application.farmName,
  farmerName: application.farmerName,
  location: application.location,
  cropType: application.cropType,
  farmSize: application.farmSize,
  standardId: application.standardId,
  standardName: application.standardName,
  score: application.score,
  issuedBy: req.user.userId,
});

// Update application with certificate reference
await applicationService.updateCertificateInfo(
  applicationId,
  certificate.certificateNumber,
  certificate._id,
);
```

### 4. PDF Generation Integration (Future)

```javascript
// Generate PDF after certificate creation
const pdfUrl = await pdfService.generateCertificatePDF(certificate);

// Update certificate with PDF info
await certificateService.updatePDFInfo(certificate._id, pdfUrl);
```

## 📱 QR Code Usage

### Frontend Integration

```javascript
// Generate QR code image
import QRCode from 'qrcode';

const qrCodeImage = await QRCode.toDataURL(certificate.qrData);

// Display in certificate
<img src={qrCodeImage} alt="QR Code" />;
```

### Mobile Scanning

1. Scan QR code with mobile device
2. Navigate to verification URL
3. Display certificate details
4. Show validity status

## ⚡ Performance Considerations

### Indexes

- All critical fields indexed for fast queries
- Compound indexes for common query patterns
- Unique index on certificateNumber

### Query Optimization

- Pagination for list endpoints
- Projection to limit returned fields
- Aggregation for statistics

### Caching Strategies

- Cache certificate statistics (5 minutes)
- Cache public verification results (1 minute)
- Cache expiring certificates list (1 hour)

## 🧪 Testing Guide

### Unit Tests (Future)

```javascript
describe('CertificateService', () => {
  test('should generate unique certificate number', async () => {
    const number = await service.generateCertificateNumber();
    expect(number).toMatch(/^GACP-\d{4}-\d{4}$/);
  });

  test('should verify valid certificate', async () => {
    const result = await service.verifyCertificate(certNumber, code);
    expect(result.valid).toBe(true);
  });

  test('should reject expired certificate', async () => {
    const result = await service.verifyCertificate(expiredCertNumber, code);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Certificate has expired');
  });
});
```

### Integration Tests (Future)

```javascript
describe('Certificate API', () => {
  test('POST /api/certificates should create certificate', async () => {
    const response = await request(app)
      .post('/api/certificates')
      .set('Authorization', `Bearer ${token}`)
      .send(certificateData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 📈 Monitoring & Alerts

### Key Metrics

- Certificates issued per day/week/month
- Verification requests per day
- Download count per certificate
- Renewal success rate
- Revocation rate

### Alerts

- Expiring certificates (90 days warning)
- High revocation rate
- Failed verification attempts
- Certificate generation errors

## 🚀 Future Enhancements

1. **PDF Generation**
   - Auto-generate PDF on certificate creation
   - Custom templates per standard
   - Digital signatures

2. **Notification System**
   - Email certificates to farmers
   - SMS alerts for expiry
   - LINE notifications

3. **Batch Operations**
   - Bulk certificate creation
   - Batch renewal processing
   - Mass notifications

4. **Advanced Verification**
   - Blockchain verification
   - NFC/RFID integration
   - Facial recognition linking

5. **Analytics Dashboard**
   - Real-time statistics
   - Trend analysis
   - Geographic distribution maps
   - Compliance reports

## 📞 Support

For issues or questions:

- Check API documentation above
- Review error messages in responses
- Contact system administrator

---

**Module Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Maintained by:** GACP Certify Platform Team
