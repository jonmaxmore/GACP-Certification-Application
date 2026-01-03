"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, SiteData, PLANTS } from '../hooks/useWizardStore';

const LAND_TYPES = [
    { id: 'OWN', label: 'เจ้าของ', icon: '🏠' },
    { id: 'RENT', label: 'เช่า', icon: '📝' },
    { id: 'CONSENT', label: 'ได้รับยินยอม', icon: '🤝' },
] as const;

const SECURITY_ITEMS = [
    { id: 'hasCCTV', label: 'กล้อง CCTV', icon: '📹' },
    { id: 'hasFence2m', label: 'รั้วสูง 2 ม.', icon: '🚧' },
    { id: 'hasAccessLog', label: 'สมุดลงชื่อ', icon: '📋' },
    { id: 'hasBiometric', label: 'สแกนนิ้ว/ใบหน้า', icon: '👆', highControl: true },
];

export default function Step5Site() {
    const router = useRouter();
    const { state, setSiteData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [locating, setLocating] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [form, setForm] = useState<SiteData>({
        siteName: '', address: '', province: '', district: '', subdistrict: '', postalCode: '',
        gpsLat: '', gpsLng: '', areaSize: '', areaUnit: 'ไร่',
        northBorder: '', southBorder: '', eastBorder: '', westBorder: '', landOwnership: 'OWN',
        hasCCTV: false, hasFence2m: false, hasAccessLog: false, hasBiometric: false,
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (state.siteData) setForm(state.siteData); }, [state.siteData]);
    useEffect(() => { if (isLoaded && !state.applicantData) router.replace('/applications/new/step-0'); }, [isLoaded, state.applicantData, router]);

    const handleChange = (field: keyof SiteData, value: string | boolean) => { const updated = { ...form, [field]: value }; setForm(updated); setSiteData(updated); };

    const getLocation = () => {
        if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { const updated = { ...form, gpsLat: pos.coords.latitude.toFixed(6), gpsLng: pos.coords.longitude.toFixed(6) }; setForm(updated); setSiteData(updated); setLocating(false); },
            () => { setLocating(false); alert('ไม่สามารถระบุตำแหน่งได้'); }
        );
    };

    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); setSiteData(form); router.push('/applications/new/step-6'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-4'); };

    if (!isLoaded) return <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลด...</div>;

    const inputCls = `w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-[Kanit] ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelCls = `block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const sectionCls = `rounded-xl p-4 mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`;

    return (
        <div className="font-[Kanit]">
            {/* Header */}
            <div className="text-center mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                    <span className="text-xl">📍</span>
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>สถานที่ & ความปลอดภัย</h2>
            </div>

            {/* Site Name */}
            <div className="mb-3"><label className={labelCls}>ชื่อสถานที่/ฟาร์ม *</label><input type="text" value={form.siteName} onChange={e => handleChange('siteName', e.target.value)} placeholder="เช่น ฟาร์มสมุนไพร" className={inputCls} /></div>

            {/* GPS Section */}
            <div className={sectionCls}>
                <div className="flex justify-between items-center mb-2.5">
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🛰️ พิกัด GPS</span>
                    <button onClick={getLocation} disabled={locating} className="px-3 py-1.5 rounded-2xl bg-blue-500 text-white text-xs font-medium">
                        {locating ? '⏳ หาตำแหน่ง...' : '📍 ปักหมุด'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={`${labelCls} text-xs`}>ละติจูด</label><input type="text" value={form.gpsLat || ''} onChange={e => handleChange('gpsLat', e.target.value)} placeholder="13.756331" className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>ลองจิจูด</label><input type="text" value={form.gpsLng || ''} onChange={e => handleChange('gpsLng', e.target.value)} placeholder="100.501762" className={`${inputCls} text-sm py-2`} /></div>
                </div>
                {/* Map Preview */}
                {form.gpsLat && form.gpsLng && (
                    <div className={`mt-3 rounded-lg overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                        <div className={`px-2.5 py-2 flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>📍 ตำแหน่งที่ปักหมุด</span>
                            <a href={`https://www.google.com/maps?q=${form.gpsLat},${form.gpsLng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-medium">🔗 เปิดใน Maps</a>
                        </div>
                        <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.gpsLng) - 0.005}%2C${parseFloat(form.gpsLat) - 0.003}%2C${parseFloat(form.gpsLng) + 0.005}%2C${parseFloat(form.gpsLat) + 0.003}&layer=mapnik&marker=${form.gpsLat}%2C${form.gpsLng}`} className="w-full h-40 border-0" loading="lazy" />
                    </div>
                )}
            </div>

            {/* Address */}
            <div className="mb-3"><label className={labelCls}>ที่อยู่สถานที่ *</label><input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="บ้านเลขที่ หมู่ ถนน" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div><label className={labelCls}>จังหวัด *</label><input type="text" value={form.province} onChange={e => handleChange('province', e.target.value)} placeholder="จังหวัด" className={inputCls} /></div>
                <div><label className={labelCls}>พื้นที่ (ไร่)</label><input type="text" value={form.areaSize || ''} onChange={e => handleChange('areaSize', e.target.value)} placeholder="5.5" className={inputCls} /></div>
            </div>

            {/* Borders */}
            <div className={sectionCls}>
                <span className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🧭 ทิศที่ตั้งจรด</span>
                <div className="grid grid-cols-2 gap-2">
                    <div><label className={`${labelCls} text-xs`}>ทิศเหนือ</label><input type="text" value={form.northBorder || ''} onChange={e => handleChange('northBorder', e.target.value)} placeholder="ถนนสาธารณะ" className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>ทิศใต้</label><input type="text" value={form.southBorder || ''} onChange={e => handleChange('southBorder', e.target.value)} placeholder="ที่ดินนาย ก." className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>ทิศตะวันออก</label><input type="text" value={form.eastBorder || ''} onChange={e => handleChange('eastBorder', e.target.value)} placeholder="ลำคลอง" className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>ทิศตะวันตก</label><input type="text" value={form.westBorder || ''} onChange={e => handleChange('westBorder', e.target.value)} placeholder="ป่าชุมชน" className={`${inputCls} text-sm py-2`} /></div>
                </div>
            </div>

            {/* Land Ownership */}
            <div className="mb-4">
                <label className={labelCls}>สิทธิ์ในที่ดิน</label>
                <div className="grid grid-cols-3 gap-2">
                    {LAND_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('landOwnership', type.id)}
                            className={`py-2.5 px-2 rounded-lg text-center transition-all ${form.landOwnership === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className="text-base">{type.icon}</div>
                            <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <span className="block text-sm font-semibold text-emerald-600 mb-2.5">🔒 มาตรการความปลอดภัย</span>
                <div className="grid grid-cols-2 gap-2">
                    {SECURITY_ITEMS.filter(item => !item.highControl || isHighControl).map(item => (
                        <label key={item.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-xs border ${form[item.id as keyof SiteData] ? `border-emerald-500 ${isDark ? 'bg-slate-700' : 'bg-white'}` : isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                            <input type="checkbox" checked={!!form[item.id as keyof SiteData]} onChange={e => handleChange(item.id as keyof SiteData, e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                            <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>{item.icon} {item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2.5">
                <button onClick={handleBack} className={`flex-1 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg> ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={isNavigating}
                    className={`flex-[2] py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-all ${isNavigating ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/35'}`}>
                    {isNavigating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
                </button>
            </div>
        </div>
    );
}
