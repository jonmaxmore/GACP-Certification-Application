# Notification Module

ระบบแจ้งเตือนแบบหลายช่องทาง (Multi-channel) รองรับ In-app, Email, LINE Notify และ SMS

## 📋 คุณสมบัติหลัก

### 1. Multi-Channel Delivery (ส่งหลายช่องทาง)

- **In-app Notifications**: เก็บในฐานข้อมูล MongoDB แสดงผลในระบบ
- **Email**: ส่งอีเมลผ่าน SMTP (nodemailer) พร้อม HTML template
- **LINE Notify**: แจ้งเตือนผ่าน LINE
- **SMS**: รองรับการส่ง SMS (ต้องติดตั้ง provider เพิ่มเติม)
- **Webhooks**: รับ callback จาก external services

### 2. Event-Based Templates (เทมเพลตตามเหตุการณ์)

ระบบมีเทมเพลตสำเร็จรูป 15 แบบ:

**Application Events:**

- `application.submitted` - คำขอได้รับการส่งแล้ว
- `application.under_review` - อยู่ระหว่างตรวจสอบ
- `application.approved` - คำขอได้รับอนุมัติ ✨
- `application.rejected` - คำขอไม่ได้รับอนุมัติ

**Certificate Events:**

- `certificate.issued` - ออกใบรับรองแล้ว ✨
- `certificate.expiring` - ใบรับรองใกล้หมดอายุ ⚠️
- `certificate.renewed` - ต่ออายุแล้ว
- `certificate.revoked` - ถูกเพิกถอน 🚨

**Survey Events:**

- `survey.assigned` - ได้รับมอบหมายแบบสำรวจ
- `survey.reminder` - แจ้งเตือนทำแบบสำรวจ

**Payment Events:**

- `payment.required` - รอชำระเงิน
- `payment.confirmed` - ยืนยันการชำระเงิน

**Document Events:**

- `document.uploaded` - อัปโหลดเอกสารแล้ว
- `document.verified` - ตรวจสอบเอกสารแล้ว

**General:**

- `announcement.general` - ประกาศทั่วไป

### 3. Priority Levels (ระดับความสำคัญ)

- **Urgent** (เร่งด่วน): 🚨 ใบรับรองถูกเพิกถอน, ปัญหาสำคัญ
- **High** (สูง): ⚠️ ใบรับรองใกล้หมดอายุ, อนุมัติ/ปฏิเสธคำขอ
- **Medium** (ปานกลาง): การส่งคำขอ, อัปเดตสถานะ
- **Low** (ต่ำ): การอัปโหลดเอกสาร, ข้อมูลทั่วไป

### 4. User Preferences (การตั้งค่าผู้ใช้)

ผู้ใช้สามารถกำหนดช่องทางการแจ้งเตือนได้:

```javascript
{
  inapp: true,      // แจ้งเตือนในระบบ (เปิดอยู่เสมอ)
  email: true,      // ส่งอีเมล
  line: false,      // แจ้งผ่าน LINE
  sms: false,       // ส่ง SMS
  lineToken: null   // LINE Notify token
}
```

### 5. Auto-Expiry (ลบอัตโนมัติ)

การแจ้งเตือนจะถูกลบอัตโนมัติตามระดับความสำคัญ:

- Urgent: 7 วัน
- High: 30 วัน
- Medium: 90 วัน
- Low: 180 วัน

## 🗂️ โครงสร้างโมดูล

```
notification/
├── controllers/
│   └── notification.controller.js  # HTTP handlers (13 methods)
├── services/
│   └── notification.service.js     # Business logic, multi-channel delivery
├── routes/
│   └── notification.routes.js      # API endpoints (13 routes)
├── models/
│   └── Notification.js             # Mongoose schema
├── templates/
│   └── (Email templates - future)
├── tests/
│   └── (Unit tests - future)
├── index.js                        # Module entry point
└── README.md                       # Documentation
```

## 🔌 API Endpoints

### User Endpoints (ผู้ใช้ทั่วไป)

#### 1. Get User Notifications

```http
GET /api/notifications/user/:userId?page=1&limit=20&isRead=false&priority=high
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): หน้า (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 20)
- `isRead` (optional): true/false - กรองตามสถานะอ่าน
- `priority` (optional): urgent/high/medium/low

**Response:**

```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "U-2025-001",
        "eventType": "certificate.expiring",
        "title": "ใบรับรองใกล้หมดอายุ",
        "message": "ใบรับรองของคุณจะหมดอายุในอีก 30 วัน กรุณาดำเนินการต่ออายุ",
        "priority": "high",
        "isRead": false,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### 2. Get Unread Count

```http
GET /api/notifications/user/:userId/unread-count
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "unread": 12
  }
}
```

#### 3. Mark as Read

```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 4. Mark All as Read

```http
PATCH /api/notifications/user/:userId/read-all
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "12 notifications marked as read",
  "data": { "count": 12 }
}
```

#### 5. Delete Notification

```http
DELETE /api/notifications/:notificationId
Authorization: Bearer <token>
```

#### 6. Get Statistics

```http
GET /api/notifications/user/:userId/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 120,
    "unread": 12,
    "byPriority": [
      { "_id": "urgent", "count": 3 },
      { "_id": "high", "count": 15 },
      { "_id": "medium", "count": 80 },
      { "_id": "low", "count": 22 }
    ],
    "byEventType": [
      { "_id": "application.submitted", "count": 45 },
      { "_id": "certificate.expiring", "count": 8 }
    ],
    "recent": [
      /* 5 latest notifications */
    ]
  }
}
```

#### 7. Update Preferences

```http
PUT /api/notifications/user/:userId/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "inapp": true,
  "email": true,
  "line": false,
  "sms": false,
  "lineToken": "YOUR_LINE_NOTIFY_TOKEN"
}
```

#### 8. Get Preferences

```http
GET /api/notifications/user/:userId/preferences
Authorization: Bearer <token>
```

### Admin Endpoints (ผู้ดูแลระบบ)

#### 9. Send Custom Notification

```http
POST /api/notifications/send
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "recipients": ["U-2025-001", "U-2025-002"],
  "title": "ประกาศสำคัญ",
  "message": "ระบบจะปิดปรับปรุงวันที่ 20 มกราคม 2025",
  "options": {
    "priority": "high",
    "channels": ["inapp", "email"],
    "metadata": {
      "category": "maintenance"
    }
  }
}
```

#### 10. Broadcast Announcement

```http
POST /api/notifications/broadcast
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "ข่าวประชาสัมพันธ์",
  "message": "ระบบมีการอัปเดตฟีเจอร์ใหม่",
  "targetRoles": ["farmer", "reviewer"],
  "priority": "medium"
}
```

#### 11. Send Test Notification

```http
POST /api/notifications/test
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "eventType": "certificate.expiring",
  "data": {
    "userId": "U-2025-001",
    "email": "farmer@example.com",
    "days": 30,
    "metadata": {
      "certificateNumber": "GACP-2025-0001"
    }
  }
}
```

#### 12. Get Templates

```http
GET /api/notifications/templates
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application.submitted": {
      "title": "คำขอได้รับการส่งแล้ว",
      "recipients": ["applicant"],
      "priority": "medium",
      "channels": ["inapp", "email"]
    },
    "certificate.expiring": {
      "title": "ใบรับรองใกล้หมดอายุ",
      "recipients": ["applicant"],
      "priority": "high",
      "channels": ["inapp", "email", "line", "sms"]
    }
  }
}
```

### Public Endpoints

#### 13. Webhook

```http
POST /api/notifications/webhook/:service
Content-Type: application/json
```

รับ callback จาก external services (email, SMS, LINE)

## 💻 การใช้งานในโค้ด

### 1. Module Initialization

```javascript
const { initializeNotification } = require('./modules/notification');

// Initialize module
const notificationModule = await initializeNotification(
  db, // MongoDB instance
  authMiddleware, // Authentication middleware
  adminMiddleware, // Admin middleware (optional)
);

// Use in Express app
app.use('/api/notifications', notificationModule.router);
```

### 2. Sending Notifications

#### Event-Based Notification

```javascript
// Get service instance
const { service } = notificationModule;

// Send notification based on event
await service.notify('application.approved', {
  userId: 'U-2025-001',
  email: 'farmer@example.com',
  lineToken: 'LINE_TOKEN',
  metadata: {
    applicationId: 'APP-2025-001',
    farmName: 'ฟาร์มสมหมาย',
  },
});
```

#### Custom Notification

```javascript
await service.sendCustomNotification(
  ['U-2025-001', 'U-2025-002'], // Recipients
  'ประกาศสำคัญ', // Title
  'ข้อความประกาศ', // Message
  {
    priority: 'high',
    channels: ['inapp', 'email'],
    metadata: { category: 'urgent' },
  },
);
```

#### Broadcast

```javascript
await service.broadcastAnnouncement(
  'ข่าวสารทั่วไป', // Title
  'ระบบอัปเดตฟีเจอร์ใหม่', // Message
  ['farmer', 'reviewer'], // Target roles
  'medium', // Priority
);
```

### 3. Integration Examples

#### Application Workflow Integration

```javascript
// After application submission
const application = await applicationService.submit(data);

// Send notification
await notificationService.notify('application.submitted', {
  userId: application.userId,
  email: application.email,
  metadata: {
    applicationId: application._id,
    farmName: application.farmName,
  },
});
```

#### Certificate Expiry Check (Scheduled Job)

```javascript
// Run daily to check expiring certificates
const expiringCerts = await certificateService.getExpiringCertificates(90);

for (const cert of expiringCerts) {
  const daysLeft = Math.ceil((cert.expiryDate - new Date()) / (1000 * 60 * 60 * 24));

  await notificationService.notify('certificate.expiring', {
    userId: cert.userId,
    email: cert.userEmail,
    lineToken: cert.userLineToken,
    days: daysLeft,
    metadata: {
      certificateNumber: cert.certificateNumber,
      certificateId: cert._id,
    },
  });
}
```

## 🔐 Channel Configuration

### Email (SMTP)

Set environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@gacp-certify.go.th
```

### LINE Notify

1. Get LINE Notify token: https://notify-bot.line.me/
2. Save token in user preferences:

```javascript
await notificationService.updateNotificationPreferences('U-2025-001', {
  line: true,
  lineToken: 'YOUR_LINE_NOTIFY_TOKEN',
});
```

### SMS

Requires SMS provider integration (Twilio, AWS SNS, etc.):

```javascript
// In notification.service.js - sendSMSNotification()
// Add your SMS provider code
```

## 📊 Database Schema

### Notification Model

```javascript
{
  // User
  userId: String (required, indexed),

  // Event
  eventType: Enum (required, indexed),

  // Content
  title: String (required, max 200),
  message: String (required, max 1000),

  // Priority
  priority: Enum ['low', 'medium', 'high', 'urgent'] (default: 'medium'),

  // Status
  isRead: Boolean (default: false, indexed),
  readAt: Date,

  // Channels
  channels: [String],
  deliveryStatus: {
    inapp: Boolean,
    email: Boolean,
    line: Boolean,
    sms: Boolean
  },

  // Related
  relatedId: ObjectId,
  relatedType: Enum,

  // Action
  actionUrl: String,
  actionLabel: String,

  // Additional
  metadata: Mixed,
  icon: String,
  imageUrl: String,

  // Expiry
  expiresAt: Date (indexed, TTL),

  timestamps: true
}
```

### Indexes

```javascript
// Single field
{ userId: 1, isRead: 1 }
{ userId: 1, createdAt: -1 }
{ eventType: 1 }
{ priority: 1 }
{ expiresAt: 1 } // TTL index

// Compound
{ userId: 1, eventType: 1 }
{ userId: 1, priority: 1 }
{ relatedId: 1, relatedType: 1 }
```

## 🎨 Frontend Integration

### React Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Get unread count
    const fetchCount = async () => {
      const res = await axios.get(`/api/notifications/user/${userId}/unread-count`);
      setUnreadCount(res.data.data.unread);
    };

    // Poll every 30 seconds
    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    const res = await axios.get(`/api/notifications/user/${userId}?limit=10`);
    setNotifications(res.data.data.notifications);
  };

  const markAsRead = async notificationId => {
    await axios.patch(`/api/notifications/${notificationId}/read`);
    setUnreadCount(prev => prev - 1);
  };

  return (
    <div className="notification-bell">
      <button onClick={fetchNotifications}>
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      <div className="dropdown">
        {notifications.map(notif => (
          <div key={notif._id} className={notif.isRead ? 'read' : 'unread'}>
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <button onClick={() => markAsRead(notif._id)}>Mark as Read</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Real-time Updates (WebSocket - Future)

```javascript
// Using Socket.IO
socket.on('notification', notification => {
  setUnreadCount(prev => prev + 1);
  showToast(notification.title, notification.message);
});
```

## ⚡ Performance & Scalability

### Caching Strategies

- Cache unread count (5 minutes)
- Cache user preferences (10 minutes)
- Cache templates (persistent)

### Batch Processing

```javascript
// Send to multiple users efficiently
const users = ['U-001', 'U-002', 'U-003'];
const notifications = users.map(userId => ({
  userId,
  title: 'Announcement',
  message: 'System update',
  priority: 'medium',
}));

await notificationService.notifications.insertMany(notifications);
```

### Queue System (Future)

- Use Bull/BullMQ for async processing
- Retry failed deliveries
- Rate limiting for external APIs

## 🧪 Testing

### Unit Tests (Future)

```javascript
describe('NotificationService', () => {
  test('should send in-app notification', async () => {
    const result = await service.notify('application.submitted', {
      userId: 'U-001',
      metadata: {},
    });

    expect(result.success).toBe(true);
    expect(result.channels.inapp).toBe(true);
  });

  test('should respect user preferences', async () => {
    await service.updateNotificationPreferences('U-001', {
      email: false,
    });

    const result = await service.notify('certificate.issued', {
      userId: 'U-001',
      email: 'test@example.com',
    });

    expect(result.channels.email).toBe(false);
  });
});
```

## 📈 Monitoring

### Key Metrics

- Notifications sent per day
- Delivery success rate by channel
- Average time to read
- Unread notification backlog

### Alerts

- Email delivery failures
- LINE Notify API errors
- High unread count per user
- Template rendering errors

## 🚀 Future Enhancements

1. **Real-time Push**
   - WebSocket integration
   - Server-Sent Events (SSE)
   - Firebase Cloud Messaging

2. **Rich Notifications**
   - Images and attachments
   - Action buttons
   - Interactive components

3. **Advanced Filtering**
   - Category-based preferences
   - Time-based delivery
   - Frequency limits

4. **Analytics Dashboard**
   - Delivery statistics
   - User engagement metrics
   - A/B testing for templates

5. **Multi-language**
   - i18n support
   - Language detection
   - Template translations

## 📞 Support

For issues or questions:

- Check API documentation above
- Review error messages in responses
- Contact system administrator

---

**Module Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Maintained by:** GACP Certify Platform Team
