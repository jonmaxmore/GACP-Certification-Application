"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/api-client";
import { AuthService } from "@/lib/services/auth-service";

interface Farm {
    id: string;
    farmName: string;
    farmType: string;
    province: string;
    district: string;
    totalArea: number;
    areaUnit: string;
    status: string;
    createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    'DRAFT': { label: 'ฉบับร่าง', color: 'bg-slate-100 text-slate-700' },
    'PENDING_VERIFICATION': { label: 'รอตรวจสอบ', color: 'bg-amber-100 text-amber-700' },
    'VERIFIED': { label: 'ยืนยันแล้ว', color: 'bg-emerald-100 text-emerald-700' },
    'REJECTED': { label: 'ไม่ผ่าน', color: 'bg-red-100 text-red-700' },
};

export default function EstablishmentsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");

        const user = AuthService.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        fetchFarms();
    }, [router]);

    async function fetchFarms() {
        try {
            setLoading(true);
            const result = await apiClient.get<Farm[]>('/farms/my');

            if (result.success && result.data) {
                setFarms(Array.isArray(result.data) ? result.data : []);
            } else {
                // If 404/no data, just show empty
                setFarms([]);
                if (!result.success && result.error !== "Not Found") {
                    setError(result.error || 'Failed to load farms');
                }
            }
        } catch (err) {
            console.error('Failed to fetch farms:', err);
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}>
            <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-medium">แปลงปลูกของฉัน</h1>
                <p className="text-sm text-slate-500 mt-1">จัดการข้อมูลแปลงที่ได้รับรองแล้ว ({farms.length} แปลง)</p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                    <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="rounded-2xl p-6 bg-red-50 border border-red-200 text-red-700">
                    <p className="font-medium">เกิดข้อผิดพลาด</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={fetchFarms} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-sm font-medium hover:bg-red-200">
                        ลองใหม่
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && farms.length === 0 && (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">ยังไม่มีแปลงปลูกที่ได้รับรอง</h3>
                    <p className="text-sm text-slate-500 mb-5">
                        ระบบจะสร้างข้อมูลแปลงให้คุณโดยอัตโนมัติ<br />
                        หลังจากที่คุณได้รับใบรับรอง GACP เรียบร้อยแล้ว
                    </p>
                    <Link href="/applications/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30">
                        ยื่นขอรับรองใหม่
                    </Link>
                </div>
            )}

            {/* Farm List */}
            {!loading && !error && farms.length > 0 && (
                <div className="space-y-4">
                    {farms.map(farm => {
                        const status = STATUS_MAP[farm.status] || STATUS_MAP['DRAFT'];
                        return (
                            <div
                                key={farm.id}
                                className={`block rounded-2xl p-6 transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border border-slate-700 hover:border-slate-600' : 'bg-white border border-slate-200 hover:border-emerald-300'}`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <Link href={`/establishments/${farm.id}`} className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium hover:text-emerald-600 transition-colors">{farm.farmName}</h3>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {farm.district}, {farm.province}
                                        </p>
                                        <div className="flex gap-4 mt-3 text-sm">
                                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                                📐 {farm.totalArea} {farm.areaUnit === 'rai' ? 'ไร่' : farm.areaUnit}
                                            </span>
                                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                                                🌱 {farm.farmType === 'CULTIVATION' ? 'แปลงปลูก' : farm.farmType === 'PROCESSING' ? 'โรงแปรรูป' : 'ผสม'}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="flex flex-col gap-2">
                                        <Link href={`/establishments/${farm.id}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                apiClient.getBlob(`/farms/${farm.id}/qrcode`).then(blob => {
                                                    if (!blob) return;
                                                    const url = URL.createObjectURL(blob);
                                                    const win = window.open(url, '_blank');
                                                    if (win) {
                                                        win.onload = () => { URL.revokeObjectURL(url); };
                                                    }
                                                });
                                            }}
                                            className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600"
                                            title="Print QR Code"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                                <rect width="7" height="7" x="7" y="7" rx="1" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
