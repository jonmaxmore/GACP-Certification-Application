"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const FEE_PER_SITE_TYPE = 5000;

export default function Step10Invoice() {
    const router = useRouter();
    const { state, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const quoteId = `G-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const invoiceId = `GI-${quoteId.slice(2)}`;
    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}` : state.applicantData?.applicantType === 'COMMUNITY' ? state.applicantData?.communityName || '' : state.applicantData?.companyName || '';
    const taxId = state.applicantData?.registrationNumber || state.applicantData?.idCard || '-';

    const handleNext = () => { if (!isNavigating && accepted) { setIsNavigating(true); router.push('/applications/new/step-11'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-9'); };

    if (!isLoaded) return <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>;

    return (
        <div className="font-sans">
            {/* Document Preview */}
            <div id="print-area" className="bg-white rounded-lg p-6 mb-4 border border-surface-200 shadow-sm">
                {/* Header */}
                <div className="flex justify-between border-b-2 border-slate-800 pb-3 mb-4">
                    <div className="flex gap-3 items-start">
                        <img src="/images/dtam-logo.png" alt="DTAM" className="w-14 h-14 object-contain" />
                        <div>
                            <div className="text-base font-bold text-slate-800">กองกัญชาทางการแพทย์</div>
                            <div className="text-sm font-semibold text-slate-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div className="text-[11px] text-slate-500">88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm font-semibold">ใบวางบิล/ใบแจ้งหนี้</div>
                        <div className="text-xs mt-1.5 text-slate-700">{docDate}</div>
                        <div className="text-xs text-slate-700">เลขที่: {invoiceId}</div>
                        <div className="text-[11px] text-blue-600 font-semibold">งวดที่ 1</div>
                    </div>
                </div>

                {/* Recipient */}
                <div className="text-[13px] mb-4 text-slate-900">
                    <div className="mb-1"><strong>เรียน</strong> ประธานกรรมการ {applicantName}</div>
                    <div className="grid grid-cols-2 gap-1">
                        <div><strong>หน่วยงาน:</strong> {applicantName}</div>
                        <div className="text-right"><strong>เลขที่:</strong> {invoiceId}</div>
                        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {taxId}</div>
                        <div className="text-right"><strong>วันที่:</strong> {docDate}</div>
                    </div>
                    <div className="mt-1"><strong>ใบเสนอราคาเลขที่:</strong> {quoteId}</div>
                </div>

                {/* Installment Info */}
                <div className="text-xs mb-4 p-2.5 bg-blue-100 rounded-md text-blue-800"><strong>📋 งวดที่ 1:</strong> ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น (ชำระก่อนเริ่มตรวจสอบเอกสาร)</div>

                {/* Fee Table */}
                <table className="w-full border-collapse text-xs mb-3">
                    <thead><tr className="bg-slate-600 text-white"><th className="border border-slate-600 p-2 w-[8%]">ลำดับ</th><th className="border border-slate-600 p-2">รายการ</th><th className="border border-slate-600 p-2 w-[10%]">จำนวน</th><th className="border border-slate-600 p-2 w-[10%]">หน่วย</th><th className="border border-slate-600 p-2 w-[12%]">ราคา/หน่วย</th><th className="border border-slate-600 p-2 w-[14%]">จำนวนเงิน</th></tr></thead>
                    <tbody>
                        <tr><td className="border border-surface-200 p-2 text-center">1.</td><td className="border border-surface-200 p-2">ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td><td className="border border-surface-200 p-2 text-center">{siteTypesCount}</td><td className="border border-surface-200 p-2 text-center">ต่อคำขอ</td><td className="border border-surface-200 p-2 text-right">5,000.00</td><td className="border border-surface-200 p-2 text-right">{installment1Fee.toLocaleString()}.00</td></tr>
                    </tbody>
                    <tfoot><tr className="bg-blue-50"><td colSpan={5} className="border border-surface-200 p-2 text-right font-semibold">ยอดชำระงวดที่ 1</td><td className="border border-surface-200 p-2 text-right font-bold text-sm">{installment1Fee.toLocaleString()}.00</td></tr></tfoot>
                </table>

                <div className="text-xs text-blue-700 mb-4">({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})</div>

                {/* Notes */}
                <div className="text-[11px] mb-4 p-3 bg-secondary-50 rounded-md leading-relaxed">
                    <strong>หมายเหตุ:</strong>
                    <div>1. การชำระเงิน: ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
                    <div className="pl-4">โอนเงินเข้าบัญชี: <strong>ชื่อบัญชีเงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</strong></div>
                    <div className="pl-4">บัญชีธนาคารกรุงไทย เลขที่ <strong>4750134376</strong></div>
                </div>

                {/* Summary */}
                <div className="text-[11px] mb-4 p-2.5 bg-surface-100 rounded-md">
                    <strong>สรุปงวดชำระเงินทั้งหมด:</strong>
                    <div className="mt-1.5 flex flex-col gap-1">
                        <div className="flex justify-between bg-blue-100 p-1.5 rounded"><span>งวดที่ 1: ค่าตรวจเอกสาร</span><span className="font-semibold">฿{installment1Fee.toLocaleString()} ← ชำระครั้งนี้</span></div>
                        <div className="flex justify-between text-slate-500 p-1.5"><span>งวดที่ 2: ค่ารับรอง (หลังตรวจผ่าน)</span><span>฿25,000 ชำระภายหลัง</span></div>
                    </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between gap-3">
                    {['ผู้รับบริการ', 'ผู้ให้บริการ', 'ผู้มีอำนาจลงนาม'].map((title, i) => (
                        <div key={title} className="flex-1 text-center border border-surface-200 p-3 rounded-md">
                            <div className="font-semibold text-xs mb-2">{title}</div>
                            <div className="h-12 mb-2" />
                            <div className="border-t border-slate-900 pt-1.5 text-[11px]">
                                <div>({i === 0 ? applicantName || '............................' : i === 1 ? 'นายรชต โมฆรมิตร' : 'นายปริชา พนูทิม'})</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Button */}
            <button onClick={() => window.print()} className="w-full py-3 rounded-lg mb-3 border border-blue-500 bg-blue-50 text-blue-700 text-sm font-medium flex items-center justify-center gap-2">🖨️ พิมพ์</button>

            {/* Accept Checkbox */}
            <div className={`rounded-lg p-3.5 mb-3.5 border border-blue-500 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="w-5 h-5 accent-blue-600 mt-0.5" />
                    <span className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ข้าพเจ้ารับทราบใบวางบิลนี้และตกลงชำระเงินงวดที่ 1 (฿{installment1Fee.toLocaleString()})</span>
                </label>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button onClick={handleBack} className={`flex-1 py-3.5 rounded-lg text-sm font-medium border ${isDark ? 'border-slate-600 bg-slate-700 text-surface-100' : 'border-surface-200 bg-white text-slate-700'}`}>ย้อนกลับ</button>
                <button onClick={handleNext} disabled={!accepted || isNavigating} className={`flex-[2] py-3.5 rounded-lg text-sm font-semibold ${accepted && !isNavigating ? 'bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>
                    {isNavigating ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />กำลังโหลด...</> : '💳 ยอมรับและไปชำระเงิน'}
                </button>
            </div>

            <style jsx global>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm !important; } @page { size: A4; margin: 10mm; } }`}</style>
        </div>
    );
}
