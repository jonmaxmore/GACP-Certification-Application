'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface TraceData {
    type: 'LOT' | 'BATCH';
    data: {
        lot?: {
            lotNumber: string;
            packageType: string;
            quantity: number;
            unitWeight: number;
            status: string;
            packagedAt: string;
            expiryDate: string;
            labTest: {
                status: string;
                thcContent: number;
                cbdContent: number;
                moistureContent: number;
                reportUrl: string;
            };
        };
        batch?: {
            batchNumber: string;
            harvestDate: string;
            plantingDate: string;
            qualityGrade: string;
            status: string;
        };
        farm: {
            farmName: string;
            farmNameTH: string;
            province: string;
            district: string;
        };
        plant: {
            nameTH: string;
            nameEN: string;
        };
        verification: {
            valid: boolean;
            scannedAt: string;
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
                const res = await fetch(`/api/proxy/v2/trace/${qrCode}`);
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
                            <span className="text-lg font-semibold">ผลิตภัณฑ์ผ่านการรับรอง</span>
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

                {/* Farm Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🏠</span> ข้อมูลฟาร์ม
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">ชื่อฟาร์ม</span>
                            <span className="font-medium text-gray-800">{data.farm.farmNameTH || data.farm.farmName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">ที่ตั้ง</span>
                            <span className="font-medium text-gray-800">{data.farm.district}, {data.farm.province}</span>
                        </div>
                    </div>
                </div>

                {/* Plant Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🌱</span> ข้อมูลพืช
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">ชนิดพืช</span>
                            <span className="font-medium text-gray-800">{data.plant.nameTH} ({data.plant.nameEN})</span>
                        </div>
                        {data.batch && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">วันปลูก</span>
                                    <span className="font-medium text-gray-800">{formatDate(data.batch.plantingDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">วันเก็บเกี่ยว</span>
                                    <span className="font-medium text-gray-800">{formatDate(data.batch.harvestDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">เกรด</span>
                                    <span className="font-medium text-green-600">{data.batch.qualityGrade || '-'}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Lot Info (if LOT type) */}
                {type === 'LOT' && data.lot && (
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

                {/* Lab Test Results */}
                {type === 'LOT' && data.lot?.labTest && (
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
