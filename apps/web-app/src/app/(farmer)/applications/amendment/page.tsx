"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api-client";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", border: "rgba(0, 0, 0, 0.08)",
        text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#2563EB", accentLight: "#3B82F6",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", border: "rgba(255, 255, 255, 0.08)",
        text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#3B82F6", accentLight: "#60A5FA",
    }
};

const Icons = {
    back: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    edit: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    check: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
};

interface EditableField {
    key: string;
    label: string;
    value: string;
    originalValue: string;
    isModified: boolean;
}

export default function AmendmentApplicationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [step, setStep] = useState<'select' | 'edit' | 'confirm' | 'submitted'>('select');
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Editable fields
    const [fields, setFields] = useState<EditableField[]>([]);
    const [changeDescription, setChangeDescription] = useState('');

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        if (certId) loadCertificate();
    }, [certId]);

    const loadCertificate = async () => {
        if (!certId) return;
        setLoading(true);
        const result = await api.get<any>(`/v2/certificates/${certId}`);
        if (result.success && result.data?.data) {
            const cert = result.data.data;
            setCertificate(cert);

            // Pre-fill editable fields from certificate
            setFields([
                { key: 'siteName', label: 'ชื่อสถานประกอบการ', value: cert.siteName || '', originalValue: cert.siteName || '', isModified: false },
                { key: 'address', label: 'ที่อยู่', value: cert.address || '', originalValue: cert.address || '', isModified: false },
                { key: 'contactPhone', label: 'เบอร์โทรศัพท์', value: cert.contactPhone || '', originalValue: cert.contactPhone || '', isModified: false },
                { key: 'contactEmail', label: 'อีเมล', value: cert.contactEmail || '', originalValue: cert.contactEmail || '', isModified: false },
            ]);
        }
        setLoading(false);
    };

    const handleFieldChange = (key: string, newValue: string) => {
        setFields(prev => prev.map(f => {
            if (f.key === key) {
                return {
                    ...f,
                    value: newValue,
                    isModified: newValue !== f.originalValue
                };
            }
            return f;
        }));
    };

    const modifiedFields = fields.filter(f => f.isModified);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Create amendment application
            const changes = modifiedFields.reduce((acc, f) => {
                acc[f.key] = { from: f.originalValue, to: f.value };
                return acc;
            }, {} as Record<string, { from: string; to: string }>);

            const result = await api.post<any>('/v2/applications', {
                serviceType: 'amendment',
                originalCertificateId: certId,
                data: {
                    changes,
                    changeDescription,
                    applicantInfo: certificate?.applicantInfo
                }
            });

            if (result.success) {
                setStep('submitted');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: t.textSecondary }}>กำลังโหลดข้อมูลใบรับรอง...</p>
                </div>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                {/* Header */}
                <button onClick={() => router.back()} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                }}>
                    {Icons.back(t.textMuted)} ย้อนกลับ
                </button>

                <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>
                    แก้ไขข้อมูลในใบรับรอง
                </h1>
                <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '32px' }}>
                    ใบรับรองเลขที่: <strong>{certificate?.certificateNumber || '-'}</strong>
                </p>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    {['เลือกข้อมูล', 'แก้ไข', 'ยืนยัน', 'เสร็จสิ้น'].map((label, idx) => {
                        const stepIndex = ['select', 'edit', 'confirm', 'submitted'].indexOf(step);
                        const isActive = idx === stepIndex;
                        const isComplete = idx < stepIndex;
                        return (
                            <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isComplete ? '#10B981' : isActive ? t.accent : t.border,
                                    color: isComplete || isActive ? '#fff' : t.textMuted,
                                    fontSize: '14px', fontWeight: 600
                                }}>
                                    {isComplete ? Icons.check('#fff') : idx + 1}
                                </div>
                                <div style={{ fontSize: '12px', color: isActive ? t.accent : t.textMuted }}>{label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Step: Select & Edit (Combined for simplicity) */}
                {(step === 'select' || step === 'edit') && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>
                            {Icons.edit(t.accent)} แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง
                        </h3>

                        <div style={{ marginBottom: '24px' }}>
                            {fields.map(field => (
                                <div key={field.key} style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: t.textMuted, marginBottom: '6px' }}>
                                        {field.label}
                                        {field.isModified && <span style={{ color: '#F59E0B', marginLeft: '8px' }}>● แก้ไขแล้ว</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 14px', borderRadius: '10px',
                                            border: field.isModified ? `2px solid #F59E0B` : `1px solid ${t.border}`,
                                            background: 'transparent', color: t.text, fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    {field.isModified && (
                                        <p style={{ fontSize: '12px', color: t.textMuted, marginTop: '4px' }}>
                                            เดิม: {field.originalValue}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Change Description */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: t.textMuted, marginBottom: '6px' }}>
                                เหตุผลในการแก้ไข <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                value={changeDescription}
                                onChange={(e) => setChangeDescription(e.target.value)}
                                placeholder="อธิบายสาเหตุที่ต้องแก้ไขข้อมูล..."
                                style={{
                                    width: '100%', padding: '12px 14px', borderRadius: '10px', minHeight: '100px',
                                    border: `1px solid ${t.border}`, background: 'transparent',
                                    color: t.text, fontSize: '14px', outline: 'none', resize: 'vertical'
                                }}
                            />
                        </div>

                        <button
                            onClick={() => setStep('confirm')}
                            disabled={modifiedFields.length === 0 || !changeDescription.trim()}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: (modifiedFields.length > 0 && changeDescription.trim())
                                    ? `linear-gradient(135deg, ${t.accent}, ${t.accentLight})` : t.border,
                                color: '#fff', fontSize: '14px', fontWeight: 600,
                                cursor: (modifiedFields.length > 0 && changeDescription.trim()) ? 'pointer' : 'not-allowed'
                            }}
                        >
                            ตรวจสอบการแก้ไข ({modifiedFields.length} รายการ) →
                        </button>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>
                            ยืนยันการแก้ไข
                        </h3>

                        <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '12px', marginBottom: '24px' }}>
                            <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
                                ⚠️ หลังจากส่งคำขอ ทีมงานจะประเมินและส่งใบเสนอราคาให้ท่านผ่านระบบ
                            </p>
                        </div>

                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '12px' }}>
                            รายการที่แก้ไข:
                        </h4>

                        <div style={{ marginBottom: '24px' }}>
                            {modifiedFields.map(field => (
                                <div key={field.key} style={{
                                    padding: '12px', borderRadius: '8px', border: `1px solid ${t.border}`,
                                    marginBottom: '8px'
                                }}>
                                    <div style={{ fontWeight: 500, color: t.text, marginBottom: '4px' }}>{field.label}</div>
                                    <div style={{ fontSize: '13px' }}>
                                        <span style={{ color: '#EF4444', textDecoration: 'line-through' }}>{field.originalValue}</span>
                                        <span style={{ color: t.textMuted }}> → </span>
                                        <span style={{ color: '#10B981', fontWeight: 500 }}>{field.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '12px', background: `${t.accent}10`, borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '13px', color: t.textMuted, marginBottom: '4px' }}>เหตุผล:</div>
                            <div style={{ fontSize: '14px', color: t.text }}>{changeDescription}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep('edit')} style={{
                                flex: 1, padding: '14px', borderRadius: '12px',
                                border: `1px solid ${t.border}`, background: 'transparent',
                                color: t.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>
                                ← แก้ไขเพิ่มเติม
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                                    background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
                                    color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'กำลังส่ง...' : 'ส่งคำขอแก้ไข'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Submitted */}
                {step === 'submitted' && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '32px', textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
                            background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {Icons.check('#fff')}
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>
                            ส่งคำขอแก้ไขเรียบร้อย
                        </h3>
                        <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '24px' }}>
                            ทีมงานจะตรวจสอบและส่งใบเสนอราคาให้ท่าน<br />
                            กรุณาตรวจสอบในหน้า "การเงิน" เพื่อดูสถานะ
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => router.push('/applications')} style={{
                                padding: '14px 24px', borderRadius: '12px',
                                border: `1px solid ${t.border}`, background: 'transparent',
                                color: t.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>
                                กลับหน้าคำขอ
                            </button>
                            <button onClick={() => router.push('/payments')} style={{
                                padding: '14px 24px', borderRadius: '12px', border: 'none',
                                background: `linear-gradient(135deg, ${t.accent}, ${t.accentLight})`,
                                color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>
                                ไปหน้าการเงิน
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

