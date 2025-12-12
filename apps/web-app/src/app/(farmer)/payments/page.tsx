"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Theme System - matching Dashboard
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

// SVG Icons (monochrome)
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    bell: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    download: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    file: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
    receipt: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M4 2v20l3-2 4 2 4-2 4 2 1-2V2l-1 2-4-2-4 2-4-2-3 2z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="14" y2="12" /></svg>,
    check: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
};

interface PaymentRecord {
    id: string;
    type: "QUOTATION" | "INVOICE" | "RECEIPT";
    documentNumber: string;
    applicationId: string;
    amount: number;
    // Status varies by document type:
    // QUOTATION: PENDING_APPROVAL | APPROVED | REJECTED | CANCELLED
    // INVOICE: PENDING | DELIVERED | CANCELLED
    // RECEIPT: ISSUED | CANCELLED
    status: "PENDING_APPROVAL" | "APPROVED" | "PENDING" | "DELIVERED" | "ISSUED" | "REJECTED" | "CANCELLED";
    createdAt: string;
    paidAt?: string;
}

const MOCK_PAYMENTS: PaymentRecord[] = [
    { id: "1", type: "QUOTATION", documentNumber: "G-012400001", applicationId: "APP-001", amount: 30000, status: "APPROVED", createdAt: "2024-12-01" },
    { id: "2", type: "INVOICE", documentNumber: "GI-012400001", applicationId: "APP-001", amount: 5000, status: "DELIVERED", createdAt: "2024-12-01", paidAt: "2024-12-02" },
    { id: "3", type: "RECEIPT", documentNumber: "REC-24120001", applicationId: "APP-001", amount: 5000, status: "ISSUED", createdAt: "2024-12-02" },
];

const TYPE_CONFIG = {
    QUOTATION: { label: "ใบเสนอราคา", color: "#3B82F6" },
    INVOICE: { label: "ใบแจ้งหนี้", color: "#F59E0B" },
    RECEIPT: { label: "ใบเสร็จ", color: "#10B981" },
};

// Document status labels based on ERP best practices
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    // Quotation statuses
    PENDING_APPROVAL: { label: "รออนุมัติ", color: "#F59E0B" },
    APPROVED: { label: "อนุมัติแล้ว", color: "#10B981" },
    REJECTED: { label: "ไม่อนุมัติ", color: "#EF4444" },
    // Invoice statuses
    PENDING: { label: "รอชำระ", color: "#F59E0B" },
    DELIVERED: { label: "วางบิลแล้ว", color: "#10B981" },
    // Receipt statuses
    ISSUED: { label: "ออกแล้ว", color: "#10B981" },
    // Common
    CANCELLED: { label: "ยกเลิก", color: "#EF4444" },
};

export default function PaymentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [viewDoc, setViewDoc] = useState<PaymentRecord | null>(null);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");

        // Note: auth_token is now httpOnly cookie (not accessible via JS)
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        try {
            setUser(JSON.parse(userData));
            setPayments(MOCK_PAYMENTS);
        } catch { window.location.href = "/login"; }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const getDisplayName = () => user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "ผู้ใช้" : "";

    // Filter logic
    const filteredPayments = payments.filter(p => {
        if (filter === "ALL") return true;
        if (filter === "PENDING") return p.type === "INVOICE" && p.status === "PENDING";
        if (filter === "PAID") return p.type === "RECEIPT";
        return true;
    });

    // Counts for filter tabs
    const counts = {
        ALL: payments.length,
        PENDING: payments.filter(p => p.type === "INVOICE" && p.status === "PENDING").length,
        PAID: payments.filter(p => p.type === "RECEIPT").length,
    };

    // Summary calculations
    const totalReceipts = payments.filter(p => p.type === "RECEIPT").reduce((sum, p) => sum + p.amount, 0);
    const pendingInvoices = payments.filter(p => p.type === "INVOICE" && p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);
    const receiptCount = payments.filter(p => p.type === "RECEIPT").length;

    const formatAmount = (n: number) => new Intl.NumberFormat('th-TH').format(n);

    if (!user || !mounted) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}>
                <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} />
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน", active: true },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>

            {/* Sidebar */}
            <aside className="sidebar" style={{
                position: "fixed", left: 0, top: 0, bottom: 0, width: "72px",
                backgroundColor: t.surface, borderRight: `1px solid ${t.border}`,
                display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0",
            }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                            padding: "12px 0", textDecoration: "none", position: "relative",
                        }}>
                            {item.active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "28px", backgroundColor: t.accent, borderRadius: "0 3px 3px 0" }} />}
                            {item.icon(item.active ? t.accent : t.textMuted)}
                            <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}
                    </button>
                    <button onClick={handleLogout} style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {Icons.logout(t.textMuted)}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>
                        {item.icon(item.active ? t.accent : t.textMuted)}
                        <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1400px" }}>

                {/* Header */}
                <header style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>ประวัติการชำระเงิน</h1>
                    <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ใบเสนอราคา, ใบแจ้งหนี้, และใบเสร็จรับเงิน</p>
                </header>

                {/* Summary Cards */}
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
                    {[
                        { icon: Icons.check, label: "ยอดรับเข้าทั้งหมด", value: `${formatAmount(totalReceipts)} ฿`, color: t.accent },
                        { icon: Icons.creditCard, label: "รอชำระ", value: `${formatAmount(pendingInvoices)} ฿`, color: "#F59E0B" },
                        { icon: Icons.receipt, label: "จำนวนใบเสร็จ", value: receiptCount, color: "#3B82F6" },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{
                            backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "16px",
                            padding: "20px", transition: "all 0.2s",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <span style={{ fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>{stat.label}</span>
                                {stat.icon(t.textMuted)}
                            </div>
                            <div style={{ fontSize: "28px", fontWeight: 600, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    {[
                        { key: "ALL", label: "ทั้งหมด" },
                        { key: "PENDING", label: "รอชำระ" },
                        { key: "PAID", label: "ชำระแล้ว" },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => setFilter(tab.key as "ALL" | "PENDING" | "PAID")} style={{
                            padding: "10px 20px", borderRadius: "100px",
                            border: filter === tab.key ? "none" : `1px solid ${t.border}`,
                            backgroundColor: filter === tab.key ? t.accent : "transparent",
                            color: filter === tab.key ? "#FFF" : t.textSecondary,
                            fontSize: "13px", fontWeight: 500, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "8px",
                        }}>
                            {tab.label}
                            <span style={{
                                padding: "2px 8px", borderRadius: "100px", fontSize: "11px",
                                backgroundColor: filter === tab.key ? "rgba(255,255,255,0.2)" : t.accentBg,
                                color: filter === tab.key ? "#FFF" : t.accent,
                            }}>
                                {counts[tab.key as keyof typeof counts]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Payment List */}
                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                                <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>เอกสาร</th>
                                <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>ประเภท</th>
                                <th style={{ padding: "16px 20px", textAlign: "right", fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>จำนวนเงิน</th>
                                <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>สถานะ</th>
                                <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length > 0 ? filteredPayments.map((p) => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: `${TYPE_CONFIG[p.type].color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {Icons.file(TYPE_CONFIG[p.type].color)}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{p.documentNumber}</p>
                                                <p style={{ fontSize: "12px", color: t.textMuted, margin: "2px 0 0" }}>{p.createdAt}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "12px", backgroundColor: `${TYPE_CONFIG[p.type].color}15`, color: TYPE_CONFIG[p.type].color, fontWeight: 500 }}>
                                            {TYPE_CONFIG[p.type].label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "right", fontSize: "15px", fontWeight: 600 }}>{formatAmount(p.amount)} ฿</td>
                                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                        <span style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "12px", backgroundColor: `${STATUS_LABELS[p.status]?.color || t.textMuted}15`, color: STATUS_LABELS[p.status]?.color || t.textMuted, fontWeight: 500 }}>
                                            {STATUS_LABELS[p.status]?.label || p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                            <button onClick={() => setViewDoc(p)} style={{
                                                padding: "8px 16px", borderRadius: "10px", border: `1px solid ${t.accent}`,
                                                backgroundColor: t.accentBg, color: t.accent, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                            }}>
                                                👁️ ดู
                                            </button>
                                            <button style={{
                                                padding: "8px 16px", borderRadius: "10px", border: `1px solid ${t.border}`,
                                                backgroundColor: "transparent", color: t.textSecondary, fontSize: "12px", fontWeight: 500, cursor: "pointer",
                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                            }}>
                                                {Icons.download(t.textMuted)}
                                                PDF
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: t.textMuted }}>
                                        {Icons.file(t.border)}
                                        <p style={{ marginTop: "12px", fontSize: "14px" }}>ไม่พบรายการ</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Document Preview Modal */}
            {viewDoc && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
                }}>
                    <div style={{
                        width: "100%", maxWidth: "800px", maxHeight: "90vh", overflow: "auto",
                        backgroundColor: "white", borderRadius: "16px", position: "relative",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            position: "sticky", top: 0, background: "white", padding: "16px 20px",
                            borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                                {TYPE_CONFIG[viewDoc.type].label} - {viewDoc.documentNumber}
                            </h3>
                            <button onClick={() => setViewDoc(null)} style={{
                                padding: "8px 16px", borderRadius: "8px", border: "none",
                                background: "#EF4444", color: "white", fontSize: "13px", cursor: "pointer",
                            }}>✕ ปิด</button>
                        </div>

                        {/* A4 Document Preview */}
                        <div style={{ padding: "20px", background: "#F3F4F6" }}>
                            <div style={{
                                width: "100%", aspectRatio: "210/297", background: "white",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "30px",
                                fontFamily: "'Kanit', sans-serif", fontSize: "10px", lineHeight: 1.4,
                            }}>
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "12px" }}>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <img src="/images/dtam-logo.png" alt="DTAM" style={{ width: "45px", height: "45px" }} />
                                        <div>
                                            <div style={{ fontSize: "12px", fontWeight: 700 }}>กองกัญชาทางการแพทย์</div>
                                            <div style={{ fontSize: "10px", fontWeight: 600 }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                                            <div style={{ fontSize: "8px", color: "#374151" }}>88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</div>
                                            <div style={{ fontSize: "8px", color: "#374151" }}>โทรศัพท์ (02) 5647889 อีเมล tdc.cannabis.gacp@gmail.com</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ background: TYPE_CONFIG[viewDoc.type].color, color: "#fff", padding: "3px 10px", fontSize: "10px", fontWeight: 600 }}>
                                            {TYPE_CONFIG[viewDoc.type].label}
                                        </div>
                                        <div style={{ fontSize: "9px", marginTop: "4px" }}>เลขที่: {viewDoc.documentNumber}</div>
                                        <div style={{ fontSize: "8px", color: "#6B7280" }}>วันที่: {viewDoc.createdAt}</div>
                                    </div>
                                </div>

                                {/* Recipient Info */}
                                <table style={{ width: "100%", fontSize: "9px", marginBottom: "10px" }}>
                                    <tbody>
                                        <tr><td style={{ width: "22%" }}><strong>เรียน</strong></td><td>ประธานกรรมการ (จากระบบ)</td></tr>
                                        <tr><td><strong>หน่วยงานผู้รับบริการ:</strong></td><td>(จากระบบ)</td><td style={{ textAlign: "right" }}><strong>เลขที่เอกสาร:</strong> {viewDoc.documentNumber}</td></tr>
                                        <tr><td><strong>เลขประจำตัวผู้เสียภาษี:</strong></td><td>-</td><td style={{ textAlign: "right" }}><strong>คำขอ:</strong> {viewDoc.applicationId}</td></tr>
                                    </tbody>
                                </table>

                                {/* Fee Table - 6 columns like step-9/10 */}
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px", marginBottom: "12px" }}>
                                    <thead>
                                        <tr style={{ background: "#374151", color: "white" }}>
                                            <th style={{ border: "1px solid #374151", padding: "6px", width: "8%" }}>ลำดับที่</th>
                                            <th style={{ border: "1px solid #374151", padding: "6px" }}>รายการ</th>
                                            <th style={{ border: "1px solid #374151", padding: "6px", width: "10%" }}>จำนวน</th>
                                            <th style={{ border: "1px solid #374151", padding: "6px", width: "10%" }}>หน่วย</th>
                                            <th style={{ border: "1px solid #374151", padding: "6px", width: "12%" }}>ราคา/หน่วย</th>
                                            <th style={{ border: "1px solid #374151", padding: "6px", width: "12%" }}>จำนวนเงิน</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewDoc.type === "QUOTATION" ? (
                                            <>
                                                <tr>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>1.</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px" }}>ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>1</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>ต่อคำขอ</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>5,000.00</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>5,000.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>2.</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px" }}>ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>1</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>ต่อคำขอ</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>25,000.00</td>
                                                    <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>25,000.00</td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>1.</td>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px" }}>
                                                    {viewDoc.type === "INVOICE" ? "ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น" : "ค่าบริการตามใบแจ้งหนี้"}
                                                </td>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>1</td>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "center" }}>ต่อคำขอ</td>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>{formatAmount(viewDoc.amount)}.00</td>
                                                <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right" }}>{formatAmount(viewDoc.amount)}.00</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: viewDoc.type === "QUOTATION" ? "#FEF3C7" : viewDoc.type === "INVOICE" ? "#DBEAFE" : "#ECFDF5" }}>
                                            <td colSpan={5} style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right", fontWeight: 600 }}>
                                                {viewDoc.type === "INVOICE" ? "ยอดชำระงวดที่ 1" : "จำนวนเงินทั้งสิ้น"}
                                            </td>
                                            <td style={{ border: "1px solid #E5E7EB", padding: "6px", textAlign: "right", fontWeight: 700, fontSize: "11px" }}>
                                                {formatAmount(viewDoc.amount)}.00
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* หมายเหตุ for Invoice */}
                                {viewDoc.type === "INVOICE" && (
                                    <div style={{ fontSize: "8px", padding: "8px", background: "#FEF3C7", borderRadius: "4px", marginBottom: "12px" }}>
                                        <strong>หมายเหตุ:</strong> กรุณาชำระเงินภายใน 3 วัน<br />
                                        โอนเข้าบัญชี: เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร ธ.กรุงไทย 4750134376
                                    </div>
                                )}

                                {/* Signature Section */}
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                                    <div style={{ width: "30%", textAlign: "center" }}>
                                        <div style={{ fontWeight: 600, marginBottom: "5px", fontSize: "9px" }}>ผู้รับบริการ</div>
                                        <div style={{ height: "35px", borderBottom: "1px solid #000", marginBottom: "3px" }}></div>
                                        <div style={{ fontSize: "8px" }}>(.................................)</div>
                                        <div style={{ fontSize: "7px", color: "#6B7280" }}>วันที่......./......./.......</div>
                                    </div>
                                    <div style={{ width: "30%", textAlign: "center" }}>
                                        <div style={{ fontWeight: 600, marginBottom: "5px", fontSize: "9px" }}>ผู้ให้บริการ</div>
                                        <div style={{ height: "35px", borderBottom: "1px solid #000", marginBottom: "3px" }}></div>
                                        <div style={{ fontSize: "8px" }}>(.................................)</div>
                                        <div style={{ fontSize: "7px", color: "#6B7280" }}>กองกัญชาทางการแพทย์</div>
                                    </div>
                                    <div style={{ width: "30%", textAlign: "center" }}>
                                        <div style={{ fontWeight: 600, marginBottom: "5px", fontSize: "9px" }}>ผู้มีอำนาจลงนาม</div>
                                        <div style={{ height: "35px", borderBottom: "1px solid #000", marginBottom: "3px" }}></div>
                                        <div style={{ fontSize: "8px" }}>(นายปริชา พนูทิม)</div>
                                        <div style={{ fontSize: "7px", color: "#6B7280" }}>ผู้อำนวยการกองกัญชาทางการแพทย์</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: "16px 20px", borderTop: "1px solid #E5E7EB",
                            display: "flex", gap: "12px", justifyContent: "flex-end",
                        }}>
                            <button onClick={() => window.print()} style={{
                                padding: "10px 20px", borderRadius: "8px", border: "1px solid #10B981",
                                background: "#10B981", color: "white", fontSize: "13px", cursor: "pointer",
                            }}>📥 ดาวน์โหลด PDF</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
                @media (max-width: 1024px) { .sidebar { display: none !important; } .mobile-nav { display: flex !important; } .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; } }
                @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr !important; } table { font-size: 13px; } }
            `}</style>
        </div>
    );
}
