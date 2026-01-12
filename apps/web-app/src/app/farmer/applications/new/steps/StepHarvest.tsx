'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { PlantQRCalculator } from '@/components/PlantQRCalculator';

export const StepHarvest = () => {
    const { state, setHarvestData, setCurrentStep, updateState } = useWizardStore();
    const router = useRouter();

    const [formData, setFormData] = useState(state.harvestData || {
        harvestMethod: '',
        dryingMethod: '',
        dryingDetail: '',
        storageSystem: '',
        packaging: '',
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Debounce update to store
        const timeout = setTimeout(() => {
            setHarvestData(formData as any);
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setHarvestData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field: string) => {
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

    const showNextButtonError = !isValid && Object.values(touched).some(t => t);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    การเก็บเกี่ยวและจัดการหลังการเก็บเกี่ยว
                </h2>
                <h3 className="text-xl text-gray-500 mt-2 font-medium">Harvest & Post-Harvest Handling</h3>
                <p className="text-gray-400 mt-1 text-sm">ระบุวิธีการจัดการผลผลิตเพื่อป้องกันการปนเปื้อน (Contamination Control)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Harvest & Drying */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">🌾</span>
                            <h3 className="font-semibold text-gray-800">การเก็บเกี่ยว (Harvesting)</h3>
                        </div>

                        <div>
                            <label htmlFor="harvestMethod" className="block text-sm font-semibold text-gray-700 mb-2">
                                วิธีการเก็บเกี่ยว <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="harvestMethod"
                                className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all ${touched.harvestMethod && errors.harvestMethod
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                                    }`}
                                value={formData.harvestMethod}
                                onChange={(e) => handleChange('harvestMethod', e.target.value)}
                                onBlur={() => handleBlur('harvestMethod')}
                            >
                                <option value="">-- เลือก --</option>
                                <option value="MANUAL">เก็บด้วยมือ (Manual)</option>
                                <option value="MACHINE">ใช้เครื่องจักร (Machine)</option>
                            </select>
                            {touched.harvestMethod && errors.harvestMethod && (
                                <p className="text-xs text-red-500 mt-1">{errors.harvestMethod}</p>
                            )}
                        </div>
                        <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-emerald-500 text-xs mt-0.5">ℹ️</span>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <strong>Tip:</strong> เลือก "Machine" หากใช้รถเกี่ยวข้าวหรืออุปกรณ์ทุ่นแรงขนาดใหญ่ หากใช้แรงงานคนและอุปกรณ์ขนาดเล็ก ให้เลือก "Manual"
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">☀️</span>
                            <h3 className="font-semibold text-gray-800">การลดความชื้น (Drying)</h3>
                        </div>

                        <div>
                            <label htmlFor="dryingMethod" className="block text-sm font-semibold text-gray-700 mb-2">
                                วิธีการตากแห้ง <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="dryingMethod"
                                className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all ${touched.dryingMethod && errors.dryingMethod
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                                    }`}
                                value={formData.dryingMethod}
                                onChange={(e) => handleChange('dryingMethod', e.target.value)}
                                onBlur={() => handleBlur('dryingMethod')}
                            >
                                <option value="">-- เลือก --</option>
                                <option value="SUN">ตากแดดธรรมชาติ (Sun Dry)</option>
                                <option value="OVEN">ตู้อบความร้อน (Hot Air Oven)</option>
                                <option value="DEHYDRATOR">เครื่องลดความชื้น (Dehydrator)</option>
                                <option value="OTHER">อื่นๆ (Other)</option>
                            </select>
                            {touched.dryingMethod && errors.dryingMethod && (
                                <p className="text-xs text-red-500 mt-1">{errors.dryingMethod}</p>
                            )}
                        </div>

                        {formData.dryingMethod === 'OTHER' && (
                            <div>
                                <input
                                    type="text"
                                    id="dryingDetail"
                                    className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all ${touched.dryingDetail && errors.dryingDetail
                                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                                        }`}
                                    placeholder="โปรดระบุวิธีการ..."
                                    value={formData.dryingDetail}
                                    onChange={(e) => handleChange('dryingDetail', e.target.value)}
                                    onBlur={() => handleBlur('dryingDetail')}
                                />
                                {touched.dryingDetail && errors.dryingDetail && (
                                    <p className="text-xs text-red-500 mt-1">{errors.dryingDetail}</p>
                                )}
                            </div>
                        )}

                        <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-orange-500 text-xs mt-0.5">ℹ️</span>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <strong>Requirement:</strong> ความชื้นที่เหมาะสมของผลผลิตแห้งควรต่ำกว่า 10-12% เพื่อป้องกันการเกิดเชื้อราและสาร Aflatoxin
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Storage & Packaging */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 h-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📦</span>
                            <h3 className="font-semibold text-gray-800">การเก็บรักษา (Storage)</h3>
                        </div>

                        <div>
                            <label htmlFor="storageSystem" className="block text-sm font-semibold text-gray-700 mb-2">
                                สถานที่เก็บรักษา <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="storageSystem"
                                className={`w-full border rounded-lg px-4 py-2.5 outline-none transition-all ${touched.storageSystem && errors.storageSystem
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                                    }`}
                                value={formData.storageSystem}
                                onChange={(e) => handleChange('storageSystem', e.target.value)}
                                onBlur={() => handleBlur('storageSystem')}
                            >
                                <option value="">-- เลือก --</option>
                                <option value="CONTROLLED">ห้องควบคุมอุณหภูมิ (Controlled Temp)</option>
                                <option value="AMBIENT">ห้องอุณหภูมิปกติ (Ambient Temp)</option>
                            </select>
                            {touched.storageSystem && errors.storageSystem && (
                                <p className="text-xs text-red-500 mt-1">{errors.storageSystem}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2 ml-1">
                                * สถานที่เก็บต้องแยกจากสารเคมี ปุ๋ย และทำความสะอาดง่าย
                            </p>
                        </div>

                        <div>
                            <label htmlFor="packaging" className="block text-sm font-semibold text-gray-700 mb-2">
                                บรรจุภัณฑ์ (Packaging) <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="packaging"
                                className={`w-full h-32 resize-none border rounded-lg px-4 py-2.5 outline-none transition-all ${touched.packaging && errors.packaging
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-500'
                                    }`}
                                placeholder="ระบุชนิดถุง/ภาชนะที่ใช้บรรจุ เช่น ถุงสูญญากาศ Food Grade, กระสอบป่านใหม่..."
                                value={formData.packaging}
                                onChange={(e) => handleChange('packaging', e.target.value)}
                                onBlur={() => handleBlur('packaging')}
                            />
                            {touched.packaging && errors.packaging && (
                                <p className="text-xs text-red-500 mt-1">{errors.packaging}</p>
                            )}
                            <div className="flex items-start gap-2 mt-2">
                                <span className="text-blue-500 text-xs mt-0.5">💡</span>
                                <p className="text-xs text-gray-500">
                                    ควรใช้วัสดุที่สะอาด แห้ง และเป็น Food Grade เพื่อป้องกันการปนเปื้อนซ้ำ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Alert for GACP */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">ข้อควรระวังตามมาตรฐาน GACP</h4>
                    <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
                        <li>ต้องปูวัสดุรองรับผลผลิตขณะเก็บเกี่ยว ไม่วางสัมผัสพื้นดินโดยตรง</li>
                        <li>ภาชนะบรรจุต้องสะอาด แห้ง และไม่มีสารปนเปื้อน</li>
                        <li>ควรมีความชื้นไม่เกิน 10-12% เพื่อป้องกันเชื้อรา</li>
                    </ul>
                </div>
            </div>

            {/* Purpose-based Requirements Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.certificationPurpose === 'COMMERCIAL' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-bold text-blue-800 text-sm mb-2">ℹ️ สำหรับการพาณิชย์ (Commercial)</h4>
                        <p className="text-xs text-blue-700">สิ่งที่ท่านต้องเตรียมในขั้นตอนถัดไป (Documents):</p>
                        <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                            <li>หนังสือสัญญาซื้อขาย (Contract Farming) (ถ้ามี)</li>
                            <li>บันทึกการส่งมอบผลผลิต</li>
                        </ul>
                    </div>
                )}

                {state.certificationPurpose === 'EXPORT' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <h4 className="font-bold text-purple-800 text-sm mb-2">✈️ สำหรับการส่งออก (Export)</h4>
                        <p className="text-xs text-purple-700">เอกสารสำคัญที่ต้องใช้:</p>
                        <ul className="text-xs text-purple-600 mt-1 list-disc list-inside">
                            <li>ใบรับรองผลวิเคราะห์ (COA) จากห้องแล็บ ISO/IEC 17025</li>
                            <li>ใบรับรองสุขอนามัยพืช (Phytosanitary Certificate)</li>
                            <li>เอกสารกำกับยาเสพติด (Export/Import Permit)</li>
                        </ul>
                    </div>
                )}
            </div>

            {/* 3. QR Tracking Preview (Optional - Info Only) */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-teal-100 text-teal-600 p-2 rounded-lg">📱</span>
                    <div>
                        <h3 className="font-semibold text-gray-800">QR Traceability (ตรวจสอบย้อนกลับ)</h3>
                        <p className="text-xs text-gray-500">ระบบ QR จะสามารถใช้งานได้หลังได้รับใบ GACP แล้ว</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            วันที่คาดว่าจะเริ่มปลูก
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            วันที่คาดว่าจะเก็บเกี่ยว (ประมาณ 120 วัน)
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 outline-none"
                            value={state.cultivationDetails?.estimatedHarvestDate || ''}
                            readOnly
                        />
                    </div>
                </div>

                <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                    <PlantQRCalculator
                        plantCount={state.cultivationDetails?.totalPlants || state.productionData?.treeCount || 100}
                        plantingDate={state.cultivationDetails?.plantingDate || new Date().toISOString().split('T')[0]}
                        showPreview={true}
                        onChange={(count, cost) => updateState({ qrCount: count, estimatedQRCost: cost })}
                    />
                </div>

                <div className="flex items-start gap-2 bg-teal-100/50 p-3 rounded-lg">
                    <span className="text-teal-600 text-sm">ℹ️</span>
                    <p className="text-xs text-teal-700">
                        <strong>หมายเหตุ:</strong> ค่า QR Code เป็นบริการแยกต่างหาก จะสามารถดาวน์โหลดได้ในระบบ Farm หลังได้รับใบรับรอง GACP แล้วเท่านั้น
                    </p>
                </div>
            </div>

            <div className="pt-6 border-t flex justify-between items-center">
                <button
                    onClick={() => router.push('/farmer/applications/new/step/5')}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>

                {showNextButtonError && (
                    <span className="text-sm text-red-500 font-medium animate-pulse">
                        * กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
                    </span>
                )}

                <button
                    onClick={() => {
                        const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                        setTouched(allTouched);
                        if (isValid) router.push('/farmer/applications/new/step/7');
                    }}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${isValid
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>
        </div>
    );
};
