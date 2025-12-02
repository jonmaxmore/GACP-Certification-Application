# Fertilizer Recommendation Engine - Research Summary

**วันที่:** 2025-10-28
**วัตถุประสงค์:** วิจัยและออกแบบระบบแนะนำปุ๋ยสำหรับกัญชาทางการแพทย์ที่ใช้งานได้จริง ตามมาตรฐาน GACP และเทียบเคียงซอฟต์แวร์ระดับสากล

---

## 1. มาตรฐาน GACP จาก DTAM (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)

### 1.1 กฎระเบียบหลัก

**หน่วยงานกำกับดูแล:**

- กรมแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM) กระทรวงสาธารณสุข
- มาตรฐาน GACP (Good Agricultural and Collection Practices) บังคับใช้กับกัญชาทางการแพทย์ทุกแปลง
- อ้างอิงจาก EU's Good Manufacturing Practice (GMP) guidelines

### 1.2 ข้อกำหนดเฉพาะเรื่องปุ๋ย

#### ✅ บังคับใช้ (MUST)

1. **ปุ๋ยที่ได้รับการจดทะเบียนเท่านั้น**
   - ต้องเป็นปุ๋ยที่จดทะเบียนถูกกฎหมายในประเทศไทย
   - มี ปอ.1 หรือเลขทะเบียนปุ๋ยที่ชัดเจน

2. **ห้ามใช้มูลมนุษย์**
   - ห้ามใช้ Human excretion เป็นแหล่งปุ๋ย

3. **ปุ๋ยอินทรีย์ต้องหมักสุก**
   - ต้องผ่านกระบวนการหมัก/ย่อยสลายสมบูรณ์
   - บันทึกแหล่งที่มาของวัตถุดิบ
   - บันทึกวิธีการผลิต

4. **การจัดเก็บแยกส่วน**
   - พื้นที่จัดเก็บ/ผสม/ขนส่งปุ๋ยต้องแยกจากพื้นที่ปลูก
   - แยกจากแหล่งน้ำเพื่อป้องกันการปนเปื้อน

5. **การฝึกอบรมพนักงาน**
   - พนักงานที่ใช้ปุ๋ยต้องผ่านการฝึกอบรม
   - ต้องสวมอุปกรณ์ป้องกันที่เหมาะสม

6. **การบันทึกข้อมูล (Seed-to-Sale)**
   - บันทึกการใช้ปุ๋ยทุกครั้ง (fertilizer logs)
   - บันทึกแหล่งที่มาของเมล็ดพันธุ์
   - บันทึกการจัดการศัตรูพืช
   - บันทึกวันเก็บเกี่ยว
   - บันทึกผลการตรวจสอบคุณภาพ

#### ⚠️ หลักการสำคัญ

- **ป้องกันการปนเปื้อน:** ต้องจัดการให้ดีเพื่อป้องกันการปนเปื้อนจากจุลินทรีย์ เคมี และสารแปลกปลอม
- **เป็นมิตรต่อสิ่งแว่งล้อม:** การใช้ปุ๋ยต้องไม่ทำลายสิ่งแว่งล้อม
- **ตรงตามความต้องการของพืช:** ใช้ปริมาณที่เหมาะสมกับการเจริญเติบโตของกัญชา

### 1.3 มาตรฐานเทียบเท่าที่ DTAM ยอมรับ

- ✅ Organic Thailand
- ✅ EU GMP
- ✅ GLOBAL GAP
- ✅ IFOAM (International Federation of Organic Agriculture Movements)
- ✅ GAP (Good Agricultural Practices)

---

## 2. แนวทางการให้ธาตุอาหารกัญชา (จากแหล่งวิชาการไทย)

### 2.1 ธาตุอาหารหลัก (Primary Macronutrients)

| ธาตุ       | สัญลักษณ์ | ความสำคัญ                           |
| ---------- | --------- | ----------------------------------- |
| ไนโตรเจน   | N         | ส่งเสริมการเจริญเติบโตของใบและลำต้น |
| ฟอสฟอรัส   | P         | ส่งเสริมรากและดอก พัฒนาพลังงาน      |
| โพแทสเซียม | K         | เสริมสร้างความแข็งแรง ต้านทานโรค    |

### 2.2 ธาตุอาหารรอง (Secondary Macronutrients)

- **แคลเซียม (Ca):** โครงสร้างผนังเซลล์
- **แมกนีเซียม (Mg):** คลอโรฟิลล์ สังเคราะห์แสง
- **กำมะถัน (S):** โปรตีน เอนไซม์

### 2.3 ธาตุอาหารเสริม (Micronutrients)

เหล็ก (Fe), สังกะสี (Zn), แมงกานีส (Mn), ทองแดง (Cu),�붕�붕 (B), โมลิบดีนัม (Mo)

### 2.4 อัตราส่วน NPK ตามระยะการเจริญเติบโต

#### 🌱 **ระยะ Vegetative (แตกกิ่งใบ)**

- **ความต้องการ:** ไนโตรเจน (N) สูง, ฟอสฟอรัส (P) ต่ำ, โพแทสเซียม (K) ปานกลาง
- **อัตราส่วนแนะนำ:** NPK 3-1-2 หรือ 20-10-20
- **เป้าหมาย:** ส่งเสริมการเจริญเติบโตของลำต้นและใบ

#### 🌸 **ระยะ Flowering (ออกดอก/สะสมอาหาร)**

- **ความต้องการ:** ไนโตรเจน (N) ต่ำ, ฟอสฟอรัส (P) สูง, โพแทสเซียม (K) สูง
- **อัตราส่วนแนะนำ:** NPK 1-3-2 หรือ 5-15-10
- **เป้าหมาย:** ส่งเสริมการออกดอกและคุณภาพของดอก

#### 🌿 **ระยะ Flush (ล้างปุ๋ยก่อนเก็บเกี่ยว)**

- **ความต้องการ:** ไม่ให้ปุ๋ย หรือให้น้ำเปล่า
- **ระยะเวลา:** 1-2 สัปดาห์ก่อนเก็บเกี่ยว
- **เป้าหมาย:** ลดสารเคมีตกค้างในผลผลิต

---

## 3. ซอฟต์แวร์คู่แข่งระดับสากล

### 3.1 Budscout (USA)

**จุดเด่น:**

- ✅ AI ตรวจจับความเครียดของพืชแบบ real-time
- ✅ แนะนำ CO2, อุณหภูมิใบ, VPD (Vapor Pressure Deficit)
- ✅ ทำนายช่วงเวลาเก็บเกี่ยว (Harvest forecasting)
- ✅ วิเคราะห์ข้อมูลย้อนหลัง (Historical data analysis)
- ✅ "Replay" การปลูกในอดีตเพื่อเข้าใจ strain dynamics

**เทคโนโลยี:**

- Sensor-based monitoring ผ่าน IoT
- AI-gleaned metrics
- Strain-specific insights

### 3.2 Agrify Insights (USA)

**จุดเด่น:**

- ✅ สร้าง "Recipes" สำหรับแต่ละ strain
- ✅ ปรับ microclimate, irrigation, light intensity อัตโนมัติ
- ✅ เชื่อมต่อกับ Metrc (compliance tracking) อัตโนมัติ
- ✅ Integration กับระบบ 3rd-party หลากหลาย

**Integrations:**

- Confident Cannabis (lab testing)
- Bard Manufacturing HVAC
- **AutoGrow fertigation system** ⭐ (ระบบให้น้ำและปุ๋ยอัตโนมัติ)
- Outlaw Technology OG Harvest System

### 3.3 Grownetics (USA)

**จุดเด่น:**

- ✅ Middleware ที่รวมหลายระบบเข้าด้วยกัน
- ✅ รายงานและคำแนะนำจาก sensor data
- ✅ เหมาะกับ commercial growers

### 3.4 Cannabud.ai (Newer Platform)

**จุดเด่น:**

- ✅ Proprietary AI models สำหรับกัญชาโดยเฉพาะ (ไม่ใช่ chatbot ธรรมดา)
- ✅ ครอบคลุม cultivation, compliance, task management

### 3.5 Trym (Cannabis ERP)

**จุดเด่น:**

- ✅ ติดตาม soil conditions, irrigation, fertilizers
- ✅ บันทึก pesticides, foliar sprays, labor hours
- ✅ Seed-to-sale tracking

---

## 4. วิธีการ Machine Learning สำหรับแนะนำปุ๋ย (Precision Agriculture)

### 4.1 อัลกอริทึมที่ใช้ในงานวิจัย

#### 🏆 **XGBoost** (แม่นยำที่สุด)

- **Precision:** 99.09% - 99.3%
- **AUC:** 1.0
- ✅ แนะนำสำหรับ Production

#### 🥈 **Random Forest**

- Ensemble learning
- ทนต่อ overfitting
- ✅ เหมาะกับข้อมูลที่มีหลาย features

#### 🥉 **Support Vector Regression (SVR)**

- เหมาะกับข้อมูลขนาดกลาง
- ทำงานดีกับ non-linear relationships

#### อื่นๆ

- Artificial Neural Networks (ANN)
- Gradient Boosting
- AdaBoost
- Extra Trees
- K-Nearest Neighbors (KNN)

### 4.2 Input Parameters (Features)

**ข้อมูลดิน:**

- NPK levels (ไนโตรเจน, ฟอสฟอรัส, โพแทสเซียม)
- Soil pH
- Organic matter (%)
- Soil texture
- Drainage capacity

**ข้อมูลสิ่งแว่งล้อม:**

- Temperature (°C)
- Humidity (%)
- Rainfall (mm)
- Sunlight hours

**ข้อมูลพืช:**

- Plant type / cultivar
- Growth stage
- Plant age (days)
- Current plant health

**ข้อมูลทำเล:**

- Region / Province
- Elevation
- Historical yield data

### 4.3 Output (Predictions)

1. **NPK Recommendation:**
   - Nitrogen amount (kg/rai)
   - Phosphorus amount (kg/rai)
   - Potassium amount (kg/rai)
   - NPK ratio (e.g., "20-10-20")

2. **Product Recommendation:**
   - Specific fertilizer products
   - Application rate
   - Application frequency
   - Application method

3. **Expected Outcomes:**
   - Expected yield increase (%)
   - Cost-benefit analysis
   - Environmental impact score

### 4.4 ข้อควรระวัง (จากงานวิจัย)

⚠️ **"Models with accurate yield prediction can still provide highly inaccurate input application recommendations"**

**สาเหตุ:**

- การเลือก algorithm ที่ไม่เหมาะสม
- การเลือก covariates (features) ไม่เหมาะสม
- Overfitting กับข้อมูลฝึก

**วิธีแก้:**

- ใช้หลาย models ร่วมกัน (ensemble)
- Validate กับข้อมูลจริงจากเกษตรกร
- อัปเดตโมเดลเมื่อมีข้อมูลใหม่
- ให้คำแนะนำพร้อม confidence score

---

## 5. การออกแบบระบบสำหรับ GACP Platform

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input Layer                          │
│  - Farm data (location, soil, IoT sensors)                  │
│  - Plant data (cultivar, growth stage, age)                 │
│  - Historical data (past fertilizer use, yields)            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Processing & Validation                    │
│  - Validate GACP compliance                                  │
│  - Normalize inputs                                          │
│  - Load regional & plant catalog data                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 ML Recommendation Engine                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   XGBoost    │  │Random Forest │  │  Rule-Based  │      │
│  │   Model      │  │    Model     │  │   Expert     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                  ↓                  ↓              │
│              Ensemble Weighted Average                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Product Matching & GACP Filter                  │
│  - Match NPK needs to GACP-approved products                │
│  - Filter by organic/conventional preference                │
│  - Calculate costs from FertilizerProduct database          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Output Recommendations                     │
│  - NPK amounts with confidence scores                       │
│  - Product recommendations (GACP-compliant)                 │
│  - Application schedule                                     │
│  - Cost estimates                                           │
│  - Expected outcomes                                        │
│  - Audit logs for compliance                                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Features ที่ต้องมี

#### 🎯 **GACP Compliance First**

1. แนะนำเฉพาะปุ๋ยที่จดทะเบียนในไทย
2. บันทึก audit trail ทุกครั้งที่ใช้ปุ๋ย
3. แยกประเภท organic/conventional ชัดเจน
4. ตรวจสอบ THC compliance (กัญชง < 0.2% THC)

#### 🤖 **AI-Powered Recommendations**

1. ใช้ ML models (XGBoost + Random Forest)
2. Rule-based system สำหรับความปลอดภัย
3. Ensemble approach เพื่อความแม่นยำ
4. Confidence scores แสดงระดับความเชื่อมั่น

#### 📊 **Data-Driven Insights**

1. เรียนรู้จาก HistoricalYield database
2. ปรับแต่งตาม Regional Conditions
3. เฉพาะเจาะจงตาม Cultivar
4. อัปเดตจากผลลัพธ์จริงของเกษตรกร

#### 💰 **Cost Optimization**

1. เปรียบเทียบราคาปุ๋ยหลายแบรนด์
2. คำนวณ ROI (Return on Investment)
3. แนะนำทางเลือกที่ประหยัดแต่มีประสิทธิภาพ

#### 🌍 **Sustainable & Environmental**

1. ลดการใช้ปุ๋ยเกินความจำเป็น
2. ป้องกันการปนเปื้อนแหล่งน้ำ
3. ส่งเสริม organic options

### 5.3 Recommendation Algorithm Flow

```javascript
// Pseudo-code
function recommendFertilizer(farmData, cultivationCycle) {
  // 1. Validate & Normalize
  const normalizedData = normalizeInputs(farmData);

  // 2. Determine Growth Stage
  const growthStage = getCurrentGrowthStage(cultivationCycle);

  // 3. Get Base NPK Ratio for Stage
  let baseNPK;
  if (growthStage === 'vegetative') {
    baseNPK = { N: 3, P: 1, K: 2 }; // High N
  } else if (growthStage === 'flowering') {
    baseNPK = { N: 1, P: 3, K: 2 }; // High P, High K
  }

  // 4. Adjust based on Soil Test (if available)
  if (farmData.soilTest) {
    baseNPK = adjustForSoilDeficiencies(baseNPK, farmData.soilTest);
  }

  // 5. ML Prediction (XGBoost)
  const mlPrediction = await xgboostModel.predict({
    region: farmData.region,
    soilPH: farmData.soilPH,
    temperature: farmData.avgTemp,
    humidity: farmData.avgHumidity,
    cultivar: cultivationCycle.cultivar,
    plantAge: cultivationCycle.age,
    historicalYields: getHistoricalData(farmData.region)
  });

  // 6. Ensemble: Combine Rule-based + ML
  const finalNPK = ensembleRecommendation(baseNPK, mlPrediction);

  // 7. Match to GACP Products
  const products = await FertilizerProduct.find({
    gacpApproved: true,
    npkRatio: matchesRatio(finalNPK),
    availableInRegion: farmData.region
  }).sort({ price: 1 });

  // 8. Calculate Application Schedule
  const schedule = generateApplicationSchedule({
    npk: finalNPK,
    growthStage,
    farmSize: farmData.size,
    products
  });

  // 9. Return Recommendation
  return {
    npkRecommendation: finalNPK,
    confidence: mlPrediction.confidence,
    products: products.slice(0, 3), // Top 3
    schedule,
    estimatedCost: calculateCost(schedule, products[0]),
    expectedYield: predictYield(finalNPK, farmData),
    gacpCompliant: true,
    auditLog: createAuditLog(...)
  };
}
```

---

## 6. Database Schema Requirements

### 6.1 FertilizerProduct Model

```javascript
{
  productId: String,
  productName: String,
  productNameThai: String,
  manufacturer: String,

  // Registration
  registrationNumber: String, // เลข ปอ.1
  gacpApproved: Boolean,
  organicCertified: Boolean,
  certifications: [String], // ["Organic Thailand", "IFOAM"]

  // NPK Content
  npkRatio: String, // "20-10-20"
  nitrogen: Number, // %
  phosphorus: Number, // %
  potassium: Number, // %
  secondaryNutrients: {
    calcium: Number,
    magnesium: Number,
    sulfur: Number
  },
  micronutrients: [{
    name: String,
    percentage: Number
  }],

  // Pricing
  price: {
    amount: Number,
    unit: String, // "per kg", "per liter"
    currency: String // "THB"
  },

  // Availability
  availableRegions: [String],
  suppliers: [{
    name: String,
    contact: String,
    location: String
  }],

  // Usage
  recommendedFor: {
    plants: [String], // ["cannabis", "turmeric"]
    growthStages: [String],
    soilTypes: [String]
  },
  applicationMethod: String,
  applicationRate: String,

  // Safety
  safetyWarnings: [String],
  preharvest_interval: Number, // days

  status: String, // "active", "discontinued"
}
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 4)

- ✅ สร้าง FertilizerProduct model
- ✅ Seed ข้อมูลปุ๋ยที่ได้รับการจดทะเบียนในไทย (10-20 products)
- ✅ สร้าง Rule-based recommendation engine

### Phase 2: ML Integration (Week 5)

- ✅ เตรียมข้อมูลฝึกจาก HistoricalYield
- ✅ Train XGBoost model
- ✅ Train Random Forest model
- ✅ สร้าง ensemble system

### Phase 3: API & Testing (Week 5-6)

- ✅ สร้าง REST API endpoints
- ✅ Integration tests กับ Farm & CultivationCycle
- ✅ Validate GACP compliance
- ✅ User acceptance testing

### Phase 4: Optimization (Week 6)

- ✅ Performance optimization
- ✅ Cost optimization algorithms
- ✅ Regional tuning
- ✅ Documentation

---

## 8. Success Metrics

### Technical Metrics

- ✅ **Accuracy:** >90% ของคำแนะนำต้องให้ผลลัพธ์ที่ดีกับเกษตรกร
- ✅ **GACP Compliance:** 100% ของคำแนะนำต้องผ่านมาตรฐาน GACP
- ✅ **Response Time:** < 2 วินาที สำหรับการคำนวณ
- ✅ **Model Confidence:** แสดง confidence score ทุกครั้ง

### Business Metrics

- ✅ **Cost Savings:** ลดต้นทุนปุ๋ย 15-30%
- ✅ **Yield Improvement:** เพิ่มผลผลิต 10-25%
- ✅ **User Adoption:** 70%+ ของ farms ใช้ feature นี้
- ✅ **Audit Compliance:** 100% ผ่านการ audit GACP

---

## 9. References

### งานวิจัย

1. "Machine learning based recommendation of agricultural and horticultural crop farming in India under the regime of NPK" - ScienceDirect
2. "Can machine learning models provide accurate fertilizer recommendations?" - Precision Agriculture Journal
3. "Data-Driven Analysis and Machine Learning-Based Crop and Fertilizer Recommendation System" - MDPI Agriculture

### มาตรฐาน

1. DTAM GACP Guidelines - https://www.dtam.moph.go.th/
2. SGS Thailand GACP Standards - https://www.sgs.com/th-th
3. GACP Thailand Official - https://gacp.in.th/

### Software Competitors

1. Budscout - Real-time plant stress detection
2. Agrify Insights - AutoGrow fertigation integration
3. Grownetics - Multi-system middleware
4. Cannabud.ai - Proprietary cannabis AI

---

## 10. Next Steps

1. ✅ สร้าง FertilizerProduct model
2. ✅ Implement rule-based recommendation engine
3. ✅ Seed ข้อมูลปุ๋ยตัวอย่าง
4. ⏳ Train ML models (รอข้อมูล HistoricalYield)
5. ⏳ Create API endpoints
6. ⏳ Integration testing

---

**บันทึกโดย:** Claude (AI Assistant)
**อ้างอิง:** DTAM, Academic Research, Industry Leaders
**สถานะ:** Ready for Implementation
