
"use client";

import { useState, useEffect } from "react";
import { AdminService, Plant } from "@/lib/services/admin-service";

export default function PlantsPage() {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        productionInputs: "{}"
    });

    const fetchPlants = async () => {
        setIsLoading(true);
        const result = await AdminService.getPlants();
        if (result.success && result.data) {
            setPlants(result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const inputs = JSON.parse(formData.productionInputs);
            const result = await AdminService.createPlant({
                name: formData.name,
                productionInputs: inputs
            });

            if (result.success) {
                setShowModal(false);
                setFormData({ name: "", productionInputs: "{}" });
                fetchPlants();
                alert("เพิ่มพืชสำเร็จ");
            } else {
                alert("เกิดข้อผิดพลาด: " + result.error);
            }
        } catch (err) {
            alert("รูปแบบ JSON ไม่ถูกต้อง");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">จัดการพืชสมุนไพร (Plants)</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    + เพิ่มพืชใหม่
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">ID</th>
                            <th className="p-4 font-semibold text-slate-600">ชื่อพืช</th>
                            <th className="p-4 font-semibold text-slate-600">สถานะ</th>
                            <th className="p-4 font-semibold text-slate-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">กำลังโหลด...</td></tr>
                        ) : plants.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">ไม่พบข้อมูลพืช</td></tr>
                        ) : (
                            plants.map((plant) => (
                                <tr key={plant.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-xs text-slate-500">{plant.id.substring(0, 8)}...</td>
                                    <td className="p-4 font-medium text-slate-800">{plant.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {plant.isActive ? 'ใช้งาน' : 'ระงับ'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-emerald-600 hover:underline text-sm font-medium">แก้ไข</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold mb-4">เพิ่มพืชใหม่</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">ชื่อพืช</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Production Inputs (JSON)</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 font-mono text-sm h-32"
                                    value={formData.productionInputs}
                                    onChange={(e) => setFormData({ ...formData, productionInputs: e.target.value })}
                                    placeholder='{"waterSource": ["River", "Well"]}'
                                />
                                <p className="text-xs text-slate-500 mt-1">ต้องเป็นรูปแบบ JSON ที่ถูกต้อง</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
