"use client";

import { useWizardStore } from "../hooks/useWizardStore";

interface InvoicePDFProps {
    invoiceNumber: string;
    quoteNumber: string;
    onClose: () => void;
}

export const InvoicePDF = ({ invoiceNumber, quoteNumber, onClose }: InvoicePDFProps) => {
    const { state } = useWizardStore();
    const currentDate = new Date();

    const applicant = (state.applicantData || {}) as any;
    const name = applicant.firstName ? `${applicant.firstName} ${applicant.lastName || ''}` : "บริษัท สโมก ครูว จำกัด";
    const address = applicant.address || "88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000";

    return (
        <div className="fixed inset-0 bg-black/70 z-[1100] flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0 overflow-y-auto" onClick={onClose}>
            <div className="w-full max-w-[210mm] my-8 bg-white shadow-2xl animate-scale-in print:shadow-none print:w-full print:my-0" onClick={e => e.stopPropagation()}>

                {/* Print/Close Actions */}
                <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 print:hidden sticky top-0 z-20">
                    <h3 className="font-bold text-slate-700">ใบวางบิล / ใบแจ้งหนี้ (Official Template Preview)</h3>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm">
                            พิมพ์เอกสาร / Print
                        </button>
                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-all">
                            ปิด / Close
                        </button>
                    </div>
                </div>

                {/* A4 Content Context */}
                <div className="p-[15mm] md:p-[20mm] font-serif text-black bg-white min-h-[297mm] leading-tight">

                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                            <img src="/dtam_logo_new.png" alt="DTAM Logo" className="w-20 h-20 object-contain" />
                            <div className="space-y-1">
                                <h1 className="text-[16pt] font-bold text-slate-900">กองกัญชาทางการแพทย์</h1>
                                <h2 className="text-[14pt] font-bold text-slate-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</h2>
                                <p className="text-[10pt] text-slate-600 leading-tight">
                                    88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000<br />
                                    โทรศัพท์ (02) 5647889 หรือ 061-4219701 อีเมล์ tdc.cannabis.gacp@gmail.com
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-black px-4 py-2 text-center min-w-[180px]">
                            <h3 className="text-lg font-bold">ใบวางบิล/ใบแจ้งหนี้</h3>
                        </div>
                    </div>

                    <div className="text-right text-[10pt] mb-4">
                        กนช. 18 ธันวาคม 2568
                    </div>

                    {/* Meta Section */}
                    <div className="border-2 border-black grid grid-cols-12 mb-2">
                        <div className="col-span-8 p-4 border-r-2 border-black space-y-2">
                            <p className="font-bold">เรียน ประธานกรรมการ {name}</p>
                            <div className="grid grid-cols-12 text-[10.5pt] gap-y-1">
                                <span className="col-span-4">หน่วยงานผู้รับบริการ:</span>
                                <span className="col-span-8 font-bold">{name}</span>
                                <span className="col-span-4">เลขประจำตัวผู้เสียภาษี:</span>
                                <span className="col-span-8">{applicant.taxId || "0835566002415"}</span>
                                <span className="col-span-4">ที่อยู่:</span>
                                <span className="col-span-8">{address}</span>
                                <span className="col-span-4">ผู้ประสานงาน:</span>
                                <span className="col-span-8">คุณ{applicant.firstName || "นุชจรินทร์"} {applicant.lastName || "บัวศรี"} โทรศัพท์: {applicant.phone || "-"}</span>
                            </div>
                        </div>
                        <div className="col-span-4 p-4 text-[10.5pt]">
                            <p>เลขที่เอกสาร: {invoiceNumber}</p>
                            <p>วันที่: {currentDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="mt-2 text-blue-700 font-bold">ใบเสนอราคาเลขที่: {quoteNumber}</p>
                        </div>
                    </div>

                    <p className="text-[10.5pt] mb-4 font-bold">
                        กองกัญชาทางการแพทย์ขอนำส่งใบวางบิล/ใบแจ้งหนี้ ดังรายการต่อไปนี้
                    </p>

                    {/* Table */}
                    <table className="w-full border-2 border-black text-[10.5pt] mb-6">
                        <thead>
                            <tr className="border-b-2 border-black bg-slate-50">
                                <th className="border-r-2 border-black py-2 w-16 text-center">ลำดับที่</th>
                                <th className="border-r-2 border-black py-2 text-center">รายการ</th>
                                <th className="border-r-2 border-black py-2 w-16 text-center">จำนวน</th>
                                <th className="border-r-2 border-black py-2 w-16 text-center">หน่วย</th>
                                <th className="border-r-2 border-black py-2 w-24 text-center">ราคา/หน่วย</th>
                                <th className="py-2 w-28 text-center">จำนวนเงิน (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-black/20">
                                <td className="border-r-2 border-black py-3 text-center">1.</td>
                                <td className="border-r-2 border-black py-3 px-4 text-left">ค่าตรวจสอบและประเมินคำขอรับการรับรองมาตรฐานเบื้องต้น</td>
                                <td className="border-r-2 border-black py-3 text-center">1</td>
                                <td className="border-r-2 border-black py-3 text-center">ต่อคำขอ</td>
                                <td className="border-r-2 border-black py-3 text-right px-2">5,000.00</td>
                                <td className="py-3 text-right px-2">5,000.00</td>
                            </tr>
                            <tr className="border-b border-black">
                                <td className="border-r-2 border-black py-3 text-center">2.</td>
                                <td className="border-r-2 border-black py-3 px-4 text-left">ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน</td>
                                <td className="border-r-2 border-black py-3 text-center">1</td>
                                <td className="border-r-2 border-black py-3 text-center">ต่อคำขอ</td>
                                <td className="border-r-2 border-black py-3 text-right px-2">25,000.00</td>
                                <td className="py-3 text-right px-2">25,000.00</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="font-bold border-t-2 border-black italic">
                                <td colSpan={4} className="border-r-2 border-black py-3 px-4">(สามหมื่นบาทถ้วน)</td>
                                <td className="border-r-2 border-black py-3 px-2 text-center">จำนวนเงินทั้งสิ้น</td>
                                <td className="py-3 text-right px-2">30,000.00</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="text-[10pt] mb-6 space-y-1">
                        <p><span className="font-bold">หมายเหตุ:</span> 1. การชำระเงิน : ภายใน 3 วัน หลังจากได้รับใบวางบิล/ใบแจ้งหนี้</p>
                        <p className="font-bold pl-4">โอนเงินเข้าบัญชี</p>
                        <p className="pl-6">ชื่อบัญชี เงินบำรุงศูนย์พัฒนายาแผนไทยและสมุนไพร</p>
                        <p className="pl-6">บัญชีธนาคารกรุงไทย เลขที่ 4750134376 สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต</p>
                        <p className="pl-6">เลขประจำตัวผู้เสียภาษี 0994000036540</p>
                        <p className="pl-12 font-bold underline">กรณีทำเช็คสั่งจ่ายในนาม : เงินบำรุงศูนย์พัฒนายาแผนไทยและสมุนไพร</p>
                        <p className="pt-2"><span className="font-bold">2. ชื่อ-ที่อยู่ในการออกใบเสร็จรับเงิน และการส่งหลักฐานชำระเงิน :</span></p>
                        <p className="pl-6">เมื่อชำระเงินแล้วกรุณาส่ง ชื่อ-ที่อยู่ในการออกใบเสร็จ พร้อมแนบเอกสารหลักฐานการชำระเงิน</p>
                        <p className="pl-6">มายังกองพัฒนายาแผนไทยและสมุนไพรทาง Google Form</p>

                        <div className="flex justify-end pr-10">
                            <div className="text-center text-[8pt]">
                                <div className="w-16 h-16 border-2 border-black mx-auto flex items-center justify-center mb-1">
                                    <div className="w-12 h-12 bg-black"></div>
                                </div>
                                <span className="font-bold">กรุณาสแกนคิวอาร์โค้ด</span>
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-3 gap-0 border-2 border-black mb-8">
                        <div className="p-4 border-r-2 border-black text-center space-y-4 pb-16">
                            <p className="font-bold">ผู้รับบริการ</p>
                            <div className="mt-12 text-center">
                                <p className="mb-2">(......................................................)</p>
                                <p>ตำแหน่ง......................................................</p>
                                <p className="mt-1">วันที่............/............/............</p>
                                <p className="font-bold text-xs mt-4">{name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-r-2 border-black text-center space-y-4 pb-16">
                            <p className="font-bold">ผู้ให้บริการ</p>
                            <div className="mt-12 text-center text-[9pt]">
                                <p className="font-bold">( นายรชต โมกขพันธ์ )</p>
                                <p>ตำแหน่ง นักวิชาการสาธารณสุข</p>
                                <p className="mt-1">วันที่............/............/............</p>
                                <p className="font-bold text-xs mt-4">กองกัญชาทางการแพทย์</p>
                            </div>
                        </div>
                        <div className="p-4 text-center space-y-4 pb-16">
                            <p className="font-bold">ผู้มีอำนาจลงนาม</p>
                            <div className="mt-12 text-center text-[9pt]">
                                <p className="font-bold">( นายปรีชา หนูทิม )</p>
                                <p>ตำแหน่ง ผู้อำนวยการกองกัญชาทางการแพทย์</p>
                                <p>ปฏิบัติราชการแทน อธิบดีกรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                                <p className="mt-1">วันที่............/............/............</p>
                                <p className="font-bold text-xs mt-4">กองกัญชาทางการแพทย์</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
