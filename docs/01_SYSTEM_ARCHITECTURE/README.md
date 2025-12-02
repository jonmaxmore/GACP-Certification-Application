# 🏗️ 01 - System Architecture

**Category**: Technical Architecture & System Design  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains all technical architecture documents, system design specifications, and architectural decisions for the GACP platform.

---

## 📚 Documents in this Folder

### 1. ⭐⭐⭐ [FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md](./FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md)

**Must Read** - Current system reference (100% accurate)

**Contents:**

- Complete system overview
- 2 Builds architecture (Farmer + DTAM)
- All features and modules
- Payment system (30,000 THB)
- DTAM workflow (3 departments)
- SOP Tracking (Seed to Sale)
- Free services

**Who should read:** Everyone (mandatory reference)

---

### 2. ⭐⭐ [SA_SE_SYSTEM_ARCHITECTURE.md](./SA_SE_SYSTEM_ARCHITECTURE.md)

Complete technical architecture from SA + SE

**Contents:**

- Detailed system breakdown
- Data flow diagrams
- State machines (Application, Job, Payment)
- API design patterns
- Business logic rules
- Technology stack decisions
- Database schema design
- Security architecture
- Implementation strategy
- Deployment architecture
- Monitoring & observability

**Who should read:** SA, SE, MIS

---

### 3. ⭐⭐ [MICROSERVICES_ARCHITECTURE_GUIDE.md](./MICROSERVICES_ARCHITECTURE_GUIDE.md)

Complete microservices implementation guide

**Contents:**

- Overview of 16 microservices
- Migration strategy (Monolith → Hybrid → Microservices)
- Service decomposition
- Communication patterns (REST + RabbitMQ)
- Data management (Saga, Event Sourcing, CQRS)
- Service implementation templates
- API Gateway (Kong)
- Service Discovery (Kubernetes)
- Deployment & orchestration
- Monitoring & observability
- Best practices
- Migration roadmap (12 months)

**Who should read:** SE (Backend), MIS

---

### 4. [SYSTEM_OVERVIEW_COMPLETE.md](./SYSTEM_OVERVIEW_COMPLETE.md)

Comprehensive system overview

**Contents:**

- System components
- Module breakdown
- Integration points
- Technology overview
- Deployment overview

**Who should read:** All developers

---

### 5. [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md)

Architectural decisions and rationale

**Contents:**

- Technology choices
- Architecture patterns
- Decision records (ADR)
- Trade-offs analysis
- Future considerations

**Who should read:** SA, SE, Team Leads

---

### 6. [01_System_Overview.md](./01_System_Overview.md)

Official system overview document

**Contents:**

- System introduction
- High-level architecture
- Key features
- Technology stack

**Who should read:** Stakeholders, New team members

---

## 🎯 Quick Start Guide

### For New Team Members:

```
1. Read: FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md (30 min)
2. Read: 01_System_Overview.md (15 min)
3. Skim: SA_SE_SYSTEM_ARCHITECTURE.md (focus on your area)
4. Bookmark: All documents for reference
```

### For Backend Developers:

```
1. Read: FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md
2. Deep dive: SA_SE_SYSTEM_ARCHITECTURE.md (API design, Database)
3. Study: MICROSERVICES_ARCHITECTURE_GUIDE.md
4. Reference: ARCHITECTURE_DECISION.md
```

### For Frontend Developers:

```
1. Read: FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md
2. Focus: SA_SE_SYSTEM_ARCHITECTURE.md (Data flow, State machines)
3. Check: API endpoints and data structures
4. See also: ../06_FRONTEND/ for UI specifics
```

### For System Analysts:

```
1. Review: FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md (verify accuracy)
2. Study: SA_SE_SYSTEM_ARCHITECTURE.md (business logic)
3. Document: Any changes in ARCHITECTURE_DECISION.md
```

---

## 🏗️ System Architecture Summary

### 2 Builds:

**Build 1: Farmer Portal (Port 3001)**

```
Login 1: Application Module
- Submit GACP application
- Upload documents
- Payment (Phase 1: 5,000฿ + Phase 2: 25,000฿)
- Track status
- Download certificate

Login 2: Farm Management
- Create/manage farms
- SOP Tracking (5 steps: Seed to Sale)
- Chemical registry
- QR Code generation
- Compliance checking
```

**Build 2: DTAM Portal (Port 3002)**

```
4 Roles (Single portal):
- Reviewer: Review applications
- Inspector: Farm inspection (30+ checklist)
- Approver: Final approval, certificate issuance
- Admin: System management, analytics, reports
```

**Free Services (Public)**

```
- Survey System
- Standards Comparison (GACP vs others)
- Track & Trace (QR scanner)
```

---

## 💻 Technology Stack

### Frontend:

```
Framework: Next.js 15 (React 18)
Styling: TailwindCSS + Material-UI
Language: TypeScript
State: Zustand
Forms: React Hook Form + Zod
HTTP: Axios + React Query
```

### Backend:

```
Runtime: Node.js 20 LTS
Framework: Express.js
Database: MongoDB 7.0
Cache: Redis 7.2
Queue: RabbitMQ 3.12
ORM: Mongoose
Testing: Jest + Supertest
```

### Infrastructure:

```
Container: Docker + Kubernetes
CI/CD: GitHub Actions + ArgoCD
API Gateway: Kong
Monitoring: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Tracing: Jaeger
```

---

## 📊 Architecture Decisions

### Key Decisions:

1. **Monolith-first → Microservices** (Progressive migration)
2. **MongoDB** for flexibility (vs SQL)
3. **Next.js 15** for SSR + API routes
4. **RabbitMQ** for async communication
5. **Redis** for caching + sessions
6. **Kubernetes** for orchestration

### Migration Strategy:

```
Month 1-3:  Modular Monolith (MVP)
Month 4-6:  Hybrid (Extract critical services)
Month 7-12: Full Microservices (16 services)
```

---

## 🔗 Related Documentation

- **Project Plan**: [../00_PROJECT_OVERVIEW/COMPLETE_TEAM_PROJECT_PLAN.md](../00_PROJECT_OVERVIEW/COMPLETE_TEAM_PROJECT_PLAN.md)
- **Team Discussions**: [../02_TEAM_DISCUSSIONS/](../02_TEAM_DISCUSSIONS/)
- **Workflows**: [../03_WORKFLOWS/](../03_WORKFLOWS/)
- **Database**: [../04_DATABASE/](../04_DATABASE/)
- **Deployment**: [../05_DEPLOYMENT/](../05_DEPLOYMENT/)

---

## 📞 Contact

**System Architect:**

- คุณสมศักดิ์ (SA Lead) - somsak@gacp.go.th

**Software Engineer:**

- คุณสมบูรณ์ (SE Lead) - somboon@gacp.go.th

**Questions about architecture?**

- Slack: #gacp-architecture
- Email: architecture-team@gacp.go.th

---

## 📝 Document Status

| Document                                 | Status     | Last Updated | Version |
| ---------------------------------------- | ---------- | ------------ | ------- |
| FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md | ✅ Current | Oct 15, 2025 | 2.0     |
| SA_SE_SYSTEM_ARCHITECTURE.md             | ✅ Current | Oct 15, 2025 | 1.0     |
| MICROSERVICES_ARCHITECTURE_GUIDE.md      | ✅ Current | Oct 15, 2025 | 1.0     |
| SYSTEM_OVERVIEW_COMPLETE.md              | ✅ Current | Oct 13, 2025 | 1.0     |
| ARCHITECTURE_DECISION.md                 | ✅ Current | Oct 12, 2025 | 1.0     |

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Project Overview](../00_PROJECT_OVERVIEW/)
- ➡️ [Next: Team Discussions](../02_TEAM_DISCUSSIONS/)
