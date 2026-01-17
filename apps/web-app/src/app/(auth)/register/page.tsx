"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatThaiId } from "@/utils/thai-id-validator";
import { AuthService } from "@/lib/services/auth-service";
import { Icons, PersonIcon, BuildingIcon, GroupIcon, EyeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายยอด", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3", icon: PersonIcon },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8", icon: BuildingIcon },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX", icon: GroupIcon },
];

const STEPS = ["PDPA", "ACCOUNT", "IDENTITY", "PERSONAL", "SECURITY"];

export default function RegisterPage() {
    const router = useRouter();
    const { dict } = useLanguage();
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
        const savedData = localStorage.getItem("register_draft");
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        switch (field) {
            case 'phone':
                if (value.length > 0 && value.length < 10) errors.phone = `กรอกแล้ว ${value.length}/10 หลัก`;
                else if (value.length === 10 && !/^0[689]\d{8}$/.test(value)) errors.phone = "เบอร์ต้องขึ้นต้นด้วย 06, 08, หรือ 09";
                else delete errors.phone;
                break;
            case 'confirmPassword':
                if (value && value !== password) errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
                else delete errors.confirmPassword;
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

        const data: Record<string, string> = { accountType, identifier: cleanIdentifier, phoneNumber: cleanPhone, password: cleanPassword };
        if (accountType === "INDIVIDUAL") { data.firstName = sanitize(firstName); data.lastName = sanitize(lastName); }
        else if (accountType === "JURISTIC") { data.companyName = sanitize(companyName); data.representativeName = sanitize(representativeName); }
        else { data.communityName = sanitize(communityName); data.representativeName = sanitize(representativeName); }

        try {
            const result = await AuthService.register(data);
            if (!result.success) { setError(result.error || "เกิดข้อผิดพลาดในการลงทะเบียน"); setIsLoading(false); return; }

            localStorage.removeItem("register_draft");
            const name = accountType === "INDIVIDUAL" ? `${firstName} ${lastName}` : accountType === "JURISTIC" ? companyName : communityName;
            router.push(`/register/success?type=${accountType}&id=${encodeURIComponent(identifier)}&name=${encodeURIComponent(name)}`);
        } catch (err) {
            setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-sans">

            {/* LEFT PANEL (Marketing - Register Context) */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#006837] relative flex-col items-center justify-center overflow-hidden z-0 text-white p-12 text-center">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#005c30] to-[#003820] opacity-100 z-0"></div>
                <div className="absolute inset-0 bg-[url('/images/thai-pattern-bg.png')] opacity-[0.06] mix-blend-overlay bg-repeat bg-[length:300px] z-0"></div>

                {/* Decorative Glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center animate-fade-in-up w-full max-w-lg">

                    {/* Official Logo Container */}
                    <div className="mb-10 relative cursor-default">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full p-4 flex items-center justify-center border border-white/20 shadow-xl">
                            <img src="/images/dtam-logo.png" alt="MOPH" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-bold leading-tight drop-shadow-lg mb-4 tracking-tight">
                        ลงทะเบียนผู้ประกอบการ<br />
                        <span className="text-emerald-300">เข้าสู่ระบบ GACP</span>
                    </h1>

                    {/* Subheader */}
                    <p className="text-emerald-50/90 text-base font-light leading-relaxed mb-10 max-w-sm mx-auto">
                        ร่วมเป็นส่วนหนึ่งในการยกระดับสมุนไพรไทย<br />
                        เข้าถึงตลาดสากล ด้วยมาตรฐานที่ตรวจสอบได้
                    </p>

                    {/* Steps Indicator on Left Panel */}
                    <div className="w-full max-w-xs space-y-4 text-left">
                        {STEPS.map((stepLabel, i) => (
                            <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${i === step ? 'opacity-100 scale-105' : i < step ? 'opacity-60' : 'opacity-30'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${i <= step ? 'bg-emerald-400 border-emerald-400 text-[#006837]' : 'border-white/30 text-white'}`}>
                                    {i < step ? <Icons.CheckCircle className="w-5 h-5" /> : i + 1}
                                </div>
                                <span className="font-bold tracking-wider text-sm">{stepLabel}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Footer Credit */}
                <div className="absolute bottom-8 text-emerald-200/40 text-[10px] uppercase tracking-[0.2em] font-medium">
                    Official Registration Portal
                </div>
            </div>

            {/* RIGHT PANEL (Content) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-16 bg-white relative z-10 overflow-auto">
                <div className="w-full max-w-[600px] animate-slide-up">

                    {/* Header Details */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">ลงทะเบียน</h2>
                            <p className="text-slate-500 text-sm font-medium">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างบัญชี</p>
                        </div>
                        <span className="text-xs font-black text-[#006837] px-3 py-1 bg-[#006837]/10 rounded-full uppercase tracking-widest">
                            Step {step + 1} / {STEPS.length}
                        </span>
                    </div>

                    {/* Progress Bar (Mobile Only) */}
                    <div className="flex gap-2 mb-8 lg:hidden">
                        {STEPS.map((_, i) => (
                            <div key={i} className="flex-1 overflow-hidden">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#006837]' : 'bg-slate-100'}`} />
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
                            <Icons.Warning className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 0: PDPA */}
                    {step === 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-black text-slate-800 mb-4">นโยบายความเป็นส่วนตัว</h3>
                            <div
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                    if (scrollTop + clientHeight >= scrollHeight - 30) setPdpaScrolled(true);
                                }}
                                className="h-64 overflow-y-auto p-6 bg-slate-50 rounded-3xl mb-6 text-sm text-slate-500 leading-relaxed border border-slate-100"
                            >
                                <p className="font-bold text-slate-700 mb-4 uppercase tracking-wider">ข้อกำหนดและเงื่อนไขการใช้บริการ</p>
                                <p className="mb-4">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM) มีความจำเป็นต้องเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน เพื่อใช้ในกระบวนการพิจารณารับรองมาตรฐาน GACP Thailand...</p>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-slate-700">1. การจัดเก็บข้อมูล</h4>
                                        <p>เราจัดเก็บข้อมูลชื่อ นามสกุล เลขบัตรประชาชน และพิกัดสถานประกอบการของท่าน...</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">2. วัตถุประสงค์</h4>
                                        <p>เพื่อระบุตัวตนและยืนยันสิทธิในการถือครองใบรับรองมาตรฐานเกษตรปลอดภัย...</p>
                                    </div>
                                </div>
                            </div>

                            <label className={`
                                flex items-start gap-4 p-6 rounded-3xl border-2 transition-all cursor-pointer
                                ${pdpaAccepted ? 'bg-[#006837]/5 border-[#006837]' : 'bg-white border-slate-100 hover:border-slate-200'}
                                ${!pdpaScrolled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                            `}>
                                <div className={`
                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5
                                    ${pdpaAccepted ? 'bg-[#006837] border-[#006837]' : 'bg-white border-slate-200'}
                                `}>
                                    {pdpaAccepted && <Icons.CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={pdpaAccepted}
                                    disabled={!pdpaScrolled}
                                    onChange={(e) => setPdpaAccepted(e.target.checked)}
                                />
                                <span className={`text-sm font-bold ${pdpaAccepted ? 'text-[#006837]' : 'text-slate-500'}`}>
                                    {pdpaScrolled ? 'ฉันได้อ่านและยอมรับตามเงื่อนไขที่ระบุข้างต้น' : 'กรุณาเลื่อนอ่านข้อมูลให้จบเพื่อยอมรับเงื่อนไข'}
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Step 1: Account Type */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-black text-slate-800 mb-6">เลือกประเภทบัญชีของคุณ</h3>
                            <div className="space-y-4">
                                {ACCOUNT_TYPES.map((type) => {
                                    const isSelected = accountType === type.type;
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.type}
                                            type="button"
                                            onClick={() => setAccountType(type.type)}
                                            className={`
                                                w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left
                                                ${isSelected
                                                    ? 'bg-[#006837] border-[#006837] text-white shadow-lg shadow-[#006837]/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-[#006837]/30'
                                                }
                                            `}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                                                <Icon className="w-8 h-8" color={isSelected ? 'white' : undefined} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`text-lg font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>{type.label}</div>
                                                <div className={`text-xs font-bold ${isSelected ? 'text-emerald-100/70' : 'text-slate-400'}`}>{type.subtitle}</div>
                                            </div>
                                            {isSelected && <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center"><Icons.CheckCircle className="w-4 h-4 text-[#006837]" /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Identity */}
                    {step === 2 && currentConfig && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-black text-slate-800 mb-2">ยืนยันตัวตน</h3>
                            <p className="text-slate-500 text-sm mb-8 font-medium">กรุณาระบุ{currentConfig.idLabel}</p>

                            <div className="relative group mb-6">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006837] transition-colors">
                                    <PersonIcon className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                    placeholder={currentConfig.idHint}
                                    maxLength={17}
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-5 pl-14 pr-14 text-xl font-mono tracking-[0.1em] focus:bg-white focus:border-[#006837] outline-none transition-all placeholder:text-slate-200 text-slate-800"
                                />
                                {identifier.replace(/-/g, '').length === 13 && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 animate-scale-in">
                                        <Icons.CheckCircle className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <div className="p-5 bg-[#006837]/5 rounded-3xl border border-[#006837]/10 flex items-start gap-3">
                                <div className="p-2 bg-[#006837]/10 rounded-xl text-[#006837] mt-0.5"><Icons.Info className="w-4 h-4" /></div>
                                <p className="text-sm font-bold text-[#006837]/80 leading-snug">หมายเลขประจำตัวนี้จะถูกใช้เป็นชื่อผู้ใช้งาน (Username) สำหรับเข้าสู่ระบบ และใช้ในการตรวจสอบสิทธิเบื้องต้น</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Info */}
                    {step === 3 && (
                        <div className="animate-fade-in overflow-y-auto max-h-[500px] no-scrollbar px-1">
                            <h3 className="text-xl font-black text-slate-800 mb-6">{accountType === "INDIVIDUAL" ? "ข้อมูลส่วนตัว" : "ข้อมูลสถานประกอบการ"}</h3>
                            <div className="space-y-6">
                                {accountType === "INDIVIDUAL" ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">ชื่อ</label>
                                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="สมชาย" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-5 focus:bg-white focus:border-[#006837] outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">นามสกุล</label>
                                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="ใจดี" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-5 focus:bg-white focus:border-[#006837] outline-none transition-all" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{accountType === 'JURISTIC' ? 'ชื่อบริษัท' : 'ชื่อวิสาหกิจ'}</label>
                                        <input type="text" value={accountType === 'JURISTIC' ? companyName : communityName} onChange={(e) => accountType === 'JURISTIC' ? setCompanyName(e.target.value) : setCommunityName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-5 focus:bg-white focus:border-[#006837] outline-none transition-all" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">เบอร์โทรศัพท์ (10 หลัก)</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        placeholder="08XXXXXXXX"
                                        onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setPhone(val); validateField('phone', val); }}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-5 font-mono text-lg focus:bg-white focus:border-[#006837] outline-none transition-all"
                                    />
                                    {fieldErrors.phone && <p className="text-xs font-bold text-rose-500 px-1">{fieldErrors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">อีเมล (ถ้ามี)</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-5 focus:bg-white focus:border-[#006837] outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Security */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-black text-slate-800 mb-6">ตั้งรหัสผ่านที่ปลอดภัย</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">กำหนดรหัสผ่านใหม่</label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-4 px-6 focus:bg-white focus:border-[#006837] outline-none transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#006837] transition-colors">
                                            <EyeIcon open={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">ยืนยันรหัสผ่าน</label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); validateField('confirmPassword', e.target.value); }}
                                            placeholder="••••••••"
                                            className={`w-full bg-slate-50 border-2 rounded-[2rem] py-4 px-6 focus:bg-white focus:border-[#006837] outline-none transition-all ${confirmPassword ? (password === confirmPassword ? 'border-emerald-500' : 'border-rose-500') : 'border-slate-50'}`}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#006837] transition-colors">
                                            <EyeIcon open={showConfirmPassword} />
                                        </button>
                                    </div>
                                </div>

                                <label className="flex items-center gap-4 p-6 rounded-3xl border-2 border-[#006837]/5 bg-[#006837]/5 cursor-pointer group hover:bg-[#006837]/10 transition-all">
                                    <div className={`
                                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5
                                        ${acceptTerms ? 'bg-[#006837] border-[#006837]' : 'bg-white border-[#006837]/20 group-hover:border-[#006837]/40'}
                                    `}>
                                        {acceptTerms && <Icons.CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                                    <span className="text-sm font-bold text-[#006837]/80">ข้าพเจ้ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-12 w-full">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex-1 py-5 rounded-full border-2 border-slate-100 font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                {dict?.common?.back || 'ย้อนกลับ'}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                            disabled={!canProceed() || isLoading}
                            className="flex-[2] bg-[#006837] text-white hover:bg-[#00502b] shadow-lg shadow-[#006837]/30 py-5 rounded-full font-black text-lg tracking-tight flex items-center justify-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {step < 4 ? 'ดำเนินการต่อ' : 'ยืนยันลงทะเบียน'}
                                    <Icons.ArrowRight className="w-6 h-6 ml-2" />
                                </>
                            )}
                        </button>
                    </div>

                    {step === 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                            <p className="text-slate-400 text-sm font-medium mb-4">มีบัญชีผู้ใช้งานอยู่แล้ว?</p>
                            <Link href="/login" className="text-[#006837] font-black hover:underline uppercase tracking-widest text-xs">เข้าสู่ระบบที่นี่</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
