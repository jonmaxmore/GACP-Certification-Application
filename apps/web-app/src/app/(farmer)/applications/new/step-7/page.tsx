"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

interface DocSlot { id: string; label: string; required: boolean; hint?: string; uploaded?: boolean; isUrl?: boolean; }

const DOCUMENTS: DocSlot[] = [
    { id: 'form_registration', label: '1. แบบลงทะเบียนยื่นคำขอ', required: true, hint: 'ดาวน์โหลดแบบฟอร์มจากเว็บไซต์กรมฯ' },
    { id: 'land_ownership', label: '2. หนังสือแสดงกรรมสิทธิ์ที่ดิน/โฉนด', required: false },
    { id: 'land_consent', label: '3. หนังสือยินยอมใช้ที่ดิน', required: false },
    { id: 'site_map', label: '4. แผนที่ตั้ง + พิกัด GPS', required: false },
    { id: 'building_plan', label: '5. แบบแปลนอาคาร/โรงเรือน', required: false },
    { id: 'exterior_photo', label: '6. ภาพถ่ายบริเวณภายนอก', required: false },
    { id: 'production_plan', label: '7. แผนการผลิตแต่ละรอบ/ปี', required: false },
    { id: 'security_plan', label: '8. มาตรการรักษาความปลอดภัย', required: false },
    { id: 'interior_photo', label: '9. ภาพถ่ายภายในสถานที่ผลิต', required: false },
    { id: 'sop_manual', label: '10. คู่มือ SOP (ฉบับภาษาไทย)', required: false },
    { id: 'elearning_cert', label: '11. หนังสือรับรอง E-learning GACP', required: false },
    { id: 'variety_cert', label: '12. หนังสือรับรองสายพันธุ์', required: false },
    { id: 'staff_training', label: '13. เอกสารการอบรมพนักงาน', required: false },
    { id: 'staff_test', label: '14. แบบทดสอบพนักงาน', required: false },
    { id: 'soil_test', label: '15. ผลตรวจวัสดุปลูก/ดิน', required: false },
    { id: 'water_test', label: '16. ผลตรวจน้ำ', required: false },
    { id: 'flower_test', label: '17. ผลตรวจช่อดอก (กัญชา)', required: false },
    { id: 'input_report', label: '18. รายงานปัจจัยการผลิต', required: false },
    { id: 'cp_ccp_table', label: '19. ตารางแผนควบคุม CP/CCP', required: false },
    { id: 'calibration_cert', label: '20. ใบสอบเทียบเครื่องมือ', required: false },
    { id: 'video_url', label: '21. ลิงก์วิดีโอสถานที่', required: false, isUrl: true },
    { id: 'additional_docs', label: '22. เอกสารเพิ่มเติม', required: false },
];

export default function Step7Documents() {
    const router = useRouter();
    const { state, setDocuments, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [docs, setDocs] = useState<DocSlot[]>(DOCUMENTS);
    const [videoUrl, setVideoUrl] = useState('');
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.documents?.length) setDocs(DOCUMENTS.map(d => ({ ...d, uploaded: state.documents.some(sd => sd.id === d.id && sd.uploaded) })));
    }, [state.documents]);

    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const handleUpload = (docId: string) => setDocs(prev => { const updated = prev.map(d => d.id === docId ? { ...d, uploaded: true } : d); setDocuments(updated.filter(d => d.uploaded).map(d => ({ id: d.id, uploaded: true }))); return updated; });
    const handleRemove = (docId: string) => setDocs(prev => { const updated = prev.map(d => d.id === docId ? { ...d, uploaded: false } : d); setDocuments(updated.filter(d => d.uploaded).map(d => ({ id: d.id, uploaded: true }))); return updated; });

    const uploadedCount = docs.filter(d => d.uploaded).length;
    const requiredUploaded = docs.filter(d => d.required && d.uploaded).length;
    const requiredTotal = docs.filter(d => d.required).length;

    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); router.push('/applications/new/step-8'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-6'); };

    if (!isLoaded) return <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-violet-500/30 ${isDark ? 'bg-gradient-to-br from-violet-600 to-violet-500' : 'bg-gradient-to-br from-violet-500 to-violet-400'}`}>
                    <span className="text-2xl">📄</span>
                </div>
                <h2 className={`text-xl font-semibold mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>อัปโหลดเอกสาร</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>รายการเอกสารประกอบคำขอ 22 รายการ</p>
            </div>

            {/* Progress */}
            <div className={`rounded-xl px-4 py-3.5 mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-emerald-500 font-medium">✅ อัปโหลดแล้ว {uploadedCount}/22</span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>บังคับ: {requiredUploaded}/{requiredTotal}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: `${(uploadedCount / 22) * 100}%` }} />
                </div>
            </div>

            {/* Document List */}
            <div className="max-h-80 overflow-y-auto mb-5 flex flex-col gap-2">
                {docs.map(doc => (
                    <div key={doc.id} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${doc.uploaded ? `${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} border-emerald-500` : `${isDark ? 'bg-slate-800' : 'bg-white'} ${isDark ? 'border-slate-700' : 'border-slate-200'}`}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${doc.uploaded ? 'bg-emerald-500 text-white' : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                            {doc.uploaded ? '✓' : doc.label.split('.')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {doc.label.split('. ')[1]} {doc.required && <span className="text-red-500">*</span>}
                            </div>
                        </div>
                        {doc.isUrl ? (
                            <input type="url" value={doc.id === 'video_url' ? videoUrl : ''} onChange={e => { setVideoUrl(e.target.value); if (e.target.value) handleUpload(doc.id); else handleRemove(doc.id); }}
                                placeholder="https://..." className={`w-28 px-2.5 py-1.5 rounded-md border text-xs ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} />
                        ) : (
                            <>
                                <input ref={el => { inputRefs.current[doc.id] = el; }} type="file" accept="image/*,.pdf" onChange={() => handleUpload(doc.id)} className="hidden" />
                                {doc.uploaded ? (
                                    <button onClick={() => handleRemove(doc.id)} className={`px-3 py-1.5 rounded-md text-xs ${isDark ? 'bg-red-500/20' : 'bg-red-50'} text-red-500`}>ลบ</button>
                                ) : (
                                    <button onClick={() => inputRefs.current[doc.id]?.click()} className="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs">เลือก</button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button onClick={handleBack} className={`flex-1 py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-1.5 border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg> ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-1.5 transition-all ${isNavigating ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/40'}`}>
                    {isNavigating ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
                </button>
            </div>
        </div>
    );
}
