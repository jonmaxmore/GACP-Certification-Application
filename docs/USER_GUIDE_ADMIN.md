# Administrator User Guide

## GACP Certify Flow Admin Portal

### Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Managing Applications](#managing-applications)
5. [Document Verification](#document-verification)
6. [User Management](#user-management)
7. [Payment Processing](#payment-processing)
8. [Reports & Analytics](#reports--analytics)
9. [System Settings](#system-settings)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Introduction

Welcome to the GACP Certify Flow Admin Portal Administrator Guide. This comprehensive guide will help you manage agricultural certification applications, process documents, oversee payments, and maintain the system effectively.

### What is GACP Certify Flow?

GACP Certify Flow is a digital platform designed to streamline the Good Agricultural and Collection Practices (GACP) certification process. As an administrator, you have full access to manage applications, users, and system configurations.

### Your Role as Administrator

As an administrator, you can:

- ✅ Review and approve/reject applications
- ✅ Verify documents and certifications
- ✅ Manage user accounts and permissions
- ✅ Process and verify payments
- ✅ Generate reports and analytics
- ✅ Configure system settings
- ✅ Monitor system health and performance

---

## Getting Started

### Logging In

1. Navigate to [https://admin.gacp-certify.com](https://admin.gacp-certify.com)
2. Enter your administrator email address
3. Enter your password
4. Click "Sign In"

> **Security Tip:** Enable two-factor authentication (2FA) for enhanced security. Go to Profile → Security Settings → Enable 2FA.

### First Login Setup

After your first login:

1. **Complete Your Profile**
   - Go to your profile (top right corner)
   - Add your full name
   - Upload profile picture
   - Set your notification preferences

2. **Configure Notifications**
   - Email notifications for new applications
   - SMS alerts for urgent matters
   - In-app notifications

3. **Review Dashboard**
   - Familiarize yourself with the dashboard layout
   - Check pending tasks
   - Review system status

---

## Dashboard Overview

### Main Dashboard Components

#### Statistics Cards

The top section displays key metrics:

| Metric                  | Description                            |
| ----------------------- | -------------------------------------- |
| **Total Applications**  | All applications in the system         |
| **Pending Review**      | Applications awaiting your review      |
| **Approved This Month** | Applications approved in current month |
| **Revenue This Month**  | Total payment revenue collected        |

#### Recent Activity

View the latest actions:

- New application submissions
- Document uploads
- Payment completions
- User registrations

#### Task Queue

Your pending tasks:

- Applications requiring review
- Documents needing verification
- Payments to confirm
- User account approvals

#### System Status

Monitor system health:

- Server status
- Database connectivity
- Storage usage
- API performance

### Customizing Your Dashboard

Click the ⚙️ **Settings** icon to:

- Rearrange widgets
- Show/hide components
- Set default filters
- Configure refresh intervals

---

## Managing Applications

### Viewing Applications

#### Application List

Navigate to **Applications** → **All Applications**

**Filter Options:**

- Status (Draft, Submitted, Under Review, Approved, Rejected)
- Date range
- Farm name
- Crop type
- Assigned reviewer

**Sort Options:**

- Submission date
- Last updated
- Farm name
- Priority

#### Application Details

Click any application to view:

**Applicant Information:**

- Farmer name and contact
- Farm name and location
- Farm size and crop type
- Previous certifications

**Application Status:**

- Current status
- Submission date
- Last update
- Assigned reviewer
- Status history

**Documents:**

- Uploaded documents list
- Verification status
- Download options

**Comments & Notes:**

- Internal notes
- Communication history
- Reviewer comments

### Reviewing Applications

#### Step-by-Step Review Process

1. **Open Application**
   - Click on application from list
   - Review applicant information

2. **Verify Documents**
   - Check all required documents are uploaded
   - Verify document authenticity
   - Mark each document as verified/rejected

3. **Conduct Assessment**
   - Review farm details
   - Check compliance requirements
   - Note any issues or concerns

4. **Make Decision**
   - Approve: If all requirements met
   - Reject: If requirements not met
   - Request More Info: If additional documents needed

#### Approval Process

To approve an application:

1. Click **Approve** button
2. Add approval notes
3. Set certification valid period
4. Generate certificate
5. Confirm approval

**Example Approval Notes:**

```
All documents verified and compliant.
Farm meets GACP standards.
Certificate valid: 2025-2027
```

#### Rejection Process

To reject an application:

1. Click **Reject** button
2. Select rejection reason:
   - Incomplete documents
   - Non-compliant practices
   - Failed inspection
   - Other (specify)
3. Add detailed explanation
4. Suggest corrective actions
5. Confirm rejection

**Example Rejection Note:**

```
Reason: Incomplete documents

Missing documents:
- Updated land deed
- Recent farm inspection report

Action required:
Please upload the missing documents and resubmit.
```

#### Requesting Additional Information

If more information needed:

1. Click **Request Info** button
2. List required documents/information
3. Set deadline for submission
4. Send notification to farmer

### Assigning Applications

Distribute workload among team:

1. Select application(s)
2. Click **Assign**
3. Choose reviewer from dropdown
4. Add assignment note
5. Click **Assign**

**Bulk Assignment:**

- Select multiple applications using checkboxes
- Click **Bulk Actions** → **Assign**
- Choose reviewer
- Confirm bulk assignment

---

## Document Verification

### Document Types

Common documents in GACP applications:

| Document Type             | Purpose               | Verification Checklist                |
| ------------------------- | --------------------- | ------------------------------------- |
| **ID Card**               | Identity verification | Check photo, name, ID number match    |
| **Land Deed**             | Property ownership    | Verify ownership, location, size      |
| **Farm Photos**           | Visual inspection     | Check date, clarity, completeness     |
| **Previous Certificates** | History               | Verify authenticity, validity         |
| **Inspection Reports**    | Compliance            | Check inspector credentials, findings |

### Verification Process

1. **Open Document**
   - Click document thumbnail
   - View full-size document

2. **Check Document Quality**
   - Is it readable?
   - Is it complete?
   - Is it recent (if date-sensitive)?

3. **Verify Authenticity**
   - Check for tampering
   - Verify official stamps/signatures
   - Cross-reference with external systems if needed

4. **Mark Verification Status**
   - ✅ **Verified**: Document is authentic and acceptable
   - ❌ **Rejected**: Document has issues
   - ⚠️ **Needs Review**: Requires additional scrutiny

5. **Add Notes**
   - Document observations
   - Flag concerns
   - Provide feedback

### Document Security

**Best Practices:**

- Always verify document dates
- Check for digital manipulation
- Verify official seals and signatures
- Cross-reference information across documents
- Report suspected fraud immediately

### Managing Document Issues

**If document is unclear:**

1. Mark as "Needs Review"
2. Request clearer copy from farmer
3. Add specific feedback on what's needed

**If document is suspicious:**

1. Mark as "Rejected"
2. Document concerns
3. Escalate to supervisor
4. Consider reporting to authorities if fraud suspected

---

## User Management

### Viewing Users

Navigate to **Users** → **All Users**

**User Types:**

- **Admin**: Full system access
- **Moderator**: Review and approve applications
- **Farmer**: Submit applications
- **Auditor**: View and audit applications

### Creating User Accounts

1. Click **Add New User**
2. Fill in user details:
   - Email address
   - Full name
   - Role
   - Department (optional)
3. Set initial password or send invitation email
4. Click **Create User**

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Editing User Accounts

1. Find user in list
2. Click user name
3. Click **Edit**
4. Modify fields as needed:
   - Name
   - Email
   - Role
   - Active status
5. Click **Save Changes**

### Deactivating Users

To temporarily disable a user:

1. Open user profile
2. Toggle **Active Status** to OFF
3. Add deactivation note
4. Click **Save**

**Note:** Deactivated users cannot log in but their data is preserved.

### Deleting Users

⚠️ **Warning:** Deleting users is permanent and removes all associated data.

1. Open user profile
2. Scroll to bottom
3. Click **Delete User**
4. Confirm deletion
5. Enter your password
6. Click **Confirm Delete**

### Managing Permissions

Fine-tune user access:

1. Open user profile
2. Click **Permissions** tab
3. Toggle permissions:
   - View applications
   - Create applications
   - Approve applications
   - Manage users
   - Access reports
   - System settings
4. Click **Save Permissions**

---

## Payment Processing

### Viewing Payments

Navigate to **Payments** → **All Payments**

**Payment Status:**

- 🟡 **Pending**: Awaiting payment
- 🔵 **Processing**: Payment being verified
- 🟢 **Completed**: Payment confirmed
- 🔴 **Failed**: Payment failed
- ⚫ **Refunded**: Payment refunded

### Payment Methods

The system supports:

1. **QR Code Payment**
   - PromptPay/ThaiQR
   - Instant verification

2. **Bank Transfer**
   - Manual verification required
   - 1-2 business days

3. **Credit/Debit Card**
   - Online processing
   - Instant confirmation

### Confirming Payments

For manual verification (bank transfers):

1. Open payment record
2. Check bank statement/receipt
3. Verify:
   - Amount matches
   - Transaction ID valid
   - Date is recent
4. Click **Confirm Payment**
5. Enter transaction reference
6. Add verification note
7. Click **Save**

### Issuing Refunds

When refund is needed:

1. Open payment record
2. Click **Refund** button
3. Enter refund reason:
   - Application rejected
   - Duplicate payment
   - Processing error
   - User request
4. Confirm refund amount
5. Click **Process Refund**

**Processing Time:**

- Credit card: 5-10 business days
- Bank transfer: 3-5 business days
- Wallet: Instant

### Payment Reports

Generate payment reports:

1. Navigate to **Reports** → **Payment Reports**
2. Set filters:
   - Date range
   - Payment method
   - Status
3. Click **Generate Report**
4. Export as PDF/Excel

---

## Reports & Analytics

### Dashboard Analytics

Quick insights on main dashboard:

- Application trends
- Approval rates
- Revenue metrics
- User activity

### Pre-built Reports

#### Application Reports

**Monthly Application Summary:**

- Total submissions
- Approval/rejection rates
- Average processing time
- Status breakdown

**Farm Type Analysis:**

- Distribution by crop type
- Farm size statistics
- Geographic distribution

#### Financial Reports

**Revenue Report:**

- Total revenue
- Revenue by payment method
- Refund summary
- Outstanding payments

**Payment Reconciliation:**

- Confirmed vs pending
- Failed transactions
- Refund tracking

#### Performance Reports

**Reviewer Performance:**

- Applications processed
- Average review time
- Approval/rejection rates

**System Performance:**

- Response times
- Error rates
- Uptime statistics

### Custom Reports

Create custom reports:

1. Navigate to **Reports** → **Custom Report**
2. Select report type
3. Choose fields to include
4. Set filters and date range
5. Click **Generate**
6. Export or schedule email delivery

### Scheduled Reports

Automate report delivery:

1. Create or open existing report
2. Click **Schedule**
3. Set frequency:
   - Daily
   - Weekly
   - Monthly
4. Choose recipients
5. Set delivery time
6. Click **Save Schedule**

### Exporting Data

Export data in multiple formats:

**Supported Formats:**

- PDF: Formatted reports
- Excel: Data analysis
- CSV: Raw data
- JSON: API integration

**Export Steps:**

1. Generate report
2. Click **Export** button
3. Choose format
4. Click **Download**

---

## System Settings

### General Settings

Configure system-wide settings:

**Organization Details:**

- Organization name
- Logo
- Contact information
- Operating hours

**Regional Settings:**

- Language
- Timezone
- Currency
- Date format

### Email Settings

Configure email notifications:

**SMTP Configuration:**

- SMTP server
- Port
- Username/password
- From address

**Email Templates:**

- Customize notification emails
- Add branding
- Multiple languages

### Notification Settings

Manage notification preferences:

**Email Notifications:**

- New applications
- Document uploads
- Payment confirmations
- System alerts

**SMS Notifications:**

- Urgent approvals needed
- Payment failures
- System downtime

**In-App Notifications:**

- Task assignments
- Comments/mentions
- Status updates

### Security Settings

Enhance system security:

**Password Policy:**

- Minimum length
- Complexity requirements
- Expiration period
- History restrictions

**Session Management:**

- Session timeout
- Concurrent sessions
- Remember me duration

**Two-Factor Authentication:**

- Enable/disable 2FA
- Supported methods
- Backup codes

### Backup Settings

Configure automated backups:

**Backup Schedule:**

- Frequency (daily, weekly)
- Time of day
- Retention period

**Backup Location:**

- Cloud storage
- Local server
- External drive

### Integration Settings

Connect external services:

**Payment Gateways:**

- PromptPay
- Credit card processors
- Bank transfer systems

**Document Storage:**

- AWS S3
- Google Cloud Storage
- Azure Blob Storage

**Notification Services:**

- Email providers (SendGrid, SES)
- SMS providers (Twilio)
- Slack webhooks

---

## Troubleshooting

### Common Issues

#### Cannot Log In

**Problem:** Login fails with error message

**Solutions:**

1. Check email spelling
2. Verify password (case-sensitive)
3. Clear browser cache and cookies
4. Try password reset
5. Contact system administrator

#### Documents Won't Upload

**Problem:** Document upload fails

**Solutions:**

1. Check file size (max 10MB)
2. Verify file type (PDF, JPG, PNG)
3. Check internet connection
4. Try different browser
5. Compress large files

#### Application Won't Submit

**Problem:** Cannot submit application for review

**Solutions:**

1. Verify all required fields completed
2. Check all documents uploaded
3. Review error messages
4. Save draft and refresh page
5. Contact support if persists

#### Slow Performance

**Problem:** System is running slowly

**Solutions:**

1. Close unnecessary browser tabs
2. Clear browser cache
3. Check internet speed
4. Try different browser
5. Report to IT if system-wide

### Error Messages

#### Common Error Codes

| Code | Meaning           | Action                        |
| ---- | ----------------- | ----------------------------- |
| 400  | Bad Request       | Check input data              |
| 401  | Unauthorized      | Log in again                  |
| 403  | Forbidden         | Contact admin for permissions |
| 404  | Not Found         | Check URL/resource ID         |
| 429  | Too Many Requests | Wait and retry                |
| 500  | Server Error      | Report to IT                  |

### Getting Help

#### In-App Support

1. Click **Help** icon (❓)
2. Search knowledge base
3. Submit support ticket

#### Contact Support

- **Email:** admin-support@gacp-certify.com
- **Phone:** +66 2 xxx xxxx (ext. 123)
- **Hours:** Monday-Friday, 8:00 AM - 5:00 PM

#### Emergency Support

For critical issues:

- **24/7 Hotline:** +66 8x xxx xxxx
- **Email:** emergency@gacp-certify.com

---

## FAQ

### General Questions

**Q: How do I reset my password?**

A: Click "Forgot Password" on login page, enter your email, and follow the reset link sent to your email.

---

**Q: Can I access the system on mobile devices?**

A: Yes, the system is fully responsive and works on tablets and smartphones. There's also a dedicated mobile app available.

---

**Q: How do I change my notification preferences?**

A: Go to Profile → Settings → Notifications, then toggle preferences for each notification type.

---

### Application Management

**Q: What is the average processing time for applications?**

A: Standard applications take 3-5 business days. Complex cases may take up to 10 business days.

---

**Q: Can I reassign an application after it's been assigned?**

A: Yes, open the application, click Reassign, choose new reviewer, and save.

---

**Q: How do I handle applications that are missing documents?**

A: Click "Request Info," specify missing documents, set deadline, and notify the farmer.

---

### Document Verification

**Q: What if I suspect a document is fraudulent?**

A: Mark it as rejected, document your concerns, escalate to your supervisor, and consider reporting to authorities.

---

**Q: Can farmers upload documents after application submission?**

A: Yes, if you request additional information, farmers can upload more documents before final review.

---

**Q: What file types are accepted for documents?**

A: PDF, JPG, PNG, and TIFF files up to 10MB each.

---

### Payment Processing

**Q: How long does payment verification take?**

A: QR code payments: instant; Bank transfers: 1-2 business days; Credit cards: instant.

---

**Q: Can I issue partial refunds?**

A: Yes, enter the refund amount when processing the refund (must be equal to or less than original payment).

---

**Q: What happens if a payment fails?**

A: The system automatically notifies the farmer. They can retry payment or use a different method.

---

### System & Technical

**Q: Is my data encrypted?**

A: Yes, all data is encrypted in transit (TLS 1.3) and at rest (AES-256).

---

**Q: How often is the system backed up?**

A: Daily automated backups at 2:00 AM local time, with 30-day retention.

---

**Q: Can I export data from the system?**

A: Yes, most reports can be exported as PDF, Excel, or CSV files.

---

## Need More Help?

For additional assistance:

📧 **Email:** admin-support@gacp-certify.com  
📞 **Phone:** +66 2 xxx xxxx (ext. 123)  
🌐 **Knowledge Base:** https://docs.gacp-certify.com  
💬 **Live Chat:** Available 8 AM - 5 PM (weekdays)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
