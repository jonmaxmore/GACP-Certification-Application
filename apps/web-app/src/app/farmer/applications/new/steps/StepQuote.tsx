'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { MockQuotePDF } from './MockQuotePDF';
import { PlatformQuotePDF } from './PlatformQuotePDF';
import Image from 'next/image';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, DocIcon, InfoIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const GACP_FEES = {
    milestone1: 5000,
    milestone2: 25000,
};

const PLATFORM_FEE_PERCENT = 0.10;

export const StepQuote = () => {
    const { state, updateState } = useWizardStore();
    const router = useRouter();
    const { dict, language } = useLanguage();

    const [dtamQuoteAccepted, setDtamQuoteAccepted] = useState(false);
    const [platformQuoteAccepted, setPlatformQuoteAccepted] = useState(false);
    const [showDtamQuote, setShowDtamQuote] = useState(false);
    const [showPlatformQuote, setShowPlatformQuote] = useState(false);

    const [quoteDate] = useState(() => new Date().toISOString());
    const [dtamQuoteNumber] = useState(() => `DTAM-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);
    const [platformQuoteNumber] = useState(() => `PLT-QT-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`);

    const dtamFee = GACP_FEES.milestone1;
    const platformFee = Math.round(dtamFee * PLATFORM_FEE_PERCENT);
    const totalMilestone1 = dtamFee + platformFee;

    const allAccepted = dtamQuoteAccepted && platformQuoteAccepted;

    const handleProceedToInvoice = () => {
        if (allAccepted) {
            updateState({
                milestone1: {
                    dtamQuote: { number: dtamQuoteNumber, amount: dtamFee, accepted: true },
                    platformQuote: { number: platformQuoteNumber, amount: platformFee, accepted: true }
                }
            });
            router.push('/farmer/applications/new/step/14');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    13
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.quote.title}</h2>
                    <p className="text-text-secondary">{dict.wizard.quote.subtitle}</p>
                </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2.5rem] p-10 shadow-soft relative overflow-hidden group animate-slide-up">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-all duration-1000"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-white text-primary flex items-center justify-center shadow-premium-hover shrink-0 scale-110 md:scale-100">
                        <Icons.Calculator className="w-10 h-10" />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-primary-900 text-2xl mb-3 tracking-tight">{dict.wizard.quote.milestone1Title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
                            {dict.wizard.quote.milestone1Desc}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quote Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>

                {/* DTAM Quote */}
                <div className={`
                    relative gacp-card p-8 transition-all duration-500 border-2 overflow-hidden group
                    ${dtamQuoteAccepted
                        ? 'border-emerald-500 bg-emerald-50/10 shadow-emerald-100'
                        : 'border-white bg-white hover:border-primary/20 hover:shadow-premium'
                    }
                `}>
                    {dtamQuoteAccepted && (
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
                    )}

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2 shadow-sm overflow-hidden relative">
                                <Image src="/dtam_logo_new.png" alt="DTAM" fill className="object-contain p-2" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg leading-none">{dict.wizard.quote.dtam.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Certification Body</p>
                            </div>
                        </div>
                        {dtamQuoteAccepted && (
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-scale-in">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50 mb-8 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Fee Description</span>
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-700">{dict.wizard.quote.dtam.feeLabel}</p>
                            <p className="text-xl font-black text-gray-900">฿{dtamFee.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-baseline mb-2 px-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quote Total</span>
                            <span className={`text-4xl font-black transition-colors ${dtamQuoteAccepted ? 'text-emerald-600' : 'text-gray-900'}`}>
                                ฿{dtamFee.toLocaleString()}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDtamQuote(true)}
                                className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Icons.Eye className="w-4 h-4" />
                                {dict.wizard.quote.buttons.viewDetails}
                            </button>
                            <button
                                onClick={() => setDtamQuoteAccepted(!dtamQuoteAccepted)}
                                className={`
                                    px-4 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm
                                    ${dtamQuoteAccepted
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-primary text-white hover:shadow-premium'
                                    }
                                `}
                            >
                                {dtamQuoteAccepted ? <CheckIcon className="w-4 h-4" /> : <Icons.CheckCircle className="w-4 h-4" />}
                                {dtamQuoteAccepted ? dict.wizard.quote.buttons.accepted : dict.wizard.quote.buttons.accept}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Platform Quote */}
                <div className={`
                    relative gacp-card p-8 transition-all duration-500 border-2 overflow-hidden group
                    ${platformQuoteAccepted
                        ? 'border-blue-500 bg-blue-50/10 shadow-blue-100'
                        : 'border-white bg-white hover:border-primary/20 hover:shadow-premium'
                    }
                `}>
                    {platformQuoteAccepted && (
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                    )}

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                                GP
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-lg leading-none">{dict.wizard.quote.platform.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Software Platform</p>
                            </div>
                        </div>
                        {platformQuoteAccepted && (
                            <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg animate-scale-in">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50 mb-8 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Fee Description</span>
                            <span className="text-gray-400 font-bold uppercase tracking-widest">Amount</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-700">{dict.wizard.quote.platform.feeLabel}</p>
                            <p className="text-xl font-black text-gray-900">฿{platformFee.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-baseline mb-2 px-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quote Total</span>
                            <span className={`text-4xl font-black transition-colors ${platformQuoteAccepted ? 'text-blue-600' : 'text-gray-900'}`}>
                                ฿{platformFee.toLocaleString()}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowPlatformQuote(true)}
                                className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Icons.Eye className="w-4 h-4" />
                                {dict.wizard.quote.buttons.viewDetails}
                            </button>
                            <button
                                onClick={() => setPlatformQuoteAccepted(!platformQuoteAccepted)}
                                className={`
                                    px-4 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm
                                    ${platformQuoteAccepted
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-primary text-white hover:shadow-premium'
                                    }
                                `}
                            >
                                {platformQuoteAccepted ? <Icons.CheckCircle className="w-4 h-4" /> : <Icons.CheckCircle className="w-4 h-4" />}
                                {platformQuoteAccepted ? dict.wizard.quote.buttons.accepted : dict.wizard.quote.buttons.accept}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Total Summary */}
            <div className={`
                transition-all duration-700 transform px-2
                ${allAccepted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-40 grayscale'}
            `}>
                <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="space-y-6 text-center md:text-left">
                            <div>
                                <h4 className="text-2xl font-black tracking-tight mb-2">{dict.wizard.quote.summary.netTotal}</h4>
                                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Milestone 1: Application & Document Audit</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${dtamQuoteAccepted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                    <Icons.CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">DTAM Accepted</span>
                                </div>
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${platformQuoteAccepted ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                    <Icons.CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Platform Accepted</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2 bg-white/5 p-8 rounded-[2rem] border border-white/10 min-w-[280px]">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{dict.wizard.quote.summary.totalLabel}</p>
                            <p className="text-6xl font-black tracking-tighter shadow-primary drop-shadow-2xl">฿{totalMilestone1.toLocaleString()}</p>
                            <p className="text-[10px] text-white/30 font-medium">* รวมภาษีมูลค่าเพิ่มแล้ว</p>
                        </div>
                    </div>
                </div>
            </div>

            <WizardNavigation
                onNext={handleProceedToInvoice}
                onBack={() => router.push('/farmer/applications/new/step/12')}
                isNextDisabled={!allAccepted}
                nextLabel="ไปที่ขั้นตอนการชำระเงิน"
            />

            {showDtamQuote && <MockQuotePDF onClose={() => setShowDtamQuote(false)} />}
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
                    items={[{ description: 'ค่าบริการดำเนินการ GACP (งวดที่ 1)', descriptionEN: 'Platform Service Fee - Milestone 1', amount: platformFee }]}
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
