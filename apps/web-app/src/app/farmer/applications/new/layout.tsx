'use client';

import React from 'react';
import { useWizardStore } from './hooks/useWizardStore';
import { usePathname } from 'next/navigation';

const STEPS = [
    { title: 'พืชและวัตถุประสงค์', titleEN: 'Plant & Purpose' },
    { title: 'ข้อมูลผู้ขอ', titleEN: 'Applicant' },
    { title: 'สถานที่ปลูก', titleEN: 'Site' },
    { title: 'รายละเอียดการปลูก', titleEN: 'Cultivation' },
    { title: 'มาตรการความปลอดภัย', titleEN: 'Security' },
    { title: 'เก็บเกี่ยวและแปรรูป', titleEN: 'Harvest' },
    { title: 'เอกสารเพิ่มเติม', titleEN: 'Documents' },
    { title: 'ตรวจสอบข้อมูล', titleEN: 'Review' },
    { title: 'ส่งคำขอและชำระเงิน', titleEN: 'Submit' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { state: { currentStep } } = useWizardStore();
    const pathname = usePathname();

    // Attempt to derive step from URL if possible, or fallback to store
    // This makes the progress bar sync with URL even on refresh
    const stepMatch = pathname?.match(/\/step\/(\d+)/);
    const urlStep = stepMatch ? parseInt(stepMatch[1], 10) - 1 : currentStep;

    const activeStep = urlStep >= 0 ? urlStep : currentStep;

    return (
        <div className="bg-slate-50 min-h-full pb-20">
            {/* Top Progress Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">ยื่นคำขอใหม่ (New Application)</h1>
                        <p className="text-xs text-slate-500">
                            ขั้นตอนที่ {activeStep + 1} จาก {STEPS.length}: {STEPS[activeStep]?.title || 'Unknown'}
                        </p>
                    </div>
                    {/* Simple Progress Ring */}
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Status</div>
                            <div className="text-xs text-slate-500">{activeStep >= 7 ? 'ตรวจสอบเอกสาร' : 'กำลังดำเนินการ'}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700 bg-white shadow-sm">
                            {activeStep + 1}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-4 md:p-8">
                <div className="max-w-[1000px] mx-auto bg-white min-h-[600px] rounded-2xl shadow-sm border border-slate-100 p-0 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0 pointer-events-none"></div>

                    {/* Step Content */}
                    <div className="relative z-10 w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
