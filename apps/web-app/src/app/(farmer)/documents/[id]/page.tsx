"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

// Theme System
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E", accentBg: "rgba(22, 163, 74, 0.08)",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399", accentBg: "rgba(16, 185, 129, 0.15)",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

// Icons
const Icons = {
    back: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>,
    download: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    print: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    zoomIn: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    zoomOut: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    file: (c: string) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
};

interface DocumentInfo {
    _id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
    applicationId: string;
}

export default function DocumentViewerPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const returnUrl = '/applications';

    const [document, setDocument] = useState<DocumentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const t = isDark ? themes.dark : themes.light;

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const result = await api.get<{ data: DocumentInfo }>(`/v2/documents/${id}`);
            if (result.success && result.data?.data) {
                setDocument(result.data.data);
            } else {
                // Mock data for demo
                setDocument({
                    _id: id,
                    name: "เอกสารประกอบคำขอ.pdf",
                    type: "application/pdf",
                    url: "/api/documents/" + id,
                    size: 1024 * 1024 * 2.5,
                    uploadedAt: new Date().toISOString(),
                    applicationId: "app_12345",
                });
            }
        } catch {
            setError("ไม่สามารถโหลดเอกสารได้");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!document) return;
        try {
            const link = window.document.createElement('a');
            link.href = document.url;
            link.download = document.name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        } catch {
            alert("ไม่สามารถดาวน์โหลดเอกสารได้");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const isPdf = document?.type === "application/pdf";
    const isImage = document?.type?.startsWith("image/");

    if (!mounted) return null;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, color: t.text, fontFamily: "'Kanit', sans-serif" }}>
            {/* Header */}
            <header style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                backgroundColor: t.surface,
                borderBottom: `1px solid ${t.border}`,
                padding: "12px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href={returnUrl} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        color: t.textSecondary, textDecoration: "none", fontSize: "14px"
                    }}>
                        {Icons.back(t.textMuted)} กลับ
                    </Link>
                    {document && (
                        <div style={{ borderLeft: `1px solid ${t.border}`, paddingLeft: "16px" }}>
                            <h1 style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{document.name}</h1>
                            <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>
                                {formatFileSize(document.size)} • อัปโหลดเมื่อ {new Date(document.uploadedAt).toLocaleDateString('th-TH')}
                            </p>
                        </div>
                    )}
                </div>

                {document && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Zoom Controls */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            backgroundColor: t.bgCard, borderRadius: "10px", padding: "4px",
                            border: `1px solid ${t.border}`,
                        }}>
                            <button onClick={() => setZoom(Math.max(50, zoom - 25))} style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                border: "none", backgroundColor: "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {Icons.zoomOut(t.textMuted)}
                            </button>
                            <span style={{ fontSize: "12px", color: t.textMuted, minWidth: "40px", textAlign: "center" }}>
                                {zoom}%
                            </span>
                            <button onClick={() => setZoom(Math.min(200, zoom + 25))} style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                border: "none", backgroundColor: "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {Icons.zoomIn(t.textMuted)}
                            </button>
                        </div>

                        {/* Actions */}
                        <button onClick={handlePrint} style={{
                            padding: "8px 16px", borderRadius: "10px",
                            border: `1px solid ${t.border}`, backgroundColor: "transparent",
                            color: t.text, fontSize: "13px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "6px",
                        }}>
                            {Icons.print(t.textMuted)} พิมพ์
                        </button>
                        <button onClick={handleDownload} style={{
                            padding: "8px 16px", borderRadius: "10px",
                            border: "none", backgroundColor: t.accent,
                            color: "#FFF", fontSize: "13px", fontWeight: 500, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "6px",
                        }}>
                            {Icons.download("#FFF")} ดาวน์โหลด
                        </button>
                    </div>
                )}
            </header>

            {/* Content */}
            <main style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
                {loading ? (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", height: "60vh"
                    }}>
                        <div className="spinner" style={{
                            width: 40, height: 40,
                            border: `3px solid ${t.border}`,
                            borderTopColor: t.accent,
                            borderRadius: "50%"
                        }} />
                        <p style={{ marginTop: "16px", color: t.textMuted }}>กำลังโหลดเอกสาร...</p>
                    </div>
                ) : error ? (
                    <div style={{
                        backgroundColor: t.bgCard, border: `1px solid ${t.border}`,
                        borderRadius: "20px", padding: "60px", textAlign: "center"
                    }}>
                        <p style={{ color: "#EF4444", fontWeight: 500 }}>⚠️ {error}</p>
                        <Link href={returnUrl} style={{
                            display: "inline-block", marginTop: "16px",
                            padding: "10px 20px", borderRadius: "10px",
                            backgroundColor: t.accent, color: "#FFF", textDecoration: "none",
                        }}>
                            กลับ
                        </Link>
                    </div>
                ) : document ? (
                    <div style={{
                        width: "100%", maxWidth: "900px",
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: "top center",
                        transition: "transform 0.2s",
                    }}>
                        {isPdf ? (
                            <iframe
                                src={document.url}
                                style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: `1px solid ${t.border}`,
                                    borderRadius: "12px",
                                    backgroundColor: "#FFF",
                                }}
                            />
                        ) : isImage ? (
                            <div style={{
                                backgroundColor: t.bgCard,
                                border: `1px solid ${t.border}`,
                                borderRadius: "12px",
                                padding: "16px",
                                textAlign: "center",
                            }}>
                                <img
                                    src={document.url}
                                    alt={document.name}
                                    style={{ maxWidth: "100%", borderRadius: "8px" }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: t.bgCard,
                                border: `1px solid ${t.border}`,
                                borderRadius: "20px",
                                padding: "60px",
                                textAlign: "center",
                            }}>
                                <div style={{ color: t.textMuted, marginBottom: "16px" }}>
                                    {Icons.file(t.textMuted)}
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
                                    {document.name}
                                </h3>
                                <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "20px" }}>
                                    ไม่สามารถแสดงตัวอย่างได้
                                </p>
                                <button onClick={handleDownload} style={{
                                    padding: "12px 24px", borderRadius: "12px",
                                    border: "none", backgroundColor: t.accent,
                                    color: "#FFF", fontSize: "14px", fontWeight: 500, cursor: "pointer",
                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                }}>
                                    {Icons.download("#FFF")} ดาวน์โหลดเพื่อดู
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } } 
                .spinner { animation: spin 1s linear infinite; }
                @media print {
                    header { display: none !important; }
                    main { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
}
