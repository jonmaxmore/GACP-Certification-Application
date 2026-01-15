"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconUser, IconLock, EyeIcon, PersonIcon, BuildingIcon, GroupIcon } from "@/components/ui/icons";
import { formatThaiId } from "@/utils/thai-id-validator";
import { AuthService } from "@/lib/services/auth-service";

const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "1-2345-67890-12-3" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

export default function LoginPage() {
    const router = useRouter();
    const [accountType, setAccountType] = useState("INDIVIDUAL");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginState, setLoginState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    useEffect(() => {
        if (AuthService.isAuthenticated()) {
            window.location.href = "/farmer/dashboard";
            return;
        }
        const remembered = AuthService.getRememberMe();
        if (remembered) {
            setAccountType(remembered.accountType || "INDIVIDUAL");
            setIdentifier(remembered.identifier || "");
            setRememberMe(true);
        }
    }, []);

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setLoginState('loading');

        const cleanIdentifier = identifier.replace(/-/g, "").replace(/[<>'"&]/g, "");
        const cleanPassword = password.trim();

        if (!cleanIdentifier || cleanIdentifier.length < 10) {
            setError("กรุณากรอกเลขประจำตัวให้ครบถ้วน (อย่างน้อย 10 หลัก)");
            setIsLoading(false);
            setLoginState('error');
            return;
        }
        if (!cleanPassword || cleanPassword.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            setLoginState('error');
            return;
        }

        try {
            const result = await AuthService.login({
                accountType,
                identifier: cleanIdentifier,
                password: cleanPassword
            });

            if (!result.success) {
                setError(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            if (rememberMe) {
                AuthService.saveRememberMe(accountType, cleanIdentifier);
            } else {
                AuthService.clearRememberMe();
            }

            setIsLoading(false);
            setLoginState('success');
            setTimeout(() => { window.location.href = "/farmer/dashboard"; }, 1500);

        } catch (err) {
            setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต");
            setIsLoading(false);
            setLoginState('error');
        }
    };

    const getIcon = (type: string, isSelected: boolean) => {
        const color = isSelected ? "#ffffff" : "#166534";
        switch (type) {
            case "INDIVIDUAL": return <PersonIcon color={color} />;
            case "JURISTIC": return <BuildingIcon color={color} />;
            case "COMMUNITY_ENTERPRISE": return <GroupIcon color={color} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-8">
            {/* Loading Overlay */}
            {loginState === 'loading' && (
                <div className="fixed inset-0 bg-green-700/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
                    <p className="text-white text-xl font-semibold">กำลังเข้าสู่ระบบ...</p>
                    <p className="text-green-200 text-sm mt-2">กรุณารอสักครู่</p>
                </div>
            )}

            {/* Success Overlay */}
            {loginState === 'success' && (
                <div className="fixed inset-0 bg-green-600/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-scale-in shadow-green-glow">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-white">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                    <p className="text-white text-3xl font-bold">เข้าสู่ระบบสำเร็จ!</p>
                    <p className="text-green-200 text-base mt-2">กำลังพาคุณไปยังหน้าหลัก...</p>
                </div>
            )}

            {/* Desktop Layout: Two Column */}
            <div className={`w-full max-w-6xl mx-auto flex items-stretch gap-12 transition-opacity ${loginState === 'idle' || loginState === 'error' ? 'opacity-100' : 'opacity-30'}`}>

                {/* Left: Branding Panel */}
                <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-12 text-white shadow-elevated">
                    <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mb-8 shadow-glass overflow-hidden">
                        <Image
                            src="/images/dtam-logo.png"
                            alt="กรมการแพทย์แผนไทยและการแพทย์ทางเลือก"
                            width={100}
                            height={100}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-black text-center mb-4">
                        ระบบรับรองมาตรฐาน<br />GACP
                    </h1>
                    <p className="text-green-200 text-center text-lg mb-8">
                        Good Agricultural and Collection Practices
                    </p>
                    <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-lg text-sm font-semibold shadow-glass">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </div>
                    <div className="mt-12 text-green-200/80 text-sm text-center">
                        <p>มาตรฐานการปลูกและเก็บเกี่ยวพืชสมุนไพร</p>
                        <p className="mt-1">สำหรับการผลิตยาสมุนไพรที่มีคุณภาพ</p>
                    </div>
                </div>

                {/* Right: Login Form */}
                <div className="flex-1 max-w-lg mx-auto lg:mx-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center shadow-green-glow overflow-hidden">
                            <Image
                                src="/images/dtam-logo.png"
                                alt="DTAM Logo"
                                width={60}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-green-800">ระบบรับรองมาตรฐาน GACP</h1>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 shadow-elevated border border-white/50">
                        <h2 className="text-2xl font-bold text-green-800 mb-2">เข้าสู่ระบบ</h2>
                        <p className="text-green-600 mb-8">ลงชื่อเข้าใช้งานเพื่อจัดการใบรับรอง GACP</p>

                        {/* Account Type Selector */}
                        <div className="mb-6">
                            <label className="text-sm font-medium text-green-700 block mb-3">ประเภทผู้ใช้งาน</label>
                            <div className="grid grid-cols-3 gap-3">
                                {ACCOUNT_TYPES.map((type) => {
                                    const isSelected = accountType === type.type;
                                    return (
                                        <button
                                            key={type.type}
                                            type="button"
                                            onClick={() => { setAccountType(type.type); setIdentifier(""); }}
                                            className={`
                                                py-4 px-3 rounded-lg border-2 transition-all duration-200
                                                ${isSelected
                                                    ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 shadow-green-glow'
                                                    : 'bg-white border-green-200 hover:border-green-400 hover:shadow-glass shadow-soft'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-center mb-2">
                                                {getIcon(type.type, isSelected)}
                                            </div>
                                            <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-green-800'}`}>
                                                {type.label}
                                            </div>
                                            <div className={`text-xs mt-1 ${isSelected ? 'text-green-100' : 'text-green-600'}`}>
                                                {type.subtitle}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm mb-6 border border-red-200 shadow-soft">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Identifier */}
                            <div>
                                <label className="text-sm font-semibold text-green-700 block mb-2">
                                    {currentConfig.idLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                                        <PersonIcon />
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                        placeholder={currentConfig.idHint}
                                        maxLength={17}
                                        className="w-full py-4 px-5 pl-12 border-2 border-green-200 rounded-xl text-lg font-mono tracking-wider bg-white/50 backdrop-blur-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-soft"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-semibold text-green-700 block mb-2">
                                    รหัสผ่าน
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500">
                                        <IconLock />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                                        onKeyDown={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                                        placeholder="กรอกรหัสผ่าน"
                                        className="w-full py-4 px-5 pl-12 pr-12 border-2 border-green-200 rounded-xl text-lg bg-white/50 backdrop-blur-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-soft"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-green-500 hover:text-green-700 transition-colors"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                {capsLockOn && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                                        ⚠️ Caps Lock เปิดอยู่
                                    </p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-5 h-5 accent-green-600 rounded"
                                    />
                                    <span className="text-sm text-green-700">จดจำการเข้าสู่ระบบ</span>
                                </label>
                                <Link href="/forgot-password" className="text-sm text-green-600 font-semibold hover:text-green-800 hover:underline transition-colors">
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    w-full py-4 rounded-lg text-white text-lg font-bold flex items-center justify-center gap-3 transition-all duration-200
                                    ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-glow hover:shadow-green-glow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-glass-pressed'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>เข้าสู่ระบบ <span className="text-2xl">→</span></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Register Link */}
                    <div className="text-center mt-8">
                        <p className="text-green-700 text-sm mb-4">ยังไม่มีบัญชีใช้งาน?</p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-green-300 rounded-lg text-green-700 font-semibold bg-white/80 backdrop-blur-sm hover:border-green-500 hover:bg-green-50 hover:shadow-glass transition-all shadow-soft"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20C4 16.6863 7.58172 14 12 14" />
                                <path d="M16 19L19 19M19 19L19 16M19 19L16 16" />
                            </svg>
                            ลงทะเบียนผู้ใช้ใหม่
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
