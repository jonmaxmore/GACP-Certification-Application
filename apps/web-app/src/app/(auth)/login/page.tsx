"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
        // Check if already logged in using centralized AuthService
        if (AuthService.isAuthenticated()) {
            window.location.href = "/farmer/dashboard";
            return;
        }

        // Check remember me preference
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('/api/auth-farmer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountType, identifier: cleanIdentifier, password: cleanPassword }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (!result.success) {
                let errorMsg = result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
                setError(errorMsg);
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            const responseData = result.data?.data || result.data;
            const token = responseData?.tokens?.accessToken || responseData?.token;

            if (!token) {
                setError("ไม่พบข้อมูล Token จากเซิร์ฟเวอร์");
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            // Save session using centralized AuthService
            AuthService.saveSession({
                token,
                tokens: responseData?.tokens,
                user: responseData?.user,
            });

            // Handle remember me preference
            if (rememberMe) {
                AuthService.saveRememberMe(accountType, cleanIdentifier);
            } else {
                AuthService.clearRememberMe();
            }

            setIsLoading(false);
            setLoginState('success');
            setTimeout(() => { window.location.href = "/farmer/dashboard"; }, 1500);

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError("การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่");
            } else {
                setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต");
            }
            setIsLoading(false);
            setLoginState('error');
        }
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

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative">
            {/* Loading Overlay */}
            {loginState === 'loading' && (
                <div className="fixed inset-0 bg-emerald-700/95 flex flex-col items-center justify-center z-50 animate-fadeIn">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
                    <p className="text-white text-lg font-semibold">กำลังเข้าสู่ระบบ...</p>
                    <p className="text-white/70 text-sm mt-2">กรุณารอสักครู่</p>
                </div>
            )}

            {/* Success Overlay */}
            {loginState === 'success' && (
                <div className="fixed inset-0 bg-emerald-600/97 flex flex-col items-center justify-center z-50 animate-fadeIn">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-scaleIn">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                    <p className="text-white text-2xl font-bold">เข้าสู่ระบบสำเร็จ!</p>
                    <p className="text-white/80 text-sm mt-2">กำลังพาคุณไปยังหน้าหลัก...</p>
                </div>
            )}

            <div className={`w-full max-w-md transition-opacity ${loginState === 'idle' || loginState === 'error' ? 'opacity-100' : 'opacity-30'}`}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-5 bg-emerald-50 rounded-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 48 48" className="fill-emerald-700">
                            <path d="M24 4C24 4 12 14 12 28C12 36 17 44 24 44C31 44 36 36 36 28C36 14 24 4 24 4Z" />
                            <path d="M24 8C24 8 16 16 16 27C16 33 19 38 24 38C29 38 32 33 32 27C32 16 24 8 24 8Z" fill="white" fillOpacity="0.3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-emerald-700 mb-3">
                        ระบบรับรองมาตรฐาน GACP
                    </h1>
                    <div className="inline-block px-5 py-2 bg-emerald-50 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {/* Account Type Selector */}
                    <div className="mb-5">
                        <label className="text-sm text-slate-500 block mb-3">ประเภทผู้ใช้งาน</label>
                        <div className="flex gap-2">
                            {ACCOUNT_TYPES.map((type) => {
                                const isSelected = accountType === type.type;
                                return (
                                    <button
                                        key={type.type}
                                        type="button"
                                        onClick={() => { setAccountType(type.type); setIdentifier(""); }}
                                        className={`flex-1 py-3 px-2 rounded-xl border transition-all ${isSelected
                                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 border-emerald-600 shadow-md shadow-emerald-600/20'
                                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-center mb-1.5">
                                            {getIcon(type.type, isSelected)}
                                        </div>
                                        <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                            {type.label}
                                        </div>
                                        <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                                            {type.subtitle}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 rounded-xl text-red-600 text-sm mb-4 border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Identifier */}
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-emerald-700 block mb-2">
                                {currentConfig.idLabel}
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                    <PersonIcon color="#059669" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                    placeholder={currentConfig.idHint}
                                    maxLength={17}
                                    className="w-full py-3.5 px-4 pl-12 border border-slate-200 rounded-xl text-base font-mono tracking-wider outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label className="text-sm font-semibold text-emerald-700 block mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                    <IconLock />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyUp={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                                    onKeyDown={(e) => setCapsLockOn(e.getModifierState("CapsLock"))}
                                    placeholder="กรอกรหัสผ่าน"
                                    className="w-full py-3.5 px-12 border border-slate-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none cursor-pointer"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {capsLockOn && (
                                <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                                    ⚠️ Caps Lock เปิดอยู่
                                </p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex justify-between items-center mb-5">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 accent-emerald-600"
                                />
                                <span className="text-sm text-slate-500">จดจำการเข้าสู่ระบบ</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-emerald-600 font-medium hover:underline">
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl text-white text-lg font-bold flex items-center justify-center gap-2 transition-all ${isLoading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>เข้าสู่ระบบ <span className="text-xl">→</span></>
                            )}
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <div className="text-center mt-7">
                    <p className="text-slate-500 text-sm mb-3">ยังไม่มีบัญชีใช้งาน?</p>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-2 px-7 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold bg-white hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20C4 16.6863 7.58172 14 12 14" />
                            <path d="M16 19L19 19M19 19L19 16M19 19L16 16" />
                        </svg>
                        ลงทะเบียนผู้ใช้ใหม่
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease; }
                .animate-scaleIn { animation: scaleIn 0.4s ease; }
            `}</style>
        </div>
    );
}
