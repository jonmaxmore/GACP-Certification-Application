"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface AuditDetail {
    id: string;
    applicantName: string;
    plantType: string;
    auditType: "ONLINE" | "ONSITE";
    status: string;
    scheduledDate: string;
    scheduledTime: string;
    vdoCallLink?: string;
    location?: string;
    documents: { name: string; url: string }[];
    checklist: { id: string; item: string; passed: boolean | null; note: string }[];
}

export default function AuditDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [audit, setAudit] = useState<AuditDetail | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [result, setResult] = useState<"PASS" | "MINOR" | "MAJOR">("PASS");
    const [resultNote, setResultNote] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }

        // Mock data
        setAudit({
            id: params.id as string,
            applicantName: "นายวิชัย สมบูรณ์",
            plantType: "ขิง",
            auditType: "ONLINE",
            status: "SCHEDULED",
            scheduledDate: "2024-12-10",
            scheduledTime: "14:00",
            vdoCallLink: "https://meet.google.com/abc-defg-hij",
            documents: [
                { name: "แบบฟอร์ม 09", url: "#" },
                { name: "โฉนดที่ดิน", url: "#" },
                { name: "SOP การปลูก", url: "#" },
                { name: "รูปภาพแปลง", url: "#" },
            ],
            checklist: [
                { id: "1", item: "พื้นที่ปลูกตรงตาม GPS ที่แจ้ง", passed: null, note: "" },
                { id: "2", item: "มีป้ายบอกพื้นที่เพาะปลูก", passed: null, note: "" },
                { id: "3", item: "ระบบน้ำเป็นไปตาม SOP", passed: null, note: "" },
                { id: "4", item: "การจัดเก็บปุ๋ย/ยาถูกต้อง", passed: null, note: "" },
                { id: "5", item: "บันทึกการผลิตครบถ้วน", passed: null, note: "" },
                { id: "6", item: "มีการควบคุมศัตรูพืชเหมาะสม", passed: null, note: "" },
                { id: "7", item: "การเก็บเกี่ยวถูกสุขลักษณะ", passed: null, note: "" },
                { id: "8", item: "มีระบบตรวจสอบย้อนกลับ", passed: null, note: "" },
            ],
        });
    }, [params.id, router]);

    const updateChecklist = (id: string, passed: boolean | null, note?: string) => {
        if (!audit) return;
        setAudit({
            ...audit,
            checklist: audit.checklist.map(c =>
                c.id === id ? { ...c, passed, note: note ?? c.note } : c
            ),
        });
    };

    const handleSubmitResult = () => {
        // TODO: Submit to API
        alert(`บันทึกผล: ${result}\n${resultNote}`);
        router.push("/staff/dashboard");
    };

    if (!audit) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⏳</div></div>;
    }

    const completedChecks = audit.checklist.filter(c => c.passed !== null).length;
    const passedChecks = audit.checklist.filter(c => c.passed === true).length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">← กลับ</Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div>
                            <p className="font-mono text-sm text-slate-400">{audit.id}</p>
                            <h1 className="font-bold">{audit.applicantName}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {audit.auditType === "ONLINE" && audit.vdoCallLink && (
                            <a
                                href={audit.vdoCallLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                                <span className="text-xl">📹</span>
                                <span>เข้าห้อง VDO Call</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Info & Documents */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Appointment Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-semibold mb-4">📋 ข้อมูลนัดหมาย</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">พืช:</span>
                                    <span className="font-medium">{audit.plantType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">วันที่:</span>
                                    <span className="font-medium">{new Date(audit.scheduledDate).toLocaleDateString("th-TH")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">เวลา:</span>
                                    <span className="font-medium">{audit.scheduledTime} น.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">รูปแบบ:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${audit.auditType === "ONLINE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {audit.auditType === "ONLINE" ? "📹 VDO Call" : "📍 ลงพื้นที่"}
                                    </span>
                                </div>
                            </div>

                            {audit.auditType === "ONLINE" && audit.vdoCallLink && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600 mb-1">ลิงก์ห้องประชุม:</p>
                                    <a href={audit.vdoCallLink} target="_blank" className="text-blue-700 underline text-sm break-all">
                                        {audit.vdoCallLink}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-semibold mb-4">📄 เอกสารประกอบ</h3>
                            <div className="space-y-2">
                                {audit.documents.map((doc, i) => (
                                    <a key={i} href={doc.url} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                        <span>📎</span>
                                        <span className="text-sm">{doc.name}</span>
                                        <span className="ml-auto text-slate-400">👁️</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Checklist */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="font-semibold">✅ Checklist การตรวจประเมิน</h3>
                                <span className="text-sm text-slate-500">
                                    {completedChecks}/{audit.checklist.length} รายการ | ผ่าน {passedChecks} รายการ
                                </span>
                            </div>

                            <div className="divide-y">
                                {audit.checklist.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50">
                                        <div className="flex items-start gap-4">
                                            <span className="text-lg font-mono text-slate-400">{item.id}.</span>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.item}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateChecklist(item.id, true)}
                                                        className={`px-4 py-1 rounded-lg text-sm transition-all ${item.passed === true
                                                                ? "bg-green-600 text-white"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                            }`}
                                                    >
                                                        ✅ ผ่าน
                                                    </button>
                                                    <button
                                                        onClick={() => updateChecklist(item.id, false)}
                                                        className={`px-4 py-1 rounded-lg text-sm transition-all ${item.passed === false
                                                                ? "bg-red-600 text-white"
                                                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            }`}
                                                    >
                                                        ❌ ไม่ผ่าน
                                                    </button>
                                                </div>
                                                {item.passed === false && (
                                                    <input
                                                        type="text"
                                                        value={item.note}
                                                        onChange={(e) => updateChecklist(item.id, false, e.target.value)}
                                                        placeholder="ระบุเหตุผล..."
                                                        className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => { setResult("PASS"); setShowResultModal(true); }}
                                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                            >
                                ✅ ผ่าน - ออกใบรับรอง
                            </button>
                            <button
                                onClick={() => { setResult("MINOR"); setShowResultModal(true); }}
                                className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
                            >
                                ⚠️ แก้ไขเล็กน้อย (Minor)
                            </button>
                            <button
                                onClick={() => { setResult("MAJOR"); setShowResultModal(true); }}
                                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                            >
                                ❌ ไม่ผ่าน/นัดใหม่ (Major)
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Result Modal */}
            {showResultModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {result === "PASS" && "✅ ยืนยันอนุมัติ"}
                                {result === "MINOR" && "⚠️ ขอข้อมูลเพิ่มเติม"}
                                {result === "MAJOR" && "❌ ไม่ผ่าน - ออก CARs"}
                            </h3>
                            <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={resultNote}
                                onChange={(e) => setResultNote(e.target.value)}
                                placeholder={result === "PASS" ? "หมายเหตุ (ถ้ามี)..." : "ระบุรายละเอียดที่ต้องแก้ไข..."}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResultModal(false)}
                                    className="flex-1 py-3 border border-slate-300 rounded-xl"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSubmitResult}
                                    className={`flex-1 py-3 text-white rounded-xl ${result === "PASS" ? "bg-green-600 hover:bg-green-700" :
                                            result === "MINOR" ? "bg-amber-500 hover:bg-amber-600" :
                                                "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
