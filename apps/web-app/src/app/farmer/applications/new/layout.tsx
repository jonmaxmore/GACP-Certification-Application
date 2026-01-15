'use client';

import React from 'react';
import Image from 'next/image';
import { useWizardStore } from './hooks/useWizardStore';
import { usePathname } from 'next/navigation';

// Official step configuration - 11 steps total
const STEPS = [
    { title: 'ข้อมูลพืช', titleEN: 'Plant & Purpose' },
    { title: 'ผู้ขอ', titleEN: 'Applicant' },
    { title: 'ที่ตั้ง', titleEN: 'Site Location' },
    { title: 'แปลง', titleEN: 'Plot Details' },
    { title: 'ผลผลิต', titleEN: 'Production' },
    { title: 'เอกสาร', titleEN: 'Documents' },
    { title: 'ตรวจสอบ', titleEN: 'Review' },
    { title: 'ใบเสนอราคา', titleEN: 'Quotation' },
    { title: 'ส่งคำขอ', titleEN: 'Submit' },
    { title: 'ชำระเงิน', titleEN: 'Payment' },
    { title: 'สำเร็จ', titleEN: 'Complete' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
    const { state: { currentStep } } = useWizardStore();
    const pathname = usePathname();

    // Derive step from URL or fallback to store
    const stepMatch = pathname?.match(/\/step\/(\d+)/);
    const urlStep = stepMatch ? parseInt(stepMatch[1], 10) - 1 : currentStep;
    const activeStep = urlStep >= 0 ? urlStep : currentStep;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50/30">
            {/* Official Header with DTAM Branding */}
            <header className="bg-white/90 backdrop-blur-md border-b border-dtam/30 sticky top-0 z-30 shadow-soft">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo + Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 flex-shrink-0">
                                <Image
                                    src="/images/dtam-logo.png"
                                    alt="กรมการแพทย์แผนไทยและการแพทย์ทางเลือก"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-dtam-dark">
                                    ยื่นคำขอใบรับรอง GACP
                                </h1>
                                <p className="text-sm text-dtam">
                                    กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                                </p>
                            </div>
                        </div>

                        {/* Current Step Badge - Glassmorphism Style */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-dtam">
                                    ขั้นตอนที่ {activeStep + 1} / {STEPS.length}
                                </p>
                                <p className="text-sm text-content-secondary">
                                    {STEPS[activeStep]?.title}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-dtam-light to-dtam text-white flex items-center justify-center font-bold text-lg shadow-glass">
                                {activeStep + 1}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar - Full Width for Desktop */}
                <div className="bg-gradient-to-r from-emerald-50/80 via-white to-green-50/50 px-6 py-3 border-t border-emerald-100">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2">
                        {STEPS.map((step, i) => {
                            const isActive = i === activeStep;
                            const isCompleted = i < activeStep;
                            return (
                                <div key={i} className="flex items-center flex-1 last:flex-initial">
                                    <button
                                        type="button"
                                        disabled={i > activeStep}
                                        className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                                            ${isActive
                                                ? 'bg-gradient-to-br from-dtam-light to-dtam text-white shadow-glass'
                                                : isCompleted
                                                    ? 'bg-dtam-100 text-dtam hover:bg-dtam-200 cursor-pointer'
                                                    : 'bg-surface-100 text-content-muted cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                                            ${isActive
                                                ? 'bg-white/30 text-white'
                                                : isCompleted
                                                    ? 'bg-dtam text-white'
                                                    : 'bg-surface-200 text-content-muted'
                                            }
                                        `}>
                                            {isCompleted ? '✓' : i + 1}
                                        </span>
                                        <span className="hidden desktop:inline whitespace-nowrap">{step.title}</span>
                                    </button>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 min-w-[16px] ${isCompleted ? 'bg-dtam' : 'bg-surface-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Main Content - Wide Desktop Layout */}
            <main className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl border border-emerald-100/50 shadow-xl shadow-emerald-500/5 min-h-[700px]">
                    <div className="p-8 desktop:p-10">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-emerald-700/60 mt-8">
                <p>ระบบรับรองมาตรฐาน GACP | กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
            </footer>
        </div>
    );
}

