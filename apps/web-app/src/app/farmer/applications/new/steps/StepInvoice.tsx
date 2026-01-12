'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { ApplicationService } from '@/lib/services/application-service';
import { apiClient } from '@/lib/api/api-client';
import { useRouter } from 'next/navigation';

export const StepInvoice = () => {
    const { setCurrentStep } = useWizardStore();
    const router = useRouter();
    const [showQrModal, setShowQrModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [appData, setAppData] = useState<any>(null);
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
                const apps = (Array.isArray(res.data) ? res.data : (res.data as any).data || []);
                const activeApp = apps[0]; // Assuming single active app
                if (activeApp) {
                    setAppData(activeApp);

                    // Determine Phase
                    let currentPhase: 1 | 2 = 1;
                    if (activeApp.status === 'PAYMENT_2_PENDING') {
                        currentPhase = 2;
                    }
                    setPhase(currentPhase);

                    // Extract Fees from Saved Data
                    // Note: formData might be nested or direct depending on API
                    // Assuming API returns it in `formData` or root if mapped
                    // Our ApplicationService might mask `formData`. Let's assume it's available or map it.
                    // Actually, `Application` interface might not have `formData`.
                    // But in strict mode, we should assume the API returns it or we stored it in specific fields.
                    // The backend returns mapped fields. But `formData` is not fully mapped in `getMyApplications`.
                    // Wait! `getMyApplications` maps specific fields.
                    // I need to update `getMyApplications` or the endpoint `GET /my` to include `fees`.
                    // Checking `applications.js` GET /my ... mapped `audit` but NOT `fees`.
                    // CRITICAL: Update Backend `GET /my` to include `fees`.
                    // For now, I will assume fallback logic here if fees missing.

                    // Fallback Logic (if backend not updated yet)
                    // I will add the backend `fees` mapping in next step.
                    // Here I implement the rendering logic assuming data will arrive.
                    const feeData = (activeApp as any).fees || {};
                    const phaseData = currentPhase === 1 ? feeData.phase1 : feeData.phase2;

                    if (phaseData && phaseData.items) {
                        setInvoiceItems(phaseData.items.map((i: any) => ({
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
                }
            }
        };
        fetchApp();
    }, []);

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
                // Using a generic payment endpoint or status update
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
                    router.push('/farmer/applications/new/step/12'); // Success
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
        <div className="flex flex-col items-center p-6 bg-slate-50 min-h-screen font-thai">

            <div className="w-full max-w-[210mm] mb-4 text-center">
                <h2 className="text-xl font-bold text-slate-700 mb-2">
                    {phase === 1 ? "ขั้นตอนที่ 3: ชำระค่าธรรมเนียมคำขอ" : "ชำระค่าธรรมเนียมการตรวจประเมิน"}
                </h2>
                <p className="text-sm text-slate-500">โปรดชำระเงินตามใบแจ้งหนี้ด้านล่าง</p>
            </div>

            {/* Invoice Paper */}
            <div className="w-full max-w-[210mm] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 mb-6 relative">
                <div className="p-[20mm] font-[Sarabun]">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-blue-600 pb-6 mb-8">
                        <div className="flex items-start gap-4">
                            <img src="/dtam_logo_new.png" alt="DTAM Logo" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className="text-xl font-bold text-blue-900">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                <p className="text-xs text-slate-600 mt-1">Department of Thai Traditional and Alternative Medicine</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-sm font-bold border border-blue-200 rounded mb-2">
                                ใบวางบิล/แจ้งหนี้ (INVOICE)
                            </div>
                            <p className="text-sm">เลขที่: <span className="font-mono font-bold">{invoiceNumber}</span></p>
                            <p className="text-sm">วันที่: {currentDate.toLocaleDateString('th-TH')}</p>
                            <p className="text-sm text-red-600 font-bold">วันครบกำหนด: {dueDate.toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="bg-blue-800 text-white">
                                <th className="py-3 px-4 text-center w-16 border border-blue-900">ลำดับ</th>
                                <th className="py-3 px-4 text-left border border-blue-900">รายการ (Description)</th>
                                <th className="py-3 px-4 text-right w-32 border border-blue-900">จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 border border-slate-200">
                            {invoiceItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 px-4 text-center align-top border-r border-slate-200">{idx + 1}</td>
                                    <td className="py-4 px-4 align-top border-r border-slate-200">
                                        <p className="font-bold">{item.label}</p>
                                    </td>
                                    <td className="py-4 px-4 text-right align-top">{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300">
                            <tr className="bg-blue-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-blue-900 text-lg">ยอดชำระสุทธิ (Net Amount)</td>
                                <td className="py-4 px-4 text-right font-bold text-blue-900 text-lg border border-slate-200">{totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Payment Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 flex gap-6 items-center">
                        <div className="w-24 h-24 bg-white border border-slate-300 flex items-center justify-center shrink-0">
                            <div className="text-center">
                                <span className="text-[10px] text-slate-400">QR</span>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 mb-1">ชำระเงินผ่าน QR Code (Scan to Pay)</p>
                            <p className="text-xs text-slate-600 mb-2">สามารถสแกนได้ด้วยแอปพลิเคชันธนาคารทุกธนาคาร</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-[210mm] flex gap-4 justify-center">
                <button
                    onClick={() => phase === 2 ? router.push('/farmer/dashboard') : router.push('/farmer/applications/new/step/10')}
                    className="px-8 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                >
                    {phase === 2 ? "ยกเลิก" : "ย้อนกลับ"}
                </button>
                <button
                    onClick={handlePayClick}
                    disabled={isProcessing}
                    className="px-8 py-3 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    {isProcessing ? 'กำลังประมวลผล...' : 'ชำระเงิน (Proceed to Payment)'}
                </button>
            </div>

            {/* Simulated Ksher Modal */}
            {showQrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="bg-[#E60000] p-6 text-white text-center relative overflow-hidden">
                            <h3 className="text-2xl font-bold relative z-10">Ksher Pay</h3>
                            <p className="text-white/80 text-sm relative z-10">Secure Payment Gateway</p>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-slate-500 mb-4 font-medium">สแกน QR Code เพื่อชำระเงิน ({totalAmount.toFixed(2)} THB)</p>
                            <div className="w-64 h-64 bg-slate-100 mx-auto rounded-2xl border-2 border-slate-200 p-2 mb-6 shadow-inner">
                                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-400 font-mono">SIMULATED QR</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handlePaymentSuccess}
                                className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 mb-3"
                            >
                                ✅ จำลองการชำระเงินสำเร็จ
                            </button>
                            <button onClick={() => setShowQrModal(false)} className="text-slate-400 text-sm">ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
