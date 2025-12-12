"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/apiClient";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", borderHover: "rgba(0, 0, 0, 0.15)",
        text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
        success: "#10B981", successBg: "rgba(16, 185, 129, 0.1)",
        danger: "#EF4444", dangerBg: "rgba(239, 68, 68, 0.08)",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", borderHover: "rgba(255, 255, 255, 0.15)",
        text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
        success: "#10B981", successBg: "rgba(16, 185, 129, 0.15)",
        danger: "#EF4444", dangerBg: "rgba(239, 68, 68, 0.15)",
    }
};

const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    lock: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    info: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
    check: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
};

interface User { id?: string; firstName?: string; lastName?: string; email?: string; phone?: string; identifier?: string; companyName?: string; communityName?: string; accountType?: string; createdAt?: string; lastLogin?: string; }

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        // Note: auth_token is now httpOnly cookie (not accessible via JS)
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setFirstName(parsed.firstName || "");
            setLastName(parsed.lastName || "");
            setEmail(parsed.email || "");
            setPhone(parsed.phone || "");
            setCompanyName(parsed.companyName || parsed.communityName || "");
        } catch { router.push("/login"); }
    }, [router]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setMessage("");
        const result = await api.put("/auth-farmer/profile", { firstName, lastName, email, phone, companyName });
        if (result.success) {
            const updatedUser = { ...user, firstName, lastName, email, phone, companyName };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
            setIsEditing(false);
        } else { setMessage(result.error || "เกิดข้อผิดพลาด"); }
        setIsSaving(false);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("auth_token"); localStorage.removeItem("user"); document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; router.push("/login"); };
    const getAccountTypeThai = () => { switch (user?.accountType) { case "INDIVIDUAL": return "บุคคลธรรมดา"; case "JURISTIC": return "นิติบุคคล"; case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน"; default: return "ผู้สมัคร"; } };
    const getName = () => user?.companyName || user?.communityName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "ผู้ใช้";

    if (!user || !mounted) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}><div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%" }} /><style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style></div>;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์", active: true },
    ];

    const inputStyle = { width: "100%", padding: "14px 16px", border: `1px solid ${t.border}`, borderRadius: "12px", fontSize: "15px", fontFamily: "'Kanit', sans-serif", backgroundColor: isEditing ? t.bgCard : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", color: t.text, outline: "none" };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>
            <aside className="sidebar" style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "72px", backgroundColor: t.surface, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 600, color: "#FFF", marginBottom: "32px" }}>G</div>
                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                    {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px 0", textDecoration: "none", position: "relative" }}>{item.active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "28px", backgroundColor: t.accent, borderRadius: "0 3px 3px 0" }} />}{item.icon(item.active ? t.accent : t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span></Link>)}
                </nav>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <button onClick={toggleTheme} style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{isDark ? Icons.sun(t.iconColor) : Icons.moon(t.iconColor)}</button>
                    <button onClick={handleLogout} style={{ width: "40px", height: "40px", borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.logout(t.textMuted)}</button>
                </div>
            </aside>

            <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "72px", backgroundColor: t.surface, borderTop: `1px solid ${t.border}`, display: "none", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
                {navItems.map((item) => <Link key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 12px", textDecoration: "none" }}>{item.icon(item.active ? t.accent : t.textMuted)}<span style={{ fontSize: "10px", fontWeight: 500, color: item.active ? t.accent : t.textMuted }}>{item.label}</span></Link>)}
            </nav>

            <main className="main-content" style={{ marginLeft: "72px", padding: "32px 40px", maxWidth: "900px" }}>
                <header style={{ marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, margin: 0 }}>ตั้งค่าบัญชี</h1>
                    <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "4px" }}>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
                </header>

                {message && <div style={{ padding: "14px 18px", backgroundColor: t.successBg, color: t.success, borderRadius: "12px", marginBottom: "20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>{Icons.check(t.success)} {message}</div>}

                {/* Personal Info */}
                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.user(t.iconColor)}</div>
                        <div><h2 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>ข้อมูลส่วนตัว</h2><p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>อัปเดตข้อมูลโปรไฟล์และข้อมูลติดต่อ</p></div>
                    </div>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>ชื่อ-นามสกุล</label><input type="text" value={`${firstName} ${lastName}`.trim() || getName()} onChange={(e) => { const p = e.target.value.split(" "); setFirstName(p[0] || ""); setLastName(p.slice(1).join(" ") || ""); }} disabled={!isEditing} style={inputStyle} /></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>อีเมล</label><input type="email" value={email || user.email || ""} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} style={inputStyle} /></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>เบอร์โทรศัพท์</label><input type="tel" value={phone || user.phone || ""} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} style={inputStyle} /></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>เลขบัตรประชาชน</label><input type="text" value={user.identifier || ""} disabled style={{ ...inputStyle, color: t.textMuted }} /></div>
                        {(user.companyName || user.communityName) && <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>ชื่อองค์กร/บริษัท</label><input type="text" value={companyName || user.companyName || user.communityName || ""} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditing} style={inputStyle} /></div>}
                    </div>
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        {isEditing ? (
                            <><button onClick={() => setIsEditing(false)} style={{ padding: "12px 20px", backgroundColor: "transparent", border: `1px solid ${t.border}`, borderRadius: "12px", fontSize: "14px", cursor: "pointer", color: t.textSecondary }}>ยกเลิก</button><button onClick={handleSaveProfile} disabled={isSaving} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>{isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</button></>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={{ padding: "12px 24px", background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, color: "#FFF", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>แก้ไขข้อมูล</button>
                        )}
                    </div>
                </div>

                {/* Security */}
                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.lock(t.iconColor)}</div>
                        <div><h2 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>ความปลอดภัย</h2><p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>จัดการรหัสผ่านและการตั้งค่าความปลอดภัย</p></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", borderRadius: "14px", flexWrap: "wrap", gap: "16px" }}>
                        <div><p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>รหัสผ่าน</p><p style={{ fontSize: "13px", color: t.textMuted, marginTop: "4px" }}>เปลี่ยนรหัสผ่านเพื่อความปลอดภัย</p></div>
                        <button onClick={() => alert("ฟีเจอร์นี้จะเปิดให้บริการเร็วๆ นี้")} style={{ padding: "12px 20px", backgroundColor: "transparent", border: `1px solid ${t.border}`, borderRadius: "12px", fontSize: "14px", cursor: "pointer", color: t.textSecondary }}>เปลี่ยนรหัสผ่าน</button>
                    </div>
                </div>

                {/* Account Info */}
                <div style={{ backgroundColor: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: t.iconBg, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.info(t.iconColor)}</div>
                        <div><h2 style={{ fontSize: "17px", fontWeight: 600, margin: 0 }}>ข้อมูลบัญชี</h2><p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>ข้อมูลบัญชีและสถานะการใช้งาน</p></div>
                    </div>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>บทบาท</label><div style={{ padding: "14px 16px", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "12px", fontSize: "15px" }}>{getAccountTypeThai()}</div></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>สถานะบัญชี</label><div style={{ padding: "14px 16px", backgroundColor: t.successBg, borderRadius: "12px", fontSize: "15px", color: t.success, fontWeight: 500 }}>ใช้งานได้</div></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>วันที่สร้างบัญชี</label><div style={{ padding: "14px 16px", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "12px", fontSize: "15px" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("th-TH") : "-"}</div></div>
                        <div><label style={{ fontSize: "13px", color: t.textMuted, display: "block", marginBottom: "8px" }}>เข้าสู่ระบบล่าสุด</label><div style={{ padding: "14px 16px", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: "12px", fontSize: "15px" }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("th-TH") : "ไม่ระบุ"}</div></div>
                    </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} style={{ width: "100%", padding: "16px", backgroundColor: t.dangerBg, border: `1px solid ${t.danger}40`, borderRadius: "14px", color: t.danger, fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                    ออกจากระบบ
                </button>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }
                input:focus { outline: none; border-color: ${t.accent} !important; }
                @media (max-width: 1024px) { .sidebar { display: none !important; } .mobile-nav { display: flex !important; } .main-content { margin-left: 0 !important; padding: 24px 20px 100px !important; } }
                @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
}
