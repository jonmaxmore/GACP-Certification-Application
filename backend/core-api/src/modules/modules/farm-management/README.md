# 🌱 Farm Management Module

## Overview

The **Farm Management Module** handles all cultivation cycle operations for the GACP Certify Flow platform. This module provides comprehensive farm management capabilities including cultivation tracking, SOP compliance, quality control, and certification workflow.

## Features

### Core Features

- ✅ **Cultivation Cycle Management** - Create and track cultivation cycles from planting to harvest
- ✅ **SOP Activity Recording** - Log farming activities (watering, fertilizing, pruning, pest control)
- ✅ **Compliance Tracking** - Inspector compliance checks with scoring
- ✅ **Harvest Management** - Record harvest data and yields
- ✅ **Quality Testing** - Laboratory quality test results
- ✅ **Farmer Dashboard** - Overview of active and completed cycles
- ✅ **Role-Based Access** - Different permissions for farmers, inspectors, and lab staff

### Cultivation Phases

1. **Germination** - Initial seedling phase
2. **Vegetative** - Growth and development
3. **Flowering** - Flowering and bud development
4. **Harvest** - Harvesting phase
5. **Post-Harvest** - Completion and certification

## Module Structure

```
modules/farm-management/
├── models/
│   └── CultivationCycle.js          # Cultivation cycle data model
├── services/
│   └── farm-management.service.js   # Business logic layer
├── controllers/
│   └── farm-management.controller.js # HTTP request handlers
├── routes/
│   └── farm.routes.js               # API route definitions
├── validators/
│   └── farm-management.validators.js # Input validation
├── tests/
│   └── (test files)
├── index.js                         # Module entry point
└── README.md                        # This file
```

## API Endpoints

### Cultivation Cycle Management

#### Create Cultivation Cycle

```
POST /api/farm/cycles
Authorization: Bearer <token>

Request Body:
{
  "cropType": "cannabis",
  "variety": "Thai Cannabis Strain",
  "plantingDate": "2025-01-15",
  "area": {
    "value": 2.5,
    "unit": "rai"
  },
  "plantCount": 100,
  "farmName": "Green Valley Farm"
}

Response: 201 Created
{
  "success": true,
  "message": "Cultivation cycle created successfully",
  "data": {
    "id": "uuid-here",
    "status": "planning",
    "phase": "germination",
    ...
  }
}
```

#### List Cultivation Cycles

```
GET /api/farm/cycles?status=active&phase=flowering
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "cycles": [...],
    "total": 5
  }
}
```

#### Get Cycle Details

```
GET /api/farm/cycles/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "cycle-id",
    "farmerId": "farmer-id",
    "status": "active",
    "phase": "vegetative",
    ...
  }
}
```

### Activity Management

#### Record SOP Activity

```
POST /api/farm/cycles/:id/activities
Authorization: Bearer <token>

Request Body:
{
  "type": "watering",
  "description": "Regular watering schedule",
  "date": "2025-01-16",
  "sopCompliance": true,
  "notes": "Used drip irrigation system"
}

Response: 201 Created
```

#### Get Activities

```
GET /api/farm/cycles/:id/activities
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "activities": [...],
    "total": 15
  }
}
```

### Compliance Management

#### Record Compliance Check (Inspector Only)

```
POST /api/farm/cycles/:id/compliance
Authorization: Bearer <token>
Role: admin, inspector

Request Body:
{
  "checkType": "routine",
  "checkDate": "2025-01-20",
  "findings": [
    {
      "category": "Water Management",
      "finding": "Excellent irrigation system",
      "severity": "minor",
      "status": "resolved"
    }
  ],
  "overallCompliance": "compliant",
  "notes": "All GACP standards met"
}

Response: 201 Created
```

#### Get Compliance Checks

```
GET /api/farm/cycles/:id/compliance
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "checks": [...],
    "score": 95
  }
}
```

### Harvest Management

#### Record Harvest

```
POST /api/farm/cycles/:id/harvest
Authorization: Bearer <token>

Request Body:
{
  "totalYield": 150.5,
  "yieldUnit": "kg",
  "date": "2025-04-15",
  "qualityGrade": "A",
  "notes": "Excellent harvest quality"
}

Response: 201 Created
```

#### Get Harvest Data

```
GET /api/farm/cycles/:id/harvest
Authorization: Bearer <token>

Response: 200 OK
```

### Quality Testing

#### Record Quality Test (Laboratorian Only)

```
POST /api/farm/cycles/:id/quality-test
Authorization: Bearer <token>
Role: admin, laboratorian

Request Body:
{
  "testType": "THC/CBD Analysis",
  "testDate": "2025-04-16",
  "results": {
    "thc": 18.5,
    "cbd": 0.8,
    "contaminants": "none"
  }
}

Response: 201 Created
```

#### Get Quality Tests

```
GET /api/farm/cycles/:id/quality-tests
Authorization: Bearer <token>

Response: 200 OK
```

### Dashboard

#### Get Farmer Dashboard

```
GET /api/farm/dashboard
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "activeCycles": {
      "count": 3,
      "cycles": [...]
    },
    "completedCycles": {
      "count": 5,
      "cycles": [...]
    },
    "statistics": {
      "totalYield": 750.5,
      "avgComplianceScore": 92
    }
  }
}
```

## Role-Based Access Control

### Roles and Permissions

| Role             | Create Cycle | View Own | View All | Record Activity | Compliance Check | Quality Test |
| ---------------- | ------------ | -------- | -------- | --------------- | ---------------- | ------------ |
| **Farmer**       | ✅           | ✅       | ❌       | ✅              | ❌               | ❌           |
| **Inspector**    | ❌           | ❌       | ✅       | ❌              | ✅               | ❌           |
| **Laboratorian** | ❌           | ❌       | ✅       | ❌              | ❌               | ✅           |
| **Admin**        | ✅           | ✅       | ✅       | ✅              | ✅               | ✅           |

## Usage Example

```javascript
const { initializeFarmManagement } = require('./modules/farm-management');

// Initialize module with dependencies
const farmModule = initializeFarmManagement({
  db: mongoDatabase,
  auth: authMiddleware,
});

// Mount routes in Express app
app.use('/api/farm', farmModule.router);

// Access service directly if needed
const farmService = farmModule.service;
const cycle = await farmService.createCultivationCycle({
  farmerId: 'farmer-123',
  farmerEmail: 'farmer@example.com',
  cropType: 'cannabis',
  variety: 'Thai Cannabis',
  plantingDate: new Date(),
});
```

## Integration with Other Modules

### Shared Module

- Uses `authMiddleware` from `modules/shared/middleware/`
- Uses `logger` from `modules/shared/utils/`
- Uses `response` utilities from `modules/shared/utils/`
- Uses `AppError` from `modules/shared/utils/`

### Auth Farmer Module

- Integrates with farmer authentication
- Uses farmer `userId` from JWT token
- Enforces farmer-specific access control

### Auth DTAM Module

- Integrates with DTAM staff roles (inspector, laboratorian, admin)
- Uses DTAM role-based permissions
- Inspector and laboratorian workflows

### Application Workflow Module

- Cultivation cycles linked to certification applications
- Compliance scores used in approval decisions
- Quality test results included in certificates

## Compliance Scoring

The module automatically calculates compliance scores based on inspector findings:

| Finding Severity | Score Penalty |
| ---------------- | ------------- |
| Critical         | -20 points    |
| Major            | -10 points    |
| Minor            | -5 points     |

**Base Score**: 100 points  
**Minimum Score**: 0 points  
**Certification Threshold**: 80 points

## Data Model

### CultivationCycle Schema

```javascript
{
  id: String (UUID),
  farmerId: String (required, indexed),
  farmerEmail: String (required),
  cropType: 'cannabis' | 'hemp' | 'medicinal_cannabis',
  variety: String,
  plantingDate: Date (required),
  status: 'planning' | 'active' | 'harvesting' | 'completed' | 'cancelled',
  phase: 'germination' | 'vegetative' | 'flowering' | 'harvest' | 'post-harvest',
  area: {
    value: Number,
    unit: 'sqm' | 'rai' | 'hectare'
  },
  plantCount: Number,
  activities: Array<Activity>,
  complianceChecks: Array<ComplianceCheck>,
  complianceScore: {
    score: Number,
    lastUpdated: Date,
    breakdown: Object
  },
  harvestData: Object,
  completionData: Object,
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    version: Number
  }
}
```

## Testing

Run module tests:

```bash
npm test -- farm-management
```

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `uuid` - UUID generation
- `express-validator` - Input validation
- Shared module utilities

## Migration Notes

This module was migrated from:

- **Source**: `routes/api/farm-management.js` (485 lines)
- **Migration Date**: Phase 5 - Core Modules
- **Changes**:
  - Separated concerns (routes, controllers, services, models)
  - Added validators for input validation
  - Integrated with shared module utilities
  - Enhanced error handling
  - Added comprehensive documentation
  - Standardized response format

## Support

For issues or questions:

1. Check module tests for usage examples
2. Review API documentation above
3. Contact development team

---

**Module Version**: 1.0.0  
**Last Updated**: Phase 5 Migration  
**Maintainer**: GACP Development Team
