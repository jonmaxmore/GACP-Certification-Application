"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const STEPS = [
    { id: 0, path: 'step-0', label: 'เลือกพืช', labelEN: 'Plant Selection' },
    { id: 1, path: 'step-1', label: 'วัตถุประสงค์', labelEN: 'Purpose' },
    { id: 2, path: 'step-2', label: 'บริการ', labelEN: 'Services' },
    { id: 3, path: 'step-3', label: 'ยินยอม', labelEN: 'Consent' },
    { id: 4, path: 'step-4', label: 'ผู้ยื่น', labelEN: 'Applicant' },
    { id: 5, path: 'step-5', label: 'สถานที่', labelEN: 'Location' },
    { id: 6, path: 'step-6', label: 'การผลิต', labelEN: 'Production' },
    { id: 7, path: 'step-7', label: 'เอกสาร', labelEN: 'Documents' },
    { id: 8, path: 'step-8', label: 'มาตรฐานสากล', labelEN: 'International', optional: true },
    { id: 9, path: 'step-9', label: 'ตรวจสอบ', labelEN: 'Review' },
    { id: 10, path: 'step-10', label: 'ใบเสนอราคา', labelEN: 'Quote' },
    { id: 11, path: 'step-11', label: 'ใบวางบิล', labelEN: 'Invoice' },
    { id: 12, path: 'step-12', label: 'ชำระเงิน', labelEN: 'Payment' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
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
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Desktop Layout - 3 Column */}
            <div className="flex min-h-screen">
                {/* Sidebar - Fixed Left */}
                <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-200 sticky top-0 h-screen flex-shrink-0">
                    {/* Logo Header */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/dashboard" className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l2.3 2.3a2.4 2.4 0 0 0 3.4-3.4L15.4 14.6l6-6c4.5-4.5.5-8.5-4-4l-6.3 6.3-2.4-2.4a2.4 2.4 0 0 0-3.4 3.4L7.7 14.3l-4 4a2.4 2.4 0 0 0 0 3.4l2.6-1.4z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">GACP Thailand</div>
                                <div className="text-sm text-gray-500">มาตรฐานสมุนไพรไทย</div>
                            </div>
                        </Link>
                    </div>

                    {/* Steps Navigation */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-4">
                            ขั้นตอนการยื่นคำขอ
                        </div>
                        <nav className="space-y-1">
                            {STEPS.map((step, i) => {
                                const isCompleted = i < currentStep;
                                const isCurrent = i === currentStep;
                                const isFuture = i > currentStep;

                                const stepContent = (
                                    <div className={`
                                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isCurrent ? 'bg-primary-50 border border-primary-200' : ''}
                                        ${isCompleted ? 'hover:bg-gray-50 cursor-pointer' : ''}
                                        ${isFuture ? 'opacity-40' : ''}
                                    `}>
                                        {/* Step Number/Check */}
                                        <div className={`
                                            w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                                            ${isCompleted ? 'bg-primary-500 text-white' : ''}
                                            ${isCurrent ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : ''}
                                            ${isFuture ? 'bg-gray-100 text-gray-400' : ''}
                                        `}>
                                            {isCompleted ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M20 6L9 17L4 12" />
                                                </svg>
                                            ) : (
                                                step.id + 1
                                            )}
                                        </div>

                                        {/* Step Label */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`
                                                text-sm font-semibold truncate
                                                ${isCurrent ? 'text-primary-700' : ''}
                                                ${isCompleted ? 'text-gray-700' : ''}
                                                ${isFuture ? 'text-gray-400' : ''}
                                            `}>
                                                {step.label}
                                            </div>
                                            <div className={`
                                                text-xs truncate
                                                ${isCurrent ? 'text-primary-500' : 'text-gray-400'}
                                            `}>
                                                {step.labelEN}
                                            </div>
                                        </div>

                                        {/* Optional Badge */}
                                        {step.optional && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                Optional
                                            </span>
                                        )}

                                        {/* Arrow for completed */}
                                        {isCompleted && (
                                            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                );

                                return isCompleted ? (
                                    <Link key={step.id} href={`/applications/new/${step.path}`}>
                                        {stepContent}
                                    </Link>
                                ) : (
                                    <div key={step.id}>{stepContent}</div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Help Section */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-2">ต้องการความช่วยเหลือ?</p>
                            <a href="tel:02-123-4567" className="flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                02-123-4567
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* Top Header Bar */}
                    {!isSuccess && (
                        <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
                            <div className="flex items-center justify-between max-w-4xl">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {STEPS[currentStep]?.label}
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ขั้นตอนที่ {currentStep + 1} จาก {STEPS.length} • {STEPS[currentStep]?.labelEN}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    {/* Progress */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-36 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-primary-600">{Math.round(progressPercent)}%</span>
                                    </div>
                                    {/* Exit Button */}
                                    <button
                                        onClick={() => setShowExitDialog(true)}
                                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        ออก
                                    </button>
                                </div>
                            </div>
                        </header>
                    )}

                    {/* Content Container */}
                    <div className={`flex-1 ${isSuccess ? 'py-8' : 'p-8'}`}>
                        <div className="max-w-5xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 animate-fade-in">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Auto-Save Indicator */}
                    {!isSuccess && lastSaved && (
                        <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-soft text-sm text-gray-500 animate-fade-in">
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            บันทึกอัตโนมัติ {lastSaved}
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Header - Show only on smaller screens */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-br from-primary-600 to-primary-500 px-5 py-4 pb-6 rounded-b-3xl shadow-lg z-50">
                <div className="flex justify-between items-center mb-3">
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
                <h1 className="text-white text-lg font-semibold">{STEPS[currentStep]?.label}</h1>
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden mt-3">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Exit Confirmation Dialog */}
            {showExitDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-[90%] shadow-2xl animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">ยกเลิกคำขอ?</h3>
                            <p className="text-gray-500">
                                ข้อมูลที่กรอกจะถูกบันทึกไว้ คุณสามารถกลับมาดำเนินการต่อได้ภายหลัง
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowExitDialog(false)}
                                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                ดำเนินการต่อ
                            </button>
                            <Link
                                href="/dashboard"
                                className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white text-center hover:bg-red-600 transition-colors"
                            >
                                ออกจากหน้านี้
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
