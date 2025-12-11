"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Design tokens - exact match to Mobile App
const colors = {
    primary: "#1B5E20",
    background: "#F5F7FA",
    card: "#FFFFFF",
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E0E0E0",
    heroStart: "#1E293B",
    heroEnd: "#0F172A",
};

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    communityName?: string;
    representativeName?: string;
    accountType?: string;
}

// Icons as SVG
const PlusCircleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8V16M8 12H16" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="2" />
        <path d="M9 12H15M9 16H13" />
    </svg>
);

const HomeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
        <path d="M3 9L12 2L21 9V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="M9 22V12H15V22" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const BellIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/login";
            return;
        }

        try {
            const parsed = JSON.parse(userData);
            if (!parsed || !parsed.accountType) throw new Error("Invalid");
            setUser(parsed);
        } catch {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.href = "/login";
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const getDisplayName = () => {
        if (!user) return "";
        if (user.accountType === "JURISTIC" && user.companyName) return user.companyName;
        if (user.accountType === "COMMUNITY_ENTERPRISE" && user.communityName) return user.communityName;
        return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.representativeName || "ผู้ใช้";
    };

    const quickActions = [
        { href: "/applications/new", title: "ขอใบรับรองใหม่", icon: <PlusCircleIcon />, color: "#E8F5E9" },
        { href: "/applications", title: "คำขอของฉัน", icon: <ClipboardIcon />, color: "#EFF6FF" },
        { href: "/establishments", title: "แปลงปลูก", icon: <HomeIcon />, color: "#FEF3C7" },
        { href: "/profile", title: "ตั้งค่าบัญชี", icon: <SettingsIcon />, color: "#F3F4F6" },
    ];

    if (!user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
                <div className="spinner"></div>
                <style jsx>{`.spinner { width: 32px; height: 32px; border: 3px solid ${colors.border}; border-top-color: ${colors.primary}; border-radius: 50%; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            {/* Hero Section - Navy Gradient like Mobile */}
            <div style={{
                background: `linear-gradient(135deg, ${colors.heroStart}, ${colors.heroEnd})`,
                borderRadius: "0 0 30px 30px",
                padding: "24px",
                color: "#FFFFFF"
            }}>
                <div style={{ maxWidth: "720px", margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                                สวัสดี, {getDisplayName()} 🙏
                            </h1>
                            <p style={{ opacity: 0.8, fontSize: "14px" }}>วันนี้อากาศเป็นใจแก่การเพาะปลูก</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}>
                                <BellIcon />
                            </button>
                            <Link href="/profile" style={{
                                width: "48px", height: "48px", borderRadius: "50%",
                                backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Weather Widget Placeholder */}
                    <div style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "16px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px"
                    }}>
                        <div style={{ fontSize: "40px" }}>☀️</div>
                        <div>
                            <div style={{ fontSize: "28px", fontWeight: 700 }}>32°C</div>
                            <div style={{ opacity: 0.8, fontSize: "13px" }}>อากาศแจ่มใส เหมาะแก่การดูแลแปลง</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
                {/* Quick Actions */}
                <div style={{ marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.textDark, marginBottom: "16px" }}>
                        เมนูด่วน (Pro Actions)
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                        {quickActions.map((action) => (
                            <Link key={action.href} href={action.href} style={{
                                backgroundColor: colors.card,
                                borderRadius: "16px",
                                padding: "20px",
                                textDecoration: "none",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}>
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "12px",
                                    backgroundColor: action.color, display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {action.icon}
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark }}>{action.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* My Farms Section */}
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.textDark }}>แปลงปลูกของฉัน (My Farms)</h2>
                        <Link href="/establishments" style={{ fontSize: "14px", color: colors.primary, textDecoration: "none", fontWeight: 500 }}>ดูทั้งหมด</Link>
                    </div>
                    <div style={{
                        backgroundColor: colors.card,
                        borderRadius: "16px",
                        padding: "40px",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
                    }}>
                        <div style={{
                            width: "64px", height: "64px", margin: "0 auto 16px",
                            borderRadius: "50%", backgroundColor: "#F3F4F6",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.textGray} strokeWidth="2">
                                <path d="M3 9L12 2L21 9V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                <path d="M9 22V12H15V22" />
                            </svg>
                        </div>
                        <p style={{ color: colors.textGray, marginBottom: "16px" }}>ยังไม่มีแปลงปลูก</p>
                        <Link href="/establishments/new" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "12px 24px", backgroundColor: colors.primary, color: "#FFFFFF",
                            borderRadius: "12px", fontSize: "14px", fontWeight: 600, textDecoration: "none"
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M12 5V19M5 12H19" /></svg>
                            เพิ่มแปลงปลูกใหม่
                        </Link>
                    </div>
                </div>

                {/* Logout Button */}
                <button onClick={handleLogout} style={{
                    width: "100%", padding: "14px", backgroundColor: "transparent",
                    border: `1px solid ${colors.border}`, borderRadius: "12px",
                    color: "#DC2626", fontSize: "15px", fontWeight: 600, cursor: "pointer"
                }}>
                    ออกจากระบบ
                </button>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                a:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important; }
            `}</style>
        </div>
    );
}
