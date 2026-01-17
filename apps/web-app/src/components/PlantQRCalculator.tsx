'use client';

import React, { useRef, useEffect } from 'react';

export interface PlantQRData {
    /** Unique plant ID */
    plantId: string;
    /** GACP Certificate number */
    certificateNo?: string;
    /** Farm information */
    farm: {
        id: string;
        name: string;
        address: string;
        gpsLat?: number;
        gpsLng?: number;
    };
    /** Cultivation details */
    cultivation: {
        method: 'outdoor' | 'greenhouse' | 'indoor' | 'vertical' | 'hydroponic';
        strain: string;
        strainNameTh: string;
    };
    /** Important dates */
    dates: {
        planted: string; // ISO date
        estimatedHarvest?: string; // ISO date
        actualHarvest?: string; // ISO date
    };
    /** QR metadata */
    qr: {
        generatedAt: string;
        validUntil?: string;
        printedCount: number;
    };
}

interface PlantQRCalculatorProps {
    /** Number of plants */
    plantCount: number;
    /** Estimated planting date */
    plantingDate?: string;
    /** Show preview of QR data structure */
    showPreview?: boolean;
    /** Callback when QR count changes */
    onChange?: (count: number, estimatedCost: number) => void;
}

// Pricing tiers for QR codes
const QR_PRICING = [
    { min: 1, max: 100, pricePerQR: 5 },
    { min: 101, max: 500, pricePerQR: 4 },
    { min: 501, max: 1000, pricePerQR: 3 },
    { min: 1001, max: Infinity, pricePerQR: 2 },
];

function calculateQRCost(count: number): number {
    const tier = QR_PRICING.find(t => count >= t.min && count <= t.max);
    return count * (tier?.pricePerQR || 5);
}

export function PlantQRCalculator({
    plantCount,
    plantingDate,
    showPreview = true,
    onChange,
}: PlantQRCalculatorProps) {
    const qrCount = plantCount;
    const estimatedCost = calculateQRCost(qrCount);
    const tier = QR_PRICING.find(t => qrCount >= t.min && qrCount <= t.max);

    // Track previous values to prevent infinite loops
    const prevValuesRef = useRef({ qrCount: -1, estimatedCost: -1 });
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const prev = prevValuesRef.current;
        // Only call onChange if values actually changed
        if (prev.qrCount !== qrCount || prev.estimatedCost !== estimatedCost) {
            prevValuesRef.current = { qrCount, estimatedCost };
            onChangeRef.current?.(qrCount, estimatedCost);
        }
    }, [qrCount, estimatedCost]);

    // Format date for display
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Estimate harvest date (typically 3-4 months for cannabis)
    const estimatedHarvestDate = plantingDate
        ? new Date(new Date(plantingDate).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : undefined;

    return (
        <div className="space-y-4">
            {/* QR Summary Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">
                            🏷️ QR Code สำหรับการ Trace
                        </h3>
                        <p className="text-sm text-slate-600">
                            1 ต้น = 1 QR Code (ติดตามจากปลูกถึงเก็บเกี่ยว)
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-emerald-600">
                            {qrCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">QR Codes</div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white/70 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            ราคาต่อ QR ({tier?.pricePerQR || 5} บาท/QR)
                        </span>
                        <span className="font-semibold text-slate-800">
                            ฿{estimatedCost.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        *ราคาจะคำนวณรวมในใบเสนอราคา
                    </p>
                </div>

                {/* Pricing Tiers Info */}
                <details className="text-xs">
                    <summary className="text-emerald-600 cursor-pointer hover:underline">
                        ดูอัตราส่วนลดตามจำนวน
                    </summary>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                        {QR_PRICING.map((tier, i) => (
                            <div key={i} className="bg-white rounded p-2 text-center">
                                <div className="text-slate-800 font-medium">
                                    {tier.pricePerQR} บาท
                                </div>
                                <div className="text-slate-400">
                                    {tier.min}-{tier.max === Infinity ? '∞' : tier.max} ต้น
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>

            {/* QR Data Preview */}
            {showPreview && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        ข้อมูลใน QR Code
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                        ข้อมูลต่อไปนี้จะถูกเข้ารหัสใน QR Code แต่ละใบ
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">🆔</span>
                            <span className="text-slate-600">รหัสต้น (Plant ID)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">🏠</span>
                            <span className="text-slate-600">ข้อมูลฟาร์ม</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">📍</span>
                            <span className="text-slate-600">พิกัด GPS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">🌱</span>
                            <span className="text-slate-600">สายพันธุ์</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">🌾</span>
                            <span className="text-slate-600">วิธีการปลูก</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">📅</span>
                            <span className="text-slate-600">วันปลูก / วันเก็บเกี่ยว</span>
                        </div>
                    </div>

                    {/* Timeline Preview */}
                    {plantingDate && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-xs text-slate-400">วันปลูก</div>
                                    <div className="text-sm font-medium text-slate-700">
                                        {formatDate(plantingDate)}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-right">
                                    <div className="text-xs text-slate-400">คาดการณ์เก็บเกี่ยว</div>
                                    <div className="text-sm font-medium text-slate-700">
                                        ~{formatDate(estimatedHarvestDate)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export { QR_PRICING, calculateQRCost };
export default PlantQRCalculator;
