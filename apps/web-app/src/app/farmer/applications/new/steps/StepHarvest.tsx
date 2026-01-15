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
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    8
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">การเก็บเกี่ยวและจัดการ (Harvest & Post-Harvest)</h2>
                    <p className="text-text-secondary">ระบุวิธีการเก็บเกี่ยว การลดความชื้น และการเก็บรักษาตามมาตรฐาน GACP</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl flex gap-4 text-blue-900 shadow-sm animate-slide-up">
                <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                    <InfoIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-blue-900 text-sm">ข้อกำหนดการจัดการหลังเก็บเกี่ยว</p>
                    <p className="text-xs leading-relaxed text-blue-800/80">
                        การจัดการผลผลิตหลังเก็บเกี่ยวมีความสำคัญอย่างยิ่งต่อคุณภาพของสารสำคัญในสมุนไพร
                        กรุณาระบุข้อมูลให้ตรงกับความเป็นจริงเพื่อการประเมินความเสี่ยงที่ถูกต้อง
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {/* 1. Harvest & Drying */}
                <div className="space-y-6">
                    <div className="gacp-card p-6 space-y-5 border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🌾</span>
                            <h3 className="font-bold text-gray-900">วิธีการเก็บเกี่ยว (Harvesting)</h3>
                        </div>

                        <div>
                            <FormLabelWithHint label="วิธีการเก็บเกี่ยว" required />
                            <select
                                className={`gacp-input bg-white ${touched.harvestMethod && errors.harvestMethod ? 'border-danger ring-danger/10' : ''}`}
                                value={formData.harvestMethod}
                                onChange={(e) => handleChange('harvestMethod', e.target.value)}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                <option value="MANUAL">เก็บด้วยมือ (Manual)</option>
                                <option value="MACHINE">ใช้เครื่องจักร (Machine)</option>
                            </select>
                            {touched.harvestMethod && errors.harvestMethod && (
                                <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-medium italic">
                                    <WarningIcon className="w-3 h-3" /> {errors.harvestMethod}
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3 text-xs text-emerald-700">
                            <div className="mt-0.5">💡</div>
                            <p>เลือก "Machine" หากใช้รถเกี่ยวข้าวหรืออุปกรณ์ทุ่นแรงขนาดใหญ่ หากใช้แรงงานคนและอุปกรณ์ขนาดเล็ก ให้เลือก "Manual"</p>
                        </div>
                    </div>

                    <div className="gacp-card p-6 space-y-5 border-orange-100 bg-gradient-to-br from-orange-50/30 to-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">☀️</span>
                            <h3 className="font-bold text-gray-900">การลดความชื้น (Drying)</h3>
                        </div>

                        <div>
                            <FormLabelWithHint label="วิธีการลดความชื้น" required />
                            <select
                                className={`gacp-input bg-white ${touched.dryingMethod && errors.dryingMethod ? 'border-danger ring-danger/10' : ''}`}
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
                                <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-medium italic">
                                    <WarningIcon className="w-3 h-3" /> {errors.dryingMethod}
                                </p>
                            )}
                        </div>

                        {formData.dryingMethod === 'OTHER' && (
                            <div className="animate-slide-down">
                                <FormLabelWithHint label="โปรดระบุรายละเอียด" required />
                                <input
                                    type="text"
                                    className={`gacp-input bg-white ${touched.dryingDetail && errors.dryingDetail ? 'border-danger ring-danger/10' : ''}`}
                                    placeholder="เช่น ตากในห้องควบคุมความชื้น..."
                                    value={formData.dryingDetail}
                                    onChange={(e) => handleChange('dryingDetail', e.target.value)}
                                />
                                {touched.dryingDetail && errors.dryingDetail && (
                                    <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-medium italic">
                                        <WarningIcon className="w-3 h-3" /> {errors.dryingDetail}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-3 text-xs text-orange-700">
                            <div className="mt-0.5">📋</div>
                            <p><strong>Requirement:</strong> ความชื้นที่เหมาะสมของผลผลิตแห้งควรต่ำกว่า 10-12% เพื่อป้องกันการเกิดเชื้อราและสาร Aflatoxin</p>
                        </div>
                    </div>
                </div>

                {/* 2. Storage & Packaging */}
                <div className="space-y-6">
                    <div className="gacp-card p-6 space-y-6 border-blue-100 bg-gradient-to-br from-blue-50/30 to-white h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <span className="text-2xl">📦</span>
                            <h3 className="font-bold text-gray-900">การเก็บรักษา (Storage)</h3>
                        </div>

                        <div className="relative z-10">
                            <FormLabelWithHint label="สถานที่เก็บรักษา" required />
                            <select
                                className={`gacp-input bg-white ${touched.storageSystem && errors.storageSystem ? 'border-danger ring-danger/10' : ''}`}
                                value={formData.storageSystem}
                                onChange={(e) => handleChange('storageSystem', e.target.value)}
                            >
                                <option value="">-- กรุณาเลือก --</option>
                                <option value="CONTROLLED">ห้องควบคุมอุณหภูมิ (Controlled Temp)</option>
                                <option value="AMBIENT">ห้องอุณหภูมิปกติ (Ambient Temp)</option>
                            </select>
                            {touched.storageSystem && errors.storageSystem && (
                                <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-medium italic">
                                    <WarningIcon className="w-3 h-3" /> {errors.storageSystem}
                                </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-2 italic px-1">
                                * สถานที่เก็บต้องแยกจากสารเคมี ปุ๋ย และทำความสะอาดง่าย
                            </p>
                        </div>

                        <div className="relative z-10">
                            <FormLabelWithHint label="บรรจุภัณฑ์ (Packaging)" required />
                            <textarea
                                className={`gacp-input bg-white h-32 resize-none ${touched.packaging && errors.packaging ? 'border-danger ring-danger/10' : ''}`}
                                placeholder="ระบุชนิดถุง/ภาชนะที่ใช้บรรจุ เช่น ถุงสูญญากาศ Food Grade, กระสอบป่านใหม่..."
                                value={formData.packaging}
                                onChange={(e) => handleChange('packaging', e.target.value)}
                            />
                            {touched.packaging && errors.packaging && (
                                <p className="text-xs text-danger mt-1.5 flex items-center gap-1 font-medium italic">
                                    <WarningIcon className="w-3 h-3" /> {errors.packaging}
                                </p>
                            )}
                            <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-700">
                                <span className="text-blue-500">💡</span>
                                <p>ควรใช้วัสดุที่สะอาด แห้ง และเป็น Food Grade เพื่อป้องกันการปนเปื้อนซ้ำ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Alert for GACP */}
            <div className="gacp-card border-amber-200 bg-amber-50/50 p-6 flex items-start gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="p-2 bg-white rounded-xl shadow-sm text-2xl">⚠️</div>
                <div>
                    <h4 className="font-bold text-amber-900 mb-2">ข้อสำคัญตามมาตรฐาน GACP</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-xs text-amber-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            <span>ไม่วางผลผลิตสัมผัสพื้นดินโดยตรง</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            <span>ภาชนะบรรจุต้องสะอาดและแห้งสนิท</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                            <span>ความชื้นควรต่ำกว่า 10-12%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. QR Tracking Preview */}
            <div className="gacp-card border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-8 space-y-6 animate-slide-up relative overflow-hidden" style={{ animationDelay: '300ms' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl shadow-sm">
                        <Icons.QrCode className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">QR Traceability (ตรวจสอบย้อนกลับ)</h3>
                        <p className="text-xs text-gray-500">วางแผนการติดตามผลผลิตตั้งแต่เริ่มปลูกจนถึงวันเก็บเกี่ยว</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <FormLabelWithHint label="วันที่คาดว่าจะเริ่มปลูก" />
                        <input
                            type="date"
                            className="gacp-input bg-white font-bold text-primary-900"
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
                    <div>
                        <FormLabelWithHint label="วันที่คาดว่าจะเก็บเกี่ยว (เฉลี่ย 120 วัน)" />
                        <div className="relative">
                            <input
                                type="date"
                                className="gacp-input bg-gray-50 text-gray-400 font-bold border-gray-100"
                                value={state.cultivationDetails?.estimatedHarvestDate || ''}
                                readOnly
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-md">Auto-calc</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-teal-100 shadow-inner relative z-10">
                    <PlantQRCalculator
                        plantCount={state.cultivationDetails?.totalPlants || state.lots?.reduce((s, l) => s + l.plantCount, 0) || 100}
                        plantingDate={state.cultivationDetails?.plantingDate || new Date().toISOString().split('T')[0]}
                        showPreview={true}
                        onChange={(count, cost) => updateState({ qrCount: count, estimatedQRCost: cost })}
                    />
                </div>

                <div className="flex items-start gap-4 p-5 bg-teal-50/80 rounded-2xl border border-teal-100 relative z-10">
                    <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                        <CheckIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <p className="text-xs text-teal-800 leading-relaxed">
                        <strong>หมายเหตุ:</strong> ระบบจะออก QR Code ประจำต้นให้หลังจากที่คำขอได้รับการอนุมัติพื้นฐานแล้ว โดยรหัสจะถูกนำไปใช้ในขั้นตอนการติดตามดูแลรักษาและการเก็บเกี่ยวต่อไป
                    </p>
                </div>
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
