"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/apiClient";

// Design tokens - exact match to Mobile App
const colors = {
    primary: "#1B5E20",
    primaryLight: "#1B5E2014",
    background: "#F5F7FA",
    card: "#FFFFFF",
    text: "#1B5E20",
    textDark: "#1E293B",
    textGray: "#64748B",
    border: "#E0E0E0",
    error: "#DC2626",
    errorBg: "#FEF2F2",
    infoBg: "#E8F5E9",
};

const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

const STEPS = ["ยินยอม PDPA", "ประเภทบัญชี", "ยืนยันตัวตน", "ข้อมูลส่วนตัว", "ตั้งรหัสผ่าน"];

// Icons
const PersonIcon = ({ color = "#6B7280" }: { color?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const BuildingIcon = ({ color = "#6B7280" }: { color?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
        <path d="M9 8H15M9 12H15M9 16H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const GroupIcon = ({ color = "#6B7280" }: { color?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="2" />
        <circle cx="15" cy="8" r="3" stroke={color} strokeWidth="2" />
        <path d="M3 20C3 17.2386 5.68629 15 9 15C10.2 15 11.3 15.3 12.2 15.8M15 15C18.3137 15 21 17.2386 21 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
        {open ? (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12" />
                <path d="M2 12C2 12 5 19 12 19C19 19 22 12 22 12" />
                <path d="M4 4L20 20" />
            </>
        )}
    </svg>
);

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [accountType, setAccountType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [identifier, setIdentifier] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [representativeName, setRepresentativeName] = useState("");
    const [communityName, setCommunityName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [pdpaAccepted, setPdpaAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Field-level errors for inline validation
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Thai ID checksum validation (Modulo 11)
    const validateThaiId = (id: string): boolean => {
        const digits = id.replace(/-/g, "");
        if (digits.length !== 13 || !/^\d{13}$/.test(digits)) return false;

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(digits[i]) * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === parseInt(digits[12]);
    };

    // Password strength calculation
    const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: "อ่อนมาก", color: "#EF4444" };
        if (score === 2) return { level: 2, label: "อ่อน", color: "#F97316" };
        if (score === 3) return { level: 3, label: "ปานกลาง", color: "#EAB308" };
        if (score === 4) return { level: 4, label: "แข็งแกร่ง", color: "#22C55E" };
        return { level: 5, label: "แข็งแกร่งมาก", color: "#059669" };
    };

    // Real-time field validation
    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };

        switch (field) {
            case 'identifier':
                const cleanId = value.replace(/-/g, "");
                if (accountType === "INDIVIDUAL" && cleanId.length === 13) {
                    if (!validateThaiId(value)) {
                        errors.identifier = "เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบ";
                    } else {
                        delete errors.identifier;
                    }
                } else if (cleanId.length > 0 && cleanId.length < 13) {
                    errors.identifier = `กรอกแล้ว ${cleanId.length}/13 หลัก`;
                } else {
                    delete errors.identifier;
                }
                break;
            case 'phone':
                if (value.length > 0 && value.length < 10) {
                    errors.phone = `กรอกแล้ว ${value.length}/10 หลัก`;
                } else if (value.length === 10) {
                    if (!/^0[689]\d{8}$/.test(value)) {
                        errors.phone = "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08, หรือ 09";
                    } else {
                        delete errors.phone;
                    }
                } else {
                    delete errors.phone;
                }
                break;
            case 'confirmPassword':
                if (value && value !== password) {
                    errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
                } else {
                    delete errors.confirmPassword;
                }
                break;
        }
        setFieldErrors(errors);
    };

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType);

    // Thai error message mapping
    const translateError = (englishError: string): string => {
        const errorMap: Record<string, string> = {
            // Duplicate validation
            "Thai ID Card already registered": "บัตรประชาชนนี้ลงทะเบียนแล้ว กรุณาใช้หมายเลขอื่น",
            "Tax ID already registered": "เลขทะเบียนนิติบุคคลนี้ลงทะเบียนแล้ว",
            "Community Enterprise already registered": "วิสาหกิจชุมชนนี้ลงทะเบียนแล้ว",
            "Email already exists": "อีเมลนี้ลงทะเบียนแล้ว",
            "Phone number already registered": "เบอร์โทรศัพท์นี้ลงทะเบียนแล้ว",
            // Validation errors
            "Invalid Thai ID Card number": "เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
            "Tax ID must be 13 digits": "เลขทะเบียนนิติบุคคลต้องมี 13 หลัก",
            "Thai ID Card is required for individual registration": "กรุณากรอกเลขบัตรประชาชน",
            "Tax ID is required for juristic registration": "กรุณากรอกเลขทะเบียนนิติบุคคล",
            "Company name is required": "กรุณากรอกชื่อบริษัท",
            "Community name is required": "กรุณากรอกชื่อวิสาหกิจชุมชน",
            "Password must be at least 8 characters": "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
            "Invalid Laser Code format": "รูปแบบรหัสเลเซอร์ไม่ถูกต้อง",
            // Network errors
            "Failed to fetch": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต",
            "Network Error": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        };

        // Check exact match first
        if (errorMap[englishError]) return errorMap[englishError];

        // Check partial matches
        for (const [key, value] of Object.entries(errorMap)) {
            if (englishError.toLowerCase().includes(key.toLowerCase())) return value;
        }

        // Return original if no translation found, or generic Thai error
        if (/[a-z]/i.test(englishError)) {
            return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        }
        return englishError;
    };

    const formatThaiId = (value: string) => {
        const digits = value.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < digits.length && i < 13; i++) {
            if (i === 1 || i === 5 || i === 10 || i === 12) formatted += "-";
            formatted += digits[i];
        }
        return formatted;
    };

    const canProceed = () => {
        switch (step) {
            case 0: return pdpaAccepted; // PDPA consent
            case 1: return accountType !== ""; // Account type
            case 2: return identifier.replace(/-/g, "").length >= 10; // Identifier
            case 3: // Personal info
                if (accountType === "INDIVIDUAL") return firstName && lastName && phone.length >= 10;
                if (accountType === "JURISTIC") return companyName && representativeName && phone.length >= 10;
                return communityName && representativeName && phone.length >= 10;
            case 4: return password.length >= 8 && password === confirmPassword && acceptTerms; // Password
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setError("");
        setIsLoading(true);

        // Input sanitization - prevent XSS
        const sanitize = (str: string) => str.trim().replace(/[<>'"&]/g, "");
        const cleanIdentifier = identifier.replace(/-/g, "").replace(/[<>'"&]/g, "");
        const cleanPhone = phone.replace(/[<>'"&]/g, "");
        const cleanPassword = password.trim();

        // Client-side validation before API call
        if (!cleanIdentifier || cleanIdentifier.length < 10) {
            setError("กรุณากรอกเลขประจำตัวให้ครบถ้วน (อย่างน้อย 10 หลัก)");
            setIsLoading(false);
            return;
        }
        if (!cleanPhone || cleanPhone.length !== 10) {
            setError("เบอร์โทรศัพท์ต้องมี 10 หลัก");
            setIsLoading(false);
            return;
        }
        if (!cleanPassword || cleanPassword.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            return;
        }

        const data: Record<string, string> = { accountType, identifier: cleanIdentifier, phoneNumber: cleanPhone, password: cleanPassword };
        if (accountType === "INDIVIDUAL") { data.firstName = sanitize(firstName); data.lastName = sanitize(lastName); data.idCard = cleanIdentifier; }
        else if (accountType === "JURISTIC") { data.companyName = sanitize(companyName); data.representativeName = sanitize(representativeName); data.taxId = cleanIdentifier; }
        else { data.communityName = sanitize(communityName); data.representativeName = sanitize(representativeName); data.communityRegistrationNo = identifier.replace(/[<>'"&]/g, ""); }

        // Use centralized API client with automatic retry and error handling
        const result = await api.post<{ success: boolean }>("/auth-farmer/register", data);

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        router.push("/login?registered=true");
    };

    const getIcon = (type: string, isSelected: boolean) => {
        const color = isSelected ? "#FFFFFF" : "#6B7280";
        switch (type) {
            case "INDIVIDUAL": return <PersonIcon color={color} />;
            case "JURISTIC": return <BuildingIcon color={color} />;
            case "COMMUNITY_ENTERPRISE": return <GroupIcon color={color} />;
            default: return null;
        }
    };

    const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", border: `1px solid ${colors.border}`, borderRadius: "12px", fontSize: "16px", outline: "none" };
    const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, padding: "24px", fontFamily: "'Sarabun', sans-serif" }}>
            <div style={{ maxWidth: "420px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                    <Link href="/login" style={{ fontSize: "14px", color: colors.textGray, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textGray} strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                    <h1 style={{ fontSize: "26px", fontWeight: 900, color: colors.primary, marginTop: "16px" }}>ลงทะเบียนผู้ใช้ใหม่</h1>
                </div>

                {/* Progress Steps */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ flex: 1 }}>
                            <div style={{ height: "6px", borderRadius: "3px", backgroundColor: i <= step ? colors.primary : colors.border, transition: "background-color 0.3s" }} />
                            <p style={{ fontSize: "10px", textAlign: "center", marginTop: "6px", color: i <= step ? colors.primary : colors.textGray, fontWeight: i <= step ? 700 : 400 }}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    {error && <div style={{ padding: "12px 16px", backgroundColor: colors.errorBg, borderRadius: "12px", color: colors.error, fontSize: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8V12M12 16H12.01" /></svg>
                        {error}
                    </div>}

                    {/* Step 0: PDPA Consent */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.textDark }}>ยินยอมข้อมูลส่วนบุคคล (PDPA)</h2>

                            <div style={{
                                maxHeight: "280px",
                                overflowY: "auto",
                                padding: "16px",
                                backgroundColor: "#FAFAFA",
                                borderRadius: "12px",
                                marginBottom: "16px",
                                fontSize: "14px",
                                lineHeight: 1.7,
                                color: colors.textGray
                            }}>
                                <p style={{ fontWeight: 700, color: colors.textDark, marginBottom: "12px" }}>📋 วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</p>
                                <p style={{ marginBottom: "12px" }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (กระทรวงสาธารณสุข) มีความจำเป็นต้องเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
                                <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                                    <li>การยื่นขอการรับรองมาตรฐาน GACP</li>
                                    <li>การตรวจสอบและประเมินแหล่งปลูกพืชสมุนไพร</li>
                                    <li>การออกใบรับรองมาตรฐาน และการติดตามผล</li>
                                    <li>การติดต่อสื่อสารเกี่ยวกับการรับรอง</li>
                                </ul>

                                <p style={{ fontWeight: 700, color: colors.textDark, marginBottom: "12px" }}>🔒 ข้อมูลที่จัดเก็บ</p>
                                <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                                    <li>ข้อมูลส่วนตัว: ชื่อ-นามสกุล, เลขบัตรประชาชน/ทะเบียนนิติบุคคล</li>
                                    <li>ข้อมูลการติดต่อ: ที่อยู่, เบอร์โทรศัพท์, อีเมล</li>
                                    <li>ข้อมูลสถานประกอบการ: พิกัด GPS, รูปถ่าย</li>
                                </ul>

                                <p style={{ fontWeight: 700, color: colors.textDark, marginBottom: "12px" }}>⏰ ระยะเวลาจัดเก็บ</p>
                                <p style={{ marginBottom: "12px" }}>ข้อมูลจะถูกเก็บรักษาตลอดระยะเวลาที่ใบรับรองมีผลบังคับใช้ และอีก 5 ปีหลังจากหมดอายุ ตามกฎหมายที่เกี่ยวข้อง</p>

                                <p style={{ fontWeight: 700, color: colors.textDark, marginBottom: "12px" }}>✅ สิทธิของท่าน</p>
                                <p>ท่านมีสิทธิในการเข้าถึง แก้ไข ลบ หรือร้องขอให้ระงับการใช้ข้อมูลส่วนบุคคลของท่านได้ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
                            </div>

                            <label style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                                padding: "16px",
                                backgroundColor: pdpaAccepted ? "#E8F5E9" : "#FAFAFA",
                                borderRadius: "12px",
                                cursor: "pointer",
                                border: pdpaAccepted ? `2px solid ${colors.primary}` : "2px solid transparent",
                                transition: "all 0.2s"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={pdpaAccepted}
                                    onChange={(e) => setPdpaAccepted(e.target.checked)}
                                    style={{ width: "24px", height: "24px", marginTop: "2px", accentColor: colors.primary }}
                                />
                                <span style={{ fontSize: "14px", color: colors.textDark, lineHeight: 1.5, fontWeight: 500 }}>
                                    ข้าพเจ้าได้อ่านและยินยอมให้กรมการแพทย์แผนไทยและการแพทย์ทางเลือก เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าตามวัตถุประสงค์ที่ระบุไว้ข้างต้น
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Step 1: Account Type */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.textDark }}>เลือกประเภทบัญชี</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {ACCOUNT_TYPES.map((type) => {
                                    const isSelected = accountType === type.type;
                                    return (
                                        <button key={type.type} type="button" onClick={() => setAccountType(type.type)} style={{
                                            display: "flex", alignItems: "center", gap: "16px", padding: "16px", borderRadius: "12px",
                                            border: isSelected ? "none" : `1px solid ${colors.border}`,
                                            backgroundColor: isSelected ? colors.primary : colors.card, cursor: "pointer", textAlign: "left"
                                        }}>
                                            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {getIcon(type.type, isSelected)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: isSelected ? "#FFFFFF" : colors.textDark }}>{type.label}</div>
                                                <div style={{ fontSize: "12px", color: isSelected ? "rgba(255,255,255,0.8)" : colors.textGray }}>{type.subtitle}</div>
                                            </div>
                                            {isSelected && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Identifier */}
                    {step === 2 && currentConfig && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: colors.textDark }}>ยืนยันตัวตน</h2>
                            <p style={{ color: colors.textGray, marginBottom: "16px", fontSize: "14px" }}>กรอก{currentConfig.idLabel}</p>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}><PersonIcon color={colors.primary} /></div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => {
                                        const formatted = formatThaiId(e.target.value);
                                        setIdentifier(formatted);
                                        validateField('identifier', formatted);
                                    }}
                                    placeholder={currentConfig.idHint}
                                    maxLength={17}
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: "48px",
                                        paddingRight: "48px",
                                        fontFamily: "monospace",
                                        letterSpacing: "1px",
                                        borderColor: fieldErrors.identifier?.includes("ไม่ถูกต้อง") ? colors.error :
                                            identifier.replace(/-/g, "").length === 13 && !fieldErrors.identifier ? "#22C55E" : colors.border,
                                        borderWidth: "2px"
                                    }}
                                />
                                {/* Validation icon */}
                                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}>
                                    {identifier.replace(/-/g, "").length === 13 && !fieldErrors.identifier?.includes("ไม่ถูกต้อง") && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                                    )}
                                    {fieldErrors.identifier?.includes("ไม่ถูกต้อง") && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9L9 15M9 9L15 15" /></svg>
                                    )}
                                </div>
                            </div>
                            {/* Inline error message */}
                            {fieldErrors.identifier && (
                                <p style={{
                                    fontSize: "13px",
                                    marginTop: "8px",
                                    color: fieldErrors.identifier.includes("ไม่ถูกต้อง") ? colors.error : colors.textGray,
                                    display: "flex", alignItems: "center", gap: "4px"
                                }}>
                                    {fieldErrors.identifier.includes("ไม่ถูกต้อง") && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                                    )}
                                    {fieldErrors.identifier}
                                </p>
                            )}
                            <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: colors.infoBg, borderRadius: "12px", color: colors.primary, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16V12M12 8H12.01" /></svg>
                                หมายเลขนี้จะใช้เป็น Username ในการเข้าสู่ระบบ
                            </div>
                        </div>
                    )}

                    {/* Step 3: Info */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.textDark }}>{accountType === "INDIVIDUAL" ? "ข้อมูลส่วนตัว" : "ข้อมูลองค์กร"}</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {accountType === "INDIVIDUAL" && (<><div><label style={labelStyle}>ชื่อ</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="สมชาย" style={inputStyle} /></div><div><label style={labelStyle}>นามสกุล</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="ใจดี" style={inputStyle} /></div></>)}
                                {accountType === "JURISTIC" && (<><div><label style={labelStyle}>ชื่อบริษัท/นิติบุคคล</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="บริษัท ABC จำกัด" style={inputStyle} /></div><div><label style={labelStyle}>ชื่อผู้มีอำนาจ</label><input type="text" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} placeholder="นายสมชาย ใจดี" style={inputStyle} /></div></>)}
                                {accountType === "COMMUNITY_ENTERPRISE" && (<><div><label style={labelStyle}>ชื่อวิสาหกิจชุมชน</label><input type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="กลุ่มเกษตรกรบ้านป่า" style={inputStyle} /></div><div><label style={labelStyle}>ชื่อผู้ติดต่อ</label><input type="text" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} placeholder="นายสมชาย ใจดี" style={inputStyle} /></div></>)}
                                <div>
                                    <label style={labelStyle}>เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setPhone(val);
                                            validateField('phone', val);
                                        }}
                                        placeholder="0812345678"
                                        style={{
                                            ...inputStyle,
                                            borderColor: fieldErrors.phone?.includes("ต้องขึ้นต้น") ? colors.error :
                                                phone.length === 10 && !fieldErrors.phone ? "#22C55E" : colors.border,
                                            borderWidth: "2px"
                                        }}
                                    />
                                    {fieldErrors.phone && (
                                        <p style={{ fontSize: "13px", marginTop: "6px", color: fieldErrors.phone.includes("ต้องขึ้นต้น") ? colors.error : colors.textGray }}>
                                            {fieldErrors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Password */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: colors.textDark }}>ตั้งรหัสผ่าน</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={labelStyle}>รหัสผ่าน</label>
                                    <div style={{ position: "relative" }}>
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" style={{ ...inputStyle, paddingRight: "48px" }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}><EyeIcon open={showPassword} /></button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <div style={{ marginTop: "8px" }}>
                                            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} style={{
                                                        flex: 1, height: "4px", borderRadius: "2px",
                                                        backgroundColor: i <= getPasswordStrength(password).level ? getPasswordStrength(password).color : "#E5E7EB"
                                                    }} />
                                                ))}
                                            </div>
                                            <p style={{ fontSize: "12px", color: getPasswordStrength(password).color, fontWeight: 500 }}>
                                                ความแข็งแกร่ง: {getPasswordStrength(password).label}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>ยืนยันรหัสผ่าน</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                validateField('confirmPassword', e.target.value);
                                            }}
                                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                                            style={{
                                                ...inputStyle,
                                                paddingRight: "48px",
                                                borderColor: confirmPassword && password !== confirmPassword ? colors.error :
                                                    confirmPassword && password === confirmPassword ? "#22C55E" : colors.border,
                                                borderWidth: "2px"
                                            }}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}><EyeIcon open={showConfirmPassword} /></button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p style={{ color: colors.error, fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9L9 15M9 9L15 15" /></svg>
                                            รหัสผ่านไม่ตรงกัน
                                        </p>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <p style={{ color: "#22C55E", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                                            รหัสผ่านตรงกัน
                                        </p>
                                    )}
                                </div>
                                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", backgroundColor: "#FAFAFA", borderRadius: "12px", cursor: "pointer" }}>
                                    <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: colors.primary }} />
                                    <span style={{ fontSize: "14px", color: colors.textGray, lineHeight: 1.5 }}>ข้าพเจ้ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                        {step > 0 && <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "14px", border: `1px solid ${colors.border}`, backgroundColor: "transparent", color: colors.textDark, borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>ย้อนกลับ</button>}
                        <button type="button" onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()} disabled={!canProceed() || isLoading} style={{ flex: 1, padding: "14px", backgroundColor: !canProceed() || isLoading ? "#94A3B8" : colors.primary, color: "#FFFFFF", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: !canProceed() || isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            {isLoading ? <span className="spinner"></span> : step < 4 ? <>ถัดไป <span>→</span></> : <>ลงทะเบียน <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg></>}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "24px", textAlign: "center", color: colors.textGray, fontSize: "12px" }}>
                    <p>🔒 ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย</p>
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input:focus { border-color: ${colors.primary} !important; }
                .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
}
