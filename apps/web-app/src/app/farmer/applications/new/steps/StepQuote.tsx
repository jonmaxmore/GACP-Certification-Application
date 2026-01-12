'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { MockQuotePDF } from './MockQuotePDF';
import { PlatformQuotePDF } from './PlatformQuotePDF';

// Fee calculation constants
const GACP_FEES = {
    milestone1: 5000,   // ค่าตรวจเอกสาร (กรมแพทย์แผนไทยฯ)
    milestone2: 25000,  // ค่าลงพื้นที่ (กรมแพทย์แผนไทยฯ)
};

const PLATFORM_FEE_PERCENT = 0.10; // 10%

export const StepQuote = () => {
    const { state, updateState } = useWizardStore();
    const router = useRouter();

    // Quote acceptance states (separate for each provider)
    const [dtamQuoteAccepted, setDtamQuoteAccepted] = useState(false);
    const [platformQuoteAccepted, setPlatformQuoteAccepted] = useState(false);

    // Preview modal states
    const [showDtamQuote, setShowDtamQuote] = useState(false);
    const [showPlatformQuote, setShowPlatformQuote] = useState(false);

    const quoteDate = new Date().toISOString();
    const dtamQuoteNumber = `DTAM-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    const platformQuoteNumber = `PLT-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Calculate fees
    const dtamFee = GACP_FEES.milestone1;
    const platformFee = Math.round(dtamFee * PLATFORM_FEE_PERCENT);
    const totalMilestone1 = dtamFee + platformFee;

    const allAccepted = dtamQuoteAccepted && platformQuoteAccepted;

    const handleProceedToInvoice = () => {
        if (allAccepted) {
            // Save to store
            updateState({
                // @ts-ignore
                milestone1: {
                    dtamQuote: { number: dtamQuoteNumber, amount: dtamFee, accepted: true },
                    platformQuote: { number: platformQuoteNumber, amount: platformFee, accepted: true }
                }
            });
            router.push('/farmer/applications/new/step/10'); // Go to Invoice step
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    ใบเสนอราคา - งวดที่ 1
                </h2>
                <p className="text-gray-500 mt-2">กรุณาตรวจสอบและยอมรับใบเสนอราคาทั้ง 2 ใบ เพื่อดำเนินการต่อ</p>
            </div>

            {/* Milestone Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                    📋 งวดที่ 1: ค่าตรวจเอกสาร (Document Review)
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                    หลังจากยอมรับใบเสนอราคาและชำระเงินแล้ว ทีมงานจะตรวจสอบเอกสารภายใน 5-7 วันทำการ
                </p>
            </div>

            {/* Two Quote Cards Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* DTAM Quote Card */}
                <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${dtamQuoteAccepted ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'
                    }`}>
                    <div className="flex items-start gap-4 mb-4">
                        <img src="/dtam_logo_new.png" alt="DTAM" className="w-12 h-12 object-contain" />
                        <div>
                            <h4 className="font-bold text-slate-800">ค่าธรรมเนียม GACP</h4>
                            <p className="text-xs text-slate-500">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">ค่าตรวจเอกสาร (งวด 1)</span>
                            <span className="font-semibold text-slate-800">฿{dtamFee.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-emerald-700">รวม:</span>
                            <span className="text-2xl font-bold text-emerald-700">฿{dtamFee.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDtamQuote(true)}
                                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                            >
                                📄 ดูใบเสนอราคา
                            </button>
                            <button
                                onClick={() => setDtamQuoteAccepted(!dtamQuoteAccepted)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${dtamQuoteAccepted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                                    }`}
                            >
                                {dtamQuoteAccepted ? '✓ ยอมรับแล้ว' : 'ยอมรับ'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Platform Quote Card */}
                <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm transition-all ${platformQuoteAccepted ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200'
                    }`}>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                            GP
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">ค่าบริการ Platform</h4>
                            <p className="text-xs text-slate-500">บริษัท แกคป์ แพลตฟอร์ม จำกัด</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">ค่าดำเนินการ (10%)</span>
                            <span className="font-semibold text-slate-800">฿{platformFee.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-teal-700">รวม:</span>
                            <span className="text-2xl font-bold text-teal-700">฿{platformFee.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPlatformQuote(true)}
                                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                            >
                                📄 ดูใบเสนอราคา
                            </button>
                            <button
                                onClick={() => setPlatformQuoteAccepted(!platformQuoteAccepted)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${platformQuoteAccepted
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-teal-100'
                                    }`}
                            >
                                {platformQuoteAccepted ? '✓ ยอมรับแล้ว' : 'ยอมรับ'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-slate-800">รวมทั้งสิ้น (งวดที่ 1)</h4>
                        <p className="text-xs text-slate-500">ต้องยอมรับทั้ง 2 ใบ จึงจะดำเนินการต่อได้</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-slate-800">฿{totalMilestone1.toLocaleString()}</p>
                        <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${dtamQuoteAccepted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                {dtamQuoteAccepted ? '✓ DTAM' : '○ DTAM'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${platformQuoteAccepted ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>
                                {platformQuoteAccepted ? '✓ Platform' : '○ Platform'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => router.push('/farmer/applications/new/step/8')}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={handleProceedToInvoice}
                    disabled={!allAccepted}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${allAccepted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ดำเนินการชำระเงิน →
                </button>
            </div>

            {/* DTAM Quote Preview Modal */}
            {showDtamQuote && (
                <MockQuotePDF onClose={() => setShowDtamQuote(false)} />
            )}

            {/* Platform Quote Preview Modal */}
            {showPlatformQuote && (
                <PlatformQuotePDF
                    quoteNumber={platformQuoteNumber}
                    date={quoteDate}
                    customer={{
                        name: state.applicantData?.firstName
                            ? `${state.applicantData.firstName} ${state.applicantData.lastName || ''}`
                            : 'ผู้ยื่นคำขอ GACP',
                        address: state.applicantData?.address,
                        phone: state.applicantData?.phone,
                    }}
                    items={[
                        {
                            description: 'ค่าบริการดำเนินการ GACP (งวดที่ 1)',
                            descriptionEN: 'Platform Service Fee - Milestone 1',
                            amount: platformFee,
                        }
                    ]}
                    total={platformFee}
                    status="PENDING"
                    validDays={30}
                    onClose={() => setShowPlatformQuote(false)}
                />
            )}
        </div>
    );
};
