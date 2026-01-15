'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import { AuthService, AuthUser } from "@/lib/services/auth-service";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SidebarProps {
    isDark: boolean;
    toggleTheme: () => void;
}

export function Sidebar({ isDark, toggleTheme }: SidebarProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);
    const { dict } = useLanguage();

    useEffect(() => {
        const currentUser = AuthService.getUser();
        setUser(currentUser);

        const unsubscribe = AuthService.onAuthChange((event, data) => {
            if (event === 'login' && data && typeof data === 'object' && 'user' in data) {
                setUser((data as { user: AuthUser }).user);
            } else {
                setUser(AuthService.getUser());
            }
        });

        return () => unsubscribe();
    }, []);

    const isVerified = user?.verificationStatus === 'APPROVED';

    const navItems = [
        { href: "/farmer/dashboard", icon: Icons.Home, label: dict.sidebar.dashboard, requiredVerify: false },
        { href: "/farmer/applications", icon: Icons.Document, label: dict.sidebar.applications, requiredVerify: true },
        { href: "/farmer/establishments", icon: Icons.Leaf, label: dict.sidebar.establishments, requiredVerify: true },
        { href: "/farmer/planting", icon: Icons.Calendar, label: dict.sidebar.planting, requiredVerify: true },
        { href: "/farmer/certificates", icon: Icons.Certificate, label: dict.sidebar.certificates, requiredVerify: true },
        { href: "/farmer/tracking", icon: Icons.Compass, label: dict.sidebar.tracking, requiredVerify: true },
        { href: "/farmer/payments", icon: Icons.CreditCard, label: dict.sidebar.payments, requiredVerify: true },
        { href: "/farmer/profile", icon: Icons.User, label: dict.sidebar.profile, requiredVerify: false },
        { href: "/farmer/settings", icon: Icons.Settings, label: dict.sidebar.settings, requiredVerify: false },
    ];

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = "/login";
    };

    return (
        <aside className={`
            fixed left-4 top-4 bottom-4 w-20 rounded-[2.5rem] flex flex-col items-center py-8 transition-all duration-500 z-50
            hidden lg:flex 
            ${isDark
                ? 'bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl shadow-2xl'
                : 'bg-white/80 border border-white/40 backdrop-blur-xl shadow-soft'
            }
        `}>
            {/* Logo Section */}
            <div className="mb-10 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all duration-700 scale-110"></div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-800 flex items-center justify-center text-white font-black text-xl shadow-lg relative z-10 transform group-hover:rotate-12 transition-transform">
                    G
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto no-scrollbar">
                {navItems.map(item => {
                    if (item.requiredVerify && !isVerified) return null;

                    const isActive = pathname === item.href || (item.href !== "/farmer/dashboard" && pathname.startsWith(item.href));

                    return (
                        <div key={item.href} className="group relative">
                            <Link
                                href={item.href}
                                className={`
                                    flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-2xl transition-all duration-300 relative
                                    ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100'
                                        : isDark
                                            ? 'text-slate-500 hover:text-white hover:bg-white/5'
                                            : 'text-gray-400 hover:text-primary hover:bg-primary-50'
                                    }
                                `}
                            >
                                <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest text-center px-1 leading-tight ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                    {item.label}
                                </span>
                            </Link>

                            {/* Floating Tooltip/Indicator */}
                            {!isActive && (
                                <div className="absolute left-[84px] top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all z-[60] whitespace-nowrap shadow-xl">
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    {item.label}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col items-center gap-4 w-full px-3">
                <button
                    onClick={toggleTheme}
                    className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${isDark
                            ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 shadow-inner'
                            : 'bg-gray-50 text-slate-500 hover:bg-white hover:shadow-soft border border-gray-100'
                        }
                    `}
                >
                    {isDark ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                </button>

                <button
                    onClick={handleLogout}
                    className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 mb-2
                        ${isDark
                            ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }
                    `}
                >
                    <Icons.Logout className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
