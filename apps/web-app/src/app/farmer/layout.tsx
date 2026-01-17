"use client";

import React, { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui';
import { Sidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    const pathname = usePathname();
    // Hide sidebar on the application wizard page
    const isWizard = pathname?.startsWith('/farmer/applications/new');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div className={`min-h-screen transition-all duration-500 selection:bg-primary/30 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F8F9FA] text-slate-800'}`}>
            {/* Background decorative elements */}
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply`}></div>
                <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] mix-blend-multiply`}></div>
            </div>

            {!isWizard && <Sidebar isDark={isDark} toggleTheme={toggleTheme} />}

            <main className={`relative z-10 transition-all duration-500 ${isWizard ? 'w-full' : 'lg:ml-28 px-4 lg:px-8'} pb-[72px] lg:pb-12 pt-4 lg:pt-8`}>
                <div className="max-w-[1440px] mx-auto">
                    {children}
                </div>
            </main>

            <BottomNav isDark={isDark} />
        </div>
    );
}

