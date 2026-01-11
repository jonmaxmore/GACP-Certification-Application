"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    IconHome, IconDocument, IconSearch, IconCalendar, IconCreditCard,
    IconChart, IconUser, IconSun, IconMoon, IconLogout, IconCertificate
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
    { href: "/staff/certificates", Icon: IconCertificate, label: "ใบรับรอง" },
    { href: "/staff/calendar", Icon: IconCalendar, label: "ปฏิทิน" },
    { href: "/staff/accounting", Icon: IconCreditCard, label: "บัญชี", roles: ["accountant", "ACCOUNTANT", "admin", "ADMIN", "SUPER_ADMIN"] },
    { href: "/staff/analytics", Icon: IconChart, label: "สถิติ" },
    { href: "/staff/verification", Icon: IconUsers, label: "ตรวจสอบตัวตน", roles: ["admin", "ADMIN", "SUPER_ADMIN"] },
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
    const [isDark, setIsDark] = useState(true); // Default to Dark for Admin
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Force slate/dark theme preference for staff if not set
        const saved = localStorage.getItem("staff_theme");
        setIsDark(saved === "light" ? false : true);

        const userData = localStorage.getItem("staff_user");
        if (!userData) { router.push("/staff/login"); return; }
        try { setUser(JSON.parse(userData)); } catch { router.push("/staff/login"); }
    }, [router]);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("staff_theme", next ? "dark" : "light");
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

    if (!mounted) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-600 border-t-slate-400 rounded-full animate-spin" /></div>;

    const bgClass = isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-800";
    const sidebarClass = isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200";

    return (
        <div className={`min-h-screen font-sans flex ${bgClass}`}>
            {/* Sidebar - Desktop */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r transition-colors ${sidebarClass}`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-900/50">D</div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">DTAM Staff</h1>
                            <p className="text-xs text-slate-500">Backoffice Portal</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
                        {filteredNavItems.map(item => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-indigo-600/10 text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <item.Icon size={20} className={isActive ? "text-indigo-500" : ""} />
                                    <span className={`text-sm font-medium ${isActive ? "text-indigo-400" : ""}`}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                <IconUser size={18} />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-slate-300">{user?.firstName}</p>
                                <p className="text-xs text-slate-500">{roleInfo.label}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors"><IconLogout size={18} /></button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 relative">
                {/* Topbar */}
                <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
                    <h2 className="font-semibold text-lg">{title || 'Dashboard'}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-slate-500 hover:text-slate-300">
                            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
                        </button>
                    </div>
                </header>

                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

