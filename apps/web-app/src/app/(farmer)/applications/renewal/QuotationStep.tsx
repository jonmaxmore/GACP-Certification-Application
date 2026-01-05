"use client";

import { Certificate, RENEWAL_FEE } from './types';

interface QuotationStepProps {
    certificate: Certificate | null;
    renewalId: string | null;
    isDark: boolean;
    onBack: () => void;
    onProceed: () => void;
}

export function QuotationStep({ certificate, renewalId, isDark, onBack, onProceed }: QuotationStepProps) {
    const quoteNumber = `QT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const currentDate = new Date();
    const validUntil = new Date(currentDate);
    validUntil.setDate(validUntil.getDate() + 30);

    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="max-w-3xl mx-auto">
                <button onClick={onBack} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${isDark ? 'border-slate-700 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>
                <h1 className={`text-xl font-semibold mb-5 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ใบเสนอราคา / Quotation</h1>

                {/* Official Document */}
                <div className="bg-white text-slate-900 p-10 border border-surface-200 rounded shadow-lg mb-6 font-[Sarabun]">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6 pb-4 border-b-2 border-slate-800">
                        <div className="flex-1">
                            <div className="text-base font-bold text-slate-800 mb-0.5">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div className="text-[11px] text-slate-700 mb-0.5">Department of Thai Traditional and Alternative Medicine</div>
                            <div className="text-[10px] text-slate-500">กระทรวงสาธารณสุข | Ministry of Public Health</div>
                        </div>
                        <div className="text-right min-w-[160px]">
                            <div className="bg-gradient-to-r from-slate-800 to-blue-600 text-white px-3.5 py-1.5 text-sm font-semibold rounded mb-2">ใบเสนอราคา</div>
                            <div className="text-[11px] text-slate-700">เลขที่: <strong>{quoteNumber}</strong></div>
                            <div className="text-[10px] text-slate-500">วันที่: {currentDate.toLocaleDateString('th-TH')}</div>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="mb-5 p-3 bg-surface-100 rounded-md border border-surface-200">
                        <div className="text-[11px] text-slate-500 mb-1">เรียน / To:</div>
                        <div className="text-sm font-semibold">{certificate?.siteName || 'ผู้ประกอบการ'}</div>
                        <div className="text-[11px] text-slate-500">ใบรับรอง: {certificate?.certificateNumber || '-'}</div>
                    </div>

                    {/* Fee Table */}
                    <table className="w-full text-xs mb-5 border-collapse">
                        <thead><tr className="bg-slate-800 text-white"><th className="p-2.5 text-center border border-slate-800 w-[50px]">ลำดับ</th><th className="p-2.5 text-left border border-slate-800">รายการ</th><th className="p-2.5 text-right border border-slate-800 w-[100px]">จำนวนเงิน (บาท)</th></tr></thead>
                        <tbody>
                            <tr><td className="p-3 border border-surface-200 text-center">1</td><td className="p-3 border border-surface-200">ค่าบริการต่ออายุใบรับรองมาตรฐาน GACP</td><td className="p-3 border border-surface-200 text-right">{RENEWAL_FEE.toLocaleString()}</td></tr>
                        </tbody>
                        <tfoot>
                            <tr className="bg-surface-100"><td colSpan={2} className="p-3 border border-surface-200 text-right font-semibold">รวมทั้งสิ้น</td><td className="p-3 border border-surface-200 text-right font-bold text-slate-800">{RENEWAL_FEE.toLocaleString()}</td></tr>
                            <tr><td colSpan={3} className="p-2 border border-surface-200 text-center italic text-[11px] text-slate-600">(สามหมื่นบาทถ้วน)</td></tr>
                        </tfoot>
                    </table>

                    {/* Validity */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 p-2.5 bg-secondary-50 border border-secondary-500 rounded-md">
                            <div className="text-[10px] text-secondary-800 mb-0.5">ใบเสนอราคานี้มีอายุถึง</div>
                            <div className="text-xs font-semibold text-secondary-700">{validUntil.toLocaleDateString('th-TH')}</div>
                        </div>
                        <div className="flex-1 p-2.5 bg-blue-50 border border-blue-500 rounded-md">
                            <div className="text-[10px] text-blue-800 mb-0.5">ชำระเงินภายใน</div>
                            <div className="text-xs font-semibold text-blue-700">7 วัน หลังจากยืนยัน</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex-1 py-3.5 rounded-xl border-2 border-primary-600 text-primary-600 text-sm font-semibold flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                        พิมพ์ใบเสนอราคา
                    </button>
                    <button onClick={onProceed} className="flex-1 py-3.5 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/40">ยืนยันและออกใบวางบิล →</button>
                </div>
            </div>
        </div>
    );
}
