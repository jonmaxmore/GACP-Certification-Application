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
        <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    13
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.quote.title}</h2>
                    <p className="text-slate-500 text-sm">{dict.wizard.quote.subtitle}</p>
                </div>
            </div>

            {/* Instruction Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                    <Icons.Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-lg mb-1">{dict.wizard.quote.milestone1Title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                        {dict.wizard.quote.milestone1Desc}
                    </p>
                </div>
            </div>

            {/* Quote Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>

                {/* DTAM Quote */}
                <div className={`
                    relative p-6 rounded-2xl transition-all duration-300 border bg-white flex flex-col
                    ${dtamQuoteAccepted
                        ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                        : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                    }
                `}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 shadow-sm shrink-0">
                                <div className="w-full h-full relative">
                                    <Image src="/dtam_logo_new.png" alt="DTAM" fill className="object-contain" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{dict.wizard.quote.dtam.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certification Body</p>
                            </div>
                        </div>
                        {dtamQuoteAccepted && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-scale-in">
                                <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                            <span>Fee Description</span>
                            <span>Amount</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-slate-700">{dict.wizard.quote.dtam.feeLabel}</p>
                            <p className="text-lg font-black text-slate-900">฿{dtamFee.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDtamQuote(true)}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Icons.Eye className="w-3.5 h-3.5" />
                            {dict.wizard.quote.buttons.viewDetails}
                        </button>
                        <button
                            onClick={() => setDtamQuoteAccepted(!dtamQuoteAccepted)}
                            className={`
                                flex-1 px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm
                                ${dtamQuoteAccepted
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }
                            `}
                        >
                            {dtamQuoteAccepted ? <CheckIcon className="w-3.5 h-3.5" /> : <Icons.CheckCircle className="w-3.5 h-3.5" />}
                            {dtamQuoteAccepted ? dict.wizard.quote.buttons.accepted : dict.wizard.quote.buttons.accept}
                        </button>
                    </div>
                </div>

                {/* Platform Quote */}
                <div className={`
                    relative p-6 rounded-2xl transition-all duration-300 border bg-white flex flex-col
                    ${platformQuoteAccepted
                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }
                `}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
                                GP
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{dict.wizard.quote.platform.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Software Platform</p>
                            </div>
                        </div>
                        {platformQuoteAccepted && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm animate-scale-in">
                                <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                            <span>Fee Description</span>
                            <span>Amount</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-slate-700">{dict.wizard.quote.platform.feeLabel}</p>
                            <p className="text-lg font-black text-slate-900">฿{platformFee.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPlatformQuote(true)}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Icons.Eye className="w-3.5 h-3.5" />
                            {dict.wizard.quote.buttons.viewDetails}
                        </button>
                        <button
                            onClick={() => setPlatformQuoteAccepted(!platformQuoteAccepted)}
                            className={`
                                flex-1 px-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm
                                ${platformQuoteAccepted
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }
                            `}
                        >
                            {platformQuoteAccepted ? <Icons.CheckCircle className="w-3.5 h-3.5" /> : <Icons.CheckCircle className="w-3.5 h-3.5" />}
                            {platformQuoteAccepted ? dict.wizard.quote.buttons.accepted : dict.wizard.quote.buttons.accept}
                        </button>
                    </div>
                </div>
            </div>

            {/* Net Total Summary */}
            <div className={`
                transition-all duration-500 transform
                ${allAccepted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-50 grayscale'}
            `}>
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-2">
                        <div>
                            <h4 className="text-lg font-bold tracking-tight">{dict.wizard.quote.summary.netTotal}</h4>
                            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Milestone 1: Application & Document Audit</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {dtamQuoteAccepted && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                                    <Icons.CheckCircle className="w-3 h-3" /> DTAM
                                </span>
                            )}
                            {platformQuoteAccepted && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                                    <Icons.CheckCircle className="w-3 h-3" /> Platform
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.wizard.quote.summary.totalLabel}</p>
                        <p className="text-4xl font-black tracking-tight text-white mb-1">฿{totalMilestone1.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">* รวมภาษีมูลค่าเพิ่มแล้ว</p>
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
