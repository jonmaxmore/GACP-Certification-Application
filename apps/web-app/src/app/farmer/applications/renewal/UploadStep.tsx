"use client";

import Link from 'next/link';
import { Certificate, REQUIRED_DOCS } from './types';

interface UploadStepProps {
    certificate: Certificate | null;
    uploadedDocs: Record<string, boolean>;
    uploading: string | null;
    isDark: boolean;
    onUpload: (docId: string, file: File) => void;
    onSkipUpload: () => void;
    onProceed: () => void;
}

export function UploadStep({ certificate, uploadedDocs, uploading, isDark, onUpload, onSkipUpload, onProceed }: UploadStepProps) {
    const allRequiredUploaded = REQUIRED_DOCS.filter(d => d.required).every(d => uploadedDocs[d.id]);

    return (
        <div className={`min-h-screen p-6 font-sans ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}>
            <div className="max-w-2xl mx-auto">
                <Link href="/certificates" className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${isDark ? 'border-slate-700 text-slate-400' : 'border-surface-200 text-slate-600'}`}>
                    ← กลับหน้าใบรับรอง
                </Link>

                <h1 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ต่ออายุใบรับรอง GACP</h1>
                <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>อัปโหลดเอกสารที่จำเป็นสำหรับการต่ออายุ</p>

                {certificate && (
                    <div className={`rounded-2xl p-5 mb-6 border ${isDark ? 'bg-primary-500/10 border-primary-500/30' : 'bg-primary-50 border-primary-200'}`}>
                        <div className="flex justify-between items-center flex-wrap gap-3">
                            <div>
                                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ใบรับรองเลขที่</p>
                                <p className="text-lg font-semibold text-primary-600">{certificate.certificateNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>สถานที่</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>{certificate.siteName}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`rounded-2xl border overflow-hidden mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                        <h3 className={`text-base font-semibold ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>เอกสารที่ต้องอัปโหลด</h3>
                    </div>

                    {REQUIRED_DOCS.map((doc, index) => (
                        <div key={doc.id} className={`p-5 flex items-center justify-between gap-4 ${index < REQUIRED_DOCS.length - 1 ? (isDark ? 'border-b border-slate-700' : 'border-b border-surface-200') : ''}`}>
                            <div className="flex-1">
                                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>
                                    {doc.name} {doc.required && <span className="text-red-500">*</span>}
                                </p>
                                {uploadedDocs[doc.id] && <span className="text-xs text-primary-600 flex items-center gap-1">อัปโหลดแล้ว</span>}
                            </div>
                            <label className={`px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-1.5 ${uploadedDocs[doc.id] ? 'bg-primary-50 border border-primary-500 text-primary-600' : (isDark ? 'border border-slate-600 text-slate-400' : 'border border-surface-200 text-slate-600')} ${uploading === doc.id ? 'opacity-60' : ''}`}>
                                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(doc.id, e.target.files[0])} disabled={uploading !== null} accept=".pdf,.jpg,.jpeg,.png" />
                                {uploading === doc.id ? 'กำลังอัปโหลด...' : uploadedDocs[doc.id] ? 'อัปโหลดแล้ว' : 'เลือกไฟล์'}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button onClick={onSkipUpload} className={`flex-1 py-3.5 rounded-xl text-sm font-medium border-2 ${isDark ? 'border-slate-600 text-slate-400' : 'border-surface-200 text-slate-600'}`}>ข้าม (Demo)</button>
                    <button onClick={onProceed} disabled={!allRequiredUploaded} className={`flex-[2] py-3.5 rounded-xl text-sm font-semibold ${allRequiredUploaded ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/40' : 'bg-surface-200 text-slate-400 cursor-not-allowed'}`}>ดำเนินการต่อ →</button>
                </div>
            </div>
        </div>
    );
}
