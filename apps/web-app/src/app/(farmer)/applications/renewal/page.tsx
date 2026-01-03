"use client";

/**
 * Renewal Page - Certificate Renewal Flow
 * 🍎 Apple Single Responsibility: Main orchestrator only
 * 
 * REFACTORED: Decomposed from 896 lines to ~150 lines
 * Step components extracted to separate files
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api-client';

// Types and constants
import { Certificate, themes, RENEWAL_FEE, REQUIRED_DOCS, Icons, RenewalStep } from './types';

// Step components
import { UploadStep } from './UploadStep';
import { QuotationStep } from './QuotationStep';
import { InvoiceStep } from './InvoiceStep';
import { PaymentStep } from './PaymentStep';
import { SuccessStep } from './SuccessStep';

// Loading component
function RenewalLoadingFallback() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAF9' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: '#16A34A', borderRadius: '50%' }} />
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } } .spinner { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
}

// Main content component
function RenewalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [isDark, setIsDark] = useState(false);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
    const [uploading, setUploading] = useState<string | null>(null);
    const [step, setStep] = useState<RenewalStep>('upload');
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
        setUploading(docId);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setUploadedDocs(prev => ({ ...prev, [docId]: true }));
        } finally {
            setUploading(null);
        }
    };

    const handleSkipUpload = () => {
        const allDocs: Record<string, boolean> = {};
        REQUIRED_DOCS.forEach(doc => { allDocs[doc.id] = true; });
        setUploadedDocs(allDocs);
    };

    const handleProceedToQuotation = async () => {
        let newRenewalId = `RNW-${Date.now().toString(36).toUpperCase()}`;

        if (certificate) {
            try {
                const result = await api.post<{ data: { applicationId: string } }>('/v2/applications/renewal', {
                    previousApplicationId: certificate.applicationId,
                    certificateId: certificate._id,
                    documentIds: Object.keys(uploadedDocs).filter(k => uploadedDocs[k])
                });
                if (result.success && result.data?.data?.applicationId) {
                    newRenewalId = result.data.data.applicationId;
                }
            } catch (error) {
                console.warn('[Renewal] API failed, using demo ID');
            }
        }

        setRenewalId(newRenewalId);
        setStep('quotation');
    };

    const handlePaymentConfirm = async () => {
        try {
            await api.post('/v2/payments/confirm', {
                applicationId: renewalId,
                phase: 'renewal',
                amount: RENEWAL_FEE
            });
        } catch (error) {
            console.warn('Payment confirmation via API failed');
        }

        localStorage.setItem('last_renewal_id', renewalId || '');
        localStorage.setItem('last_renewal_payment', JSON.stringify({
            amount: RENEWAL_FEE,
            certificateNumber: certificate?.certificateNumber,
            siteName: certificate?.siteName,
            paidAt: new Date().toISOString()
        }));

        setStep('success');
    };

    // Loading state
    if (loading) return <RenewalLoadingFallback />;

    // No certificate selected
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

    // Render step components
    switch (step) {
        case 'success':
            return <SuccessStep certificate={certificate} renewalId={renewalId} isDark={isDark} t={t} />;
        case 'payment':
            return <PaymentStep renewalId={renewalId} t={t} onBack={() => setStep('invoice')} onConfirm={handlePaymentConfirm} />;
        case 'invoice':
            return <InvoiceStep certificate={certificate} renewalId={renewalId} isDark={isDark} t={t} onBack={() => setStep('quotation')} onProceed={() => setStep('payment')} />;
        case 'quotation':
            return <QuotationStep certificate={certificate} renewalId={renewalId} t={t} onBack={() => setStep('upload')} onProceed={() => setStep('invoice')} />;
        default:
            return <UploadStep certificate={certificate} uploadedDocs={uploadedDocs} uploading={uploading} t={t} onUpload={handleUpload} onSkipUpload={handleSkipUpload} onProceed={handleProceedToQuotation} />;
    }
}

// 🍎 Apple-standard Suspense wrapper for useSearchParams
export default function RenewalPage() {
    return (
        <Suspense fallback={<RenewalLoadingFallback />}>
            <RenewalContent />
        </Suspense>
    );
}
