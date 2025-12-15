"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NAV_ITEMS = [
    {
        href: '/dashboard', label: 'หน้าหลัก', icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        )
    },
    {
        href: '/applications', label: 'คำขอ', icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        )
    },
    {
        href: '/tracking', label: 'ติดตาม', icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        )
    },
    {
        href: '/payments', label: 'การเงิน', icon: (c: string) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        )
    },
    {
        href: '/profile', label: 'โปรไฟล์', icon: (c: string) => (
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

export function BottomNav({ isDark = false }: BottomNavProps) {
    const pathname = usePathname();

    // Don't show on wizard pages
    if (pathname?.includes('/applications/new')) {
        return null;
    }

    const activeColor = '#10B981';
    const inactiveColor = isDark ? '#6B7280' : '#9CA3AF';
    const bgColor = isDark ? '#1F2937' : '#FFFFFF';
    const borderColor = isDark ? '#374151' : '#E5E7EB';

    return (
        <>
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '72px',
                backgroundColor: bgColor,
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '0 8px',
                zIndex: 100,
                fontFamily: "'Kanit', sans-serif",
            }} className="bottom-nav">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 12px',
                            textDecoration: 'none',
                            position: 'relative',
                            minWidth: '56px',
                        }}>
                            {isActive && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-1px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '24px',
                                    height: '3px',
                                    backgroundColor: activeColor,
                                    borderRadius: '0 0 4px 4px',
                                }} />
                            )}
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                backgroundColor: isActive ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5') : 'transparent',
                                transition: 'all 0.2s ease',
                            }}>
                                {item.icon(isActive ? activeColor : inactiveColor)}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? activeColor : inactiveColor,
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer for bottom nav */}
            <div style={{ height: '72px' }} className="bottom-nav-spacer" />

            {/* Mobile-only styles */}
            <style jsx global>{`
                @media (min-width: 768px) {
                    .bottom-nav {
                        display: none !important;
                    }
                    .bottom-nav-spacer {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}

export default BottomNav;
