# Smart Agriculture API Endpoints

## Base URL

```
http://localhost:3000/api/smart-agriculture
```

---

## 1. Weather APIs

### Get Current Weather

```http
GET /weather/:lat/:lon
```

**Parameters:**

- `lat` (path) - Latitude (e.g., 18.7883)
- `lon` (path) - Longitude (e.g., 98.9853)

**Response:**

```json
{
  "success": true,
  "data": {
    "temp": 28.5,
    "humidity": 65,
    "rainfall": 0,
    "description": "ท้องฟ้าแจ่มใส"
  }
}
```

### Get 7-Day Forecast

```http
GET /weather/:lat/:lon/forecast
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "temp": 28.5,
      "humidity": 65,
      "rainfall": 0,
      "description": "ท้องฟ้าแจ่มใส"
    }
  ]
}
```

---

## 2. Soil Guide API

### Get Soil Recommendation

```http
POST /soil/recommend
```

**Body:**

```json
{
  "soilType": "clay",
  "pH": 6.5,
  "crop": "cannabis"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "soilType": "clay",
    "characteristics": "ดินเหนียว มีการระบายน้ำช้า...",
    "suitableCrops": ["ข้าว", "กัญชา"],
    "improvements": ["เพิ่มทราย", "ใส่ปุ๋ยอินทรีย์"],
    "fertilizer": {
      "N": 15,
      "P": 10,
      "K": 10
    },
    "pHAdvice": "pH เหมาะสม ไม่ต้องปรับ"
  }
}
```

---

## 3. Province APIs

### Get All Provinces

```http
GET /provinces
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "เชียงใหม่",
      "region": "north",
      "avgTemp": 25,
      "avgRainfall": 1200,
      "cannabisSuitability": 9,
      "tips": "เหมาะสำหรับปลูกกัญชาคุณภาพสูง"
    }
  ]
}
```

### Get Province by Name

```http
GET /provinces/:name
```

**Parameters:**

- `name` (path) - Province name (e.g., "เชียงใหม่")

---

## 4. Irrigation Calculator API

### Calculate Water Needs

```http
POST /irrigation/calculate
```

**Body:**

```json
{
  "crop": "cannabis",
  "growthStage": "vegetative",
  "temperature": 28,
  "humidity": 65,
  "rainfall": 0,
  "soilType": "loam"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "waterPerDay": 4.5,
    "frequency": "ทุกวัน",
    "tips": ["รดน้ำตอนเช้าหรือเย็น", "ตรวจสอบความชื้นดินก่อนรดน้ำ"]
  }
}
```

---

## 5. Crop Calendar API

### Get Planting Calendar

```http
GET /calendar/:crop/:province
```

**Parameters:**

- `crop` (path) - Crop name (e.g., "cannabis")
- `province` (path) - Province name (e.g., "เชียงใหม่")

**Response:**

```json
{
  "success": true,
  "data": {
    "crop": "cannabis",
    "province": "เชียงใหม่",
    "bestPlantingMonths": ["ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
    "duration": 90,
    "stages": [
      {
        "name": "งอก",
        "days": 7,
        "tips": "รักษาความชื้น 70-80%"
      }
    ],
    "regionalTips": "ภาคเหนือ: อากาศเย็น เหมาะสำหรับกัญชาคุณภาพสูง"
  }
}
```

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Testing with cURL

### Weather

```bash
curl http://localhost:3000/api/smart-agriculture/weather/18.7883/98.9853
```

### Soil

```bash
curl -X POST http://localhost:3000/api/smart-agriculture/soil/recommend \
  -H "Content-Type: application/json" \
  -d '{"soilType":"clay","pH":6.5,"crop":"cannabis"}'
```

### Provinces

```bash
curl http://localhost:3000/api/smart-agriculture/provinces
```

### Irrigation

```bash
curl -X POST http://localhost:3000/api/smart-agriculture/irrigation/calculate \
  -H "Content-Type: application/json" \
  -d '{"crop":"cannabis","growthStage":"vegetative","temperature":28,"humidity":65,"rainfall":0,"soilType":"loam"}'
```

### Calendar

```bash
curl http://localhost:3000/api/smart-agriculture/calendar/cannabis/เชียงใหม่
```
