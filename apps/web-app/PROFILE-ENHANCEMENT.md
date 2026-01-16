# GACP Platform - Profile Enhancement Plan

## 🎯 การปรับปรุง Profile Page (Farmer)

### **📸 1. Profile Picture Management**

#### **Current State:** ❌ ไม่มีรูปโปรไฟล์
#### **Enhancement:** เพิ่มการจัดการรูปภาพโปรไฟล์

```typescript
// เพิ่มใน profile state
const [profileImage, setProfileImage] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);

// UI Components
<div className="relative group">
  <div className="w-32 h-32 bg-white rounded-full shadow-elevated mx-auto mb-6 flex items-center justify-center border-4 border-white overflow-hidden">
    {profileImage ? (
      <img 
        src={profileImage} 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    ) : (
      <IconUser className="w-16 h-16 text-slate-400" />
    )}
  </div>
  {isEditing && (
    <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg">
      <Icons.Camera className="w-4 h-4" />
    </button>
  )}
</div>

// Upload Handler
const handleImageUpload = async (file: File) => {
  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const result = await api.post('/auth/profile/image', formData);
    if (result.success) {
      setProfileImage(result.data.profileImage);
      setMessage("✅ อัพเดตรูปโปรไฟล์สำเร็จ");
    }
  } catch (error) {
    setMessage("❌ อัพเดตรูปโปรไฟล์ไม่สำเร็จ");
  } finally {
    setIsUploading(false);
  }
};
```

### **🔐 2. Password Management**

#### **Current State:** ❌ ไม่มีการเปลี่ยนรหัสผ่าน
#### **Enhancement:** เพิ่มส่วนจัดการรหัสผ่าน

```typescript
// State Management
const [showPasswordChange, setShowPasswordChange] = useState(false);
const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// UI Components
<div className="gacp-card p-8 shadow-soft">
  <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      <IconLock className="w-5 h-5" />
    </div>
    จัดการรหัสผ่าน
  </h3>
  
  {showPasswordChange && (
    <div className="space-y-6">
      <div>
        <label>รหัสผ่านปัจจุบัน</label>
        <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
      </div>
      <div>
        <label>รหัสผ่านใหม่</label>
        <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
      </div>
      <div>
        <label>ยืนยันรหัสผ่านใหม่</label>
        <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
      </div>
      <button onClick={handleChangePassword} className="gacp-btn-primary">
        เปลี่ยนรหัสผ่าน
      </button>
    </div>
  )}
</div>

// Password Change Handler
const handleChangePassword = async () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    setMessage("❌ รหัสผ่านไม่ตรงกัน");
    return;
  }
  
  try {
    const result = await api.post('/auth/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (result.success) {
      setMessage("✅ เปลี่ยนรหัสผ่านสำเร็จ");
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  } catch (error) {
    setMessage("❌ เปลี่ยนรหัสผ่านไม่สำเร็จ");
  }
};
```

### **🔐 3. Two-Factor Authentication (2FA)**

#### **Current State:** ❌ ไม่มี 2FA
#### **Enhancement:** เพิ่มการตั้งค่า 2FA

```typescript
// State Management
const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
const [showQRCode, setShowQRCode] = useState(false);
const [qrCode, setQrCode] = useState('');

// UI Components
<div className="gacp-card p-8 shadow-soft">
  <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      <Icons.Shield className="w-5 h-5" />
    </div>
    การตรวจสอบสอบตัว 2 ชั้น
  </h3>
  
  <div className="flex items-center justify-between mb-6">
    <span>สถานะ 2FA: {twoFactorEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span>
    <button 
      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
      className={`gacp-btn-${twoFactorEnabled ? 'secondary' : 'primary'}`}
    >
      {twoFactorEnabled ? 'ปิด' : 'เปิด'}
    </button>
  </div>

  {!twoFactorEnabled && (
    <button 
      onClick={handleSetup2FA}
      className="gacp-btn-primary w-full"
    >
      ตั้งค่า 2FA
    </button>
  )}

  {showQRCode && (
    <div className="text-center p-6 bg-slate-50 rounded-2xl">
      <p className="text-sm text-slate-600 mb-4">สแกน QR code ด้วยแอปพลิเคชั่น Authenticator</p>
      <div className="w-48 h-48 bg-white p-4 rounded-xl mx-auto">
        {qrCode && <img src={qrCode} alt="2FA QR Code" />}
      </div>
    </div>
  )}
</div>

// 2FA Setup Handler
const handleSetup2FA = async () => {
  try {
    const result = await api.post('/auth/2fa/setup');
    if (result.success) {
      setQrCode(result.data.qrCode);
      setShowQRCode(true);
    }
  } catch (error) {
    setMessage("❌ ไม่สามารถตั้งค่า 2FA");
  }
};
```

### **🔔 4. Notification Settings**

#### **Current State:** ❌ ไม่มีการตั้งค่าการแจ้งเตือน
#### **Enhancement:** เพิ่มการจัดการ notifications

```typescript
// State Management
const [notifications, setNotifications] = useState({
  email: true,
  sms: false,
  push: true,
  applicationStatus: true,
  paymentReminder: true,
  systemUpdates: false
});

// UI Components
<div className="gacp-card p-8 shadow-soft">
  <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      <Icons.Bell className="w-5 h-5" />
    </div>
    การตั้งค่าการแจ้งเตือน
  </h3>
  
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-black text-slate-700">อีเมล</label>
        <p className="text-xs text-slate-500">รับแจ้งเตือนเกี่ยวกับใบสนคร</p>
      </div>
      <button 
        onClick={() => setNotifications({...notifications, email: !notifications.email})}
        className={`w-12 h-6 rounded-full ${notifications.email ? 'bg-primary' : 'bg-slate-200'}`}
      >
        {notifications.email && <span className="text-white">✓</span>}
      </button>
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-black text-slate-700">SMS</label>
        <p className="text-xs text-slate-500">แจ้งเตือนผ่าน SMS</p>
      </div>
      <button 
        onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
        className={`w-12 h-6 rounded-full ${notifications.sms ? 'bg-primary' : 'bg-slate-200'}`}
      >
        {notifications.sms && <span className="text-white">✓</span>}
      </button>
    </div>
    
    {/* More notification types... */}
  </div>
</div>

// Save Handler
const handleSaveNotifications = async () => {
  try {
    const result = await api.post('/auth/notifications', notifications);
    if (result.success) {
      setMessage("✅ บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ");
    }
  } catch (error) {
    setMessage("❌ บันทึกการตั้งค่าการแจ้งเตือนไม่สำเร็จ");
  }
};
```

### **🛡️ 5. Privacy Settings**

#### **Current State:** ❌ ไม่มีการตั้งค่าความเป็นส่วน
#### **Enhancement:** เพิ่มการจัดการ privacy

```typescript
// State Management
const [privacy, setPrivacy] = useState({
  profileVisibility: 'public', // public, private, connections_only
  dataSharing: false,
  marketingEmails: false,
  showLastLogin: true,
  showRegistrationDate: true
});

// UI Components
<div className="gacp-card p-8 shadow-soft">
  <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      <Icons.Lock className="w-5 h-5" />
    </div>
    การตั้งค่าความเป็นส่วน
  </h3>
  
  <div className="space-y-6">
    <div>
      <label className="text-sm font-black text-slate-700">การมองเห็นโปรไฟล์</label>
      <select 
        value={privacy.profileVisibility} 
        onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
        className="w-full p-3 border-2 rounded-xl"
      >
        <option value="public">สาธาร - ทุกคนเห็นได้</option>
        <option value="private">ส่วนตัว - เฉพาะผู้เชื่อมต่อเห็น</option>
        <option value="connections_only">เฉพาะการเชื่อมต่อ - เฉพาะผู้ที่เชื่อมต่อเห็น</option>
      </select>
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-black text-slate-700">การแชร์ข้อมูล</label>
        <p className="text-xs text-slate-500">ให้พันธุร์การวิจัย</p>
      </div>
      <button 
        onClick={() => setPrivacy({...privacy, dataSharing: !privacy.dataSharing})}
        className={`w-12 h-6 rounded-full ${privacy.dataSharing ? 'bg-primary' : 'bg-slate-200'}`}
      >
        {privacy.dataSharing && <span className="text-white">✓</span>}
      </button>
    </div>
  </div>
</div>
```

### **📋 6. Enhanced Form Validation**

#### **Current State:** 🟡 ตรวจสอบแค่ email และ phone
#### **Enhancement:** เพิ่มการตรวจสอบครบถ้วน

```typescript
// Enhanced Validation Functions
const validateThaiID = (id: string) => {
  // Thai ID card validation
  const thaiIDRegex = /^[0-9]{13}$/;
  if (!thaiIDRegex.test(id)) {
    return { valid: false, message: "รูปแบบบัตตัวเลขบัตตัวเลข 13 หลัก" };
  }
  
  // Checksum validation for Thai ID
  const digits = id.split('').map(Number);
  const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const sum = digits.reduce((acc, digit, index) => acc + (digit * weights[index]), 0);
  const checksum = (11 - (sum % 11)) % 10;
  
  if (parseInt(digits[12]) !== checksum) {
    return { valid: false, message: "เลขบัตตัวเลขบัตตัวเลขไม่ถูกต้อง" };
  }
  
  return { valid: true, message: "" };
};

const validateTaxID = (id: string) => {
  // Tax ID validation for juristic persons
  const taxIDRegex = /^[0-9]{13}$/;
  if (!taxIDRegex.test(id)) {
    return { valid: false, message: "รูปแบบเลขประจาน 13 หลัก" };
  }
  
  return { valid: true, message: "" };
};

// Enhanced Input Components
<div className="space-y-2">
  <div>
    <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">เลขบัตตัวเลขบัตตัวเลข</label>
    <input 
      type="text" 
      value={thaiID} 
      onChange={(e) => setThaiID(e.target.value)} 
      className={inputClass}
      placeholder="1-2345-67890-12"
      maxLength={13}
    />
    {validationErrors.thaiID && (
      <p className="text-xs text-rose-500 mt-1">{validationErrors.thaiID}</p>
    )}
  </div>
  
  <div>
    <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">เลขประจาน</label>
    <input 
      type="text" 
      value={taxID} 
      onChange={(e) => setTaxID(e.target.value)} 
      className={inputClass}
      placeholder="1234567890123"
      maxLength={13}
    />
    {validationErrors.taxID && (
      <p className="text-xs text-rose-500 mt-1">{validationErrors.taxID}</p>
    )}
  </div>
</div>
```

## 🎨 UI/UX Improvements

### **1. Progressive Enhancement**
- เพิ่มฟีเจอร์ทีละละไป (slide-in, fade-in)
- ใช้ React Suspense สำหรับ loading states
- เพิ่ม micro-interactions และ animations

### **2. Better Error Handling**
- แสดง error ที่ละเอียดขึ้น
- Toast notifications แทนการใช้ alert
- Error boundary สำหรับ crash recovery

### **3. Accessibility**
- ARIA labels ครบถ้วน
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### **4. Mobile Optimization**
- Touch-friendly interface
- Swipe gestures สำหรับ mobile
- Responsive typography

## 📱 Mobile App Integration

### **Profile Sync**
- Sync profile changes กับ mobile app
- Real-time updates ข้าม device
- Conflict resolution สำหรับ simultaneous edits

## 🔒 Security Enhancements

### **1. Session Management**
- Auto logout หลังจากไม่ได้ใช้งาน
- Session timeout แบบ configurable
- Secure session storage

### **2. Data Protection**
- Encryption สำหรับ sensitive data
- Audit trail สำหรับ profile changes
- Data retention policies

## 📊 Analytics & Monitoring

### **User Behavior Tracking**
- Profile completion rate
- Feature usage statistics
- Error rate monitoring
- Performance metrics

---

**Implementation Priority:**
1. **High:** Profile Picture, Password Change, 2FA
2. **Medium:** Notifications, Privacy Settings
3. **Low:** Enhanced Validation, Analytics

*Estimated Development Time: 2-3 weeks*
*Testing Required: Unit tests, E2E tests, Accessibility tests*
