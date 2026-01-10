'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { StepPlantSelection } from './steps/StepPlantSelection';
import { StepLand } from './steps/StepLand';
import { StepPlots } from './steps/StepPlots';
import { StepProduction } from './steps/StepProduction';
import { StepDocuments } from './steps/StepDocuments';
import { StepReview } from './steps/StepReview';
import { StepQuote } from './steps/StepQuote';
import { StepInvoice } from './steps/StepInvoice';
import { StepSuccess } from './steps/StepSuccess';

const STEPS = [
    { title: 'ข้อมูลพืช', titleEN: 'Plant Information' },
    { title: 'สถานที่', titleEN: 'Location' },
    { title: 'แปลงปลูก', titleEN: 'Plots' },
    { title: 'การผลิต', titleEN: 'Production' },
    { title: 'เอกสาร', titleEN: 'Documents' },
    { title: 'ตรวจสอบ', titleEN: 'Review' },
    { title: 'ใบเสนอราคา', titleEN: 'Quotation' },
    { title: 'ชำระเงิน', titleEN: 'Payment' },
    { title: 'เสร็จสิ้น', titleEN: 'Success' },
];

function ApplicationWizard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const stepParam = searchParams.get('step');
        if (stepParam) {
            const stepIndex = parseInt(stepParam, 10);
            if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < STEPS.length) {
                setCurrentStep(stepIndex);
            }
        }
    }, [searchParams]);

    const handleStepChange = (index: number) => {
        // Logic to allow navigation only to completed/current steps could be added here
        // For now, simpler navigation
        if (index <= currentStep + 1 || index < currentStep) { // Allow going back or 1 step forward (dev friendly)
            setCurrentStep(index);
            router.push(`/applications/new?step=${index}`);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[300px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                                src="/dtam_logo_new.png"
                                alt="GACP Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-tight">GACP Smart</h1>
                            <p className="text-xs text-slate-400">Application Wizard</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep === index;
                            const isCompleted = currentStep > index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleStepChange(index)}
                                    disabled={!isCompleted && !isActive}
                                    className={`
                                        w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all duration-200
                                        ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' : ''}
                                        ${!isActive && !isCompleted ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
                                    `}
                                >
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors flex-shrink-0
                                        ${isActive ? 'bg-emerald-500 text-white shadow-md' :
                                            isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}
                                    `}>
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <div>
                                        <div className={`font-semibold text-sm ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}>
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-slate-400 font-light">{step.titleEN}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
                            Status
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            {currentStep >= 5 ? 'ตรวจสอบเอกสาร...' : 'กำลังร่างคำขอ...'}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-[1000px] mx-auto bg-white min-h-[80vh] rounded-2xl shadow-sm border border-slate-100 p-0 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0 pointer-events-none"></div>

                    {/* Step Content */}
                    <div className="relative z-10 w-full">
                        {currentStep === 0 && <div className="p-8"><StepPlantSelection /></div>}
                        {currentStep === 1 && <div className="p-8"><StepLand /></div>}
                        {currentStep === 2 && <div className="p-8"><StepPlots /></div>}
                        {currentStep === 3 && <div className="p-8"><StepProduction /></div>}
                        {currentStep === 4 && <div className="p-8"><StepDocuments /></div>}
                        {currentStep === 5 && <StepReview />}
                        {currentStep === 6 && <StepQuote />}
                        {currentStep === 7 && <StepInvoice />}
                        {currentStep === 8 && <div className="p-8"><StepSuccess /></div>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ApplicationWizard />
        </Suspense>
    );
}
