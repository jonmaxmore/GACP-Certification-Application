"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STEPS = [
    { id: 0, path: 'step-0', label: 'เลือกพืช' },
    { id: 1, path: 'step-1', label: 'วัตถุประสงค์' },
    { id: 2, path: 'step-2', label: 'บริการ' },
    { id: 3, path: 'step-3', label: 'ยินยอม' },
    { id: 4, path: 'step-4', label: 'ผู้ยื่น' },
    { id: 5, path: 'step-5', label: 'สถานที่' },
    { id: 6, path: 'step-6', label: 'การผลิต' },
    { id: 7, path: 'step-7', label: 'เอกสาร' },
    { id: 8, path: 'step-8', label: 'ตรวจสอบ' },
    { id: 9, path: 'step-9', label: 'ใบเสนอราคา' },
    { id: 10, path: 'step-10', label: 'ใบวางบิล' },
    { id: 11, path: 'step-11', label: 'ชำระเงิน' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const savedTime = localStorage.getItem('gacp_wizard_last_saved');
        if (savedTime) setLastSaved(savedTime);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem('gacp_wizard_last_saved', now);
            setLastSaved(now);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const currentPath = pathname.split('/').pop() || 'step-0';
    const currentStep = STEPS.find(s => s.path === currentPath)?.id || 0;
    const isSuccess = currentPath === 'success';
    const progressPercent = isSuccess ? 100 : ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            {/* Desktop Sidebar Container */}
            <div className="flex max-w-7xl mx-auto min-h-screen">
                {/* Sidebar for Desktop */}
                <aside className={`hidden md:flex flex-col w-72 border-r p-6 sticky top-0 h-screen overflow-y-auto flex-shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                    {/* Logo */}
                    <div className="mb-8">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l2.3 2.3a2.4 2.4 0 0 0 3.4-3.4L15.4 14.6l6-6c4.5-4.5.5-8.5-4-4l-6.3 6.3-2.4-2.4a2.4 2.4 0 0 0-3.4 3.4L7.7 14.3l-4 4a2.4 2.4 0 0 0 0 3.4l2.6-1.4z" />
                                </svg>
                            </div>
                            <div>
                                <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>GACP</div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>มาตรฐานสมุนไพร</div>
                            </div>
                        </Link>
                    </div>

                    {/* Step List */}
                    <div className="mb-6">
                        <div className={`text-xs font-semibold uppercase tracking-wide mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            ขั้นตอนการยื่นคำขอ
                        </div>
                        {STEPS.map((step, i) => {
                            const isCompleted = i < currentStep;
                            const isCurrent = i === currentStep;
                            const stepClasses = `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all ${isCurrent
                                ? (isDark ? 'bg-primary-500/15' : 'bg-primary-50')
                                : 'bg-transparent'
                                } ${i > currentStep ? 'opacity-50' : ''} ${isCompleted ? 'cursor-pointer hover:bg-primary-50' : ''}`;

                            const stepContent = (
                                <>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold ${isCompleted
                                        ? 'bg-primary-500 text-white'
                                        : isCurrent
                                            ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white'
                                            : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-surface-200 text-slate-500')
                                        }`}>
                                        {isCompleted ? '✓' : step.id + 1}
                                    </div>
                                    <span className={`text-sm ${isCurrent
                                        ? 'text-primary-500 font-semibold'
                                        : isCompleted
                                            ? 'text-primary-600'
                                            : (isDark ? 'text-slate-300' : 'text-slate-600')
                                        }`}>
                                        {step.label}
                                    </span>
                                    {isCompleted && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="ml-auto">
                                            <path d="M9 18L15 12L9 6" />
                                        </svg>
                                    )}
                                </>
                            );

                            return isCompleted ? (
                                <Link key={step.id} href={`/applications/new/${step.path}`} className={stepClasses}>
                                    {stepContent}
                                </Link>
                            ) : (
                                <div key={step.id} className={stepClasses}>
                                    {stepContent}
                                </div>
                            );
                        })}
                    </div>

                    {/* Help Link */}
                    <div className={`mt-auto p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-surface-100'}`}>
                        <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ต้องการความช่วยเหลือ?</p>
                        <a href="tel:02-123-4567" className="flex items-center gap-2 text-sm text-primary-500 font-medium">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            02-123-4567
                        </a>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col max-w-full overflow-hidden">
                    {/* Mobile Header */}
                    {!isSuccess && (
                        <div className="md:hidden bg-gradient-to-br from-primary-600 to-primary-500 px-5 py-4 pb-7 rounded-b-3xl shadow-lg shadow-primary-500/20">
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={() => setShowExitDialog(true)} className="flex items-center gap-1.5 text-white/90 text-sm">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18L9 12L15 6" />
                                    </svg>
                                    ออก
                                </button>
                                <div className="text-white/90 text-xs bg-white/20 px-3 py-1 rounded-full">
                                    {currentStep + 1} / {STEPS.length}
                                </div>
                            </div>
                            <h1 className="text-white text-lg font-semibold mb-1">ยื่นขอรับรอง GACP</h1>
                            <p className="text-white/85 text-sm mb-4">ขั้นตอนที่ {currentStep + 1}: {STEPS[currentStep]?.label}</p>
                            <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Desktop Header */}
                    {!isSuccess && (
                        <div className={`hidden md:block px-8 py-6 border-b ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {STEPS[currentStep]?.label}
                                    </h1>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        ขั้นตอนที่ {currentStep + 1} จาก {STEPS.length}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-32 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-surface-200'}`}>
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-primary-500">{Math.round(progressPercent)}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Container */}
                    <div className={`flex-1 p-5 md:p-6 overflow-y-auto ${isSuccess ? 'py-6' : ''}`}>
                        <div className={`rounded-2xl p-6 md:p-8 shadow-card max-w-2xl mx-auto animate-slide-up ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Exit Confirmation Dialog */}
            {showExitDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-fade-in">
                    <div className={`rounded-2xl p-6 max-w-sm w-[90%] shadow-2xl animate-scale-in ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>ยกเลิกคำขอ?</h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                ข้อมูลที่กรอกจะถูกบันทึกไว้ คุณสามารถกลับมาดำเนินการต่อได้
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExitDialog(false)}
                                className={`flex-1 py-3 rounded-xl font-medium border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-surface-200 text-slate-600'}`}
                            >
                                ดำเนินการต่อ
                            </button>
                            <Link
                                href="/dashboard"
                                className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white text-center"
                            >
                                ออกจากหน้านี้
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-Save Indicator */}
            {!isSuccess && lastSaved && (
                <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg text-xs text-primary-600 flex items-center gap-1.5 z-50 animate-fade-in ${isDark ? 'bg-primary-500/20 border border-primary-500' : 'bg-primary-50 border border-primary-200'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกอัตโนมัติ {lastSaved}
                </div>
            )}
        </div>
    );
}
