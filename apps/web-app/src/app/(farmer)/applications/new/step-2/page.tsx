"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ServiceType } from '../hooks/useWizardStore';

const SERVICE_TYPES = [
    { id: 'NEW' as ServiceType, title: 'ขอรับรองใหม่', desc: 'สำหรับผู้ที่ยังไม่เคยได้รับใบรับรอง GACP', color: '#10B981', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', borderClass: 'border-emerald-500' },
    { id: 'RENEWAL' as ServiceType, title: 'ต่ออายุใบรับรอง', desc: 'สำหรับใบรับรองที่จะหมดอายุภายใน 90 วัน', color: '#F59E0B', bgClass: 'bg-amber-50 dark:bg-amber-900/20', borderClass: 'border-amber-500' },
    { id: 'MODIFY' as ServiceType, title: 'แก้ไขข้อมูล', desc: 'เปลี่ยนแปลงข้อมูลในใบรับรองที่มีอยู่', color: '#3B82F6', bgClass: 'bg-blue-50 dark:bg-blue-900/20', borderClass: 'border-blue-500' },
    { id: 'REPLACEMENT' as ServiceType, title: 'ขอใบรับรองทดแทน', desc: 'กรณีใบรับรองสูญหายหรือชำรุด', color: '#8B5CF6', bgClass: 'bg-violet-50 dark:bg-violet-900/20', borderClass: 'border-violet-500' },
];

export default function Step2Service() {
    const router = useRouter();
    const { state, setServiceType, isLoaded } = useWizardStore();
    const [selected, setSelected] = useState<ServiceType | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.serviceType) setSelected(state.serviceType);
    }, [state.serviceType]);

    useEffect(() => {
        if (isLoaded && !state.certificationPurpose) router.replace('/applications/new/step-0');
    }, [isLoaded, state.certificationPurpose, router]);

    const handleSelect = (type: ServiceType) => { setSelected(type); setServiceType(type); };
    const handleNext = () => { if (selected && !isNavigating) { setIsNavigating(true); router.push('/applications/new/step-3'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-1'); };

    if (!isLoaded) return <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-7">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 ${isDark ? 'bg-gradient-to-br from-blue-600 to-blue-500' : 'bg-gradient-to-br from-blue-400 to-blue-300'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                </div>
                <h2 className={`text-xl font-semibold mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>เลือกประเภทบริการ</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>เลือกบริการที่ต้องการดำเนินการ</p>
            </div>

            {/* Service Type Cards */}
            <div className="flex flex-col gap-3 mb-7">
                {SERVICE_TYPES.map((type) => {
                    const isSelected = selected === type.id;
                    return (
                        <button key={type.id} onClick={() => handleSelect(type.id)}
                            className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${isSelected ? `${type.bgClass} border-2 ${type.borderClass} shadow-lg` : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200')}`}>
                            <div className={`w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={type.color} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.title}</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{type.desc}</p>
                            </div>
                            {isSelected && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: type.color }}><path d="M20 6L9 17L4 12" /></svg>}
                        </button>
                    );
                })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                <button onClick={handleBack} className={`flex-1 py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-1.5 border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg> ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={!selected || isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-1.5 transition-all ${selected && !isNavigating ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/40' : (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400') + ' cursor-not-allowed'}`}>
                    {isNavigating ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
                </button>
            </div>
        </div>
    );
}
