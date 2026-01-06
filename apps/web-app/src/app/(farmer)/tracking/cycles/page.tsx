'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlantingCycle {
    id: string;
    cycleName: string;
    cycleNumber: number;
    status: string;
    startDate: string;
    expectedHarvestDate: string;
    actualHarvestDate: string | null;
    plotName: string;
    plotArea: number;
    estimatedYield: number;
    actualYield: number | null;
    plantSpecies: {
        nameTH: string;
        nameEN: string;
    };
    certificate: {
        certificateNumber: string;
        expiryDate: string;
    } | null;
    _count: {
        batches: number;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    PLANNING: { label: 'วางแผน', color: 'bg-gray-100 text-gray-700' },
    PLANTED: { label: 'ปลูกแล้ว', color: 'bg-blue-100 text-blue-700' },
    GROWING: { label: 'กำลังเติบโต', color: 'bg-green-100 text-green-700' },
    READY_HARVEST: { label: 'พร้อมเก็บเกี่ยว', color: 'bg-yellow-100 text-yellow-700' },
    HARVESTED: { label: 'เก็บเกี่ยวแล้ว', color: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'เสร็จสิ้น', color: 'bg-purple-100 text-purple-700' },
};

export default function PlantingCyclesPage() {
    const [cycles, setCycles] = useState<PlantingCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // TODO: Get farmId from auth context
    const farmId = 'demo-farm-id';

    useEffect(() => {
        fetchCycles();
    }, []);

    async function fetchCycles() {
        try {
            const res = await fetch(`/api/proxy/v2/planting-cycles?farmId=${farmId}`);
            const data = await res.json();
            if (data.success) {
                setCycles(data.data);
            }
        } catch (error) {
            console.error('Error fetching cycles:', error);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🌱 รอบการปลูก</h1>
                    <p className="text-gray-500">จัดการรอบการปลูกและเก็บเกี่ยว</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    สร้างรอบใหม่
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="text-3xl font-bold text-blue-600">{cycles.length}</div>
                    <div className="text-gray-500 text-sm">รอบทั้งหมด</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="text-3xl font-bold text-green-600">
                        {cycles.filter(c => c.status === 'GROWING').length}
                    </div>
                    <div className="text-gray-500 text-sm">กำลังปลูก</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="text-3xl font-bold text-yellow-600">
                        {cycles.filter(c => c.status === 'READY_HARVEST').length}
                    </div>
                    <div className="text-gray-500 text-sm">พร้อมเก็บเกี่ยว</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="text-3xl font-bold text-emerald-600">
                        {cycles.filter(c => c.status === 'HARVESTED' || c.status === 'COMPLETED').length}
                    </div>
                    <div className="text-gray-500 text-sm">เก็บเกี่ยวแล้ว</div>
                </div>
            </div>

            {/* Cycles List */}
            {cycles.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <div className="text-6xl mb-4">🌾</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีรอบการปลูก</h3>
                    <p className="text-gray-500 mb-4">เริ่มสร้างรอบการปลูกใหม่เพื่อติดตามผลผลิต</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        สร้างรอบแรก
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cycles.map((cycle) => (
                        <div key={cycle.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800 mr-3">
                                                {cycle.cycleName}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[cycle.status]?.color || 'bg-gray-100'}`}>
                                                {statusConfig[cycle.status]?.label || cycle.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500">
                                            {cycle.plantSpecies.nameTH} • {cycle.plotName || 'ไม่ระบุแปลง'} • {cycle.plotArea || '-'} ไร่
                                        </p>
                                    </div>
                                    <Link
                                        href={`/tracking/cycles/${cycle.id}`}
                                        className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                                    >
                                        ดูรายละเอียด
                                    </Link>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                    <div>
                                        <div className="text-gray-500 text-sm">วันปลูก</div>
                                        <div className="font-medium">{formatDate(cycle.startDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">กำหนดเก็บ</div>
                                        <div className="font-medium">{formatDate(cycle.expectedHarvestDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">ผลผลิตคาดการณ์</div>
                                        <div className="font-medium">{cycle.estimatedYield || '-'} กก.</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">Batch</div>
                                        <div className="font-medium">{cycle._count?.batches || 0} รายการ</div>
                                    </div>
                                </div>

                                {cycle.certificate && (
                                    <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        ใบรับรอง: {cycle.certificate.certificateNumber} (หมดอายุ: {formatDate(cycle.certificate.expiryDate)})
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TODO: Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">สร้างรอบการปลูกใหม่</h2>
                        <p className="text-gray-500 mb-4">ฟอร์มนี้จะเพิ่มในเวอร์ชันถัดไป</p>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
