'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { PlantIcon, CheckIcon } from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Variety {
    id: string;
    name: string;
    sourceType: 'SELF' | 'BUY' | 'IMPORT';
    sourceName?: string;
    quantity?: number;
}

interface ProductionInput {
    id: string;
    type: string;
    name: string;
    sourceType: string;
    isOrganic: boolean;
}

interface ProductionFormData {
    plantParts: string[];
    propagationType: string;
    varieties: Variety[];
    seedSource: string;
    varietyName: string;
    estimatedYield: string;
    sourceType: string;
    cultivationArea: string;
    spacing: string;
    plantCount: string;
    productionInputs: ProductionInput[];
}

export const StepProduction = () => {
    const { state, setProductionData } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();
    const { data: masterData } = useMasterData();

    const [formData, setFormData] = useState<ProductionFormData>((state.productionData as unknown as ProductionFormData) || {
        plantParts: [] as string[],
        propagationType: '',
        varieties: [] as Variety[],
        seedSource: '',
        varietyName: '',
        estimatedYield: '',
        sourceType: '',
        cultivationArea: '',
        spacing: '',
        plantCount: '',
        productionInputs: [] as ProductionInput[],
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setProductionData(formData as unknown as any);
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setProductionData]);

    const handleChange = (field: keyof ProductionFormData, value: string | string[] | Variety[] | ProductionInput[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const togglePlantPart = (partId: string) => {
        setFormData(prev => {
            const current = prev.plantParts || [];
            if (current.includes(partId)) {
                return { ...prev, plantParts: current.filter(id => id !== partId) };
            } else {
                return { ...prev, plantParts: [...current, partId] };
            }
        });
    };

    const isNextDisabled = !formData.plantParts?.length || !formData.propagationType || (!formData.varieties?.length);

    return (
        <div className="space-y-8 animate-fade-in pb-12 px-4 max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    5
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.steps.production}</h2>
                    <p className="text-slate-500 text-sm">รายละเอียดส่วนที่นำมาใช้ แหล่งที่มา และปริมาณการผลิต</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Parts Used */}
                <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <span>🌿</span> ส่วนของพืชที่ใช้
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {masterData?.plantParts.map((part) => (
                            <label
                                key={part.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                                    ${formData.plantParts?.includes(part.id)
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-emerald-200'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.plantParts?.includes(part.id)}
                                    onChange={() => togglePlantPart(part.id)}
                                />
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.plantParts?.includes(part.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-slate-50'
                                    }`}>
                                    {formData.plantParts?.includes(part.id) && <CheckIcon className="w-3 h-3" />}
                                </div>
                                <span className="font-medium text-sm">{part.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* 2. Propagation Method */}
                <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <span>🌱</span> วิธีการขยายพันธุ์
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'SEED', label: 'เพาะเมล็ด', icon: '🌱' },
                            { id: 'CUTTING', label: 'ปักชำ', icon: '🌿' },
                            { id: 'TISSUE', label: 'เพาะเนื้อเยื่อ', icon: '🧪' },
                            { id: 'OTHER', label: 'อื่น ๆ', icon: '❓' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => handleChange('propagationType', method.id)}
                                className={`
                                    p-3 rounded-xl border text-left transition-all flex flex-col gap-2 relative overflow-hidden active:scale-95
                                    ${formData.propagationType === method.id
                                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-emerald-200'
                                    }
                                `}
                            >
                                <span className="text-xl">{method.icon}</span>
                                <span className={`font-bold text-sm ${formData.propagationType === method.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                                    {method.label}
                                </span>
                                {formData.propagationType === method.id && (
                                    <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full p-0.5 shadow-sm">
                                        <CheckIcon className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* 3. Plant Varieties */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                        <span>📋</span> ข้อมูลสายพันธุ์
                    </h3>
                </div>

                {(!formData.varieties || formData.varieties.length === 0) ? (
                    <div
                        onClick={() => {
                            const newVariety = { id: Date.now().toString(), name: '', sourceType: 'SELF' as const, quantity: 0 };
                            setFormData(prev => ({ ...prev, varieties: [...(prev.varieties || []), newVariety] }));
                        }}
                        className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 cursor-pointer hover:bg-white hover:border-emerald-300 transition-all active:scale-[0.99]"
                    >
                        <p className="font-medium text-slate-900">ยังไม่ได้เพิ่มข้อมูลสายพันธุ์</p>
                        <p className="text-xs mt-1 text-slate-500">แตะเพื่อเพิ่มสายพันธุ์และระบุรายละเอียด</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.varieties.map((item, index) => (
                            <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm relative group animate-slide-up">
                                <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                    #{String(index + 1).padStart(2, '0')}
                                </span>

                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            varieties: prev.varieties?.filter(v => v.id !== item.id)
                                        }));
                                    }}
                                    className="absolute bottom-3 right-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="space-y-4">
                                    <div>
                                        <FormLabelWithHint label="ชื่อสายพันธุ์" required />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium placeholder:text-slate-400"
                                            placeholder="เช่น หางกระรอก"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newVarieties = [...(formData.varieties || [])];
                                                newVarieties[index].name = e.target.value;
                                                setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FormLabelWithHint label="แหล่งที่มา" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
                                                value={item.sourceType}
                                                onChange={(e) => {
                                                    const newVarieties = [...(formData.varieties || [])];
                                                    newVarieties[index].sourceType = e.target.value as Variety['sourceType'];
                                                    setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                                }}
                                            >
                                                <option value="SELF">เก็บเอง</option>
                                                <option value="BUY">ซื้อมา</option>
                                                <option value="IMPORT">นำเข้า</option>
                                            </select>
                                        </div>
                                        {item.sourceType !== 'SELF' && (
                                            <div className="animate-fade-in">
                                                <FormLabelWithHint label="ชื่อร้าน/แหล่งที่มา" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium placeholder:text-slate-400"
                                                    placeholder="ชื่อร้าน..."
                                                    value={item.sourceName || ''}
                                                    onChange={(e) => {
                                                        const newVarieties = [...(formData.varieties || [])];
                                                        newVarieties[index].sourceName = e.target.value;
                                                        setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newVariety = { id: Date.now().toString(), name: '', sourceType: 'SELF' as const, quantity: 0 };
                                setFormData(prev => ({ ...prev, varieties: [...(prev.varieties || []), newVariety] }));
                            }}
                            className="w-full py-3 rounded-xl border border-dashed border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                        >
                            <span>+ เพิ่มสายพันธุ์อื่น</span>
                        </button>
                    </div>
                )}
            </section>

            {/* 4. Cultivation Summary Card */}
            <div className="rounded-2xl p-5 bg-emerald-50/50 border border-emerald-100">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-emerald-900">
                    <span className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-xs">📊</span>
                    ประมาณการการเพาะปลูก
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <FormLabelWithHint label="ระยะปลูก (Spacing)" />
                        <select
                            className="w-full bg-white border border-emerald-200/50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
                            value={formData.spacing || ''}
                            onChange={(e) => handleChange('spacing', e.target.value)}
                        >
                            <option value="">-- เลือกระยะปลูก --</option>
                            <option value="1x1">1 x 1 เมตร (Standard)</option>
                            <option value="1.5x1.5">1.5 x 1.5 เมตร</option>
                            <option value="2x2">2 x 2 เมตร</option>
                            <option value="4x4">4 x 4 เมตร</option>
                        </select>
                    </div>
                    <div>
                        <FormLabelWithHint label="จำนวนต้นรวม" />
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-white border border-emerald-200/50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium pr-10"
                                placeholder="0"
                                value={formData.plantCount || ''}
                                onChange={(e) => handleChange('plantCount', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">ต้น</span>
                        </div>
                    </div>
                    <div>
                        <FormLabelWithHint label="ผลผลิตคาดการณ์ (ต่อปี)" />
                        <div className="relative">
                            <input
                                type="number"
                                className={`w-full bg-white border border-emerald-200/50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium pr-10 ${Number(formData.estimatedYield) > 500 ? 'border-amber-300 focus:border-amber-500' : ''}`}
                                placeholder="0"
                                value={formData.estimatedYield}
                                onChange={(e) => handleChange('estimatedYield', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">กก.</span>
                        </div>
                        {Number(formData.estimatedYield) > 500 && (
                            <p className="text-[10px] text-amber-600 mt-1 font-bold flex items-center gap-1">
                                ⚠️ เกินค่าเฉลี่ยมาตรฐาน
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Production Inputs */}
            <section className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                            <span>🧴</span> ปัจจัยการผลิต
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">ปุ๋ย, วัสดุปรับปรุงดิน, และสารป้องกันกำจัดศัตรูพืช</p>
                    </div>
                </div>

                {(!formData.productionInputs || formData.productionInputs.length === 0) ? (
                    <div
                        onClick={() => {
                            const newInput = {
                                id: Date.now().toString(),
                                type: 'FERTILIZER',
                                name: '',
                                sourceType: 'PURCHASED',
                                isOrganic: false
                            };
                            setFormData(prev => ({ ...prev, productionInputs: [...(prev.productionInputs || []), newInput] }));
                        }}
                        className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 cursor-pointer hover:bg-white hover:border-emerald-300 transition-all active:scale-[0.99]"
                    >
                        <p className="font-medium text-slate-900">ยังไม่มีข้อมูลปัจจัยการผลิต</p>
                        <p className="text-xs mt-1 text-slate-500">แตะเพื่อเพิ่มปุ๋ยหรือสารบำรุง</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.productionInputs.map((item: ProductionInput, index: number) => (
                            <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 transition-all relative group animate-slide-up shadow-sm">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            productionInputs: prev.productionInputs?.filter((i: ProductionInput) => i.id !== item.id)
                                        }));
                                    }}
                                    className="absolute bottom-3 right-3 text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="space-y-4">
                                    <div>
                                        <FormLabelWithHint label={`รายการที่ ${index + 1}`} />
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
                                                value={item.type}
                                                onChange={(e) => {
                                                    const inputs = [...(formData.productionInputs || [])];
                                                    inputs[index].type = e.target.value;
                                                    setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                                }}
                                            >
                                                <option value="FERTILIZER">ปุ๋ย</option>
                                                <option value="SOIL_AMENDMENT">วัสดุปรับปรุงดิน</option>
                                                <option value="PLANT_PROTECTION">ศัตรูพืช/วัชพืช</option>
                                                <option value="OTHER">อื่นๆ</option>
                                            </select>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium placeholder:text-slate-400"
                                                placeholder="ชื่อเรียก / ยี่ห้อ"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const inputs = [...(formData.productionInputs || [])];
                                                    inputs[index].name = e.target.value;
                                                    setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
                                                value={item.sourceType}
                                                onChange={(e) => {
                                                    const inputs = [...(formData.productionInputs || [])];
                                                    inputs[index].sourceType = e.target.value;
                                                    setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                                }}
                                            >
                                                <option value="PURCHASED">ซื้อจากร้านค้า</option>
                                                <option value="SELF_MADE">ผลิตเอง</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center cursor-pointer gap-2 select-none h-[42px] px-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${item.isOrganic ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                <CheckIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={item.isOrganic || false}
                                                onChange={(e) => {
                                                    const inputs = [...(formData.productionInputs || [])];
                                                    inputs[index].isOrganic = e.target.checked;
                                                    setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                                }}
                                            />
                                            <span className="text-sm font-bold text-slate-700">อินทรีย์</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newInput = {
                                    id: Date.now().toString(),
                                    type: 'FERTILIZER',
                                    name: '',
                                    sourceType: 'PURCHASED',
                                    isOrganic: false
                                };
                                setFormData(prev => ({ ...prev, productionInputs: [...(prev.productionInputs || []), newInput] }));
                            }}
                            className="w-full py-3 rounded-xl border border-dashed border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                        >
                            <span>+ เพิ่มรายการอื่น</span>
                        </button>
                    </div>
                )}
            </section>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/6')}
                onBack={() => router.push('/farmer/applications/new/step/4')}
                isNextDisabled={isNextDisabled}
                showBack={true}
                nextLabel={dict.wizard.navigation.next}
                backLabel={dict.wizard.navigation.back}
            />
        </div>
    );
};

export default StepProduction;
