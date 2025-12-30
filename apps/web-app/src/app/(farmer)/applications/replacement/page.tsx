"use client";

import { Suspense, useEffect, useState } from "react";
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
    upload: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    check: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
};

type ReasonType = 'lost' | 'damaged' | null;

// Main content component with useSearchParams
function ReplacementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [step, setStep] = useState<'reason' | 'upload' | 'confirm' | 'submitted'>('reason');
    const [reason, setReason] = useState<ReasonType>(null);
    const [policeReport, setPoliceReport] = useState<File | null>(null);
    const [damagedCert, setDamagedCert] = useState<File | null>(null);
    const [certificate, setCertificate] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        if (certId) loadCertificate();
    }, [certId]);

    const loadCertificate = async () => {
        if (!certId) return;
        const result = await api.get<any>(`/v2/certificates/${certId}`);
        if (result.success && result.data?.data) {
            setCertificate(result.data.data);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Create replacement application
            const result = await api.post<any>('/v2/applications', {
                serviceType: 'replacement',
                originalCertificateId: certId,
                data: {
                    replacementReason: reason,
                    applicantInfo: certificate?.applicantInfo
                }
            });

            if (result.success && result.data?.data) {
                setApplicationId(result.data.data._id);
                setStep('submitted');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <button onClick={() => router.back()} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                }}>
                    {Icons.back(t.textMuted)} ย้อนกลับ
                </button>

                <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>
                    ขอใบรับรองแทน
                </h1>
                <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '32px' }}>
                    กรณีใบรับรองสูญหายหรือถูกทำลาย
                </p>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    {['เลือกสาเหตุ', 'แนบหลักฐาน', 'ยืนยัน', 'เสร็จสิ้น'].map((label, idx) => {
                        const stepIndex = ['reason', 'upload', 'confirm', 'submitted'].indexOf(step);
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

                {/* Step: Reason */}
                {step === 'reason' && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>
                            สาเหตุที่ต้องขอใบรับรองแทน
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            <label style={{
                                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                border: reason === 'lost' ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                background: reason === 'lost' ? `${t.accent}10` : 'transparent'
                            }}>
                                <input
                                    type="radio"
                                    name="reason"
                                    value="lost"
                                    checked={reason === 'lost'}
                                    onChange={() => setReason('lost')}
                                    style={{ marginRight: '12px' }}
                                />
                                <span style={{ fontWeight: 500, color: t.text }}>ใบรับรองสูญหาย</span>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginTop: '4px', marginLeft: '28px' }}>
                                    ต้องแนบใบแจ้งความจากสถานีตำรวจ
                                </p>
                            </label>

                            <label style={{
                                padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                border: reason === 'damaged' ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                background: reason === 'damaged' ? `${t.accent}10` : 'transparent'
                            }}>
                                <input
                                    type="radio"
                                    name="reason"
                                    value="damaged"
                                    checked={reason === 'damaged'}
                                    onChange={() => setReason('damaged')}
                                    style={{ marginRight: '12px' }}
                                />
                                <span style={{ fontWeight: 500, color: t.text }}>ใบรับรองถูกทำลายหรือลบเลือน</span>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginTop: '4px', marginLeft: '28px' }}>
                                    ต้องแนบใบรับรองที่ชำรุด
                                </p>
                            </label>
                        </div>

                        <button
                            onClick={() => setStep('upload')}
                            disabled={!reason}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: reason ? `linear-gradient(135deg, ${t.accent}, ${t.accentLight})` : t.border,
                                color: '#fff', fontSize: '14px', fontWeight: 600, cursor: reason ? 'pointer' : 'not-allowed'
                            }}
                        >
                            ถัดไป →
                        </button>
                    </div>
                )}

                {/* Step: Upload */}
                {step === 'upload' && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>
                            {reason === 'lost' ? 'แนบใบแจ้งความ' : 'แนบใบรับรองที่ชำรุด'}
                        </h3>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                                padding: '32px', borderRadius: '12px', cursor: 'pointer',
                                border: `2px dashed ${t.border}`, background: 'transparent'
                            }}>
                                {Icons.upload(t.textMuted)}
                                <span style={{ fontSize: '14px', color: t.textSecondary }}>
                                    {reason === 'lost'
                                        ? (policeReport ? policeReport.name : 'คลิกเพื่ออัปโหลดใบแจ้งความ')
                                        : (damagedCert ? damagedCert.name : 'คลิกเพื่ออัปโหลดใบรับรองที่ชำรุด')}
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            reason === 'lost' ? setPoliceReport(file) : setDamagedCert(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep('reason')} style={{
                                flex: 1, padding: '14px', borderRadius: '12px',
                                border: `1px solid ${t.border}`, background: 'transparent',
                                color: t.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>
                                ← ย้อนกลับ
                            </button>
                            <button
                                onClick={() => setStep('confirm')}
                                disabled={reason === 'lost' ? !policeReport : !damagedCert}
                                style={{
                                    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                                    background: (reason === 'lost' ? policeReport : damagedCert)
                                        ? `linear-gradient(135deg, ${t.accent}, ${t.accentLight})` : t.border,
                                    color: '#fff', fontSize: '14px', fontWeight: 600,
                                    cursor: (reason === 'lost' ? policeReport : damagedCert) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                ถัดไป →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div style={{ background: t.bgCard, borderRadius: '16px', border: `1px solid ${t.border}`, padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>
                            ยืนยันข้อมูล
                        </h3>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '12px', marginBottom: '16px' }}>
                                <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
                                    ⚠️ หลังจากส่งคำขอ ทีมงานจะประเมินและส่งใบเสนอราคาให้ท่านผ่านระบบ
                                </p>
                            </div>

                            <table style={{ width: '100%', fontSize: '14px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: t.textMuted }}>ใบรับรองเดิม:</td>
                                        <td style={{ padding: '8px 0', color: t.text, fontWeight: 500 }}>
                                            {certificate?.certificateNumber || '-'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: t.textMuted }}>สาเหตุ:</td>
                                        <td style={{ padding: '8px 0', color: t.text, fontWeight: 500 }}>
                                            {reason === 'lost' ? 'ใบรับรองสูญหาย' : 'ใบรับรองถูกทำลาย/ลบเลือน'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: t.textMuted }}>หลักฐาน:</td>
                                        <td style={{ padding: '8px 0', color: t.text, fontWeight: 500 }}>
                                            {reason === 'lost' ? policeReport?.name : damagedCert?.name}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setStep('upload')} style={{
                                flex: 1, padding: '14px', borderRadius: '12px',
                                border: `1px solid ${t.border}`, background: 'transparent',
                                color: t.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                            }}>
                                ← ย้อนกลับ
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
                                {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
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
                            ส่งคำขอเรียบร้อย
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

// Loading fallback component
function ReplacementLoadingFallback() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAF9', fontFamily: "'Kanit', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#5A5A5A', fontSize: '14px' }}>กำลังโหลด...</p>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}

// 🍎 Apple-standard Suspense wrapper
export default function ReplacementApplicationPage() {
    return (
        <Suspense fallback={<ReplacementLoadingFallback />}>
            <ReplacementContent />
        </Suspense>
    );
}
