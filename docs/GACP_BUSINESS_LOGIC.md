# GACP Platform - Business Logic & Workflow Design

## 📊 Overview

ระบบรับรองมาตรฐาน GACP (Good Agricultural and Collection Practices) สำหรับสมุนไพรไทย
ตามแนวทางของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)

## 🏛️ Regulatory Framework

### 1. ที่มาของมาตรฐาน GACP

- **WHO Guidelines**: Good Agricultural and Collection Practices for Medicinal Plants
- **ASEAN Guidelines**: ASEAN Guidelines for Good Agricultural and Collection Practices
- **Thai FDA Regulations**: ประกาศกระทรวงสาธารณสุข เรื่องหลักเกณฑ์การปลูกและเก็บรวบรวมพืชสมุนไพร
- **DTAM Standards**: มาตรฐานของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก

### 2. ขอบเขตการรับรอง

- **พืชสมุนไพรที่ครอบคลุม**:
  - กลุมพืชสมุนไพรสำคัญ 12 ชนิด (ขมิ้นชัน, ขิง, กะเพรา, ฟ้าทลายโจร, etc.)
  - พืชสมุนไพรท้องถิ่น
  - พืชสมุนไพรที่มีการใช้ในอุตสาหกรรม

## 🔄 Core Business Workflow

### Phase 1: Application & Documentation

```
1. Farmer Registration
   ├── Personal Information Verification
   ├── Farm Location & Land Rights Verification
   ├── Cultivation History Documentation
   └── Initial Self-Assessment

2. Application Submission
   ├── GACP Application Form (DTAM-GACP-001)
   ├── Farm Management Plan
   ├── Cultivation Records (minimum 1 season)
   ├── Water & Soil Quality Reports
   └── Payment of Application Fee
```

### Phase 2: Document Review & Preliminary Assessment

```
3. DTAM Officer Review
   ├── Document Completeness Check
   ├── Initial Risk Assessment
   ├── Farming Practice Evaluation
   └── Site Inspection Scheduling

4. Preliminary Assessment Result
   ├── APPROVED → Schedule Field Inspection
   ├── REVISION REQUIRED → Return to Farmer
   └── REJECTED → End Process with Reason
```

### Phase 3: Field Inspection & Audit

```
5. On-Site Inspection
   ├── Physical Farm Inspection
   ├── Cultivation Practice Verification
   ├── Input Material Verification
   ├── Record Keeping Assessment
   ├── Worker Training Verification
   └── Infrastructure Assessment

6. Laboratory Testing (if required)
   ├── Soil Quality Analysis
   ├── Water Quality Analysis
   ├── Pesticide Residue Testing
   └── Heavy Metal Testing
```

### Phase 4: Evaluation & Decision

```
7. Compliance Evaluation
   ├── Field Inspection Report
   ├── Laboratory Results Review
   ├── Risk Assessment
   └── Compliance Scoring (0-100)

8. Certification Decision
   ├── PASS (Score ≥ 80) → Issue Certificate
   ├── CONDITIONAL PASS (Score 70-79) → Corrective Action Plan
   └── FAIL (Score < 70) → Re-training & Re-application Required
```

### Phase 5: Certificate Issuance & Monitoring

```
9. Certificate Management
   ├── Digital Certificate Generation
   ├── QR Code Verification System
   ├── Public Registry Update
   └── Certificate Validity Tracking

10. Post-Certification Monitoring
    ├── Annual Surveillance Visits
    ├── Market Sample Testing
    ├── Complaint Investigation
    └── Certificate Renewal Process
```

## 📊 Detailed Process Logic

### 1. Application Validation Logic

```javascript
validateApplication(application) {
  // Document Completeness (30%)
  const documentScore = calculateDocumentScore(application.documents);

  // Farm Information Accuracy (25%)
  const farmScore = validateFarmInformation(application.farmInfo);

  // Previous Experience (20%)
  const experienceScore = assessFarmingExperience(application.experience);

  // Risk Factors (25%)
  const riskScore = assessRiskFactors(application.location, application.crops);

  const totalScore = (documentScore * 0.3) + (farmScore * 0.25) +
                    (experienceScore * 0.2) + (riskScore * 0.25);

  return {
    score: totalScore,
    status: totalScore >= 70 ? 'APPROVED' : 'REVISION_REQUIRED',
    recommendations: generateRecommendations(application)
  };
}
```

### 2. Field Inspection Criteria

```
Critical Control Points (CCPs):
1. Seed/Planting Material Quality (15 points)
2. Soil Management & Fertilizer Use (15 points)
3. Pest & Disease Management (15 points)
4. Harvesting Practices (15 points)
5. Post-Harvest Handling (15 points)
6. Storage & Transportation (10 points)
7. Record Keeping (10 points)
8. Worker Training & Safety (5 points)

Total: 100 points
Pass Threshold: 80 points
```

### 3. Risk-Based Assessment

```
High Risk Factors:
- Proximity to industrial areas (< 5km)
- History of contamination incidents
- Use of prohibited substances
- Inadequate water source quality
- Lack of proper storage facilities

Medium Risk Factors:
- New farming operations (< 2 years)
- Limited farming experience
- Seasonal water availability issues
- Remote location access challenges

Low Risk Factors:
- Established organic operations
- Certified seed sources
- Good infrastructure
- Experienced farmers
- Clean environmental records
```

## 🏗️ Technical Implementation Architecture

### 1. Database Schema Design

```
Users
├── farmers (cultivation operations)
├── dtam_officers (government inspectors)
├── auditors (third-party inspectors)
├── lab_technicians (testing personnel)
└── administrators (system management)

Applications
├── application_id (unique identifier)
├── farmer_id (foreign key)
├── farm_details (location, size, crops)
├── status_history (audit trail)
├── documents (file attachments)
└── assessment_scores (evaluation results)

Inspections
├── inspection_id (unique identifier)
├── application_id (foreign key)
├── inspector_id (foreign key)
├── inspection_type (initial/surveillance/complaint)
├── checklist_results (detailed findings)
└── recommendations (corrective actions)

Certificates
├── certificate_id (unique identifier)
├── application_id (foreign key)
├── issue_date (certificate issue date)
├── expiry_date (certificate expiry date)
├── status (active/suspended/revoked/expired)
└── qr_verification_code (public verification)
```

### 2. State Management

```
Application States:
DRAFT → SUBMITTED → UNDER_REVIEW → INSPECTION_SCHEDULED →
INSPECTION_IN_PROGRESS → INSPECTION_COMPLETED → EVALUATION →
DECISION_PENDING → APPROVED/REJECTED → CERTIFICATE_ISSUED

Certificate States:
ACTIVE → RENEWAL_DUE → SUSPENDED → REVOKED → EXPIRED
```

### 3. Integration Points

```
External Systems:
1. DTAM Central Database
   - Officer authentication
   - Policy updates
   - Reporting requirements

2. DOA (Department of Agriculture)
   - Farmer registration verification
   - Land use records
   - Crop data synchronization

3. FDA (Food and Drug Administration)
   - Product registration linkage
   - Market surveillance data
   - Violation records

4. Laboratory Network
   - Test result integration
   - Quality assurance data
   - Accreditation verification

5. Payment Gateway
   - Fee collection
   - Receipt generation
   - Financial reconciliation
```

## 📈 Quality Assurance & Compliance

### 1. Audit Trail Requirements

- All system actions must be logged
- User authentication tracking
- Document modification history
- Decision rationale documentation
- Time-stamped evidence trail

### 2. Data Integrity

- Digital signatures for critical documents
- Hash verification for uploaded files
- Backup and recovery procedures
- Data retention policies (7 years minimum)

### 3. Security & Privacy

- Role-based access control (RBAC)
- Personal data protection (PDPA compliance)
- Secure communication protocols
- Regular security assessments

## 🎯 Success Metrics & KPIs

### 1. Process Efficiency

- Application processing time (target: 45 days)
- Inspection scheduling efficiency (target: 14 days)
- Certificate issuance time (target: 7 days)
- Appeal resolution time (target: 30 days)

### 2. Quality Indicators

- First-time application approval rate (target: 65%)
- Certificate revocation rate (target: < 2%)
- Farmer satisfaction score (target: > 4.0/5.0)
- System uptime (target: 99.5%)

### 3. Compliance Metrics

- Regulatory compliance score (target: 100%)
- Audit finding resolution rate (target: 100%)
- Data accuracy rate (target: 99.9%)
- Security incident rate (target: 0)

---

## 📚 References

1. WHO Guidelines on Good Agricultural and Collection Practices (GACP) for Medicinal Plants
2. ASEAN Guidelines for Good Agricultural and Collection Practices for Medicinal Plants
3. Thai FDA Regulations on Herbal Products
4. DTAM Standards and Operating Procedures
5. ISO 9001:2015 Quality Management Systems
6. ISO 27001:2013 Information Security Management

---

_Last Updated: October 19, 2025_
_Document Version: 1.0_
_Approved by: GACP Platform Development Team_
