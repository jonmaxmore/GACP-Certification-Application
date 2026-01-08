"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";
import { IconDocument, IconCheckCircle } from "@/components/ui/icons";

// Additional icons for this page
const IconVideo = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const IconMapPin = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const IconX = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconWarning = ({ size = 24, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

interface ChecklistItem {
    itemCode: string;
    category: string;
    title?: string;
    titleTh?: string;
    response: "PASS" | "FAIL" | "NA" | "PENDING";
    notes?: string;
    photos?: { url: string; caption?: string }[];
}

interface AuditDetail {
    _id: string;
    auditNumber: string;
    applicationNumber: string;
    farmerName: string;
    farmName?: string;
    plantType?: string;
    auditMode: "ONLINE" | "ONSITE" | "HYBRID";
    status: string;
    scheduledDate: string;
    scheduledTime?: string;
    onlineSession?: {
        platform: string;
        meetingUrl?: string;
        meetingId?: string;
    };
    farmLocation?: {
        address: string;
        province: string;
    };
    responses: ChecklistItem[];
    overallScore?: number;
    result?: string;
}

interface TemplateItem {
    itemCode: string;
    title: string;
    titleTh: string;
    category: string;
    checkType: string;
    isCritical?: boolean;
}

interface AuditTemplate {
    templateCode: string;
    nameTh: string;
    categories: {
        categoryCode: string;
        nameTh: string;
        items: TemplateItem[];
    }[];
}

export default function AuditDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [audit, setAudit] = useState<AuditDetail | null>(null);
    const [template, setTemplate] = useState<AuditTemplate | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [result, setResult] = useState<"PASS" | "MINOR" | "MAJOR">("PASS");
    const [resultNote, setResultNote] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("");

    const fetchAudit = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch audit details
            const auditResult = await api.get<{ data: AuditDetail }>(`/field-audits/${params.id}`);
            if (auditResult.success && auditResult.data?.data) {
                setAudit(auditResult.data.data);

                // Fetch template if needed
                const templateCode = (auditResult.data.data as unknown as { templateCode?: string }).templateCode;
                if (templateCode) {
                    const templateResult = await api.get<{ data: AuditTemplate }>(`/field-audits/templates/${templateCode}`);
                    if (templateResult.success && templateResult.data?.data) {
                        setTemplate(templateResult.data.data);
                        setActiveCategory(templateResult.data.data.categories[0]?.categoryCode || "");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching audit:", error);
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }
        fetchAudit();
    }, [router, fetchAudit]);

    const updateResponse = (itemCode: string, response: "PASS" | "FAIL" | "NA", notes?: string) => {
        if (!audit) return;
        setAudit({
            ...audit,
            responses: audit.responses.map((r: ChecklistItem) =>
                r.itemCode === itemCode ? { ...r, response, notes: notes ?? r.notes } : r
            ),
        });
    };

    const handleSubmitResult = async () => {
        if (!audit) return;
        setIsSaving(true);
        try {
            await api.post(`/field-audits/${audit._id}/complete`, {
                auditorNotes: resultNote,
            });
            router.push("/staff/dashboard");
        } catch (error) {
            console.error("Error submitting result:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกผล");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !audit) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>;
    }

    const completedChecks = audit.responses.filter((r: ChecklistItem) => r.response !== "PENDING").length;
    const passedChecks = audit.responses.filter((r: ChecklistItem) => r.response === "PASS").length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">← กลับ</Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div>
                            <p className="font-mono text-sm text-slate-400">{audit.auditNumber}</p>
                            <h1 className="font-bold">{audit.farmerName}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {audit.auditMode === "ONLINE" && audit.onlineSession?.meetingUrl && (
                            <a
                                href={audit.onlineSession.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                                <IconVideo size={20} />
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
                            <h3 className="flex items-center gap-2 font-semibold mb-4"><IconDocument size={18} className="text-emerald-600" /> ข้อมูลนัดหมาย</h3>
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
                                    <span className={`px-2 py-1 rounded-full text-xs ${audit.auditMode === "ONLINE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {audit.auditMode === "ONLINE" ? <><IconVideo size={12} /> VDO Call</> : <><IconMapPin size={12} /> ลงพื้นที่</>}
                                    </span>
                                </div>
                            </div>

                            {audit.auditMode === "ONLINE" && audit.onlineSession?.meetingUrl && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-600 mb-1">ลิงก์ห้องประชุม:</p>
                                    <a href={audit.onlineSession.meetingUrl} target="_blank" className="text-blue-700 underline text-sm break-all">
                                        {audit.onlineSession.meetingUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Template Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="flex items-center gap-2 font-semibold mb-4"><IconDocument size={18} className="text-emerald-600" /> ข้อมูล Template</h3>
                            <div className="space-y-2">
                                {template ? (
                                    <>
                                        <p className="text-sm text-slate-600">Template: {template.nameTh}</p>
                                        <p className="text-xs text-slate-500">รหัส: {template.templateCode}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {template.categories.map((cat) => (
                                                <button
                                                    key={cat.categoryCode}
                                                    onClick={() => setActiveCategory(cat.categoryCode)}
                                                    className={`px-2 py-1 text-xs rounded ${activeCategory === cat.categoryCode
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {cat.nameTh}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-400">กำลังโหลด...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Checklist */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="flex items-center gap-2 font-semibold"><IconCheckCircle size={18} className="text-emerald-600" /> Checklist การตรวจประเมิน</h3>
                                <span className="text-sm text-slate-500">
                                    {completedChecks}/{audit.responses.length} รายการ | ผ่าน {passedChecks} รายการ
                                </span>
                            </div>

                            <div className="divide-y">
                                {audit.responses.map((item: ChecklistItem, idx: number) => (
                                    <div key={item.itemCode} className="p-4 hover:bg-slate-50">
                                        <div className="flex items-start gap-4">
                                            <span className="text-lg font-mono text-slate-400">{idx + 1}.</span>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.titleTh || item.itemCode}</p>
                                                <p className="text-xs text-slate-400 mt-1">{item.itemCode}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateResponse(item.itemCode, "PASS")}
                                                        className={`px-4 py-1 rounded-lg text-sm transition-all ${item.response === "PASS"
                                                            ? "bg-green-600 text-white"
                                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                                            }`}
                                                    >
                                                        ผ่าน
                                                    </button>
                                                    <button
                                                        onClick={() => updateResponse(item.itemCode, "FAIL")}
                                                        className={`px-4 py-1 rounded-lg text-sm transition-all ${item.response === "FAIL"
                                                            ? "bg-red-600 text-white"
                                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            }`}
                                                    >
                                                        ไม่ผ่าน
                                                    </button>
                                                    <button
                                                        onClick={() => updateResponse(item.itemCode, "NA")}
                                                        className={`px-4 py-1 rounded-lg text-sm transition-all ${item.response === "NA"
                                                            ? "bg-slate-600 text-white"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                            }`}
                                                    >
                                                        N/A
                                                    </button>
                                                </div>
                                                {item.response === "FAIL" && (
                                                    <input
                                                        type="text"
                                                        value={item.notes || ""}
                                                        onChange={(e) => updateResponse(item.itemCode, "FAIL", e.target.value)}
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
                                ผ่าน - ออกใบรับรอง
                            </button>
                            <button
                                onClick={() => { setResult("MINOR"); setShowResultModal(true); }}
                                className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
                            >
                                แก้ไขเล็กน้อย (Minor)
                            </button>
                            <button
                                onClick={() => { setResult("MAJOR"); setShowResultModal(true); }}
                                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                            >
                                ไม่ผ่าน/นัดใหม่ (Major)
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
                                {result === "PASS" && "ยืนยันอนุมัติ"}
                                {result === "MINOR" && "ขอข้อมูลเพิ่มเติม"}
                                {result === "MAJOR" && "ไม่ผ่าน - ออก CARs"}
                            </h3>
                            <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600"><IconX size={20} /></button>
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
