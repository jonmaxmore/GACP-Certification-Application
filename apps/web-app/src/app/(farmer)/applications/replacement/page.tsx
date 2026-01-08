"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient as api } from "@/lib/api";

type ReasonType = 'lost' | 'damaged' | null;

function ReplacementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [isDark, setIsDark] = useState(false);
    const [step, setStep] = useState<'reason' | 'upload' | 'confirm' | 'submitted'>('reason');
    const [reason, setReason] = useState<ReasonType>(null);
    const [policeReport, setPoliceReport] = useState<File | null>(null);
    const [damagedCert, setDamagedCert] = useState<File | null>(null);
    const [certificate, setCertificate] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (certId) loadCertificate(); }, [certId]);

    const loadCertificate = async () => { if (!certId) return; const result = await api.get<any>(`/v2/certificates/${certId}`); if (result.success && result.data?.data) setCertificate(result.data.data); };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const result = await api.post<any>('/api/applications', { serviceType: 'replacement', originalCertificateId: certId, data: { replacementReason: reason, applicantInfo: certificate?.applicantInfo } });
            if (result.success && result.data?.data) setStep('submitted');
        } catch { } finally { setSubmitting(false); }
    };

    const stepLabels = ['เลือกสาเหตุ', 'แนบหลักฐาน', 'ยืนยัน', 'เสร็จสิ้น'];
    const stepKeys = ['reason', 'upload', 'confirm', 'submitted'];
    const stepIndex = stepKeys.indexOf(step);

    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="max-w-xl mx-auto">
                <button onClick={() => router.back()} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${isDark ? 'border-slate-700 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>
                <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ขอใบรับรองแทน</h1>
                <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กรณีใบรับรองสูญหายหรือถูกทำลาย</p>

                {/* Progress Steps */}
                <div className="flex gap-2 mb-8">
                    {stepLabels.map((label, idx) => (
                        <div key={label} className="flex-1 text-center">
                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold ${idx < stepIndex ? 'bg-primary-600 text-white' : idx === stepIndex ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-surface-200 text-slate-500'}`}>{idx + 1}</div>
                            <div className={`text-xs ${idx === stepIndex ? 'text-blue-600' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Step: Reason */}
                {step === 'reason' && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>สาเหตุที่ต้องขอใบรับรองแทน</h3>
                        <div className="space-y-3 mb-6">
                            {[{ value: 'lost', label: 'ใบรับรองสูญหาย', desc: 'ต้องแนบใบแจ้งความจากสถานีตำรวจ' }, { value: 'damaged', label: 'ใบรับรองถูกทำลายหรือลบเลือน', desc: 'ต้องแนบใบรับรองที่ชำรุด' }].map(opt => (
                                <label key={opt.value} className={`block p-4 rounded-xl cursor-pointer ${reason === opt.value ? 'border-2 border-blue-600 bg-blue-50' : (isDark ? 'border border-slate-600' : 'border border-surface-200')}`}>
                                    <input type="radio" name="reason" value={opt.value} checked={reason === opt.value} onChange={() => setReason(opt.value as ReasonType)} className="mr-3" />
                                    <span className={`font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{opt.label}</span>
                                    <p className={`text-sm mt-1 ml-7 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{opt.desc}</p>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => setStep('upload')} disabled={!reason} className={`w-full py-3.5 rounded-xl text-sm font-semibold ${reason ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>ถัดไป →</button>
                    </div>
                )}

                {/* Step: Upload */}
                {step === 'upload' && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{reason === 'lost' ? 'แนบใบแจ้งความ' : 'แนบใบรับรองที่ชำรุด'}</h3>
                        <label className={`flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer mb-6 ${isDark ? 'border-slate-600' : 'border-surface-200'}`}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isDark ? 'text-slate-400' : 'text-slate-500'}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{reason === 'lost' ? (policeReport ? policeReport.name : 'คลิกเพื่ออัปโหลดใบแจ้งความ') : (damagedCert ? damagedCert.name : 'คลิกเพื่ออัปโหลดใบรับรองที่ชำรุด')}</span>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) reason === 'lost' ? setPoliceReport(file) : setDamagedCert(file); }} />
                        </label>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('reason')} className={`flex-1 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>
                            <button onClick={() => setStep('confirm')} disabled={reason === 'lost' ? !policeReport : !damagedCert} className={`flex-1 py-3.5 rounded-xl text-sm font-semibold ${(reason === 'lost' ? policeReport : damagedCert) ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>ถัดไป →</button>
                        </div>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ยืนยันข้อมูล</h3>
                        <div className="bg-secondary-50 border border-secondary-500 rounded-xl p-4 mb-6"><p className="text-sm text-secondary-800">หลังจากส่งคำขอ ทีมงานจะประเมินและส่งใบเสนอราคาให้ท่านผ่านระบบ</p></div>
                        <table className="w-full text-sm mb-6">
                            <tbody>
                                <tr><td className={`py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบรับรองเดิม:</td><td className={`py-2 font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{certificate?.certificateNumber || '-'}</td></tr>
                                <tr><td className={`py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>สาเหตุ:</td><td className={`py-2 font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{reason === 'lost' ? 'ใบรับรองสูญหาย' : 'ใบรับรองถูกทำลาย/ลบเลือน'}</td></tr>
                                <tr><td className={`py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>หลักฐาน:</td><td className={`py-2 font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{reason === 'lost' ? policeReport?.name : damagedCert?.name}</td></tr>
                            </tbody>
                        </table>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('upload')} className={`flex-1 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>
                            <button onClick={handleSubmit} disabled={submitting} className={`flex-1 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40 ${submitting ? 'opacity-70' : ''}`}>{submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}</button>
                        </div>
                    </div>
                )}

                {/* Step: Submitted */}
                {step === 'submitted' && (
                    <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ส่งคำขอเรียบร้อย</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ทีมงานจะตรวจสอบและส่งใบเสนอราคาให้ท่าน<br />กรุณาตรวจสอบในหน้า "การเงิน" เพื่อดูสถานะ</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => router.push('/applications')} className={`px-6 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>กลับหน้าคำขอ</button>
                            <button onClick={() => router.push('/payments')} className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40">ไปหน้าการเงิน</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReplacementLoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-surface-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm">กำลังโหลด...</p>
            </div>
        </div>
    );
}

export default function ReplacementApplicationPage() { return <Suspense fallback={<ReplacementLoadingFallback />}><ReplacementContent /></Suspense>; }
