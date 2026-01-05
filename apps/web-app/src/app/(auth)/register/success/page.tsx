"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function RegisterSuccessContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const identifier = searchParams.get("id") || "";
    const accountType = searchParams.get("type") || "";
    const name = searchParams.get("name") || "";

    useEffect(() => setMounted(true), []);

    const getAccountTypeThai = () => {
        switch (accountType) {
            case "INDIVIDUAL": return "บุคคลธรรมดา";
            case "JURISTIC": return "นิติบุคคล";
            case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน";
            default: return "ผู้สมัคร";
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 p-6 font-sans">
            <div className="max-w-md mx-auto">
                {/* Success Card */}
                <div className="bg-white rounded-2xl p-8 shadow-card text-center mt-10 animate-scale-in">
                    {/* Success Animation */}
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-primary-600 mb-2">ลงทะเบียนสำเร็จ!</h1>
                    <p className="text-sm text-slate-500 mb-6">ยินดีต้อนรับเข้าสู่ระบบรับรอง GACP</p>

                    {/* User Info Summary */}
                    {(identifier || name) && (
                        <div className="bg-surface-100 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm font-semibold text-slate-500 mb-3">ข้อมูลบัญชีของคุณ</p>
                            {accountType && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-500">ประเภทบัญชี:</span>
                                    <span className="text-sm font-semibold text-slate-800">{getAccountTypeThai()}</span>
                                </div>
                            )}
                            {identifier && (
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-500">เลขประจำตัว:</span>
                                    <span className="text-sm font-semibold text-slate-800 font-mono">{identifier}</span>
                                </div>
                            )}
                            {name && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">ชื่อ:</span>
                                    <span className="text-sm font-semibold text-slate-800">{name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-primary-700 mb-3">ขั้นตอนถัดไป</p>
                        <ol className="pl-5 space-y-2">
                            <li className="text-sm text-slate-700">เข้าสู่ระบบด้วยเลขประจำตัวและรหัสผ่าน</li>
                            <li className="text-sm text-slate-700">เพิ่มข้อมูลสถานประกอบการ</li>
                            <li className="text-sm text-slate-700">ยื่นคำขอรับรองมาตรฐาน GACP</li>
                        </ol>
                    </div>

                    {/* CTA Button */}
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-br from-primary-600 to-primary-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 transition-transform"
                    >
                        เข้าสู่ระบบ
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18L15 12L9 6" />
                        </svg>
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">ข้อมูลของคุณถูกเก็บรักษาอย่างปลอดภัย</p>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );
}

export default function RegisterSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <RegisterSuccessContent />
        </Suspense>
    );
}
