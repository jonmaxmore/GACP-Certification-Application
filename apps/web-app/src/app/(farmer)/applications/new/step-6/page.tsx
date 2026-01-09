"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ProductionData } from '../hooks/useWizardStore';

const PLANT_PARTS = [
    { id: 'SEED', label: 'เมล็ด' },
    { id: 'STEM', label: 'ลำต้น' },
    { id: 'FLOWER', label: 'ช่อดอก' },
    { id: 'LEAF', label: 'ใบ' },
    { id: 'ROOT', label: 'ราก/หัว' },
    { id: 'OTHER', label: 'อื่นๆ' },
];

const CULTIVATION_METHODS = [
    { id: 'OUTDOOR', label: 'กลางแจ้ง' },
    { id: 'INDOOR', label: 'ในโรงเรือน (Indoor)' },
    { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)' },
];

const IRRIGATION_TYPES = [
    { id: 'DRIP', label: 'ระบบน้ำหยด' },
    { id: 'SPRINKLER', label: 'สปริงเกอร์' },
    { id: 'MANUAL', label: 'รดด้วยมือ (สายยาง/บัว)' },
    { id: 'FLOOD', label: 'ปล่อยน้ำเข้าแปลง' },
];

const PROPAGATION_TYPES = [
    { id: 'SEED', label: 'เมล็ด' },
    { id: 'CUTTING', label: 'ปักชำ' },
    { id: 'TISSUE', label: 'เพาะเนื้อเยื่อ' },
];

const SOURCE_TYPES = [
    { id: 'SELF', label: 'ปลูกเอง', desc: 'เราปลูกเองในแหล่งผลิตนี้' },
];

export default function Step6Production() {
    const router = useRouter();
    const { state, setProductionData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [form, setForm] = useState<ProductionData>({
        plantParts: [], propagationType: 'SEED',
        cultivationMethod: 'OUTDOOR', irrigationType: 'MANUAL',
        varietyName: '', seedSource: '', varietySource: '',
        quantityWithUnit: '', harvestCycles: 1, estimatedYield: 0,
        sourceType: 'SELF', sourceDetail: '', hasGAPCert: false, hasOrganicCert: false,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (state.productionData) setForm(state.productionData); }, [state.productionData]);
    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const handleChange = (field: keyof ProductionData, value: unknown) => { const updated = { ...form, [field]: value }; setForm(updated); setProductionData(updated); };
    const togglePart = (partId: string) => { const current = form.plantParts || []; handleChange('plantParts', current.includes(partId) ? current.filter(p => p !== partId) : [...current, partId]); };

    const isValid = (form.plantParts?.length || 0) > 0;
    const handleNext = () => { if (!isNavigating && isValid) { setIsNavigating(true); setProductionData(form); router.push('/applications/new/step-7'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-5'); };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white border-gray-200 text-gray-900 focus:border-emerald-500`;
    const labelCls = `block text-sm font-semibold mb-2 text-gray-700`;
    const sectionCls = `rounded-2xl p-5 mb-5 border-2 bg-white border-gray-200`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-lime-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M12 2L12 6M12 18L12 22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12L6 12M18 12L22 12M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลการผลิต</h1>
                <p className="text-gray-600">ระบุวิธีการปลูกและปริมาณผลผลิต</p>
            </div>

            {/* Plant Parts */}
            <div className="mb-4">
                <label className={labelCls}>ส่วนที่ใช้ (เลือกได้หลายรายการ) *</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {PLANT_PARTS.map((part: { id: string, label: string }) => (
                        <button key={part.id} onClick={() => togglePart(part.id)}
                            className={`py-2 px-1.5 rounded-lg text-center transition-all ${(form.plantParts || []).includes(part.id) ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-[10px] font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{part.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cultivation Method (GACP) */}
            <div className="mb-4">
                <label className={labelCls}>ระบบการปลูก (Cultivation) *</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {CULTIVATION_METHODS.map((method: { id: string, label: string }) => (
                        <button key={method.id} onClick={() => handleChange('cultivationMethod', method.id)}
                            className={`py-2.5 px-1.5 rounded-lg text-center transition-all ${form.cultivationMethod === method.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{method.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Irrigation Type (GACP) */}
            <div className="mb-4">
                <label className={labelCls}>ระบบน้ำ (Irrigation) *</label>
                <div className="grid grid-cols-2 gap-1.5">
                    {IRRIGATION_TYPES.map((type: { id: string, label: string }) => (
                        <button key={type.id} onClick={() => handleChange('irrigationType', type.id)}
                            className={`py-2.5 px-1.5 rounded-lg text-center transition-all ${form.irrigationType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Propagation Type */}
            <div className="mb-4">
                <label className={labelCls}>วิธีขยายพันธุ์ *</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {PROPAGATION_TYPES.map((type: { id: string, label: string }) => (
                        <button key={type.id} onClick={() => handleChange('propagationType', type.id)}
                            className={`py-2.5 px-1.5 rounded-lg text-center transition-all ${form.propagationType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Variety Info */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div><label className={labelCls}>ชื่อสายพันธุ์ *</label><input type="text" value={form.varietyName || ''} onChange={e => handleChange('varietyName', e.target.value)} placeholder="พันธุ์พื้นเมือง" className={inputCls} /></div>
                <div><label className={labelCls}>แหล่งที่มาสายพันธุ์ *</label><input type="text" value={form.varietySource || ''} onChange={e => handleChange('varietySource', e.target.value)} placeholder="สถาบันวิจัย" className={inputCls} /></div>
            </div>

            {/* Quantity Section */}
            <div className={sectionCls}>
                <span className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ปริมาณการผลิต</span>
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={`${labelCls} text-xs`}>ปริมาณ (ระบุหน่วย) *</label><input type="text" value={form.quantityWithUnit || ''} onChange={e => handleChange('quantityWithUnit', e.target.value)} placeholder="100 ต้น" className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>รอบเก็บเกี่ยว (ครั้ง/ปี)</label><input type="number" value={form.harvestCycles || 1} onChange={e => handleChange('harvestCycles', parseInt(e.target.value) || 1)} min={1} max={12} className={`${inputCls} text-sm py-2`} /></div>
                </div>
                <div className="mt-2"><label className={`${labelCls} text-xs`}>ผลผลิตโดยประมาณ (กก./ปี)</label><input type="number" value={form.estimatedYield || ''} onChange={e => handleChange('estimatedYield', parseFloat(e.target.value) || 0)} placeholder="500" className={`${inputCls} text-sm py-2`} /></div>
            </div>

            {/* Source Type */}
            <div className="mb-4">
                <label className={labelCls}>แหล่งที่มาของผลผลิต *</label>
                <div className="grid grid-cols-3 gap-1.5">
                    {SOURCE_TYPES.map((type: { id: string, label: string }) => (
                        <button key={type.id} onClick={() => handleChange('sourceType', type.id)}
                            className={`py-2.5 px-1.5 rounded-lg text-center transition-all ${form.sourceType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Certifications */}
            <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <span className="block text-sm font-semibold text-emerald-600 mb-2.5">ใบรับรอง (ถ้ามี)</span>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.hasGAPCert || false} onChange={e => handleChange('hasGAPCert', e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                        <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>มี GAP</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.hasOrganicCert || false} onChange={e => handleChange('hasOrganicCert', e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                        <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>มี Organic</span>
                    </label>
                </div>
            </div>

            {!isValid && <p className="text-xs text-red-500 mb-3 text-center">กรุณาเลือกส่วนของพืชอย่างน้อย 1 รายการ</p>}

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={isNavigating || !isValid}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${(isNavigating || !isValid)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30'
                        }`}
                >
                    {isNavigating ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>
                    ) : (
                        <>
                            ถัดไป
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
