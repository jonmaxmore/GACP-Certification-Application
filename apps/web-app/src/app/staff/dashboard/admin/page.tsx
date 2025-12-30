"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Color palette
const colors = {
    primary: "#15803d",
    secondary: "#22c55e",
    background: "linear-gradient(135deg, #1a2e1a 0%, #0a1a0a 50%, #1a2e1a 100%)",
    card: "rgba(21, 128, 61, 0.1)",
    text: "#ffffff",
    textMuted: "#a3a3a3",
};

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

    return (
        <div style={{
            minHeight: "100vh",
            background: colors.background,
            color: colors.text,
            fontFamily: "'Prompt', sans-serif",
        }}>
            {/* Header */}
            <header style={{
                padding: "1rem 2rem",
                borderBottom: "1px solid rgba(34, 197, 94, 0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>🌿</span>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>GACP Admin Dashboard</h1>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: colors.textMuted }}>
                            ระบบจัดการ GACP - ผู้ดูแลระบบ
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ color: colors.secondary }}>
                        👤 {user.firstName || user.username} ({user.role})
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "transparent",
                            border: "1px solid #ef4444",
                            color: "#ef4444",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: "2rem" }}>
                {/* Welcome */}
                <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                        👋 สวัสดี, {user.firstName || user.username}!
                    </h2>
                    <p style={{ color: colors.textMuted }}>
                        ยินดีต้อนรับเข้าสู่ระบบจัดการ GACP สำหรับผู้ดูแลระบบ
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{
                            background: colors.card,
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                            <div style={{ fontSize: "2rem", fontWeight: "bold", color: colors.secondary }}>
                                {stat.value}
                            </div>
                            <div style={{ color: colors.textMuted, fontSize: "0.875rem" }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "1.5rem",
                }}>
                    {/* Quick Actions Panel */}
                    <div style={{
                        background: colors.card,
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>🚀 การดำเนินการด่วน</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                            {[
                                { icon: "👥", label: "จัดการเจ้าหน้าที่", href: "/staff/applications" },
                                { icon: "📋", label: "ดูคำขอทั้งหมด", href: "/staff/applications" },
                                { icon: "📊", label: "รายงานสถิติ", href: "/staff/analytics" },
                                { icon: "📅", label: "ตารางนัดหมาย", href: "/staff/calendar" },
                                { icon: "💰", label: "บัญชี/การเงิน", href: "/staff/accounting" },
                                { icon: "⚙️", label: "ตั้งค่าระบบ", href: "/staff/dashboard" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(action.href)}
                                    style={{
                                        background: "rgba(34, 197, 94, 0.1)",
                                        border: "1px solid rgba(34, 197, 94, 0.3)",
                                        borderRadius: "8px",
                                        padding: "1rem",
                                        cursor: "pointer",
                                        color: colors.text,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{action.icon}</div>
                                    <div style={{ fontSize: "0.875rem" }}>{action.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{
                        background: colors.card,
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>📜 กิจกรรมล่าสุด</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {recentActivities.map((activity, i) => (
                                <div key={i} style={{
                                    padding: "0.75rem",
                                    background: "rgba(0,0,0,0.2)",
                                    borderRadius: "8px",
                                }}>
                                    <div style={{ fontSize: "0.875rem" }}>{activity.action}</div>
                                    <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>
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

