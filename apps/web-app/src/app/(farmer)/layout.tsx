"use client";

import React, { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui';

interface FarmerLayoutProps {
    children: React.ReactNode;
}

export function FarmerLayout({ children }: FarmerLayoutProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");

        // Listen for theme changes
        const handleStorage = () => {
            setIsDark(localStorage.getItem("theme") === "dark");
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <>
            {children}
            <BottomNav isDark={isDark} />
        </>
    );
}

export default FarmerLayout;
