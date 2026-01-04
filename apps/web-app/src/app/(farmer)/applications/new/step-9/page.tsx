"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const FEE_PER_SITE_TYPE = 5000;

export default function Step9Quote() {
    const router = useRouter();
    const { state, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const fee1 = FEE_PER_SITE_TYPE * siteTypesCount;
    const fee2 = 25000;
    const totalFee = fee1 + fee2;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const quoteId = `G-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}` : state.applicantData?.applicantType === 'COMMUNITY' ? state.applicantData?.communityName || '' : state.applicantData?.companyName || '';
    const taxId = state.applicantData?.registrationNumber || state.applicantData?.idCard || '-';

    const handleNext = () => { if (!isNavigating && accepted) { setIsNavigating(true); router.push('/applications/new/step-10'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-8'); };

    if (!isLoaded) return <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>;

    return (
        <div className="font-sans">
            {/* Document Preview */}
            <div id="print-area" className="bg-white rounded-lg p-6 mb-4 border border-surface-200 shadow-sm print:absolute print:inset-0 print:p-8 print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between border-b-2 border-slate-800 pb-3 mb-4">
                    <div className="flex gap-3 items-start">
                        <img src="/images/dtam-logo.png" alt="DTAM" className="w-14 h-14 object-contain" />
                        <div>
                            <div className="text-base font-bold text-slate-800">กองกัญชาทางการแพทย์</div>
                            <div className="text-sm font-semibold text-slate-800">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div className="text-[11px] text-slate-500">88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</div>
                            <div className="text-[11px] text-slate-500">โทรศัพท์ (02) 5647889 หรือ 061-4219701</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm font-semibold">ใบเสนอราคา</div>
                        <div className="text-xs mt-1.5 text-slate-700">{docDate}</div>
                        <div className="text-xs text-slate-700">เลขที่: {quoteId}</div>
                    </div>
                </div>

                {/* Recipient */}
                <div className="text-[13px] mb-4 text-slate-900">
                    <div className="mb-1"><strong>เรียน</strong> ประธานกรรมการ {applicantName}</div>
                    <div className="grid grid-cols-2 gap-1">
                        <div><strong>หน่วยงาน:</strong> {applicantName}</div>
                        <div className="text-right"><strong>เลขที่:</strong> {quoteId}</div>
                        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {taxId}</div>
                        <div className="text-right"><strong>วันที่:</strong> {docDate}</div>
                    </div>
                    <div className="mt-1"><strong>ที่อยู่:</strong> {state.siteData?.address || '-'}, จ.{state.siteData?.province || '-'}</div>
                </div>

                {/* Fee Table */}
                <table className="w-full border-collapse text-xs mb-3">
                    <thead><tr className="bg-slate-600 text-white"><th className="border border-slate-600 p-2 w-[8%]">ลำดับ</th><th className="border border-slate-600 p-2">รายการ</th><th className="border border-slate-600 p-2 w-[10%]">จำนวน</th><th className="border border-slate-600 p-2 w-[10%]">หน่วย</th><th className="border border-slate-600 p-2 w-[12%]">ราคา/หน่วย</th><th className="border border-slate-600 p-2 w-[14%]">จำนวนเงิน</th></tr></thead>
                    <tbody>
                        <tr><td className="border border-surface-200 p-2 text-center">1.</td><td className="border border-surface-200 p-2">ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td><td className="border border-surface-200 p-2 text-center">{siteTypesCount}</td><td className="border border-surface-200 p-2 text-center">ต่อคำขอ</td><td className="border border-surface-200 p-2 text-right">5,000.00</td><td className="border border-surface-200 p-2 text-right">{fee1.toLocaleString()}.00</td></tr>
                        <tr><td className="border border-surface-200 p-2 text-center">2.</td><td className="border border-surface-200 p-2">ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน</td><td className="border border-surface-200 p-2 text-center">1</td><td className="border border-surface-200 p-2 text-center">ต่อคำขอ</td><td className="border border-surface-200 p-2 text-right">25,000.00</td><td className="border border-surface-200 p-2 text-right">25,000.00</td></tr>
                    </tbody>
                    <tfoot><tr><td colSpan={5} className="border border-surface-200 p-2 text-right font-semibold">จำนวนเงินทั้งสิ้น</td><td className="border border-surface-200 p-2 text-right font-bold text-sm">{totalFee.toLocaleString()}.00</td></tr></tfoot>
                </table>

                <div className="text-xs text-secondary-600 mb-4">({totalFee === 30000 ? 'สามหมื่นบาทถ้วน' : totalFee === 35000 ? 'สามหมื่นห้าพันบาทถ้วน' : 'สี่หมื่นบาทถ้วน'})</div>

                {/* Notes */}
                <div className="text-[11px] mb-5 p-3 bg-secondary-50 rounded-md leading-relaxed">
                    <strong>หมายเหตุ:</strong>
                    <div>1. การชำระเงิน: ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
                    <div className="pl-4">โอนเงินเข้าบัญชี: <strong>ชื่อบัญชีเงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</strong></div>
                    <div className="pl-4">บัญชีธนาคารกรุงไทย เลขที่ <strong>4750134376</strong></div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between gap-3 print:gap-6">
                    {['ผู้รับบริการ', 'ผู้ให้บริการ', 'ผู้มีอำนาจลงนาม'].map((title, i) => (
                        <div key={title} className="flex-1 text-center border border-surface-200 p-3 rounded-md">
                            <div className="font-semibold text-xs mb-2">{title}</div>
                            <div className="h-12 mb-2" />
                            <div className="border-t border-slate-900 pt-1.5 text-[11px]">
                                <div>({i === 0 ? applicantName || '............................' : i === 1 ? 'นายรชต โมฆรมิตร' : 'นายปริชา พนูทิม'})</div>
                                <div className="text-slate-500 text-[10px]">{i === 0 ? 'ตำแหน่ง............................' : i === 1 ? 'นักวิชาการสาธารณสุข' : 'ผู้อำนวยการกองกัญชาทางการแพทย์'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Print Button */}
            <button onClick={() => window.print()} className="w-full py-3 rounded-lg mb-3 border border-secondary-500 bg-secondary-50 text-secondary-700 text-sm font-medium flex items-center justify-center gap-2">🖨️ พิมพ์</button>

            {/* Accept Checkbox */}
            <div className={`rounded-lg p-3.5 mb-3.5 border border-primary-600 ${isDark ? 'bg-primary-500/10' : 'bg-primary-50'}`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="w-5 h-5 accent-primary-600 mt-0.5" />
                    <span className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ข้าพเจ้ารับทราบใบวางบิลนี้และตกลงชำระเงินตามเงื่อนไข</span>
                </label>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button onClick={handleBack} className={`flex-1 py-3.5 rounded-lg text-sm font-medium border ${isDark ? 'border-slate-600 bg-slate-700 text-surface-100' : 'border-surface-200 bg-white text-slate-700'}`}>ย้อนกลับ</button>
                <button onClick={handleNext} disabled={!accepted || isNavigating} className={`flex-[2] py-3.5 rounded-lg text-sm font-semibold ${accepted && !isNavigating ? 'bg-gradient-to-br from-primary-700 to-primary-500 text-white shadow-lg shadow-primary-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>
                    {isNavigating ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />กำลังโหลด...</> : '✓ ยอมรับและดำเนินการต่อ'}
                </button>
            </div>

            <style jsx global>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm !important; } @page { size: A4; margin: 10mm; } }`}</style>
        </div>
    );
}
