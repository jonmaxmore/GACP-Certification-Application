"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/apiClient';

// Theme
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

interface Certificate {
    _id: string;
    certificateNumber: string;
    applicationId: string;
    siteName: string;
    plantType: string;
    expiryDate: string;
    status: string;
}

const RENEWAL_FEE = 30000; // ค่าต่อสัญญา 30,000 บาท

const Icons = {
    back: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    upload: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    check: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    file: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
};

// เอกสารที่ต้องอัปโหลดสำหรับต่อสัญญา
const REQUIRED_DOCS = [
    { id: 'license_renewal', name: 'หนังสืออนุญาตประกอบกิจการ (ต่ออายุ)', required: true },
    { id: 'annual_report', name: 'รายงานผลผลิตประจำปี', required: true },
    { id: 'inspection_report', name: 'รายงานการตรวจสอบคุณภาพ', required: true },
    { id: 'tax_certificate', name: 'หนังสือรับรองการเสียภาษี', required: false },
];

export default function RenewalPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [isDark, setIsDark] = useState(false);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [step, setStep] = useState<'upload' | 'quotation' | 'invoice' | 'payment' | 'success'>('upload');
    const [renewalId, setRenewalId] = useState<string | null>(null);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }

        if (certId) {
            loadCertificate(certId);
        } else {
            setLoading(false);
        }
    }, [certId]);

    const loadCertificate = async (id: string) => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Certificate }>(`/v2/certificates/${id}`);
            if (result.success && result.data?.data) {
                setCertificate(result.data.data);
            }
        } catch (error) {
            console.error('Failed to load certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (docId: string, file: File) => {
        console.log('[Renewal] Starting upload for:', docId, file.name);
        setUploading(docId);
        try {
            // Simulate upload - quick for demo
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('[Renewal] Upload complete for:', docId);
            setUploadedDocs(prev => {
                const newState = { ...prev, [docId]: true };
                console.log('[Renewal] Updated uploadedDocs:', newState);
                return newState;
            });
        } catch (error) {
            console.error('[Renewal] Upload failed:', error);
        } finally {
            setUploading(null);
        }
    };

    const allRequiredUploaded = REQUIRED_DOCS.filter(d => d.required).every(d => uploadedDocs[d.id]);

    // Debug: Log state changes
    console.log('[Renewal] uploadedDocs:', uploadedDocs);
    console.log('[Renewal] allRequiredUploaded:', allRequiredUploaded);
    console.log('[Renewal] Required docs status:', REQUIRED_DOCS.filter(d => d.required).map(d => ({ id: d.id, uploaded: !!uploadedDocs[d.id] })));

    // Demo mode: Skip upload step (instantly set all docs as uploaded)
    const handleSkipUpload = () => {
        console.log('[Renewal] Skip clicked - setting all docs as uploaded');
        const allDocs: Record<string, boolean> = {};
        REQUIRED_DOCS.forEach(doc => {
            allDocs[doc.id] = true;
        });
        setUploadedDocs(allDocs);
    };

    const handleProceedToQuotation = async () => {
        console.log('[Renewal] handleProceedToQuotation called');
        console.log('[Renewal] certificate:', certificate);

        // Generate renewal ID even if no certificate (demo mode)
        let newRenewalId = `RNW-${Date.now().toString(36).toUpperCase()}`;

        // Only call API if certificate exists
        if (certificate) {
            try {
                console.log('[Renewal] Calling renewal API...');
                const result = await api.post<{ data: { applicationId: string } }>('/v2/applications/renewal', {
                    previousApplicationId: certificate.applicationId,
                    certificateId: certificate._id,
                    documentIds: Object.keys(uploadedDocs).filter(k => uploadedDocs[k])
                });

                if (result.success && result.data?.data?.applicationId) {
                    newRenewalId = result.data.data.applicationId;
                }
                console.log('[Renewal] API result:', result);
            } catch (error) {
                console.warn('[Renewal] API failed, using demo ID:', error);
            }
        } else {
            console.log('[Renewal] No certificate, using demo mode');
        }

        setRenewalId(newRenewalId);
        console.log('[Renewal] Setting step to quotation');
        setStep('quotation');
    };

    const handleProceedToInvoice = () => {
        setStep('invoice');
    };

    const handleProceedToPayment = () => {
        setStep('payment');
    };

    const handlePaymentConfirm = async () => {
        // Confirm payment via API
        try {
            await api.post('/v2/payments/confirm', {
                applicationId: renewalId,
                phase: 'renewal',
                amount: RENEWAL_FEE
            });
        } catch (error) {
            console.warn('Payment confirmation via API failed, proceeding anyway');
        }

        // Store payment data
        localStorage.setItem('last_renewal_id', renewalId || '');
        localStorage.setItem('last_renewal_payment', JSON.stringify({
            amount: RENEWAL_FEE,
            certificateNumber: certificate?.certificateNumber,
            siteName: certificate?.siteName,
            paidAt: new Date().toISOString()
        }));

        setStep('success');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
                <div className="spinner" style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: '50%' }} />
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style>
            </div>
        );
    }

    if (!certificate && !certId) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: t.bg, padding: '32px', fontFamily: "'Kanit', sans-serif" }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '60px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: t.iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        {Icons.file(t.iconColor)}
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>ต่ออายุใบรับรอง GACP</h1>
                    <p style={{ color: t.textMuted, marginBottom: '24px' }}>กรุณาเลือกใบรับรองที่ต้องการต่ออายุจากหน้าใบรับรอง</p>
                    <Link href="/certificates" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '14px 28px', borderRadius: '12px',
                        background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                        color: '#FFF', fontWeight: 600, textDecoration: 'none'
                    }}>
                        ไปหน้าใบรับรอง
                    </Link>
                </div>
            </div>
        );
    }

    // ========== STEP: SUCCESS ==========
    if (step === 'success') {
        return (
            <div style={{ minHeight: '100vh', background: isDark ? '#0A0F1C' : 'linear-gradient(180deg, #ECFDF5 0%, #F9FAFB 100%)', fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
                {/* Confetti */}
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
                    {[...Array(30)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute', width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`,
                            background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5],
                            borderRadius: i % 3 === 0 ? '50%' : '2px', left: `${Math.random() * 100}%`, top: '-20px',
                            animation: `confetti ${2 + Math.random()}s ease-out forwards`,
                            animationDelay: `${Math.random() * 0.8}s`,
                        }} />
                    ))}
                </div>

                <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                    {/* Success Icon */}
                    <div style={{
                        width: '90px', height: '90px',
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                        animation: 'scaleIn 0.5s ease-out',
                    }}>
                        <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                    </div>

                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: isDark ? '#F9FAFB' : '#065F46', marginBottom: '8px' }}>
                        🎉 ต่อสัญญาสำเร็จ!
                    </h1>
                    <p style={{ fontSize: '15px', color: isDark ? '#9CA3AF' : '#047857', marginBottom: '20px' }}>
                        ขอบคุณสำหรับการต่ออายุใบรับรอง GACP
                    </p>

                    {/* Case Number */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', background: isDark ? '#374151' : 'white',
                        borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '2px solid #10B981', marginBottom: '24px'
                    }}>
                        <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>หมายเลขเคส:</span>
                        <strong style={{ fontSize: '16px', color: '#059669', letterSpacing: '0.5px' }}>{renewalId}</strong>
                    </div>

                    {/* Summary Card */}
                    <div style={{
                        background: isDark ? '#1F2937' : 'white', borderRadius: '16px', padding: '24px',
                        maxWidth: '450px', margin: '0 auto 24px', textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '16px' }}>📋 สรุปการต่อสัญญา</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ padding: '12px', background: t.accentBg, borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '4px' }}>ใบรับรองเลขที่</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: t.accent }}>{certificate?.certificateNumber}</div>
                            </div>
                            <div style={{ padding: '12px', background: isDark ? '#374151' : '#F9FAFB', borderRadius: '10px' }}>
                                <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '4px' }}>สถานที่</div>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: t.text }}>{certificate?.siteName}</div>
                            </div>
                            <div style={{ padding: '12px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #10B981' }}>
                                <div style={{ fontSize: '12px', color: '#065F46', marginBottom: '4px' }}>จำนวนเงินที่ชำระ</div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>฿{RENEWAL_FEE.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '450px', margin: '0 auto' }}>
                        <Link href="/tracking" style={{
                            padding: '16px 24px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                            color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        }}>
                            📍 ติดตามสถานะ
                        </Link>
                        <Link href="/dashboard" style={{
                            padding: '16px 24px', borderRadius: '14px',
                            background: isDark ? '#374151' : 'white',
                            color: t.text, fontSize: '15px', fontWeight: 500, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `2px solid ${t.border}`,
                        }}>
                            🏠 กลับหน้าหลัก
                        </Link>
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                    @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
                `}</style>
            </div>
        );
    }

    // ========== STEP: PAYMENT ==========
    if (step === 'payment') {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <button onClick={() => setStep('invoice')} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                        background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                    }}>
                        {Icons.back(t.textMuted)} ย้อนกลับ
                    </button>

                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>ชำระเงินค่าต่อสัญญา</h1>
                    <p style={{ color: t.textMuted, marginBottom: '24px' }}>สแกน QR Code เพื่อชำระเงิน</p>

                    {/* QR Payment Card */}
                    <div style={{
                        background: t.bgCard, borderRadius: '20px', padding: '28px',
                        border: `1px solid ${t.border}`, textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{
                                display: 'inline-block', padding: '8px 20px',
                                backgroundColor: '#00427A', borderRadius: '8px',
                                color: '#FFF', fontSize: '14px', fontWeight: 600,
                            }}>
                                พร้อมเพย์ | PromptPay
                            </span>
                        </div>

                        {/* QR Code */}
                        <div style={{
                            width: '220px', height: '220px', margin: '0 auto 20px',
                            backgroundColor: '#FFF', border: '2px solid #00427A',
                            borderRadius: '12px', padding: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <img
                                src={`https://promptpay.io/0994566289/${RENEWAL_FEE}.png`}
                                alt="PromptPay QR"
                                style={{ width: '200px', height: '200px' }}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY:${RENEWAL_FEE}`;
                                }}
                            />
                        </div>

                        {/* Amount */}
                        <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '12px', marginBottom: '20px' }}>
                            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>จำนวนเงินที่ต้องชำระ</p>
                            <p style={{ fontSize: '32px', fontWeight: 700, color: '#10B981', margin: 0 }}>
                                ฿{RENEWAL_FEE.toLocaleString()}
                            </p>
                        </div>

                        {/* Receiver Info */}
                        <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', fontSize: '13px', color: '#374151', marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 4px' }}><strong>ผู้รับเงิน:</strong> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                            <p style={{ margin: 0 }}><strong>หมายเลขเคส:</strong> {renewalId}</p>
                        </div>

                        <button onClick={handlePaymentConfirm} style={{
                            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                            color: '#FFF', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                        }}>
                            ยืนยันการชำระเงิน
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== STEP: INVOICE (ใบวางบิล) ==========
    if (step === 'invoice') {
        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        const currentDate = new Date();
        const dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + 7);

        return (
            <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                    <button onClick={() => setStep('quotation')} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                        background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                    }}>
                        {Icons.back(t.textMuted)} ย้อนกลับ
                    </button>

                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: t.text, marginBottom: '20px' }}>ใบวางบิล / Invoice</h1>

                    {/* Official Invoice Document - A4 Style */}
                    <div style={{
                        background: '#FFFFFF', color: '#111827',
                        padding: '40px', aspectRatio: '210/297',
                        border: '1px solid #D1D5DB', borderRadius: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px',
                        fontFamily: "'Sarabun', 'Kanit', sans-serif"
                    }}>
                        {/* === HEADER === */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #2563EB' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                                <img src="/images/dtam-logo.png" alt="กรมการแพทย์แผนไทยฯ" style={{ width: '70px', height: '70px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', marginBottom: '2px' }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                                <div style={{ fontSize: '11px', color: '#374151', marginBottom: '2px' }}>Department of Thai Traditional and Alternative Medicine</div>
                                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '1px' }}>กระทรวงสาธารณสุข | Ministry of Public Health</div>
                                <div style={{ fontSize: '9px', color: '#9CA3AF' }}>88/23 หมู่ 4 ถนนติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000 | โทร. 0-2591-7007</div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '160px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', color: '#fff', padding: '6px 14px', fontSize: '13px', fontWeight: 600, marginBottom: '8px', borderRadius: '4px' }}>ใบวางบิล</div>
                                <div style={{ fontSize: '11px', color: '#374151' }}>เลขที่: <strong>{invoiceNumber}</strong></div>
                                <div style={{ fontSize: '10px', color: '#6B7280' }}>วันที่: {currentDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div style={{ fontSize: '10px', color: '#6B7280' }}>อ้างอิง: {renewalId || '-'}</div>
                            </div>
                        </div>

                        {/* === RECIPIENT === */}
                        <div style={{ marginBottom: '20px', padding: '12px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>เรียกเก็บเงินจาก / Bill To:</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{certificate?.siteName || 'ผู้ประกอบการ'}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>ใบรับรอง: {certificate?.certificateNumber || '-'}</div>
                        </div>

                        {/* === FEE TABLE === */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                            <thead>
                                <tr style={{ background: '#1E3A8A', color: '#FFFFFF' }}>
                                    <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #1E3A8A', width: '50px' }}>ลำดับ</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #1E3A8A' }}>รายการ</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #1E3A8A', width: '80px' }}>จำนวน</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', border: '1px solid #1E3A8A', width: '100px' }}>หน่วยละ (บาท)</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', border: '1px solid #1E3A8A', width: '100px' }}>จำนวนเงิน (บาท)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>1</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB' }}>ค่าบริการต่ออายุใบรับรองมาตรฐาน GACP<br /><span style={{ fontSize: '10px', color: '#6B7280' }}>(รวมค่าตรวจประเมินและออกใบรับรอง)</span></td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>1</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#DBEAFE' }}>
                                    <td colSpan={4} style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 600 }}>ยอดรวมที่ต้องชำระ</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: '#1D4ED8' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colSpan={5} style={{ padding: '8px', border: '1px solid #E5E7EB', textAlign: 'center', fontStyle: 'italic', fontSize: '11px', color: '#374151' }}>(สามหมื่นบาทถ้วน)</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* === DUE DATE & PAYMENT === */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, padding: '12px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                                <div style={{ fontSize: '10px', color: '#92400E', marginBottom: '4px' }}>กำหนดชำระ / Due Date</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#B45309' }}>{dueDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div style={{ flex: 1, padding: '12px', background: '#FEE2E2', borderRadius: '6px', border: '1px solid #EF4444' }}>
                                <div style={{ fontSize: '10px', color: '#991B1B', marginBottom: '4px' }}>สถานะ / Status</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>รอชำระเงิน</div>
                            </div>
                        </div>

                        {/* === PAYMENT METHODS === */}
                        <div style={{ padding: '14px', background: '#F0F9FF', borderRadius: '6px', border: '1px solid #BAE6FD', marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0C4A6E', marginBottom: '6px' }}>ช่องทางการชำระเงิน:</div>
                            <div style={{ fontSize: '11px', color: '#0369A1' }}>
                                <div style={{ marginBottom: '4px' }}>• สแกน QR Code PromptPay</div>
                                <div>• โอนเงินเข้าบัญชี: <strong>กรมการแพทย์แผนไทยฯ</strong> ธ.กรุงไทย 067-0-00001-5</div>
                            </div>
                        </div>

                        {/* === FOOTER / SIGNATURE === */}
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '9px', color: '#9CA3AF', maxWidth: '280px' }}>
                                <div>หมายเหตุ: กรุณาแนบหลักฐานการชำระเงินหลังโอน</div>
                                <div>ติดต่อ: 0-2591-7007</div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>(ลายมือชื่อ)</span>
                                </div>
                                <div style={{ borderTop: '1px dashed #9CA3AF', paddingTop: '4px', marginTop: '4px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 500, color: '#374151' }}>ผู้ออกใบวางบิล</div>
                                    <div style={{ fontSize: '9px', color: '#6B7280' }}>กองกัญชาทางการแพทย์</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => window.print()} style={{
                            flex: 1, padding: '14px', borderRadius: '12px',
                            border: `2px solid #3B82F6`, background: 'transparent',
                            color: '#3B82F6', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            🖨️ พิมพ์ใบวางบิล
                        </button>
                        <button onClick={handleProceedToPayment} style={{
                            flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                            color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            ดำเนินการชำระเงิน →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== STEP: QUOTATION (ใบเสนอราคา) ==========
    if (step === 'quotation') {
        const quoteNumber = `QT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
        const currentDate = new Date();
        const validUntil = new Date(currentDate);
        validUntil.setDate(validUntil.getDate() + 30);

        return (
            <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                    <button onClick={() => setStep('upload')} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                        background: 'transparent', color: t.textSecondary, cursor: 'pointer', marginBottom: '24px'
                    }}>
                        {Icons.back(t.textMuted)} ย้อนกลับ
                    </button>

                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: t.text, marginBottom: '20px' }}>ใบเสนอราคา / Quotation</h1>

                    {/* Official Quotation Document - A4 Style */}
                    <div style={{
                        background: '#FFFFFF', color: '#111827',
                        padding: '40px', aspectRatio: '210/297',
                        border: '1px solid #D1D5DB', borderRadius: '4px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px',
                        fontFamily: "'Sarabun', 'Kanit', sans-serif"
                    }}>
                        {/* === HEADER === */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #1E3A5F' }}>
                            {/* Logo Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                                <img
                                    src="/images/dtam-logo.png"
                                    alt="กรมการแพทย์แผนไทยฯ"
                                    style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>

                            {/* Department Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', marginBottom: '2px' }}>
                                    กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                                </div>
                                <div style={{ fontSize: '11px', color: '#374151', marginBottom: '2px' }}>
                                    Department of Thai Traditional and Alternative Medicine
                                </div>
                                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '1px' }}>
                                    กระทรวงสาธารณสุข | Ministry of Public Health
                                </div>
                                <div style={{ fontSize: '9px', color: '#9CA3AF' }}>
                                    88/23 หมู่ 4 ถนนติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000 | โทร. 0-2591-7007
                                </div>
                            </div>

                            {/* Document Info Box */}
                            <div style={{ textAlign: 'right', minWidth: '160px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
                                    color: '#fff', padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                                    marginBottom: '8px', borderRadius: '4px'
                                }}>ใบเสนอราคา</div>
                                <div style={{ fontSize: '11px', color: '#374151' }}>เลขที่: <strong>{quoteNumber}</strong></div>
                                <div style={{ fontSize: '10px', color: '#6B7280' }}>วันที่: {currentDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div style={{ fontSize: '10px', color: '#6B7280' }}>อ้างอิง: {renewalId || '-'}</div>
                            </div>
                        </div>

                        {/* === RECIPIENT === */}
                        <div style={{ marginBottom: '20px', padding: '12px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>เรียน / To:</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{certificate?.siteName || 'ผู้ประกอบการ'}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>ใบรับรอง: {certificate?.certificateNumber || '-'}</div>
                        </div>

                        {/* === SUBJECT === */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#374151' }}>
                                <strong>เรื่อง:</strong> ใบเสนอราคาค่าบริการต่ออายุใบรับรองมาตรฐาน GACP
                            </div>
                        </div>

                        {/* === FEE TABLE === */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                            <thead>
                                <tr style={{ background: '#1E3A5F', color: '#FFFFFF' }}>
                                    <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #1E3A5F', width: '50px' }}>ลำดับ</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'left', border: '1px solid #1E3A5F' }}>รายการ</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'center', border: '1px solid #1E3A5F', width: '80px' }}>จำนวน</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', border: '1px solid #1E3A5F', width: '100px' }}>หน่วยละ (บาท)</th>
                                    <th style={{ padding: '10px 8px', textAlign: 'right', border: '1px solid #1E3A5F', width: '100px' }}>จำนวนเงิน (บาท)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>1</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB' }}>ค่าบริการต่ออายุใบรับรองมาตรฐาน GACP<br /><span style={{ fontSize: '10px', color: '#6B7280' }}>(รวมค่าตรวจประเมินและออกใบรับรอง)</span></td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'center' }}>1</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#F3F4F6' }}>
                                    <td colSpan={4} style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 600 }}>รวมทั้งสิ้น</td>
                                    <td style={{ padding: '12px 8px', border: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#1E3A5F' }}>{RENEWAL_FEE.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colSpan={5} style={{ padding: '8px', border: '1px solid #E5E7EB', textAlign: 'center', fontStyle: 'italic', fontSize: '11px', color: '#374151' }}>
                                        (สามหมื่นบาทถ้วน)
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* === VALIDITY & NOTES === */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ flex: 1, padding: '10px', background: '#FEF3C7', borderRadius: '6px', border: '1px solid #F59E0B' }}>
                                <div style={{ fontSize: '10px', color: '#92400E', marginBottom: '2px' }}>ใบเสนอราคานี้มีอายุถึง</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>
                                    {validUntil.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '10px', background: '#DBEAFE', borderRadius: '6px', border: '1px solid #3B82F6' }}>
                                <div style={{ fontSize: '10px', color: '#1E40AF', marginBottom: '2px' }}>ชำระเงินภายใน</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}>7 วัน หลังจากยืนยัน</div>
                            </div>
                        </div>

                        {/* === FOOTER / SIGNATURE === */}
                        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ textAlign: 'center', minWidth: '200px' }}>
                                <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>(ลายมือชื่อ)</span>
                                </div>
                                <div style={{ borderTop: '1px dashed #9CA3AF', paddingTop: '4px', marginTop: '4px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 500, color: '#374151' }}>ผู้มีอำนาจลงนาม</div>
                                    <div style={{ fontSize: '10px', color: '#6B7280' }}>กองกัญชาทางการแพทย์</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => window.print()} style={{
                            flex: 1, padding: '14px', borderRadius: '12px',
                            border: `2px solid ${t.accent}`, background: 'transparent',
                            color: t.accent, fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            🖨️ พิมพ์ใบเสนอราคา
                        </button>
                        <button onClick={handleProceedToInvoice} style={{
                            flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                            background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                            color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}>
                            ยืนยันและออกใบวางบิล →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== STEP: UPLOAD DOCUMENTS ==========
    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <Link href="/certificates" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, textDecoration: 'none', marginBottom: '24px', width: 'fit-content'
                }}>
                    {Icons.back(t.textMuted)} กลับหน้าใบรับรอง
                </Link>

                <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>ต่ออายุใบรับรอง GACP</h1>
                <p style={{ color: t.textMuted, marginBottom: '24px' }}>อัปโหลดเอกสารที่จำเป็นสำหรับการต่ออายุ</p>

                {/* Certificate Info */}
                {certificate && (
                    <div style={{
                        background: t.accentBg, borderRadius: '16px', padding: '20px',
                        border: `1px solid ${t.accent}30`, marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '4px' }}>ใบรับรองเลขที่</p>
                                <p style={{ fontSize: '18px', fontWeight: 600, color: t.accent }}>{certificate.certificateNumber}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '4px' }}>สถานที่</p>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.text }}>{certificate.siteName}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Upload List */}
                <div style={{ background: t.bgCard, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${t.border}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, margin: 0 }}>เอกสารที่ต้องอัปโหลด</h3>
                    </div>

                    {REQUIRED_DOCS.map((doc, index) => (
                        <div key={doc.id} style={{
                            padding: '20px', borderBottom: index < REQUIRED_DOCS.length - 1 ? `1px solid ${t.border}` : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.text, marginBottom: '4px' }}>
                                    {doc.name}
                                    {doc.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
                                </p>
                                {uploadedDocs[doc.id] && (
                                    <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {Icons.check('#10B981')} อัปโหลดแล้ว
                                    </span>
                                )}
                            </div>

                            <label style={{
                                padding: '10px 20px', borderRadius: '10px',
                                border: uploadedDocs[doc.id] ? `1px solid #10B981` : `1px solid ${t.border}`,
                                background: uploadedDocs[doc.id] ? '#ECFDF5' : 'transparent',
                                color: uploadedDocs[doc.id] ? '#10B981' : t.textSecondary,
                                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                opacity: uploading === doc.id ? 0.6 : 1,
                            }}>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={(e) => e.target.files?.[0] && handleUpload(doc.id, e.target.files[0])}
                                    disabled={uploading !== null}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {uploading === doc.id ? (
                                    <>กำลังอัปโหลด...</>
                                ) : uploadedDocs[doc.id] ? (
                                    <>{Icons.check('#10B981')} อัปโหลดแล้ว</>
                                ) : (
                                    <>{Icons.upload(t.textMuted)} เลือกไฟล์</>
                                )}
                            </label>

                            {/* Mock upload button for demo */}
                            {!uploadedDocs[doc.id] && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('[Renewal] Mock upload for:', doc.id);
                                        setUploadedDocs(prev => ({ ...prev, [doc.id]: true }));
                                    }}
                                    style={{
                                        padding: '8px 12px', borderRadius: '8px',
                                        border: `1px dashed ${t.textMuted}`,
                                        background: 'transparent', color: t.textMuted,
                                        fontSize: '11px', cursor: 'pointer', marginLeft: '8px'
                                    }}
                                >
                                    📎 จำลอง
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Fee Notice */}
                <div style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
                    borderRadius: '12px', padding: '16px', marginBottom: '24px',
                    border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <span style={{ fontSize: '24px' }}>💰</span>
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#93C5FD' : '#1D4ED8' }}>
                            ค่าบริการต่ออายุใบรับรอง
                        </p>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>
                            ฿{RENEWAL_FEE.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleProceedToQuotation}
                    disabled={!allRequiredUploaded}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                        background: allRequiredUploaded
                            ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`
                            : t.border,
                        color: allRequiredUploaded ? '#FFF' : t.textMuted,
                        fontSize: '16px', fontWeight: 600, cursor: allRequiredUploaded ? 'pointer' : 'not-allowed',
                    }}
                >
                    ดำเนินการต่อ →
                </button>

                {!allRequiredUploaded && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <p style={{ fontSize: '12px', color: t.textMuted, marginBottom: '8px' }}>
                            กรุณาอัปโหลดเอกสารที่จำเป็นทั้งหมดก่อนดำเนินการต่อ
                        </p>
                        <button
                            onClick={handleSkipUpload}
                            style={{
                                padding: '8px 16px', borderRadius: '8px',
                                border: `1px dashed ${t.textMuted}`,
                                background: 'transparent', color: t.textMuted,
                                fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            ⚡ ข้ามขั้นตอนนี้ (Demo)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
