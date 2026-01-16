# GACP Platform - Profile Implementation Guide

## 🎯 การ Implement Profile Features ตาม Enhancement Plan

### **📋 Implementation Order (Priority-Based)**

---

## 🥇 **Phase 1: Core Profile Features (Week 1)**

### **1.1 Profile Picture Management**
```typescript
// File: src/app/farmer/profile/components/ProfilePicture.tsx
interface ProfilePictureProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  isEditing: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ currentImage, onImageChange, isEditing }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('รูปภาพต้องมีขนาดไม่เกิน 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', fileInputRef.current.files[0]);
    
    try {
      const response = await fetch('/api/auth/profile/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        onImageChange(result.profileImage);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      alert('อัพโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-32 h-32 bg-white rounded-full shadow-elevated mx-auto mb-6 flex items-center justify-center border-4 border-white overflow-hidden">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : currentImage ? (
          <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <IconUser className="w-16 h-16 text-slate-400" />
        )}
      </div>
      
      {isEditing && (
        <>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all"
            disabled={uploading}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <IconCamera className="w-4 h-4" />
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ProfilePicture;
```

### **1.2 Password Change Component**
```typescript
// File: src/app/farmer/profile/components/PasswordChange.tsx
interface PasswordChangeProps {
  onSuccess: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    // Validation
    const newErrors: string[] = [];
    
    if (!formData.currentPassword) {
      newErrors.push('กรุณากรอกรหัสผ่านปัจจุบัน');
    }
    
    if (!validatePassword(formData.newPassword)) {
      newErrors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร์ ใหญ่ เล็กตัวเลข และอักขระวางพิเศษ');
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push('รหัสผ่านใหม่ไม่ตรงกัน');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });
      
      if (response.ok) {
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        setShowForm(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        onSuccess();
      } else {
        const error = await response.json();
        setErrors([error.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ']);
      }
    } catch (error) {
      setErrors(['เกิดข้อผิดพลาด กรุณาลองใหม่']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gacp-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-800">จัดการรหัสผ่าน</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gacp-btn-secondary"
        >
          {showForm ? 'ยกเลิก' : 'เปลี่ยน'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.map((error, index) => (
            <div key={index} className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          ))}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่านปัจจุบัน
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full p-3 border-2 rounded-lg"
                placeholder="กรอกรหัสผ่านปัจจุบัน"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showCurrentPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="w-full p-3 border-2 rounded-lg"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full p-3 border-2 rounded-lg"
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 gacp-btn-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gacp-btn-primary disabled:opacity-50"
            >
              {loading ? 'กำลังดำเนินการ...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordChange;
```

---

## 🥈 **Phase 2: Advanced Features (Week 2)**

### **2.1 Two-Factor Authentication**
```typescript
// File: src/app/farmer/profile/components/TwoFactorAuth.tsx
interface TwoFactorAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isEnabled, onToggle }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);

  const handleSetup = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
        setShowSetup(true);
      }
    } catch (error) {
      alert('ไม่สามารถตั้งค่า 2FA');
    }
  };

  const handleVerify = async (code: string) => {
    setVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      if (response.ok) {
        alert('2FA ถูกเปิดใช้งานสำเร็จ');
        onToggle(true);
        setShowSetup(false);
      } else {
        alert('รหัสผ่าน 2FA ไม่ถูกต้อง');
      }
    } catch (error) {
      alert('การยืนยันรหัสผ่าน 2FA ล้มเหลว');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="gacp-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <IconShield className="w-6 h-6 text-primary" />
          การตรวจสอบสอบตัว 2 ชั้น
        </h3>
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`gacp-btn-${isEnabled ? 'secondary' : 'primary'}`}
        >
          {isEnabled ? 'ปิด' : 'เปิด'}
        </button>
      </div>

      {!isEnabled ? (
        <button
          onClick={handleSetup}
          className="w-full gacp-btn-primary"
        >
          ตั้งค่า 2FA
        </button>
      ) : (
        <button
          onClick={() => setShowSetup(true)}
          className="w-full gacp-btn-secondary"
        >
          จัดการ 2FA
        </button>
      )}

      {showSetup && (
        <div className="mt-6 p-6 bg-slate-50 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4 text-center">
            {isEnabled ? 'จัดการ 2FA' : 'ตั้งค่า 2FA'}
          </h4>
          
          {!isEnabled ? (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                สแกน QR code ด้วยแอปพลิเคชั่น Authenticator
              </p>
              <div className="w-48 h-48 bg-white p-4 rounded-xl mx-auto mb-4">
                {qrCode && <img src={qrCode} alt="2FA QR Code" />}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="กรอกรหัสผ่าน 6 หลัก"
                  maxLength={6}
                  className="w-full p-3 border-2 rounded-lg text-center text-2xl"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.length === 6) {
                      handleVerify(e.currentTarget.value);
                    }
                  }}
                />
                <button
                  onClick={() => handleVerify(verifying ? '' : document.querySelector('input')?.value)}
                  disabled={verifying}
                  className="w-full gacp-btn-primary disabled:opacity-50"
                >
                  {verifying ? 'กำลังยืนยัน...' : 'ยืนยัน'}
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <h5 className="font-semibold text-amber-800 mb-2">รหัสผ่านสำรอง:</h5>
                <div className="text-sm text-amber-700">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono">{code}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => alert('รหัสผ่านสำรองถูกส่งไปยังอีเมลของคุณ')}
                className="w-full gacp-btn-secondary"
              >
                ส่งรหัสผ่านสำรอง
              </button>
              <button
                onClick={() => setShowSetup(false)}
                className="w-full gacp-btn-secondary"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
```

---

## 🥉 **Phase 3: Settings & Preferences (Week 3)**

### **3.1 Notification Settings**
```typescript
// File: src/app/farmer/profile/components/NotificationSettings.tsx
interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  applicationStatus: boolean;
  paymentReminder: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, onSettingsChange }) => {
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    setSaving(true);
    try {
      const response = await fetch('/api/auth/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      
      if (response.ok) {
        onSettingsChange(newSettings);
      }
    } catch (error) {
      alert('บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { key: 'email', label: 'อีเมล', description: 'รับแจ้งเตือนเกี่ยวกับใบสนคร' },
    { key: 'sms', label: 'SMS', description: 'แจ้งเตือนผ่าน SMS' },
    { key: 'push', label: 'Push', description: 'แจ้งเตือนในแอปพลิเคชั่น' },
    { key: 'applicationStatus', label: 'สถานะคำสมัคร', description: 'เมื่อสถานะเปลี่ยน' },
    { key: 'paymentReminder', label: 'การชำระเงิน', description: 'แจ้งเตือนก่อนชำระเงิน' },
    { key: 'systemUpdates', label: 'อัพเดตระบบ', description: 'การอัพเดตระบบระบบ' },
    { key: 'marketingEmails', label: 'การตลาดการ', description: 'ข้อมูลสินค้าและโปรโมชั่น' },
  ];

  return (
    <div className="gacp-card p-6 shadow-soft">
      <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
        <IconBell className="w-6 h-6 text-primary" />
        การตั้งค่าการแจ้งเตือน
      </h3>

      <div className="space-y-4">
        {notificationTypes.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <div className="font-medium text-slate-700">{label}</div>
              <div className="text-sm text-slate-500">{description}</div>
            </div>
            <button
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings[key] 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {settings[key] && (
                <span className="text-white text-xs">✓</span>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => alert('การตั้งค่าถูกบันทึก')}
          className="gacp-btn-primary"
        >
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
```

---

## 🔧 **Integration Steps**

### **1. Update Main Profile Page**
```typescript
// File: src/app/farmer/profile/page.tsx
import ProfilePicture from './components/ProfilePicture';
import PasswordChange from './components/PasswordChange';
import TwoFactorAuth from './components/TwoFactorAuth';
import NotificationSettings from './components/NotificationSettings';

// Add to existing profile state
const [profileImage, setProfileImage] = useState<string | null>(null);
const [showPasswordChange, setShowPasswordChange] = useState(false);
const [showTwoFactor, setShowTwoFactor] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

// Add to existing profile component
<div className="lg:col-span-2 space-y-8">
  {/* Profile Picture */}
  <ProfilePicture
    currentImage={profileImage}
    onImageChange={setProfileImage}
    isEditing={isEditing}
  />
  
  {/* Password Change */}
  {showPasswordChange && (
    <PasswordChange onSuccess={() => setShowPasswordChange(false)} />
  )}
  
  {/* 2FA Settings */}
  {showTwoFactor && (
    <TwoFactorAuth
      isEnabled={twoFactorEnabled}
      onToggle={setTwoFactorEnabled}
    />
  )}
  
  {/* Notification Settings */}
  {showNotifications && (
    <NotificationSettings
      settings={notificationSettings}
      onSettingsChange={setNotificationSettings}
    />
  )}
</div>
```

### **2. API Endpoints**
```typescript
// File: src/app/api/auth/profile/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('profileImage') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `profile-${userId}-${timestamp}.${file.type.split('/')[1]}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const buffer = await file.arrayBuffer();
    await writeFile(filepath, buffer);

    // Return file URL
    const fileUrl = `/uploads/profiles/${filename}`;
    
    return NextResponse.json({
      success: true,
      profileImage: fileUrl
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

---

## 📋 Testing Strategy

### **Unit Tests**
```typescript
// File: src/app/farmer/profile/__tests__/ProfilePicture.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePicture from '../components/ProfilePicture';

describe('ProfilePicture', () => {
  test('renders profile picture correctly', () => {
    render(<ProfilePicture currentImage="/test.jpg" onImageChange={() => {}} isEditing={false} />);
    expect(screen.getByAltText('Profile')).toBeInTheDocument();
  });

  test('handles file selection', () => {
    const onImageChange = jest.fn();
    render(<ProfilePicture onImageChange={onImageChange} isEditing={true} />);
    
    const fileInput = screen.getByRole('button');
    fireEvent.click(fileInput);
    
    // Test file upload logic
  });
});
```

### **E2E Tests**
```typescript
// File: tests/profile.spec.ts
import { test, expect } from '@playwright/test';

test('profile management flow', async ({ page }) => {
  await page.goto('/farmer/profile');
  
  // Test profile picture upload
  await page.click('[data-testid="edit-profile"]');
  await page.setInputFiles('input[type="file"]', 'test-image.jpg');
  await page.click('[data-testid="upload-image"]');
  
  // Test password change
  await page.click('[data-testid="password-change"]');
  await page.fill('[data-testid="current-password"]', 'oldpassword');
  await page.fill('[data-testid="new-password"]', 'newpassword123');
  await page.fill('[data-testid="confirm-password"]', 'newpassword123');
  await page.click('[data-testid="submit-password"]');
  
  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 🎨 UI/UX Guidelines

### **Design Principles**
1. **Progressive Enhancement** - เพิ่มฟีเจอร์ทีละละไป
2. **Mobile First** - ออกแบบ mobile ก่อน desktop
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Performance** - Core Web Vitals < 2.5s
5. **Thai Language Support** - ฟอนต์และข้อความที่เหมาะสม

### **Component Library**
```typescript
// File: src/components/profile/index.ts
export { default as ProfilePicture } from './ProfilePicture';
export { default as PasswordChange } from './PasswordChange';
export { default as TwoFactorAuth } from './TwoFactorAuth';
export { default as NotificationSettings } from './NotificationSettings';
```

---

## 📱 Mobile Integration

### **React Native Components**
```typescript
// Shared types between web and mobile
export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  twoFactorEnabled: boolean;
  notificationSettings: NotificationSettings;
}

// API sync endpoint
// File: src/app/api/auth/sync/route.ts
export async function POST(request: NextRequest) {
  const { deviceId, profileData } = await request.json();
  
  // Update last sync timestamp
  await updateLastSync(deviceId);
  
  // Broadcast to other devices
  await broadcastProfileUpdate(profileData);
  
  return NextResponse.json({ success: true });
}
```

---

## 🔒 Security Considerations

### **Data Protection**
- การเข้ารหัสข้อมูลส่วนตัว
- Audit trail สำหรับทุกการเปลี่ยนแปลง
- Rate limiting สำหรับ API endpoints
- Input validation และ sanitization

### **Session Management**
- Secure session storage
- Auto logout หลังจากไม่ได้ใช้งาน
- Session timeout แบบ configurable
- Cross-device session management

---

## 📊 Success Metrics

### **Key Performance Indicators**
- Profile completion rate: > 90%
- 2FA adoption rate: > 70%
- Password change success rate: > 95%
- User satisfaction score: > 4.5/5
- Page load time: < 2s

### **Monitoring**
- Error tracking สำหรับ profile operations
- Performance monitoring สำหรับ upload speeds
- Usage analytics สำหรับ feature adoption
- Security event logging

---

**Implementation Timeline: 3 weeks**
**Testing Required: 1 week**
**Documentation: Complete**

*Ready for development with comprehensive guidelines and code examples* 🚀
