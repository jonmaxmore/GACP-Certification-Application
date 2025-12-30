"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

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
    onlineSession?: {
        meetingUrl?: string;
    };
    farmLocation?: {
        address?: string;
        province?: string;
    };
    auditorName?: string;
}

interface ApplicationItem {
    _id: string;
    applicationNumber: string;
    farmerName?: string;
    firstName?: string;
    lastName?: string;
    plantType?: string;
    status: string;
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
    const [pendingApplications, setPendingApplications] = useState<ApplicationItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Schedule form
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [auditMode, setAuditMode] = useState<"ONLINE" | "ONSITE">("ONLINE");
    const [vdoLink, setVdoLink] = useState("");
    const [location, setLocation] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch scheduled audits
            const auditsResult = await api.get<{ data: { audits: AuditItem[] } }>(`/v2/field-audits/my-schedule?date=${selectedDate}`);
            if (auditsResult.success && auditsResult.data?.data?.audits) {
                setAudits(auditsResult.data.data.audits);
            }

            // Fetch pending applications (would need applications API)
            // For now, use mock data
            setPendingApplications([
                { _id: "1", applicationNumber: "REQ-2567-0010", firstName: "นายวิชัย", lastName: "สมบูรณ์", plantType: "ขิง", status: "WAITING_SCHEDULE" },
                { _id: "2", applicationNumber: "REQ-2567-0012", firstName: "นางมะลิ", lastName: "ใจงาม", plantType: "ไพล", status: "WAITING_SCHEDULE" },
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

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

        fetchData();
    }, [router, fetchData]);

    const handleSchedule = (application: ApplicationItem) => {
        setSelectedApplication(application);
        setScheduleDate("");
        setScheduleTime("");
        setAuditMode("ONLINE");
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

    const handleSubmitSchedule = async () => {
        if (!selectedApplication || !scheduleDate || !scheduleTime) return;
        if (auditMode === "ONLINE" && !vdoLink) return;
        if (auditMode === "ONSITE" && !location) return;

        try {
            // Call API to create audit
            await api.post("/v2/field-audits", {
                applicationId: selectedApplication._id,
                auditMode,
                scheduledDate: scheduleDate,
                scheduledTime: scheduleTime,
                auditorId: user?.id,
            });

            // Refresh data
            await fetchData();
            setShowScheduleModal(false);
            setSelectedApplication(null);
        } catch (error) {
            console.error("Error creating audit:", error);
            alert("เกิดข้อผิดพลาดในการสร้างนัดหมาย");
        }
    };

    const todayAudits = audits.filter(a => a.scheduledDate?.split("T")[0] === selectedDate && a.status === "SCHEDULED");

    if (isLoading || !user) {
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
                                <h3 className="font-semibold text-amber-800">⏳ รอจัดคิว ({pendingApplications.length})</h3>
                            </div>
                            <div className="divide-y">
                                {pendingApplications.map(app => (
                                    <div key={app._id} className="p-4 hover:bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-sm text-slate-500">{app.applicationNumber}</p>
                                                <p className="font-medium">{app.firstName} {app.lastName}</p>
                                                <p className="text-sm text-slate-500">{app.plantType}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSchedule(app)}
                                            className="w-full mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                        >
                                            📅 จัดนัดหมาย
                                        </button>
                                    </div>
                                ))}
                                {pendingApplications.length === 0 && (
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
                                        <div key={audit._id} className="p-6 hover:bg-slate-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-emerald-600">{audit.scheduledTime}</p>
                                                        <p className="text-xs text-slate-500">น.</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm text-slate-500">{audit.auditNumber}</p>
                                                        <p className="font-medium text-lg">{audit.farmerName}</p>
                                                        <p className="text-sm text-slate-500">{audit.plantType}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            {audit.auditMode === "ONLINE" ? (
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">📹 Online</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">📍 On-site</span>
                                                            )}
                                                            {audit.auditorName && <span className="text-xs text-slate-500">ผู้ตรวจ: {audit.auditorName}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {audit.auditMode === "ONLINE" && audit.onlineSession?.meetingUrl && (
                                                        <a
                                                            href={audit.onlineSession.meetingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                                                        >
                                                            <span className="text-xl">📹</span>
                                                            <span className="font-semibold">เข้าห้อง VDO Call</span>
                                                        </a>
                                                    )}
                                                    {audit.auditMode === "ONSITE" && audit.farmLocation && (
                                                        <div className="text-right">
                                                            <p className="text-sm text-slate-500">สถานที่:</p>
                                                            <p className="font-medium">{audit.farmLocation.address || audit.farmLocation.province}</p>
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(audit.farmLocation.address || audit.farmLocation.province || "")}`}
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
            {showScheduleModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">จัดนัดตรวจประเมิน</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Applicant Info */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="font-mono text-sm text-slate-500">{selectedApplication.applicationNumber}</p>
                                <p className="font-semibold text-lg">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                                <p className="text-slate-500">{selectedApplication.plantType}</p>
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

                            {/* Audit Mode */}
                            <div>
                                <label className="block text-sm text-slate-600 mb-2">รูปแบบการตรวจ</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAuditMode("ONLINE")}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${auditMode === "ONLINE" ? "border-blue-500 bg-blue-50" : "border-slate-200"
                                            }`}
                                    >
                                        <span className="text-2xl">📹</span>
                                        <p className="font-semibold mt-1">VDO Call</p>
                                        <p className="text-xs text-slate-500">ตรวจออนไลน์</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuditMode("ONSITE")}
                                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${auditMode === "ONSITE" ? "border-purple-500 bg-purple-50" : "border-slate-200"
                                            }`}
                                    >
                                        <span className="text-2xl">📍</span>
                                        <p className="font-semibold mt-1">ลงพื้นที่</p>
                                        <p className="text-xs text-slate-500">ตรวจหน้างาน</p>
                                    </button>
                                </div>
                            </div>

                            {/* VDO Link or Location */}
                            {auditMode === "ONLINE" ? (
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
                                    disabled={!scheduleDate || !scheduleTime || (auditMode === "ONLINE" && !vdoLink) || (auditMode === "ONSITE" && !location)}
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

