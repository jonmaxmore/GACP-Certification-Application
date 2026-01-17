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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEstimatedPlants(totalPlantsFromLots);
        }
    }, [totalPlantsFromLots]);

    // Validate plant count
    useEffect(() => {
        if (estimatedPlants > recommendedMax * 1.5) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
    return (
        <div className="space-y-6 animate-fade-in px-4 max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    7
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.preview?.headers?.production || 'ประมาณการผลผลิต'}</h2>
                    <p className="text-slate-500 text-sm">ข้อมูลสำหรับประเมินศักยภาพการผลิตและตรวจสอบมาตรฐาน GACP</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <InfoIcon className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-800 mb-0.5">คำแนะนำมาตรฐาน GACP</p>
                    <p className="text-[11px] leading-relaxed text-blue-700/80">
                        กรุณาระบุจำนวนต้นพืชที่คาดว่าจะปลูก เพื่อใช้ประเมินความเหมาะสมของพื้นที่ (Density Check)
                        {totalPlantsFromLots > 0 && " ระบบสรุปยอดรวมจากแปลงที่คุณแบ่งไว้ในขั้นตอนก่อนหน้าโดยอัตโนมัติ"}
                    </p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">พื้นที่ปลูก</p>
                    <p className="text-lg font-black text-slate-800">{totalAreaRai} <span className="text-[10px] text-slate-400 font-bold">ไร่</span></p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ระบบ</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-base">{cultivationSystem === 'INDOOR' ? '🏭' : cultivationSystem === 'GREENHOUSE' ? '🏠' : '🌿'}</span>
                        <p className="text-lg font-black text-slate-800 truncate text-[10px]">{systemConfig.label.split(' ')[0]}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">แปลง</p>
                    <p className="text-lg font-black text-slate-800">{state.lots?.length || 0} <span className="text-[10px] text-slate-400 font-bold">จุด</span></p>
                </div>
            </div>

            {/* Main Estimate Form */}
            <div className="space-y-6">
                {/* Estimated Plants Input */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800">จำนวนต้นพืชประมาณการ</label>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-500">
                                แนะนำ: {recommendedMin.toLocaleString()} - {recommendedMax.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="number"
                            readOnly={totalPlantsFromLots > 0}
                            className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-3xl font-black outline-none transition-all text-center
                                ${totalPlantsFromLots > 0 ? 'text-slate-400 border-slate-200' :
                                    validationWarning ? 'border-amber-300 bg-amber-50 text-amber-900 focus:ring-4 focus:ring-amber-100' :
                                        'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 text-slate-800'}`}
                            placeholder="0"
                            value={estimatedPlants || ''}
                            onChange={e => setEstimatedPlants(parseInt(e.target.value) || 0)}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">ต้น</span>
                    </div>

                    {totalPlantsFromLots > 0 && (
                        <p className="text-xs text-emerald-600 flex items-center justify-center gap-1.5 font-bold bg-emerald-50 py-2 rounded-xl">
                            <Icons.CheckCircle className="w-3.5 h-3.5" />
                            ดึงข้อมูลจากรายการล็อตอัตโนมัติ
                        </p>
                    )}

                    {validationWarning && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 animate-slide-down">
                            <WarningIcon className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed">
                                <p className="font-bold mb-0.5">ข้อควรระวัง</p>
                                <p className="opacity-90">{validationWarning}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Density Analysis */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <PlantIcon className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">ความหนาแน่น</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">Analysis</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-3">
                            <p className="text-3xl font-black text-slate-800">
                                {(estimatedPlants / (totalAreaSqm || 1)).toFixed(2)}
                            </p>
                            <span className="text-xs text-slate-400 font-bold">ต้น / ตร.ม.</span>
                        </div>

                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 rounded-full ${estimatedPlants > recommendedMax ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (estimatedPlants / (recommendedMax || 1)) * 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-400">
                            <span>0</span>
                            <span>Max: {recommendedMax.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <FormLabelWithHint label={dict.wizard.preview?.labels?.plantingDate || "วันที่เริ่มปลูก / คาดว่าจะปลูก"} />
                            <input
                                type="date"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700"
                                value={plantingDate}
                                onChange={e => setPlantingDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="หมายเหตุการผลิต" hint="เช่น แผนการเก็บเกี่ยว หรือข้อมูลเพิ่มเติม..." />
                            <textarea
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm min-h-[100px] resize-none placeholder:text-slate-400"
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
