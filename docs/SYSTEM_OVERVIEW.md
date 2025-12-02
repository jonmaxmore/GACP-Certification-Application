# System Overview

Date: October 31, 2025

## Purpose

Provide a consolidated description of portals, backend services, data stores, and infrastructure supporting the Botanical Audit Framework ahead of production deployment.

## ภาพรวมโครงการระบบบริหารจัดการกัญชาทางการแพทย์

เว็บไซต์มีสองชุดระบบหลัก (Build) ที่ทำงานแยกจากกันแต่ใช้สถาปัตยกรรมแบบโมดูลาร์:

### 📱 Build 1: ระบบสำหรับเกษตรกร (Farmer Portal)

1. **ระบบสมาชิก (Member Management System):** จัดการข้อมูลสมาชิกเกษตรกรผู้ปลูกกัญชา
2. **ระบบยื่นเอกสารขออนุญาตปลูกกัญชา (License Application System):** ยื่นคำขอและจัดการเอกสารออนไลน์
3. **ระบบติดตามย้อนกลับ (Traceability System):** ติดตามสินค้าผ่านรหัสอ้างอิงและรองรับการสแกน QR Code
4. **ระบบบริหารจัดการฟาร์มกัญชา (Cannabis Farm Management System):** จัดการข้อมูลการเพาะปลูกและออก QR Code สำหรับการติดตาม
5. **ระบบแบบสอบถาม (Survey System):** สร้างและจัดการแบบสอบถามตรวจประเมิน
6. **ระบบเปรียบเทียบมาตรฐาน (Standard Comparison System):** เปรียบเทียบมาตรฐาน GACP กับ WHO/FDA และ ASEAN

ระบบ Login ของ Build นี้แยกเป็นสองส่วน: ระบบยื่นเอกสาร และระบบบริหารฟาร์ม

### 🏛️ Build 2: ระบบสำหรับกรมการแพทย์แผนไทยและการแพทย์ทางเลือก (Government Portal)

1. **ระบบ Login สำหรับเจ้าหน้าที่:** รองรับการเข้าใช้งานของบุคลากรภาครัฐ
2. **Admin Panel / Dashboard:** ควบคุมการอนุมัติคำขอ, ตรวจสอบข้อมูลฟาร์ม, จัดการสมาชิก, ดูรายงานและสถิติ, ตรวจสอบการติดตามย้อนกลับ และบริหารการตั้งค่าระบบ

### หมายเหตุด้านเทคนิค

- โค้ดสำหรับทุกระบบพัฒนาเสร็จสมบูรณ์แล้ว
- แต่ละระบบแยกทำงานอย่างอิสระ (Modular Architecture)
- ระบบ Authentication แยกตามบทบาทผู้ใช้งานในแต่ละ Build

## Portals & Modules

| Portal / Module | Description | Tech Stack | Primary Routes | Notes |
|-----------------|-------------|-----------|----------------|-------|
| Farmer Portal | Farmer-facing workflow for GACP applications, document upload, farm management, status tracking. | Next.js, TypeScript, Material UI | `/farmer/dashboard`, `/farmer/applications`, `/farmer/application/create`, `/farmer/certificates` | Uses shared `FarmerLayout`, AuthContext, pending certificate detail wiring. |
| Admin Portal | Internal dashboard for approvals, analytics, inspector assignment. | Next.js, TypeScript, Material UI, Charting libs | `/admin/dashboard`, `/admin/applications`, `/admin/statistics` | Charts depend on analytics APIs; verify post-deploy. |
| Certificate Portal | Public verification and certificate detail view with QR support. | Next.js, TypeScript, Material UI | `/verify`, `/certificates/:id` | Verify page functional; detail page UI pending finalization. |
| Track & Trace System | Traceability search by QR / lot number. | Node backend ready; frontend TBD | `/trace`, `/trace/:id` | Requires new UI table + search route. |
| Survey System | Inspector inspection form and report viewer. | Next.js planned | `/inspector/surveys`, `/inspector/reports` | UI build scheduled Sprint Week 2–3. |
| GACP Comparison Module | Compliance score comparison dashboard. | TBD (Next.js + charts) | `/analytics/comparison` | Uses backend aggregations to compare cohorts. |

## Backend Services

| Service | Location | Responsibilities | Key Endpoints |
|---------|----------|------------------|---------------|
| Application Service | `apps/backend/modules/application` | Manage farmer applications, status transitions, certificate generation hooks. | `/api/applications`, `/api/applications/:id`, `/api/applications/:id/assign` |
| Inspection Service | `apps/backend/modules/application` & `apps/backend/modules/inspection` | Inspector assignments, survey submission, compliance scoring. | `/api/inspections`, `/api/inspections/:id`, `/api/inspections/:id/complete` |
| Certificate Service | `apps/backend/modules/certificate` | Issue, verify, revoke certificates; QR metadata. | `/api/certificates`, `/api/certificates/verify`, `/api/certificates/:id/download` |
| Traceability Service | `apps/backend/modules/track-trace` | Track batches across supply chain events. | `/api/trace`, `/api/trace/:id` |
| Auth Service | `apps/backend/modules/auth` | Role-based authentication, JWT issuance, token validation. | `/api/auth/login`, `/api/auth/refresh` |

## Data Stores

| Store | Usage | Notes |
|-------|-------|-------|
| MongoDB Atlas (or EC2-hosted) | Primary transactional store for users, farms, applications, inspections, certificates. | Current environment uses seeded data; plan to leverage free tier to avoid costs year one. |
| Redis (Local container) | Session cache / rate-limiting placeholder. | Replace Elasticache with local container during pilot. |
| S3 + CloudFront | Static asset hosting for portals, certificate PDFs, document uploads. | Configure CloudFront distribution IDs post-deploy. |

## Infrastructure Overview

- **Provisioning:** Terraform modules under `infrastructure/aws` for VPC, ECS, ALB, Redis, S3.
- **Containers:** Backend service built via `Dockerfile.backend`; ECS Fargate tasks fetch from ECR.
- **CI/CD:** Husky pre-commit hooks (lint + tests); manual deployment script sequence documented in `FINAL_DEPLOYMENT_CHECKLIST.md`.
- **Monitoring:** CloudWatch logs aggregated per ECS service; ensure log groups exported in verification report.

## Authentication & Authorization

- JWT tokens stored as `authToken` in browser storage.
- Role separation enforced via AuthContext on frontend and middleware on backend.
- QA to revalidate: Farmer, Inspector, Admin flows; ensure unauthorized access returns 403.

## Upcoming Work (Week 2–3 Sprint)

| Task | Owner | ETA | Status |
|------|-------|-----|--------|
| Certificate portal detail + verify completion | Frontend Dev | +2 days | ⏳ |
| Track & Trace UI implementation | Frontend Dev | +3 days | ⏳ |
| Survey UI (form + report) | Frontend Dev | +4 days | ⏳ |
| GACP comparison dashboard | Frontend Dev | +5 days | ⏳ |
| TypeScript cleanup + documentation refresh | Full-stack Dev | +2 days | ⏳ |

## Verification & Testing Artifacts

- `FINAL_VERIFICATION_REPORT.md` – portal status, screenshots, API logs.
- `INTEGRATION_TEST_RESULTS.md` – multi-role workflows, automated suites.
- `FINAL_DEPLOYMENT_CHECKLIST.md` – infrastructure and deployment evidence.

## Release Readiness Checklist

1. All portals pass smoke tests (no blank routes).
2. Integration flow completes from application submission to certificate verification.
3. Terraform apply executed against staging/production with documented plan.
4. Docker images pushed to ECR with tagged versions; ECS services updated.
5. Static assets served via cost-optimized stack (S3 + CloudFront free tier during pilot).
6. Secrets managed via AWS Secrets Manager; `secrets-audit.js` returns no hard-coded values.
7. Tag repository `v1.0.0-production-ready` once satisfied.

## Contacts

- **Product Owner:** _Name / Email_
- **Engineering Lead:** _Name / Email_
- **DevOps Lead:** _Name / Email_
- **QA Lead:** _Name / Email_
