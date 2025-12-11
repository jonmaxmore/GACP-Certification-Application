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
    const [docs, setDocs] = useState<DocSlot[]>(DOCUMENTS);
    const [videoUrl, setVideoUrl] = useState('');
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.documents?.length) {
            setDocs(DOCUMENTS.map(d => ({
                ...d,
                uploaded: state.documents.some(sd => sd.id === d.id && sd.uploaded)
            })));
        }
    }, [state.documents]);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const handleUpload = (docId: string) => {
        setDocs(prev => {
            const updated = prev.map(d => d.id === docId ? { ...d, uploaded: true } : d);
            setDocuments(updated.filter(d => d.uploaded).map(d => ({ id: d.id, uploaded: true })));
            return updated;
        });
    };

    const handleRemove = (docId: string) => {
        setDocs(prev => {
            const updated = prev.map(d => d.id === docId ? { ...d, uploaded: false } : d);
            setDocuments(updated.filter(d => d.uploaded).map(d => ({ id: d.id, uploaded: true })));
            return updated;
        });
    };

    const uploadedCount = docs.filter(d => d.uploaded).length;
    const requiredUploaded = docs.filter(d => d.required && d.uploaded).length;
    const requiredTotal = docs.filter(d => d.required).length;

    const handleNext = () => router.push('/applications/new/step-8');
    const handleBack = () => router.push('/applications/new/step-6');

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>📄</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '6px' }}>อัปโหลดเอกสาร</h2>
                <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>รายการเอกสารประกอบคำขอ 22 รายการ</p>
            </div>

            {/* Progress */}
            <div style={{ background: isDark ? '#374151' : '#F3F4F6', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>✅ อัปโหลดแล้ว {uploadedCount}/22</span>
                    <span style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>บังคับ: {requiredUploaded}/{requiredTotal}</span>
                </div>
                <div style={{ height: '6px', background: isDark ? '#4B5563' : '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(uploadedCount / 22) * 100}%`, background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
            </div>

            {/* Document List */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {docs.map(doc => (
                    <div key={doc.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                        background: doc.uploaded ? (isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5') : (isDark ? '#1F2937' : 'white'),
                        border: `1px solid ${doc.uploaded ? '#10B981' : (isDark ? '#374151' : '#E5E7EB')}`,
                        borderRadius: '12px',
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: doc.uploaded ? '#10B981' : (isDark ? '#374151' : '#F3F4F6'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: doc.uploaded ? 'white' : (isDark ? '#9CA3AF' : '#6B7280'),
                            fontSize: '14px', fontWeight: 600, flexShrink: 0,
                        }}>
                            {doc.uploaded ? '✓' : doc.label.split('.')[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.label.split('. ')[1]} {doc.required && <span style={{ color: '#EF4444' }}>*</span>}
                            </div>
                        </div>
                        {doc.isUrl ? (
                            <input type="url" value={doc.id === 'video_url' ? videoUrl : ''} onChange={e => { setVideoUrl(e.target.value); if (e.target.value) handleUpload(doc.id); else handleRemove(doc.id); }} placeholder="https://..." style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`, fontSize: '12px', background: isDark ? '#1F2937' : 'white', color: isDark ? '#F9FAFB' : '#111827' }} />
                        ) : (
                            <>
                                <input ref={el => { inputRefs.current[doc.id] = el; }} type="file" accept="image/*,.pdf" onChange={() => handleUpload(doc.id)} style={{ display: 'none' }} />
                                {doc.uploaded ? (
                                    <button onClick={() => handleRemove(doc.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2', color: '#DC2626', fontSize: '12px', cursor: 'pointer' }}>ลบ</button>
                                ) : (
                                    <button onClick={() => inputRefs.current[doc.id]?.click()} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10B981', color: 'white', fontSize: '12px', cursor: 'pointer' }}>เลือก</button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
                    ถัดไป
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
