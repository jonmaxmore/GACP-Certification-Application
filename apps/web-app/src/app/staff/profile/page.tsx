'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffLayout from '../components/StaffLayout';
import { IconUser, IconLogout, IconCheckCircle } from '@/components/ui/icons';

// Additional icons for this page
const IconEdit = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const IconMail = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const IconBriefcase = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const IconShield = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconKey = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

const IconPhone = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

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

    if (loading) { return <StaffLayout title="โปรไฟล์"><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div></StaffLayout>; }
    if (!profile) { return <StaffLayout title="โปรไฟล์"><div className="text-center py-20 text-slate-500">ไม่พบข้อมูลโปรไฟล์</div></StaffLayout>; }

    return (
        <StaffLayout>
            {/* Profile Card */}
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="h-24 bg-gradient-to-r from-emerald-600 to-emerald-500"></div>
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${isDark ? 'bg-slate-700 border-slate-800' : 'bg-white border-white shadow-lg'}`}>
                            <IconUser size={40} className="text-slate-400" />
                        </div>
                        <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                            <h1 className="text-xl font-semibold">{profile.name}</h1>
                            <p className="text-emerald-600 font-medium text-sm">{ROLE_LABELS[profile.role]}</p>
                            <p className="text-slate-500 text-sm">{profile.department}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} hover:opacity-80`}>
                                <IconEdit size={16} /> แก้ไข
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                                <IconLogout size={16} /> ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className={`rounded-xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <h2 className="flex items-center gap-2 text-base font-semibold mb-4"><IconMail size={18} className="text-emerald-600" /> ข้อมูลติดต่อ</h2>
                    <div className="space-y-3 text-sm">
                        <div><label className="text-xs text-slate-500">อีเมล</label><p>{profile.email}</p></div>
                        <div><label className="text-xs text-slate-500">เบอร์โทรศัพท์</label><p>{profile.phoneNumber}</p></div>
                    </div>
                </div>

                <div className={`rounded-xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <h2 className="flex items-center gap-2 text-base font-semibold mb-4"><IconBriefcase size={18} className="text-emerald-600" /> ข้อมูลการทำงาน</h2>
                    <div className="space-y-3 text-sm">
                        <div><label className="text-xs text-slate-500">รหัสพนักงาน</label><p>{profile.employeeId}</p></div>
                        <div><label className="text-xs text-slate-500">วันที่เริ่มงาน</label><p>{profile.joinDate}</p></div>
                        <div><label className="text-xs text-slate-500">สถานะ</label>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${profile.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                {profile.status === 'ACTIVE' ? <><IconCheckCircle size={12} /> ใช้งาน</> : 'ปิดใช้งาน'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`rounded-xl p-5 border md:col-span-2 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <h2 className="flex items-center gap-2 text-base font-semibold mb-4"><IconShield size={18} className="text-emerald-600" /> สิทธิ์การเข้าถึง</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.permissions.map(perm => (
                            <span key={perm} className={`px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{perm.replace(/_/g, ' ')}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className={`rounded-xl p-5 border mt-4 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <h2 className="flex items-center gap-2 text-base font-semibold mb-4"><IconKey size={18} className="text-emerald-600" /> ความปลอดภัย</h2>
                <div className="flex flex-wrap gap-3">
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} hover:opacity-80`}>
                        <IconKey size={16} /> เปลี่ยนรหัสผ่าน
                    </button>
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} hover:opacity-80`}>
                        <IconPhone size={16} /> ตั้งค่าการยืนยันตัวตนสองชั้น
                    </button>
                </div>
            </div>
        </StaffLayout>
    );
}
