// File: src/app/farmer/profile/components/TwoFactorAuth.tsx
"use client";

import React, { useState } from 'react';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isEnabled, onToggle }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

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

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      alert('กรุณากรอกรหัสผ่าน 6 หลัก');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      if (response.ok) {
        alert('2FA ถูกเปิดใช้งานสำเร็จ');
        onToggle(true);
        setShowSetup(false);
        setVerificationCode('');
      } else {
        alert('รหัสผ่าน 2FA ไม่ถูกต้อง');
      }
    } catch (error) {
      alert('การยืนยันรหัสผ่าน 2FA ล้มเหลว');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('คุณต้องการปิดการใช้งาน 2FA หรือไม่?')) {
      return;
    }

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('2FA ถูกปิดใช้งานสำเร็จ');
        onToggle(false);
        setShowSetup(false);
      }
    } catch (error) {
      alert('ไม่สามารถปิดการใช้งาน 2FA');
    }
  };

  return (
    <div className="gacp-card p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            🔒
          </div>
          การตรวจสอบสอบตัว 2 ชั้น
        </h3>
        <button
          onClick={() => isEnabled ? handleDisable() : handleSetup()}
          className={`gacp-btn-${isEnabled ? 'secondary' : 'primary'}`}
        >
          {isEnabled ? 'ปิด' : 'เปิด'}
        </button>
      </div>

      <div className="mb-4">
        <span className="text-sm text-slate-600">
          สถานะ 2FA: <span className={`font-semibold ${isEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </span>
        </span>
      </div>

      {showSetup && !isEnabled && (
        <div className="mt-6 p-6 bg-slate-50 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4 text-center">
            ตั้งค่า 2FA
          </h4>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              สแกน QR code ด้วยแอปพลิเคชั่น Authenticator
            </p>
            <div className="w-48 h-48 bg-white p-4 rounded-xl mx-auto mb-4 border-2 border-slate-200">
              {qrCode ? (
                <img src={qrCode} alt="2FA QR Code" className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  กำลังโหลด...
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="กรอกรหัสผ่าน 6 หลัก"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 border-2 rounded-lg text-center text-2xl font-mono"
              />
              <button
                onClick={handleVerify}
                disabled={verifying || verificationCode.length !== 6}
                className="w-full gacp-btn-primary disabled:opacity-50"
              >
                {verifying ? 'กำลังยืนยัน...' : 'ยืนยัน'}
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <h5 className="font-semibold text-amber-800 mb-2">รหัสผ่านสำรอง:</h5>
              <div className="text-sm text-amber-700 font-mono space-y-1">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2">
                จัดเก็บรหัสเหล่านี้ไว้ในที่ปลอดภัย
              </p>
            </div>
          </div>
        </div>
      )}

      {showSetup && isEnabled && (
        <div className="mt-6 p-6 bg-slate-50 rounded-2xl">
          <h4 className="text-lg font-semibold mb-4 text-center">
            จัดการ 2FA
          </h4>
          
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
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
