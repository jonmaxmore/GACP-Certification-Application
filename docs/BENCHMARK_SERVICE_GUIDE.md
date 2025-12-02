# Benchmark Service Implementation Guide

## Overview

Benchmark Service รับผิดชอบการรวบรวมและวิเคราะห์ข้อมูลจาก Survey responses เพื่อสร้าง insights และ comparisons ระหว่างภูมิภาค

## Core Functions

### 1. Data Aggregation

- รับ events จาก Survey Service เมื่อมี response ใหม่
- คำนวณคะแนนเฉลี่ยต่อหมวดหมู่
- สร้าง regional comparisons
- Cache ผลลัพธ์สำหรับการ query ที่เร็ว

### 2. Scoring Rules

```javascript
// Example scoring rule
{
  "ruleId": "market_score_v1",
  "category": "market",
  "weights": {
    "price_stability": 0.4,
    "market_access": 0.3,
    "bargaining_power": 0.3
  },
  "thresholds": {
    "excellent": 4.5,
    "good": 3.5,
    "fair": 2.5,
    "poor": 1.5
  }
}
```

### 3. API Endpoints

#### Public Analytics

```
GET /api/benchmark/summary?region={region}
GET /api/benchmark/comparison?base={region1}&compare={region2}
GET /api/benchmark/heatmap?level={province|amphoe}
GET /api/benchmark/trends?region={region}&period={months}
```

#### Admin Endpoints

```
POST /api/benchmark/rules
PUT  /api/benchmark/rules/:id
POST /api/benchmark/recalculate
GET  /api/benchmark/jobs
```

## File Structure

```
api-benchmark/
├── src/
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── rulesController.js
│   │   └── comparisonController.js
│   ├── services/
│   │   ├── aggregationService.js
│   │   ├── scoringService.js
│   │   └── cacheService.js
│   ├── workers/
│   │   └── aggregationWorker.js
│   └── models/
│       ├── BenchmarkRule.js
│       ├── AggregatedScore.js
│       └── Comparison.js
```
