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

    const invoiceNumber = `INV-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`;
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

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
        <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    14
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">
                        {phase === 1 ? dict.wizard.invoice.phase1Title : dict.wizard.invoice.phase2Title}
                    </h2>
                    <p className="text-text-secondary">ใบแจ้งชำระเงินสำหรับการพิจารณามาตรฐาน GACP</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: The Invoice Paper */}
                <div className="lg:col-span-8 group">
                    <div className="relative">
                        {/* Shadow Decor */}
                        <div className="absolute inset-0 bg-primary-900/5 rounded-[2rem] blur-3xl -z-10 translate-y-4 scale-95 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-gray-100 relative z-10 animate-slide-up">
                            {/* Paper Texture/Pattern */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

                            {/* Color Bar */}
                            <div className="h-3 bg-gradient-to-r from-primary-400 via-primary to-primary-800"></div>

                            <div className="p-8 md:p-12">
                                {/* Letterhead */}
                                <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-10 mb-10 gap-8">
                                    <div className="flex items-start gap-5">
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-premium-hover border border-gray-50 flex items-center justify-center p-2 relative overflow-hidden">
                                            <Image src="/dtam_logo_new.png" alt="DTAM" fill className="object-contain p-2" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-black text-primary-900 leading-tight">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Ministry of Public Health, Thailand</p>
                                            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed max-w-xs">{dict.wizard.invoice.paper.orgAddress}</p>
                                        </div>
                                    </div>
                                    <div className="text-right w-full md:w-auto space-y-4">
                                        <div className="inline-block px-5 py-2 bg-primary-900 text-white text-sm font-black rounded-2xl shadow-lg uppercase tracking-widest">
                                            {dict.wizard.invoice.paper.invoiceTitle}
                                        </div>
                                        <div className="space-y-1.5 bg-gray-50 p-5 rounded-2xl border border-gray-200/50 min-w-[220px]">
                                            <p className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                                <span>{dict.wizard.invoice.paper.no}</span>
                                                <span className="text-gray-900">{invoiceNumber}</span>
                                            </p>
                                            <p className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                                <span>{dict.wizard.invoice.paper.date}</span>
                                                <span className="text-gray-900">{currentDate.toLocaleDateString('th-TH')}</span>
                                            </p>
                                            <p className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                                                <span>{dict.wizard.invoice.paper.dueDate}</span>
                                                <span className="text-danger font-black">{dueDate.toLocaleDateString('th-TH')}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dict.wizard.invoice.paper.customer}</p>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="font-black text-gray-900 text-lg">
                                                {appData?.applicantData?.firstName || 'ผู้ยื่นคำขอ GACP'} {appData?.applicantData?.lastName || ''}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {appData?.applicantData?.address || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานที่ปลูก / แปลง</p>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="font-bold text-gray-800 text-sm">{state.farmData?.farmName || '-'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{state.plantId?.toUpperCase() || '-'} Certification</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="border border-gray-100 rounded-[2rem] overflow-hidden shadow-inner mb-10">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-primary text-white">
                                                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-widest">{dict.wizard.invoice.table.description}</th>
                                                <th className="py-5 px-6 text-right text-[10px] font-black uppercase tracking-widest w-40">{dict.wizard.invoice.table.amount}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {invoiceItems.map((item, idx) => (
                                                <tr key={idx} className="group/row hover:bg-primary-50/30 transition-colors">
                                                    <td className="py-6 px-6">
                                                        <p className="font-black text-gray-800">{item.label}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">GACP Standard Compliance Audit</p>
                                                    </td>
                                                    <td className="py-6 px-6 text-right font-black text-gray-900 text-lg">฿{item.amount.toLocaleString()}.00</td>
                                                </tr>
                                            ))}
                                            {/* Empty rows to maintain height */}
                                            {invoiceItems.length < 3 && [...Array(3 - invoiceItems.length)].map((_, i) => (
                                                <tr key={i}><td className="py-8 px-6"></td><td className="py-8 px-6"></td></tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-primary-900 text-white">
                                            <tr>
                                                <td className="py-8 px-8 text-right font-black uppercase tracking-widest text-white/60">
                                                    {dict.wizard.invoice.table.total}
                                                </td>
                                                <td className="py-8 px-8 text-right font-black text-4xl tracking-tighter shadow-xl">
                                                    ฿{totalAmount.toLocaleString()}.00
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Note */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-px bg-gray-200"></div>
                                        <span>Digital Signature Authenticated</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Generated at {new Date().toLocaleTimeString()}</span>
                                        <div className="w-8 h-px bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="gacp-card p-8 bg-white border-primary shadow-premium animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-xl font-black text-primary-900 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <SecureIcon className="w-6 h-6 text-primary" />
                            </div>
                            ชำระเงินทันที
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/50 space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Net Amount Due</p>
                                <p className="text-4xl font-black text-gray-900">฿{totalAmount.toLocaleString()}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3 text-blue-900">
                                <InfoIcon className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                                <p className="text-[10px] font-bold leading-relaxed opacity-80">
                                    รองรับการชำระผ่าน Thai QR Payment, Mobile Banking และบัตรเครดิตทุกธนาคาร
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handlePayClick}
                            disabled={isProcessing}
                            className={`
                                w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-3
                                ${isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-600 hover:shadow-primary/30 hover:-translate-y-1 active:scale-95'
                                }
                            `}
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Icons.CreditCard className="w-6 h-6" />
                            )}
                            {isProcessing ? 'กำลังตรวจสอบ...' : 'ชำระผ่าน Mobile Banking'}
                        </button>
                    </div>

                    <div className="gacp-card p-6 bg-gradient-to-br from-gray-900 to-black border-none text-white animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex gap-4 items-start">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <Icons.FileText className="w-6 h-6 text-primary-300" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm">ดาวน์โหลดใบแจ้งหนี้</h4>
                                <p className="text-[10px] text-white/50 leading-relaxed">ท่านสามารถดาวน์โหลดไฟล์ PDF เก็บไว้เป็นหลักฐานการทำรายการ</p>
                                <button
                                    onClick={() => setShowInvoicePdf(true)}
                                    className="text-[10px] font-black uppercase text-primary-300 hover:underline pt-2"
                                >
                                    View Official PDF
                                </button>
                            </div>
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
                <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in relative border border-white/20">
                        <div className="bg-[#E60000] p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                            <h3 className="text-3xl font-black relative z-10 tracking-tight">Ksher Pay</h3>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">Gateway Transaction</p>
                        </div>

                        <div className="p-10 text-center space-y-8">
                            <div>
                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2">{dict.wizard.invoice.modal.scanQr}</p>
                                <p className="text-5xl font-black text-gray-900 tracking-tighter">฿{totalAmount.toLocaleString()}</p>
                            </div>

                            <div className="w-64 h-64 bg-white mx-auto rounded-3xl border-4 border-gray-100 p-4 shadow-inner relative group cursor-pointer hover:border-primary transition-all">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent animate-pulse rounded-2xl overflow-hidden pointer-events-none"></div>
                                <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-premium">
                                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-4 bg-white relative">
                                        <div className="border-[8px] border-black m-2 rounded-xl"></div>
                                        <div className="border-[8px] border-black m-2 rounded-xl"></div>
                                        <div className="border-[8px] border-black m-2 rounded-xl"></div>
                                        <div className="flex items-center justify-center">
                                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                                                <Icons.CheckCircle className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    onClick={handlePaymentSuccess}
                                    className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckIcon className="w-6 h-6" />
                                    {dict.wizard.invoice.modal.simulate}
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
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
