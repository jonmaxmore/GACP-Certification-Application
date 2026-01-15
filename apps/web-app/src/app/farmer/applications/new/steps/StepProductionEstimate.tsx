'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { InfoIcon, WarningIcon, PlantIcon } from '@/components/icons/WizardIcons';

// Density constants per cultivation system (plants per sq.m.)
const DENSITY_CONFIG = {
    INDOOR: { min: 4, default: 8, max: 40, label: 'ฟาร์มปิด' },
    OUTDOOR: { min: 0.5, default: 1.5, max: 4, label: 'ฟาร์มเปิด' },
    GREENHOUSE: { min: 6, default: 10, max: 20, label: 'โรงเรือน' },
};

const LOSS_RATE = 0.15; // 15% estimated loss

export const StepProductionEstimate = () => {
    const { state, setLots } = useWizardStore();
    const router = useRouter();

    // Get cultivation system from Step 1
    const cultivationSystem = (state.cultivationMethod?.toUpperCase() || 'OUTDOOR') as keyof typeof DENSITY_CONFIG;
    const systemConfig = DENSITY_CONFIG[cultivationSystem] || DENSITY_CONFIG.OUTDOOR;

    // Get total area from Step 3/4
    const totalAreaRai = parseFloat(state.farmData?.totalAreaSize || state.siteData?.areaSize || '0');
    const totalAreaSqm = totalAreaRai * 1600;

    // Calculate recommended range
    const recommendedMin = Math.floor(totalAreaSqm * systemConfig.min * (1 - LOSS_RATE));
    const recommendedMax = Math.floor(totalAreaSqm * systemConfig.max * (1 - LOSS_RATE));
    const recommendedDefault = Math.floor(totalAreaSqm * systemConfig.default * (1 - LOSS_RATE));

    // Local state
    // Initialize from the first lot if available, otherwise default recommendation
    const [estimatedPlants, setEstimatedPlants] = useState<number>(
        state.lots?.[0]?.plantCount || recommendedDefault
    );
    const [estimatedYieldKg, setEstimatedYieldKg] = useState<number>(0);
    const [plantingDate, setPlantingDate] = useState<string>(
        state.lots?.[0]?.estimatedPlantingDate || ''
    );
    const [notes, setNotes] = useState<string>(state.lots?.[0]?.notes || '');
    const [validationWarning, setValidationWarning] = useState<string>('');

    // Calculate yield when plants change (300g-500g per plant average)
    useEffect(() => {
        const yieldPerPlant = cultivationSystem === 'INDOOR' ? 0.3 : 0.5; // kg
        setEstimatedYieldKg(Math.round(estimatedPlants * yieldPerPlant));
    }, [estimatedPlants, cultivationSystem]);

    // Validate plant count
    useEffect(() => {
        if (estimatedPlants > recommendedMax * 1.5) {
            setValidationWarning(`จำนวนต้นสูงกว่าค่าแนะนำมาก (สูงสุด ~${recommendedMax.toLocaleString()} ต้น สำหรับพื้นที่ ${totalAreaRai} ไร่)`);
        } else if (estimatedPlants < recommendedMin * 0.5 && estimatedPlants > 0) {
            setValidationWarning(`จำนวนต้นต่ำกว่าค่าแนะนำมาก (ต่ำสุด ~${recommendedMin.toLocaleString()} ต้น)`);
        } else {
            setValidationWarning('');
        }
    }, [estimatedPlants, recommendedMin, recommendedMax, totalAreaRai]);

    // Sync with store
    // Use useRef to store the lot ID to prevent recreating it on every render unless intended
    const lotIdRef = React.useRef(state.lots?.[0]?.id || crypto.randomUUID());

    useEffect(() => {
        if (estimatedPlants > 0) {
            const lotData = {
                id: lotIdRef.current,
                lotCode: `LOT-${new Date().getFullYear() % 100}-001`,
                plotId: state.plots?.[0]?.id || '', // Assign to first plot for now, or could handle multi-plot logic
                plotName: state.plots?.[0]?.name || 'แปลงหลัก',
                plantCount: estimatedPlants,
                estimatedPlantingDate: plantingDate,
                estimatedYieldKg,
                status: 'PLANNED' as const,
                notes,
            };
            setLots([lotData]);
        }
    }, [estimatedPlants, plantingDate, estimatedYieldKg, notes, setLots, state.plots]);

    const canProceed = estimatedPlants > 0;

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    5
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ประมาณการผลผลิต (Production Estimate)</h2>
                    <p className="text-text-secondary">ข้อมูลสำหรับประเมินศักยภาพการผลิตและตรวจสอบมาตรฐาน GACP</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60"></div>
                <div className="flex gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
                        <InfoIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <strong className="text-amber-900 block mb-1 text-sm font-bold">ข้อมูลสำคัญ</strong>
                        <p className="text-amber-800/80 text-sm leading-relaxed">
                            กรุณาระบุจำนวนต้นพืชที่คาดว่าจะปลูกหรือปลูกจริง เพื่อใช้ประเมินกำลังการผลิต การระบุจำนวนที่แม่นยำจะช่วยให้การออกใบรับรองมีความถูกต้องมากขึ้น
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Context Card */}
            <div className="gacp-card bg-gradient-to-br from-primary-50 to-white relative overflow-hidden border-primary-100">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary-100/30 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur border border-white shadow-sm">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">พื้นที่ปลูกทั้งหมด</p>
                        <p className="text-3xl font-bold text-primary-900">{totalAreaRai} <span className="text-lg text-text-secondary font-medium">ไร่</span></p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur border border-white shadow-sm">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">ระบบการปลูก</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">{cultivationSystem === 'INDOOR' ? '🏭' : cultivationSystem === 'GREENHOUSE' ? '🏠' : '🌿'}</span>
                            <p className="text-2xl font-bold text-primary-900">{systemConfig.label}</p>
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur border border-white shadow-sm">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">จำนวนแปลงย่อย</p>
                        <p className="text-3xl font-bold text-blue-600">{state.plots?.length || 0} <span className="text-lg text-text-secondary font-medium">แปลง</span></p>
                    </div>
                </div>
            </div>

            {/* Main Estimate Form */}
            <div className="gacp-card p-8 space-y-8 relative">
                {/* Estimated Plants Input */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                        <FormLabelWithHint
                            label="จำนวนต้นพืชประมาณการ"
                            hint="จำนวนต้นทั้งหมดที่คาดว่าจะปลูกในรอบนี้"
                            required
                        />
                        <span className="text-[10px] font-medium text-text-tertiary bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                            ช่วงแนะนำ: {recommendedMin.toLocaleString()} - {recommendedMax.toLocaleString()} ต้น
                        </span>
                    </div>

                    <div className="relative">
                        <input
                            type="number"
                            className={`w-full border rounded-xl px-5 py-4 text-2xl font-bold outline-none transition-all shadow-sm
                                ${validationWarning
                                    ? 'border-amber-300 bg-amber-50 focus:ring-4 focus:ring-amber-100'
                                    : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50'
                                }`}
                            placeholder={`แนะนำ: ${recommendedDefault.toLocaleString()} ต้น`}
                            value={estimatedPlants || ''}
                            onChange={e => setEstimatedPlants(parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-text-tertiary font-bold pointer-events-none bg-transparent pl-2">ต้น</div>
                    </div>

                    {validationWarning && (
                        <div className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 animate-pulse-soft">
                            <WarningIcon className="w-4 h-4 text-amber-500" />
                            {validationWarning}
                        </div>
                    )}
                </div>

                {/* Quick Select Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                        ⚡ เลือกด่วน:
                    </span>
                    <div className="flex flex-wrap gap-2 w-full">
                        {[
                            { label: 'ขั้นต่ำ (Min)', value: recommendedMin, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
                            { label: 'ค่าแนะนำ (Avg)', value: recommendedDefault, color: 'text-primary-700 bg-primary-50 border-primary-200 hover:bg-primary-100' },
                            { label: 'สูงสุด (Max)', value: recommendedMax, color: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100' },
                        ].map((option) => (
                            <button
                                key={option.label}
                                onClick={() => setEstimatedPlants(option.value)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm
                                    ${estimatedPlants === option.value
                                        ? 'bg-primary text-white border-primary ring-2 ring-primary-100 ring-offset-1 shadow-md'
                                        : `${option.color}`
                                    }
                                `}
                            >
                                {option.label} <span className="opacity-70 font-normal ml-0.5">(~{option.value.toLocaleString()})</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Estimated Yield (Auto-calculated) */}
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-inner group transition-all hover:border-primary-100">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                            🌱 ผลผลิตคาดการณ์ (ต่อรอบ)
                        </label>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-4xl font-bold text-primary-900 group-hover:text-primary transition-colors">
                                {estimatedYieldKg.toLocaleString()}
                            </p>
                            <span className="text-sm text-text-tertiary font-medium">กิโลกรัม</span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-2">
                            *คำนวณจากค่าเฉลี่ย {cultivationSystem === 'INDOOR' ? '300' : '500'}g ต่อต้น
                        </p>
                    </div>

                    {/* Estimated Planting Date */}
                    <div>
                        <FormLabelWithHint label="วันที่เริ่มปลูก / คาดว่าจะปลูก" />
                        <input
                            type="date"
                            className="gacp-input font-medium cursor-pointer"
                            value={plantingDate}
                            onChange={e => setPlantingDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <FormLabelWithHint label="หมายเหตุเพิ่มเติม" hint="เช่น สายพันธุ์ที่ใช้, เทคนิคการปลูกพิเศษ" />
                    <textarea
                        className="gacp-input min-h-[100px] resize-none"
                        placeholder="ระบุข้อมูลเพิ่มเติม..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                </div>
            </div>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/8')}
                onBack={() => router.push('/farmer/applications/new/step/6')}
                isNextDisabled={!canProceed}
            />
        </div>
    );
};

export default StepProductionEstimate;
