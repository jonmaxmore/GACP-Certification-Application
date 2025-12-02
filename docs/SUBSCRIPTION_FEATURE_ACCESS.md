# Subscription & Feature Access Guide

**Document Version**: 1.0.0
**Date**: 2025-10-28
**Purpose**: อธิบายระบบ Subscription และการควบคุมการเข้าถึงฟีเจอร์

---

## Executive Summary

ระบบนี้ออกแบบให้:

1. **เบื้องต้น**: ฟีเจอร์ทั้งหมดให้ใช้ **ฟรี** (Free Tier)
2. **อนาคต**: พร้อมอัพเกรดเป็นระบบ **Subscription/Premium** ได้ทันที

**การออกแบบ**:

- ✅ ฟีเจอร์ IoT (Phase 2) เป็น **optional** - ไม่บังคับใช้
- ✅ ฟีเจอร์ AI (Phase 3) เป็น **optional** - ไม่บังคับใช้
- ✅ ในไทยอาจไม่มี IoT ทุกฟาร์ม - ระบบต้องทำงานได้โดยไม่มี IoT
- ✅ เตรียมพร้อมสำหรับ monetization ในอนาคต

---

## Subscription Tiers

### 1. Free Tier (เบื้องต้น - ทุกอย่างฟรี) 🆓

**ราคา**: 0 THB/เดือน

**ฟีเจอร์**:

- ✅ Farm Management (GACP Compliance)
- ✅ Crop Tracking
- ✅ Certification Management
- ✅ **IoT Monitoring** (เบื้องต้นฟรี - อาจเป็น premium ในอนาคต)
  - Max 5 devices
  - Max 10 alerts
- ✅ **AI Recommendations** (เบื้องต้นฟรี - อาจเป็น premium ในอนาคต)
  - Fertilizer recommendations
  - Irrigation scheduling
  - Disease prediction
  - Yield forecasting
  - Max 100 AI requests/month

**เหมาะสำหรับ**:

- เกษตรกรรายย่อย
- ฟาร์มขนาดเล็ก (< 10 ไร่)
- ทดลองใช้งานระบบ

---

### 2. Basic Plan (อนาคต) 💼

**ราคา**: 500 THB/เดือน

**ฟีเจอร์ทั้งหมดจาก Free +**:

- ✅ IoT Monitoring ขยาย
  - Max 20 devices
  - Max 50 alerts
- ✅ AI Recommendations ขยาย
  - Max 500 AI requests/month
- ✅ Email Support

**เหมาะสำหรับ**:

- ฟาร์มขนาดกลาง (10-50 ไร่)
- ฟาร์มที่ต้องการ IoT หลายจุด

---

### 3. Premium Plan (อนาคต) 💎

**ราคา**: 2,000 THB/เดือน

**ฟีเจอร์ทั้งหมดจาก Basic +**:

- ✅ Advanced Analytics
- ✅ Custom Reports
- ✅ Priority Support
- ✅ IoT Monitoring ขยาย
  - Max 100 devices
  - Max 500 alerts
- ✅ AI Recommendations ขยาย
  - Max 5,000 AI requests/month

**เหมาะสำหรับ**:

- ฟาร์มขนาดใหญ่ (50-200 ไร่)
- ฟาร์มที่ต้องการ analytics เชิงลึก

---

### 4. Enterprise Plan (อนาคต) 🏢

**ราคา**: 10,000 THB/เดือน

**ฟีเจอร์ทั้งหมดจาก Premium +**:

- ✅ **Unlimited** IoT devices
- ✅ **Unlimited** AI requests
- ✅ API Access
- ✅ White Label
- ✅ Dedicated Support
- ✅ Custom Development

**เหมาะสำหรับ**:

- ฟาร์มขนาดใหญ่มาก (200+ ไร่)
- บริษัทเกษตร
- ผู้ประกอบการต้องการ integrate กับระบบอื่น

---

## Farm Schema - Subscription Fields

```javascript
{
  // === Membership & Feature Access Control ===
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'  // เบื้องต้นทุกคนเป็น free
    },
    startDate: Date,
    expiryDate: Date,
    autoRenew: Boolean,
    paymentStatus: Enum['active', 'pending', 'overdue', 'cancelled']
  },

  featureAccess: {
    // IoT Features
    iotMonitoring: {
      enabled: Boolean,          // เปิดใช้หรือไม่
      availableInTier: 'free',   // เบื้องต้นให้ฟรี
      activatedAt: Date
    },

    // AI Features
    aiRecommendations: {
      enabled: Boolean,
      availableInTier: 'free',   // เบื้องต้นให้ฟรี
      activatedAt: Date,
      features: {
        fertilizer: Boolean,
        irrigation: Boolean,
        diseasePrediction: Boolean,
        yieldPrediction: Boolean
      }
    },

    // Advanced Analytics (Future - Premium only)
    advancedAnalytics: {
      enabled: Boolean,
      availableInTier: 'premium'  // อนาคตเป็น premium เท่านั้น
    }
  }
}
```

---

## Feature Access Middleware

### การใช้งาน Middleware

**ไฟล์**: `apps/backend/middleware/feature-access.middleware.js`

#### 1. ตรวจสอบว่ามีสิทธิ์เข้าถึงฟีเจอร์หรือไม่

```javascript
const { checkFeatureAccess } = require('../middleware/feature-access.middleware');

// ตรวจสอบว่าฟาร์มมีสิทธิ์ใช้ IoT Monitoring หรือไม่
router.get('/farms/:farmId/iot/devices', checkFeatureAccess('iotMonitoring'), (req, res) => {
  // ถ้า pass middleware แสดงว่ามีสิทธิ์
  const farm = req.farm; // Middleware จะใส่ farm object เข้ามาให้
  // ... logic
});

// ตรวจสอบว่าฟาร์มมีสิทธิ์ใช้ AI Recommendations หรือไม่
router.post(
  '/farms/:farmId/ai/fertilizer-recommendation',
  checkFeatureAccess('aiRecommendations'),
  (req, res) => {
    // ... logic
  }
);
```

**Response เมื่อไม่มีสิทธิ์**:

```json
{
  "success": false,
  "message": "This feature is not available in your current plan (free)",
  "code": "FEATURE_NOT_AVAILABLE",
  "currentTier": "free",
  "requiredTier": "premium",
  "upgradeUrl": "/api/subscriptions/upgrade"
}
```

#### 2. ตรวจสอบว่าเปิดใช้งานฟีเจอร์หรือไม่

```javascript
const {
  checkFeatureAccess,
  requireFeatureEnabled
} = require('../middleware/feature-access.middleware');

// ใช้ 2 middleware ร่วมกัน
router.post(
  '/farms/:farmId/ai/fertilizer-recommendation',
  checkFeatureAccess('aiRecommendations'), // เช็คว่ามีสิทธิ์หรือไม่
  requireFeatureEnabled('aiRecommendations'), // เช็คว่าเปิดใช้หรือไม่
  (req, res) => {
    // Pass ทั้ง 2 middleware แล้ว
    // 1. มีสิทธิ์เข้าถึง (based on subscription)
    // 2. เปิดใช้งานฟีเจอร์แล้ว (enabled = true)
    // ... logic
  }
);
```

**Response เมื่อไม่ได้เปิดใช้**:

```json
{
  "success": false,
  "message": "Feature 'aiRecommendations' is not enabled for this farm",
  "code": "FEATURE_NOT_ENABLED",
  "hint": "Please enable this feature in farm settings first"
}
```

---

## Helper Functions

### 1. เปิดใช้งานฟีเจอร์

```javascript
const { enableFeature } = require('../middleware/feature-access.middleware');

// เปิดใช้งาน IoT Monitoring
await enableFeature(farmId, 'iotMonitoring');

// เปิดใช้งาน AI Recommendations
await enableFeature(farmId, 'aiRecommendations');

// เปิดใช้งานฟีเจอร์ย่อยของ AI
await enableFeature(farmId, 'aiRecommendations.features.fertilizer');
```

### 2. ปิดใช้งานฟีเจอร์

```javascript
const { disableFeature } = require('../middleware/feature-access.middleware');

await disableFeature(farmId, 'iotMonitoring');
```

### 3. ตรวจสอบ Usage Limit

```javascript
const { checkUsageLimit } = require('../middleware/feature-access.middleware');

const iotLimit = checkUsageLimit(farm, 'maxDevices');
console.log(iotLimit);
// {
//   allowed: true,
//   limit: 5,
//   current: 3,
//   remaining: 2
// }

const aiLimit = checkUsageLimit(farm, 'aiRequestsPerMonth');
// {
//   allowed: true,
//   limit: 100,
//   current: 45,
//   remaining: 55
// }
```

---

## API Endpoints สำหรับ Subscription Management

### 1. ดู Subscription ปัจจุบัน

```
GET /api/farms/:farmId/subscription
```

**Response**:

```json
{
  "success": true,
  "data": {
    "tier": "free",
    "startDate": null,
    "expiryDate": null,
    "paymentStatus": "active",
    "features": {
      "iotMonitoring": {
        "enabled": true,
        "availableInTier": "free",
        "limits": {
          "maxDevices": 5,
          "maxAlerts": 10
        }
      },
      "aiRecommendations": {
        "enabled": true,
        "availableInTier": "free",
        "limits": {
          "aiRequestsPerMonth": 100
        }
      }
    }
  }
}
```

### 2. อัพเกรด Subscription (อนาคต)

```
POST /api/farms/:farmId/subscription/upgrade
```

**Request**:

```json
{
  "tier": "premium",
  "paymentMethod": "credit_card",
  "autoRenew": true
}
```

**Response**:

```json
{
  "success": true,
  "message": "Subscription upgraded to premium",
  "data": {
    "tier": "premium",
    "startDate": "2025-10-28",
    "expiryDate": "2025-11-28",
    "paymentStatus": "active",
    "invoice": {
      "id": "INV-001",
      "amount": 2000,
      "currency": "THB"
    }
  }
}
```

### 3. เปิด/ปิดใช้งานฟีเจอร์

```
POST /api/farms/:farmId/features/enable
```

**Request**:

```json
{
  "feature": "iotMonitoring"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Feature 'iotMonitoring' enabled successfully",
  "data": {
    "feature": "iotMonitoring",
    "enabled": true,
    "activatedAt": "2025-10-28T10:30:00Z"
  }
}
```

---

## Frontend Integration Examples

### 1. ตรวจสอบว่าฟีเจอร์พร้อมใช้หรือไม่

```javascript
// React Component
import { useFarm } from '@/hooks/useFarm';

function IoTDashboard() {
  const { farm, loading } = useFarm();

  // ตรวจสอบว่ามีสิทธิ์และเปิดใช้งาน IoT หรือไม่
  const canUseIoT =
    farm?.featureAccess?.iotMonitoring?.enabled && farm?.subscription?.tier !== 'expired';

  if (!canUseIoT) {
    return (
      <div className="feature-locked">
        <h3>IoT Monitoring ยังไม่เปิดใช้งาน</h3>
        <p>เบื้องต้นฟรี! คลิกเพื่อเปิดใช้งาน</p>
        <button onClick={handleEnableFeature}>เปิดใช้งาน IoT</button>
      </div>
    );
  }

  return <IoTDashboardContent farm={farm} />;
}
```

### 2. แสดง Upgrade Prompt

```javascript
function FeatureUpgradePrompt({ currentTier, requiredTier }) {
  return (
    <div className="upgrade-prompt">
      <h3>ต้องการฟีเจอร์เพิ่มเติม?</h3>
      <p>
        ปัจจุบันคุณใช้ <strong>{currentTier}</strong> plan
      </p>
      <p>
        อัพเกรดเป็น <strong>{requiredTier}</strong> เพื่อใช้งานฟีเจอร์นี้
      </p>
      <Link href="/subscription/upgrade">
        <button>อัพเกรด →</button>
      </Link>
    </div>
  );
}
```

### 3. แสดง Usage Limits

```javascript
function UsageWidget({ farm }) {
  const iotUsage = farm.usage?.iotDevices || 0;
  const iotLimit = farm.subscription?.limits?.maxDevices || 5;
  const percentage = (iotUsage / iotLimit) * 100;

  return (
    <div className="usage-widget">
      <h4>IoT Devices</h4>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${percentage}%` }} />
      </div>
      <p>
        {iotUsage} / {iotLimit} devices
      </p>
      {percentage > 80 && <p className="warning">ใกล้ถึงขีดจำกัด! พิจารณาอัพเกรด</p>}
    </div>
  );
}
```

---

## Migration Strategy

### Phase 1: เบื้องต้น (ตอนนี้)

**สถานะ**: ✅ ทุกอย่างฟรี

- ✅ ทุก farm เป็น `tier: 'free'` โดย default
- ✅ ทุกฟีเจอร์ `availableInTier: 'free'`
- ✅ Middleware พร้อมใช้งาน แต่ยัง allow ทุกอย่าง
- ✅ Frontend แสดง feature toggles ได้

**การใช้งาน**:

- เกษตรกรสมัครใช้งานฟรี
- เลือกเปิด/ปิดฟีเจอร์ตามต้องการ
- ไม่มีการเก็บเงิน

---

### Phase 2: เตรียมความพร้อม (3-6 เดือนถัดไป)

**สถานะ**: ⏳ เตรียม Premium Features

- ⏳ เพิ่ม Payment Gateway (Stripe, Omise, PromptPay)
- ⏳ สร้างหน้า Subscription Management
- ⏳ ติดตาม Usage (devices, AI requests)
- ⏳ Email notifications (subscription expiry)

**การใช้งาน**:

- Free tier ยังคงใช้งานได้
- เริ่มมี option อัพเกรด (แต่ยังไม่บังคับ)
- Early adopter discounts

---

### Phase 3: เปิดตัว Subscription (6-12 เดือน)

**สถานะ**: ⏳ เริ่ม Monetization

- ⏳ เปลี่ยน advanced features เป็น premium
  - Advanced Analytics → Premium only
  - Unlimited devices → Premium/Enterprise
  - API Access → Enterprise only
- ⏳ Free tier จำกัด limits ลง
  - Max 5 devices
  - Max 100 AI requests/month

**การใช้งาน**:

- เกษตรกรใหม่เริ่มที่ Free tier
- เกษตรกรเก่าได้ grandfather discount
- Upgrade path ชัดเจน

---

## Best Practices

### 1. สำหรับ Backend Developers

**DO**:

- ✅ ใช้ `checkFeatureAccess()` middleware ทุกครั้งที่เข้าถึง premium features
- ✅ เช็ค `featureAccess.*.enabled` ก่อนทำงาน
- ✅ Return error codes ที่ชัดเจน (`FEATURE_NOT_AVAILABLE`, `FEATURE_NOT_ENABLED`)
- ✅ Log feature usage สำหรับ analytics

**DON'T**:

- ❌ Hard-code feature checks
- ❌ ลืมเช็ค subscription expiry
- ❌ Block ฟีเจอร์โดยไม่บอกเหตุผล

### 2. สำหรับ Frontend Developers

**DO**:

- ✅ แสดง feature locks ก่อนเรียก API (ลด wasted requests)
- ✅ Provide upgrade paths ที่ชัดเจน
- ✅ แสดง usage limits และ warnings
- ✅ Cache subscription status

**DON'T**:

- ❌ แสดงฟีเจอร์ที่ใช้ไม่ได้
- ❌ ซ่อน upgrade options
- ❌ ทำให้ user สับสนว่าทำไมใช้ไม่ได้

### 3. สำหรับ Product/Business

**DO**:

- ✅ เก็บ metrics: feature adoption, usage patterns
- ✅ A/B test pricing tiers
- ✅ Survey users ก่อนเปิดตัว premium
- ✅ Grandfather เกษตรกรเก่า

**DON'T**:

- ❌ เปลี่ยน pricing โดยไม่แจ้งล่วงหน้า
- ❌ Block ฟีเจอร์ที่คนใช้งานอยู่ทันที
- ❌ ทำให้ Free tier ใช้งานไม่ได้จริง

---

## Summary

**ตอนนี้** (Phase 1):

- ✅ ทุกอย่างฟรี
- ✅ IoT และ AI เป็น optional (ไม่บังคับ)
- ✅ Middleware พร้อมแล้ว (แต่ allow ทุกอย่าง)
- ✅ เตรียมพร้อมสำหรับอนาคต

**อนาคต** (Phase 2-3):

- ⏳ Subscription tiers
- ⏳ Usage limits
- ⏳ Payment integration
- ⏳ Premium features

**ประโยชน์**:

1. **เกษตรกร**: เริ่มใช้ฟรี ไม่มีความเสี่ยง
2. **Platform**: มีรายได้ในอนาคต
3. **Scalable**: พร้อมขยายได้ตามจำนวนผู้ใช้

---

**Document Owner**: Product & Engineering Team
**Status**: Ready for Phase 1 Implementation
**Next Review**: ทุก 3 เดือน
