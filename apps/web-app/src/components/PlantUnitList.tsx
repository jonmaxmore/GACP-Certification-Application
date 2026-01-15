"use client";

import { useState, useEffect } from "react";
import { apiClient as api } from "@/lib/api/api-client";
import { Icons } from "@/components/ui/icons";

interface PlantUnit {
    id: string;
    code: string;
    status: string;
}

interface PlantingCycle {
    id: string;
    cycleName: string;
    status: string;
    plantUnits: PlantUnit[];
    estimatedPlantCount: number;
}

interface PlantUnitListProps {
    farmId: string;
    applicationId?: string;
    canEdit?: boolean;
}

export default function PlantUnitList({ farmId, applicationId, canEdit = false }: PlantUnitListProps) {
    const [cycle, setCycle] = useState<PlantingCycle | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadCycle();
    }, [farmId]);

    const loadCycle = async () => {
        try {
            setLoading(true);
            // Fetch cycles for this farm
            const result = await api.get<PlantingCycle[]>(`/planting-cycles?farmId=${farmId}`);
            if (result.success && result.data && result.data.length > 0) {
                // Determine relevant cycle. For now, take the latest one.
                // In future, we might match by ID if linked.
                const latest = result.data[0];

                // Fetch full details including units (the list endpoint might not return relations)
                const detailResult = await api.get<{ data: PlantingCycle }>(`/planting-cycles/${latest.id}`);
                if (detailResult.success && detailResult.data?.data) {
                    setCycle(detailResult.data.data);
                }
            }
        } catch (error) {
            console.error("Failed to load planting cycle:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!cycle) return;
        if (!confirm(`ยืนยันการสร้างรหัสติดตามจำนวน ${cycle.estimatedPlantCount} ต้น?\nการกระทำนี้ไม่สามารถยกเลิกได้`)) return;

        try {
            setGenerating(true);
            const result = await api.post(`/planting-cycles/${cycle.id}/generate-units`, {});
            if (result.success) {
                alert("สร้างรหัสติดตามสำเร็จ");
                loadCycle(); // Reload to show units
            } else {
                alert("เกิดข้อผิดพลาด: " + ((result as any).message || "Unknown error"));
            }
        } catch (error) {
            alert("Connection error");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="text-center p-5 text-gray-500 text-sm">Loading tracking data...</div>;

    if (!cycle) return null; // No active cycle found

    const units = cycle.plantUnits || [];
    const hasUnits = units.length > 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Icons.Tree className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">การติดตามรายต้น (Tree-by-Tree)</h3>
                        <p className="text-xs text-gray-500">รอบปลูก: {cycle.cycleName}</p>
                    </div>
                </div>
                {hasUnits && (
                    <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md">
                        {units.length} ต้น
                    </span>
                )}
            </div>

            <div className="p-4">
                {!hasUnits ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                            <Icons.QrCode className="w-6 h-6" />
                        </div>
                        <p className="text-gray-500 text-sm mb-4">ยังไม่ได้สร้างรหัสติดตามสำหรับรอบปลูกนี้</p>
                        {canEdit && (
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                            >
                                {generating ? <Icons.Loader className="w-4 h-4 animate-spin" /> : <Icons.Plus className="w-4 h-4" />}
                                สร้างรหัสติดตาม ({cycle.estimatedPlantCount} ต้น)
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
                        {units.map((unit) => (
                            <div key={unit.id} className="p-2 border border-gray-200 rounded-lg flex items-center justify-between hover:border-emerald-400 transition-colors group bg-white">
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-700 truncate" title={unit.code}>
                                        {unit.code}
                                    </div>
                                    <div className="text-[10px] text-gray-500">สถานะ: {unit.status}</div>
                                </div>
                                <button className="text-gray-400 hover:text-emerald-600 p-1" title="ดู QR Code">
                                    <Icons.QrCode className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {hasUnits && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 w-full">
                        <Icons.Printer className="w-3.5 h-3.5" />
                        พิมพ์ QR Code ทั้งหมด
                    </button>
                </div>
            )}
        </div>
    );
}
