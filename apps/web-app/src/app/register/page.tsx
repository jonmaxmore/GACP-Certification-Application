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

const STEPS = ["ประเภทบัญชี", "ยืนยันตัวตน", "ข้อมูล", "ตั้งรหัสผ่าน"];

export default function RegisterPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [accountType, setAccountType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [identifier, setIdentifier] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [representativeName, setRepresentativeName] = useState("");
    const [communityName, setCommunityName] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const currentConfig = ACCOUNT_TYPES.find((t) => t.type === accountType);

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

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return accountType !== "";
            case 1:
                return identifier.replace(/-/g, "").length >= 10;
            case 2:
                if (accountType === "INDIVIDUAL") {
                    return firstName && lastName && phone.length >= 10;
                } else if (accountType === "JURISTIC") {
                    return companyName && representativeName && phone.length >= 10;
                } else {
                    return communityName && contactName && phone.length >= 10;
                }
            case 3:
                return (
                    password.length >= 8 &&
                    password === confirmPassword &&
                    acceptTerms
                );
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        setError("");
        setIsLoading(true);

        // Build registration data
        const data: Record<string, string> = {
            accountType,
            identifier: identifier.replace(/-/g, ""),
            phone,
            password,
        };

        if (accountType === "INDIVIDUAL") {
            data.firstName = firstName;
            data.lastName = lastName;
            data.idCard = identifier.replace(/-/g, "");
        } else if (accountType === "JURISTIC") {
            data.companyName = companyName;
            data.representativeName = representativeName;
            data.taxId = identifier.replace(/-/g, "");
        } else {
            data.communityName = communityName;
            data.contactName = contactName;
            data.communityRegistrationNo = identifier;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/v2/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "ลงทะเบียนไม่สำเร็จ");
            }

            // Success - redirect to login
            router.push("/login?registered=true");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <Link href="/login" className="inline-block mb-4 text-[#1B5E20] hover:underline">
                        ← กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                    <h1 className="text-2xl font-bold text-[#1B5E20]">ลงทะเบียนผู้ใช้ใหม่</h1>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step} className="flex-1">
                            <div
                                className={`h-2 rounded-full mb-2 transition-colors ${index <= currentStep ? "bg-[#1B5E20]" : "bg-gray-200"
                                    }`}
                            />
                            <p
                                className={`text-xs text-center ${index <= currentStep
                                        ? "text-[#1B5E20] font-semibold"
                                        : "text-gray-400"
                                    }`}
                            >
                                {step}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Step 0: Account Type */}
                    {currentStep === 0 && (
                        <div className="fade-in">
                            <h2 className="text-lg font-semibold mb-2">เลือกประเภทผู้ใช้งาน</h2>
                            <p className="text-gray-500 text-sm mb-6">กรุณาเลือกประเภทบัญชีที่ตรงกับท่าน</p>
                            <div className="space-y-3">
                                {ACCOUNT_TYPES.map((type) => (
                                    <button
                                        key={type.type}
                                        type="button"
                                        onClick={() => setAccountType(type.type)}
                                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${accountType === type.type
                                                ? "border-[#1B5E20] bg-[#1B5E20]/5"
                                                : "border-gray-100 hover:border-gray-200"
                                            }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                                            {type.icon}
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-semibold">{type.label}</div>
                                            <div className="text-sm text-gray-500">{type.subtitle}</div>
                                        </div>
                                        {accountType === type.type && (
                                            <span className="text-[#1B5E20] text-xl">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Identifier */}
                    {currentStep === 1 && currentConfig && (
                        <div className="fade-in">
                            <h2 className="text-lg font-semibold mb-2">ยืนยันตัวตน</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                กรอก{currentConfig.idLabel}
                            </p>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(formatThaiId(e.target.value))}
                                placeholder={currentConfig.idHint}
                                maxLength={17}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent text-xl tracking-wider font-mono text-center"
                            />
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                                💡 หมายเลขนี้จะใช้เป็น Username ในการเข้าสู่ระบบ
                            </div>
                        </div>
                    )}

                    {/* Step 2: Info */}
                    {currentStep === 2 && (
                        <div className="fade-in space-y-4">
                            <h2 className="text-lg font-semibold mb-2">
                                {accountType === "INDIVIDUAL" ? "ข้อมูลส่วนตัว" : "ข้อมูลองค์กร"}
                            </h2>

                            {accountType === "INDIVIDUAL" && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">ชื่อ</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="สมชาย"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">นามสกุล</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="ใจดี"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                </>
                            )}

                            {accountType === "JURISTIC" && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">ชื่อบริษัท/นิติบุคคล</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="บริษัท ABC จำกัด"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">ชื่อผู้มีอำนาจ</label>
                                        <input
                                            type="text"
                                            value={representativeName}
                                            onChange={(e) => setRepresentativeName(e.target.value)}
                                            placeholder="นายสมชาย ใจดี"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                </>
                            )}

                            {accountType === "COMMUNITY_ENTERPRISE" && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">ชื่อวิสาหกิจชุมชน</label>
                                        <input
                                            type="text"
                                            value={communityName}
                                            onChange={(e) => setCommunityName(e.target.value)}
                                            placeholder="กลุ่มเกษตรกรบ้านป่า"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">ชื่อผู้ติดต่อ</label>
                                        <input
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="นายสมชาย ใจดี"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    placeholder="0812345678"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password */}
                    {currentStep === 3 && (
                        <div className="fade-in space-y-4">
                            <h2 className="text-lg font-semibold mb-2">ตั้งรหัสผ่าน</h2>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="อย่างน้อย 8 ตัวอักษร"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20] pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">ยืนยันรหัสผ่าน</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1B5E20]"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">รหัสผ่านไม่ตรงกัน</p>
                                )}
                            </div>

                            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-[#1B5E20] rounded"
                                />
                                <span className="text-sm text-gray-600">
                                    ข้าพเจ้ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="flex-1 py-3 border-2 border-[#1B5E20] text-[#1B5E20] rounded-xl font-semibold hover:bg-[#1B5E20]/5 transition-colors"
                            >
                                ← ย้อนกลับ
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceed() || isLoading}
                            className="flex-1 py-3 bg-[#1B5E20] text-white rounded-xl font-semibold hover:bg-[#0D3612] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    กำลังลงทะเบียน...
                                </>
                            ) : currentStep < 3 ? (
                                <>ถัดไป →</>
                            ) : (
                                <>ลงทะเบียน ✓</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>🔒 ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย</p>
                </div>
            </div>
        </div>
    );
}
