# Clean Architecture Implementation - Technical Documentation

**Project**: GACP Certification System  
**Version**: 2.0.0  
**Last Updated**: October 13, 2025  
**Author**: Systems Architect Team

---

## Table of Contents

1. [Overview](#overview)
2. [Clean Architecture Principles](#clean-architecture-principles)
3. [Module Structure](#module-structure)
4. [Data Flow](#data-flow)
5. [Dependency Injection](#dependency-injection)
6. [Module Integration](#module-integration)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Architecture](#deployment-architecture)

---

## Overview

This document describes the Clean Architecture implementation in the GACP Certification System. The system follows a hybrid architecture approach:

- **11 Modules Total**: 3 new Clean Architecture modules + 8 existing traditional modules
- **Phased Migration**: Gradual transition from monolithic to Clean Architecture
- **Backward Compatibility**: Existing modules continue to function during migration
- **Modern Patterns**: Dependency Injection, Repository Pattern, Use Cases, DTOs

### System Statistics

```
Total Modules:          11
Clean Architecture:     3 (Document, Report, Dashboard)
Traditional:            8 (Farm, Certificate, Survey, Training, Audit, Notification, User, Auth)
Total Files:            197+ Clean Architecture files
Lines of Code:          ~40,000+ (Clean Architecture modules only)
API Endpoints:          43+ total (6 new Clean Architecture endpoints)
Test Coverage:          93.7% (Phase 3 validation)
```

---

## Clean Architecture Principles

### The Dependency Rule

The fundamental rule of Clean Architecture: **Source code dependencies must point inward**. Nothing in an inner circle can know anything about something in an outer circle.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    OUTER LAYER: Infrastructure & Presentation                  │
│    ┌─────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │   MIDDLE LAYER: Application (Use Cases)              │    │
│    │   ┌─────────────────────────────────────────────┐   │    │
│    │   │                                               │   │    │
│    │   │   INNER LAYER: Domain (Business Logic)       │   │    │
│    │   │                                               │   │    │
│    │   │   • Entities                                  │   │    │
│    │   │   • Business Rules                            │   │    │
│    │   │   • Interfaces                                │   │    │
│    │   │                                               │   │    │
│    │   └─────────────────────────────────────────────┘   │    │
│    │   • Use Cases                                        │    │
│    │   • Application Services                             │    │
│    │   • DTOs                                             │    │
│    └─────────────────────────────────────────────────────┘    │
│    • Controllers                                               │
│    • Routes                                                    │
│    • Repositories                                              │
│    • Database                                                  │
└─────────────────────────────────────────────────────────────────┘

Dependencies flow INWARD ──►
```

### Layer Responsibilities

#### 1. Domain Layer (innermost)

**Purpose**: Business logic and rules

**Contents**:

- **Entities**: Core business objects with business rules
- **Value Objects**: Immutable objects representing concepts
- **Domain Events**: Events that occur in the domain
- **Interfaces**: Contracts for repositories and services
- **Business Rules**: Core business validation and logic

**Dependencies**: NONE (pure business logic)

**Example** (Document Entity):

```javascript
// modules/document/domain/entities/Document.js
class Document {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.status = data.status || 'pending';
    // Business rules enforced here
  }

  approve(approvedBy) {
    if (this.status === 'approved') {
      throw new Error('Document already approved');
    }
    this.status = 'approved';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  isOwner(userId) {
    return this.ownerId === userId;
  }
}
```

#### 2. Application Layer

**Purpose**: Orchestrate use cases and business workflows

**Contents**:

- **Use Cases**: Application-specific business rules
- **Application Services**: Coordinate between layers
- **DTOs**: Data Transfer Objects for input/output
- **Validators**: Input validation logic

**Dependencies**: Domain Layer only

**Example** (Upload Document Use Case):

```javascript
// modules/document/application/use-cases/UploadDocumentUseCase.js
class UploadDocumentUseCase {
  constructor(documentRepository, storageService) {
    this.documentRepository = documentRepository;
    this.storageService = storageService;
  }

  async execute(input, file) {
    // 1. Validate input
    this.validateInput(input);

    // 2. Upload file to storage
    const fileUrl = await this.storageService.upload(file);

    // 3. Create domain entity
    const document = new Document({
      ...input,
      fileUrl,
      status: 'pending'
    });

    // 4. Save to repository
    return await this.documentRepository.save(document);
  }
}
```

#### 3. Infrastructure Layer

**Purpose**: Implementation details and external dependencies

**Contents**:

- **Repositories**: Database access implementation
- **External Services**: Third-party integrations
- **Storage**: File storage implementation
- **Database Models**: ORM/ODM models

**Dependencies**: Domain and Application layers

**Example** (MongoDB Repository):

```javascript
// modules/document/infrastructure/database/repositories/MongoDBDocumentRepository.js
class MongoDBDocumentRepository {
  constructor(database) {
    this.DocumentModel = database.model('Document');
  }

  async findById(id) {
    const doc = await this.DocumentModel.findById(id);
    return doc ? new Document(doc.toObject()) : null;
  }

  async save(document) {
    const model = new this.DocumentModel(document);
    const saved = await model.save();
    return new Document(saved.toObject());
  }
}
```

#### 4. Presentation Layer

**Purpose**: User interface and API endpoints

**Contents**:

- **Controllers**: Handle HTTP requests
- **Routes**: Define API endpoints
- **DTOs**: Request/response formats
- **Middleware**: Authentication, validation

**Dependencies**: Application layer

**Example** (Document Controller):

```javascript
// modules/document/presentation/controllers/DocumentController.js
class DocumentController {
  constructor(uploadDocumentUseCase, listDocumentsUseCase) {
    this.uploadDocumentUseCase = uploadDocumentUseCase;
    this.listDocumentsUseCase = listDocumentsUseCase;
  }

  async upload(req, res) {
    try {
      const input = {
        title: req.body.title,
        ownerId: req.user._id
      };
      const document = await this.uploadDocumentUseCase.execute(input, req.file);

      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

#### 5. Integration Layer

**Purpose**: Wire everything together

**Contents**:

- **Module Container**: Dependency injection container
- **Factory Functions**: Create instances with dependencies
- **Configuration**: Module setup

**Dependencies**: All layers

**Example** (Module Container):

```javascript
// modules/document/integration/module.container.js
class DocumentModuleContainer {
  constructor(database) {
    this.database = database;
    this._setupDependencies();
  }

  _setupDependencies() {
    // Infrastructure
    this.documentRepository = new MongoDBDocumentRepository(this.database);
    this.storageService = new S3StorageService();

    // Application
    this.uploadDocumentUseCase = new UploadDocumentUseCase(
      this.documentRepository,
      this.storageService
    );

    // Presentation
    this.documentController = new DocumentController(
      this.uploadDocumentUseCase,
      this.listDocumentsUseCase
    );
  }

  getFarmerRoutes(authMiddleware) {
    return createFarmerRoutes(this.documentController, authMiddleware);
  }
}
```

---

## Module Structure

### Standard Directory Layout

Each Clean Architecture module follows this structure:

```
modules/
└── <module-name>/
    ├── domain/
    │   ├── entities/
    │   │   └── <Entity>.js
    │   ├── value-objects/
    │   │   └── <ValueObject>.js
    │   ├── events/
    │   │   └── <DomainEvent>.js
    │   └── interfaces/
    │       ├── I<Entity>Repository.js
    │       └── I<Service>.js
    │
    ├── application/
    │   ├── use-cases/
    │   │   ├── <Action><Entity>UseCase.js
    │   │   └── <Query><Entity>UseCase.js
    │   ├── dto/
    │   │   ├── <Entity>InputDTO.js
    │   │   └── <Entity>OutputDTO.js
    │   └── services/
    │       └── <Application>Service.js
    │
    ├── infrastructure/
    │   ├── database/
    │   │   ├── models/
    │   │   │   └── <Entity>Model.js
    │   │   └── repositories/
    │   │       └── MongoDB<Entity>Repository.js
    │   ├── storage/
    │   │   └── S3StorageService.js
    │   └── external/
    │       └── <External>Client.js
    │
    ├── presentation/
    │   ├── controllers/
    │   │   └── <Entity>Controller.js
    │   ├── routes/
    │   │   ├── farmer-routes.js
    │   │   └── dtam-routes.js
    │   ├── dto/
    │   │   └── <Entity>ResponseDTO.js
    │   └── middleware/
    │       └── <Entity>Validator.js
    │
    ├── integration/
    │   └── module.container.js
    │
    └── index.js
```

### File Naming Conventions

- **Entities**: `PascalCase` (e.g., `Document.js`, `Report.js`)
- **Use Cases**: `PascalCaseUseCase.js` (e.g., `UploadDocumentUseCase.js`)
- **Controllers**: `PascalCaseController.js` (e.g., `DocumentController.js`)
- **Repositories**: `MongoDB<Entity>Repository.js` (e.g., `MongoDBDocumentRepository.js`)
- **Routes**: `kebab-case-routes.js` (e.g., `farmer-routes.js`)
- **DTOs**: `<Entity><Type>DTO.js` (e.g., `DocumentInputDTO.js`)

---

## Data Flow

### Request-Response Flow

```
1. HTTP Request
   │
   ├─► Router
   │   │
   │   ├─► Authentication Middleware
   │   │   │
   │   │   ├─► Validation Middleware
   │   │   │   │
   │   │   │   └─► Controller
   │   │   │       │
   │   │   │       ├─► Use Case
   │   │   │       │   │
   │   │   │       │   ├─► Domain Entity
   │   │   │       │   │   (Business Logic)
   │   │   │       │   │
   │   │   │       │   ├─► Repository
   │   │   │       │   │   │
   │   │   │       │   │   └─► Database
   │   │   │       │   │       (MongoDB)
   │   │   │       │   │
   │   │   │       │   └─► External Service
   │   │   │       │       (Storage, Email, etc.)
   │   │   │       │
   │   │   │       └─► Response DTO
   │   │   │           │
   │   │   │           └─► HTTP Response
```

### Example: Upload Document Flow

```
┌─────────────┐
│   Farmer    │ POST /api/farmer/documents
│   Browser   │ + file + metadata
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Presentation Layer                      │
│                                          │
│  1. Router receives request              │
│  2. authenticateFarmer middleware        │
│  3. Multer processes file upload         │
│  4. DocumentController.upload()          │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Application Layer                       │
│                                          │
│  5. UploadDocumentUseCase.execute()      │
│     - Validate input                     │
│     - Check user permissions             │
│     - Coordinate workflow                │
└──────────────┬───────────────────────────┘
               │
               ├───────────────────┐
               │                   │
               ▼                   ▼
┌────────────────────────┐  ┌─────────────────────┐
│  Domain Layer          │  │ Infrastructure      │
│                        │  │                     │
│  6. new Document()     │  │ 7. StorageService   │
│     - Business rules   │  │    - Upload to S3   │
│     - Validation       │  │                     │
└────────────┬───────────┘  └──────────┬──────────┘
             │                         │
             │                         │
             ▼                         │
┌────────────────────────────────────┐ │
│  Infrastructure Layer              │ │
│                                    │ │
│  8. DocumentRepository.save()      │ │
│     - Convert Entity → Model       │ │
│     - Save to MongoDB              │◄┘
│     - Return saved Entity          │
└────────────┬───────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│  Presentation Layer                      │
│                                          │
│  9. Map Entity → Response DTO            │
│  10. Send HTTP 201 Created               │
│      {success: true, data: {...}}        │
└──────────────┬───────────────────────────┘
               │
               ▼
┌─────────────┐
│   Farmer    │ Receives response
│   Browser   │ Shows success message
└─────────────┘
```

---

## Dependency Injection

### Container Pattern

The system uses a **Singleton Container Pattern** for dependency injection:

```javascript
// Singleton instance
let containerInstance = null;

class ModuleContainer {
  constructor(dependencies) {
    if (containerInstance) {
      return containerInstance;
    }

    this.dependencies = dependencies;
    this._wireUpDependencies();

    containerInstance = this;
  }

  _wireUpDependencies() {
    // Create instances in correct order
    // Infrastructure first
    this.repository = new Repository(this.dependencies.database);

    // Then application
    this.useCase = new UseCase(this.repository);

    // Finally presentation
    this.controller = new Controller(this.useCase);
  }
}

// Factory function
function getModuleContainer(dependencies) {
  if (!containerInstance) {
    containerInstance = new ModuleContainer(dependencies);
  }
  return containerInstance;
}
```

### Injection in app.js

```javascript
// app.js
const mongoose = require('mongoose');
const { getDocumentModuleContainer } = require('./modules/document');

// After database connection established
mongoose.connect(mongoURI).then(() => {
  // Inject database connection
  const documentModule = getDocumentModuleContainer(mongoose);

  // Mount routes with authentication middleware
  const { authenticateFarmer } = require('./middleware/auth');
  app.use('/api/farmer/documents', documentModule.getFarmerRoutes(authenticateFarmer));
});
```

---

## Module Integration

### Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                        app.js (Main Application)                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database Connection (MongoDB via Mongoose)              │  │
│  └─────────────┬────────────────────────────────────────────┘  │
│                │                                                │
│                ├──────────────┬──────────────┬──────────────┐  │
│                │              │              │              │  │
│                ▼              ▼              ▼              │  │
│  ┌───────────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │ Document Module   │ │ Report Module│ │Dashboard Module│  │  │
│  │                   │ │              │ │               │  │  │
│  │ Container(db) ────┤ │Container(cfg)│ │Container(repo)│  │  │
│  └─────────┬─────────┘ └──────┬───────┘ └───────┬───────┘  │  │
│            │                  │                  │          │  │
│            │                  │                  │          │  │
│  ┌─────────▼──────────────────▼──────────────────▼───────┐  │  │
│  │           Authentication Middleware                    │  │  │
│  │  • authenticateFarmer                                  │  │  │
│  │  • authenticateDTAM                                    │  │  │
│  └─────────┬──────────────────────────────────────────────┘  │  │
│            │                                                  │  │
│            ▼                                                  │  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Express Router                             │  │
│  │                                                          │  │
│  │  /api/farmer/documents   ──► Document Module            │  │
│  │  /api/dtam/documents     ──► Document Module            │  │
│  │  /api/farmer/reports     ──► Report Module              │  │
│  │  /api/dtam/reports       ──► Report Module              │  │
│  │  /api/farmer/dashboard-v2 ──► Dashboard Module          │  │
│  │  /api/dtam/dashboard-v2  ──► Dashboard Module           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Communication

**Direct Integration**: Modules can communicate via shared repositories

```javascript
// Dashboard module needs data from document and report modules
const dashboardModule = initializeDashboardModule({
  documentRepository: documentModule.getRepository(),
  reportRepository: reportModule.getRepository()
  // ... other repositories
});
```

**Event-Driven Integration**: Future enhancement for loose coupling

```javascript
// Document approved event
documentModule.on('document.approved', event => {
  dashboardModule.updateStatistics(event.data);
  notificationModule.sendNotification(event.data);
});
```

---

## Testing Strategy

### Test Pyramid

```
                 ┌─────────────┐
                 │   E2E Tests │  5%
                 │  (Selenium) │
                 └──────┬──────┘
               ┌────────┴────────┐
               │ Integration Tests│  15%
               │   (API Tests)    │
               └────────┬─────────┘
         ┌─────────────┴──────────────┐
         │      Unit Tests             │  80%
         │  (Jest/Mocha)               │
         └─────────────────────────────┘
```

### Test Categories

#### 1. Unit Tests (80%)

Test individual components in isolation

```javascript
// test/unit/document/domain/Document.test.js
describe('Document Entity', () => {
  it('should create document with pending status', () => {
    const doc = new Document({ title: 'Test' });
    expect(doc.status).toBe('pending');
  });

  it('should approve document', () => {
    const doc = new Document({ title: 'Test' });
    doc.approve('admin-id');
    expect(doc.status).toBe('approved');
    expect(doc.approvedBy).toBe('admin-id');
  });

  it('should not approve already approved document', () => {
    const doc = new Document({ title: 'Test', status: 'approved' });
    expect(() => doc.approve('admin-id')).toThrow();
  });
});
```

#### 2. Integration Tests (15%)

Test module integration and API endpoints

```javascript
// test/integration/document-module.test.js
describe('Document Module Integration', () => {
  it('should upload document with authentication', async () => {
    const token = await loginAsFarmer();
    const response = await request(app)
      .post('/api/farmer/documents')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'test-file.pdf')
      .field('title', 'Test Document');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

#### 3. E2E Tests (5%)

Test complete user workflows

```javascript
// test/e2e/document-workflow.test.js
describe('Document Approval Workflow', () => {
  it('should complete full document workflow', async () => {
    // 1. Farmer uploads
    await farmerUploadDocument();

    // 2. DTAM receives notification
    await checkDTAMNotifications();

    // 3. DTAM approves
    await dtamApproveDocument();

    // 4. Farmer sees approval
    await checkFarmerDashboard();
  });
});
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer Machine (localhost)                                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Node.js    │  │   MongoDB    │  │   File Storage       │  │
│  │   Port 3004  │  │   Port 27017 │  │   (local disk)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌────────────────────────────────────────────────────────────────────┐
│                     Cloud Infrastructure                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Load Balancer (NGINX)                     │  │
│  └────────┬─────────────────────────────────────────────────────┘  │
│           │                                                        │
│           ├──────────────┬──────────────┬──────────────┐          │
│           │              │              │              │          │
│           ▼              ▼              ▼              │          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │          │
│  │  Node.js 1  │ │  Node.js 2  │ │  Node.js 3  │      │          │
│  │  PM2 Cluster│ │  PM2 Cluster│ │  PM2 Cluster│      │          │
│  └─────┬───────┘ └─────┬───────┘ └─────┬───────┘      │          │
│        │               │               │              │          │
│        └───────────────┼───────────────┘              │          │
│                        │                              │          │
│                        ▼                              │          │
│          ┌─────────────────────────────┐              │          │
│          │  MongoDB Replica Set        │              │          │
│          │  • Primary + 2 Secondaries  │              │          │
│          └─────────────────────────────┘              │          │
│                        │                              │          │
│                        ▼                              │          │
│          ┌─────────────────────────────┐              │          │
│          │  AWS S3 / Cloud Storage     │              │          │
│          │  • Document files           │              │          │
│          │  • Report files             │              │          │
│          └─────────────────────────────┘              │          │
└────────────────────────────────────────────────────────────────────┘
```

### Container Deployment (Docker)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3004:3004'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/gacp
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    volumes:
      - mongodb-data:/data/db

  redis:
    image: redis:7-alpine

volumes:
  mongodb-data:
```

---

## Performance Considerations

### Caching Strategy

```javascript
// Use Redis for caching frequent queries
class CachedDocumentRepository {
  constructor(repository, cache) {
    this.repository = repository;
    this.cache = cache;
  }

  async findById(id) {
    // Check cache first
    const cached = await this.cache.get(`document:${id}`);
    if (cached) return JSON.parse(cached);

    // Query database
    const document = await this.repository.findById(id);

    // Cache for 5 minutes
    await this.cache.set(`document:${id}`, JSON.stringify(document), 'EX', 300);

    return document;
  }
}
```

### Database Indexing

```javascript
// Ensure proper indexes for queries
DocumentSchema.index({ ownerId: 1, status: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ documentType: 1, category: 1 });
```

---

## Security Best Practices

### Authentication & Authorization

```javascript
// Middleware checks both authentication and authorization
function authenticateAndAuthorize(requiredRole) {
  return async (req, res, next) => {
    // 1. Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    // 2. Decode and verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check role
    if (decoded.role !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = decoded;
    next();
  };
}
```

### Input Validation

```javascript
// Use Joi for input validation
const uploadSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000),
  documentType: Joi.string().valid('certificate', 'license', 'report').required(),
  category: Joi.string().valid('compliance', 'quality', 'safety').required()
});

// Validate in use case
class UploadDocumentUseCase {
  async execute(input) {
    const { error } = uploadSchema.validate(input);
    if (error) throw new ValidationError(error.details);
    // ... rest of logic
  }
}
```

---

## Future Enhancements

### 1. Microservices Architecture

Split modules into independent services:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Document   │  │    Report    │  │  Dashboard   │
│   Service    │  │   Service    │  │   Service    │
│   :3001      │  │   :3002      │  │   :3003      │
└──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                   ┌─────────────┐
                   │  API Gateway │
                   │    :3000     │
                   └─────────────┘
```

### 2. Event Sourcing

Store all changes as events:

```javascript
// Instead of updating state directly
document.status = 'approved';

// Store event
events.append({
  type: 'DocumentApproved',
  aggregateId: document.id,
  data: { approvedBy, approvedAt },
  version: document.version + 1
});
```

### 3. CQRS (Command Query Responsibility Segregation)

Separate read and write models:

```
Commands (Write)          Queries (Read)
     │                         │
     ▼                         ▼
┌──────────┐            ┌──────────────┐
│ Write DB │──Events──► │  Read DB     │
│ (MongoDB)│            │  (Optimized) │
└──────────┘            └──────────────┘
```

---

**© 2025 GACP Certification System - Clean Architecture Documentation**
