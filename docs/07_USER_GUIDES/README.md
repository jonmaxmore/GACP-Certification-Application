# 📖 07 - User Guides

**Category**: User Documentation & Manuals  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains user manuals, quick references, and sprint backlogs for end-users and team members.

---

## 📚 Documents in this Folder

### 1. ⭐ [USER_MANUAL.md](./USER_MANUAL.md)

Complete user manual for all user types

**Contents:**

- Getting started
- Farmer Portal guide (Step-by-step)
- DTAM Portal guide (4 roles)
- Public Services guide
- Troubleshooting
- FAQ

**Who should read:** All end-users, Support team

---

### 2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

Quick reference guide for common tasks

**Contents:**

- Common tasks checklists
- Keyboard shortcuts
- Status meanings
- Error codes
- Quick tips

**Who should read:** All users

---

### 3. [SPRINT_BACKLOG_CERTIFICATE_PORTAL.md](./SPRINT_BACKLOG_CERTIFICATE_PORTAL.md)

Sprint backlog for Certificate Portal

**Contents:**

- Sprint planning
- User stories
- Tasks breakdown
- Acceptance criteria
- Sprint progress

**Who should read:** Development team, QA, PM

---

## 🎯 User Roles & Guides

### 👨‍🌾 Farmers

**Getting Started:**

1. Register account → Verify OTP
2. Login → Choose module

**Module 1: Application**

- Submit GACP application
- Upload documents
- Make payment (5,000฿)
- Track status
- Pay final (25,000฿)
- Download certificate

**Module 2: Farm Management**

- Create farm profile
- Register crops
- Record SOP (5 steps)
- Manage chemicals
- View QR codes
- Check compliance

---

### 👨‍💼 DTAM Staff

**Reviewer:**

```
1. Login to DTAM Portal
2. View application queue
3. Open application
4. Review documents
5. Pass → Create Job Ticket for Inspector
6. Fail → Reject with reason
```

**Inspector:**

```
1. Login to DTAM Portal
2. View inspection queue
3. Phase 1: Review documents
4. Phase 2: Schedule farm visit
5. Conduct on-site inspection (30+ checklist)
6. Upload photos
7. Submit report
8. Create Job Ticket for Approver
```

**Approver:**

```
1. Login to DTAM Portal
2. View approval queue
3. Review all documents + inspection report
4. Approve → Generate certificate
5. Reject → Send back to Reviewer
```

**Admin:**

```
1. Login to DTAM Portal
2. View system dashboard
3. Manage users
4. Generate reports
5. Configure system
6. Monitor analytics
```

---

### 🌍 Public Users

**Survey System:**

```
1. Go to gacp.go.th/survey
2. Fill survey form
3. Submit
4. View results (optional)
```

**Standards Comparison:**

```
1. Go to gacp.go.th/standards
2. Select standards to compare
3. View side-by-side comparison
4. Download PDF
```

**Track & Trace:**

```
1. Go to gacp.go.th/track
2. Scan QR code
3. View farm/crop history
4. Verify authenticity
```

---

## 📱 Common Tasks

### For Farmers:

**Submit Application:**

```
1. Login → Application Module
2. Click "New Application"
3. Fill form (5 steps):
   Step 1: Personal Info
   Step 2: Farm Info
   Step 3: Documents
   Step 4: Review
   Step 5: Payment
4. Submit → Pay 5,000฿
5. Wait for review
```

**Track SOP:**

```
1. Login → Farm Management
2. Select farm
3. Click "SOP Tracking"
4. Record each step:
   Step 1: Seed Preparation
   Step 2: Germination
   Step 3: Planting
   Step 4: Cultivation
   Step 5: Harvesting
5. Upload photos
6. Save
```

---

### For DTAM Staff:

**Review Application:**

```
1. Login as Reviewer
2. Dashboard → Queue
3. Click application
4. Check documents
5. Decision:
   ✅ Pass → Create Job Ticket
   ❌ Fail → Reject with reason
6. Submit
```

**Inspect Farm:**

```
1. Login as Inspector
2. Dashboard → Queue
3. Click job ticket
4. Phase 1: Document review
5. Phase 2: Farm visit
6. Fill inspection form (30+ items)
7. Upload photos
8. Submit report
9. Create Job Ticket for Approver
```

---

## ❓ FAQ

### For Farmers:

**Q: How much does GACP certification cost?**

```
A: Total 30,000 THB
   - Phase 1: 5,000฿ (after submission)
   - Phase 2: 25,000฿ (after approval)
```

**Q: How long does the process take?**

```
A: Typically 10-14 days (from 30-60 days before)
   - Review: 2-3 days
   - Inspection: 3-5 days
   - Approval: 2-3 days
   - Certificate: 1-2 days
```

**Q: What if my application is rejected?**

```
A: You can resubmit after fixing issues
   - 1st-2nd attempt: No additional fee
   - 3rd+ attempt: 5,000฿ re-submission fee
```

---

### For DTAM Staff:

**Q: What is the SLA for review?**

```
A:
   - Reviewer: 48 hours
   - Inspector: 72 hours
   - Approver: 24 hours
```

**Q: How do I escalate an issue?**

```
A: Contact admin via:
   - System: Send message in app
   - Email: admin@gacp.go.th
   - Phone: 02-123-4567
```

---

## 🆘 Troubleshooting

### Common Issues:

**Cannot login:**

```
1. Check username/password
2. Verify OTP code
3. Clear browser cache
4. Try different browser
5. Contact support
```

**Upload failed:**

```
1. Check file size (< 10 MB)
2. Check file type (PDF, JPG, PNG)
3. Check internet connection
4. Try again
5. Contact support if persists
```

**Payment not confirmed:**

```
1. Check payment status in app
2. Wait 5 minutes for confirmation
3. Check bank account
4. Contact support with slip
```

---

## 📞 Support

### Contact Information:

**Farmers:**

```
Hotline: 02-123-4567
Email: support@gacp.go.th
LINE: @gacpfarmer
Hours: Mon-Fri 8:30-16:30
```

**DTAM Staff:**

```
IT Support: 02-123-4568
Email: it-support@gacp.go.th
Slack: #gacp-support
Hours: Mon-Fri 8:00-17:00
```

---

## 🔗 Related Documentation

- **System Overview**: [../01_SYSTEM_ARCHITECTURE/FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md](../01_SYSTEM_ARCHITECTURE/FINAL_CORRECT_SYSTEM_UNDERSTANDING_V2.md)
- **Workflows**: [../03_WORKFLOWS/](../03_WORKFLOWS/)
- **Frontend Guide**: [../06_FRONTEND/](../06_FRONTEND/)

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Frontend](../06_FRONTEND/)
- ➡️ [Next: Testing](../08_TESTING/)
