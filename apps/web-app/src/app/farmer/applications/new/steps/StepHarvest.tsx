'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { PlantQRCalculator } from '@/components/PlantQRCalculator';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { InfoIcon, WarningIcon, CheckIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StepHarvest = () => {
    const { state, setHarvestData, updateState } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    const [formData, setFormData] = useState(state.harvestData || {
        harvestMethod: '',
        dryingMethod: '',
        dryingDetail: '',
        storageSystem: '',
        packaging: '',
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            setHarvestData(formData as any);
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setHarvestData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.harvestMethod) errors.harvestMethod = 'กรุณาเลือกวิธีการเก็บเกี่ยว';
        if (!formData.dryingMethod) errors.dryingMethod = 'กรุณาเลือกวิธีการลดความชื้น';
        if (formData.dryingMethod === 'OTHER' && !formData.dryingDetail?.trim()) {
            errors.dryingDetail = 'กรุณาระบุรายละเอียดวิธีการตากแห้ง';
        }
        if (!formData.storageSystem) errors.storageSystem = 'กรุณาเลือกสถานที่เก็บรักษา';
        if (!formData.packaging?.trim()) errors.packaging = 'กรุณาระบุข้อมูลบรรจุภัณฑ์';
        return errors;
    };

    const errors = validate();
    const isValid = Object.keys(errors).length === 0;

    return (
    return (
        <div className="space-y-6 animate-fade-in px-4 max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    8
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">การเก็บเกี่ยวและจัดการ</h2>
                    <p className="text-slate-500 text-sm">ระบุวิธีการเก็บเกี่ยว การลดความชื้นและการจัดการหลังเก็บเกี่ยว</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <InfoIcon className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-800 mb-0.5">ข้อกำหนดการจัดการหลังเก็บเกี่ยว</p>
                    <p className="text-[11px] leading-relaxed text-blue-700/80">
                        การจัดการผลผลิตหลังเก็บเกี่ยวมีความสำคัญอย่างยิ่งต่อคุณภาพของสารสำคัญในสมุนไพร
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Harvest & Drying */}
                <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">🌾</span>
                            <h3 className="font-bold text-slate-800">วิธีการเก็บเกี่ยว</h3>
                        </div>

                        <div>
                            <select
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none ${touched.harvestMethod && errors.harvestMethod ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                                value={formData.harvestMethod}
                                onChange={(e) => handleChange('harvestMethod', e.target.value)}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                <option value="MANUAL">เก็บด้วยมือ (Manual)</option>
                                <option value="MACHINE">ใช้เครื่องจักร (Machine)</option>
                            </select>
                            {touched.harvestMethod && errors.harvestMethod && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-bold">
                                    <WarningIcon className="w-3 h-3" /> {errors.harvestMethod}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">☀️</span>
                            <h3 className="font-bold text-slate-800">การลดความชื้น</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <select
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none ${touched.dryingMethod && errors.dryingMethod ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                                    value={formData.dryingMethod}
                                    onChange={(e) => handleChange('dryingMethod', e.target.value)}
                                >
                                    <option value="">-- กรุณาเลือก --</option>
                                    <option value="SUN">ตากแดดธรรมชาติ (Sun Dry)</option>
                                    <option value="OVEN">ตู้อบความร้อน (Hot Air Oven)</option>
                                    <option value="DEHYDRATOR">เครื่องลดความชื้น (Dehydrator)</option>
                                    <option value="OTHER">อื่นๆ (Other)</option>
                                </select>
                                {touched.dryingMethod && errors.dryingMethod && (
                                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-bold">
                                        <WarningIcon className="w-3 h-3" /> {errors.dryingMethod}
                                    </p>
                                )}
                            </div>

                            {formData.dryingMethod === 'OTHER' && (
                                <div className="animate-slide-down">
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium placeholder:text-slate-400 ${touched.dryingDetail && errors.dryingDetail ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                                        placeholder="ระบุรายละเอียด..."
                                        value={formData.dryingDetail}
                                        onChange={(e) => handleChange('dryingDetail', e.target.value)}
                                    />
                                    {touched.dryingDetail && errors.dryingDetail && (
                                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-bold">
                                            <WarningIcon className="w-3 h-3" /> {errors.dryingDetail}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Storage & Packaging */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">📦</span>
                        <h3 className="font-bold text-slate-800">การเก็บรักษาและบรรจุภัณฑ์</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <FormLabelWithHint label="สถานที่เก็บรักษา" required />
                            <select
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none ${touched.storageSystem && errors.storageSystem ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                                value={formData.storageSystem}
                                onChange={(e) => handleChange('storageSystem', e.target.value)}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                <option value="CONTROLLED">ห้องควบคุมอุณหภูมิ (Controlled Temp)</option>
                                <option value="AMBIENT">ห้องอุณหภูมิปกติ (Ambient Temp)</option>
                            </select>
                            {touched.storageSystem && errors.storageSystem && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-bold">
                                    <WarningIcon className="w-3 h-3" /> {errors.storageSystem}
                                </p>
                            )}
                        </div>

                        <div>
                            <FormLabelWithHint label="บรรจุภัณฑ์" required />
                            <textarea
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium h-24 resize-none placeholder:text-slate-400 ${touched.packaging && errors.packaging ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                                placeholder="ระบุชนิดถุง/ภาชนะที่ใช้บรรจุ..."
                                value={formData.packaging}
                                onChange={(e) => handleChange('packaging', e.target.value)}
                            />
                            {touched.packaging && errors.packaging && (
                                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-bold">
                                    <WarningIcon className="w-3 h-3" /> {errors.packaging}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Alert for GACP */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-4">
                <div className="text-xl">⚠️</div>
                <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-2">ข้อสำคัญตามมาตรฐาน GACP</h4>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-amber-800">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            <span>ไม่วางผลผลิตสัมผัสพื้นดินโดยตรง</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-amber-800">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            <span>ภาชนะบรรจุต้องสะอาดและแห้งสนิท</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-amber-800">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            <span>ความชื้นควรต่ำกว่า 10-12%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. QR Tracking Preview (Simplified) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                        <Icons.QrCode className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">QR Traceability</h3>
                        <p className="text-xs text-slate-500">สำหรับติดตามผลผลิต</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <FormLabelWithHint label="วันที่คาดว่าจะเริ่มปลูก" />
                        <input
                            type="date"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700"
                            value={state.cultivationDetails?.plantingDate || ''}
                            onChange={(e) => {
                                const plantingDate = e.target.value;
                                const harvestDate = plantingDate ?
                                    new Date(new Date(plantingDate).getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
                                updateState({
                                    cultivationDetails: {
                                        ...(state.cultivationDetails || { method: 'outdoor', strainId: '', totalPlants: 0, plantingDate: '' }),
                                        plantingDate,
                                        estimatedHarvestDate: harvestDate
                                    }
                                });
                            }}
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <PlantQRCalculator
                            plantCount={state.cultivationDetails?.totalPlants || state.lots?.reduce((s, l) => s + l.plantCount, 0) || 100}
                            plantingDate={state.cultivationDetails?.plantingDate || new Date().toISOString().split('T')[0]}
                            showPreview={true}
                            onChange={(count, cost) => updateState({ qrCount: count, estimatedQRCost: cost })}
                        />
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                    ระบบจะออก QR Code ประจำต้นให้หลังจากที่คำขอได้รับการอนุมัติ
                </p>
            </div>

            <WizardNavigation
                onNext={() => {
                    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                    setTouched(allTouched);
                    if (isValid) router.push('/farmer/applications/new/step/9');
                }}
                onBack={() => router.push('/farmer/applications/new/step/7')}
                isNextDisabled={!isValid}
            />
        </div>
    );
};

export default StepHarvest;
