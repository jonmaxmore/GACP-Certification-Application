'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';

export const StepProduction = () => {
    const { state, setProductionData, setCurrentStep } = useWizardStore();
    const { data: masterData } = useMasterData();

    const [formData, setFormData] = useState(state.productionData || {
        plantParts: [] as string[],
        propagationType: '',
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

    const isNextDisabled = !formData.plantParts?.length || !formData.propagationType || !formData.sourceType;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    แผนการผลิต (Production Plan)
                </h2>
                <p className="text-gray-500 mt-2">รายละเอียดส่วนที่นำมาใช้ แหล่งที่มา และปริมาณการผลิต</p>
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

                {/* 2. Propagation & Source */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">วิธีการขยายพันธุ์ (Propagation)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                            value={formData.propagationType}
                            onChange={(e) => handleChange('propagationType', e.target.value)}
                        >
                            <option value="">-- เลือก --</option>
                            <option value="SEED">เพาะเมล็ด (Seed)</option>
                            <option value="CUTTING">ปักชำ (Cutting)</option>
                            <option value="TISSUE">เพาะเลี้ยงเนื้อเยื่อ (Tissue Culture)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">แหล่งที่มาของพันธุ์พืช (Source)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                            value={formData.sourceType}
                            onChange={(e) => handleChange('sourceType', e.target.value)}
                        >
                            <option value="">-- เลือก --</option>
                            <option value="SELF">เก็บเมล็ดเอง (Self-collected)</option>
                            <option value="BUY">ซื้อจากแหล่งอื่น (Purchased)</option>
                            <option value="IMPORT">นำเข้า (Imported)</option>
                        </select>
                    </div>

                    {formData.sourceType === 'BUY' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อร้าน/แหล่งที่ซื้อ</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                placeholder="ระบุชื่อร้านค้า..."
                                value={formData.seedSource}
                                onChange={(e) => handleChange('seedSource', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Output Estimation */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">ประมาณการผลผลิต (Estimation)</h3>

                {/* [NEW] Yield Prediction Analysis UI */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-blue-800 flex items-center gap-2">
                        <span>📊</span> ระบบช่วยประเมิน (Yield Prediction)
                    </h4>
                    <p className="text-sm text-blue-600">
                        ระบบคำนวณจากพื้นที่ปลูกจริง (คิดเป็น 70% ของพื้นที่แปลง) เพื่อป้องกันการประเมินเกินจริง
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อสายพันธุ์ (Variety Name)</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                            placeholder="เช่น หางกระรอกภูพาน"
                            value={formData.varietyName}
                            onChange={(e) => handleChange('varietyName', e.target.value)}
                        />
                    </div>

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
                            จำนวนต้นที่ปลูก (Plant Count)
                        </label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                            placeholder="ระบุจำนวนต้น"
                            value={formData.plantCount || ''}
                            onChange={(e) => handleChange('plantCount', e.target.value)}
                        />
                        {/* Dynamic Hint */}
                        <p className="text-xs text-gray-500 mt-1">
                            * พื้นที่รับรองได้สูงสุดประมาณ X ต้น
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ผลผลิตคาดการณ์ (กก./ปี)</label>
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

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => setCurrentStep(4)}
                    disabled={isNextDisabled}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${!isNextDisabled
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>

        </div>
    );
};
