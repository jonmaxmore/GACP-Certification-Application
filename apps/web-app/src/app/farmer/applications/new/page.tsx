'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to Step 1 by default
        router.replace('/farmer/applications/new/step/1');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-emerald-600 font-medium">Redirecting to Step 1...</span>
        </div>
    );
}
