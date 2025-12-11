"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/apiClient";

// Design tokens matching the reference
const colors = {
    primary: "#0D9488",
    primaryLight: "#0D948814",
    background: "#F8FAFC",
    card: "#FFFFFF",
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    successBg: "#D1FAE5",
};

interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    identifier?: string;
    companyName?: string;
    communityName?: string;
    accountType?: string;
    role?: string;
    status?: string;
    createdAt?: string;
    lastLogin?: string;
}

// SVG Icons
const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
    </svg>
);

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Form states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            // Initialize form values
            setFirstName(parsed.firstName || "");
            setLastName(parsed.lastName || "");
            setEmail(parsed.email || "");
            setPhone(parsed.phone || "");
            setCompanyName(parsed.companyName || parsed.communityName || "");
        } catch {
            router.push("/login");
        }
    }, [router]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setMessage("");

        // Simulate API call (replace with real API when ready)
        const result = await api.put("/auth-farmer/profile", {
            firstName,
            lastName,
            email,
            phone,
            companyName,
        });

        if (result.success) {
            // Update local storage
            const updatedUser = { ...user, firstName, lastName, email, phone, companyName };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
            setIsEditing(false);
        } else {
            setMessage(result.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        }

        setIsSaving(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("remember_login");
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/login");
    };

    const getAccountTypeThai = () => {
        switch (user?.accountType) {
            case "INDIVIDUAL": return "บุคคลธรรมดา";
            case "JURISTIC": return "นิติบุคคล";
            case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน";
            default: return "ผู้สมัคร";
        }
    };

    const getName = () => {
        if (user?.companyName) return user.companyName;
        if (user?.communityName) return user.communityName;
        return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "ผู้ใช้งาน";
    };

    if (!user) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: colors.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "24px" }}>⏳</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${colors.primary}, #0F766E)`, padding: "24px 24px 32px", color: "#FFF" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
                        <Link href="/dashboard" style={{ color: "#FFF", textDecoration: "none", opacity: 0.8 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                        </Link>
                        <SettingsIcon />
                        <div>
                            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>ตั้งค่าบัญชี</h1>
                            <p style={{ fontSize: "14px", opacity: 0.8, margin: "4px 0 0" }}>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: "800px", margin: "-16px auto 0", padding: "0 24px 24px" }}>
                {/* Success Message */}
                {message && (
                    <div style={{ padding: "12px 16px", backgroundColor: colors.successBg, color: colors.success, borderRadius: "12px", marginBottom: "16px", fontSize: "14px" }}>
                        ✓ {message}
                    </div>
                )}

                {/* Section 1: Personal Info */}
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        <UserIcon />
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: colors.textDark, margin: 0 }}>ข้อมูลส่วนตัว</h2>
                            <p style={{ fontSize: "13px", color: colors.textGray, margin: "2px 0 0" }}>อัปเดตข้อมูลโปรไฟล์และข้อมูลติดต่อของคุณ</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                value={`${firstName} ${lastName}`.trim() || getName()}
                                onChange={(e) => {
                                    const parts = e.target.value.split(" ");
                                    setFirstName(parts[0] || "");
                                    setLastName(parts.slice(1).join(" ") || "");
                                }}
                                disabled={!isEditing}
                                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", backgroundColor: isEditing ? "#FFF" : "#F8FAFC", color: colors.textDark }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>อีเมล</label>
                            <input
                                type="email"
                                value={email || user.email || ""}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!isEditing}
                                placeholder="farmer@gmail.com"
                                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", backgroundColor: isEditing ? "#FFF" : "#F8FAFC", color: colors.textDark }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                value={phone || user.phone || ""}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!isEditing}
                                placeholder="0812345678"
                                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", backgroundColor: isEditing ? "#FFF" : "#F8FAFC", color: colors.textDark }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>เลขบัตรประจำตัวประชาชน</label>
                            <input
                                type="text"
                                value={user.identifier || ""}
                                disabled
                                style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", backgroundColor: "#F8FAFC", color: colors.textGray }}
                            />
                        </div>
                        {(user.companyName || user.communityName) && (
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>ชื่อองค์กร/บริษัท</label>
                                <input
                                    type="text"
                                    value={companyName || user.companyName || user.communityName || ""}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    disabled={!isEditing}
                                    style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", backgroundColor: isEditing ? "#FFF" : "#F8FAFC", color: colors.textDark }}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} style={{ padding: "10px 20px", backgroundColor: "#FFF", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: colors.textGray }}>
                                    ยกเลิก
                                </button>
                                <button onClick={handleSaveProfile} disabled={isSaving} style={{ padding: "10px 24px", backgroundColor: colors.primary, color: "#FFF", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                                    {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={{ padding: "10px 24px", backgroundColor: colors.primary, color: "#FFF", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                                แก้ไขข้อมูล
                            </button>
                        )}
                    </div>
                </div>

                {/* Section 2: Security */}
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        <LockIcon />
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: colors.textDark, margin: 0 }}>ความปลอดภัย</h2>
                            <p style={{ fontSize: "13px", color: colors.textGray, margin: "2px 0 0" }}>จัดการรหัสผ่านและการตั้งค่าความปลอดภัยของบัญชี</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px" }}>
                        <div>
                            <p style={{ fontSize: "15px", fontWeight: 500, color: colors.textDark, margin: 0 }}>รหัสผ่าน</p>
                            <p style={{ fontSize: "13px", color: colors.textGray, margin: "4px 0 0" }}>เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
                        </div>
                        <button
                            onClick={() => alert("ฟีเจอร์นี้จะเปิดให้บริการเร็วๆ นี้\nกรุณารอการอัปเดตระบบ")}
                            style={{ padding: "10px 20px", backgroundColor: "#FFF", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", cursor: "pointer", color: colors.textDark }}
                        >
                            เปลี่ยนรหัสผ่าน
                        </button>
                    </div>
                </div>

                {/* Section 3: Account Info */}
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                        <InfoIcon />
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 600, color: colors.textDark, margin: 0 }}>ข้อมูลบัญชี</h2>
                            <p style={{ fontSize: "13px", color: colors.textGray, margin: "2px 0 0" }}>ข้อมูลบัญชีและสถานะการใช้งาน</p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>บทบาท</label>
                            <div style={{ padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "8px", fontSize: "15px", color: colors.textDark }}>
                                {getAccountTypeThai()}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>สถานะบัญชี</label>
                            <div style={{ padding: "12px 16px", backgroundColor: colors.successBg, borderRadius: "8px", fontSize: "15px", color: colors.success, fontWeight: 500 }}>
                                ใช้งานได้
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>วันที่สร้างบัญชี</label>
                            <div style={{ padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "8px", fontSize: "15px", color: colors.textDark }}>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString("th-TH") : "-"}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: colors.textGray, display: "block", marginBottom: "6px" }}>เข้าสู่ระบบครั้งล่าสุด</label>
                            <div style={{ padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "8px", fontSize: "15px", color: colors.textDark }}>
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{ width: "100%", padding: "16px", backgroundColor: "#FFF", border: "1px solid #EF4444", borderRadius: "12px", color: "#EF4444", fontSize: "15px", fontWeight: 600, cursor: "pointer", marginTop: "8px" }}
                >
                    ออกจากระบบ
                </button>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input:focus { outline: none; border-color: ${colors.primary} !important; }
            `}</style>
        </div>
    );
}
