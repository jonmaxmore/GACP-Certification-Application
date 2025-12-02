# Clean Architecture Modules - API Documentation

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Base URL**: `http://localhost:3004` (Development) | `https://api.gacp.go.th` (Production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Document Module API](#document-module-api)
3. [Report Module API](#report-module-api)
4. [Dashboard Module API](#dashboard-module-api)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Authentication

All module endpoints require JWT authentication. There are two separate authentication systems:

### Farmer Authentication

- **Endpoint**: `POST /api/auth/login`
- **Token Type**: `Bearer token`
- **Role**: `FARMER`
- **Header**: `Authorization: Bearer <farmer_token>`

### DTAM Staff Authentication

- **Endpoint**: `POST /api/auth/dtam/login`
- **Token Type**: `Bearer token`
- **Role**: `DTAM_STAFF`
- **Header**: `Authorization: Bearer <dtam_token>`

### Token Format

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "farmer@example.com",
    "role": "FARMER"
  },
  "expiresIn": "24h"
}
```

---

## Document Module API

The Document Module handles file management, document uploads, version control, and document approval workflows.

### Farmer Endpoints

#### GET /api/farmer/documents

List all documents belonging to the authenticated farmer.

**Authentication**: Required (Farmer)

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (`pending`, `approved`, `rejected`)
- `type` (string, optional): Filter by document type
- `sort` (string, optional): Sort field (default: `createdAt`)
- `order` (string, optional): Sort order (`asc`, `desc`, default: `desc`)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Farm Certificate 2025",
        "description": "Annual farm certification document",
        "documentType": "certificate",
        "category": "compliance",
        "status": "approved",
        "fileUrl": "https://storage.gacp.go.th/documents/...",
        "fileName": "farm-cert-2025.pdf",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "version": 1,
        "uploadedAt": "2025-10-01T10:30:00.000Z",
        "approvedAt": "2025-10-05T14:20:00.000Z",
        "approvedBy": {
          "_id": "507f1f77bcf86cd799439012",
          "fullName": "DTAM Staff Admin"
        },
        "metadata": {
          "certificationBody": "DOA",
          "validUntil": "2026-10-01"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDocuments": 45,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

---

#### GET /api/farmer/documents/:id

Get details of a specific document.

**Authentication**: Required (Farmer)

**URL Parameters**:

- `id` (string, required): Document ID

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Farm Certificate 2025",
    "description": "Annual farm certification document",
    "documentType": "certificate",
    "category": "compliance",
    "status": "approved",
    "fileUrl": "https://storage.gacp.go.th/documents/...",
    "fileName": "farm-cert-2025.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "version": 1,
    "versions": [
      {
        "version": 1,
        "uploadedAt": "2025-10-01T10:30:00.000Z",
        "fileUrl": "https://storage.gacp.go.th/documents/...",
        "changes": "Initial upload"
      }
    ],
    "uploadedAt": "2025-10-01T10:30:00.000Z",
    "updatedAt": "2025-10-05T14:20:00.000Z",
    "approvedAt": "2025-10-05T14:20:00.000Z",
    "approvedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "DTAM Staff Admin"
    },
    "metadata": {
      "certificationBody": "DOA",
      "validUntil": "2026-10-01"
    }
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Not your document
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Server error

---

#### POST /api/farmer/documents

Upload a new document.

**Authentication**: Required (Farmer)

**Content-Type**: `multipart/form-data`

**Form Data**:

- `file` (file, required): Document file (Max size: 10MB)
- `title` (string, required): Document title (3-200 characters)
- `description` (string, optional): Document description
- `documentType` (string, required): Type (`certificate`, `license`, `report`, `training`, `other`)
- `category` (string, required): Category (`compliance`, `quality`, `safety`, `training`, `other`)
- `metadata` (JSON string, optional): Additional metadata

**Response**: `201 Created`

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Farm Certificate 2025",
    "description": "Annual farm certification document",
    "documentType": "certificate",
    "category": "compliance",
    "status": "pending",
    "fileUrl": "https://storage.gacp.go.th/documents/...",
    "fileName": "farm-cert-2025.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "version": 1,
    "uploadedAt": "2025-10-01T10:30:00.000Z",
    "ownerId": "507f1f77bcf86cd799439010"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input or file too large
- `401 Unauthorized`: Missing or invalid token
- `413 Payload Too Large`: File exceeds 10MB
- `415 Unsupported Media Type`: Invalid file type
- `500 Internal Server Error`: Server error

---

#### PUT /api/farmer/documents/:id

Update document metadata or upload new version.

**Authentication**: Required (Farmer)

**URL Parameters**:

- `id` (string, required): Document ID

**Content-Type**: `multipart/form-data` or `application/json`

**Form Data / JSON Body**:

- `file` (file, optional): New version file
- `title` (string, optional): Updated title
- `description` (string, optional): Updated description
- `metadata` (object, optional): Updated metadata
- `changes` (string, optional): Version change notes

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "version": 2,
    "updatedAt": "2025-10-06T09:15:00.000Z"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cannot edit approved documents
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Server error

---

#### DELETE /api/farmer/documents/:id

Delete a document (soft delete).

**Authentication**: Required (Farmer)

**URL Parameters**:

- `id` (string, required): Document ID

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Cannot delete approved documents
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Server error

---

### DTAM Staff Endpoints

#### GET /api/dtam/documents

List all documents in the system (admin view).

**Authentication**: Required (DTAM Staff)

**Query Parameters**:

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status
- `farmerId` (string, optional): Filter by farmer ID
- `startDate` (ISO date, optional): Filter from date
- `endDate` (ISO date, optional): Filter to date

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Farm Certificate 2025",
        "status": "pending",
        "owner": {
          "_id": "507f1f77bcf86cd799439010",
          "fullName": "John Farmer",
          "farmName": "Green Valley Farm"
        },
        "uploadedAt": "2025-10-01T10:30:00.000Z",
        "reviewRequired": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalDocuments": 289
    }
  }
}
```

---

#### PUT /api/dtam/documents/:id/approve

Approve a document.

**Authentication**: Required (DTAM Staff)

**URL Parameters**:

- `id` (string, required): Document ID

**Request Body**:

```json
{
  "notes": "Certificate verified and approved",
  "metadata": {
    "approvalNotes": "All requirements met"
  }
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Document approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "approved",
    "approvedAt": "2025-10-05T14:20:00.000Z",
    "approvedBy": "507f1f77bcf86cd799439012"
  }
}
```

---

#### PUT /api/dtam/documents/:id/reject

Reject a document.

**Authentication**: Required (DTAM Staff)

**URL Parameters**:

- `id` (string, required): Document ID

**Request Body**:

```json
{
  "reason": "Document quality insufficient",
  "requiredActions": ["Submit clearer scan", "Include all required fields"]
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Document rejected",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "rejectedAt": "2025-10-05T14:20:00.000Z",
    "rejectedBy": "507f1f77bcf86cd799439012",
    "rejectionReason": "Document quality insufficient"
  }
}
```

---

## Report Module API

The Report Module handles report generation, scheduling, and exporting in multiple formats (PDF, Excel, CSV).

### Farmer Endpoints

#### GET /api/farmer/reports

List all reports for the authenticated farmer.

**Authentication**: Required (Farmer)

**Query Parameters**:

- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `reportType` (string, optional): Filter by type
- `period` (string, optional): Filter by period (`daily`, `weekly`, `monthly`, `yearly`)
- `year` (integer, optional): Filter by year
- `month` (integer, optional): Filter by month (1-12)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "reportType": "farm-summary",
        "title": "Farm Summary Report - October 2025",
        "period": "monthly",
        "year": 2025,
        "month": 10,
        "status": "completed",
        "formats": ["pdf", "excel"],
        "generatedAt": "2025-10-06T08:00:00.000Z",
        "fileUrls": {
          "pdf": "https://storage.gacp.go.th/reports/...",
          "excel": "https://storage.gacp.go.th/reports/..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalReports": 82
    }
  }
}
```

---

#### POST /api/farmer/reports/generate

Generate a new report.

**Authentication**: Required (Farmer)

**Request Body**:

```json
{
  "reportType": "farm-summary",
  "period": "monthly",
  "year": 2025,
  "month": 10,
  "formats": ["pdf", "excel", "csv"],
  "includeCharts": true,
  "includeRawData": false,
  "filters": {
    "productType": "cannabis",
    "certificationStatus": "all"
  }
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "message": "Report generation started",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "reportType": "farm-summary",
    "status": "processing",
    "estimatedCompletionTime": "2025-10-06T08:05:00.000Z",
    "progressUrl": "/api/farmer/reports/507f1f77bcf86cd799439020/progress"
  }
}
```

---

#### GET /api/farmer/reports/:id

Get report details and download links.

**Authentication**: Required (Farmer)

**URL Parameters**:

- `id` (string, required): Report ID

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "reportType": "farm-summary",
    "title": "Farm Summary Report - October 2025",
    "period": "monthly",
    "year": 2025,
    "month": 10,
    "status": "completed",
    "generatedAt": "2025-10-06T08:00:00.000Z",
    "formats": ["pdf", "excel", "csv"],
    "fileUrls": {
      "pdf": "https://storage.gacp.go.th/reports/farm-summary-oct2025.pdf",
      "excel": "https://storage.gacp.go.th/reports/farm-summary-oct2025.xlsx",
      "csv": "https://storage.gacp.go.th/reports/farm-summary-oct2025.csv"
    },
    "fileSizes": {
      "pdf": 1024000,
      "excel": 512000,
      "csv": 128000
    },
    "summary": {
      "totalHarvests": 12,
      "totalYield": "450 kg",
      "certifications": 3,
      "compliance": "98%"
    }
  }
}
```

---

#### GET /api/farmer/reports/:id/download/:format

Download report in specific format.

**Authentication**: Required (Farmer)

**URL Parameters**:

- `id` (string, required): Report ID
- `format` (string, required): Format (`pdf`, `excel`, `csv`)

**Response**: `200 OK` (File download)

**Headers**:

```
Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | text/csv
Content-Disposition: attachment; filename="farm-summary-oct2025.pdf"
```

---

#### DELETE /api/farmer/reports/:id

Delete a report.

**Authentication**: Required (Farmer)

**Response**: `200 OK`

```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### DTAM Staff Endpoints

#### GET /api/dtam/reports

List all system reports (admin view).

**Authentication**: Required (DTAM Staff)

**Query Parameters**: Similar to farmer endpoint + `farmerId` filter

**Response**: Similar to farmer endpoint with additional admin fields

---

#### POST /api/dtam/reports/system

Generate system-wide reports.

**Authentication**: Required (DTAM Staff)

**Request Body**:

```json
{
  "reportType": "system-overview",
  "period": "monthly",
  "year": 2025,
  "month": 10,
  "includeStatistics": true,
  "includeAllFarms": true,
  "filters": {
    "region": "central",
    "certificationStatus": "active"
  }
}
```

**Response**: `201 Created` (Same structure as farmer report generation)

---

## Dashboard Module API

The Dashboard Module provides aggregated statistics and real-time data for farmers and DTAM staff.

### Farmer Endpoints

#### GET /api/farmer/dashboard-v2

Get farmer dashboard data.

**Authentication**: Required (Farmer)

**Query Parameters**:

- `period` (string, optional): Time period (`today`, `week`, `month`, `year`, default: `month`)
- `includeCharts` (boolean, optional): Include chart data (default: true)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalFarms": 1,
      "activeCertificates": 3,
      "pendingDocuments": 2,
      "upcomingInspections": 1
    },
    "statistics": {
      "documents": {
        "total": 45,
        "pending": 2,
        "approved": 40,
        "rejected": 3
      },
      "reports": {
        "total": 82,
        "thisMonth": 4
      },
      "compliance": {
        "score": 98,
        "lastAudit": "2025-09-15T10:00:00.000Z",
        "nextAudit": "2025-12-15T10:00:00.000Z"
      }
    },
    "recentActivity": [
      {
        "type": "document_approved",
        "message": "Farm Certificate 2025 approved",
        "timestamp": "2025-10-05T14:20:00.000Z"
      },
      {
        "type": "report_generated",
        "message": "Monthly summary report completed",
        "timestamp": "2025-10-06T08:00:00.000Z"
      }
    ],
    "alerts": [
      {
        "level": "warning",
        "message": "Certificate expires in 30 days",
        "actionRequired": true,
        "deadline": "2025-11-01T00:00:00.000Z"
      }
    ],
    "charts": {
      "documentsOverTime": {
        "labels": ["Oct 1", "Oct 2", "Oct 3", "Oct 4", "Oct 5"],
        "datasets": [
          {
            "label": "Documents Uploaded",
            "data": [2, 1, 3, 0, 2]
          }
        ]
      },
      "complianceScore": {
        "current": 98,
        "history": [95, 96, 97, 98, 98]
      }
    }
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### DTAM Staff Endpoints

#### GET /api/dtam/dashboard-v2

Get system-wide dashboard (admin view).

**Authentication**: Required (DTAM Staff)

**Query Parameters**:

- `period` (string, optional): Time period
- `region` (string, optional): Filter by region

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "systemOverview": {
      "totalFarmers": 1247,
      "activeFarms": 1189,
      "totalCertificates": 3421,
      "pendingReviews": 45
    },
    "statistics": {
      "documents": {
        "total": 12850,
        "pending": 45,
        "thisWeek": 127
      },
      "reports": {
        "generated": 5234,
        "thisMonth": 312
      },
      "compliance": {
        "averageScore": 94.5,
        "aboveThreshold": 95.2
      }
    },
    "workload": {
      "pendingApprovals": 45,
      "urgentReviews": 12,
      "scheduledInspections": 28
    },
    "recentActivity": [
      {
        "type": "new_registration",
        "farmer": "John Farmer",
        "timestamp": "2025-10-06T10:30:00.000Z"
      }
    ],
    "charts": {
      "registrationsTrend": {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        "data": [45, 52, 48, 61, 55, 67, 72, 68, 75, 82]
      },
      "complianceDistribution": {
        "excellent": 567,
        "good": 489,
        "fair": 123,
        "poor": 10
      }
    }
  }
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Field-specific error information"
    },
    "timestamp": "2025-10-06T10:30:00.000Z",
    "requestId": "req_abc123def456"
  }
}
```

### Common Error Codes

| Code                  | Status | Description                   |
| --------------------- | ------ | ----------------------------- |
| `AUTH_REQUIRED`       | 401    | Authentication token required |
| `AUTH_INVALID`        | 401    | Invalid or expired token      |
| `FORBIDDEN`           | 403    | Insufficient permissions      |
| `NOT_FOUND`           | 404    | Resource not found            |
| `VALIDATION_ERROR`    | 400    | Input validation failed       |
| `FILE_TOO_LARGE`      | 413    | File exceeds size limit       |
| `UNSUPPORTED_FORMAT`  | 415    | Unsupported file format       |
| `RATE_LIMIT_EXCEEDED` | 429    | Too many requests             |
| `SERVER_ERROR`        | 500    | Internal server error         |

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

### Limits

- **Farmer endpoints**: 100 requests per minute
- **DTAM endpoints**: 200 requests per minute
- **File uploads**: 10 uploads per hour
- **Report generation**: 5 reports per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633523400
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Examples

### Complete Workflow: Upload and Approve Document

#### Step 1: Farmer uploads document

```bash
curl -X POST http://localhost:3004/api/farmer/documents \
  -H "Authorization: Bearer <farmer_token>" \
  -F "file=@farm-certificate.pdf" \
  -F "title=Farm Certificate 2025" \
  -F "documentType=certificate" \
  -F "category=compliance"
```

#### Step 2: DTAM staff reviews documents

```bash
curl -X GET http://localhost:3004/api/dtam/documents?status=pending \
  -H "Authorization: Bearer <dtam_token>"
```

#### Step 3: DTAM staff approves document

```bash
curl -X PUT http://localhost:3004/api/dtam/documents/507f1f77bcf86cd799439011/approve \
  -H "Authorization: Bearer <dtam_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Certificate verified and approved"
  }'
```

#### Step 4: Farmer checks approval status

```bash
curl -X GET http://localhost:3004/api/farmer/documents/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <farmer_token>"
```

---

### Generate and Download Report

#### Step 1: Generate monthly report

```bash
curl -X POST http://localhost:3004/api/farmer/reports/generate \
  -H "Authorization: Bearer <farmer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "farm-summary",
    "period": "monthly",
    "year": 2025,
    "month": 10,
    "formats": ["pdf", "excel"]
  }'
```

#### Step 2: Check report status

```bash
curl -X GET http://localhost:3004/api/farmer/reports/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer <farmer_token>"
```

#### Step 3: Download PDF report

```bash
curl -X GET http://localhost:3004/api/farmer/reports/507f1f77bcf86cd799439020/download/pdf \
  -H "Authorization: Bearer <farmer_token>" \
  -o farm-summary-oct2025.pdf
```

---

### Check Dashboard Statistics

#### Farmer Dashboard

```bash
curl -X GET "http://localhost:3004/api/farmer/dashboard-v2?period=month" \
  -H "Authorization: Bearer <farmer_token>"
```

#### DTAM Dashboard

```bash
curl -X GET "http://localhost:3004/api/dtam/dashboard-v2?period=week" \
  -H "Authorization: Bearer <dtam_token>"
```

---

## Support

For API support and questions:

- **Documentation**: https://docs.gacp.go.th
- **Email**: support@gacp.go.th
- **GitHub**: https://github.com/jonmaxmore/gacp-certify-flow-main
- **Issue Tracker**: https://github.com/jonmaxmore/gacp-certify-flow-main/issues

---

**© 2025 GACP Certification System. All rights reserved.**
