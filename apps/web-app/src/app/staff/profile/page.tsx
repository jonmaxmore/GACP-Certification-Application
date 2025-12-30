'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 🍎 Staff Profile Page
 * โปรไฟล์พนักงานในระบบ GACP
 */

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
    REVIEWER_AUDITOR: 'ผู้ตรวจสอบ/ตรวจประเมิน',
    SCHEDULER: 'ผู้จัดตารางนัดหมาย',
    ACCOUNTANT: 'เจ้าหน้าที่บัญชี',
    ADMIN: 'ผู้ดูแลระบบ',
    SUPER_ADMIN: 'ผู้ดูแลระบบสูงสุด',
};

export default function StaffProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Mock profile data
            const mockProfile: StaffProfile = {
                id: '1',
                name: 'สมชาย ผู้ตรวจสอบ',
                email: 'reviewer@gacp.go.th',
                phoneNumber: '02-123-4567',
                role: 'REVIEWER_AUDITOR',
                department: 'กองตรวจสอบมาตรฐาน GACP',
                employeeId: 'DTAM-2024-001',
                joinDate: '2024-01-15',
                status: 'ACTIVE',
                permissions: [
                    'VIEW_APPLICATIONS',
                    'REVIEW_APPLICATIONS',
                    'SCHEDULE_AUDITS',
                    'APPROVE_BASIC',
                ],
            };
            setProfile(mockProfile);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear all auth data
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach((c) => {
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        router.push('/staff/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                <p className="text-gray-600">ไม่พบข้อมูลโปรไฟล์</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-emerald-600 hover:text-emerald-800 mb-4 flex items-center gap-2"
                    >
                        ← กลับ
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Cover */}
                    <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                    {/* Avatar & Basic Info */}
                    <div className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                                <span className="text-5xl">👤</span>
                            </div>
                            <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                                <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                                <p className="text-emerald-600 font-medium">{ROLE_LABELS[profile.role]}</p>
                                <p className="text-gray-500 text-sm">{profile.department}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                >
                                    ✏️ แก้ไข
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                    🚪 ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">📧 ข้อมูลติดต่อ</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">อีเมล</label>
                                <p className="text-gray-800">{profile.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">เบอร์โทรศัพท์</label>
                                <p className="text-gray-800">{profile.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Work Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">💼 ข้อมูลการทำงาน</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">รหัสพนักงาน</label>
                                <p className="text-gray-800">{profile.employeeId}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">วันที่เริ่มงาน</label>
                                <p className="text-gray-800">{profile.joinDate}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">สถานะ</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${profile.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {profile.status === 'ACTIVE' ? '✅ ใช้งาน' : '⏸️ ปิดใช้งาน'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">🔐 สิทธิ์การเข้าถึง</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.permissions.map((perm) => (
                                <span
                                    key={perm}
                                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                                >
                                    {perm.replace(/_/g, ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">🔒 ความปลอดภัย</h2>
                    <div className="space-y-4">
                        <button className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
                            🔑 เปลี่ยนรหัสผ่าน
                        </button>
                        <button className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left ml-0 md:ml-4">
                            📱 ตั้งค่าการยืนยันตัวตนสองชั้น
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
