"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient as api } from "@/lib/api";

interface EditableField { key: string; label: string; value: string; originalValue: string; isModified: boolean; }

function AmendmentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const certId = searchParams.get('certId');

    const [isDark, setIsDark] = useState(false);
    const [step, setStep] = useState<'select' | 'edit' | 'confirm' | 'submitted'>('select');
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fields, setFields] = useState<EditableField[]>([]);
    const [changeDescription, setChangeDescription] = useState('');

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (certId) loadCertificate(); }, [certId]);

    const loadCertificate = async () => {
        if (!certId) return;
        setLoading(true);
        const result = await api.get<any>(`/certificates/${certId}`);
        if (result.success && result.data?.data) {
            const cert = result.data.data;
            setCertificate(cert);
            setFields([
                { key: 'siteName', label: 'ชื่อสถานประกอบการ', value: cert.siteName || '', originalValue: cert.siteName || '', isModified: false },
                { key: 'address', label: 'ที่อยู่', value: cert.address || '', originalValue: cert.address || '', isModified: false },
                { key: 'contactPhone', label: 'เบอร์โทรศัพท์', value: cert.contactPhone || '', originalValue: cert.contactPhone || '', isModified: false },
                { key: 'contactEmail', label: 'อีเมล', value: cert.contactEmail || '', originalValue: cert.contactEmail || '', isModified: false },
            ]);
        }
        setLoading(false);
    };

    const handleFieldChange = (key: string, newValue: string) => setFields(prev => prev.map(f => f.key === key ? { ...f, value: newValue, isModified: newValue !== f.originalValue } : f));
    const modifiedFields = fields.filter(f => f.isModified);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const changes = modifiedFields.reduce((acc, f) => { acc[f.key] = { from: f.originalValue, to: f.value }; return acc; }, {} as Record<string, { from: string; to: string }>);
            const result = await api.post<any>('/api/applications', { serviceType: 'amendment', originalCertificateId: certId, data: { changes, changeDescription, applicantInfo: certificate?.applicantInfo } });
            if (result.success) setStep('submitted');
        } catch { } finally { setSubmitting(false); }
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-surface-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">กำลังโหลดข้อมูลใบรับรอง...</p>
            </div>
        </div>
    );

    const stepLabels = ['เลือกข้อมูล', 'แก้ไข', 'ยืนยัน', 'เสร็จสิ้น'];
    const stepKeys = ['select', 'edit', 'confirm', 'submitted'];
    const stepIndex = stepKeys.indexOf(step);

    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${isDark ? 'border-slate-700 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← ย้อนกลับ</button>
                <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>แก้ไขข้อมูลในใบรับรอง</h1>
                <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบรับรองเลขที่: <strong>{certificate?.certificateNumber || '-'}</strong></p>

                {/* Progress Steps */}
                <div className="flex gap-2 mb-8">
                    {stepLabels.map((label, idx) => (
                        <div key={label} className="flex-1 text-center">
                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold ${idx < stepIndex ? 'bg-primary-600 text-white' : idx === stepIndex ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-surface-200 text-slate-500'}`}>{idx + 1}</div>
                            <div className={`text-xs ${idx === stepIndex ? 'text-blue-600' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Step: Edit */}
                {(step === 'select' || step === 'edit') && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>แก้ไขข้อมูลที่ต้องการเปลี่ยนแปลง</h3>
                        <div className="space-y-4 mb-6">
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label className={`block text-sm mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{field.label} {field.isModified && <span className="text-secondary-500 ml-2">● แก้ไขแล้ว</span>}</label>
                                    <input type="text" value={field.value} onChange={(e) => handleFieldChange(field.key, e.target.value)} className={`w-full px-3.5 py-3 rounded-lg text-sm outline-none ${field.isModified ? 'border-2 border-secondary-500' : (isDark ? 'border border-slate-600 bg-slate-700 text-surface-100' : 'border border-surface-200 text-slate-900')}`} />
                                    {field.isModified && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เดิม: {field.originalValue}</p>}
                                </div>
                            ))}
                        </div>
                        <div className="mb-6">
                            <label className={`block text-sm mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>เหตุผลในการแก้ไข <span className="text-red-500">*</span></label>
                            <textarea value={changeDescription} onChange={(e) => setChangeDescription(e.target.value)} placeholder="อธิบายสาเหตุ..." className={`w-full px-3.5 py-3 rounded-lg text-sm outline-none resize-y min-h-[100px] ${isDark ? 'border border-slate-600 bg-slate-700 text-surface-100' : 'border border-surface-200 text-slate-900'}`} />
                        </div>
                        <button onClick={() => setStep('confirm')} disabled={modifiedFields.length === 0 || !changeDescription.trim()} className={`w-full py-3.5 rounded-xl text-sm font-semibold ${modifiedFields.length > 0 && changeDescription.trim() ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>ตรวจสอบการแก้ไข ({modifiedFields.length} รายการ) →</button>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <h3 className={`text-base font-semibold mb-4 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ยืนยันการแก้ไข</h3>
                        <div className="bg-secondary-50 border border-secondary-500 rounded-xl p-4 mb-6"><p className="text-sm text-secondary-800">หลังจากส่งคำขอ ทีมงานจะประเมินและส่งใบเสนอราคาให้ท่านผ่านระบบ</p></div>
                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>รายการที่แก้ไข:</h4>
                        <div className="space-y-2 mb-6">
                            {modifiedFields.map(field => (
                                <div key={field.key} className={`p-3 rounded-lg border ${isDark ? 'border-slate-600' : 'border-surface-200'}`}>
                                    <div className={`font-medium mb-1 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{field.label}</div>
                                    <div className="text-sm"><span className="text-red-500 line-through">{field.originalValue}</span><span className={`mx-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>→</span><span className="text-primary-600 font-medium">{field.value}</span></div>
                                </div>
                            ))}
                        </div>
                        <div className={`p-3 rounded-lg mb-6 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                            <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>เหตุผล:</div>
                            <div className={`text-sm ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{changeDescription}</div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('edit')} className={`flex-1 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>← แก้ไขเพิ่มเติม</button>
                            <button onClick={handleSubmit} disabled={submitting} className={`flex-1 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40 ${submitting ? 'opacity-70' : ''}`}>{submitting ? 'กำลังส่ง...' : 'ส่งคำขอแก้ไข'}</button>
                        </div>
                    </div>
                )}

                {/* Step: Submitted */}
                {step === 'submitted' && (
                    <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>
                        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ส่งคำขอแก้ไขเรียบร้อย</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ทีมงานจะตรวจสอบและส่งใบเสนอราคาให้ท่าน<br />กรุณาตรวจสอบในหน้า &quot;การเงิน&quot; เพื่อดูสถานะ</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => router.push('/farmer/applications')} className={`px-6 py-3.5 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>กลับหน้าคำขอ</button>
                            <button onClick={() => router.push('/payments')} className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40">ไปหน้าการเงิน</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function AmendmentLoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-surface-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm">กำลังโหลด...</p>
            </div>
        </div>
    );
}

export default function AmendmentApplicationPage() { return <Suspense fallback={<AmendmentLoadingFallback />}><AmendmentContent /></Suspense>; }
