"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuditItem {
    id: string;
    applicantName: string;
    plantType: string;
    auditType: "ONLINE" | "ONSITE";
    status: string;
    scheduledDate?: string;
    scheduledTime?: string;
    vdoCallLink?: string;
    location?: string;
    assignedTo?: string;
}

interface StaffUser {
    id: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

export default function StaffCalendarPage() {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [audits, setAudits] = useState<AuditItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);

    // Schedule form
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [auditType, setAuditType] = useState<"ONLINE" | "ONSITE">("ONLINE");
    const [vdoLink, setVdoLink] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        const userData = localStorage.getItem("staff_user");

        if (!token || !userData) {
            router.push("/staff/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch {
            router.push("/staff/login");
        }

        // Mock audit data
        setAudits([
            { id: "REQ-2567-0010", applicantName: "นายวิชัย สมบูรณ์", plantType: "ขิง", auditType: "ONLINE", status: "WAITING_SCHEDULE", assignedTo: "สมชาย" },
            { id: "REQ-2567-0008", applicantName: "กลุ่มเกษตรอินทรีย์", plantType: "กระชายดำ", auditType: "ONLINE", status: "SCHEDULED", scheduledDate: "2024-12-12", scheduledTime: "10:00", vdoCallLink: "https://meet.google.com/abc-defg-hij", assignedTo: "สมชาย" },
            { id: "REQ-2567-0005", applicantName: "นางมะลิ ใจงาม", plantType: "ไพล", auditType: "ONSITE", status: "SCHEDULED", scheduledDate: "2024-12-15", scheduledTime: "09:00", location: "จ.เชียงใหม่", assignedTo: "สมหญิง" },
            { id: "REQ-2567-0003", applicantName: "บริษัท สมุนไพรดี จำกัด", plantType: "กัญชา", auditType: "ONLINE", status: "SCHEDULED", scheduledDate: "2024-12-10", scheduledTime: "14:00", vdoCallLink: "https://zoom.us/j/123456789", assignedTo: "สมชาย" },
        ]);
    }, [router]);

    const handleSchedule = (audit: AuditItem) => {
        setSelectedAudit(audit);
        setScheduleDate("");
        setScheduleTime("");
        setAuditType("ONLINE");
        setVdoLink("");
        setLocation("");
        setShowScheduleModal(true);
    };

    const generateMeetLink = () => {
        // Generate random Google Meet-like link
        const chars = "abcdefghijklmnopqrstuvwxyz";
        const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        setVdoLink(`https://meet.google.com/${part1}-${part2}-${part3}`);
    };

    const handleSubmitSchedule = () => {
        if (!selectedAudit || !scheduleDate || !scheduleTime) return;
        if (auditType === "ONLINE" && !vdoLink) return;
        if (auditType === "ONSITE" && !location) return;

        // Update audit
        setAudits(audits.map(a =>
            a.id === selectedAudit.id
                ? { ...a, status: "SCHEDULED", scheduledDate: scheduleDate, scheduledTime: scheduleTime, auditType, vdoCallLink: vdoLink, location }
                : a
        ));

        setShowScheduleModal(false);
        setSelectedAudit(null);
    };

    const todayAudits = audits.filter(a => a.scheduledDate === selectedDate && a.status === "SCHEDULED");
    const pendingSchedule = audits.filter(a => a.status === "WAITING_SCHEDULE");

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="animate-spin text-4xl">⏳</div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">← กลับ</Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <h1 className="font-bold">ปฏิทินนัดตรวจประเมิน</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Pending Schedule */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b bg-amber-50">
                                <h3 className="font-semibold text-amber-800">⏳ รอจัดคิว ({pendingSchedule.length})</h3>
                            </div>
                            <div className="divide-y">
                                {pendingSchedule.map(audit => (
                                    <div key={audit.id} className="p-4 hover:bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-sm text-slate-500">{audit.id}</p>
                                                <p className="font-medium">{audit.applicantName}</p>
                                                <p className="text-sm text-slate-500">{audit.plantType}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSchedule(audit)}
                                            className="w-full mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                        >
                                            📅 จัดนัดหมาย
                                        </button>
                                    </div>
                                ))}
                                {pendingSchedule.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">
                                        <p className="text-4xl mb-2">✅</p>
                                        <p>ไม่มีรายการรอจัดคิว</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Calendar & Today */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Picker */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <label className="font-medium">เลือกวันที่:</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                />
                                <button
                                    onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                                    className="px-4 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                                >
                                    วันนี้
                                </button>
                            </div>
                        </div>

                        {/* Today's Audits */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="font-semibold">
                                    📋 นัดหมายวันที่ {new Date(selectedDate).toLocaleDateString("th-TH", { dateStyle: "long" })}
                                </h3>
                                <span className="text-sm text-slate-500">{todayAudits.length} รายการ</span>
                            </div>

                            {todayAudits.length > 0 ? (
                                <div className="divide-y">
                                    {todayAudits.map(audit => (
                                        <div key={audit.id} className="p-6 hover:bg-slate-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-emerald-600">{audit.scheduledTime}</p>
                                                        <p className="text-xs text-slate-500">น.</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm text-slate-500">{audit.id}</p>
                                                        <p className="font-medium text-lg">{audit.applicantName}</p>
                                                        <p className="text-sm text-slate-500">{audit.plantType}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            {audit.auditType === "ONLINE" ? (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">📹 Online</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">📍 On-site</span>
                                                            )}
                                                            <span className="text-xs text-slate-500">ผู้ตรวจ: {audit.assignedTo}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {audit.auditType === "ONLINE" && audit.vdoCallLink && (
                                                        <a
                                                            href={audit.vdoCallLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                                                        >
                                                            <span className="text-xl">📹</span>
                                                            <span className="font-semibold">เข้าห้อง VDO Call</span>
                                                        </a>
                                                    )}
                                                    {audit.auditType === "ONSITE" && audit.location && (
                                                        <div className="text-right">
                                                            <p className="text-sm text-slate-500">สถานที่:</p>
                                                            <p className="font-medium">{audit.location}</p>
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(audit.location)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                                            >
                                                                📍 เปิด Google Maps
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <p className="text-5xl mb-4">📅</p>
                                    <p className="text-lg">ไม่มีนัดตรวจในวันนี้</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Schedule Modal */}
            {showScheduleModal && selectedAudit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">จัดนัดตรวจประเมิน</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Applicant Info */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-mono text-sm text-slate-500">{selectedAudit.id}</p>
                                <p className="font-semibold text-lg">{selectedAudit.applicantName}</p>
                                <p className="text-slate-500">{selectedAudit.plantType}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">วันที่</label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">เวลา</label>
                                    <input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Audit Type */}
                            <div>
                                <label className="block text-sm text-slate-600 mb-2">รูปแบบการตรวจ</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAuditType("ONLINE")}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${auditType === "ONLINE" ? "border-blue-500 bg-blue-50" : "border-slate-200"
                                            }`}
                                    >
                                        <span className="text-2xl">📹</span>
                                        <p className="font-semibold mt-1">VDO Call</p>
                                        <p className="text-xs text-slate-500">ตรวจออนไลน์</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuditType("ONSITE")}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${auditType === "ONSITE" ? "border-purple-500 bg-purple-50" : "border-slate-200"
                                            }`}
                                    >
                                        <span className="text-2xl">📍</span>
                                        <p className="font-semibold mt-1">ลงพื้นที่</p>
                                        <p className="text-xs text-slate-500">ตรวจหน้างาน</p>
                                    </button>
                                </div>
                            </div>

                            {/* VDO Link or Location */}
                            {auditType === "ONLINE" ? (
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">ลิงก์ VDO Call</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={vdoLink}
                                            onChange={(e) => setVdoLink(e.target.value)}
                                            placeholder="https://meet.google.com/..."
                                            className="flex-1 px-3 py-2 border rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateMeetLink}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                                        >
                                            🔗 สร้างลิงก์
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">รองรับ Google Meet, Zoom, Teams</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-slate-600 mb-1">สถานที่ตรวจ</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="เช่น จ.เชียงใหม่ อ.เมือง"
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleModal(false)}
                                    className="flex-1 py-3 border border-slate-300 rounded-xl hover:bg-slate-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitSchedule}
                                    disabled={!scheduleDate || !scheduleTime || (auditType === "ONLINE" && !vdoLink) || (auditType === "ONSITE" && !location)}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    ✅ ยืนยันนัดหมาย
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
