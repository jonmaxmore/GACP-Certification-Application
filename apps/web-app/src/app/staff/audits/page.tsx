"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";
import StaffLayout from "../components/StaffLayout";

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
    WAITING_SCHEDULE: { label: "รอจัดคิว", color: "bg-secondary-100 text-secondary-700" },
    SCHEDULED: { label: "นัดหมายแล้ว", color: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: { label: "กำลังตรวจ", color: "bg-violet-100 text-violet-700" },
    WAITING_RESULT: { label: "รอบันทึกผล", color: "bg-slate-100 text-slate-700" },
    PASSED: { label: "ผ่าน", color: "bg-primary-100 text-primary-700" },
    FAILED: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700" },
};

export default function StaffAuditsPage() {
    const router = useRouter();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("staff_token")) { router.push("/staff/login"); return; }
        fetchAudits();
    }, [router]);

    const fetchAudits = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { audits: Audit[] } }>('/v2/field-audits');
            if (result.success && result.data?.data?.audits) setAudits(result.data.data.audits);
            else setAudits([
                { id: "AUD-001", applicationId: "APP-2024-001", applicantName: "นายสมชาย ใจดี", plantType: "กัญชา", status: "WAITING_SCHEDULE" },
                { id: "AUD-002", applicationId: "APP-2024-002", applicantName: "บริษัท สมุนไพรไทย", plantType: "กระท่อม", status: "SCHEDULED", scheduledDate: "2024-12-20", inspector: "พิชัย ตรวจดี" },
                { id: "AUD-003", applicationId: "APP-2024-003", applicantName: "วิสาหกิจชุมชนสมุนไพร", plantType: "ขมิ้น", status: "PASSED" },
            ]);
        } catch { setAudits([]); }
        finally { setIsLoading(false); }
    };

    const filteredAudits = audits.filter(a => filter === "all" || a.status === filter);

    if (isLoading) {
        return (
            <StaffLayout title="🔍 การตรวจประเมิน" subtitle="กำลังโหลด...">
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout title="🔍 การตรวจประเมินทั้งหมด" subtitle="Field Audits Management">
            {/* Header Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                <div className="flex gap-2 flex-wrap">
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
                                    ? "bg-primary-600 text-white"
                                    : `${isDark ? 'bg-slate-800' : 'bg-white border border-surface-200'} text-slate-600 hover:bg-slate-100`
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <Link href="/staff/calendar" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
                    📅 ปฏิทินนัดหมาย
                </Link>
            </div>

            {/* Table */}
            <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-surface-100'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">หมายเลข</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">นัดหมาย</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-surface-200'}`}>
                            {filteredAudits.map(audit => {
                                const status = STATUS_LABELS[audit.status] || { label: audit.status, color: "bg-slate-100" };
                                return (
                                    <tr key={audit.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-surface-50'} transition-colors`}>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{audit.id}</td>
                                        <td className="px-6 py-4 font-medium">{audit.applicantName}</td>
                                        <td className="px-6 py-4 text-slate-500">{audit.plantType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {audit.scheduledDate || "-"}
                                            {audit.inspector && <span className="block text-xs">{audit.inspector}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/staff/audits/${audit.id}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                                                ดูรายละเอียด →
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredAudits.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <p className="text-5xl mb-4">🔍</p>
                        <p>ไม่พบรายการตรวจประเมิน</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
