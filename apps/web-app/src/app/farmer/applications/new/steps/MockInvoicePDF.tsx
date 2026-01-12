import Link from "next/link";

interface MockInvoiceProps {
    onClose: () => void;
}

export const MockInvoicePDF = ({ onClose }: MockInvoiceProps) => {
    const invoiceNumber = `INV-${new Date().getFullYear()}${(Math.random() * 10000).toFixed(0)}`;
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return (
        <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0" onClick={onClose}>
            <div className="w-full max-w-[210mm] max-h-[90vh] overflow-y-auto bg-white shadow-2xl animate-scale-in print:shadow-none print:w-full print:max-h-full print:overflow-visible" onClick={e => e.stopPropagation()}>

                {/* Print/Close Actions */}
                <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 print:hidden sticky top-0 z-10">
                    <h3 className="font-bold text-slate-700">ตัวอย่างเอกสาร (Preview)</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                            พิมพ์ / Print
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                            ปิด (Close)
                        </button>
                    </div>
                </div>

                {/* A4 Content */}
                <div className="p-[20mm] font-[Sarabun] text-black bg-white min-h-[297mm]">

                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-blue-600 pb-6 mb-8">
                        <div className="flex items-start gap-4">
                            <img src="/dtam_logo_new.png" alt="DTAM Logo" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className="text-xl font-bold text-blue-900">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h1>
                                <p className="text-xs text-slate-600 mt-1">Department of Thai Traditional and Alternative Medicine</p>
                                <p className="text-[10px] text-slate-500">88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</p>
                                <p className="text-[10px] text-slate-500">เลขประจำตัวผู้เสียภาษี: 0994000165xx</p>
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

                    {/* Customer Info */}
                    <div className="flex gap-8 mb-8">
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <p className="text-xs text-slate-500 mb-1">เรียกเก็บเงินจาก (Bill To):</p>
                            <p className="font-bold text-lg">ผู้ยื่นคำขอรับรองมาตรฐาน GACP</p>
                            <p className="text-sm text-slate-700">ที่อยู่: ตามที่ระบุในคำขอ</p>
                        </div>
                        <div className="flex-1 p-4 border border-slate-200 rounded bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">สถานะเอกสาร (Status):</p>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                        รอการชำระเงิน (Waiting for Payment)
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-1">ช่องทางชำระเงิน:</p>
                                    <p className="text-sm font-bold">QR Payment / Transfer</p>
                                </div>
                            </div>
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
                                    <p className="text-xs text-slate-500 mt-1">Application Fee for GACP Certification</p>
                                </td>
                                <td className="py-4 px-4 text-right align-top">100.00</td>
                            </tr>
                            <tr>
                                <td className="py-4 px-4 text-center align-top border-r border-slate-200">2</td>
                                <td className="py-4 px-4 align-top border-r border-slate-200">
                                    <p className="font-bold">ค่าธรรมเนียมแปลงปลูก (Plot Fee)</p>
                                    <p className="text-xs text-slate-500 mt-1">Additional Zones Calculation (1 Unit)</p>
                                </td>
                                <td className="py-4 px-4 text-right align-top">50.00</td>
                            </tr>
                        </tbody>
                        <tfoot className="border-t-2 border-slate-300">
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right font-bold text-slate-700">รวมเป็นเงิน (Total)</td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900 border border-slate-200 bg-slate-50">150.00</td>
                            </tr>
                            <tr className="bg-blue-50">
                                <td colSpan={2} className="py-4 px-4 text-right font-bold text-blue-900 text-lg">ยอดชำระสุทธิ (Net Amount)</td>
                                <td className="py-4 px-4 text-right font-bold text-blue-900 text-lg border border-slate-200">150.00</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="py-2 text-center text-xs italic text-slate-500 bg-slate-50">
                                    (หนึ่งร้อยห้าสิบบาทถ้วน)
                                </td>
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
                            <div className="text-xs text-slate-500">
                                OR Transfer: <strong>Krungthai Bank</strong> | Account: <strong>067-0-xxxxx-5</strong><br />
                                Name: <strong>Dept of Thai Traditional Medicine</strong>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="grid grid-cols-2 gap-12 mt-4">
                        <div></div>
                        <div className="text-center">
                            <div className="h-16 flex items-center justify-center mb-2">
                                {/* Digital Signature Placeholder */}
                                <div className="text-blue-500 opacity-50 font-script text-2xl">Digital Signed</div>
                            </div>
                            <p className="text-sm font-bold border-t border-slate-400 pt-2 inline-block min-w-[200px]">เจ้าหน้าที่การเงิน</p>
                            <p className="text-xs text-slate-500 mt-1">ผู้ได้รับมอบอำนาจ</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
