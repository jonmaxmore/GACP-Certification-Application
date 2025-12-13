"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/apiClient";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
        success: "#10B981", successBg: "rgba(16, 185, 129, 0.1)",
        warning: "#F59E0B", warningBg: "rgba(245, 158, 11, 0.1)",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
        success: "#10B981", successBg: "rgba(16, 185, 129, 0.15)",
        warning: "#F59E0B", warningBg: "rgba(245, 158, 11, 0.15)",
    }
};

// Icons
const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    award: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>,
    download: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    eye: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    qr: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" /></svg>,
    check: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
};

interface Certificate {
    _id: string;
    certificateNumber: string;
    applicationId: string;
    siteName: string;
    plantType: string;
    issuedDate: string;
    expiryDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    qrCode?: string;
}

// Mock data for demo (will be replaced with API call)
const MOCK_CERTIFICATES: Certificate[] = [
    {
        _id: "cert_1",
        certificateNumber: "GACP-2567-001234",
        applicationId: "app_12345",
        siteName: "ฟาร์มกัญชาสุขใจ",
        plantType: "กัญชา (Cannabis)",
        issuedDate: "2024-06-15",
        expiryDate: "2025-06-14",
        status: "ACTIVE"
    },
    {
        _id: "cert_2",
        certificateNumber: "GACP-2566-000567",
        applicationId: "app_67890",
        siteName: "วิสาหกิจชุมชนกระท่อมบ้านไร่",
        plantType: "กระท่อม (Kratom)",
        issuedDate: "2023-09-20",
        expiryDate: "2024-09-19",
        status: "EXPIRED"
    }
];

export default function CertificatesPage() {
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [viewCert, setViewCert] = useState<Certificate | null>(null);
    const [showQR, setShowQR] = useState<Certificate | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Certificate[] }>("/v2/certificates/my");
            if (result.success && result.data?.data) {
                setCertificates(result.data.data);
            } else {
                // Fallback to mock data for demo
                setCertificates(MOCK_CERTIFICATES);
            }
        } catch {
            setCertificates(MOCK_CERTIFICATES);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    const getDaysRemaining = (expiryDate: string) => {
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const STATUS_DISPLAY = {
        ACTIVE: { label: "ใช้งานได้", color: t.success, bg: t.successBg },
        EXPIRED: { label: "หมดอายุ", color: t.warning, bg: t.warningBg },
        SUSPENDED: { label: "ถูกระงับ", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
    };

    if (!mounted) return null;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/certificates", icon: Icons.award, label: "ใบรับรอง", active: true },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    const filteredCerts = certificates.filter(c => filter === 'ALL' || c.status === filter);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif" }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", zIndex: 100 }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 0", textDecoration: "none", position: "relative" }}>
                            {item.active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "28px", backgroundColor: t.accent, borderRadius: "0 3px 3px 0" }} />}
                            {item.icon(item.active ? t.accent : t.textMuted)}
                            <span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}</button>
                    <button onClick={handleLogout} aria-label="Logout" style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.slice(0, 5).map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(item.active ? t.accent : t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1200px" }}>
                {/* Header */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>ใบรับรอง GACP</h1>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>ใบรับรองมาตรฐานการปลูกและเก็บเกี่ยวพืชสมุนไพร</p>
                    </div>
                    {/* Filter Tabs */}
                    <div style={{ display: "flex", gap: "8px", backgroundColor: t.bgCard, padding: "4px", borderRadius: "12px", border: `1px solid ${t.border}` }}>
                        {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map((f) => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                                backgroundColor: filter === f ? t.accent : "transparent",
                                color: filter === f ? "#FFF" : t.textSecondary,
                                fontWeight: 500, fontSize: "13px", transition: "all 0.2s",
                            }}>
                                {f === 'ALL' ? 'ทั้งหมด' : f === 'ACTIVE' ? 'ใช้งานได้' : 'หมดอายุ'}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", margin: "0 auto" }} />
                        <p style={{ marginTop: "16px", color: t.textMuted }}>กำลังโหลดใบรับรอง...</p>
                    </div>
                ) : filteredCerts.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                        {filteredCerts.map((cert) => {
                            const daysRemaining = getDaysRemaining(cert.expiryDate);
                            const statusInfo = STATUS_DISPLAY[cert.status];
                            return (
                                <div key={cert._id} style={{
                                    backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px",
                                    overflow: "hidden", transition: "all 0.2s",
                                }}>
                                    {/* Certificate Header */}
                                    <div style={{
                                        background: cert.status === 'ACTIVE'
                                            ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`
                                            : `linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)`,
                                        padding: "24px", color: "#FFF", position: "relative"
                                    }}>
                                        <div style={{ position: "absolute", top: "20px", right: "20px", opacity: 0.2 }}>
                                            {Icons.award("#FFF")}
                                        </div>
                                        <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>เลขที่ใบรับรอง</p>
                                        <h3 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>{cert.certificateNumber}</h3>
                                    </div>

                                    {/* Certificate Body */}
                                    <div style={{ padding: "20px" }}>
                                        <div style={{ marginBottom: "16px" }}>
                                            <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "4px" }}>สถานที่</p>
                                            <p style={{ fontSize: "15px", fontWeight: 500 }}>{cert.siteName}</p>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                            <div>
                                                <p style={{ fontSize: "12px", color: t.textMuted }}>ประเภทพืช</p>
                                                <p style={{ fontSize: "13px", fontWeight: 500 }}>{cert.plantType}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "12px", color: t.textMuted }}>สถานะ</p>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: "4px",
                                                    padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: 500,
                                                    backgroundColor: statusInfo.bg, color: statusInfo.color
                                                }}>
                                                    {cert.status === 'ACTIVE' && Icons.check(statusInfo.color)}
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                            <div>
                                                <p style={{ fontSize: "12px", color: t.textMuted }}>วันที่ออก</p>
                                                <p style={{ fontSize: "13px" }}>{formatDate(cert.issuedDate)}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "12px", color: t.textMuted }}>วันหมดอายุ</p>
                                                <p style={{ fontSize: "13px", color: daysRemaining < 30 ? t.warning : t.text }}>
                                                    {formatDate(cert.expiryDate)}
                                                    {cert.status === 'ACTIVE' && daysRemaining <= 90 && (
                                                        <span style={{ display: "block", fontSize: "11px", color: t.warning }}>
                                                            (เหลือ {daysRemaining} วัน)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: "flex", gap: "8px", paddingTop: "16px", borderTop: `1px solid ${t.border}` }}>
                                            <button onClick={() => setViewCert(cert)} style={{
                                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                                padding: "10px", borderRadius: "10px", border: `1px solid ${t.border}`,
                                                backgroundColor: "transparent", color: t.text, fontSize: "13px", cursor: "pointer"
                                            }}>
                                                {Icons.eye(t.iconColor)} ดูใบรับรอง
                                            </button>
                                            <button onClick={() => setShowQR(cert)} style={{
                                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                                padding: "10px", borderRadius: "10px", border: `1px solid ${t.border}`,
                                                backgroundColor: "transparent", color: t.text, fontSize: "13px", cursor: "pointer"
                                            }}>
                                                {Icons.qr(t.iconColor)} QR Code
                                            </button>
                                            <button style={{
                                                padding: "10px 14px", borderRadius: "10px", border: "none",
                                                backgroundColor: t.accent, color: "#FFF", fontSize: "13px", cursor: "pointer",
                                                display: "flex", alignItems: "center", gap: "6px"
                                            }}>
                                                {Icons.download("#FFF")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: t.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                            {Icons.award(t.iconColor)}
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>ยังไม่มีใบรับรอง</h3>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "20px" }}>เมื่อคำขอได้รับการอนุมัติ ใบรับรองจะแสดงที่นี่</p>
                        <Link href="/applications/new" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "12px 24px", borderRadius: "12px",
                            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                            color: "#FFF", fontWeight: 500, textDecoration: "none"
                        }}>
                            ยื่นคำขอใหม่
                        </Link>
                    </div>
                )}
            </main>

            {/* Certificate View Modal */}
            {viewCert && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setViewCert(null)}>
                    <div style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto", backgroundColor: "#FFF", borderRadius: "16px" }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>ใบรับรอง GACP</h3>
                            <button onClick={() => setViewCert(null)} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#EF4444", color: "#FFF", cursor: "pointer" }}>✕ ปิด</button>
                        </div>

                        {/* Certificate Preview */}
                        <div style={{ padding: "24px", background: "#F9FAFB" }}>
                            <div style={{ background: "#FFF", border: "2px solid #10B981", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                                <img src="/images/dtam-logo.png" alt="DTAM" style={{ width: "60px", height: "60px", marginBottom: "16px" }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#10B981", marginBottom: "4px" }}>ใบรับรองมาตรฐาน GACP</h2>
                                <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "20px" }}>Good Agricultural and Collection Practices</p>

                                <div style={{ borderTop: "1px dashed #D1D5DB", borderBottom: "1px dashed #D1D5DB", padding: "20px 0", margin: "20px 0" }}>
                                    <p style={{ fontSize: "14px", color: "#374151", marginBottom: "8px" }}>เลขที่ใบรับรอง</p>
                                    <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>{viewCert.certificateNumber}</p>
                                </div>

                                <p style={{ fontSize: "14px", color: "#374151", marginBottom: "4px" }}>ออกให้แก่</p>
                                <p style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>{viewCert.siteName}</p>

                                <p style={{ fontSize: "13px", color: "#6B7280" }}>ประเภทพืช: {viewCert.plantType}</p>
                                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "8px" }}>
                                    มีผลตั้งแต่ {formatDate(viewCert.issuedDate)} ถึง {formatDate(viewCert.expiryDate)}
                                </p>

                                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E5E7EB" }}>
                                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>กระทรวงสาธารณสุข</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "12px", padding: "16px 20px", borderTop: "1px solid #E5E7EB" }}>
                            <button style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #10B981", background: "transparent", color: "#10B981", fontWeight: 500, cursor: "pointer" }}>
                                🖨️ พิมพ์
                            </button>
                            <button style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#10B981", color: "#FFF", fontWeight: 500, cursor: "pointer" }}>
                                📥 ดาวน์โหลด PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQR && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setShowQR(null)}>
                    <div style={{ width: "100%", maxWidth: "360px", backgroundColor: "#FFF", borderRadius: "20px", padding: "32px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>QR Code ตรวจสอบ</h3>

                        {/* QR Placeholder */}
                        <div style={{ width: "200px", height: "200px", margin: "0 auto 20px", backgroundColor: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: "160px", height: "160px", background: `url('https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://gacp.dtam.go.th/verify/${showQR.certificateNumber}')`, backgroundSize: "cover" }} />
                        </div>

                        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>สแกนเพื่อตรวจสอบใบรับรอง</p>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{showQR.certificateNumber}</p>

                        <button onClick={() => setShowQR(null)} style={{ marginTop: "24px", padding: "12px 32px", borderRadius: "12px", border: "none", backgroundColor: "#10B981", color: "#FFF", fontWeight: 500, cursor: "pointer" }}>
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } 
                .spinner { animation: spin 1s linear infinite; }
                @media (max-width: 1024px) { 
                    .sidebar { display: none !important; } 
                    .mobile-nav { display: flex !important; } 
                    .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; } 
                }
            `}</style>
        </div>
    );
}
