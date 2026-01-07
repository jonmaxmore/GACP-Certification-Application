'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlantSpecies {
    id: string;
    code: string;
    nameTH: string;
    nameEN: string;
}

interface Certificate {
    id: string;
    certificateNumber: string;
    expiryDate: string;
}

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
    certificate: Certificate | null;
    _count: {
        batches: number;
    };
}

interface CreateFormData {
    speciesId: string;
    certificateId: string;
    plotName: string;
    plotArea: number;
    startDate: string;
    expectedHarvestDate: string;
    estimatedYield: number;
    notes: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    PLANNING: { label: 'วางแผน', color: 'bg-gray-100 text-gray-700' },
    PLANTED: { label: 'ปลูกแล้ว', color: 'bg-blue-100 text-blue-700' },
    GROWING: { label: 'กำลังเติบโต', color: 'bg-green-100 text-green-700' },
    READY_HARVEST: { label: 'พร้อมเก็บเกี่ยว', color: 'bg-yellow-100 text-yellow-700' },
    HARVESTED: { label: 'เก็บเกี่ยวแล้ว', color: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'เสร็จสิ้น', color: 'bg-purple-100 text-purple-700' },
};

const defaultFormData: CreateFormData = {
    speciesId: '',
    certificateId: '',
    plotName: '',
    plotArea: 0,
    startDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    estimatedYield: 0,
    notes: ''
};

export default function PlantingCyclesPage() {
    const [cycles, setCycles] = useState<PlantingCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CreateFormData>(defaultFormData);
    const [species, setSpecies] = useState<PlantSpecies[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Get farmId from localStorage
    const [farmId, setFarmId] = useState<string>('');

    useEffect(() => {
        const storedFarmId = localStorage.getItem('currentFarmId') || localStorage.getItem('farmId');
        if (storedFarmId) {
            setFarmId(storedFarmId);
        }
        fetchCycles();
        fetchSpecies();
        fetchCertificates();
    }, []);

    async function fetchCycles() {
        try {
            const storedFarmId = localStorage.getItem('currentFarmId') || localStorage.getItem('farmId');
            if (!storedFarmId) {
                setLoading(false);
                return;
            }
            const res = await fetch(`/api/proxy/v2/planting-cycles?farmId=${storedFarmId}`);
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

    async function fetchSpecies() {
        try {
            const res = await fetch('/api/proxy/v2/plants');
            const data = await res.json();
            if (data.success) {
                setSpecies(data.data);
            }
        } catch (error) {
            console.error('Error fetching species:', error);
        }
    }

    async function fetchCertificates() {
        try {
            const res = await fetch('/api/proxy/v2/certificates/my');
            const data = await res.json();
            if (data.success) {
                setCertificates(data.data);
            }
        } catch (error) {
            console.error('Error fetching certificates:', error);
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

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!farmId) {
            setMessage({ type: 'error', text: 'กรุณาเลือกฟาร์มก่อน' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/proxy/v2/planting-cycles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmId,
                    ...formData,
                    plotArea: parseFloat(formData.plotArea.toString()),
                    estimatedYield: parseFloat(formData.estimatedYield.toString())
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'สร้างรอบการปลูกสำเร็จ' });
                setShowCreateModal(false);
                setFormData(defaultFormData);
                fetchCycles();
            } else {
                setMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาด' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setSaving(false);
        }
    }

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

            {/* Message */}
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* No farmId warning */}
            {!farmId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center text-yellow-700">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>กรุณาเลือกฟาร์มก่อนเริ่มใช้งาน (ไปที่หน้าฟาร์มของฉัน)</span>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">🌱 สร้างรอบการปลูกใหม่</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {/* Species */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชนิดพืช *</label>
                                <select
                                    value={formData.speciesId}
                                    onChange={(e) => setFormData({ ...formData, speciesId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">-- เลือกชนิดพืช --</option>
                                    {species.map(s => (
                                        <option key={s.id} value={s.id}>{s.nameTH} ({s.nameEN})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Certificate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ใบรับรอง GACP</label>
                                <select
                                    value={formData.certificateId}
                                    onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">-- ไม่ระบุ --</option>
                                    {certificates.map(c => (
                                        <option key={c.id} value={c.id}>{c.certificateNumber}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Plot Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อแปลง *</label>
                                <input
                                    type="text"
                                    value={formData.plotName}
                                    onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
                                    placeholder="เช่น แปลง A, แปลงริมน้ำ"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* Plot Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">พื้นที่ (ไร่) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.plotArea}
                                    onChange={(e) => setFormData({ ...formData, plotArea: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มปลูก *</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* Expected Harvest Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่คาดว่าจะเก็บเกี่ยว</label>
                                <input
                                    type="date"
                                    value={formData.expectedHarvestDate}
                                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Estimated Yield */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ผลผลิตที่คาดการณ์ (กก.)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.estimatedYield}
                                    onChange={(e) => setFormData({ ...formData, estimatedYield: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {saving ? 'กำลังบันทึก...' : 'สร้างรอบ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
