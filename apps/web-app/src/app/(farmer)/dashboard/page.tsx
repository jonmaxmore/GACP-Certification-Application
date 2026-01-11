"use client";

// ... imports
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationService, Application, Certificate } from "@/lib/services/application-service";
import { AuthService } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import { IconLeaf, IconDocument, IconCheckCircle, IconClock, IconSearch, IconWarning, IconReceipt, IconLock } from "@/components/ui/icons";

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    accountType?: string;
    verificationStatus?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; ring: string; bg: string }> = {
    DRAFT: { label: "ร่างคำขอ", color: "text-slate-600", ring: "ring-slate-200", bg: "bg-slate-50" },
    SUBMITTED: { label: "รอตรวจเอกสาร", color: "text-blue-600", ring: "ring-blue-200", bg: "bg-blue-50" },
    PAYMENT_1_PENDING: { label: "รอชำระค่าธรรมเนียม", color: "text-amber-600", ring: "ring-amber-200", bg: "bg-amber-50" },
    PAID_PHASE_1: { label: "ชำระเงินแล้ว (งวด 1)", color: "text-emerald-600", ring: "ring-emerald-200", bg: "bg-emerald-50" },
    PAYMENT_2_PENDING: { label: "รอชำระค่าตรวจประเมิน", color: "text-pink-600", ring: "ring-pink-200", bg: "bg-pink-50" },
    PAID_PHASE_2: { label: "ชำระเงินแล้ว (งวด 2)", color: "text-emerald-600", ring: "ring-emerald-200", bg: "bg-emerald-50" },
    REVISION_REQUIRED: { label: "ต้องแก้ไขเอกสาร", color: "text-red-600", ring: "ring-red-200", bg: "bg-red-50" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่านการตรวจสอบ", color: "text-indigo-600", ring: "ring-indigo-200", bg: "bg-indigo-50" },
    PENDING_AUDIT: { label: "รอตรวจประเมิน", color: "text-purple-600", ring: "ring-purple-200", bg: "bg-purple-50" },
    APPROVED: { label: "ได้รับการรับรอง", color: "text-green-600", ring: "ring-green-200", bg: "bg-green-50" },
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]); // Added missing state
    const [stats, setStats] = useState({ total: 0, active: 0, certified: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const sessionUser = AuthService.getUser();
        if (!sessionUser) { router.push("/login"); return; }
        setUser(sessionUser);

        const loadData = async () => {
            try {
                setIsLoading(true);

                // [FIX] Fetch fresh user profile to ensure Verification Status is up-to-date
                try {
                    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth-farmer/me`, {
                        headers: {
                            'Authorization': `Bearer ${AuthService.getToken()}`
                        },
                        cache: 'no-store' // Ensure no caching
                    });
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (profileData.success && profileData.data) {
                            // Handle both { data: user } (New) and { data: { user } } (Old/Wrapped)
                            const freshUser = profileData.data.user || profileData.data;

                            console.log('✅ Fresh Profile Loaded:', freshUser.verificationStatus);
                            setUser(freshUser);
                            AuthService.updateUser(freshUser); // Update stale localStorage
                        }
                    }
                } catch (err) {
                    console.warn('Failed to refresh profile', err);
                }

                const [appRes, certRes] = await Promise.all([
                    ApplicationService.getMyApplications(),
                    ApplicationService.getMyCertificates()
                ]);

                if (appRes.success && appRes.data) {
                    const apps: Application[] = Array.isArray(appRes.data) ? appRes.data : (appRes.data as any).data || [];
                    setApplications(apps);
                    setStats({
                        total: apps.length,
                        active: apps.filter(a => !['APPROVED', 'REJECTED'].includes(a.status)).length,
                        certified: apps.filter(a => a.status === 'APPROVED').length
                    });
                }

                if (certRes.success && certRes.data) {
                    const certs = Array.isArray(certRes.data) ? certRes.data : (certRes.data as any).data || [];
                    setCertificates(certs);
                }
            } catch (error) {
                console.error("Dashboard Load Error", error);
                // Fallback for Demo if API fails
                setApplications([]);
                setCertificates([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const getGreeting = () => {
        const h = new Date().getHours();
        return h < 12 ? "สวัสดีตอนเช้า" : h < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
    };

    if (!user || isLoading) return <div className="p-8"><div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto"></div></div>;

    const activeApp = applications[0]; // Simplified for Demo: Show latest

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* 0. Verification Requirement Banner */}
            {user.verificationStatus !== 'APPROVED' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex items-start justify-between animate-fade-in-down">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5"><IconWarning className="w-5 h-5 text-amber-600" /></div>
                        <div>
                            <h3 className="font-bold text-amber-800">กรุณายืนยันตัวตน (Identity Verification Required)</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                ท่านยังไม่ได้ยืนยันตัวตน หรืออยู่ระหว่างการตรวจสอบ <br />
                                กรุณาดำเนินการให้เสร็จสิ้นเพื่อเริ่มยื่นคำขอใบรับรอง
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/verify-identity"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow transition-colors whitespace-nowrap"
                    >
                        ยืนยันตัวตนทันที
                    </Link>
                </div>
            )}

            {/* 1. Hero Section (Gradient Card) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-xl shadow-emerald-200">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-emerald-50 mb-1 font-medium">{getGreeting()},</p>
                        <h1 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                        <p className="text-sm text-emerald-100 opacity-90 mt-1">{user.companyName || 'เกษตรกรผู้ปลูกสมุนไพร'}</p>
                        <p className="text-sm text-emerald-100 opacity-90 mt-1">{user.companyName || 'เกษตรกรผู้ปลูกสมุนไพร'}</p>
                        {user.verificationStatus !== 'APPROVED' && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-amber-500/20 text-amber-100 text-xs font-bold rounded border border-amber-500/30">
                                สถานะ: รอการยืนยันตัวตน
                            </span>
                        )}
                    </div>
                    <div>
                        {user.verificationStatus === 'APPROVED' ? (
                            <Link
                                href="/applications/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <IconLeaf className="w-5 h-5" />
                                ยื่นคำขอใหม่
                            </Link>
                        ) : (
                            <button
                                onClick={() => router.push('/verify-identity')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-500 rounded-full font-bold shadow-inner cursor-not-allowed opacity-90 hover:bg-slate-200 transition-all"
                            >
                                <IconLock className="w-5 h-5" />
                                ยืนยันตัวตนเพื่อเริ่มใช้งาน
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Status Overview (Glass Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "คำขอทั้งหมด", value: stats.total, color: "text-slate-600", bg: "bg-white", icon: IconDocument },
                    { label: "กำลังดำเนินการ", value: stats.active, color: "text-amber-600", bg: "bg-amber-50", icon: IconClock },
                    { label: "รอตรวจแปลง", value: 0, color: "text-purple-600", bg: "bg-purple-50", icon: IconSearch }, // Mock
                    { label: "ใบรับรอง", value: stats.certified, color: "text-emerald-600", bg: "bg-emerald-50", icon: IconCheckCircle },
                ].map((stat, i) => (
                    <div key={i} className={`p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md ${stat.bg}`}>
                        <stat.icon className={`w-8 h-8 mb-2 opacity-80 ${stat.color}`} />
                        <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                        <span className="text-xs font-medium text-slate-500 mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* 2.5 Payment Alert for Farmer (Phase 2 - Audit Fee) */}
            {activeApp && activeApp.status === 'PAYMENT_2_PENDING' && (
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <IconReceipt className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">💳 แจ้งชำระค่าธรรมเนียมการตรวจประเมิน</h3>
                                <p className="text-pink-50 opacity-90">
                                    คำขอของท่านผ่านการตรวจสอบเอกสารแล้ว กรุณาชำระค่าธรรมเนียมเพื่อดำเนินการนัดหมายผู้ตรวจประเมิน
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/payments"
                            className="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <span className="text-lg">฿25,000.00</span>
                            <span className="w-px h-4 bg-pink-200 mx-1"></span>
                            ชำระเงินทันที →
                        </Link>
                    </div>
                </div>
            )}

            {/* 2.5 Appointment Alert for Farmer */}
            {activeApp && activeApp.status === 'AUDIT_SCHEDULED' && activeApp.scheduledDate && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <IconClock className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">📅 มีนัดหมายตรวจประเมิน</h3>
                                <div className="space-y-1 text-indigo-50">
                                    <p className="flex items-center gap-2">
                                        <span>วันที่: {new Date(activeApp.scheduledDate).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
                                        <span>|</span>
                                        <span>เวลา: {new Date(activeApp.scheduledDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-sm opacity-90">
                                        {activeApp.audit?.mode === 'ONLINE' ? '🎥 รูปแบบ: ตรวจออนไลน์ (Google Meet)' : '📍 รูปแบบ: ลงพื้นที่ (Onsite)'}
                                    </p>
                                    {activeApp.audit?.mode === 'ONSITE' && activeApp.audit?.location && (
                                        <p className="text-sm font-medium bg-white/10 px-2 py-1 rounded inline-block">
                                            สถานที่: {activeApp.audit.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {activeApp.audit?.mode === 'ONLINE' && activeApp.audit?.meetingUrl && (
                            <a
                                href={activeApp.audit.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                                เข้าห้อง Google Meet
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Action Center (Active Application) */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        รายการล่าสุด
                    </h2>

                    {activeApp ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden group hover:border-emerald-200 transition-all">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800">คำขอใบรับรอง GACP</h3>
                                    <p className="text-sm text-slate-500 font-mono mt-0.5">#{activeApp._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${STATUS_MAP[activeApp.status]?.bg || 'bg-slate-100'} ${STATUS_MAP[activeApp.status]?.color || 'text-slate-600'} ${STATUS_MAP[activeApp.status]?.ring || 'ring-slate-200'}`}>
                                    {STATUS_MAP[activeApp.status]?.label || activeApp.status}
                                </span>
                            </div>
                            <div className="p-6 bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">ดำเนินการล่าสุด</span>
                                        <span className="text-sm font-medium text-slate-700">
                                            {new Date(activeApp.updatedAt || activeApp.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/applications/new?step=${activeApp.status === 'PAYMENT_1_PENDING' || activeApp.status === 'PAYMENT_2_PENDING' ? 7 : activeApp.status === 'PAID_PHASE_1' ? 8 : 0}`}
                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
                                    >
                                        ดำเนินการต่อ →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IconDocument className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">ยังไม่มีคำขอใบรับรอง</h3>
                            <p className="text-slate-500 text-sm mt-1">เริ่มต้นยื่นคำขอแรกของคุณได้เลย</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Certificates Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <span className="bg-green-100 text-green-700 p-2 rounded-lg">📜</span>
                            ใบรับรองของฉัน (My Certificates)
                        </h2>

                        {certificates.length === 0 ? (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
                                ยังไม่มีใบรับรอง
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {certificates.map((cert) => (
                                    <div key={cert._id} className="bg-white p-5 rounded-xl shadow-sm border border-green-100 flex justify-between items-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                                                    {cert.status}
                                                </span>
                                                <span className="text-xs text-slate-400">#{cert.certificateNumber}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800">{cert.plantType || 'สมุนไพร'}</h3>
                                            <p className="text-sm text-slate-500">หมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}</p>
                                        </div>
                                        <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2">
                                            <span>ดาวน์โหลด</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 0 003 3h10a3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Applications List */}
                    <h2 className="text-xl font-bold mb-4 text-slate-800">เมนูด่วน</h2>
                    <div className="grid gap-3">
                        <button className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><IconDocument /></div>
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm">คู่มือการใช้งาน</h4>
                                <p className="text-xs text-slate-500">สำหรับเกษตรกร</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><IconWarning /></div>
                            <div>
                                <h4 className="font-bold text-slate-700 text-sm">แจ้งปัญหา</h4>
                                <p className="text-xs text-slate-500">ติดต่อเจ้าหน้าที่</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
