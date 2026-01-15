'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';
import { useRouter } from 'next/navigation';

export const StepProduction = () => {
    const { state, setProductionData, setCurrentStep } = useWizardStore();
    const router = useRouter();
    const { data: masterData } = useMasterData();

    const [formData, setFormData] = useState(state.productionData || {
        plantParts: [] as string[],
        propagationType: '',
        varieties: [] as any[], // [NEW]
        seedSource: '',
        varietyName: '',
        estimatedYield: '',
        sourceType: '',
        cultivationArea: '', // For validation against plot area
        spacing: '', // [NEW]
        plantCount: '', // [NEW]
    });

    useEffect(() => {
        // Debounce update to store
        const timeout = setTimeout(() => {
            setProductionData(formData as any);
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setProductionData]);

    const handleChange = (field: string, value: any) => {
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
        <div className="space-y-6">
            {/* Official Header */}
            <div className="border-l-4 border-[#00695C] pl-4 mb-6">
                <h2 className="text-xl font-bold text-[#263238]">แผนการผลิต (Production Plan)</h2>
                <p className="text-sm text-[#546E7A]">รายละเอียดส่วนที่นำมาใช้ แหล่งที่มา และปริมาณการผลิต</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Parts Used */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">ส่วนของพืชที่ใช้ (Plant Parts Used)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {masterData?.plantParts.map((part) => (
                            <label
                                key={part.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                    ${formData.plantParts?.includes(part.id)
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.plantParts?.includes(part.id)}
                                    onChange={() => togglePlantPart(part.id)}
                                />
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.plantParts?.includes(part.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                                    }`}>
                                    {formData.plantParts?.includes(part.id) && '✓'}
                                </div>
                                <span>{part.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. Propagation Method (Visual Cards) */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">วิธีการขยายพันธุ์ (Propagation)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'SEED', label: 'เพาะเมล็ด (Seed)', icon: '🌱' },
                            { id: 'CUTTING', label: 'ปักชำ (Cutting)', icon: '🌿' },
                            { id: 'TISSUE', label: 'เพาะเลี้ยงเนื้อเยื่อ (Tissue)', icon: '🧪' },
                            { id: 'OTHER', label: 'อื่น ๆ (Other)', icon: '❓' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => handleChange('propagationType', method.id)}
                                className={`
                                    p-4 rounded-xl border text-left transition-all flex flex-col gap-2 relative overflow-hidden
                                    ${formData.propagationType === method.id
                                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm'
                                        : 'border-gray-200 hover:border-emerald-300 hover:shadow-md bg-white'
                                    }
                                `}
                            >
                                <span className="text-2xl">{method.icon}</span>
                                <span className={`font-medium text-sm ${formData.propagationType === method.id ? 'text-emerald-900' : 'text-gray-700'}`}>
                                    {method.label}
                                </span>
                                {formData.propagationType === method.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                                        ✓
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Plant Varieties (Dynamic List) */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">ข้อมูลสายพันธุ์ (Varieties)</h3>
                    <button
                        onClick={() => {
                            const newVariety = { id: Date.now().toString(), name: '', sourceType: 'SELF' as const, quantity: 0 };
                            setFormData(prev => ({
                                ...prev,
                                varieties: [...(prev.varieties || []), newVariety]
                            }));
                        }}
                        className="text-sm px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 font-medium shadow-sm"
                    >
                        <span>+</span> เพิ่มสายพันธุ์
                    </button>
                </div>

                {(!formData.varieties || formData.varieties.length === 0) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                        <p>ยังไม่ได้เพิ่มข้อมูลสายพันธุ์</p>
                        <p className="text-xs mt-1">กดปุ่ม "เพิ่มสายพันธุ์" เพื่อระบุรายละเอียด</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.varieties.map((item, index) => (
                            <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-emerald-200 transition-all relative group">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            varieties: prev.varieties?.filter(v => v.id !== item.id)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="ลบรายการ"
                                >
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-1 flex items-center justify-center md:justify-start font-bold text-gray-300 text-lg">
                                        #{index + 1}
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อสายพันธุ์</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                            placeholder="เช่น หางกระรอก"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newVarieties = [...(formData.varieties || [])];
                                                newVarieties[index].name = e.target.value;
                                                setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                            }}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">แหล่งที่มา</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                            value={item.sourceType}
                                            onChange={(e) => {
                                                const newVarieties = [...(formData.varieties || [])];
                                                newVarieties[index].sourceType = e.target.value as any;
                                                setFormData(prev => ({ ...prev, varieties: newVarieties }));
                                            }}
                                        >
                                            <option value="SELF">เก็บเอง</option>
                                            <option value="BUY">ซื้อมา</option>
                                            <option value="IMPORT">นำเข้า</option>
                                        </select>
                                    </div>
                                    {item.sourceType !== 'SELF' && (
                                        <div className="md:col-span-4 transition-all animate-fade-in">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">ชื่อร้าน/แหล่งที่มา</label>
                                            <input
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                                                placeholder="ชื่อร้านค้า..."
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
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Output Estimation & System */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">การเพาะปลูก (Cultivation)</h3>

                {/* Yield Prediction Hint */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                        <span>📊</span> ระบบช่วยประเมิน (System Estimation)
                    </h4>
                    <p className="text-sm text-blue-600">
                        กรุณาระบุระยะปลูกและจำนวนต้น เพื่อให้ระบบช่วยประเมินผลผลิตตามมาตรฐาน GACP
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* [NEW] Spacing Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ระยะปลูก (Spacing)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                            value={formData.spacing || ''}
                            onChange={(e) => handleChange('spacing', e.target.value)}
                        >
                            <option value="">-- Select Spacing --</option>
                            <option value="1x1">1 x 1 เมตร (Standard)</option>
                            <option value="1.5x1.5">1.5 x 1.5 เมตร</option>
                            <option value="2x2">2 x 2 เมตร</option>
                            <option value="4x4">4 x 4 เมตร (ไม้ต้น)</option>
                        </select>
                    </div>

                    {/* [NEW] Plant Count Input with Max Capacity Check */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            จำนวนต้นรวม (Total Plant Count)
                        </label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                            placeholder="ระบุจำนวนต้น"
                            value={formData.plantCount || ''}
                            onChange={(e) => handleChange('plantCount', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ผลผลิตคาดการณ์รวม (กก./ปี)</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 outline-none"
                            placeholder="ระบุปริมาณ (kg)"
                            value={formData.estimatedYield}
                            onChange={(e) => handleChange('estimatedYield', e.target.value)}
                        />
                        {/* Validation Message */}
                        {Number(formData.estimatedYield) > 500 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                ⚠️ สูงกว่าค่าเฉลี่ยมาตรฐาน (Standard Yield Exceeded)
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 5. Production Inputs (GACP Pillar 2) */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-800">ปัจจัยการผลิต (Production Inputs)</h3>
                        <p className="text-xs text-gray-500">ปุ๋ย, วัสดุปรับปรุงดิน, และสารป้องกันกำจัดศัตรูพืช</p>
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
                        className="text-sm px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1 font-medium shadow-sm"
                    >
                        <span>+</span> เพิ่มรายการ
                    </button>
                </div>

                {(!formData.productionInputs || formData.productionInputs.length === 0) ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                        <p>ยังไม่มีข้อมูลปัจจัยการผลิต</p>
                        <p className="text-xs mt-1">กดปุ่ม "เพิ่มรายการ" เพื่อระบุปุ๋ยหรือดินที่ใช้</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formData.productionInputs.map((item: any, index: number) => (
                            <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/30 hover:bg-white hover:shadow-sm transition-all relative">
                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            productionInputs: prev.productionInputs?.filter((i: any) => i.id !== item.id)
                                        }));
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    ✕
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">ประเภท</label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
                                            value={item.type}
                                            onChange={(e) => {
                                                const inputs = [...(formData.productionInputs || [])];
                                                inputs[index].type = e.target.value;
                                                setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                            }}
                                        >
                                            <option value="FERTILIZER">ปุ๋ย (Fertilizer)</option>
                                            <option value="SOIL_AMENDMENT">วัสดุปรับปรุงดิน</option>
                                            <option value="PLANT_PROTECTION">ศัตรูพืช/วัชพืช</option>
                                            <option value="OTHER">อื่นๆ</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">ชื่อเรียก / ยี่ห้อ</label>
                                        <input
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
                                            placeholder="เช่น ปุ๋ยคอก, NPK 15-15-15"
                                            value={item.name}
                                            onChange={(e) => {
                                                const inputs = [...(formData.productionInputs || [])];
                                                inputs[index].name = e.target.value;
                                                setFormData(prev => ({ ...prev, productionInputs: inputs }));
                                            }}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">แหล่งที่มา</label>
                                        <select
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none"
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
                                    <div className="md:col-span-2 flex items-center pb-2">
                                        <label className="flex items-center cursor-pointer gap-2 select-none">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.isOrganic ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
                                                {item.isOrganic && <span className="text-white text-[10px]">✓</span>}
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
                                            <span className="text-xs text-gray-600">อินทรีย์?</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t border-[#CFD8DC] flex justify-between">
                <button
                    onClick={() => router.push('/farmer/applications/new/step/4')}
                    className="px-6 py-2.5 rounded-lg border-2 border-[#00695C] text-[#00695C] font-semibold hover:bg-[#E0F2F1] transition-colors flex items-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={() => router.push('/farmer/applications/new/step/6')}
                    disabled={isNextDisabled}
                    className={`
                        px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2
                        ${!isNextDisabled
                            ? 'bg-[#00695C] text-white hover:bg-[#004D40] shadow-md hover:shadow-lg'
                            : 'bg-[#CFD8DC] text-[#90A4AE] cursor-not-allowed'
                        }
                    `}
                >
                    ดำเนินการต่อ
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>

        </div>
    );
};
