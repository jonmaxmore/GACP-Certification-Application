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
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [viewCert, setViewCert] = useState<Certificate | null>(null);
    const [showQR, setShowQR] = useState<Certificate | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
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

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };
    const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const getDaysRemaining = (exp: string) => Math.ceil((new Date(exp).getTime() - Date.now()) / 86400000);

    if (!mounted) return null;

    const navItems = [
        { href: "/dashboard", label: "หน้าหลัก" },
        { href: "/applications", label: "คำขอ" },
        { href: "/certificates", label: "ใบรับรอง", active: true },
        { href: "/tracking", label: "ติดตาม" },
        { href: "/payments", label: "การเงิน" },
        { href: "/profile", label: "โปรไฟล์" },
    ];

    const filteredCerts = certificates.filter(c => filter === 'ALL' || c.status === filter);

    return (
        <div className={`min-h-screen font-[Kanit] transition-all ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-xl font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative ${item.active ? (isDark ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-500/30') : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r" />}
                            <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-500/30'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{isDark ? <circle cx="12" cy="12" r="5" /> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}</svg>
                    </button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {navItems.slice(0, 5).map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                        <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : 'text-slate-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main */}
            <main className="lg:ml-[72px] p-6 lg:p-10 pb-24 lg:pb-10 max-w-5xl">
                <header className="flex justify-between items-center flex-wrap gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-medium">ใบรับรอง GACP</h1>
                        <p className="text-sm text-slate-500 mt-1">ใบรับรองมาตรฐานการปลูกและเก็บเกี่ยวพืชสมุนไพร</p>
                    </div>
                    <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                                {f === 'ALL' ? 'ทั้งหมด' : f === 'ACTIVE' ? 'ใช้งานได้' : 'หมดอายุ'}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                        <p className="mt-4 text-slate-500">กำลังโหลดใบรับรอง...</p>
                    </div>
                ) : filteredCerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredCerts.map(cert => {
                            const daysLeft = getDaysRemaining(cert.expiryDate);
                            const isActive = cert.status === 'ACTIVE';
                            return (
                                <div key={cert._id} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                                    <div className={`p-6 text-white relative ${isActive ? 'bg-gradient-to-br from-emerald-600 to-emerald-400' : 'bg-gradient-to-br from-slate-500 to-slate-400'}`}>
                                        <span className="absolute top-5 right-5 text-3xl opacity-20">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                                        </span>
                                        <p className="text-xs opacity-80 mb-1">เลขที่ใบรับรอง</p>
                                        <h3 className="text-xl font-semibold">{cert.certificateNumber}</h3>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-slate-500">สถานที่</p>
                                        <p className="font-medium mb-4">{cert.siteName}</p>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div><p className="text-xs text-slate-500">ประเภทพืช</p><p className="text-sm font-medium">{cert.plantType}</p></div>
                                            <div>
                                                <p className="text-xs text-slate-500">สถานะ</p>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                                    {isActive ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline"><polyline points="20 6 9 17 4 12" /></svg> ใช้งานได้</> : 'หมดอายุ'}
                                                </span>
                                            </div>
                                            <div><p className="text-xs text-slate-500">วันที่ออก</p><p className="text-sm">{formatDate(cert.issuedDate)}</p></div>
                                            <div>
                                                <p className="text-xs text-slate-500">วันหมดอายุ</p>
                                                <p className={`text-sm ${daysLeft < 30 ? 'text-amber-500' : ''}`}>{formatDate(cert.expiryDate)}</p>
                                                {isActive && daysLeft <= 90 && <p className="text-xs text-amber-500">(เหลือ {daysLeft} วัน)</p>}
                                            </div>
                                        </div>
                                        <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                            <button onClick={() => setViewCert(cert)} className={`flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>ดู</button>
                                            <button onClick={() => setShowQR(cert)} className={`flex-1 py-2.5 rounded-lg text-sm flex items-center justify-center gap-1.5 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>QR</button>
                                            <button className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-sm">
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
                    <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีใบรับรอง</h3>
                        <p className="text-sm text-slate-500 mb-5">เมื่อคำขอได้รับการอนุมัติ ใบรับรองจะแสดงที่นี่</p>
                        <Link href="/applications/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30">ยื่นคำขอใหม่</Link>
                    </div>
                )}
            </main>

            {/* View Certificate Modal */}
            {viewCert && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-5" onClick={() => setViewCert(null)}>
                    <div className="w-full max-w-lg max-h-[90vh] overflow-auto bg-white rounded-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">ใบรับรอง GACP</h3>
                            <button onClick={() => setViewCert(null)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm">ปิด</button>
                        </div>
                        <div className="p-6 bg-slate-100">
                            <div className="bg-white border-2 border-emerald-500 rounded-xl p-8 text-center">
                                <img src="/images/dtam-logo.png" alt="DTAM" className="w-16 h-16 mx-auto mb-4" onError={e => (e.currentTarget.style.display = 'none')} />
                                <h2 className="text-2xl font-bold text-emerald-500 mb-1">ใบรับรองมาตรฐาน GACP</h2>
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
                            <button className="flex-1 py-3 rounded-xl border border-emerald-500 text-emerald-500 font-medium flex items-center justify-center gap-1.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                พิมพ์
                            </button>
                            <button className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium flex items-center justify-center gap-1.5">
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
                    <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-900 mb-5">QR Code ตรวจสอบ</h3>
                        <div className="w-48 h-48 mx-auto mb-5 bg-slate-100 rounded-xl flex items-center justify-center">
                            <div className="w-40 h-40" style={{ background: `url('https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://gacp.dtam.go.th/verify/${showQR.certificateNumber}')`, backgroundSize: 'cover' }} />
                        </div>
                        <p className="text-sm text-slate-500 mb-2">สแกนเพื่อตรวจสอบใบรับรอง</p>
                        <p className="font-semibold text-slate-900">{showQR.certificateNumber}</p>
                        <button onClick={() => setShowQR(null)} className="mt-6 px-8 py-3 rounded-xl bg-emerald-500 text-white font-medium">ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}
