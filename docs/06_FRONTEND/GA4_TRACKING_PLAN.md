# GACP Platform - Google Analytics 4 Tracking Plan

**Version:** 1.0.0  
**Created:** October 14, 2025  
**Owner:** Data Analysis Team

---

## 📊 Table of Contents

1. [Overview](#overview)
2. [Event Categories](#event-categories)
3. [Critical Business Events](#critical-business-events)
4. [User Journey Events](#user-journey-events)
5. [Admin Portal Events](#admin-portal-events)
6. [Custom Dimensions & Metrics](#custom-dimensions--metrics)
7. [Implementation Code](#implementation-code)

---

## Overview

This document defines all Google Analytics 4 (GA4) tracking events for the GACP Platform. These events enable:

- ✅ **User Behavior Analysis** - Understand how users interact with the platform
- ✅ **Conversion Tracking** - Monitor application submission and approval rates
- ✅ **Revenue Analytics** - Track payment performance and revenue
- ✅ **Performance Monitoring** - Identify bottlenecks and drop-off points
- ✅ **Admin Insights** - Monitor internal team efficiency

---

## Event Categories

Events are organized into 5 main categories:

| Category           | Description                          | Event Count |
| ------------------ | ------------------------------------ | ----------- |
| **Authentication** | Login, logout, registration          | 3 events    |
| **Application**    | Application lifecycle events         | 8 events    |
| **Payment**        | Payment flow and transactions        | 6 events    |
| **Inspection**     | Inspection scheduling and completion | 4 events    |
| **Certificate**    | Certificate issuance and revocation  | 3 events    |
| **Admin**          | Admin portal operations              | 5 events    |

**Total Events:** 29 tracking events

---

## Critical Business Events

### 1. Payment Events

#### 1.1 `payment_initiated`

**Trigger:** User clicks "Pay Now" button  
**Purpose:** Track payment funnel start

```typescript
gtag('event', 'payment_initiated', {
  application_id: 'app_123',
  user_id: 'user_456',
  amount: 5000,
  currency: 'THB',
  submission_count: 3,
  payment_reason: 'RESUBMISSION_FEE',
  timestamp: new Date().toISOString()
});
```

**Parameters:**

- `application_id` (string) - Application ID
- `user_id` (string) - User ID
- `amount` (number) - Payment amount in THB
- `currency` (string) - Always 'THB'
- `submission_count` (number) - Current submission count
- `payment_reason` (string) - 'INITIAL_SUBMISSION' or 'RESUBMISSION_FEE'
- `timestamp` (string) - ISO timestamp

---

#### 1.2 `payment_completed`

**Trigger:** Payment successfully processed  
**Purpose:** Track successful payments and revenue

```typescript
gtag('event', 'payment_completed', {
  application_id: 'app_123',
  user_id: 'user_456',
  amount: 5000,
  currency: 'THB',
  transaction_id: 'trx_789',
  payment_method: 'credit_card',
  time_to_pay: 180, // seconds
  submission_count: 3
});
```

**Parameters:**

- `application_id` (string)
- `user_id` (string)
- `amount` (number)
- `currency` (string)
- `transaction_id` (string) - Omise transaction ID
- `payment_method` (string) - Payment method used
- `time_to_pay` (number) - Seconds from initiated to completed
- `submission_count` (number)

---

#### 1.3 `payment_timeout`

**Trigger:** Payment expires after 15 minutes  
**Purpose:** Track payment abandonment and timeout rate

```typescript
gtag('event', 'payment_timeout', {
  application_id: 'app_123',
  user_id: 'user_456',
  amount: 5000,
  currency: 'THB',
  time_expired: 900, // 15 minutes in seconds
  submission_count: 3,
  last_page_viewed: '/payment/checkout'
});
```

**Parameters:**

- `application_id` (string)
- `user_id` (string)
- `amount` (number)
- `currency` (string)
- `time_expired` (number) - Seconds until timeout
- `submission_count` (number)
- `last_page_viewed` (string) - Last page user was on

**KPI Target:** Payment timeout rate < 10%

---

#### 1.4 `payment_cancelled`

**Trigger:** User cancels payment  
**Purpose:** Track user-initiated cancellations

```typescript
gtag('event', 'payment_cancelled', {
  application_id: 'app_123',
  user_id: 'user_456',
  amount: 5000,
  currency: 'THB',
  cancellation_reason: 'user_cancelled',
  time_before_cancel: 120 // seconds
});
```

---

#### 1.5 `payment_failed`

**Trigger:** Payment processing fails  
**Purpose:** Track payment errors

```typescript
gtag('event', 'payment_failed', {
  application_id: 'app_123',
  user_id: 'user_456',
  amount: 5000,
  currency: 'THB',
  error_code: 'CARD_DECLINED',
  error_message: 'Insufficient funds',
  payment_method: 'credit_card'
});
```

---

### 2. Application Lifecycle Events

#### 2.1 `application_created`

**Trigger:** User creates new application (draft)

```typescript
gtag('event', 'application_created', {
  application_id: 'app_123',
  user_id: 'user_456',
  user_role: 'FARMER',
  timestamp: new Date().toISOString()
});
```

---

#### 2.2 `application_submitted`

**Trigger:** User submits application for review

```typescript
gtag('event', 'application_submitted', {
  application_id: 'app_123',
  user_id: 'user_456',
  submission_count: 1,
  is_resubmission: false,
  document_count: 5,
  time_to_complete: 1200 // seconds from created to submitted
});
```

**KPI Target:** Average time to complete < 30 minutes

---

#### 2.3 `application_approved`

**Trigger:** Application approved by approver

```typescript
gtag('event', 'application_approved', {
  application_id: 'app_123',
  user_id: 'user_456',
  approver_id: 'admin_789',
  submission_count: 1,
  total_processing_time: 86400, // seconds
  rejection_count: 0
});
```

**KPI Target:** Approval rate > 60% on first submission

---

#### 2.4 `application_rejected`

**Trigger:** Application rejected by reviewer/approver

```typescript
gtag('event', 'application_rejected', {
  application_id: 'app_123',
  user_id: 'user_456',
  reviewer_id: 'admin_789',
  submission_count: 1,
  rejection_reason: 'INCOMPLETE_DOCUMENTS',
  rejection_count: 1
});
```

---

#### 2.5 `application_cancelled`

**Trigger:** User cancels application

```typescript
gtag('event', 'application_cancelled', {
  application_id: 'app_123',
  user_id: 'user_456',
  cancellation_status: 'DRAFT', // Status when cancelled
  cancellation_reason: 'user_initiated',
  had_payment: false,
  refund_amount: 0 // Always 0 (no refunds)
});
```

---

### 3. Reschedule Events

#### 3.1 `reschedule_requested`

**Trigger:** User requests inspection reschedule

```typescript
gtag('event', 'reschedule_requested', {
  application_id: 'app_123',
  user_id: 'user_456',
  inspection_id: 'insp_789',
  reschedule_count: 1,
  original_date: '2025-10-20',
  new_date: '2025-10-25',
  reason: 'Weather conditions'
});
```

**KPI Target:** Reschedule rate < 15%

---

#### 3.2 `reschedule_limit_reached`

**Trigger:** User tries to reschedule but hit limit (1 time)

```typescript
gtag('event', 'reschedule_limit_reached', {
  application_id: 'app_123',
  user_id: 'user_456',
  reschedule_count: 1,
  max_reschedule: 1,
  action_taken: 'REJOINED_QUEUE'
});
```

---

### 4. Certificate Events

#### 4.1 `certificate_issued`

**Trigger:** Certificate issued after approval

```typescript
gtag('event', 'certificate_issued', {
  certificate_id: 'cert_123',
  application_id: 'app_456',
  user_id: 'user_789',
  certificate_type: 'GACP',
  validity_period: 365, // days
  total_cost: 5000 // Total paid
});
```

---

#### 4.2 `certificate_revoked`

**Trigger:** Certificate revoked by admin

```typescript
gtag('event', 'certificate_revoked', {
  certificate_id: 'cert_123',
  user_id: 'user_789',
  revoked_by: 'admin_456',
  revocation_reason: 'VIOLATION_OF_STANDARDS',
  wait_period_days: 30,
  reapplication_date: '2025-11-20'
});
```

**KPI Target:** Revocation rate < 5%

---

#### 4.3 `certificate_verified`

**Trigger:** Public verifies certificate

```typescript
gtag('event', 'certificate_verified', {
  certificate_id: 'cert_123',
  verification_method: 'QR_CODE', // or 'SEARCH'
  is_valid: true,
  verifier_ip: '192.168.1.1'
});
```

---

### 5. Admin Portal Events

#### 5.1 `admin_bulk_operation`

**Trigger:** Admin performs bulk action

```typescript
gtag('event', 'admin_bulk_operation', {
  admin_id: 'admin_123',
  operation_type: 'BULK_APPROVE',
  entity_type: 'APPLICATION',
  entity_count: 10,
  success_count: 9,
  failed_count: 1
});
```

---

#### 5.2 `admin_report_generated`

**Trigger:** Admin generates custom report

```typescript
gtag('event', 'admin_report_generated', {
  admin_id: 'admin_123',
  report_type: 'MONTHLY_REVENUE',
  date_range: '2025-10-01_to_2025-10-31',
  export_format: 'CSV',
  record_count: 150
});
```

---

#### 5.3 `admin_announcement_created`

**Trigger:** Admin creates system announcement

```typescript
gtag('event', 'admin_announcement_created', {
  admin_id: 'admin_123',
  announcement_type: 'MAINTENANCE',
  target_audience: 'ALL_USERS',
  scheduled_date: '2025-10-25'
});
```

---

## Custom Dimensions & Metrics

### Custom Dimensions

| Dimension            | Description        | Example                                      |
| -------------------- | ------------------ | -------------------------------------------- |
| `user_role`          | User role          | FARMER, REVIEWER, INSPECTOR, APPROVER, ADMIN |
| `application_status` | Application status | DRAFT, SUBMITTED, APPROVED, REJECTED         |
| `payment_reason`     | Payment reason     | INITIAL_SUBMISSION, RESUBMISSION_FEE         |
| `submission_count`   | Submission attempt | 1, 2, 3, 4, 5...                             |
| `rejection_count`    | Total rejections   | 0, 1, 2, 3...                                |

### Custom Metrics

| Metric                  | Description                                | Calculation                   |
| ----------------------- | ------------------------------------------ | ----------------------------- |
| `time_to_pay`           | Time from payment initiated to completed   | Seconds                       |
| `time_to_complete`      | Time from application created to submitted | Seconds                       |
| `total_processing_time` | Time from submitted to approved/rejected   | Seconds                       |
| `conversion_rate`       | Application approval rate                  | (Approved / Submitted) \* 100 |
| `payment_timeout_rate`  | Payment timeout rate                       | (Timeouts / Initiated) \* 100 |

---

## Implementation Code

### Setup GA4 (apps/farmer-portal/lib/analytics.ts)

```typescript
/**
 * GACP Platform - Analytics Tracking
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

// Initialize GA4
export function initGA() {
  if (typeof window !== 'undefined' && !window.gtag) {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  }
}

// Track events
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
    console.log('📊 GA4 Event:', eventName, params);
  }
}

// Predefined event trackers
export const analytics = {
  // Payment
  paymentInitiated: (params: {
    applicationId: string;
    userId: string;
    amount: number;
    submissionCount: number;
  }) => trackEvent('payment_initiated', { ...params, currency: 'THB' }),

  paymentCompleted: (params: {
    applicationId: string;
    userId: string;
    amount: number;
    transactionId: string;
    timeToPay: number;
  }) => trackEvent('payment_completed', { ...params, currency: 'THB' }),

  paymentTimeout: (params: {
    applicationId: string;
    userId: string;
    amount: number;
    timeExpired: number;
  }) => trackEvent('payment_timeout', { ...params, currency: 'THB' }),

  // Application
  applicationCreated: (params: { applicationId: string; userId: string }) =>
    trackEvent('application_created', params),

  applicationSubmitted: (params: {
    applicationId: string;
    userId: string;
    submissionCount: number;
    isResubmission: boolean;
  }) => trackEvent('application_submitted', params),

  applicationCancelled: (params: {
    applicationId: string;
    userId: string;
    cancellationStatus: string;
  }) => trackEvent('application_cancelled', { ...params, refundAmount: 0 }),

  // Reschedule
  rescheduleRequested: (params: {
    applicationId: string;
    userId: string;
    rescheduleCount: number;
  }) => trackEvent('reschedule_requested', params),

  rescheduleLimitReached: (params: {
    applicationId: string;
    userId: string;
    rescheduleCount: number;
  }) => trackEvent('reschedule_limit_reached', { ...params, maxReschedule: 1 }),

  // Certificate
  certificateRevoked: (params: {
    certificateId: string;
    userId: string;
    revokedBy: string;
    revocationReason: string;
  }) => trackEvent('certificate_revoked', { ...params, waitPeriodDays: 30 }),

  certificateVerified: (params: {
    certificateId: string;
    verificationMethod: string;
    isValid: boolean;
  }) => trackEvent('certificate_verified', params)
};
```

---

## Success Metrics (KPIs)

### Business KPIs

| KPI                         | Target | Tracking Event                                   |
| --------------------------- | ------ | ------------------------------------------------ |
| Payment Completion Rate     | > 85%  | `payment_completed` / `payment_initiated`        |
| Payment Timeout Rate        | < 10%  | `payment_timeout` / `payment_initiated`          |
| Application Approval Rate   | > 60%  | `application_approved` / `application_submitted` |
| Reschedule Rate             | < 15%  | `reschedule_requested` / `application_submitted` |
| Certificate Revocation Rate | < 5%   | `certificate_revoked` / `certificate_issued`     |

### Technical KPIs

| KPI                            | Target   | How to Measure                         |
| ------------------------------ | -------- | -------------------------------------- |
| Average Time to Pay            | < 5 min  | `time_to_pay` metric average           |
| Average Application Completion | < 30 min | `time_to_complete` metric average      |
| Average Processing Time        | < 7 days | `total_processing_time` metric average |

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:**

1. Create `apps/farmer-portal/lib/analytics.ts` file
2. Add GA_TRACKING_ID to environment variables
3. Integrate tracking calls in all relevant components
4. Test events in GA4 DebugView
5. Create GA4 dashboard for monitoring

**Owner:** Data Analysis Team  
**Reviewers:** Frontend Team, PM
