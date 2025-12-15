"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/apiClient";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", borderHover: "rgba(0, 0, 0, 0.15)",
        text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
        danger: "#EF4444", dangerBg: "rgba(239, 68, 68, 0.08)",
        warning: "#F59E0B", warningBg: "rgba(245, 158, 11, 0.08)",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", borderHover: "rgba(255, 255, 255, 0.15)",
        text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
        danger: "#EF4444", dangerBg: "rgba(239, 68, 68, 0.15)",
        warning: "#F59E0B", warningBg: "rgba(245, 158, 11, 0.15)",
    }
};

// Icons
const Icons = {
    back: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>,
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    download: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    check: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    clock: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    mapPin: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    edit: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
};

// Status Configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
    DRAFT: { label: "ร่าง", color: "#8A8A8A", step: 1 },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B", step: 2 },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6", step: 3 },
    REVISION_REQ: { label: "ต้องแก้ไขเอกสาร", color: "#EF4444", step: 3 },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B", step: 4 },
    AUDIT_PENDING: { label: "รอตรวจประเมินสถานที่", color: "#8B5CF6", step: 5 },
    AUDIT_SCHEDULED: { label: "นัดหมายตรวจแล้ว", color: "#06B6D4", step: 5 },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#10B981", step: 6 },
};

const STEPS = [
    { id: 1, label: "ยื่นคำขอ" },
    { id: 2, label: "ชำระงวด 1" },
    { id: 3, label: "ตรวจเอกสาร" },
    { id: 4, label: "ชำระงวด 2" },
    { id: 5, label: "ตรวจสถานที่" },
    { id: 6, label: "รับรอง" },
];

interface ApplicationDetail {
    _id: string;
    applicationNumber?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    requestType?: string;
    certificationType?: string;
    objective?: string;
    applicantType?: string;
    applicantInfo?: {
        name?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        idCard?: string;
    };
    siteInfo?: {
        siteName?: string;
        address?: string;
        province?: string;
        gpsLat?: string;
        gpsLng?: string;
        areaSize?: string;
    };
    formData?: {
        plantId?: string;
        siteTypes?: string[];
        documents?: { id: string; uploaded?: boolean; name?: string }[];
    };
    payments?: {
        phase1?: { amount: number; status: string; paidAt?: string };
        phase2?: { amount: number; status: string; paidAt?: string };
    };
    staffNotes?: string;
    auditSchedule?: { date: string; inspector: string };
}

export default function ApplicationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [application, setApplication] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        loadApplication();
    }, [id]);

    const loadApplication = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const result = await api.get<{ data: ApplicationDetail }>(`/v2/applications/${id}`);
            if (result.success && result.data?.data) {
                setApplication(result.data.data);
            } else {
                setError("ไม่พบคำขอนี้ในระบบ");
            }
        } catch {
            setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        localStorage.setItem("theme", !isDark ? "dark" : "light");
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/api/auth/logout";
    };

    const getStatusInfo = (status: string) => STATUS_CONFIG[status] || { label: status, color: t.textMuted, step: 0 };
    const formatDate = (date: string) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!mounted) return null;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ", active: true },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์" },
    ];

    const statusInfo = application ? getStatusInfo(application.status) : null;
    const currentStep = statusInfo?.step || 0;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif" }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
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
                    <button onClick={toggleTheme} aria-label={isDark ? "โหมดสว่าง" : "โหมดมืด"} style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}</button>
                    <button onClick={handleLogout} aria-label="ออกจากระบบ" style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(item.active ? t.accent : t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "1200px" }}>
                {/* Back Button */}
                <Link href="/applications" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: t.textSecondary, textDecoration: "none", marginBottom: "24px", fontSize: "14px" }}>
                    {Icons.back(t.textMuted)} กลับไปรายการคำขอ
                </Link>

                {loading ? (
                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "60px", textAlign: "center" }}>
                        <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", margin: "0 auto" }} />
                        <p style={{ marginTop: "16px", color: t.textMuted }}>กำลังโหลดข้อมูลคำขอ...</p>
                    </div>
                ) : error ? (
                    <div style={{ backgroundColor: t.dangerBg, border: `1px solid ${t.danger}`, borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                        <p style={{ color: t.danger, fontWeight: 500 }}>⚠️ {error}</p>
                        <Link href="/applications" style={{ display: "inline-block", marginTop: "16px", padding: "10px 20px", borderRadius: "10px", backgroundColor: t.danger, color: "#FFF", textDecoration: "none" }}>กลับไปรายการคำขอ</Link>
                    </div>
                ) : application ? (
                    <>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>
                                    คำขอ {application.applicationNumber || `#${application._id.slice(-6).toUpperCase()}`}
                                </h1>
                                <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>
                                    ยื่นเมื่อ {formatDate(application.createdAt)}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <span style={{ padding: "8px 20px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, backgroundColor: `${statusInfo?.color}20`, color: statusInfo?.color, border: `1px solid ${statusInfo?.color}40` }}>
                                    {statusInfo?.label}
                                </span>
                                {application.status === "REVISION_REQ" && (
                                    <Link href={`/applications/${application._id}/edit`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "12px", backgroundColor: t.warning, color: "#FFF", textDecoration: "none", fontWeight: 500 }}>
                                        {Icons.edit("#FFF")} แก้ไขคำขอ
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "20px", color: t.textSecondary }}>📊 ความคืบหน้า</h3>
                            <div style={{ position: "relative", marginBottom: "20px" }}>
                                <div style={{ height: "4px", backgroundColor: t.border, borderRadius: "2px" }} />
                                <div style={{ position: "absolute", top: 0, left: 0, height: "4px", width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, background: `linear-gradient(90deg, ${t.accent} 0%, ${t.accentLight} 100%)`, borderRadius: "2px", transition: "width 0.5s" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: "8px" }}>
                                {STEPS.map((step) => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} style={{ textAlign: "center" }}>
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "12px", margin: "0 auto 8px",
                                                backgroundColor: isDone ? t.accent : isCurrent ? t.accentBg : t.border,
                                                border: isCurrent ? `2px solid ${t.accent}` : "none",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                {isDone ? Icons.check("#FFF") : isCurrent ? Icons.clock(t.accent) : <span style={{ fontSize: "14px", fontWeight: 500, color: t.textMuted }}>{step.id}</span>}
                                            </div>
                                            <span style={{ fontSize: "11px", color: isCurrent ? t.accent : t.textMuted, fontWeight: isCurrent ? 600 : 400 }}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Staff Notes (if any) */}
                        {application.staffNotes && (
                            <div style={{ backgroundColor: t.warningBg, border: `1px solid ${t.warning}40`, borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                                <h4 style={{ fontSize: "14px", fontWeight: 600, color: t.warning, marginBottom: "8px" }}>📝 หมายเหตุจากเจ้าหน้าที่</h4>
                                <p style={{ fontSize: "14px", color: t.text, margin: 0, lineHeight: 1.6 }}>{application.staffNotes}</p>
                            </div>
                        )}

                        {/* Action Cards based on status */}
                        {application.status === "PAYMENT_1_PENDING" && (
                            <div style={{ backgroundColor: t.warningBg, border: `1px solid ${t.warning}40`, borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                                    <div>
                                        <h4 style={{ fontSize: "16px", fontWeight: 600, color: t.warning, marginBottom: "4px" }}>💳 รอชำระเงินงวดที่ 1</h4>
                                        <p style={{ fontSize: "14px", color: t.textSecondary, margin: 0 }}>ค่าตรวจสอบเอกสารเบื้องต้น 5,000 บาท</p>
                                    </div>
                                    <Link href={`/payments?app=${application._id}&phase=1`} style={{ padding: "12px 24px", borderRadius: "12px", backgroundColor: t.warning, color: "#FFF", textDecoration: "none", fontWeight: 600 }}>
                                        ชำระเงิน
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Content Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                            {/* Left Column - Details */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* Applicant Info */}
                                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {Icons.user(t.iconColor)} ข้อมูลผู้ยื่นคำขอ
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                                        <div><span style={{ color: t.textMuted }}>ชื่อ:</span> <strong>{application.applicantInfo?.name || `${application.applicantInfo?.firstName || ''} ${application.applicantInfo?.lastName || ''}`}</strong></div>
                                        <div><span style={{ color: t.textMuted }}>ประเภท:</span> {application.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : application.applicantType === 'COMMUNITY' ? 'วิสาหกิจชุมชน' : 'นิติบุคคล'}</div>
                                        <div><span style={{ color: t.textMuted }}>โทร:</span> {application.applicantInfo?.phone || '-'}</div>
                                        <div><span style={{ color: t.textMuted }}>อีเมล:</span> {application.applicantInfo?.email || '-'}</div>
                                    </div>
                                </div>

                                {/* Site Info */}
                                {application.siteInfo && (
                                    <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                            {Icons.mapPin(t.iconColor)} สถานที่ปลูก/เก็บเกี่ยว
                                        </h3>
                                        <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
                                            <div><span style={{ color: t.textMuted }}>ชื่อสถานที่:</span> <strong>{application.siteInfo.siteName}</strong></div>
                                            <div><span style={{ color: t.textMuted }}>ที่อยู่:</span> {application.siteInfo.address}, {application.siteInfo.province}</div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                <div><span style={{ color: t.textMuted }}>พื้นที่:</span> {application.siteInfo.areaSize} ไร่</div>
                                                <div><span style={{ color: t.textMuted }}>พิกัด GPS:</span> {application.siteInfo.gpsLat}, {application.siteInfo.gpsLng}</div>
                                            </div>
                                        </div>
                                        {application.siteInfo.gpsLat && application.siteInfo.gpsLng && (
                                            <div style={{ marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${t.border}` }}>
                                                <iframe
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(application.siteInfo.gpsLng) - 0.01}%2C${parseFloat(application.siteInfo.gpsLat) - 0.006}%2C${parseFloat(application.siteInfo.gpsLng) + 0.01}%2C${parseFloat(application.siteInfo.gpsLat) + 0.006}&layer=mapnik&marker=${application.siteInfo.gpsLat}%2C${application.siteInfo.gpsLng}`}
                                                    style={{ width: "100%", height: "180px", border: "none" }}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Documents & Actions */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* Documents */}
                                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {Icons.fileText(t.iconColor)} เอกสารประกอบ
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {application.formData?.documents?.filter(d => d.uploaded).slice(0, 5).map((doc, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: "10px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{ fontSize: "16px" }}>📄</span>
                                                    <span style={{ fontSize: "13px" }}>{doc.name || `เอกสาร ${i + 1}`}</span>
                                                </div>
                                                <button style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${t.accent}`, backgroundColor: "transparent", color: t.accent, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    {Icons.download(t.accent)} ดาวน์โหลด
                                                </button>
                                            </div>
                                        )) || (
                                                <p style={{ fontSize: "13px", color: t.textMuted, textAlign: "center", padding: "20px" }}>ยังไม่มีเอกสาร</p>
                                            )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>⚡ ดำเนินการ</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <Link href={`/tracking?app=${application._id}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "12px", border: `1px solid ${t.border}`, textDecoration: "none", color: t.text }}>
                                            {Icons.compass(t.iconColor)}
                                            <span>ติดตามสถานะ</span>
                                        </Link>
                                        <Link href={`/payments?app=${application._id}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "12px", border: `1px solid ${t.border}`, textDecoration: "none", color: t.text }}>
                                            {Icons.creditCard(t.iconColor)}
                                            <span>ประวัติการชำระเงิน</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>

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
                @media (max-width: 900px) {
                    .main-content > div:last-child { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
