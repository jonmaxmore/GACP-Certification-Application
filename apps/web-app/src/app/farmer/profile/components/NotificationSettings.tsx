// File: src/app/farmer/profile/components/NotificationSettings.tsx
"use client";

import React, { useState } from 'react';

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  applicationStatus: boolean;
  paymentReminder: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
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
      } else {
        const error = await response.json();
        alert('บันทึกการตั้งค่าไม่สำเร็จ: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      alert('บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes: { key: keyof NotificationSettings; label: string; description: string }[] = [
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
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          🔔
        </div>
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
              className={`w-12 h-6 rounded-full transition-colors ${settings[key]
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
