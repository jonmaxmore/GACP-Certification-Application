"use client";

import React, { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui';
import { Sidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

interface FarmerLayoutProps {
    children: React.ReactNode;
}

export function FarmerLayout({ children }: FarmerLayoutProps) {
    const [isDark, setIsDark] = useState(false);

    const pathname = usePathname();
    // Hide sidebar on the application wizard page
    const isWizard = pathname === '/applications/new';

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");

        // Listen for theme changes
        const handleStorage = () => {
            setIsDark(localStorage.getItem("theme") === "dark");
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-800'}`}>
            {!isWizard && <Sidebar isDark={isDark} toggleTheme={toggleTheme} />}

            <main className={`${isWizard ? 'w-full' : 'lg:ml-[72px]'} pb-[72px] lg:pb-0`}>
                {children}
            </main>

            <BottomNav isDark={isDark} />
        </div>
    );
}

export default FarmerLayout;

