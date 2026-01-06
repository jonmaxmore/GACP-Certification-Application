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
    const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isValid = inputType === "phone" ? validatePhone(input) : validateEmail(input);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            setError(inputType === "phone" ? "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)" : "กรุณากรอกอีเมลให้ถูกต้อง");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await api.post("/auth-farmer/reset-password", { [inputType]: input });
            if (result.success) setSent(true);
            else setError(result.error || "ไม่สามารถส่งลิงก์รีเซ็ตได้ กรุณาลองใหม่");
        } catch {
            setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-700">ลืมรหัสผ่าน</h1>
                    <p className="text-slate-500 mt-2">กรอกข้อมูลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {sent ? (
                        <div className="text-center py-5">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-emerald-600 font-semibold mb-2">ส่งลิงก์เรียบร้อยแล้ว!</h2>
                            <p className="text-slate-500 text-sm mb-4">
                                {inputType === "phone" ? "กรุณาตรวจสอบ SMS ของคุณ" : "กรุณาตรวจสอบอีเมลของคุณ"}
                            </p>
                            <button onClick={() => { setSent(false); setInput(""); }}
                                className="px-5 py-2.5 bg-transparent border border-emerald-600 rounded-lg text-emerald-600 text-sm hover:bg-emerald-50 transition-colors">
                                ส่งอีกครั้ง
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Input Type Selector */}
                            <div className="flex gap-2 mb-4">
                                <button type="button" onClick={() => { setInputType("phone"); setInput(""); setError(""); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${inputType === "phone" ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-700' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    เบอร์โทรศัพท์
                                </button>
                                <button type="button" onClick={() => { setInputType("email"); setInput(""); setError(""); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${inputType === "email" ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-700' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                    อีเมล
                                </button>
                            </div>

                            <label className="text-sm font-semibold text-emerald-700 block mb-2">
                                {inputType === "phone" ? "เบอร์โทรศัพท์" : "อีเมล"}
                            </label>
                            <input
                                type={inputType === "email" ? "email" : "tel"}
                                value={input}
                                onChange={(e) => { setInput(e.target.value); setError(""); }}
                                placeholder={inputType === "phone" ? "0812345678" : "example@email.com"}
                                className={`w-full py-3.5 px-4 border rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-100 mb-2 ${error ? 'border-red-500' : isValid && input ? 'border-green-500' : 'border-slate-200'} focus:border-emerald-500`}
                                required
                            />

                            {input && !isValid && (
                                <p className="text-xs text-slate-500 mb-3">
                                    {inputType === "phone" ? `กรอกแล้ว ${input.length}/10 หลัก` : "รูปแบบอีเมลไม่ถูกต้อง"}
                                </p>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 rounded-lg mb-4 flex items-center gap-2 border border-red-100">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                                    </svg>
                                    <span className="text-red-600 text-sm">{error}</span>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading || !isValid}
                                className={`w-full py-4 rounded-xl text-white text-base font-semibold flex items-center justify-center gap-2 transition-all ${isLoading || !isValid ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/30'}`}>
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        กำลังส่ง...
                                    </>
                                ) : "ส่งลิงก์รีเซ็ต"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-emerald-600 text-sm inline-flex items-center gap-1 hover:underline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18L9 12L15 6" />
                        </svg>
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        </div>
    );
}
