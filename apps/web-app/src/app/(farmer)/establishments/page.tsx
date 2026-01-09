"use client";

import { useEffect, useState } from "react";
import {
    IconHome, IconDocument, IconCompass, IconCreditCard, IconUser,
    IconSun, IconMoon, IconLogout, IconLeaf, IconPlus
} from "@/components/ui/icons";

const NAV_ITEMS = [
    { href: "/dashboard", Icon: IconHome, label: "หน้าหลัก" },
    { href: "/applications", Icon: IconDocument, label: "คำขอ" },
    { href: "/establishments", Icon: IconLeaf, label: "แปลงปลูก", active: true },
    { href: "/tracking", Icon: IconCompass, label: "ติดตาม" },
    { href: "/payments", Icon: IconCreditCard, label: "การเงิน" },
    { href: "/profile", Icon: IconUser, label: "โปรไฟล์" },
];

export default function EstablishmentsPage() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("user")) { window.location.href = "/login"; return; }
    }, []);

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

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
                        <p className="text-sm text-slate-500 mt-1">จัดการข้อมูลแปลงเพาะปลูก</p>
                    </div>
                    <Link href="/establishments/new" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white font-medium shadow-lg shadow-primary-500/30">
                        เพิ่มแปลงปลูก
                    </Link>
                </header>

                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-surface-200'}`}>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">ยังไม่มีแปลงปลูก</h3>
                    <p className="text-sm text-slate-500 mb-5">เพิ่มข้อมูลแปลงเพาะปลูกของคุณ</p>
                    <Link href="/establishments/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white font-medium shadow-lg shadow-primary-500/30">
                        เพิ่มแปลงปลูกใหม่
                    </Link>
                </div>
            </main>
        </div>
    );
}
