"use client";

import { RENEWAL_FEE } from './types';

interface PaymentStepProps {
    renewalId: string | null;
    isDark: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

export function PaymentStep({ renewalId, isDark, onBack, onConfirm }: PaymentStepProps) {
    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="max-w-md mx-auto">
                <button onClick={onBack} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${isDark ? 'border-slate-700 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>

                <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ชำระเงินค่าต่อสัญญา</h1>
                <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>สแกน QR Code เพื่อชำระเงิน</p>

                {/* QR Payment Card */}
                <div className={`rounded-2xl p-7 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                    <div className="mb-5">
                        <span className="inline-block px-5 py-2 bg-[#00427A] rounded-lg text-white text-sm font-semibold">พร้อมเพย์ | PromptPay</span>
                    </div>

                    {/* QR Code */}
                    <div className="w-[220px] h-[220px] mx-auto mb-5 bg-white border-2 border-[#00427A] rounded-xl p-2.5 flex items-center justify-center">
                        <img
                            src={`https://promptpay.io/0994566289/${RENEWAL_FEE}.png`}
                            alt="PromptPay QR"
                            className="w-[200px] h-[200px]"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PROMPTPAY:${RENEWAL_FEE}`; }}
                        />
                    </div>

                    {/* Amount */}
                    <div className="p-4 bg-primary-50 rounded-xl mb-5">
                        <p className="text-sm text-slate-500 mb-1">จำนวนเงินที่ต้องชำระ</p>
                        <p className="text-3xl font-bold text-primary-600">฿{RENEWAL_FEE.toLocaleString()}</p>
                    </div>

                    {/* Receiver Info */}
                    <div className={`p-3 rounded-lg text-sm mb-6 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-700'}`}>
                        <p className="mb-1"><strong>ผู้รับเงิน:</strong> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                        <p><strong>หมายเลขเคส:</strong> {renewalId}</p>
                    </div>

                    <button onClick={onConfirm} className="w-full py-4 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white text-base font-semibold shadow-lg shadow-primary-500/40">ยืนยันการชำระเงิน</button>
                </div>
            </div>
        </div>
    );
}
