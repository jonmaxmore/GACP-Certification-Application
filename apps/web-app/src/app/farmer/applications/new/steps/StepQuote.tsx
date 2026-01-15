'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { MockQuotePDF } from './MockQuotePDF';
import { PlatformQuotePDF } from './PlatformQuotePDF';
import Image from 'next/image';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, DocIcon } from '@/components/icons/WizardIcons';

// Fee calculation constants
const GACP_FEES = {
    milestone1: 5000,   // Document Review Fee
    milestone2: 25000,  // On-site Audit Fee
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
    // Memoize or store these in state if they shouldn't change on re-render, 
    // but for now simple vars are okay for this step's lifecycle
    const [dtamQuoteNumber] = useState(`DTAM-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
    const [platformQuoteNumber] = useState(`PLT-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);

    // Calculate fees
    const dtamFee = GACP_FEES.milestone1;
    const platformFee = Math.round(dtamFee * PLATFORM_FEE_PERCENT);
    const totalMilestone1 = dtamFee + platformFee;

    const allAccepted = dtamQuoteAccepted && platformQuoteAccepted;

    const handleProceedToInvoice = () => {
        if (allAccepted) {
            // Save to store
            updateState({
                milestone1: {
                    dtamQuote: { number: dtamQuoteNumber, amount: dtamFee, accepted: true },
                    platformQuote: { number: platformQuoteNumber, amount: platformFee, accepted: true }
                }
            });
            router.push('/farmer/applications/new/step/14'); // Go to Invoice step
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    13
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ใบเสนอราคา (Quotation)</h2>
                    <p className="text-text-secondary">กรุณาตรวจสอบและยอมรับใบเสนอราคาเพื่อดำเนินการต่อ</p>
                </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-teal-200/50 transition-colors duration-700"></div>
                <div className="relative z-10 flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white text-teal-600 flex items-center justify-center shadow-md shrink-0 ring-4 ring-white/50">
                        <DocIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-teal-900 text-xl mb-2">งวดที่ 1: ค่าธรรมเนียมการตรวจสอบเอกสาร</h3>
                        <p className="text-teal-800/80 text-base leading-relaxed max-w-3xl">
                            การชำระเงินแบ่งเป็น 2 งวด โดยงวดแรกจะเป็นค่าธรรมเนียมสำหรับผู้เชี่ยวชาญในการตรวจสอบเอกสารคำขอของท่าน
                            เมื่อชำระแล้วจะเข้าสู่กระบวนการตรวจสอบภายใน <span className="font-bold text-teal-800">5-7 วันทำการ</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Quote Cards Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* DTAM Quote Card */}
                <div className={`
                    gacp-card p-0 overflow-hidden transition-all duration-300 border-2
                    ${dtamQuoteAccepted
                        ? 'border-emerald-500 shadow-green-glow scale-[1.01] bg-emerald-50/20'
                        : 'border-transparent hover:border-emerald-200'
                    }
                `}>
                    <div className="p-8">
                        {dtamQuoteAccepted && (
                            <div className="absolute top-4 right-4 w-10 h-10 bg-success text-white rounded-full flex items-center justify-center shadow-lg animate-scale-in z-20 ring-4 ring-white">
                                <CheckIcon className="w-6 h-6" />
                            </div>
                        )}

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden shrink-0">
                                <span className="text-[10px] text-center font-bold text-gray-400 absolute">DTAM</span>
                                <Image src="/dtam_logo_new.png" alt="DTAM" fill className="object-contain p-1 relative z-10" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-gray-900 leading-tight">ค่าธรรมเนียม GACP</h4>
                                <p className="text-sm text-text-tertiary">กรมการแพทย์แผนไทยฯ</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-gray-600 font-medium">ค่าตรวจเอกสาร (งวด 1)</span>
                                <span className="font-bold text-gray-900 text-xl">฿{dtamFee.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">ยอดรวมสุทธิ</span>
                                <span className="text-3xl font-black text-emerald-600">฿{dtamFee.toLocaleString()}</span>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setShowDtamQuote(true)}
                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-sm font-bold shadow-sm"
                                >
                                    ดูรายละเอียด
                                </button>
                                <button
                                    onClick={() => setDtamQuoteAccepted(!dtamQuoteAccepted)}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${dtamQuoteAccepted
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                        : 'bg-primary text-white hover:bg-primary-600 hover:shadow-primary-200'
                                        }`}
                                >
                                    {dtamQuoteAccepted ? 'ยอมรับแล้ว' : 'ยอมรับใบเสนอราคา'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Quote Card */}
                <div className={`
                    gacp-card p-0 overflow-hidden transition-all duration-300 border-2
                    ${platformQuoteAccepted
                        ? 'border-blue-500 shadow-blue-glow scale-[1.01] bg-blue-50/20'
                        : 'border-transparent hover:border-blue-200'
                    }
                `}>
                    <div className="p-8">
                        {platformQuoteAccepted && (
                            <div className="absolute top-4 right-4 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg animate-scale-in z-20 ring-4 ring-white">
                                <CheckIcon className="w-6 h-6" />
                            </div>
                        )}
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 shrink-0">
                                GP
                            </div>
                            <div>
                                <h4 className="font-bold text-xl text-gray-900 leading-tight">ค่าบริการ Platform</h4>
                                <p className="text-sm text-text-tertiary">บริษัท แกคป์ แพลตฟอร์ม จำกัด</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-gray-600 font-medium">ค่าดำเนินการ (10%)</span>
                                <span className="font-bold text-gray-900 text-xl">฿{platformFee.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">ยอดรวมสุทธิ</span>
                                <span className="text-3xl font-black text-blue-600">฿{platformFee.toLocaleString()}</span>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setShowPlatformQuote(true)}
                                    className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-bold shadow-sm"
                                >
                                    ดูรายละเอียด
                                </button>
                                <button
                                    onClick={() => setPlatformQuoteAccepted(!platformQuoteAccepted)}
                                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${platformQuoteAccepted
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                        : 'bg-primary text-white hover:bg-primary-600 hover:shadow-primary-200'
                                        }`}
                                >
                                    {platformQuoteAccepted ? 'ยอมรับแล้ว' : 'ยอมรับใบเสนอราคา'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Total Summary Footer */}
            <div className={`
                transition-all duration-700 transform ease-spring
                ${allAccepted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-50 grayscale'}
            `}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/30 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:bg-primary/40 transition-colors duration-700"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                        <div>
                            <h4 className="font-bold text-2xl mb-3">สรุปยอดรวมทั้งสิ้น (งวดที่ 1)</h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${dtamQuoteAccepted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 bg-gray-800'}`}>
                                    <div className={`w-2 h-2 rounded-full ${dtamQuoteAccepted ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`}></div>
                                    ค่าธรรมเนียม GACP
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${platformQuoteAccepted ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800'}`}>
                                    <div className={`w-2 h-2 rounded-full ${platformQuoteAccepted ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-gray-600'}`}></div>
                                    ค่าบริการ Platform
                                </div>
                            </div>
                        </div>
                        <div className="text-right bg-white/5 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ยอดชำระรวม</p>
                            <p className="text-5xl font-black tracking-tight text-white drop-shadow-lg">฿{totalMilestone1.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-4">
                <WizardNavigation
                    onNext={handleProceedToInvoice}
                    onBack={() => router.push('/farmer/applications/new/step/12')}
                    isNextDisabled={!allAccepted}
                    nextLabel="ยืนยันและดำเนินการชำระเงิน"
                />
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

export default StepQuote;


