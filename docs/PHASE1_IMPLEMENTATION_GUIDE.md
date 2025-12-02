# 🚀 Phase 1 Implementation Guide - Admin Portal Connection

**Phase**: Phase 1.1 - Connect Admin Portal to Backend APIs
**Duration**: 6 weeks
**Budget**: 800K THB
**Priority**: 🔴 CRITICAL
**Status**: 📋 Ready to Start

---

## 📊 Overview

Admin Portal UI อยู่ที่ `apps/admin-portal/` แต่**ยังไม่ได้ connect กับ Backend APIs** ทำให้ DTAM staff ไม่สามารถใช้งานระบบได้

**Current Status**:

- ✅ Admin Portal UI exists (components, pages, layouts)
- ✅ Backend APIs exist and working
- ❌ **NOT CONNECTED** - Using mock data only
- ❌ No API integration layer
- ❌ No state management

**Goal**: Connect every Admin Portal page to real Backend APIs

---

## 🎯 Available Backend APIs

### **Dashboard APIs**

**Base URL**: `/api/dtam/dashboard`

| Endpoint           | Method | Auth | Description                 | Response                             |
| ------------------ | ------ | ---- | --------------------------- | ------------------------------------ |
| `/`                | GET    | DTAM | Get complete dashboard data | Dashboard overview                   |
| `/statistics`      | GET    | DTAM | Get system statistics       | Application counts, status breakdown |
| `/quick-stats`     | GET    | DTAM | Get quick stats widgets     | Total apps, pending, approved, users |
| `/pending-tasks`   | GET    | DTAM | Get assigned pending tasks  | Task list for current user           |
| `/recent-activity` | GET    | DTAM | Get recent activities       | Activity log (last 20 items)         |
| `/trends`          | GET    | DTAM | Get trend data              | 7-day/30-day trends                  |

**Example API Call**:

```typescript
// Get dashboard statistics
const response = await fetch('/api/dtam/dashboard/statistics', {
  headers: {
    Authorization: `Bearer ${dtamToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
// Returns:
// {
//   totalApplications: 1248,
//   pendingReview: 156,
//   approvedThisMonth: 89,
//   activeUsers: 45,
//   statusBreakdown: { submitted: 42, under_review: 78, approved: 89, ... }
// }
```

---

### **Application APIs**

**Base URL**: `/api/applications`

| Endpoint          | Method | Auth | Description                          |
| ----------------- | ------ | ---- | ------------------------------------ |
| `/`               | GET    | DTAM | List all applications (with filters) |
| `/:id`            | GET    | DTAM | Get application details              |
| `/:id/documents`  | GET    | DTAM | Get application documents            |
| `/:id/review`     | POST   | DTAM | Submit document review               |
| `/:id/inspection` | POST   | DTAM | Submit inspection result             |
| `/:id/approve`    | POST   | DTAM | Final approve application            |
| `/:id/reject`     | POST   | DTAM | Reject application                   |
| `/:id/history`    | GET    | DTAM | Get application workflow history     |

**Query Parameters** (for list endpoint):

```
?status=pending_review
&assignedTo=<userId>
&dateFrom=2025-01-01
&dateTo=2025-12-31
&page=1
&limit=20
&sortBy=createdAt
&order=desc
```

---

### **Payment APIs**

**Base URL**: `/api/payments`

| Endpoint      | Method | Auth  | Description          |
| ------------- | ------ | ----- | -------------------- |
| `/`           | GET    | DTAM  | List all payments    |
| `/:id`        | GET    | DTAM  | Get payment details  |
| `/:id/refund` | POST   | Admin | Refund payment       |
| `/statistics` | GET    | DTAM  | Payment statistics   |
| `/pending`    | GET    | DTAM  | Get pending payments |

---

### **Certificate APIs**

**Base URL**: `/api/certificates`

| Endpoint        | Method | Auth     | Description              |
| --------------- | ------ | -------- | ------------------------ |
| `/`             | GET    | DTAM     | List all certificates    |
| `/:id`          | GET    | DTAM     | Get certificate details  |
| `/:id/download` | GET    | DTAM     | Download certificate PDF |
| `/issue`        | POST   | Approver | Issue new certificate    |
| `/:id/revoke`   | PUT    | Approver | Revoke certificate       |
| `/analytics`    | GET    | DTAM     | Certificate analytics    |

---

### **Inspection APIs**

**Base URL**: `/api/inspections`

| Endpoint          | Method | Auth      | Description               |
| ----------------- | ------ | --------- | ------------------------- |
| `/`               | GET    | Inspector | List assigned inspections |
| `/:id`            | GET    | Inspector | Get inspection details    |
| `/:id/video-call` | POST   | Inspector | Start video call session  |
| `/:id/result`     | POST   | Inspector | Submit inspection result  |
| `/:id/photos`     | POST   | Inspector | Upload inspection photos  |

---

### **User Management APIs**

**Base URL**: `/api/dtam/staff`

| Endpoint          | Method | Auth  | Description              |
| ----------------- | ------ | ----- | ------------------------ |
| `/`               | GET    | Admin | List all DTAM staff      |
| `/:id`            | GET    | Admin | Get staff details        |
| `/create`         | POST   | Admin | Create new staff account |
| `/:id/deactivate` | PUT    | Admin | Deactivate staff account |
| `/:id/roles`      | PUT    | Admin | Update staff roles       |

---

## 📁 File Structure

### **Current Admin Portal Structure**

```
apps/admin-portal/
├── app/
│   ├── dashboard/
│   │   └── page.tsx ⚠️ USING MOCK DATA
│   ├── applications/
│   │   ├── page.tsx ⚠️ USING MOCK DATA
│   │   └── [id]/
│   │       └── page.tsx ⚠️ USING MOCK DATA
│   ├── certificates/
│   │   └── page.tsx ⚠️ USING MOCK DATA
│   ├── inspectors/
│   │   └── page.tsx ⚠️ USING MOCK DATA
│   ├── payments/
│   │   └── page.tsx ❌ MISSING
│   ├── audit-logs/
│   │   └── page.tsx ⚠️ USING MOCK DATA
│   ├── users/
│   │   └── page.tsx ⚠️ USING MOCK DATA
│   └── settings/
│       └── page.tsx ⚠️ USING MOCK DATA
├── components/
│   ├── dashboard/
│   │   ├── StatisticsCard.tsx ✅
│   │   ├── ActivitySummary.tsx ✅
│   │   ├── LineChart.tsx ✅
│   │   └── PieChart.tsx ✅
│   ├── layout/
│   │   ├── AdminHeader.tsx ✅
│   │   └── AdminSidebar.tsx ✅
│   └── analytics/
│       └── AnalyticsCharts.tsx ✅
└── lib/
    ├── api/ ❌ MISSING (need to create)
    ├── hooks/ ❌ MISSING (need to create)
    └── protected-route.tsx ✅
```

---

## 🛠️ Implementation Plan

### **Step 1: Create API Integration Layer** (Week 1)

Create centralized API client in `apps/admin-portal/lib/api/`

#### **1.1 Create API Client**

**File**: `apps/admin-portal/lib/api/client.ts`

```typescript
// API Client with authentication and error handling
import { getCookie } from 'cookies-next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {})
  };

  // Add authentication token for DTAM
  if (requireAuth) {
    const token = getCookie('dtam_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new ApiError(401, 'No authentication token found');
    }
  }

  // Make request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  });

  // Handle response
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `Request failed with status ${response.status}`,
      errorData
    );
  }

  return response.json();
}
```

---

#### **1.2 Create Dashboard API Service**

**File**: `apps/admin-portal/lib/api/dashboard.ts`

```typescript
import { apiClient } from './client';

export interface DashboardStatistics {
  totalApplications: number;
  pendingReview: number;
  approvedThisMonth: number;
  activeUsers: number;
  statusBreakdown: {
    submitted: number;
    under_review: number;
    document_review: number;
    inspection_scheduled: number;
    approved: number;
    rejected: number;
  };
  trends: {
    applications: Array<{ date: string; count: number }>;
    approvals: Array<{ date: string; count: number }>;
  };
}

export interface Activity {
  id: string;
  type: 'application' | 'approval' | 'comment' | 'user';
  title: string;
  description: string;
  time: string;
  user: string;
}

export interface PendingTask {
  id: string;
  type: 'document_review' | 'inspection' | 'final_approval';
  applicationId: string;
  applicationNumber: string;
  farmName: string;
  farmerName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assignedAt: string;
}

export const dashboardApi = {
  /**
   * Get complete dashboard data
   */
  getDashboard: () => apiClient<DashboardStatistics>('/api/dtam/dashboard'),

  /**
   * Get system statistics
   */
  getStatistics: () => apiClient<DashboardStatistics>('/api/dtam/dashboard/statistics'),

  /**
   * Get quick stats
   */
  getQuickStats: () =>
    apiClient<{
      totalApplications: number;
      pendingReview: number;
      approvedThisMonth: number;
      activeUsers: number;
    }>('/api/dtam/dashboard/quick-stats'),

  /**
   * Get pending tasks for current user
   */
  getPendingTasks: () => apiClient<PendingTask[]>('/api/dtam/dashboard/pending-tasks'),

  /**
   * Get recent activity
   */
  getRecentActivity: () => apiClient<Activity[]>('/api/dtam/dashboard/recent-activity'),

  /**
   * Get trends data
   */
  getTrends: (period: '7d' | '30d' | '90d' = '7d') =>
    apiClient<{
      applications: Array<{ date: string; count: number }>;
      approvals: Array<{ date: string; count: number }>;
    }>(`/api/dtam/dashboard/trends?period=${period}`)
};
```

---

#### **1.3 Create Applications API Service**

**File**: `apps/admin-portal/lib/api/applications.ts`

```typescript
import { apiClient } from './client';

export interface Application {
  _id: string;
  applicationNumber: string;
  farmName: string;
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  status: string;
  currentWorkflowState: string;
  submittedAt: string;
  updatedAt: string;
  assignedReviewer?: string;
  assignedInspector?: string;
  documents: Array<{
    id: string;
    type: string;
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  payments: Array<{
    phase: 1 | 2;
    amount: number;
    status: string;
    paidAt?: string;
  }>;
  reviewResult?: {
    completeness: number;
    validity: number;
    compliance: number;
    overallScore: number;
    approved: boolean;
    reviewedBy: string;
    reviewedAt: string;
    comments: string;
  };
  inspectionResult?: {
    method: 'vdo_call' | 'on_site';
    complianceScore: number;
    passed: boolean;
    inspectedBy: string;
    inspectedAt: string;
    findings: string;
  };
}

export interface ApplicationListParams {
  status?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ApplicationListResponse {
  applications: Application[];
  total: number;
  page: number;
  totalPages: number;
}

export const applicationsApi = {
  /**
   * List applications with filters
   */
  list: (params: ApplicationListParams = {}) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient<ApplicationListResponse>(`/api/applications?${queryString}`);
  },

  /**
   * Get application by ID
   */
  getById: (id: string) => apiClient<Application>(`/api/applications/${id}`),

  /**
   * Get application documents
   */
  getDocuments: (id: string) =>
    apiClient<Array<{ id: string; type: string; url: string }>>(
      `/api/applications/${id}/documents`
    ),

  /**
   * Submit document review (Reviewer only)
   */
  submitReview: (
    id: string,
    data: {
      completeness: number;
      validity: number;
      compliance: number;
      approved: boolean;
      comments: string;
    }
  ) => apiClient(`/api/applications/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Submit inspection result (Inspector only)
   */
  submitInspection: (
    id: string,
    data: {
      method: 'vdo_call' | 'on_site';
      complianceScore: number;
      passed: boolean;
      findings: string;
      photos?: string[];
    }
  ) =>
    apiClient(`/api/applications/${id}/inspection`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  /**
   * Final approve application (Approver only)
   */
  approve: (id: string, comments: string = '') =>
    apiClient(`/api/applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments })
    }),

  /**
   * Reject application (Approver only)
   */
  reject: (id: string, reason: string) =>
    apiClient(`/api/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  /**
   * Get application workflow history
   */
  getHistory: (id: string) =>
    apiClient<
      Array<{
        state: string;
        timestamp: string;
        actor: string;
        notes: string;
      }>
    >(`/api/applications/${id}/history`)
};
```

---

### **Step 2: Create React Hooks** (Week 1)

#### **2.1 Create useDashboard Hook**

**File**: `apps/admin-portal/lib/hooks/useDashboard.ts`

```typescript
import { useState, useEffect } from 'react';
import { dashboardApi, DashboardStatistics } from '../api/dashboard';

export function useDashboard() {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    statistics,
    loading,
    error,
    reload: loadStatistics
  };
}
```

---

### **Step 3: Update Dashboard Page** (Week 2)

**File**: `apps/admin-portal/app/dashboard/page.tsx`

```typescript
'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Alert, CircularProgress } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import StatisticsCard from '@/components/dashboard/StatisticsCard';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import { useDashboard } from '@/lib/hooks/useDashboard';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { statistics, loading, error } = useDashboard();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sidebar */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <AdminSidebar open={true} onClose={() => {}} variant="permanent" />
        </Box>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} variant="temporary" />
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, width: { xs: '100%', md: 'calc(100% - 280px)' } }}>
          <AdminHeader onMenuClick={handleSidebarToggle} title="แดชบอร์ด" />

          <Box sx={{ mt: 10, p: 3 }}>
            <Container maxWidth="xl">
              <Typography variant="h4" fontWeight={700} gutterBottom>
                ภาพรวมระบบ
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                สรุปข้อมูลและสถิติการทำงานของระบบ
              </Typography>

              {/* Loading State */}
              {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                  <CircularProgress />
                </Box>
              )}

              {/* Error State */}
              {error && !loading && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Statistics Cards - Connected to Real Data */}
              {statistics && !loading && (
                <>
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatisticsCard
                        title="คำขอทั้งหมด"
                        value={statistics.totalApplications.toLocaleString()}
                        subtitle="คำขอในระบบ"
                        icon={<AssignmentIcon />}
                        iconColor="primary"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatisticsCard
                        title="รอตรวจสอบ"
                        value={statistics.pendingReview.toLocaleString()}
                        subtitle="คำขอรอการตรวจสอบ"
                        icon={<PendingIcon />}
                        iconColor="warning"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatisticsCard
                        title="อนุมัติเดือนนี้"
                        value={statistics.approvedThisMonth.toLocaleString()}
                        subtitle="คำขอที่อนุมัติแล้ว"
                        icon={<ApprovedIcon />}
                        iconColor="success"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatisticsCard
                        title="ผู้ใช้งานปัจจุบัน"
                        value={statistics.activeUsers.toLocaleString()}
                        subtitle="ผู้ใช้ที่ใช้งานอยู่"
                        icon={<PeopleIcon />}
                        iconColor="info"
                      />
                    </Grid>
                  </Grid>

                  {/* Charts with Real Data */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <AnalyticsCharts
                        title="การวิเคราะห์ข้อมูล"
                        subtitle="แสดงกราฟสถิติและการวิเคราะห์ในรูปแบบต่างๆ"
                        data={statistics.trends}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ActivitySummary />
                    </Grid>
                  </Grid>
                </>
              )}
            </Container>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
```

---

## 📋 Implementation Checklist

### **Week 1: API Integration Layer**

- [ ] Create `lib/api/client.ts` - API client with auth
- [ ] Create `lib/api/dashboard.ts` - Dashboard API service
- [ ] Create `lib/api/applications.ts` - Applications API service
- [ ] Create `lib/api/certificates.ts` - Certificates API service
- [ ] Create `lib/api/payments.ts` - Payments API service
- [ ] Create `lib/api/inspections.ts` - Inspections API service
- [ ] Create `lib/hooks/useDashboard.ts` - Dashboard hook
- [ ] Create `lib/hooks/useApplications.ts` - Applications hook
- [ ] Test API connections

### **Week 2: Dashboard Connection**

- [ ] Update `app/dashboard/page.tsx` - Connect to real APIs
- [ ] Update `components/dashboard/AnalyticsCharts.tsx` - Use real data
- [ ] Update `components/dashboard/ActivitySummary.tsx` - Use real data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test dashboard functionality

### **Week 3: Applications Page**

- [ ] Update `app/applications/page.tsx` - Connect to real APIs
- [ ] Add application list with filters
- [ ] Add pagination
- [ ] Add sorting
- [ ] Add status filtering
- [ ] Test applications list

### **Week 4: Application Detail Page**

- [ ] Update `app/applications/[id]/page.tsx` - Connect to real APIs
- [ ] Show application details
- [ ] Show documents viewer
- [ ] Add document review form (Reviewer)
- [ ] Add inspection form (Inspector)
- [ ] Add approval actions (Approver)
- [ ] Test all workflows

### **Week 5: Certificates & Payments**

- [ ] Update `app/certificates/page.tsx` - Connect to real APIs
- [ ] Add certificate list
- [ ] Add certificate download
- [ ] Create `app/payments/page.tsx` - NEW
- [ ] Add payment list
- [ ] Add refund workflow (Admin only)
- [ ] Test certificates and payments

### **Week 6: Testing & Polish**

- [ ] End-to-end testing all pages
- [ ] Fix bugs
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add success notifications
- [ ] Performance optimization
- [ ] Code review
- [ ] Documentation

---

## 🧪 Testing Strategy

### **Unit Tests**

- Test API client error handling
- Test hooks data fetching
- Test component rendering with mock data

### **Integration Tests**

- Test API → Hook → Component flow
- Test authentication flow
- Test error scenarios

### **E2E Tests**

- Test complete workflows:
  - Login → Dashboard → View Statistics
  - Login → Applications → Review Document
  - Login → Applications → Submit Inspection
  - Login → Applications → Final Approve

---

## 📊 Success Metrics

- ✅ All dashboard statistics showing real data
- ✅ Application list loading from backend
- ✅ Document review workflow working
- ✅ Inspection workflow working
- ✅ Certificate generation triggered
- ✅ No console errors
- ✅ Loading time < 2 seconds
- ✅ Error messages user-friendly

---

## 🚨 Common Pitfalls to Avoid

1. **CORS Issues**: Ensure backend allows admin-portal origin
2. **Authentication**: Always include DTAM token in headers
3. **Error Handling**: Don't show raw error messages to users
4. **Loading States**: Always show loading indicators
5. **Type Safety**: Use TypeScript interfaces for all API responses
6. **Token Expiry**: Handle 401 errors and redirect to login
7. **Pagination**: Don't load all data at once, use pagination
8. **Caching**: Consider using React Query or SWR for caching

---

## 📚 Related Documentation

- [COMPREHENSIVE_DEVELOPMENT_PLAN.md](./COMPREHENSIVE_DEVELOPMENT_PLAN.md) - Full 18-month plan
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [Access Control Matrix](./ARCHITECTURE.md#access-control-matrix) - Role permissions

---

## 👥 Team Assignment

- **2 Senior Full-stack Developers**: API integration + Dashboard + Applications
- **1 Frontend Developer**: UI polish + Testing
- **1 Technical Lead**: Code review + Architecture decisions

---

**Status**: ✅ Ready to Start Implementation
**Next**: Create API client and dashboard hook (Week 1)

---

**Last Updated**: October 27, 2025
**Author**: Development Team
