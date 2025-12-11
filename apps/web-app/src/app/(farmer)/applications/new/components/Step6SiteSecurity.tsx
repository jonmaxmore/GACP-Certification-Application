"use client";

import { useState, useEffect } from 'react';
import { SiteSecurityData, LandOwnership } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

const LAND_TYPES: { id: LandOwnership; label: string }[] = [
    { id: 'OWN', label: 'เป็นเจ้าของ' },
    { id: 'RENT', label: 'เช่า' },
    { id: 'CONSENT', label: 'ได้รับยินยอม' },
];

// Professional SVG icons
const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

interface Props {
    data: SiteSecurityData | null;
    isHighControl: boolean;
    onChange: (data: SiteSecurityData) => void;
}

export default function Step6SiteSecurity({ data, isHighControl, onChange }: Props) {
    const [form, setForm] = useState<SiteSecurityData>({
        siteName: data?.siteName || '',
        siteAddress: data?.siteAddress || '',
        latitude: data?.latitude || 0,
        longitude: data?.longitude || 0,
        northBorder: data?.northBorder || '',
        southBorder: data?.southBorder || '',
        eastBorder: data?.eastBorder || '',
        westBorder: data?.westBorder || '',
        landOwnership: data?.landOwnership || 'OWN',
        hasCCTV: data?.hasCCTV || false,
        hasFence2m: data?.hasFence2m || false,
        hasAccessLog: data?.hasAccessLog || false,
        hasBiometric: data?.hasBiometric || false,
        hasAnimalFence: data?.hasAnimalFence || false,
        hasZoneSign: data?.hasZoneSign || false,
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    useEffect(() => {
        onChange(form);
    }, [form, onChange]);

    const updateField = <K extends keyof SiteSecurityData>(field: K, value: SiteSecurityData[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Get current GPS location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateField('latitude', position.coords.latitude);
                updateField('longitude', position.coords.longitude);
                setIsGettingLocation(false);
            },
            (error) => {
                let msg = 'ไม่สามารถระบุตำแหน่งได้';
                if (error.code === 1) msg = 'กรุณาอนุญาตการเข้าถึงตำแหน่ง';
                if (error.code === 2) msg = 'ไม่สามารถระบุตำแหน่งได้ในขณะนี้';
                alert(msg);
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Open map in new tab
    const openInMap = () => {
        if (form.latitude && form.longitude) {
            window.open(`https://www.google.com/maps?q=${form.latitude},${form.longitude}`, '_blank');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}><LocationIcon /></span>
                สถานที่ & ความปลอดภัย
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>กรอกข้อมูลสถานที่และมาตรการความปลอดภัย</p>

            {/* Site Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ชื่อสถานที่ *</label>
                    <input type="text" value={form.siteName} onChange={(e) => updateField('siteName', e.target.value)} placeholder="ฟาร์มสมุนไพรไทย" style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px" }} />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "6px" }}>ที่อยู่สถานที่ *</label>
                    <textarea value={form.siteAddress} onChange={(e) => updateField('siteAddress', e.target.value)} placeholder="123 หมู่ 4 ต.xxx อ.xxx จ.xxx" rows={2} style={{ width: "100%", padding: "12px 16px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "15px", resize: "none" }} />
                </div>
            </div>

            {/* GPS Location with Pin Button */}
            <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#F0FDF4", borderRadius: "12px", border: `1px solid ${colors.primary}30` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.textDark, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: colors.primary }}><LocationIcon /></span>
                        พิกัด GPS
                    </h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                backgroundColor: colors.primary,
                                color: "#FFF",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 500,
                                cursor: isGettingLocation ? "not-allowed" : "pointer",
                                opacity: isGettingLocation ? 0.7 : 1,
                            }}
                        >
                            <LocationIcon />
                            {isGettingLocation ? "กำลังระบุ..." : "ปักหมุดตำแหน่งปัจจุบัน"}
                        </button>
                        {form.latitude && form.longitude && form.latitude !== 0 && (
                            <button
                                onClick={openInMap}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    backgroundColor: "#FFF",
                                    color: colors.primary,
                                    border: `1px solid ${colors.primary}`,
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                ดูในแผนที่
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>Latitude *</label>
                        <input type="number" step="0.000001" value={form.latitude || ''} onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)} placeholder="13.756331" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", backgroundColor: "#FFF" }} />
                    </div>
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "6px" }}>Longitude *</label>
                        <input type="number" step="0.000001" value={form.longitude || ''} onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)} placeholder="100.501762" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px", backgroundColor: "#FFF" }} />
                    </div>
                </div>

                {form.latitude && form.longitude && form.latitude !== 0 && (
                    <p style={{ marginTop: "12px", fontSize: "12px", color: colors.primary, display: "flex", alignItems: "center", gap: "4px" }}>
                        ✓ พิกัดที่ปักไว้: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                    </p>
                )}
            </div>

            {/* Borders */}
            <div style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.textDark, marginBottom: "12px" }}>ทิศที่ตั้งจรด</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div><label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "4px" }}>ทิศเหนือ</label><input type="text" value={form.northBorder} onChange={(e) => updateField('northBorder', e.target.value)} placeholder="ถนนสาธารณะ" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} /></div>
                    <div><label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "4px" }}>ทิศใต้</label><input type="text" value={form.southBorder} onChange={(e) => updateField('southBorder', e.target.value)} placeholder="ที่นา" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} /></div>
                    <div><label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "4px" }}>ทิศตะวันออก</label><input type="text" value={form.eastBorder} onChange={(e) => updateField('eastBorder', e.target.value)} placeholder="ลำคลอง" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} /></div>
                    <div><label style={{ fontSize: "13px", fontWeight: 500, color: colors.textGray, display: "block", marginBottom: "4px" }}>ทิศตะวันตก</label><input type="text" value={form.westBorder} onChange={(e) => updateField('westBorder', e.target.value)} placeholder="รั้วบ้าน" style={{ width: "100%", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "8px", fontSize: "14px" }} /></div>
                </div>
            </div>

            {/* Land Ownership */}
            <div style={{ marginTop: "24px" }}>
                <label style={{ fontSize: "14px", fontWeight: 500, color: colors.textDark, display: "block", marginBottom: "12px" }}>สิทธิ์ในที่ดิน *</label>
                <div style={{ display: "flex", gap: "12px" }}>
                    {LAND_TYPES.map((type) => (
                        <button key={type.id} onClick={() => updateField('landOwnership', type.id)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: form.landOwnership === type.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, backgroundColor: form.landOwnership === type.id ? colors.primaryLight : "#FFF", fontSize: "14px", fontWeight: 500, color: colors.textDark, cursor: "pointer" }}>
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Security Checklist */}
            <div style={{ marginTop: "24px", padding: "20px", backgroundColor: isHighControl ? "#FEF2F2" : "#F8FAFC", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: isHighControl ? "#991B1B" : colors.textDark, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: isHighControl ? "#991B1B" : colors.primary }}>{isHighControl ? <LockIcon /> : <ShieldIcon />}</span>
                    {isHighControl ? "มาตรการความปลอดภัยเข้มงวด (บังคับ)" : "มาตรการความปลอดภัยพื้นฐาน"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {isHighControl ? (
                        <>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasCCTV} onChange={(e) => updateField('hasCCTV', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>CCTV 24 ชั่วโมง *</span></label>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasFence2m} onChange={(e) => updateField('hasFence2m', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>รั้ว ≥ 2 เมตร *</span></label>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasAccessLog} onChange={(e) => updateField('hasAccessLog', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>สมุดลงชื่อเข้า-ออก *</span></label>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasBiometric} onChange={(e) => updateField('hasBiometric', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>Biometric/Key Card</span></label>
                        </>
                    ) : (
                        <>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasAnimalFence} onChange={(e) => updateField('hasAnimalFence', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>รั้วกั้นสัตว์ *</span></label>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}><input type="checkbox" checked={form.hasZoneSign} onChange={(e) => updateField('hasZoneSign', e.target.checked)} style={{ width: "20px", height: "20px", accentColor: colors.primary }} /><span style={{ fontSize: "14px" }}>ป้ายบ่งเขตแปลง *</span></label>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
