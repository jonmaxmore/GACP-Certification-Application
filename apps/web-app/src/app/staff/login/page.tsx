"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockIcon, EyeIcon } from "@/components/ui/icons";

// Local Icons
const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="40" height="40" viewBox="0 0 48 48" className="fill-emerald-700">
        <path d="M24 4L8 10V22C8 32.5 14.5 42 24 46C33.5 42 40 32.5 40 22V10L24 4Z" />
        <path d="M24 8L12 13V22C12 30 17 38 24 41C31 38 36 30 36 22V13L24 8Z" fill="white" fillOpacity="0.3" />
        <path d="M20 24L23 27L28 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

export default function StaffLoginPage() {
    const router = useRouter();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!loginId.trim()) {
            setError("กรุณากรอกชื่อผู้ใช้หรือรหัสพนักงาน");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth-dtam/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginId.trim(),
                    password,
                    userType: 'DTAM_STAFF',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
                setIsLoading(false);
                return;
            }

            const { user, token } = result.data;

            const staffRoles = ['admin', 'scheduler', 'assessor', 'accountant', 'inspector', 'auditor', 'reviewer', 'manager'];
            const userRole = (user.role || '').toLowerCase();
            if (!staffRoles.includes(userRole)) {
                setError("บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่");
                setIsLoading(false);
                return;
            }

            localStorage.setItem("staff_token", token || "");
            localStorage.setItem("staff_user", JSON.stringify(user));
            document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;

            setIsLoading(false);
            router.push(user.dashboardUrl || "/staff/dashboard");
        } catch (err) {
            console.error("Login error:", err);
            setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-5 bg-emerald-50 rounded-full flex items-center justify-center">
                        <ShieldIcon />
                    </div>
                    <h1 className="text-2xl font-black text-emerald-700 mb-3">
                        ระบบเจ้าหน้าที่ GACP
                    </h1>
                    <div className="inline-block px-5 py-2 bg-emerald-50 rounded-full border border-emerald-200 text-sm font-semibold text-emerald-700">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    {/* Warning Badge */}
                    <div className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl mb-5 border border-amber-200">
                        <span className="text-xl">⚠️</span>
                        <span className="text-sm text-amber-800 font-medium">
                            สำหรับเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 rounded-xl text-red-600 text-sm mb-4 border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Login ID */}
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-emerald-700 block mb-2">
                                ชื่อผู้ใช้ / รหัสพนักงาน / อีเมล
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                    <UserIcon />
                                </div>
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="admin / EMP001 / officer@dtam.go.th"
                                    className="w-full py-3.5 px-4 pl-12 border border-slate-200 rounded-xl text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-5">
                            <label className="text-sm font-semibold text-emerald-700 block mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                    <LockIcon />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all ${isLoading
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/30'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    กำลังตรวจสอบ...
                                </>
                            ) : (
                                <>🔐 เข้าสู่ระบบเจ้าหน้าที่</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-5">
                        หากยังไม่มีบัญชี กรุณาติดต่อผู้ดูแลระบบ
                    </p>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-emerald-600 text-sm font-medium hover:underline">
                        ← กลับหน้าหลัก
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-xs text-slate-400">🔒 ระบบรักษาความปลอดภัยระดับสูง</p>
                    <p className="text-[11px] text-slate-400 mt-1">Staff Portal v2.6.0</p>
                </div>
            </div>
        </div>
    );
}
