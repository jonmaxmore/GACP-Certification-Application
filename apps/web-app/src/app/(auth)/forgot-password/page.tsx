"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [input, setInput] = useState("");
    const [inputType, setInputType] = useState<"phone" | "email">("phone");
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const validatePhone = (value: string) => /^0[689]\d{8}$/.test(value);
    const isValid = inputType === "phone" ? validatePhone(input) : /\S+@\S+\.\S+/.test(input);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setError(inputType === "phone" ? "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง" : "กรุณากรอกอีเมลให้ถูกต้อง");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await api.post("/auth-farmer/reset-password", { [inputType]: input });
            if (result.success) setSent(true);
            else setError(result.error || "ไม่สามารถส่งลิงก์รีเซ็ตได้");
        } catch {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-sans">

            {/* LEFT PANEL (Recovery Context) */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#006837] relative flex-col items-center justify-center overflow-hidden z-0 text-white p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#005c30] to-[#003820] opacity-100 z-0"></div>
                {/* Decorative Pattern - Abstract lines */}
                <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-pattern-fp" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="white" opacity="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-pattern-fp)" />
                    </svg>
                </div>

                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                    <div className="mb-8 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight drop-shadow-lg mb-4 tracking-tight">กู้คืนบัญชีผู้ใช้งาน</h1>
                    <p className="text-emerald-50/90 text-lg font-light leading-relaxed max-w-sm mx-auto">
                        ระบบรักษาความปลอดภัยมาตรฐานสากล<br />ข้อมูลของคุณจะถูกเก็บเป็นความลับ
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL (Action) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-16 bg-white relative z-10">
                <div className="w-full max-w-[440px] animate-slide-up">
                    <div className="text-left mb-8 pl-1">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">ลืมรหัสผ่าน?</h2>
                        <p className="text-slate-500 text-sm font-medium">กรอกข้อมูลเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
                    </div>

                    {/* Form content ... */}
                    {sent ? (
                        <div className="text-center py-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#006837]">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-[#006837] font-bold text-lg mb-2">ส่งลิงก์เรียบร้อยแล้ว!</h2>
                            <p className="text-slate-600 text-sm mb-6 px-4">ระบบได้ส่งลิงก์ไปยัง {inputType === "phone" ? "เบอร์โทรศัพท์" : "อีเมล"} ของคุณแล้ว</p>
                            <button onClick={() => { setSent(false); setInput(""); }} className="text-sm font-bold text-[#006837] hover:underline">ส่งอีกครั้ง</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-slate-50 p-1.5 rounded-full flex border border-slate-100">
                                <button type="button" onClick={() => { setInputType("phone"); setInput(""); setError(""); }}
                                    className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${inputType === "phone" ? 'bg-white text-[#006837] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>เบอร์โทรศัพท์</button>
                                <button type="button" onClick={() => { setInputType("email"); setInput(""); setError(""); }}
                                    className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${inputType === "email" ? 'bg-white text-[#006837] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>อีเมล</button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">{inputType === "phone" ? "เบอร์โทรศัพท์" : "อีเมล"}</label>
                                <input
                                    type={inputType === "email" ? "email" : "tel"}
                                    value={input}
                                    onChange={(e) => { setInput(e.target.value); setError(""); }}
                                    placeholder={inputType === "phone" ? "0812345678" : "example@email.com"}
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-4 px-6 text-lg focus:bg-white focus:border-[#006837] outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>

                            {error && <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-sm font-bold flex gap-2"><div className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-200 text-rose-700">!</div>{error}</div>}

                            <button type="submit" disabled={isLoading || !isValid}
                                className={`w-full py-4 rounded-full font-black text-lg tracking-tight flex items-center justify-center gap-2 transition-all ${isLoading || !isValid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#006837] text-white hover:bg-[#00502b] shadow-lg shadow-[#006837]/30'}`}>
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "ส่งลิงก์รีเซ็ต"}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-slate-400 text-sm font-bold hover:text-[#006837] transition-colors flex items-center justify-center gap-2">
                            <span>←</span> กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
