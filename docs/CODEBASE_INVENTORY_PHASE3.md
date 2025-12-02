# Codebase Inventory & Phase 3 Implementation Plan

**Document Version**: 1.0.0
**Date**: 2025-10-28
**Purpose**: Survey existing code and plan Phase 3 (AI/ML Recommendations) implementation

---

## Executive Summary

After comprehensive code survey, here's what we have:

### 🎯 Overall Project Status

- **Phase 1 (GACP Certification)**: ✅ 100% Complete
- **Phase 2 (IoT & Smart Farming)**: ✅ ~90% Complete (has implementation guide)
- **Phase 3 (AI/ML Recommendations)**: ❌ 0% Implemented (documentation only)

**Good News**:

- ✅ Strong foundation exists (Phase 1 & 2)
- ✅ Database models are well-structured
- ✅ Farm management system is solid
- ✅ Can reuse ~40-50% of existing code for Phase 3

---

## Part 1: What EXISTS (Reusable Components)

### ✅ 1. Farm Management System (COMPLETE)

**Location**: `apps/backend/modules/farm-management/`

**Key Components**:

```javascript
// Farm Entity - Domain Layer
class Farm {
  static STATUS = {DRAFT, PENDING_REVIEW, UNDER_REVIEW, APPROVED, REJECTED, SUSPENDED, INACTIVE}
  static FARM_TYPE = {OUTDOOR, GREENHOUSE, INDOOR, MIXED}
  static IRRIGATION_TYPE = {DRIP, SPRINKLER, FLOOD, MANUAL, MIXED}

  constructor({
    id, ownerId, farmName, farmType,
    address, subDistrict, district, province, postalCode,
    latitude, longitude,
    totalArea, cultivationArea, areaUnit,
    cultivationMethod, irrigationType, soilType, waterSource,
    status, verificationNotes, verifiedBy, verifiedAt
  })
}
```

**Use Cases Implemented**:

- ✅ `register-farm.js` - Farm registration
- ✅ `update-farm.js` - Farm updates
- ✅ `submit-farm-for-review.js` - GACP submission
- ✅ `approve-farm.js` - DTAM approval
- ✅ `reject-farm.js` - DTAM rejection
- ✅ `list-farms.js` - Farm listing
- ✅ `get-farm-details.js` - Farm details

**API Endpoints**:

- ✅ `POST /api/farms` - Register farm
- ✅ `GET /api/farms` - List farms
- ✅ `GET /api/farms/:id` - Get farm
- ✅ `PUT /api/farms/:id` - Update farm
- ✅ `POST /api/farms/:id/submit` - Submit for review

**Assessment**: ✅ **Perfect foundation for Phase 3!**

**What Phase 3 Needs**:

- Link farms to AI recommendations
- Add sensor data aggregations
- Store AI-generated insights

---

### ✅ 2. Farm Database Model (COMPLETE)

**Location**: `apps/backend/models/Farm.js`

**Schema**:

```javascript
{
  name: String,
  registrationNumber: String,
  owner: ObjectId (ref: User),
  managers: [ObjectId],
  contactDetails: {
    phone, email,
    address: { line1, line2, subdistrict, district, province, postalCode }
  },
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // ✅ GeoJSON for regional queries
  },
  region: Enum['north', 'northeast', 'central', 'east', 'west', 'south'], // ✅ For cultivar recommendations
  totalArea: { value: Number, unit: Enum['rai', 'acre', 'hectare', 'sqm'] },
  plots: [PlotSchema],
  farmingType: Enum['conventional', 'organic', 'gapHybrid', 'hydroponic', 'mixed'],
  certifications: [CertificationSchema],
  waterSources: [Enum['river', 'reservoir', 'groundwater', 'rainfall', 'irrigation']], // ✅ For irrigation AI
  images: [{url, caption, isPrimary}],
  status: Enum['active', 'inactive', 'pending', 'suspended']
}
```

**Plot Sub-Schema**:

```javascript
{
  name: String,
  size: {value, unit},
  location: GeoJSON,
  boundary: [[longitude, latitude]], // Polygon
  soilType: String, // ✅ CRITICAL for fertilizer recommendations
  crops: [ObjectId],
  status: Enum['active', 'fallow', 'preparing', 'harvested']
}
```

**Assessment**: ✅ **Excellent! Has most data needed for AI**

**What to Add for Phase 3**:

```javascript
// Add to Farm schema
{
  // IoT & Sensor Data (Phase 2)
  iotDevices: [ObjectId],
  realTimeData: {
    currentSoilMoisture: Number,
    currentSoilPH: Number,
    currentTemperature: Number,
    currentHumidity: Number,
    npk: {nitrogen: Number, phosphorus: Number, potassium: Number},
    lastUpdated: Date
  },

  // AI Recommendations (Phase 3 - NEW)
  aiRecommendations: {
    fertilizer: {
      lastGenerated: Date,
      nextApplicationDate: Date,
      recommendedProduct: String,
      estimatedCost: Number
    },
    irrigation: {
      lastScheduleGenerated: Date,
      weeklySchedule: [{ date: Date, amount: Number, duration: Number }],
      estimatedWaterSavings: Number
    },
    disease: {
      lastPrediction: Date,
      riskLevel: Enum['low', 'medium', 'high'],
      predictedDiseases: [String],
      preventiveMeasures: [String]
    }
  }
}
```

---

### ✅ 3. Crop Management System (COMPLETE)

**Location**: `apps/backend/models/Crop.js`

**Schema**:

```javascript
{
  name: String,
  scientificName: String,
  variety: String, // ✅ CRITICAL for cultivar-specific recommendations
  category: Enum['vegetable', 'fruit', 'grain', 'herb', 'flower', 'tree', 'other'],
  farm: ObjectId (ref: Farm),
  growingCycles: [GrowingCycleSchema], // ✅ Historical data for ML
  averageGrowingPeriod: {value, unit},
  optimalConditions: { // ✅ Perfect for AI matching!
    soilType: String,
    soilPH: {min, max},
    temperature: {min, max, unit},
    sunlight: String,
    waterRequirements: String
  },
  images: [{url, caption}],
  notes: String
}
```

**Growing Cycle Sub-Schema** (⭐ GOLDMINE for ML!):

```javascript
{
  plot: ObjectId,
  plantingDate: Date,
  expectedHarvestDate: Date,
  actualHarvestDate: Date,
  status: Enum['planned', 'planted', 'growing', 'harvested', 'failed'],
  plantingDensity: {value, unit},

  inputs: [{ // ✅ Historical fertilizer/pesticide usage
    type: Enum['fertilizer', 'pesticide', 'herbicide', 'water', 'other'],
    name: String,
    applicationDate: Date,
    quantity: {value, unit},
    notes: String
  }],

  activities: [{ // ✅ All farm activities logged
    type: Enum['planting', 'watering', 'fertilizing', 'pestControl', 'weeding', 'pruning', 'harvesting'],
    date: Date,
    performedBy: ObjectId,
    notes: String,
    images: [String]
  }],

  yield: { // ✅ CRITICAL for ML yield prediction
    expected: {value, unit},
    actual: {value, unit}
  },

  weather: [{ // ✅ Environmental data for correlation
    date: Date,
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    notes: String
  }]
}
```

**Assessment**: ⭐ **PERFECT for ML training! Has everything we need!**

**What to Add for Phase 3**:

```javascript
// Add to GrowingCycle
{
  // Link to AI recommendations
  aiInsights: {
    yieldPrediction: {
      predictedYield: Number,
      confidence: Number,
      generatedAt: Date,
      factors: [String]
    },
    healthAssessment: {
      overallScore: Number, // 0-100
      issues: [String],
      recommendations: [String],
      lastAssessment: Date
    },
    nextActions: [{
      action: String,
      dueDate: Date,
      priority: Enum['low', 'medium', 'high']
    }]
  },

  // ML features (calculated)
  mlFeatures: {
    growingDegreeDays: Number,
    waterUseEfficiency: Number,
    nutrientUseEfficiency: Number,
    successScore: Number
  }
}
```

---

### ✅ 4. Cultivation Cycle Model (COMPLETE)

**Location**: `apps/backend/modules/farm-management/models/CultivationCycle.js`

**Schema**:

```javascript
{
  id: String (unique),
  farmerId: String,
  farmId: String,
  cropType: Enum['cannabis', 'hemp', 'medicinal_cannabis'], // ⚠️ Need to expand to 6 plants
  variety: String,
  plantingDate: Date,
  expectedHarvestDate: Date,
  status: Enum['planning', 'active', 'harvesting', 'completed', 'cancelled'],
  phase: Enum['germination', 'vegetative', 'flowering', 'harvest', 'post-harvest'], // ✅ Good for stage-specific recommendations
  area: {value, unit},
  plantCount: Number,

  activities: [{ // ✅ All farm activities with SOP compliance
    id, type, description, date, userId, userName, notes,
    sopCompliance: Boolean, // ✅ GACP tracking
    recordedAt: Date
  }],

  complianceChecks: [{ // ✅ Inspector findings
    inspectorId, checkDate, checkType,
    findings: [{category, finding, severity, status}],
    overallCompliance: Enum['compliant', 'non_compliant', 'partially_compliant'],
    notes
  }],

  complianceScore: { // ✅ Real-time GACP score
    score: Number,
    lastUpdated: Date,
    breakdown: {
      sopCompliance, gacpStandards, safetyProtocols, recordKeeping
    }
  },

  harvestData: { // ✅ Yield tracking
    harvestDate, totalYield, yieldUnit, qualityGrade, notes
  }
}
```

**Assessment**: ✅ **Perfect for GACP compliance tracking!**

**What to Add for Phase 3**:

```javascript
// Add to CultivationCycle
{
  // Expand cropType to support 6 plants
  cropType: Enum[
    'cannabis',
    'turmeric',    // NEW
    'ginger',      // NEW
    'black_galingale', // NEW
    'plai',        // NEW
    'kratom'       // NEW
  ],

  // AI-powered recommendations
  recommendations: {
    fertilizer: [{
      date: Date,
      product: String,
      amount: Number,
      npkRatio: String,
      cost: Number,
      applied: Boolean
    }],
    irrigation: [{
      date: Date,
      amount: Number,
      duration: Number,
      method: String,
      applied: Boolean
    }],
    actions: [{
      type: String,
      description: String,
      priority: Enum['low', 'medium', 'high', 'urgent'],
      dueDate: Date,
      completed: Boolean
    }]
  },

  // Environmental aggregations (from sensors)
  environmentalSummary: {
    avgTemperature: Number,
    avgHumidity: Number,
    totalRainfall: Number,
    avgSoilMoisture: Number,
    avgSoilPH: Number,
    npkLevels: {nitrogen: Number, phosphorus: Number, potassium: Number}
  }
}
```

---

### ✅ 5. Phase 2 IoT Guide EXISTS

**Location**: `docs/PHASE2_IOT_SMART_FARMING_GUIDE.md`

**Status**: ✅ Complete documentation (74KB)

**What's Documented**:

- IoT Infrastructure architecture
- Device Management System
- Data Collection Pipeline
- Soil Monitoring Integration
- Water Monitoring Integration
- Real-time Dashboard
- Alert & Notification System

**Assessment**: ✅ **Full implementation guide ready for Phase 2**

---

## Part 2: What's MISSING (Need to Build for Phase 3)

### ❌ 1. AI/ML Recommendation Modules (0% complete)

**Need to Create**:

#### A. Fertilizer Recommendation Engine

**Files to Create**:

```
apps/backend/modules/ai-recommendations/
├── domain/
│   ├── services/
│   │   ├── SoilDataAnalyzer.js          ❌ NEW
│   │   ├── FertilizerRecommendationService.js ❌ NEW
│   │   └── CostOptimizer.js             ❌ NEW
│   └── entities/
│       └── Recommendation.js             ❌ NEW
├── infrastructure/
│   ├── database/
│   │   └── recommendation-repository.js  ❌ NEW
│   └── external/
│       └── fertilizer-database.js        ❌ NEW
├── presentation/
│   ├── controllers/
│   │   └── fertilizer.controller.js      ❌ NEW
│   ├── routes/
│   │   └── fertilizer.routes.js          ❌ NEW
│   └── dto/
│       └── RecommendationDTO.js          ❌ NEW
└── data/
    └── crop-profiles.js                  ❌ NEW (6 crops)
```

**Key Functions Needed**:

```javascript
// SoilDataAnalyzer.js
-analyzePH(currentPH, optimalRange) -
  analyzeNPK(currentNPK, cropRequirements) -
  analyzeMicronutrients(data) -
  calculateHealthScore() -
  // FertilizerRecommendationService.js
  generateRecommendations(farmData, cropType, growthStage) -
  calculateNPKDeficit(current, target) -
  recommendProducts(deficits, budget) -
  createApplicationSchedule(recommendations) -
  // CostOptimizer.js
  findCheapestCombination(npkRequirements, availableProducts) -
  calculateROI(cost, expectedYieldIncrease);
```

#### B. Water Management & Irrigation AI

**Files to Create**:

```
apps/backend/modules/ai-recommendations/
├── domain/
│   ├── services/
│   │   ├── ETCalculator.js               ❌ NEW (Evapotranspiration)
│   │   ├── WeatherService.js             ❌ NEW
│   │   ├── IrrigationScheduler.js        ❌ NEW
│   │   └── WaterOptimizer.js             ❌ NEW
├── presentation/
│   ├── controllers/
│   │   └── water.controller.js           ❌ NEW
│   └── routes/
│       └── water.routes.js               ❌ NEW
```

**Key Functions Needed**:

```javascript
// ETCalculator.js
-calculateET0(weatherData) - // FAO Penman-Monteith
  calculateETc(ET0, cropCoefficient, growthStage) -
  calculateWaterBalance(ETc, rainfall, irrigation) -
  // IrrigationScheduler.js
  createWeeklySchedule(farm, weatherForecast, soilMoisture) -
  optimizeTimings(schedule, energyCosts) -
  calculateWaterNeeds(area, cropType, soilType) -
  // WaterOptimizer.js
  analyzeUsagePatterns(historicalData) -
  detectWaste(usage, expected) -
  recommendEfficiencyImprovements();
```

#### C. AI Assistant (Thai NLP)

**Files to Create**:

```
apps/backend/modules/ai-recommendations/
├── domain/
│   ├── services/
│   │   ├── ThaiNLPService.js             ❌ NEW
│   │   ├── ConversationManager.js        ❌ NEW
│   │   ├── KnowledgeBase.js              ❌ NEW
│   │   └── ResponseGenerator.js          ❌ NEW
├── presentation/
│   ├── controllers/
│   │   └── ai-assistant.controller.js    ❌ NEW
│   └── routes/
│       └── ai-assistant.routes.js        ❌ NEW
```

**Key Functions Needed**:

```javascript
// ThaiNLPService.js
-tokenize(thaiText) -
  extractEntities(text) - // crops, problems, nutrients
  classifyIntent(text) - // question, advice, problem report
  analyzeSentiment(text) -
  // ConversationManager.js
  createConversation(userId, farmId) -
  addMessage(conversationId, message, role) -
  getContext(conversationId) -
  summarizeConversation() -
  // KnowledgeBase.js
  searchCropKnowledge(cropName, query) -
  getProblemSolutions(problem, cropType) -
  getNutrientInfo(nutrient) -
  getGACPRequirements(topic) -
  // ResponseGenerator.js
  generateResponse(nlpResult, context, farmData) -
  formatRecommendation(data) -
  addSuggestions(response);
```

---

### ❌ 2. Central Plant Database (0% complete)

**Need to Create**: New collections for 6 medicinal plants

**Collections to Create**:

#### A. Plant Catalog

```javascript
// apps/backend/models/PlantCatalog.js ❌ NEW
{
  plantId: String (unique),
  scientificName: String,
  commonNameThai: String,
  commonNameEnglish: String,
  family: String,
  isPrimaryCrop: Boolean, // Cannabis = true
  gacpRequired: Boolean,
  regulatoryStatus: Enum['controlled', 'licensed', 'free'],
  category: Enum['medicinal', 'economic', 'both'],
  primaryUse: [String],
  marketValue: {avgPricePerKg, demandLevel, exportPotential}
}
```

#### B. Plant Cultivars

```javascript
// apps/backend/models/PlantCultivar.js ❌ NEW
{
  cultivarId: String (unique),
  plantId: String (FK),
  varietyName: {thai, english, tradeName},
  genetics: {type, lineage, breedingOrigin},
  characteristics: {
    height: {min, max, unit},
    yieldPerPlant: {min, max, unit},
    floweringTime: {min, max, unit},
    thcContent: {min, max}, // Cannabis
    curcuminContent: Number  // Turmeric
  },
  growingPreferences: {
    climateZone, idealTemperature, humidityPreference,
    lightRequirement, photoperiodSensitivity
  },
  resistances: {
    diseaseResistance: [String],
    pestResistance: [String],
    stressResistance: {drought, heat, cold, salinity}
  },
  suitableRegions: [String], // Thai regions
  popularity: {farmsGrowing, totalAreaPlanted, successRate}
}
```

#### C. Regional Conditions

```javascript
// apps/backend/models/RegionalConditions.js ❌ NEW
{
  regionId: String (e.g., "TH_CHIANGMAI"),
  location: {province, provinceEn, region, coordinates},
  climate: {
    classification, avgTempAnnual, tempRange,
    rainfall: {annualMm, rainyMonths, dryMonths},
    humidity, sunlightHoursPerDay
  },
  soilProfile: {
    predominantTypes, avgPH, organicMatterContent,
    drainageQuality, fertilityRating
  },
  elevation: {min, max, unit, predominant},
  plantSuitability: [{
    plantId, suitabilityScore: Number (0-100),
    reasoning, bestSeasons, challenges,
    recommendedCultivars: [String]
  }]
}
```

#### D. Disease & Pest Database

```javascript
// apps/backend/models/DiseasePest.js ❌ NEW
{
  problemId: String (unique),
  problemType: Enum['disease', 'pest', 'deficiency', 'environmental'],
  name: {thai, english, scientific},
  affectedPlants: [{
    plantId, susceptibility: Enum, growthStagesAffected,
    yieldLossPercent: {min, max}
  }],
  identification: {
    visualSymptoms: [String],
    earlyWarningsSigns: [String],
    images: [{url, stage}]
  },
  causativeFactors: {
    environmentalTriggers: [{factor, threshold, risk}],
    seasonalRisk: {rainy, hot, cool},
    regionalRisk: [{region, season, riskLevel}]
  },
  prevention: {
    culturalPractices: [String],
    organicMethods: [String],
    chemicalOptions: [{product, gacpApproved, applicationRate, phi}]
  },
  treatment: {organicTreatment, chemicalTreatment, biocontrol},
  economicImpact: {avgTreatmentCost, avgYieldLoss, marketValueLoss},
  predictionModel: {
    mlModelId, inputFeatures: [String], accuracy: Number
  }
}
```

#### E. Historical Yields

```javascript
// apps/backend/models/HistoricalYield.js ❌ NEW
{
  yieldRecordId: String (unique),
  farmInfo: {farmId, province, region, coordinates, anonymized},
  plantDetails: {plantId, cultivarId, varietyName},
  cultivationCycle: {
    plantingDate, harvestDate, totalDays,
    growthStages: [{stage, days}]
  },
  farmCharacteristics: {
    areaRai, plantCount, plantDensity, soilType, soilPH,
    irrigationType, greenhouseType
  },
  inputsUsed: {
    fertilizers: [{type, totalKg, applicationTimes, totalCost}],
    waterUsage: {totalCubicMeters, irrigationFrequency},
    pestControl: [{product, applications, cost}]
  },
  environmentalConditions: {
    avgTemperature, totalRainfall, avgHumidity, sunlightHours,
    extremeEvents: [{type, date, impact}]
  },
  healthEvents: {
    diseasesEncountered: [{problemId, severity, dateDetected, treatment, resolved}],
    pestsEncountered, deficiencies
  },
  yieldResults: {
    totalYieldKg, yieldPerRai, yieldPerPlant,
    qualityGrade, moistureContent,
    thcContent, cbdContent, terpeneProfile // Cannabis
  },
  economicOutcome: {
    totalRevenue, totalCosts, netProfit, profitPerRai, roi
  },
  gacpCompliance: {certified, auditScore, documentationComplete},
  mlFeatures: { // For ML training
    growingDegreeDays, waterUseEfficiency, nutrientUseEfficiency,
    successScore, predictedYield, actualYield, predictionError
  }
}
```

---

### ❌ 3. Machine Learning Models (0% complete)

**Need to Build**:

#### A. Yield Prediction Model

```python
# apps/ml-models/yield-prediction/
├── train.py              ❌ NEW
├── predict.py            ❌ NEW
├── model.pkl             ❌ NEW (trained model)
└── requirements.txt      ❌ NEW
```

**Features to Use**:

- Cultivar characteristics
- Regional suitability score
- Soil conditions (pH, NPK, EC)
- Weather data (temperature, rainfall, humidity)
- Historical yields in region
- Farm management practices
- Growing degree days

**Target**: Predicted yield (kg/rai) with confidence interval

#### B. Disease Risk Prediction

```python
# apps/ml-models/disease-prediction/
├── train.py              ❌ NEW
├── predict.py            ❌ NEW
├── model.pkl             ❌ NEW
└── requirements.txt      ❌ NEW
```

**Features to Use**:

- Current weather (7-day history + forecast)
- Regional disease history
- Plant growth stage
- Time of year
- Preventive measures in place
- Soil moisture levels

**Target**: Disease probability (%) for next 7, 14, 30 days

---

## Part 3: Implementation Strategy

### Step 1: Extend Existing Models (Week 1-2)

**Priority**: HIGH - Foundation for everything

**Tasks**:

1. Add `aiRecommendations` field to Farm model
2. Add `mlFeatures` to GrowingCycle in Crop model
3. Extend `cropType` enum in CultivationCycle to support 6 plants
4. Add `recommendations` array to CultivationCycle
5. Create migration scripts for existing data

**Deliverables**:

- Updated models
- Database migrations
- No breaking changes to existing APIs

---

### Step 2: Create Central Plant Database (Week 3-4)

**Priority**: HIGH - Required for all AI features

**Tasks**:

1. Create 5 new models (PlantCatalog, PlantCultivar, RegionalConditions, DiseasePest, HistoricalYield)
2. Seed database with initial data:
   - 6 plant catalog entries
   - 40-50 cultivar entries (based on literature)
   - 77 provincial regional conditions
   - 60-70 disease/pest entries
   - 100 historical yield records (estimates from research)
3. Build admin interface for data management
4. Create API endpoints for querying

**Deliverables**:

- 5 new MongoDB collections
- Seed data scripts
- Admin CRUD interface
- REST API endpoints

---

### Step 3: Build Fertilizer Recommendation Engine (Week 5-6)

**Priority**: HIGH - Core Phase 3 feature

**Tasks**:

1. Create SoilDataAnalyzer service
2. Implement NPK calculation logic
3. Build FertilizerRecommendationService
4. Create fertilizer product database
5. Implement cost optimization
6. Build API endpoints
7. Create UI for recommendations

**Deliverables**:

- Fertilizer recommendation API
- Cost calculator
- Application scheduler
- Farmer dashboard widget

---

### Step 4: Build Water Management AI (Week 7-8)

**Priority**: HIGH - Core Phase 3 feature

**Tasks**:

1. Implement ETCalculator (FAO Penman-Monteith)
2. Integrate weather API (TMD + OpenWeatherMap)
3. Build IrrigationScheduler
4. Create WaterOptimizer
5. Build API endpoints
6. Create UI for irrigation schedules

**Deliverables**:

- Smart irrigation scheduler
- Weather-aware recommendations
- Water usage analytics
- Irrigation dashboard

---

### Step 5: Build AI Assistant (Week 9-10)

**Priority**: MEDIUM - Nice to have

**Tasks**:

1. Integrate PyThaiNLP or similar
2. Build ThaiNLPService
3. Create KnowledgeBase
4. Implement ConversationManager
5. Build ResponseGenerator
6. Create chatbot UI
7. Test with real farmer queries

**Deliverables**:

- Thai language chatbot
- Context-aware conversations
- Agricultural knowledge base
- Chat interface

---

### Step 6: ML Models (Week 11-12)

**Priority**: MEDIUM - Can be improved over time

**Tasks**:

1. Set up Python ML environment
2. Prepare training data from HistoricalYield
3. Train yield prediction model
4. Train disease risk model
5. Create API endpoints for predictions
6. Integrate with frontend

**Deliverables**:

- 2 ML models (yield, disease)
- Python API service
- Prediction endpoints
- Accuracy metrics

---

## Part 4: Reusable Code Mapping

### What to Reuse from Existing Code

#### 1. Farm Management Module → AI Recommendations

**Reuse**:

- ✅ Farm entity structure
- ✅ Use cases (register, update, get, list)
- ✅ Repository pattern
- ✅ DTO transformations
- ✅ Validation logic

**Adapt for**:

- Get farm data for AI input
- Store AI-generated recommendations
- Link recommendations to farms

#### 2. Crop Model → ML Training Data

**Reuse**:

- ✅ GrowingCycle schema (perfect for historical data)
- ✅ Inputs tracking (fertilizer usage)
- ✅ Activities logging (farming practices)
- ✅ Weather data structure
- ✅ Yield tracking (actual vs expected)

**Adapt for**:

- Export to ML training format
- Calculate derived features
- Aggregate for predictions

#### 3. CultivationCycle Model → GACP + AI

**Reuse**:

- ✅ Compliance tracking
- ✅ Activity logging
- ✅ Phase tracking (germination, vegetative, flowering)
- ✅ Harvest data

**Adapt for**:

- Add AI-generated action items
- Store fertilizer/irrigation recommendations
- Track AI recommendation accuracy

#### 4. Existing API Patterns → New AI APIs

**Reuse**:

- ✅ Module structure (domain, infrastructure, presentation)
- ✅ Controller pattern
- ✅ Route definitions
- ✅ Error handling
- ✅ Authentication middleware
- ✅ Validation middleware

**Apply to**:

- AI recommendation endpoints
- ML prediction endpoints
- Chatbot endpoints

---

## Part 5: Priority Matrix

### Must Have (Phase 3 MVP)

1. ✅ Extend existing models (Farm, Crop, CultivationCycle)
2. ✅ Create PlantCatalog (6 plants)
3. ✅ Create PlantCultivar (40-50 varieties)
4. ✅ Fertilizer Recommendation Engine
5. ✅ Irrigation Scheduler (basic)
6. ✅ API endpoints for recommendations

### Should Have (Phase 3 Full)

7. ✅ RegionalConditions (77 provinces)
8. ✅ DiseasePest database (60-70 problems)
9. ✅ AI Assistant (Thai NLP)
10. ✅ Disease Risk Prediction (basic ML)
11. ✅ Dashboard widgets for recommendations

### Nice to Have (Future Phases)

12. ⏳ HistoricalYield (large dataset collection)
13. ⏳ Advanced ML models (deep learning)
14. ⏳ Yield Prediction (requires 500+ records)
15. ⏳ Image-based disease detection
16. ⏳ Voice interface for chatbot

---

## Part 6: Technology Stack

### Backend (Existing + New)

**Existing** (Keep):

- ✅ Node.js 18+
- ✅ Express.js
- ✅ MongoDB
- ✅ Mongoose ODM
- ✅ JWT Authentication

**New** (Add for Phase 3):

- ❌ Python 3.9+ (for ML models)
- ❌ FastAPI (Python API for ML)
- ❌ Scikit-learn (ML library)
- ❌ PyThaiNLP (Thai language processing)
- ❌ Redis (caching for recommendations)

### Frontend (Existing)

**Existing** (Keep):

- ✅ Next.js
- ✅ React
- ✅ TailwindCSS

**New** (Add for Phase 3):

- ❌ Chart.js or Recharts (recommendation visualizations)
- ❌ Chatbot UI component

### External APIs

**New**:

- ❌ Thai Meteorological Department API (weather)
- ❌ OpenWeatherMap API (backup weather)
- ❌ Optional: Anthropic Claude API (for chatbot)

---

## Part 7: Estimation

### Time Estimate

**Phase 3 Implementation**:

- Extend Models: 2 weeks
- Central Database: 2 weeks
- Fertilizer Engine: 2 weeks
- Water Management: 2 weeks
- AI Assistant: 2 weeks
- ML Models: 2 weeks

**Total**: 12 weeks (3 months)

### Team Required

- 2 Backend Developers
- 1 ML Engineer
- 1 Agricultural Expert
- 1 Frontend Developer
- 1 QA Engineer

**Total**: 6 people

### Budget Estimate

- Development: 2,000,000 - 3,000,000 THB
- Infrastructure (cloud, APIs): 50,000 THB/month
- Data collection: 200,000 THB

**Total**: ~2,500,000 THB

---

## Conclusion

### Summary

**Existing Code (Reusable ~40%)**:

- ✅ Farm management system (complete)
- ✅ Crop tracking (complete)
- ✅ GACP compliance (complete)
- ✅ Database models (solid foundation)
- ✅ Phase 2 IoT guide (ready to implement)

**Missing Code (Need to Build ~60%)**:

- ❌ AI recommendation engines (0%)
- ❌ Central plant database (0%)
- ❌ ML models (0%)
- ❌ AI assistant (0%)

**Strategy**: Build on existing foundation, extend models, create new AI modules

**Next Steps**:

1. Review this document with team
2. Prioritize features (MVP first)
3. Start with extending existing models
4. Build central database
5. Implement fertilizer engine (highest value)
6. Deploy and iterate

---

**Document Owner**: Development Team
**Status**: Ready for Implementation Planning
**Next Review**: After team meeting
