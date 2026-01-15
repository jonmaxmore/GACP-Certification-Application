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
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                    5
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary">{dict.wizard.steps.production}</h2>
                    <p className="text-text-secondary text-sm">รายละเอียดส่วนที่นำมาใช้ แหล่งที่มา และปริมาณการผลิต</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Parts Used */}
                <div className="gacp-card">
                    <h3 className="gacp-title text-lg mb-4 flex items-center gap-2">
                        <span>🌿</span> ส่วนของพืชที่ใช้
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {masterData?.plantParts.map((part) => (
                            <label
                                key={part.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                    ${formData.plantParts?.includes(part.id)
                                        ? 'border-primary bg-primary-50 text-primary-700 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.plantParts?.includes(part.id)}
                                    onChange={() => togglePlantPart(part.id)}
                                />
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.plantParts?.includes(part.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                    {formData.plantParts?.includes(part.id) && <CheckIcon className="w-3 h-3" />}
                                </div>
                                <span className="font-medium text-sm">{part.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. Propagation Method */}
                <div className="gacp-card">
                    <h3 className="gacp-title text-lg mb-4 flex items-center gap-2">
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
                                    p-3 rounded-lg border text-left transition-all flex flex-col gap-2 relative overflow-hidden
                                    ${formData.propagationType === method.id
                                        ? 'border-primary bg-primary-50 ring-1 ring-primary shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <span className="text-xl">{method.icon}</span>
                                <span className={`font-bold text-sm ${formData.propagationType === method.id ? 'text-primary-800' : 'text-slate-700'}`}>
                                    {method.label}
                                </span>
                                {formData.propagationType === method.id && (
                                    <div className="absolute top-2 right-2 text-primary animate-scale-in">
                                        <CheckIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Plant Varieties */}
            <div className="gacp-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="gacp-title text-lg flex items-center gap-2">
                        <span>📋</span> ข้อมูลสายพันธุ์
                    </h3>
                    <button
                        onClick={() => {
                            const newVariety = { id: Date.now().toString(), name: '', sourceType: 'SELF' as const, quantity: 0 };
                            setFormData(prev => ({
                                ...prev,
                                varieties: [...(prev.varieties || []), newVariety]
                            }));
                        }}
                        className="gacp-btn-primary"
                    >
                        <span>+ เพิ่มสายพันธุ์</span>
                    </button>
                </div>

                {(!formData.varieties || formData.varieties.length === 0) ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                        <p className="font-medium text-sm">ยังไม่ได้เพิ่มข้อมูลสายพันธุ์</p>
                        <p className="text-xs mt-1">กดปุ่ม &quot;เพิ่มสายพันธุ์&quot; เพื่อระบุรายละเอียด</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.varieties.map((item, index) => (
                            <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-white hover:border-primary-200 transition-all relative group shadow-sm animate-slide-up">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            varieties: prev.varieties?.filter(v => v.id !== item.id)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="ลบรายการ"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded">#{index + 1}</span>
                                        <div className="flex-1">
                                            <FormLabelWithHint label="ชื่อสายพันธุ์" required />
                                            <input
                                                type="text"
                                                className="gacp-input mt-1"
                                                placeholder="เช่น หางกระรอก"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newVarieties = [...(formData.varieties || [])];
                                                    newVarieties[index].name = e.target.value;
                                                    setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FormLabelWithHint label="แหล่งที่มา" />
                                            <select
                                                className="gacp-input mt-1"
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
                                                    className="gacp-input mt-1"
                                                    placeholder="ระบุชื่อร้าน..."
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
                    </div>
                )}
            </div>

            {/* 4. Cultivation Summary Card */}
            <div className="gacp-card bg-primary-50/50 border-primary-100">
                <h3 className="gacp-title text-lg mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center text-sm">📊</span>
                    ประมาณการการเพาะปลูก
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <FormLabelWithHint label="ระยะปลูก (Spacing)" />
                        <select
                            className="gacp-input mt-1 bg-white"
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
                                className="gacp-input mt-1 bg-white pr-10"
                                placeholder="0"
                                value={formData.plantCount || ''}
                                onChange={(e) => handleChange('plantCount', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pt-1">ต้น</span>
                        </div>
                    </div>
                    <div>
                        <FormLabelWithHint label="ผลผลิตคาดการณ์ (ต่อปี)" />
                        <div className="relative">
                            <input
                                type="number"
                                className={`gacp-input mt-1 bg-white pr-10 ${Number(formData.estimatedYield) > 500 ? 'border-amber-300 focus:border-amber-500' : ''}`}
                                placeholder="0"
                                value={formData.estimatedYield}
                                onChange={(e) => handleChange('estimatedYield', e.target.value)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pt-1">กก.</span>
                        </div>
                        {Number(formData.estimatedYield) > 500 && (
                            <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                                ⚠️ เกินค่าเฉลี่ยมาตรฐาน
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Production Inputs */}
            <div className="gacp-card">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="gacp-title text-lg flex items-center gap-2">
                            <span>🧴</span> ปัจจัยการผลิต
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">ปุ๋ย, วัสดุปรับปรุงดิน, และสารป้องกันกำจัดศัตรูพืช</p>
                    </div>
                    <button
                        onClick={() => {
                            const newInput = {
                                id: Date.now().toString(),
                                type: 'FERTILIZER',
                                name: '',
                                sourceType: 'PURCHASED',
                                isOrganic: false
                            };
                            setFormData(prev => ({
                                ...prev,
                                productionInputs: [...(prev.productionInputs || []), newInput]
                            }));
                        }}
                        className="gacp-btn-secondary text-sm px-3 py-1.5"
                    >
                        <span>+ เพิ่มรายการ</span>
                    </button>
                </div>

                {(!formData.productionInputs || formData.productionInputs.length === 0) ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-400">
                        <p className="font-medium text-sm">ยังไม่มีข้อมูลปัจจัยการผลิต</p>
                        <p className="text-xs mt-1">กดปุ่ม &quot;เพิ่มรายการ&quot; เพื่อระบุข้อมูล</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formData.productionInputs.map((item: ProductionInput, index: number) => (
                            <div key={item.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/30 hover:bg-white transition-all relative group animate-slide-up">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            productionInputs: prev.productionInputs?.filter((i: ProductionInput) => i.id !== item.id)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-3">
                                        <FormLabelWithHint label="ประเภท" />
                                        <select
                                            className="gacp-input mt-1 bg-white"
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
                                    </div>
                                    <div className="md:col-span-4">
                                        <FormLabelWithHint label="ชื่อเรียก / ยี่ห้อ" />
                                        <input
                                            type="text"
                                            className="gacp-input mt-1 bg-white"
                                            placeholder="เช่น ปุ๋ยคอก"
                                            value={item.name}
                                            onChange={(e) => {
                                                const inputs = [...(formData.productionInputs || [])];
                                                inputs[index].name = e.target.value;
                                                setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                            }}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <FormLabelWithHint label="แหล่งที่มา" />
                                        <select
                                            className="gacp-input mt-1 bg-white"
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
                                    <div className="md:col-span-2 flex items-center h-[2.75rem]">
                                        <label className="flex items-center cursor-pointer gap-2 select-none group/check">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${item.isOrganic ? 'bg-primary border-primary shadow-sm' : 'border-slate-300 bg-white group-hover/check:border-primary'}`}>
                                                {item.isOrganic && <CheckIcon className="w-3 h-3 text-white" />}
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
                                            <span className="text-sm font-medium text-slate-700">อินทรีย์</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
