"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const PDPA_SECTIONS = [
    { title: "วัตถุประสงค์ในการเก็บข้อมูล", icon: "🎯", items: ["เพื่อพิจารณาคำขอรับรองมาตรฐาน GACP", "เพื่อติดต่อสื่อสารและแจ้งผลการดำเนินงาน", "เพื่อจัดทำทะเบียนผู้ได้รับใบรับรอง"] },
    { title: "ข้อมูลส่วนบุคคลที่เก็บรวบรวม", icon: "📋", items: ["ชื่อ-นามสกุล, เลขบัตรประชาชน", "ที่อยู่, เบอร์โทร, อีเมล", "พิกัด GPS และภาพถ่ายสถานที่"] },
    { title: "การเก็บรักษาและความปลอดภัย", icon: "🔒", items: ["ข้อมูลจะถูกเก็บรักษาอย่างปลอดภัย", "เฉพาะเจ้าหน้าที่ที่เกี่ยวข้องเท่านั้นที่เข้าถึงได้", "ไม่เปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับอนุญาต"] },
];

export default function Step3PDPA() {
    const router = useRouter();
    const { state, consentPDPA, isLoaded } = useWizardStore();
    const [consented, setConsented] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (state.consentedPDPA) setConsented(true);
    }, [state.consentedPDPA]);

    useEffect(() => {
        if (isLoaded && !state.serviceType) router.replace('/applications/new/step-0');
    }, [isLoaded, state.serviceType, router]);

    const handleConsent = () => {
        setConsented(true);
        consentPDPA();
    };

    const handleNext = () => {
        if (consented && !isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-4');
        }
    };

    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-2');
    };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ยินยอมข้อมูลส่วนบุคคล</h1>
                <p className="text-gray-600">ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
            </div>

            {/* PDPA Content */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto p-5">
                    {PDPA_SECTIONS.map((section, sIndex) => (
                        <div key={sIndex} className={sIndex < PDPA_SECTIONS.length - 1 ? 'mb-5 pb-5 border-b border-gray-100' : ''}>
                            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-3">
                                <span className="text-2xl">{section.icon}</span>
                                {section.title}
                            </h3>
                            <ul className="space-y-2 ml-11">
                                {section.items.map((item, iIndex) => (
                                    <li key={iIndex} className="text-sm text-gray-600 flex items-start gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                                            <path d="M20 6L9 17L4 12" />
                                        </svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rights Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </div>
                <div>
                    <div className="text-sm font-semibold text-blue-700 mb-1">สิทธิของท่าน</div>
                    <p className="text-sm text-blue-600">ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา</p>
                </div>
            </div>

            {/* Consent Checkbox */}
            <label className={`
                flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all border-2
                ${consented
                    ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }
            `}>
                <input
                    type="checkbox"
                    checked={consented}
                    onChange={handleConsent}
                    className="w-6 h-6 mt-0.5 rounded border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                    <span className={`text-base font-semibold ${consented ? 'text-emerald-800' : 'text-gray-900'}`}>
                        ข้าพเจ้ายินยอมให้เก็บรวบรวมและใช้ข้อมูลส่วนบุคคล
                    </span>
                    <p className="text-sm text-gray-500 mt-1">เพื่อประกอบการพิจารณาคำขอรับรองมาตรฐาน GACP</p>
                </div>
                {consented && (
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17L4 12" />
                        </svg>
                    </div>
                )}
            </label>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={!consented || isNavigating}
                    className={`
                        flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                        ${consented && !isNavigating
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {isNavigating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังโหลด...
                        </>
                    ) : (
                        <>
                            ถัดไป
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18L15 12L9 6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
