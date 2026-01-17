'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icons } from "@/components/ui/icons";

function RegisterSuccessContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const identifier = searchParams.get("id") || "";
    const accountType = searchParams.get("type") || "";
    const name = searchParams.get("name") || "";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const getAccountTypeThai = () => {
        switch (accountType) {
            case "INDIVIDUAL": return "บุคคลธรรมดา";
            case "JURISTIC": return "นิติบุคคล";
            case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน";
            default: return "เกษตรกร";
        }
    };

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="auth-card animate-scale-in text-center">
            {/* Success Icon */}
            <div className="relative mb-10 inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center relative z-10 shadow-premium">
                    <Icons.CheckCircle className="w-12 h-12 text-white" />
                </div>
            </div>

            <h1 className="text-4xl font-black text-slate-800 mb-2">ลงทะเบียนสำเร็จ!</h1>
            <p className="text-slate-500 font-bold mb-10 tracking-tight">คุณพร้อมสำหรับการยื่นขอรับรองมาตรฐาน GACP แล้ว</p>

            {/* Account Info Box */}
            <div className="bg-slate-50/80 rounded-[2rem] p-8 text-left mb-10 border border-slate-100 shadow-inner">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Type</span>
                        <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full">{getAccountTypeThai()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Username / ID</span>
                        <span className="text-sm font-black text-slate-700 font-mono tracking-wider">{identifier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registered Name</span>
                        <span className="text-sm font-black text-slate-700">{name}</span>
                    </div>
                </div>
            </div>

            {/* Next Steps Guide */}
            <div className="text-left mb-10 px-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">สามขั้นตอนสู่มาตรฐาน GACP</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">1</div>
                        <span className="text-[10px] font-bold text-slate-500">เข้าสู่ระบบครั้งแรก</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">2</div>
                        <span className="text-[10px] font-bold text-slate-500">ยืนยันตัวตน (KYC)</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">3</div>
                        <span className="text-[10px] font-bold text-slate-500">ยื่นแบบขอรับรอง</span>
                    </div>
                </div>
            </div>

            <Link
                href="/login"
                className="btn btn-primary text-white w-full py-5 rounded-2.5xl text-lg font-black"
            >
                ไปหน้าเข้าสู่ระบบ
                <Icons.ArrowRight className="w-6 h-6 ml-2" />
            </Link>

            <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Safe and Secure Authentication by DTAM
            </p>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex flex-col items-center justify-center min-vh-[50vh]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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
