"use client";

import { useState, useRef } from 'react';
import { PlantId, ServiceType, DocumentUpload, RESOURCE_LINKS } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

// Icons
const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

interface DocSlot {
    id: string;
    label: string;
    required: boolean;
    hint: string;
    downloadUrl?: string;
    isUrl?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    file?: File;
    files?: File[];
    url?: string;
}

// Official GACP 22 Documents
function getDocumentList(plantId: PlantId | null, serviceType: ServiceType | null): DocSlot[] {
    const isHighControl = plantId === 'CAN' || plantId === 'KRA';
    const isReplacement = serviceType === 'REPLACEMENT';

    if (isReplacement) {
        return [
            { id: 'id_card', label: 'สำเนาบัตรประชาชน', required: true, hint: 'สำเนาบัตรประจำตัวประชาชนด้านหน้าและหลัง พร้อมรับรองสำเนาถูกต้อง' },
            { id: 'police_report', label: 'ใบแจ้งความ (กรณีสูญหาย)', required: false, hint: 'ใบแจ้งความจากสถานีตำรวจ กรณีใบรับรองสูญหาย' },
            { id: 'damaged_cert', label: 'รูปถ่ายใบรับรองชำรุด', required: false, hint: 'รูปถ่ายใบรับรองที่ชำรุด แสดงให้เห็นความเสียหาย' },
        ];
    }

    // Full 22 Documents for NEW/RENEWAL - Most are OPTIONAL per user request
    const docs: DocSlot[] = [
        // กลุ่มที่ 1: เอกสารพื้นฐาน
        { id: 'form_registration', label: '1. แบบลงทะเบียนยื่นคำขอ', required: true, hint: 'ดาวน์โหลดแบบฟอร์มจากลิงก์ กรอกและสแกนเป็น PDF ** บังคับ', downloadUrl: RESOURCE_LINKS.formDownload },
        { id: 'land_ownership', label: '2. หนังสือแสดงกรรมสิทธิ์ที่ดิน/โฉนด', required: false, hint: 'สำเนาโฉนดที่ดินหรือหนังสืออนุญาตใช้ที่ดินของรัฐ ที่เป็นพื้นที่ปลูก/แปรรูป' },
        { id: 'land_consent', label: '3. หนังสือยินยอมใช้ที่ดิน', required: false, hint: 'กรณีขอเช่าหรือใช้ที่ดินของบุคคลอื่น ต้องดำเนินการถูกต้องตามกฎหมาย' },
        { id: 'site_map', label: '4. แผนที่ตั้ง + พิกัด GPS', required: false, hint: 'แผนที่แสดงที่ตั้ง ค่าพิกัดแปลงปลูก ขนาดแปลง เส้นทางเข้าถึง และสิ่งปลูกสร้างใกล้เคียง' },
        { id: 'building_plan', label: '5. แบบแปลนอาคาร/โรงเรือน', required: false, hint: 'แบบแปลนอาจเป็นภาพสเกตช์หรือวาดมือ พร้อมมาตราส่วนโดยประมาณ' },
        { id: 'exterior_photo', label: '6. ภาพถ่ายบริเวณภายนอก', required: false, hint: 'รูปถ่ายด้านนอกอาคาร/โรงเรือน อย่างน้อย 4 ด้าน (ทิศเหนือ ใต้ ออก ตก)' },

        // กลุ่มที่ 2: แผนการดำเนินงาน
        { id: 'production_plan', label: '7. แผนการผลิตแต่ละรอบ/ปี', required: false, hint: 'แผนการเพาะปลูก ปริมาณ และแผนการใช้ประโยชน์/แปรรูป' },
        { id: 'security_plan', label: '8. มาตรการรักษาความปลอดภัย', required: false, hint: 'มาตรการรักษาความปลอดภัยและวิธีจัดการส่วนที่เหลือของพืช' },
        { id: 'interior_photo', label: '9. ภาพถ่ายภายในสถานที่ผลิต', required: false, hint: 'ภาพถ่ายแปลงปลูก ระบบน้ำ ระบบไฟ และอุปกรณ์ที่ใช้' },

        // กลุ่มที่ 3: SOP และการอบรม
        { id: 'sop_manual', label: '10. คู่มือ SOP (ฉบับภาษาไทย)', required: false, hint: 'ระบุทุกขั้นตอน: เพาะเมล็ด, เพาะเลี้ยงแม่พันธุ์, ทำใบ/ดอก, เก็บเกี่ยว, ทำแห้ง, ทริม, บ่ม, บรรจุ, จัดเก็บ, กำจัดของเสีย, อบรมบุคลากร รวมถึงเอกสารรับรองแหล่งที่มาเมล็ดพันธุ์ ผลวิเคราะห์ดิน/น้ำ รายการสารเคมี/ปุ๋ย และบันทึกผลการปฏิบัติงาน', downloadUrl: RESOURCE_LINKS.sopVideoGuide },
        { id: 'elearning_cert', label: '11. หนังสือรับรอง E-learning GACP', required: false, hint: 'หนังสือรับรองจากหลักสูตร Thailand Cannabis GACP ออนไลน์' },
        { id: 'variety_cert', label: '12. หนังสือรับรองสายพันธุ์', required: false, hint: 'เอกสารรับรองแหล่งที่มาและสายพันธุ์ของพืช' },
        { id: 'staff_training', label: '13. เอกสารการอบรมพนักงาน', required: false, hint: 'หลักฐานการฝึกอบรมพนักงานภายในองค์กร' },
        { id: 'staff_test', label: '14. แบบทดสอบพนักงาน (ก่อน/หลัง)', required: false, hint: 'แบบทดสอบความรู้พนักงานก่อนและหลังอบรม พร้อมผลคะแนน' },

        // กลุ่มที่ 4: ผลตรวจวิเคราะห์
        { id: 'soil_test', label: '15. ผลตรวจวัสดุปลูก/ดิน', required: false, hint: 'ผลวิเคราะห์โลหะหนัก (ตะกั่ว แคดเมียม ปรอท สารหนู) จากห้องแล็บที่ได้รับการรับรอง อายุไม่เกิน 1 ปี' },
        { id: 'water_test', label: '16. ผลตรวจน้ำ', required: false, hint: 'ผลวิเคราะห์คุณภาพน้ำ ตรวจโลหะหนักและเชื้อ E.coli จากห้องแล็บที่ได้รับการรับรอง' },
        { id: 'flower_test', label: '17. ผลตรวจช่อดอก', required: false, hint: 'ผลตรวจสาร THC และ CBD จากห้องแล็บที่ได้รับการรับรอง (เฉพาะกัญชา)' },

        // กลุ่มที่ 5: เอกสารทางเทคนิค
        { id: 'input_report', label: '18. รายงานปัจจัยการผลิต + ทะเบียน', required: false, hint: 'รายการปุ๋ย สารเคมี สารอินทรีย์ สารชีวภัณฑ์ พร้อมเลขทะเบียนและปี พ.ศ.' },
        { id: 'cp_ccp_table', label: '19. ตารางแผนควบคุม CP/CCP', required: false, hint: 'ตารางวิเคราะห์จุดควบคุม (Control Point) และจุดวิกฤต (Critical Control Point)' },
        { id: 'calibration_cert', label: '20. ใบสอบเทียบเครื่องมือ (ตราชั่ง)', required: false, hint: 'ใบรับรองการสอบเทียบเครื่องชั่งจากหน่วยงานที่ได้รับการรับรอง' },

        // กลุ่มที่ 6: วิดีโอและเอกสารเพิ่มเติม
        { id: 'video_url', label: '21. ลิงก์วิดีโอแสดงสถานที่ปฏิบัติงาน', required: false, hint: 'ลิงก์วิดีโอแสดงการทำงานตั้งแต่ขั้นตอนแรกถึงสุดท้าย (YouTube/Google Drive)', isUrl: true },
        { id: 'additional_docs', label: '22. เอกสารเพิ่มเติม', required: false, hint: 'เอกสารอื่นๆ ที่เกี่ยวข้อง สูงสุด 5 ไฟล์', multiple: true, maxFiles: 5 },
    ];

    return docs;
}

interface Props {
    plantId: PlantId | null;
    serviceType: ServiceType | null;
    documents: DocumentUpload[];
    videoUrl?: string;
    onDocumentsChange: (docs: DocumentUpload[]) => void;
    onVideoUrlChange: (url: string) => void;
}

export default function Step7Documents({ plantId, serviceType, documents, videoUrl, onDocumentsChange, onVideoUrlChange }: Props) {
    const [docs, setDocs] = useState<DocSlot[]>(() => {
        const baseList = getDocumentList(plantId, serviceType);
        // Merge with existing documents
        return baseList.map(doc => {
            const existing = documents.find(d => d.id === doc.id);
            if (existing) {
                return { ...doc, file: existing.file, url: existing.url };
            }
            return doc;
        });
    });
    const [openHint, setOpenHint] = useState<string | null>(null);
    const [localVideoUrl, setLocalVideoUrl] = useState(videoUrl || '');
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileSelect = (docId: string, file: File) => {
        setDocs(prev => {
            const updated = prev.map(d => d.id === docId ? { ...d, file } : d);
            // Update parent
            const docUploads: DocumentUpload[] = updated
                .filter(d => d.file || d.url)
                .map(d => ({ id: d.id, file: d.file, url: d.url }));
            onDocumentsChange(docUploads);
            return updated;
        });
    };

    const handleMultipleFiles = (docId: string, files: FileList) => {
        setDocs(prev => {
            const updated = prev.map(d => {
                if (d.id === docId) {
                    const newFiles = Array.from(files).slice(0, d.maxFiles || 5);
                    return { ...d, files: newFiles };
                }
                return d;
            });
            const docUploads: DocumentUpload[] = updated
                .filter(d => d.file || d.files?.length || d.url)
                .map(d => ({ id: d.id, file: d.file, url: d.url }));
            onDocumentsChange(docUploads);
            return updated;
        });
    };

    const removeFile = (docId: string) => {
        setDocs(prev => {
            const updated = prev.map(d => d.id === docId ? { ...d, file: undefined, files: undefined, url: undefined } : d);
            const docUploads: DocumentUpload[] = updated
                .filter(d => d.file || d.url)
                .map(d => ({ id: d.id, file: d.file, url: d.url }));
            onDocumentsChange(docUploads);
            return updated;
        });
    };

    const handleUrlChange = (docId: string, url: string) => {
        if (docId === 'video_url') {
            setLocalVideoUrl(url);
            onVideoUrlChange(url);
        }
        setDocs(prev => prev.map(d => d.id === docId ? { ...d, url } : d));
    };

    const toggleHint = (docId: string) => {
        setOpenHint(prev => prev === docId ? null : docId);
    };

    const requiredCount = docs.filter(d => d.required).length;
    const uploadedRequired = docs.filter(d => d.required && (d.file || d.url || (d.files && d.files.length > 0))).length;

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}>📄</span>
                อัปโหลดเอกสาร (22 รายการ)
            </h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "8px" }}>
                อัปโหลดเอกสารประกอบคำขอตามฟอร์มอย่างเป็นทางการ คลิก ⓘ เพื่อดูรายละเอียด
            </p>

            {/* Resource Links */}
            <div style={{ padding: "12px 16px", backgroundColor: "#F0FDF4", borderRadius: "10px", marginBottom: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <a href={RESOURCE_LINKS.formDownload} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: colors.primary, textDecoration: "none" }}>
                    <ExternalLinkIcon /> ดาวน์โหลดแบบฟอร์ม
                </a>
                <a href={RESOURCE_LINKS.sopVideoGuide} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: colors.primary, textDecoration: "none" }}>
                    <ExternalLinkIcon /> วิดีโอตัวอย่าง SOP
                </a>
            </div>

            <p style={{ fontSize: "13px", color: colors.primary, marginBottom: "20px" }}>
                ✅ อัปโหลดแล้ว {uploadedRequired}/{requiredCount} รายการบังคับ
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {docs.map(doc => (
                    <div key={doc.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", backgroundColor: (doc.file || doc.url || (doc.files && doc.files.length > 0)) ? colors.primaryLight : "#FFF", border: `1px solid ${(doc.file || doc.url) ? colors.primary : colors.border}`, borderRadius: openHint === doc.id ? "10px 10px 0 0" : "10px" }}>
                            {/* Info Button */}
                            <button onClick={() => toggleHint(doc.id)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: `1px solid ${openHint === doc.id ? colors.primary : colors.border}`, backgroundColor: openHint === doc.id ? colors.primaryLight : "#FFF", color: openHint === doc.id ? colors.primary : colors.textGray, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="กดเพื่อดูรายละเอียด">
                                <InfoIcon />
                            </button>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 500, color: colors.textDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {doc.label} {doc.required && <span style={{ color: "#DC2626" }}>*</span>}
                                </div>
                                {doc.file && (
                                    <div style={{ fontSize: "11px", color: colors.textGray, marginTop: "2px" }}>
                                        📎 {doc.file.name}
                                    </div>
                                )}
                                {doc.files && doc.files.length > 0 && (
                                    <div style={{ fontSize: "11px", color: colors.textGray, marginTop: "2px" }}>
                                        📎 {doc.files.length} ไฟล์
                                    </div>
                                )}
                            </div>

                            {/* URL Input for video */}
                            {doc.isUrl ? (
                                <input
                                    type="url"
                                    value={doc.id === 'video_url' ? localVideoUrl : (doc.url || '')}
                                    onChange={(e) => handleUrlChange(doc.id, e.target.value)}
                                    placeholder="https://..."
                                    style={{ width: "180px", padding: "8px 10px", border: `1px solid ${colors.border}`, borderRadius: "6px", fontSize: "12px" }}
                                />
                            ) : (
                                <>
                                    <input
                                        ref={el => { inputRefs.current[doc.id] = el; }}
                                        type="file"
                                        accept="image/*,.pdf"
                                        multiple={doc.multiple}
                                        onChange={(e) => {
                                            if (doc.multiple && e.target.files) {
                                                handleMultipleFiles(doc.id, e.target.files);
                                            } else if (e.target.files?.[0]) {
                                                handleFileSelect(doc.id, e.target.files[0]);
                                            }
                                        }}
                                        style={{ display: "none" }}
                                    />
                                    {(doc.file || (doc.files && doc.files.length > 0)) ? (
                                        <button onClick={() => removeFile(doc.id)} style={{ padding: "6px 10px", backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", flexShrink: 0 }}>ลบ</button>
                                    ) : (
                                        <button onClick={() => inputRefs.current[doc.id]?.click()} style={{ padding: "6px 12px", backgroundColor: colors.primary, color: "#FFF", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", flexShrink: 0 }}>
                                            {doc.multiple ? `เลือก (${doc.maxFiles})` : 'เลือก'}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Hint Panel */}
                        {openHint === doc.id && (
                            <div style={{ padding: "10px 14px", backgroundColor: "#F0FDF4", border: `1px solid ${colors.primary}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
                                <div style={{ fontSize: "12px", color: colors.textDark, lineHeight: 1.5 }}>
                                    <strong style={{ color: colors.primary }}>📋</strong> {doc.hint}
                                </div>
                                {doc.downloadUrl && (
                                    <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "6px", fontSize: "12px", color: colors.primary }}>
                                        <ExternalLinkIcon /> ดาวน์โหลด/ดูตัวอย่าง
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {uploadedRequired < requiredCount && (
                <p style={{ marginTop: "16px", fontSize: "12px", color: "#DC2626" }}>
                    ⚠️ กรุณาอัปโหลดเอกสารบังคับให้ครบก่อนดำเนินการต่อ
                </p>
            )}
        </div>
    );
}
