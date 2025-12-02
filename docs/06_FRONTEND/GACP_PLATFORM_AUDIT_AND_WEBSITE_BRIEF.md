# Project Brief: GACP Platform Audit & Public Website Development

**Document Version:** 1.0  
**Date:** October 14, 2025  
**Project Duration:** 12 Weeks  
**Approach:** Improve & Enhance Existing System

---

## 🎯 1. Executive Summary & Core Objectives

### 1.1 Current State

We have a **near-complete GACP Certification Platform** (~85% complete) that includes:

- ✅ **Farmer & DTAM (Admin) Portals** - Fully functional with role-based dashboards
- ✅ **Core Application Workflow** - 7-step certification process implemented
- ✅ **Mock Payment & Notification Systems** - Ready for testing and validation
- ✅ **Work Order & Inspection Modules** - Video call integration (Zoom/Blizz)
- ✅ **KPI Dashboard & Free Public Tools** - Survey, Track & Trace, Standards Comparator
- ✅ **Backend Services** - PaymentService, NotificationService, EventBusService, KPIService, JobAssignmentService (2,370 lines)
- ✅ **Database Layer** - Repositories (1,950 lines) and Models (2,100 lines)
- ✅ **API Routes** - 41 endpoints (1,740 lines)
- ✅ **Frontend Components** - 10 major components (~3,000 lines)

### 1.2 Primary Goals

| Goal                           | Description                                                                     | Success Criteria                                     |
| ------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **System Audit & Validation**  | Thoroughly test the entire platform against defined business logic and workflow | 100% coverage of critical paths, documented findings |
| **Issue Remediation**          | Systematically fix all identified issues by severity                            | Zero P0 issues, <5 P1 issues at launch               |
| **System Cleanup**             | Remove/hide unused features, improve UX                                         | Streamlined interface, clear user journeys           |
| **Public Website Development** | Build modern, SEO-friendly public website                                       | >90 Lighthouse score, <2s page load                  |

### 1.3 What This Project IS and IS NOT

✅ **What We ARE Doing:**

- Comprehensive testing and validation of existing system
- Bug fixing and business logic corrections
- Building a new public-facing marketing website
- Enhancing user experience and system stability
- SEO optimization and performance improvements

❌ **What We're NOT Doing:**

- Rebuilding the platform from scratch
- Changing the core technology stack (Next.js, TypeScript, TailwindCSS)
- Major architectural refactoring
- Complete UI/UX redesign (unless fixing critical issues)
- Replacing mock payment with real Omise integration (future phase)

---

## 📊 2. Phase 1: System Audit & Remediation

### 2.1 Audit Scope

**IN SCOPE:**

- ✅ Validating business logic against specifications
- ✅ Bug hunting and edge case testing
- ✅ Security vulnerability assessment
- ✅ Performance benchmarking
- ✅ Identifying feature gaps and incomplete functionality
- ✅ RBAC permission verification
- ✅ API endpoint testing
- ✅ Database integrity checks
- ✅ Frontend component functionality

**OUT OF SCOPE:**

- ❌ Re-architecting the system
- ❌ Changing primary tech stack
- ❌ Major UI/UX redesign (unless critical)
- ❌ Adding new features not in original spec
- ❌ Migrating to different database

### 2.2 Critical Business Logic to Validate

These are the **highest-priority areas**. The system's integrity depends on them.

| Feature                      | Requirement                                    | Key Verification Points                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Application Workflow**     | The 7-step process must be linear and enforced | 🔹 Cannot skip steps (e.g., SUBMITTED → APPROVED)<br>🔹 State transitions are permission-based<br>🔹 Rejecting correctly returns to farmer<br>🔹 Each step logs audit trail                                                                                                                                                                                                           |
| **Payment Milestones**       | Payment gates critical workflow steps          | 🔹 **฿5,000 Initial Fee:** Triggers on 1st submission, blocks review if unpaid<br>🔹 **฿5,000 Recurring Fee:** Triggers every 2 rejections (submission #3, 5, 7, 9, 11...)<br>🔹 **฿25,000 Inspection Fee:** Required after document approval, before inspection<br>🔹 Payment timeout: 15 minutes (auto-cancel if not paid)<br>🔹 Payment status correctly updates application state |
| **Submission Count**         | Accurate tracking of resubmission attempts     | 🔹 Counter increments ONLY after rejection<br>🔹 Counter resets to 0 upon final approval<br>🔹 Every 2 rejections triggers ฿5,000 payment (submissions #3, 5, 7, 9, 11...)<br>🔹 Counter is application-specific, not user-specific                                                                                                                                                   |
| **Role-Based Access (RBAC)** | Strict permission enforcement across all roles | 🔹 **Video Call:** Inspector + Admin ONLY<br>🔹 **KPI Dashboard:** Approver + Admin ONLY<br>🔹 Each role sees only relevant dashboard and data<br>🔹 API endpoints check JWT role claims                                                                                                                                                                                              |
| **Cancellation & Refund**    | No refunds for cancelled applications          | 🔹 Applications can be cancelled at any stage<br>🔹 All payments are non-refundable<br>🔹 Cancellation reason must be recorded<br>🔹 Cancelled applications marked as "CANCELLED"                                                                                                                                                                                                     |
| **Inspection Rescheduling**  | Limited reschedule attempts                    | 🔹 Farmer can request 1 reschedule only<br>🔹 Must rejoin queue (wait for next available slot)<br>🔹 Inspector no-show requires Admin intervention<br>🔹 Reschedule requests logged in audit trail                                                                                                                                                                                    |
| **Certificate Revocation**   | Reapplication waiting period                   | 🔹 Revoked certificates cannot immediately reapply<br>🔹 Must wait 30 days before new application<br>🔹 Revocation reason recorded<br>🔹 System blocks new applications within waiting period                                                                                                                                                                                         |

### 2.3 Detailed Audit Checklist

#### **A. Application Workflow (7-Step Process)**

**Step 1: Draft (ร่าง)**

- [ ] Farmer can create and save application as draft
- [ ] Draft data persists correctly
- [ ] Farmer can edit draft multiple times
- [ ] All required fields validation works

**Step 2: Submitted (ส่งคำขอ)**

- [ ] Submission triggers payment requirement (฿5,000)
- [ ] Cannot proceed to review without payment
- [ ] Submission count initializes to 1
- [ ] Notification sent to Reviewer
- [ ] Work order auto-generated for Reviewer

**Step 3: Under Review (กำลังตรวจสอบเอกสาร)**

- [ ] Only Reviewer role can access
- [ ] Reviewer can approve or reject with comments
- [ ] Rejection increments submission count
- [ ] Rejection returns application to Farmer (Step 2)
- [ ] Approval advances to Step 4

**Step 3.5: Recurring Payment Check (ตรวจสอบการชำระเงินทุกๆ 2 ครั้ง)**

- [ ] Triggers when submission count = 3, 5, 7, 9, 11... (every 2nd rejection)
- [ ] Requires additional ฿5,000 payment each time
- [ ] Formula: `if ((submissionCount % 2 === 1) && (submissionCount >= 3)) { triggerPayment(); }`
- [ ] Blocks workflow until payment confirmed
- [ ] Payment notification sent to Farmer
- [ ] Payment timeout: 15 minutes (auto-cancel if unpaid)

**Step 4: Document Approved (เอกสารผ่าน)**

- [ ] Displays approved status to Farmer
- [ ] Triggers ฿25,000 inspection payment requirement
- [ ] Cannot schedule inspection without payment
- [ ] Notification sent to Inspector

**Step 5: Inspection Scheduled (กำหนดวันตรวจ)**

- [ ] Only Inspector role can schedule
- [ ] Lot ID generated and assigned
- [ ] Date/time picker works correctly
- [ ] Calendar integration functional
- [ ] Notification sent to Farmer with schedule

**Step 6: Inspection In Progress (กำลังตรวจฟาร์ม)**

- [ ] Inspector can start video call (Zoom/Blizz)
- [ ] Inspector can upload inspection report
- [ ] Inspector can upload evidence photos
- [ ] Inspector can pass or fail inspection
- [ ] Failure requires detailed comments

**Step 7: Final Decision (อนุมัติ/ไม่อนุมัติ)**

- [ ] Only Approver role can make final decision
- [ ] Approval triggers certificate generation
- [ ] Certificate PDF includes QR code
- [ ] Certificate expiry set to 3 years
- [ ] Rejection sends application back to Farmer
- [ ] Final approval resets submission count to 0

**State Transition Rules**

- [ ] Cannot skip from Step 2 to Step 4
- [ ] Cannot bypass payment requirements
- [ ] Role-based transitions enforced by API
- [ ] All state changes logged in audit trail

---

#### **B. Payment System (Mock Omise Integration)**

**Payment Milestones**

- [ ] ฿5,000 Initial Fee: Triggers on first submission
- [ ] ฿5,000 Recurring Fee: Triggers every 2 rejections (submission #3, 5, 7, 9, 11...)
- [ ] ฿25,000 Inspection Fee: Triggers after document approval

**Payment Flow**

- [ ] Payment modal displays correct amount
- [ ] Payment modal shows clear description in Thai
- [ ] Payment modal shows countdown timer (15 minutes)
- [ ] Mock Omise simulation works (test credit card)
- [ ] Payment confirmation updates application status
- [ ] Payment failure allows retry within timeout period
- [ ] Payment timeout (15 min) auto-cancels payment and locks application

**Payment Timeout Logic**

- [ ] Timer starts when payment modal opens
- [ ] Countdown displayed to user (15:00, 14:59, 14:58...)
- [ ] At timeout (00:00), payment is cancelled
- [ ] Application status changes to "PAYMENT_TIMEOUT"
- [ ] User can retry payment from dashboard
- [ ] System sends notification: "การชำระเงินหมดเวลา กรุณาลองใหม่อีกครั้ง"

**Payment Records**

- [ ] Transaction history stored correctly
- [ ] Receipt generated with transaction ID
- [ ] Receipt downloadable as PDF
- [ ] Payment status displayed in Farmer dashboard
- [ ] Admin can view all payment transactions
- [ ] All payments are non-refundable (no refund logic needed)

**Payment Notifications**

- [ ] Email sent on payment success
- [ ] Email sent on payment failure
- [ ] Email sent on payment timeout
- [ ] In-app notification appears immediately
- [ ] SMS notification (if enabled)

**Edge Cases**

- [ ] Multiple payment attempts handled correctly
- [ ] Partial payment detection
- [ ] Payment timeout handling (15 minutes)
- [ ] Duplicate payment prevention
- [ ] No refund logic (all sales final)

**Application Cancellation**

- [ ] User can cancel application at any stage
- [ ] Cancellation requires reason (dropdown + text)
- [ ] Cancellation reasons: "ไม่พร้อม", "เปลี่ยนใจ", "ปัญหาทางการเงิน", "อื่นๆ"
- [ ] No refunds issued for any payments made
- [ ] Status changes to "CANCELLED"
- [ ] Admin can view cancellation statistics
- [ ] Notification sent: "คำขอของคุณถูกยกเลิกแล้ว เงินที่ชำระแล้วไม่สามารถคืนได้"

---

#### **C. User Management & RBAC (5 Roles)**

**Role Definitions**

- [ ] **Farmer (เกษตรกร):** Can submit applications, pay fees, view status
- [ ] **Reviewer (ผู้ตรวจสอบเอกสาร):** Can review documents, approve/reject
- [ ] **Inspector (ผู้ตรวจฟาร์ม):** Can schedule inspections, conduct video calls, upload reports
- [ ] **Approver (ผู้อนุมัติ):** Can make final approval, access KPI dashboard
- [ ] **Admin (ผู้ดูแลระบบ):** Full access to all features and dashboards

**Permission Matrix**

| Feature             | Farmer | Reviewer | Inspector | Approver | Admin |
| ------------------- | ------ | -------- | --------- | -------- | ----- |
| Submit Application  | ✅     | ❌       | ❌        | ❌       | ✅    |
| Review Documents    | ❌     | ✅       | ❌        | ❌       | ✅    |
| Schedule Inspection | ❌     | ❌       | ✅        | ❌       | ✅    |
| Video Call          | ❌     | ❌       | ✅        | ❌       | ✅    |
| Final Approval      | ❌     | ❌       | ❌        | ✅       | ✅    |
| KPI Dashboard       | ❌     | ❌       | ❌        | ✅       | ✅    |
| User Management     | ❌     | ❌       | ❌        | ❌       | ✅    |
| System Settings     | ❌     | ❌       | ❌        | ❌       | ✅    |

**RBAC Testing**

- [ ] Each role sees only permitted dashboard views
- [ ] API endpoints enforce role-based access
- [ ] JWT tokens include correct role claims
- [ ] Unauthorized access attempts blocked with 403
- [ ] Role-based menu items displayed correctly
- [ ] Route guards prevent direct URL access

**User Registration & Authentication**

- [ ] Registration form validates all required fields
- [ ] Email uniqueness enforced
- [ ] Password strength requirements met (min 8 chars)
- [ ] Default role assigned correctly (Farmer)
- [ ] Login with email/password works
- [ ] JWT token generated on successful login
- [ ] Token refresh mechanism works
- [ ] Logout clears session correctly

**Demo Accounts**

- [ ] farmer@test.com (password123) - Farmer role
- [ ] reviewer@test.com (password123) - Reviewer role
- [ ] inspector@test.com (password123) - Inspector role
- [ ] approver@test.com (password123) - Approver role
- [ ] admin@test.com (password123) - Admin role

---

#### **D. Work Order System**

**Auto-Generation Logic**

- [ ] Work order created on application submission (for Reviewer)
- [ ] Work order created on document approval (for Inspector)
- [ ] Work order created on inspection completion (for Approver)
- [ ] Each work order has unique ID
- [ ] Work order includes application reference

**Work Order Assignment**

- [ ] Auto-assigned to correct role (Reviewer/Inspector/Approver)
- [ ] Manual reassignment by Admin works
- [ ] Load balancing logic (if multiple users in role)
- [ ] Assignment notification sent immediately

**Work Order Lifecycle**

- [ ] Status: Pending → In Progress → Completed
- [ ] Due date calculated correctly (e.g., 3 days from creation)
- [ ] Overdue work orders highlighted
- [ ] User can mark work order as completed
- [ ] Completion updates application status

**Work Order Dashboard**

- [ ] List of all assigned work orders
- [ ] Filter by status (Pending/In Progress/Completed)
- [ ] Sort by due date, priority
- [ ] Search by application ID
- [ ] Pagination works correctly

---

#### **E. Notification System**

**Notification Channels**

- [ ] In-app notifications (NotificationBell component)
- [ ] Email notifications
- [ ] SMS notifications (optional)

**Notification Triggers**

| Event                          | Recipient          | Channels           |
| ------------------------------ | ------------------ | ------------------ |
| Application Submitted          | Reviewer + Farmer  | In-app, Email      |
| Payment Required               | Farmer             | In-app, Email, SMS |
| Payment Confirmed              | Farmer + Admin     | In-app, Email      |
| Document Approved              | Farmer + Inspector | In-app, Email      |
| Document Rejected              | Farmer             | In-app, Email      |
| Inspection Scheduled           | Farmer + Inspector | In-app, Email, SMS |
| Inspection Completed           | Farmer + Approver  | In-app, Email      |
| Certificate Issued             | Farmer             | In-app, Email, SMS |
| Certificate Expiring (30 days) | Farmer             | Email, SMS         |

**Notification Testing**

- [ ] Notifications appear in real-time (via WebSocket/polling)
- [ ] Notification bell shows unread count
- [ ] Clicking notification marks as read
- [ ] Clicking notification navigates to relevant page
- [ ] Notification history accessible
- [ ] Mark all as read function works

**Email Templates**

- [ ] All emails have consistent branding
- [ ] Thai language support
- [ ] Responsive email design
- [ ] Unsubscribe link included
- [ ] Email delivery logs captured

---

#### **F. Inspection Module**

**Inspection Scheduling**

- [ ] Inspector can view all applications ready for inspection
- [ ] Date/time picker shows available slots
- [ ] Farmer receives schedule confirmation
- [ ] Calendar integration (Google Calendar/Outlook)
- [ ] Reschedule functionality limited to 1 time per application

**Inspection Rescheduling Logic**

- [ ] Farmer can request reschedule through dashboard
- [ ] System tracks reschedule count (max 1 per application)
- [ ] After 1 reschedule, farmer must wait for next available queue slot
- [ ] Reschedule reason required (dropdown): "ไม่สะดวก", "ฟาร์มไม่พร้อม", "เหตุฉุกเฉิน", "อื่นๆ"
- [ ] Inspector no-show: Admin manually reschedules (does not count toward farmer's limit)
- [ ] Reschedule history logged in audit trail
- [ ] Notification sent to Inspector when farmer requests reschedule
- [ ] If reschedule limit reached, show message: "คุณได้ขอเลื่อนครบ 1 ครั้งแล้ว กรุณารอคิวใหม่"

**Lot ID Generation**

- [ ] Unique Lot ID generated (format: LOT-YYYYMMDD-XXXX)
- [ ] Lot ID displayed prominently in dashboard
- [ ] Lot ID included in certificate
- [ ] Lot ID searchable

**Video Call Integration**

- [ ] Zoom integration works (if configured)
- [ ] Blizz integration works (if configured)
- [ ] Inspector can start/join call
- [ ] Farmer can join call via link
- [ ] Call recording (optional)
- [ ] Video call accessible ONLY by Inspector + Admin

**Inspection Report Upload**

- [ ] Inspector can upload PDF report
- [ ] File size validation (max 10MB)
- [ ] File type validation (PDF only)
- [ ] Report preview works
- [ ] Farmer can view uploaded report

**Evidence Upload**

- [ ] Inspector can upload multiple photos
- [ ] Image optimization (WebP conversion)
- [ ] Thumbnail generation
- [ ] Gallery view for Farmer
- [ ] Maximum 20 photos per inspection

**Pass/Fail Decision**

- [ ] Inspector can select Pass or Fail
- [ ] Fail requires detailed comments (min 50 chars)
- [ ] Decision triggers workflow transition
- [ ] Decision notification sent

---

#### **G. KPI Dashboard (Approver + Admin Only)**

**Access Control**

- [ ] KPI Dashboard accessible ONLY by Approver + Admin
- [ ] Other roles receive 403 Forbidden
- [ ] Direct URL access blocked for unauthorized roles

**Team Metrics**

- [ ] Total applications this month
- [ ] Applications by status (breakdown)
- [ ] Average processing time per stage
- [ ] Approval rate (%)
- [ ] Revenue this month (฿)
- [ ] Revenue comparison vs. last month

**Individual Performance**

- [ ] Reviewer: Documents reviewed, approval rate, avg review time
- [ ] Inspector: Inspections completed, pass rate, avg inspection time
- [ ] Approver: Final approvals issued, rejection rate

**Date Filters**

- [ ] This Week
- [ ] This Month
- [ ] Last 3 Months
- [ ] Custom Date Range

**Charts & Visualizations**

- [ ] Line chart: Applications over time
- [ ] Bar chart: Applications by status
- [ ] Pie chart: Revenue by payment type
- [ ] Table: Top performers

**Export Functionality**

- [ ] Export to CSV
- [ ] Export to PDF
- [ ] Scheduled email reports (future)

---

#### **H. Farmer Portal**

**Dashboard Overview**

- [ ] Welcome message with farmer name
- [ ] Application status summary
- [ ] Recent notifications
- [ ] Quick action buttons (New Application, View Status, Payment)

**Application Submission**

- [ ] Multi-step form with validation
- [ ] File upload (farm documents, photos)
- [ ] Draft auto-save every 30 seconds
- [ ] Form progress indicator
- [ ] Required field validation
- [ ] Submit button triggers payment

**Application Status Tracking**

- [ ] Visual workflow progress bar
- [ ] Current step highlighted
- [ ] Estimated completion time
- [ ] Next action required (if any)

**Payment Interface**

- [ ] Payment modal with clear breakdown
- [ ] Mock credit card form (Omise simulation)
- [ ] Payment success/failure feedback
- [ ] Payment receipt download

**Certificate Download**

- [ ] Certificate displayed after approval
- [ ] Download as PDF
- [ ] Share via link
- [ ] QR code verification

**Profile Management**

- [ ] Edit personal information
- [ ] Change password
- [ ] Update farm details
- [ ] Contact preferences

---

#### **I. DTAM Portal (Admin Portal)**

**Role-Specific Dashboards**

**I.1 Reviewer Dashboard**

- [ ] List of applications awaiting review
- [ ] Filter by submission date, farmer name
- [ ] Sort by priority (overdue first)
- [ ] Quick actions: Approve, Reject, Request More Info
- [ ] Review history and statistics

**I.2 Inspector Dashboard**

- [ ] List of applications ready for inspection
- [ ] Calendar view of scheduled inspections
- [ ] Lot ID badges displayed
- [ ] Start video call button
- [ ] Upload inspection report form
- [ ] Inspection history

**I.3 Approver Dashboard**

- [ ] List of applications pending final approval
- [ ] View inspection reports and evidence
- [ ] Final approval/rejection actions
- [ ] KPI dashboard access
- [ ] Certificate issuance queue

**I.4 Admin Dashboard**

**Core Admin Features**

- [ ] User management (add, edit, delete users)
- [ ] Role assignment and permissions
- [ ] System settings and configuration
- [ ] Full KPI dashboard with advanced filters
- [ ] Audit logs with search/export
- [ ] Database statistics and health monitoring

**Advanced Analytics (ตาม Data Analysis Team)**

- [ ] Revenue analytics by time period (daily, weekly, monthly, yearly)
- [ ] Revenue breakdown by payment type (Initial, Recurring, Inspection)
- [ ] Conversion funnel visualization (Registration → Submission → Payment → Approval)
- [ ] Drop-off rate analysis at each stage
- [ ] Average processing time by stage (Review, Inspection, Approval)
- [ ] Reviewer/Inspector/Approver performance metrics
- [ ] Application rejection reasons (most common issues)
- [ ] Payment timeout analysis (how many timeouts, when do they occur)
- [ ] Cancellation statistics (reasons, at which stage)
- [ ] Reschedule request patterns
- [ ] Certificate expiry forecasting (upcoming renewals)

**UX/UI Designer Requirements**

- [ ] Data visualization with interactive charts (Line, Bar, Pie, Funnel)
- [ ] Dashboard customization (drag-and-drop widgets)
- [ ] Dark mode toggle
- [ ] Export all data to CSV/Excel/PDF
- [ ] Scheduled reports (email digest)
- [ ] Real-time data refresh (auto-update every 30 seconds)
- [ ] Responsive layout for tablets
- [ ] Accessibility features (screen reader support, keyboard shortcuts)

**DTAM Team Needs**

- [ ] Bulk user import/export (Excel template)
- [ ] Announcements system (broadcast messages to all farmers)
- [ ] System maintenance mode toggle
- [ ] Certificate template editor
- [ ] Email template customization
- [ ] SMS credit balance and top-up
- [ ] Backup and restore functionality
- [ ] Log viewer with advanced search (by user, action, date range)
- [ ] Security alerts (failed login attempts, suspicious activity)
- [ ] API usage statistics
- [ ] Server health monitoring (CPU, RAM, Disk usage)

**Frontend Team Needs**

- [ ] Component library documentation
- [ ] Storybook integration for UI components
- [ ] A/B testing framework for UI experiments
- [ ] Feature flags (enable/disable features without deployment)

**SA/SE/MIS Requirements**

- [ ] Database query builder (for advanced reporting)
- [ ] API endpoint testing interface
- [ ] System error logs with stack traces
- [ ] Performance profiling tools
- [ ] Database migration history
- [ ] Version control integration (show latest commits)
- [ ] Deployment history and rollback capability

**Common Features Across All Dashboards**

- [ ] Real-time notification bell
- [ ] Search functionality
- [ ] Advanced filters
- [ ] Export data to CSV
- [ ] Pagination (20 items per page)

---

#### **J. Free Services (Public - No Login Required)**

**J.1 Track & Trace (ระบบตรวจสอบย้อนกลับ)**

- [ ] Public can enter Lot ID or Certificate Number
- [ ] System displays farm information (public data only)
- [ ] Shows certification status and expiry date
- [ ] QR code verification works
- [ ] Privacy controls (hide sensitive data)

**J.2 Survey System (แบบสอบถาม)**

- [ ] Survey accessible without login
- [ ] Multiple question types (multiple choice, text, rating)
- [ ] Progress bar during survey
- [ ] Submit survey stores response
- [ ] Thank you page with CTA to register
- [ ] Admin can view survey results
- [ ] Export survey data to CSV

**J.3 Standards Comparator (เปรียบเทียบมาตรฐาน)**

- [ ] Side-by-side comparison of GACP vs. Other Standards
- [ ] Table format with checkmarks
- [ ] Filter by category (Pest Control, Water Management, etc.)
- [ ] Download comparison as PDF
- [ ] CTA to start GACP certification

**SEO & Performance for Free Services**

- [ ] Each tool has dedicated public URL
- [ ] Meta tags for social sharing
- [ ] Fast load time (<1s)
- [ ] Mobile responsive
- [ ] Accessible (WCAG 2.1 AA)

---

#### **K. Certificate Management**

**Certificate Generation**

- [ ] Auto-generates on final approval
- [ ] Unique certificate number (format: GACP-YYYY-XXXXX)
- [ ] Includes QR code for verification
- [ ] PDF format with official branding
- [ ] Thai + English versions

**Certificate Data Fields**

- [ ] Farmer name
- [ ] Farm name and location
- [ ] Lot ID
- [ ] Certification date
- [ ] Expiry date (3 years from issue)
- [ ] Certificate number
- [ ] QR code
- [ ] Official signatures/stamps

**Certificate Lifecycle**

- [ ] Active: Valid certificate
- [ ] Expiring Soon: <30 days to expiry
- [ ] Expired: Past expiry date
- [ ] Revoked: Cancelled by Admin
- [ ] Renewed: New certificate issued

**Expiry Tracking & Renewal**

- [ ] System sends reminder 90 days before expiry
- [ ] System sends reminder 30 days before expiry
- [ ] Farmer can initiate renewal process
- [ ] Renewal creates new application
- [ ] Old certificate marked as "Renewed"

**Public Verification**

- [ ] Anyone can verify certificate via QR code
- [ ] Anyone can verify by certificate number
- [ ] Public verification page shows:
  - Certificate status (Valid/Expired/Revoked)
  - Farmer name (if permitted)
  - Farm name
  - Certification date and expiry
- [ ] Privacy settings respected

**Certificate Revocation**

- [ ] Admin can revoke certificate
- [ ] Revocation requires reason (dropdown): "ไม่ปฏิบัติตามมาตรฐาน", "พบการทุจริต", "ข้อมูลเท็จ", "อื่นๆ"
- [ ] Farmer notified immediately
- [ ] Certificate marked as "Revoked" in system
- [ ] Public verification shows revoked status

**Reapplication After Revocation**

- [ ] System blocks new applications for 30 days after revocation
- [ ] Revocation date stored in user profile
- [ ] When farmer tries to submit new application, check: `if (daysSinceRevocation < 30) { blockApplication(); }`
- [ ] Display message: "ไม่สามารถยื่นคำขอใหม่ได้ในขณะนี้ กรุณารอ 30 วันหลังจากใบรับรองถูกเพิกถอน"
- [ ] Dashboard shows countdown: "สามารถยื่นคำขอใหม่ได้ในอีก X วัน"
- [ ] After 30 days, farmer can submit new application normally
- [ ] Revocation history displayed in Admin panel

---

#### **L. Data & Analytics**

**Application Statistics**

- [ ] Total applications (all time)
- [ ] Applications this month/year
- [ ] Applications by status (Submitted, In Review, Approved, etc.)
- [ ] Approval rate (%)
- [ ] Rejection rate (%)
- [ ] Average processing time (days)

**Revenue Analytics**

- [ ] Total revenue (all time)
- [ ] Revenue this month/year
- [ ] Revenue by payment type (Initial/Conditional/Inspection)
- [ ] Revenue per farmer (average)
- [ ] Revenue forecast (based on pending applications)

**Conversion Funnel**

- [ ] Registered users → Applications started
- [ ] Applications started → Submitted
- [ ] Submitted → Paid
- [ ] Paid → Reviewed
- [ ] Reviewed → Approved
- [ ] Drop-off rate at each stage

**Audit Trail Logging**

- [ ] All state changes logged with timestamp
- [ ] User actions logged (who did what, when)
- [ ] Payment transactions logged
- [ ] Login/logout events logged
- [ ] Failed login attempts logged
- [ ] Admin actions logged
- [ ] Logs searchable by date, user, action type
- [ ] Logs exportable

**Data Integrity**

- [ ] Database backups automated (daily)
- [ ] Backup restoration tested
- [ ] Data validation rules enforced
- [ ] Orphaned records prevented (foreign key constraints)
- [ ] Data migration scripts tested

---

#### **M. Security & Performance**

**Authentication & Authorization**

- [ ] JWT tokens used for API authentication
- [ ] Token expiry enforced (e.g., 24 hours)
- [ ] Refresh token mechanism works
- [ ] Password hashing (bcrypt) with salt
- [ ] Password reset flow secure (token-based)
- [ ] RBAC enforced at API level
- [ ] Protected routes check JWT on every request

**Security Best Practices**

- [ ] Rate limiting on API endpoints (100 req/min per IP)
- [ ] CSRF protection enabled
- [ ] XSS prevention (input sanitization)
- [ ] SQL Injection prevention (parameterized queries)
- [ ] File upload validation (type, size, malware scan)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Security headers configured (CSP, X-Frame-Options)
- [ ] Sensitive data encrypted at rest
- [ ] Environment variables for secrets (not hardcoded)

**Performance Benchmarks**

- [ ] API response time <500ms (average)
- [ ] Page load time <2s (Lighthouse)
- [ ] Database query optimization (indexes on foreign keys)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting (Next.js automatic)
- [ ] CDN for static assets (future)

**Error Handling**

- [ ] All API errors return consistent JSON format
- [ ] Error messages user-friendly (not technical)
- [ ] 500 errors logged to monitoring system
- [ ] 404 errors handled gracefully
- [ ] Frontend error boundaries catch React errors
- [ ] Unhandled promise rejections caught

**Monitoring & Logging**

- [ ] Application logs (info, warn, error levels)
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Uptime monitoring (e.g., Pingdom)
- [ ] Log aggregation (e.g., Loggly, CloudWatch)

---

### 2.4 Issue Reporting Standard

All findings **must** be documented using this template:

```markdown
**Issue ID:** #XXX
**Title:** [Brief description of the issue]
**Severity:** [Critical (P0) | High (P1) | Medium (P2) | Low (P3)]
**Status:** [Open | In Progress | Resolved | Closed]
**Module:** [e.g., Application Workflow, Payment System, RBAC]

**Description:**
[Detailed explanation of what's wrong]

**Current Behavior:**

- [What actually happens]

**Expected Behavior:**

- [What should happen]

**Steps to Reproduce:**

1. [Step one]
2. [Step two]
3. [Expected result vs. actual result]

**Impact:**

- [Who is affected? What is the business impact?]

**Recommendation:**
[Proposed fix or workaround]

**Priority:** [P0 | P1 | P2 | P3]
**Estimated Fix Time:** [e.g., 2 hours, 1 day, 1 week]
**Assigned To:** [Team member]
**Related Issues:** [#XXX, #YYY]
```

**Priority Definitions:**

- **P0 (Critical):** System-breaking, security vulnerability, data loss risk. **Fix immediately.**
- **P1 (High):** Major business logic error, significant feature broken. **Fix within 1-3 days.**
- **P2 (Medium):** Minor bug, usability issue, non-critical feature broken. **Fix within 1 week.**
- **P3 (Low):** Cosmetic issue, nice-to-have improvement. **Fix when time permits.**

---

## 🎨 3. Phase 2: Public Website Development

### 3.1 Website Objective

To create a **professional, informative, and high-performance marketing website** that:

- Showcases our GACP certification services
- Educates visitors about GACP standards and benefits
- Provides free tools to attract organic traffic
- Converts visitors into registered users/applicants
- Builds trust and credibility

### 3.2 Website Structure & Pages

#### **3.2.1 Homepage (หน้าแรก)**

**Hero Section**

- [ ] Compelling headline: "รับรอง GACP ด้วยระบบออนไลน์ที่ง่ายและรวดเร็ว"
- [ ] Sub-headline explaining value proposition
- [ ] CTA buttons: "เริ่มต้นใช้งาน" (Register), "เรียนรู้เพิ่มเติม" (Learn More)
- [ ] Hero image: Modern farm or happy farmer
- [ ] Video background (optional)

**Services Overview**

- [ ] 3 service cards: GACP Certification, Farm Management, Free Tools
- [ ] Each card has icon, title, brief description, "อ่านต่อ" link

**Why Choose Us Section**

- [ ] 4-6 key benefits with icons:
  - ✅ ระบบออนไลน์ 100% (100% Online System)
  - ✅ ประหยัดเวลา (Save Time)
  - ✅ โปร่งใสทุกขั้นตอน (Transparent Process)
  - ✅ ทีมผู้เชี่ยวชาญ (Expert Team)
  - ✅ ราคายุติธรรม (Fair Pricing)
  - ✅ รับรองมาตรฐานสากล (International Standards)

**Process Timeline**

- [ ] Visual 7-step process diagram
- [ ] Each step has icon, title, brief description
- [ ] Estimated timeline: 30-60 days

**Statistics Section**

- [ ] Number of certified farms
- [ ] Number of successful applications
- [ ] Customer satisfaction rate
- [ ] Years of experience

**Testimonials**

- [ ] 3-6 farmer testimonials with photos
- [ ] Quote, name, farm name, location
- [ ] Star rating

**Free Tools CTA**

- [ ] 3 cards: Track & Trace, Survey, Standards Comparator
- [ ] Try now without registration

**Footer**

- [ ] Company info (name, address, phone, email)
- [ ] Quick links (Services, Pricing, About, Contact)
- [ ] Social media icons
- [ ] Copyright notice
- [ ] Privacy Policy and Terms of Service links

---

#### **3.2.2 Services Page (บริการของเรา)**

**GACP Certification Service**

- [ ] Detailed explanation of GACP certification
- [ ] Benefits of GACP (market access, consumer trust, premium pricing)
- [ ] Who should apply (all types of farms)
- [ ] 7-step process breakdown with visuals
- [ ] Timeline and requirements
- [ ] CTA: "สมัครรับรองเลย"

**Farm Management Consulting**

- [ ] Optional service: On-site consulting
- [ ] Pre-certification audit
- [ ] Training for farm workers
- [ ] Documentation preparation
- [ ] Pricing and contact form

**Post-Certification Support**

- [ ] Annual audits
- [ ] Certificate renewal assistance
- [ ] Continuous improvement consulting

---

#### **3.2.3 Pricing Page (ค่าใช้จ่าย)**

**Transparent Pricing Table**

| ขั้นตอน (Step)                    | ค่าใช้จ่าย (Fee) | เมื่อไหร่ต้องจ่าย (When to Pay)                       |
| --------------------------------- | ---------------- | ----------------------------------------------------- |
| 1. ค่าสมัครและตรวจเอกสารเบื้องต้น | ฿5,000           | เมื่อส่งคำขอครั้งแรก                                  |
| 2. ค่าตรวจเอกสารเพิ่มเติม         | ฿5,000/ครั้ง     | ทุกๆ 2 ครั้งที่ถูกตีกลับ (ครั้งที่ 3, 5, 7, 9, 11...) |
| 3. ค่าตรวจฟาร์ม                   | ฿25,000          | หลังเอกสารผ่าน ก่อนนัดตรวจฟาร์ม                       |
| **รวมทั้งสิ้น (Total)**           | **฿30,000+**     | _(ขึ้นอยู่กับจำนวนครั้งที่ถูกตีกลับ)_                 |

**หมายเหตุสำคัญ:**

- ⏱️ ชำระเงินภายใน 15 นาที มิฉะนั้นคำขอจะถูกล็อค
- 🚫 ไม่มีการคืนเงินทุกกรณี (No Refunds)
- 🔄 เลื่อนนัดตรวจได้ 1 ครั้งเท่านั้น (จากนั้นต้องรอคิวใหม่)
- 📅 หากใบรับรองถูกเพิกถอน ต้องรอ 30 วันก่อนยื่นคำขอใหม่

**What's Included**

- [ ] Document review (unlimited revisions within reason)
- [ ] On-site or video inspection
- [ ] Certificate issuance (1-year validity)
- [ ] Digital certificate with QR code
- [ ] Listed in public Track & Trace system

**No Refund Policy (นโยบายไม่คืนเงิน)**

- [ ] All payments are final and non-refundable
- [ ] Clearly stated on payment modal
- [ ] User must accept terms before payment
- [ ] Cancellation at any stage = no refund
- [ ] Failure to pass inspection = no refund
- [ ] Payment timeout or failure = no refund (can retry)

**CTA:** "ดูข้อกำหนดทั้งหมด" (View Full Terms)

---

#### **3.2.4 About Us Page (เกี่ยวกับเรา)**

**Company Story**

- [ ] Mission and vision
- [ ] Years of experience
- [ ] Why we started this platform
- [ ] Our commitment to farmers

**Team Section**

- [ ] Photos and bios of key team members
- [ ] Certifications and credentials

**Partnerships**

- [ ] Government agencies
- [ ] Agricultural organizations
- [ ] Certification bodies
- [ ] Logos of partners

**Awards & Recognition**

- [ ] Industry awards
- [ ] Media mentions

---

#### **3.2.5 Knowledge Base (คลังความรู้)**

**Blog/Article Categories**

- [ ] GACP Standards Explained
- [ ] Application Tips
- [ ] Success Stories
- [ ] Regulations Updates
- [ ] Farming Best Practices

**Featured Articles**

- [ ] "GACP คืออะไร? เหมาะกับฟาร์มของคุณไหม?"
- [ ] "7 ขั้นตอนการรับรอง GACP อย่างละเอียด"
- [ ] "เอกสารที่ต้องเตรียมสำหรับการรับรอง GACP"
- [ ] "ความแตกต่างระหว่าง GACP กับ GAP และ Organic"

**Search & Filter**

- [ ] Search by keyword
- [ ] Filter by category
- [ ] Sort by date, popularity

**CTA:** "ยังมีคำถาม? ติดต่อเรา" (Still have questions? Contact us)

---

#### **3.2.6 Contact Page (ติดต่อเรา)**

**Contact Form**

- [ ] Name, Email, Phone (required)
- [ ] Subject dropdown (General Inquiry, Application Support, Technical Issue)
- [ ] Message textarea
- [ ] Submit button
- [ ] Form validation
- [ ] Success message after submission

**Contact Information**

- [ ] Office address with Google Maps embed
- [ ] Phone number (clickable for mobile)
- [ ] Email address
- [ ] Business hours

**Social Media**

- [ ] Facebook, LINE, Instagram links

**FAQ Section**

- [ ] 10-15 most common questions
- [ ] Expandable accordion UI

---

#### **3.2.7 Free Tool Pages**

**3.2.7a Track & Trace (ตรวจสอบย้อนกลับ)**

- [ ] Hero: "ตรวจสอบความถูกต้องของใบรับรอง GACP"
- [ ] Search box: "กรอก Lot ID หรือเลขที่ใบรับรอง"
- [ ] Search button triggers API call
- [ ] Results display:
  - Certificate status (Valid/Expired/Revoked)
  - Farm name and location
  - Certification date and expiry
  - QR code
- [ ] Error handling: "ไม่พบข้อมูล กรุณาตรวจสอบ ID อีกครั้ง"
- [ ] CTA: "สนใจรับรอง? สมัครเลย"

**3.2.7b Survey System (แบบสอบถาม)**

- [ ] Hero: "ช่วยเราพัฒนาระบบด้วยความคิดเห็นของคุณ"
- [ ] Multi-step survey with progress bar
- [ ] Question types: Multiple choice, text input, rating scale
- [ ] "ถัดไป" and "ย้อนกลับ" buttons
- [ ] Submit triggers thank you page
- [ ] Thank you page CTA: "ลงทะเบียนเพื่อรับข่าวสาร"

**3.2.7c Standards Comparator (เปรียบเทียบมาตรฐาน)**

- [ ] Hero: "GACP เทียบกับมาตรฐานอื่น ๆ"
- [ ] Dropdown to select standards (GACP vs. GAP, Organic, GlobalGAP)
- [ ] Comparison table with checkmarks and X marks
- [ ] Categories: Pest Control, Water Management, Traceability, Certification Cost
- [ ] Download comparison as PDF button
- [ ] CTA: "GACP เหมาะกับคุณ? สมัครเลย"

---

### 3.3 Technical & Design Requirements

#### **Technology Stack**

| Component      | Technology                  |
| -------------- | --------------------------- |
| **Framework**  | Next.js 14+ (App Router)    |
| **Language**   | TypeScript                  |
| **Styling**    | TailwindCSS                 |
| **Components** | shadcn/ui                   |
| **Icons**      | Lucide React                |
| **Animations** | Framer Motion (optional)    |
| **Forms**      | React Hook Form + Zod       |
| **SEO**        | next-seo                    |
| **Analytics**  | Google Analytics 4          |
| **Hosting**    | Vercel (recommended) or AWS |

---

#### **Design System**

**Colors**

```css
/* Primary Colors */
--primary-green: #4caf50;
--primary-green-hover: #45a049;
--primary-green-light: #e8f5e9;

/* Secondary Colors */
--secondary-blue: #2196f3;
--secondary-orange: #ff9800;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

**Typography**

```css
/* Headings */
font-family: 'Kanit', sans-serif;

/* Body Text */
font-family: 'Prompt', sans-serif;

/* Font Sizes (Tailwind) */
h1: text-4xl md:text-5xl (36px/48px)
h2: text-3xl md:text-4xl (30px/36px)
h3: text-2xl md:text-3xl (24px/30px)
h4: text-xl md:text-2xl (20px/24px)
body: text-base (16px)
small: text-sm (14px)
```

**Spacing**

```css
/* Container Max Width */
max-width: 1280px (container mx-auto)

/* Section Padding */
padding: py-16 md:py-24 (4rem/6rem)

/* Card Padding */
padding: p-6 md:p-8 (1.5rem/2rem)
```

**Components**

- [ ] Buttons: Primary, Secondary, Outline, Ghost
- [ ] Cards: Elevated with shadow, border radius 12px
- [ ] Forms: Consistent input styling, floating labels (optional)
- [ ] Navigation: Sticky header with transparent → solid on scroll
- [ ] Footer: Multi-column layout

---

#### **Performance Requirements**

| Metric                              | Target       |
| ----------------------------------- | ------------ |
| **Lighthouse Performance Score**    | >90          |
| **Lighthouse Accessibility Score**  | >90          |
| **Lighthouse Best Practices Score** | >90          |
| **Lighthouse SEO Score**            | >90          |
| **Page Load Time (3G)**             | <3 seconds   |
| **Page Load Time (4G/WiFi)**        | <2 seconds   |
| **First Contentful Paint (FCP)**    | <1.5 seconds |
| **Time to Interactive (TTI)**       | <3 seconds   |
| **Cumulative Layout Shift (CLS)**   | <0.1         |

**Performance Optimization Techniques**

- [ ] Image optimization: WebP format, responsive images, lazy loading
- [ ] Code splitting: Next.js automatic + manual dynamic imports
- [ ] Font optimization: Preload critical fonts, font-display: swap
- [ ] Minification: CSS, JS, HTML
- [ ] Compression: Gzip/Brotli
- [ ] CDN: Static assets served from CDN (Vercel Edge Network)
- [ ] Caching: Proper cache headers (stale-while-revalidate)

---

#### **SEO Requirements**

**On-Page SEO**

- [ ] Unique `<title>` tag for each page (50-60 chars)
- [ ] Unique meta description for each page (150-160 chars)
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] Structured data (Schema.org JSON-LD):
  - Organization
  - Service
  - FAQPage
  - Article (for blog posts)
- [ ] Semantic HTML (proper heading hierarchy H1 → H2 → H3)
- [ ] Alt text for all images (descriptive, keyword-rich)
- [ ] Internal linking strategy
- [ ] Mobile-friendly (responsive)
- [ ] HTTPS enforced

**Technical SEO**

- [ ] sitemap.xml auto-generated
- [ ] robots.txt configured
- [ ] 404 page with helpful navigation
- [ ] 301 redirects for old URLs (if migrating)
- [ ] Page speed optimized
- [ ] Core Web Vitals passing
- [ ] Structured URLs (e.g., /services/gacp-certification)

**Content SEO**

- [ ] Target keywords researched:
  - "รับรอง GACP"
  - "ใบรับรอง GACP"
  - "GACP คืออะไร"
  - "มาตรฐาน GACP"
  - "การรับรองฟาร์ม"
- [ ] Keywords naturally integrated in content
- [ ] Long-form content (>1,000 words) for key pages
- [ ] Regular blog updates (1-2 posts per week)

---

#### **Accessibility Requirements (WCAG 2.1 AA)**

- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators visible on all focusable elements
- [ ] Color contrast ratio ≥4.5:1 for normal text, ≥3:1 for large text
- [ ] All images have descriptive alt text
- [ ] Form labels properly associated with inputs
- [ ] Error messages clear and helpful
- [ ] ARIA labels for screen readers (where needed)
- [ ] Skip to main content link
- [ ] Semantic HTML (nav, main, footer, article)
- [ ] Responsive text (no fixed pixel sizes, use rem/em)
- [ ] No autoplay videos with sound
- [ ] Captions for video content

---

#### **Responsive Design Breakpoints**

```css
/* Mobile First Approach */
xs: 0-639px (default)
sm: 640px+ (tablets)
md: 768px+ (tablets landscape, small laptops)
lg: 1024px+ (laptops)
xl: 1280px+ (desktops)
2xl: 1536px+ (large desktops)
```

**Testing Devices**

- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Laptop (1440px)
- [ ] Desktop (1920px)

---

#### **Analytics & Tracking**

**Google Analytics 4 Events**

- [ ] Page views (automatic)
- [ ] Button clicks (CTA tracking)
- [ ] Form submissions
- [ ] Registration initiated
- [ ] Application started
- [ ] Payment initiated
- [ ] Certificate downloaded
- [ ] External link clicks
- [ ] Video plays
- [ ] Scroll depth

**Conversion Goals**

- [ ] User registration
- [ ] Application submission
- [ ] Payment completion
- [ ] Certificate download
- [ ] Contact form submission
- [ ] Newsletter signup

---

### 3.4 Content Requirements

**Text Content (Thai Language)**

- [ ] All headings, body text, CTAs in Thai
- [ ] Tone: Professional yet approachable, educational
- [ ] Avoid jargon, explain technical terms
- [ ] Short paragraphs (2-3 sentences max)
- [ ] Bullet points for scanability

**Visual Content**

- [ ] Hero images: High-quality photos of Thai farms (landscape orientation, 1920x1080)
- [ ] Service icons: Consistent style (line icons or filled)
- [ ] Process diagrams: Infographic style
- [ ] Team photos: Professional headshots
- [ ] Testimonial photos: Real farmers (with permission)
- [ ] Stock photos: Avoid generic stock, use localized content
- [ ] Video (optional): Explainer video about GACP process (2-3 minutes)

**Legal Pages**

- [ ] Privacy Policy (นโยบายความเป็นส่วนตัว)
- [ ] Terms of Service (ข้อกำหนดการใช้งาน)
- [ ] Cookie Policy (นโยบายคุกกี้)
- [ ] Refund Policy (นโยบายการคืนเงิน)

---

## 🚀 4. Implementation Plan & Timeline

### Total Estimated Duration: **12 Weeks**

---

### **Week 1-3: System Audit & Analysis**

**Week 1: Setup & Initial Testing**

- [ ] Kickoff meeting with all team members
- [ ] Environment setup (staging server)
- [ ] Create test user accounts for all roles
- [ ] Document current system architecture
- [ ] Begin Module A-D testing (Application Workflow, Payment, RBAC, Work Orders)

**Week 2: Deep Dive Testing**

- [ ] Complete Module E-I testing (Notifications, Inspection, KPI, Portals)
- [ ] Log all issues in issue tracking system
- [ ] Prioritize issues (P0, P1, P2, P3)
- [ ] Security audit (vulnerability scanning)

**Week 3: Completion & Reporting**

- [ ] Complete Module J-M testing (Free Services, Certificates, Data, Security)
- [ ] Performance benchmarking
- [ ] Compile comprehensive audit report
- [ ] Present findings to stakeholders
- [ ] Finalize prioritized issue list

**Deliverables:**

- ✅ Comprehensive Audit Report (PDF)
- ✅ Prioritized Issue List (spreadsheet or Jira)
- ✅ Security Audit Report
- ✅ Performance Benchmark Report

---

### **Week 4-6: Critical & High-Priority Fixes**

**Week 4: P0 (Critical) Issues**

- [ ] Fix all security vulnerabilities
- [ ] Fix system-breaking bugs
- [ ] Fix data loss/corruption issues
- [ ] Deploy fixes to staging
- [ ] Regression testing

**Week 5: P1 (High) Issues**

- [ ] Fix business logic errors (payment triggers, submission count, state transitions)
- [ ] Fix RBAC permission issues
- [ ] Fix broken integrations (Zoom/Blizz)
- [ ] Deploy fixes to staging
- [ ] Regression testing

**Week 6: P2 (Medium) Issues + Cleanup**

- [ ] Fix usability issues
- [ ] Fix minor bugs
- [ ] Remove/hide unused features
- [ ] Code cleanup and refactoring
- [ ] Documentation updates
- [ ] Final staging deployment

**Deliverables:**

- ✅ Stabilized system on staging environment
- ✅ All P0 and P1 issues resolved
- ✅ Updated issue tracking (P2 and P3 remaining)
- ✅ Regression test report

---

### **Week 7-10: Website Development**

**Week 7: Core Pages Development**

- [ ] Setup Next.js project structure
- [ ] Configure TailwindCSS and shadcn/ui
- [ ] Implement design system (colors, typography, components)
- [ ] Develop Homepage
- [ ] Develop Services Page
- [ ] Develop Pricing Page

**Week 8: Content & Tool Pages**

- [ ] Develop About Us Page
- [ ] Develop Knowledge Base structure and 5-10 initial articles
- [ ] Develop Contact Page with form
- [ ] Develop Free Tool Pages:
  - Track & Trace
  - Survey System
  - Standards Comparator

**Week 9: SEO & Integration**

- [ ] Implement SEO meta tags and structured data
- [ ] Generate sitemap.xml
- [ ] Configure Google Analytics 4
- [ ] Integrate contact form with email/notification system
- [ ] Integrate free tools with backend APIs
- [ ] Mobile responsiveness final checks

**Week 10: Testing & Optimization**

- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Device testing (mobile, tablet, desktop)
- [ ] Lighthouse audits and optimization
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Load testing
- [ ] Content proofreading (Thai language)

**Deliverables:**

- ✅ Feature-complete website on staging
- ✅ All pages responsive and accessible
- ✅ Lighthouse scores >90 across all metrics
- ✅ SEO optimized
- ✅ Analytics configured

---

### **Week 11: Integration, QA & UAT**

**Full System Integration**

- [ ] Integrate website with GACP platform
- [ ] Test registration flow from website → Farmer Portal
- [ ] Test navigation between public website and authenticated portals
- [ ] Test free tools (Track & Trace, Survey, Comparator)
- [ ] Ensure consistent branding and UX

**Regression Testing**

- [ ] Re-run all audit checklist tests
- [ ] Verify all P0, P1, P2 fixes are working
- [ ] Load testing (simulate 100+ concurrent users)
- [ ] Security re-scan
- [ ] Performance benchmarking

**User Acceptance Testing (UAT)**

- [ ] Invite 5-10 external users (farmers, admins)
- [ ] Provide test scenarios
- [ ] Collect feedback
- [ ] Fix critical UAT findings

**Deliverables:**

- ✅ UAT Report
- ✅ Final adjustment list
- ✅ Approval from stakeholders for production deployment

---

### **Week 12: Launch**

**Pre-Launch Checklist**

- [ ] Final code review
- [ ] Final security audit
- [ ] Database backup
- [ ] Production environment setup (DNS, SSL, firewall)
- [ ] Monitoring and alerting configured (e.g., Sentry, Pingdom)
- [ ] Rollback plan documented
- [ ] Launch announcement prepared (email, social media)

**Launch Day**

- [ ] Deploy backend fixes to production
- [ ] Deploy public website to production
- [ ] DNS cutover (if new domain)
- [ ] Smoke testing on production
- [ ] Monitor logs and error rates
- [ ] Send launch announcement

**Post-Launch (Week 1)**

- [ ] Daily monitoring of system health
- [ ] Rapid response to any critical issues
- [ ] Collect user feedback
- [ ] Hot-fix deployment (if needed)
- [ ] Performance monitoring

**Deliverables:**

- ✅ Live GACP Platform (fully audited and fixed)
- ✅ Live Public Website
- ✅ Launch Report
- ✅ Post-launch monitoring setup

---

## 📦 5. Deliverables Checklist

### **5.1 Audit Phase Deliverables**

- [ ] **Comprehensive Audit Report** (PDF + Markdown)
  - Executive summary
  - Module-by-module findings
  - Issue prioritization
  - Recommendations

- [ ] **Issue Tracking System**
  - Spreadsheet or Jira project
  - All issues logged with severity, status, assignee
  - Progress tracking

- [ ] **Test Documentation**
  - Test cases for all critical paths
  - Test results (pass/fail)
  - Screenshots of issues

- [ ] **Security Audit Report**
  - Vulnerability scan results
  - Penetration test findings (if conducted)
  - Compliance checklist (OWASP Top 10)

---

### **5.2 Website Deliverables**

- [ ] **Website Source Code**
  - Next.js project (TypeScript)
  - All pages and components
  - Properly commented and documented
  - Git repository with commit history

- [ ] **Design Assets**
  - Logo and branding files
  - Icons (SVG)
  - Images (optimized WebP)
  - Style guide document

- [ ] **Content Files**
  - All page content (Thai language)
  - Blog articles (initial 5-10)
  - Legal pages (Privacy Policy, Terms of Service)

- [ ] **SEO Setup**
  - sitemap.xml
  - robots.txt
  - Meta tags spreadsheet (all pages)
  - Structured data examples

---

### **5.3 Documentation**

- [ ] **Technical Documentation**
  - System architecture diagram
  - API documentation (updated)
  - Database schema (updated)
  - Deployment guide

- [ ] **User Guides**
  - Farmer Portal user guide (Thai + English)
  - DTAM Portal user guide for each role
  - Admin manual

- [ ] **Developer Documentation**
  - Setup instructions (local development)
  - Coding standards
  - Git workflow
  - Testing procedures

---

## ✅ 6. Success Criteria & KPIs

### **6.1 Audit Success Criteria**

| Metric                   | Target                                     |
| ------------------------ | ------------------------------------------ |
| **Audit Coverage**       | 100% of all modules (A-M) tested           |
| **Critical Issues (P0)** | 0 remaining at launch                      |
| **High Issues (P1)**     | <5 remaining at launch                     |
| **Security Score**       | No high or critical vulnerabilities        |
| **Performance Score**    | >85/100 (average API response time <500ms) |

---

### **6.2 Website Success Criteria**

| Metric                        | Target                                     |
| ----------------------------- | ------------------------------------------ |
| **Lighthouse Performance**    | >90                                        |
| **Lighthouse Accessibility**  | >90                                        |
| **Lighthouse Best Practices** | >90                                        |
| **Lighthouse SEO**            | >90                                        |
| **Page Load Time**            | <2 seconds                                 |
| **Mobile Responsiveness**     | 100% (all pages work on mobile)            |
| **SEO**                       | All pages indexed by Google within 2 weeks |

---

### **6.3 Business KPIs (Post-Launch, 3 Months)**

| Metric                          | Target                                      |
| ------------------------------- | ------------------------------------------- |
| **Website Traffic**             | 10,000+ monthly visitors                    |
| **Registration Rate**           | 5% of visitors (500+ new users)             |
| **Application Submission Rate** | 20% of registered users (100+ applications) |
| **Application Approval Rate**   | >85%                                        |
| **Average Processing Time**     | <30 days (from submission to certificate)   |
| **Customer Satisfaction**       | >4.5/5.0 (survey-based)                     |
| **System Uptime**               | >99.9%                                      |

---

## ⚠️ 7. Risk Management

### **7.1 Identified Risks**

| Risk                                     | Impact | Probability | Mitigation Strategy                                     |
| ---------------------------------------- | ------ | ----------- | ------------------------------------------------------- |
| **Critical bugs discovered late**        | High   | Medium      | Early and thorough audit in Week 1-3                    |
| **Timeline slippage**                    | Medium | Medium      | Weekly progress reviews, buffer time built in           |
| **Scope creep**                          | Medium | High        | Strict change control process, "no new features" policy |
| **Key team member unavailable**          | High   | Low         | Cross-training, documentation                           |
| **Security vulnerability in production** | High   | Low         | Security audit, penetration testing, monitoring         |
| **Performance issues at scale**          | Medium | Medium      | Load testing, performance benchmarking                  |
| **Content delays (Thai translation)**    | Low    | Medium      | Prepare content early, parallel track                   |
| **Third-party integration failure**      | Medium | Low         | Fallback plans for Zoom/Blizz, mock payment             |

---

### **7.2 Contingency Plans**

**If Critical Bug Found Post-Launch:**

1. Activate incident response team
2. Assess impact and affected users
3. Deploy hotfix within 4 hours
4. Communicate to users via notification system

**If Timeline Slips by >1 Week:**

1. Re-prioritize remaining tasks
2. Consider phased launch (core features first, nice-to-haves later)
3. Request additional resources

**If Website Traffic Lower Than Expected:**

1. Increase SEO efforts (more blog content, backlinks)
2. Activate paid marketing (Google Ads, Facebook Ads)
3. Partnerships with agricultural organizations

---

## 📞 8. Immediate Next Steps

### **Action Items (Before Project Kickoff)**

1. **Review this Brief**
   - [ ] All team members read and understand the scope
   - [ ] Clarify any questions or ambiguities

2. **Confirm Resources**
   - [ ] Development team assigned (frontend, backend, QA)
   - [ ] Content team assigned (copywriting, translation)
   - [ ] Design team assigned (UI/UX, graphics)

3. **Setup Project Management**
   - [ ] Create Jira/Trello project
   - [ ] Setup Git repository
   - [ ] Configure staging environment
   - [ ] Setup communication channels (Slack, Discord)

4. **Schedule Kickoff Meeting**
   - [ ] Date/time confirmed
   - [ ] Agenda prepared
   - [ ] All stakeholders invited

5. **Prepare Test Data**
   - [ ] Create test user accounts
   - [ ] Create sample applications in various states
   - [ ] Prepare test payment scenarios

---

## 📋 9. Approval & Sign-Off

**Project Sponsor:** \***\*\*\*\*\***\_\_\***\*\*\*\*\*** Date: \***\*\_\_\*\***

**Technical Lead:** \***\*\*\*\*\***\_\_\***\*\*\*\*\*** Date: \***\*\_\_\*\***

**QA Lead:** \***\*\*\*\*\***\_\_\***\*\*\*\*\*** Date: \***\*\_\_\*\***

---

## 📚 10. Appendices

### **Appendix A: Technology Stack Reference**

- **Frontend:** Next.js 14+, React 18+, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** Node.js, Express (or Next.js API Routes)
- **Database:** PostgreSQL (or your current DB)
- **Authentication:** JWT, bcrypt
- **Payment:** Mock Omise (future: real Omise integration)
- **Video Calls:** Zoom API, Blizz API
- **Notifications:** Email (Nodemailer), SMS (optional), WebSocket (Socket.IO)
- **File Storage:** Local storage (future: AWS S3)
- **Monitoring:** Sentry (errors), Google Analytics (user behavior)
- **Deployment:** Vercel (frontend), AWS/DigitalOcean (backend)

---

### **Appendix B: Glossary**

- **GACP:** Good Agricultural and Collection Practices (มาตรฐานการปฏิบัติทางการเกษตรที่ดี)
- **DTAM:** Department of Traditional and Alternative Medicine (กรมการแพทย์แผนไทยและการแพทย์ทางเลือก)
- **Lot ID:** Unique identifier for farm inspection batch
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **P0, P1, P2, P3:** Priority levels (Critical, High, Medium, Low)
- **Lighthouse:** Google's web performance auditing tool
- **WCAG:** Web Content Accessibility Guidelines
- **SEO:** Search Engine Optimization
- **CTA:** Call to Action

---

### **Appendix C: Contact Information**

**Project Manager:**  
Name: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Email: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Phone: \***\*\*\*\*\***\_\_\***\*\*\*\*\***

**Technical Lead:**  
Name: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Email: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Phone: \***\*\*\*\*\***\_\_\***\*\*\*\*\***

**QA Lead:**  
Name: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Email: \***\*\*\*\*\***\_\_\***\*\*\*\*\***  
Phone: \***\*\*\*\*\***\_\_\***\*\*\*\*\***

---

## 🎉 Conclusion

This project is **NOT a rebuild**—it's a **refinement and enhancement** of a nearly complete system. Our focus is on:

1. ✅ **Validating** that the existing system works as intended
2. 🐛 **Fixing** all bugs and inconsistencies
3. 🧹 **Cleaning** up the codebase and UX
4. 🌐 **Building** a public website to attract users

By following this brief, we will deliver:

- ✨ A **stable, production-ready GACP Platform**
- 🚀 A **modern, SEO-optimized public website**
- 📊 A **comprehensive audit report** for future reference
- 📚 **Complete documentation** for maintenance and scaling

**Let's build something great! 🚀🌱**

---

**End of Brief**
