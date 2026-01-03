"use client";

import Link from 'next/link';
import { Certificate, Theme, Icons, REQUIRED_DOCS } from './types';

interface UploadStepProps {
    certificate: Certificate | null;
    uploadedDocs: Record<string, boolean>;
    uploading: string | null;
    t: Theme;
    onUpload: (docId: string, file: File) => void;
    onSkipUpload: () => void;
    onProceed: () => void;
}

/**
 * Upload Step - Document Upload
 * 🍎 Apple Single Responsibility: Only handles document upload
 */
export function UploadStep({
    certificate,
    uploadedDocs,
    uploading,
    t,
    onUpload,
    onSkipUpload,
    onProceed
}: UploadStepProps) {
    const allRequiredUploaded = REQUIRED_DOCS.filter(d => d.required).every(d => uploadedDocs[d.id]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", padding: '24px' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <Link href="/certificates" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.border}`,
                    background: 'transparent', color: t.textSecondary, textDecoration: 'none', marginBottom: '24px', width: 'fit-content'
                }}>
                    {Icons.back(t.textMuted)} กลับหน้าใบรับรอง
                </Link>

                <h1 style={{ fontSize: '24px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>ต่ออายุใบรับรอง GACP</h1>
                <p style={{ color: t.textMuted, marginBottom: '24px' }}>อัปโหลดเอกสารที่จำเป็นสำหรับการต่ออายุ</p>

                {/* Certificate Info */}
                {certificate && (
                    <div style={{
                        background: t.accentBg, borderRadius: '16px', padding: '20px',
                        border: `1px solid ${t.accent}30`, marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '4px' }}>ใบรับรองเลขที่</p>
                                <p style={{ fontSize: '18px', fontWeight: 600, color: t.accent }}>{certificate.certificateNumber}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '4px' }}>สถานที่</p>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.text }}>{certificate.siteName}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Upload List */}
                <div style={{ background: t.bgCard, borderRadius: '20px', border: `1px solid ${t.border}`, overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', borderBottom: `1px solid ${t.border}` }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.text, margin: 0 }}>เอกสารที่ต้องอัปโหลด</h3>
                    </div>

                    {REQUIRED_DOCS.map((doc, index) => (
                        <div key={doc.id} style={{
                            padding: '20px', borderBottom: index < REQUIRED_DOCS.length - 1 ? `1px solid ${t.border}` : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.text, marginBottom: '4px' }}>
                                    {doc.name}
                                    {doc.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
                                </p>
                                {uploadedDocs[doc.id] && (
                                    <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {Icons.check('#10B981')} อัปโหลดแล้ว
                                    </span>
                                )}
                            </div>

                            <label style={{
                                padding: '10px 20px', borderRadius: '10px',
                                border: uploadedDocs[doc.id] ? `1px solid #10B981` : `1px solid ${t.border}`,
                                background: uploadedDocs[doc.id] ? '#ECFDF5' : 'transparent',
                                color: uploadedDocs[doc.id] ? '#10B981' : t.textSecondary,
                                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                opacity: uploading === doc.id ? 0.6 : 1,
                            }}>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={(e) => e.target.files?.[0] && onUpload(doc.id, e.target.files[0])}
                                    disabled={uploading !== null}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {uploading === doc.id ? (
                                    <>กำลังอัปโหลด...</>
                                ) : uploadedDocs[doc.id] ? (
                                    <>{Icons.check('#10B981')} อัปโหลดแล้ว</>
                                ) : (
                                    <>{Icons.upload(t.textMuted)} เลือกไฟล์</>
                                )}
                            </label>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onSkipUpload} style={{
                        flex: 1, padding: '14px', borderRadius: '12px',
                        border: `2px solid ${t.border}`, background: 'transparent',
                        color: t.textSecondary, fontSize: '14px', fontWeight: 500, cursor: 'pointer'
                    }}>
                        ข้าม (Demo)
                    </button>
                    <button
                        onClick={onProceed}
                        disabled={!allRequiredUploaded}
                        style={{
                            flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                            background: allRequiredUploaded
                                ? `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`
                                : '#E5E7EB',
                            color: allRequiredUploaded ? '#FFF' : '#9CA3AF',
                            fontSize: '14px', fontWeight: 600,
                            cursor: allRequiredUploaded ? 'pointer' : 'not-allowed'
                        }}
                    >
                        ดำเนินการต่อ →
                    </button>
                </div>
            </div>
        </div>
    );
}
