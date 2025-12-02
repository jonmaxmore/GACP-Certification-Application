/\*\*

- Document Management Module Integration Documentation
-
- This document provides comprehensive guidance for integrating the Document Management
- Module into the GACP Platform backend application. It covers setup, configuration,
- dependencies, and usage patterns.
-
- @author GACP Platform Team
- @version 1.0.0
- @date 2025-10-18
  \*/

# Document Management Module - Integration Guide

## Overview

The Document Management Module provides comprehensive file handling capabilities for the GACP Platform, including secure upload, storage, validation, and access control for certification-related documents.

## Module Architecture

```
document-management/
├── domain/
│   └── entities/
│       └── Document.js              # Document entity with business rules
├── application/
│   └── services/
│       └── DocumentManagementService.js  # Core business logic
├── infrastructure/
│   └── repositories/
│       └── DocumentRepository.js    # Data access layer
├── presentation/
│   ├── controllers/
│   │   └── DocumentController.js    # HTTP request handlers
│   └── routes/
│       └── DocumentRoutes.js        # Route definitions
└── index.js                         # Module entry point
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install multer express-validator express-rate-limit aws-sdk mongoose
npm install --save-dev @types/multer
```

### 2. Environment Configuration

Add to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=gacp-documents

# Document Upload Configuration
DOCUMENT_MAX_SIZE=52428800  # 50MB in bytes
DOCUMENT_UPLOAD_PATH=/tmp/uploads

# Security Configuration
DOCUMENT_ENCRYPTION_KEY=your_32_char_encryption_key_here
VIRUS_SCAN_ENDPOINT=http://clamav:3310
```

### 3. Module Integration

#### In your main app.js:

```javascript
const DocumentManagementModule = require('./modules/document-management');
const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');
const Redis = require('redis');

// Initialize dependencies
const mongoConnection = await MongoClient.connect(process.env.MONGODB_URI);
const redisClient = Redis.createClient(process.env.REDIS_URL);

// Configure AWS S3
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET,
};

// Optional services
const virusScanService = new VirusScanService(process.env.VIRUS_SCAN_ENDPOINT);
const ocrService = new OCRService();
const auditService = new AuditService(mongoConnection);
const notificationService = new NotificationService();

// Initialize Document Management Module
const documentModule = new DocumentManagementModule({
  mongooseConnection: mongoose.connection,
  awsS3Config: s3Config,
  redisConnection: redisClient,
  virusScanService, // Optional
  ocrService, // Optional
  auditService, // Optional
  notificationService, // Optional
});

// Mount routes
app.use('/api/documents', documentModule.getRoutes());
```

## API Endpoints

### Document Upload

```http
POST /api/documents/upload
Content-Type: multipart/form-data

{
  "document": <file>,
  "documentType": "farm_license",
  "applicationId": "507f1f77bcf86cd799439011",
  "description": "Updated farm license document",
  "expiryDate": "2024-12-31T23:59:59.999Z"
}
```

### Get Document Metadata

```http
GET /api/documents/:id
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "documentType": "farm_license",
      "originalName": "farm_license.pdf",
      "fileSize": 2048576,
      "uploadedAt": "2025-01-18T10:30:00.000Z",
      "downloadUrl": "https://s3.amazonaws.com/secure-url",
      "status": "ACTIVE",
      "validationStatus": "VALIDATED"
    }
  }
}
```

### Download Document

```http
GET /api/documents/:id/download
Authorization: Bearer <jwt_token>

Response: File download or redirect to secure URL
```

### Search Documents

```http
GET /api/documents/search?q=license&type=farm_license&page=1&limit=20
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "documents": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

## Document Types Configuration

The module supports these document types:

```javascript
const documentTypes = {
  FARM_LICENSE: {
    name: 'Farm License',
    required: true,
    formats: ['pdf', 'jpg', 'png'],
    maxSize: '10MB',
    hasExpiry: true,
    uploadedBy: ['FARMER'],
  },
  LAND_DEED: {
    name: 'Land Ownership Document',
    required: true,
    formats: ['pdf', 'jpg', 'png'],
    maxSize: '10MB',
    hasExpiry: false,
    uploadedBy: ['FARMER'],
  },
  INSPECTION_REPORT: {
    name: 'Inspection Report',
    required: true,
    formats: ['pdf', 'doc', 'docx'],
    maxSize: '25MB',
    hasExpiry: false,
    uploadedBy: ['DTAM_INSPECTOR'],
  },
  // ... more types
};
```

## Security Features

### Authentication & Authorization

- JWT token validation on all endpoints
- Role-based access control (FARMER, DTAM_REVIEWER, etc.)
- Document ownership verification

### File Security

- Virus scanning integration (ClamAV)
- File type validation
- Size restrictions
- Secure storage with encryption at rest

### Rate Limiting

- Upload: 20 requests per 15 minutes per user
- Download: 100 requests per 5 minutes per user
- Configurable per endpoint

## Error Handling

The module returns standardized error responses:

```javascript
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid document type",
  "details": [
    {
      "field": "documentType",
      "message": "Document type must be one of: farm_license, land_deed, ..."
    }
  ]
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file format
- `ACCESS_DENIED` - Insufficient permissions
- `SECURITY_SCAN_FAILED` - Virus detected
- `UPLOAD_RATE_LIMIT` - Too many uploads

## Integration with Other Modules

### Application Workflow Module

```javascript
// Get documents for workflow validation
const documents = await documentService.getApplicationDocuments(applicationId, userId, userRole);
const validationResult = await workflowEngine.validateDocumentRequirements(documents);
```

### User Management Module

```javascript
// Document access is automatically integrated with user roles
// Documents are filtered based on user permissions
```

### Audit Service Integration

```javascript
// All document operations are automatically logged
await auditService.log({
  type: 'DOCUMENT_UPLOADED',
  documentId: documentId,
  userId: userId,
  metadata: { documentType, fileSize },
});
```

## Performance Considerations

### Caching Strategy

- Document metadata cached in Redis
- Thumbnail URLs cached for quick access
- Search results cached for common queries

### File Storage Optimization

- S3 intelligent tiering for cost optimization
- CloudFront CDN for faster downloads
- Compression for non-image files

### Database Indexing

```javascript
// Recommended MongoDB indexes
db.documents.createIndex({ applicationId: 1, documentType: 1 });
db.documents.createIndex({ uploadedBy: 1, uploadedAt: -1 });
db.documents.createIndex({ status: 1, validationStatus: 1 });
db.documents.createIndex({ tags: 1 });
```

## Testing

### Unit Tests

```javascript
// Example test for document upload
describe('DocumentController', () => {
  it('should upload document successfully', async () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test content'),
      size: 1024,
    };

    const result = await documentController.uploadDocument({
      file: mockFile,
      body: {
        documentType: 'farm_license',
        applicationId: 'test-app-id',
      },
      userId: 'test-user-id',
      userRole: 'FARMER',
    });

    expect(result.success).toBe(true);
    expect(result.data.document).toBeDefined();
  });
});
```

## Monitoring & Health Checks

```javascript
// Health check endpoint
app.get('/health/documents', async (req, res) => {
  const health = await documentModule.healthCheck();
  res.json(health);
});

// Expected response:
{
  "module": "DocumentManagement",
  "status": "healthy",
  "components": {
    "service": { "status": "healthy" },
    "database": { "status": "connected" },
    "s3Storage": { "status": "configured" },
    "redis": { "status": "ready" }
  }
}
```

## Production Deployment Checklist

- [ ] AWS S3 bucket configured with proper permissions
- [ ] Redis cluster configured for session storage
- [ ] Virus scanning service deployed and accessible
- [ ] SSL certificates configured for secure uploads
- [ ] Rate limiting configured appropriately
- [ ] Monitoring and alerting set up
- [ ] Backup strategy for uploaded documents
- [ ] Log rotation configured for audit logs

## Troubleshooting

### Common Issues

1. **Upload fails with "SECURITY_SCAN_FAILED"**
   - Check ClamAV service connectivity
   - Verify virus scan endpoint configuration

2. **"AWS_S3_ERROR" during upload**
   - Verify AWS credentials and permissions
   - Check S3 bucket policy and CORS configuration

3. **"RATE_LIMIT_EXCEEDED" errors**
   - Adjust rate limiting configuration
   - Implement exponential backoff in client

4. **Documents not found after upload**
   - Check database connection
   - Verify document indexing
   - Check audit logs for upload confirmation

For additional support, refer to the module's built-in logging and health check endpoints.
