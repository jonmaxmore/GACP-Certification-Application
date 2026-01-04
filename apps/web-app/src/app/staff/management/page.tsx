'use client';

import React, { useState, useEffect } from 'react';
import StaffLayout from '../components/StaffLayout';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'REVIEWER_AUDITOR' | 'SCHEDULER' | 'ACCOUNTANT' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
    REVIEWER_AUDITOR: 'ผู้ตรวจสอบ', SCHEDULER: 'ผู้จัดตารางนัด', ACCOUNTANT: 'บัญชี', ADMIN: 'ผู้ดูแลระบบ'
};
const ROLE_COLORS: Record<string, string> = {
    REVIEWER_AUDITOR: 'bg-blue-100 text-blue-700', SCHEDULER: 'bg-violet-100 text-violet-700', ACCOUNTANT: 'bg-primary-100 text-primary-700', ADMIN: 'bg-red-100 text-red-700'
};

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const mockStaff: StaffMember[] = [
                { id: '1', name: 'สมชาย ผู้ตรวจสอบ', email: 'reviewer@gacp.go.th', role: 'REVIEWER_AUDITOR', status: 'ACTIVE', createdAt: '2024-01-15' },
                { id: '2', name: 'สมหญิง จัดตาราง', email: 'scheduler@gacp.go.th', role: 'SCHEDULER', status: 'ACTIVE', createdAt: '2024-02-20' },
                { id: '3', name: 'สมศักดิ์ บัญชี', email: 'accountant@gacp.go.th', role: 'ACCOUNTANT', status: 'ACTIVE', createdAt: '2024-03-10' },
            ];
            setStaff(mockStaff);
        } catch { console.error('Failed to fetch staff'); }
        finally { setLoading(false); }
    };

    const filteredStaff = staff.filter(m => (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase())) && (filterRole === 'ALL' || m.role === filterRole));

    if (loading) {
        return <StaffLayout title="👥 จัดการพนักงาน"><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div></StaffLayout>;
    }

    return (
        <StaffLayout title="👥 จัดการพนักงาน" subtitle="จัดการบัญชีพนักงานในระบบ GACP">
            {/* Filters */}
            <div className={`rounded-2xl shadow-card p-4 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="flex flex-wrap gap-4">
                    <input type="text" placeholder="ค้นหาชื่อหรืออีเมล..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`flex-1 min-w-[200px] px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'} focus:ring-2 focus:ring-primary-500`} />
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'} focus:ring-2 focus:ring-primary-500`}>
                        <option value="ALL">ทุกตำแหน่ง</option>
                        <option value="REVIEWER_AUDITOR">ผู้ตรวจสอบ</option>
                        <option value="SCHEDULER">ผู้จัดตารางนัด</option>
                        <option value="ACCOUNTANT">บัญชี</option>
                        <option value="ADMIN">ผู้ดูแลระบบ</option>
                    </select>
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">+ เพิ่มพนักงาน</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "พนักงานทั้งหมด", value: staff.length, color: "primary" },
                    { label: "ผู้ตรวจสอบ", value: staff.filter(s => s.role === 'REVIEWER_AUDITOR').length, color: "blue" },
                    { label: "ผู้จัดตาราง", value: staff.filter(s => s.role === 'SCHEDULER').length, color: "violet" },
                    { label: "บัญชี", value: staff.filter(s => s.role === 'ACCOUNTANT').length, color: "green" },
                ].map((stat, i) => (
                    <div key={i} className={`rounded-2xl shadow-card p-4 text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <p className={`text-3xl font-bold ${stat.color === 'primary' ? 'text-primary-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'violet' ? 'text-violet-600' : 'text-primary-600'}`}>{stat.value}</p>
                        <p className="text-slate-500 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-primary-50'}>
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ชื่อ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">อีเมล</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">ตำแหน่ง</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">สถานะ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">วันที่สร้าง</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-surface-200'}`}>
                            {filteredStaff.map(member => (
                                <tr key={member.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-surface-50'} transition-colors`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                                                <span className="text-primary-600 font-semibold">{member.name.charAt(0)}</span>
                                            </div>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{member.email}</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>{ROLE_LABELS[member.role]}</span></td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>{member.status === 'ACTIVE' ? 'ใช้งาน' : 'ปิดใช้งาน'}</span></td>
                                    <td className="px-6 py-4 text-slate-500">{member.createdAt}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 mx-2 text-sm">แก้ไข</button>
                                        <button className="text-red-600 hover:text-red-800 mx-2 text-sm">ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredStaff.length === 0 && <div className="p-8 text-center text-slate-500">ไม่พบข้อมูลพนักงาน</div>}
            </div>
        </StaffLayout>
    );
}
