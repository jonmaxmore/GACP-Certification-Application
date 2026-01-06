"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
    DRAFT: { label: "ร่าง", color: "#8A8A8A", step: 1 },
    PAYMENT_1_PENDING: { label: "รอชำระเงินงวด 1", color: "#F59E0B", step: 2 },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "#3B82F6", step: 3 },
    REVISION_REQ: { label: "ต้องแก้ไขเอกสาร", color: "#EF4444", step: 3 },
    PAYMENT_2_PENDING: { label: "รอชำระเงินงวด 2", color: "#F59E0B", step: 4 },
    AUDIT_PENDING: { label: "รอตรวจประเมินสถานที่", color: "#8B5CF6", step: 5 },
    AUDIT_SCHEDULED: { label: "นัดหมายตรวจแล้ว", color: "#06B6D4", step: 5 },
    CERTIFIED: { label: "ได้รับการรับรอง", color: "#10B981", step: 6 },
};

const STEPS = [{ id: 1, label: "ยื่นคำขอ" }, { id: 2, label: "ชำระงวด 1" }, { id: 3, label: "ตรวจเอกสาร" }, { id: 4, label: "ชำระงวด 2" }, { id: 5, label: "ตรวจสถานที่" }, { id: 6, label: "รับรอง" }];

interface ApplicationDetail { _id: string; applicationNumber?: string; status: string; createdAt: string; updatedAt: string; applicantType?: string; applicantInfo?: { name?: string; firstName?: string; lastName?: string; phone?: string; email?: string }; siteInfo?: { siteName?: string; address?: string; province?: string; gpsLat?: string; gpsLng?: string; areaSize?: string }; formData?: { documents?: { id: string; uploaded?: boolean; name?: string }[] }; staffNotes?: string; }

export default function ApplicationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [application, setApplication] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => { setMounted(true); setIsDark(localStorage.getItem("theme") === "dark"); const userData = localStorage.getItem("user"); if (!userData) { router.push("/login"); return; } loadApplication(); }, [id]);

    const loadApplication = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const result = await api.get<{ data: ApplicationDetail }>(`/v2/applications/${id}`);
            if (result.success && result.data?.data) setApplication(result.data.data);
            else setError("ไม่พบคำขอนี้ในระบบ");
        } catch { setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"); }
        finally { setLoading(false); }
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };
    const getStatusInfo = (status: string) => STATUS_CONFIG[status] || { label: status, color: "#8A8A8A", step: 0 };
    const formatDate = (date: string) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    if (!mounted) return null;

    const navItems = [{ href: "/dashboard", label: "หน้าหลัก" }, { href: "/applications", label: "คำขอ", active: true }, { href: "/tracking", label: "ติดตาม" }, { href: "/payments", label: "การเงิน" }, { href: "/profile", label: "โปรไฟล์" }];
    const statusInfo = application ? getStatusInfo(application.status) : null;
    const currentStep = statusInfo?.step || 0;

    return (
        <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-900 text-surface-100' : 'bg-surface-100 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-xl font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl relative ${item.active ? (isDark ? 'bg-primary-500/15 border border-primary-500/30' : 'bg-primary-50 border border-primary-500/30') : 'hover:bg-surface-100'}`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-primary-600 rounded-r" />}
                            <span className={`text-[10px] font-medium ${item.active ? 'text-primary-600' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary-500/15 border border-primary-500/30' : 'bg-primary-50 border border-primary-500/30'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{isDark ? <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}</svg>
                    </button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                {navItems.map(item => <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3"><span className={`text-[10px] font-medium ${item.active ? 'text-primary-600' : 'text-slate-500'}`}>{item.label}</span></Link>)}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-10 pb-24 lg:pb-10 max-w-6xl">
                <Link href="/applications" className={`inline-flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>← กลับไปรายการคำขอ</Link>

                {loading ? (
                    <div className={`rounded-2xl p-16 text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                        <div className={`w-10 h-10 border-[3px] rounded-full animate-spin mx-auto ${isDark ? 'border-slate-700 border-t-primary-500' : 'border-surface-200 border-t-primary-600'}`} />
                        <p className={`mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>กำลังโหลดข้อมูลคำขอ...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl p-6 text-center bg-red-50 border border-red-200">
                        <p className="text-red-500 font-medium">{error}</p>
                        <Link href="/applications" className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-red-500 text-white">กลับไปรายการคำขอ</Link>
                    </div>
                ) : application ? (
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-medium">คำขอ {application.applicationNumber || `#${application._id.slice(-6).toUpperCase()}`}</h1>
                                <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ยื่นเมื่อ {formatDate(application.createdAt)}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="px-5 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: `${statusInfo?.color}20`, color: statusInfo?.color, border: `1px solid ${statusInfo?.color}40` }}>{statusInfo?.label}</span>
                                {application.status === "REVISION_REQ" && <Link href={`/applications/${application._id}/edit`} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary-500 text-white font-medium">แก้ไขคำขอ</Link>}
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className={`rounded-2xl p-6 mb-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                            <h3 className={`text-base font-semibold mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ความคืบหน้า</h3>
                            <div className="relative mb-5">
                                <div className={`h-1 rounded ${isDark ? 'bg-slate-700' : 'bg-surface-200'}`} />
                                <div className="absolute top-0 left-0 h-1 rounded bg-gradient-to-r from-primary-600 to-primary-400 transition-all" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {STEPS.map(step => {
                                    const isDone = step.id < currentStep;
                                    const isCurrent = step.id === currentStep;
                                    return (
                                        <div key={step.id} className="text-center">
                                            <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${isDone ? 'bg-primary-600' : isCurrent ? (isDark ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-primary-50 border-2 border-primary-600') : (isDark ? 'bg-slate-700' : 'bg-surface-200')}`}>
                                                {isDone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17L4 12" /></svg> : isCurrent ? <span className="text-primary-600 text-xs">•</span> : <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.id}</span>}
                                            </div>
                                            <span className={`text-[11px] ${isCurrent ? 'text-primary-600 font-semibold' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Staff Notes */}
                        {application.staffNotes && (
                            <div className="rounded-2xl p-5 mb-6 bg-secondary-50 border border-secondary-200">
                                <h4 className="text-sm font-semibold text-secondary-600 mb-2">หมายเหตุจากเจ้าหน้าที่</h4>
                                <p className="text-sm leading-relaxed">{application.staffNotes}</p>
                            </div>
                        )}

                        {/* Action for Payment */}
                        {application.status === "PAYMENT_1_PENDING" && (
                            <div className="rounded-2xl p-6 mb-6 bg-secondary-50 border border-secondary-200">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div><h4 className="text-base font-semibold text-secondary-600 mb-1">รอชำระเงินงวดที่ 1</h4><p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ค่าตรวจสอบเอกสารเบื้องต้น 5,000 บาท</p></div>
                                    <Link href={`/payments?app=${application._id}&phase=1`} className="px-6 py-3 rounded-xl bg-secondary-500 text-white font-semibold">ชำระเงิน</Link>
                                </div>
                            </div>
                        )}

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Left Column */}
                            <div className="lg:col-span-3 flex flex-col gap-6">
                                {/* Applicant Info */}
                                <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                    <h3 className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>ข้อมูลผู้ยื่นคำขอ</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>ชื่อ:</span> <strong>{application.applicantInfo?.name || `${application.applicantInfo?.firstName || ''} ${application.applicantInfo?.lastName || ''}`}</strong></div>
                                        <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>ประเภท:</span> {application.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : application.applicantType === 'COMMUNITY' ? 'วิสาหกิจชุมชน' : 'นิติบุคคล'}</div>
                                        <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>โทร:</span> {application.applicantInfo?.phone || '-'}</div>
                                        <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>อีเมล:</span> {application.applicantInfo?.email || '-'}</div>
                                    </div>
                                </div>

                                {/* Site Info */}
                                {application.siteInfo && (
                                    <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                        <h3 className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>สถานที่ปลูก/เก็บเกี่ยว</h3>
                                        <div className="grid gap-3 text-sm">
                                            <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>ชื่อสถานที่:</span> <strong>{application.siteInfo.siteName}</strong></div>
                                            <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>ที่อยู่:</span> {application.siteInfo.address}, {application.siteInfo.province}</div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>พื้นที่:</span> {application.siteInfo.areaSize} ไร่</div>
                                                <div><span className={isDark ? 'text-slate-500' : 'text-slate-400'}>พิกัด GPS:</span> {application.siteInfo.gpsLat}, {application.siteInfo.gpsLng}</div>
                                            </div>
                                        </div>
                                        {application.siteInfo.gpsLat && application.siteInfo.gpsLng && (
                                            <div className={`mt-4 rounded-xl overflow-hidden border ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                                                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(application.siteInfo.gpsLng) - 0.01}%2C${parseFloat(application.siteInfo.gpsLat) - 0.006}%2C${parseFloat(application.siteInfo.gpsLng) + 0.01}%2C${parseFloat(application.siteInfo.gpsLat) + 0.006}&layer=mapnik&marker=${application.siteInfo.gpsLat}%2C${application.siteInfo.gpsLng}`} className="w-full h-44 border-none" loading="lazy" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Documents */}
                                <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                    <h3 className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-surface-100' : 'text-slate-900'}`}>เอกสารประกอบ</h3>
                                    <div className="flex flex-col gap-2">
                                        {application.formData?.documents?.filter(d => d.uploaded).slice(0, 5).map((doc, i) => (
                                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-surface-100'}`}>
                                                <div className="flex items-center gap-2.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg><span className="text-sm">{doc.name || `เอกสาร ${i + 1}`}</span></div>
                                                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 ${isDark ? 'border-primary-500 text-primary-400' : 'border-primary-600 text-primary-600'}`}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                    ดาวน์โหลด
                                                </button>
                                            </div>
                                        )) || <p className={`text-sm text-center py-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ยังไม่มีเอกสาร</p>}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className={`rounded-2xl p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                                    <h3 className="text-base font-semibold mb-4">ดำเนินการ</h3>
                                    <div className="flex flex-col gap-2.5">
                                        <Link href={`/tracking?app=${application._id}`} className={`flex items-center gap-2.5 p-3.5 rounded-xl border ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                                            <span>ติดตามสถานะ</span>
                                        </Link>
                                        <Link href={`/payments?app=${application._id}`} className={`flex items-center gap-2.5 p-3.5 rounded-xl border ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                            <span>ประวัติการชำระเงิน</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </main>
        </div>
    );
}
