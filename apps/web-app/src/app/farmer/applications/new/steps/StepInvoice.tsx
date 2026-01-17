'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import Image from 'next/image';
import { ApplicationService, Application } from '@/lib/services/application-service';
import { apiClient } from '@/lib/api/api-client';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { SecureIcon, InfoIcon, CheckIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { InvoicePDF } from './InvoicePDF';

export const StepInvoice = () => {
    const { setCurrentStep, state } = useWizardStore();
    const router = useRouter();
    const { dict, language } = useLanguage();
    const [showQrModal, setShowQrModal] = useState(false);
    const [showInvoicePdf, setShowInvoicePdf] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [appData, setAppData] = useState<Application | null>(null);
    const [phase, setPhase] = useState<1 | 2>(1);

    const [invoiceNumber] = useState(() => `INV-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`);
    const [currentDate] = useState(() => new Date());
    const [dueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
    });

    const [invoiceItems, setInvoiceItems] = useState<{ label: string; amount: number }[]>([]);

    useEffect(() => {
        const fetchApp = async () => {
            const res = await ApplicationService.getMyApplications();
            if (res.success && res.data) {
                const apps: Application[] = Array.isArray(res.data)
                    ? res.data
                    : (res.data as unknown as { data: Application[] })?.data || [];
                const activeApp = apps[0];
                if (activeApp) {
                    setAppData(activeApp);
                    let currentPhase: 1 | 2 = 1;
                    if (activeApp.status === 'PAYMENT_2_PENDING') {
                        currentPhase = 2;
                    }
                    setPhase(currentPhase);

                    const feeData = activeApp.fees || {};
                    const phaseData = currentPhase === 1 ? feeData.phase1 : feeData.phase2;

                    if (phaseData && phaseData.items) {
                        setInvoiceItems(phaseData.items.map((i) => ({
                            label: i.description,
                            amount: i.amount
                        })));
                    } else {
                        // Use values from state.milestone1 if available (from StepQuote)
                        if (currentPhase === 1 && state.milestone1) {
                            const items = [];
                            if (state.milestone1.dtamQuote) items.push({ label: dict.wizard.quote.dtam.title, amount: state.milestone1.dtamQuote.amount });
                            if (state.milestone1.platformQuote) items.push({ label: dict.wizard.quote.platform.title, amount: state.milestone1.platformQuote.amount });
                            setInvoiceItems(items);
                        } else {
                            // Fallback
                            if (currentPhase === 1) {
                                setInvoiceItems([
                                    { label: dict.wizard.invoice.items.standardFee, amount: 5000 },
                                    { label: 'Platform Service Fee', amount: 500 }
                                ]);
                            } else {
                                setInvoiceItems([
                                    { label: dict.wizard.invoice.items.auditFee, amount: 25000 }
                                ]);
                            }
                        }
                    }
                    setCurrentStep(13); // Step 14 = index 13
                }
            }
        };
        fetchApp();
    }, [setCurrentStep, dict, state.milestone1]);

    const handlePayClick = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowQrModal(true);
        }, 800);
    };

    const handlePaymentSuccess = async () => {
        setIsProcessing(true);
        try {
            if (appData && appData._id) {
                const total = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
                await apiClient.post(`/applications/${appData._id}/payment`, {
                    phase: phase,
                    amount: total,
                    method: 'QR_CASH'
                });
            }

            setTimeout(() => {
                if (phase === 2) {
                    router.push('/farmer/dashboard');
                } else {
                    router.push('/farmer/applications/new/step/15');
                }
            }, 1000);
        } catch (error) {
            console.error("Payment Error", error);
            alert("Payment failed");
            setIsProcessing(false);
        }
    };

    const totalAmount = invoiceItems.reduce((acc, item) => acc + item.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    14
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">
                        {phase === 1 ? dict.wizard.invoice.phase1Title : dict.wizard.invoice.phase2Title}
                    </h2>
                    <p className="text-slate-500 text-sm">ใบแจ้งชำระเงินสำหรับการพิจารณามาตรฐาน GACP</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: The Invoice Paper */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative animate-slide-up">
                        {/* Header Bar */}
                        <div className="h-2 bg-emerald-500 w-full"></div>

                        <div className="p-8">
                            {/* Letterhead */}
                            <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 mb-8 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-white rounded-xl border border-slate-100 flex items-center justify-center p-2 relative shrink-0">
                                        <Image src="/dtam_logo_new.png" alt="DTAM" fill className="object-contain p-1" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-slate-900 leading-tight">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Ministry of Public Health, Thailand</p>
                                        <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs">{dict.wizard.invoice.paper.orgAddress}</p>
                                    </div>
                                </div>
                                <div className="text-right w-full md:w-auto space-y-4">
                                    <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                                        {dict.wizard.invoice.paper.invoiceTitle}
                                    </span>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs text-slate-500">
                                            <span className="font-bold uppercase text-slate-400 mr-2">{dict.wizard.invoice.paper.no}</span>
                                            <span className="font-mono text-slate-900">{invoiceNumber}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            <span className="font-bold uppercase text-slate-400 mr-2">{dict.wizard.invoice.paper.date}</span>
                                            <span>{currentDate.toLocaleDateString('th-TH')}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            <span className="font-bold uppercase text-slate-400 mr-2">{dict.wizard.invoice.paper.dueDate}</span>
                                            <span className="text-red-500 font-bold">{dueDate.toLocaleDateString('th-TH')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Billing Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.wizard.invoice.paper.customer}</p>
                                    <div className="text-sm text-slate-800">
                                        <p className="font-bold text-lg mb-1">
                                            {appData?.applicantData?.firstName || 'ผู้ยื่นคำขอ GACP'} {appData?.applicantData?.lastName || ''}
                                        </p>
                                        <p className="text-slate-500 leading-relaxed">
                                            {appData?.applicantData?.address || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">สถานที่ปลูก</p>
                                    <div className="text-sm text-slate-800">
                                        <p className="font-bold mb-1">{state.farmData?.farmName || '-'}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">{state.plantId?.toUpperCase() || '-'} Certification</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{dict.wizard.invoice.table.description}</th>
                                            <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 w-32">{dict.wizard.invoice.table.amount}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoiceItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 px-4">
                                                    <p className="font-medium text-slate-800">{item.label}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Standard Compliance Audit</p>
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-slate-900">฿{item.amount.toLocaleString()}.00</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-100">
                                        <tr>
                                            <td className="py-4 px-4 text-right font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                                                {dict.wizard.invoice.table.total}
                                            </td>
                                            <td className="py-4 px-4 text-right font-black text-xl text-emerald-600">
                                                ฿{totalAmount.toLocaleString()}.00
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Actions */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                <SecureIcon className="w-4 h-4" />
                            </div>
                            ชำระเงิน
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ยอดชำระสุทธิ</p>
                                <p className="text-3xl font-black text-slate-900">฿{totalAmount.toLocaleString()}</p>
                            </div>

                            <div className="flex gap-3 text-xs text-slate-500 leading-relaxed px-1">
                                <InfoIcon className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                                <p>รองรับการชำระผ่าน Thai QR Payment, Mobile Banking และบัตรเครดิต</p>
                            </div>
                        </div>

                        <button
                            onClick={handlePayClick}
                            disabled={isProcessing}
                            className={`
                                w-full py-3 rounded-xl font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2
                                ${isProcessing
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md active:scale-95'
                                }
                            `}
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Icons.CreditCard className="w-4 h-4" />
                            )}
                            {isProcessing ? 'กำลังตรวจสอบ...' : 'ชำระผ่าน Mobile Banking'}
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/80">
                            <Icons.FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">ดาวน์โหลดใบแจ้งหนี้</h4>
                            <button
                                onClick={() => setShowInvoicePdf(true)}
                                className="text-xs text-emerald-400 font-medium hover:text-emerald-300 hover:underline mt-0.5"
                            >
                                ดูไฟล์ PDF ฉบับเต็ม
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <WizardNavigation
                onNext={handlePayClick}
                onBack={() => phase === 2 ? router.push('/farmer/dashboard') : router.push('/farmer/applications/new/step/13')}
                isNextDisabled={isProcessing}
                nextLabel={dict.wizard.invoice.modal.simulate}
            />

            {/* Simulated Payment Modal */}
            {showQrModal && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-scale-in relative">
                        <div className="bg-emerald-600 p-6 text-white text-center">
                            <h3 className="text-xl font-bold">Payment Gateway</h3>
                            <p className="text-white/80 text-xs mt-1">Simulated Transaction</p>
                        </div>

                        <div className="p-8 text-center space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.wizard.invoice.modal.scanQr}</p>
                                <p className="text-4xl font-black text-slate-900">฿{totalAmount.toLocaleString()}</p>
                            </div>

                            <div className="w-48 h-48 bg-white mx-auto border-2 border-slate-100 rounded-xl p-2 flex items-center justify-center relative shadow-sm">
                                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                    <div className="grid grid-cols-2 gap-2 p-4 w-full h-full opacity-50">
                                        <div className="bg-white rounded-md"></div>
                                        <div className="bg-white rounded-md"></div>
                                        <div className="bg-white rounded-md"></div>
                                        <div className="bg-white rounded-md relative flex items-center justify-center">
                                            <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                            <Icons.Smartphone className="w-6 h-6 text-slate-900" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handlePaymentSuccess}
                                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                                >
                                    {dict.wizard.invoice.modal.simulate}
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="text-slate-400 font-bold hover:text-slate-600 text-xs"
                                >
                                    {dict.wizard.invoice.modal.cancel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showInvoicePdf && (
                <InvoicePDF
                    invoiceNumber={invoiceNumber}
                    quoteNumber={state.milestone1?.dtamQuote?.number || "G-011268017"}
                    onClose={() => setShowInvoicePdf(false)}
                />
            )}
        </div>
    );
};

export default StepInvoice;
