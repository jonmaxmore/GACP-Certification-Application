"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-surface-50'}`}>
            <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
    );

    const navItems = [
        { href: "/dashboard", label: "หน้าหลัก" },
        { href: "/applications", label: "คำขอ" },
        { href: "/tracking", label: "ติดตาม" },
        { href: "/payments", label: "การเงิน" },
        { href: "/profile", label: "โปรไฟล์" },
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-surface-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-xl font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
                            <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{isDark ? <circle cx="12" cy="12" r="5" /> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}</svg>
                    </button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                        <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
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
