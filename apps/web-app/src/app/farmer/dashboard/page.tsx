'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApplicationService, Application, Certificate } from "@/lib/services/application-service";
import { AuthService } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import { IconLeaf, IconDocument, IconCheckCircle, IconClock, IconSearch, IconWarning, IconReceipt, IconLock, Icons } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    accountType?: string;
    verificationStatus?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { dict, language } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, certified: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        DRAFT: { label: dict.dashboard.status.DRAFT, color: "text-slate-600", bg: "bg-slate-100", icon: IconDocument },
        SUBMITTED: { label: dict.dashboard.status.SUBMITTED, color: "text-blue-600", bg: "bg-blue-50", icon: IconClock },
        PAYMENT_1_PENDING: { label: dict.dashboard.status.PAYMENT_1_PENDING, color: "text-amber-600", bg: "bg-amber-50", icon: IconReceipt },
        PAID_PHASE_1: { label: dict.dashboard.status.PAID_PHASE_1, color: "text-emerald-600", bg: "bg-emerald-50", icon: IconCheckCircle },
        PAYMENT_2_PENDING: { label: dict.dashboard.status.PAYMENT_2_PENDING, color: "text-pink-600", bg: "bg-pink-50", icon: IconReceipt },
        PAID_PHASE_2: { label: dict.dashboard.status.PAID_PHASE_2, color: "text-emerald-600", bg: "bg-emerald-50", icon: IconCheckCircle },
        REVISION_REQUIRED: { label: dict.dashboard.status.REVISION_REQUIRED, color: "text-red-600", bg: "bg-red-50", icon: IconWarning },
        DOCUMENT_APPROVED: { label: dict.dashboard.status.DOCUMENT_APPROVED, color: "text-indigo-600", bg: "bg-indigo-50", icon: IconCheckCircle },
        PENDING_AUDIT: { label: dict.dashboard.status.PENDING_AUDIT, color: "text-purple-600", bg: "bg-purple-50", icon: IconSearch },
        APPROVED: { label: dict.dashboard.status.APPROVED, color: "text-green-600", bg: "bg-green-50", icon: IconCheckCircle },
    };

    useEffect(() => {
        const sessionUser = AuthService.getUser();
        if (!sessionUser) { router.push("/login"); return; }
        setUser(sessionUser);

        const loadData = async () => {
            try {
                setIsLoading(true);
                // Fetch fresh profile
                try {
                    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth-farmer/me`, {
                        headers: { 'Authorization': `Bearer ${AuthService.getToken()}` },
                        cache: 'no-store'
                    });
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        const freshUser = profileData.data.user || profileData.data;
                        setUser(freshUser);
                        AuthService.updateUser(freshUser);
                    }
                } catch (err) { console.warn('Profile refresh failed', err); }

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
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [router]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return dict.dashboard.greeting.morning;
        if (h < 17) return dict.dashboard.greeting.afternoon;
        return dict.dashboard.greeting.evening;
    };

    if (!user || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-medium animate-pulse">{dict.common?.loading || 'กำลังโหลด...'}</p>
            </div>
        );
    }

    const latestApp = applications[0];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* 0. Verification Banner */}
            {user.verificationStatus !== 'APPROVED' && (
                <div className="gacp-card bg-gradient-to-r from-warning-bg to-white border-warning/20 overflow-visible">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-warning-bg flex items-center justify-center shadow-inner">
                                <IconWarning className="w-8 h-8 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-warning-text leading-tight">{dict.dashboard.verification.warningTitle}</h3>
                                <p className="text-slate-600 mt-1 max-w-xl">{dict.dashboard.verification.warningMsg}</p>
                            </div>
                        </div>
                        <Link href="/verify-identity" className="gacp-btn-primary bg-gradient-to-r from-warning to-orange-600 shadow-warning/20 whitespace-nowrap">
                            {dict.dashboard.verification.button}
                        </Link>
                    </div>
                </div>
            )}

            {/* 1. Hero & Stats Section */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Hero Card */}
                <div className="lg:col-span-3 gacp-card bg-[#006837] text-white border-0 shadow-xl p-0 overflow-hidden min-h-[240px] relative group">
                    {/* Official Watermark & Gradients */}
                    <div className="absolute inset-0 bg-[url('/images/thai-pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-emerald-400/20 to-transparent"></div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform group-hover:scale-110 duration-700">
                        <img src="/images/dtam-logo.png" alt="Watermark" className="w-80 h-80 brightness-0 invert" />
                    </div>

                    <div className="h-full p-8 flex flex-col justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                </span>
                                <span className="text-emerald-100/90 text-sm font-bold tracking-widest uppercase">{getGreeting()}</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-sm">
                                {user.firstName} <span className="text-emerald-200">{user.lastName}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="p-1 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <IconLeaf className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-emerald-50 font-medium">{user.companyName || 'วิสาหกิจชุมชนเกษตรกรไทย'}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            {user.verificationStatus === 'APPROVED' ? (
                                <Link href="/farmer/applications/new" className="gacp-btn-primary bg-white text-primary hover:bg-emerald-50 shadow-white/10 border-0 px-8">
                                    <IconLeaf className="w-5 h-5" />
                                    {dict.dashboard.hero.newApp}
                                </Link>
                            ) : (
                                <button className="gacp-btn-secondary bg-white/10 border-white/20 text-white cursor-not-allowed px-8">
                                    <IconLock className="w-5 h-5 mr-2 opacity-50" />
                                    {dict.dashboard.hero.verifyToStart}
                                </button>
                            )}
                            <div className="flex -space-x-3 overflow-hidden ml-2 items-center">
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-primary bg-emerald-500 overflow-hidden flex items-center justify-center text-[10px] font-bold">DT</div>
                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-primary bg-emerald-600 overflow-hidden flex items-center justify-center text-[10px] font-bold">AM</div>
                                <span className="ml-4 text-xs text-emerald-100/60 font-medium">Verified by Department</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Stat Cards */}
                <div className="flex flex-col gap-4">
                    <div className="flex-1 gacp-card p-6 flex flex-col justify-between group hover:bg-primary-50">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.dashboard.stats.total}</span>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-black text-slate-800">{stats.total}</span>
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors">
                                <IconDocument className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 gacp-card p-6 flex flex-col justify-between group hover:bg-emerald-50">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.dashboard.stats.certified}</span>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl font-black text-primary">{stats.certified}</span>
                            <div className="p-2 rounded-xl bg-primary-50 text-primary transition-colors">
                                <IconCheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-10">

                {/* Left Column: Recent Activity & Alerts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Critical Alerts */}
                    {(latestApp?.status === 'PAYMENT_1_PENDING' || latestApp?.status === 'PAYMENT_2_PENDING') && (
                        <div className="gacp-card bg-gradient-to-br from-rose-600 to-pink-700 text-white border-0 shadow-premium group">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <IconReceipt className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black">{dict.dashboard.alerts?.paymentTitle}</h3>
                                        <p className="text-rose-100 text-sm mt-1">{dict.dashboard.alerts?.paymentDesc}</p>
                                    </div>
                                </div>
                                <Link href="/farmer/payments" className="gacp-btn-primary bg-white text-rose-600 border-0 hover:bg-rose-50 shadow-white/10 px-8">
                                    {dict.dashboard.alerts?.paymentButton}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Active Application Status */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                {dict.dashboard.sections.recent}
                            </h2>
                            {latestApp && (
                                <Link href="/farmer/applications" className="text-sm font-bold text-primary hover:underline">
                                    {dict.common?.viewAll}
                                </Link>
                            )}
                        </div>

                        {latestApp ? (
                            <div className="gacp-card p-0 group overflow-visible">
                                <div className="p-8 border-b border-slate-100 flex flex-wrap justify-between items-start gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${STATUS_MAP[latestApp.status]?.bg}`}>
                                            {(() => {
                                                const StatusIcon = STATUS_MAP[latestApp.status]?.icon || IconDocument;
                                                return <StatusIcon className={`w-8 h-8 ${STATUS_MAP[latestApp.status]?.color || 'text-slate-400'}`} />;
                                            })()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{dict.dashboard.appCard.title}</h3>
                                                <span className="text-xs font-mono font-bold text-slate-400">#{latestApp._id?.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`gacp-badge ${STATUS_MAP[latestApp.status]?.bg} ${STATUS_MAP[latestApp.status]?.color}`}>
                                                    {STATUS_MAP[latestApp.status]?.label || latestApp.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{dict.dashboard.appCard.lastUpdate}</span>
                                        <span className="text-sm font-bold text-slate-700">
                                            {new Date(latestApp.updatedAt || latestApp.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                                            <span className="text-sm font-bold text-slate-600">GACP Certification</span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Plants</span>
                                            <span className="text-sm font-bold text-slate-600">{latestApp.items?.length || 0} Species</span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/farmer/applications/new/step/${latestApp.status === 'PAYMENT_1_PENDING' || latestApp.status === 'PAYMENT_2_PENDING' ? '14' : '1'}`}
                                        className="gacp-btn-primary px-10"
                                    >
                                        {dict.dashboard.appCard.continue}
                                        <Icons.ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="gacp-card py-20 bg-white border-dashed border-2 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                    <IconDocument className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{dict.dashboard.empty.title}</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">{dict.dashboard.empty.desc}</p>
                                <Link href="/farmer/applications/new" className="gacp-btn-secondary mt-8 border-slate-200 text-slate-600">
                                    {dict.common?.startNow}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-8">

                    {/* Certificates Widget */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                            {dict.dashboard.sections.certificates}
                        </h2>

                        {certificates.length === 0 ? (
                            <div className="gacp-card py-10 flex flex-col items-center justify-center text-center opacity-60">
                                <IconCheckCircle className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">{dict.dashboard.sections.noCert}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {certificates.map(cert => (
                                    <div key={cert._id} className="gacp-card p-5 hover:border-indigo-100 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                                <IconDocument className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-400 transition-colors">#{cert.certificateNumber}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800 leading-tight">{cert.plantType || 'Herb Plant'}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Exp: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                                        <button className="w-full mt-4 py-2 border border-slate-100 rounded-xl text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-100 transition-all">
                                            {dict.dashboard.buttons.download}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Menu */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{dict.dashboard.sections.quickMenu}</h2>
                        <div className="grid gap-4">
                            {[
                                { title: dict.dashboard.menus.manual, desc: dict.dashboard.menus.manualDesc, icon: IconDocument, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { title: dict.dashboard.menus.report, desc: dict.dashboard.menus.reportDesc, icon: IconWarning, color: 'text-amber-600', bg: 'bg-amber-50' }
                            ].map((item, idx) => (
                                <button key={idx} className="gacp-card p-4 flex items-center gap-4 hover:bg-slate-50 text-left border-0 shadow-soft group">
                                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm whitespace-nowrap">{item.title}</h4>
                                        <p className="text-slate-400 text-xs mt-0.5 font-medium">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
