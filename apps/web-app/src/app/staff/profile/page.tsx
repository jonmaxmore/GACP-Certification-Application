'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffLayout from '../components/StaffLayout';

interface StaffProfile {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    department: string;
    employeeId: string;
    joinDate: string;
    status: 'ACTIVE' | 'INACTIVE';
    permissions: string[];
}

const ROLE_LABELS: Record<string, string> = {
    REVIEWER_AUDITOR: 'ผู้ตรวจสอบ/ตรวจประเมิน', SCHEDULER: 'ผู้จัดตารางนัดหมาย', ACCOUNTANT: 'เจ้าหน้าที่บัญชี', ADMIN: 'ผู้ดูแลระบบ', SUPER_ADMIN: 'ผู้ดูแลระบบสูงสุด'
};

export default function StaffProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const mockProfile: StaffProfile = { id: '1', name: 'สมชาย ผู้ตรวจสอบ', email: 'reviewer@gacp.go.th', phoneNumber: '02-123-4567', role: 'REVIEWER_AUDITOR', department: 'กองตรวจสอบมาตรฐาน GACP', employeeId: 'DTAM-2024-001', joinDate: '2024-01-15', status: 'ACTIVE', permissions: ['VIEW_APPLICATIONS', 'REVIEW_APPLICATIONS', 'SCHEDULE_AUDITS', 'APPROVE_BASIC'] };
            setProfile(mockProfile);
        } catch { console.error('Failed to fetch profile'); }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach(c => { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); });
        router.push('/staff/login');
    };

    if (loading) { return <StaffLayout title="👤 โปรไฟล์"><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div></StaffLayout>; }
    if (!profile) { return <StaffLayout title="👤 โปรไฟล์"><div className="text-center py-20 text-slate-500">ไม่พบข้อมูลโปรไฟล์</div></StaffLayout>; }

    return (
        <StaffLayout>
            {/* Profile Card */}
            <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
                <div className="relative px-8 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-5xl">👤</div>
                        <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                            <p className="text-primary-600 font-medium">{ROLE_LABELS[profile.role]}</p>
                            <p className="text-slate-500 text-sm">{profile.department}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className={`px-4 py-2 rounded-lg ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-700'} hover:opacity-80`}>✏️ แก้ไข</button>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">🚪 ออกจากระบบ</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className={`rounded-2xl shadow-card p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <h2 className="text-lg font-semibold mb-4">📧 ข้อมูลติดต่อ</h2>
                    <div className="space-y-4">
                        <div><label className="text-sm text-slate-500">อีเมล</label><p>{profile.email}</p></div>
                        <div><label className="text-sm text-slate-500">เบอร์โทรศัพท์</label><p>{profile.phoneNumber}</p></div>
                    </div>
                </div>

                <div className={`rounded-2xl shadow-card p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <h2 className="text-lg font-semibold mb-4">💼 ข้อมูลการทำงาน</h2>
                    <div className="space-y-4">
                        <div><label className="text-sm text-slate-500">รหัสพนักงาน</label><p>{profile.employeeId}</p></div>
                        <div><label className="text-sm text-slate-500">วันที่เริ่มงาน</label><p>{profile.joinDate}</p></div>
                        <div><label className="text-sm text-slate-500">สถานะ</label><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>{profile.status === 'ACTIVE' ? '✅ ใช้งาน' : '⏸️ ปิดใช้งาน'}</span></div>
                    </div>
                </div>

                <div className={`rounded-2xl shadow-card p-6 md:col-span-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <h2 className="text-lg font-semibold mb-4">🔐 สิทธิ์การเข้าถึง</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.permissions.map(perm => (
                            <span key={perm} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-700'}`}>{perm.replace(/_/g, ' ')}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className={`rounded-2xl shadow-card p-6 mt-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <h2 className="text-lg font-semibold mb-4">🔒 ความปลอดภัย</h2>
                <div className="flex flex-wrap gap-4">
                    <button className={`px-6 py-3 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-700'} hover:opacity-80`}>🔑 เปลี่ยนรหัสผ่าน</button>
                    <button className={`px-6 py-3 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-700'} hover:opacity-80`}>📱 ตั้งค่าการยืนยันตัวตนสองชั้น</button>
                </div>
            </div>
        </StaffLayout>
    );
}
