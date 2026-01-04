"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api-client";
import { formatThaiId } from "@/utils/thai-id-validator";

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
    const [pdpaScrolled, setPdpaScrolled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (step === 0 && !pdpaScrolled) {
            const timer = setTimeout(() => setPdpaScrolled(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [step, pdpaScrolled]);

    useEffect(() => {
        const savedData = localStorage.getItem("register_draft");
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                setStep(data.step || 0);
                setAccountType(data.accountType || "");
                setIdentifier(data.identifier || "");
                setFirstName(data.firstName || "");
                setLastName(data.lastName || "");
                setCompanyName(data.companyName || "");
                setRepresentativeName(data.representativeName || "");
                setCommunityName(data.communityName || "");
                setPhone(data.phone || "");
                setEmail(data.email || "");
                setPdpaAccepted(data.pdpaAccepted || false);
                setPdpaScrolled(data.pdpaScrolled || false);
            } catch { }
        }
    }, []);

    useEffect(() => {
        const data = { step, accountType, identifier, firstName, lastName, companyName, representativeName, communityName, phone, email, pdpaAccepted, pdpaScrolled };
        localStorage.setItem("register_draft", JSON.stringify(data));
    }, [step, accountType, identifier, firstName, lastName, companyName, representativeName, communityName, phone, email, pdpaAccepted, pdpaScrolled]);

    const validateThaiId = (id: string): boolean => {
        const digits = id.replace(/-/g, "");
        if (digits.length !== 13 || !/^\d{13}$/.test(digits)) return false;
        let sum = 0;
        for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (13 - i);
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === parseInt(digits[12]);
    };

    const getPasswordStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: "อ่อนมาก", color: "bg-red-500" };
        if (score === 2) return { level: 2, label: "อ่อน", color: "bg-orange-500" };
        if (score === 3) return { level: 3, label: "ปานกลาง", color: "bg-yellow-500" };
        if (score === 4) return { level: 4, label: "แข็งแกร่ง", color: "bg-green-500" };
        return { level: 5, label: "แข็งแกร่งมาก", color: "bg-emerald-600" };
    };

    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        switch (field) {
            case 'identifier':
                const cleanId = value.replace(/-/g, "");
                if (accountType === "INDIVIDUAL" && cleanId.length === 13) {
                    if (!validateThaiId(value)) errors.identifier = "เลขบัตรประชาชนไม่ถูกต้อง";
                    else delete errors.identifier;
                } else if (cleanId.length > 0 && cleanId.length < 13) {
                    errors.identifier = `กรอกแล้ว ${cleanId.length}/13 หลัก`;
                } else delete errors.identifier;
                break;
            case 'phone':
                if (value.length > 0 && value.length < 10) errors.phone = `กรอกแล้ว ${value.length}/10 หลัก`;
                else if (value.length === 10 && !/^0[689]\d{8}$/.test(value)) errors.phone = "เบอร์ต้องขึ้นต้นด้วย 06, 08, หรือ 09";
                else delete errors.phone;
                break;
            case 'confirmPassword':
                if (value && value !== password) errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
                else delete errors.confirmPassword;
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
                else delete errors.email;
                break;
        }
        setFieldErrors(errors);
    };

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType);

    const canProceed = () => {
        switch (step) {
            case 0: return pdpaAccepted;
            case 1: return accountType !== "";
            case 2: return identifier.replace(/-/g, "").length >= 10;
            case 3:
                if (accountType === "INDIVIDUAL") return firstName && lastName && phone.length >= 10;
                if (accountType === "JURISTIC") return companyName && representativeName && phone.length >= 10;
                return communityName && representativeName && phone.length >= 10;
            case 4: return password.length >= 8 && password === confirmPassword && acceptTerms;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setError("");
        setIsLoading(true);

        const sanitize = (str: string) => str.trim().replace(/[<>'"&]/g, "");
        const cleanIdentifier = identifier.replace(/-/g, "").replace(/[<>'"&]/g, "");
        const cleanPhone = phone.replace(/[<>'"&]/g, "");
        const cleanPassword = password.trim();

        if (!cleanIdentifier || cleanIdentifier.length < 10) { setError("กรุณากรอกเลขประจำตัวให้ครบถ้วน"); setIsLoading(false); return; }
        if (!cleanPhone || cleanPhone.length !== 10) { setError("เบอร์โทรศัพท์ต้องมี 10 หลัก"); setIsLoading(false); return; }
        if (!cleanPassword || cleanPassword.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); setIsLoading(false); return; }

        const data: Record<string, string> = { accountType, identifier: cleanIdentifier, phoneNumber: cleanPhone, password: cleanPassword };
        if (accountType === "INDIVIDUAL") { data.firstName = sanitize(firstName); data.lastName = sanitize(lastName); data.idCard = cleanIdentifier; }
        else if (accountType === "JURISTIC") { data.companyName = sanitize(companyName); data.representativeName = sanitize(representativeName); data.taxId = cleanIdentifier; }
        else { data.communityName = sanitize(communityName); data.representativeName = sanitize(representativeName); data.communityRegistrationNo = identifier.replace(/[<>'"&]/g, ""); }

        const result = await api.post<{ success: boolean }>("/auth-farmer/register", data);
        if (!result.success) { setError(result.error); setIsLoading(false); return; }

        setIsLoading(false);
        localStorage.removeItem("register_draft");
        const name = accountType === "INDIVIDUAL" ? `${firstName} ${lastName}` : accountType === "JURISTIC" ? companyName : communityName;
        const formattedId = identifier.includes("-") ? identifier : formatThaiId(identifier);
        router.push(`/register/success?type=${accountType}&id=${encodeURIComponent(formattedId)}&name=${encodeURIComponent(name)}`);
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

    const inputClass = "w-full py-3.5 px-4 border border-slate-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
    const labelClass = "text-sm font-semibold text-emerald-700 block mb-2";

    return (
        <div className="min-h-screen bg-stone-50 p-6">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/login" className="text-sm text-slate-500 flex items-center gap-1 hover:text-emerald-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                    <h1 className="text-2xl font-black text-emerald-700 mt-4">ลงทะเบียนผู้ใช้ใหม่</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex gap-1 mb-6">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex-1">
                            <div className={`h-1.5 rounded transition-colors ${i <= step ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                            <p className={`text-[10px] text-center mt-1.5 ${i <= step ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {error && (
                        <div className="p-3 bg-red-50 rounded-xl text-red-600 text-sm mb-4 flex items-center gap-2 border border-red-100">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8V12M12 16H12.01" /></svg>
                            {error}
                        </div>
                    )}

                    {/* Step 0: PDPA */}
                    {step === 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">ยินยอมข้อมูลส่วนบุคคล (PDPA)</h2>
                            <div
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                    if (scrollTop + clientHeight >= scrollHeight - 20) setPdpaScrolled(true);
                                }}
                                className="max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-xl mb-4 text-sm text-slate-600 leading-relaxed"
                            >
                                <p className="font-bold text-slate-800 mb-3">📋 วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</p>
                                <p className="mb-3">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก มีความจำเป็นต้องเก็บข้อมูลส่วนบุคคลเพื่อ:</p>
                                <ul className="list-disc pl-5 mb-3 space-y-1">
                                    <li>การยื่นขอการรับรองมาตรฐาน GACP</li>
                                    <li>การตรวจสอบและประเมินแหล่งปลูกพืชสมุนไพร</li>
                                    <li>การออกใบรับรองมาตรฐาน และการติดตามผล</li>
                                </ul>
                                <p className="font-bold text-slate-800 mb-3">🔒 ข้อมูลที่จัดเก็บ</p>
                                <ul className="list-disc pl-5 mb-3 space-y-1">
                                    <li>ข้อมูลส่วนตัว: ชื่อ-นามสกุล, เลขบัตรประชาชน</li>
                                    <li>ข้อมูลการติดต่อ: ที่อยู่, เบอร์โทร, อีเมล</li>
                                    <li>ข้อมูลสถานประกอบการ: พิกัด GPS, รูปถ่าย</li>
                                </ul>
                                <p className="font-bold text-slate-800 mb-3">✅ สิทธิของท่าน</p>
                                <p>ท่านมีสิทธิในการเข้าถึง แก้ไข ลบ หรือร้องขอให้ระงับการใช้ข้อมูลได้ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
                            </div>
                            {!pdpaScrolled && <p className="text-xs text-slate-400 mb-3 text-center">⬇️ กรุณาเลื่อนอ่านข้อความให้จบก่อน</p>}
                            <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${pdpaAccepted ? 'bg-emerald-50 border-emerald-500' : pdpaScrolled ? 'bg-slate-50 border-transparent hover:border-slate-200' : 'bg-slate-100 border-transparent opacity-60'}`}>
                                <input type="checkbox" checked={pdpaAccepted} onChange={(e) => pdpaScrolled && setPdpaAccepted(e.target.checked)} disabled={!pdpaScrolled} className="w-6 h-6 mt-0.5 accent-emerald-600" />
                                <span className={`text-sm leading-relaxed ${pdpaScrolled ? 'text-slate-700' : 'text-slate-400'}`}>
                                    ข้าพเจ้าได้อ่านและยินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตามวัตถุประสงค์ที่ระบุ
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Step 1: Account Type */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">เลือกประเภทบัญชี</h2>
                            <div className="flex flex-col gap-3">
                                {ACCOUNT_TYPES.map((type) => {
                                    const isSelected = accountType === type.type;
                                    return (
                                        <button key={type.type} type="button" onClick={() => setAccountType(type.type)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${isSelected ? 'bg-emerald-700 border-emerald-700' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                                                {getIcon(type.type, isSelected)}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{type.label}</div>
                                                <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{type.subtitle}</div>
                                            </div>
                                            {isSelected && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Identifier */}
                    {step === 2 && currentConfig && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-2">ยืนยันตัวตน</h2>
                            <p className="text-slate-500 mb-4 text-sm">กรอก{currentConfig.idLabel}</p>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><PersonIcon color="#059669" /></div>
                                <input type="text" value={identifier}
                                    onChange={(e) => { const formatted = formatThaiId(e.target.value); setIdentifier(formatted); validateField('identifier', formatted); }}
                                    placeholder={currentConfig.idHint} maxLength={17}
                                    className={`${inputClass} pl-12 pr-12 font-mono tracking-wider border-2 ${fieldErrors.identifier?.includes("ไม่ถูกต้อง") ? 'border-red-500' : identifier.replace(/-/g, "").length === 13 && !fieldErrors.identifier ? 'border-green-500' : 'border-slate-200'}`}
                                />
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                    {identifier.replace(/-/g, "").length === 13 && !fieldErrors.identifier?.includes("ไม่ถูกต้อง") && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                                    )}
                                    {fieldErrors.identifier?.includes("ไม่ถูกต้อง") && (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9L9 15M9 9L15 15" /></svg>
                                    )}
                                </div>
                            </div>
                            {fieldErrors.identifier && <p className={`text-sm mt-2 ${fieldErrors.identifier.includes("ไม่ถูกต้อง") ? 'text-red-500' : 'text-slate-500'}`}>{fieldErrors.identifier}</p>}
                            <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16V12M12 8H12.01" /></svg>
                                หมายเลขนี้จะใช้เป็น Username ในการเข้าสู่ระบบ
                            </div>
                        </div>
                    )}

                    {/* Step 3: Info */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">{accountType === "INDIVIDUAL" ? "ข้อมูลส่วนตัว" : "ข้อมูลองค์กร"}</h2>
                            <div className="space-y-4">
                                {accountType === "INDIVIDUAL" && (
                                    <>
                                        <div><label className={labelClass}>ชื่อ</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="สมชาย" className={inputClass} /></div>
                                        <div><label className={labelClass}>นามสกุล</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="ใจดี" className={inputClass} /></div>
                                    </>
                                )}
                                {accountType === "JURISTIC" && (
                                    <>
                                        <div><label className={labelClass}>ชื่อบริษัท/นิติบุคคล</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="บริษัท ABC จำกัด" className={inputClass} /></div>
                                        <div><label className={labelClass}>ชื่อผู้มีอำนาจ</label><input type="text" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} placeholder="นายสมชาย ใจดี" className={inputClass} /></div>
                                    </>
                                )}
                                {accountType === "COMMUNITY_ENTERPRISE" && (
                                    <>
                                        <div><label className={labelClass}>ชื่อวิสาหกิจชุมชน</label><input type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="กลุ่มเกษตรกรบ้านป่า" className={inputClass} /></div>
                                        <div><label className={labelClass}>ชื่อผู้ติดต่อ</label><input type="text" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} placeholder="นายสมชาย ใจดี" className={inputClass} /></div>
                                    </>
                                )}
                                <div>
                                    <label className={labelClass}>เบอร์โทรศัพท์</label>
                                    <input type="tel" value={phone}
                                        onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setPhone(val); validateField('phone', val); }}
                                        placeholder="0812345678"
                                        className={`${inputClass} border-2 ${fieldErrors.phone?.includes("ต้องขึ้นต้น") ? 'border-red-500' : phone.length === 10 && !fieldErrors.phone ? 'border-green-500' : 'border-slate-200'}`}
                                    />
                                    {fieldErrors.phone && <p className={`text-sm mt-1.5 ${fieldErrors.phone.includes("ต้องขึ้นต้น") ? 'text-red-500' : 'text-slate-500'}`}>{fieldErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>อีเมล <span className="text-slate-400 font-normal">(ไม่บังคับ)</span></label>
                                    <input type="email" value={email}
                                        onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
                                        placeholder="email@example.com"
                                        className={`${inputClass} ${email ? 'border-2' : ''} ${fieldErrors.email ? 'border-red-500' : email && !fieldErrors.email ? 'border-green-500' : ''}`}
                                    />
                                    {fieldErrors.email && <p className="text-sm mt-1.5 text-red-500">{fieldErrors.email}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Password */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4">ตั้งรหัสผ่าน</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>รหัสผ่าน</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" className={`${inputClass} pr-12`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><EyeIcon open={showPassword} /></button>
                                    </div>
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={`flex-1 h-1 rounded ${i <= getPasswordStrength(password).level ? getPasswordStrength(password).color : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${getPasswordStrength(password).color.replace('bg-', 'text-')}`}>ความแข็งแกร่ง: {getPasswordStrength(password).label}</p>
                                            <div className="text-xs mt-2 space-y-1">
                                                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-500' : 'text-slate-400'}`}>{password.length >= 8 ? "✅" : "⬜"} อย่างน้อย 8 ตัวอักษร</div>
                                                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>{/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✅" : "⬜"} มีตัวพิมพ์เล็กและใหญ่</div>
                                                <div className={`flex items-center gap-1.5 ${/\d/.test(password) ? 'text-green-500' : 'text-slate-400'}`}>{/\d/.test(password) ? "✅" : "⬜"} มีตัวเลข</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>ยืนยันรหัสผ่าน</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                                            className={`${inputClass} pr-12 border-2 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : confirmPassword && password === confirmPassword ? 'border-green-500' : 'border-slate-200'}`}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><EyeIcon open={showConfirmPassword} /></button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">❌ รหัสผ่านไม่ตรงกัน</p>}
                                    {confirmPassword && password === confirmPassword && <p className="text-green-500 text-xs mt-1.5 flex items-center gap-1">✅ รหัสผ่านตรงกัน</p>}
                                </div>
                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                                    <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="w-5 h-5 mt-0.5 accent-emerald-600" />
                                    <span className="text-sm text-slate-600">ข้าพเจ้ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-6">
                        {step > 0 && (
                            <button type="button" onClick={() => setStep(step - 1)}
                                className="flex-1 py-4 border border-slate-200 bg-transparent text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                                ย้อนกลับ
                            </button>
                        )}
                        <button type="button" onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()} disabled={!canProceed() || isLoading}
                            className={`flex-1 py-4 rounded-2xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all ${!canProceed() || isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5'}`}>
                            {isLoading ? <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                : step < 4 ? <>ถัดไป <span className="text-lg">→</span></> : <>ลงทะเบียน ✓</>}
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-slate-400 text-xs">🔒 ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย</div>
            </div>
        </div>
    );
}
