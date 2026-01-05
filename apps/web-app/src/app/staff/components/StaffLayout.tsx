"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    IconHome, IconDocument, IconSearch, IconCalendar, IconCreditCard,
    IconChart, IconUser, IconSun, IconMoon, IconLogout
} from "@/components/ui/icons";

interface StaffUser {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
}

interface NavItem {
    href: string;
    Icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    roles?: string[];
}

const ROLE_LABELS: Record<string, { label: string }> = {
    assessor: { label: "ผู้ตรวจสอบ" },
    scheduler: { label: "เจ้าหน้าที่จัดคิว" },
    accountant: { label: "พนักงานบัญชี" },
    admin: { label: "ผู้ดูแลระบบ" },
    REVIEWER_AUDITOR: { label: "ผู้ตรวจสอบ" },
    SCHEDULER: { label: "เจ้าหน้าที่จัดคิว" },
    ACCOUNTANT: { label: "พนักงานบัญชี" },
    ADMIN: { label: "ผู้ดูแลระบบ" },
    SUPER_ADMIN: { label: "ผู้ดูแลสูงสุด" },
};

// Users Management Icon
const IconUsers = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { href: "/staff/dashboard", Icon: IconHome, label: "หน้าหลัก" },
    { href: "/staff/applications", Icon: IconDocument, label: "คำขอ" },
    { href: "/staff/audits", Icon: IconSearch, label: "ตรวจแปลง" },
    { href: "/staff/calendar", Icon: IconCalendar, label: "ปฏิทิน" },
    { href: "/staff/accounting", Icon: IconCreditCard, label: "บัญชี", roles: ["accountant", "ACCOUNTANT", "admin", "ADMIN", "SUPER_ADMIN"] },
    { href: "/staff/analytics", Icon: IconChart, label: "สถิติ" },
    { href: "/staff/management", Icon: IconUsers, label: "จัดการ", roles: ["admin", "ADMIN", "SUPER_ADMIN"] },
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

    const roleInfo = user ? ROLE_LABELS[user.role] || { label: user.role } : { label: "" };

    if (!mounted) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}>
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans transition-colors ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-900'}`}>
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 border-r ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Link href="/staff/dashboard" className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-lg font-semibold text-white mb-8">
                    G
                </Link>
                <nav className="flex-1 flex flex-col gap-1 w-full px-3">
                    {filteredNavItems.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all relative ${isActive
                                    ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                    : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                                    }`}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500 rounded-r" />}
                                <item.Icon size={22} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex flex-col gap-2">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
                    </button>
                    <Link href="/staff/profile" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                        <IconUser size={20} />
                    </Link>
                    <button onClick={handleLogout} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                        <IconLogout size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-20 flex justify-around items-center border-t ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur-lg' : 'bg-white/95 border-slate-200 backdrop-blur-lg'}`}>
                {filteredNavItems.slice(0, 5).map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[64px] ${isActive ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                            <item.Icon size={24} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-20 p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl">
                {/* Header */}
                {(title || user) && (
                    <header className="flex justify-between items-start flex-wrap gap-4 mb-8">
                        <div>
                            {title && <h1 className="text-2xl lg:text-3xl font-semibold">{title}</h1>}
                            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                        </div>
                        {user && (
                            <div className={`hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{user.firstName || 'เจ้าหน้าที่'} {user.lastName || ''}</p>
                                    <p className="text-xs text-slate-500">{roleInfo.label}</p>
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

