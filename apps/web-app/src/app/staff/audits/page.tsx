"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";
import StaffLayout from "../components/StaffLayout";
import { IconCalendar, IconSearch } from "@/components/ui/icons";
import { createGoogleCalendarUrl } from "@/lib/calendar";

interface Audit {
    id: string;
    applicationId: string;
    applicantName: string;
    plantType: string;
    status: string;
    scheduledDate?: string;
    inspector?: string;
    auditMode?: "ONLINE" | "ONSITE";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    WAITING_SCHEDULE: { label: "รอจัดคิว", color: "bg-amber-100 text-amber-700" },
    SCHEDULED: { label: "นัดหมายแล้ว", color: "bg-blue-100 text-blue-700" },
    IN_PROGRESS: { label: "กำลังตรวจ", color: "bg-violet-100 text-violet-700" },
    WAITING_RESULT: { label: "รอบันทึกผล", color: "bg-slate-100 text-slate-700" },
    PASSED: { label: "ผ่าน", color: "bg-emerald-100 text-emerald-700" },
    FAILED: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700" },
};

export default function StaffAuditsPage() {
    const router = useRouter();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");
    const [isDark, setIsDark] = useState(false);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
    const [scheduleForm, setScheduleForm] = useState({ date: "", time: "09:00", mode: "ONSITE", auditorId: "" });

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("staff_token")) { router.push("/staff/login"); return; }
        fetchAudits();
    }, [router]);

    const fetchAudits = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { audits: Audit[] } }>('/api/audits');
            if (result.success && result.data?.data?.audits) setAudits(result.data.data.audits);
            else setAudits([]);
        } catch { setAudits([]); }
        finally { setIsLoading(false); }
    };

    const handleOpenSchedule = (audit: Audit) => {
        setSelectedAudit(audit);
        setScheduleForm({ date: "", time: "09:00", mode: "ONSITE", auditorId: "Staff-001" });
        setShowScheduleModal(true);
    };

    const submitSchedule = async () => {
        if (!selectedAudit) return;
        try {
            await api.post('/api/audits/schedule', {
                applicationId: selectedAudit.id,
                scheduledDate: scheduleForm.date,
                scheduledTime: scheduleForm.time,
                auditMode: scheduleForm.mode,
                auditorId: scheduleForm.auditorId
            });
            alert("นัดหมายสำเร็จ");
            setShowScheduleModal(false);
            fetchAudits();
        } catch (e) {
            alert("เกิดข้อผิดพลาด: " + e);
        }
    };

    const filteredAudits = audits.filter(a => filter === "all" || a.status === filter);

    if (isLoading) {
        return (
            <StaffLayout title="การตรวจประเมิน" subtitle="กำลังโหลด...">
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout title="การตรวจประเมินทั้งหมด" subtitle="Field Audits Management">
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
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
                                ? "bg-emerald-600 text-white"
                                : `${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'} text-slate-600 hover:bg-slate-100`
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <Link href="/staff/calendar" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700">
                    <IconCalendar size={16} /> ปฏิทินนัดหมาย
                </Link>
            </div>

            {/* Table */}
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">หมายเลข</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">นัดหมาย</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                            {filteredAudits.map(audit => {
                                const status = STATUS_LABELS[audit.status] || { label: audit.status, color: "bg-slate-100" };
                                return (
                                    <tr key={audit.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{audit.id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium">{audit.applicantName}</td>
                                        <td className="px-6 py-4 text-slate-500">{audit.plantType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.label}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {audit.scheduledDate && new Date(audit.scheduledDate).toLocaleDateString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) || "-"}
                                            {audit.inspector && <span className="block text-xs text-slate-500 mt-1">ผู้ตรวจ: {audit.inspector}</span>}
                                            {audit.status === "SCHEDULED" && audit.scheduledDate && (
                                                <div className="mt-2">
                                                    <a
                                                        href={createGoogleCalendarUrl(
                                                            `Audit: ${audit.id.substring(0, 8)}... - ${audit.applicantName}`,
                                                            `Plant: ${audit.plantType}\nMode: ${audit.auditMode || 'ONSITE'}`,
                                                            audit.auditMode === 'ONLINE' ? 'Online (Google Meet)' : 'On-site',
                                                            new Date(audit.scheduledDate)
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                        title="Add to Google Calendar"
                                                    >
                                                        <IconCalendar size={12} />
                                                        + Calendar
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {audit.status === "WAITING_SCHEDULE" ? (
                                                <button onClick={() => handleOpenSchedule(audit)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                                    นัดหมาย
                                                </button>
                                            ) : (
                                                <Link href={`/staff/audits/${audit.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                                                    ดูรายละเอียด
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredAudits.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <IconSearch size={32} className="mx-auto mb-3" />
                        <p>ไม่พบรายการตรวจประเมิน</p>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">นัดหมายตรวจประเมิน</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">วันที่</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-lg" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">เวลา</label>
                                <input type="time" className="w-full px-3 py-2 border rounded-lg" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">รูปแบบ</label>
                                <select className="w-full px-3 py-2 border rounded-lg" value={scheduleForm.mode} onChange={e => setScheduleForm({ ...scheduleForm, mode: e.target.value })}>
                                    <option value="ONSITE">ลงพื้นที่ (On-site)</option>
                                    <option value="ONLINE">ออนไลน์ (Video Call)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 border rounded-xl">ยกเลิก</button>
                                <button onClick={submitSchedule} className="flex-1 py-3 bg-blue-600 text-white rounded-xl">ยืนยัน</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </StaffLayout>
    );
}
