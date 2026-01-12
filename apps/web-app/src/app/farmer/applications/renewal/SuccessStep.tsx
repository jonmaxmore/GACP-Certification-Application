"use client";

import Link from 'next/link';
import { Certificate, RENEWAL_FEE } from './types';

interface SuccessStepProps {
    certificate: Certificate | null;
    renewalId: string | null;
    isDark: boolean;
}

export function SuccessStep({ certificate, renewalId, isDark }: SuccessStepProps) {
    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-gradient-to-b from-primary-50 to-surface-100'}`}>
            {/* Confetti */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                {[...Array(30)].map((_, i) => (
                    <div key={i} className="absolute animate-[confetti_2s_ease-out_forwards]" style={{ width: `${8 + Math.random() * 8}px`, height: `${8 + Math.random() * 8}px`, background: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5], borderRadius: i % 3 === 0 ? '50%' : '2px', left: `${Math.random() * 100}%`, top: '-20px', animationDelay: `${Math.random() * 0.8}s` }} />
                ))}
            </div>

            <div className="text-center pt-10">
                {/* Success Icon */}
                <div className="w-[90px] h-[90px] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary-500/40 animate-[scaleIn_0.5s_ease-out]">
                    <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg>
                </div>

                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-surface-100' : 'text-primary-800'}`}>ต่อสัญญาสำเร็จ!</h1>
                <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-primary-600'}`}>ขอบคุณสำหรับการต่ออายุใบรับรอง GACP</p>

                {/* Case Number */}
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary-600 mb-6 shadow-sm ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>หมายเลขเคส:</span>
                    <strong className="text-base text-primary-600 tracking-wide">{renewalId}</strong>
                </div>

                {/* Summary Card */}
                <div className={`rounded-2xl p-6 max-w-md mx-auto mb-6 text-left shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>สรุปการต่อสัญญา</h3>
                    <div className="grid gap-3">
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>
                            <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบรับรองเลขที่</div>
                            <div className="text-sm font-semibold text-primary-600">{certificate?.certificateNumber}</div>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-surface-100'}`}>
                            <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>สถานที่</div>
                            <div className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{certificate?.siteName}</div>
                        </div>
                        <div className="p-3 bg-primary-50 border border-primary-600 rounded-lg">
                            <div className="text-xs text-primary-800 mb-1">จำนวนเงินที่ชำระ</div>
                            <div className="text-xl font-bold text-primary-600">฿{RENEWAL_FEE.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <Link href="/tracking" className="py-4 px-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 text-white text-base font-semibold text-center flex items-center justify-center gap-2.5 shadow-xl shadow-primary-500/40">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        ติดตามสถานะ
                    </Link>
                    <Link href="/farmer/dashboard" className={`py-4 px-6 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2 border-2 ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100' : 'bg-white border-surface-200 text-slate-700'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        กลับหน้าหลัก
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            `}</style>
        </div>
    );
}
