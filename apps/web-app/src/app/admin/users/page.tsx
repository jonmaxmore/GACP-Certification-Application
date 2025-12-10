"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StaffUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
}

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
    const [newRole, setNewRole] = useState("DTAM_REVIEWER");
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
            if (!["DTAM_ADMIN", "SUPER_ADMIN"].includes(parsedUser.role)) {
                router.push("/staff/dashboard");
                return;
            }
            setCurrentUser(parsedUser);
        } catch {
            router.push("/staff/login");
        }

        // Mock users data
        setUsers([
            { id: "1", email: "reviewer1@dtam.go.th", firstName: "สมชาย", lastName: "รักงาน", role: "DTAM_REVIEWER", status: "ACTIVE", createdAt: "2024-01-15" },
            { id: "2", email: "inspector1@dtam.go.th", firstName: "สมหญิง", lastName: "ใจเย็น", role: "DTAM_INSPECTOR", status: "ACTIVE", createdAt: "2024-02-20" },
            { id: "3", email: "admin@dtam.go.th", firstName: "ผู้ดูแล", lastName: "ระบบ", role: "DTAM_ADMIN", status: "ACTIVE", createdAt: "2024-01-01" },
        ]);
    }, [router]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // TODO: Call API to create staff user
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/v2/admin/users`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("staff_token")}`,
                    },
                    body: JSON.stringify({
                        email: newEmail,
                        firstName: newFirstName,
                        lastName: newLastName,
                        role: newRole,
                        password: newPassword,
                        accountType: "STAFF",
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "สร้างบัญชีไม่สำเร็จ");
            }

            // Add to list (in real app, would refetch)
            setUsers([
                ...users,
                {
                    id: Date.now().toString(),
                    email: newEmail,
                    firstName: newFirstName,
                    lastName: newLastName,
                    role: newRole,
                    status: "ACTIVE",
                    createdAt: new Date().toISOString().split("T")[0],
                },
            ]);

            // Reset form
            setNewEmail("");
            setNewFirstName("");
            setNewLastName("");
            setNewRole("DTAM_REVIEWER");
            setNewPassword("");
            setShowCreateModal(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "DTAM_REVIEWER":
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">ผู้ตรวจสอบเอกสาร</span>;
            case "DTAM_INSPECTOR":
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">ผู้ตรวจสอบพื้นที่</span>;
            case "DTAM_ADMIN":
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">ผู้ดูแลระบบ</span>;
            case "SUPER_ADMIN":
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">ผู้ดูแลสูงสุด</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>;
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">
                            ← กลับ
                        </Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👥</span>
                            <div>
                                <h1 className="font-bold">จัดการบัญชีเจ้าหน้าที่</h1>
                                <p className="text-xs text-slate-400">Admin Panel</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm flex items-center gap-2"
                    >
                        <span>➕</span>
                        สร้างบัญชีใหม่
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow">
                        <p className="text-2xl font-bold">{users.length}</p>
                        <p className="text-sm text-slate-500">เจ้าหน้าที่ทั้งหมด</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow">
                        <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === "DTAM_REVIEWER").length}</p>
                        <p className="text-sm text-slate-500">ผู้ตรวจสอบเอกสาร</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow">
                        <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "DTAM_INSPECTOR").length}</p>
                        <p className="text-sm text-slate-500">ผู้ตรวจสอบพื้นที่</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow">
                        <p className="text-2xl font-bold text-amber-600">{users.filter(u => u.role === "DTAM_ADMIN").length}</p>
                        <p className="text-sm text-slate-500">ผู้ดูแลระบบ</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">ชื่อ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">อีเมล</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">ตำแหน่ง</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">สร้างเมื่อ</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg">
                                                👤
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-slate-600">
                                            ⚙️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">สร้างบัญชีเจ้าหน้าที่ใหม่</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    ⚠️ {error}
                                </div>
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
                                    <option value="DTAM_REVIEWER">ผู้ตรวจสอบเอกสาร</option>
                                    <option value="DTAM_INSPECTOR">ผู้ตรวจสอบพื้นที่</option>
                                    <option value="DTAM_ADMIN">ผู้ดูแลระบบ</option>
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
