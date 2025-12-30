"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData, PLANTS } from '../hooks/useWizardStore';

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', icon: '👤' },
    { id: 'JURISTIC', label: 'นิติบุคคล', icon: '🏢' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', icon: '👥' },
] as const;

export default function Step4Applicant() {
    const router = useRouter();
    const { state, setApplicantData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<ApplicantData>({
        applicantType: 'INDIVIDUAL',
        firstName: '', lastName: '', idCard: '', phone: '', email: '', lineId: '',
        address: '', province: '', district: '', subdistrict: '', postalCode: '',
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    // Thai ID checksum validation (Modulo 11)
    const validateThaiId = (id: string): boolean => {
        const digits = id.replace(/-/g, "");
        if (digits.length !== 13 || !/^\d{13}$/.test(digits)) return false;
        let sum = 0;
        for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (13 - i);
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === parseInt(digits[12]);
    };

    // Real-time field validation
    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        if (field === 'idCard' && form.applicantType === 'INDIVIDUAL') {
            if (value.length === 13) {
                if (!validateThaiId(value)) errors.idCard = 'เลขบัตรประชาชนไม่ถูกต้อง (Checksum ไม่ผ่าน)';
                else delete errors.idCard;
            } else if (value.length > 0) {
                errors.idCard = `กรอกแล้ว ${value.length}/13 หลัก`;
            } else delete errors.idCard;
        }
        if (field === 'phone') {
            if (value.length > 0 && value.length < 10) errors.phone = `กรอกแล้ว ${value.length}/10 หลัก`;
            else if (value.length === 10 && !/^0[689]\d{8}$/.test(value)) errors.phone = 'เบอร์ต้องขึ้นต้นด้วย 06, 08, 09';
            else delete errors.phone;
        }
        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.length > 0 && !emailRegex.test(value)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
            else delete errors.email;
        }
        setFieldErrors(errors);
    };

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.applicantData) setForm(state.applicantData);
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
        validateField(field, value);
    };

    const handleNext = () => {
        if (!isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-5');
        }
    };
    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-3');
    };

    if (!isLoaded) {
        return <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#9CA3AF' : '#6B7280' }}>กำลังโหลด...</div>;
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', borderRadius: '8px',
        border: `1px solid ${isDark ? '#374151' : '#D1D5DB'}`,
        background: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F9FAFB' : '#111827', fontSize: '14px', outline: 'none',
        boxSizing: 'border-box', fontFamily: "'Kanit', sans-serif",
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '12px', fontWeight: 500,
        color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '4px',
    };

    const sectionStyle: React.CSSProperties = {
        background: isDark ? '#374151' : '#F9FAFB',
        borderRadius: '12px', padding: '14px', marginBottom: '14px',
    };

    const requiredMark = <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>;

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
                }}>
                    <span style={{ fontSize: '20px' }}>👤</span>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', margin: 0 }}>
                    ข้อมูลผู้ขอใบรับรอง
                </h2>
            </div>

            {/* Applicant Type Selection */}
            <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>ประเภทผู้ยื่น{requiredMark}</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {APPLICANT_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('applicantType', type.id)} style={{
                            flex: 1, padding: '10px 6px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                            border: form.applicantType === type.id ? '2px solid #10B981' : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                            background: form.applicantType === type.id ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : 'transparent',
                        }}>
                            <div style={{ fontSize: '18px' }}>{type.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', marginTop: '2px' }}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Individual Form */}
            {form.applicantType === 'INDIVIDUAL' && (
                <div style={sectionStyle}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>
                        👤 ข้อมูลบุคคลธรรมดา
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>ชื่อ{requiredMark}</label>
                            <input type="text" value={form.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} placeholder="ชื่อจริง" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>นามสกุล{requiredMark}</label>
                            <input type="text" value={form.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} placeholder="นามสกุล" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>เลขบัตรประชาชน{requiredMark}</label>
                        <input
                            type="text"
                            value={form.idCard || ''}
                            onChange={e => handleChange('idCard', e.target.value.replace(/\D/g, '').slice(0, 13))}
                            placeholder="1234567890123"
                            maxLength={13}
                            style={{
                                ...inputStyle,
                                borderColor: fieldErrors.idCard?.includes('ไม่ถูกต้อง') ? '#DC2626' :
                                    (form.idCard?.length === 13 && !fieldErrors.idCard) ? '#22C55E' : inputStyle.border?.toString().includes('#') ? inputStyle.border?.toString().split(' ').pop() : '#D1D5DB',
                                borderWidth: '2px'
                            }}
                        />
                        {fieldErrors.idCard && (
                            <p style={{ fontSize: '12px', marginTop: '4px', color: fieldErrors.idCard.includes('ไม่ถูกต้อง') ? '#DC2626' : '#6B7280' }}>
                                {fieldErrors.idCard}
                            </p>
                        )}
                        {form.idCard?.length === 13 && !fieldErrors.idCard && (
                            <p style={{ fontSize: '12px', marginTop: '4px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✓ เลขบัตรประชาชนถูกต้อง
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>โทรศัพท์{requiredMark}</label>
                            <input
                                type="tel"
                                value={form.phone || ''}
                                onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="0812345678"
                                maxLength={10}
                                style={{
                                    ...inputStyle,
                                    borderColor: fieldErrors.phone?.includes('ขึ้นต้น') ? '#DC2626' :
                                        (form.phone?.length === 10 && !fieldErrors.phone) ? '#22C55E' : inputStyle.border?.toString().includes('#') ? inputStyle.border?.toString().split(' ').pop() : '#D1D5DB',
                                    borderWidth: '2px'
                                }}
                            />
                            {fieldErrors.phone && (
                                <p style={{ fontSize: '11px', marginTop: '4px', color: fieldErrors.phone.includes('ขึ้นต้น') ? '#DC2626' : '#6B7280' }}>
                                    {fieldErrors.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <label style={labelStyle}>Line ID{requiredMark}</label>
                            <input type="text" value={form.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} placeholder="Line ID" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>อีเมล{requiredMark}</label>
                        <input
                            type="email"
                            value={form.email || ''}
                            onChange={e => handleChange('email', e.target.value)}
                            placeholder="email@example.com"
                            style={{
                                ...inputStyle,
                                borderColor: fieldErrors.email ? '#DC2626' :
                                    (form.email && !fieldErrors.email) ? '#22C55E' : inputStyle.border?.toString().includes('#') ? inputStyle.border?.toString().split(' ').pop() : '#D1D5DB',
                                borderWidth: form.email ? '2px' : '1px',
                            }}
                        />
                        {fieldErrors.email && (
                            <p style={{ fontSize: '12px', marginTop: '4px', color: '#DC2626' }}>
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Community Enterprise Form */}
            {form.applicantType === 'COMMUNITY' && (
                <div style={sectionStyle}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>
                        👥 ข้อมูลวิสาหกิจชุมชน
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>ชื่อวิสาหกิจชุมชน{requiredMark}</label>
                        <input type="text" value={form.communityName || ''} onChange={e => handleChange('communityName', e.target.value)} placeholder="ชื่อวิสาหกิจชุมชน" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>ชื่อประธาน{requiredMark}</label>
                            <input type="text" value={form.presidentName || ''} onChange={e => handleChange('presidentName', e.target.value)} placeholder="ชื่อ-นามสกุล ประธาน" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>เลขบัตรประชาชน{requiredMark}</label>
                            <input type="text" value={form.presidentIdCard || ''} onChange={e => handleChange('presidentIdCard', e.target.value)} placeholder="13 หลัก" maxLength={13} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>รหัส สวช.01{requiredMark}</label>
                            <input type="text" value={form.registrationSVC01 || ''} onChange={e => handleChange('registrationSVC01', e.target.value)} placeholder="รหัสทะเบียน" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>รหัส ท.ว.ช.3{requiredMark}</label>
                            <input type="text" value={form.registrationTVC3 || ''} onChange={e => handleChange('registrationTVC3', e.target.value)} placeholder="รหัสทะเบียน" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>เลขรหัสประจำบ้าน{requiredMark}</label>
                        <input type="text" value={form.houseRegistrationCode || ''} onChange={e => handleChange('houseRegistrationCode', e.target.value)} placeholder="ตามทะเบียนราษฎร" style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>ที่อยู่ตามทะเบียนบ้าน{requiredMark}</label>
                        <input type="text" value={form.registeredAddress || ''} onChange={e => handleChange('registeredAddress', e.target.value)} placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>โทรศัพท์{requiredMark}</label>
                            <input type="tel" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} placeholder="08X-XXX-XXXX" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Line ID{requiredMark}</label>
                            <input type="text" value={form.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} placeholder="Line ID" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>อีเมล{requiredMark}</label>
                        <input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" style={inputStyle} />
                    </div>
                </div>
            )}

            {/* Juristic Person Form */}
            {form.applicantType === 'JURISTIC' && (
                <div style={sectionStyle}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '12px' }}>
                        🏢 ข้อมูลนิติบุคคล
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>ชื่อสถานประกอบการ/บริษัท{requiredMark}</label>
                        <input type="text" value={form.companyName || ''} onChange={e => handleChange('companyName', e.target.value)} placeholder="ชื่อบริษัท จำกัด" style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>ที่อยู่สถานที่จัดตั้ง{requiredMark}</label>
                        <input type="text" value={form.companyAddress || ''} onChange={e => handleChange('companyAddress', e.target.value)} placeholder="ที่อยู่บริษัท" style={inputStyle} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={labelStyle}>โทรศัพท์สถานที่จัดตั้ง{requiredMark}</label>
                        <input type="tel" value={form.companyPhone || ''} onChange={e => handleChange('companyPhone', e.target.value)} placeholder="02-XXX-XXXX" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>ชื่อประธานกรรมการ{requiredMark}</label>
                            <input type="text" value={form.directorName || ''} onChange={e => handleChange('directorName', e.target.value)} placeholder="ชื่อ-นามสกุล" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>เลขทะเบียนนิติบุคคล{requiredMark}</label>
                            <input type="text" value={form.registrationNumber || ''} onChange={e => handleChange('registrationNumber', e.target.value)} placeholder="เลขผู้เสียภาษี" style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                            <label style={labelStyle}>โทรศัพท์ประธาน{requiredMark}</label>
                            <input type="tel" value={form.directorPhone || ''} onChange={e => handleChange('directorPhone', e.target.value)} placeholder="08X-XXX-XXXX" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>อีเมล{requiredMark}</label>
                            <input type="email" value={form.directorEmail || ''} onChange={e => handleChange('directorEmail', e.target.value)} placeholder="email@company.com" style={inputStyle} />
                        </div>
                    </div>

                    {/* Power of Attorney Section */}
                    <div style={{ background: isDark ? '#1F2937' : '#FEF3C7', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#B45309', marginBottom: '8px' }}>
                            📄 กรณีมอบอำนาจให้กระทำการแทน
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>หนังสือมอบอำนาจ (PDF)</label>
                            <div style={{
                                border: `2px dashed ${isDark ? '#4B5563' : '#D1D5DB'}`,
                                borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer',
                                background: isDark ? '#374151' : '#FFFFFF',
                            }}>
                                <span style={{ fontSize: '24px' }}>📎</span>
                                <div style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', marginTop: '4px' }}>
                                    คลิกเพื่ออัปโหลด PDF (Max 100MB)
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                                <label style={labelStyle}>ชื่อผู้ประสานงาน</label>
                                <input type="text" value={form.coordinatorName || ''} onChange={e => handleChange('coordinatorName', e.target.value)} placeholder="ชื่อ-นามสกุล" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>โทรศัพท์ผู้ประสานงาน</label>
                                <input type="tel" value={form.coordinatorPhone || ''} onChange={e => handleChange('coordinatorPhone', e.target.value)} placeholder="08X-XXX-XXXX" style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Line ID ผู้ประสานงาน</label>
                            <input type="text" value={form.coordinatorLineId || ''} onChange={e => handleChange('coordinatorLineId', e.target.value)} placeholder="Line ID" style={inputStyle} />
                        </div>
                    </div>
                </div>
            )}

            {/* High Control Warning */}
            {isHighControl && (
                <div style={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '10px', padding: '10px', marginBottom: '14px' }}>
                    <p style={{ fontSize: '11px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        ⚠️ พืชควบคุม: กรุณาเตรียมใบอนุญาตประกอบกิจการ
                    </p>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleBack} style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} style={{
                    flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                }}>
                    ถัดไป →
                </button>
            </div>
        </div>
    );
}

