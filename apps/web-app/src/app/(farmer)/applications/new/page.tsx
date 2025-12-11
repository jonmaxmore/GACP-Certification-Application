"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewApplicationPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to first step
        router.replace('/applications/new/step-0');
    }, [router]);

    return (
        <div style={{
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8A8A8A",
            fontSize: "14px",
        }}>
            กำลังโหลด...
        </div>
    );
}
