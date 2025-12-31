# 📚 GACP Platform API Documentation

## Base URL
- **Production**: `http://47.129.167.71/api`
- **Local Dev**: `http://localhost:3002/api`

---

## 🏥 Health Check

### GET /api/v2/health
Check API status and database connectivity.

**Response:**
```json
{
  "success": true,
  "version": "2.0.0",
  "database": "postgresql",
  "message": "V2 API is running"
}
```

---

## 🔐 Authentication

### POST /api/auth-farmer/login
Authenticate farmer account.

**Request Body:**
```json
{
  "identifier": "1-2345-67890-12-3",
  "password": "password123",
  "accountType": "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "name": "ชื่อผู้ใช้",
      "accountType": "INDIVIDUAL"
    }
  }
}
```

### POST /api/auth-farmer/register
Register new farmer account.

**Request Body:**
```json
{
  "identifier": "1-2345-67890-12-3",
  "laserCode": "JT1234567890",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "ชื่อ",
  "lastName": "นามสกุล",
  "phone": "0812345678",
  "email": "email@example.com",
  "accountType": "INDIVIDUAL"
}
```

---

## 🌱 Plants API

### GET /api/v2/plants
Get list of GACP plant species.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "กัญชา", "thaiName": "Cannabis" },
    { "id": 2, "name": "กระท่อม", "thaiName": "Kratom" },
    { "id": 3, "name": "ขมิ้นชัน", "thaiName": "Turmeric" }
  ]
}
```

---

## ⚙️ Configuration

### GET /api/v2/config/document-slots
Get required document slots.

### GET /api/v2/config/fee-structure
Get fee structure for applications.

---

## 🔒 Error Responses

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
