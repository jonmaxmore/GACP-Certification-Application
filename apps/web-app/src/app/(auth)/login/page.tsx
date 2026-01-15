"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLock, PersonIcon, Icons, EyeIcon, BuildingIcon, GroupIcon } from "@/components/ui/icons";
import { formatThaiId } from "@/utils/thai-id-validator";
import { AuthService } from "@/lib/services/auth-service";

const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "Individual", idLabel: "เลขบัตรประชาชน", idHint: "x-xxxx-xxxxx-xx-x", icon: PersonIcon },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "Juristic", idLabel: "เลขทะเบียนนิติบุคคล", idHint: "0-0000-00000-00-0", icon: BuildingIcon },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "Community", idLabel: "ทะเบียนวิสาหกิจชุมชน", idHint: "x-xx-xx-xx/x-xxxx", icon: GroupIcon },
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

        try {
            const result = await AuthService.login({ accountType, identifier: cleanIdentifier, password: cleanPassword });

            if (!result.success) {
                setError(result.error || 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
                setLoginState('error');
                setIsLoading(false);
                return;
            }

            if (rememberMe) AuthService.saveRememberMe(accountType, cleanIdentifier);
            else AuthService.clearRememberMe();

            setLoginState('success');
            setTimeout(() => { window.location.href = "/farmer/dashboard"; }, 1500);

        } catch (err) {
            setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง");
            setLoginState('error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-sans">

            {/* LEFT PANEL (Strategic Marketing & Value Prop) */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#006837] relative flex-col items-center justify-center overflow-hidden z-0 text-white p-12 text-center">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#005c30] to-[#003820] opacity-100 z-0"></div>
                <div className="absolute inset-0 bg-[url('/images/thai-pattern-bg.png')] opacity-[0.06] mix-blend-overlay bg-repeat bg-[length:300px] z-0"></div>

                {/* Decorative Glows for depth */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center animate-fade-in-up w-full max-w-lg">

                    {/* Official Logo - High Contrast Container */}
                    <div className="mb-12 relative group cursor-default">
                        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-400/30 transition-all duration-700"></div>
                        <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full p-4 flex items-center justify-center border border-white/20 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
                            <img src="/images/dtam-logo.png" alt="MOPH" className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Headline: The "Why" (Marketing Hook) */}
                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight drop-shadow-lg mb-6 tracking-tight">
                        ยกระดับสมุนไพรไทย<br />
                        <span className="text-emerald-300 bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">สู่มาตรฐานสากล</span>
                    </h1>

                    {/* Subheader: The "Value" (Trust & Quality) */}
                    <p className="text-emerald-50/90 text-lg font-light leading-relaxed mb-10 max-w-sm mx-auto">
                        <span className="font-semibold text-white">สร้างความเชื่อมั่น เพิ่มมูลค่าผลผลิต</span><br />
                        ด้วยระบบรับรองคุณภาพ GACP ที่ทันสมัย<br />
                        โปร่งใส และตรวจสอบได้
                    </p>

                    {/* Trust Indicators / Badges */}
                    <div className="flex items-center justify-center gap-4 opacity-80">
                        <div className="px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            Quality
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            Trust
                        </div>
                        <div className="px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            Export
                        </div>
                    </div>

                </div>

                {/* Footer Credit */}
                <div className="absolute bottom-8 text-emerald-200/40 text-[10px] uppercase tracking-[0.2em] font-medium">
                    Department of Thai Traditional and Alternative Medicine
                </div>
            </div>

            {/* RIGHT PANEL (White Zone - Pure Action) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 xl:p-16 bg-white relative z-10">

                <div className="w-full max-w-[440px] animate-slide-up">

                    {/* Header - No Logo, Just Context */}
                    <div className="text-left mb-8 pl-1">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">เข้าสู่ระบบ</h2>
                        <p className="text-slate-500 text-lg font-medium">จัดการข้อมูลแปลงเพาะปลูกของคุณ</p>
                    </div>

                    {/* Unified Toggle Tabs (Pill) */}
                    <div className="bg-slate-50 p-1.5 rounded-full mb-8 flex relative border border-slate-100">
                        {ACCOUNT_TYPES.map((type) => {
                            const isSelected = accountType === type.type;
                            return (
                                <button
                                    key={type.type}
                                    type="button"
                                    onClick={() => { setAccountType(type.type); setIdentifier(""); setError(""); }}
                                    className={`
                                        flex-1 py-2.5 rounded-full text-xs font-bold transition-all duration-300 relative z-10 flex items-center justify-center gap-2
                                        ${isSelected ? 'text-[#006837] shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-black/5 -z-10 animate-fade-in"></div>
                                    )}
                                    <type.icon className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Form Input Fields (Ecobi Roundness) */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-4">
                            <div className="group">
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006837] transition-colors">
                                        <currentConfig.icon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                        placeholder={currentConfig.idLabel}
                                        maxLength={17}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#006837]/20 focus:bg-white hover:bg-slate-100 rounded-[2rem] py-4 pl-14 pr-6 text-slate-800 placeholder:text-slate-400 font-medium outline-none transition-all shadow-sm focus:shadow-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006837] transition-colors">
                                        <IconLock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="รหัสผ่าน"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#006837]/20 focus:bg-white hover:bg-slate-100 rounded-[2rem] py-4 pl-14 pr-14 text-slate-800 placeholder:text-slate-400 font-medium outline-none transition-all shadow-sm focus:shadow-md"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#006837] p-2 hover:bg-emerald-50 rounded-full transition-colors"
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="px-6 py-3 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-2 text-red-600 animate-head-shake">
                                <Icons.Warning className="w-4 h-4" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer w-5 h-5 rounded-lg border-slate-300 text-[#006837] focus:ring-[#006837] cursor-pointer transition-all"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                </div>
                                <span className="text-sm text-slate-500 font-bold group-hover:text-[#006837] transition-colors">จำรหัสผ่าน</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-bold text-[#006837] hover:text-[#004e32] hover:underline">
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#006837] hover:bg-[#00522b] text-white text-lg font-bold py-4 rounded-full shadow-lg shadow-[#006837]/30 hover:shadow-xl hover:shadow-[#006837]/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    เข้าสู่ระบบ
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm mb-4 font-medium">ยังไม่มีบัญชีสมาชิก?</p>
                        <Link
                            href="/register"
                            className="inline-block px-10 py-3 bg-white border-2 border-slate-100 hover:border-[#006837] text-slate-500 hover:text-[#006837] font-bold rounded-full transition-all hover:shadow-lg text-sm"
                        >
                            ลงทะเบียนเกษตรกร
                        </Link>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="absolute bottom-6 text-center opacity-30">
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Official System by DTAM</p>
                </div>
            </div>

            {/* Success Overlay */}
            {loginState === 'success' && (
                <div className="fixed inset-0 bg-[#006837]/90 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center shadow-2xl animate-scale-in text-center max-w-sm mx-4">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-[#006837] shadow-inner">
                            <Icons.CheckCircle className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">ยินดีต้อนรับ</h3>
                        <p className="text-slate-500 mb-6 font-medium">เข้าสู่ระบบสำเร็จ<br />กำลังนำท่านไปยังหน้าหลัก...</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#006837] animate-progress-bar rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
