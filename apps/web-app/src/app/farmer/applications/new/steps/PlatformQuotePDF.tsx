'use client';

import React from 'react';

interface PlatformQuoteProps {
    quoteNumber: string;
    date: string;
    customer: {
        name: string;
        address?: string;
        phone?: string;
    };
    items: Array<{
        description: string;
        descriptionEN?: string;
        amount: number;
    }>;
    total: number;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    validDays?: number;
    onAccept?: () => void;
    onClose?: () => void;
}

/**
 * Platform Quote PDF Template - ใบเสนอราคาบริษัทแพลตฟอร์ม
 * ใช้หัวจดหมายบริษัท (ข้อมูลทดสอบ)
 */
export const PlatformQuotePDF = ({
    quoteNumber,
    date,
    customer,
    items,
    total,
    status,
    validDays = 30,
    onAccept,
    onClose,
}: PlatformQuoteProps) => {
    const currentDate = new Date(date);
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(expiryDate.getDate() + validDays);

    return (
        <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0" onClick={onClose}>
            <div className="w-full max-w-[210mm] max-h-[90vh] overflow-y-auto bg-white shadow-2xl animate-scale-in print:shadow-none print:w-full print:max-h-full print:overflow-visible" onClick={e => e.stopPropagation()}>

                {/* Print/Close Actions */}
                <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 print:hidden sticky top-0 z-10">
                    <h3 className="font-bold text-slate-700">ใบเสนอราคา - ค่าบริการแพลตฟอร์ม</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                            พิมพ์ / Print
                        </button>
                        {status === 'PENDING' && onAccept && (
                            <button onClick={onAccept} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                                ยอมรับ (Accept)
                            </button>
                        )}
                        {onClose && (
                            <button onClick={onClose} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                                ปิด (Close)
                            </button>
                        )}
                    </div>
                </div>

                {/* A4 Content */}
                <div className="p-[20mm] font-[Sarabun] text-black bg-white min-h-[297mm]">

                    {/* Header - Company Letterhead */}
                    <div className="flex items-start justify-between border-b-2 border-teal-600 pb-6 mb-8">
                        <div className="flex items-start gap-4">
                            {/* Company Logo Placeholder */}
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                GP
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-teal-800">บริษัท แกคป์ แพลตฟอร์ม จำกัด</h1>
                                <p className="text-xs text-slate-600 mt-1">GACP Platform Co., Ltd.</p>
                                <p className="text-[10px] text-slate-500">เลขที่ 123/45 อาคารไอที ชั้น 10 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400</p>
                                <p className="text-[10px] text-slate-500">โทร: 02-123-4567 | Email: contact@gacpplatform.co.th | เลขประจำตัวผู้เสียภาษี: 0105500000123</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-4 py-1 bg-teal-100 text-teal-800 text-sm font-bold border border-teal-200 rounded mb-2">
                                ใบเสนอราคา (QUOTATION)
                            </div>
                            <p className="text-sm">เลขที่: <span className="font-mono font-bold">{quoteNumber}</span></p>
                            <p className="text-sm">วันที่: {currentDate.toLocaleDateString('th-TH')}</p>
                            <p className="text-xs text-slate-500 mt-1">หมดอายุ: {expiryDate.toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex gap-8 mb-8">
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">เสนอราคาให้ (Customer):</p>
                            <p className="font-bold text-lg">{customer.name}</p>
                            {customer.address && <p className="text-sm text-slate-700">{customer.address}</p>}
                            {customer.phone && <p className="text-sm text-slate-600">โทร: {customer.phone}</p>}
                        </div>
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">สถานะ (Status):</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                {status === 'PENDING' && '⏳ รอยอมรับ'}
                                {status === 'ACCEPTED' && '✓ ยอมรับแล้ว'}
                                {status === 'EXPIRED' && '✕ หมดอายุ'}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">เงื่อนไขการชำระเงิน: ชำระทันที</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="bg-teal-600 text-white">
                                <th className="py-3 px-4 text-center w-16 border border-teal-700">ลำดับ</th>
                                <th className="py-3 px-4 text-left border border-teal-700">รายการ (Description)</th>
                                <th className="py-3 px-4 text-right w-32 border border-teal-700">จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 border border-slate-200">
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 px-4 text-center align-top border-r border-slate-200">{index + 1}</td>
                                    <td className="py-4 px-4 align-top border-r border-slate-200">
                                        <p className="font-bold">{item.description}</p>
                                        {item.descriptionEN && (
                                            <p className="text-xs text-slate-500 mt-1">{item.descriptionEN}</p>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-right align-top">{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300">
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-700">รวมเป็นเงิน (Total)</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 border border-slate-200 bg-slate-50">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-700">ภาษีมูลค่าเพิ่ม 7% (VAT)</td>
                                <td className="py-3 px-4 text-right text-slate-600 border border-slate-200">{(total * 0.07).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr className="bg-teal-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-teal-800 text-lg">จำนวนเงินทั้งสิ้น (Grand Total)</td>
                                <td className="py-4 px-4 text-right font-bold text-teal-800 text-lg border border-slate-200">{(total * 1.07).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Notes */}
                    <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-slate-300">
                        <div>
                            <p className="font-bold text-sm mb-2">หมายเหตุ (Remarks):</p>
                            <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                                <li>ใบเสนอราคานี้มีผล {validDays} วันนับจากวันที่ออก</li>
                                <li>ค่าบริการนี้เป็นค่าดำเนินการผ่านระบบ GACP Platform</li>
                                <li>ไม่รวมค่าธรรมเนียมที่ต้องชำระให้กรมการแพทย์แผนไทยฯ</li>
                            </ul>
                        </div>
                        <div className="text-center">
                            <div className="h-16 flex items-center justify-center mb-2">
                                {/* Digital Signature Placeholder */}
                                <div className="text-teal-500 opacity-50 font-script text-2xl">Digital Signed</div>
                            </div>
                            <p className="text-sm font-bold border-t border-slate-400 pt-2 inline-block min-w-[200px]">ผู้จัดทำเอกสาร</p>
                            <p className="text-xs text-slate-500 mt-1">ระบบ GACP Platform</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlatformQuotePDF;
