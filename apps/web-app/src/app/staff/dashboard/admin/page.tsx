"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface StaffUser {
    username: string;
    email: string;
    role: string;
    department?: string;
    firstName?: string;
    lastName?: string;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("staff_user");
        if (!stored) {
            router.push("/staff/login");
            return;
        }
        setUser(JSON.parse(stored));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        router.push("/staff/login");
    };

    if (!user) return null;

    const stats = [
        { label: "คำขอทั้งหมด", value: "1,234", icon: "📋" },
        { label: "รอตรวจสอบ", value: "45", icon: "⏳" },
        { label: "อนุมัติแล้ว", value: "1,189", icon: "✅" },
        { label: "เจ้าหน้าที่", value: "12", icon: "👥" },
    ];

    const recentActivities = [
        { action: "อนุมัติคำขอ #12345", time: "5 นาทีที่แล้ว", user: "ผู้ตรวจสอบ A" },
        { action: "สร้างบัญชีเจ้าหน้าที่ใหม่", time: "1 ชั่วโมงที่แล้ว", user: "Admin" },
        { action: "ออกใบรับรอง GACP-2024-001234", time: "2 ชั่วโมงที่แล้ว", user: "ผู้ตรวจสอบ B" },
    ];

    const quickActions = [
        { icon: "👥", label: "จัดการเจ้าหน้าที่", href: "/staff/applications" },
        { icon: "📋", label: "ดูคำขอทั้งหมด", href: "/staff/applications" },
        { icon: "📊", label: "รายงานสถิติ", href: "/staff/analytics" },
        { icon: "📅", label: "ตารางนัดหมาย", href: "/staff/calendar" },
        { icon: "💰", label: "บัญชี/การเงิน", href: "/staff/accounting" },
        { icon: "⚙️", label: "ตั้งค่าระบบ", href: "/staff/dashboard" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-slate-900 to-primary-900 text-white font-sans">
            {/* Header */}
            <header className="px-8 py-4 border-b border-primary-500/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">🌿</span>
                    <div>
                        <h1 className="text-xl font-semibold m-0">GACP Admin Dashboard</h1>
                        <p className="text-xs text-slate-400 m-0">ระบบจัดการ GACP - ผู้ดูแลระบบ</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-primary-400">
                        👤 {user.firstName || user.username} ({user.role})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold m-0">
                        👋 สวัสดี, {user.firstName || user.username}!
                    </h2>
                    <p className="text-slate-400 mt-1">
                        ยินดีต้อนรับเข้าสู่ระบบจัดการ GACP สำหรับผู้ดูแลระบบ
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 text-center hover:bg-primary-500/15 transition-colors"
                        >
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-bold text-primary-400">{stat.value}</div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions & Activity */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Quick Actions Panel */}
                    <div className="col-span-2 bg-primary-500/10 border border-primary-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">🚀 การดำเนินการด่วน</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(action.href)}
                                    className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg text-white hover:bg-primary-500/20 hover:border-primary-400 transition-all cursor-pointer"
                                >
                                    <div className="text-2xl mb-2">{action.icon}</div>
                                    <div className="text-sm">{action.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">📜 กิจกรรมล่าสุด</h3>
                        <div className="flex flex-col gap-3">
                            {recentActivities.map((activity, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-black/20 rounded-lg"
                                >
                                    <div className="text-sm">{activity.action}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {activity.user} • {activity.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
