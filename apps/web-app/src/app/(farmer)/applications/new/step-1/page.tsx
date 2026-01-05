"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, CertificationPurpose, SiteType, PLANTS } from '../hooks/useWizardStore';

const PURPOSES = [
    { id: 'RESEARCH' as CertificationPurpose, label: 'วิจัย/ศึกษา', desc: 'เพื่อใช้ประโยชน์ในการศึกษาวิจัย' },
    { id: 'COMMERCIAL' as CertificationPurpose, label: 'พาณิชย์', desc: 'จำหน่ายหรือแปรรูปเพื่อการค้า' },
    { id: 'EXPORT' as CertificationPurpose, label: 'ส่งออก', desc: 'ส่งออกสมุนไพรทางการค้า' },
];

const SITE_TYPES = [
    { id: 'OUTDOOR' as SiteType, label: 'กลางแจ้ง', desc: 'Outdoor' },
    { id: 'INDOOR' as SiteType, label: 'โรงเรือนระบบปิด', desc: 'Indoor' },
    { id: 'GREENHOUSE' as SiteType, label: 'โรงเรือนทั่วไป', desc: 'Greenhouse' },
];

const FEE_CONFIG = { docReviewPerArea: 5000, inspectionPerArea: 25000, totalPerArea: 30000 };

export default function Step1Purpose() {
    const router = useRouter();
    const { state, setCertificationPurpose, setSiteTypes, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [purpose, setPurpose] = useState<CertificationPurpose | null>(null);
    const [siteTypes, setLocalSiteTypes] = useState<SiteType[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const isHighControl = plant?.group === 'HIGH_CONTROL';
    const totalFee = FEE_CONFIG.totalPerArea * siteTypes.length;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
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

    const handlePurposeSelect = (p: CertificationPurpose) => { setPurpose(p); setCertificationPurpose(p); };
    const toggleSiteType = (type: SiteType) => { const newTypes = siteTypes.includes(type) ? siteTypes.filter(t => t !== type) : [...siteTypes, type]; setLocalSiteTypes(newTypes); setSiteTypes(newTypes); };
    const canProceed = purpose && siteTypes.length > 0 && !isNavigating;
    const handleNext = () => { if (canProceed) { setIsNavigating(true); router.push('/applications/new/step-2'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-0'); };

    if (!isLoaded) return <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>วัตถุประสงค์และลักษณะพื้นที่</h2>
                {plant && <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}><span>{plant.icon}</span><span className="text-xs text-emerald-600 font-medium">{plant.name}</span></div>}
            </div>

            {/* Purpose Selection */}
            <div className="mb-5">
                <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>วัตถุประสงค์ในการขอใบรับรอง *</label>
                <div className="flex flex-col gap-2">
                    {PURPOSES.map(p => (
                        <button key={p.id} onClick={() => handlePurposeSelect(p.id)} className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${purpose === p.id ? (isDark ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-blue-50 border-2 border-blue-500') : (isDark ? 'bg-transparent border border-slate-700' : 'bg-transparent border border-slate-200')}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${purpose === p.id ? 'bg-blue-500 text-white' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    {p.id === 'RESEARCH' && <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>}
                                    {p.id === 'COMMERCIAL' && <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>}
                                    {p.id === 'EXPORT' && <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>}
                                </svg>
                            </div>
                            <div className="flex-1"><div className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{p.label}</div><div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</div></div>
                            {purpose === p.id && <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">✓</div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* License Warning */}
            {(purpose === 'COMMERCIAL' || purpose === 'EXPORT') && (
                <div className={`rounded-xl p-3.5 mb-4 border ${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-400'}`}>
                    <p className="text-sm font-semibold text-amber-600 flex items-center gap-2 mb-2">เอกสารใบอนุญาตที่ต้องเตรียม:</p>
                    <ul className={`pl-5 text-xs list-disc ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
                        {isHighControl && <li className="mb-1"><strong>บท.11</strong> - ใบอนุญาตปลูก (บังคับสำหรับพืชควบคุม)</li>}
                        {purpose === 'COMMERCIAL' && <li className="mb-1"><strong>บท.13</strong> - ใบอนุญาตแปรรูปผลิตภัณฑ์ (บังคับ ✓)</li>}
                        {purpose === 'EXPORT' && <><li className="mb-1"><strong>บท.13</strong> - ใบอนุญาตแปรรูปผลิตภัณฑ์ (ถ้ามีการแปรรูป)</li><li className="mb-1"><strong>บท.16</strong> - ใบอนุญาตส่งออก (บังคับ ✓)</li></>}
                    </ul>
                    <p className={`text-xs mt-2 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>อัปโหลดเอกสารในขั้นตอนถัดไป</p>
                </div>
            )}

            {/* Site Type Selection */}
            <div className="mb-4">
                <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ลักษณะพื้นที่ * (เลือกได้หลายรายการ)</label>
                <div className="grid grid-cols-3 gap-2">
                    {SITE_TYPES.map(type => {
                        const isSelected = siteTypes.includes(type.id);
                        return (
                            <button key={type.id} onClick={() => toggleSiteType(type.id)} className={`p-3.5 rounded-xl text-center transition-all ${isSelected ? (isDark ? 'bg-emerald-900/30 border-2 border-emerald-500' : 'bg-emerald-50 border-2 border-emerald-500') : (isDark ? 'bg-transparent border border-slate-700' : 'bg-transparent border border-slate-200')}`}>
                                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-1 ${isSelected ? 'bg-emerald-500 text-white' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        {type.id === 'OUTDOOR' && <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>}
                                        {type.id === 'INDOOR' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
                                        {type.id === 'GREENHOUSE' && <><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l2.3 2.3a2.4 2.4 0 0 0 3.4-3.4L15.4 14.6l6-6c4.5-4.5.5-8.5-4-4l-6.3 6.3-2.4-2.4a2.4 2.4 0 0 0-3.4 3.4L7.7 14.3l-4 4a2.4 2.4 0 0 0 0 3.4l2.6-1.4z" /></>}
                                    </svg>
                                </div>
                                <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{type.desc}</div>
                                {isSelected && <div className="mt-1 text-[10px] text-emerald-500 font-semibold">เลือกแล้ว</div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Fee Display */}
            {siteTypes.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-4 mb-5 text-white">
                    <div className="text-sm font-semibold mb-3">ประมาณการค่าธรรมเนียมและใบรับรอง</div>
                    {siteTypes.map((type, idx) => (
                        <div key={type} className="bg-white/10 rounded-lg p-2.5 mb-2 flex justify-between items-center">
                            <div><div className="text-sm font-medium">ใบรับรอง #{idx + 1}: {SITE_TYPES.find(s => s.id === type)?.label}</div><div className="text-[10px] opacity-80">ตรวจเอกสาร 5,000 + ตรวจแปลง 25,000</div></div>
                            <div className="text-base font-semibold">฿30,000</div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center border-t border-white/30 pt-3 mt-2">
                        <div><div className="text-sm font-semibold">รวมทั้งสิ้น ({siteTypes.length} ใบรับรอง)</div><div className="text-xs opacity-80">ชำระเงินรวมครั้งเดียว</div></div>
                        <div className="text-3xl font-bold">฿{totalFee.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2.5">
                <button onClick={handleBack} className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg> ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={!canProceed} className={`flex-[2] py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all ${canProceed ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/35' : (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400') + ' cursor-not-allowed'}`}>
                    {isNavigating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
                </button>
            </div>
        </div>
    );
}
