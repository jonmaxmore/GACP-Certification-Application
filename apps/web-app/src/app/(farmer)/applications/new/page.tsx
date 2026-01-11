'use client';

import React, { Suspense } from 'react';
import { useWizardStore } from './hooks/useWizardStore';
import { StepPlantSelection } from './steps/StepPlantSelection';
import { StepLand } from './steps/StepLand';
import { StepPlots } from './steps/StepPlots';
import { StepProduction } from './steps/StepProduction';
import { StepDocuments } from './steps/StepDocuments';
import { StepPreCheck } from './steps/StepPreCheck';
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
    { title: 'ตรวจสอบก่อนส่ง', titleEN: 'Pre-Check' }, // Validates integrity
    { title: 'ตรวจสอบ', titleEN: 'Review' },
    { title: 'ใบเสนอราคา', titleEN: 'Quotation' },
    { title: 'ชำระเงิน', titleEN: 'Payment' },
    { title: 'เสร็จสิ้น', titleEN: 'Success' },
];

function ApplicationWizard() {
    const { state: { currentStep } } = useWizardStore();

    return (
        <div className="bg-slate-50 min-h-full pb-20">
            {/* Top Progress Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">ยื่นคำขอใหม่ (New Application)</h1>
                        <p className="text-xs text-slate-500">ขั้นตอนที่ {currentStep + 1} จาก {STEPS.length}: {STEPS[currentStep]?.title || 'Unknown'}</p>
                    </div>
                    {/* Simple Progress Ring */}
                    <div className="flex items-center gap-2">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Status</div>
                            <div className="text-xs text-slate-500">{currentStep >= 6 ? 'ตรวจสอบเอกสาร' : 'กำลังดำเนินการ'}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-700 bg-white shadow-sm">
                            {currentStep + 1}
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
                        {currentStep === 0 && <div className="p-8"><StepPlantSelection /></div>}
                        {currentStep === 1 && <div className="p-8"><StepLand /></div>}
                        {currentStep === 2 && <div className="p-8"><StepPlots /></div>}
                        {currentStep === 3 && <div className="p-8"><StepProduction /></div>}
                        {currentStep === 4 && <div className="p-8"><StepDocuments /></div>}
                        {currentStep === 5 && <div className="p-8"><StepPreCheck /></div>}
                        {currentStep === 6 && <StepReview />}
                        {currentStep === 7 && <StepQuote />}
                        {currentStep === 8 && <StepInvoice />}
                        {currentStep === 9 && <div className="p-8"><StepSuccess /></div>}
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
