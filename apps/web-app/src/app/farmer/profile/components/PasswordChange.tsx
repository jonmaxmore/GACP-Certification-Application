// File: src/app/farmer/profile/components/PasswordChange.tsx
"use client";

import React, { useState } from 'react';

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
      newErrors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ใหญ่ เล็กตัวเลข และอักขระวางพิเศษ');
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
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              className="w-full p-3 border-2 rounded-lg"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
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
