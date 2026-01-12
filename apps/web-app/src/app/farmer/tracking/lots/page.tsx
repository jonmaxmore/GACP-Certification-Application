'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Lot {
    id: string;
    lotNumber: string;
    packageType: string;
    quantity: number;
    unitWeight: number;
    totalWeight: number;
    status: string;
    packagedAt: string;
    expiryDate: string;
    qrCode: string;
    trackingUrl: string;
    testStatus: string;
    thcContent: number;
    cbdContent: number;
    batch: {
        batchNumber: string;
        harvestDate: string;
        farm: {
            farmName: string;
        };
        species: {
            nameTH: string;
        };
    };
}

interface HarvestBatch {
    id: string;
    batchNumber: string;
    harvestDate: string;
    status: string;
    farm: {
        farmName: string;
    };
    species: {
        nameTH: string;
    };
}

const packageTypes: Record<string, string> = {
    BAG_1KG: 'ถุง 1 กก.',
    BAG_500G: 'ถุง 500 กรัม',
    BOX_5KG: 'กล่อง 5 กก.',
    BOTTLE_100ML: 'ขวด 100 ml',
    BOTTLE_500ML: 'ขวด 500 ml',
};

export default function LotsPage() {
    const searchParams = useSearchParams();
    const batchIdFromUrl = searchParams.get('batchId');

    const [lots, setLots] = useState<Lot[]>([]);
    const [batches, setBatches] = useState<HarvestBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [selectedBatchId, setSelectedBatchId] = useState<string>(batchIdFromUrl || '');

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatchId) {
            fetchLots(selectedBatchId);
        }
    }, [selectedBatchId]);

    async function fetchBatches() {
        try {
            const farmId = localStorage.getItem('currentFarmId') || localStorage.getItem('farmId');
            if (!farmId) {
                setLoading(false);
                return;
            }
            const res = await fetch(`/api/proxy/harvest-batches?farmId=${farmId}`);
            const data = await res.json();
            if (data.success) {
                setBatches(data.data);
                // Auto-select first batch if no batchId in URL
                if (!batchIdFromUrl && data.data.length > 0) {
                    setSelectedBatchId(data.data[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            if (!selectedBatchId) {
                setLoading(false);
            }
        }
    }

    async function fetchLots(batchId: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/proxy/lots/batch/${batchId}`);
            const data = await res.json();
            if (data.success) {
                setLots(data.data);
            }
        } catch (error) {
            console.error('Error fetching lots:', error);
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

    async function showQRPrint(lot: Lot) {
        setSelectedLot(lot);
        try {
            const res = await fetch(`/api/proxy/lots/${lot.id}/qr/print`);
            const data = await res.json();
            if (data.success) {
                setQrDataUrl(data.data.label.qrCodeDataUrl);
            }
        } catch (error) {
            console.error('Error fetching QR:', error);
        }
    }

    function printQR() {
        window.print();
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
                    <h1 className="text-2xl font-bold text-gray-800">📦 ล็อตบรรจุภัณฑ์</h1>
                    <p className="text-gray-500">จัดการล็อตและพิมพ์ QR Code</p>
                </div>
                <Link
                    href="/tracking/cycles"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    สร้างล็อตใหม่
                </Link>
            </div>

            {/* Batch Selector */}
            {batches.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">เลือก Batch</label>
                    <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="w-full md:w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">-- เลือก Batch --</option>
                        {batches.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.batchNumber} • {b.species?.nameTH} • {formatDate(b.harvestDate)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Empty State */}
            {lots.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {selectedBatchId ? 'ยังไม่มีล็อตใน Batch นี้' : 'ยังไม่มีล็อตบรรจุภัณฑ์'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {selectedBatchId
                            ? 'สร้างล็อตใหม่จากหน้ารอบการปลูก'
                            : 'เริ่มต้นจากการสร้างรอบการปลูกและเก็บเกี่ยวก่อน'}
                    </p>
                    <Link
                        href="/tracking/cycles"
                        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        ไปที่รอบการปลูก
                    </Link>
                </div>
            )}

            {/* Lots Grid */}
            {lots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lots.map((lot) => (
                        <div key={lot.id} className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-mono font-semibold text-lg">{lot.lotNumber}</h3>
                                    <p className="text-gray-500">{lot.batch?.species?.nameTH || '-'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${lot.status === 'PACKAGED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {lot.status === 'PACKAGED' ? 'บรรจุแล้ว' : lot.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">บรรจุภัณฑ์</span>
                                    <div className="font-medium">{packageTypes[lot.packageType] || lot.packageType}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">จำนวน</span>
                                    <div className="font-medium">{lot.quantity} ชิ้น ({lot.totalWeight} กก.)</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">วันบรรจุ</span>
                                    <div className="font-medium">{formatDate(lot.packagedAt)}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">หมดอายุ</span>
                                    <div className="font-medium text-red-600">{formatDate(lot.expiryDate)}</div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between">
                                <button
                                    onClick={() => showQRPrint(lot)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    ดู QR Code
                                </button>
                                <Link
                                    href={`/trace/${lot.qrCode}`}
                                    target="_blank"
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    ดูหน้า Trace →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Print Modal */}
            {selectedLot && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:bg-white print:relative">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md print:shadow-none print:rounded-none">
                        <div className="text-center print:text-left">
                            <h2 className="text-xl font-bold mb-4 print:hidden">QR Code สำหรับพิมพ์</h2>

                            {/* QR Label - This will be printed */}
                            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg print:border-solid">
                                {qrDataUrl && (
                                    <img src={qrDataUrl} alt="QR Code" className="w-32 h-32 mx-auto mb-4" />
                                )}
                                <div className="text-left">
                                    <div className="font-mono font-bold text-lg">{selectedLot.lotNumber}</div>
                                    <div className="text-sm text-gray-600">{selectedLot.batch?.species?.nameTH}</div>
                                    <div className="text-sm text-gray-600">{selectedLot.batch?.farm?.farmName}</div>
                                    <div className="text-sm mt-2">
                                        <span className="text-gray-500">เก็บเกี่ยว:</span> {formatDate(selectedLot.batch?.harvestDate)}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500">หมดอายุ:</span> {formatDate(selectedLot.expiryDate)}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">สแกน QR เพื่อดูข้อมูลผลิตภัณฑ์</div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4 print:hidden">
                                <button
                                    onClick={() => setSelectedLot(null)}
                                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    ปิด
                                </button>
                                <button
                                    onClick={printQR}
                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    🖨️ พิมพ์
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
