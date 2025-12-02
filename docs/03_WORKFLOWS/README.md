# 🔄 03 - Workflows

**Category**: Business Workflows & Processes  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains all business workflow documentation, including DTAM processes, inspector workflows, and payment flows.

---

## 📚 Documents in this Folder

### 1. ⭐⭐ [DTAM_WORKFLOW_STANDARD_OFFICIAL.md](./DTAM_WORKFLOW_STANDARD_OFFICIAL.md)

Official DTAM workflow (3 departments)

**Contents:**

- Complete DTAM workflow
- Reviewer → Inspector → Approver flow
- Job Ticket system
- Status transitions
- Notification rules
- SLA requirements

**Who should read:** All developers, QA, DTAM staff

---

### 2. [INSPECTOR_2PHASE_WORKFLOW.md](./INSPECTOR_2PHASE_WORKFLOW.md)

Inspector 2-phase workflow details

**Contents:**

- Phase 1: Document Review
- Phase 2: Farm Inspection (on-site)
- Inspection checklist (30+ items)
- Photo requirements
- Report submission
- Pass/Fail criteria

**Who should read:** Backend developers, QA, DTAM inspectors

---

### 3. [PAYMENT_WORKFLOW_ANALYSIS.md](./PAYMENT_WORKFLOW_ANALYSIS.md)

Payment workflow and integration

**Contents:**

- Payment phases (Phase 1: 5,000฿ + Phase 2: 25,000฿)
- PromptPay integration
- Payment status tracking
- Invoice generation
- Refund policy
- Re-submission fees

**Who should read:** Backend developers, QA, Finance team

---

## 🎯 Workflow Summary

### 1. Application Workflow

```
Farmer submits application
    ↓
Upload documents
    ↓
Payment Phase 1 (5,000฿)
    ↓
Reviewer reviews
    ↓
Inspector inspects farm
    ↓
Approver approves
    ↓
Payment Phase 2 (25,000฿)
    ↓
Certificate issued
```

### 2. DTAM Workflow (3 Departments)

```
Reviewer:
- Review application documents
- Check completeness
- Create Job Ticket → Inspector

Inspector:
- Phase 1: Document review
- Phase 2: Farm inspection (on-site)
- Fill inspection form (30+ checklist)
- Upload photos
- Create Job Ticket → Approver

Approver:
- Final review
- Approve/Reject
- Generate certificate (if approved)
- Notify farmer
```

### 3. Payment Workflow

```
Phase 1 (5,000฿):
- After application submission
- Before review starts
- PromptPay QR code
- Payment confirmation (auto)

Phase 2 (25,000฿):
- After approval
- Before certificate issuance
- PromptPay QR code
- Payment confirmation (auto)
- Certificate released
```

### 4. SOP Tracking Workflow (Farmer)

```
Step 1: Seed Preparation
    ↓
Step 2: Germination/Seedling
    ↓
Step 3: Planting
    ↓
Step 4: Cultivation & Maintenance (weekly updates)
    ↓
Step 5: Harvesting (FINAL)
    ↓
QR Code generated (Track & Trace)
```

---

## 📊 Status Flows

### Application Status:

```
draft → submitted → payment_pending → under_review →
inspecting → approved → payment_final_pending →
completed → certificate_issued
```

### Job Ticket Status:

```
pending → assigned → in_progress → completed → approved
```

### Payment Status:

```
pending → processing → completed → failed → refunded
```

---

## 🔗 Related Documentation

- **System Architecture**: [../01_SYSTEM_ARCHITECTURE/](../01_SYSTEM_ARCHITECTURE/)
- **Database Schema**: [../04_DATABASE/](../04_DATABASE/)
- **API Documentation**: [../../docs/API_DOCUMENTATION.md](../../docs/API_DOCUMENTATION.md)

---

## 📞 Contact

**For Workflow Questions:**

- SA Team: somsak@gacp.go.th
- DTAM Contact: dtam-support@gacp.go.th

**Slack Channels:**

- #gacp-workflows
- #gacp-business-logic

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Team Discussions](../02_TEAM_DISCUSSIONS/)
- ➡️ [Next: Database](../04_DATABASE/)
