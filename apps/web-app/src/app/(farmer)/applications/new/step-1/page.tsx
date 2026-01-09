"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, CertificationPurpose, SiteType, PLANTS } from '../hooks/useWizardStore';

const PURPOSES = [
    { id: 'RESEARCH' as CertificationPurpose, label: 'วิจัย/ศึกษา', desc: 'เพื่อใช้ประโยชน์ในการศึกษาวิจัย', icon: '🔬' },
    { id: 'COMMERCIAL' as CertificationPurpose, label: 'พาณิชย์', desc: 'จำหน่ายหรือแปรรูปเพื่อการค้า', icon: '🏪' },
    { id: 'EXPORT' as CertificationPurpose, label: 'ส่งออก', desc: 'ส่งออกสมุนไพรทางการค้า', icon: '🌍' },
];

const SITE_TYPES = [
    { id: 'OUTDOOR' as SiteType, label: 'กลางแจ้ง', desc: 'Outdoor', icon: '☀️' },
    { id: 'INDOOR' as SiteType, label: 'โรงเรือนระบบปิด', desc: 'Indoor', icon: '🏠' },
    { id: 'GREENHOUSE' as SiteType, label: 'โรงเรือนทั่วไป', desc: 'Greenhouse', icon: '🌿' },
];

const FEE_CONFIG = { docReviewPerArea: 5000, inspectionPerArea: 25000, totalPerArea: 30000 };

export default function Step1Purpose() {
    const router = useRouter();
    const { state, setCertificationPurpose, setSiteTypes, isLoaded } = useWizardStore();
    const [purpose, setPurpose] = useState<CertificationPurpose | null>(null);
    const [siteTypes, setLocalSiteTypes] = useState<SiteType[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const isHighControl = plant?.group === 'HIGH_CONTROL';
    const totalFee = FEE_CONFIG.totalPerArea * siteTypes.length;

    useEffect(() => {
        if (state.certificationPurpose) setPurpose(state.certificationPurpose);
        if (state.siteTypes?.length) setLocalSiteTypes(state.siteTypes);
    }, [state.certificationPurpose, state.siteTypes]);

    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                const saved = localStorage.getItem('gacp_wizard_state');
                const savedState = saved ? JSON.parse(saved) : null;
                if (!state.plantId && !savedState?.plantId) router.replace('/applications/new/step-0');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, state.plantId, router]);

    const handlePurposeSelect = (p: CertificationPurpose) => {
        setPurpose(p);
        setCertificationPurpose(p);
    };

    const toggleSiteType = (type: SiteType) => {
        const newTypes = siteTypes.includes(type) ? siteTypes.filter(t => t !== type) : [...siteTypes, type];
        setLocalSiteTypes(newTypes);
        setSiteTypes(newTypes);
    };

    const canProceed = purpose && siteTypes.length > 0 && !isNavigating;
    const handleNext = () => { if (canProceed) { setIsNavigating(true); router.push('/applications/new/step-2'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-0'); };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">วัตถุประสงค์และลักษณะพื้นที่</h1>
                {plant && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                        <span className="text-xl">{plant.icon}</span>
                        <span className="text-sm text-emerald-700 font-semibold">{plant.name}</span>
                    </div>
                )}
            </div>

            {/* Purpose Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                    วัตถุประสงค์ในการขอใบรับรอง <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    {PURPOSES.map(p => {
                        const isSelected = purpose === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => handlePurposeSelect(p.id)}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all
                                    ${isSelected
                                        ? 'bg-blue-50 border-2 border-blue-500 shadow-lg shadow-blue-500/10'
                                        : 'bg-white border-2 border-gray-200 hover:border-blue-300'
                                    }
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isSelected ? 'bg-blue-500' : 'bg-gray-100'}`}>
                                    {isSelected ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M20 6L9 17L4 12" />
                                        </svg>
                                    ) : (
                                        p.icon
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-base font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{p.label}</div>
                                    <div className="text-sm text-gray-500">{p.desc}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* License Warning */}
            {(purpose === 'COMMERCIAL' || purpose === 'EXPORT') && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-amber-800 mb-1">เอกสารใบอนุญาตที่ต้องเตรียม</div>
                            <ul className="text-sm text-amber-700 space-y-1">
                                {isHighControl && <li>• <span className="font-semibold">บท.11</span> - ใบอนุญาตปลูก (บังคับ)</li>}
                                {purpose === 'COMMERCIAL' && <li>• <span className="font-semibold">บท.13</span> - ใบอนุญาตแปรรูป (บังคับ)</li>}
                                {purpose === 'EXPORT' && (
                                    <>
                                        <li>• <span className="font-semibold">บท.13</span> - ใบอนุญาตแปรรูป (ถ้ามี)</li>
                                        <li>• <span className="font-semibold">บท.16</span> - ใบอนุญาตส่งออก (บังคับ)</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Site Type Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                    ลักษณะพื้นที่ <span className="text-red-500">*</span>
                    <span className="font-normal text-gray-500 ml-1">(เลือกได้หลายรายการ)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {SITE_TYPES.map(type => {
                        const isSelected = siteTypes.includes(type.id);
                        return (
                            <button
                                key={type.id}
                                onClick={() => toggleSiteType(type.id)}
                                className={`
                                    p-4 rounded-xl text-center transition-all
                                    ${isSelected
                                        ? 'bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white border-2 border-gray-200 hover:border-emerald-300'
                                    }
                                `}
                            >
                                <div className="text-3xl mb-2">{type.icon}</div>
                                <div className={`text-sm font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>{type.label}</div>
                                <div className="text-xs text-gray-500">{type.desc}</div>
                                {isSelected && (
                                    <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6L9 17L4 12" />
                                        </svg>
                                        เลือกแล้ว
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fee Display */}
            {siteTypes.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
                    <div className="text-sm font-semibold mb-4 opacity-90">ประมาณการค่าธรรมเนียม</div>
                    {siteTypes.map((type, idx) => (
                        <div key={type} className="bg-white/15 rounded-xl p-3 mb-2 flex justify-between items-center">
                            <div>
                                <div className="font-semibold">ใบรับรอง #{idx + 1}: {SITE_TYPES.find(s => s.id === type)?.label}</div>
                                <div className="text-xs opacity-80">ตรวจเอกสาร 5,000 + ตรวจแปลง 25,000</div>
                            </div>
                            <div className="text-lg font-bold">฿30,000</div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center border-t border-white/30 pt-4 mt-2">
                        <div>
                            <div className="font-bold">รวมทั้งสิ้น ({siteTypes.length} ใบรับรอง)</div>
                            <div className="text-xs opacity-80">ชำระเงินรวมครั้งเดียว</div>
                        </div>
                        <div className="text-3xl font-bold">฿{totalFee.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
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
                    disabled={!canProceed}
                    className={`
                        flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                        ${canProceed
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
