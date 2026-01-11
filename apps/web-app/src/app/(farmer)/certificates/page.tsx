"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

interface Certificate {
    _id: string; certificateNumber: string; applicationId: string;
    siteName: string; plantType: string; issuedDate: string; expiryDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'; qrCode?: string;
}

export default function CertificatesPage() {
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewCert, setViewCert] = useState<Certificate | null>(null);
    const [showQR, setShowQR] = useState<Certificate | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
    // Theme state is handled by Layout, just use system/css vars or simple dark mode classes if valid
    // For specific dark mode in card, rely on standard dark: attributes

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Certificate[] }>("/api/certificates/my");
            if (result.success && result.data?.data) setCertificates(result.data.data);
            else setCertificates([]);
        } catch { setCertificates([]); }
        finally { setLoading(false); }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const getDaysRemaining = (exp: string) => Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000);

    const filteredCerts = certificates.filter(c => filter === 'ALL' || c.status === filter);

    return (
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 max-w-5xl mx-auto font-[Kanit] animate-fadeIn">
            <header className="flex justify-between items-center flex-wrap gap-4 mb-7">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-slate-100">ใบรับรอง GACP</h1>
                    <p className="text-sm text-slate-500 mt-1">ใบรับรองมาตรฐานการปลูกและเก็บเกี่ยวพืชสมุนไพร</p>
                </div>
                <div className="flex gap-1 p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            {f === 'ALL' ? 'ทั้งหมด' : f === 'ACTIVE' ? 'ใช้งานได้' : 'หมดอายุ'}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="rounded-2xl p-16 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-slate-500">กำลังโหลดใบรับรอง...</p>
                </div>
            ) : filteredCerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCerts.map(cert => {
                        const daysLeft = getDaysRemaining(cert.expiryDate);
                        const isActive = cert.status === 'ACTIVE';
                        return (
                            <div key={cert._id} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`p-6 text-white relative ${isActive ? 'bg-gradient-to-br from-emerald-600 to-emerald-400' : 'bg-gradient-to-br from-slate-500 to-slate-400'}`}>
                                    <span className="absolute top-5 right-5 text-3xl opacity-20">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                                    </span>
                                    <p className="text-xs opacity-80 mb-1">เลขที่ใบรับรอง</p>
                                    <h3 className="text-xl font-semibold">{cert.certificateNumber}</h3>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs text-slate-500">สถานที่</p>
                                    <p className="font-medium mb-4 text-slate-900 dark:text-slate-200">{cert.siteName}</p>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div><p className="text-xs text-slate-500">ประเภทพืช</p><p className="text-sm font-medium text-slate-900 dark:text-slate-200">{cert.plantType}</p></div>
                                        <div>
                                            <p className="text-xs text-slate-500">สถานะ</p>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                                {isActive ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline"><polyline points="20 6 9 17 4 12" /></svg> ใช้งานได้</> : 'หมดอายุ'}
                                            </span>
                                        </div>
                                        <div><p className="text-xs text-slate-500">วันที่ออก</p><p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(cert.issuedDate)}</p></div>
                                        <div>
                                            <p className="text-xs text-slate-500">วันหมดอายุ</p>
                                            <p className={`text-sm ${daysLeft < 30 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>{formatDate(cert.expiryDate)}</p>
                                            {isActive && daysLeft <= 90 && <p className="text-xs text-amber-500">(เหลือ {daysLeft} วัน)</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <button onClick={() => setViewCert(cert)} className="flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">ดู</button>
                                        <button onClick={() => setShowQR(cert)} className="flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">QR</button>
                                        <button className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        </button>
                                    </div>
                                    {(daysLeft <= 90 || cert.status === 'EXPIRED') && (
                                        <Link href={`/applications/renewal?certId=${cert._id}`} className={`flex items-center justify-center gap-2 mt-3 py-3 rounded-xl text-white text-sm font-semibold shadow-lg ${cert.status === 'EXPIRED' ? 'bg-gradient-to-br from-amber-500 to-amber-400 shadow-amber-500/30' : 'bg-gradient-to-br from-emerald-600 to-emerald-400 shadow-emerald-500/30'}`}>
                                            {cert.status === 'EXPIRED' ? 'ต่อสัญญาเลย' : 'ต่อสัญญาก่อนหมดอายุ'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl p-16 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-emerald-50 dark:bg-emerald-500/15">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-white">ยังไม่มีใบรับรอง</h3>
                    <p className="text-sm text-slate-500 mb-5">เมื่อคำขอได้รับการอนุมัติ ใบรับรองจะแสดงที่นี่</p>
                    <Link href="/applications/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-shadow">ยื่นคำขอใหม่</Link>
                </div>
            )}

            {/* View Certificate Modal */}
            {viewCert && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-5" onClick={() => setViewCert(null)}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-auto bg-white rounded-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">ใบรับรอง GACP</h3>
                            <button onClick={() => setViewCert(null)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">ปิด</button>
                        </div>
                        <div className="p-6 bg-slate-100">
                            <div className="bg-white border-2 border-emerald-500 rounded-xl p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full opacity-50"></div>
                                <img src="/images/dtam-logo.png" alt="DTAM" className="w-16 h-16 mx-auto mb-4" onError={e => (e.currentTarget.style.display = 'none')} />
                                <h2 className="text-2xl font-bold text-emerald-600 mb-1">ใบรับรองมาตรฐาน GACP</h2>
                                <p className="text-xs text-slate-500 mb-5">Good Agricultural and Collection Practices</p>
                                <div className="border-t border-b border-dashed border-slate-300 py-5 my-5">
                                    <p className="text-sm text-slate-600 mb-2">เลขที่ใบรับรอง</p>
                                    <p className="text-2xl font-bold text-slate-900">{viewCert.certificateNumber}</p>
                                </div>
                                <p className="text-sm text-slate-600 mb-1">ออกให้แก่</p>
                                <p className="text-lg font-semibold text-slate-900 mb-4">{viewCert.siteName}</p>
                                <p className="text-sm text-slate-500">ประเภทพืช: {viewCert.plantType}</p>
                                <p className="text-sm text-slate-500 mt-2">มีผลตั้งแต่ {formatDate(viewCert.issuedDate)} ถึง {formatDate(viewCert.expiryDate)}</p>
                                <div className="mt-6 pt-5 border-t border-slate-200">
                                    <p className="text-xs text-slate-400">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                                    <p className="text-xs text-slate-400">กระทรวงสาธารณสุข</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-slate-200">
                            <button
                                onClick={() => window.open(`/api/certificates/${viewCert._id}/download`, '_blank')}
                                className="flex-1 py-3 rounded-xl border border-emerald-500 text-emerald-500 font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-50">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                พิมพ์
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await api.getBlob(`/api/certificates/${viewCert._id}/download`);
                                        if (res) {
                                            const url = window.URL.createObjectURL(res);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `GACP-${viewCert.certificateNumber}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                            document.body.removeChild(a);
                                        }
                                    } catch (e) {
                                        console.error("Download failed", e);
                                        alert("ดาวน์โหลดไม่สำเร็จ");
                                    }
                                }}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                ดาวน์โหลด PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-5" onClick={() => setShowQR(null)}>
                    <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 mb-5">QR Code ตรวจสอบ</h3>
                        <div className="w-48 h-48 mx-auto mb-5 bg-slate-100 rounded-xl flex items-center justify-center">
                            <div className="w-40 h-40" style={{ background: `url('https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://gacp.dtam.go.th/verify/${showQR.certificateNumber}')`, backgroundSize: 'cover' }} />
                        </div>
                        <p className="text-sm text-slate-500 mb-2">สแกนเพื่อตรวจสอบใบรับรอง</p>
                        <p className="font-semibold text-slate-900">{showQR.certificateNumber}</p>
                        <button onClick={() => setShowQR(null)} className="mt-6 px-8 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600">ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}
