'use client';

import React, { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { InfoIcon, PlantIcon, WarningIcon } from '@/components/icons/WizardIcons';

// Density constants per cultivation system (plants per sq.m.)
const DENSITY_CONFIG = {
    INDOOR: { min: 4, default: 8, max: 40, label: 'ฟาร์มปิด (Indoor)' },
    OUTDOOR: { min: 0.5, default: 1.5, max: 4, label: 'ฟาร์มเปิด (Outdoor)' },
    GREENHOUSE: { min: 6, default: 10, max: 20, label: 'โรงเรือน (Greenhouse)' },
};

const LOSS_RATE = 0.15; // 15% estimated loss

export const StepProductionEstimate = () => {
    const { state, setLots } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    // Get cultivation system from state
    const cultivationSystem = (state.cultivationMethod?.toUpperCase() || 'OUTDOOR') as keyof typeof DENSITY_CONFIG;
    const systemConfig = DENSITY_CONFIG[cultivationSystem] || DENSITY_CONFIG.OUTDOOR;

    // Get total area from farmData or siteData
    const totalAreaRai = parseFloat(state.farmData?.totalAreaSize || state.siteData?.areaSize || '0');
    const totalAreaSqm = totalAreaRai * 1600;

    // Calculate recommended range
    const recommendedMin = Math.floor(totalAreaSqm * systemConfig.min * (1 - LOSS_RATE));
    const recommendedMax = Math.floor(totalAreaSqm * systemConfig.max * (1 - LOSS_RATE));
    const recommendedDefault = Math.floor(totalAreaSqm * systemConfig.default * (1 - LOSS_RATE));

    // Summary of plants from existing lots (Step 6)
    const totalPlantsFromLots = state.lots?.reduce((sum, lot) => sum + (lot.plantCount || 0), 0) || 0;

    // Local state - prioritize total from lots if available
    const [estimatedPlants, setEstimatedPlants] = useState<number>(
        totalPlantsFromLots > 0 ? totalPlantsFromLots : (state.lots?.[0]?.plantCount || recommendedDefault)
    );
    const [plantingDate, setPlantingDate] = useState<string>(
        state.lots?.[0]?.estimatedPlantingDate || ''
    );
    const [notes, setNotes] = useState<string>(state.lots?.[0]?.notes || '');
    const [validationWarning, setValidationWarning] = useState<string>('');

    // Update estimated plants if lots change and were not manual
    useEffect(() => {
        if (totalPlantsFromLots > 0) {
            setEstimatedPlants(totalPlantsFromLots);
        }
    }, [totalPlantsFromLots]);

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

    // Validation
    const canProceed = estimatedPlants > 0;

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    7
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.preview?.headers?.production || 'ประมาณการผลผลิต (Production Estimate)'}</h2>
                    <p className="text-text-secondary">ข้อมูลสำหรับประเมินศักยภาพการผลิตและตรวจสอบมาตรฐาน GACP</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl flex gap-4 text-blue-900 text-sm shadow-sm animate-slide-up">
                <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                    <InfoIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-blue-900">คำแนะนำมาตรฐาน GACP</p>
                    <p className="leading-relaxed text-blue-800/80">
                        กรุณาระบุจำนวนต้นพืชที่คาดว่าจะปลูก เพื่อใช้ประเมินความเหมาะสมของพื้นที่ (Density Check)
                        {totalPlantsFromLots > 0 && " ระบบสรุปยอดรวมจากแปลงที่คุณแบ่งไว้ในขั้นตอนก่อนหน้าโดยอัตโนมัติ"}
                    </p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="gacp-card bg-gradient-to-br from-primary-50/50 to-white text-center p-6 border-primary-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">พื้นที่ปลูกทั้งหมด</p>
                    <p className="text-4xl font-black text-primary-900">{totalAreaRai} <span className="text-lg text-primary-600 font-medium">ไร่</span></p>
                </div>
                <div className="gacp-card bg-gradient-to-br from-indigo-50/50 to-white text-center p-6 border-indigo-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">ระบบการปลูก</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">{cultivationSystem === 'INDOOR' ? '🏭' : cultivationSystem === 'GREENHOUSE' ? '🏠' : '🌿'}</span>
                        <p className="text-2xl font-black text-indigo-900">{systemConfig.label}</p>
                    </div>
                </div>
                <div className="gacp-card bg-gradient-to-br from-teal-50/50 to-white text-center p-6 border-teal-100 hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">จำนวนล็อต/แปลง</p>
                    <p className="text-4xl font-black text-teal-900">{state.lots?.length || 0} <span className="text-lg text-teal-600 font-medium">รายการ</span></p>
                </div>
            </div>

            {/* Main Estimate Form */}
            <div className="gacp-card p-8 space-y-8 animate-slide-up relative overflow-hidden" style={{ animationDelay: '200ms' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                {/* Estimated Plants Input */}
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                        <FormLabelWithHint
                            label={dict.wizard.preview?.labels?.totalPlants || "จำนวนต้นพืชประมาณการ"}
                            hint="จำนวนต้นทั้งหมดที่คาดว่าจะปลูกในรอบนี้"
                            required
                        />
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-500">
                                ช่วงแนะนำ: {recommendedMin.toLocaleString()} - {recommendedMax.toLocaleString()} ต้น
                            </span>
                        </div>
                    </div>

                    <div className="relative transition-all duration-300">
                        <input
                            type="number"
                            readOnly={totalPlantsFromLots > 0}
                            className={`w-full border rounded-2xl px-6 py-5 text-4xl font-black outline-none transition-all shadow-sm
                                ${totalPlantsFromLots > 0 ? 'bg-gray-50 text-gray-400 border-gray-100' :
                                    validationWarning ? 'border-amber-300 bg-amber-50 focus:ring-4 focus:ring-amber-100 text-amber-900' :
                                        'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-100 text-primary-900'}`}
                            placeholder={`แนะนำ: ${recommendedDefault.toLocaleString()} ต้น`}
                            value={estimatedPlants || ''}
                            onChange={e => setEstimatedPlants(parseInt(e.target.value) || 0)}
                        />
                        <div className={`absolute right-6 top-1/2 -translate-y-1/2 font-black text-2xl pointer-events-none py-2 px-4 rounded-xl ${totalPlantsFromLots > 0 ? 'bg-gray-100 text-gray-300' : 'bg-primary-50 text-primary-500'}`}>
                            ต้น
                        </div>
                    </div>

                    {totalPlantsFromLots > 0 && (
                        <p className="mt-3 text-sm text-primary-600 flex items-center gap-2 font-medium">
                            <Icons.CheckCircle className="w-4 h-4" />
                            ดึงข้อมูลจากรายการล็อตที่คุณสร้างไว้อัตโนมัติ
                        </p>
                    )}

                    {validationWarning && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 animate-slide-down">
                            <WarningIcon className="w-6 h-6 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold mb-0.5">ข้อควรระวัง</p>
                                <p className="opacity-80">{validationWarning}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Density Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-inner group transition-all hover:border-primary-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <PlantIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">Analysis</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ความหนาแน่น (Plant Density)</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-gray-900">
                                {(estimatedPlants / (totalAreaSqm || 1)).toFixed(2)}
                            </p>
                            <span className="text-sm text-gray-400 font-bold">ต้น / ตร.ม.</span>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${estimatedPlants > recommendedMax ? 'bg-amber-400' : 'bg-primary'}`}
                                style={{ width: `${Math.min(100, (estimatedPlants / (recommendedMax || 1)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <FormLabelWithHint label={dict.wizard.preview?.labels?.plantingDate || "วันที่เริ่มปลูก / คาดว่าจะปลูก"} />
                            <input
                                type="date"
                                className="gacp-input font-bold text-primary-900"
                                value={plantingDate}
                                onChange={e => setPlantingDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="หมายเหตุการผลิต" hint="เช่น แผนการเก็บเกี่ยว หรือข้อมูลเพิ่มเติม..." />
                            <textarea
                                className="gacp-input min-h-[100px] resize-none text-sm"
                                placeholder="ระบุข้อมูลเพิ่มเติม..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
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
