'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TraceData {
    type: 'PLANTING_CYCLE' | 'HARVEST_BATCH' | 'LOT';
    data: {
        // Farm info
        farm: {
            name: string;
            type?: string;
            location: string;
            address?: string;
        };
        // Plot info
        plot?: {
            name: string;
            area?: number;
            unit?: string;
        };
        // Plant info
        plant: {
            code?: string;
            nameTH: string;
            nameEN?: string;
            scientificName?: string;
            variety?: string;
        };
        // Cultivation info
        cultivation?: {
            method: string;
            methodCode?: string;
            seedSource?: string;
            soilType?: string;
            irrigationType?: string;
            cycleName?: string;
            cycleNumber?: number;
        };
        // Dates
        dates?: {
            planted?: string;
            plantedTH?: string;
            expectedHarvest?: string;
            expectedHarvestTH?: string;
            actualHarvest?: string;
            actualHarvestTH?: string;
        };
        // Yield
        yield?: {
            estimated?: number;
            actual?: number;
            unit?: string;
        };
        // Status
        status?: string;
        // Batch info (for HARVEST_BATCH)
        batch?: {
            number?: string;
            batchNumber?: string;
            plantingDate?: string;
            plantingDateTH?: string;
            harvestDate?: string;
            harvestDateTH?: string;
            yield?: number;
            yieldUnit?: string;
            qualityGrade?: string;
            status?: string;
        };
        // Harvests (for PLANTING_CYCLE)
        harvests?: Array<{
            batchNumber: string;
            harvestDate?: string;
            harvestDateTH?: string;
            yield?: number;
            yieldUnit?: string;
            grade?: string;
            status?: string;
        }>;
        // Lot info
        lot?: {
            lotNumber: string;
            packageType: string;
            quantity: number;
            unitWeight: number;
            status: string;
            packagedAt: string;
            expiryDate: string;
            labTest?: {
                status: string;
                thcContent: number;
                cbdContent: number;
                moistureContent: number;
            };
        };
        // Certificate
        certificate?: {
            number: string;
            standard?: string;
            issuedDate?: string;
            issuedDateTH?: string;
            expiryDate?: string;
            expiryDateTH?: string;
            status?: string;
            isValid: boolean;
        };
        // Verification
        verification: {
            valid: boolean;
            certified?: boolean;
            scannedAt: string;
            verifiedBy?: string;
        };
    };
}

export default function TracePage() {
    const params = useParams();
    const qrCode = params?.qrCode as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [traceData, setTraceData] = useState<TraceData | null>(null);

    useEffect(() => {
        if (!qrCode) return;

        async function fetchTraceData() {
            try {
                // Direct API call (Nginx routes /api/* to backend)
                const res = await fetch(`/api/trace/${qrCode}`);
                const data = await res.json();

                if (!data.success) {
                    setError(data.message || 'ไม่พบข้อมูลผลิตภัณฑ์');
                    return;
                }

                setTraceData(data);
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            } finally {
                setLoading(false);
            }
        }

        fetchTraceData();
    }, [qrCode]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังตรวจสอบ...</p>
                </div>
            </div>
        );
    }

    if (error || !traceData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูล</h1>
                    <p className="text-gray-600 mb-6">{error || 'QR Code นี้ไม่ถูกต้องหรือไม่มีในระบบ'}</p>
                    <p className="text-sm text-gray-400">รหัส: {qrCode}</p>
                </div>
            </div>
        );
    }

    const { data, type } = traceData;
    const cert = data.certificate;
    const isPlantingCycle = type === 'PLANTING_CYCLE';
    const isHarvestBatch = type === 'HARVEST_BATCH';
    const isLot = type === 'LOT';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                        <div className="flex items-center justify-center mb-3">
                            <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-lg font-semibold">
                                {cert?.isValid ? 'ผ่านการรับรอง GACP' : 'ข้อมูลการผลิต'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold">
                            🌿 GACP Traceability
                        </h1>
                        <p className="text-green-100 text-sm mt-1">ระบบตรวจสอบย้อนกลับผลิตภัณฑ์สมุนไพร</p>
                    </div>

                    {/* Verification Badge */}
                    <div className="p-4 bg-green-50 border-b flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-green-700">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">ตรวจสอบเมื่อ: {formatDate(data.verification.scannedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* GACP Certificate Badge */}
                {cert && (
                    <div className={`rounded-2xl shadow-lg p-6 mb-6 ${cert.isValid ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                        <div className="text-white text-center">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="text-xl font-bold mb-1">
                                {cert.isValid ? '✓ ได้รับรอง GACP' : '✗ ใบรับรองหมดอายุ'}
                            </div>
                            <div className="text-lg font-mono bg-white/20 rounded-lg py-2 px-4 inline-block mb-2">
                                {cert.number}
                            </div>
                            <div className="text-sm opacity-90">
                                ออกเมื่อ: {cert.issuedDateTH || formatDate(cert.issuedDate || '')} • หมดอายุ: {cert.expiryDateTH || formatDate(cert.expiryDate || '')}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Certificate Warning */}
                {!cert && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center text-yellow-700">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>อยู่ระหว่างดำเนินการขอรับรอง GACP</span>
                        </div>
                    </div>
                )}

                {/* Farm Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🏠</span> ข้อมูลฟาร์ม
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">ชื่อฟาร์ม</span>
                            <span className="font-medium text-gray-800">{data.farm.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">ที่ตั้ง</span>
                            <span className="font-medium text-gray-800">{data.farm.location}</span>
                        </div>
                        {data.plot && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">แปลง/โรงปลูก</span>
                                    <span className="font-medium text-gray-800">{data.plot.name}</span>
                                </div>
                                {data.plot.area && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">พื้นที่</span>
                                        <span className="font-medium text-gray-800">{data.plot.area} {data.plot.unit}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Plant & Variety Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🌱</span> ข้อมูลพืช
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">ชนิดพืช</span>
                            <span className="font-medium text-gray-800">{data.plant.nameTH}</span>
                        </div>
                        {data.plant.nameEN && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">ชื่อภาษาอังกฤษ</span>
                                <span className="font-medium text-gray-800">{data.plant.nameEN}</span>
                            </div>
                        )}
                        {data.plant.scientificName && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">ชื่อวิทยาศาสตร์</span>
                                <span className="font-medium text-gray-800 italic">{data.plant.scientificName}</span>
                            </div>
                        )}
                        {data.plant.variety && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">พันธุ์</span>
                                <span className="font-medium text-emerald-600">{data.plant.variety}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cultivation Method Info */}
                {data.cultivation && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">🌾</span> วิธีการปลูก
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">วิธีการ</span>
                                <span className="font-medium text-gray-800">{data.cultivation.method}</span>
                            </div>
                            {data.cultivation.seedSource && data.cultivation.seedSource !== 'ไม่ระบุ' && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">แหล่งเมล็ดพันธุ์</span>
                                    <span className="font-medium text-gray-800">{data.cultivation.seedSource}</span>
                                </div>
                            )}
                            {data.cultivation.soilType && data.cultivation.soilType !== 'ไม่ระบุ' && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ประเภทดิน</span>
                                    <span className="font-medium text-gray-800">{data.cultivation.soilType}</span>
                                </div>
                            )}
                            {data.cultivation.irrigationType && data.cultivation.irrigationType !== 'ไม่ระบุ' && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">ระบบน้ำ</span>
                                    <span className="font-medium text-gray-800">{data.cultivation.irrigationType}</span>
                                </div>
                            )}
                            {data.cultivation.cycleName && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">รอบการปลูก</span>
                                    <span className="font-medium text-gray-800">{data.cultivation.cycleName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Dates Info */}
                {(data.dates || data.batch) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">📅</span> วันที่สำคัญ
                        </h2>
                        <div className="space-y-3">
                            {/* For PLANTING_CYCLE */}
                            {data.dates && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">วันเพาะปลูก</span>
                                        <span className="font-medium text-emerald-600">
                                            {data.dates.plantedTH || formatDate(data.dates.planted || '')}
                                        </span>
                                    </div>
                                    {data.dates.expectedHarvest && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">กำหนดเก็บเกี่ยว</span>
                                            <span className="font-medium text-gray-800">
                                                {data.dates.expectedHarvestTH || formatDate(data.dates.expectedHarvest)}
                                            </span>
                                        </div>
                                    )}
                                    {data.dates.actualHarvest && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">วันเก็บเกี่ยวจริง</span>
                                            <span className="font-medium text-emerald-600">
                                                {data.dates.actualHarvestTH || formatDate(data.dates.actualHarvest)}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                            {/* For HARVEST_BATCH */}
                            {data.batch && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">วันปลูก</span>
                                        <span className="font-medium text-gray-800">
                                            {data.batch.plantingDateTH || formatDate(data.batch.plantingDate || '')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">วันเก็บเกี่ยว</span>
                                        <span className="font-medium text-emerald-600">
                                            {data.batch.harvestDateTH || formatDate(data.batch.harvestDate || '')}
                                        </span>
                                    </div>
                                    {data.batch.qualityGrade && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">เกรดคุณภาพ</span>
                                            <span className="font-medium text-green-600">เกรด {data.batch.qualityGrade}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Yield Info */}
                {data.yield && (data.yield.estimated || data.yield.actual) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">📊</span> ผลผลิต
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {data.yield.estimated && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-blue-600">{data.yield.estimated}</div>
                                    <div className="text-xs text-gray-500">{data.yield.unit || 'กก.'} (คาดการณ์)</div>
                                </div>
                            )}
                            {data.yield.actual && (
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-green-600">{data.yield.actual}</div>
                                    <div className="text-xs text-gray-500">{data.yield.unit || 'กก.'} (จริง)</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Harvest History (for PLANTING_CYCLE) */}
                {isPlantingCycle && data.harvests && data.harvests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">🧺</span> ประวัติการเก็บเกี่ยว
                        </h2>
                        <div className="space-y-3">
                            {data.harvests.map((h, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-sm">{h.batchNumber}</span>
                                        {h.grade && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">เกรด {h.grade}</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {h.harvestDateTH || formatDate(h.harvestDate || '')} • {h.yield} {h.yieldUnit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lot Info (for LOT type) */}
                {isLot && data.lot && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">📦</span> ข้อมูลล็อต
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">รหัสล็อต</span>
                                <span className="font-mono font-medium text-gray-800">{data.lot.lotNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">บรรจุภัณฑ์</span>
                                <span className="font-medium text-gray-800">{data.lot.packageType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">น้ำหนักต่อหน่วย</span>
                                <span className="font-medium text-gray-800">{data.lot.unitWeight} กก.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">วันบรรจุ</span>
                                <span className="font-medium text-gray-800">{formatDate(data.lot.packagedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">วันหมดอายุ</span>
                                <span className="font-medium text-red-600">{formatDate(data.lot.expiryDate)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lab Test Results (for LOT) */}
                {isLot && data.lot?.labTest && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="text-2xl mr-2">🧪</span> ผลการตรวจ Lab
                        </h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-blue-600">{data.lot.labTest.thcContent || 0}%</div>
                                <div className="text-xs text-gray-500">THC</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-green-600">{data.lot.labTest.cbdContent || 0}%</div>
                                <div className="text-xs text-gray-500">CBD</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                                <div className="text-2xl font-bold text-amber-600">{data.lot.labTest.moistureContent || 0}%</div>
                                <div className="text-xs text-gray-500">ความชื้น</div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${data.lot.labTest.status === 'PASSED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {data.lot.labTest.status === 'PASSED' ? '✅ ผ่านการตรวจสอบ' : '⏳ รอผลตรวจ'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm mt-8">
                    <p>ระบบตรวจสอบย้อนกลับผลิตภัณฑ์สมุนไพร</p>
                    <p className="mt-1">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
                    <p className="mt-2 font-mono text-xs text-gray-400">ID: {qrCode}</p>
                </div>
            </div>
        </div>
    );
}
