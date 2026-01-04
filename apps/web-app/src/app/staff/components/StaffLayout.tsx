"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StaffUser {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
}

interface NavItem {
    href: string;
    icon: string;
    label: string;
    roles?: string[];
}

const ROLE_LABELS: Record<string, { label: string; icon: string }> = {
    assessor: { label: "ผู้ตรวจสอบ", icon: "📋" },
    scheduler: { label: "เจ้าหน้าที่จัดคิว", icon: "📅" },
    accountant: { label: "พนักงานบัญชี", icon: "💰" },
    admin: { label: "ผู้ดูแลระบบ", icon: "⚙️" },
    REVIEWER_AUDITOR: { label: "ผู้ตรวจสอบ", icon: "📋" },
    SCHEDULER: { label: "เจ้าหน้าที่จัดคิว", icon: "📅" },
    ACCOUNTANT: { label: "พนักงานบัญชี", icon: "💰" },
    ADMIN: { label: "ผู้ดูแลระบบ", icon: "⚙️" },
    SUPER_ADMIN: { label: "ผู้ดูแลสูงสุด", icon: "🔐" },
};

const NAV_ITEMS: NavItem[] = [
    { href: "/staff/dashboard", icon: "🏠", label: "หน้าหลัก" },
    { href: "/staff/applications", icon: "📄", label: "คำขอ" },
    { href: "/staff/audits", icon: "🔍", label: "ตรวจแปลง" },
    { href: "/staff/calendar", icon: "📅", label: "ปฏิทิน" },
    { href: "/staff/accounting", icon: "💰", label: "บัญชี", roles: ["accountant", "ACCOUNTANT", "admin", "ADMIN", "SUPER_ADMIN"] },
    { href: "/staff/analytics", icon: "📊", label: "สถิติ" },
    { href: "/staff/management", icon: "👥", label: "จัดการ", roles: ["admin", "ADMIN", "SUPER_ADMIN"] },
];

interface StaffLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function StaffLayout({ children, title, subtitle }: StaffLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("staff_user");
        if (!userData) {
            router.push("/staff/login");
            return;
        }
        try {
            setUser(JSON.parse(userData));
        } catch {
            router.push("/staff/login");
        }
    }, [router]);

    const toggleTheme = () => {
        setIsDark(!isDark);
        localStorage.setItem("theme", !isDark ? "dark" : "light");
    };

    const handleLogout = () => {
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        document.cookie = "staff_token=; path=/; max-age=0";
        router.push("/staff/login");
    };

    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    });

    const roleInfo = user ? ROLE_LABELS[user.role] || { label: user.role, icon: "👤" } : { label: "", icon: "👤" };

    if (!mounted) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-surface-50'}`}>
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans transition-colors ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-surface-50 text-slate-900'}`}>
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <Link href="/staff/dashboard" className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-xl font-bold text-white mb-8 shadow-lg shadow-primary-500/30">
                    G
                </Link>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {filteredNavItems.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative ${isActive
                                        ? (isDark ? 'bg-primary-500/15 border border-primary-500/30' : 'bg-primary-50 border border-primary-200')
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-primary-500 rounded-r" />}
                                <span className="text-lg">{item.icon}</span>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex flex-col items-center gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-primary-500/15 hover:bg-primary-500/25' : 'bg-primary-50 hover:bg-primary-100'}`}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <Link href="/staff/profile" className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        👤
                    </Link>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        🚪
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                {filteredNavItems.slice(0, 5).map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-primary-500' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl">
                {/* Header */}
                {(title || user) && (
                    <header className="flex justify-between items-start flex-wrap gap-4 mb-8">
                        <div>
                            {title && <h1 className="text-2xl lg:text-3xl font-semibold">{title}</h1>}
                            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                        </div>
                        {user && (
                            <div className={`hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white border border-surface-200'}`}>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{user.firstName || 'เจ้าหน้าที่'} {user.lastName || ''}</p>
                                    <p className="text-xs text-slate-500">{roleInfo.icon} {roleInfo.label}</p>
                                </div>
                            </div>
                        )}
                    </header>
                )}

                {/* Content */}
                {children}
            </main>
        </div>
    );
}
