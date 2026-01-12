'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function PlantingCyclesPage() {
    const [cycles, setCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            // Need to get first farm ID or fetch all cycles for user?
            // The API expects `farmId`. We should probably fetch farms first or update API to allow fetching all user's cycles.
            // For now, let's fetch farms to get IDs, then fetch cycles.
            const farmsRes = await apiClient.get<any[]>('/farms');
            const farms: any[] = farmsRes.data || [];

            if (farms.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch cycles for all farms (Promise.all)
            const cyclesPromises = farms.map(farm =>
                apiClient.get(`/planting-cycles?farmId=${farm.id}`).then(res => res.data || []).catch(() => [])
            );

            const results = await Promise.all(cyclesPromises);
            const allCycles = results.reduce((acc: any[], val: any) => acc.concat(val), []).sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

            setCycles(allCycles);
        } catch (err) {
            console.error(err);
            setError('Failed to load planting cycles');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-medium text-slate-900">รอบการปลูก</h1>
                    <p className="text-slate-500 mt-1">จัดการรอบการปลูกและบันทึกกิจกรรม</p>
                </div>
                <Link href="/planting/new" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    เริ่มรอบปลูกใหม่
                </Link>
            </header>

            {loading ? (
                <div className="text-center py-12">
                    <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
            ) : cycles.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-600">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">ยังไม่มีรอบการปลูก</h3>
                    <p className="text-slate-500 mt-2 mb-6">เริ่มบันทึกรอบการปลูกแรกของคุณเพื่อติดตามผลผลิต</p>
                    <Link href="/planting/new" className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700">
                        เริ่มรอบปลูกใหม่ &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cycles.map((cycle: any) => (
                        <div key={cycle.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
                                        {cycle.cycleName}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            🌱 {cycle.plantSpecies?.nameTH || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📅 เริ่ม: {new Date(cycle.startDate).toLocaleDateString('th-TH')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            📜 Cert: {cycle.certificate?.certificateNumber || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${cycle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                    cycle.status === 'HARVESTED' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {cycle.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
