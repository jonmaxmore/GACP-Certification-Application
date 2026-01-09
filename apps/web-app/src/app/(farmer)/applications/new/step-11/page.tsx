"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

const FEE_PER_SITE_TYPE = 5000;

export default function Step11Invoice() {
    const router = useRouter();
    const { state, isLoaded } = useWizardStore();
    const [accepted, setAccepted] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount;
    const installment2Fee = 25000;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const invoiceId = `INV-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`.trim()
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';
    const taxId = state.applicantData?.registrationNumber || state.applicantData?.idCard || '-';

    const handleNext = () => {
        if (!isNavigating && accepted) {
            setIsNavigating(true);
            router.push('/applications/new/step-12');
        }
    };
    const handleBack = () => {
        setIsNavigating(true);
        router.push('/applications/new/step-10');
    };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ใบวางบิล/ใบแจ้งหนี้</h1>
                <p className="text-gray-600">งวดที่ 1 - ค่าตรวจสอบและประเมินคำขอเบื้องต้น</p>
            </div>

            {/* Invoice Document */}
            <div id="print-area" className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">

                {/* Document Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src="/images/dtam-logo.png" alt="DTAM" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div>
                                <div className="text-lg font-bold">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                                <div className="text-sm text-blue-200">กระทรวงสาธารณสุข</div>
                                <div className="text-xs text-blue-300 mt-1">โทร. 02-564-7889</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">ใบวางบิล งวดที่ 1</div>
                            <div className="text-xs text-blue-200 mt-2">เลขที่: {invoiceId}</div>
                            <div className="text-xs text-blue-200">วันที่: {docDate}</div>
                        </div>
                    </div>
                </div>

                {/* Recipient Info */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">เรียน</div>
                            <div className="font-semibold text-gray-900">{applicantName || 'ผู้ขอใบรับรอง'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">เลขประจำตัวผู้เสียภาษี</div>
                            <div className="font-mono font-medium text-gray-900">{taxId}</div>
                        </div>
                    </div>
                </div>

                {/* Installment Info Banner */}
                <div className="mx-6 mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                        <div>
                            <div className="font-semibold text-blue-900">ค่าตรวจสอบและประเมินคำขอเบื้องต้น</div>
                            <div className="text-sm text-blue-700">ชำระก่อนเริ่มกระบวนการตรวจสอบเอกสาร</div>
                        </div>
                    </div>
                </div>

                {/* Fee Table */}
                <div className="p-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-l-lg">รายการ</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-20">จำนวน</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-28">ราคา/หน่วย</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700 rounded-r-lg w-28">รวม (บาท)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-4 px-4 text-gray-800">ค่าตรวจสอบและประเมินคำขอเบื้องต้น</td>
                                <td className="py-4 px-4 text-center text-gray-600">{siteTypesCount}</td>
                                <td className="py-4 px-4 text-right text-gray-600">5,000.00</td>
                                <td className="py-4 px-4 text-right font-medium text-gray-900">{installment1Fee.toLocaleString()}.00</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="bg-blue-50">
                                <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-900 rounded-l-lg">ยอดชำระงวดที่ 1</td>
                                <td className="py-4 px-4 text-right font-bold text-xl text-blue-700 rounded-r-lg">{installment1Fee.toLocaleString()}.00</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div className="text-sm text-blue-700 mt-2 font-medium">
                        ({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mx-6 mb-6 p-4 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-sm font-semibold text-gray-800 mb-3">📋 สรุปงวดชำระเงินทั้งหมด</div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                                <span className="text-sm font-medium text-blue-900">ค่าตรวจเอกสาร</span>
                            </div>
                            <span className="text-sm font-bold text-blue-700">฿{installment1Fee.toLocaleString()} ← ชำระครั้งนี้</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center font-bold">2</div>
                                <span className="text-sm text-gray-600">ค่ารับรอง (หลังตรวจผ่าน)</span>
                            </div>
                            <span className="text-sm text-gray-500">฿{installment2Fee.toLocaleString()} ชำระภายหลัง</span>
                        </div>
                    </div>
                </div>

                {/* Bank Info */}
                <div className="p-6 bg-emerald-50 border-t border-emerald-100">
                    <div className="text-sm text-emerald-900">
                        <div className="font-semibold mb-2 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                            </svg>
                            การชำระเงิน
                        </div>
                        <div className="text-emerald-800 space-y-1">
                            <div>• ชำระภายใน 3 วัน หลังได้รับใบวางบิล</div>
                            <div>• <span className="font-medium">ธนาคารกรุงไทย</span> เลขที่บัญชี <span className="font-mono font-bold">475-0-13437-6</span></div>
                            <div>• ชื่อบัญชี: <span className="font-medium">เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Button */}
            <button
                onClick={() => window.print()}
                className="w-full py-3.5 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                </svg>
                พิมพ์ใบวางบิล
            </button>

            {/* Accept Checkbox */}
            <div className={`rounded-xl p-4 border-2 transition-colors ${accepted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                        <span className={`text-sm font-semibold ${accepted ? 'text-blue-800' : 'text-gray-700'}`}>
                            ข้าพเจ้ารับทราบใบวางบิลนี้และตกลงชำระเงินงวดที่ 1 (฿{installment1Fee.toLocaleString()})
                        </span>
                        <div className="text-xs text-gray-500 mt-1">กรุณาทำเครื่องหมายเพื่อดำเนินการชำระเงิน</div>
                    </div>
                </label>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleBack}
                    disabled={isNavigating}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={!accepted || isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${accepted && !isNavigating
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isNavigating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังโหลด...
                        </>
                    ) : (
                        <>
                            ไปชำระเงิน
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18L15 12L9 6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                    }
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
}
