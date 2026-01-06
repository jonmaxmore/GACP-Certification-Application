"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

interface DocumentInfo { _id: string; name: string; type: string; url: string; size: number; uploadedAt: string; applicationId: string; }

export default function DocumentViewerPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [document, setDocument] = useState<DocumentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => { setMounted(true); setIsDark(localStorage.getItem("theme") === "dark"); const userData = localStorage.getItem("user"); if (!userData) { router.push("/login"); return; } loadDocument(); }, [id]);

    const loadDocument = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const result = await api.get<{ data: DocumentInfo }>(`/v2/documents/${id}`);
            if (result.success && result.data?.data) { setDocument(result.data.data); }
            else { setDocument({ _id: id, name: "เอกสารประกอบคำขอ.pdf", type: "application/pdf", url: "/api/documents/" + id, size: 1024 * 1024 * 2.5, uploadedAt: new Date().toISOString(), applicationId: "app_12345" }); }
        } catch { setError("ไม่สามารถโหลดเอกสารได้"); }
        finally { setLoading(false); }
    };

    const handleDownload = () => { if (!document) return; const link = window.document.createElement('a'); link.href = document.url; link.download = document.name; window.document.body.appendChild(link); link.click(); window.document.body.removeChild(link); };
    const formatFileSize = (bytes: number) => bytes < 1024 ? bytes + " B" : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + " KB" : (bytes / (1024 * 1024)).toFixed(2) + " MB";

    if (!mounted) return null;
    const isPdf = document?.type === "application/pdf";
    const isImage = document?.type?.startsWith("image/");

    return (
        <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-900 text-surface-100' : 'bg-surface-100 text-slate-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 px-6 py-3 flex justify-between items-center border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <div className="flex items-center gap-4">
                    <Link href="/applications" className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> กลับ
                    </Link>
                    {document && (
                        <div className={`pl-4 border-l ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                            <h1 className="text-base font-medium">{document.name}</h1>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatFileSize(document.size)} • อัปโหลดเมื่อ {new Date(document.uploadedAt).toLocaleDateString('th-TH')}</p>
                        </div>
                    )}
                </div>
                {document && (
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 rounded-lg p-1 border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-surface-200'}`}>
                            <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                            </button>
                            <span className={`text-xs min-w-[40px] text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{zoom}%</span>
                            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                            </button>
                        </div>
                        <button onClick={() => window.print()} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 border ${isDark ? 'border-slate-600' : 'border-surface-200'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                            พิมพ์
                        </button>
                        <button onClick={handleDownload} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-primary-600 text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            ดาวน์โหลด
                        </button>
                    </div>
                )}
            </header>

            {/* Content */}
            <main className="p-6 flex justify-center">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <div className={`w-10 h-10 border-[3px] rounded-full animate-spin ${isDark ? 'border-slate-700 border-t-primary-500' : 'border-surface-200 border-t-primary-600'}`} />
                        <p className={`mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>กำลังโหลดเอกสาร...</p>
                    </div>
                ) : error ? (
                    <div className={`rounded-2xl p-16 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <p className="text-red-500 font-medium">{error}</p>
                        <Link href="/applications" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-primary-600 text-white">กลับ</Link>
                    </div>
                ) : document ? (
                    <div className="w-full max-w-[900px] transition-transform" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
                        {isPdf ? (
                            <iframe src={document.url} className={`w-full h-[80vh] rounded-xl border ${isDark ? 'border-slate-700' : 'border-surface-200'}`} style={{ background: '#FFF' }} />
                        ) : isImage ? (
                            <div className={`rounded-xl p-4 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                <img src={document.url} alt={document.name} className="max-w-full rounded-lg" />
                            </div>
                        ) : (
                            <div className={`rounded-2xl p-16 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                <div className={`mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                                </div>
                                <h3 className="text-lg font-medium mb-2">{document.name}</h3>
                                <p className={`text-sm mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ไม่สามารถแสดงตัวอย่างได้</p>
                                <button onClick={handleDownload} className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium inline-flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    ดาวน์โหลดเพื่อดู
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>

            <style jsx global>{`@media print { header { display: none !important; } main { padding: 0 !important; } }`}</style>
        </div>
    );
}
