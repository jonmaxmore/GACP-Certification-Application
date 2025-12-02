# Fertilizer Recommendation API Documentation

**Version**: 1.0.0
**Base URL**: `http://localhost:3005/api`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [AI Recommendations](#ai-recommendations)
  - [Product Management](#product-management)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## 🎯 Overview

The Fertilizer Recommendation API provides AI-powered fertilizer recommendations based on:

- **GACP Standards** (DTAM Thailand)
- **Growth stage** (seedling, vegetative, flowering)
- **Soil conditions** (pH, NPK levels, soil type)
- **Environmental factors** (temperature, humidity, moisture)
- **Regional data** (77 Thai provinces)
- **Historical yield data** (machine learning)

All recommended products are **GACP-approved** and registered with Thai authorities (เลข ปอ.1).

---

## 🔐 Authentication

Most endpoints are currently **public** for development purposes. Production will require JWT authentication.

**Future Authentication Header:**

```http
Authorization: Bearer <jwt_token>
```

---

## 🚀 Endpoints

### AI Recommendations

#### Generate Fertilizer Recommendation

Generate AI-powered fertilizer recommendation for a specific farm and cultivation cycle.

**Endpoint:** `POST /api/ai/fertilizer/recommend`

**Request Body:**

```json
{
  "farmId": "507f1f77bcf86cd799439011",
  "cultivationCycleId": "507f1f77bcf86cd799439012",
  "growthStage": "vegetative",
  "options": {
    "organicOnly": false,
    "maxPrice": 5000
  }
}
```

**Parameters:**

| Field                 | Type     | Required | Description                                                       |
| --------------------- | -------- | -------- | ----------------------------------------------------------------- |
| `farmId`              | ObjectId | ✅ Yes   | MongoDB ObjectId of the farm                                      |
| `cultivationCycleId`  | ObjectId | ✅ Yes   | MongoDB ObjectId of the cultivation cycle                         |
| `growthStage`         | String   | ❌ No    | Override growth stage detection (seedling, vegetative, flowering) |
| `options.organicOnly` | Boolean  | ❌ No    | Only recommend organic fertilizers (default: false)               |
| `options.maxPrice`    | Number   | ❌ No    | Maximum price per application (THB)                               |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "npk": {
      "N": 20,
      "P": 10,
      "K": 20,
      "ratio": "20-10-20",
      "confidence": 90,
      "source": "plant_catalog",
      "reason": ["ปรับตามข้อมูลการปลูกที่ประสบความสำเร็จในภูมิภาคนี้ (5 รายการ)"]
    },
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "productName": "Cannabis Grow Fertilizer",
        "productNameThai": "ปุ๋ยเจริญเติบโตกัญชา",
        "npkRatio": "20-10-20",
        "manufacturer": {
          "name": "Thai Agri Solutions",
          "nameThai": "ไทยอะกริโซลูชั่น"
        },
        "registration": {
          "registrationNumber": "ปอ.1-12345/2567",
          "status": "active"
        },
        "compliance": {
          "gacpApproved": true,
          "organicCertified": false
        },
        "performance": {
          "userSatisfaction": {
            "rating": 4.5,
            "numberOfReviews": 127
          }
        }
      }
    ],
    "schedule": {
      "schedule": [
        {
          "applicationNumber": 1,
          "date": "2025-10-28T00:00:00.000Z",
          "product": {
            "id": "507f1f77bcf86cd799439013",
            "name": "Cannabis Grow Fertilizer",
            "nameThai": "ปุ๋ยเจริญเติบโตกัญชา"
          },
          "amount": "50-100 g/plant/week",
          "amountPerRai": "10-20 kg/rai",
          "method": "fertigation",
          "dilution": "1:100",
          "npk": {
            "N": 20,
            "P": 10,
            "K": 20,
            "ratio": "20-10-20"
          },
          "gacpCompliant": true
        }
      ],
      "totalApplications": 8,
      "frequency": "weekly",
      "frequencyDays": 7,
      "preharvest_interval": 14
    },
    "costs": {
      "options": [
        {
          "product": {
            "id": "507f1f77bcf86cd799439013",
            "name": "Cannabis Grow Fertilizer",
            "npkRatio": "20-10-20"
          },
          "costBreakdown": {
            "totalNeeded": 120,
            "unit": "kg",
            "cost": 3600,
            "currency": "THB",
            "pricePerUnit": 30
          },
          "totalApplications": 8,
          "estimatedTotalCost": 28800,
          "perRaiPerCycle": 28800
        }
      ],
      "cheapest": {
        /* same structure */
      },
      "recommended": {
        /* same structure */
      }
    },
    "predictions": {
      "expectedYieldIncrease": {
        "min": 10,
        "max": 25,
        "average": 15,
        "unit": "%",
        "confidence": "medium"
      },
      "expectedQuality": {
        "rating": "good",
        "confidence": "medium"
      },
      "environmentalImpact": {
        "rating": "low",
        "description": "ใช้ปุ๋ยที่ผ่านมาตรฐาน GACP ลดผลกระทบต่อสิ่งแว่งล้อม"
      },
      "gacpCompliance": {
        "status": "compliant",
        "confidence": 100
      }
    },
    "metadata": {
      "confidence": 90,
      "method": "rule_based_expert_system",
      "generatedAt": "2025-10-28T09:30:00.000Z",
      "gacpCompliant": true,
      "context": {
        "farm": "ฟาร์มทดสอบ",
        "plant": "กัญชา",
        "cultivar": "Northern Lights",
        "growthStage": "vegetative",
        "region": "central"
      }
    },
    "auditLog": {
      "timestamp": "2025-10-28T09:30:00.000Z",
      "farmId": "507f1f77bcf86cd799439011",
      "cultivationCycleId": "507f1f77bcf86cd799439012",
      "plantType": "cannabis",
      "growthStage": "vegetative",
      "gacpCompliant": true
    }
  },
  "message": "Fertilizer recommendation generated successfully"
}
```

**Error Responses:**

```json
// 400 Bad Request
{
  "success": false,
  "error": "farmId is required"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

### Product Management

#### List All Products

Get paginated list of GACP-approved fertilizer products with filters.

**Endpoint:** `GET /api/fertilizer-products`

**Query Parameters:**

| Parameter     | Type    | Description                                                     |
| ------------- | ------- | --------------------------------------------------------------- |
| `plantType`   | String  | Filter by plant (cannabis, turmeric, ginger, etc.)              |
| `growthStage` | String  | Filter by growth stage (seedling, vegetative, flowering)        |
| `region`      | String  | Filter by region (north, northeast, central, east, west, south) |
| `organic`     | Boolean | Filter by organic certification (true/false)                    |
| `page`        | Number  | Page number (default: 1)                                        |
| `limit`       | Number  | Results per page (default: 20, max: 100)                        |

**Example Request:**

```http
GET /api/fertilizer-products?plantType=cannabis&growthStage=vegetative&page=1&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "productId": "FERT-TH-001",
        "productName": "Cannabis Grow Fertilizer",
        "productNameThai": "ปุ๋ยเจริญเติบโตกัญชา",
        "brand": "Thai Agri Solutions",
        "npkRatio": "20-10-20",
        "type": {
          "primary": "chemical",
          "secondary": "granular"
        },
        "registration": {
          "registrationNumber": "ปอ.1-12345/2567",
          "status": "active"
        },
        "compliance": {
          "gacpApproved": true,
          "organicCertified": false
        },
        "nutrients": {
          "nitrogen": { "percentage": 20 },
          "phosphorus": { "percentage": 10 },
          "potassium": { "percentage": 20 }
        },
        "recommendedFor": {
          "plants": ["cannabis", "all"],
          "growthStages": ["vegetative", "all"]
        },
        "pricing": [
          {
            "region": "nationwide",
            "size": { "amount": 25, "unit": "kg" },
            "price": { "amount": 750, "currency": "THB" },
            "pricePerUnit": 30
          }
        ],
        "performance": {
          "userSatisfaction": {
            "rating": 4.5,
            "numberOfReviews": 127
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

#### Get Product by ID

Get detailed information about a specific fertilizer product.

**Endpoint:** `GET /api/fertilizer-products/:id`

**Parameters:**

| Parameter | Type     | Description              |
| --------- | -------- | ------------------------ |
| `id`      | ObjectId | Product MongoDB ObjectId |

**Example Request:**

```http
GET /api/fertilizer-products/507f1f77bcf86cd799439013
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    /* Complete FertilizerProduct object */
  }
}
```

---

#### Search Products

Search fertilizer products by name, brand, or NPK ratio.

**Endpoint:** `GET /api/fertilizer-products/search`

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| `q`       | String | ✅ Yes   | Search query (min 2 characters) |

**Example Request:**

```http
GET /api/fertilizer-products/search?q=cannabis
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      /* Array of matching products */
    ],
    "count": 12
  }
}
```

---

#### Get Products for Growth Stage

Get products recommended for a specific plant type and growth stage.

**Endpoint:** `GET /api/fertilizer-products/growth-stage/:plantType/:stage`

**Parameters:**

| Parameter   | Type   | Description                                    |
| ----------- | ------ | ---------------------------------------------- |
| `plantType` | String | Plant type (cannabis, turmeric, ginger, etc.)  |
| `stage`     | String | Growth stage (seedling, vegetative, flowering) |

**Query Parameters:**

| Parameter | Type   | Description                 |
| --------- | ------ | --------------------------- |
| `region`  | String | Filter by region (optional) |

**Example Request:**

```http
GET /api/fertilizer-products/growth-stage/cannabis/vegetative?region=central
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      /* Array of products */
    ],
    "count": 8,
    "plantType": "cannabis",
    "growthStage": "vegetative",
    "region": "central"
  }
}
```

---

#### Get Top-Rated Products

Get top-rated fertilizer products based on user reviews.

**Endpoint:** `GET /api/fertilizer-products/top-rated`

**Query Parameters:**

| Parameter | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| `limit`   | Number | Number of products (default: 10, max: 50) |

**Example Request:**

```http
GET /api/fertilizer-products/top-rated?limit=5
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      /* Array of top-rated products */
    ],
    "count": 5
  }
}
```

---

#### Create Product (Admin Only)

Create a new fertilizer product.

**Endpoint:** `POST /api/fertilizer-products`

**Auth:** Required (Admin role)

**Request Body:**

```json
{
  "productId": "FERT-TH-002",
  "productName": "Organic Cannabis Bloom",
  "productNameThai": "ปุ๋ยอินทรีย์ออกดอกกัญชา",
  "brand": "Bio Grow Thailand",
  "manufacturer": {
    "name": "Bio Grow Thailand Ltd.",
    "nameThai": "ไบโอโกรว์ ไทยแลนด์ จำกัด",
    "country": "Thailand"
  },
  "type": {
    "primary": "organic",
    "secondary": "liquid"
  },
  "registration": {
    "registrationNumber": "ปอ.1-54321/2567",
    "issuedDate": "2024-01-15",
    "status": "active"
  },
  "compliance": {
    "gacpApproved": true,
    "organicCertified": true,
    "certifications": [
      {
        "name": "Organic Thailand",
        "issuingBody": "กรมวิชาการเกษตร",
        "certificateNumber": "ORG-TH-2024-001"
      }
    ]
  },
  "npkRatio": "5-15-10",
  "nutrients": {
    "nitrogen": { "percentage": 5 },
    "phosphorus": { "percentage": 15 },
    "potassium": { "percentage": 10 }
  },
  "recommendedFor": {
    "plants": ["cannabis"],
    "growthStages": ["flowering"],
    "cultivationMethods": ["soil", "organic"]
  },
  "pricing": [
    {
      "region": "nationwide",
      "size": { "amount": 1, "unit": "liter" },
      "price": { "amount": 450, "currency": "THB" }
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    /* Created product */
  },
  "message": "Fertilizer product created successfully"
}
```

---

#### Update Product (Admin Only)

Update an existing fertilizer product.

**Endpoint:** `PUT /api/fertilizer-products/:id`

**Auth:** Required (Admin role)

**Request Body:** Partial FertilizerProduct object

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    /* Updated product */
  },
  "message": "Product updated successfully"
}
```

---

#### Delete Product (Admin Only)

Soft delete a fertilizer product (sets status to 'discontinued').

**Endpoint:** `DELETE /api/fertilizer-products/:id`

**Auth:** Required (Admin role)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product discontinued successfully"
}
```

---

#### Add Product Review

Add a user review to a fertilizer product.

**Endpoint:** `POST /api/fertilizer-products/:id/reviews`

**Auth:** Required (User authentication)

**Request Body:**

```json
{
  "rating": 4,
  "review": "ใช้ดีมาก กัญชาโตเร็วและแข็งแรง",
  "plantUsedOn": "cannabis",
  "resultsObserved": "ต้นแข็งแรง ใบเขียวสด ดอกออกดก",
  "wouldRecommend": true
}
```

**Parameters:**

| Field             | Type    | Required | Description               |
| ----------------- | ------- | -------- | ------------------------- |
| `rating`          | Number  | ✅ Yes   | Rating 1-5 stars          |
| `review`          | String  | ❌ No    | Review text               |
| `plantUsedOn`     | String  | ❌ No    | Plant type used on        |
| `resultsObserved` | String  | ❌ No    | Observed results          |
| `wouldRecommend`  | Boolean | ❌ No    | Would recommend to others |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "newRating": 4.3,
    "numberOfReviews": 128
  }
}
```

---

## 📊 Data Models

### NPK Recommendation Object

```typescript
{
  N: number;        // Nitrogen percentage
  P: number;        // Phosphorus percentage
  K: number;        // Potassium percentage
  ratio: string;    // e.g., "20-10-20"
  confidence: number; // 0-100
  source: string;   // "plant_catalog" | "research_default"
  reason?: string[];  // Array of adjustment reasons (Thai)
}
```

### Product Object

See [FertilizerProduct.js](../apps/backend/models/FertilizerProduct.js) for complete schema.

---

## ⚠️ Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created                              |
| 400  | Bad Request (validation error)       |
| 401  | Unauthorized                         |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found                            |
| 500  | Internal Server Error                |

---

## 💡 Examples

### Example 1: Get Recommendation for Vegetative Cannabis

```bash
curl -X POST http://localhost:3005/api/ai/fertilizer/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "farmId": "507f1f77bcf86cd799439011",
    "cultivationCycleId": "507f1f77bcf86cd799439012",
    "growthStage": "vegetative"
  }'
```

### Example 2: Find Organic Fertilizers for Cannabis

```bash
curl "http://localhost:3005/api/fertilizer-products?plantType=cannabis&organic=true"
```

### Example 3: Search for NPK 20-10-20

```bash
curl "http://localhost:3005/api/fertilizer-products/search?q=20-10-20"
```

### Example 4: Get Products for Flowering Stage

```bash
curl "http://localhost:3005/api/fertilizer-products/growth-stage/cannabis/flowering?region=central"
```

---

## 📝 Notes

1. **GACP Compliance**: All recommendations follow DTAM GACP standards
2. **Cannabis Priority**: Cannabis is always the primary focus
3. **Thai Language**: Supports Thai language in product names and recommendations
4. **Regional Data**: Recommendations adjusted for 77 Thai provinces
5. **ML-Ready**: Architecture supports future machine learning integration

---

## 🔗 Related Documentation

- [Fertilizer Recommendation Research](./FERTILIZER_RECOMMENDATION_RESEARCH.md)
- [Phase 3 Implementation Guide](./PHASE3_SMART_RECOMMENDATIONS_AI_GUIDE.md)
- [GACP Standards](./COMPETITIVE_ANALYSIS.md)

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0
**Status**: Development (Testing)
