
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import { AuthService } from "@/lib/services/auth-service";

interface SidebarProps {
    isDark: boolean;
    toggleTheme: () => void;
}

export function Sidebar({ isDark, toggleTheme }: SidebarProps) {
    const pathname = usePathname();
    const accentColor = isDark ? "#10B981" : "#16A34A";
    const mutedColor = isDark ? "#64748B" : "#9CA3AF";

    const navItems = [
        { href: "/dashboard", icon: Icons.Home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.Document, label: "คำขอ" },
        { href: "/establishments", icon: Icons.Leaf, label: "แปลงปลูก" },
        { href: "/certificates", icon: Icons.Certificate, label: "ใบรับรอง" },
        { href: "/tracking", icon: Icons.Compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.CreditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.User, label: "โปรไฟล์" },
    ];

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = "/login";
    };

    return (
        <aside className={`fixed left-0 top-0 bottom-0 w-[72px] border-r flex flex-col items-center py-5 transition-colors hidden lg:flex ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-xl mb-8">G</div>
            <nav className="flex-1 flex flex-col gap-1 w-full">
                {navItems.map(item => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-3 relative">
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r" />}
                            <item.icon color={isActive ? accentColor : mutedColor} />
                            <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="flex flex-col items-center gap-3">
                <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : 'bg-emerald-50 hover:bg-emerald-100'}`}>
                    {isDark ? <Icons.Sun color={accentColor} /> : <Icons.Moon color={accentColor} />}
                </button>
                <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Icons.Logout color={mutedColor} />
                </button>
            </div>
        </aside>
    );
}
