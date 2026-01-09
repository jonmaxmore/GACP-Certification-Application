"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';
import { apiClient as api } from '@/lib/api';

const FEE_PER_SITE_TYPE = 5000;

export default function Step12Payment() {
    const router = useRouter();
    const { state, resetWizard, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD'>('QR');
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => { if (isLoaded && !state.siteData && !isNavigating) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router, isNavigating]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount;
    const invoiceId = `GI-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}` : state.applicantData?.applicantType === 'COMMUNITY' ? state.applicantData?.communityName || '' : state.applicantData?.companyName || '';

    const handlePayment = async () => {
        setProcessing(true);
        setIsNavigating(true);
        try {
            const appId = state.applicationId;
            if (!appId) { setProcessing(false); setIsNavigating(false); return; }
            await api.post(`/applications/${appId}/confirm-review`, {});
            await new Promise(resolve => setTimeout(resolve, 2000));
            await api.post(`/applications/${appId}/status`, { status: 'SUBMITTED', notes: 'Demo payment completed' });
            resetWizard();
            router.replace('/applications/new/success');
        } catch { setProcessing(false); setIsNavigating(false); }
    };

    if (!isLoaded) return <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>;

    return (
        <div className="font-sans">
            {/* Official Header Card */}
            <div className="bg-white rounded-xl p-5 mb-4 border border-surface-200 shadow-sm">
                <div className="flex gap-3 items-start mb-4 pb-3 border-b-2 border-slate-800">
                    <img src="/images/dtam-logo.png" alt="DTAM" className="w-12 h-12 object-contain" />
                    <div className="flex-1">
                        <div className="text-[15px] font-bold text-slate-800">กองกัญชาทางการแพทย์</div>
                        <div className="text-xs font-semibold text-slate-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                    </div>
                    <div className="text-right">
                        <div className="bg-primary-600 text-white px-2.5 py-1 rounded text-xs font-semibold">ชำระเงิน</div>
                        <div className="text-[10px] text-slate-500 mt-1">งวดที่ 1</div>
                    </div>
                </div>

                <div className="text-xs mb-3 text-slate-700">
                    <div><strong>ผู้รับบริการ:</strong> {applicantName}</div>
                    <div><strong>เลขที่ใบวางบิล:</strong> {invoiceId}</div>
                    <div><strong>วันที่:</strong> {docDate}</div>
                </div>

                <div className="bg-primary-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between text-sm mb-2"><span className="text-slate-700">ค่าตรวจสอบและประเมินคำขอเบื้องต้น</span><span className="font-semibold text-slate-900">฿{installment1Fee.toLocaleString()}</span></div>
                    <div className="text-[10px] text-slate-500 mb-2">จำนวน {siteTypesCount} ลักษณะพื้นที่ × ฿5,000</div>
                    <div className="border-t border-primary-200 pt-2 flex justify-between"><span className="text-sm font-semibold text-primary-800">ยอดชำระงวดที่ 1</span><span className="text-xl font-bold text-primary-600">฿{installment1Fee.toLocaleString()}</span></div>
                </div>
                <div className="text-[11px] text-blue-700 text-center">({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})</div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
                <div className={`text-sm font-semibold mb-2.5 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>เลือกช่องทางชำระเงิน</div>
                <div className="grid grid-cols-2 gap-2.5">
                    {(['QR', 'CARD'] as const).map(method => (
                        <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-xl text-center border-2 ${paymentMethod === method ? 'border-primary-600 bg-primary-50' : (isDark ? 'border-slate-600 bg-slate-700' : 'border-surface-200 bg-white')}`}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-1.5">{method === 'QR' ? <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></> : <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>}</svg>
                            <div className={`text-sm font-semibold ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{method === 'QR' ? 'QR PromptPay' : 'บัตรเครดิต/เดบิต'}</div>
                            <div className="text-[10px] text-slate-500">{method === 'QR' ? 'สะดวก รวดเร็ว' : 'Visa / MasterCard'}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* QR Code */}
            {paymentMethod === 'QR' && (
                <div className="bg-white rounded-xl p-5 mb-4 text-center border border-surface-200">
                    <div className="text-xs text-slate-700 font-semibold mb-3">สแกน QR Code เพื่อชำระเงิน</div>
                    <div className="w-44 h-44 bg-surface-100 rounded-xl mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-surface-300">
                        <div className="text-center text-slate-500"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-1"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg><div className="text-[11px]">QR Code</div></div>
                    </div>
                    <div className="text-[11px] text-slate-700 bg-secondary-50 p-2.5 rounded-md"><strong>โอนเข้าบัญชี:</strong><br />ชื่อบัญชี: เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร<br />ธ.กรุงไทย เลขที่ <strong>4750134376</strong></div>
                </div>
            )}

            {/* Card Form */}
            {paymentMethod === 'CARD' && (
                <div className={`rounded-xl p-4 mb-4 border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-surface-200'}`}>
                    <div className="mb-3">
                        <label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>หมายเลขบัตร</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-surface-100' : 'bg-surface-100 border-surface-200 text-slate-900'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div><label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>วันหมดอายุ</label><input type="text" placeholder="MM/YY" className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-surface-100' : 'bg-surface-100 border-surface-200 text-slate-900'}`} /></div>
                        <div><label className={`text-[11px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CVV</label><input type="text" placeholder="123" className={`w-full p-3 rounded-lg border text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-surface-100' : 'bg-surface-100 border-surface-200 text-slate-900'}`} /></div>
                    </div>
                </div>
            )}

            {/* Security */}
            <div className="text-[10px] text-slate-500 text-center mb-4 flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                การชำระเงินปลอดภัยด้วยระบบเข้ารหัส SSL
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button onClick={() => router.push('/applications/new/step-11')} disabled={processing} className={`flex-1 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 bg-slate-700 text-surface-100' : 'border-surface-200 bg-white text-slate-700'} ${processing ? 'opacity-50' : ''}`}>ย้อนกลับ</button>
                <button onClick={handlePayment} disabled={processing} className={`flex-[2] py-3.5 rounded-xl text-sm font-semibold ${processing ? 'bg-slate-400 cursor-wait' : 'bg-gradient-to-br from-primary-700 to-primary-500 shadow-lg shadow-primary-500/40'} text-white`}>
                    {processing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> กำลังดำเนินการ...</> : `ยืนยันชำระเงิน ฿${installment1Fee.toLocaleString()}`}
                </button>
            </div>
        </div>
    );
}
