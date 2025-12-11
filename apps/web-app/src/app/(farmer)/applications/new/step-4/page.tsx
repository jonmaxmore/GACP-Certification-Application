"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData, PLANTS } from '../hooks/useWizardStore';

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', icon: '👤' },
    { id: 'JURISTIC', label: 'นิติบุคคล', icon: '🏢' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', icon: '👥' },
] as const;

const PURPOSES = [
    { id: 'RESEARCH', label: 'วิจัย', icon: '🔬' },
    { id: 'COMMERCIAL', label: 'พาณิชย์', icon: '💼' },
    { id: 'EXPORT', label: 'ส่งออก', icon: '🌍' },
] as const;

export default function Step4Applicant() {
    const router = useRouter();
    const { state, setApplicantData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [form, setForm] = useState<ApplicantData>({
        applicantType: 'INDIVIDUAL',
        firstName: '', lastName: '', idCard: '', phone: '', email: '', lineId: '',
        companyName: '', registrationNumber: '',
        address: '', province: '', district: '', subdistrict: '', postalCode: '',
        purpose: 'COMMERCIAL',
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.applicantData) setForm(state.applicantData);

        const savedPhone = localStorage.getItem("user_phone");
        const savedEmail = localStorage.getItem("user_email");
        if (savedPhone && !form.phone) setForm(prev => ({ ...prev, phone: savedPhone }));
        if (savedEmail && !form.email) setForm(prev => ({ ...prev, email: savedEmail }));
    }, [state.applicantData]);

    useEffect(() => {
        if (isLoaded && !state.consentedPDPA) {
            router.replace('/applications/new/step-0');
        }
    }, [isLoaded, state.consentedPDPA, router]);

    const handleChange = (field: keyof ApplicantData, value: string) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        setApplicantData(updated);
    };

    const handleNext = () => router.push('/applications/new/step-5');
    const handleBack = () => router.push('/applications/new/step-3');

    if (!isLoaded) {
        return <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#9CA3AF' : '#6B7280' }}>กำลังโหลด...</div>;
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box' as const,
    };

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        fontWeight: 500,
        color: isDark ? '#D1D5DB' : '#374151',
        marginBottom: '5px'
    };

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '52px', height: '52px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
                }}>
                    <span style={{ fontSize: '22px' }}>👤</span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827' }}>
                    ข้อมูลผู้ยื่นคำขอ
                </h2>
            </div>

            {/* Applicant Type */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>ประเภทผู้ยื่น</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {APPLICANT_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('applicantType', type.id)} style={{
                            flex: 1,
                            padding: '10px 6px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: form.applicantType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.applicantType === type.id ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '18px', marginBottom: '2px' }}>{type.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Name Fields */}
            {form.applicantType === 'INDIVIDUAL' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                        <label style={labelStyle}>ชื่อ *</label>
                        <input type="text" value={form.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} placeholder="ชื่อจริง" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>นามสกุล *</label>
                        <input type="text" value={form.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} placeholder="นามสกุล" style={inputStyle} />
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{form.applicantType === 'JURISTIC' ? 'ชื่อบริษัท *' : 'ชื่อวิสาหกิจชุมชน *'}</label>
                    <input type="text" value={form.companyName || ''} onChange={e => handleChange('companyName', e.target.value)} placeholder="ชื่อองค์กร" style={inputStyle} />
                </div>
            )}

            {/* ID Card / Registration */}
            <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{form.applicantType === 'INDIVIDUAL' ? 'เลขบัตรประชาชน *' : 'เลขทะเบียนนิติบุคคล *'}</label>
                <input type="text" value={form.applicantType === 'INDIVIDUAL' ? (form.idCard || '') : (form.registrationNumber || '')} onChange={e => handleChange(form.applicantType === 'INDIVIDUAL' ? 'idCard' : 'registrationNumber', e.target.value)} placeholder={form.applicantType === 'INDIVIDUAL' ? '1-2345-67890-12-3' : 'เลขทะเบียน'} maxLength={form.applicantType === 'INDIVIDUAL' ? 17 : 20} style={inputStyle} />
            </div>

            {/* Contact Section */}
            <div style={{ background: isDark ? '#2D3748' : '#F9FAFB', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>📞 ข้อมูลติดต่อ</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>โทรศัพท์ *</label>
                        <input type="tel" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} placeholder="08x-xxx-xxxx" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>อีเมล *</label>
                        <input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label style={{ ...labelStyle, fontSize: '11px' }}>Line ID</label>
                    <input type="text" value={form.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} placeholder="@lineID" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                </div>
            </div>

            {/* Address Section */}
            <div style={{ background: isDark ? '#2D3748' : '#F9FAFB', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>📍 ที่อยู่</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ ...labelStyle, fontSize: '11px' }}>ที่อยู่ *</label>
                    <input type="text" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>จังหวัด *</label>
                        <input type="text" value={form.province || ''} onChange={e => handleChange('province', e.target.value)} placeholder="จังหวัด" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>อำเภอ</label>
                        <input type="text" value={form.district || ''} onChange={e => handleChange('district', e.target.value)} placeholder="อำเภอ" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>ตำบล</label>
                        <input type="text" value={form.subdistrict || ''} onChange={e => handleChange('subdistrict', e.target.value)} placeholder="ตำบล" style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: '11px' }}>รหัสไปรษณีย์</label>
                        <input type="text" value={form.postalCode || ''} onChange={e => handleChange('postalCode', e.target.value)} placeholder="10XXX" maxLength={5} style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
                    </div>
                </div>
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>วัตถุประสงค์</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {PURPOSES.map(p => (
                        <button key={p.id} onClick={() => handleChange('purpose', p.id)} style={{
                            flex: 1, padding: '10px', borderRadius: '10px',
                            border: form.purpose === p.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.purpose === p.id ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : 'transparent',
                            cursor: 'pointer', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '16px' }}>{p.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '2px' }}>{p.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* High Control Warning */}
            {isHighControl && (
                <div style={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        ⚠️ พืชควบคุม: กรุณาเตรียมใบอนุญาตประกอบกิจการ
                    </p>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleBack} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)' }}>
                    ถัดไป
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
