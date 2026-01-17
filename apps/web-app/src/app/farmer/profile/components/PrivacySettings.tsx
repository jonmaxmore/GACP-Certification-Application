// File: src/app/farmer/profile/components/PrivacySettings.tsx
"use client";

import React, { useState } from 'react';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  dataSharing: boolean;
  marketingCommunications: boolean;
  activityVisibility: boolean;
  locationSharing: boolean;
  analyticsTracking: boolean;
}

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onSettingsChange }) => {
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: keyof PrivacySettings, value?: any) => {
    const newSettings = { ...settings, [key]: value !== undefined ? value : !settings[key] };

    setSaving(true);
    try {
      const response = await fetch('/api/auth/privacy', {
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

  const privacyOptions: { key: keyof PrivacySettings; label: string; description: string; type: 'select' | 'toggle'; options?: { value: string; label: string }[] }[] = [
    {
      key: 'profileVisibility',
      label: 'การมองเห็นโปรไฟล์',
      description: 'ควบคุมว่าใครสามารถมองเห็นโปรไฟล์ของคุณได้',
      type: 'select',
      options: [
        { value: 'public', label: 'สาธารณะ - ทุกคนมองเห็นได้' },
        { value: 'private', label: 'ส่วนตัว - เฉพาะคุณเท่านั้น' },
        { value: 'connections', label: 'เฉพาะผู้ที่เชื่อมต่อ' }
      ]
    },
    { key: 'dataSharing', label: 'การแชร์ข้อมูล', description: 'อนุญาตให้ใช้ข้อมูลสำหรับการวิเคราะห์', type: 'toggle' },
    { key: 'marketingCommunications', label: 'การสื่อสารทางการตลาด', description: 'รับข้อมูลโปรโมชั่นและข่าวสาร', type: 'toggle' },
    { key: 'activityVisibility', label: 'การมองเห็นกิจกรรม', description: 'แสดงกิจกรรมล่าสุดในโปรไฟล์', type: 'toggle' },
    { key: 'locationSharing', label: 'การแชร์ตำแหน่ง', description: 'แชร์ตำแหน่งของฟาร์มในโปรไฟล์สาธารณะ', type: 'toggle' },
    { key: 'analyticsTracking', label: 'การติดตามวิเคราะห์', description: 'ช่วยปรับปรุงประสบการณ์การใช้งาน', type: 'toggle' },
  ];

  return (
    <div className="gacp-card p-6 shadow-soft">
      <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          🔒
        </div>
        การตั้งค่าความเป็นส่วนตัว
      </h3>

      <div className="space-y-6">
        {privacyOptions.map(({ key, label, description, type, options }) => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-slate-100">
            <div className="flex-1">
              <div className="font-medium text-slate-700">{label}</div>
              <div className="text-sm text-slate-500 mt-1">{description}</div>
            </div>

            {type === 'toggle' ? (
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
            ) : (
              <select
                value={settings[key] as string}
                onChange={(e) => handleToggle(key, e.target.value)}
                disabled={saving}
                className="px-3 py-2 border-2 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-primary"
              >
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2">📋 ข้อมูลความเป็นส่วนตัว</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• ข้อมูลส่วนตัวของคุณได้รับการคุ้มครองตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
          <li>• เราไม่เปิดเผยข้อมูลให้บุคคลภายนอกโดยไม่ได้รับอนุญาต</li>
          <li>• คุณสามารถแก้ไขการตั้งค่าได้ตลอดเวลา</li>
          <li>• ข้อมูลที่ลบไปแล้วไม่สามารถกู้คืนได้</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            if (confirm('คุณต้องการคืนค่าการตั้งค่าเป็นค่าเริ่มต้นหรือไม่?')) {
              const defaultSettings: PrivacySettings = {
                profileVisibility: 'public',
                dataSharing: false,
                marketingCommunications: false,
                activityVisibility: true,
                locationSharing: false,
                analyticsTracking: true,
              };
              handleToggle('profileVisibility', defaultSettings.profileVisibility);
              // Handle other settings...
            }
          }}
          className="gacp-btn-secondary"
        >
          คืนค่าเริ่มต้น
        </button>

        <button
          onClick={() => alert('การตั้งค่าถูกบันทึกแล้ว')}
          className="gacp-btn-primary"
        >
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
};

export default PrivacySettings;
