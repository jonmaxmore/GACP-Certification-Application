"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    IconHome, IconDocument, IconCompass, IconCreditCard, IconUser,
    IconSun, IconMoon, IconLogout, IconLeaf
} from "@/components/ui/icons";

interface Farm {
    id: string;
    farmName: string;
    farmType: string;
    province: string;
    district: string;
    totalArea: number;
    areaUnit: string;
    status: string;
    createdAt: string;
}

const NAV_ITEMS = [
    { href: "/dashboard", Icon: IconHome, label: "หน้าหลัก" },
    { href: "/applications", Icon: IconDocument, label: "คำขอ" },
    { href: "/establishments", Icon: IconLeaf, label: "แปลงปลูก", active: true },
    { href: "/tracking", Icon: IconCompass, label: "ติดตาม" },
    { href: "/payments", Icon: IconCreditCard, label: "การเงิน" },
    { href: "/profile", Icon: IconUser, label: "โปรไฟล์" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'DRAFT': { label: 'ฉบับร่าง', color: 'bg-slate-100 text-slate-700' },
    'PENDING_VERIFICATION': { label: 'รอตรวจสอบ', color: 'bg-amber-100 text-amber-700' },
    'VERIFIED': { label: 'ยืนยันแล้ว', color: 'bg-emerald-100 text-emerald-700' },
    'REJECTED': { label: 'ไม่ผ่าน', color: 'bg-red-100 text-red-700' },
};

export default function EstablishmentsPage() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("user")) {
            window.location.href = "/login";
            return;
        }

        // Fetch farms
        fetchFarms();
    }, []);

    async function fetchFarms() {
        try {
            setLoading(true);
            const res = await fetch('/api/farms/my');
            const data = await res.json();

            if (data.success) {
                setFarms(data.data || []);
            } else {
                setError(data.message || 'Failed to load farms');
            }
        } catch (err) {
            console.error('Failed to fetch farms:', err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    }

    const toggleTheme = () => {
        setIsDark(!isDark);
        localStorage.setItem("theme", !isDark ? "dark" : "light");
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/api/auth/logout";
    };

    if (!mounted) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}>
            <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className={`min-h-screen font-sans transition-colors ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 border-r z-50 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-lg font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-3">
                    {NAV_ITEMS.map(item => (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all relative ${item.active
                            ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                            : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                            }`}>
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500 rounded-r" />}
                            <item.Icon size={22} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-2">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
                    </button>
                    <button onClick={handleLogout} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                        <IconLogout size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center border-t z-50 ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-lg' : 'bg-white/95 border-slate-200 backdrop-blur-lg'}`}>
                {NAV_ITEMS.map(item => (
                    <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[64px] ${item.active ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                        <item.Icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-10 pb-24 lg:pb-10 max-w-4xl">
                <header className="flex justify-between items-center flex-wrap gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-medium">แปลงปลูกของฉัน</h1>
                        <p className="text-sm text-slate-500 mt-1">จัดการข้อมูลแปลงเพาะปลูก ({farms.length} แปลง)</p>
                    </div>
                    <Link href="/establishments/new" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-shadow">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        เพิ่มแปลงปลูก
                    </Link>
                </header>

                {/* Loading State */}
                {loading && (
                    <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="rounded-2xl p-6 bg-red-50 border border-red-200 text-red-700">
                        <p className="font-medium">เกิดข้อผิดพลาด</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button onClick={fetchFarms} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-sm font-medium hover:bg-red-200">
                            ลองใหม่
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && farms.length === 0 && (
                    <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีแปลงปลูก</h3>
                        <p className="text-sm text-slate-500 mb-5">เพิ่มข้อมูลแปลงเพาะปลูกของคุณเพื่อเริ่มต้นการขอรับรอง GACP</p>
                        <Link href="/establishments/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30">
                            เพิ่มแปลงปลูกใหม่
                        </Link>
                    </div>
                )}

                {/* Farm List */}
                {!loading && !error && farms.length > 0 && (
                    <div className="space-y-4">
                        {farms.map(farm => {
                            const status = STATUS_MAP[farm.status] || STATUS_MAP['DRAFT'];
                            return (
                                <Link
                                    key={farm.id}
                                    href={`/establishments/${farm.id}`}
                                    className={`block rounded-2xl p-6 transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border border-slate-700 hover:border-slate-600' : 'bg-white border border-slate-200 hover:border-emerald-300'}`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-medium">{farm.farmName}</h3>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {farm.district}, {farm.province}
                                            </p>
                                            <div className="flex gap-4 mt-3 text-sm">
                                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                                    📐 {farm.totalArea} {farm.areaUnit === 'rai' ? 'ไร่' : farm.areaUnit}
                                                </span>
                                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                                    🌱 {farm.farmType === 'CULTIVATION' ? 'แปลงปลูก' : farm.farmType === 'PROCESSING' ? 'โรงแปรรูป' : 'ผสม'}
                                                </span>
                                            </div>
                                        </div>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
