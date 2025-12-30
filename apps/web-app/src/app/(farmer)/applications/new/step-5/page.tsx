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
        northBorder: '', southBorder: '', eastBorder: '', westBorder: '',
        landOwnership: 'OWN',
        hasCCTV: false, hasFence2m: false, hasAccessLog: false, hasBiometric: false,
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    // Basic validation: check required fields
    const isValid = form.siteName && form.address && form.areaSize;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.siteData) setForm(state.siteData);
    }, [state.siteData]);

    useEffect(() => {
        if (isLoaded && !state.applicantData) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.applicantData, router]);

    const handleChange = (field: keyof SiteData, value: string | boolean) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        setSiteData(updated);
    };

    const getLocation = () => {
        if (!navigator.geolocation) { alert('เบราว์เซอร์ไม่รองรับ GPS'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const updated = { ...form, gpsLat: pos.coords.latitude.toFixed(6), gpsLng: pos.coords.longitude.toFixed(6) };
                setForm(updated);
                setSiteData(updated);
                setLocating(false);
            },
            () => { setLocating(false); alert('ไม่สามารถระบุตำแหน่งได้'); }
        );
    };

    const handleNext = () => {
        if (!isNavigating) {
            setIsNavigating(true);
            setSiteData(form);
            router.push('/applications/new/step-6');
        }
    };
    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-4');
    };

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    // Fixed input style with proper box-sizing
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${isDark ? '#374151' : '#D1D5DB'}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: "'Kanit', sans-serif",
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 500,
        color: isDark ? '#9CA3AF' : '#6B7280',
        marginBottom: '4px',
    };

    const sectionStyle: React.CSSProperties = {
        background: isDark ? '#374151' : '#F9FAFB',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '14px',
    };

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                }}>
                    <span style={{ fontSize: '20px' }}>📍</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', margin: 0 }}>
                    สถานที่ & ความปลอดภัย
                </h2>
            </div>

            {/* Site Name */}
            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>ชื่อสถานที่/ฟาร์ม *</label>
                <input type="text" value={form.siteName} onChange={e => handleChange('siteName', e.target.value)} placeholder="เช่น ฟาร์มสมุนไพร" style={inputStyle} />
            </div>

            {/* GPS Section */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827' }}>🛰️ พิกัด GPS</span>
                    <button onClick={getLocation} disabled={locating} style={{
                        padding: '6px 12px', borderRadius: '16px', border: 'none',
                        background: '#3B82F6', color: 'white', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                    }}>
                        {locating ? '⏳ หาตำแหน่ง...' : '📍 ปักหมุด'}
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ละติจูด</label>
                        <input type="text" value={form.gpsLat || ''} onChange={e => handleChange('gpsLat', e.target.value)} placeholder="13.756331" style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ลองจิจูด</label>
                        <input type="text" value={form.gpsLng || ''} onChange={e => handleChange('gpsLng', e.target.value)} placeholder="100.501762" style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                </div>

                {/* Map Preview */}
                {form.gpsLat && form.gpsLng && (
                    <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}` }}>
                        <div style={{ background: isDark ? '#1F2937' : '#F3F4F6', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: isDark ? '#D1D5DB' : '#374151' }}>📍 ตำแหน่งที่ปักหมุด</span>
                            <a
                                href={`https://www.google.com/maps?q=${form.gpsLat},${form.gpsLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '11px', color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}
                            >
                                🔗 เปิดใน Maps
                            </a>
                        </div>
                        <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.gpsLng) - 0.005}%2C${parseFloat(form.gpsLat) - 0.003}%2C${parseFloat(form.gpsLng) + 0.005}%2C${parseFloat(form.gpsLat) + 0.003}&layer=mapnik&marker=${form.gpsLat}%2C${form.gpsLng}`}
                            style={{ width: '100%', height: '160px', border: 'none' }}
                            loading="lazy"
                        />
                    </div>
                )}
            </div>

            {/* Address */}
            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>ที่อยู่สถานที่ *</label>
                <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="บ้านเลขที่ หมู่ ถนน" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                    <label style={labelStyle}>จังหวัด *</label>
                    <input type="text" value={form.province} onChange={e => handleChange('province', e.target.value)} placeholder="จังหวัด" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>พื้นที่ (ไร่)</label>
                    <input type="text" value={form.areaSize || ''} onChange={e => handleChange('areaSize', e.target.value)} placeholder="5.5" style={inputStyle} />
                </div>
            </div>

            {/* Borders */}
            <div style={sectionStyle}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '10px' }}>
                    🧭 ทิศที่ตั้งจรด
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ทิศเหนือ</label>
                        <input type="text" value={form.northBorder || ''} onChange={e => handleChange('northBorder', e.target.value)} placeholder="ถนนสาธารณะ" style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ทิศใต้</label>
                        <input type="text" value={form.southBorder || ''} onChange={e => handleChange('southBorder', e.target.value)} placeholder="ที่ดินนาย ก." style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ทิศตะวันออก</label>
                        <input type="text" value={form.eastBorder || ''} onChange={e => handleChange('eastBorder', e.target.value)} placeholder="ลำคลอง" style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ทิศตะวันตก</label>
                        <input type="text" value={form.westBorder || ''} onChange={e => handleChange('westBorder', e.target.value)} placeholder="ป่าชุมชน" style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }} />
                    </div>
                </div>
            </div>

            {/* Land Ownership */}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>สิทธิ์ในที่ดิน</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {LAND_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('landOwnership', type.id)} style={{
                            padding: '10px 8px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                            border: form.landOwnership === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.landOwnership === type.id ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '16px' }}>{type.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '2px' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Security */}
            <div style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#059669', marginBottom: '10px' }}>
                    🔒 มาตรการความปลอดภัย
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {SECURITY_ITEMS.filter(item => !item.highControl || isHighControl).map(item => (
                        <label key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                            background: form[item.id as keyof SiteData] ? (isDark ? '#374151' : 'white') : 'transparent',
                            border: `1px solid ${form[item.id as keyof SiteData] ? '#10B981' : (isDark ? '#374151' : '#D1D5DB')}`,
                            borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                        }}>
                            <input type="checkbox" checked={!!form[item.id as keyof SiteData]} onChange={e => handleChange(item.id as keyof SiteData, e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10B981' }} />
                            <span style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{item.icon} {item.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleBack} style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={isNavigating} style={{
                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                    background: isNavigating ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white', fontSize: '14px', fontWeight: 600, cursor: isNavigating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    boxShadow: isNavigating ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.35)',
                }}>
                    {isNavigating ? (
                        <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> กำลังโหลด...</>
                    ) : (
                        <>ถัดไป <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>
                    )}
                </button>
            </div>
        </div>
    );
}

