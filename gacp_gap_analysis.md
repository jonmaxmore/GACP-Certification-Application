# GACP Gap Analysis: Thai Guidelines vs. Current System

This document analyzes the gap between the uploaded "Thailand Guidelines on GACP for Medical Plants" (the "Old Format") and our current Digital System (`Application.js` / `Farm.js`).

## 1. Overview of Thai GACP Requirements (From Images)

The guidelines are divided into 10 Key Categories:

1.  **Quality Assurance (QA):** Control measures at every step.
2.  **Personal Hygiene:** Botany knowledge, hygiene, clothing, hand washing, health checks, PPE, training, visitor rules.
3.  **Document:** SOPs, Land history (>2 years), Production records, Factor records, Environment records, Organic substance records, Labeling, Audits, 2-year retention.
4.  **Equipment:** Cleanliness, design, calibration (yearly), waste management.
5.  **Site:** No contaminants, Soil analysis (heavy metals) before planting.
6.  **Water:** Water analysis (heavy metals) before planting, appropriate method, no untreated wastewater.
7.  **Fertilizer:** Legal registration, appropriate use, manure management (composting), storage separation.
8.  **Seed & Propagation:** Quality, traceable source, non-adulterated.
9.  **Cultivation:** Safety control, IPM, legal organic substances only, sprayer maintenance/calibration.
10. **Harvesting:** Appropriate time/weather, sorting, soil prevention, clean equipment/hygiene.
11. **Processing:** Drying, Irradiation, Contamination Control.
12. **Facility:** Building design, Lighting, Water Quality, Hand washing.
13. **Packaging:** Labeling (Sci name, Batch, Date), Clean materials.
14. **Storage:** Clean, Dry, Pest-free.

---

## 2. Google Form Data Mapping

Based on the uploaded Google Form screenshots and text, we must add these specific fields to `Application.js`.
The system must support both **Individual** and **Juristic Person** (Corporate) applicants.

### A. Applicant Information (Merged)
| Google Form Field | Proposed Schema Field | Notes |
| :--- | :--- | :--- |
| **ประเภทผู้ขอ (Applicant Type)** | `applicantType: enum['individual', 'community_enterprise', 'juristic']` | |
| **ชื่อเจ้าของ / ชื่อบริษัท (Name)** | `applicantInfo.name: String` | Individual Name or Company Name. |
| **เลขบัตร ปชช / เลขนิติบุคคล (ID)** | `applicantInfo.registrationId: String` | ID Card or Tax ID. |
| **ที่อยู่ (Address)** | `applicantInfo.address: String` | |
| **โทรศัพท์ (Phone)** | `applicantInfo.phone: String` | Office phone (Juristic). |
| **มือถือ (Mobile)** | `applicantInfo.mobile: String` | Contact mobile. |
| **อีเมล (Email)** | `applicantInfo.email: String` | |
| **Line ID** | `applicantInfo.lineId: String` | |
| **ชื่อประธาน/กรรมการ (Director)** | `applicantInfo.representativeName: String` | Juristic only. |
| **ผู้ประสานงาน (Coordinator)** | `contactPerson: { name, mobile, lineId }` | If Power of Attorney used. |

### B. Application Details
| Google Form Field | Proposed Schema Field | Notes |
| :--- | :--- | :--- |
| **วัตถุประสงค์ (Purpose)** | `purpose: enum['research', 'commercial_domestic', 'commercial_export', 'other']` | |
| **ลักษณะพื้นที่ (Location Type)** | `farmInformation.locationType: enum['outdoor', 'indoor', 'greenhouse', 'other']` | |
| **ประเภทคำขอ (Request Type)** | `requestType: enum['new', 'renewal', 'replacement']` | |
| **ประเภทการรับรอง (Scope)** | `certificationScope: enum['cultivation', 'processing', 'both']` | |
| **ส่วนที่ใช้ (Part Used)** | `cropInformation.partUsed: [String]` | |
| **ชื่อสายพันธุ์ (Strain Name)** | `cropInformation.strainName: String` | |
| **แหล่งที่มา (Source)** | `cropInformation.sourceOrigin: String` | |
| **ปริมาณ (Quantity)** | `cropInformation.expectedQuantity: Number` | |

---

## 3. Document Requirements (The "25 Items")

The system must support uploading these specific document types. We will update the `DocumentReferenceSchema` enum.
*Items 11-13 are specific to Juristic Persons.*

1.  **Application Form** (`application_form`)
2.  **Land Title Deed** (`land_title_deed`)
3.  **Land Use Consent** (`land_use_consent`)
4.  **Map & Coordinates** (`location_map`)
5.  **Building Plan** (`building_plan`)
6.  **Exterior Photos** (`photos_exterior`)
7.  **Production Plan** (`production_plan`)
8.  **Security & Waste Plan** (`security_waste_plan`)
9.  **Interior Photos** (`photos_interior`)
10. **SOP (Standard Operating Procedures)** (`sop_manual`)
11. **Company Registration Cert** (`company_registration`) - *Juristic Only*
12. **Shareholder List** (`shareholder_list`) - *Juristic Only*
13. **Authorized Rep Letter** (`authorized_rep_letter`) - *Juristic Only*
14. **Power of Attorney** (`power_of_attorney`) - *If applicable*
15. **GACP Training Certificate** (`training_cert_gacp`)
16. **Strain Certificate** (`strain_cert`)
17. **Internal Training Records** (`training_records_internal`)
18. **Staff Test Results** (`staff_test_results`)
19. **Planting Material Test** (`test_planting_material`)
20. **Water Test** (`test_water`)
21. **Flower Test** (`test_flower`)
22. **Input Materials Report** (`input_materials_report`)
23. **CP/CCP Control Plan** (`control_plan_cp_ccp`)
24. **Scale Calibration** (`calibration_cert_scale`)
25. **Process Video** (`process_video_link`) - *URL*
26. **Additional Documents** (`other`)

---

## 4. Implementation Plan

1.  **Update `Application.js`**:
    *   Add `applicantInfo` with Juristic fields (representative, tax ID).
    *   Add `contactPerson` for coordinator details.
    *   Expand `DocumentReferenceSchema` enum to 26 types (25 + other).
2.  **Update `Farm.js`**:
    *   Ensure it can store the master data.
3.  **Validation Logic**:
    *   If `applicantType === 'juristic'`, require docs 11, 12, 13.
    *   If `applicantType === 'individual'`, hide/skip docs 11, 12, 13.
