'use client';

import React from 'react';
import { useWizardStore } from './hooks/useWizardStore';
import { usePathname, useRouter } from 'next/navigation';

const TOTAL_STEPS = 11;

export default function WizardLayout({ children }: { children: React.ReactNode }) {
    const { state: { currentStep } } = useWizardStore();
    const router = useRouter();
    const pathname = usePathname();

    // Derive step from URL or fallback to store
    const stepMatch = pathname?.match(/\/step\/(\d+)/);
    const activeStep = stepMatch ? parseInt(stepMatch[1], 10) : (currentStep + 1);

    // Progress percentage
    const progress = (activeStep / TOTAL_STEPS) * 100;

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center">

            {/* Native App Header: [X] Title [Next/Save] */}
            <div className="w-full max-w-[600px] border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
                <div className="flex items-center justify-between px-4 h-14">
                    <button
                        onClick={() => router.push('/farmer/dashboard')}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-slate-900" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>

                    <span className="font-bold text-lg">New Request</span>

                    {/* Placeholder for 'Save' or 'Next' if we want it in header, but keeping it empty for valid 'Post' feel */}
                    <div className="w-10"></div>
                </div>

                {/* Minimal Progress Line */}
                <div className="h-1 w-full bg-slate-100">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Main Content: Focused Feed Style */}
            <main className="w-full max-w-[600px] flex-1 pb-20">
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>

        </div>
    );
}
