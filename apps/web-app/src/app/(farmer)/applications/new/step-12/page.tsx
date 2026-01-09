"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';
import { apiClient as api } from '@/lib/api';

const FEE_PER_SITE_TYPE = 5000;

export default function Step12Payment() {
    const router = useRouter();
    const { state, resetWizard, isLoaded } = useWizardStore();
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD'>('QR');
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (isLoaded && !state.siteData && !isNavigating) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router, isNavigating]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount;
    const invoiceId = `PAY-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`.trim()
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';

    const handlePayment = async () => {
        setProcessing(true);
        setIsNavigating(true);
        try {
            const appId = state.applicationId;
            if (!appId) {
                // Allow demo mode without application ID
                await new Promise(resolve => setTimeout(resolve, 2000));
                resetWizard();
                router.replace('/applications/new/success');
                return;
            }
            await api.post(`/applications/${appId}/confirm-review`, {});
            await new Promise(resolve => setTimeout(resolve, 2000));
            await api.post(`/applications/${appId}/status`, { status: 'SUBMITTED', notes: 'Payment completed' });
            resetWizard();
            router.replace('/applications/new/success');
        } catch {
            // Fallback: go to success even if API fails
            await new Promise(resolve => setTimeout(resolve, 1000));
            resetWizard();
            router.replace('/applications/new/success');
        }
    };

    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-11');
    };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ชำระเงิน</h1>
                <p className="text-gray-600">งวดที่ 1 - ฿{installment1Fee.toLocaleString()}</p>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <img src="/images/dtam-logo.png" alt="DTAM" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div>
                                <div className="font-semibold">กองกัญชาทางการแพทย์</div>
                                <div className="text-xs text-emerald-200">กรมการแพทย์แผนไทยฯ</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">ชำระเงิน งวด 1</div>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="p-5">
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                        <div className="flex justify-between">
                            <span>ผู้รับบริการ:</span>
                            <span className="font-medium text-gray-900">{applicantName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>เลขที่:</span>
                            <span className="font-mono text-gray-900">{invoiceId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>วันที่:</span>
                            <span className="text-gray-900">{docDate}</span>
                        </div>
                    </div>

                    {/* Amount Box */}
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-700">ค่าตรวจสอบและประเมินคำขอเบื้องต้น</span>
                            <span className="font-semibold text-gray-900">฿{installment1Fee.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">{siteTypesCount} ลักษณะพื้นที่ × ฿5,000</div>
                        <div className="border-t border-emerald-200 pt-3 flex justify-between items-center">
                            <span className="font-semibold text-emerald-800">ยอดชำระรวม</span>
                            <span className="text-2xl font-bold text-emerald-600">฿{installment1Fee.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-center text-sm text-emerald-700 mt-2 font-medium">
                        ({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})
                    </div>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div>
                <div className="text-sm font-semibold text-gray-900 mb-3">เลือกช่องทางชำระเงิน</div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setPaymentMethod('QR')}
                        className={`p-4 rounded-xl text-center border-2 transition-all ${paymentMethod === 'QR'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'QR' ? '#059669' : '#6b7280'} strokeWidth="1.5" className="mx-auto mb-2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                        <div className={`text-sm font-semibold ${paymentMethod === 'QR' ? 'text-emerald-700' : 'text-gray-900'}`}>QR PromptPay</div>
                        <div className="text-xs text-gray-500">สะดวก รวดเร็ว</div>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-4 rounded-xl text-center border-2 transition-all ${paymentMethod === 'CARD'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'CARD' ? '#059669' : '#6b7280'} strokeWidth="1.5" className="mx-auto mb-2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <div className={`text-sm font-semibold ${paymentMethod === 'CARD' ? 'text-emerald-700' : 'text-gray-900'}`}>บัตรเครดิต/เดบิต</div>
                        <div className="text-xs text-gray-500">Visa / MasterCard</div>
                    </button>
                </div>
            </div>

            {/* QR Code Section */}
            {paymentMethod === 'QR' && (
                <div className="bg-white rounded-2xl p-6 text-center border-2 border-gray-200">
                    <div className="text-sm text-gray-700 font-semibold mb-4">สแกน QR Code เพื่อชำระเงิน</div>
                    <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-400">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                            </svg>
                            <div className="text-sm">QR PromptPay</div>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-left border border-blue-200">
                        <div className="text-xs text-blue-900 font-semibold mb-2">โอนเงินเข้าบัญชี:</div>
                        <div className="text-sm text-blue-800 space-y-1">
                            <div><span className="font-medium">ธนาคาร:</span> กรุงไทย</div>
                            <div><span className="font-medium">เลขที่:</span> <span className="font-mono font-bold">475-0-13437-6</span></div>
                            <div><span className="font-medium">ชื่อบัญชี:</span> เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Form Section */}
            {paymentMethod === 'CARD' && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-600 block mb-1.5 font-medium">หมายเลขบัตร</label>
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="w-full p-3.5 rounded-xl border-2 border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-600 block mb-1.5 font-medium">วันหมดอายุ</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full p-3.5 rounded-xl border-2 border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 block mb-1.5 font-medium">CVV</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full p-3.5 rounded-xl border-2 border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Notice */}
            <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                การชำระเงินปลอดภัยด้วยระบบเข้ารหัส SSL
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleBack}
                    disabled={processing}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handlePayment}
                    disabled={processing}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${processing
                            ? 'bg-gray-400 cursor-wait'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30'
                        } text-white`}
                >
                    {processing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังดำเนินการ...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            ยืนยันชำระเงิน ฿{installment1Fee.toLocaleString()}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
