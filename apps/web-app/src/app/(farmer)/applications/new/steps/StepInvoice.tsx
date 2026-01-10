'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';

export const StepInvoice = () => {
    const { setCurrentStep } = useWizardStore();
    const [showQrModal, setShowQrModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const invoiceNumber = `INV-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`;
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const handlePayClick = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowQrModal(true);
        }, 1000);
    };

    const handlePaymentSuccess = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setCurrentStep(8); // Go to Success (Step 8 in new 0-indexed flow)
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 min-h-screen font-thai">

            <div className="w-full max-w-[210mm] mb-4 text-center">
                <h2 className="text-xl font-bold text-slate-700 mb-2">ขั้นตอนที่ 3: ใบแจ้งหนี้ & ชำระเงิน (Invoice & Payment)</h2>
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
                            <tr>
                                <td className="py-4 px-4 text-center align-top border-r border-slate-200">1</td>
                                <td className="py-4 px-4 align-top border-r border-slate-200">
                                    <p className="font-bold">ค่าธรรมเนียมคำขอรับรองมาตรฐาน GACP</p>
                                </td>
                                <td className="py-4 px-4 text-right align-top">100.00</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-center align-top border-r border-slate-200">2</td>
                                <td className="py-4 px-4 align-top border-r border-slate-200">
                                    <p className="font-bold">ค่าธรรมเนียมแปลงปลูก (Plot Fee)</p>
                                </td>
                                <td className="py-4 px-4 text-right align-top">50.00</td>
                            </tr>
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300">
                            <tr className="bg-blue-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-blue-900 text-lg">ยอดชำระสุทธิ (Net Amount)</td>
                                <td className="py-4 px-4 text-right font-bold text-blue-900 text-lg border border-slate-200">150.00</td>
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
                    onClick={() => setCurrentStep(6)} // Back to Quote
                    className="px-8 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                >
                    ย้อนกลับ
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
                            <p className="text-slate-500 mb-4 font-medium">สแกน QR Code เพื่อชำระเงิน</p>
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
