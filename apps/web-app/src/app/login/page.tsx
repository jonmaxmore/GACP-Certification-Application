"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Account Types Configuration
const ACCOUNT_TYPES = [
    {
        type: "INDIVIDUAL",
        label: "บุคคลธรรมดา",
        subtitle: "เกษตรกรรายย่อย",
        icon: "👤",
        color: "emerald",
        idLabel: "เลขบัตรประชาชน 13 หลัก",
        idHint: "1-2345-67890-12-3",
    },
    {
        type: "JURISTIC",
        label: "นิติบุคคล",
        subtitle: "บริษัท / ห้างหุ้นส่วน",
        icon: "🏢",
        color: "blue",
        idLabel: "เลขทะเบียนนิติบุคคล 13 หลัก",
        idHint: "0-1055-12345-67-8",
    },
    {
        type: "COMMUNITY_ENTERPRISE",
        label: "วิสาหกิจชุมชน",
        subtitle: "กลุ่มเกษตรกร",
        icon: "👥",
        color: "purple",
        idLabel: "เลขทะเบียนวิสาหกิจชุมชน",
        idHint: "XXXX-XXXX-XXX",
    },
];

export default function LoginPage() {
    const router = useRouter();
    const [accountType, setAccountType] = useState("INDIVIDUAL");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType)!;

    const formatThaiId = (value: string) => {
        const digits = value.replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < digits.length && i < 13; i++) {
            if (i === 1 || i === 5 || i === 10 || i === 12) {
                formatted += "-";
            }
            formatted += digits[i];
        }
        return formatted;
    };

    const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatThaiId(e.target.value);
        setIdentifier(formatted);
    };

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
                        accountType,
                        identifier: identifier.replace(/-/g, ""),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
            }

            // Save token
            localStorage.setItem("auth_token", data.data.tokens?.accessToken || data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-4xl">🌿</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1B5E20]">
                        ระบบรับรองมาตรฐาน GACP
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Account Type Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-3">
                            ประเภทผู้ใช้งาน
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {ACCOUNT_TYPES.map((type) => (
                                <button
                                    key={type.type}
                                    type="button"
                                    onClick={() => {
                                        setAccountType(type.type);
                                        setIdentifier("");
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all ${accountType === type.type
                                            ? "border-[#1B5E20] bg-[#1B5E20]/5"
                                            : "border-gray-100 hover:border-gray-200"
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{type.icon}</div>
                                    <div
                                        className={`text-xs font-semibold ${accountType === type.type
                                                ? "text-[#1B5E20]"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        {type.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400">{type.subtitle}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Identifier Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                {currentConfig.idLabel}
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={handleIdentifierChange}
                                placeholder={currentConfig.idHint}
                                maxLength={17}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent text-lg tracking-wider font-mono"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่าน"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-sm text-[#1B5E20] hover:underline"
                            >
                                ลืมรหัสผ่าน?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#1B5E20] text-white rounded-xl font-semibold hover:bg-[#0D3612] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                <>
                                    เข้าสู่ระบบ
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm mb-2">ยังไม่มีบัญชีใช้งาน?</p>
                        <Link
                            href="/register"
                            className="inline-block px-6 py-2 border-2 border-[#1B5E20] text-[#1B5E20] rounded-xl font-semibold hover:bg-[#1B5E20]/5 transition-colors"
                        >
                            ลงทะเบียนผู้ใช้ใหม่
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>🔒 มาตรฐานความปลอดภัยระดับสูง</p>
                    <p className="mt-1">v2.6.0</p>
                </div>
            </div>
        </div>
    );
}
