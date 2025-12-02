# 🏗️ GACP Platform - Architecture Decision Record (ADR)

**Date**: October 13, 2025  
**Status**: ✅ **APPROVED**  
**Decision By**: PM (Product Manager)

---

## 📋 Context

**Current Problems**:

- 6 frontend folders (confusing structure)
- Inconsistent naming
- Duplicate code across frontends
- Hard to maintain and scale

**Need**:

- Professional, scalable architecture
- Easy to maintain
- Share code between modules
- Clear separation of concerns
- Future-proof (ready for microservices)

---

## 🎯 Decision: **Modular Monolith with Monorepo**

### Architecture Type: **Domain-Driven Modular Structure**

---

## 📁 Part 1: Frontend Architecture (Monorepo)

### Structure Overview

```
gacp-certify-flow/
│
├── apps/                           # 🎯 Frontend Applications
│   ├── web-farmer-portal/          # Farmer Portal (Public)
│   ├── web-dtam-admin/             # DTAM Admin Portal
│   ├── web-survey-system/          # Survey System
│   ├── web-trace-public/           # Track & Trace Public
│   ├── web-certificate-admin/      # Certificate Management
│   ├── web-standards-portal/       # Standards Comparison
│   └── web-farm-management/        # Farm Management
│
├── packages/                       # 📦 Shared Packages
│   ├── ui-components/              # Shared UI Components
│   ├── ui-farmer-components/       # Farmer-specific components
│   ├── ui-dtam-components/         # DTAM-specific components
│   ├── shared-utils/               # Utility functions
│   ├── shared-hooks/               # React hooks
│   ├── shared-types/               # TypeScript types
│   ├── shared-api-client/          # API client
│   └── shared-config/              # Config files
│
├── backend/                        # 🔧 Backend (see Part 2)
│
├── docs/                           # 📚 Documentation
├── scripts/                        # 🛠️ Build/Deploy scripts
├── package.json                    # Root package.json (Monorepo)
├── turbo.json                      # Turborepo config
└── pnpm-workspace.yaml            # PNPM workspaces
```

---

## 🎨 Frontend Apps Details

### 1. **web-farmer-portal** (Main Public Portal)

```
apps/web-farmer-portal/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── applications/
│   │   │   ├── documents/
│   │   │   ├── certificates/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── components/             # App-specific components
│   ├── features/               # Feature modules
│   ├── hooks/                  # App-specific hooks
│   └── utils/                  # App-specific utils
├── public/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript, Material-UI
**Port**: 3000
**Users**: Farmers
```

### 2. **web-dtam-admin** (DTAM Admin Portal)

```
apps/web-dtam-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # No registration
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── applications/   # Review applications
│   │   │   ├── farmers/        # Manage farmers
│   │   │   ├── certificates/   # Issue certificates
│   │   │   ├── compliance/     # Compliance monitoring
│   │   │   ├── reports/        # System reports
│   │   │   └── users/          # Staff management
│   │   └── layout.tsx
│   ├── components/
│   ├── features/
│   └── utils/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript, Material-UI
**Port**: 3001
**Users**: DTAM Staff (Admin, Reviewer, Manager)
```

### 3. **web-survey-system** (Survey Module)

```
apps/web-survey-system/
├── src/
│   ├── app/
│   │   ├── surveys/
│   │   ├── responses/
│   │   └── analytics/
│   └── components/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript
**Port**: 3002
**Users**: Farmers + DTAM
```

### 4. **web-trace-public** (Track & Trace)

```
apps/web-trace-public/
├── src/
│   ├── app/
│   │   ├── track/
│   │   ├── verify/
│   │   └── history/
│   └── components/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript
**Port**: 3003
**Users**: Public (No login required)
```

### 5. **web-certificate-admin** (Certificate Management)

```
apps/web-certificate-admin/
├── src/
│   ├── app/
│   │   ├── certificates/
│   │   ├── templates/
│   │   └── issuance/
│   └── components/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript
**Port**: 3004
**Users**: DTAM Certificate Team
```

### 6. **web-standards-portal** (Standards Comparison)

```
apps/web-standards-portal/
├── src/
│   ├── app/
│   │   ├── standards/
│   │   ├── compare/
│   │   └── reports/
│   └── components/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript
**Port**: 3005
**Users**: DTAM + Public
```

### 7. **web-farm-management** (Farm Management)

```
apps/web-farm-management/
├── src/
│   ├── app/
│   │   ├── farms/
│   │   ├── cultivation/
│   │   └── harvest/
│   └── components/
├── package.json
└── next.config.js

**Tech Stack**: Next.js 14, TypeScript
**Port**: 3006
**Users**: Farmers
```

---

## 📦 Shared Packages Details

### 1. **ui-components** (Shared UI)

```typescript
packages/ui-components/
├── src/
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Table/
│   ├── Modal/
│   ├── Form/
│   └── index.ts
├── package.json
└── tsconfig.json

// Usage in apps:
import { Button, Card, Table } from '@gacp/ui-components';
```

### 2. **ui-farmer-components** (Farmer-specific)

```typescript
packages/ui-farmer-components/
├── src/
│   ├── FarmerDashboard/
│   ├── ApplicationForm/
│   ├── DocumentUpload/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. **ui-dtam-components** (DTAM-specific)

```typescript
packages/ui-dtam-components/
├── src/
│   ├── ReviewPanel/
│   ├── ApprovalWorkflow/
│   ├── ComplianceChecklist/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. **shared-api-client** (API Client)

```typescript
packages/shared-api-client/
├── src/
│   ├── clients/
│   │   ├── auth.client.ts
│   │   ├── application.client.ts
│   │   ├── farm.client.ts
│   │   └── certificate.client.ts
│   ├── types/
│   └── index.ts
├── package.json
└── tsconfig.json

// Usage:
import { authClient, applicationClient } from '@gacp/api-client';
```

### 5. **shared-types** (TypeScript Types)

```typescript
packages/shared-types/
├── src/
│   ├── api/
│   │   ├── request.types.ts
│   │   └── response.types.ts
│   ├── models/
│   │   ├── farmer.types.ts
│   │   ├── application.types.ts
│   │   └── certificate.types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 🔧 Part 2: Backend Architecture (Modular Monolith)

### Structure Overview

```
backend/
│
├── core/                           # 🎯 Core Infrastructure
│   ├── config/
│   │   ├── database.config.js
│   │   ├── jwt.config.js
│   │   ├── env.config.js
│   │   └── index.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   ├── validation.middleware.js
│   │   └── index.js
│   ├── utils/
│   │   ├── date.util.js
│   │   ├── crypto.util.js
│   │   ├── validator.util.js
│   │   ├── response.util.js
│   │   └── index.js
│   └── database/
│       ├── connection.js
│       ├── seeder.js
│       └── migrations/
│
├── modules/                        # 📦 Domain Modules
│   ├── auth/
│   │   ├── auth.model.js
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   ├── auth.validation.js
│   │   └── index.js
│   │
│   ├── application/
│   │   ├── application.model.js
│   │   ├── application.controller.js
│   │   ├── application.service.js
│   │   ├── application.workflow.js
│   │   ├── application.routes.js
│   │   └── index.js
│   │
│   ├── farm/
│   │   ├── farm.model.js
│   │   ├── farm.controller.js
│   │   ├── farm.service.js
│   │   ├── farm.routes.js
│   │   └── index.js
│   │
│   ├── trace/
│   │   ├── trace.model.js
│   │   ├── trace.controller.js
│   │   ├── trace.service.js
│   │   ├── trace.blockchain.js      # Blockchain integration
│   │   ├── trace.routes.js
│   │   └── index.js
│   │
│   ├── survey/
│   │   ├── survey.model.js
│   │   ├── survey.controller.js
│   │   ├── survey.service.js
│   │   ├── survey.analytics.js
│   │   ├── survey.routes.js
│   │   └── index.js
│   │
│   ├── certification/
│   │   ├── certificate.model.js
│   │   ├── certificate.controller.js
│   │   ├── certificate.service.js
│   │   ├── certificate.generator.js
│   │   ├── certificate.routes.js
│   │   └── index.js
│   │
│   ├── compliance/
│   │   ├── compliance.model.js
│   │   ├── compliance.controller.js
│   │   ├── compliance.service.js
│   │   ├── compliance.checker.js
│   │   ├── compliance.routes.js
│   │   └── index.js
│   │
│   ├── document/
│   │   ├── document.model.js
│   │   ├── document.controller.js
│   │   ├── document.service.js
│   │   ├── document.storage.js      # S3/File storage
│   │   ├── document.routes.js
│   │   └── index.js
│   │
│   ├── notification/
│   │   ├── notification.model.js
│   │   ├── notification.controller.js
│   │   ├── notification.service.js
│   │   ├── notification.email.js
│   │   ├── notification.sms.js
│   │   ├── notification.routes.js
│   │   └── index.js
│   │
│   └── analytics/
│       ├── analytics.controller.js
│       ├── analytics.service.js
│       ├── analytics.aggregator.js
│       ├── analytics.routes.js
│       └── index.js
│
├── api/                            # 🌐 API Gateway
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── application.routes.js
│   │   │   └── ...
│   │   └── v2/
│   │       └── index.js
│   └── controllers/
│       └── gateway.controller.js
│
├── eventbus/                       # 🔔 Event Bus (Optional)
│   ├── emitter.js
│   ├── subscribers/
│   │   ├── application.subscriber.js
│   │   ├── certificate.subscriber.js
│   │   └── notification.subscriber.js
│   └── index.js
│
├── jobs/                           # ⏰ Background Jobs
│   ├── schedulers/
│   │   ├── certificate.scheduler.js
│   │   ├── reminder.scheduler.js
│   │   └── cleanup.scheduler.js
│   └── workers/
│       └── email.worker.js
│
├── scripts/                        # 🛠️ Utility Scripts
│   ├── seed.js
│   ├── migrate.js
│   └── cleanup.js
│
├── tests/                          # 🧪 Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── app.js                          # Main Express app
├── server.js                       # Server entry point
├── package.json
└── ecosystem.config.js             # PM2 config
```

---

## 🗺️ Backend Module Mapping

| Domain                   | Module Folder   | API Prefix               | Description                |
| ------------------------ | --------------- | ------------------------ | -------------------------- |
| **Authentication**       | `auth`          | `/api/v1/auth/*`         | Login, Register, JWT       |
| **Application Workflow** | `application`   | `/api/v1/application/*`  | Submit, Review, Approve    |
| **Farm Management**      | `farm`          | `/api/v1/farm/*`         | Farm profiles, Cultivation |
| **Track & Trace**        | `trace`         | `/api/v1/trace/*`        | Blockchain tracking        |
| **Survey System**        | `survey`        | `/api/v1/survey/*`       | Survey forms, Responses    |
| **Certification**        | `certification` | `/api/v1/certificate/*`  | Certificate issuance       |
| **Compliance**           | `compliance`    | `/api/v1/compliance/*`   | Standards checking         |
| **Document**             | `document`      | `/api/v1/document/*`     | File upload/download       |
| **Notification**         | `notification`  | `/api/v1/notification/*` | Email, SMS, Push           |
| **Analytics**            | `analytics`     | `/api/v1/analytics/*`    | Reports, Statistics        |

---

## 🔗 Frontend ↔️ Backend Mapping

| Frontend App              | Backend Modules Used                                    | Primary API Routes                                                             |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **web-farmer-portal**     | auth, application, farm, document, certificate          | `/api/v1/auth/*`<br/>`/api/v1/application/*`<br/>`/api/v1/farm/*`              |
| **web-dtam-admin**        | auth, application, certification, compliance, analytics | `/api/v1/application/*`<br/>`/api/v1/certificate/*`<br/>`/api/v1/compliance/*` |
| **web-survey-system**     | survey, analytics                                       | `/api/v1/survey/*`                                                             |
| **web-trace-public**      | trace                                                   | `/api/v1/trace/*`                                                              |
| **web-certificate-admin** | certification, document                                 | `/api/v1/certificate/*`                                                        |
| **web-standards-portal**  | compliance, analytics                                   | `/api/v1/compliance/*`                                                         |
| **web-farm-management**   | farm, trace                                             | `/api/v1/farm/*`                                                               |

---

## 🏷️ Naming Conventions

### Frontend (Apps)

| Pattern                  | Example             | Purpose              |
| ------------------------ | ------------------- | -------------------- |
| `web-[domain]-[tech]`    | `web-farmer-portal` | Web applications     |
| `mobile-[domain]-[tech]` | `mobile-farmer-app` | Mobile apps (future) |
| `admin-[domain]`         | `admin-dtam`        | Admin portals        |

### Frontend (Packages)

| Pattern                 | Example                | Purpose                |
| ----------------------- | ---------------------- | ---------------------- |
| `ui-[scope]-components` | `ui-farmer-components` | UI component libraries |
| `shared-[feature]`      | `shared-api-client`    | Shared packages        |
| `@gacp/[package]`       | `@gacp/ui-components`  | NPM scope              |

### Backend (Modules)

| Pattern                  | Example                 | Purpose          |
| ------------------------ | ----------------------- | ---------------- |
| `[domain]`               | `auth`, `farm`, `trace` | Domain modules   |
| `[domain].model.js`      | `farm.model.js`         | Mongoose models  |
| `[domain].service.js`    | `farm.service.js`       | Business logic   |
| `[domain].controller.js` | `farm.controller.js`    | Request handlers |
| `[domain].routes.js`     | `farm.routes.js`        | API routes       |

---

## 🛠️ Technology Stack

### Frontend Monorepo

- **Build Tool**: Turborepo or Nx
- **Package Manager**: pnpm (recommended) or npm
- **Framework**: Next.js 14 (all apps)
- **Language**: TypeScript
- **UI Library**: Material-UI 5
- **State Management**: React Context API + Zustand
- **API Client**: Axios + React Query
- **Testing**: Jest + React Testing Library

### Backend

- **Runtime**: Node.js 24+
- **Framework**: Express 5
- **Database**: MongoDB 6
- **ODM**: Mongoose 8
- **Authentication**: JWT
- **Validation**: Joi or Yup
- **Testing**: Jest + Supertest
- **Process Manager**: PM2

---

## 📊 Benefits of This Architecture

### ✅ Advantages

1. **Code Reusability**
   - Share components across apps via `packages/`
   - Single source of truth for types, utils, API clients

2. **Maintainability**
   - Each app is isolated but shares common code
   - Easy to find and fix bugs

3. **Scalability**
   - Easy to add new apps or modules
   - Can extract any module into microservice later

4. **Developer Experience**
   - Clear structure, easy to onboard new devs
   - Fast builds with Turborepo caching
   - Type safety across entire codebase

5. **Deployment Flexibility**
   - Deploy all apps together (monolith)
   - Or deploy individually (distributed)

6. **Future-Proof**
   - Ready to migrate to microservices
   - Can add mobile apps easily
   - Can split frontend/backend teams

---

## ⚠️ Trade-offs

| Aspect                    | Downside                         | Mitigation                            |
| ------------------------- | -------------------------------- | ------------------------------------- |
| **Initial Setup**         | More complex than simple folders | Use starter templates (Nx, Turborepo) |
| **Learning Curve**        | Team needs to learn monorepo     | Good documentation + training         |
| **Build Time**            | Can be slower initially          | Use caching (Turborepo)               |
| **Dependency Management** | Need to manage shared versions   | Use workspace protocols               |

---

## 🚀 Migration Path (From Current State)

### Phase 1: Setup Monorepo (Week 1)

```bash
# 1. Install Turborepo
npx create-turbo@latest

# 2. Move existing frontends
mkdir -p apps/web-farmer-portal
cp -r frontend-nextjs/* apps/web-farmer-portal/

mkdir -p apps/web-dtam-admin
# Copy DTAM code

# 3. Create shared packages
mkdir -p packages/ui-components
mkdir -p packages/shared-types
mkdir -p packages/shared-api-client

# 4. Update package.json with workspaces
```

### Phase 2: Refactor Backend (Week 2)

```bash
# 1. Create modular structure
mkdir -p backend/core
mkdir -p backend/modules/{auth,application,farm,trace}

# 2. Move existing code into modules
# 3. Extract shared code to core/
# 4. Update imports
```

### Phase 3: Extract Shared Code (Week 3-4)

```bash
# 1. Move shared components to packages/ui-components
# 2. Create shared types
# 3. Create shared API client
# 4. Update all apps to use shared packages
```

---

## 📁 Final Structure Summary

```
gacp-certify-flow/
│
├── 📱 apps/                    # 7 Frontend Applications
│   ├── web-farmer-portal/
│   ├── web-dtam-admin/
│   ├── web-survey-system/
│   ├── web-trace-public/
│   ├── web-certificate-admin/
│   ├── web-standards-portal/
│   └── web-farm-management/
│
├── 📦 packages/                # 8 Shared Packages
│   ├── ui-components/
│   ├── ui-farmer-components/
│   ├── ui-dtam-components/
│   ├── shared-utils/
│   ├── shared-hooks/
│   ├── shared-types/
│   ├── shared-api-client/
│   └── shared-config/
│
├── 🔧 backend/                 # Backend (Modular Monolith)
│   ├── core/                   # Infrastructure
│   ├── modules/                # 10 Domain Modules
│   ├── api/                    # API Gateway
│   ├── eventbus/               # Events (optional)
│   ├── jobs/                   # Background jobs
│   ├── scripts/                # Utilities
│   └── server.js
│
├── 📚 docs/                    # Documentation
├── 🛠️ scripts/                 # Build/Deploy scripts
├── 🧪 tests/                   # E2E tests
│
├── package.json               # Root package.json
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml        # PNPM workspaces
└── README.md
```

---

## ✅ Decision Rationale

### Why This Architecture?

1. **Industry Best Practice** ✅
   - Used by Vercel, Netflix, Google
   - Proven at scale

2. **Team Collaboration** ✅
   - Clear boundaries between domains
   - Easy to assign ownership

3. **Performance** ✅
   - Fast builds with caching
   - Optimized deployments

4. **Flexibility** ✅
   - Start as monolith
   - Evolve to microservices

5. **Developer Experience** ✅
   - Easy to navigate
   - Fast feedback loops
   - Type safety everywhere

---

## 📝 Next Steps

### Immediate Actions

1. ✅ **Review and Approve** this architecture
2. ✅ **Setup Turborepo** or Nx
3. ✅ **Create folder structure**
4. ✅ **Migrate existing code**
5. ✅ **Update documentation**

### Timeline

- **Week 1**: Setup monorepo + migrate 2 apps
- **Week 2**: Refactor backend to modules
- **Week 3**: Extract shared packages
- **Week 4**: Complete migration + testing

---

## 📞 Contact

**Decision Owner**: PM (Product Manager)  
**Architecture Lead**: Technical Lead  
**Implementation Team**: Full-Stack Developers

---

**Status**: ✅ **APPROVED FOR IMPLEMENTATION**  
**Next Review**: After Phase 1 completion

---

_This architecture decision is based on:_

- _Current project needs_
- _Team capabilities_
- _Industry best practices_
- _Future scalability requirements_
