'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { ApplicationService, Application } from '@/lib/services/application-service';
import { apiClient } from '@/lib/api/api-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { SecureIcon, WarningIcon } from '@/components/icons/WizardIcons';

export const StepInvoice = () => {
    const { setCurrentStep } = useWizardStore();
    const router = useRouter();
    const [showQrModal, setShowQrModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [appData, setAppData] = useState<Application | null>(null);
    const [phase, setPhase] = useState<1 | 2>(1);

    const invoiceNumber = `INV-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`;
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const [invoiceItems, setInvoiceItems] = useState<{ label: string; amount: number }[]>([]);

    useEffect(() => {
        // Fetch Application Data to determine Phase and Calculate Fee
        const fetchApp = async () => {
            const res = await ApplicationService.getMyApplications();
            if (res.success && res.data) {
                // Safely handle potential data structure variations
                const apps: Application[] = Array.isArray(res.data)
                    ? res.data
                    : (res.data as unknown as { data: Application[] })?.data || [];
                const activeApp = apps[0]; // Assuming single active app
                if (activeApp) {
                    setAppData(activeApp);

                    // Determine Phase
                    let currentPhase: 1 | 2 = 1;
                    if (activeApp.status === 'PAYMENT_2_PENDING') {
                        currentPhase = 2;
                    }
                    setPhase(currentPhase);

                    // Fallback Logic
                    const feeData = activeApp.fees || {};
                    const phaseData = currentPhase === 1 ? feeData.phase1 : feeData.phase2;

                    if (phaseData && phaseData.items) {
                        setInvoiceItems(phaseData.items.map((i) => ({
                            label: i.description,
                            amount: i.amount
                        })));
                    } else {
                        // Default Fallback (if legacy data)
                        if (currentPhase === 1) {
                            setInvoiceItems([
                                { label: "ค่าธรรมเนียมคำขอรับรองมาตรฐาน GACP (Standard Fee)", amount: 100 },
                                { label: "ค่าตรวจเอกสาร (Document Check)", amount: 200 }
                            ]);
                        } else {
                            setInvoiceItems([
                                { label: "ค่าธรรมเนียมการตรวจประเมิน (Audit Fee)", amount: 2000 },
                                { label: "ค่าพาหนะ (Standard Travel)", amount: 500 }
                            ]);
                        }
                    }

                    // Force store step update to 9 (0-indexed for Step 10)
                    setCurrentStep(9);
                }
            }
        };
        fetchApp();
    }, [setCurrentStep]);

    const handlePayClick = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowQrModal(true);
        }, 1000);
    };

    const handlePaymentSuccess = async () => {
        setIsProcessing(true);
        try {
            if (appData && appData._id) {
                const total = invoiceItems.reduce((acc, item) => acc + item.amount, 0);

                // Call API to confirm payment
                await apiClient.post(`/applications/${appData._id}/payment`, {
                    phase: phase,
                    amount: total,
                    method: 'QR_CASH'
                });
            }

            setTimeout(() => {
                // If Phase 2, go to Dashboard (Wait for Audit Schedule)
                // If Phase 1, go to Success Step (Wizard Completion)
                if (phase === 2) {
                    router.push('/farmer/dashboard');
                } else {
                    router.push('/farmer/applications/new/step/15'); // Success
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
        <div className="space-y-8 animate-fade-in pb-20 max-w-5xl mx-auto font-thai">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-primary gradient-mask rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    {phase === 1 ? '14' : 'P2'}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">
                        {phase === 1 ? "ชำระค่าธรรมเนียม (Payment)" : "ชำระค่าธรรมเนียมการตรวจประเมิน"}
                    </h2>
                    <p className="text-text-secondary">โปรดชำระเงินตามใบแจ้งหนี้เพื่อดำเนินการในขั้นตอนถัดไป</p>
                </div>
            </div>

            {/* Invoice Paper Container with Glossy Effect */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-blue-100/30 rounded-[2rem] transform rotate-1 scale-[1.01] blur-sm transition-transform group-hover:rotate-0 group-hover:scale-100"></div>

                {/* Invoice Paper */}
                <div className="relative bg-white rounded-[1.5rem] shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-gray-100 print:shadow-none print:border-none">

                    {/* Top Decor Bar */}
                    <div className="h-2 bg-gradient-to-r from-primary-400 via-primary to-primary-700"></div>

                    <div className="p-8 md:p-12 font-[Sarabun]">
                        {/* Invoice Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-8 mb-8 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 relative w-20 h-20 flex items-center justify-center">
                                    <span className="text-3xl">🌿</span>
                                </div>
                                <div className="mt-1">
                                    <h1 className="text-xl font-bold text-primary-900">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                    <p className="text-sm text-text-secondary mt-1 max-w-xs">Department of Thai Traditional and Alternative Medicine</p>
                                    <p className="text-xs text-text-tertiary mt-2">88/23 หมู่ 4 ถนนติวานนท์ อำเภอเมือง จังหวัดนนทบุรี 11000</p>
                                </div>
                            </div>
                            <div className="text-right w-full md:w-auto">
                                <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold border border-primary-100 rounded-lg mb-4">
                                    ใบวางบิล/แจ้งหนี้ (INVOICE)
                                </div>
                                <div className="space-y-1 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
                                    <p className="flex justify-between md:justify-end gap-6"><span className="text-text-tertiary">เลขที่:</span> <span className="font-mono font-bold text-primary-900">{invoiceNumber}</span></p>
                                    <p className="flex justify-between md:justify-end gap-6"><span className="text-text-tertiary">วันที่:</span> <span className="font-medium text-gray-900">{currentDate.toLocaleDateString('th-TH')}</span></p>
                                    <p className="flex justify-between md:justify-end gap-6"><span className="text-text-tertiary">วันครบกำหนด:</span> <span className="font-bold text-red-600 font-mono">{dueDate.toLocaleDateString('th-TH')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-8 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-1">ชื่อผู้ขอรับบริการ (Customer)</p>
                                    <p className="font-bold text-primary-900 text-lg">{appData?.applicantData?.firstName || 'ผู้ยื่นคำขอ GACP'} {appData?.applicantData?.lastName || ''}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-tertiary uppercase mb-1">ที่อยู่ (Address)</p>
                                    <p className="text-sm text-text-secondary">{appData?.applicantData?.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 mb-8">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-primary text-white">
                                        <th className="py-4 px-4 text-center w-20 font-medium">ลำดับ</th>
                                        <th className="py-4 px-4 text-left font-medium">รายการ (Description)</th>
                                        <th className="py-4 px-4 text-right w-40 font-medium">จำนวนเงิน (บาท)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {invoiceItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-primary-50/10 transition-colors">
                                            <td className="py-4 px-4 text-center align-top text-text-tertiary font-mono">{idx + 1}</td>
                                            <td className="py-4 px-4 align-top">
                                                <p className="font-bold text-gray-900">{item.label}</p>
                                            </td>
                                            <td className="py-4 px-4 text-right align-top font-mono font-medium text-gray-900">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                    {/* Spacer Rows */}
                                    {[...Array(Math.max(0, 3 - invoiceItems.length))].map((_, i) => (
                                        <tr key={`spacer-${i}`}>
                                            <td className="py-4 px-4">&nbsp;</td>
                                            <td className="py-4 px-4">&nbsp;</td>
                                            <td className="py-4 px-4">&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-gray-200 bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="py-6 px-6 text-right font-bold text-gray-600 text-lg">ยอดชำระสุทธิ (Net Amount)</td>
                                        <td className="py-6 px-6 text-right font-bold text-primary-700 text-2xl border-l border-gray-200 bg-white shadow-inner">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Payment Info & Footer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-5 flex gap-4 items-center border border-primary-100 shadow-sm">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-primary-100 shadow-sm text-primary">
                                    <SecureIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-primary-900 mb-0.5">ชำระเงินผ่าน QR Code</p>
                                    <p className="text-xs text-primary-700">รองรับ Mobile Banking ทุกธนาคาร</p>
                                </div>
                            </div>
                            <div className="text-right text-xs text-text-tertiary">
                                <p className="mb-1">เอกสารนี้จัดทำโดยระบบคอมพิวเตอร์</p>
                                <p>© GACP Platform Co., Ltd. สงวนลิขสิทธิ์</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation using standardized WizardNavigation */}
            <div className="pt-8">
                <WizardNavigation
                    onNext={handlePayClick}
                    onBack={() => phase === 2 ? router.push('/farmer/dashboard') : router.push('/farmer/applications/new/step/13')}
                    isNextDisabled={isProcessing}
                    nextLabel={isProcessing ? 'กำลังประมวลผล...' : 'ยืนยันการชำระเงิน'}
                    backLabel={phase === 2 ? "ยกเลิก" : "ย้อนกลับ"}
                    backIcon={phase === 2 ? undefined : undefined} // Use default
                />
            </div>

            {/* Simulated Ksher Modal */}
            {showQrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-[#E60000] p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                            <h3 className="text-2xl font-bold relative z-10 tracking-tight flex items-center justify-center gap-2">
                                Ksher Pay
                            </h3>
                            <p className="text-white/80 text-xs relative z-10 font-medium tracking-wide">Secure Payment Gateway</p>
                        </div>

                        <div className="p-8 text-center space-y-6">
                            <div>
                                <p className="text-text-secondary mb-2 font-medium text-sm">สแกน QR Code เพื่อชำระเงิน</p>
                                <p className="text-4xl font-bold text-gray-900 tracking-tight">฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>

                            {/* QR Container */}
                            <div className="w-64 h-64 bg-white mx-auto rounded-2xl border-2 border-gray-100 p-2 shadow-inner relative group cursor-pointer hover:border-primary-300 transition-colors">
                                <div className="absolute inset-0 bg-scan-line animate-scan pointer-events-none opacity-30 rounded-2xl overflow-hidden"></div>
                                <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
                                    {/* Mock QR Pattern */}
                                    <div className="w-full h-full bg-white p-4 grid grid-cols-2 gap-2 relative">
                                        <div className="border-[6px] border-black w-20 h-20 rounded-lg bg-black/5 absolute top-3 left-3">
                                            <div className="w-10 h-10 bg-black absolute top-1.5 left-1.5 rounded-sm"></div>
                                        </div>
                                        <div className="border-[6px] border-black w-20 h-20 rounded-lg bg-black/5 absolute top-3 right-3">
                                            <div className="w-10 h-10 bg-black absolute top-1.5 left-1.5 rounded-sm"></div>
                                        </div>
                                        <div className="border-[6px] border-black w-20 h-20 rounded-lg bg-black/5 absolute bottom-3 left-3">
                                            <div className="w-10 h-10 bg-black absolute top-1.5 left-1.5 rounded-sm"></div>
                                        </div>
                                        <div className="w-full h-full flex items-center justify-center absolute inset-0 z-10">
                                            <div className="w-14 h-14 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
                                                <span className="text-2xl">🌿</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handlePaymentSuccess}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                                >
                                    <SecureIcon className="w-5 h-5" />
                                    จำลองการชำระเงินสำเร็จ
                                </button>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="w-full py-2 text-text-tertiary text-sm font-medium hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                                >
                                    ยกเลิกทำรายการ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepInvoice;
