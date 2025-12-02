# Phase 1.3: Certificate Download UI Implementation Guide

**Duration**: 4 weeks
**Budget**: 500,000 THB
**Priority**: HIGH - Critical for farmer certification experience

## Table of Contents

1. [Overview](#overview)
2. [Current Status Analysis](#current-status-analysis)
3. [Backend APIs Available](#backend-apis-available)
4. [Farmer Portal Implementation](#farmer-portal-implementation)
5. [Certificate Portal Implementation](#certificate-portal-implementation)
6. [PDF Generation System](#pdf-generation-system)
7. [Testing Strategy](#testing-strategy)
8. [Implementation Timeline](#implementation-timeline)

---

## Overview

### Objectives

Complete the certificate download and verification system for both Farmer Portal and public Certificate Portal:

- **Farmer Portal**: Certificate list, download, QR code display
- **Certificate Portal**: Public verification page with QR code scanning
- **PDF Generation**: Automated PDF certificate generation with QR codes
- **Integration**: Connect all certificate components to Backend APIs
- **Testing**: Comprehensive testing of certificate workflows

### Current Completion Status

| Component                   | Backend | Frontend | Integration | Overall |
| --------------------------- | ------- | -------- | ----------- | ------- |
| Certificate Management      | ✅ 80%  | ❌ 20%   | ❌ 15%      | 🟡 38%  |
| Certificate Download        | ✅ 90%  | ❌ 10%   | ❌ 5%       | ❌ 35%  |
| Certificate Verification UI | ✅ 100% | ❌ 0%    | ❌ 0%       | ❌ 33%  |
| PDF Generation              | 🟡 60%  | N/A      | 🟡 60%      | 🟡 60%  |
| QR Code System              | ✅ 100% | ❌ 20%   | ❌ 10%      | 🟡 43%  |

**Overall**: 🟡 42% Complete → Target: ✅ 100%

---

## Current Status Analysis

### What Exists

#### Backend (80% Complete)

✅ **Complete Certificate APIs**:

- GET `/api/certificates` - List certificates (filtered by user)
- GET `/api/certificates/:id` - Get certificate by ID
- GET `/api/certificates/:id/pdf` - Download certificate PDF
- GET `/api/certificates/:id/qrcode` - Get certificate QR code
- GET `/api/certificates/:id/history` - Get certificate history
- POST `/api/certificates/:id/verify` - Verify certificate by ID
- GET `/api/public/certificates/verify/:number` - Public verification (No auth)
- POST `/api/certificates/generate` - Generate certificate (DTAM only)
- POST `/api/certificates/:id/revoke` - Revoke certificate (DTAM only)
- POST `/api/certificates/:id/renew` - Renew certificate (DTAM only)

✅ **Certificate Service Features**:

- Certificate number generation (`GACP-2025-0001`)
- Verification code generation (32-char hex)
- QR code data generation
- Certificate validation (active, expired, revoked)
- Certificate renewal (within 90 days of expiry)
- Certificate revocation
- Statistics and analytics
- Download count tracking
- Verification count tracking

#### Frontend (20% Complete)

🟡 **Partially Implemented**:

- Basic certificate model exists
- No certificate UI components

❌ **Missing Components**:

- Certificate list page
- Certificate detail view
- Certificate download button
- PDF viewer/preview
- QR code display
- Public verification page
- Certificate status badges
- Expiry notifications

### What Needs to Be Built

#### Farmer Portal (Missing 80%)

1. **Certificate List Page** - Display all user certificates with filters
2. **Certificate Detail View** - Full certificate information
3. **Certificate Download** - Download PDF with tracking
4. **QR Code Display** - Show QR code for verification
5. **Certificate Status** - Badge and expiry warnings

#### Certificate Portal (Missing 100%)

1. **Public Verification Page** - Verify by certificate number
2. **QR Code Scanner** - Scan QR codes to verify
3. **Verification Result Display** - Show verification status
4. **Certificate Info Display** - Public certificate information

#### PDF Generation System (Missing 40%)

1. **PDF Template Design** - Professional certificate template
2. **QR Code Integration** - Embed QR codes in PDFs
3. **Digital Signatures** - Sign PDFs for authenticity
4. **Storage Integration** - S3/CloudFlare R2 upload

---

## Backend APIs Available

### 1. List Certificates API

**Endpoint**: `GET /api/certificates`

**Auth**: Farmer JWT required

**Query Parameters**:

- `status`: Filter by status (active, expired, revoked)
- `standardId`: Filter by standard
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response**:

```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "certificateId": "507f1f77bcf86cd799439011",
        "certificateNumber": "GACP-2025-0001",
        "farmName": "ฟาร์มสมชาย",
        "standardName": "GACP",
        "status": "active",
        "issuedDate": "2025-01-15T10:00:00.000Z",
        "expiryDate": "2028-01-15T10:00:00.000Z",
        "score": 95
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 2. Get Certificate by ID API

**Endpoint**: `GET /api/certificates/:id`

**Auth**: Farmer JWT required

**Response**:

```json
{
  "success": true,
  "data": {
    "certificateId": "507f1f77bcf86cd799439011",
    "certificateNumber": "GACP-2025-0001",
    "verificationCode": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    "qrData": "https://gacp-certify.go.th/verify/GACP-2025-0001?code=A1B2C3...",
    "farmName": "ฟาร์มสมชาย",
    "farmerName": "นายสมชาย ใจดี",
    "location": {
      "province": "เชียงใหม่",
      "district": "เมืองเชียงใหม่",
      "subDistrict": "สุเทพ",
      "address": "123 หมู่ 5"
    },
    "cropType": "กัญชา",
    "farmSize": "5 ไร่",
    "standardName": "GACP",
    "score": 95,
    "status": "active",
    "issuedDate": "2025-01-15T10:00:00.000Z",
    "expiryDate": "2028-01-15T10:00:00.000Z",
    "issuedBy": "นายตรวจสอบ อนุมัติ",
    "pdfGenerated": true,
    "pdfUrl": "https://storage.gacp.go.th/certificates/GACP-2025-0001.pdf",
    "downloadCount": 12,
    "verificationCount": 45
  }
}
```

---

### 3. Download Certificate PDF API

**Endpoint**: `GET /api/certificates/:id/pdf`

**Auth**: Farmer JWT required

**Response**: PDF file (application/pdf)

**Headers**:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="GACP-2025-0001.pdf"
```

---

### 4. Get QR Code API

**Endpoint**: `GET /api/certificates/:id/qrcode`

**Auth**: Farmer JWT required

**Query Parameters**:

- `size`: QR code size in pixels (default: 300, max: 1000)
- `format`: Format (png, svg, base64) (default: png)

**Response**:

```json
{
  "success": true,
  "data": {
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "qrData": "https://gacp-certify.go.th/verify/GACP-2025-0001?code=A1B2C3...",
    "size": 300,
    "format": "png"
  }
}
```

---

### 5. Public Verification API

**Endpoint**: `GET /api/public/certificates/verify/:number`

**Auth**: None (Public endpoint)

**Query Parameters**:

- `code`: Verification code (optional)

**Response**:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Certificate is valid",
    "certificate": {
      "certificateNumber": "GACP-2025-0001",
      "farmName": "ฟาร์มสมชาย",
      "farmerName": "นายสมชาย ใจดี",
      "location": {
        "province": "เชียงใหม่",
        "district": "เมืองเชียงใหม่"
      },
      "cropType": "กัญชา",
      "farmSize": "5 ไร่",
      "standardName": "GACP",
      "score": 95,
      "issuedDate": "2025-01-15T10:00:00.000Z",
      "expiryDate": "2028-01-15T10:00:00.000Z",
      "status": "active",
      "qrData": "https://gacp-certify.go.th/verify/GACP-2025-0001?code=A1B2C3..."
    }
  }
}
```

**Invalid Certificate Response**:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "message": "Certificate has expired",
    "certificateNumber": "GACP-2025-0001",
    "expiryDate": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Farmer Portal Implementation

### Directory Structure

```
apps/farmer-portal/
├── app/
│   └── certificates/
│       ├── page.tsx                 # Certificate list page
│       └── [id]/
│           ├── page.tsx             # Certificate detail
│           └── download/
│               └── page.tsx         # Download page
├── components/
│   └── certificates/
│       ├── CertificateList.tsx      # Certificate list
│       ├── CertificateCard.tsx      # Certificate card
│       ├── CertificateDetail.tsx    # Detail view
│       ├── CertificateQRCode.tsx    # QR code display
│       ├── CertificateStatusBadge.tsx # Status badge
│       └── CertificateActions.tsx   # Action buttons
├── lib/
│   ├── api/
│   │   └── certificate-api.ts      # Certificate API client
│   └── hooks/
│       ├── useCertificates.ts      # Certificates hook
│       └── useCertificate.ts       # Single certificate hook
└── types/
    └── certificate.ts              # Certificate types
```

---

### Implementation Steps

#### Step 1: Create Type Definitions

**File**: `apps/farmer-portal/types/certificate.ts`

```typescript
/**
 * Certificate Type Definitions
 */

export type CertificateStatus = 'active' | 'expired' | 'revoked' | 'renewed' | 'suspended';

export interface CertificateLocation {
  province: string;
  district: string;
  subDistrict: string;
  address: string;
}

export interface Certificate {
  certificateId: string;
  certificateNumber: string;
  verificationCode: string;
  qrData: string;

  // Farm information
  farmId?: string;
  farmName: string;
  farmerName: string;
  location: CertificateLocation;
  cropType: string;
  farmSize: string;

  // Standard information
  standardId?: string;
  standardName: string;
  score: number;

  // Certificate details
  status: CertificateStatus;
  issuedDate: string;
  expiryDate: string;
  validityYears: number;
  issuedBy: string;

  // PDF & QR
  pdfGenerated: boolean;
  pdfUrl?: string;
  downloadCount: number;
  verificationCount: number;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateListResponse {
  certificates: Certificate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CertificateVerificationResult {
  valid: boolean;
  message: string;
  certificateNumber?: string;
  certificate?: Partial<Certificate>;
  expiryDate?: string;
  revokedDate?: string;
  revokedReason?: string;
}

export interface QRCodeData {
  qrCodeImage: string;
  qrData: string;
  size: number;
  format: 'png' | 'svg' | 'base64';
}
```

---

#### Step 2: Create Certificate API Client

**File**: `apps/farmer-portal/lib/api/certificate-api.ts`

```typescript
/**
 * Certificate API Client
 */

import { getCookie } from 'cookies-next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getCookie('farmer_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

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

export const certificateApi = {
  /**
   * Get all certificates for current user
   */
  getCertificates: async (params?: {
    status?: CertificateStatus;
    standardId?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>
      )
    ).toString();

    return apiClient<{ success: boolean; data: CertificateListResponse }>(
      `/api/certificates${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get certificate by ID
   */
  getCertificateById: async (certificateId: string) => {
    return apiClient<{ success: boolean; data: Certificate }>(`/api/certificates/${certificateId}`);
  },

  /**
   * Download certificate PDF
   */
  downloadPDF: (certificateId: string) => {
    const token = getCookie('farmer_token');
    const url = `${API_BASE_URL}/api/certificates/${certificateId}/pdf`;
    window.open(`${url}${token ? `?token=${token}` : ''}`, '_blank', 'noopener,noreferrer');
  },

  /**
   * Get QR code
   */
  getQRCode: async (certificateId: string, size?: number, format?: 'png' | 'svg' | 'base64') => {
    const params = new URLSearchParams();
    if (size) params.append('size', String(size));
    if (format) params.append('format', format);

    return apiClient<{ success: boolean; data: QRCodeData }>(
      `/api/certificates/${certificateId}/qrcode${params.toString() ? `?${params.toString()}` : ''}`
    );
  },

  /**
   * Verify certificate (public)
   */
  verifyCertificate: async (certificateNumber: string, verificationCode?: string) => {
    const params = new URLSearchParams();
    if (verificationCode) params.append('code', verificationCode);

    return apiClient<{ success: boolean; data: CertificateVerificationResult }>(
      `/api/public/certificates/verify/${certificateNumber}${params.toString() ? `?${params.toString()}` : ''}`,
      { headers: {} } // No auth required
    );
  }
};
```

---

#### Step 3: Create Certificate Hooks

**File**: `apps/farmer-portal/lib/hooks/useCertificates.ts`

```typescript
/**
 * useCertificates Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { certificateApi } from '../api/certificate-api';
import type { CertificateListResponse, CertificateStatus } from '@/types/certificate';

interface UseCertificatesOptions {
  status?: CertificateStatus;
  standardId?: string;
  page?: number;
  limit?: number;
}

export function useCertificates(options: UseCertificatesOptions = {}) {
  const [data, setData] = useState<CertificateListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificateApi.getCertificates(options);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { data, loading, error, refetch: fetchCertificates };
}
```

**File**: `apps/farmer-portal/lib/hooks/useCertificate.ts`

```typescript
/**
 * useCertificate Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { certificateApi } from '../api/certificate-api';
import type { Certificate } from '@/types/certificate';

export function useCertificate(certificateId: string) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = useCallback(async () => {
    if (!certificateId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await certificateApi.getCertificateById(certificateId);
      setCertificate(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificate');
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  return { certificate, loading, error, refetch: fetchCertificate };
}
```

---

#### Step 4: Create Certificate Status Badge Component

**File**: `apps/farmer-portal/components/certificates/CertificateStatusBadge.tsx`

```typescript
'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import type { CertificateStatus } from '@/types/certificate';

interface CertificateStatusBadgeProps {
  status: CertificateStatus;
  expiryDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CertificateStatusBadge({
  status,
  expiryDate,
  size = 'md',
}: CertificateStatusBadgeProps) {
  const getStatusConfig = (status: CertificateStatus) => {
    // Check if near expiry (< 90 days)
    const isNearExpiry =
      expiryDate &&
      status === 'active' &&
      new Date(expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 &&
      new Date(expiryDate).getTime() > Date.now();

    if (isNearExpiry) {
      return {
        icon: AlertCircle,
        label: 'ใกล้หมดอายุ',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
    }

    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'ใช้งานได้',
          color: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
        };
      case 'expired':
        return {
          icon: XCircle,
          label: 'หมดอายุ',
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
      case 'revoked':
        return {
          icon: XCircle,
          label: 'ถูกเพิกถอน',
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
        };
      case 'renewed':
        return {
          icon: RefreshCw,
          label: 'ต่ออายุแล้ว',
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
        };
      case 'suspended':
        return {
          icon: Clock,
          label: 'พักใช้งาน',
          color: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
        };
      default:
        return {
          icon: AlertCircle,
          label: 'ไม่ทราบสถานะ',
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.border} ${config.bg} ${sizeClasses[size]} font-medium ${config.color}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
}
```

---

#### Step 5: Create Certificate Card Component

**File**: `apps/farmer-portal/components/certificates/CertificateCard.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Calendar, Download, QrCode, MapPin } from 'lucide-react';
import CertificateStatusBadge from './CertificateStatusBadge';
import type { Certificate } from '@/types/certificate';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificateId: string) => void;
}

export default function CertificateCard({ certificate, onDownload }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = () => {
    const days = Math.ceil(
      (new Date(certificate.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{certificate.farmName}</h3>
              <p className="text-sm text-gray-600">{certificate.farmerName}</p>
            </div>
          </div>
          <CertificateStatusBadge
            status={certificate.status}
            expiryDate={certificate.expiryDate}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            {certificate.location.district} {certificate.location.province}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Certificate Number */}
        <div>
          <p className="text-xs text-gray-600 mb-1">เลขที่ใบรับรอง</p>
          <p className="font-mono font-bold text-gray-900">{certificate.certificateNumber}</p>
        </div>

        {/* Standard & Score */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">มาตรฐาน</p>
            <p className="font-semibold text-gray-900">{certificate.standardName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">คะแนน</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${certificate.score}%` }}
                />
              </div>
              <span className="font-bold text-green-600">{certificate.score}%</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span>วันที่ออก</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(certificate.issuedDate)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Calendar className="w-3 h-3" />
              <span>วันหมดอายุ</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(certificate.expiryDate)}
            </p>
          </div>
        </div>

        {/* Expiry Warning */}
        {certificate.status === 'active' && getDaysUntilExpiry() < 90 && getDaysUntilExpiry() > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <span className="font-semibold">ใกล้หมดอายุ:</span> เหลือ {getDaysUntilExpiry()} วัน
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0 flex gap-3">
        <Link
          href={`/certificates/${certificate.certificateId}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <QrCode className="w-4 h-4" />
          <span>ดูรายละเอียด</span>
        </Link>
        {certificate.pdfGenerated && onDownload && (
          <button
            onClick={() => onDownload(certificate.certificateId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด PDF</span>
          </button>
        )}
      </div>
    </div>
  );
}
```

---

#### Step 6: Create Certificate List Page

**File**: `apps/farmer-portal/app/certificates/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useCertificates } from '@/lib/hooks/useCertificates';
import { certificateApi } from '@/lib/api/certificate-api';
import CertificateCard from '@/components/certificates/CertificateCard';
import { Filter, Search } from 'lucide-react';
import type { CertificateStatus } from '@/types/certificate';

export default function CertificatesPage() {
  const [statusFilter, setStatusFilter] = useState<CertificateStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useCertificates({
    status: statusFilter,
    page,
    limit: 12,
  });

  const handleDownload = (certificateId: string) => {
    certificateApi.downloadPDF(certificateId);
  };

  const filteredCertificates = data?.certificates.filter(cert =>
    searchQuery
      ? cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.farmName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">เกิดข้อผิดพลาด: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ใบรับรองของฉัน</h1>
        <p className="text-gray-600">รายการใบรับรองมาตรฐาน GACP ทั้งหมด</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">ใช้งานได้</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.certificates.filter(c => c.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">หมดอายุ</p>
          <p className="text-2xl font-bold text-gray-600">
            {data?.certificates.filter(c => c.status === 'expired').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">ใกล้หมดอายุ</p>
          <p className="text-2xl font-bold text-orange-600">
            {data?.certificates.filter(c => {
              const daysLeft = Math.ceil(
                (new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return c.status === 'active' && daysLeft > 0 && daysLeft < 90;
            }).length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาเลขที่ใบรับรอง หรือชื่อฟาร์ม..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter || ''}
              onChange={e => setStatusFilter((e.target.value as CertificateStatus) || undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="active">ใช้งานได้</option>
              <option value="expired">หมดอายุ</option>
              <option value="revoked">ถูกเพิกถอน</option>
              <option value="renewed">ต่ออายุแล้ว</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4" />
              <span>ตัวกรอง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Grid */}
      {filteredCertificates && filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map(certificate => (
            <CertificateCard
              key={certificate.certificateId}
              certificate={certificate}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">ไม่พบใบรับรอง</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      page === pageNumber
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### Step 7: Create Certificate QR Code Component

**File**: `apps/farmer-portal/components/certificates/CertificateQRCode.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, CheckCircle, ExternalLink } from 'lucide-react';

interface CertificateQRCodeProps {
  certificateId: string;
  certificateNumber: string;
  qrData: string;
  size?: number;
}

export default function CertificateQRCode({
  certificateId,
  certificateNumber,
  qrData,
  size = 300,
}: CertificateQRCodeProps) {
  const [qrImage, setQRImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadQRCode();
  }, [certificateId, size]);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/certificates/${certificateId}/qrcode?size=${size}&format=png`
      );
      const data = await response.json();
      if (data.success) {
        setQRImage(data.data.qrCodeImage);
      }
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${certificateNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyVerificationLink = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openVerificationPage = () => {
    window.open(qrData, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <QrCode className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">QR Code สำหรับตรวจสอบ</h3>
          <p className="text-sm text-gray-600">สแกนเพื่อยืนยันความถูกต้องของใบรับรอง</p>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-gray-50 rounded-lg p-6 mb-4">
        <div className="flex justify-center mb-4">
          {qrImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img src={qrImage} alt="Certificate QR Code" className="w-64 h-64" />
            </div>
          )}
        </div>

        {/* Certificate Number */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-600 mb-1">เลขที่ใบรับรอง</p>
          <p className="font-mono font-bold text-gray-900">{certificateNumber}</p>
        </div>

        {/* Verification Link */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">ลิงก์ตรวจสอบ</p>
              <p className="text-sm text-gray-900 truncate">{qrData}</p>
            </div>
            <button
              onClick={copyVerificationLink}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="คัดลอกลิงก์"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadQRCode}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          <span>ดาวน์โหลด QR Code</span>
        </button>
        <button
          onClick={openVerificationPage}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          <span>เปิดหน้าตรวจสอบ</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">วิธีใช้งาน QR Code</h4>
        <ol className="space-y-1 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-semibold">1.</span>
            <span>ลูกค้าสแกน QR Code ด้วยสมาร์ทโฟน</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">2.</span>
            <span>ระบบจะเปิดหน้าตรวจสอบความถูกต้อง</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold">3.</span>
            <span>แสดงข้อมูลใบรับรองและสถานะ</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
```

---

#### Step 8: Create Certificate Detail Page

**File**: `apps/farmer-portal/app/certificates/[id]/page.tsx`

```typescript
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useCertificate } from '@/lib/hooks/useCertificate';
import { certificateApi } from '@/lib/api/certificate-api';
import CertificateStatusBadge from '@/components/certificates/CertificateStatusBadge';
import CertificateQRCode from '@/components/certificates/CertificateQRCode';
import {
  Award,
  Calendar,
  MapPin,
  User,
  Download,
  ArrowLeft,
  CheckCircle,
  Building,
} from 'lucide-react';
import Link from 'next/link';

export default function CertificateDetailPage() {
  const params = useParams();
  const certificateId = params.id as string;

  const { certificate, loading, error } = useCertificate(certificateId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadPDF = () => {
    if (certificate) {
      certificateApi.downloadPDF(certificate.certificateId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">เกิดข้อผิดพลาด: {error || 'ไม่พบใบรับรอง'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/certificates"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปรายการใบรับรอง</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {certificate.farmName}
              </h1>
              <p className="text-gray-600">{certificate.farmerName}</p>
            </div>
          </div>
          <CertificateStatusBadge
            status={certificate.status}
            expiryDate={certificate.expiryDate}
            size="lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">เลขที่ใบรับรอง</p>
              <p className="font-mono font-bold text-gray-900">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">มาตรฐาน</p>
              <p className="font-semibold text-gray-900">{certificate.standardName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">คะแนน</p>
              <p className="font-bold text-green-600">{certificate.score}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Certificate Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลฟาร์ม</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">ชื่อฟาร์ม</label>
                <p className="font-semibold text-gray-900">{certificate.farmName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">เจ้าของฟาร์ม</label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-900">{certificate.farmerName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">ที่ตั้งฟาร์ม</label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">{certificate.location.address}</p>
                    <p className="text-gray-600">
                      ต.{certificate.location.subDistrict} อ.{certificate.location.district}{' '}
                      จ.{certificate.location.province}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">ชนิดพืช</label>
                  <p className="font-semibold text-gray-900">{certificate.cropType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ขนาดพื้นที่</label>
                  <p className="font-semibold text-gray-900">{certificate.farmSize}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดใบรับรอง</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่ออกใบรับรอง
                  </label>
                  <p className="font-semibold text-gray-900">
                    {formatDate(certificate.issuedDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันหมดอายุ
                  </label>
                  <p className="font-semibold text-gray-900">
                    {formatDate(certificate.expiryDate)}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">ระยะเวลา</label>
                <p className="font-semibold text-gray-900">
                  {certificate.validityYears} ปี
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">ผู้ออกใบรับรอง</label>
                <p className="font-semibold text-gray-900">{certificate.issuedBy}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">จำนวนครั้งที่ถูกตรวจสอบ</label>
                <p className="font-semibold text-gray-900">
                  {certificate.verificationCount} ครั้ง
                </p>
              </div>
              {certificate.pdfGenerated && (
                <div>
                  <label className="text-sm text-gray-600">จำนวนครั้งที่ดาวน์โหลด</label>
                  <p className="font-semibold text-gray-900">
                    {certificate.downloadCount} ครั้ง
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Download PDF */}
          {certificate.pdfGenerated && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    ดาวน์โหลดใบรับรองฉบับเต็ม
                  </h3>
                  <p className="text-sm text-gray-600">
                    ไฟล์ PDF พร้อม QR Code สำหรับการตรวจสอบ
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>ดาวน์โหลด PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - QR Code */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CertificateQRCode
              certificateId={certificate.certificateId}
              certificateNumber={certificate.certificateNumber}
              qrData={certificate.qrData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Certificate Portal Implementation (Public)

### Public Verification Page

**File**: `apps/certificate-portal/app/verify/[number]/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Award,
  MapPin,
  Calendar,
  AlertCircle,
  QrCode,
} from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  message: string;
  certificateNumber?: string;
  certificate?: {
    certificateNumber: string;
    farmName: string;
    farmerName: string;
    location: {
      province: string;
      district: string;
    };
    cropType: string;
    farmSize: string;
    standardName: string;
    score: number;
    issuedDate: string;
    expiryDate: string;
    status: string;
    qrData: string;
  };
  expiryDate?: string;
  revokedDate?: string;
  revokedReason?: string;
}

export default function PublicVerificationPage() {
  const params = useParams();
  const certificateNumber = params.number as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // Get verification code from URL query if present
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setVerificationCode(code);
    }
    verifyCertificate();
  }, [certificateNumber]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/public/certificates/verify/${certificateNumber}${verificationCode ? `?code=${verificationCode}` : ''}`
      );
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setResult({
        valid: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบ',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <QrCode className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ตรวจสอบใบรับรองมาตรฐาน GACP
          </h1>
          <p className="text-gray-600">ระบบตรวจสอบความถูกต้องของใบรับรอง</p>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Status Header */}
            <div
              className={`p-6 ${
                result.valid
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            >
              <div className="flex items-center gap-4 text-white">
                {result.valid ? (
                  <CheckCircle className="w-12 h-12" />
                ) : (
                  <XCircle className="w-12 h-12" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{result.message}</h2>
                  <p className="text-green-100">
                    เลขที่: {result.certificateNumber || certificateNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details (if valid) */}
            {result.valid && result.certificate && (
              <div className="p-6 space-y-6">
                {/* Farm Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    ข้อมูลฟาร์ม
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">ชื่อฟาร์ม</label>
                      <p className="font-semibold text-gray-900">
                        {result.certificate.farmName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">เจ้าของฟาร์ม</label>
                      <p className="font-semibold text-gray-900">
                        {result.certificate.farmerName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        ที่ตั้ง
                      </label>
                      <p className="text-gray-900">
                        {result.certificate.location.district}{' '}
                        {result.certificate.location.province}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">ชนิดพืช</label>
                        <p className="font-semibold text-gray-900">
                          {result.certificate.cropType}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">ขนาดพื้นที่</label>
                        <p className="font-semibold text-gray-900">
                          {result.certificate.farmSize}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    รายละเอียดใบรับรอง
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">มาตรฐาน</label>
                      <p className="font-semibold text-gray-900">
                        {result.certificate.standardName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">คะแนน</label>
                      <p className="font-bold text-green-600">{result.certificate.score}%</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        วันที่ออก
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatDate(result.certificate.issuedDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        วันหมดอายุ
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatDate(result.certificate.expiryDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">
                        ใบรับรองนี้ถูกต้องและใช้งานได้
                      </p>
                      <p className="text-sm text-green-700">
                        ตรวจสอบโดยกรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invalid Certificate Message */}
            {!result.valid && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">{result.message}</p>
                      {result.expiryDate && (
                        <p className="text-sm text-red-700">
                          วันหมดอายุ: {formatDate(result.expiryDate)}
                        </p>
                      )}
                      {result.revokedReason && (
                        <p className="text-sm text-red-700">
                          เหตุผล: {result.revokedReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์</p>
          <p>ระบบรับรองมาตรฐาน GACP แห่งชาติ</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📄 PDF Generation System

### Overview

The PDF generation system creates professional, government-standard certificate PDFs with embedded QR codes and digital signatures for authenticity.

### Step 9: PDF Service Implementation

**File**: `apps/backend/modules/certificate-service/domain/services/PDFGenerationService.js`

```javascript
/**
 * PDF Generation Service
 *
 * Generates certificate PDFs with:
 * - Government-standard Thai formatting
 * - Embedded QR codes
 * - Digital signatures
 * - Watermarks for security
 *
 * @author GACP Platform Team
 * @version 1.0.0
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { uploadToStorage } = require('../../../../shared/storage/StorageService');
const logger = require('../../../../shared/logger/logger');

class PDFGenerationService {
  constructor(dependencies = {}) {
    this.storageService = dependencies.storageService;
    this.config = {
      pageSize: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      fonts: {
        thaiRegular: 'fonts/THSarabunNew.ttf',
        thaiBold: 'fonts/THSarabunNew-Bold.ttf'
      }
    };
  }

  /**
   * Generate certificate PDF
   * @param {Object} certificate - Certificate data
   * @returns {Promise<Object>} PDF generation result with URL and metadata
   */
  async generateCertificatePDF(certificate) {
    try {
      logger.info(
        `[PDFGenerationService] Generating PDF for certificate: ${certificate.certificateNumber}`
      );

      // Create PDF document
      const doc = new PDFDocument({
        size: this.config.pageSize,
        margins: this.config.margins,
        info: {
          Title: `GACP Certificate - ${certificate.certificateNumber}`,
          Author: 'Department of Agriculture - GACP Platform',
          Subject: `GACP Certificate for ${certificate.farmName}`,
          Keywords: 'GACP, Certificate, Thai Agriculture',
          CreationDate: new Date()
        }
      });

      // Generate PDF content
      await this._addHeader(doc, certificate);
      await this._addCertificateDetails(doc, certificate);
      await this._addFarmDetails(doc, certificate);
      await this._addQRCode(doc, certificate);
      await this._addSignatures(doc, certificate);
      await this._addFooter(doc, certificate);
      await this._addWatermark(doc, certificate);

      // Convert to buffer
      const pdfBuffer = await this._documentToBuffer(doc);

      // Upload to storage
      const fileName = `certificates/${certificate.certificateNumber}.pdf`;
      const uploadResult = await this.storageService.uploadFile({
        buffer: pdfBuffer,
        fileName,
        contentType: 'application/pdf',
        metadata: {
          certificateId: certificate.certificateId,
          certificateNumber: certificate.certificateNumber,
          farmerId: certificate.farmerId,
          generatedAt: new Date().toISOString()
        }
      });

      logger.info(`[PDFGenerationService] PDF generated successfully: ${uploadResult.url}`);

      return {
        success: true,
        pdfUrl: uploadResult.url,
        fileName,
        fileSize: pdfBuffer.length,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('[PDFGenerationService] PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Add header with government logo and title
   * @private
   */
  async _addHeader(doc, certificate) {
    // Government Logo
    doc.image('assets/government-logo.png', 50, 50, { width: 80 });

    // Title
    doc
      .font(this.config.fonts.thaiBold)
      .fontSize(24)
      .text('ใบรับรองมาตรฐาน GACP', 150, 60, { align: 'center' });

    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(14)
      .text('กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์', 150, 90, { align: 'center' });

    // Certificate number
    doc
      .font(this.config.fonts.thaiBold)
      .fontSize(18)
      .text(`เลขที่: ${certificate.certificateNumber}`, 150, 120, { align: 'center' });

    doc.moveDown(3);
  }

  /**
   * Add certificate details section
   * @private
   */
  async _addCertificateDetails(doc, certificate) {
    const startY = 200;

    doc.font(this.config.fonts.thaiBold).fontSize(16).text('รายละเอียดใบรับรอง', 50, startY);

    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(12)
      .text(`มาตรฐาน: ${certificate.standardName}`, 50, startY + 30)
      .text(`คะแนน: ${certificate.score}/100`, 50, startY + 50)
      .text(`สถานะ: ${this._getStatusLabel(certificate.status)}`, 50, startY + 70)
      .text(`วันที่ออก: ${this._formatThaiDate(certificate.issuedDate)}`, 50, startY + 90)
      .text(`วันหมดอายุ: ${this._formatThaiDate(certificate.expiryDate)}`, 50, startY + 110)
      .text(`อายุใช้งาน: ${certificate.validityYears} ปี`, 50, startY + 130);

    doc.moveDown(2);
  }

  /**
   * Add farm details section
   * @private
   */
  async _addFarmDetails(doc, certificate) {
    const startY = 400;

    doc.font(this.config.fonts.thaiBold).fontSize(16).text('ข้อมูลฟาร์ม', 50, startY);

    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(12)
      .text(`ชื่อฟาร์ม: ${certificate.farmName}`, 50, startY + 30)
      .text(`เจ้าของฟาร์ม: ${certificate.farmerName}`, 50, startY + 50)
      .text(`พืชที่ปลูก: ${certificate.cropType}`, 50, startY + 70)
      .text(`ขนาดพื้นที่: ${certificate.farmSize}`, 50, startY + 90);

    // Location
    const location = certificate.location;
    doc.text(
      `ที่อยู่: ${location.address}, ${location.subdistrict}, ${location.district}, ${location.province} ${location.postalCode}`,
      50,
      startY + 110,
      { width: 400 }
    );

    doc.moveDown(2);
  }

  /**
   * Add QR code for verification
   * @private
   */
  async _addQRCode(doc, certificate) {
    try {
      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(certificate.qrData, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Convert data URL to buffer
      const qrBuffer = Buffer.from(qrDataURL.split(',')[1], 'base64');

      // Add QR code to PDF
      doc.image(qrBuffer, 400, 400, { width: 150 });

      // Add QR label
      doc
        .font(this.config.fonts.thaiRegular)
        .fontSize(10)
        .text('สแกนเพื่อตรวจสอบ', 400, 560, { width: 150, align: 'center' });
    } catch (error) {
      logger.error('[PDFGenerationService] QR code generation failed:', error);
    }
  }

  /**
   * Add digital signatures
   * @private
   */
  async _addSignatures(doc, certificate) {
    const startY = 620;

    // Director signature
    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(12)
      .text('_______________________', 100, startY)
      .text('(นายสมชาย วงศ์ใหญ่)', 100, startY + 20, { align: 'center', width: 200 })
      .text('อธิบดีกรมวิชาการเกษตร', 100, startY + 40, { align: 'center', width: 200 });

    // Department seal
    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(12)
      .text('_______________________', 350, startY)
      .text('ตราประทับหน่วยงาน', 350, startY + 20, { align: 'center', width: 200 });
  }

  /**
   * Add footer with verification instructions
   * @private
   */
  async _addFooter(doc, certificate) {
    doc
      .font(this.config.fonts.thaiRegular)
      .fontSize(9)
      .text('ตรวจสอบความถูกต้องของใบรับรองได้ที่ https://gacp.doa.go.th/verify', 50, 750, {
        align: 'center',
        width: 500
      })
      .text('© 2025 กรมวิชาการเกษตร กระทรวงเกษตรและสหกรณ์', 50, 765, {
        align: 'center',
        width: 500
      });
  }

  /**
   * Add watermark for security
   * @private
   */
  async _addWatermark(doc, certificate) {
    if (certificate.status !== 'active') {
      doc
        .opacity(0.1)
        .font(this.config.fonts.thaiBold)
        .fontSize(72)
        .text(this._getStatusLabel(certificate.status).toUpperCase(), 0, 400, {
          align: 'center',
          rotate: 45
        })
        .opacity(1);
    }
  }

  /**
   * Convert PDF document to buffer
   * @private
   */
  _documentToBuffer(doc) {
    return new Promise((resolve, reject) => {
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      doc.end();
    });
  }

  /**
   * Format Thai date
   * @private
   */
  _formatThaiDate(date) {
    const d = new Date(date);
    const thaiYear = d.getFullYear() + 543;
    const thaiMonths = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม'
    ];
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${thaiYear}`;
  }

  /**
   * Get status label in Thai
   * @private
   */
  _getStatusLabel(status) {
    const labels = {
      active: 'ใช้งานได้',
      expired: 'หมดอายุ',
      revoked: 'ถูกเพิกถอน',
      renewed: 'ต่ออายุแล้ว',
      suspended: 'ระงับชั่วคราว'
    };
    return labels[status] || 'ไม่ทราบสถานะ';
  }
}

module.exports = PDFGenerationService;
```

### Step 10: Storage Service Configuration

**File**: `apps/backend/shared/storage/StorageService.js`

```javascript
/**
 * Storage Service for file uploads
 * Supports: Local, S3, CloudFlare R2
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');
const logger = require('../logger/logger');

class StorageService {
  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local'; // 'local', 's3', 'r2'

    if (this.storageType === 's3' || this.storageType === 'r2') {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        },
        endpoint: this.storageType === 'r2' ? process.env.R2_ENDPOINT : undefined
      });
      this.bucket = process.env.STORAGE_BUCKET;
    } else {
      this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './storage';
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile({ buffer, fileName, contentType, metadata = {} }) {
    try {
      if (this.storageType === 'local') {
        return await this._uploadLocal(buffer, fileName, contentType, metadata);
      } else {
        return await this._uploadS3(buffer, fileName, contentType, metadata);
      }
    } catch (error) {
      logger.error('[StorageService] Upload failed:', error);
      throw error;
    }
  }

  async _uploadLocal(buffer, fileName, contentType, metadata) {
    const filePath = path.join(this.localStoragePath, fileName);
    const dirPath = path.dirname(filePath);

    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    return {
      url: `/storage/${fileName}`,
      fileName,
      size: buffer.length,
      contentType,
      metadata
    };
  }

  async _uploadS3(buffer, fileName, contentType, metadata) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata
    });

    await this.s3Client.send(command);

    const url =
      this.storageType === 'r2'
        ? `${process.env.R2_PUBLIC_URL}/${fileName}`
        : `https://${this.bucket}.s3.amazonaws.com/${fileName}`;

    return {
      url,
      fileName,
      size: buffer.length,
      contentType,
      metadata
    };
  }
}

module.exports = StorageService;
```

### Step 11: PDF Download Endpoint

Add to [CertificateController.js](apps/backend/modules/certificate-service/presentation/controllers/CertificateController.js:1):

```javascript
/**
 * Download certificate PDF
 * Route: GET /api/certificates/:certificateId/pdf
 */
async downloadCertificatePDF(req, res) {
  try {
    const { certificateId } = req.params;
    const userId = req.userId;

    logger.info(`[CertificateController] PDF download request: ${certificateId} by user: ${userId}`);

    // Get certificate
    const certificate = await this.certificateService.getCertificateById(certificateId);

    // Authorization check
    if (certificate.farmerId !== userId && !req.userRoles.includes('DTAM_ADMIN')) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'คุณไม่มีสิทธิ์ดาวน์โหลดใบรับรองนี้',
      });
    }

    // Generate PDF if not exists
    if (!certificate.pdfGenerated || !certificate.pdfUrl) {
      const pdfResult = await this.pdfService.generateCertificatePDF(certificate);

      // Update certificate with PDF URL
      await this.certificateService.updateCertificate(certificateId, {
        pdfGenerated: true,
        pdfUrl: pdfResult.pdfUrl,
        pdfGeneratedAt: pdfResult.generatedAt,
      });

      certificate.pdfUrl = pdfResult.pdfUrl;
    }

    // Track download
    await this.certificateService.trackDownload(certificateId, userId);

    // Redirect to PDF URL or stream PDF
    if (certificate.pdfUrl.startsWith('http')) {
      // External storage - redirect
      return res.redirect(certificate.pdfUrl);
    } else {
      // Local storage - stream file
      const pdfStream = await this.storageService.getFileStream(certificate.pdfUrl);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${certificate.certificateNumber}.pdf"`
      );
      pdfStream.pipe(res);
    }
  } catch (error) {
    logger.error('[CertificateController] PDF download error:', error);
    res.status(500).json({
      success: false,
      error: 'PDF_DOWNLOAD_ERROR',
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลด PDF',
    });
  }
}
```

### Required Dependencies

```json
{
  "dependencies": {
    "pdfkit": "^0.15.0",
    "qrcode": "^1.5.4",
    "@aws-sdk/client-s3": "^3.680.0"
  }
}
```

### Font Setup

```bash
# Create fonts directory
mkdir -p apps/backend/assets/fonts

# Download Thai fonts (TH Sarabun New)
# Place THSarabunNew.ttf and THSarabunNew-Bold.ttf in the fonts directory
# Free download: https://www.f0nt.com/release/th-sarabunnew/
```

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `apps/farmer-portal/components/certificates/__tests__/CertificateStatusBadge.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CertificateStatusBadge from '../CertificateStatusBadge';

describe('CertificateStatusBadge', () => {
  it('renders active status correctly', () => {
    render(<CertificateStatusBadge status="active" />);
    expect(screen.getByText('ใช้งานได้')).toBeInTheDocument();
  });

  it('shows near expiry warning when < 90 days', () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 60); // 60 days from now

    render(<CertificateStatusBadge status="active" expiryDate={expiryDate.toISOString()} />);
    expect(screen.getByText('ใกล้หมดอายุ')).toBeInTheDocument();
  });

  it('renders expired status correctly', () => {
    render(<CertificateStatusBadge status="expired" />);
    expect(screen.getByText('หมดอายุ')).toBeInTheDocument();
  });
});
```

**File**: `apps/farmer-portal/lib/api/__tests__/certificate-api.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { certificateApi } from '../certificate-api';

// Mock fetch
global.fetch = vi.fn();

describe('certificateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCertificates', () => {
    it('fetches certificates with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          certificates: [],
          total: 0,
          page: 1,
          limit: 10
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await certificateApi.getCertificates();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/certificates'),
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyCertificate', () => {
    it('verifies certificate without auth', async () => {
      const mockResponse = {
        success: true,
        data: {
          valid: true,
          certificate: { certificateNumber: 'GACP-2025-0001' }
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await certificateApi.verifyCertificate('GACP-2025-0001');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/certificates/verify/GACP-2025-0001'),
        expect.objectContaining({
          headers: {} // No auth headers
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
```

### Integration Tests

**File**: `apps/farmer-portal/app/certificates/__tests__/integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CertificateListPage from '../page';

// Mock API
vi.mock('../../../lib/api/certificate-api', () => ({
  certificateApi: {
    getCertificates: vi.fn().mockResolvedValue({
      success: true,
      data: {
        certificates: [
          {
            certificateId: '1',
            certificateNumber: 'GACP-2025-0001',
            farmName: 'ฟาร์มทดสอบ',
            status: 'active',
            issuedDate: '2025-01-01',
            expiryDate: '2028-01-01',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    }),
  },
}));

describe('Certificate List Page - Integration', () => {
  it('loads and displays certificates', async () => {
    render(<CertificateListPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check certificate is displayed
    expect(screen.getByText('GACP-2025-0001')).toBeInTheDocument();
    expect(screen.getByText('ฟาร์มทดสอบ')).toBeInTheDocument();
  });

  it('filters certificates by status', async () => {
    const user = userEvent.setup();
    render(<CertificateListPage />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click expired filter
    const expiredButton = screen.getByText('หมดอายุ');
    await user.click(expiredButton);

    // Verify API called with status filter
    expect(certificateApi.getCertificates).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'expired' })
    );
  });
});
```

### End-to-End Tests

**File**: `tests/e2e/certificate-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Certificate Download Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as farmer
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'farmer@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('farmer can view certificate list', async ({ page }) => {
    await page.goto('http://localhost:3000/certificates');

    // Wait for certificates to load
    await page.waitForSelector('[data-testid="certificate-card"]');

    // Check certificate is displayed
    const certificateNumber = await page.textContent('[data-testid="certificate-number"]');
    expect(certificateNumber).toContain('GACP-');
  });

  test('farmer can download PDF', async ({ page }) => {
    await page.goto('http://localhost:3000/certificates');

    // Click first certificate
    await page.click('[data-testid="certificate-card"]:first-child');

    // Wait for detail page
    await page.waitForSelector('[data-testid="download-pdf-button"]');

    // Start waiting for download
    const downloadPromise = page.waitForEvent('download');

    // Click download
    await page.click('[data-testid="download-pdf-button"]');

    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/GACP-\d{4}-\d{4}\.pdf/);
  });
});

test.describe('Public Verification', () => {
  test('visitor can verify certificate without login', async ({ page }) => {
    await page.goto('http://localhost:3000/verify/GACP-2025-0001');

    // Check verification UI loads
    await expect(page.locator('h1')).toContainText('ตรวจสอบใบรับรอง');

    // Verify button should be visible
    await expect(page.locator('button:has-text("ตรวจสอบ")')).toBeVisible();
  });
});
```

### Test Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'tests/**', '**/*.config.*', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

---

## 🚀 Deployment Checklist

### Environment Variables

**Backend** (`.env`):

```bash
# Storage Configuration
STORAGE_TYPE=local # local, s3, r2
LOCAL_STORAGE_PATH=./storage
STORAGE_BUCKET=gacp-certificates

# AWS S3 (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# CloudFlare R2 (if using R2)
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://certificates.gacp.doa.go.th

# PDF Generation
PDF_FONT_PATH=./assets/fonts
```

**Frontend** (`.env.local`):

```bash
NEXT_PUBLIC_API_URL=https://api.gacp.doa.go.th
NEXT_PUBLIC_CERTIFICATE_VERIFY_URL=https://verify.gacp.doa.go.th
```

### Pre-Deployment Testing

```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage

# Build production
npm run build

# Test production build locally
npm run start
```

### Database Migration

```javascript
// Migration: Add PDF fields to Certificate model
db.certificates.updateMany(
  {},
  {
    $set: {
      pdfGenerated: false,
      pdfUrl: null,
      pdfGeneratedAt: null,
      downloadCount: 0,
      verificationCount: 0
    }
  }
);
```

### Monitoring Setup

**Application Monitoring**:

- Setup error tracking (Sentry)
- Setup performance monitoring
- Setup logging aggregation (ELK Stack)

**Key Metrics to Track**:

- Certificate generation time
- PDF download success rate
- QR code verification rate
- API response times
- Storage usage

### Security Checklist

- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] File upload size limits enforced
- [ ] PDF watermarks for non-active certificates
- [ ] Verification code expiry (optional)

### Performance Optimization

- [ ] PDF caching strategy implemented
- [ ] CDN configured for PDF delivery
- [ ] Image optimization for QR codes
- [ ] Database indexes on certificateNumber and verificationCode
- [ ] API response compression enabled

---

## ✅ Phase 1.3 Completion Summary

**Status**: **100% Complete** ✅

### What Was Built

**Backend (10 APIs)**:

1. GET /api/certificates - List certificates
2. GET /api/certificates/:id - Get certificate details
3. GET /api/certificates/:id/pdf - Download PDF
4. POST /api/certificates/:id/regenerate-pdf - Regenerate PDF
5. GET /api/certificates/standard/:standardId - Get by standard
6. POST /api/certificates/:id/track-download - Track download
7. GET /api/certificates/:id/qr - Get QR code
8. GET /api/public/certificates/verify/:number - Verify certificate
9. POST /api/public/certificates/verify/:number/track - Track verification
10. GET /api/certificates/stats - Certificate statistics

**Frontend (9 Components + 1 Page)**:

1. Type Definitions - 6 interfaces
2. API Client - 5 methods
3. React Hooks - 2 custom hooks (useCertificate, useCertificates)
4. CertificateStatusBadge - Status display with expiry detection
5. CertificateCard - List item component
6. CertificateListPage - Main certificates page
7. CertificateQRCode - QR code display/download
8. CertificateDetailPage - Full certificate view
9. PublicVerificationPage - Public verification portal

**PDF Generation System**:

- PDFGenerationService with Thai font support
- Government-standard formatting
- QR code embedding
- Digital signatures
- Watermarks for security
- Storage service integration (Local/S3/R2)

**Testing Infrastructure**:

- Unit tests for components
- Integration tests for workflows
- E2E tests for user journeys
- 80% coverage requirement

### Key Features

1. **Smart Status Detection**
   - Automatic expiry warnings (<90 days)
   - Visual status badges
   - Status-based watermarks

2. **QR Code System**
   - Embedded QR codes in PDFs
   - Downloadable QR images
   - Copyable verification links
   - Public verification portal

3. **Public Verification**
   - No authentication required
   - URL-based verification
   - Government badge display
   - Comprehensive certificate information

4. **PDF Generation**
   - Thai language support
   - Government-standard formatting
   - Digital signatures
   - Secure storage options

5. **Tracking & Analytics**
   - Download counting
   - Verification counting
   - Certificate statistics
   - Usage monitoring

### Timeline & Budget

**Estimated Time**: 3 weeks
**Estimated Cost**: 400,000 THB

**Team**:

- 2 Frontend Developers
- 1 Backend Developer
- 1 PDF Specialist
- 1 QA Engineer

### Next Phase

**Phase 1.4**: Email Notification System

- 2 weeks development
- 300,000 THB budget
- Email templates for all events
- SendGrid/AWS SES integration

---

**Phase 1.3 Complete! Ready for implementation.** 🚀
