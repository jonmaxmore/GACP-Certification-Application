"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

interface StaffUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
}

const STAFF_ROLES = [
    { value: "REVIEWER_AUDITOR", label: "ผู้ตรวจเอกสาร/ตรวจประเมิน", icon: "", color: "blue" },
    { value: "SCHEDULER", label: "เจ้าหน้าที่จัดคิว", icon: "", color: "purple" },
    { value: "ADMIN", label: "ผู้ดูแลระบบ", icon: "", color: "amber" },
];

export default function AdminUsersPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // New user form
    const [newEmail, setNewEmail] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newRole, setNewRole] = useState("REVIEWER_AUDITOR");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            const role = parsedUser.role?.toUpperCase() || '';
            if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
                router.push("/staff/dashboard");
                return;
            }
            setCurrentUser(parsedUser);
        } catch {
            router.push("/staff/login");
            return;
        }

        // Fetch real staff list from API
        const fetchStaff = async () => {
            try {
                const res = await fetch('/api/staff', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setUsers(result.data.map((s: { id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean; createdAt: string }) => ({
                            id: s.id,
                            email: s.email || '',
                            firstName: s.firstName || '',
                            lastName: s.lastName || '',
                            role: s.role?.toUpperCase() || 'REVIEWER_AUDITOR',
                            status: s.isActive ? 'ACTIVE' : 'INACTIVE',
                            createdAt: s.createdAt?.split('T')[0] || ''
                        })));
                    }
                }
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        };
        fetchStaff();
    }, [router]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("staff_token");
            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: newEmail.split('@')[0], // Use email prefix as username
                    email: newEmail,
                    firstName: newFirstName,
                    lastName: newLastName,
                    role: newRole.toLowerCase(),
                    password: newPassword
                })
            });

            const result = await res.json();

            if (!result.success) {
                setError(result.error || 'ไม่สามารถสร้างบัญชีได้');
                setIsLoading(false);
                return;
            }

            // Add created user to list
            if (result.data) {
                setUsers([
                    {
                        id: result.data.id,
                        email: result.data.email,
                        firstName: result.data.firstName,
                        lastName: result.data.lastName,
                        role: result.data.role?.toUpperCase() || newRole,
                        status: "ACTIVE",
                        createdAt: new Date().toISOString().split("T")[0],
                    },
                    ...users,
                ]);
            }

            // Reset form
            setNewEmail("");
            setNewFirstName("");
            setNewLastName("");
            setNewRole("REVIEWER_AUDITOR");
            setNewPassword("");
            setShowCreateModal(false);
            alert("สร้างบัญชีสำเร็จ!");
        } catch (error) {
            console.error('Create user error:', error);
            setError('เกิดข้อผิดพลาดในการสร้างบัญชี');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const roleInfo = STAFF_ROLES.find(r => r.value === role);
        if (!roleInfo) return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>;

        const colors: Record<string, string> = {
            blue: "bg-blue-100 text-blue-700",
            purple: "bg-purple-100 text-purple-700",
            amber: "bg-amber-100 text-amber-700",
        };
        return (
            <span className={`px-2 py-1 ${colors[roleInfo.color]} rounded-full text-xs`}>
                {roleInfo.icon} {roleInfo.label}
            </span>
        );
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการบัญชีเจ้าหน้าที่ (Staff Management)</h1>
                    <p className="text-sm text-slate-500">จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2"
                >
                    + สร้างบัญชีใหม่
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                    <p className="text-sm text-slate-500">เจ้าหน้าที่ทั้งหมด</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "REVIEWER_AUDITOR").length}</p>
                    <p className="text-sm text-slate-500">ผู้ตรวจเอกสาร/ประเมิน</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "SCHEDULER").length}</p>
                    <p className="text-sm text-slate-500">เจ้าหน้าที่จัดคิว</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-2xl font-bold text-amber-600">{users.filter(u => u.role === "ADMIN").length}</p>
                    <p className="text-sm text-slate-500">ผู้ดูแลระบบ</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">ชื่อ</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">อีเมล</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">ตำแหน่ง</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">สร้างเมื่อ</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
                                        </div>
                                        <p className="font-medium text-slate-700">{user.firstName} {user.lastName}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt}</td>
                                <td className="px-6 py-4">
                                    <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">สร้างบัญชีเจ้าหน้าที่ใหม่</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">ชื่อ</label>
                                    <input
                                        type="text"
                                        value={newFirstName}
                                        onChange={(e) => setNewFirstName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">นามสกุล</label>
                                    <input
                                        type="text"
                                        value={newLastName}
                                        onChange={(e) => setNewLastName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-600 mb-1">อีเมล</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="officer@dtam.go.th"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-600 mb-1">ตำแหน่ง</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                >
                                    {STAFF_ROLES.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.icon} {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-600 mb-1">รหัสผ่านเริ่มต้น</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {isLoading ? "กำลังสร้าง..." : "สร้างบัญชี"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

