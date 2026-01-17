"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AuthService, AuthUser } from '@/lib/services/auth-service';

const NAV_ITEMS = [
    {
        href: '/farmer/dashboard', label: 'หน้าหลัก', requiredVerify: false, icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        href: '/farmer/applications', label: 'คำขอ', requiredVerify: true, icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        )
    },
    {
        href: '/tracking', label: 'ติดตาม', requiredVerify: true, icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        )
    },
    {
        href: '/payments', label: 'การเงิน', requiredVerify: true, icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        )
    },
    {
        href: '/farmer/profile', label: 'โปรไฟล์', requiredVerify: false, icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
        )
    },
];

interface BottomNavProps {
    isDark?: boolean;
}

/**
 * Eco-Professional Bottom Navigation
 * Mobile-first with Tailwind CSS
 */
export function BottomNav({ isDark = false }: BottomNavProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        // Initial load
        const currentUser = AuthService.getUser();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(currentUser);

        // Listen for updates (login/profile update)
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

    // Don't show on wizard pages
    if (pathname?.includes('/applications/new')) {
        return null;
    }

    return (
        <nav className={`
            fixed bottom-0 left-0 right-0 h-[60px] z-50
            flex justify-between items-center px-6 pb-safe
            bg-white border-t border-slate-100 md:hidden
        `}>
            {NAV_ITEMS.map((item) => {
                if (item.requiredVerify && !isVerified) return null;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center p-2 active:scale-95 transition-transform"
                    >
                        {item.icon(isActive ? '#000000' : '#CCCCCC')}
                    </Link>
                );
            })}
        </nav>
    );
}

export default BottomNav;
