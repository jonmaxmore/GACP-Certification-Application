'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 🍎 Staff Management Page
 * จัดการพนักงานในระบบ GACP
 */

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'REVIEWER_AUDITOR' | 'SCHEDULER' | 'ACCOUNTANT' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
    REVIEWER_AUDITOR: 'ผู้ตรวจสอบ',
    SCHEDULER: 'ผู้จัดตารางนัด',
    ACCOUNTANT: 'บัญชี',
    ADMIN: 'ผู้ดูแลระบบ',
};

const ROLE_COLORS: Record<string, string> = {
    REVIEWER_AUDITOR: 'bg-blue-100 text-blue-800',
    SCHEDULER: 'bg-purple-100 text-purple-800',
    ACCOUNTANT: 'bg-green-100 text-green-800',
    ADMIN: 'bg-red-100 text-red-800',
};

export default function StaffManagementPage() {
    const router = useRouter();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('ALL');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            // Mock data for now
            const mockStaff: StaffMember[] = [
                {
                    id: '1',
                    name: 'สมชาย ผู้ตรวจสอบ',
                    email: 'reviewer@gacp.go.th',
                    role: 'REVIEWER_AUDITOR',
                    status: 'ACTIVE',
                    createdAt: '2024-01-15',
                },
                {
                    id: '2',
                    name: 'สมหญิง จัดตาราง',
                    email: 'scheduler@gacp.go.th',
                    role: 'SCHEDULER',
                    status: 'ACTIVE',
                    createdAt: '2024-02-20',
                },
                {
                    id: '3',
                    name: 'สมศักดิ์ บัญชี',
                    email: 'accountant@gacp.go.th',
                    role: 'ACCOUNTANT',
                    status: 'ACTIVE',
                    createdAt: '2024-03-10',
                },
            ];
            setStaff(mockStaff);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-emerald-600 hover:text-emerald-800 mb-4 flex items-center gap-2"
                    >
                        ← กลับ
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        👥 จัดการพนักงาน
                    </h1>
                    <p className="text-gray-600 mt-2">
                        จัดการบัญชีพนักงานในระบบ GACP
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรืออีเมล..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="ALL">ทุกตำแหน่ง</option>
                            <option value="REVIEWER_AUDITOR">ผู้ตรวจสอบ</option>
                            <option value="SCHEDULER">ผู้จัดตารางนัด</option>
                            <option value="ACCOUNTANT">บัญชี</option>
                            <option value="ADMIN">ผู้ดูแลระบบ</option>
                        </select>
                        <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                            + เพิ่มพนักงาน
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{staff.length}</p>
                        <p className="text-gray-600">พนักงานทั้งหมด</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {staff.filter((s) => s.role === 'REVIEWER_AUDITOR').length}
                        </p>
                        <p className="text-gray-600">ผู้ตรวจสอบ</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">
                            {staff.filter((s) => s.role === 'SCHEDULER').length}
                        </p>
                        <p className="text-gray-600">ผู้จัดตาราง</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {staff.filter((s) => s.role === 'ACCOUNTANT').length}
                        </p>
                        <p className="text-gray-600">บัญชี</p>
                    </div>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-emerald-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ชื่อ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">อีเมล</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ตำแหน่ง</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">วันที่สร้าง</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStaff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <span className="text-emerald-600 font-semibold">
                                                    {member.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-800">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                                            {ROLE_LABELS[member.role]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{member.createdAt}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 mx-2">แก้ไข</button>
                                        <button className="text-red-600 hover:text-red-800 mx-2">ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredStaff.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            ไม่พบข้อมูลพนักงาน
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
