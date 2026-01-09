"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, SiteData, PLANTS } from '../hooks/useWizardStore';

const LAND_TYPES = [
    { id: 'OWN', label: 'เจ้าของ' },
    { id: 'RENT', label: 'เช่า' },
    { id: 'CONSENT', label: 'ได้รับยินยอม' },
] as const;

const SOIL_TYPES = [
    { id: 'LOAM', label: 'ดินร่วน' },
    { id: 'CLAY', label: 'ดินเหนียว' },
    { id: 'SANDY', label: 'ดินทราย' },
    { id: 'PEAT', label: 'ดินอินทรีย์' },
    { id: 'OTHER', label: 'อื่นๆ' },
];

const WATER_SOURCES = [
    { id: 'RAIN', label: 'น้ำฝน' },
    { id: 'RIVER', label: 'แม่น้ำ/ลำคลอง' },
    { id: 'WELL', label: 'น้ำบาดาล' },
    { id: 'TAP', label: 'น้ำประปา' },
    { id: 'IRRIGATION', label: 'ระบบชลประทาน' },
];

const SECURITY_ITEMS = [
    { id: 'hasCCTV', label: 'มีกล้องวงจรปิด (CCTV)' },
    { id: 'hasFence2m', label: 'มีรั้วรอบขอบชิด (สูง > 2 เมตร)' },
    { id: 'hasAccessLog', label: 'มีสมุดบันทึกการเข้า-ออก' },
    { id: 'hasBiometric', label: 'มีระบบสแกนนิ้ว/หน้า (Biometric)', highControl: true },
];

import dynamic from 'next/dynamic';
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { ssr: false });

export default function Step5Site() {
    const router = useRouter();
    const { state, setSiteData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [form, setForm] = useState<SiteData>({
        siteName: '', address: '', province: '', district: '', subdistrict: '', postalCode: '',
        gpsLat: '', gpsLng: '', areaSize: '', areaUnit: 'ไร่',
        northBorder: '', southBorder: '', eastBorder: '', westBorder: '', landOwnership: 'OWN',
        soilType: '', waterSource: '',
        hasCCTV: false, hasFence2m: false, hasAccessLog: false, hasBiometric: false,
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (state.siteData) setForm(state.siteData); }, [state.siteData]);
    useEffect(() => { if (isLoaded && !state.applicantData) router.replace('/applications/new/step-0'); }, [isLoaded, state.applicantData, router]);

    const handleChange = (field: keyof SiteData, value: string | boolean) => { const updated = { ...form, [field]: value }; setForm(updated); setSiteData(updated); };

    const handleLocationSelect = (lat: number, lng: number) => {
        const updated = { ...form, gpsLat: lat.toFixed(6), gpsLng: lng.toFixed(6) };
        setForm(updated);
        setSiteData(updated);
        // Don't close immediately so user can see pin
    };

    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); setSiteData(form); router.push('/applications/new/step-6'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-4'); };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white border-gray-200 text-gray-900 focus:border-emerald-500`;
    const labelCls = `block text-sm font-semibold mb-2 text-gray-700`;
    const sectionCls = `rounded-2xl p-5 mb-5 border-2 bg-white border-gray-200`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลสถานที่</h1>
                <p className="text-gray-600">ระบุพิกัดและมาตรการความปลอดภัย</p>
            </div>

            {/* Site Name */}
            <div className="mb-3"><label className={labelCls}>ชื่อสถานที่/ฟาร์ม *</label><input type="text" value={form.siteName} onChange={e => handleChange('siteName', e.target.value)} placeholder="เช่น ฟาร์มสมุนไพร" className={inputCls} /></div>

            {/* GPS Section (Map Modal Trigger) */}
            <div className={sectionCls}>
                <div className="flex justify-between items-center mb-2.5">
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>พิกัดแปลงปลูก</span>
                    <button onClick={() => setShowMap(true)} className="px-3 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-1">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        เลือกบนแผนที่
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div><label className={`${labelCls} text-xs`}>ละติจูด</label><input type="text" value={form.gpsLat || ''} onChange={e => handleChange('gpsLat', e.target.value)} placeholder="13.756331" className={`${inputCls} text-sm py-2`} /></div>
                    <div><label className={`${labelCls} text-xs`}>ลองจิจูด</label><input type="text" value={form.gpsLng || ''} onChange={e => handleChange('gpsLng', e.target.value)} placeholder="100.501762" className={`${inputCls} text-sm py-2`} /></div>
                </div>

                {/* Map Preview (Small) or Status */}
                {form.gpsLat && form.gpsLng ? (
                    <div className={`mt-3 rounded-lg overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-200'} cursor-pointer`} onClick={() => setShowMap(true)}>
                        <div className={`px-2.5 py-2 flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>ตำแหน่งที่เลือก (แตะเพื่อแก้ไข)</span>
                        </div>
                        <div className="h-32 bg-slate-200 flex items-center justify-center relative">
                            {/* Static preview using OSM static image or simplified view */}
                            <iframe
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.gpsLng) - 0.005}%2C${parseFloat(form.gpsLat) - 0.003}%2C${parseFloat(form.gpsLng) + 0.005}%2C${parseFloat(form.gpsLat) + 0.003}&layer=mapnik&marker=${form.gpsLat}%2C${form.gpsLng}`}
                                className="w-full h-full border-0 pointer-events-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className={`mt-3 p-4 rounded-lg border border-dashed text-center cursor-pointer hover:bg-slate-50 transition-colors ${isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300'}`} onClick={() => setShowMap(true)}>
                        <div className="text-2xl mb-1">🗺️</div>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>แตะเพื่อเปิดแผนที่และเลือกตำแหน่ง</span>
                    </div>
                )}
            </div>

            {/* Map Modal */}
            {showMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full max-w-3xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className={`p-4 flex justify-between items-center border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>📌 จิ้มเพื่อปักหมุดตำแหน่งแปลงปลูก</h3>
                            <button onClick={() => setShowMap(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-1 relative bg-slate-100">
                            <InteractiveMap
                                initialLat={form.gpsLat ? parseFloat(form.gpsLat) : undefined}
                                initialLng={form.gpsLng ? parseFloat(form.gpsLng) : undefined}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>
                        <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                            <div className="mr-auto flex flex-col justify-center">
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>พิกัดที่เลือก:</span>
                                <span className={`font-mono font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    {form.gpsLat ? `${form.gpsLat}, ${form.gpsLng}` : 'ยังไม่ได้เลือก'}
                                </span>
                            </div>
                            <button onClick={() => setShowMap(false)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 transition-all">
                                ยืนยันตำแหน่ง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Address */}
            <div className="mb-3"><label className={labelCls}>ที่อยู่สถานที่ *</label><input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="บ้านเลขที่ หมู่ ถนน" className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div><label className={labelCls}>จังหวัด *</label><input type="text" value={form.province} onChange={e => handleChange('province', e.target.value)} placeholder="จังหวัด" className={inputCls} /></div>
                <div><label className={labelCls}>พื้นที่ (ไร่)</label><input type="text" value={form.areaSize || ''} onChange={e => handleChange('areaSize', e.target.value)} placeholder="5.5" className={inputCls} /></div>
            </div>

            {/* Soil and Water - GACP Required */}
            <div className={sectionCls}>
                <span className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ลักษณะพื้นที่ปลูก (GACP)</span>

                <div className="mb-3">
                    <label className={`${labelCls} text-xs`}>ประเภทดิน</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {SOIL_TYPES.map(type => (
                            <button key={type.id} onClick={() => handleChange('soilType', type.id)}
                                className={`py-2 px-1 rounded-lg text-center transition-all ${form.soilType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={`${labelCls} text-xs`}>แหล่งน้ำ</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {WATER_SOURCES.map(source => (
                            <button key={source.id} onClick={() => handleChange('waterSource', source.id)}
                                className={`py-2 px-1 rounded-lg text-center transition-all ${form.waterSource === source.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                                <div className={`text-[10px] font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{source.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Borders */}
            <div className={sectionCls}>
                <span className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ทิศที่ตั้งจรด</span>
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
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <span className="block text-sm font-semibold text-emerald-600 mb-2.5">มาตรการความปลอดภัย</span>
                <div className="grid grid-cols-2 gap-2">
                    {SECURITY_ITEMS.filter(item => !item.highControl || isHighControl).map(item => (
                        <label key={item.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-xs border ${form[item.id as keyof SiteData] ? `border-emerald-500 ${isDark ? 'bg-slate-700' : 'bg-white'}` : isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                            <input type="checkbox" checked={!!form[item.id as keyof SiteData]} onChange={e => handleChange(item.id as keyof SiteData, e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                            <span className={isDark ? 'text-slate-100' : 'text-slate-900'}>{item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

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
                    disabled={isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${isNavigating
                            ? 'bg-gray-400 text-white cursor-not-allowed'
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
