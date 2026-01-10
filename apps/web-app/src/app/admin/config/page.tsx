"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminService } from "@/lib/services/admin-service";

export default function AdminConfigPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState<Record<string, string>>({
        "fee.review": "5000",
        "fee.inspection": "15000",
        "fee.vat": "7"
    });

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true);
            const result = await AdminService.getConfigs();
            if (result.success && result.data) {
                const newConfig: Record<string, string> = { ...config };
                // Map array to object
                result.data.forEach(item => {
                    newConfig[item.key] = item.value;
                });
                setConfig(newConfig);
            }
            setIsLoading(false);
        };
        fetchConfig();
    }, []);

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save each config key
            const promises = Object.keys(config).map(key =>
                AdminService.updateConfig(key, config[key])
            );
            await Promise.all(promises);
            alert("บันทึกการตั้งค่าแล้ว");
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการบันทึก");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ (System Configuration)</h1>
                    <p className="text-sm text-slate-500">กำหนดค่าธรรมเนียมและพารามิเตอร์ของระบบ</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fees Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">💰</span>
                        ค่าธรรมเนียม (Fees)
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ค่าตรวจเอกสารคำขอ (บาท)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config["fee.review"]}
                                    onChange={(e) => handleChange("fee.review", e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-4 top-2 text-slate-400">THB</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">เรียกเก็บเมื่อยื่นคำขอ</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">ค่าตรวจประเมินแปลง (บาท)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config["fee.inspection"]}
                                    onChange={(e) => handleChange("fee.inspection", e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-4 top-2 text-slate-400">THB</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">เรียกเก็บก่อนนัดหมายตรวจแปลง</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">อัตราภาษีมูลค่าเพิ่ม (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={config["fee.vat"]}
                                    onChange={(e) => handleChange("fee.vat", e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                />
                                <span className="absolute right-4 top-2 text-slate-400">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Parameters (Placeholder) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-60">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">⚙️</span>
                        ตั้งค่าอื่นๆ (Coming Soon)
                    </h3>
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-10 bg-slate-50 rounded border border-slate-200"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2 mt-4"></div>
                        <div className="h-10 bg-slate-50 rounded border border-slate-200"></div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500 text-sm">
                        ส่วนนี้อยู่ระหว่างการพัฒนา
                    </div>
                </div>
            </div>
        </div>
    );
}
