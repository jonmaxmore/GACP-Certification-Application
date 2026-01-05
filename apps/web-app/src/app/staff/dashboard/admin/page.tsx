"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IconDocument, IconChart, IconCalendar, IconCreditCard, IconUser, IconCheckCircle, IconClock } from "@/components/ui/icons";

// Additional icons
const IconUsers = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconSettings = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const IconLeaf = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l2.3 2.3a2.4 2.4 0 0 0 3.4-3.4L15.4 14.6l6-6c4.5-4.5.5-8.5-4-4l-6.3 6.3-2.4-2.4a2.4 2.4 0 0 0-3.4 3.4L7.7 14.3l-4 4a2.4 2.4 0 0 0 0 3.4l2.6-1.4z" />
    </svg>
);

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
        { label: "คำขอทั้งหมด", value: "1,234", Icon: IconDocument, bgColor: "bg-emerald-500" },
        { label: "รอตรวจสอบ", value: "45", Icon: IconClock, bgColor: "bg-amber-500" },
        { label: "อนุมัติแล้ว", value: "1,189", Icon: IconCheckCircle, bgColor: "bg-emerald-500" },
        { label: "เจ้าหน้าที่", value: "12", Icon: IconUsers, bgColor: "bg-blue-500" },
    ];

    const recentActivities = [
        { action: "อนุมัติคำขอ #12345", time: "5 นาทีที่แล้ว", user: "ผู้ตรวจสอบ A" },
        { action: "สร้างบัญชีเจ้าหน้าที่ใหม่", time: "1 ชั่วโมงที่แล้ว", user: "Admin" },
        { action: "ออกใบรับรอง GACP-2024-001234", time: "2 ชั่วโมงที่แล้ว", user: "ผู้ตรวจสอบ B" },
    ];

    const quickActions = [
        { Icon: IconUsers, label: "จัดการเจ้าหน้าที่", href: "/staff/applications", color: "bg-slate-600" },
        { Icon: IconDocument, label: "ดูคำขอทั้งหมด", href: "/staff/applications", color: "bg-blue-500" },
        { Icon: IconChart, label: "รายงานสถิติ", href: "/staff/analytics", color: "bg-violet-500" },
        { Icon: IconCalendar, label: "ตารางนัดหมาย", href: "/staff/calendar", color: "bg-emerald-500" },
        { Icon: IconCreditCard, label: "บัญชี/การเงิน", href: "/staff/accounting", color: "bg-amber-500" },
        { Icon: IconSettings, label: "ตั้งค่าระบบ", href: "/staff/dashboard", color: "bg-red-500" },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Header */}
            <header className="px-8 py-4 border-b border-emerald-500/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <IconLeaf size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold m-0">GACP Admin Dashboard</h1>
                        <p className="text-xs text-slate-400 m-0">ระบบจัดการ GACP - ผู้ดูแลระบบ</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-emerald-400">
                        <IconUser size={18} /> {user.firstName || user.username} ({user.role})
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
                        สวัสดี, {user.firstName || user.username}!
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
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center hover:bg-emerald-500/15 transition-colors"
                        >
                            <div className={`w-12 h-12 mx-auto rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                                <stat.Icon size={24} className="text-white" />
                            </div>
                            <div className="text-3xl font-bold text-emerald-400">{stat.value}</div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions & Activity */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Quick Actions Panel */}
                    <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">การดำเนินการด่วน</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    href={action.href}
                                    className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-white hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                                        <action.Icon size={20} className="text-white" />
                                    </div>
                                    <div className="text-sm">{action.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">กิจกรรมล่าสุด</h3>
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
