'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function NewPlantingCyclePage() {
    const router = useRouter();
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        farmId: '',
        pkantSpeciesId: 'P001', // Default 
        batchName: '',
        cycleDate: new Date().toISOString().split('T')[0],
        quantity: ''
    });

    useEffect(() => {
        // Fetch only farms relevant to user
        apiClient.get('/farms').then(res => {
            setFarms((res.data as any[]) || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setError('Failed to load farms');
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await apiClient.post('/planting-cycles', {
                ...form,
                plantSpeciesId: 'P001', // Hardcode for now or fetch list
                startDate: form.cycleDate
            });
            router.push('/planting');
        } catch (err: any) {
            console.error(err);
            // Show the specific error from backend (check certificate)
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create cycle';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 lg:p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-medium mb-6">เริ่มรอบการปลูกใหม่</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เลือกแปลงปลูก (Certified Farm)</label>
                    {loading ? <div className="text-sm text-slate-500">Loading farms...</div> : (
                        <select
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={form.farmId}
                            onChange={e => setForm({ ...form, farmId: e.target.value })}
                        >
                            <option value="">-- เลือกฟาร์ม --</option>
                            {farms.map((f: any) => (
                                <option key={f.id} value={f.id}>{f.farmName} ({f.status})</option>
                            ))}
                        </select>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                        * เฉพาะฟาร์มที่ได้รับใบรับรอง (Status: VERIFIED/ACTIVE) เท่านั้นจึงจะสามารถเริ่มรอบปลูกได้
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อรอบปลูก / Batch Name</label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Cycle-2024-001"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={form.batchName}
                        onChange={e => setForm({ ...form, batchName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">วันที่เริ่มปลูก</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={form.cycleDate}
                            onChange={e => setForm({ ...form, cycleDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">จำนวนต้น (โดยประมาณ)</label>
                        <input
                            type="number"
                            required
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={form.quantity}
                            onChange={e => setForm({ ...form, quantity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 rounded-xl border border-slate-200 font-medium hover:bg-slate-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </form>
        </div>
    );
}
