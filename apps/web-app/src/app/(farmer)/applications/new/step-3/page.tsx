"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const PDPA_SECTIONS = [
    { title: "วัตถุประสงค์ในการเก็บข้อมูล", items: ["เพื่อพิจารณาคำขอรับรองมาตรฐาน GACP", "เพื่อติดต่อสื่อสารและแจ้งผลการดำเนินงาน", "เพื่อจัดทำทะเบียนผู้ได้รับใบรับรอง"] },
    { title: "ข้อมูลส่วนบุคคลที่เก็บรวบรวม", items: ["ชื่อ-นามสกุล, เลขบัตรประชาชน", "ที่อยู่, เบอร์โทร, อีเมล", "พิกัด GPS และภาพถ่ายสถานที่"] },
    { title: "การเก็บรักษาและความปลอดภัย", items: ["ข้อมูลจะถูกเก็บรักษาอย่างปลอดภัย", "เฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้นที่เข้าถึงได้", "ไม่เปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับอนุญาต"] },
];

export default function Step3PDPA() {
    const router = useRouter();
    const { state, consentPDPA, isLoaded } = useWizardStore();
    const [consented, setConsented] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.consentedPDPA) setConsented(true);
    }, [state.consentedPDPA]);

    useEffect(() => {
        if (isLoaded && !state.serviceType) router.replace('/applications/new/step-0');
    }, [isLoaded, state.serviceType, router]);

    const handleConsent = () => { setConsented(true); consentPDPA(); };
    const handleNext = () => { if (consented && !isNavigating) { setIsNavigating(true); router.push('/applications/new/step-4'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-2'); };

    if (!isLoaded) return <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30 ${isDark ? 'bg-gradient-to-br from-violet-600 to-violet-500' : 'bg-gradient-to-br from-violet-400 to-violet-300'}`}>
                    <span className="text-2xl">🔐</span>
                </div>
                <h2 className={`text-xl font-semibold mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ยินยอมข้อมูลส่วนบุคคล</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
            </div>

            {/* PDPA Content */}
            <div className={`rounded-2xl p-5 mb-5 max-h-72 overflow-y-auto ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                {PDPA_SECTIONS.map((section, sIndex) => (
                    <div key={sIndex} className={sIndex < PDPA_SECTIONS.length - 1 ? 'mb-5' : ''}>
                        <h3 className={`text-sm font-semibold mb-2.5 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>{sIndex + 1}</span>
                            {section.title}
                        </h3>
                        <ul className="list-none ml-8">
                            {section.items.map((item, iIndex) => (
                                <li key={iIndex} className={`text-sm mb-1.5 flex items-start gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <span className="text-emerald-500 mt-0.5">•</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Rights Info */}
            <div className={`rounded-xl px-4 py-3.5 mb-5 flex items-start gap-3 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <span className="text-xl">ℹ️</span>
                <div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>สิทธิของท่าน</p>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา</p>
                </div>
            </div>

            {/* Consent Checkbox */}
            <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer mb-6 transition-all ${consented ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' : (isDark ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200')}`}>
                <input type="checkbox" checked={consented} onChange={handleConsent} className="w-5 h-5 mt-0.5 accent-emerald-500" />
                <div>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ข้าพเจ้ายินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคล</span>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>เพื่อประกอบการพิจารณาคำขอรับรองมาตรฐาน GACP</p>
                </div>
            </label>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                <button onClick={handleBack} className={`flex-1 py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-1.5 border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg> ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={!consented || isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-1.5 transition-all ${consented && !isNavigating ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/40' : (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400') + ' cursor-not-allowed'}`}>
                    {isNavigating ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
                </button>
            </div>
        </div>
    );
}
