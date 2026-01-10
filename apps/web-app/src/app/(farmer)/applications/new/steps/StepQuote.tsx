'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';

export const StepQuote = () => {
    const { setCurrentStep } = useWizardStore();
    const [accepted, setAccepted] = useState(false);

    const quoteNumber = `QT-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`;
    const currentDate = new Date();

    const handleAccept = () => {
        if (accepted) {
            setCurrentStep(7); // Go to Invoice
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 min-h-screen font-thai">

            <div className="w-full max-w-[210mm] mb-4 text-center">
                <h2 className="text-xl font-bold text-slate-700 mb-2">ขั้นตอนที่ 2: ใบเสนอราคา (Quotation)</h2>
                <p className="text-sm text-slate-500">โปรดตรวจสอบและยอมรับใบเสนอราคาเพื่อดำเนินการต่อ</p>
            </div>

            {/* Quote Paper */}
            <div className="w-full max-w-[210mm] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 mb-6">
                <div className="p-[20mm] font-[Sarabun]">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6 mb-8">
                        <div className="flex items-start gap-4">
                            <img src="/dtam_logo_new.png" alt="DTAM Logo" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className="text-xl font-bold text-emerald-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                <p className="text-xs text-slate-600 mt-1">Department of Thai Traditional and Alternative Medicine</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200 rounded mb-2">
                                ใบเสนอราคา (QUOTATION)
                            </div>
                            <p className="text-sm">เลขที่: <span className="font-mono font-bold">{quoteNumber}</span></p>
                            <p className="text-sm">วันที่: {currentDate.toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="bg-emerald-600 text-white">
                                <th className="py-3 px-4 text-center w-16 border border-emerald-700">ลำดับ</th>
                                <th className="py-3 px-4 text-left border border-emerald-700">รายการ (Description)</th>
                                <th className="py-3 px-4 text-right w-32 border border-emerald-700">จำนวนเงิน (บาท)</th>
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
                            <tr className="bg-emerald-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-emerald-800 text-lg">จำนวนเงินทั้งสิ้น (Grand Total)</td>
                                <td className="py-4 px-4 text-right font-bold text-emerald-800 text-lg border border-slate-200">150.00</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-8 text-center text-xs text-slate-500">
                        * นี่เป็นเอกสารตัวอย่างสำหรับตรวจสอบความถูกต้อง
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-[210mm] flex flex-col items-center gap-4">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all w-full justify-center">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={e => setAccepted(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700">ข้าพเจ้าได้ตรวจสอบและยอมรับใบเสนอราคานี้ (I accept this quotation)</span>
                </label>

                <div className="flex gap-4">
                    <button
                        onClick={() => setCurrentStep(5)} // Back to Review
                        className="px-8 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                    >
                        ย้อนกลับ
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={!accepted}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${accepted ? 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1' : 'bg-slate-300 cursor-not-allowed'}`}
                    >
                        ออกใบแจ้งหนี้ (Issue Invoice) →
                    </button>
                </div>
            </div>
        </div>
    );
};
