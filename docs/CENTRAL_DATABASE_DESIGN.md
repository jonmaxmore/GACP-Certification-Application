# Central Medicinal Plant Database - Design Specification

**Document Version**: 1.0.0
**Date**: 2025-10-28
**Database Purpose**: Comprehensive Knowledge Base for 6 Thai Medicinal Plants

---

## Executive Summary

This document specifies the design of a **Central Database** for 6 Thai medicinal plants (กัญชา, ขมิ้นชัน, ขิง, กระชายดำ, ไพล, กระท่อม). The database will serve as the foundation for:

1. **Variety/Cultivar Management** - Track different strains and genetics
2. **Regional Suitability** - Map growing conditions by Thai provinces
3. **Disease & Pest Prediction** - Historical problems and patterns
4. **Yield Forecasting** - Machine learning training data
5. **Climate Correlation** - Weather pattern analysis
6. **Best Practices Repository** - Successful cultivation methods

**Primary Purpose**: Enable **data-driven predictions** for plant growth success, disease risk, and optimal yield outcomes.

---

## Database Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│           Central Medicinal Plant Database                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Plant Catalog   │    │  Cultivar Library│              │
│  │  (6 Species)     │───▶│  (Varieties)     │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                        │                         │
│           ▼                        ▼                         │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │ Regional Data    │    │ Growing Conditions│              │
│  │ (77 Provinces)   │◀──▶│ Requirements      │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                        │                         │
│           ▼                        ▼                         │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Disease/Pest    │    │  Historical Yields│              │
│  │  Database        │◀──▶│  (ML Training)    │              │
│  └──────────────────┘    └──────────────────┘              │
│           │                        │                         │
│           └────────────┬───────────┘                         │
│                        ▼                                     │
│           ┌────────────────────────┐                        │
│           │  Prediction Engine     │                        │
│           │  (ML Models)           │                        │
│           └────────────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### 1. Plant Catalog Collection

**Collection**: `plant_catalog`

**Purpose**: Master list of supported medicinal plants

```javascript
{
  _id: ObjectId,
  plantId: "CANNABIS_001", // Unique identifier
  scientificName: "Cannabis sativa L.",
  commonNameThai: "กัญชา",
  commonNameEnglish: "Cannabis",
  family: "Cannabaceae",

  isPrimaryCrop: true, // Cannabis = true, others = false
  gacpRequired: true,
  regulatoryStatus: "controlled", // controlled, licensed, free

  category: "medicinal", // medicinal, economic, both
  primaryUse: ["pharmaceutical", "extract", "flower"],

  cultivationDifficulty: "moderate", // easy, moderate, hard
  averageGrowthCycle: {
    min: 8,
    max: 12,
    unit: "weeks"
  },

  marketValue: {
    avgPricePerKg: 3000, // THB
    demandLevel: "high", // low, medium, high
    exportPotential: true
  },

  references: [
    {
      source: "Department of Agriculture",
      url: "https://www.doa.go.th",
      year: 2024
    }
  ],

  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Initial Data**: 6 records (Cannabis, Turmeric, Ginger, Black Galingale, Plai, Kratom)

---

### 2. Cultivar/Variety Library

**Collection**: `plant_cultivars`

**Purpose**: Track different strains, varieties, and genetics for each plant

```javascript
{
  _id: ObjectId,
  cultivarId: "CAN_THST_001", // Cannabis_Thailand_Sativa_001
  plantId: "CANNABIS_001", // FK to plant_catalog

  varietyName: {
    thai: "กัญชาพันธุ์ไทยเหนียว",
    english: "Thai Sticky Cannabis",
    tradeName: "Thai Stick"
  },

  genetics: {
    type: "landrace", // landrace, hybrid, indica, sativa, ruderalis
    lineage: "Traditional Thai genetics",
    breedingOrigin: "Northern Thailand",
    stabilityGeneration: "F8" // For hybrids
  },

  characteristics: {
    height: { min: 2.5, max: 4.0, unit: "meters" },
    yieldPerPlant: { min: 200, max: 500, unit: "grams" },
    floweringTime: { min: 10, max: 14, unit: "weeks" },
    thcContent: { min: 8, max: 15, unit: "percent" },
    cbdContent: { min: 0.5, max: 2, unit: "percent" },

    // For rhizome crops (turmeric, ginger, etc.)
    rhizomeSize: { min: 0, max: 0, unit: "cm" },
    rhizomeColor: "",
    curcuminContent: 0 // For turmeric
  },

  growingPreferences: {
    climateZone: ["tropical", "subtropical"],
    idealTemperature: { min: 25, max: 30, unit: "celsius" },
    humidityPreference: { min: 60, max: 80, unit: "percent" },
    lightRequirement: "full_sun", // full_sun, partial_shade, shade_tolerant
    photoperiodSensitivity: "sensitive" // sensitive, auto, neutral
  },

  resistances: {
    diseaseResistance: ["powdery_mildew:medium", "bud_rot:low"],
    pestResistance: ["spider_mites:low", "aphids:medium"],
    stressResistance: {
      drought: "medium",
      heat: "high",
      cold: "low",
      salinity: "low"
    }
  },

  certifications: {
    gacpApproved: true,
    organicCertified: false,
    thaiGapApproved: false
  },

  suitableRegions: ["northern", "northeastern", "central"], // Thai regions

  availability: {
    seedSuppliers: [
      { name: "Thai Seed Co.", contact: "xxx", verified: true }
    ],
    avgSeedPrice: { amount: 50, unit: "THB", per: "seed" }
  },

  popularity: {
    farmsGrowing: 150, // Count
    totalAreaPlanted: 500, // Rai
    successRate: 85 // Percent
  },

  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:

- `plantId` (FK)
- `varietyName.english` (text search)
- `genetics.type`
- `suitableRegions`

**Initial Data Requirements**:

- Cannabis: 10-15 varieties (Thai landraces, popular hybrids, medical strains)
- Turmeric: 5-7 varieties (Chiang Mai, Prachinburi, etc.)
- Ginger: 5-7 varieties (Thai ginger, Chinese ginger)
- Black Galingale: 3-5 varieties
- Plai: 3-5 varieties
- Kratom: 5-7 varieties (red, white, green vein)

---

### 3. Regional Growing Database

**Collection**: `regional_conditions`

**Purpose**: Map Thailand's 77 provinces with growing suitability for each plant

```javascript
{
  _id: ObjectId,
  regionId: "TH_CHIANGMAI",

  location: {
    province: "เชียงใหม่",
    provinceEn: "Chiang Mai",
    region: "northern", // northern, northeastern, central, southern, eastern, western
    districts: ["เมืองเชียงใหม่", "สันทราย", "ดอยสะเก็ด"],
    coordinates: {
      lat: 18.7883,
      lng: 98.9853
    }
  },

  climate: {
    classification: "tropical_savanna", // Köppen climate
    avgTempAnnual: { min: 22, max: 28, unit: "celsius" },
    tempRange: {
      coldestMonth: { month: "December", avgTemp: 18 },
      hottestMonth: { month: "April", avgTemp: 32 }
    },
    rainfall: {
      annualMm: 1150,
      rainyMonths: ["May", "June", "July", "August", "September"],
      dryMonths: ["November", "December", "January", "February"]
    },
    humidity: { avg: 70, rainySeasonMax: 90 },
    sunlightHoursPerDay: { avg: 7, max: 9 }
  },

  soilProfile: {
    predominantTypes: ["sandy_loam", "loam", "clay_loam"],
    avgPH: { min: 5.5, max: 6.8 },
    organicMatterContent: { avg: 3.5, unit: "percent" },
    drainageQuality: "good", // poor, moderate, good, excellent
    fertilityRating: "medium" // low, medium, high
  },

  elevation: {
    min: 300,
    max: 1500,
    unit: "meters",
    predominant: 400
  },

  // Suitability scores for each plant (0-100)
  plantSuitability: [
    {
      plantId: "CANNABIS_001",
      suitabilityScore: 95, // 0-100
      reasoning: "Ideal temperature, good rainfall distribution, traditional growing area",
      bestSeasons: ["rainy", "winter"],
      challenges: ["powdery_mildew_in_humid_season"],
      recommendedCultivars: ["CAN_THST_001", "CAN_THST_003"]
    },
    {
      plantId: "TURMERIC_001",
      suitabilityScore: 85,
      reasoning: "Good soil, adequate rainfall",
      bestSeasons: ["rainy"],
      challenges: ["requires_irrigation_in_dry_season"],
      recommendedCultivars: ["TUR_CHMAI_001"]
    }
    // ... other plants
  ],

  infrastructure: {
    waterAvailability: "high", // low, medium, high
    irrigationSystems: ["drip", "sprinkler", "surface"],
    electricityAccess: "reliable",
    roadAccess: "good",
    marketProximity: { distanceKm: 20, quality: "excellent" }
  },

  agriculturalData: {
    totalFarmland: 2500000, // Rai
    activeFarms: 180000,
    avgFarmSize: 12, // Rai
    majorCrops: ["rice", "vegetables", "flowers", "cannabis"]
  },

  regulatoryEnvironment: {
    cannabisLicensesIssued: 45,
    gacpCertifiedFarms: 12,
    extensionOfficers: 35
  },

  historicalYields: [
    {
      year: 2024,
      plantId: "CANNABIS_001",
      avgYieldPerRai: 150, // kg
      topYieldPerRai: 250,
      reportedFarms: 20
    }
  ],

  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:

- `location.provinceEn`
- `location.region`
- `plantSuitability.plantId`
- `plantSuitability.suitabilityScore`

**Initial Data Requirements**: 77 provinces x 6 plants = 462 suitability assessments

---

### 4. Disease & Pest Database

**Collection**: `diseases_pests`

**Purpose**: Comprehensive database of plant health problems for prediction

```javascript
{
  _id: ObjectId,
  problemId: "DIS_CAN_PM_001", // Disease_Cannabis_PowderyMildew_001
  problemType: "disease", // disease, pest, deficiency, environmental

  name: {
    thai: "เชื้อราแป้งขาว",
    english: "Powdery Mildew",
    scientific: "Podosphaera macularis"
  },

  affectedPlants: [
    {
      plantId: "CANNABIS_001",
      susceptibility: "high", // low, medium, high
      growthStagesAffected: ["vegetative", "flowering"],
      yieldLossPercent: { min: 20, max: 60 }
    }
  ],

  identification: {
    visualSymptoms: [
      "White powdery spots on leaves",
      "Leaf curling and yellowing",
      "Stunted growth"
    ],
    earlyWarningsSigns: [
      "Small white spots beginning on lower leaves",
      "Increased humidity after rain"
    ],
    images: [
      { url: "/images/powdery_mildew_1.jpg", stage: "early" },
      { url: "/images/powdery_mildew_2.jpg", stage: "advanced" }
    ]
  },

  causativeFactors: {
    environmentalTriggers: [
      { factor: "high_humidity", threshold: "> 80%", risk: "high" },
      { factor: "temperature", range: { min: 20, max: 25 }, risk: "high" },
      { factor: "poor_air_circulation", risk: "medium" },
      { factor: "crowded_plants", risk: "high" }
    ],
    seasonalRisk: {
      rainy: "very_high",
      hot: "low",
      cool: "medium"
    },
    regionalRisk: [
      { region: "northern", season: "rainy", riskLevel: "high" },
      { region: "central", season: "rainy", riskLevel: "very_high" }
    ]
  },

  prevention: {
    culturalPractices: [
      "Maintain proper plant spacing (60cm minimum)",
      "Ensure good air circulation",
      "Remove infected leaves immediately",
      "Avoid overhead watering"
    ],
    organicMethods: [
      "Neem oil spray (2% solution)",
      "Baking soda solution (1 tbsp per liter)",
      "Potassium bicarbonate spray"
    ],
    chemicalOptions: [
      {
        product: "Sulfur dust",
        gacpApproved: true,
        applicationRate: "5g per liter",
        phi: 0 // Pre-harvest interval (days)
      }
    ]
  },

  treatment: {
    organicTreatment: [
      "Remove and destroy infected plant parts",
      "Apply neem oil spray every 5-7 days",
      "Increase air circulation"
    ],
    chemicalTreatment: [
      {
        activeIngredient: "Myclobutanil",
        gacpApproved: false, // Important for cannabis!
        product: "Eagle 20EW",
        phi: 30
      }
    ],
    biocontrol: [
      {
        agent: "Bacillus subtilis",
        product: "Serenade",
        gacpApproved: true
      }
    ]
  },

  economicImpact: {
    avgTreatmentCost: { amount: 500, unit: "THB", per: "rai" },
    avgYieldLoss: 30, // percent
    marketValueLoss: { amount: 15000, unit: "THB", per: "rai" }
  },

  predictionModel: {
    mlModelId: "PM_PRED_001",
    inputFeatures: [
      "temperature_7day_avg",
      "humidity_7day_avg",
      "rainfall_last_3days",
      "plant_density",
      "air_circulation_score",
      "previous_infection_history"
    ],
    accuracy: 82, // percent
    lastTrained: ISODate
  },

  historicalOutbreaks: [
    {
      year: 2024,
      region: "northern",
      provinces: ["Chiang Mai", "Chiang Rai"],
      monthsPeak: ["June", "July", "August"],
      farmsBetted: 78,
      avgSeverity: "moderate"
    }
  ],

  references: [
    {
      title: "Cannabis Disease Management Guide",
      author: "Department of Agriculture Thailand",
      year: 2024,
      url: "https://www.doa.go.th"
    }
  ],

  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:

- `affectedPlants.plantId`
- `problemType`
- `causativeFactors.seasonalRisk`
- `regionalRisk.region`

**Initial Data Requirements**:

- Cannabis: 15-20 common diseases/pests
- Turmeric: 8-10 problems
- Ginger: 8-10 problems
- Black Galingale: 5-7 problems
- Plai: 5-7 problems
- Kratom: 5-7 problems

**Total**: ~60-70 disease/pest records

---

### 5. Historical Yield Database

**Collection**: `historical_yields`

**Purpose**: Training data for ML yield prediction models

```javascript
{
  _id: ObjectId,
  yieldRecordId: "YIELD_2024_CAN_001",

  farmInfo: {
    farmId: "FARM_001", // FK to farms collection
    anonymized: false, // Privacy flag
    province: "Chiang Mai",
    region: "northern",
    coordinates: { lat: 18.7883, lng: 98.9853 }
  },

  plantDetails: {
    plantId: "CANNABIS_001",
    cultivarId: "CAN_THST_001",
    varietyName: "Thai Sticky Cannabis"
  },

  cultivationCycle: {
    plantingDate: ISODate("2024-01-15"),
    harvestDate: ISODate("2024-05-10"),
    totalDays: 115,
    growthStages: [
      { stage: "germination", days: 7 },
      { stage: "seedling", days: 14 },
      { stage: "vegetative", days: 42 },
      { stage: "flowering", days: 49 },
      { stage: "harvest", days: 3 }
    ]
  },

  farmCharacteristics: {
    areaRai: 2.5,
    plantCount: 150,
    plantDensity: 60, // plants per rai
    soilType: "sandy_loam",
    soilPH: 6.5,
    irrigationType: "drip",
    greenhouseType: "open_field" // greenhouse, hoop_house, open_field
  },

  inputsUsed: {
    fertilizers: [
      {
        type: "NPK 15-15-15",
        totalKg: 25,
        applicationTimes: 5,
        totalCost: 1250 // THB
      },
      {
        type: "Organic compost",
        totalKg: 500,
        totalCost: 2500
      }
    ],
    waterUsage: {
      totalCubicMeters: 120,
      irrigationFrequency: "daily",
      avgMmPerWeek: 40
    },
    pestControl: [
      {
        product: "Neem oil",
        applications: 4,
        cost: 800
      }
    ]
  },

  environmentalConditions: {
    avgTemperature: 26.5, // celsius
    totalRainfall: 450, // mm
    avgHumidity: 75, // percent
    sunlightHours: { avg: 7.5, total: 862 },

    extremeEvents: [
      { type: "heatwave", date: ISODate("2024-03-20"), impact: "minor" },
      { type: "heavy_rain", date: ISODate("2024-04-15"), impact: "moderate" }
    ]
  },

  healthEvents: {
    diseasesEncountered: [
      {
        problemId: "DIS_CAN_PM_001",
        severity: "moderate",
        dateDetected: ISODate("2024-03-25"),
        treatment: "Neem oil spray",
        resolved: true
      }
    ],
    pestsEncountered: [],
    deficiencies: [
      {
        nutrient: "nitrogen",
        stage: "vegetative",
        corrected: true
      }
    ]
  },

  yieldResults: {
    totalYieldKg: 375, // Total harvest
    yieldPerRai: 150, // kg/rai
    yieldPerPlant: 2.5, // kg/plant

    qualityGrade: "A", // A, B, C based on standards
    moistureContent: 12, // percent

    // Cannabis-specific
    thcContent: 12.5, // percent
    cbdContent: 1.2, // percent
    terpeneProfile: ["myrcene", "limonene", "pinene"],

    // Rhizome crops (turmeric, ginger)
    rhizomeYieldKg: 0,
    curcuminContent: 0
  },

  economicOutcome: {
    totalRevenue: 1125000, // THB (375kg x 3000 THB/kg)
    totalCosts: 45000, // THB
    netProfit: 1080000, // THB
    profitPerRai: 432000, // THB
    roi: 2400 // percent
  },

  gacpCompliance: {
    certified: true,
    auditScore: 92,
    documentationComplete: true
  },

  farmerFeedback: {
    satisfactionScore: 9, // 1-10
    wouldRepeat: true,
    comments: "Excellent yield, good market price",
    challenges: ["Powdery mildew in March", "High labor cost"]
  },

  mlFeatures: {
    // Calculated features for machine learning
    growingDegreeDays: 2875,
    waterUseEfficiency: 3.125, // kg yield per cubic meter water
    nutrientUseEfficiency: 15.0, // kg yield per kg NPK

    successScore: 95, // Overall success rating (0-100)
    predictedYield: 140, // What model predicted
    actualYield: 150, // Actual result
    predictionError: 10 // kg/rai
  },

  dataQuality: {
    completeness: 95, // percent of fields filled
    verified: true,
    verificationDate: ISODate,
    source: "iot_sensors" // iot_sensors, manual_entry, survey
  },

  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:

- `plantDetails.plantId`
- `farmInfo.region`
- `cultivationCycle.harvestDate`
- `yieldResults.yieldPerRai`
- `gacpCompliance.certified`
- `mlFeatures.successScore`

**Initial Data Requirements**:

- Seed with historical data from literature and research
- Target: 100+ yield records per crop (600+ total)
- Ongoing: Collect from platform users

---

### 6. Climate Correlation Database

**Collection**: `climate_patterns`

**Purpose**: Link weather patterns to agricultural outcomes for prediction

```javascript
{
  _id: ObjectId,
  patternId: "CLIM_NORTH_2024_RAINY",

  location: {
    region: "northern",
    provinces: ["Chiang Mai", "Chiang Rai", "Lamphun"],
    yearMonth: "2024-06"
  },

  weatherData: {
    avgTemperature: 28.5,
    maxTemperature: 35.2,
    minTemperature: 22.1,
    avgHumidity: 82,
    totalRainfall: 180, // mm
    rainyDays: 18,
    sunlightHours: 5.5,
    windSpeed: 8 // km/h
  },

  agriculturalImpacts: [
    {
      plantId: "CANNABIS_001",
      growthStage: "flowering",
      impact: "negative",
      reason: "High humidity increased powdery mildew risk",
      diseaseOutbreakProbability: 75, // percent
      recommendedActions: [
        "Increase air circulation",
        "Apply preventive fungicides",
        "Monitor daily"
      ]
    },
    {
      plantId: "TURMERIC_001",
      growthStage: "vegetative",
      impact: "positive",
      reason: "Adequate rainfall reduced irrigation costs",
      waterSavingsPercent: 40
    }
  ],

  historicalComparison: {
    comparedToAverage: "+15mm_rainfall",
    comparedToLastYear: "-5mm_rainfall",
    extremeEvent: false
  },

  createdAt: ISODate
}
```

---

## Machine Learning Integration

### Prediction Models Enabled by This Database

#### 1. **Yield Prediction Model**

**Input Features** (from database):

- Cultivar characteristics (from `plant_cultivars`)
- Regional suitability score (from `regional_conditions`)
- Historical yields in region (from `historical_yields`)
- Current season climate (from `climate_patterns`)
- Soil conditions
- Farm management practices

**Output**: Predicted yield (kg/rai) with confidence interval

**Training Data**: `historical_yields` collection (requires 200+ records per crop)

#### 2. **Disease Risk Prediction**

**Input Features**:

- Current weather conditions
- Regional disease history (from `diseases_pests.historicalOutbreaks`)
- Plant growth stage
- Time of year
- Preventive measures in place

**Output**: Disease probability (%) for next 7, 14, 30 days

**Training Data**: `diseases_pests` + `historical_yields.healthEvents`

#### 3. **Optimal Planting Date Recommender**

**Input Features**:

- Regional climate patterns (from `climate_patterns`)
- Cultivar requirements (from `plant_cultivars`)
- Market price seasonality
- Available infrastructure

**Output**: Recommended planting date with reasoning

#### 4. **Cultivar Recommendation Engine**

**Input Features**:

- Farm location (province)
- Soil type and conditions
- Available irrigation
- Farmer experience level
- Target yield
- Risk tolerance

**Output**: Ranked list of suitable cultivars with success probability

**Data Source**: `plant_cultivars` + `regional_conditions` + `historical_yields`

---

## Data Collection Strategy

### Phase 1: Seed Database (Months 1-3)

**Sources**:

1. **Literature Review**
   - Academic papers (Thai and international)
   - Department of Agriculture research
   - DTAM publications
   - University agricultural departments

2. **Expert Interviews**
   - Government agricultural officers
   - Experienced farmers
   - Agricultural consultants
   - Plant breeders

3. **Existing Datasets**
   - Thai Meteorological Department (climate data)
   - Department of Agriculture (crop statistics)
   - Office of Agricultural Economics (market prices)

**Target**:

- 6 plant catalog records ✓
- 40-50 cultivar records
- 77 regional condition records
- 60-70 disease/pest records
- 100 historical yield records (literature-based estimates)

### Phase 2: Platform Data Collection (Months 4-12)

**User-Generated Data**:

- Every farm using platform contributes yield data
- IoT sensors provide real-time environmental data
- Automated harvest reporting
- Problem reporting (diseases, pests)

**Quality Control**:

- Require photo verification for yields
- Cross-validate with sensor data
- Detect outliers and anomalies
- Expert review of submitted data

**Incentives for Farmers**:

- Free data analysis reports
- Better predictions with more data
- Leaderboards (highest yields)
- Rewards for complete data submission

### Phase 3: Continuous Improvement (Ongoing)

**Model Retraining**:

- Quarterly ML model updates
- Incorporate new harvest data
- Refine prediction algorithms
- Add new features

**Database Expansion**:

- New cultivars as they become available
- Updated disease information
- Climate change adjustments
- Market trend integration

---

## Implementation Roadmap

### Month 1-2: Database Design & Setup

**Week 1-2**:

- ✅ Finalize schema design
- ✅ Set up MongoDB collections
- ✅ Create indexes
- ✅ Design API endpoints

**Week 3-4**:

- Develop data entry interfaces
- Create import scripts
- Set up data validation
- Build admin dashboard

### Month 3-4: Data Population

**Focus**: Populate with research-based data

**Deliverables**:

- All 6 plants in catalog
- 40+ cultivar records
- 77 provincial records
- 50+ disease/pest records
- 100+ literature-based yield records

### Month 5-6: Integration with Platform

**Connect to**:

- Farm management system
- IoT sensor data pipelines
- Recommendation engine
- Reporting dashboards

### Month 7-12: ML Model Development

**Build**:

- Yield prediction model
- Disease risk model
- Cultivar recommender
- Optimal timing model

**Requires**: Sufficient historical data (target: 500+ yield records)

---

## API Endpoints Design

### Cultivar Search

```javascript
GET /api/v1/cultivars/search

Query params:
- plantId (required)
- region (optional)
- soilType (optional)
- climateZone (optional)
- yieldMin (optional)

Response:
{
  "success": true,
  "results": [
    {
      "cultivarId": "CAN_THST_001",
      "varietyName": {...},
      "suitabilityScore": 92,
      "estimatedYield": {min: 120, max: 180, unit: "kg/rai"},
      "recommendationReason": "High suitability for northern region..."
    }
  ],
  "count": 5
}
```

### Regional Suitability

```javascript
GET /api/v1/regions/:provinceId/suitability

Response:
{
  "province": "Chiang Mai",
  "plantsSuitability": [
    {
      "plantId": "CANNABIS_001",
      "score": 95,
      "rank": 1,
      "recommendedCultivars": [...],
      "bestSeasons": ["rainy", "winter"],
      "challenges": [...]
    }
  ]
}
```

### Disease Risk Forecast

```javascript
POST /api/v1/predictions/disease-risk

Body:
{
  "farmId": "FARM_001",
  "plantId": "CANNABIS_001",
  "growthStage": "flowering",
  "forecastDays": 14
}

Response:
{
  "riskAssessment": [
    {
      "problemId": "DIS_CAN_PM_001",
      "diseaseName": "Powdery Mildew",
      "riskLevel": "high",
      "probability": 68, // percent
      "peakRiskDate": "2024-11-05",
      "preventiveMeasures": [...],
      "estimatedCost": 500 // THB if outbreak occurs
    }
  ]
}
```

### Yield Prediction

```javascript
POST /api/v1/predictions/yield

Body:
{
  "plantId": "CANNABIS_001",
  "cultivarId": "CAN_THST_001",
  "province": "Chiang Mai",
  "plantingDate": "2024-11-01",
  "areaRai": 2.5,
  "soilType": "sandy_loam",
  "irrigationType": "drip",
  "greenhouseType": "open_field"
}

Response:
{
  "predictedYield": {
    "perRai": 145,
    "total": 362.5,
    "unit": "kg",
    "confidenceInterval": {min: 120, max: 170},
    "confidence": 78 // percent
  },
  "expectedHarvestDate": "2024-03-15",
  "estimatedRevenue": 1087500, // THB
  "riskFactors": [
    {
      "factor": "rainy_season_humidity",
      "impact": "May increase disease pressure",
      "mitigation": "Ensure good air circulation"
    }
  ],
  "comparison": {
    "vsRegionalAverage": "+15%",
    "vsTopYields": "-12%"
  }
}
```

---

## Data Privacy & Security

### Farmer Data Protection

**Principles**:

- Farmers OWN their data
- Opt-in for data sharing
- Anonymization for research
- No sale of individual farm data

**Anonymization Strategy**:

```javascript
// Historical yield records
{
  farmInfo: {
    farmId: "ANON_123456", // Hashed
    anonymized: true,
    province: "Chiang Mai", // Keep for regional insights
    coordinates: {
      lat: 18.79, // Rounded to 2 decimals
      lng: 98.99
    }
  }
}
```

### Compliance

- ✅ Thailand PDPA (Personal Data Protection Act)
- ✅ GACP data requirements
- ✅ Right to be forgotten
- ✅ Data export capability

---

## Success Metrics

### Database Growth Targets

**Year 1**:

- 100+ farms contributing data
- 500+ yield records
- 6 plants fully cataloged
- 50+ cultivars documented
- 77 provinces mapped

**Year 2**:

- 500+ farms
- 2,500+ yield records
- ML models achieving 75%+ accuracy
- 100+ cultivars
- Real-time disease tracking

**Year 3**:

- 2,000+ farms
- 10,000+ yield records
- 85%+ prediction accuracy
- National coverage
- Expanded to 10+ crops

### Quality Metrics

- **Data Completeness**: 90%+ of fields filled
- **Verification Rate**: 80%+ of yields photo-verified
- **ML Accuracy**: 75%+ within first year, 85%+ by year 3
- **User Satisfaction**: 4.5+/5 rating on predictions

---

## Conclusion

This central database design provides the **foundation for intelligent, data-driven predictions** across all 6 Thai medicinal plants. As data accumulates, the platform will become increasingly accurate in forecasting yields, predicting problems, and recommending optimal cultivation strategies.

**Key Innovation**: Transform scattered agricultural knowledge into a **structured, queryable, machine-learning-ready database** that helps Thai farmers grow medicinal plants successfully and profitably.

---

**Next Steps**:

1. ✅ Review and approve schema design
2. ✅ Set up MongoDB collections
3. ✅ Begin literature review for data population
4. ✅ Develop data entry tools
5. ✅ Start pilot data collection with 10 farms

**Document Owner**: Data Science & Agriculture Team
**Review Schedule**: Monthly
