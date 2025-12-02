# 🤖 AI SOP System Documentation

## GACP SOP Wizard with AI Integration

**Date**: October 22, 2025  
**Status**: ✅ Implemented (Backend + Frontend)  
**Location**: `business-logic/gacp-sop-wizard-system.js` + `business-logic/gacp-ai-assistant-system.js`

---

## 📋 System Overview

ระบบ **AI SOP Wizard** เป็นระบบช่วยเหลือเกษตรกรในการทำ **Standard Operating Procedures (SOP)** ตามมาตรฐาน GACP แบบครบวงจร 5 ขั้นตอน พร้อมการให้คำแนะนำจาก AI

### ✨ Key Features:

- ✅ **5 Phases Workflow**: Pre-Planting → Planting → Growing → Harvesting → Post-Harvest
- ✅ **20+ Activity Types**: กิจกรรมครอบคลุมทุกขั้นตอนการเพาะปลูก
- ✅ **AI Guidance**: คำแนะนำอัจฉริยะสำหรับแต่ละ activity
- ✅ **Compliance Tracking**: ติดตามคะแนนความสอดคล้องตาม GACP
- ✅ **Photo Upload + GPS**: อัปโหลดรูปพร้อมพิกัด GPS
- ✅ **Real-time Scoring**: คะแนนสะสมแบบเรียลไทม์
- ✅ **Digital Logbook Integration**: เชื่อมต่อกับสมุดบันทึกดิจิทัล

---

## 🗂️ File Structure

### Backend Files:

```
business-logic/
├── gacp-sop-wizard-system.js       # SOP Wizard Core (799 lines)
├── gacp-ai-assistant-system.js      # AI Integration (1,500+ lines)
└── system-integration-hub.js        # Integration Hub

apps/backend/routes/api/
└── sop.js                           # SOP API Routes (653 lines)

api-integration-layer.js             # API Routes Setup
```

### Frontend Files:

```
apps/frontend/components/gacp/
└── GACPSOPWizard.tsx                # SOP UI Component
```

---

## 📊 5 Phases & 20+ Activities

### **Phase 1: Pre-Planting (ขั้นตอนก่อนปลูก)** - 80 Points

| Activity ID        | Activity Name       | Description                          | Required Fields                                 | Compliance Points |
| ------------------ | ------------------- | ------------------------------------ | ----------------------------------------------- | ----------------- |
| `soil_preparation` | การเตรียมดิน        | ปรับปรุงดิน ไถกลบ เตรียมแปลง         | soil_type, ph_level, organic_matter             | 15                |
| `soil_testing`     | การทดสอบดิน         | วิเคราะห์คุณภาพดิน pH ธาตุอาหาร      | lab_report, test_date, results                  | 20                |
| `water_testing`    | การทดสอบน้ำ         | ทดสอบคุณภาพน้ำเพาะปลูก               | water_source, test_results, contamination_check | 20                |
| `seed_selection`   | การเลือกเมล็ดพันธุ์ | เลือกพันธุ์คุณภาพ จดบันทึกแหล่งที่มา | variety, source, quality_certificate            | 15                |
| `area_measurement` | การวัดพื้นที่       | วัดและทำแผนที่ปลูก                   | area_size, gps_coordinates, layout_plan         | 10                |

**GACP Requirements**: GACP-03.2, GACP-04.1, GACP-05.1, GACP-05.2, GACP-06.1

---

### **Phase 2: Planting (ขั้นตอนการปลูก)** - 50 Points

| Activity ID           | Activity Name       | Description            | Required Fields                                         | Compliance Points |
| --------------------- | ------------------- | ---------------------- | ------------------------------------------------------- | ----------------- |
| `seed_germination`    | การงอกเมล็ด         | กระบวนการงอกเมล็ด      | germination_method, temperature, humidity, success_rate | 15                |
| `seedling_transplant` | การปลูกกล้า         | ย้ายกล้าไปปลูกถาวร     | transplant_date, spacing, plant_count, survival_rate    | 15                |
| `irrigation_setup`    | การติดตั้งระบบรดน้ำ | ติดตั้งและทดสอบระบบน้ำ | system_type, coverage_area, water_pressure              | 10                |
| `plant_tagging`       | การติดป้ายต้นพืช    | ติดรหัสและป้ายข้อมูล   | plant_id, variety, planting_date                        | 10                |

**GACP Requirements**: GACP-04.2, GACP-04.3, GACP-06.2, GACP-10.1

---

### **Phase 3: Growing (ขั้นตอนการเพาะปลูก)** - 65 Points

| Activity ID          | Activity Name        | Description                   | Required Fields                                          | Frequency | Compliance Points |
| -------------------- | -------------------- | ----------------------------- | -------------------------------------------------------- | --------- | ----------------- |
| `daily_watering`     | การรดน้ำประจำวัน     | บันทึกการให้น้ำรายวัน         | water_amount, watering_time, soil_moisture               | Daily     | 5                 |
| `weekly_fertilizing` | การใส่ปุ่ยรายสัปดาห์ | ใส่ปุ่ยและบันทึกประเภท ปริมาณ | fertilizer_type, amount, npk_ratio, application_method   | Weekly    | 10                |
| `monthly_pruning`    | การตัดแต่งรายเดือน   | ตัดแต่งกิ่งและใบ              | pruning_type, removed_parts, plant_condition             | Monthly   | 10                |
| `pest_monitoring`    | การตรวจสอบศัตรูพืช   | ตรวจและบันทึกสถานะศัตรู       | pest_type, severity_level, affected_area, control_action | Weekly    | 15                |
| `disease_inspection` | การตรวจสอบโรคพืช     | ตรวจอาการโรคและป้องกัน        | disease_type, symptoms, prevention_method                | Weekly    | 15                |
| `growth_measurement` | การวัดการเจริญเติบโต | วัดและบันทึกการเติบโต         | plant_height, stem_diameter, leaf_count, growth_stage    | Weekly    | 10                |

**GACP Requirements**: GACP-06.3, GACP-07.1, GACP-08.1, GACP-08.2, GACP-09.1, GACP-09.2

---

### **Phase 4: Harvesting (ขั้นตอนการเก็บเกี่ยว)** - 55 Points

| Activity ID              | Activity Name        | Description                  | Required Fields                                                  | Compliance Points |
| ------------------------ | -------------------- | ---------------------------- | ---------------------------------------------------------------- | ----------------- |
| `maturity_assessment`    | การประเมินความสุกงาม | ตรวจสอบความพร้อมเก็บเกี่ยว   | maturity_indicators, trichome_color, harvest_readiness           | 15                |
| `harvesting_process`     | การเก็บเกี่ยว        | กระบวนการเก็บเกี่ยวและจัดการ | harvest_date, harvest_method, weather_conditions, harvester_info | 20                |
| `fresh_weight_recording` | การชั่งน้ำหนักสด     | ชั่งและบันทึกน้ำหนักสด       | fresh_weight, moisture_content, quality_grade                    | 10                |
| `initial_packaging`      | การบรรจุเบื้องต้น    | บรรจุและติดป้ายข้อมูล        | packaging_type, batch_number, packaging_date                     | 10                |

**GACP Requirements**: GACP-11.1, GACP-11.2, GACP-11.3, GACP-12.1

---

### **Phase 5: Post-Harvest (ขั้นตอนหลังการเก็บเกี่ยว)** - 85 Points

| Activity ID          | Activity Name       | Description               | Required Fields                                                       | Compliance Points |
| -------------------- | ------------------- | ------------------------- | --------------------------------------------------------------------- | ----------------- |
| `drying_process`     | การอบแห้ง           | กระบวนการอบแห้งลดความชื้น | drying_method, temperature, humidity, drying_duration, final_moisture | 20                |
| `processing`         | การแปรรูป           | แปรรูปผลิตภัณฑ์           | processing_type, equipment_used, processing_conditions                | 15                |
| `final_packaging`    | การบรรจุขั้นสุดท้าย | บรรจุผลิตภัณฑ์สำเร็จ      | final_package_type, net_weight, expiry_date, qr_code                  | 15                |
| `storage_conditions` | การเก็บรักษา        | จัดการเก็บในสภาพเหมาะสม   | storage_type, temperature_range, humidity_range, storage_duration     | 10                |
| `quality_testing`    | การทดสอบคุณภาพ      | ทดสอบคุณภาพผลิตภัณฑ์      | test_parameters, lab_results, certificate_number                      | 25                |

**GACP Requirements**: GACP-12.2, GACP-13.1, GACP-13.2, GACP-14.1, GACP-14.2

---

## 🎯 Total Compliance Points: **335 Points**

| Phase        | Activities | Max Points | Percentage |
| ------------ | ---------- | ---------- | ---------- |
| Pre-Planting | 5          | 80         | 23.9%      |
| Planting     | 4          | 50         | 14.9%      |
| Growing      | 6          | 65         | 19.4%      |
| Harvesting   | 4          | 55         | 16.4%      |
| Post-Harvest | 5          | 85         | 25.4%      |
| **Total**    | **24**     | **335**    | **100%**   |

---

## 🤖 AI Integration Features

### 1. **AI Assistant System** (`gacp-ai-assistant-system.js`)

**Core Functions**:

```javascript
class GACPAIAssistantSystem {
  // คำแนะนำสำหรับ SOP activities
  async provideSOPGuidance(context) {
    const { action, phase, sessionContext, activityContext } = context;

    // AI recommendations based on:
    // - Current phase
    // - Activity type
    // - Previous activities
    // - Compliance score

    return {
      type: 'sop_guidance',
      title: 'คำแนะนำ',
      message: 'AI guidance message',
      severity: 'info|success|warning|error',
      recommendations: [...],
    };
  }
}
```

**AI Guidance Actions**:

- `session_start` - เริ่มต้น SOP Session
- `phase_transition` - เปลี่ยนขั้นตอน (Phase)
- `activity_start` - เริ่มกิจกรรม
- `activity_complete` - เสร็จสิ้นกิจกรรม
- `compliance_check` - ตรวจสอบความสอดคล้อง
- `error_detection` - ตรวจจับข้อผิดพลาด

---

### 2. **SOP Wizard System** (`gacp-sop-wizard-system.js`)

**Core Class**:

```javascript
class GACPSOPWizardSystem extends EventEmitter {
  constructor(db, aiAssistant, digitalLogbook) {
    // MongoDB Collections
    this.sopSessionsCollection = db.collection('sop_sessions');
    this.sopActivitiesCollection = db.collection('sop_activities');
    this.complianceScoresCollection = db.collection('compliance_scores');

    // AI Integration
    this.aiAssistant = aiAssistant;
    this.digitalLogbook = digitalLogbook;
  }
}
```

**Key Methods**:

#### Start SOP Session

```javascript
async startSOPSession(data) {
  const session = {
    id: uuidv4(),
    farmId: data.farmId,
    cultivationCycleId: data.cultivationCycleId,
    userId: data.userId,

    currentPhase: 'pre_planting',
    overallProgress: 0,

    phaseProgress: {
      pre_planting: { completed: 0, total: 5, percentage: 0 },
      planting: { completed: 0, total: 4, percentage: 0 },
      growing: { completed: 0, total: 6, percentage: 0 },
      harvesting: { completed: 0, total: 4, percentage: 0 },
      post_harvest: { completed: 0, total: 5, percentage: 0 },
    },

    complianceScore: {
      current: 0,
      maximum: 335,
      percentage: 0,
      breakdown: { ... },
    },

    status: 'IN_PROGRESS',
  };

  // Get AI guidance for session start
  const guidance = await this.aiAssistant.provideSOPGuidance({
    action: 'session_start',
    phase: 'pre_planting',
    sessionContext: session,
  });

  session.aiGuidance = guidance;

  await this.sopSessionsCollection.insertOne(session);
  return session;
}
```

#### Record Activity

```javascript
async recordActivity(sessionId, activityData) {
  const activity = {
    id: uuidv4(),
    sessionId,
    phase: activityData.phase,
    activityId: activityData.activityId,

    // Activity Data
    data: activityData.data,
    photos: activityData.photos || [],
    gpsLocation: activityData.gpsLocation,

    // Metadata
    recordedAt: new Date(),
    recordedBy: activityData.userId,

    // Compliance
    compliancePoints: activityData.compliancePoints,
    complianceStatus: 'completed',
  };

  await this.sopActivitiesCollection.insertOne(activity);

  // Update session progress
  await this.updateSessionProgress(sessionId);

  // Get AI feedback
  const feedback = await this.aiAssistant.provideFeedback({
    action: 'activity_complete',
    activity,
  });

  return { activity, feedback };
}
```

#### Calculate Compliance Score

```javascript
async calculateComplianceScore(sessionId) {
  const activities = await this.sopActivitiesCollection
    .find({ sessionId })
    .toArray();

  const totalPoints = activities.reduce(
    (sum, act) => sum + act.compliancePoints,
    0
  );

  const maxPoints = 335; // Total possible points
  const percentage = (totalPoints / maxPoints) * 100;

  return {
    current: totalPoints,
    maximum: maxPoints,
    percentage: percentage.toFixed(2),
    grade: this.getGrade(percentage),
  };
}

getGrade(percentage) {
  if (percentage >= 90) return 'A (ดีเยี่ยม)';
  if (percentage >= 80) return 'B (ดี)';
  if (percentage >= 70) return 'C (พอใช้)';
  if (percentage >= 60) return 'D (ปรับปรุง)';
  return 'F (ไม่ผ่าน)';
}
```

---

## 🌐 API Endpoints

### SOP API Routes (`/api/sop/`)

**1. Get All SOPs**

```
GET /api/sop
Query Params:
  - cropType: cannabis|herbal_medicine|vegetable|...
  - status: draft|review|approved|published|deprecated|archived
  - difficulty: easy|medium|hard|expert
  - strain: cannabis strain
  - page: 1
  - limit: 20
  - search: search term

Response:
{
  success: true,
  data: {
    sops: [...],
    pagination: { total, page, limit, pages }
  }
}
```

**2. Get Cannabis SOPs**

```
GET /api/sop/cannabis
Response: Cannabis-specific SOPs
```

**3. Get SOP by Code**

```
GET /api/sop/:sopCode
Response: Single SOP details
```

**4. Create SOP**

```
POST /api/sop
Body: {
  cropType, title, description, activities, ...
}
Response: Created SOP
```

**5. Update SOP**

```
PUT /api/sop/:sopCode
Body: { ... updates ... }
Response: Updated SOP
```

**6. Adopt SOP**

```
POST /api/sop/:sopCode/adopt
Body: { userId, farmId, cultivationCycleId }
Response: { adopted: true, session }
```

**7. Get Cultivation Activities**

```
GET /api/sop/cultivation/:recordCode/activities
Response: List of activities for cultivation record
```

**8. Update Activity**

```
PUT /api/sop/cultivation/:recordCode/activity/:activityId
Body: { status, notes, photos, ... }
Response: Updated activity
```

---

## 🔄 Workflow States

### SOP Session States:

```javascript
const SOP_WORKFLOW_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};
```

### Activity States:

- `not_started` - ยังไม่เริ่ม
- `in_progress` - กำลังทำ
- `completed` - เสร็จสิ้น
- `skipped` - ข้าม
- `failed` - ล้มเหลว

---

## 📱 Frontend Integration

### GACPSOPWizard Component (`apps/frontend/components/gacp/GACPSOPWizard.tsx`)

**Usage**:

```tsx
import GACPSOPWizard from '@/components/gacp/GACPSOPWizard';

<GACPSOPWizard farmId={farmId} cultivationCycleId={cycleId} onSessionComplete={handleComplete} />;
```

**Features**:

- Phase navigation (5 tabs)
- Activity checklist per phase
- Progress tracking
- Photo upload
- GPS tagging
- Compliance score display
- AI guidance panel
- Real-time validation

**API Calls**:

```typescript
// Start session
const sessionResult = await fetch('/api/sop/sessions', {
  method: 'POST',
  body: JSON.stringify({ farmId, cultivationCycleId, userId })
});

// Get progress
const progress = await fetch(`/api/sop/sessions/${sessionId}/progress`);

// Record activity
const result = await fetch(`/api/sop/sessions/${sessionId}/activities`, {
  method: 'POST',
  body: JSON.stringify(activityData)
});
```

---

## 📊 Data Models

### SOP Session Schema

```javascript
{
  id: String (UUID),
  farmId: String,
  cultivationCycleId: String,
  userId: String,

  sessionName: String,
  currentPhase: String,
  overallProgress: Number (0-100),

  phaseProgress: {
    pre_planting: { completed: Number, total: Number, percentage: Number },
    planting: { completed: Number, total: Number, percentage: Number },
    growing: { completed: Number, total: Number, percentage: Number },
    harvesting: { completed: Number, total: Number, percentage: Number },
    post_harvest: { completed: Number, total: Number, percentage: Number },
  },

  complianceScore: {
    current: Number,
    maximum: Number (335),
    percentage: Number,
    grade: String,
    breakdown: {
      pre_planting: Number,
      planting: Number,
      growing: Number,
      harvesting: Number,
      post_harvest: Number,
    },
  },

  aiGuidance: {
    type: String,
    message: String,
    severity: String,
    recommendations: Array,
  },

  status: String (SOP_WORKFLOW_STATES),
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
}
```

### SOP Activity Schema

```javascript
{
  id: String (UUID),
  sessionId: String,
  phase: String,
  activityId: String,

  data: Object (required fields),
  photos: Array[String],
  gpsLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
  },

  recordedAt: Date,
  recordedBy: String (userId),

  compliancePoints: Number,
  complianceStatus: String,

  aiValidation: {
    passed: Boolean,
    issues: Array,
    suggestions: Array,
  },
}
```

---

## 🎓 Usage Example

### Complete SOP Workflow:

```javascript
// 1. Start SOP Session
const session = await sopWizard.startSOPSession({
  farmId: 'farm-001',
  cultivationCycleId: 'cycle-001',
  userId: 'user-001',
  sessionName: 'Cannabis Cycle 2025-Q1'
});

console.log('Session started:', session.id);
console.log('AI Guidance:', session.aiGuidance.message);

// 2. Record Pre-Planting Activities
await sopWizard.recordActivity(session.id, {
  phase: 'pre_planting',
  activityId: 'soil_testing',
  userId: 'user-001',
  data: {
    lab_report: 'LAB-2025-001',
    test_date: '2025-01-15',
    results: {
      ph_level: 6.5,
      nitrogen: 'medium',
      phosphorus: 'high',
      potassium: 'medium'
    }
  },
  photos: ['photo-001.jpg', 'photo-002.jpg'],
  gpsLocation: {
    latitude: 18.7883,
    longitude: 98.9853,
    accuracy: 5
  },
  compliancePoints: 20
});

// 3. Check Progress
const progress = await sopWizard.getSessionProgress(session.id);
console.log('Overall Progress:', progress.overallProgress + '%');
console.log('Pre-Planting Phase:', progress.phaseProgress.pre_planting.percentage + '%');

// 4. Get Compliance Score
const score = await sopWizard.calculateComplianceScore(session.id);
console.log('Current Score:', score.current + '/' + score.maximum);
console.log('Percentage:', score.percentage + '%');
console.log('Grade:', score.grade);

// 5. Transition to Next Phase
await sopWizard.transitionPhase(session.id, 'planting');

// 6. Complete Session
await sopWizard.completeSession(session.id);
```

---

## 🔗 Integration Points

### 1. **Digital Logbook**

- SOP activities auto-save to logbook
- Photo evidence stored
- GPS coordinates recorded
- Timestamps tracked

### 2. **GACP Certification**

- Compliance score used in certification
- Activity records as evidence
- Photo documentation for inspectors
- Traceability chain maintained

### 3. **AI Assistant**

- Real-time guidance
- Error detection
- Best practice recommendations
- Automated validation

### 4. **Dashboard Integration**

- SOP progress widgets
- Compliance score display
- Activity timeline
- Phase visualization

---

## ✅ Benefits for GACP Certification

### For Farmers:

- ✅ **Step-by-step guidance** - ไม่พลาดขั้นตอน
- ✅ **AI recommendations** - คำแนะนำอัจฉริยะ
- ✅ **Auto compliance tracking** - ติดตามคะแนนอัตโนมัติ
- ✅ **Photo evidence** - หลักฐานภาพพร้อม GPS
- ✅ **Progress visibility** - เห็นความคืบหน้าชัดเจน

### For Inspectors:

- ✅ **Complete activity log** - บันทึกครบถ้วน
- ✅ **Photo verification** - ตรวจสอบภาพหลักฐาน
- ✅ **GPS validation** - ยืนยันพิกัดที่ตั้ง
- ✅ **Compliance scoring** - คะแนนความสอดคล้อง
- ✅ **Audit trail** - ร่องรอยตรวจสอบได้

### For System:

- ✅ **Standardized workflow** - กระบวนการมาตรฐาน
- ✅ **Data quality** - ข้อมูลคุณภาพสูง
- ✅ **Automation** - ลดงานซ้ำซ้อน
- ✅ **Traceability** - ติดตามย้อนกลับได้
- ✅ **Integration** - เชื่อมต่อระบบอื่นได้

---

## 🚀 Next Steps for Frontend Integration

### Phase 5 Tasks:

1. **Create SOP Pages** (New):
   - `/farmer/sop/session` - SOP Session Management
   - `/farmer/sop/[sessionId]` - Active SOP Wizard
   - `/farmer/sop/history` - Past SOP Sessions
2. **Update Dashboard**:
   - Add SOP progress widget
   - Show current phase
   - Display compliance score
3. **Integration with Application**:
   - Link SOP session to GACP application
   - Use SOP data in inspection (Step 6)
   - Show SOP evidence in approval (Step 7)

4. **API Connections**:
   - Connect to `/api/sop/sessions`
   - Connect to `/api/sop/cultivation/...`
   - Implement photo upload
   - Add GPS capture

---

## 📝 Notes

**Current Status**:

- ✅ Backend fully implemented
- ✅ Business logic complete
- ✅ API routes ready
- ⚠️ Frontend component exists (old version)
- ❌ Not integrated with new Next.js 14 frontend

**Known Limitations**:

- Frontend needs update to Next.js 14
- Photo upload needs real storage (currently mock)
- GPS capture needs implementation
- Mobile responsiveness needs testing

**Recommendation**:

- Integrate SOP Wizard in Phase 5B (after Authentication)
- Create 3 new pages for SOP
- Use existing backend APIs
- Add to farmer dashboard

---

## 🎯 Summary

ระบบ **AI SOP Wizard** เป็นระบบที่ **มีอยู่แล้ว** และ **ใช้งานได้** ใน backend พร้อม:

- ✅ **5 Phases** with **24 Activities**
- ✅ **335 Compliance Points** total
- ✅ **AI Integration** for guidance
- ✅ **API Routes** complete
- ✅ **Data Models** defined
- ⚠️ **Frontend** needs integration with new Next.js

**แนะนำ**: เพิ่ม SOP Wizard เข้าใน frontend ใหม่ระหว่าง **Phase 5** เพื่อให้เกษตรกรสามารถทำ SOP พร้อมกับการยื่นใบสมัคร GACP

---

**Author**: Copilot  
**Last Updated**: October 22, 2025  
**Version**: 1.0
