# 🌿 GACP Cannabis Farm Management System - ERP Design Document

## 📋 Executive Summary

ระบบ ERP ขนาดกลางสำหรับการจัดการฟาร์มปลูกกัญชาตามมาตรฐาน GACP (Good Agricultural and Collection Practices) ที่เป็นไปตามขั้นตอน SOP ของกรมแพทย์แผนไทยและการแพทย์ทางเลือก

---

## 🎯 Business Requirements

### **Primary Objectives:**

1. **Cannabis Cultivation Management** - การจัดการการปลูกกัญชาตามมาตรฐาน GACP
2. **SOP Compliance** - การปฏิบัติตามขั้นตอน SOP ของกรมแพทย์แผนไทย
3. **Traceability** - การติดตามย้อนกลับตั้งแต่เมล็ดพันธุ์ถึงผลิตภัณฑ์
4. **Quality Assurance** - การควบคุมคุณภาพตามมาตรฐานสากล
5. **Regulatory Compliance** - การปฏิบัติตามกฎหมายและระเบียบ

### **Target Users:**

- **เกษตรกร** - ผู้ปลูกกัญชาที่ต้องการรับรอง GACP
- **เจ้าหน้าที่กรมแพทย์แผนไทย** - ผู้ตรวจสอบและรับรอง
- **ผู้ตรวจสอบคุณภาพ** - QA/QC inspectors
- **ผู้จัดการระบบ** - System administrators

---

## 🏗️ System Architecture

### **Core Modules:**

#### 1. **🌱 Farm Registration & Profile Management**

- ข้อมูลฟาร์มและเจ้าของ
- ใบอนุญาทที่เกี่ยวข้อง
- GPS coordinates และ mapping
- ประวัติการรับรอง

#### 2. **📋 GACP SOP Wizard System**

- **Pre-Planting Phase** (ขั้นตอนก่อนปลูก)
- **Planting Phase** (ขั้นตอนการปลูก)
- **Growing Phase** (ขั้นตอนการเพาะปลูก)
- **Harvesting Phase** (ขั้นตอนการเก็บเกี่ยว)
- **Post-Harvest Phase** (ขั้นตอนหลังการเก็บเกี่ยว)

#### 3. **🔍 Quality Control & Testing**

- การทดสอบดิน และน้ำ
- การทดสอบสารเคมีตกค้าง
- การทดสอบไมโครบบ
- การควบคุมคุณภาพตามมาตรฐาน

#### 4. **📊 Production Management**

- แปลงปลูกและการจัดการพื้นที่
- ปฏิทินการผลิต
- การใช้วัสดุการเกษตร
- บันทึกการดำเนินงานประจำวัน

#### 5. **🔬 Laboratory & Testing Integration**

- เชื่อมต่อกับห้องปฏิบัติการ
- ผลการทดสอบแบบ real-time
- การจัดการใบรับรอง COA

#### 6. **📱 Mobile App Integration**

- Field data collection
- Photo documentation
- GPS tracking
- Offline capability

---

## 🎨 UI/UX Design Framework

### **Design Principles:**

- **Mobile-First** - responsive design สำหรับการใช้งานในสวน
- **Intuitive Navigation** - ง่ายต่อการใช้งานสำหรับเกษตรกร
- **Visual Workflow** - แสดงขั้นตอนแบบภาพ
- **Multi-language Support** - ไทย/อังกฤษ
- **Accessibility** - รองรับผู้ใช้ทุกระดับ

### **Color Scheme:**

- **Primary Green**: #10b981 (Cannabis/Nature theme)
- **Secondary Blue**: #3b82f6 (Trust/Professional)
- **Warning Orange**: #f59e0b (Alerts/Compliance)
- **Danger Red**: #ef4444 (Critical issues)

---

## 📚 GACP SOP Implementation

### **Phase 1: Pre-Planting (ขั้นตอนก่อนปลูก)**

#### **Required Documents & Checklists:**

```javascript
const prePlantingChecklist = {
  soilTesting: {
    ph_level: { min: 6.0, max: 7.5, required: true },
    organic_matter: { min: 3, unit: '%', required: true },
    heavy_metals: { test_required: true, limits: {...} },
    microbiology: { pathogens: 'absent', required: true }
  },
  waterTesting: {
    ph_level: { min: 6.5, max: 8.5, required: true },
    heavy_metals: { test_required: true },
    microorganisms: { e_coli: 'absent', required: true }
  },
  seedCertification: {
    variety_registration: { required: true },
    genetic_purity: { min: 95, unit: '%' },
    germination_rate: { min: 85, unit: '%' },
    health_certificate: { required: true }
  },
  facilityPreparation: {
    storage_conditions: { temperature: '15-25°C', humidity: '<60%' },
    pest_control: { plan_required: true },
    equipment_calibration: { required: true }
  }
}
```

### **Phase 2: Planting (ขั้นตอนการปลูก)**

#### **Documentation Requirements:**

- วันที่และเวลาการปลูก
- จำนวนเมล็ดพันธุ์ที่ใช้
- ลักษณะของดินและสภาพอากาศ
- การใช้ปุ๋ยและสารเคมี

### **Phase 3: Growing (ขั้นตอนการเพาะปลูก)**

#### **Daily/Weekly Activities:**

- การรดน้ำและการใส่ปุ๋ย
- การตรวจสอบโรคและแมลง
- การบันทึกสภาพอากาศ
- การถ่ายภาพประกอบ

### **Phase 4: Harvesting (ขั้นตอนการเก็บเกี่ยว)**

#### **Critical Control Points:**

- ระยะเวลาการเก็บเกี่ยวที่เหมาะสม
- วิธีการเก็บเกี่ยวที่ถูกต้อง
- การจัดการหลังการเก็บเกี่ยว
- การป้องกันการปนเปื้อน

### **Phase 5: Post-Harvest (ขั้นตอนหลังการเก็บเกี่ยว)**

#### **Processing & Storage:**

- การอบแห้งและการเก็บรักษา
- การควบคุมอุณหภูมิและความชื้น
- การบรรจุและการติดป้าย
- การจัดส่งและการขนส่ง

---

## 💾 Database Schema Design

### **Core Entities:**

#### **1. Farms Table**

```sql
CREATE TABLE farms (
    farm_id VARCHAR(20) PRIMARY KEY,
    farm_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    gps_coordinates POINT,
    total_area DECIMAL(10,2),
    cultivation_area DECIMAL(10,2),
    gacp_status ENUM('pending', 'certified', 'expired', 'revoked'),
    certification_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. Cultivation Cycles Table**

```sql
CREATE TABLE cultivation_cycles (
    cycle_id VARCHAR(20) PRIMARY KEY,
    farm_id VARCHAR(20) REFERENCES farms(farm_id),
    variety_name VARCHAR(100),
    planting_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    total_plants INTEGER,
    cultivation_area DECIMAL(8,2),
    status ENUM('planned', 'planted', 'growing', 'harvested', 'completed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. SOP Activities Table**

```sql
CREATE TABLE sop_activities (
    activity_id VARCHAR(20) PRIMARY KEY,
    cycle_id VARCHAR(20) REFERENCES cultivation_cycles(cycle_id),
    phase ENUM('pre_planting', 'planting', 'growing', 'harvesting', 'post_harvest'),
    activity_type VARCHAR(100),
    scheduled_date DATE,
    completed_date DATE,
    status ENUM('pending', 'in_progress', 'completed', 'skipped'),
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    notes TEXT,
    attachments JSON,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **4. Quality Control Records**

```sql
CREATE TABLE quality_control_records (
    qc_id VARCHAR(20) PRIMARY KEY,
    cycle_id VARCHAR(20) REFERENCES cultivation_cycles(cycle_id),
    test_type ENUM('soil', 'water', 'plant', 'product', 'environment'),
    test_date DATE,
    laboratory VARCHAR(255),
    parameters JSON,
    results JSON,
    compliance_status ENUM('passed', 'failed', 'pending'),
    certificate_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **5. Audit Trail Table**

```sql
CREATE TABLE audit_trail (
    audit_id VARCHAR(20) PRIMARY KEY,
    table_name VARCHAR(50),
    record_id VARCHAR(20),
    action ENUM('create', 'update', 'delete'),
    old_values JSON,
    new_values JSON,
    user_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);
```

---

## 🎭 User Role Permissions

### **1. Farmer (เกษตรกร)**

```javascript
const farmerPermissions = {
  farms: ['read', 'update_own'],
  cultivation: ['create', 'read', 'update_own'],
  sop_activities: ['create', 'read', 'update_own'],
  quality_records: ['read_own'],
  reports: ['generate_own'],
  mobile_app: ['full_access']
};
```

### **2. Inspector (เจ้าหน้าที่ตรวจสอบ)**

```javascript
const inspectorPermissions = {
  farms: ['read', 'audit'],
  cultivation: ['read', 'audit'],
  sop_activities: ['read', 'audit', 'approve'],
  quality_records: ['read', 'verify'],
  reports: ['generate', 'export'],
  audit_trail: ['read']
};
```

### **3. Admin (ผู้จัดการระบบ)**

```javascript
const adminPermissions = {
  users: ['create', 'read', 'update', 'delete'],
  farms: ['create', 'read', 'update', 'delete'],
  system_config: ['full_access'],
  reports: ['full_access'],
  audit_trail: ['full_access']
};
```

---

## 📱 Frontend Components Architecture

### **1. Farmer Dashboard**

- **Farm Overview Cards**
- **Active Cultivation Cycles**
- **Pending SOP Activities**
- **Compliance Status**
- **Quick Actions**

### **2. SOP Wizard Component**

- **Phase Navigation**
- **Activity Checklists**
- **Photo Upload**
- **GPS Tagging**
- **Compliance Scoring**

### **3. Quality Control Module**

- **Test Scheduling**
- **Result Entry**
- **Certificate Management**
- **Trend Analysis**

### **4. Reporting Dashboard**

- **Compliance Reports**
- **Production Reports**
- **Quality Trends**
- **Export Functions**

---

## 🔄 API Endpoints Design

### **Farm Management APIs**

```javascript
// Farm Registration
POST   /api/v1/farms
GET    /api/v1/farms
GET    /api/v1/farms/:farmId
PUT    /api/v1/farms/:farmId
DELETE /api/v1/farms/:farmId

// Cultivation Management
POST   /api/v1/cultivation/cycles
GET    /api/v1/cultivation/cycles/:farmId
PUT    /api/v1/cultivation/cycles/:cycleId

// SOP Activities
POST   /api/v1/sop/activities
GET    /api/v1/sop/activities/:cycleId
PUT    /api/v1/sop/activities/:activityId
POST   /api/v1/sop/activities/:activityId/complete

// Quality Control
POST   /api/v1/quality/tests
GET    /api/v1/quality/tests/:cycleId
PUT    /api/v1/quality/tests/:testId
GET    /api/v1/quality/certificates/:certificateId
```

### **Reporting APIs**

```javascript
// Compliance Reports
GET    /api/v1/reports/compliance/:farmId
GET    /api/v1/reports/sop-status/:cycleId
GET    /api/v1/reports/quality-summary/:farmId

// Analytics
GET    /api/v1/analytics/farm-performance/:farmId
GET    /api/v1/analytics/compliance-trends
GET    /api/v1/analytics/quality-metrics
```

---

## 🔐 Security & Compliance

### **Data Protection:**

- **Encryption at Rest** - AES-256
- **Encryption in Transit** - TLS 1.3
- **API Authentication** - JWT with refresh tokens
- **Role-based Access Control** - RBAC implementation
- **Audit Logging** - Complete activity tracking

### **Regulatory Compliance:**

- **PDPA Compliance** - Personal data protection
- **Cannabis Law Compliance** - Thai cannabis regulations
- **GACP Standards** - International quality standards
- **FDA Requirements** - Food and drug safety standards

---

## 📊 KPI & Success Metrics

### **System Performance:**

- **User Adoption Rate** - 80% of registered farmers actively using
- **Compliance Score** - Average 85% SOP compliance
- **Data Accuracy** - 95% accurate data entry
- **System Uptime** - 99.9% availability

### **Business Impact:**

- **Certification Success Rate** - 90% first-time pass rate
- **Time to Certification** - Reduce by 40%
- **Quality Improvement** - 25% reduction in quality issues
- **Regulatory Compliance** - 100% compliance rate

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (Weeks 1-4)**

- Basic farm registration
- Simple SOP wizard
- Core database setup
- Authentication system

### **Phase 2: Core Features (Weeks 5-8)**

- Complete SOP implementation
- Quality control module
- Mobile app development
- Basic reporting

### **Phase 3: Advanced Features (Weeks 9-12)**

- Advanced analytics
- Third-party integrations
- Advanced reporting
- Performance optimization

### **Phase 4: Production & Scale (Weeks 13-16)**

- Production deployment
- User training
- Support system
- Continuous improvement

---

## 🏆 Conclusion

ระบบ GACP Cannabis Farm Management นี้ถูกออกแบบให้เป็น **Complete ERP Solution** ที่:

- ✅ **ครอบคลุมทุกขั้นตอน** - ตั้งแต่การปลูกจนถึงการเก็บเกี่ยว
- ✅ **ปฏิบัติตาม SOP** - ขั้นตอนตามที่กรมแพทย์แผนไทยกำหนด
- ✅ **รองรับการเติบโต** - สามารถขยายให้ครอบคลุมพืชอื่นๆ
- ✅ **เน้นคุณภาพ** - ระบบควบคุมคุณภาพที่เข้มงวด
- ✅ **ง่ายต่อการใช้งาน** - UI/UX ที่เหมาะสำหรับเกษตรกร

ระบบนี้จะช่วยยกระดับมาตรฐานการปลูกกัญชาของไทยให้เป็นไปตามมาตรฐานสากล 🌿✨
