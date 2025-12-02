'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                if (pathname !== '/login') {
                    router.push('/login');
                }
            } else {
                if (allowedRoles && !allowedRoles.includes(user.role)) {
                    // Redirect to dashboard if role not allowed (or 403 page)
                    router.push('/dashboard');
                }
            }
        }
    }, [user, isLoading, router, pathname, allowedRoles]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null; // Or unauthorized message
    }

    return <>{children}</>;
}
