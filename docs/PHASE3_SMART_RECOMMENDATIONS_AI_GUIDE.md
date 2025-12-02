# Phase 3: Smart Recommendations & AI - Complete Implementation Guide

**GACP Platform - Botanical Audit Framework**
**Phase**: 3 - Smart Recommendations & AI
**Status**: Implementation Guide
**Timeline**: 3 months (12 weeks)
**Budget**: 2,000,000 - 3,000,000 THB
**Team**: 5-6 people (2 Backend + 1 AI/ML + 1 Data Scientist + 1 Agricultural Expert + 1 QA)

**Prerequisites**: Phase 1 & Phase 2 must be 100% complete ✅

---

## Table of Contents

1. [Overview](#overview)
   - Platform Mission & Primary Focus
   - Cannabis as Default Crop
   - Secondary Economic Crops
2. [GACP Compliance & Legal Framework](#gacp-compliance--legal-framework)
   - Thai Cannabis Regulations
   - Standard Operating Procedures (SOP)
   - Automated Compliance Support
3. [Fertilizer Recommendation Engine](#fertilizer-recommendation-engine)
4. [Water Management & Irrigation AI](#water-management--irrigation-ai)
5. [AI Assistant Enhancement](#ai-assistant-enhancement)
6. [Machine Learning Models](#machine-learning-models)
7. [Predictive Analytics](#predictive-analytics)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)

---

## Overview

### Platform Mission & Primary Focus

🌿 **Primary Mission**: The GACP Platform is designed to bring **cannabis producers into the legal, regulated system** under Thailand's medicinal cannabis framework. Our platform ensures that cannabis cultivation meets the strict standards set by the **Department of Thai Traditional and Alternative Medicine (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)**.

#### Primary Crop: Cannabis (กัญชา) 🎯

**Cannabis is the DEFAULT and PRIMARY focus** of this platform:

- **Legal Compliance**: Full GACP (Good Agricultural and Collection Practices) compliance
- **Standard Operating Procedures**: Following official SOP from Thai government
- **Quality Assurance**: Meeting pharmaceutical-grade requirements
- **Traceability**: Complete audit trail from seed to harvest
- **Documentation**: Comprehensive record-keeping for legal submissions

#### Secondary Economic Crops (Optional) 💰

The platform also supports **5 additional Thai medicinal plants** as economic alternatives for farmers to diversify income:

1. **ขมิ้นชัน (Turmeric)** - Export-quality rhizome crop
2. **ขิง (Ginger)** - High-value medicinal rhizome
3. **กระชายดำ (Black Galingale)** - Premium Thai herb
4. **ไพล (Plai)** - Traditional medicinal plant
5. **กระท่อม (Kratom)** - Controlled perennial crop

⚠️ **Important**: These 5 crops are **secondary options** to help farmers generate additional national income. They are NOT the primary focus of Phase 3 development. Future phases may expand support for these crops, but **cannabis remains the core mission**.

---

### Purpose

Phase 3 adds **intelligence and automation** to the GACP Platform, transforming it from a monitoring system into a **smart agricultural advisor for legal cannabis production**. This phase uses AI/ML to provide personalized recommendations, optimize resource usage, ensure GACP compliance, and predict outcomes - **primarily for cannabis cultivation** while maintaining optional support for secondary economic crops.

### Business Value (Cannabis-Focused)

**Primary Value for Cannabis Producers**:

- **Legal Compliance**: 100% GACP adherence with automated documentation
- **Quality Assurance**: Pharmaceutical-grade cannabis production
- **Cost Reduction**: Optimize fertilizer/water usage (save 20-40%)
- **Yield Improvement**: Data-driven decisions (increase 15-30%)
- **Traceability**: Complete audit trail for government submissions
- **Time Savings**: Automated recommendations (save 10+ hours/week)

**Secondary Value for Economic Crop Farmers**:

- **Knowledge Transfer**: AI assistant educates about cultivation best practices
- **Predictive Insights**: Prevent problems before they occur
- **Resource Optimization**: Efficient use of inputs across multiple crops
- **Market Access**: Meeting export standards for Thai medicinal plants

### Key Objectives

1. **Fertilizer Recommendation Engine** (Weeks 1-4)
   - Rule-based expert system
   - NPK optimization algorithms
   - Cost-effective fertilizer suggestions
   - Thai agricultural best practices

2. **Water Management AI** (Weeks 5-8)
   - Smart irrigation scheduling
   - Water usage optimization
   - Weather integration
   - Evapotranspiration calculations

3. **AI Assistant Enhancement** (Weeks 9-12)
   - Natural Language Processing (Thai)
   - Context-aware conversations
   - Agricultural knowledge base
   - Multi-modal responses

4. **Machine Learning Models** (Throughout)
   - Yield prediction model
   - Disease detection (future)
   - Optimal harvest timing
   - Resource optimization

### Success Criteria

**Cannabis Production (Primary)**:

- ✅ 100% GACP compliance for all cannabis farms
- ✅ 90%+ recommendation accuracy for cannabis cultivation
- ✅ Complete audit trail documentation for legal submissions
- ✅ Pharmaceutical-grade quality metrics tracking
- ✅ 80%+ cannabis farmer satisfaction

**System Performance**:

- ✅ Respond to Thai queries in <2 seconds
- ✅ Reduce fertilizer costs by 20%+ (cannabis)
- ✅ Reduce water usage by 25%+ (cannabis)
- ✅ Handle 1000+ queries/day

**Secondary Crops (Optional)**:

- ✅ Basic recommendations for 5 economic crops
- ✅ 70%+ accuracy for secondary crop advice

---

## GACP Compliance & Legal Framework

### What is GACP?

**GACP** (Good Agricultural and Collection Practices for Medicinal Plants) is the Thai government standard established by the **Department of Thai Traditional and Alternative Medicine** (กรมแพทย์แผนไทยและการแพทย์ทางเลือก) to ensure:

- **Quality**: Pharmaceutical-grade medicinal plant production
- **Safety**: Free from contaminants, heavy metals, pesticides
- **Traceability**: Complete documentation from seed to harvest
- **Sustainability**: Environmentally responsible cultivation
- **Legal Compliance**: Meeting all regulatory requirements

### Cannabis Legal Framework in Thailand

#### Regulatory Authority

**Department of Thai Traditional and Alternative Medicine (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)**

- Issues GACP certification
- Defines Standard Operating Procedures (SOP)
- Conducts farm inspections and audits
- Approves production licenses

#### GACP Requirements for Cannabis

1. **Farm Registration**
   - Legal land ownership or lease
   - Location approval from local authorities
   - GPS coordinates registration
   - Farm layout and facility plans

2. **Cultivation Standards**
   - Approved cannabis varieties only
   - Organic or approved input materials
   - Water quality standards
   - Soil testing and monitoring

3. **Record Keeping** (Critical for Platform)
   - Daily cultivation logs
   - Input usage records (fertilizers, pesticides)
   - Environmental monitoring data
   - Harvest and yield documentation
   - Worker training records

4. **Quality Control**
   - Regular soil and water testing
   - Plant health monitoring
   - Pest and disease management
   - Post-harvest quality testing

5. **Traceability**
   - Seed/clone source documentation
   - Batch numbering system
   - Chain of custody records
   - Storage and transport logs

### Platform's GACP Support

Our AI recommendation system is designed to **automatically ensure GACP compliance** by:

#### 1. Automated Documentation

```javascript
// All recommendations include GACP compliance notes
{
  recommendation: "Apply NPK 15-15-15 at 50kg/rai",
  gacpCompliance: {
    standard: "GACP-TH-2024",
    approvedProduct: true,
    maxAllowedDose: "60kg/rai",
    recordingRequired: true,
    documentationFields: [
      "applicationDate",
      "productBatch",
      "applicatorName",
      "weatherConditions",
      "soilMoisture"
    ]
  }
}
```

#### 2. Input Validation

- Only recommends **approved fertilizers and pesticides**
- Enforces maximum application rates
- Warns about restricted substances
- Tracks pre-harvest intervals (PHI)

#### 3. Audit Trail Generation

- Every action logged with timestamp
- User identification for accountability
- GPS location for field activities
- Photo documentation support

#### 4. SOP Enforcement

- Step-by-step cultivation guides
- Critical control point (CCP) alerts
- Deviation warnings
- Corrective action suggestions

#### 5. Compliance Reporting

- Generate GACP audit reports
- Export data for government submissions
- Certificate renewal reminders
- Non-compliance alerts

### Standard Operating Procedures (SOP)

The platform enforces official Thai GACP SOPs for cannabis:

#### SOP-01: Land Preparation

- Soil testing requirements
- Approved amendments
- pH adjustment procedures
- Drainage standards

#### SOP-02: Planting

- Clone/seed source verification
- Planting density standards
- Spacing requirements
- Record keeping at planting

#### SOP-03: Vegetative Stage Management

- Nutrient application schedule
- Watering requirements
- Pruning and training techniques
- Pest monitoring protocols

#### SOP-04: Flowering Stage Management

- Light cycle management (outdoor considerations)
- Bloom nutrient specifications
- Environmental controls
- Quality indicators

#### SOP-05: Harvest & Post-Harvest

- Maturity indicators
- Harvest timing
- Drying conditions (temp, humidity, duration)
- Storage requirements
- Testing protocols

#### SOP-06: Quality Assurance

- Cannabinoid testing requirements
- Heavy metal limits
- Microbial contamination tests
- Pesticide residue tests

### Compliance Monitoring

The platform provides **real-time compliance status**:

```javascript
{
  farmId: "FARM-001",
  gacpCertified: true,
  certificationExpiry: "2025-12-31",
  complianceScore: 95, // Out of 100

  recentViolations: [],

  upcomingRequirements: [
    {
      type: "soilTest",
      dueDate: "2025-11-15",
      priority: "high",
      description: "Annual soil testing required"
    },
    {
      type: "staffTraining",
      dueDate: "2025-12-01",
      priority: "medium",
      description: "Worker safety training renewal"
    }
  ],

  documentationStatus: {
    dailyLogs: "complete",
    inputRecords: "complete",
    harvestLogs: "pending",
    qualityTests: "complete"
  }
}
```

### Legal Compliance Benefits

By using this platform, cannabis producers gain:

1. **Simplified Compliance**: Automated record-keeping reduces paperwork
2. **Reduced Risk**: Real-time alerts prevent violations
3. **Faster Certification**: Complete documentation ready for audits
4. **Market Access**: GACP certification required for legal sales
5. **Quality Premiums**: Certified cannabis commands higher prices
6. **Legal Protection**: Complete audit trail for regulatory defense

---

## Fertilizer Recommendation Engine

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Fertilizer Recommendation Engine          │
└─────────────────────────────────────────────────────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
    │  Soil Data  │  │  Crop Type  │  │ Growth Stage │
    │  Analyzer   │  │  Profile    │  │  Detector    │
    └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
           │                │                │
           └────────────────┼────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  Rule Engine    │
                   │  (Expert System)│
                   └────────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
    │ NPK Balance │  │   Product   │  │  Application │
    │ Calculator  │  │  Matcher    │  │   Schedule   │
    └─────────────┘  └─────────────┘  └──────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Recommendations │
                   └─────────────────┘
```

### Soil Data Analyzer

**File**: `apps/backend/modules/ai-recommendations/domain/services/SoilDataAnalyzer.js`

```javascript
const { logger } = require('../../../../shared/utils/logger');

class SoilDataAnalyzer {
  /**
   * Analyze soil data and determine deficiencies
   * @param {Object} soilData - Current soil parameters
   * @param {Object} cropRequirements - Crop-specific requirements
   * @returns {Object} Analysis results with deficiencies
   */
  analyze(soilData, cropRequirements) {
    const analysis = {
      ph: this.analyzePH(soilData.ph, cropRequirements.ph),
      npk: this.analyzeNPK(soilData.npk, cropRequirements.npk),
      micronutrients: this.analyzeMicronutrients(
        soilData.micronutrients,
        cropRequirements.micronutrients
      ),
      organicMatter: this.analyzeOrganicMatter(soilData.organicMatter),
      overallHealth: 'good', // Will be calculated
      score: 0 // 0-100
    };

    // Calculate overall health score
    analysis.score = this.calculateHealthScore(analysis);
    analysis.overallHealth = this.getHealthStatus(analysis.score);

    return analysis;
  }

  /**
   * Analyze pH levels
   */
  analyzePH(currentPH, optimalRange) {
    if (!currentPH) {
      return {
        status: 'unknown',
        message: 'ไม่มีข้อมูลค่า pH',
        action: 'required'
      };
    }

    const { min, max, ideal } = optimalRange;

    if (currentPH < min - 0.5) {
      return {
        status: 'critical',
        issue: 'very_acidic',
        currentValue: currentPH,
        targetValue: ideal,
        difference: ideal - currentPH,
        message: `ดินเป็นกรดจัด (pH ${currentPH})`,
        severity: 'high',
        impact: 'ธาตุอาหารหลายชนิดดูดซึมได้ยาก โดยเฉพาะ N, P, K, Ca, Mg',
        action: 'urgent'
      };
    }

    if (currentPH < min) {
      return {
        status: 'warning',
        issue: 'acidic',
        currentValue: currentPH,
        targetValue: ideal,
        difference: ideal - currentPH,
        message: `ดินเป็นกรดเล็กน้อย (pH ${currentPH})`,
        severity: 'medium',
        impact: 'การดูดซึมธาตุอาหารลดลง 20-30%',
        action: 'recommended'
      };
    }

    if (currentPH > max + 0.5) {
      return {
        status: 'critical',
        issue: 'very_alkaline',
        currentValue: currentPH,
        targetValue: ideal,
        difference: currentPH - ideal,
        message: `ดินเป็นด่างจัด (pH ${currentPH})`,
        severity: 'high',
        impact: 'เหล็ก แมงกานีส สังกะสี ดูดซึมได้ยากมาก',
        action: 'urgent'
      };
    }

    if (currentPH > max) {
      return {
        status: 'warning',
        issue: 'alkaline',
        currentValue: currentPH,
        targetValue: ideal,
        difference: currentPH - ideal,
        message: `ดินเป็นด่างเล็กน้อย (pH ${currentPH})`,
        severity: 'medium',
        impact: 'ธาตุรองบางชนิดดูดซึมได้ยาก',
        action: 'recommended'
      };
    }

    return {
      status: 'good',
      issue: null,
      currentValue: currentPH,
      targetValue: ideal,
      message: `ค่า pH เหมาะสม (${currentPH})`,
      action: 'maintain'
    };
  }

  /**
   * Analyze NPK levels
   */
  analyzeNPK(currentNPK, optimalNPK) {
    const analysis = {
      nitrogen: this.analyzeNutrient('nitrogen', 'N', currentNPK.nitrogen, optimalNPK.nitrogen, {
        symptoms: {
          deficient: ['ใบเหลือง', 'เจริญเติบโตช้า', 'ลำต้นเล็ก'],
          excessive: ['ใบเขียวเข้มผิดปกติ', 'ลำต้นอ่อนแอ', 'โรคมากขึ้น']
        },
        functions: 'สร้างโปรตีน คลอโรฟิลล์ ส่งเสริมการเจริญเติบโต',
        criticalStages: ['vegetative', 'early_flowering']
      }),

      phosphorus: this.analyzeNutrient(
        'phosphorus',
        'P',
        currentNPK.phosphorus,
        optimalNPK.phosphorus,
        {
          symptoms: {
            deficient: ['ใบมืด', 'ระบบรากไม่แข็งแรง', 'ออกดอกช้า'],
            excessive: ['ขัดขวางการดูดซึมสังกะสีและเหล็ก']
          },
          functions: 'พัฒนาราก ส่งเสริมการออกดอกและติดผล สะสมพลังงาน',
          criticalStages: ['seedling', 'flowering', 'fruiting']
        }
      ),

      potassium: this.analyzeNutrient(
        'potassium',
        'K',
        currentNPK.potassium,
        optimalNPK.potassium,
        {
          symptoms: {
            deficient: ['ขอบใบไหม้', 'ต้านทานโรคต่ำ', 'คุณภาพผลผลิตต่ำ'],
            excessive: ['ขัดขวางการดูดซึมแคลเซียมและแมกนีเซียม']
          },
          functions: 'คุณภาพผลผลิต ภูมิคุ้มกัน การสังเคราะห์แสง',
          criticalStages: ['flowering', 'fruiting', 'ripening']
        }
      )
    };

    // Calculate NPK ratio
    const total =
      (currentNPK.nitrogen || 0) + (currentNPK.phosphorus || 0) + (currentNPK.potassium || 0);
    if (total > 0) {
      analysis.ratio = {
        n: Math.round((currentNPK.nitrogen / total) * 100),
        p: Math.round((currentNPK.phosphorus / total) * 100),
        k: Math.round((currentNPK.potassium / total) * 100)
      };
    }

    // Overall NPK balance
    const deficiencies = [analysis.nitrogen, analysis.phosphorus, analysis.potassium].filter(
      n => n.status === 'deficient' || n.status === 'very_deficient'
    );

    analysis.balanceStatus = deficiencies.length === 0 ? 'balanced' : 'imbalanced';
    analysis.deficiencyCount = deficiencies.length;

    return analysis;
  }

  /**
   * Analyze individual nutrient
   */
  analyzeNutrient(name, symbol, currentValue, optimal, metadata) {
    if (!currentValue && currentValue !== 0) {
      return {
        nutrient: name,
        symbol,
        status: 'unknown',
        message: `ไม่มีข้อมูล${symbol}`,
        action: 'test_required',
        metadata
      };
    }

    const { min, max, ideal } = optimal;
    const percentOfIdeal = (currentValue / ideal) * 100;

    // Very deficient (< 50% of minimum)
    if (currentValue < min * 0.5) {
      return {
        nutrient: name,
        symbol,
        status: 'very_deficient',
        currentValue,
        targetValue: ideal,
        percentOfIdeal: Math.round(percentOfIdeal),
        deficiency: ideal - currentValue,
        message: `${symbol} ขาดรุนแรง (${currentValue} ppm, ควรอยู่ที่ ${ideal} ppm)`,
        severity: 'critical',
        priority: 1,
        symptoms: metadata.symptoms.deficient,
        impact: `ผลผลิตลดลง 40-60%, ${metadata.functions}ไม่เพียงพอ`,
        action: 'urgent',
        metadata
      };
    }

    // Deficient (< minimum)
    if (currentValue < min) {
      return {
        nutrient: name,
        symbol,
        status: 'deficient',
        currentValue,
        targetValue: ideal,
        percentOfIdeal: Math.round(percentOfIdeal),
        deficiency: ideal - currentValue,
        message: `${symbol} ต่ำกว่าเกณฑ์ (${currentValue} ppm, ควรอยู่ที่ ${ideal} ppm)`,
        severity: 'high',
        priority: 2,
        symptoms: metadata.symptoms.deficient,
        impact: `ผลผลิตลดลง 20-40%, ${metadata.functions}จำกัด`,
        action: 'recommended',
        metadata
      };
    }

    // Slightly low (< ideal)
    if (currentValue < ideal) {
      return {
        nutrient: name,
        symbol,
        status: 'low',
        currentValue,
        targetValue: ideal,
        percentOfIdeal: Math.round(percentOfIdeal),
        deficiency: ideal - currentValue,
        message: `${symbol} ต่ำกว่าค่าที่เหมาะสม (${currentValue} ppm, ควรอยู่ที่ ${ideal} ppm)`,
        severity: 'medium',
        priority: 3,
        impact: `ผลผลิตอาจลดลง 10-20%`,
        action: 'optional',
        metadata
      };
    }

    // Excessive (> maximum * 1.5)
    if (currentValue > max * 1.5) {
      return {
        nutrient: name,
        symbol,
        status: 'excessive',
        currentValue,
        targetValue: ideal,
        percentOfIdeal: Math.round(percentOfIdeal),
        excess: currentValue - ideal,
        message: `${symbol} สูงเกินไป (${currentValue} ppm, ควรอยู่ที่ ${ideal} ppm)`,
        severity: 'high',
        priority: 2,
        symptoms: metadata.symptoms.excessive,
        impact: 'อาจเกิดความเป็นพิษ เสียเงินซื้อปุ๋ยโดยเปล่าประโยชน์',
        action: 'reduce',
        metadata
      };
    }

    // Slightly high (> maximum)
    if (currentValue > max) {
      return {
        nutrient: name,
        symbol,
        status: 'high',
        currentValue,
        targetValue: ideal,
        percentOfIdeal: Math.round(percentOfIdeal),
        excess: currentValue - ideal,
        message: `${symbol} สูงกว่าค่าที่เหมาะสม (${currentValue} ppm)`,
        severity: 'low',
        priority: 4,
        impact: 'สิ้นเปลืองปุ๋ย อาจขัดขวางการดูดซึมธาตุอื่น',
        action: 'reduce',
        metadata
      };
    }

    // Optimal
    return {
      nutrient: name,
      symbol,
      status: 'optimal',
      currentValue,
      targetValue: ideal,
      percentOfIdeal: Math.round(percentOfIdeal),
      message: `${symbol} อยู่ในเกณฑ์ที่เหมาะสม (${currentValue} ppm)`,
      severity: 'none',
      priority: 5,
      action: 'maintain',
      metadata
    };
  }

  /**
   * Analyze micronutrients
   */
  analyzeMicronutrients(current, optimal) {
    if (!current || !optimal) {
      return {
        status: 'unknown',
        message: 'ไม่มีข้อมูลธาตุรอง',
        nutrients: []
      };
    }

    const micronutrients = ['iron', 'zinc', 'manganese', 'copper', 'boron', 'molybdenum'];
    const analysis = {};
    const deficiencies = [];

    micronutrients.forEach(nutrient => {
      if (current[nutrient] && optimal[nutrient]) {
        const status = this.getMicronutrientStatus(current[nutrient], optimal[nutrient]);
        analysis[nutrient] = status;

        if (status.deficient) {
          deficiencies.push(nutrient);
        }
      }
    });

    return {
      status: deficiencies.length === 0 ? 'adequate' : 'deficient',
      deficiencies,
      details: analysis,
      message:
        deficiencies.length === 0 ? 'ธาตุรองครบถ้วน' : `ธาตุรองขาด: ${deficiencies.join(', ')}`
    };
  }

  getMicronutrientStatus(current, optimal) {
    const { min, max } = optimal;

    if (current < min) {
      return {
        deficient: true,
        status: 'low',
        currentValue: current,
        targetValue: min,
        action: 'supplement'
      };
    }

    if (current > max) {
      return {
        deficient: false,
        status: 'high',
        currentValue: current,
        targetValue: max,
        action: 'reduce'
      };
    }

    return {
      deficient: false,
      status: 'adequate',
      currentValue: current,
      action: 'maintain'
    };
  }

  /**
   * Analyze organic matter
   */
  analyzeOrganicMatter(percentage) {
    if (!percentage && percentage !== 0) {
      return {
        status: 'unknown',
        message: 'ไม่มีข้อมูลอินทรียวัตถุ',
        action: 'test_required'
      };
    }

    if (percentage < 2) {
      return {
        status: 'very_low',
        percentage,
        targetRange: '4-6%',
        message: `อินทรียวัตถุต่ำมาก (${percentage}%)`,
        severity: 'high',
        impact: [
          'ดินแห้ง เก็บน้ำได้น้อย',
          'โครงสร้างดินไม่ดี',
          'จุลินทรีย์มีชีวิตต่ำ',
          'CEC ต่ำ เก็บธาตุอาหารไม่ได้'
        ],
        benefits: [
          'ช่วยเก็บน้ำได้ดีขึ้น 30-40%',
          'เพิ่มความอุดมสมบูรณ์',
          'ปรับปรุงโครงสร้างดิน',
          'เพิ่มจุลินทรีย์ที่เป็นประโยชน์'
        ],
        action: 'urgent'
      };
    }

    if (percentage < 3) {
      return {
        status: 'low',
        percentage,
        targetRange: '4-6%',
        message: `อินทรียวัตถุต่ำ (${percentage}%)`,
        severity: 'medium',
        impact: ['โครงสร้างดินพอใช้', 'เก็บน้ำได้ปานกลาง'],
        action: 'recommended'
      };
    }

    if (percentage > 8) {
      return {
        status: 'high',
        percentage,
        targetRange: '4-6%',
        message: `อินทรียวัตถุสูง (${percentage}%)`,
        severity: 'low',
        impact: ['อาจเกิด N immobilization', 'ดินอาจเป็นกรด'],
        action: 'monitor'
      };
    }

    return {
      status: 'optimal',
      percentage,
      targetRange: '4-6%',
      message: `อินทรียวัตถุเหมาะสม (${percentage}%)`,
      action: 'maintain'
    };
  }

  /**
   * Calculate overall soil health score (0-100)
   */
  calculateHealthScore(analysis) {
    let score = 100;

    // pH (20 points)
    if (analysis.ph.status === 'critical') score -= 20;
    else if (analysis.ph.status === 'warning') score -= 10;
    else if (analysis.ph.status === 'good') score -= 0;

    // NPK (40 points total)
    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
      const n = analysis.npk[nutrient];
      if (n.status === 'very_deficient' || n.status === 'excessive') score -= 15;
      else if (n.status === 'deficient' || n.status === 'high') score -= 8;
      else if (n.status === 'low') score -= 4;
    });

    // Organic Matter (20 points)
    const om = analysis.organicMatter;
    if (om.status === 'very_low') score -= 20;
    else if (om.status === 'low') score -= 10;
    else if (om.status === 'high') score -= 5;

    // Micronutrients (20 points)
    if (analysis.micronutrients.status === 'deficient') {
      score -= analysis.micronutrients.deficiencies.length * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get health status from score
   */
  getHealthStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}

module.exports = SoilDataAnalyzer;
```

### Crop Profile Database

**File**: `apps/backend/modules/ai-recommendations/data/crop-profiles.js`

```javascript
/**
 * Cannabis (Hemp/Medical) Growing Requirements
 * 🎯 PRIMARY CROP - GACP Compliant
 * Based on Thai DOA research, GACP standards, and international best practices
 * Legal Framework: Department of Thai Traditional and Alternative Medicine
 */
const CANNABIS_PROFILE = {
  cropName: 'Cannabis',
  scientificName: 'Cannabis sativa L.',
  thaiName: 'กัญชา',
  isPrimaryCrop: true, // Default crop for the platform
  gacpCompliant: true,
  regulatoryBody: 'กรมแพทย์แผนไทยและการแพทย์ทางเลือก',

  // Growth stages with durations
  growthStages: [
    {
      stage: 'germination',
      duration: { days: 3 - 10 },
      thaiName: 'งอก',
      description: 'เมล็ดงอกและแตกรากแรก'
    },
    {
      stage: 'seedling',
      duration: { weeks: 2 - 3 },
      thaiName: 'ต้นกล้า',
      description: 'ใบแท้เริ่มออก 2-6 ใบ'
    },
    {
      stage: 'vegetative',
      duration: { weeks: 4 - 8 },
      thaiName: 'เจริญเติบโต',
      description: 'ลำต้นและใบเจริญเติบโตเต็มที่'
    },
    {
      stage: 'pre_flowering',
      duration: { weeks: 1 - 2 },
      thaiName: 'ก่อนออกดอก',
      description: 'เริ่มเห็นเพศพืช'
    },
    {
      stage: 'flowering',
      duration: { weeks: 6 - 12 },
      thaiName: 'ออกดอก',
      description: 'ดอกเจริญเติบโตและสะสม cannabinoids'
    },
    {
      stage: 'ripening',
      duration: { weeks: 1 - 2 },
      thaiName: 'สุกงอม',
      description: 'ดอกสุกเต็มที่ พร้อมเก็บเกี่ยว'
    }
  ],

  // Soil requirements
  soilRequirements: {
    ph: {
      min: 6.0,
      max: 7.0,
      ideal: 6.5,
      notes: 'Cannabis ชอบดินเป็นกลางเล็กน้อย'
    },

    // NPK by growth stage
    npk: {
      germination: {
        nitrogen: { min: 0, max: 50, ideal: 20 },
        phosphorus: { min: 20, max: 60, ideal: 40 },
        potassium: { min: 10, max: 40, ideal: 20 },
        ratio: '1-2-1'
      },
      seedling: {
        nitrogen: { min: 50, max: 100, ideal: 80 },
        phosphorus: { min: 40, max: 80, ideal: 60 },
        potassium: { min: 40, max: 80, ideal: 60 },
        ratio: '2-1-1'
      },
      vegetative: {
        nitrogen: { min: 100, max: 200, ideal: 150 },
        phosphorus: { min: 40, max: 80, ideal: 60 },
        potassium: { min: 80, max: 150, ideal: 120 },
        ratio: '3-1-2'
      },
      flowering: {
        nitrogen: { min: 50, max: 100, ideal: 80 },
        phosphorus: { min: 80, max: 150, ideal: 120 },
        potassium: { min: 150, max: 250, ideal: 200 },
        ratio: '1-3-3'
      },
      ripening: {
        nitrogen: { min: 20, max: 50, ideal: 30 },
        phosphorus: { min: 60, max: 120, ideal: 90 },
        potassium: { min: 180, max: 280, ideal: 220 },
        ratio: '0-1-3'
      }
    },

    // Micronutrients (ppm)
    micronutrients: {
      iron: { min: 2, max: 5, ideal: 3 },
      zinc: { min: 1, max: 3, ideal: 2 },
      manganese: { min: 1, max: 3, ideal: 2 },
      copper: { min: 0.1, max: 0.5, ideal: 0.2 },
      boron: { min: 0.5, max: 1.5, ideal: 1.0 },
      molybdenum: { min: 0.01, max: 0.05, ideal: 0.02 },
      calcium: { min: 150, max: 300, ideal: 200 },
      magnesium: { min: 40, max: 100, ideal: 60 },
      sulfur: { min: 20, max: 50, ideal: 30 }
    },

    organicMatter: {
      min: 3,
      ideal: 5,
      max: 8,
      unit: '%'
    },

    ec: {
      min: 1.0,
      ideal: 1.5,
      max: 2.2,
      unit: 'mS/cm'
    }
  },

  // Water requirements
  waterRequirements: {
    germination: {
      moisture: { min: 60, max: 80, ideal: 70 },
      frequency: 'keep moist, not wet',
      amount: { min: 0.1, max: 0.3, unit: 'L/plant/day' }
    },
    seedling: {
      moisture: { min: 50, max: 70, ideal: 60 },
      frequency: 'once daily',
      amount: { min: 0.3, max: 0.5, unit: 'L/plant/day' }
    },
    vegetative: {
      moisture: { min: 40, max: 60, ideal: 50 },
      frequency: 'once or twice daily',
      amount: { min: 1, max: 3, unit: 'L/plant/day' }
    },
    flowering: {
      moisture: { min: 35, max: 55, ideal: 45 },
      frequency: 'once or twice daily',
      amount: { min: 2, max: 5, unit: 'L/plant/day' }
    },
    ripening: {
      moisture: { min: 30, max: 50, ideal: 40 },
      frequency: 'reduce gradually',
      amount: { min: 0.5, max: 2, unit: 'L/plant/day' },
      notes: 'ลดน้ำเพื่อเพิ่มความเข้มข้นของ resin'
    }
  },

  // Environmental requirements
  environment: {
    temperature: {
      day: { min: 20, ideal: 26, max: 30, unit: 'C' },
      night: { min: 16, ideal: 20, max: 24, unit: 'C' },
      notes: 'อุณหภูมิกลางวัน-กลางคืนควรต่างกัน 4-6°C'
    },
    humidity: {
      vegetative: { min: 50, ideal: 60, max: 70, unit: '%' },
      flowering: { min: 40, ideal: 50, max: 60, unit: '%' },
      notes: 'ลดความชื้นในช่วงดอกเพื่อป้องกันเชื้อรา'
    },
    light: {
      vegetative: { hours: 18, intensity: 'high' },
      flowering: { hours: 12, intensity: 'high' },
      notes: 'ต้องการแสงแรง 600-1000 µmol/m²/s'
    }
  },

  // Common deficiency symptoms
  deficiencySymptoms: {
    nitrogen: {
      symptoms: ['ใบล่างเหลือง', 'เจริญเติบโตช้า', 'ลำต้นเล็ก', 'ใบมีขนาดเล็ก'],
      progression: 'ใบล่างเหลืองก่อน แล้วลามไปใบบน',
      urgency: 'high',
      reversible: true
    },
    phosphorus: {
      symptoms: ['ใบมืดหรือเขียวอมน้ำเงิน', 'ใบปลายแห้ง', 'ราก<red', 'เจริญเติบโตช้า'],
      progression: 'ใบล่างได้รับผลกระทบก่อน',
      urgency: 'high',
      reversible: true
    },
    potassium: {
      symptoms: ['ขอบใบเหลืองหรือไหม้', 'จุดสีน้ำตาลบนใบ', 'ลำต้นอ่อนแอ', 'ต้านทานโรคต่ำ'],
      progression: 'ใบล่างและขอบใบได้รับผลกระทบก่อน',
      urgency: 'medium',
      reversible: true
    },
    calcium: {
      symptoms: ['ยอดอ่อนตาย', 'ขอบใบงอหรือม้วน', 'จุดสีน้ำตาลบนผล'],
      progression: 'ยอดอ่อนและใบอ่อนได้รับผลกระทบก่อน',
      urgency: 'medium',
      reversible: false
    },
    magnesium: {
      symptoms: ['ใบเหลืองแต่เส้นใบยังเขียว', 'ใบล่างแห้ง', 'ใบม้วน'],
      progression: 'ใบล่างได้รับผลกระทบก่อน',
      urgency: 'medium',
      reversible: true
    },
    iron: {
      symptoms: ['ใบอ่อนเหลือง', 'เส้นใบยังเขียว', 'ยอดอ่อนซีด'],
      progression: 'ใบอ่อนและยอดได้รับผลกระทบก่อน',
      urgency: 'medium',
      reversible: true
    },
    zinc: {
      symptoms: ['ใบเล็ก', 'ระยะห่างข้อสั้น', 'ใบบิดเบี้ยว'],
      progression: 'ยอดและใบอ่อนได้รับผลกระทบ',
      urgency: 'low',
      reversible: true
    }
  }
};

/**
 * Turmeric (ขมิ้นชัน) Growing Requirements
 * 💰 SECONDARY ECONOMIC CROP (Optional - Not Phase 3 Focus)
 * Curcuma longa - Thai medicinal plant for export and national income
 */
const TURMERIC_PROFILE = {
  cropName: 'Turmeric',
  scientificName: 'Curcuma longa L.',
  thaiName: 'ขมิ้นชัน',
  isPrimaryCrop: false, // Secondary economic crop
  gacpCompliant: false, // Basic recommendations only
  developmentPhase: 'future', // Full support in future phases

  growthStages: [
    { stage: 'planting', duration: { days: 1 }, thaiName: 'ปลูก' },
    { stage: 'sprouting', duration: { weeks: 2 - 3 }, thaiName: 'งอก' },
    { stage: 'vegetative', duration: { months: 3 - 4 }, thaiName: 'เจริญเติบโต' },
    { stage: 'rhizome_development', duration: { months: 3 - 4 }, thaiName: 'พัฒนาเหง้า' },
    { stage: 'maturity', duration: { months: 1 - 2 }, thaiName: 'สุกแก่' }
  ],

  soilRequirements: {
    ph: { min: 5.5, max: 7.5, ideal: 6.5 },
    npk: {
      vegetative: {
        nitrogen: { min: 80, max: 120, ideal: 100 },
        phosphorus: { min: 60, max: 100, ideal: 80 },
        potassium: { min: 100, max: 150, ideal: 120 },
        ratio: '1-1-1.5'
      },
      rhizome_development: {
        nitrogen: { min: 60, max: 100, ideal: 80 },
        phosphorus: { min: 80, max: 120, ideal: 100 },
        potassium: { min: 120, max: 180, ideal: 150 },
        ratio: '1-1.5-2'
      }
    },
    micronutrients: {
      zinc: { min: 5, max: 15, ideal: 10 },
      boron: { min: 0.5, max: 2, ideal: 1 }
    }
  },

  waterRequirements: {
    vegetative: { mmPerWeek: 40 - 50 },
    rhizome_development: { mmPerWeek: 30 - 40 },
    maturity: { mmPerWeek: 20 - 30 }
  },

  harvestTime: '8-10 months after planting',
  tips: [
    'ปลูกในดินร่วนซุย ระบายน้ำดี',
    'ใช้เหง้าพันธุ์ขนาด 20-30 กรัม',
    'ใส่ปุ๋ยคอก 2-3 ตัน/ไร่ก่อนปลูก',
    'รดน้ำสม่ำเสมอ หลีกเลี่ยงน้ำขัง',
    'เก็บเกี่ยวเมื่อใบเริ่มเหลืองแห้ง'
  ]
};

/**
 * Ginger (ขิง) Growing Requirements
 * 💰 SECONDARY ECONOMIC CROP (Optional - Not Phase 3 Focus)
 */
const GINGER_PROFILE = {
  cropName: 'Ginger',
  scientificName: 'Zingiber officinale Roscoe',
  thaiName: 'ขิง',
  isPrimaryCrop: false,
  developmentPhase: 'future',

  growthStages: [
    { stage: 'planting', duration: { days: 1 }, thaiName: 'ปลูก' },
    { stage: 'sprouting', duration: { weeks: 2 - 4 }, thaiName: 'งอก' },
    { stage: 'vegetative', duration: { months: 4 - 5 }, thaiName: 'เจริญเติบโต' },
    { stage: 'rhizome_formation', duration: { months: 3 - 4 }, thaiName: 'สร้างเหง้า' },
    { stage: 'maturity', duration: { months: 1 - 2 }, thaiName: 'สุกแก่' }
  ],

  soilRequirements: {
    ph: { min: 5.5, max: 6.5, ideal: 6.0 },
    npk: {
      vegetative: {
        nitrogen: { min: 100, max: 150, ideal: 120 },
        phosphorus: { min: 50, max: 80, ideal: 60 },
        potassium: { min: 80, max: 120, ideal: 100 },
        ratio: '2-1-1.5'
      },
      rhizome_formation: {
        nitrogen: { min: 80, max: 120, ideal: 100 },
        phosphorus: { min: 60, max: 100, ideal: 80 },
        potassium: { min: 120, max: 180, ideal: 150 },
        ratio: '1-1-2'
      }
    }
  },

  waterRequirements: {
    vegetative: { mmPerWeek: 50 - 60 },
    rhizome_formation: { mmPerWeek: 40 - 50 },
    maturity: { mmPerWeek: 20 - 30 }
  },

  harvestTime: '10-12 months for mature rhizomes, 4-6 months for young ginger',
  tips: [
    'เลือกพันธุ์ดี เหง้าแข็งแรง ไม่เน่า',
    'ปลูกในดินร่วนปนทราย อินทรีย์สูง',
    'ระยะปลูก 30x30 cm หรือ 40x40 cm',
    'รดน้ำสม่ำเสมอ ไม่ให้ดินแห้งจัด',
    'เก็บเกี่ยวขิงอ่อนได้หลังปลูก 4-5 เดือน'
  ]
};

/**
 * Black Galingale (กระชายดำ) Growing Requirements
 * 💰 SECONDARY ECONOMIC CROP (Optional - Not Phase 3 Focus)
 */
const BLACK_GALINGALE_PROFILE = {
  cropName: 'Black Galingale',
  scientificName: 'Kaempferia parviflora Wall. ex Baker',
  thaiName: 'กระชายดำ',
  isPrimaryCrop: false,
  developmentPhase: 'future',

  growthStages: [
    { stage: 'planting', duration: { days: 1 }, thaiName: 'ปลูก' },
    { stage: 'sprouting', duration: { weeks: 3 - 4 }, thaiName: 'งอก' },
    { stage: 'vegetative', duration: { months: 5 - 6 }, thaiName: 'เจริญเติบโต' },
    { stage: 'rhizome_development', duration: { months: 4 - 5 }, thaiName: 'พัฒนาเหง้า' },
    { stage: 'dormancy', duration: { months: 2 - 3 }, thaiName: 'พักตัว' }
  ],

  soilRequirements: {
    ph: { min: 5.0, max: 6.5, ideal: 5.8 },
    npk: {
      vegetative: {
        nitrogen: { min: 60, max: 100, ideal: 80 },
        phosphorus: { min: 40, max: 70, ideal: 50 },
        potassium: { min: 80, max: 120, ideal: 100 },
        ratio: '1.5-1-2'
      },
      rhizome_development: {
        nitrogen: { min: 40, max: 80, ideal: 60 },
        phosphorus: { min: 60, max: 100, ideal: 80 },
        potassium: { min: 100, max: 150, ideal: 120 },
        ratio: '1-1.5-2'
      }
    }
  },

  waterRequirements: {
    vegetative: { mmPerWeek: 35 - 45 },
    rhizome_development: { mmPerWeek: 30 - 40 },
    dormancy: { mmPerWeek: 10 - 20 }
  },

  harvestTime: '12-15 months after planting',
  tips: [
    'ชอบร่มเงา ปลูกใต้ร่มได้ดี',
    'ต้องการความชื้นสม่ำเสมอ',
    'ดินต้องมีอินทรีย์วัตถุสูง',
    'เก็บเกี่ยวหลังใบเหลือง ยกแปลง',
    'ราคาสูง ต้องการตลาดแน่นอน'
  ]
};

/**
 * Plai/Cassumunar Ginger (ไพล) Growing Requirements
 * 💰 SECONDARY ECONOMIC CROP (Optional - Not Phase 3 Focus)
 */
const PLAI_PROFILE = {
  cropName: 'Plai',
  scientificName: 'Zingiber cassumunar Roxb.',
  thaiName: 'ไพล',
  isPrimaryCrop: false,
  developmentPhase: 'future',

  growthStages: [
    { stage: 'planting', duration: { days: 1 }, thaiName: 'ปลูก' },
    { stage: 'sprouting', duration: { weeks: 2 - 3 }, thaiName: 'งอก' },
    { stage: 'vegetative', duration: { months: 3 - 4 }, thaiName: 'เจริญเติบโต' },
    { stage: 'rhizome_formation', duration: { months: 3 - 4 }, thaiName: 'สร้างเหง้า' },
    { stage: 'maturity', duration: { months: 1 - 2 }, thaiName: 'สุกแก่' }
  ],

  soilRequirements: {
    ph: { min: 5.5, max: 7.0, ideal: 6.0 },
    npk: {
      vegetative: {
        nitrogen: { min: 80, max: 120, ideal: 100 },
        phosphorus: { min: 50, max: 80, ideal: 60 },
        potassium: { min: 80, max: 120, ideal: 100 },
        ratio: '1.5-1-1.5'
      },
      rhizome_formation: {
        nitrogen: { min: 60, max: 100, ideal: 80 },
        phosphorus: { min: 60, max: 100, ideal: 80 },
        potassium: { min: 100, max: 150, ideal: 120 },
        ratio: '1-1-1.5'
      }
    }
  },

  waterRequirements: {
    vegetative: { mmPerWeek: 40 - 50 },
    rhizome_formation: { mmPerWeek: 35 - 45 },
    maturity: { mmPerWeek: 25 - 35 }
  },

  harvestTime: '8-10 months after planting',
  tips: [
    'ทนร่มเงาได้ดี ปลูกใต้ไม้ผลได้',
    'ต้องการดินร่วน มีอินทรีย์วัตถุ',
    'รดน้ำสม่ำเสมอ ไม่ให้แห้งจัด',
    'ใช้เหง้าพันธุ์น้ำหนัก 30-40 กรัม',
    'นิยมแปรรูปเป็นผลิตภัณฑ์สมุนไพร'
  ]
};

/**
 * Kratom (กระท่อม) Growing Requirements
 * 💰 SECONDARY ECONOMIC CROP (Optional - Not Phase 3 Focus)
 * ⚠️ Highly regulated - requires special permits
 */
const KRATOM_PROFILE = {
  cropName: 'Kratom',
  scientificName: 'Mitragyna speciosa Korth.',
  thaiName: 'กระท่อม',
  isPrimaryCrop: false,
  developmentPhase: 'future',
  regulatoryWarning: 'Requires special cultivation permits and legal compliance',

  growthStages: [
    { stage: 'seedling', duration: { months: 3 - 6 }, thaiName: 'ต้นกล้า' },
    { stage: 'young_tree', duration: { years: 1 - 2 }, thaiName: 'ต้นอ่อน' },
    { stage: 'mature_tree', duration: { years: 2 - 3 }, thaiName: 'ต้นโต' },
    { stage: 'production', duration: { years: '3+' }, thaiName: 'ให้ผลผลิต' }
  ],

  soilRequirements: {
    ph: { min: 5.5, max: 6.8, ideal: 6.0 },
    npk: {
      young_tree: {
        nitrogen: { min: 100, max: 150, ideal: 120 },
        phosphorus: { min: 40, max: 70, ideal: 50 },
        potassium: { min: 80, max: 120, ideal: 100 },
        ratio: '2-1-2'
      },
      mature_tree: {
        nitrogen: { min: 120, max: 180, ideal: 150 },
        phosphorus: { min: 50, max: 80, ideal: 60 },
        potassium: { min: 100, max: 150, ideal: 120 },
        ratio: '2.5-1-2'
      }
    },
    micronutrients: {
      iron: { min: 20, max: 50, ideal: 30 },
      magnesium: { min: 30, max: 60, ideal: 40 }
    }
  },

  waterRequirements: {
    young_tree: { mmPerWeek: 50 - 70 },
    mature_tree: { mmPerWeek: 60 - 80 },
    production: { mmPerWeek: 70 - 90 }
  },

  harvestTime: 'Leaf harvest every 3-4 months after 3 years',
  tips: [
    'เป็นไม้ยืนต้น เติบโตช้า',
    'ต้องการความชื้นสูง ร่มเงาบางส่วน',
    'ปลูกในพื้นที่ป่าหรือสวนผสมผสาน',
    'เก็บใบ 3-4 เดือน/ครั้ง หลังต้นโต',
    '⚠️ ต้องปฏิบัติตามกฎหมายการปลูกกระท่อม',
    'มีข้อกำหนดเฉพาะสำหรับการขออนุญาต'
  ]
};

module.exports = {
  CANNABIS_PROFILE,
  TURMERIC_PROFILE,
  GINGER_PROFILE,
  BLACK_GALINGALE_PROFILE,
  PLAI_PROFILE,
  KRATOM_PROFILE,

  /**
   * Get crop profile by name
   */
  getCropProfile(cropName) {
    // If no crop name provided, default to Cannabis (primary crop)
    if (!cropName) {
      return CANNABIS_PROFILE;
    }

    const lowerName = cropName.toLowerCase();

    // Cannabis - Primary Crop (Default)
    if (lowerName.includes('cannabis') || lowerName.includes('กัญชา')) {
      return CANNABIS_PROFILE;
    }

    // Secondary Economic Crops (Optional)
    if (lowerName.includes('turmeric') || lowerName.includes('ขมิ้น')) {
      return TURMERIC_PROFILE;
    }
    if (lowerName.includes('ginger') || lowerName.includes('ขิง')) {
      return GINGER_PROFILE;
    }
    if (lowerName.includes('galingale') || lowerName.includes('กระชาย')) {
      return BLACK_GALINGALE_PROFILE;
    }
    if (lowerName.includes('plai') || lowerName.includes('ไพล')) {
      return PLAI_PROFILE;
    }
    if (lowerName.includes('kratom') || lowerName.includes('กระท่อม')) {
      return KRATOM_PROFILE;
    }

    // If crop not recognized, default to Cannabis
    return CANNABIS_PROFILE;
  },

  /**
   * Get requirements for specific growth stage
   */
  getStageRequirements(cropProfile, stage) {
    return {
      npk: cropProfile.soilRequirements.npk[stage],
      water: cropProfile.waterRequirements[stage],
      environment: cropProfile.environment
    };
  }
};
```

### Fertilizer Recommendation Service

**File**: `apps/backend/modules/ai-recommendations/domain/services/FertilizerRecommendationService.js`

```javascript
const SoilDataAnalyzer = require('./SoilDataAnalyzer');
const { getCropProfile, getStageRequirements } = require('../../data/crop-profiles');
const { logger } = require('../../../../shared/utils/logger');

class FertilizerRecommendationService {
  constructor() {
    this.soilAnalyzer = new SoilDataAnalyzer();
    this.productDatabase = require('../../data/fertilizer-products');
  }

  /**
   * Generate complete fertilizer recommendations
   */
  async generateRecommendations(farmData) {
    const { soilData, cropType, growthStage, farmSize, budget } = farmData;

    // Get crop profile
    const cropProfile = getCropProfile(cropType);
    if (!cropProfile) {
      throw new Error(`Crop profile not found for: ${cropType}`);
    }

    // Get stage requirements
    const requirements = getStageRequirements(cropProfile, growthStage);

    // Analyze current soil
    const soilAnalysis = this.soilAnalyzer.analyze(soilData, {
      ph: cropProfile.soilRequirements.ph,
      npk: requirements.npk,
      micronutrients: cropProfile.soilRequirements.micronutrients,
      organicMatter: cropProfile.soilRequirements.organicMatter
    });

    // Generate recommendations
    const recommendations = [];

    // pH Correction
    if (soilAnalysis.ph.action !== 'maintain') {
      const phRec = this.generatePHCorrection(soilAnalysis.ph, farmSize);
      if (phRec) recommendations.push(phRec);
    }

    // NPK Fertilizers
    const npkRecs = this.generateNPKRecommendations(
      soilAnalysis.npk,
      requirements.npk,
      growthStage,
      farmSize
    );
    recommendations.push(...npkRecs);

    // Organic Matter
    if (soilAnalysis.organicMatter.action !== 'maintain') {
      const omRec = this.generateOrganicMatterRecommendation(soilAnalysis.organicMatter, farmSize);
      if (omRec) recommendations.push(omRec);
    }

    // Micronutrients
    if (soilAnalysis.micronutrients.deficiencies.length > 0) {
      const microRec = this.generateMicronutrientRecommendation(
        soilAnalysis.micronutrients,
        farmSize
      );
      if (microRec) recommendations.push(microRec);
    }

    // Calculate total cost
    const totalCost = recommendations.reduce((sum, rec) => sum + (rec.estimatedCost || 0), 0);

    // Budget optimization
    if (budget && totalCost > budget) {
      this.optimizeForBudget(recommendations, budget);
    }

    return {
      soilAnalysis,
      recommendations: this.prioritizeRecommendations(recommendations),
      summary: {
        totalRecommendations: recommendations.length,
        estimatedCost: totalCost,
        expectedImprovements: this.calculateExpectedImprovements(soilAnalysis, recommendations),
        applicationSchedule: this.generateApplicationSchedule(recommendations, growthStage)
      }
    };
  }

  /**
   * Generate pH correction recommendation
   */
  generatePHCorrection(phAnalysis, farmSize) {
    if (phAnalysis.issue === 'very_acidic' || phAnalysis.issue === 'acidic') {
      // Use agricultural lime
      const limeAmount = Math.ceil(phAnalysis.difference * 500 * farmSize); // kg per rai

      return {
        priority: phAnalysis.severity === 'high' ? 1 : 2,
        category: 'pH Correction',
        issue: phAnalysis.message,
        currentValue: phAnalysis.currentValue,
        targetValue: phAnalysis.targetValue,

        product: {
          name: 'ปูนขาว (Agricultural Lime)',
          type: 'pH Amendment',
          composition: 'CaCO3',
          form: 'powder'
        },

        application: {
          amount: limeAmount,
          unit: 'kg',
          perArea: `${limeAmount / farmSize} kg/rai`,
          method: 'broadcast',
          methodThai: 'โรยทั่วแปลง แล้วพรวนดินให้เข้ากัน',
          timing: 'ก่อนปลูก 2-4 สัปดาห์',
          frequency: 'ครั้งเดียว',
          waterAfter: true
        },

        estimatedCost: limeAmount * 15, // 15 baht/kg
        expectedResult: `pH จะปรับขึ้นมาอยู่ที่ ${phAnalysis.targetValue} ภายใน 2-4 สัปดาห์`,
        benefits: [
          'เพิ่มการดูดซึมธาตุอาหารทั้งหมด',
          'กระตุ้นกิจกรรมจุลินทรีย์ที่เป็นประโยชน์',
          'ปรับปรุงโครงสร้างดิน',
          'ให้แคลเซียมแก่พืช'
        ],
        warnings: [
          'ไม่ควรใส่มากเกินไป อาจทำให้ดินเป็นด่าง',
          'ควรตรวจ pH อีกครั้งหลัง 2 สัปดาห์',
          'อย่าใส่พร้อมกับปุ๋ยยูเรีย (รอ 1 สัปดาห์)'
        ]
      };
    }

    if (phAnalysis.issue === 'very_alkaline' || phAnalysis.issue === 'alkaline') {
      // Use sulfur
      const sulfurAmount = Math.ceil(phAnalysis.difference * 300 * farmSize);

      return {
        priority: phAnalysis.severity === 'high' ? 1 : 2,
        category: 'pH Correction',
        issue: phAnalysis.message,
        currentValue: phAnalysis.currentValue,
        targetValue: phAnalysis.targetValue,

        product: {
          name: 'กำมะถัน (Elemental Sulfur)',
          type: 'pH Amendment',
          composition: 'S',
          form: 'powder'
        },

        application: {
          amount: sulfurAmount,
          unit: 'kg',
          perArea: `${sulfurAmount / farmSize} kg/rai`,
          method: 'broadcast and incorporate',
          methodThai: 'ผสมคลุกเคล้าดิน รดน้ำให้ชุ่ม',
          timing: 'ก่อนปลูก 3-4 สัปดาห์',
          frequency: 'ครั้งเดียว',
          waterAfter: true
        },

        estimatedCost: sulfurAmount * 25, // 25 baht/kg
        expectedResult: `pH จะปรับลงมาอยู่ที่ ${phAnalysis.targetValue} ภายใน 3-4 สัปดาห์`,
        benefits: ['ลด pH ให้เหมาะสม', 'เพิ่มการดูดซึมเหล็กและแมงกานีส', 'ป้องกันการขาดธาตุรอง'],
        warnings: [
          'ใช้เวลานาน 3-4 สัปดาห์กว่าจะเห็นผล',
          'อาจทำให้เชื้อราเพิ่มขึ้นชั่วคราว',
          'ตรวจสอบ pH อย่างสม่ำเสมอ'
        ]
      };
    }

    return null;
  }

  /**
   * Generate NPK fertilizer recommendations
   */
  generateNPKRecommendations(npkAnalysis, requirements, growthStage, farmSize) {
    const recommendations = [];

    // Nitrogen
    if (
      npkAnalysis.nitrogen.status === 'very_deficient' ||
      npkAnalysis.nitrogen.status === 'deficient'
    ) {
      const nRec = this.recommendNitrogen(npkAnalysis.nitrogen, growthStage, farmSize);
      recommendations.push(nRec);
    }

    // Phosphorus
    if (
      npkAnalysis.phosphorus.status === 'very_deficient' ||
      npkAnalysis.phosphorus.status === 'deficient'
    ) {
      const pRec = this.recommendPhosphorus(npkAnalysis.phosphorus, growthStage, farmSize);
      recommendations.push(pRec);
    }

    // Potassium
    if (
      npkAnalysis.potassium.status === 'very_deficient' ||
      npkAnalysis.potassium.status === 'deficient'
    ) {
      const kRec = this.recommendPotassium(npkAnalysis.potassium, growthStage, farmSize);
      recommendations.push(kRec);
    }

    // Balanced NPK for maintenance
    if (recommendations.length === 0 && growthStage !== 'germination') {
      const balancedRec = this.recommendBalancedNPK(requirements, growthStage, farmSize);
      recommendations.push(balancedRec);
    }

    return recommendations;
  }

  recommendNitrogen(nAnalysis, growthStage, farmSize) {
    const deficiency = nAnalysis.deficiency;
    const amountKg = Math.ceil((deficiency * farmSize * 0.4) / 100); // Convert ppm to kg, 40% efficiency

    // Choose product based on growth stage
    let product;
    if (growthStage === 'vegetative') {
      product = {
        name: 'ปุ๋ยยูเรีย',
        npk: '46-0-0',
        nContent: 46,
        form: 'granular',
        price: 15 // baht/kg
      };
    } else {
      product = {
        name: 'Blood Meal (อินทรีย์)',
        npk: '12-0-0',
        nContent: 12,
        form: 'powder',
        price: 35
      };
    }

    const productAmount = Math.ceil((amountKg * 100) / product.nContent);

    return {
      priority: nAnalysis.priority,
      category: 'Nitrogen (N)',
      issue: nAnalysis.message,
      currentValue: nAnalysis.currentValue,
      targetValue: nAnalysis.targetValue,
      deficiency: deficiency,

      product: {
        name: product.name,
        type: 'Nitrogen Fertilizer',
        npk: product.npk,
        form: product.form
      },

      application: {
        amount: productAmount,
        unit: 'kg',
        perArea: `${(productAmount / farmSize).toFixed(1)} kg/rai`,
        method: growthStage === 'vegetative' ? 'side dress or fertigation' : 'broadcast',
        methodThai: growthStage === 'vegetative' ? 'โรยรอบโคนต้น หรือละลายน้ำรด' : 'โรยทั่วแปลง',
        timing: growthStage === 'vegetative' ? 'ทุก 7-10 วัน' : 'ทุก 14 วัน',
        frequency: '3-4 ครั้ง',
        splitApplication: true
      },

      estimatedCost: productAmount * product.price,
      expectedResult: `ระดับ N จะเพิ่มขึ้นเป็น ${nAnalysis.targetValue} ppm ภายใน 2-3 สัปดาห์`,
      benefits: [
        'ใบเขียวเข้ม มีคลอโรฟิลล์เพิ่มขึ้น',
        'เจริญเติบโตเร็วขึ้น',
        'ผลผลิตเพิ่มขึ้น 20-40%'
      ],
      warnings: [
        'แบ่งใส่หลายครั้ง อย่าใส่ครั้งเดียวทั้งหมด',
        'ระวังใส่มากเกินไป อาจทำให้ใบไหม้',
        'ลดปริมาณลงในช่วงดอก'
      ]
    };
  }

  recommendPhosphorus(pAnalysis, growthStage, farmSize) {
    const deficiency = pAnalysis.deficiency;
    const amountKg = Math.ceil((deficiency * farmSize * 0.3) / 100);

    const product = {
      name: 'ปุ๋ยซุปเปอร์ฟอสเฟต',
      npk: '0-20-0',
      pContent: 20,
      form: 'granular',
      price: 18
    };

    const productAmount = Math.ceil((amountKg * 100) / product.pContent);

    return {
      priority: pAnalysis.priority,
      category: 'Phosphorus (P)',
      issue: pAnalysis.message,
      currentValue: pAnalysis.currentValue,
      targetValue: pAnalysis.targetValue,

      product: {
        name: product.name,
        type: 'Phosphorus Fertilizer',
        npk: product.npk,
        form: product.form
      },

      application: {
        amount: productAmount,
        unit: 'kg',
        perArea: `${(productAmount / farmSize).toFixed(1)} kg/rai`,
        method: 'incorporate into soil',
        methodThai: 'ผสมคลุกเคล้าดินรอบโคนต้น',
        timing: 'ช่วงปลูกและก่อนออกดอก',
        frequency: 'ทุก 14-21 วัน',
        waterAfter: true
      },

      estimatedCost: productAmount * product.price,
      expectedResult: `ระดับ P จะเพิ่มขึ้นเป็น ${pAnalysis.targetValue} ppm`,
      benefits: ['ระบบรากแข็งแรง', 'ออกดอกเร็วขึ้น', 'ผลผลิตมีคุณภาพดีขึ้น']
    };
  }

  recommendPotassium(kAnalysis, growthStage, farmSize) {
    const deficiency = kAnalysis.deficiency;
    const amountKg = Math.ceil((deficiency * farmSize * 0.35) / 100);

    const product = {
      name: 'โพแทสเซียมซัลเฟต',
      npk: '0-0-50',
      kContent: 50,
      form: 'crystal',
      price: 30
    };

    const productAmount = Math.ceil((amountKg * 100) / product.kContent);

    return {
      priority: kAnalysis.priority,
      category: 'Potassium (K)',
      issue: kAnalysis.message,
      currentValue: kAnalysis.currentValue,
      targetValue: kAnalysis.targetValue,

      product: {
        name: product.name,
        type: 'Potassium Fertilizer',
        npk: product.npk,
        form: product.form,
        note: 'ละลายน้ำได้ดี เหมาะสำหรับช่วงดอก'
      },

      application: {
        amount: productAmount,
        unit: 'kg',
        perArea: `${(productAmount / farmSize).toFixed(1)} kg/rai`,
        method: 'fertigation or foliar spray',
        methodThai: 'ละลายน้ำรดโคนต้น หรือพ่นใบ',
        timing: 'ช่วงออกดอกและติดผล',
        frequency: 'ทุก 7-10 วัน',
        concentration: '0.5-1% สำหรับพ่นใบ'
      },

      estimatedCost: productAmount * product.price,
      expectedResult: `ระดับ K จะเพิ่มขึ้นเป็น ${kAnalysis.targetValue} ppm`,
      benefits: ['คุณภาพผลผลิตดีขึ้น', 'ทนทานต่อโรคและแมลง', 'cannabinoid content เพิ่มขึ้น'],
      warnings: ['สำคัญมากในช่วงออกดอก', 'อย่าใส่พร้อมกับปุ๋ยแคลเซียม']
    };
  }

  /**
   * Generate organic matter recommendation
   */
  generateOrganicMatterRecommendation(omAnalysis, farmSize) {
    if (omAnalysis.status === 'optimal') return null;

    const targetIncrease = 5 - omAnalysis.percentage; // Target 5%
    const compostAmount = Math.ceil(targetIncrease * farmSize * 200); // kg per rai

    return {
      priority: omAnalysis.status === 'very_low' ? 2 : 3,
      category: 'Organic Matter',
      issue: omAnalysis.message,
      currentValue: `${omAnalysis.percentage}%`,
      targetValue: '5%',

      product: {
        name: 'คอมโพสต์คุณภาพดี',
        type: 'Organic Amendment',
        composition: 'Composted organic matter',
        form: 'decomposed'
      },

      alternatives: ['มูลไส้เดือน (Vermicompost)', 'มูลไก่หมัก', 'มูลโคหมัก', 'ชีวภาพ EM'],

      application: {
        amount: compostAmount,
        unit: 'kg',
        perArea: `${compostAmount / farmSize} kg/rai`,
        method: 'incorporate',
        methodThai: 'ผสมคลุกเคล้าดินให้ทั่ว',
        timing: 'ก่อนปลูก 2-4 สัปดาห์',
        frequency: 'ทุก 3-6 เดือน',
        depth: '10-15 cm'
      },

      estimatedCost: compostAmount * 5, // 5 baht/kg
      expectedResult: `อินทรียวัตถุจะเพิ่มขึ้นเป็น 5% ภายใน 2-3 เดือน`,
      benefits: omAnalysis.benefits || [
        'ดินเก็บน้ำได้ดีขึ้น 30-50%',
        'เพิ่มความอุดมสมบูรณ์',
        'ปรับปรุงโครงสร้างดิน',
        'เพิ่มจุลินทรีย์ที่เป็นประโยชน์',
        'ลด soil compaction'
      ]
    };
  }

  /**
   * Prioritize recommendations by urgency and impact
   */
  prioritizeRecommendations(recommendations) {
    return recommendations.sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // Then by estimated impact
      return (b.estimatedCost || 0) - (a.estimatedCost || 0);
    });
  }

  /**
   * Generate application schedule
   */
  generateApplicationSchedule(recommendations, currentStage) {
    const schedule = [];
    const stages = ['germination', 'seedling', 'vegetative', 'flowering', 'ripening'];
    const currentIndex = stages.indexOf(currentStage);

    recommendations.forEach(rec => {
      if (rec.application) {
        schedule.push({
          stage: currentStage,
          week: 1,
          product: rec.product.name,
          amount: rec.application.perArea,
          method: rec.application.methodThai,
          priority: rec.priority
        });
      }
    });

    return schedule.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate expected improvements
   */
  calculateExpectedImprovements(soilAnalysis, recommendations) {
    const improvements = {
      soilHealth: {
        current: soilAnalysis.score,
        expected: Math.min(100, soilAnalysis.score + 20),
        improvement: '+20 points'
      },
      yieldIncrease: {
        percentage: '15-30%',
        reason: 'Optimal nutrient levels'
      },
      costSavings: {
        fertilizer: '20-30%',
        water: '15-25%',
        reason: 'Efficient resource use'
      }
    };

    return improvements;
  }
}

module.exports = FertilizerRecommendationService;
```

### Fertilizer Recommendation API

**File**: `apps/backend/modules/ai-recommendations/application/controllers/fertilizer.controller.js`

```javascript
const FertilizerRecommendationService = require('../../domain/services/FertilizerRecommendationService');
const Farm = require('../../../farm-management/infrastructure/database/Farm.model');
const { logger } = require('../../../../shared/utils/logger');
const ApiResponse = require('../../../../shared/utils/api-response');

const fertilizerService = new FertilizerRecommendationService();

/**
 * Get fertilizer recommendations for a farm
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { growthStage, budget } = req.query;

    // Get farm data
    const farm = await Farm.findById(farmId).select('farmName soilMonitoring crops area').lean();

    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Prepare data for recommendation engine
    const farmData = {
      soilData: {
        ph: farm.soilMonitoring?.realTimeData?.ph?.current,
        npk: {
          nitrogen: farm.soilMonitoring?.realTimeData?.npk?.nitrogen?.current,
          phosphorus: farm.soilMonitoring?.realTimeData?.npk?.phosphorus?.current,
          potassium: farm.soilMonitoring?.realTimeData?.npk?.potassium?.current
        },
        organicMatter: farm.soilMonitoring?.realTimeData?.organicMatter,
        micronutrients: farm.soilMonitoring?.manualTests?.[0]?.micronutrients
      },
      cropType: farm.crops?.[0]?.cropType || 'cannabis',
      growthStage: growthStage || farm.crops?.[0]?.growthStage || 'vegetative',
      farmSize: farm.area || 1,
      budget: budget ? parseFloat(budget) : null
    };

    // Generate recommendations
    const result = await fertilizerService.generateRecommendations(farmData);

    logger.info('Fertilizer recommendations generated', {
      farmId,
      recommendationsCount: result.recommendations.length,
      totalCost: result.summary.estimatedCost,
      userId: req.user.id
    });

    res.json(ApiResponse.success(result));
  } catch (error) {
    logger.error('Failed to generate fertilizer recommendations', {
      error: error.message,
      farmId: req.params.farmId
    });
    res
      .status(500)
      .json(ApiResponse.error('Failed to generate recommendations', 500, error.message));
  }
};

/**
 * Get detailed product information
 */
exports.getProductInfo = async (req, res) => {
  try {
    const { productName } = req.params;

    const productDatabase = require('../../data/fertilizer-products');
    const product = productDatabase.findProduct(productName);

    if (!product) {
      return res.status(404).json(ApiResponse.error('Product not found', 404));
    }

    res.json(ApiResponse.success(product));
  } catch (error) {
    logger.error('Failed to get product info', { error: error.message });
    res.status(500).json(ApiResponse.error('Failed to get product info', 500, error.message));
  }
};

/**
 * Save fertilizer application record
 */
exports.recordApplication = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { product, amount, method, date, cost, notes } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json(ApiResponse.error('Farm not found', 404));
    }

    // Add to improvement history
    if (!farm.soilMonitoring) {
      farm.soilMonitoring = { improvements: [] };
    }

    farm.soilMonitoring.improvements.push({
      date: new Date(date),
      type: 'fertilizer',
      product,
      amount,
      unit: 'kg',
      cost,
      appliedBy: req.user.id,
      notes,
      method
    });

    await farm.save();

    logger.info('Fertilizer application recorded', {
      farmId,
      product,
      amount,
      userId: req.user.id
    });

    res.status(201).json(
      ApiResponse.success({
        message: 'บันทึกการใส่ปุ๋ยเรียบร้อยแล้ว',
        application: farm.soilMonitoring.improvements[farm.soilMonitoring.improvements.length - 1]
      })
    );
  } catch (error) {
    logger.error('Failed to record fertilizer application', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('Failed to record application', 500, error.message));
  }
};
```

---

## 6. Water Management & Irrigation AI

### 6.1 Overview

ระบบ Water Management & Irrigation AI ใช้ปัญญาประดิษฐ์วิเคราะห์ข้อมูลสภาพอากาศ ความชื้นในดิน และความต้องการน้ำของพืช เพื่อสร้างตารางการให้น้ำที่เหมาะสม ประหยัดน้ำ และเพิ่มผลผลิต

**Key Features**:

- ☀️ **Evapotranspiration Calculator**: คำนวณปริมาณการคายระเหยจากดินและพืช
- 🌦️ **Weather Integration**: ดึงข้อมูลพยากรณ์อากาศจากกรมอุตุนิยมวิทยา
- 💧 **Smart Scheduling**: จัดตารางให้น้ำอัตโนมัติตามความต้องการ
- 📊 **Usage Optimization**: วิเคราะห์และแนะนำวิธีประหยัดน้ำ
- ⚠️ **Stress Detection**: ตรวจจับสัญญาณพืชขาดน้ำ

### 6.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Water Management & Irrigation AI             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │  Soil Moisture │──────│  ET Calculator   │              │
│  │    Sensors     │      │ (Penman-Monteith)│              │
│  └────────────────┘      └──────────────────┘              │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌─────────────────────────────────────────┐               │
│  │   Smart Irrigation Scheduling Engine    │               │
│  │  - Weather forecast integration         │               │
│  │  - Crop water requirements              │               │
│  │  - Soil type analysis                   │               │
│  └─────────────────────────────────────────┘               │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────┐               │
│  │     Water Usage Optimizer               │               │
│  │  - Historical usage analysis            │               │
│  │  - Cost reduction strategies            │               │
│  │  - Efficiency improvement               │               │
│  └─────────────────────────────────────────┘               │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────┐               │
│  │      Irrigation Control System          │               │
│  │  - Automated valve control              │               │
│  │  - IoT device integration               │               │
│  └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Evapotranspiration (ET) Calculator

คำนวณอัตราการคายระเหยของน้ำจากดินและพืช (ET₀) โดยใช้สมการ Penman-Monteith ซึ่งเป็นมาตรฐาน FAO

**File**: `src/services/water/ETCalculator.js`

```javascript
/**
 * Evapotranspiration Calculator
 * ใช้สมการ FAO Penman-Monteith
 * คำนวณ ET₀ (Reference Evapotranspiration)
 */

class ETCalculator {
  /**
   * คำนวณ ET₀ รายวัน (mm/day)
   * @param {Object} weatherData - ข้อมูลสภาพอากาศ
   * @returns {number} ET₀ in mm/day
   */
  calculateDailyET0(weatherData) {
    const {
      temperature, // อุณหภูมิเฉลี่ย (°C)
      temperatureMax, // อุณหภูมิสูงสุด (°C)
      temperatureMin, // อุณหภูมิต่ำสุด (°C)
      humidity, // ความชื้นสัมพัทธ์ (%)
      windSpeed, // ความเร็วลม (m/s)
      solarRadiation, // พลังงานแสงอาทิตย์ (MJ/m²/day)
      elevation, // ความสูง (m)
      latitude, // ละติจูด (degrees)
      date // วันที่
    } = weatherData;

    // 1. คำนวณ Saturation Vapor Pressure (es)
    const es = this.calculateSaturationVaporPressure(temperatureMax, temperatureMin);

    // 2. คำนวณ Actual Vapor Pressure (ea)
    const ea = this.calculateActualVaporPressure(temperature, humidity);

    // 3. คำนวณ Slope of Vapor Pressure Curve (Δ)
    const delta = this.calculateVaporPressureCurveSlope(temperature);

    // 4. คำนวณ Psychrometric Constant (γ)
    const gamma = this.calculatePsychrometricConstant(elevation);

    // 5. คำนวณ Net Radiation (Rn)
    const Rn = this.calculateNetRadiation(
      solarRadiation,
      temperatureMax,
      temperatureMin,
      ea,
      latitude,
      date
    );

    // 6. คำนวณ Soil Heat Flux (G) - สำหรับรายวันให้ G = 0
    const G = 0;

    // 7. คำนวณ Wind Speed at 2m height
    const u2 = windSpeed; // สมมติว่าวัดที่ 2m แล้ว

    // 8. สมการ FAO Penman-Monteith
    const numerator =
      0.408 * delta * (Rn - G) + gamma * (900 / (temperature + 273)) * u2 * (es - ea);
    const denominator = delta + gamma * (1 + 0.34 * u2);

    const ET0 = numerator / denominator;

    return Math.max(0, ET0); // ET₀ ต้องไม่ติดลบ
  }

  /**
   * คำนวณ Saturation Vapor Pressure (kPa)
   */
  calculateSaturationVaporPressure(tMax, tMin) {
    const eoTmax = 0.6108 * Math.exp((17.27 * tMax) / (tMax + 237.3));
    const eoTmin = 0.6108 * Math.exp((17.27 * tMin) / (tMin + 237.3));
    return (eoTmax + eoTmin) / 2;
  }

  /**
   * คำนวณ Actual Vapor Pressure (kPa)
   */
  calculateActualVaporPressure(temp, humidity) {
    const eo = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    return eo * (humidity / 100);
  }

  /**
   * คำนวณ Slope of Vapor Pressure Curve (kPa/°C)
   */
  calculateVaporPressureCurveSlope(temp) {
    return (4098 * 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))) / Math.pow(temp + 237.3, 2);
  }

  /**
   * คำนวณ Psychrometric Constant (kPa/°C)
   */
  calculatePsychrometricConstant(elevation) {
    const P = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
    return 0.000665 * P;
  }

  /**
   * คำนวณ Net Radiation (MJ/m²/day)
   */
  calculateNetRadiation(Rs, tMax, tMin, ea, latitude, date) {
    // Net shortwave radiation
    const albedo = 0.23; // สำหรับพืชสีเขียว
    const Rns = (1 - albedo) * Rs;

    // Net longwave radiation
    const sigma = 4.903e-9; // Stefan-Boltzmann constant (MJ/K⁴/m²/day)
    const Rso = this.calculateClearSkyRadiation(latitude, date);

    const Rnl =
      ((sigma * (Math.pow(tMax + 273.16, 4) + Math.pow(tMin + 273.16, 4))) / 2) *
      (0.34 - 0.14 * Math.sqrt(ea)) *
      (1.35 * (Rs / Rso) - 0.35);

    return Rns - Rnl;
  }

  /**
   * คำนวณ Clear Sky Radiation (MJ/m²/day)
   */
  calculateClearSkyRadiation(latitude, date) {
    // สูตรแบบง่าย สำหรับประเทศไทย
    const dayOfYear = this.getDayOfYear(date);
    const Gsc = 0.082; // Solar constant (MJ/m²/min)
    const dr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
    const latRad = (latitude * Math.PI) / 180;
    const declination = 0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
    const ws = Math.acos(-Math.tan(latRad) * Math.tan(declination));

    const Ra =
      ((24 * 60) / Math.PI) *
      Gsc *
      dr *
      (ws * Math.sin(latRad) * Math.sin(declination) +
        Math.cos(latRad) * Math.cos(declination) * Math.sin(ws));

    return (0.75 + 2e-5 * 0) * Ra; // elevation = 0 for simplification
  }

  /**
   * หาวันที่ในรอบปี (1-365)
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /**
   * คำนวณ Crop Evapotranspiration (ETc)
   * ETc = Kc × ET₀
   * @param {number} ET0 - Reference ET
   * @param {string} cropType - ชนิดพืช
   * @param {string} growthStage - ระยะการเจริญเติบโต
   * @returns {number} ETc in mm/day
   */
  calculateCropET(ET0, cropType, growthStage) {
    const Kc = this.getCropCoefficient(cropType, growthStage);
    return ET0 * Kc;
  }

  /**
   * หาค่า Crop Coefficient (Kc)
   */
  getCropCoefficient(cropType, growthStage) {
    const cropCoefficients = {
      cannabis: {
        germination: 0.5, // แรกงอก
        seedling: 0.7, // ต้นกล้า
        vegetative: 1.0, // เจริญเติบโต
        flowering: 1.1, // ออกดอก
        ripening: 0.8 // สุกแก่
      },
      rice: {
        initial: 1.05,
        development: 1.1,
        mid: 1.2,
        late: 0.95
      },
      vegetables: {
        initial: 0.7,
        development: 0.9,
        mid: 1.05,
        late: 0.95
      }
    };

    return cropCoefficients[cropType]?.[growthStage] || 1.0;
  }
}

module.exports = ETCalculator;
```

### 6.4 Weather API Integration

เชื่อมต่อกับ API กรมอุตุนิยมวิทยา และบริการพยากรณ์อากาศอื่นๆ

**File**: `src/services/water/WeatherService.js`

```javascript
const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../../utils/logger');

/**
 * Weather Service
 * ดึงข้อมูลสภาพอากาศและพยากรณ์อากาศ
 */
class WeatherService {
  constructor() {
    // Cache สำหรับ 15 นาที
    this.cache = new NodeCache({ stdTTL: 900 });

    this.sources = {
      tmd: {
        name: 'Thai Meteorological Department',
        baseURL: process.env.TMD_API_URL || 'https://data.tmd.go.th/api',
        apiKey: process.env.TMD_API_KEY
      },
      openweather: {
        name: 'OpenWeatherMap',
        baseURL: 'https://api.openweathermap.org/data/2.5',
        apiKey: process.env.OPENWEATHER_API_KEY
      }
    };
  }

  /**
   * ดึงข้อมูลสภาพอากาศปัจจุบัน
   * @param {number} latitude - ละติจูด
   * @param {number} longitude - ลองจิจูด
   * @returns {Object} ข้อมูลสภาพอากาศ
   */
  async getCurrentWeather(latitude, longitude) {
    const cacheKey = `current_${latitude}_${longitude}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // ลอง TMD ก่อน
      let weatherData = await this.fetchFromTMD(latitude, longitude);

      // ถ้า TMD ไม่สำเร็จ ใช้ OpenWeatherMap
      if (!weatherData) {
        weatherData = await this.fetchFromOpenWeather(latitude, longitude);
      }

      if (!weatherData) {
        throw new Error('Failed to fetch weather data from all sources');
      }

      // แปลงเป็นรูปแบบมาตรฐาน
      const standardized = this.standardizeWeatherData(weatherData);

      this.cache.set(cacheKey, standardized);
      return standardized;
    } catch (error) {
      logger.error('Failed to get current weather', { error: error.message });
      throw error;
    }
  }

  /**
   * ดึงข้อมูลพยากรณ์อากาศ 7 วัน
   */
  async getWeatherForecast(latitude, longitude, days = 7) {
    const cacheKey = `forecast_${latitude}_${longitude}_${days}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.sources.openweather.baseURL}/onecall`, {
        params: {
          lat: latitude,
          lon: longitude,
          exclude: 'minutely,hourly,alerts',
          units: 'metric',
          appid: this.sources.openweather.apiKey
        },
        timeout: 10000
      });

      const forecast = response.data.daily.slice(0, days).map(day => ({
        date: new Date(day.dt * 1000),
        temperature: day.temp.day,
        temperatureMax: day.temp.max,
        temperatureMin: day.temp.min,
        humidity: day.humidity,
        windSpeed: day.wind_speed,
        precipitation: day.rain || 0,
        precipitationProbability: day.pop * 100,
        cloudCover: day.clouds,
        uvIndex: day.uvi,
        description: day.weather[0].description,
        icon: day.weather[0].icon
      }));

      this.cache.set(cacheKey, forecast);
      return forecast;
    } catch (error) {
      logger.error('Failed to get weather forecast', { error: error.message });
      throw error;
    }
  }

  /**
   * ดึงข้อมูลจาก TMD API
   */
  async fetchFromTMD(latitude, longitude) {
    if (!this.sources.tmd.apiKey) return null;

    try {
      const response = await axios.get(`${this.sources.tmd.baseURL}/Weather/current`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: this.sources.tmd.apiKey
        },
        timeout: 10000
      });

      return {
        source: 'tmd',
        data: response.data
      };
    } catch (error) {
      logger.warn('TMD API failed', { error: error.message });
      return null;
    }
  }

  /**
   * ดึงข้อมูลจาก OpenWeatherMap API
   */
  async fetchFromOpenWeather(latitude, longitude) {
    try {
      const response = await axios.get(`${this.sources.openweather.baseURL}/weather`, {
        params: {
          lat: latitude,
          lon: longitude,
          units: 'metric',
          appid: this.sources.openweather.apiKey
        },
        timeout: 10000
      });

      return {
        source: 'openweather',
        data: response.data
      };
    } catch (error) {
      logger.error('OpenWeatherMap API failed', { error: error.message });
      return null;
    }
  }

  /**
   * แปลงข้อมูลเป็นรูปแบบมาตรฐาน
   */
  standardizeWeatherData(weatherData) {
    const { source, data } = weatherData;

    if (source === 'openweather') {
      return {
        source,
        timestamp: new Date(data.dt * 1000),
        location: {
          name: data.name,
          latitude: data.coord.lat,
          longitude: data.coord.lon
        },
        temperature: data.main.temp,
        temperatureFeelsLike: data.main.feels_like,
        temperatureMax: data.main.temp_max,
        temperatureMin: data.main.temp_min,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudCover: data.clouds.all,
        precipitation: data.rain?.['1h'] || 0,
        visibility: data.visibility / 1000, // เป็น km
        description: data.weather[0].description,
        descriptionThai: this.translateWeatherDescription(data.weather[0].description),
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      };
    }

    // สำหรับ TMD API (ถ้ามี)
    return {
      source,
      ...data
    };
  }

  /**
   * แปลคำอธิบายสภาพอากาศเป็นภาษาไทย
   */
  translateWeatherDescription(description) {
    const translations = {
      'clear sky': 'ท้องฟ้าแจ่มใส',
      'few clouds': 'มีเมฆบางส่วน',
      'scattered clouds': 'มีเมฆกระจาย',
      'broken clouds': 'มีเมฆมาก',
      'overcast clouds': 'ท้องฟ้าครึ้ม',
      'light rain': 'ฝนตกเล็กน้อย',
      'moderate rain': 'ฝนตกปานกลาง',
      'heavy rain': 'ฝนตกหนัก',
      thunderstorm: 'พายุฝนฟ้าคะนอง',
      mist: 'มีหมอก',
      fog: 'หมอกหนา'
    };

    return translations[description.toLowerCase()] || description;
  }

  /**
   * คำนวณ Solar Radiation จากข้อมูลสภาพอากาศ
   * ใช้สำหรับคำนวณ ET เมื่อไม่มีข้อมูล Solar Radiation โดยตรง
   */
  estimateSolarRadiation(weatherData) {
    const { latitude, cloudCover, date = new Date() } = weatherData;

    // คำนวณ Clear Sky Radiation
    const etCalc = require('./ETCalculator');
    const calculator = new etCalc();
    const Rso = calculator.calculateClearSkyRadiation(latitude, date);

    // ปรับด้วย Cloud Cover
    const cloudFactor = 1 - (cloudCover / 100) * 0.75;
    const Rs = Rso * cloudFactor;

    return Rs;
  }
}

module.exports = WeatherService;
```

### 6.5 Smart Irrigation Scheduling Service

สร้างตารางการให้น้ำอัตโนมัติโดยพิจารณาจาก ET, สภาพอากาศ, และความชื้นในดิน

**File**: `src/services/water/IrrigationScheduler.js`

```javascript
const ETCalculator = require('./ETCalculator');
const WeatherService = require('./WeatherService');
const SensorReading = require('../../models/SensorReading');
const logger = require('../../utils/logger');

/**
 * Smart Irrigation Scheduler
 * สร้างตารางการให้น้ำอัตโนมัติ
 */
class IrrigationScheduler {
  constructor() {
    this.etCalculator = new ETCalculator();
    this.weatherService = new WeatherService();
  }

  /**
   * สร้างตารางการให้น้ำ
   * @param {Object} farmData - ข้อมูลฟาร์ม
   * @returns {Object} ตารางการให้น้ำ
   */
  async generateSchedule(farmData) {
    const {
      farmId,
      cropType,
      growthStage,
      soilType,
      latitude,
      longitude,
      elevation = 0,
      farmSize // rai
    } = farmData;

    try {
      // 1. ดึงข้อมูลสภาพอากาศปัจจุบันและพยากรณ์
      const currentWeather = await this.weatherService.getCurrentWeather(latitude, longitude);
      const forecast = await this.weatherService.getWeatherForecast(latitude, longitude, 7);

      // 2. ดึงข้อมูลความชื้นในดินจากเซ็นเซอร์
      const soilMoisture = await this.getSoilMoistureData(farmId);

      // 3. คำนวณ ET₀ และ ETc
      const weatherData = {
        ...currentWeather,
        elevation,
        latitude,
        date: new Date()
      };

      // ประมาณ Solar Radiation ถ้าไม่มี
      if (!weatherData.solarRadiation) {
        weatherData.solarRadiation = this.weatherService.estimateSolarRadiation(weatherData);
      }

      const ET0 = this.etCalculator.calculateDailyET0(weatherData);
      const ETc = this.etCalculator.calculateCropET(ET0, cropType, growthStage);

      // 4. คำนวณ Water Balance
      const waterBalance = this.calculateWaterBalance({
        soilMoisture,
        ETc,
        precipitation: currentWeather.precipitation || 0,
        soilType,
        farmSize
      });

      // 5. สร้างตารางการให้น้ำ 7 วันข้างหน้า
      const schedule = await this.createWeeklySchedule({
        ETc,
        forecast,
        soilType,
        cropType,
        growthStage,
        currentSoilMoisture: soilMoisture.current,
        waterBalance
      });

      // 6. คำนวณปริมาณน้ำรวมและต้นทุน
      const summary = this.calculateScheduleSummary(schedule, farmSize);

      return {
        farmId,
        generatedAt: new Date(),
        currentConditions: {
          soilMoisture: soilMoisture.current,
          weather: {
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            description: currentWeather.descriptionThai
          },
          ET0,
          ETc,
          waterBalance
        },
        schedule,
        summary,
        recommendations: this.generateRecommendations(waterBalance, schedule)
      };
    } catch (error) {
      logger.error('Failed to generate irrigation schedule', { error: error.message, farmId });
      throw error;
    }
  }

  /**
   * ดึงข้อมูลความชื้นในดินจากเซ็นเซอร์
   */
  async getSoilMoistureData(farmId) {
    try {
      const readings = await SensorReading.find({
        farmId,
        sensorType: 'soil_moisture',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
        .sort({ timestamp: -1 })
        .limit(24)
        .lean();

      if (readings.length === 0) {
        return {
          current: 50, // default
          average24h: 50,
          trend: 'stable',
          hasData: false
        };
      }

      const current = readings[0].value;
      const average24h = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
      const trend = this.calculateMoistureTrend(readings);

      return {
        current,
        average24h,
        trend,
        hasData: true,
        lastUpdated: readings[0].timestamp
      };
    } catch (error) {
      logger.warn('Failed to get soil moisture data', { error: error.message });
      return {
        current: 50,
        average24h: 50,
        trend: 'stable',
        hasData: false
      };
    }
  }

  /**
   * คำนวณแนวโน้มความชื้นในดิน
   */
  calculateMoistureTrend(readings) {
    if (readings.length < 3) return 'stable';

    const recent = readings.slice(0, 6);
    const older = readings.slice(6, 12);

    const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.value, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * คำนวณสมดุลน้ำในดิน (Water Balance)
   */
  calculateWaterBalance({ soilMoisture, ETc, precipitation, soilType, farmSize }) {
    // Available Water Capacity (AWC) ตามประเภทดิน
    const AWC = {
      clay: 200, // ดินเหนียว (mm)
      loam: 170, // ดินร่วน (mm)
      sandy_loam: 130, // ดินร่วนปนทราย (mm)
      sand: 80 // ดินทราย (mm)
    };

    const capacity = AWC[soilType] || 170; // default = loam

    // คำนวณปริมาณน้ำที่พืชใช้ได้ (mm)
    const availableWater = (soilMoisture.current / 100) * capacity;

    // คำนวณการเปลี่ยนแปลง
    const waterLoss = ETc; // การคายระเหย (mm/day)
    const waterGain = precipitation; // ฝน (mm/day)
    const netChange = waterGain - waterLoss;

    // คำนวณความชื้นคาดการณ์พรุ่งนี้
    const projectedMoisture = Math.max(
      0,
      Math.min(100, soilMoisture.current + (netChange / capacity) * 100)
    );

    // Management Allowed Depletion (MAD)
    const MAD = this.getMAD(soilMoisture.current);

    // สถานะ
    let status = 'optimal';
    let urgency = 'none';

    if (soilMoisture.current < 30) {
      status = 'critical';
      urgency = 'urgent';
    } else if (soilMoisture.current < 50) {
      status = 'low';
      urgency = 'high';
    } else if (soilMoisture.current < 65) {
      status = 'moderate';
      urgency = 'medium';
    } else if (soilMoisture.current > 85) {
      status = 'excessive';
      urgency = 'none';
    }

    return {
      currentMoisture: soilMoisture.current,
      availableWater,
      capacity,
      waterLoss,
      waterGain,
      netChange,
      projectedMoisture,
      MAD,
      status,
      urgency,
      daysUntilCritical: this.calculateDaysUntilCritical(
        soilMoisture.current,
        ETc,
        precipitation,
        capacity
      )
    };
  }

  /**
   * หา Management Allowed Depletion (%)
   */
  getMAD(currentMoisture) {
    // MAD = ระดับความชื้นที่ลดลงได้ก่อนต้องให้น้ำ
    if (currentMoisture > 80) return 30; // ให้ลดได้ 30%
    if (currentMoisture > 60) return 40;
    if (currentMoisture > 40) return 50;
    return 60;
  }

  /**
   * คำนวณจำนวนวันก่อนถึงระดับวิกฤต
   */
  calculateDaysUntilCritical(currentMoisture, ETc, precipitation, capacity) {
    const criticalMoisture = 30; // %
    const dailyChange = ((precipitation - ETc) / capacity) * 100;

    if (dailyChange >= 0) return Infinity; // ไม่มีวันวิกฤต

    const daysUntilCritical = (currentMoisture - criticalMoisture) / Math.abs(dailyChange);
    return Math.max(0, Math.ceil(daysUntilCritical));
  }

  /**
   * สร้างตารางการให้น้ำ 7 วัน
   */
  async createWeeklySchedule(params) {
    const { ETc, forecast, soilType, cropType, growthStage, currentSoilMoisture, waterBalance } =
      params;

    const schedule = [];
    let simulatedMoisture = currentSoilMoisture;

    for (let day = 0; day < 7; day++) {
      const dayForecast = forecast[day];
      const date = new Date(dayForecast.date);

      // คำนวณ ETc สำหรับวันนี้
      const dailyETc = ETc; // สามารถปรับตามอุณหภูมิได้

      // ฝนที่คาดว่าจะตก
      const expectedRain = dayForecast.precipitation || 0;

      // คำนวณความชื้นคาดการณ์
      const AWC = { clay: 200, loam: 170, sandy_loam: 130, sand: 80 }[soilType] || 170;
      const moistureChange = ((expectedRain - dailyETc) / AWC) * 100;
      simulatedMoisture = Math.max(0, Math.min(100, simulatedMoisture + moistureChange));

      // ตัดสินใจว่าต้องให้น้ำหรือไม่
      const needsIrrigation = this.shouldIrrigate({
        soilMoisture: simulatedMoisture,
        ETc: dailyETc,
        precipitation: expectedRain,
        precipitationProbability: dayForecast.precipitationProbability,
        growthStage
      });

      let irrigationAmount = 0;
      let method = 'none';
      let duration = 0;

      if (needsIrrigation) {
        // คำนวณปริมาณน้ำที่ต้องให้
        const targetMoisture = 75; // เป้าหมาย 75%
        const deficit = ((targetMoisture - simulatedMoisture) / 100) * AWC;
        irrigationAmount = Math.max(0, deficit - expectedRain);

        // เลือกวิธีการให้น้ำ
        method = this.selectIrrigationMethod(cropType, growthStage);

        // คำนวณระยะเวลา (สมมติ flow rate = 10 mm/hour)
        duration = Math.ceil((irrigationAmount / 10) * 60); // นาที

        // อัพเดทความชื้นหลังให้น้ำ
        simulatedMoisture = Math.min(100, simulatedMoisture + (irrigationAmount / AWC) * 100);
      }

      schedule.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: this.getDayOfWeekThai(date),
        needsIrrigation,
        irrigation: {
          amount: Math.round(irrigationAmount), // mm
          method,
          duration, // minutes
          timing: needsIrrigation ? this.getOptimalTiming(dayForecast) : null
        },
        conditions: {
          temperature: dayForecast.temperature,
          humidity: dayForecast.humidity,
          precipitation: expectedRain,
          precipitationProbability: dayForecast.precipitationProbability,
          ETc: Math.round(dailyETc * 10) / 10
        },
        soilMoisture: {
          morning: Math.round(simulatedMoisture - moistureChange),
          evening: Math.round(simulatedMoisture),
          status: this.getMoistureStatus(simulatedMoisture)
        }
      });
    }

    return schedule;
  }

  /**
   * ตัดสินใจว่าควรให้น้ำหรือไม่
   */
  shouldIrrigate({ soilMoisture, ETc, precipitation, precipitationProbability, growthStage }) {
    // ไม่ให้น้ำถ้าฝนจะตกแน่นอน (>80%)
    if (precipitationProbability > 80 && precipitation > ETc) {
      return false;
    }

    // ให้น้ำถ้าความชื้นต่ำกว่า threshold
    const thresholds = {
      germination: 70,
      seedling: 65,
      vegetative: 60,
      flowering: 55,
      ripening: 50
    };

    const threshold = thresholds[growthStage] || 60;

    return soilMoisture < threshold;
  }

  /**
   * เลือกวิธีการให้น้ำที่เหมาะสม
   */
  selectIrrigationMethod(cropType, growthStage) {
    // สำหรับกัญชา แนะนำ drip irrigation
    if (cropType === 'cannabis') {
      if (growthStage === 'flowering' || growthStage === 'ripening') {
        return 'drip_slow'; // ให้น้ำช้าๆ ในช่วงออกดอก
      }
      return 'drip_regular';
    }

    // สำหรับข้าว
    if (cropType === 'rice') {
      return 'flood'; // ขังน้ำ
    }

    // default
    return 'drip_regular';
  }

  /**
   * หาเวลาที่เหมาะสมในการให้น้ำ
   */
  getOptimalTiming(dayForecast) {
    const { temperature, humidity } = dayForecast;

    // ถ้าอากาศร้อนมาก ให้น้ำเช้ามืด
    if (temperature > 35) {
      return {
        time: '05:00-07:00',
        reason: 'อากาศร้อนมาก ให้น้ำเช้ามืดเพื่อลดการคายระเหย'
      };
    }

    // ถ้าความชื้นต่ำ ให้น้ำเช้า
    if (humidity < 50) {
      return {
        time: '06:00-08:00',
        reason: 'ความชื้นต่ำ ให้น้ำตอนเช้าเพื่อให้พืชดูดซึมได้ดี'
      };
    }

    // ปกติให้น้ำเช้าหรือเย็น
    return {
      time: '06:00-08:00 หรือ 16:00-18:00',
      reason: 'ให้น้ำตอนเช้าหรือเย็นเพื่อประสิทธิภาพสูงสุด'
    };
  }

  /**
   * หาชื่อวันเป็นภาษาไทย
   */
  getDayOfWeekThai(date) {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[date.getDay()];
  }

  /**
   * หาสถานะความชื้นในดิน
   */
  getMoistureStatus(moisture) {
    if (moisture < 30) return 'วิกฤต';
    if (moisture < 50) return 'ต่ำ';
    if (moisture < 65) return 'ปานกลาง';
    if (moisture < 80) return 'ดี';
    if (moisture < 90) return 'ดีมาก';
    return 'มากเกินไป';
  }

  /**
   * สรุปตารางการให้น้ำ
   */
  calculateScheduleSummary(schedule, farmSize) {
    const totalIrrigationDays = schedule.filter(day => day.needsIrrigation).length;
    const totalWaterAmount = schedule.reduce((sum, day) => sum + day.irrigation.amount, 0);

    // แปลงจาก mm เป็น ลูกบาศก์เมตร
    // 1 mm = 1 liter/m² = 0.001 m³/m²
    // 1 rai = 1,600 m²
    const totalWaterM3 = (totalWaterAmount / 1000) * (farmSize * 1600);

    // ต้นทุนน้ำ (สมมติ 5 บาท/m³)
    const waterCostPerM3 = 5;
    const totalCost = totalWaterM3 * waterCostPerM3;

    // ต้นทุนไฟฟ้า (สมมติปั๊มใช้ 2 kW, 4 บาท/kWh)
    const totalDuration = schedule.reduce((sum, day) => sum + day.irrigation.duration, 0);
    const electricityCost = (totalDuration / 60) * 2 * 4;

    return {
      totalIrrigationDays,
      totalWaterAmount: Math.round(totalWaterAmount), // mm
      totalWaterVolume: Math.round(totalWaterM3), // m³
      avgDailyWater: Math.round(totalWaterAmount / 7), // mm/day
      waterCost: Math.round(totalCost),
      electricityCost: Math.round(electricityCost),
      totalCost: Math.round(totalCost + electricityCost),
      estimatedSavings: this.calculateSavings(schedule, farmSize)
    };
  }

  /**
   * คำนวณการประหยัดน้ำเทียบกับการให้น้ำแบบธรรมดา
   */
  calculateSavings(schedule, farmSize) {
    // สมมติให้น้ำแบบธรรมดาวันละ 20 mm
    const traditionalWater = 20 * 7;
    const smartWater = schedule.reduce((sum, day) => sum + day.irrigation.amount, 0);
    const savedMM = traditionalWater - smartWater;
    const savedPercent = (savedMM / traditionalWater) * 100;

    const savedM3 = (savedMM / 1000) * (farmSize * 1600);
    const savedCost = savedM3 * 5;

    return {
      waterSaved: Math.round(savedMM), // mm
      volumeSaved: Math.round(savedM3), // m³
      percentSaved: Math.round(savedPercent), // %
      costSaved: Math.round(savedCost) // บาท
    };
  }

  /**
   * สร้างคำแนะนำ
   */
  generateRecommendations(waterBalance, schedule) {
    const recommendations = [];

    // คำแนะนำตามสถานะความชื้น
    if (waterBalance.status === 'critical') {
      recommendations.push({
        priority: 'urgent',
        category: 'ความชื้นในดิน',
        message: 'ความชื้นในดินอยู่ในระดับวิกฤต ต้องให้น้ำทันที!',
        action: 'ให้น้ำอย่างน้อย 15-20 mm เพื่อฟื้นฟูความชื้น'
      });
    }

    if (waterBalance.daysUntilCritical <= 2) {
      recommendations.push({
        priority: 'high',
        category: 'เตือนล่วงหน้า',
        message: `คาดการณ์ว่าจะถึงระดับวิกฤตใน ${waterBalance.daysUntilCritical} วัน`,
        action: 'วางแผนการให้น้ำล่วงหน้า'
      });
    }

    // คำแนะนำเรื่องฝน
    const rainyDays = schedule.filter(d => d.conditions.precipitationProbability > 60).length;
    if (rainyDays >= 3) {
      recommendations.push({
        priority: 'medium',
        category: 'พยากรณ์อากาศ',
        message: `คาดว่าจะมีฝนตก ${rainyDays} วัน ในสัปดาห์นี้`,
        action: 'อาจลดการให้น้ำได้ ตรวจสอบความชื้นอย่างสม่ำเสมอ'
      });
    }

    // คำแนะนำประหยัดน้ำ
    const totalIrrigation = schedule.filter(d => d.needsIrrigation).length;
    if (totalIrrigation > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'การจัดการน้ำ',
        message: 'ต้องให้น้ำบ่อยในสัปดาห์นี้ (มากกว่า 5 วัน)',
        action: 'พิจารณาเพิ่ม mulch เพื่อลดการคายระเหย'
      });
    }

    return recommendations;
  }
}

module.exports = IrrigationScheduler;
```

### 6.6 Water Usage Optimization

วิเคราะห์และเพิ่มประสิทธิภาพการใช้น้ำ

**File**: `src/services/water/WaterOptimizer.js`

```javascript
const SensorReading = require('../../models/SensorReading');
const IrrigationLog = require('../../models/IrrigationLog');
const logger = require('../../utils/logger');

/**
 * Water Usage Optimizer
 * วิเคราะห์และแนะนำวิธีประหยัดน้ำ
 */
class WaterOptimizer {
  /**
   * วิเคราะห์การใช้น้ำในอดีต
   */
  async analyzeWaterUsage(farmId, startDate, endDate) {
    try {
      // ดึงข้อมูลการให้น้ำ
      const irrigationLogs = await IrrigationLog.find({
        farmId,
        timestamp: { $gte: startDate, $lte: endDate }
      })
        .sort({ timestamp: 1 })
        .lean();

      if (irrigationLogs.length === 0) {
        return {
          hasData: false,
          message: 'ไม่มีข้อมูลการให้น้ำในช่วงเวลาที่เลือก'
        };
      }

      // คำนวณสถิติ
      const totalWater = irrigationLogs.reduce((sum, log) => sum + log.amount, 0);
      const avgDaily = totalWater / this.getDaysBetween(startDate, endDate);
      const totalCost = irrigationLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

      // วิเคราะห์รูปแบบการให้น้ำ
      const patterns = this.analyzeIrrigationPatterns(irrigationLogs);

      // หาปัญหาและโอกาสปรับปรุง
      const issues = this.identifyIssues(irrigationLogs, patterns);

      // คำนวณประสิทธิภาพ
      const efficiency = await this.calculateEfficiency(farmId, irrigationLogs);

      // เปรียบเทียบกับค่ามาตรฐาน
      const benchmark = this.getBenchmark(irrigationLogs[0].cropType);
      const comparison = {
        waterUsage: ((avgDaily / benchmark.avgDaily - 1) * 100).toFixed(1),
        efficiency: efficiency.score,
        status: efficiency.score >= 80 ? 'ดีมาก' : efficiency.score >= 60 ? 'ดี' : 'ต้องปรับปรุง'
      };

      return {
        hasData: true,
        period: {
          start: startDate,
          end: endDate,
          days: this.getDaysBetween(startDate, endDate)
        },
        summary: {
          totalWater,
          avgDaily: Math.round(avgDaily * 10) / 10,
          totalCost: Math.round(totalCost),
          totalEvents: irrigationLogs.length
        },
        patterns,
        efficiency,
        comparison,
        issues,
        recommendations: this.generateOptimizationRecommendations(patterns, efficiency, issues)
      };
    } catch (error) {
      logger.error('Failed to analyze water usage', { error: error.message });
      throw error;
    }
  }

  /**
   * วิเคราะห์รูปแบบการให้น้ำ
   */
  analyzeIrrigationPatterns(logs) {
    // แยกตามเวลาในวัน
    const timeDistribution = {
      morning: 0, // 05:00-09:00
      midday: 0, // 09:00-15:00
      afternoon: 0, // 15:00-19:00
      night: 0 // 19:00-05:00
    };

    // แยกตามวันในสัปดาห์
    const dayDistribution = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0
    };

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const day = new Date(log.timestamp).getDay();

      // เวลา
      if (hour >= 5 && hour < 9) timeDistribution.morning++;
      else if (hour >= 9 && hour < 15) timeDistribution.midday++;
      else if (hour >= 15 && hour < 19) timeDistribution.afternoon++;
      else timeDistribution.night++;

      // วัน
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      dayDistribution[dayNames[day]]++;
    });

    // คำนวณความสม่ำเสมอ
    const intervals = [];
    for (let i = 1; i < logs.length; i++) {
      const diff = (logs[i].timestamp - logs[i - 1].timestamp) / (1000 * 60 * 60 * 24);
      intervals.push(diff);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
    );

    const consistency =
      stdDev < 1
        ? 'สม่ำเสมอมาก'
        : stdDev < 2
          ? 'สม่ำเสมอ'
          : stdDev < 3
            ? 'ค่อนข้างสม่ำเสมอ'
            : 'ไม่สม่ำเสมอ';

    return {
      timeDistribution,
      dayDistribution,
      consistency,
      avgInterval: Math.round(avgInterval * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10
    };
  }

  /**
   * คำนวณประสิทธิภาพการใช้น้ำ
   */
  async calculateEfficiency(farmId, irrigationLogs) {
    // ดึงข้อมูลความชื้นในดินหลังให้น้ำ
    const efficiencyScores = [];

    for (const log of irrigationLogs) {
      // ดูความชื้นก่อนและหลังให้น้ำ
      const before = await this.getSoilMoisture(farmId, log.timestamp, -30); // 30 นาทีก่อน
      const after = await this.getSoilMoisture(farmId, log.timestamp, 60); // 60 นาทีหลัง

      if (before && after) {
        const increase = after - before;
        const expected = (log.amount / 170) * 100; // สมมติ AWC = 170mm

        // ประสิทธิภาพ = การเพิ่มขึ้นจริง / คาดหวัง
        const efficiency = Math.min(100, (increase / expected) * 100);
        efficiencyScores.push(efficiency);
      }
    }

    const avgEfficiency =
      efficiencyScores.length > 0
        ? efficiencyScores.reduce((sum, s) => sum + s, 0) / efficiencyScores.length
        : 75; // default

    // ประเมินผล
    let rating,
      issues = [];

    if (avgEfficiency >= 90) {
      rating = 'excellent';
    } else if (avgEfficiency >= 75) {
      rating = 'good';
    } else if (avgEfficiency >= 60) {
      rating = 'fair';
      issues.push('ควรปรับปรุงระบบการให้น้ำเพื่อเพิ่มประสิทธิภาพ');
    } else {
      rating = 'poor';
      issues.push('มีปัญหาการสูญเสียน้ำสูง ต้องตรวจสอบระบบ');
    }

    return {
      score: Math.round(avgEfficiency),
      rating,
      ratingThai: {
        excellent: 'ดีเยี่ยม',
        good: 'ดี',
        fair: 'พอใช้',
        poor: 'ต้องปรับปรุง'
      }[rating],
      issues,
      dataPoints: efficiencyScores.length
    };
  }

  /**
   * ดึงค่าความชื้นในดิน ณ เวลาที่กำหนด
   */
  async getSoilMoisture(farmId, timestamp, offsetMinutes = 0) {
    const targetTime = new Date(timestamp.getTime() + offsetMinutes * 60000);
    const reading = await SensorReading.findOne({
      farmId,
      sensorType: 'soil_moisture',
      timestamp: {
        $gte: new Date(targetTime.getTime() - 15 * 60000),
        $lte: new Date(targetTime.getTime() + 15 * 60000)
      }
    })
      .sort({ timestamp: 1 })
      .lean();

    return reading?.value || null;
  }

  /**
   * ระบุปัญหาและโอกาสปรับปรุง
   */
  identifyIssues(logs, patterns) {
    const issues = [];

    // ตรวจสอบการให้น้ำเวลาที่ไม่เหมาะสม
    if (patterns.timeDistribution.midday > logs.length * 0.3) {
      issues.push({
        severity: 'high',
        category: 'เวลาให้น้ำ',
        issue: 'ให้น้ำเวลากลางวันมากเกินไป',
        impact: 'น้ำคายระเหยสูง ประสิทธิภาพต่ำ',
        recommendation: 'ควรเปลี่ยนมาให้น้ำตอนเช้าหรือเย็น'
      });
    }

    // ตรวจสอบความไม่สม่ำเสมอ
    if (patterns.stdDev > 3) {
      issues.push({
        severity: 'medium',
        category: 'ความสม่ำเสมอ',
        issue: 'การให้น้ำไม่สม่ำเสมอ',
        impact: 'พืชเครียด ผลผลิตไม่สม่ำเสมอ',
        recommendation: 'ควรสร้างตารางการให้น้ำที่แน่นอน'
      });
    }

    // ตรวจสอบปริมาณน้ำแต่ละครั้ง
    const avgAmount = logs.reduce((sum, log) => sum + log.amount, 0) / logs.length;
    if (avgAmount < 5) {
      issues.push({
        severity: 'medium',
        category: 'ปริมาณน้ำ',
        issue: 'ให้น้ำแต่ละครั้งน้อยเกินไป',
        impact: 'น้ำไม่ซึมลึก รากพืชตื้น',
        recommendation: 'ควรให้น้ำมากขึ้นแต่ถี่น้อยลง'
      });
    } else if (avgAmount > 30) {
      issues.push({
        severity: 'medium',
        category: 'ปริมาณน้ำ',
        issue: 'ให้น้ำแต่ละครั้งมากเกินไป',
        impact: 'น้ำท่วมขัง เสี่ยงโรคราก',
        recommendation: 'ควรแบ่งให้น้ำหลายครั้ง'
      });
    }

    return issues;
  }

  /**
   * สร้างคำแนะนำการเพิ่มประสิทธิภาพ
   */
  generateOptimizationRecommendations(patterns, efficiency, issues) {
    const recommendations = [];

    // คำแนะนำหลัก
    if (efficiency.score < 80) {
      recommendations.push({
        priority: 1,
        category: 'ประสิทธิภาพ',
        title: 'เพิ่มประสิทธิภาพการใช้น้ำ',
        actions: [
          'ตรวจสอบระบบท่อและหัวน้ำหยด อาจมีการรั่วไหล',
          'ใช้ Mulch คลุมดินเพื่อลดการคายระเหย',
          'ปรับแรงดันน้ำให้เหมาะสม',
          'ตรวจสอบเซ็นเซอร์ความชื้นว่าทำงานถูกต้อง'
        ],
        expectedBenefit: 'ประหยัดน้ำได้ 15-25%'
      });
    }

    // คำแนะนำจาก issues
    issues.forEach((issue, index) => {
      recommendations.push({
        priority: issue.severity === 'high' ? 2 : 3,
        category: issue.category,
        title: issue.issue,
        actions: [issue.recommendation],
        expectedBenefit: 'ลดปัญหา: ' + issue.impact
      });
    });

    // คำแนะนำทั่วไป
    if (patterns.timeDistribution.morning < logs.length * 0.5) {
      recommendations.push({
        priority: 2,
        category: 'เวลาให้น้ำ',
        title: 'ปรับเวลาให้น้ำ',
        actions: [
          'ให้น้ำตอนเช้า 06:00-08:00 เป็นหลัก',
          'หลีกเลี่ยงการให้น้ำเวลา 11:00-15:00',
          'สามารถให้น้ำเย็นได้ถ้าจำเป็น (16:00-18:00)'
        ],
        expectedBenefit: 'ลดการคายระเหยได้ 20-30%'
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * หาค่า benchmark สำหรับเปรียบเทียบ
   */
  getBenchmark(cropType) {
    const benchmarks = {
      cannabis: {
        avgDaily: 5, // mm/day
        efficiency: 75, // %
        costPerRai: 500 // บาท/เดือน
      },
      rice: {
        avgDaily: 8,
        efficiency: 60,
        costPerRai: 300
      },
      vegetables: {
        avgDaily: 6,
        efficiency: 70,
        costPerRai: 400
      }
    };

    return benchmarks[cropType] || benchmarks.cannabis;
  }

  /**
   * คำนวณจำนวนวันระหว่างวันที่
   */
  getDaysBetween(start, end) {
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }
}

module.exports = WaterOptimizer;
```

### 6.7 Water Management API Controller

API endpoints สำหรับจัดการน้ำและตารางการให้น้ำ

**File**: `src/controllers/waterController.js`

```javascript
const IrrigationScheduler = require('../services/water/IrrigationScheduler');
const WaterOptimizer = require('../services/water/WaterOptimizer');
const Farm = require('../models/Farm');
const IrrigationLog = require('../models/IrrigationLog');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

const irrigationScheduler = new IrrigationScheduler();
const waterOptimizer = new WaterOptimizer();

/**
 * GET /api/water/:farmId/schedule
 * สร้างตารางการให้น้ำ 7 วัน
 */
exports.getIrrigationSchedule = async (req, res) => {
  try {
    const { farmId } = req.params;

    // ดึงข้อมูลฟาร์ม
    const farm = await Farm.findById(farmId).select('farmName location crops soilType area').lean();

    if (!farm) {
      return res.status(404).json(ApiResponse.error('ไม่พบข้อมูลฟาร์ม', 404));
    }

    // ตรวจสอบว่ามีพิกัดหรือไม่
    if (!farm.location?.coordinates) {
      return res.status(400).json(ApiResponse.error('กรุณาระบุพิกัดที่ตั้งฟาร์มก่อน', 400));
    }

    const [longitude, latitude] = farm.location.coordinates;

    // เตรียมข้อมูลสำหรับสร้างตาราง
    const farmData = {
      farmId,
      cropType: farm.crops?.[0]?.cropType || 'cannabis',
      growthStage: farm.crops?.[0]?.currentStage || 'vegetative',
      soilType: farm.soilType || 'loam',
      latitude,
      longitude,
      elevation: farm.location?.elevation || 0,
      farmSize: farm.area || 1
    };

    // สร้างตารางการให้น้ำ
    const schedule = await irrigationScheduler.generateSchedule(farmData);

    res.json(ApiResponse.success(schedule, 'สร้างตารางการให้น้ำสำเร็จ'));
  } catch (error) {
    logger.error('Failed to generate irrigation schedule', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถสร้างตารางการให้น้ำได้', 500, error.message));
  }
};

/**
 * POST /api/water/:farmId/irrigation
 * บันทึกการให้น้ำ
 */
exports.logIrrigation = async (req, res) => {
  try {
    const { farmId } = req.params;
    const {
      amount, // mm
      duration, // minutes
      method, // drip_regular, drip_slow, flood, sprinkler
      notes
    } = req.body;

    // Validate
    if (!amount || amount <= 0) {
      return res.status(400).json(ApiResponse.error('กรุณาระบุปริมาณน้ำ', 400));
    }

    // สร้าง log
    const log = new IrrigationLog({
      farmId,
      amount,
      duration: duration || 0,
      method: method || 'manual',
      notes,
      timestamp: new Date(),
      userId: req.user.userId
    });

    await log.save();

    logger.info('Irrigation logged', { farmId, amount, method });

    res.json(ApiResponse.success(log, 'บันทึกการให้น้ำสำเร็จ'));
  } catch (error) {
    logger.error('Failed to log irrigation', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถบันทึกการให้น้ำได้', 500, error.message));
  }
};

/**
 * GET /api/water/:farmId/history
 * ดูประวัติการให้น้ำ
 */
exports.getIrrigationHistory = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { farmId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const history = await IrrigationLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    // คำนวณสถิติ
    const totalWater = history.reduce((sum, log) => sum + log.amount, 0);
    const avgDaily = history.length > 0 ? totalWater / history.length : 0;

    res.json(
      ApiResponse.success({
        history,
        statistics: {
          totalEntries: history.length,
          totalWater: Math.round(totalWater),
          avgDaily: Math.round(avgDaily * 10) / 10
        }
      })
    );
  } catch (error) {
    logger.error('Failed to get irrigation history', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถดึงประวัติการให้น้ำได้', 500, error.message));
  }
};

/**
 * GET /api/water/:farmId/analysis
 * วิเคราะห์การใช้น้ำและแนะนำการปรับปรุง
 */
exports.getWaterAnalysis = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // วิเคราะห์การใช้น้ำ
    const analysis = await waterOptimizer.analyzeWaterUsage(farmId, startDate, endDate);

    if (!analysis.hasData) {
      return res.json(
        ApiResponse.success({
          hasData: false,
          message: analysis.message
        })
      );
    }

    res.json(ApiResponse.success(analysis, 'วิเคราะห์การใช้น้ำสำเร็จ'));
  } catch (error) {
    logger.error('Failed to analyze water usage', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถวิเคราะห์การใช้น้ำได้', 500, error.message));
  }
};

/**
 * GET /api/water/:farmId/stress-detection
 * ตรวจจับสัญญาณพืชขาดน้ำ
 */
exports.detectWaterStress = async (req, res) => {
  try {
    const { farmId } = req.params;

    // ดึงข้อมูลความชื้นในดินล่าสุด
    const soilMoisture = await irrigationScheduler.getSoilMoistureData(farmId);

    if (!soilMoisture.hasData) {
      return res.json(
        ApiResponse.success({
          hasStress: false,
          message: 'ไม่มีข้อมูลเซ็นเซอร์ความชื้นในดิน',
          recommendation: 'ติดตั้งเซ็นเซอร์เพื่อเฝ้าระวังสถานะน้ำ'
        })
      );
    }

    // ประเมินสถานะ
    let hasStress = false;
    let severity = 'none';
    let message = '';
    let recommendations = [];

    if (soilMoisture.current < 30) {
      hasStress = true;
      severity = 'critical';
      message = 'พืชขาดน้ำอย่างรุนแรง ต้องให้น้ำทันที!';
      recommendations = [
        'ให้น้ำทันที 15-20 mm',
        'ตรวจสอบระบบน้ำหยดว่าทำงานปกติหรือไม่',
        'เฝ้าระวังอาการเหี่ยวของพืช',
        'หลีกเลี่ยงการให้น้ำเวลากลางวัน'
      ];
    } else if (soilMoisture.current < 45) {
      hasStress = true;
      severity = 'moderate';
      message = 'ความชื้นในดินต่ำ พืชเริ่มมีสัญญาณขาดน้ำ';
      recommendations = [
        'ให้น้ำ 10-15 mm ภายในวันนี้',
        'เพิ่มความถี่ในการตรวจสอบความชื้น',
        'พิจารณาใช้ mulch เพื่อรักษาความชื้น'
      ];
    } else if (soilMoisture.current < 55) {
      hasStress = true;
      severity = 'mild';
      message = 'ความชื้นในดินใกล้ถึงระดับที่ควรให้น้ำ';
      recommendations = ['วางแผนให้น้ำภายใน 24 ชั่วโมง', 'ติดตามพยากรณ์อากาศ ถ้าจะมีฝนอาจรอได้'];
    } else {
      message = 'ความชื้นในดินอยู่ในระดับที่เหมาะสม';
      recommendations = ['ติดตามความชื้นต่อเนื่อง', 'ปฏิบัติตามตารางการให้น้ำตามปกติ'];
    }

    // แนวโน้ม
    const trend = soilMoisture.trend;
    if (trend === 'decreasing' && soilMoisture.current < 60) {
      recommendations.push('ความชื้นกำลังลดลง ควรเตรียมให้น้ำเร็วขึ้น');
    }

    res.json(
      ApiResponse.success({
        hasStress,
        severity,
        message,
        currentMoisture: soilMoisture.current,
        average24h: soilMoisture.average24h,
        trend: soilMoisture.trend,
        lastUpdated: soilMoisture.lastUpdated,
        recommendations
      })
    );
  } catch (error) {
    logger.error('Failed to detect water stress', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถตรวจจับสัญญาณขาดน้ำได้', 500, error.message));
  }
};

/**
 * POST /api/water/:farmId/auto-irrigation
 * เปิด/ปิดระบบให้น้ำอัตโนมัติ
 */
exports.toggleAutoIrrigation = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { enabled, settings } = req.body;

    const farm = await Farm.findByIdAndUpdate(
      farmId,
      {
        'settings.autoIrrigation': {
          enabled: enabled === true,
          settings: settings || {},
          lastUpdated: new Date(),
          updatedBy: req.user.userId
        }
      },
      { new: true }
    );

    if (!farm) {
      return res.status(404).json(ApiResponse.error('ไม่พบข้อมูลฟาร์ม', 404));
    }

    logger.info('Auto irrigation toggled', { farmId, enabled });

    res.json(
      ApiResponse.success(
        {
          farmId,
          autoIrrigation: farm.settings.autoIrrigation
        },
        `${enabled ? 'เปิด' : 'ปิด'}ระบบให้น้ำอัตโนมัติสำเร็จ`
      )
    );
  } catch (error) {
    logger.error('Failed to toggle auto irrigation', {
      error: error.message,
      farmId: req.params.farmId
    });
    res.status(500).json(ApiResponse.error('ไม่สามารถเปลี่ยนการตั้งค่าได้', 500, error.message));
  }
};

module.exports = exports;
```

### 6.8 Water Management Routes

**File**: `src/routes/waterRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const waterController = require('../controllers/waterController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// ต้อง authenticate ทุก route
router.use(authenticate);

/**
 * GET /api/water/:farmId/schedule
 * สร้างตารางการให้น้ำ 7 วัน
 */
router.get(
  '/:farmId/schedule',
  [param('farmId').isMongoId().withMessage('Invalid farm ID')],
  validateRequest,
  waterController.getIrrigationSchedule
);

/**
 * POST /api/water/:farmId/irrigation
 * บันทึกการให้น้ำ
 */
router.post(
  '/:farmId/irrigation',
  [
    param('farmId').isMongoId().withMessage('Invalid farm ID'),
    body('amount')
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('ปริมาณน้ำต้องอยู่ระหว่าง 0.1-100 mm'),
    body('duration').optional().isInt({ min: 1 }).withMessage('ระยะเวลาต้องเป็นตัวเลขบวก'),
    body('method')
      .optional()
      .isIn(['drip_regular', 'drip_slow', 'flood', 'sprinkler', 'manual'])
      .withMessage('วิธีการให้น้ำไม่ถูกต้อง')
  ],
  validateRequest,
  waterController.logIrrigation
);

/**
 * GET /api/water/:farmId/history
 * ดูประวัติการให้น้ำ
 */
router.get(
  '/:farmId/history',
  [
    param('farmId').isMongoId().withMessage('Invalid farm ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  waterController.getIrrigationHistory
);

/**
 * GET /api/water/:farmId/analysis
 * วิเคราะห์การใช้น้ำและประสิทธิภาพ
 */
router.get(
  '/:farmId/analysis',
  [
    param('farmId').isMongoId().withMessage('Invalid farm ID'),
    query('days')
      .optional()
      .isInt({ min: 7, max: 90 })
      .withMessage('ระยะเวลาต้องอยู่ระหว่าง 7-90 วัน')
  ],
  validateRequest,
  waterController.getWaterAnalysis
);

/**
 * GET /api/water/:farmId/stress-detection
 * ตรวจจับสัญญาณพืชขาดน้ำ
 */
router.get(
  '/:farmId/stress-detection',
  [param('farmId').isMongoId().withMessage('Invalid farm ID')],
  validateRequest,
  waterController.detectWaterStress
);

/**
 * POST /api/water/:farmId/auto-irrigation
 * เปิด/ปิดระบบให้น้ำอัตโนมัติ
 */
router.post(
  '/:farmId/auto-irrigation',
  [
    param('farmId').isMongoId().withMessage('Invalid farm ID'),
    body('enabled').isBoolean().withMessage('enabled ต้องเป็น true/false')
  ],
  validateRequest,
  authorize(['farmer', 'admin']),
  waterController.toggleAutoIrrigation
);

module.exports = router;
```

### 6.9 Irrigation Log Model

**File**: `src/models/IrrigationLog.js`

```javascript
const mongoose = require('mongoose');

const irrigationLogSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
      // ปริมาณน้ำ (mm)
    },

    duration: {
      type: Number,
      default: 0
      // ระยะเวลา (minutes)
    },

    method: {
      type: String,
      enum: ['drip_regular', 'drip_slow', 'flood', 'sprinkler', 'manual'],
      default: 'manual'
    },

    cost: {
      type: Number,
      default: 0
      // ต้นทุน (บาท)
    },

    notes: {
      type: String,
      maxlength: 500
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    cropType: {
      type: String
    },

    automated: {
      type: Boolean,
      default: false
      // true = ระบบอัตโนมัติ, false = manual
    }
  },
  {
    timestamps: true
  }
);

// Index สำหรับ query
irrigationLogSchema.index({ farmId: 1, timestamp: -1 });
irrigationLogSchema.index({ timestamp: 1 }); // สำหรับ TTL

// TTL Index: ลบข้อมูลเก่ากว่า 1 ปี
irrigationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('IrrigationLog', irrigationLogSchema);
```

---

## 7. AI Assistant Enhancement (Thai NLP)

### 7.1 Overview

AI Assistant เป็นระบบผู้ช่วยอัจฉริยะที่สามารถสื่อสารภาษาไทยกับเกษตรกร ตอบคำถาม ให้คำแนะนำ และช่วยแก้ปัญหาการเกษตรแบบ real-time

**Key Features**:

- 🇹🇭 **Thai NLP**: ประมวลผลภาษาไทยธรรมชาติ
- 💬 **Context-Aware**: จดจำบริบทการสนทนา
- 📚 **Knowledge Base**: ฐานความรู้เกษตรไทยครอบคลุม
- 🎯 **Intent Recognition**: เข้าใจเจตนาของผู้ใช้
- 🔄 **Multi-turn Dialog**: รองรับการสนทนาแบบต่อเนื่อง

### 7.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Assistant System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │  User Query    │──────│  Thai NLP Engine │              │
│  │  (Thai text)   │      │  - Tokenization  │              │
│  └────────────────┘      │  - POS Tagging   │              │
│                          │  - NER           │              │
│                          └──────────────────┘              │
│                                 │                           │
│                                 ▼                           │
│                    ┌──────────────────────┐                │
│                    │  Intent Classifier   │                │
│                    │  - Question          │                │
│                    │  - Request advice    │                │
│                    │  - Report problem    │                │
│                    │  - Small talk        │                │
│                    └──────────────────────┘                │
│                                 │                           │
│                                 ▼                           │
│                    ┌──────────────────────┐                │
│                    │  Context Manager     │                │
│                    │  - Conversation hist │                │
│                    │  - Farm context      │                │
│                    │  - User preferences  │                │
│                    └──────────────────────┘                │
│                                 │                           │
│                                 ▼                           │
│                    ┌──────────────────────┐                │
│                    │  Response Generator  │                │
│                    │  - Query KB          │                │
│                    │  - Call APIs         │                │
│                    │  - Format response   │                │
│                    └──────────────────────┘                │
│                                 │                           │
│                                 ▼                           │
│                    ┌──────────────────────┐                │
│                    │  Thai Response       │                │
│                    │  (Natural language)  │                │
│                    └──────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Thai NLP Service

ประมวลผลภาษาไทย tokenization, POS tagging, และ entity extraction

**File**: `src/services/ai/ThaiNLPService.js`

```javascript
const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Thai Natural Language Processing Service
 * ใช้ PyThaiNLP หรือ Thai2Vec API
 */
class ThaiNLPService {
  constructor() {
    this.pythainlpUrl = process.env.PYTHAINLP_API_URL || 'http://localhost:5000';

    // Common Thai stop words
    this.stopWords = new Set([
      'ครับ',
      'ค่ะ',
      'คะ',
      'นะ',
      'หรือ',
      'และ',
      'หรือว่า',
      'เพราะ',
      'ว่า',
      'ที่',
      'ซึ่ง',
      'อัน',
      'กับ',
      'ใน',
      'ของ',
      'แล้ว',
      'ได้',
      'เป็น',
      'มี',
      'จะ',
      'ไป',
      'มา',
      'ให้'
    ]);

    // Intent keywords
    this.intentKeywords = {
      question: ['อะไร', 'ทำไม', 'อย่างไร', 'เท่าไหร่', 'เมื่อไร', 'ที่ไหน', 'ใครครับ', 'ช่วย'],
      advice: ['แนะนำ', 'ควร', 'ดีไหม', 'เหมาะสม', 'วิธี', 'ช่วย', 'สอน'],
      problem: ['ปัญหา', 'เสีย', 'ตาย', 'เหี่ยว', 'เหลือง', 'ด่าง', 'แมลง', 'โรค', 'ช่วย'],
      status: ['สถานะ', 'เป็นยังไง', 'อย่างไร', 'ตอนนี้', 'ปัจจุบัน'],
      schedule: ['เมื่อไร', 'กี่โมง', 'วันไหน', 'ตาราง', 'เวลา']
    };
  }

  /**
   * Tokenize Thai text
   */
  async tokenize(text) {
    try {
      // ลองใช้ PyThaiNLP API ก่อน
      const response = await axios.post(
        `${this.pythainlpUrl}/tokenize`,
        { text },
        { timeout: 5000 }
      );
      return response.data.tokens;
    } catch (error) {
      // Fallback: Simple Thai tokenization
      return this.simpleTokenize(text);
    }
  }

  /**
   * Simple Thai tokenization (fallback)
   */
  simpleTokenize(text) {
    // ใช้ regex แยกคำไทย (แบบง่าย)
    const words = [];

    // แยกตามช่องว่างและเครื่องหมาย
    const segments = text.split(/\s+/);

    segments.forEach(segment => {
      // เก็บคำที่มีความยาว > 1 ตัวอักษร
      if (segment.length > 1 && !this.stopWords.has(segment)) {
        words.push(segment);
      }
    });

    return words;
  }

  /**
   * Extract entities (Named Entity Recognition)
   */
  extractEntities(text) {
    const entities = {
      crops: [],
      problems: [],
      nutrients: [],
      numbers: [],
      locations: []
    };

    const lowerText = text.toLowerCase();

    // Crop entities - Focus on Thai medicinal plants
    const crops = [
      'กัญชา',
      'cannabis',
      'ขมิ้นชัน',
      'ขมิ้น',
      'turmeric',
      'ขิง',
      'ginger',
      'กระชายดำ',
      'กระชาย',
      'black galingale',
      'ไพล',
      'plai',
      'กระท่อม',
      'kratom'
    ];
    crops.forEach(crop => {
      if (lowerText.includes(crop)) {
        entities.crops.push(crop);
      }
    });

    // Problem entities
    const problems = [
      'เหี่ยว',
      'เหลือง',
      'ด่าง',
      'ตาย',
      'เน่า',
      'โรค',
      'แมลง',
      'หนอน',
      'เพลี้ย',
      'ไรแดง',
      'เชื้อรา'
    ];
    problems.forEach(problem => {
      if (lowerText.includes(problem)) {
        entities.problems.push(problem);
      }
    });

    // Nutrient entities
    const nutrients = ['ไนโตรเจน', 'ฟอสฟอรัส', 'โพแทสเซียม', 'ปุ๋ย', 'น้ำ'];
    nutrients.forEach(nutrient => {
      if (lowerText.includes(nutrient)) {
        entities.nutrients.push(nutrient);
      }
    });

    // Extract numbers
    const numberPattern = /\d+(?:\.\d+)?/g;
    const numbers = text.match(numberPattern);
    if (numbers) {
      entities.numbers = numbers.map(n => parseFloat(n));
    }

    return entities;
  }

  /**
   * Classify intent
   */
  classifyIntent(text, tokens) {
    const lowerText = text.toLowerCase();
    const scores = {
      question: 0,
      advice: 0,
      problem: 0,
      status: 0,
      schedule: 0,
      greeting: 0,
      unknown: 0
    };

    // Check for greeting
    const greetings = ['สวัสดี', 'หวัดดี', 'ดีครับ', 'ดีค่ะ', 'hello', 'hi'];
    if (greetings.some(g => lowerText.includes(g))) {
      scores.greeting = 10;
    }

    // Check for question markers
    if (
      lowerText.includes('?') ||
      lowerText.includes('ไหม') ||
      lowerText.includes('หรือเปล่า') ||
      lowerText.includes('รึเปล่า')
    ) {
      scores.question += 5;
    }

    // Score by keywords
    Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          scores[intent] += 3;
        }
      });
    });

    // Find highest score
    const intents = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const topIntent = intents[0];

    return {
      intent: topIntent[1] > 0 ? topIntent[0] : 'unknown',
      confidence: Math.min(topIntent[1] / 10, 1.0),
      allScores: scores
    };
  }

  /**
   * Analyze sentiment (simple)
   */
  analyzeSentiment(text) {
    const positiveWords = ['ดี', 'สวย', 'เยี่ยม', 'เจริญ', 'สด', 'แข็งแรง', 'ชอบ', 'รัก'];
    const negativeWords = ['แย่', 'เสีย', 'ตาย', 'เหี่ยว', 'โรค', 'ปัญหา', 'ช่วย', 'กังวล'];

    let score = 0;
    const lowerText = text.toLowerCase();

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Process user query
   */
  async processQuery(text) {
    const tokens = await this.tokenize(text);
    const entities = this.extractEntities(text);
    const { intent, confidence } = this.classifyIntent(text, tokens);
    const sentiment = this.analyzeSentiment(text);

    return {
      originalText: text,
      tokens,
      entities,
      intent,
      confidence,
      sentiment,
      timestamp: new Date()
    };
  }
}

module.exports = ThaiNLPService;
```

### 7.4 Context-Aware Conversation Manager

จัดการบริบทการสนทนาและประวัติแชท

**File**: `src/services/ai/ConversationManager.js`

```javascript
const logger = require('../../utils/logger');
const Conversation = require('../../models/Conversation');

/**
 * Context-Aware Conversation Manager
 * จัดการบริบทและประวัติการสนทนา
 */
class ConversationManager {
  constructor() {
    // เก็บ context ใน memory (สำหรับ active conversations)
    this.activeContexts = new Map();

    // Context timeout: 30 minutes
    this.contextTimeout = 30 * 60 * 1000;
  }

  /**
   * Get or create conversation context
   */
  async getContext(userId, farmId = null) {
    const contextKey = `${userId}_${farmId || 'default'}`;

    // Check memory cache
    if (this.activeContexts.has(contextKey)) {
      const context = this.activeContexts.get(contextKey);

      // Check if expired
      if (Date.now() - context.lastActivity < this.contextTimeout) {
        return context;
      } else {
        // Expired, remove
        this.activeContexts.delete(contextKey);
      }
    }

    // Load from database
    let conversation = await Conversation.findOne({
      userId,
      farmId: farmId || null,
      active: true
    })
      .sort({ lastActivity: -1 })
      .lean();

    // Create new if not found
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        farmId,
        messages: [],
        context: {},
        active: true,
        lastActivity: new Date()
      });
    }

    // Build context
    const context = {
      conversationId: conversation._id,
      userId,
      farmId,
      messages: conversation.messages || [],
      context: conversation.context || {},
      lastActivity: Date.now()
    };

    // Store in memory
    this.activeContexts.set(contextKey, context);

    return context;
  }

  /**
   * Add message to conversation
   */
  async addMessage(context, role, content, metadata = {}) {
    const message = {
      role, // 'user' or 'assistant'
      content,
      metadata,
      timestamp: new Date()
    };

    // Add to context
    context.messages.push(message);
    context.lastActivity = Date.now();

    // Keep only last 20 messages
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }

    // Save to database
    await Conversation.findByIdAndUpdate(context.conversationId, {
      $push: {
        messages: {
          $each: [message],
          $slice: -20
        }
      },
      lastActivity: new Date(),
      $inc: { messageCount: 1 }
    });

    return message;
  }

  /**
   * Update context metadata
   */
  async updateContext(context, updates) {
    context.context = {
      ...context.context,
      ...updates
    };

    await Conversation.findByIdAndUpdate(context.conversationId, { context: context.context });
  }

  /**
   * Get conversation history
   */
  getHistory(context, limit = 10) {
    return context.messages.slice(-limit);
  }

  /**
   * Extract context from history
   */
  extractContextFromHistory(context) {
    const history = this.getHistory(context, 5);

    const extracted = {
      topics: new Set(),
      entities: {
        crops: new Set(),
        problems: new Set(),
        nutrients: new Set()
      },
      lastIntent: null,
      hasUnresolvedIssue: false
    };

    history.forEach(msg => {
      if (msg.metadata?.intent) {
        extracted.lastIntent = msg.metadata.intent;
      }

      if (msg.metadata?.entities) {
        const entities = msg.metadata.entities;

        if (entities.crops) {
          entities.crops.forEach(c => extracted.entities.crops.add(c));
        }
        if (entities.problems) {
          entities.problems.forEach(p => extracted.entities.problems.add(p));
          extracted.hasUnresolvedIssue = true;
        }
        if (entities.nutrients) {
          entities.nutrients.forEach(n => extracted.entities.nutrients.add(n));
        }
      }
    });

    return {
      topics: Array.from(extracted.topics),
      entities: {
        crops: Array.from(extracted.entities.crops),
        problems: Array.from(extracted.entities.problems),
        nutrients: Array.from(extracted.entities.nutrients)
      },
      lastIntent: extracted.lastIntent,
      hasUnresolvedIssue: extracted.hasUnresolvedIssue
    };
  }

  /**
   * End conversation
   */
  async endConversation(context) {
    const contextKey = `${context.userId}_${context.farmId || 'default'}`;

    // Remove from memory
    this.activeContexts.delete(contextKey);

    // Mark as inactive in DB
    await Conversation.findByIdAndUpdate(context.conversationId, { active: false });

    logger.info('Conversation ended', {
      conversationId: context.conversationId,
      messageCount: context.messages.length
    });
  }

  /**
   * Clean up expired contexts
   */
  cleanupExpiredContexts() {
    const now = Date.now();

    for (const [key, context] of this.activeContexts.entries()) {
      if (now - context.lastActivity > this.contextTimeout) {
        this.activeContexts.delete(key);
        logger.info('Context expired and removed', { key });
      }
    }
  }
}

// Run cleanup every 10 minutes
const manager = new ConversationManager();
setInterval(
  () => {
    manager.cleanupExpiredContexts();
  },
  10 * 60 * 1000
);

module.exports = ConversationManager;
```

### 7.5 Agricultural Knowledge Base

ฐานความรู้เกษตรสำหรับตอบคำถาม

**File**: `src/services/ai/KnowledgeBase.js`

```javascript
/**
 * Agricultural Knowledge Base
 * ฐานความรู้การเกษตรไทย
 */
class KnowledgeBase {
  constructor() {
    this.knowledge = {
      crops: this.getCropKnowledge(),
      problems: this.getProblemKnowledge(),
      nutrients: this.getNutrientKnowledge(),
      techniques: this.getTechniqueKnowledge(),
      general: this.getGeneralKnowledge()
    };
  }

  /**
   * ความรู้เกี่ยวกับพืช (Thai Medicinal Plants Focus)
   */
  getCropKnowledge() {
    return {
      // 🎯 PRIMARY CROP - GACP Compliant Cannabis Production
      กัญชา: {
        name: 'กัญชา',
        scientificName: 'Cannabis sativa L.',
        thaiName: 'กัญชา',
        isPrimaryCrop: true,
        gacpCompliant: true,
        legalFramework: 'กรมแพทย์แผนไทยและการแพทย์ทางเลือก',
        stages: ['งอก', 'ต้นกล้า', 'เจริญเติบโต', 'ออกดอก', 'สุกแก่'],
        optimalPH: { min: 6.0, max: 7.0 },
        optimalTemp: { min: 20, max: 30 },
        waterNeeds: 'ปานกลาง-สูง',
        commonProblems: ['เหี่ยว', 'ใบเหลือง', 'ขาดธาตุ', 'เชื้อรา'],
        harvestTime: '8-12 สัปดาห์ (แล้วแต่สายพันธุ์)',
        gacpRequirements: [
          '✅ บันทึกการปลูกทุกวัน (Daily logs)',
          '✅ บันทึกการใช้ปุ๋ยและสารเคมี (Input records)',
          '✅ ตรวจสอบดินและน้ำตามกำหนด (Testing schedule)',
          '✅ เก็บบันทึกการเก็บเกี่ยว (Harvest documentation)',
          '✅ ใช้เฉพาะปุ๋ยที่อนุมัติ (Approved products only)'
        ],
        tips: [
          'ควบคุม pH ดินให้อยู่ระหว่าง 6.0-7.0 (GACP Required)',
          'ให้น้ำเช้าหรือเย็น หลีกเลี่ยงเวลากลางวัน',
          'ช่วงออกดอกให้ปุ๋ยฟอสฟอรัสและโพแทสเซียมสูง',
          'ตรวจสอบความชื้นในดินสม่ำเสมอ',
          '📝 บันทึกทุกขั้นตอนเพื่อ GACP certification',
          '🔬 ส่งตรวจ cannabinoids ก่อนเก็บเกี่ยว',
          '⚖️ ปฏิบัติตาม SOP อย่างเคร่งครัดเพื่อความถูกกฎหมาย'
        ]
      },

      // 💰 SECONDARY ECONOMIC CROPS (Optional - Basic Support)
      ขมิ้นชัน: {
        name: 'ขมิ้นชัน',
        scientificName: 'Curcuma longa L.',
        thaiName: 'ขมิ้นชัน',
        stages: ['ปลูก', 'งอก', 'เจริญเติบโต', 'พัฒนาเหง้า', 'สุกแก่'],
        optimalPH: { min: 5.5, max: 7.5 },
        optimalTemp: { min: 25, max: 35 },
        waterNeeds: 'ปานกลาง',
        commonProblems: ['เหง้าเน่า', 'ใบด่าง', 'โรคใบจุด'],
        harvestTime: '8-10 เดือนหลังปลูก',
        tips: [
          'ปลูกในดินร่วนซุย ระบายน้ำดี',
          'ใช้เหง้าพันธุ์ขนาด 20-30 กรัม',
          'ใส่ปุ๋ยคอก 2-3 ตัน/ไร่ก่อนปลูก',
          'รดน้ำสม่ำเสมอ หลีกเลี่ยงน้ำขัง',
          'เก็บเกี่ยวเมื่อใบเริ่มเหลืองแห้ง'
        ]
      },
      ขิง: {
        name: 'ขิง',
        scientificName: 'Zingiber officinale Roscoe',
        thaiName: 'ขิง',
        stages: ['ปลูก', 'งอก', 'เจริญเติบโต', 'สร้างเหง้า', 'สุกแก่'],
        optimalPH: { min: 5.5, max: 6.5 },
        optimalTemp: { min: 25, max: 35 },
        waterNeeds: 'สูง',
        commonProblems: ['เหง้าเน่า', 'เพลี้ย', 'โรคใบจุด', 'หนอน'],
        harvestTime: '10-12 เดือน (ขิงแก่), 4-6 เดือน (ขิงอ่อน)',
        tips: [
          'เลือกพันธุ์ดี เหง้าแข็งแรง ไม่เน่า',
          'ปลูกในดินร่วนปนทราย อินทรีย์สูง',
          'ระยะปลูก 30x30 cm หรือ 40x40 cm',
          'รดน้ำสม่ำเสมอ ไม่ให้ดินแห้งจัด',
          'เก็บเกี่ยวขิงอ่อนได้หลังปลูก 4-5 เดือน'
        ]
      },
      กระชายดำ: {
        name: 'กระชายดำ',
        scientificName: 'Kaempferia parviflora Wall. ex Baker',
        thaiName: 'กระชายดำ',
        stages: ['ปลูก', 'งอก', 'เจริญเติบโต', 'พัฒนาเหง้า', 'พักตัว'],
        optimalPH: { min: 5.0, max: 6.5 },
        optimalTemp: { min: 25, max: 32 },
        waterNeeds: 'ปานกลาง',
        commonProblems: ['เหง้าเน่า', 'เชื้อรา', 'เพลี้ย'],
        harvestTime: '12-15 เดือนหลังปลูก',
        tips: [
          'ชอบร่มเงา ปลูกใต้ร่มได้ดี',
          'ต้องการความชื้นสม่ำเสมอ',
          'ดินต้องมีอินทรีย์วัตถุสูง',
          'เก็บเกี่ยวหลังใบเหลือง ยกแปลง',
          'ราคาสูง ต้องการตลาดแน่นอน'
        ]
      },
      ไพล: {
        name: 'ไพล',
        scientificName: 'Zingiber cassumunar Roxb.',
        thaiName: 'ไพล',
        stages: ['ปลูก', 'งอก', 'เจริญเติบโต', 'สร้างเหง้า', 'สุกแก่'],
        optimalPH: { min: 5.5, max: 7.0 },
        optimalTemp: { min: 25, max: 33 },
        waterNeeds: 'ปานกลาง',
        commonProblems: ['เหง้าเน่า', 'ใบด่าง', 'เพลี้ย'],
        harvestTime: '8-10 เดือนหลังปลูก',
        tips: [
          'ทนร่มเงาได้ดี ปลูกใต้ไม้ผลได้',
          'ต้องการดินร่วน มีอินทรีย์วัตถุ',
          'รดน้ำสม่ำเสมอ ไม่ให้แห้งจัด',
          'ใช้เหง้าพันธุ์น้ำหนัก 30-40 กรัม',
          'นิยมแปรรูปเป็นผลิตภัณฑ์สมุนไพร'
        ]
      },
      กระท่อม: {
        name: 'กระท่อม',
        scientificName: 'Mitragyna speciosa Korth.',
        thaiName: 'กระท่อม',
        stages: ['ต้นกล้า', 'ต้นอ่อน', 'ต้นโต', 'ให้ผลผลิต'],
        optimalPH: { min: 5.5, max: 6.8 },
        optimalTemp: { min: 25, max: 32 },
        waterNeeds: 'สูง',
        commonProblems: ['โรคราก', 'เพลี้ย', 'มอด', 'โรคใบด่าง'],
        harvestTime: 'เก็บใบทุก 3-4 เดือนหลังต้นโต (3+ ปี)',
        tips: [
          'เป็นไม้ยืนต้น เติบโตช้า',
          'ต้องการความชื้นสูง ร่มเงาบางส่วน',
          'ปลูกในพื้นที่ป่าหรือสวนผสมผสาน',
          'เก็บใบ 3-4 เดือน/ครั้ง หลังต้นโต',
          '⚠️ ต้องปฏิบัติตามกฎหมายการปลูกกระท่อม',
          'มีข้อกำหนดเฉพาะสำหรับการขออนุญาต'
        ]
      }
    };
  }

  /**
   * ความรู้เกี่ยวกับปัญหาและโรค
   */
  getProblemKnowledge() {
    return {
      ใบเหลือง: {
        problem: 'ใบเหลือง',
        causes: ['ขาดไนโตรเจน', 'ขาดน้ำ', 'pH ดินไม่เหมาะสม', 'โรคราก', 'เชื้อรา'],
        solutions: [
          'ตรวจสอบระดับไนโตรเจนในดิน',
          'ใส่ปุ๋ยยูเรียหรือ blood meal',
          'ตรวจสอบ pH ดิน ปรับให้เหมาะสม',
          'ตรวจสอบความชื้นในดิน',
          'ตรวจหาเชื้อโรค'
        ],
        urgency: 'medium'
      },
      เหี่ยว: {
        problem: 'ต้นเหี่ยว',
        causes: ['ขาดน้ำ', 'ร้อนเกินไป', 'โรคราก', 'แมลงศัตรู'],
        solutions: [
          'ให้น้ำทันที (ถ้าดินแห้ง)',
          'ย้ายไปร่มเงา (ถ้าร้อนเกินไป)',
          'ตรวจสอบรากว่ามีปัญหาหรือไม่',
          'ตรวจหาแมลงศัตรู',
          'ลดการใส่ปุ๋ย (ถ้าใส่มากเกินไป)'
        ],
        urgency: 'high'
      },
      เชื้อรา: {
        problem: 'เชื้อรา',
        causes: ['ความชื้นสูงเกินไป', 'อากาศไหลเวียนไม่ดี', 'น้ำค้างบนใบ'],
        solutions: [
          'ลดความชื้น เพิ่มการระบายอากาศ',
          'ฉีดพ่นสารกำจัดเชื้อราอินทรีย์',
          'ตัดใบที่ติดเชื้อทิ้ง',
          'หลีกเลี่ยงการให้น้ำโดนใบ',
          'ใช้ neem oil หรือ ทองแดง'
        ],
        urgency: 'high'
      }
    };
  }

  /**
   * ความรู้เกี่ยวกับธาตุอาหาร
   */
  getNutrientKnowledge() {
    return {
      ไนโตรเจน: {
        symbol: 'N',
        functions: 'ส่งเสริมการเจริญเติบโตของใบและลำต้น สร้างคลอโรฟิลล์',
        deficiencySymptoms: 'ใบแก่เหลือง การเจริญเติบโตช้า',
        sources: ['ยูเรีย', 'Blood Meal', 'ปุ๋ยคอก'],
        applicationTiming: 'ช่วงเจริญเติบโต (vegetative stage)'
      },
      ฟอสฟอรัส: {
        symbol: 'P',
        functions: 'ส่งเสริมการออกดอก ออกผล และพัฒนาราก',
        deficiencySymptoms: 'ใบมีสีม่วง การออกดอกช้า รากพัฒนาไม่ดี',
        sources: ['โบนมีล', 'ปุ๋ยสูตร 15-15-15'],
        applicationTiming: 'ช่วงออกดอก (flowering stage)'
      },
      โพแทสเซียม: {
        symbol: 'K',
        functions: 'เพิ่มความแข็งแรง ทนโรค และคุณภาพผลผลิต',
        deficiencySymptoms: 'ขอบใบไหม้ ใบม้วน ผลผลิตคุณภาพต่ำ',
        sources: ['โพแทสเซียมซัลเฟต', 'กล้วยหิน'],
        applicationTiming: 'ช่วงออกดอกและสุกแก่'
      }
    };
  }

  /**
   * เทคนิคการเกษตร
   */
  getTechniqueKnowledge() {
    return {
      การให้น้ำ: {
        technique: 'Smart Irrigation',
        description: 'การให้น้ำอย่างมีประสิทธิภาพ',
        bestPractices: [
          'ให้น้ำตอนเช้า 06:00-08:00 หรือเย็น 16:00-18:00',
          'หลีกเลี่ยงการให้น้ำเวลากลางวัน (คายระเหยสูง)',
          'ใช้ระบบน้ำหยด ประหยัดน้ำได้ถึง 50%',
          'ตรวจสอบความชื้นในดินก่อนให้น้ำ',
          'ให้น้ำลึกแต่ถี่น้อยดีกว่าตื้นแต่บ่อย'
        ]
      },
      การใส่ปุ๋ย: {
        technique: 'Fertilization',
        description: 'การใส่ปุ๋ยอย่างถูกต้อง',
        bestPractices: [
          'ตรวจสอบดินก่อนใส่ปุ๋ยทุกครั้ง',
          'ใส่ปุ๋ยช้าๆ แบบค่อยเป็นค่อยไป',
          'ผสมปุ๋ยกับน้ำก่อนให้พืช (fertigation)',
          'ปรับสูตรตามระยะการเจริญเติบโต',
          'หลีกเลี่ยงการใส่ปุ๋ยมากเกินไป (overfertilization)'
        ]
      }
    };
  }

  /**
   * ความรู้ทั่วไป
   */
  getGeneralKnowledge() {
    return {
      greetings: [
        'สวัสดีครับ ผมคือผู้ช่วยเกษตรอัจฉริยะ พร้อมช่วยเหลือคุณ',
        'ยินดีให้บริการครับ มีอะไรให้ช่วยไหมครับ',
        'สวัสดีค่ะ ต้องการคำแนะนำด้านการเกษตรอะไรคะ'
      ],
      farewells: [
        'ขอบคุณที่ใช้บริการครับ ขอให้ทำการเกษตรราบรื่น',
        'ยินดีให้บริการครับ หากมีคำถามเพิ่มเติมอย่าลังเลที่จะถามได้เลยครับ',
        'โชคดีกับการทำการเกษตรนะครับ'
      ],
      encouragement: [
        'คุณทำได้ดีมากครับ',
        'ขอชื่นชมในความพยายามของคุณครับ',
        'การเกษตรต้องใช้ความอดทน คุณทำได้ดีแล้วครับ'
      ]
    };
  }

  /**
   * Query knowledge base
   */
  query(category, key) {
    if (!this.knowledge[category]) {
      return null;
    }

    // Exact match
    if (this.knowledge[category][key]) {
      return this.knowledge[category][key];
    }

    // Fuzzy match (simple)
    const lowerKey = key.toLowerCase();
    for (const [k, v] of Object.entries(this.knowledge[category])) {
      if (k.toLowerCase().includes(lowerKey) || lowerKey.includes(k.toLowerCase())) {
        return v;
      }
    }

    return null;
  }

  /**
   * Search across all categories
   */
  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.knowledge).forEach(([category, items]) => {
      if (typeof items === 'object') {
        Object.entries(items).forEach(([key, value]) => {
          // Check if query matches key or content
          const keyMatch = key.toLowerCase().includes(lowerQuery);
          const contentMatch = JSON.stringify(value).toLowerCase().includes(lowerQuery);

          if (keyMatch || contentMatch) {
            results.push({
              category,
              key,
              data: value,
              relevance: keyMatch ? 1.0 : 0.5
            });
          }
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }
}

module.exports = KnowledgeBase;
```

### 7.6 AI Response Generator

สร้างคำตอบภาษาไทยตามบริบทและความรู้

**File**: `src/services/ai/ResponseGenerator.js`

```javascript
const ThaiNLPService = require('./ThaiNLPService');
const KnowledgeBase = require('./KnowledgeBase');
const Farm = require('../../models/Farm');
const FertilizerService = require('../fertilizer/FertilizerService');
const IrrigationScheduler = require('../water/IrrigationScheduler');

/**
 * AI Response Generator
 * สร้างคำตอบภาษาไทยแบบอัจฉริยะ
 */
class ResponseGenerator {
  constructor() {
    this.nlp = new ThaiNLPService();
    this.kb = new KnowledgeBase();
  }

  /**
   * Generate response based on intent
   */
  async generateResponse(nlpResult, context, farmData = null) {
    const { intent, entities, sentiment } = nlpResult;

    switch (intent) {
      case 'greeting':
        return this.handleGreeting(context);

      case 'question':
        return await this.handleQuestion(nlpResult, context, farmData);

      case 'advice':
        return await this.handleAdviceRequest(nlpResult, context, farmData);

      case 'problem':
        return await this.handleProblemReport(nlpResult, context, farmData);

      case 'status':
        return await this.handleStatusQuery(context, farmData);

      case 'schedule':
        return await this.handleScheduleQuery(context, farmData);

      default:
        return this.handleUnknown(nlpResult);
    }
  }

  /**
   * Handle greeting
   */
  handleGreeting(context) {
    const greetings = this.kb.knowledge.general.greetings;
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const historyContext = context.messages.slice(-5);
    const isReturning = historyContext.length > 0;

    let response = greeting;

    if (isReturning) {
      response += ' ยินดีที่ได้พบคุณอีกครั้งครับ';
    }

    response += '\n\nผมสามารถช่วยคุณได้ในเรื่อง:';
    response += '\n- ตอบคำถามเกี่ยวกับการเกษตร';
    response += '\n- แนะนำการใส่ปุ๋ยและให้น้ำ';
    response += '\n- แก้ปัญหาโรคและแมลง';
    response += '\n- ตรวจสอบสถานะฟาร์ม';

    return {
      text: response,
      suggestions: [
        'ตรวจสอบสถานะฟาร์ม',
        'ตารางการให้น้ำ',
        'ใบกัญชาเหลือง ทำยังไง',
        'ควรใส่ปุ๋ยอะไร'
      ]
    };
  }

  /**
   * Handle question
   */
  async handleQuestion(nlpResult, context, farmData) {
    const { entities } = nlpResult;

    // ถ้ามีชื่อพืช ให้ข้อมูลพืช
    if (entities.crops.length > 0) {
      const crop = entities.crops[0];
      const cropInfo = this.kb.query('crops', crop);

      if (cropInfo) {
        let response = `ข้อมูลเกี่ยวกับ${cropInfo.name}:\n\n`;
        response += `🌱 ชื่อวิทยาศาสตร์: ${cropInfo.scientificName}\n`;
        response += `📊 pH ที่เหมาะสม: ${cropInfo.optimalPH.min}-${cropInfo.optimalPH.max}\n`;
        response += `💧 ความต้องการน้ำ: ${cropInfo.waterNeeds}\n`;
        response += `📅 เวลาเก็บเกี่ยว: ${cropInfo.harvestTime}\n\n`;

        response += `**เคล็ดลับ:**\n`;
        cropInfo.tips.forEach((tip, i) => {
          response += `${i + 1}. ${tip}\n`;
        });

        return {
          text: response,
          suggestions: ['ปัญหาที่พบบ่อย', 'ควรใส่ปุ๋ยอะไร', 'ตารางการให้น้ำ']
        };
      }
    }

    // ถ้ามีปัญหา ให้วิธีแก้
    if (entities.problems.length > 0) {
      const problem = entities.problems[0];
      const problemInfo = this.kb.query('problems', problem);

      if (problemInfo) {
        let response = `🔍 ปัญหา: ${problemInfo.problem}\n\n`;
        response += `**สาเหตุที่เป็นไปได้:**\n`;
        problemInfo.causes.forEach((cause, i) => {
          response += `${i + 1}. ${cause}\n`;
        });

        response += `\n**วิธีแก้ไข:**\n`;
        problemInfo.solutions.forEach((solution, i) => {
          response += `${i + 1}. ${solution}\n`;
        });

        if (problemInfo.urgency === 'high') {
          response += `\n⚠️ **ต้องแก้ไขด่วน!** ปัญหานี้ควรจัดการโดยเร็วที่สุด`;
        }

        return {
          text: response,
          suggestions: ['ต้องการความช่วยเหลือเพิ่ม', 'มีปัญหาอื่นอีก']
        };
      }
    }

    // ถ้ามีธาตุอาหาร ให้ข้อมูลธาตุ
    if (entities.nutrients.length > 0) {
      const nutrient = entities.nutrients[0];
      const nutrientInfo = this.kb.query('nutrients', nutrient);

      if (nutrientInfo) {
        let response = `💊 ${nutrient} (${nutrientInfo.symbol})\n\n`;
        response += `**หน้าที่:** ${nutrientInfo.functions}\n\n`;
        response += `**อาการขาด:** ${nutrientInfo.deficiencySymptoms}\n\n`;
        response += `**แหล่งที่มา:** ${nutrientInfo.sources.join(', ')}\n\n`;
        response += `**เวลาใส่:** ${nutrientInfo.applicationTiming}`;

        return {
          text: response,
          suggestions: ['ตรวจสอบดิน', 'แนะนำปุ๋ย']
        };
      }
    }

    // ค้นหาใน Knowledge Base
    const searchResults = this.kb.search(nlpResult.originalText);

    if (searchResults.length > 0) {
      const topResult = searchResults[0];
      let response = `ผมพบข้อมูลที่เกี่ยวข้องครับ:\n\n`;

      // Format based on category
      if (topResult.category === 'techniques') {
        const tech = topResult.data;
        response += `📖 ${tech.technique}\n`;
        response += `${tech.description}\n\n`;
        response += `**แนวทางปฏิบัติที่ดี:**\n`;
        tech.bestPractices.forEach((practice, i) => {
          response += `${i + 1}. ${practice}\n`;
        });
      } else {
        response += JSON.stringify(topResult.data, null, 2);
      }

      return {
        text: response,
        suggestions: ['ขอคำแนะนำเพิ่ม', 'มีคำถามอื่น']
      };
    }

    // ถ้าไม่พบคำตอบ
    return this.handleUnknown(nlpResult);
  }

  /**
   * Handle advice request
   */
  async handleAdviceRequest(nlpResult, context, farmData) {
    if (!farmData) {
      return {
        text: 'ต้องการคำแนะนำเฉพาะสำหรับฟาร์มของคุณไหมครับ? กรุณาเลือกฟาร์มก่อนนะครับ',
        suggestions: ['เลือกฟาร์ม', 'ต้องการคำแนะนำทั่วไป']
      };
    }

    const { entities } = nlpResult;

    // แนะนำปุ๋ย
    if (entities.nutrients.length > 0 || nlpResult.originalText.includes('ปุ๋ย')) {
      try {
        const fertilizerService = new FertilizerService();
        const recommendations = await fertilizerService.generateRecommendations({
          soilData: farmData.soilMonitoring?.realTimeData || {},
          cropType: farmData.crops?.[0]?.cropType || 'cannabis',
          growthStage: farmData.crops?.[0]?.currentStage || 'vegetative',
          farmSize: farmData.area || 1
        });

        let response = '📊 **คำแนะนำการใส่ปุ๋ยสำหรับฟาร์มของคุณ**\n\n';

        if (recommendations.recommendations.length > 0) {
          const topRec = recommendations.recommendations[0];
          response += `**ลำดับความสำคัญ ${topRec.priority}: ${topRec.category}**\n\n`;
          response += `ปุ๋ย: ${topRec.product.name} (${topRec.product.npk})\n`;
          response += `ปริมาณ: ${topRec.application.amount} ${topRec.application.unit}\n`;
          response += `ต้นทุน: ${topRec.estimatedCost} บาท\n\n`;

          response += `**ประโยชน์:**\n`;
          topRec.benefits.forEach((benefit, i) => {
            response += `- ${benefit}\n`;
          });
        } else {
          response += 'ตอนนี้ดินอยู่ในสภาพดีครับ ไม่จำเป็นต้องใส่ปุ๋ยเพิ่ม';
        }

        return {
          text: response,
          suggestions: ['ดูคำแนะนำทั้งหมด', 'ตารางการใส่ปุ๋ย']
        };
      } catch (error) {
        return {
          text: 'ขออภัยครับ ไม่สามารถสร้างคำแนะนำได้ กรุณาตรวจสอบข้อมูลฟาร์มครับ',
          suggestions: ['ตรวจสอบข้อมูลฟาร์ม']
        };
      }
    }

    // แนะนำการให้น้ำ
    if (entities.nutrients.includes('น้ำ') || nlpResult.originalText.includes('น้ำ')) {
      return {
        text: 'คุณต้องการดูตารางการให้น้ำไหมครับ? ระบบจะคำนวณจากสภาพอากาศและความชื้นในดินปัจจุบัน',
        suggestions: ['ดูตารางการให้น้ำ', 'ตรวจสอบความชื้น']
      };
    }

    // แนะนำทั่วไป
    const cropType = farmData.crops?.[0]?.cropType || 'กัญชา';
    const cropInfo = this.kb.query('crops', cropType);

    if (cropInfo) {
      let response = `**คำแนะนำสำหรับ${cropInfo.name}**\n\n`;
      cropInfo.tips.forEach((tip, i) => {
        response += `${i + 1}. ${tip}\n`;
      });

      return {
        text: response,
        suggestions: ['ตารางการดูแล', 'ปัญหาที่พบบ่อย']
      };
    }

    return {
      text: 'มีอะไรให้ผมช่วยเฉพาะเจาะจงไหมครับ? เช่น การใส่ปุ๋ย การให้น้ำ หรือการแก้ปัญหา',
      suggestions: ['การใส่ปุ๋ย', 'การให้น้ำ', 'แก้ปัญหา']
    };
  }

  /**
   * Handle problem report
   */
  async handleProblemReport(nlpResult, context, farmData) {
    const { entities, sentiment } = nlpResult;

    let response = '🔍 ผมเข้าใจว่าคุณกำลังเจอปัญหาครับ ';

    if (sentiment === 'negative') {
      response += 'ไม่ต้องกังวลนะครับ เราจะช่วยแก้ไขด้วยกัน\n\n';
    } else {
      response += 'มาดูกันว่าเป็นอะไรนะครับ\n\n';
    }

    // วิเคราะห์ปัญหาจาก entities
    if (entities.problems.length > 0) {
      const problem = entities.problems[0];
      const problemInfo = this.kb.query('problems', problem);

      if (problemInfo) {
        response += `**ปัญหา: ${problemInfo.problem}**\n\n`;
        response += `**วิธีแก้ไขเบื้องต้น:**\n`;

        // ให้วิธีแก้ 3 อันดับแรก
        problemInfo.solutions.slice(0, 3).forEach((solution, i) => {
          response += `${i + 1}. ${solution}\n`;
        });

        if (problemInfo.urgency === 'high') {
          response += `\n⚠️ **ด่วน!** ควรดำเนินการทันทีเพื่อป้องกันความเสียหายเพิ่มเติม`;
        }

        return {
          text: response,
          suggestions: ['ดูวิธีแก้ทั้งหมด', 'ต้องการคำปรึกษาเพิ่ม', 'บันทึกปัญหา']
        };
      }
    }

    // ถ้าไม่สามารถระบุปัญหาได้ ให้ถามเพิ่มเติม
    response += 'ช่วยอธิบายอาการเพิ่มเติมได้ไหมครับ เช่น:\n';
    response += '- ใบมีลักษณะอย่างไร (เหลือง, ด่าง, เหี่ยว)\n';
    response += '- เกิดมานานแค่ไหน\n';
    response += '- มีแมลงหรือเชื้อราหรือไม่';

    return {
      text: response,
      suggestions: ['ส่งรูปภาพ', 'อธิบายอาการเพิ่ม']
    };
  }

  /**
   * Handle status query
   */
  async handleStatusQuery(context, farmData) {
    if (!farmData) {
      return {
        text: 'กรุณาเลือกฟาร์มก่อนนะครับ',
        suggestions: ['เลือกฟาร์ม']
      };
    }

    let response = `🌾 **สถานะฟาร์ม: ${farmData.farmName}**\n\n`;

    // Crop status
    if (farmData.crops && farmData.crops.length > 0) {
      const crop = farmData.crops[0];
      response += `🌱 พืช: ${crop.cropType} (${crop.currentStage})\n`;
      response += `📅 ปลูกเมื่อ: ${new Date(crop.plantDate).toLocaleDateString('th-TH')}\n\n`;
    }

    // Soil status
    if (farmData.soilMonitoring?.realTimeData) {
      const soil = farmData.soilMonitoring.realTimeData;
      response += `**สภาพดิน:**\n`;

      if (soil.ph?.current) {
        response += `- pH: ${soil.ph.current.toFixed(1)}`;
        response += soil.ph.status === 'optimal' ? ' ✅' : ' ⚠️';
        response += '\n';
      }

      if (soil.moisture?.current) {
        response += `- ความชื้น: ${soil.moisture.current.toFixed(0)}%`;
        response += soil.moisture.current > 50 ? ' ✅' : ' ⚠️';
        response += '\n';
      }
    }

    response += '\n💡 ต้องการดูข้อมูลเพิ่มเติมไหมครับ?';

    return {
      text: response,
      suggestions: ['ดูคำแนะนำการดูแล', 'ตรวจสอบปัญหา', 'ตารางการให้น้ำ']
    };
  }

  /**
   * Handle schedule query
   */
  async handleScheduleQuery(context, farmData) {
    if (!farmData) {
      return {
        text: 'กรุณาเลือกฟาร์มเพื่อดูตารางครับ',
        suggestions: ['เลือกฟาร์ม']
      };
    }

    return {
      text: 'คุณต้องการดูตารางอะไรครับ?',
      suggestions: ['ตารางการให้น้ำ', 'ตารางการใส่ปุ๋ย', 'กำหนดการเก็บเกี่ยว']
    };
  }

  /**
   * Handle unknown intent
   */
  handleUnknown(nlpResult) {
    return {
      text: 'ขออภัยครับ ผมไม่ค่อยเข้าใจคำถามนี้ ช่วยถามใหม่ได้ไหมครับ หรือเลือกจากหัวข้อด้านล่าง',
      suggestions: ['ตรวจสอบสถานะฟาร์ม', 'คำแนะนำการดูแล', 'แก้ปัญหา', 'ติดต่อผู้ดูแล']
    };
  }
}

module.exports = ResponseGenerator;
```

### 7.7 AI Assistant API Controller

**File**: `src/controllers/aiAssistantController.js`

```javascript
const ThaiNLPService = require('../services/ai/ThaiNLPService');
const ConversationManager = require('../services/ai/ConversationManager');
const ResponseGenerator = require('../services/ai/ResponseGenerator');
const Farm = require('../models/Farm');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

const nlpService = new ThaiNLPService();
const conversationManager = new ConversationManager();
const responseGenerator = new ResponseGenerator();

/**
 * POST /api/ai-assistant/chat
 * ส่งข้อความถึง AI Assistant
 */
exports.chat = async (req, res) => {
  try {
    const { message, farmId } = req.body;
    const userId = req.user.userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json(ApiResponse.error('กรุณาระบุข้อความ', 400));
    }

    // Get conversation context
    const context = await conversationManager.getContext(userId, farmId);

    // Process with NLP
    const nlpResult = await nlpService.processQuery(message);

    // Add user message to conversation
    await conversationManager.addMessage(context, 'user', message, {
      intent: nlpResult.intent,
      entities: nlpResult.entities,
      sentiment: nlpResult.sentiment
    });

    // Get farm data if farmId provided
    let farmData = null;
    if (farmId) {
      farmData = await Farm.findById(farmId)
        .select('farmName crops soilMonitoring area location')
        .lean();
    }

    // Generate response
    const response = await responseGenerator.generateResponse(nlpResult, context, farmData);

    // Add assistant message to conversation
    await conversationManager.addMessage(context, 'assistant', response.text, {
      suggestions: response.suggestions
    });

    logger.info('AI chat completed', {
      userId,
      intent: nlpResult.intent,
      farmId: farmId || 'none'
    });

    res.json(
      ApiResponse.success({
        message: response.text,
        suggestions: response.suggestions || [],
        metadata: {
          intent: nlpResult.intent,
          confidence: nlpResult.confidence,
          conversationId: context.conversationId
        }
      })
    );
  } catch (error) {
    logger.error('AI chat failed', { error: error.message });
    res
      .status(500)
      .json(ApiResponse.error('ไม่สามารถตอบคำถามได้ กรุณาลองใหม่อีกครั้ง', 500, error.message));
  }
};

/**
 * GET /api/ai-assistant/conversation/:conversationId
 * ดึงประวัติการสนทนา
 */
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const Conversation = require('../models/Conversation');
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })
      .select('messages context createdAt lastActivity')
      .lean();

    if (!conversation) {
      return res.status(404).json(ApiResponse.error('ไม่พบการสนทนา', 404));
    }

    res.json(
      ApiResponse.success({
        conversationId,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity
      })
    );
  } catch (error) {
    logger.error('Failed to get conversation', { error: error.message });
    res.status(500).json(ApiResponse.error('ไม่สามารถดึงประวัติการสนทนาได้', 500, error.message));
  }
};

/**
 * DELETE /api/ai-assistant/conversation/:conversationId
 * ลบการสนทนา
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const Conversation = require('../models/Conversation');
    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json(ApiResponse.error('ไม่พบการสนทนา', 404));
    }

    logger.info('Conversation deleted', { conversationId, userId });

    res.json(
      ApiResponse.success({
        message: 'ลบการสนทนาสำเร็จ',
        conversationId
      })
    );
  } catch (error) {
    logger.error('Failed to delete conversation', { error: error.message });
    res.status(500).json(ApiResponse.error('ไม่สามารถลบการสนทนาได้', 500, error.message));
  }
};

/**
 * GET /api/ai-assistant/conversations
 * ดึงรายการการสนทนาทั้งหมด
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, active = true } = req.query;

    const Conversation = require('../models/Conversation');
    const conversations = await Conversation.find({
      userId,
      active: active === 'true'
    })
      .select('farmId messageCount lastActivity createdAt')
      .populate('farmId', 'farmName')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(
      ApiResponse.success({
        conversations,
        total: conversations.length
      })
    );
  } catch (error) {
    logger.error('Failed to get conversations', { error: error.message });
    res.status(500).json(ApiResponse.error('ไม่สามารถดึงรายการการสนทนาได้', 500, error.message));
  }
};

module.exports = exports;
```

### 7.8 Conversation Model

**File**: `src/models/Conversation.js`

```javascript
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
      index: true
    },

    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true
        },
        content: {
          type: String,
          required: true
        },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {}
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],

    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    messageCount: {
      type: Number,
      default: 0
    },

    active: {
      type: Boolean,
      default: true,
      index: true
    },

    lastActivity: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for queries
conversationSchema.index({ userId: 1, active: 1, lastActivity: -1 });

// TTL Index: Delete inactive conversations older than 30 days
conversationSchema.index(
  { lastActivity: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { active: false }
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
```

---

## Phase 3 Summary

**Status**: ✅ GACP Compliance Framework Complete (80%)

### Platform Focus Update 🎯

**Primary Mission**: Legal Cannabis Production with GACP Compliance

- 🌿 **Cannabis (กัญชา)**: Default & Primary Crop - Full GACP support
- 💰 **5 Secondary Crops**: Basic recommendations (future phase focus)
  - ขมิ้นชัน (Turmeric), ขิง (Ginger), กระชายดำ (Black Galingale)
  - ไพล (Plai), กระท่อม (Kratom)

**Legal Framework**: Department of Thai Traditional and Alternative Medicine (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)

### Completed Sections

1. ✅ **Platform Mission & GACP Framework** (NEW)
   - Legal cannabis production compliance
   - Standard Operating Procedures (SOP)
   - Automated documentation system
   - Audit trail generation
   - Regulatory compliance monitoring
2. ✅ **Overview & Architecture** (Cannabis-focused)
3. ✅ **Soil Data Analyzer** (GACP-compliant analysis)
4. ✅ **Crop Profiles** (Cannabis as default + 5 secondary crops)
5. ✅ **Fertilizer Recommendation Service** (approved products only)
6. ✅ **Product Matcher & Cost Calculator**
7. ✅ **Fertilizer API Endpoints**
8. ✅ **Water Management & Irrigation AI**
   - Evapotranspiration Calculator (FAO Penman-Monteith)
   - Weather API Integration (TMD + OpenWeatherMap)
   - Smart Irrigation Scheduler
   - Water Usage Optimizer
   - API Controllers & Routes
   - Irrigation Log Model
9. ✅ **AI Assistant Enhancement (Thai NLP)** (NEW)
   - Thai NLP Service (tokenization, NER, intent classification)
   - Context-Aware Conversation Manager
   - Agricultural Knowledge Base
   - Response Generator
   - AI Assistant API Controller
   - Conversation Model

### Deliverables Summary

**NEW: GACP Compliance & Legal Framework**:

- 🏛️ Thai cannabis legal framework documentation
- ✅ 6 Standard Operating Procedures (SOP-01 to SOP-06)
- 📝 Automated documentation templates
- 🔍 Real-time compliance monitoring
- 📊 Audit report generation
- ⚖️ Regulatory requirements tracking

**1. Fertilizer Recommendation Engine** (Cannabis-Focused):

- Soil analysis algorithms (pH, NPK, micronutrients, organic matter)
- **Cannabis as default crop** with GACP-compliant growing requirements
- Fertilizer recommendation using **approved products only**
- Product matching and application scheduling with documentation
- 5 secondary crop profiles (basic support)
- 6 REST API endpoints

**2. Water Management & Irrigation AI**:

- ET₀ calculator with FAO Penman-Monteith equation
- Weather forecast integration (7-day ahead)
- Smart irrigation scheduling with water balance
- Usage pattern analysis and efficiency scoring
- Water stress detection
- 5 REST API endpoints

**3. AI Assistant (Thai NLP)**:

- Thai natural language processing (tokenization, entity extraction)
- Intent classification (greeting, question, advice, problem, status, schedule)
- Context-aware conversation management (30-min timeout)
- Agricultural knowledge base (crops, problems, nutrients, techniques)
- Response generation with smart suggestions
- Multi-turn dialog support
- 4 REST API endpoints

### Technical Highlights

**Scientific Accuracy**:

- FAO Penman-Monteith equation for ET calculation
- Crop coefficient (Kc) by growth stage
- Available Water Capacity (AWC) by soil type
- Management Allowed Depletion (MAD) calculation
- Cannabis-specific NPK requirements by stage

**AI & NLP Features**:

- Thai language tokenization with stop word filtering
- Named Entity Recognition (crops, problems, nutrients)
- Intent classification with confidence scoring
- Sentiment analysis (positive, negative, neutral)
- Context extraction from conversation history
- Knowledge base search with relevance ranking

**Smart Features**:

- Weather-aware irrigation planning
- Rain prediction integration
- Optimal timing recommendations
- Cost calculation (fertilizer, water, electricity)
- Savings estimation vs traditional methods
- Conversational AI with suggestions

**Data Management**:

- Irrigation history logging with TTL (1 year)
- Conversation history with TTL (30 days inactive)
- Pattern analysis (time, consistency, efficiency)
- Benchmark comparison by crop type
- Multiple database indexes for performance

### System Architecture

```
┌────────────────────────────────────────────────────┐
│            GACP Platform - Phase 3                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  1. Fertilizer Recommendation Engine         │ │
│  │     - Soil Analysis                          │ │
│  │     - NPK Calculations                       │ │
│  │     - Product Matching                       │ │
│  └──────────────────────────────────────────────┘ │
│                      │                             │
│                      ▼                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  2. Water Management & Irrigation AI         │ │
│  │     - ET Calculator (Penman-Monteith)        │ │
│  │     - Weather Integration                    │ │
│  │     - Smart Scheduling                       │ │
│  │     - Usage Optimization                     │ │
│  └──────────────────────────────────────────────┘ │
│                      │                             │
│                      ▼                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  3. AI Assistant (Thai NLP)                  │ │
│  │     - Thai NLP Engine                        │ │
│  │     - Conversation Manager                   │ │
│  │     - Knowledge Base                         │ │
│  │     - Response Generator                     │ │
│  └──────────────────────────────────────────────┘ │
│                      │                             │
│                      ▼                             │
│  ┌──────────────────────────────────────────────┐ │
│  │  Unified API Layer                           │ │
│  │  15 Endpoints Total                          │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Statistics

- **Total Lines of Code**: ~5,150+ lines (including GACP documentation)
  - GACP Compliance Framework: ~200 lines (new)
  - Fertilizer Engine: ~1,550 lines
  - Water Management: ~1,930 lines
  - AI Assistant: ~1,470 lines

- **Crop Profiles**: 6 total
  - 🎯 **Cannabis (กัญชา)**: Primary crop, full GACP support, default selection
  - 💰 **5 Secondary crops**: Basic profiles for future phases
    - Turmeric, Ginger, Black Galingale, Plai, Kratom

- **Services**: 9 total
  - SoilDataAnalyzer
  - FertilizerRecommendationService
  - ETCalculator
  - WeatherService
  - IrrigationScheduler
  - WaterOptimizer
  - ThaiNLPService
  - ConversationManager
  - ResponseGenerator + KnowledgeBase

- **API Endpoints**: 15 total
  - Fertilizer: 6 endpoints
  - Water Management: 5 endpoints
  - AI Assistant: 4 endpoints

- **Database Models**: 3
  - IrrigationLog (with TTL: 1 year)
  - Conversation (with TTL: 30 days inactive)
  - Farm (updated with new fields)

- **Algorithms & Methods**: 25+
  - Soil analysis (pH, NPK, micronutrients, organic matter)
  - ET calculations (Penman-Monteith, vapor pressure, radiation)
  - Water balance (AWC, MAD, stress detection)
  - NLP (tokenization, NER, intent classification, sentiment)
  - Knowledge base search and matching

### Integration Points

1. **Phase 1 Integration**:
   - Uses Farm model and farm data
   - Integrates with user authentication
   - Links to crop management system

2. **Phase 2 Integration**:
   - Reads soil sensor data (moisture, pH, NPK, EC)
   - Reads water sensor data
   - Uses real-time IoT data for recommendations

3. **Cross-Module Integration**:
   - AI Assistant can query fertilizer recommendations
   - AI Assistant can query irrigation schedules
   - All modules share farm context

### Platform Value Proposition 🎯

**For Cannabis Producers**:

1. ✅ **100% Legal Compliance**: Automated GACP documentation
2. 📝 **Simplified Record-Keeping**: Daily logs generated automatically
3. 🔬 **Quality Assurance**: Pharmaceutical-grade standards tracking
4. 💰 **Cost Savings**: 20-40% reduction in input costs
5. 📈 **Yield Optimization**: 15-30% increase with data-driven decisions
6. ⚖️ **Legal Protection**: Complete audit trail for government submissions

**For Economic Crop Farmers** (Secondary Support):

- Basic cultivation recommendations
- Resource optimization
- Market standard guidelines
- Future phase: Full support expansion

### Next Steps (20% Remaining)

Continue with final Phase 3 sections (Cannabis-focused):

- **Machine Learning Models** (Cannabis yield prediction, optimal harvest timing)
- **Testing Strategy** (Unit tests with cannabis cultivation scenarios)
- **Deployment Guide** (Production setup with GACP compliance features)

### Key Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with TTL indexes)
- **Caching**: Redis (weather data, contexts)
- **AI/ML**: Python (PyThaiNLP API for advanced NLP)
- **External APIs**: Thai Meteorological Department, OpenWeatherMap
- **Scientific Libraries**: FAO methodologies, agricultural standards

---

**Document Version**: 1.3.0 - GACP Cannabis Focus Edition
**Last Updated**: 2025-10-28
**Status**: Phase 3 - 80% Complete (GACP Framework + Fertilizer + Water + AI Assistant) 🚀

**Major Update**: Platform refocused on **Cannabis as Primary Crop** with full GACP compliance support. Secondary economic crops (5 plants) available as optional future enhancements.

---

## 📊 Strategic Documentation (NEW)

### Related Strategic Documents

This Phase 3 implementation is supported by comprehensive strategic analysis and data architecture:

#### 1. [Competitive Analysis Report](./COMPETITIVE_ANALYSIS.md)

**Analysis of Government Platforms**:

- ✅ DTAM Main Portal (www.dtam.moph.go.th) - Information & regulations
- ✅ HerbCtrl System (herbctrl.dtam.moph.go.th) - License applications
- ✅ PanThai Chatbot (panthaichatbot.in.th) - Health advice AI

**Key Finding**: 🎯 **MASSIVE MARKET GAP**

- Government provides compliance framework (WHAT to do)
- **We provide operational tools (HOW to do it)**
- No direct competition in farm management space
- We're the only IoT + AI platform for GACP cannabis

**Our Competitive Advantages**:

1. End-to-end farm management (operations + compliance)
2. AI-powered agricultural intelligence (vs health-focused PanThai AI)
3. Automated GACP compliance (real-time monitoring, not just PDFs)
4. Data-driven decision making (live sensors vs static information)
5. Private sector speed & innovation

**Strategy**: Complementary positioning - work WITH government systems, fill the operational gap

📖 **Full Report**: [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)

---

#### 2. [Central Database Design](./CENTRAL_DATABASE_DESIGN.md)

**Comprehensive Knowledge Base for 6 Medicinal Plants**:

**Database Collections**:

1. **Plant Catalog** - Master list of 6 plants (Cannabis primary, 5 secondary)
2. **Cultivar Library** - Varieties, genetics, characteristics for each plant
3. **Regional Growing Database** - 77 Thai provinces with suitability scores
4. **Disease & Pest Database** - Comprehensive problems database for prediction
5. **Historical Yield Database** - Training data for ML models
6. **Climate Correlation Database** - Weather patterns linked to outcomes

**Machine Learning Capabilities**:

- 🎯 **Yield Prediction Model** - Forecast harvest based on conditions
- 🦠 **Disease Risk Prediction** - Probability of problems in next 7-30 days
- 📅 **Optimal Planting Date** - Best timing based on climate patterns
- 🌱 **Cultivar Recommendation** - Match varieties to farm conditions

**Data Collection Strategy**:

- Phase 1: Seed with literature & research (Months 1-3)
- Phase 2: Platform user data (Months 4-12)
- Phase 3: Continuous ML improvement (Ongoing)

**Target**:

- Year 1: 100+ farms, 500+ yield records
- Year 2: 500+ farms, 2,500+ yield records, 75%+ ML accuracy
- Year 3: 2,000+ farms, 10,000+ yield records, 85%+ ML accuracy

📖 **Full Design**: [CENTRAL_DATABASE_DESIGN.md](./CENTRAL_DATABASE_DESIGN.md)

---

### How These Documents Connect to Phase 3

**Competitive Analysis** → Informs our AI Assistant positioning and feature priorities

- PanThai does health advice (patients)
- We do agricultural advice (farmers)
- Different knowledge bases, different users, no overlap

**Central Database** → Powers all Phase 3 AI/ML features:

- Fertilizer recommendations use cultivar requirements
- Disease prediction uses historical outbreak data
- AI Assistant queries knowledge base
- Yield models train on historical yields
- Regional suitability guides crop selection

**Integration Point**: Phase 3 (this document) = Implementation details
Supporting docs = Strategic context + Data foundation

---
