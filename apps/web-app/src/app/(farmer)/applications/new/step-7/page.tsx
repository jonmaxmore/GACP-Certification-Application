"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';

interface DocSlot {
    id: string;
    label: string;
    required: boolean;
    hint?: string;
    uploaded?: boolean;
    isUrl?: boolean;
    url?: string;
    fileName?: string;
    fileType?: string;
}

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
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.documents?.length) {
            setDocs(DOCUMENTS.map(d => {
                const savedDoc = state.documents.find(sd => sd.id === d.id);
                return {
                    ...d,
                    uploaded: !!savedDoc?.uploaded,
                    url: savedDoc?.url,
                    fileName: savedDoc?.name,
                    fileType: savedDoc?.type
                };
            }));

            // Restore video URL if present
            const videoDoc = state.documents.find(sd => sd.id === 'video_url');
            if (videoDoc?.url) {
                setVideoUrl(videoDoc.url);
            }
        }
    }, [state.documents]);

    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const updateStore = (currentDocs: DocSlot[]) => {
        setDocuments(currentDocs.filter(d => d.uploaded).map(d => ({
            id: d.id,
            uploaded: true,
            url: d.url,
            name: d.fileName,
            type: d.fileType
        })));
    };

    const handleUpload = async (docId: string) => {
        const fileInput = inputRefs.current[docId];
        if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

        const file = fileInput.files[0];

        // Allowed types
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('รองรับเฉพาะไฟล์ .jpg, .png และ .pdf เท่านั้น');
            return;
        }

        // Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
            return;
        }

        setUploading(prev => ({ ...prev, [docId]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            const { url, filename, mimetype } = result.data;

            setDocs(prev => {
                const updated = prev.map(d => d.id === docId ? {
                    ...d,
                    uploaded: true,
                    url: url,
                    fileName: filename,
                    fileType: mimetype
                } : d);

                // Update global store
                updateStore(updated);

                return updated;
            });

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setUploading(prev => ({ ...prev, [docId]: false }));
            // Reset input value to allow re-uploading same file if needed
            if (fileInput) fileInput.value = '';
        }
    };

    const handleVideoUrlChange = (url: string) => {
        setVideoUrl(url);
        if (url && url.trim() !== '') {
            setDocs(prev => {
                const updated = prev.map(d => d.id === 'video_url' ? {
                    ...d,
                    uploaded: true,
                    url: url,
                    fileName: 'video_link',
                    fileType: 'url'
                } : d);
                updateStore(updated);
                return updated;
            });
        } else {
            setDocs(prev => {
                const updated = prev.map(d => d.id === 'video_url' ? {
                    ...d,
                    uploaded: false,
                    url: undefined,
                    fileName: undefined,
                    fileType: undefined
                } : d);
                updateStore(updated);
                return updated;
            });
        }
    };

    const handleRemove = (docId: string) => {
        setDocs(prev => {
            const updated = prev.map(d => d.id === docId ? {
                ...d,
                uploaded: false,
                url: undefined,
                fileName: undefined,
                fileType: undefined
            } : d);

            updateStore(updated);

            return updated;
        });

        if (docId === 'video_url') {
            setVideoUrl('');
        }
    };

    const uploadedCount = docs.filter(d => d.uploaded).length;
    const requiredUploaded = docs.filter(d => d.required && d.uploaded).length;
    const requiredTotal = docs.filter(d => d.required).length;

    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); router.push('/applications/new/step-8'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-6'); };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">อัปโหลดเอกสาร</h1>
                <p className="text-gray-600">รายการเอกสารประกอบคำขอ 22 รายการ</p>
            </div>

            {/* Progress */}
            <div className={`rounded-xl px-4 py-3.5 mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-emerald-500 font-medium">อัปโหลดแล้ว {uploadedCount}/22</span>
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
                            {doc.uploaded ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg> : doc.label.split('.')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                {doc.label.split('. ')[1]} {doc.required && <span className="text-red-500">*</span>}
                            </div>
                            {doc.fileName && <div className="text-xs text-slate-400 truncate">{doc.fileName}</div>}
                        </div>
                        {doc.isUrl ? (
                            <input type="url" value={doc.id === 'video_url' ? videoUrl : ''} onChange={e => handleVideoUrlChange(e.target.value)}
                                placeholder="https://..." className={`w-28 px-2.5 py-1.5 rounded-md border text-xs ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} />
                        ) : (
                            <>
                                <input ref={el => { inputRefs.current[doc.id] = el; }} type="file" accept="image/*,.pdf" onChange={() => handleUpload(doc.id)} className="hidden" />
                                {uploading[doc.id] ? (
                                    <div className="px-3 py-1.5 text-xs text-slate-500">
                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                                    </div>
                                ) : doc.uploaded ? (
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
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={isNavigating}
                    className={`flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all ${isNavigating
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30'
                        }`}
                >
                    {isNavigating ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>
                    ) : (
                        <>
                            ถัดไป
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
