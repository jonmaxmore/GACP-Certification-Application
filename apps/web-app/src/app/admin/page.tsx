"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to users management
        router.push("/admin/users");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-white text-center">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>กำลังนำทาง...</p>
            </div>
        </div>
    );
}

