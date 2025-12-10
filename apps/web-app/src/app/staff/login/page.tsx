"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/v2/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        accountType: "STAFF",
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
            }

            const user = data.data.user;

            // Verify staff role
            const staffRoles = ['REVIEWER_AUDITOR', 'SCHEDULER', 'ADMIN', 'SUPER_ADMIN'];
            if (!staffRoles.includes(user.role)) {
                throw new Error("บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่");
            }

            // Save token
            localStorage.setItem("staff_token", data.data.tokens?.accessToken || data.data.token);
            localStorage.setItem("staff_user", JSON.stringify(user));

            // Redirect based on role
            if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
                router.push("/admin");
            } else {
                router.push("/staff/dashboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                        <span className="text-4xl">🛡️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        ระบบเจ้าหน้าที่ GACP
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
                        <span>⚠️</span>
                        <p className="text-amber-200 text-sm">
                            สำหรับเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                อีเมลเจ้าหน้าที่
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="officer@dtam.go.th"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่าน"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    กำลังตรวจสอบ...
                                </>
                            ) : (
                                <>
                                    <span>🔐</span>
                                    เข้าสู่ระบบเจ้าหน้าที่
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        <p>หากยังไม่มีบัญชี กรุณาติดต่อผู้ดูแลระบบ</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                        ← กลับหน้าหลัก
                    </Link>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>🔒 ระบบรักษาความปลอดภัยระดับสูง</p>
                    <p className="mt-1">Staff Portal v2.6.0</p>
                </div>
            </div>
        </div>
    );
}
