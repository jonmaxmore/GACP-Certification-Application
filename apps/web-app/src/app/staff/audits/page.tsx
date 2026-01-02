"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

interface Audit {
    id: string;
    applicationId: string;
    applicantName: string;
    plantType: string;
    status: string;
    scheduledDate?: string;
    inspector?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    WAITING_SCHEDULE: { label: "รอจัดคิว", color: "bg-amber-100 text-amber-700" },
    SCHEDULED: { label: "นัดหมายแล้ว", color: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: { label: "กำลังตรวจ", color: "bg-purple-100 text-purple-700" },
    WAITING_RESULT: { label: "รอบันทึกผล", color: "bg-slate-100 text-slate-700" },
    PASSED: { label: "ผ่าน", color: "bg-green-100 text-green-700" },
    FAILED: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700" },
};

export default function StaffAuditsPage() {
    const router = useRouter();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }
        fetchAudits();
    }, [router]);

    const fetchAudits = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { audits: Audit[] } }>('/v2/field-audits');
            if (result.success && result.data?.data?.audits) {
                setAudits(result.data.data.audits);
            } else {
                // Mock data for demo
                setAudits([
                    { id: "AUD-001", applicationId: "APP-2024-001", applicantName: "นายสมชาย ใจดี", plantType: "กัญชา", status: "WAITING_SCHEDULE" },
                    { id: "AUD-002", applicationId: "APP-2024-002", applicantName: "บริษัท สมุนไพรไทย", plantType: "กระท่อม", status: "SCHEDULED", scheduledDate: "2024-12-20", inspector: "พิชัย ตรวจดี" },
                    { id: "AUD-003", applicationId: "APP-2024-003", applicantName: "วิสาหกิจชุมชนสมุนไพร", plantType: "ขมิ้น", status: "PASSED" },
                ]);
            }
        } catch {
            setAudits([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAudits = audits.filter(audit => {
        if (filter === "all") return true;
        return audit.status === filter;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-purple-200 hover:text-white">
                            ← กลับ
                        </Link>
                        <div className="h-6 w-px bg-purple-500" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔍</span>
                            <div>
                                <h1 className="text-xl font-bold">การตรวจประเมินทั้งหมด</h1>
                                <p className="text-purple-200 text-sm">Field Audits Management</p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/staff/calendar"
                        className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30"
                    >
                        📅 ปฏิทินนัดหมาย
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { key: "all", label: "ทั้งหมด" },
                        { key: "WAITING_SCHEDULE", label: "รอจัดคิว" },
                        { key: "SCHEDULED", label: "นัดหมายแล้ว" },
                        { key: "WAITING_RESULT", label: "รอบันทึกผล" },
                        { key: "PASSED", label: "ผ่าน" },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key
                                    ? "bg-purple-700 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Audits Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">หมายเลข</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">นัดหมาย</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAudits.map(audit => {
                                const status = STATUS_LABELS[audit.status] || { label: audit.status, color: "bg-slate-100" };
                                return (
                                    <tr key={audit.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-sm">{audit.id}</td>
                                        <td className="px-6 py-4 font-medium">{audit.applicantName}</td>
                                        <td className="px-6 py-4">{audit.plantType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {audit.scheduledDate || "-"}
                                            {audit.inspector && <span className="block text-xs">{audit.inspector}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/staff/audits/${audit.id}`}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                                            >
                                                ดูรายละเอียด
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredAudits.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <p className="text-5xl mb-4">🔍</p>
                            <p>ไม่พบรายการตรวจประเมิน</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
