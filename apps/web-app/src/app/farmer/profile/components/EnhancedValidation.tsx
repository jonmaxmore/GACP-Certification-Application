// File: src/app/farmer/profile/components/EnhancedValidation.tsx
"use client";

import React, { useState } from 'react';

interface ValidationRule {
  pattern: RegExp;
  message: string;
  isValid: (value: string) => boolean;
}

interface EnhancedValidationProps {
  onValidationComplete: (isValid: boolean, data: any) => void;
}

const EnhancedValidation: React.FC<EnhancedValidationProps> = ({ onValidationComplete }) => {
  const [formData, setFormData] = useState({
    thaiId: '',
    taxId: '',
    phoneNumber: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validations, setValidations] = useState<Record<string, boolean>>({});

  const validationRules: Record<string, ValidationRule> = {
    thaiId: {
      pattern: /^\d{13}$/,
      message: 'เลขบัตรประชาชนต้องมี 13 หลัก',
      isValid: (value: string) => {
        if (!/^\d{13}$/.test(value)) return false;
        
        // Thai ID checksum validation
        const digits = value.split('').map(Number);
        const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * (13 - index), 0);
        const checksum = (11 - (sum % 11)) % 10;
        
        return checksum === digits[12];
      }
    },
    taxId: {
      pattern: /^\d{13}$/,
      message: 'เลขทะเบียนนิติบุคคลต้องมี 13 หลัก',
      isValid: (value: string) => /^\d{13}$/.test(value)
    },
    phoneNumber: {
      pattern: /^0[689]\d{8}$/,
      message: 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08, หรือ 09 และมี 10 หลัก',
      isValid: (value: string) => /^0[689]\d{8}$/.test(value)
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'รูปแบบอีเมลไม่ถูกต้อง',
      isValid: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, ''); // For numeric fields
    
    setFormData(prev => ({
      ...prev,
      [field]: field === 'email' ? value : cleanValue
    }));

    // Real-time validation
    if (value.length > 0) {
      const rule = validationRules[field];
      const isValid = rule.isValid(field === 'email' ? value : cleanValue);
      
      setValidations(prev => ({
        ...prev,
        [field]: isValid
      }));

      setErrors(prev => ({
        ...prev,
        [field]: isValid ? '' : rule.message
      }));
    } else {
      setValidations(prev => ({
        ...prev,
        [field]: false
      }));
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allValid = Object.keys(validations).every(key => validations[key]);
    const hasData = Object.values(formData).some(value => value.length > 0);
    
    if (hasData && allValid) {
      onValidationComplete(true, formData);
    } else {
      onValidationComplete(false, { error: 'กรุณากรอกข้อมูลให้ถูกต้อง' });
    }
  };

  const inputConfigs = [
    { key: 'thaiId', label: 'เลขบัตรประชาชน', placeholder: '13 หลัก', type: 'text', maxLength: 13 },
    { key: 'taxId', label: 'เลขทะเบียนนิติบุคคล', placeholder: '13 หลัก', type: 'text', maxLength: 13 },
    { key: 'phoneNumber', label: 'เบอร์โทรศัพท์', placeholder: '0xxxxxxxxx', type: 'tel', maxLength: 10 },
    { key: 'email', label: 'อีเมล', placeholder: 'example@email.com', type: 'email', maxLength: 100 }
  ];

  return (
    <div className="gacp-card p-6 shadow-soft">
      <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-50 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          ✅
        </div>
        การตรวจสอบข้อมูลขั้นสูง
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {inputConfigs.map(({ key, label, placeholder, type, maxLength }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {label}
            </label>
            <div className="relative">
              <input
                type={type}
                value={formData[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`w-full p-3 border-2 rounded-lg pr-10 ${
                  errors[key] 
                    ? 'border-rose-300 bg-rose-50' 
                    : validations[key] 
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200'
                }`}
              />
              <div className="absolute right-3 top-3">
                {validations[key] && (
                  <span className="text-emerald-600">✓</span>
                )}
                {errors[key] && (
                  <span className="text-rose-600">✗</span>
                )}
              </div>
            </div>
            {errors[key] && (
              <p className="text-sm text-rose-600 mt-1">{errors[key]}</p>
            )}
            {validations[key] && (
              <p className="text-sm text-emerald-600 mt-1">✅ ข้อมูลถูกต้อง</p>
            )}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full gacp-btn-primary"
          >
            ตรวจสอบข้อมูลทั้งหมด
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">🔍 คำแนะนำการตรวจสอบ</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• เลขบัตรประชาชน: ตรวจสอบ checksum และรูปแบบ</li>
          <li>• เลขทะเบียนนิติบุคคล: ตรวจสอบรูปแบบ 13 หลัก</li>
          <li>• เบอร์โทรศัพท์: ตรวจสอบรูปแบบมือถือไทย</li>
          <li>• อีเมล: ตรวจสอบรูปแบบอีเมลมาตรฐาน</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedValidation;
