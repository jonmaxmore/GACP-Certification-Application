"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api-client";
import StaffLayout from "../components/StaffLayout";

interface AuditItem {
    _id: string;
    auditNumber: string;
    applicationNumber: string;
    farmerName: string;
    plantType?: string;
    auditMode: "ONLINE" | "ONSITE" | "HYBRID";
    status: string;
    scheduledDate?: string;
    scheduledTime?: string;
    onlineSession?: { meetingUrl?: string };
    farmLocation?: { address?: string; province?: string };
    auditorName?: string;
}

interface ApplicationItem {
    _id: string;
    applicationNumber: string;
    firstName?: string;
    lastName?: string;
    plantType?: string;
    status: string;
}

export default function StaffCalendarPage() {
    const router = useRouter();
    const [audits, setAudits] = useState<AuditItem[]>([]);
    const [pendingApplications, setPendingApplications] = useState<ApplicationItem[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [auditMode, setAuditMode] = useState<"ONLINE" | "ONSITE">("ONLINE");
    const [vdoLink, setVdoLink] = useState("");
    const [location, setLocation] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [auditsRes, appsRes] = await Promise.all([
                api.get<{ data: AuditItem[] }>(`/v2/audits/scheduled?startDate=${selectedDate}&endDate=${selectedDate}`),
                api.get<{ data: ApplicationItem[] }>('/v2/audits/pending-schedule')
            ]);
            if (auditsRes.success && auditsRes.data?.data) setAudits(auditsRes.data.data);
            else setAudits([]);
            if (appsRes.success && appsRes.data?.data) setPendingApplications(appsRes.data.data);
            else setPendingApplications([]);
        } catch { setAudits([]); setPendingApplications([]); }
        finally { setIsLoading(false); }
    }, [selectedDate]);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("staff_token")) { router.push("/staff/login"); return; }
        fetchData();
    }, [router, fetchData]);

    const handleSchedule = (app: ApplicationItem) => {
        setSelectedApp(app);
        setScheduleDate("");
        setScheduleTime("");
        setAuditMode("ONLINE");
        setVdoLink("");
        setLocation("");
        setShowScheduleModal(true);
    };

    const generateMeetLink = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const p1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join("");
        const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 26)]).join("");
        const p3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join("");
        setVdoLink(`https://meet.google.com/${p1}-${p2}-${p3}`);
    };

    const handleSubmit = async () => {
        if (!selectedApp || !scheduleDate || !scheduleTime) return;
        if (auditMode === "ONLINE" && !vdoLink) return;
        if (auditMode === "ONSITE" && !location) return;
        try {
            const result = await api.post("/v2/audits/schedule", {
                applicationId: selectedApp._id, scheduledDate: scheduleDate, scheduledTime: scheduleTime,
                auditMode, meetingUrl: auditMode === "ONLINE" ? vdoLink : undefined,
                location: auditMode === "ONSITE" ? location : undefined
            });
            if (result.success) { alert("จัดนัดหมายสำเร็จ!"); fetchData(); setShowScheduleModal(false); }
            else alert(`เกิดข้อผิดพลาด: ${result.error}`);
        } catch { alert("เกิดข้อผิดพลาดในการสร้างนัดหมาย"); }
    };

    const todayAudits = audits.filter(a => a.scheduledDate?.split("T")[0] === selectedDate && a.status === "SCHEDULED");

    if (isLoading) {
        return <StaffLayout title="📅 ปฏิทิน"><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div></StaffLayout>;
    }

    return (
        <StaffLayout title="📅 ปฏิทินนัดตรวจประเมิน" subtitle="Calendar & Scheduling">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Pending */}
                <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className={`px-6 py-4 border-b ${isDark ? 'bg-secondary-500/20 border-secondary-500/30' : 'bg-secondary-50 border-secondary-200'}`}>
                        <h3 className="font-semibold text-secondary-700">⏳ รอจัดคิว ({pendingApplications.length})</h3>
                    </div>
                    <div className="divide-y divide-surface-200">
                        {pendingApplications.map(app => (
                            <div key={app._id} className={`p-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-surface-50'}`}>
                                <p className="font-mono text-sm text-slate-500">{app.applicationNumber}</p>
                                <p className="font-medium">{app.firstName} {app.lastName}</p>
                                <p className="text-sm text-slate-500">{app.plantType}</p>
                                <button onClick={() => handleSchedule(app)} className="w-full mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">📅 จัดนัดหมาย</button>
                            </div>
                        ))}
                        {pendingApplications.length === 0 && <div className="p-8 text-center text-slate-400"><p className="text-4xl mb-2">✅</p><p>ไม่มีรายการรอจัดคิว</p></div>}
                    </div>
                </div>

                {/* Right: Calendar */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`rounded-2xl shadow-card p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className="flex items-center gap-4">
                            <label className="font-medium">เลือกวันที่:</label>
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'}`} />
                            <button onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-surface-100 text-slate-600'}`}>วันนี้</button>
                        </div>
                    </div>

                    <div className={`rounded-2xl shadow-card overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className={`px-6 py-4 border-b flex justify-between ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                            <h3 className="font-semibold">📋 นัดหมายวันที่ {new Date(selectedDate).toLocaleDateString("th-TH", { dateStyle: "long" })}</h3>
                            <span className="text-sm text-slate-500">{todayAudits.length} รายการ</span>
                        </div>
                        {todayAudits.length > 0 ? (
                            <div className="divide-y divide-surface-200">
                                {todayAudits.map(audit => (
                                    <div key={audit._id} className={`p-6 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-surface-50'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary-600">{audit.scheduledTime}</p>
                                                    <p className="text-xs text-slate-500">น.</p>
                                                </div>
                                                <div>
                                                    <p className="font-mono text-sm text-slate-500">{audit.auditNumber}</p>
                                                    <p className="font-medium text-lg">{audit.farmerName}</p>
                                                    <p className="text-sm text-slate-500">{audit.plantType}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${audit.auditMode === "ONLINE" ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                                                            {audit.auditMode === "ONLINE" ? '📹 Online' : '📍 On-site'}
                                                        </span>
                                                        {audit.auditorName && <span className="text-xs text-slate-500">ผู้ตรวจ: {audit.auditorName}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {audit.auditMode === "ONLINE" && audit.onlineSession?.meetingUrl && (
                                                <a href={audit.onlineSession.meetingUrl} target="_blank" rel="noopener" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2">
                                                    📹 เข้าห้อง VDO Call
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400"><p className="text-5xl mb-4">📅</p><p className="text-lg">ไม่มีนัดตรวจในวันนี้</p></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showScheduleModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-2xl shadow-2xl w-full max-w-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                        <div className={`px-6 py-4 border-b flex justify-between ${isDark ? 'border-slate-700' : 'border-surface-200'}`}>
                            <h3 className="text-lg font-semibold">จัดนัดตรวจประเมิน</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-surface-100'}`}>
                                <p className="font-mono text-sm text-slate-500">{selectedApp.applicationNumber}</p>
                                <p className="font-semibold text-lg">{selectedApp.firstName} {selectedApp.lastName}</p>
                                <p className="text-slate-500">{selectedApp.plantType}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm text-slate-500 mb-1">วันที่</label><input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'}`} /></div>
                                <div><label className="block text-sm text-slate-500 mb-1">เวลา</label><input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'}`} /></div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-2">รูปแบบการตรวจ</label>
                                <div className="flex gap-4">
                                    {[{ key: "ONLINE", icon: "📹", label: "VDO Call", sub: "ตรวจออนไลน์" }, { key: "ONSITE", icon: "📍", label: "ลงพื้นที่", sub: "ตรวจหน้างาน" }].map(opt => (
                                        <button key={opt.key} type="button" onClick={() => setAuditMode(opt.key as "ONLINE" | "ONSITE")} className={`flex-1 p-4 rounded-xl border-2 transition-all ${auditMode === opt.key ? `border-primary-500 ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}` : `${isDark ? 'border-slate-600' : 'border-surface-200'}`}`}>
                                            <span className="text-2xl">{opt.icon}</span><p className="font-semibold mt-1">{opt.label}</p><p className="text-xs text-slate-500">{opt.sub}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {auditMode === "ONLINE" ? (
                                <div><label className="block text-sm text-slate-500 mb-1">ลิงก์ VDO Call</label><div className="flex gap-2"><input type="url" value={vdoLink} onChange={e => setVdoLink(e.target.value)} placeholder="https://meet.google.com/..." className={`flex-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'}`} /><button type="button" onClick={generateMeetLink} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">🔗 สร้าง</button></div></div>
                            ) : (
                                <div><label className="block text-sm text-slate-500 mb-1">สถานที่ตรวจ</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="เช่น จ.เชียงใหม่ อ.เมือง" className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'border-surface-200'}`} /></div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowScheduleModal(false)} className={`flex-1 py-3 rounded-xl border ${isDark ? 'border-slate-600 hover:bg-slate-700' : 'border-surface-200 hover:bg-surface-50'}`}>ยกเลิก</button>
                                <button onClick={handleSubmit} disabled={!scheduleDate || !scheduleTime || (auditMode === "ONLINE" && !vdoLink) || (auditMode === "ONSITE" && !location)} className="flex-1 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50">✅ ยืนยันนัดหมาย</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}
