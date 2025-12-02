# GACP Certification System API Documentation

## Overview

The GACP (Good Agricultural and Collection Practices) Certification System API provides a comprehensive RESTful interface for managing agricultural certification processes, including farmer applications, audits, certificate generation, payments, and surveys.

## Base Information

- **API Version**: 1.0.0
- **Base URL**: `/api/v1`
- **Authentication**: Bearer Token (JWT)
- **Content Type**: `application/json`

## Quick Start

### 1. Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 2. Get Token

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_farmer",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "farmer",
    "fullName": "John Doe"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

## User Roles

| Role       | Description                              | Permissions                         |
| ---------- | ---------------------------------------- | ----------------------------------- |
| `farmer`   | Farm owners applying for certification   | Create applications, view own data  |
| `auditor`  | Field inspectors and compliance auditors | Conduct audits, review applications |
| `director` | Management personnel                     | Approve certificates, manage system |
| `admin`    | System administrators                    | Full access to all features         |

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint                | Description               | Auth Required |
| ------ | ----------------------- | ------------------------- | ------------- |
| POST   | `/auth/register`        | Register new user         | No            |
| POST   | `/auth/login`           | User login                | No            |
| POST   | `/auth/logout`          | User logout               | Yes           |
| GET    | `/auth/me`              | Get current user profile  | Yes           |
| POST   | `/auth/forgot-password` | Send password reset email | No            |
| POST   | `/auth/reset-password`  | Reset user password       | No            |
| POST   | `/auth/refresh-token`   | Refresh JWT token         | Yes           |

### Applications (`/applications`)

| Method | Endpoint                   | Description                   | Auth Required | Roles                     |
| ------ | -------------------------- | ----------------------------- | ------------- | ------------------------- |
| GET    | `/applications`            | Get all applications          | Yes           | All                       |
| GET    | `/applications/stats`      | Get application statistics    | Yes           | auditor, director, admin  |
| GET    | `/applications/:id`        | Get application by ID         | Yes           | All                       |
| POST   | `/applications`            | Create new application        | Yes           | farmer                    |
| PUT    | `/applications/:id`        | Update application            | Yes           | farmer, auditor, director |
| DELETE | `/applications/:id`        | Delete application            | Yes           | farmer, director, admin   |
| POST   | `/applications/:id/submit` | Submit application for review | Yes           | farmer                    |
| POST   | `/applications/:id/review` | Review application            | Yes           | auditor, director         |

### Certificates (`/certificates`)

| Method | Endpoint                         | Description                | Auth Required | Roles                    |
| ------ | -------------------------------- | -------------------------- | ------------- | ------------------------ |
| GET    | `/certificates`                  | Get all certificates       | Yes           | auditor, director, admin |
| GET    | `/certificates/stats`            | Get certificate statistics | Yes           | auditor, director, admin |
| GET    | `/certificates/verify/:number`   | Verify certificate         | No            | Public                   |
| GET    | `/certificates/download/:number` | Download certificate       | No            | Public                   |
| GET    | `/certificates/:id`              | Get certificate by ID      | Yes           | All                      |
| POST   | `/certificates`                  | Create new certificate     | Yes           | auditor, director        |
| PUT    | `/certificates/:id`              | Update certificate         | Yes           | auditor, director        |
| DELETE | `/certificates/:id`              | Delete certificate         | Yes           | director, admin          |
| POST   | `/certificates/:id/renew`        | Renew certificate          | Yes           | auditor, director        |

### Audits (`/audits`)

| Method | Endpoint                      | Description          | Auth Required | Roles                    |
| ------ | ----------------------------- | -------------------- | ------------- | ------------------------ |
| GET    | `/audits`                     | Get all audits       | Yes           | auditor, director, admin |
| GET    | `/audits/stats`               | Get audit statistics | Yes           | auditor, director, admin |
| GET    | `/audits/schedule/:auditorId` | Get auditor schedule | Yes           | auditor, director        |
| GET    | `/audits/:id`                 | Get audit by ID      | Yes           | All                      |
| POST   | `/audits`                     | Create new audit     | Yes           | auditor, director        |
| POST   | `/audits/schedule`            | Schedule field audit | Yes           | auditor, director        |
| POST   | `/audits/:id/report`          | Submit audit report  | Yes           | auditor                  |
| PUT    | `/audits/:id`                 | Update audit         | Yes           | auditor, director        |
| DELETE | `/audits/:id`                 | Delete audit         | Yes           | director, admin          |

### Payments (`/payments`)

| Method | Endpoint                          | Description            | Auth Required | Roles            |
| ------ | --------------------------------- | ---------------------- | ------------- | ---------------- |
| GET    | `/payments`                       | Get all payments       | Yes           | director, admin  |
| GET    | `/payments/stats`                 | Get payment statistics | Yes           | director, admin  |
| GET    | `/payments/status/:applicationId` | Get payment status     | Yes           | All              |
| GET    | `/payments/:id`                   | Get payment by ID      | Yes           | All              |
| POST   | `/payments/initiate`              | Initiate payment       | Yes           | farmer, director |
| POST   | `/payments/:id/refund`            | Process refund         | Yes           | director, admin  |
| PUT    | `/payments/:id`                   | Update payment         | Yes           | director, admin  |
| POST   | `/payments/webhook`               | Payment webhook        | No            | External         |

### Surveys (`/surveys`)

| Method | Endpoint                | Description            | Auth Required | Roles                    |
| ------ | ----------------------- | ---------------------- | ------------- | ------------------------ |
| GET    | `/surveys/regions`      | Get survey regions     | No            | Public                   |
| GET    | `/surveys/region/:code` | Get survey by region   | No            | Public                   |
| POST   | `/surveys/submit/:code` | Submit survey response | No            | Public                   |
| GET    | `/surveys`              | Get all surveys        | Yes           | auditor, director, admin |
| GET    | `/surveys/stats`        | Get survey statistics  | Yes           | auditor, director, admin |
| GET    | `/surveys/:id`          | Get survey by ID       | Yes           | All                      |
| POST   | `/surveys`              | Create new survey      | Yes           | director, admin          |
| PUT    | `/surveys/:id`          | Update survey          | Yes           | director, admin          |
| DELETE | `/surveys/:id`          | Delete survey          | Yes           | director, admin          |

## Request/Response Examples

### Create Application

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "farmName": "Green Valley Organic Farm",
    "cropType": "Organic Vegetables",
    "farmSize": 5.5,
    "location": "Chiang Mai, Thailand",
    "practicesImplemented": [
      "Organic fertilizers",
      "Crop rotation",
      "Integrated pest management"
    ]
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "app_12345",
    "farmName": "Green Valley Organic Farm",
    "cropType": "Organic Vegetables",
    "farmSize": 5.5,
    "location": "Chiang Mai, Thailand",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Verify Certificate (Public)

**Request:**

```bash
curl -X GET http://localhost:3000/api/v1/certificates/verify/GACP-2024-001
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "certificateNumber": "GACP-2024-001",
    "farmName": "Green Valley Organic Farm",
    "farmerName": "John Doe",
    "cropType": "Organic Vegetables",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": "2025-01-01T00:00:00Z",
    "status": "active",
    "standards": ["GACP-V1.0"]
  }
}
```

## Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Valid email address is required"
    }
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient privileges)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642262400
```

## Pagination

List endpoints support pagination with query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Example:**

```bash
curl "http://localhost:3000/api/v1/applications?page=2&limit=20"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

## Testing Tools

### Postman Collection

Import the Postman collection: [`api-postman.json`](./api-postman.json)

### Swagger Documentation

View interactive API docs: [`api-swagger.json`](./api-swagger.json)

### cURL Examples

See the examples above or refer to the Postman collection for complete cURL commands.

## Development Setup

1. **Environment Variables:**

```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/gacp
```

2. **Start Development Server:**

```bash
npm run dev
```

3. **Test API Health:**

```bash
curl http://localhost:3000/health
```

## Support

For questions or issues:

- **Documentation**: Check this README and Swagger docs
- **Email**: dev@gacp-system.com
- **Issues**: Create an issue in the project repository

---

**Last Updated**: January 2024  
**API Version**: 1.0.0
