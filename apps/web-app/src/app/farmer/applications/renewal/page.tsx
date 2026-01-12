"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient as api } from '@/lib/api';
import { Certificate, RENEWAL_FEE, REQUIRED_DOCS, RenewalStep } from './types';
import { UploadStep } from './UploadStep';
import { QuotationStep } from './QuotationStep';
import { InvoiceStep } from './InvoiceStep';
import { PaymentStep } from './PaymentStep';
import { SuccessStep } from './SuccessStep';

function RenewalLoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-slate-900">
            <div className="w-10 h-10 border-[3px] border-surface-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );
}

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

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; return; }
        if (certId) loadCertificate(certId);
        else setLoading(false);
    }, [certId]);

    const loadCertificate = async (id: string) => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Certificate }>(`/api/certificates/${id}`);
            if (result.success && result.data?.data) setCertificate(result.data.data);
        } catch { console.error('Failed to load certificate'); }
        finally { setLoading(false); }
    };

    const handleUpload = async (docId: string, file: File) => {
        setUploading(docId);
        try { await new Promise(resolve => setTimeout(resolve, 500)); setUploadedDocs(prev => ({ ...prev, [docId]: true })); }
        finally { setUploading(null); }
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
                const result = await api.post<{ data: { applicationId: string } }>('/api/applications/renewal', { previousApplicationId: certificate.applicationId, certificateId: certificate._id, documentIds: Object.keys(uploadedDocs).filter(k => uploadedDocs[k]) });
                if (result.success && result.data?.data?.applicationId) newRenewalId = result.data.data.applicationId;
            } catch { console.warn('[Renewal] API failed, using demo ID'); }
        }
        setRenewalId(newRenewalId);
        setStep('quotation');
    };

    const handlePaymentConfirm = async () => {
        try { await api.post('/api/payments/confirm', { applicationId: renewalId, phase: 'renewal', amount: RENEWAL_FEE }); }
        catch { console.warn('Payment confirmation failed'); }
        localStorage.setItem('last_renewal_id', renewalId || '');
        localStorage.setItem('last_renewal_payment', JSON.stringify({ amount: RENEWAL_FEE, certificateNumber: certificate?.certificateNumber, siteName: certificate?.siteName, paidAt: new Date().toISOString() }));
        setStep('success');
    };

    if (loading) return <RenewalLoadingFallback />;

    if (!certificate && !certId) {
        return (
            <div className={`min-h-screen p-8 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
                <div className="max-w-xl mx-auto text-center pt-16">
                    <div className={`w-20 h-20 rounded-2xl inline-flex items-center justify-center mb-6 ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#34D399' : '#16A34A'} strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                    </div>
                    <h1 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ต่ออายุใบรับรอง GACP</h1>
                    <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กรุณาเลือกใบรับรองที่ต้องการต่ออายุจากหน้าใบรับรอง</p>
                    <Link href="/certificates" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/40">ไปหน้าใบรับรอง</Link>
                </div>
            </div>
        );
    }

    switch (step) {
        case 'success': return <SuccessStep certificate={certificate} renewalId={renewalId} isDark={isDark} />;
        case 'payment': return <PaymentStep renewalId={renewalId} isDark={isDark} onBack={() => setStep('invoice')} onConfirm={handlePaymentConfirm} />;
        case 'invoice': return <InvoiceStep certificate={certificate} renewalId={renewalId} isDark={isDark} onBack={() => setStep('quotation')} onProceed={() => setStep('payment')} />;
        case 'quotation': return <QuotationStep certificate={certificate} renewalId={renewalId} isDark={isDark} onBack={() => setStep('upload')} onProceed={() => setStep('invoice')} />;
        default: return <UploadStep certificate={certificate} uploadedDocs={uploadedDocs} uploading={uploading} isDark={isDark} onUpload={handleUpload} onSkipUpload={handleSkipUpload} onProceed={handleProceedToQuotation} />;
    }
}

export default function RenewalPage() {
    return <Suspense fallback={<RenewalLoadingFallback />}><RenewalContent /></Suspense>;
}
