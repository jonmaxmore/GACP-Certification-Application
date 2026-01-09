"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ServiceType } from '../hooks/useWizardStore';

const SERVICE_TYPES = [
    { id: 'NEW' as ServiceType, title: 'ขอรับรองใหม่', desc: 'สำหรับผู้ที่ยังไม่เคยได้รับใบรับรอง GACP', icon: '📄', color: 'emerald' },
    { id: 'RENEWAL' as ServiceType, title: 'ต่ออายุใบรับรอง', desc: 'สำหรับใบรับรองที่จะหมดอายุภายใน 90 วัน', icon: '🔄', color: 'amber' },
    { id: 'MODIFY' as ServiceType, title: 'แก้ไขข้อมูล', desc: 'เปลี่ยนแปลงข้อมูลในใบรับรองที่มีอยู่', icon: '✏️', color: 'blue' },
    { id: 'REPLACEMENT' as ServiceType, title: 'ขอใบรับรองทดแทน', desc: 'กรณีใบรับรองสูญหายหรือชำรุด', icon: '📋', color: 'violet' },
];

export default function Step2Service() {
    const router = useRouter();
    const { state, setServiceType, isLoaded } = useWizardStore();
    const [selected, setSelected] = useState<ServiceType | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (state.serviceType) setSelected(state.serviceType);
    }, [state.serviceType]);

    useEffect(() => {
        if (isLoaded && !state.certificationPurpose) router.replace('/applications/new/step-0');
    }, [isLoaded, state.certificationPurpose, router]);

    const handleSelect = (type: ServiceType) => {
        setSelected(type);
        setServiceType(type);
    };

    const handleNext = () => {
        if (selected && !isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-3');
        }
    };

    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-1');
    };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    const getColorClasses = (color: string, isSelected: boolean) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700' },
            blue: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
            violet: { bg: 'bg-violet-50', border: 'border-violet-500', text: 'text-violet-700' },
        };
        return colors[color] || colors.emerald;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">เลือกประเภทบริการ</h1>
                <p className="text-gray-600">เลือกบริการที่ต้องการดำเนินการ</p>
            </div>

            {/* Service Type Cards */}
            <div className="space-y-3">
                {SERVICE_TYPES.map((type) => {
                    const isSelected = selected === type.id;
                    const colorClasses = getColorClasses(type.color, isSelected);

                    return (
                        <button
                            key={type.id}
                            onClick={() => handleSelect(type.id)}
                            className={`
                                w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all
                                ${isSelected
                                    ? `${colorClasses.bg} border-2 ${colorClasses.border} shadow-lg`
                                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }
                            `}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${isSelected ? colorClasses.bg : 'bg-gray-100'}`}>
                                {type.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-base font-bold ${isSelected ? colorClasses.text : 'text-gray-900'}`}>
                                    {type.title}
                                </h3>
                                <p className="text-sm text-gray-500">{type.desc}</p>
                            </div>
                            {isSelected && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type.color === 'emerald' ? 'bg-emerald-500' :
                                        type.color === 'amber' ? 'bg-amber-500' :
                                            type.color === 'blue' ? 'bg-blue-500' : 'bg-violet-500'
                                    }`}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M20 6L9 17L4 12" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Info */}
            {selected && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-2xl">{SERVICE_TYPES.find(t => t.id === selected)?.icon}</div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500">บริการที่เลือก</div>
                        <div className="font-bold text-gray-900">{SERVICE_TYPES.find(t => t.id === selected)?.title}</div>
                    </div>
                </div>
            )}

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
                    disabled={!selected || isNavigating}
                    className={`
                        flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                        ${selected && !isNavigating
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
