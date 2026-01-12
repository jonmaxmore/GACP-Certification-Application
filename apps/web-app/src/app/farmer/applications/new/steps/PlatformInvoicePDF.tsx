'use client';

import React from 'react';

interface PlatformInvoiceProps {
    invoiceNumber: string;
    quoteRef?: string;
    date: string;
    dueDate: string;
    customer: {
        name: string;
        address?: string;
        phone?: string;
        taxId?: string;
    };
    items: Array<{
        description: string;
        descriptionEN?: string;
        amount: number;
    }>;
    total: number;
    vat: number;
    grandTotal: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paidAt?: string;
    onPay?: () => void;
    onClose?: () => void;
}

/**
 * Platform Invoice PDF Template - ใบแจ้งหนี้บริษัทแพลตฟอร์ม
 * ใช้หัวจดหมายบริษัท (ข้อมูลทดสอบ)
 */
export const PlatformInvoicePDF = ({
    invoiceNumber,
    quoteRef,
    date,
    dueDate,
    customer,
    items,
    total,
    vat,
    grandTotal,
    status,
    paidAt,
    onPay,
    onClose,
}: PlatformInvoiceProps) => {
    const invoiceDate = new Date(date);
    const dueDateObj = new Date(dueDate);

    return (
        <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0" onClick={onClose}>
            <div className="w-full max-w-[210mm] max-h-[90vh] overflow-y-auto bg-white shadow-2xl animate-scale-in print:shadow-none print:w-full print:max-h-full print:overflow-visible" onClick={e => e.stopPropagation()}>

                {/* Print/Close Actions */}
                <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 print:hidden sticky top-0 z-10">
                    <h3 className="font-bold text-slate-700">ใบแจ้งหนี้ - ค่าบริการแพลตฟอร์ม</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                            พิมพ์ / Print
                        </button>
                        {status === 'PENDING' && onPay && (
                            <button onClick={onPay} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                                ชำระเงิน (Pay Now)
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
                    <div className="flex items-start justify-between border-b-2 border-blue-600 pb-6 mb-8">
                        <div className="flex items-start gap-4">
                            {/* Company Logo */}
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                                GP
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-blue-900">บริษัท แกคป์ แพลตฟอร์ม จำกัด</h1>
                                <p className="text-xs text-slate-600 mt-1">GACP Platform Co., Ltd.</p>
                                <p className="text-[10px] text-slate-500">เลขที่ 123/45 อาคารไอที ชั้น 10 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400</p>
                                <p className="text-[10px] text-slate-500">โทร: 02-123-4567 | Email: billing@gacpplatform.co.th | เลขประจำตัวผู้เสียภาษี: 0105500000123</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-sm font-bold border border-blue-200 rounded mb-2">
                                ใบแจ้งหนี้ (INVOICE)
                            </div>
                            <p className="text-sm">เลขที่: <span className="font-mono font-bold">{invoiceNumber}</span></p>
                            <p className="text-sm">วันที่: {invoiceDate.toLocaleDateString('th-TH')}</p>
                            <p className="text-sm text-red-600 font-bold">ครบกำหนด: {dueDateObj.toLocaleDateString('th-TH')}</p>
                            {quoteRef && <p className="text-xs text-slate-500 mt-1">อ้างอิง: {quoteRef}</p>}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex gap-8 mb-8">
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">เรียกเก็บเงินจาก (Bill To):</p>
                            <p className="font-bold text-lg">{customer.name}</p>
                            {customer.address && <p className="text-sm text-slate-700">{customer.address}</p>}
                            {customer.phone && <p className="text-sm text-slate-600">โทร: {customer.phone}</p>}
                            {customer.taxId && <p className="text-sm text-slate-600">เลขผู้เสียภาษี: {customer.taxId}</p>}
                        </div>
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">สถานะ (Status):</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                    status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                {status === 'PENDING' && '⏳ รอการชำระเงิน'}
                                {status === 'PAID' && '✓ ชำระแล้ว'}
                                {status === 'OVERDUE' && '⚠️ เกินกำหนดชำระ'}
                            </div>
                            {status === 'PAID' && paidAt && (
                                <p className="text-xs text-emerald-600 mt-2">ชำระเมื่อ: {new Date(paidAt).toLocaleDateString('th-TH')}</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="bg-blue-800 text-white">
                                <th className="py-3 px-4 text-center w-16 border border-blue-900">ลำดับ</th>
                                <th className="py-3 px-4 text-left border border-blue-900">รายการ (Description)</th>
                                <th className="py-3 px-4 text-right w-32 border border-blue-900">จำนวนเงิน (บาท)</th>
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
                                <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-700">รวมเป็นเงิน (Subtotal)</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 border border-slate-200 bg-slate-50">{total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-700">ภาษีมูลค่าเพิ่ม 7% (VAT)</td>
                                <td className="py-3 px-4 text-right text-slate-600 border border-slate-200">{vat.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-blue-900 text-lg">ยอดชำระสุทธิ (Net Amount)</td>
                                <td className="py-4 px-4 text-right font-bold text-blue-900 text-lg border border-slate-200">{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Payment Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 flex gap-6 items-center">
                        <div className="w-24 h-24 bg-white border border-slate-300 flex items-center justify-center shrink-0 rounded">
                            {/* QR Code Placeholder */}
                            <div className="text-center">
                                <span className="text-[10px] text-slate-400">PromptPay QR</span>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-blue-900 mb-1">ชำระเงินผ่าน QR Code (Scan to Pay)</p>
                            <p className="text-xs text-slate-600 mb-2">สามารถสแกนได้ด้วยแอปพลิเคชันธนาคารทุกธนาคาร</p>
                            <div className="text-xs text-slate-500">
                                OR Transfer: <strong>Kasikorn Bank</strong> | Account: <strong>123-4-56789-0</strong><br />
                                Name: <strong>GACP Platform Co., Ltd.</strong>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="grid grid-cols-2 gap-12 mt-4">
                        <div>
                            <p className="font-bold text-sm mb-2">เงื่อนไข:</p>
                            <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                                <li>กรุณาแจ้งหลักฐานการชำระเงินผ่านระบบ</li>
                                <li>ใบเสร็จรับเงินจะถูกออกหลังยืนยันการชำระเงินแล้ว</li>
                            </ul>
                        </div>
                        <div className="text-center">
                            <div className="h-16 flex items-center justify-center mb-2">
                                <div className="text-blue-500 opacity-50 font-script text-2xl">Digital Signed</div>
                            </div>
                            <p className="text-sm font-bold border-t border-slate-400 pt-2 inline-block min-w-[200px]">ผู้ออกใบแจ้งหนี้</p>
                            <p className="text-xs text-slate-500 mt-1">ระบบ GACP Platform</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlatformInvoicePDF;
