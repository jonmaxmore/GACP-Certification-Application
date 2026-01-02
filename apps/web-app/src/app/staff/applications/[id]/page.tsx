"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
    id: string;
    applicantName: string;
    applicantType: string;
    plantType: string;
    status: string;
    phase: number;
    submissionCount: number;
    submittedAt: string;
    lastUpdatedAt: string;
    slaTimer: string;
    documents: { name: string; status: string; url: string }[];
    reviewHistory: { date: string; action: string; comment: string; by: string }[];
    auditRecord?: { checklist: { item: string; passed: boolean }[]; photos: string[]; result: string };
    payments: { phase: number; amount: number; paidAt: string }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    SUBMITTED: { label: "ยื่นคำขอ", color: "bg-slate-100 text-slate-700" },
    PAID_PHASE_1: { label: "จ่ายงวด 1", color: "bg-blue-100 text-blue-700" },
    PENDING_REVIEW: { label: "รอตรวจเอกสาร", color: "bg-amber-100 text-amber-700" },
    REVISION_REQUIRED: { label: "แก้ไขเอกสาร", color: "bg-red-100 text-red-700" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่าน", color: "bg-green-100 text-green-700" },
    PAID_PHASE_2: { label: "จ่ายงวด 2", color: "bg-blue-100 text-blue-700" },
    PENDING_SCHEDULE: { label: "รอจัดคิว", color: "bg-purple-100 text-purple-700" },
    SCHEDULED: { label: "นัดหมายแล้ว", color: "bg-purple-100 text-purple-700" },
    PENDING_AUDIT: { label: "รอตรวจประเมิน", color: "bg-amber-100 text-amber-700" },
    AUDIT_PASSED: { label: "ตรวจผ่าน", color: "bg-green-100 text-green-700" },
    APPROVED: { label: "อนุมัติ", color: "bg-emerald-100 text-emerald-700" },
};

export default function JobSheetPage() {
    const params = useParams();
    const router = useRouter();
    const [app, setApp] = useState<Application | null>(null);
    const [activeTab, setActiveTab] = useState<"documents" | "history" | "audit">("documents");
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject">("approve");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }

        // Fetch real application data
        const fetchApplication = async () => {
            try {
                const res = await fetch(`/api/applications/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        const data = result.data;
                        setApp({
                            id: data._id || data.id || params.id as string,
                            applicantName: data.data?.applicantInfo?.name || 'ไม่ระบุชื่อ',
                            applicantType: data.data?.applicantType || 'บุคคลธรรมดา',
                            plantType: data.data?.formData?.plantId || 'ไม่ระบุ',
                            status: data.status,
                            phase: data.status?.includes('AUDIT') ? 2 : 1,
                            submissionCount: (data.rejectCount || 0) + 1,
                            submittedAt: data.createdAt?.split('T')[0] || '-',
                            lastUpdatedAt: data.updatedAt || data.createdAt || '-',
                            slaTimer: getSLATimer(data.createdAt),
                            documents: data.documents || [],
                            reviewHistory: [],
                            payments: []
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching application:', error);
            }
        };
        fetchApplication();
    }, [params.id, router]);

    const getSLATimer = (createdAt: string): string => {
        if (!createdAt) return '-';
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return `${diffDays} วัน`;
        if (diffDays <= 5) return `${diffDays} วัน ⚠️`;
        return `${diffDays} วัน 🔴 เกิน SLA`;
    };

    const handleAction = (type: "approve" | "reject") => {
        setActionType(type);
        setComment("");
        setShowActionModal(true);
    };

    const submitAction = async () => {
        const token = localStorage.getItem("staff_token");
        if (!token || !app) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/applications/${app.id}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: actionType === "approve" ? "APPROVE" : "REJECT",
                    comment: comment
                })
            });

            if (res.ok) {
                alert(`${actionType === "approve" ? "อนุมัติสำเร็จ" : "ส่งคืนแก้ไขสำเร็จ"}`);
                setShowActionModal(false);
                router.push('/staff/dashboard');
            } else {
                const err = await res.json();
                alert(`เกิดข้อผิดพลาด: ${err.error || 'ไม่ทราบสาเหตุ'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!app) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⏳</div></div>;
    }

    const statusInfo = STATUS_LABELS[app.status] || { label: app.status, color: "bg-slate-100" };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">← กลับ</Link>
                            <div className="h-10 w-px bg-slate-600" />
                            <div>
                                <div className="flex items-center gap-3">
                                    <p className="font-mono text-lg">{app.id}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                                </div>
                                <p className="text-slate-400 text-sm">{app.applicantName} • {app.applicantType}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`px-3 py-1 rounded-lg ${app.slaTimer.includes("เลย") ? "bg-red-500" : app.slaTimer.includes("วัน") ? "bg-amber-500" : "bg-green-500"
                                }`}>
                                <p className="text-xs">SLA Timer</p>
                                <p className="font-bold">{app.slaTimer}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        {[
                            { label: "ยื่นคำขอ", done: true },
                            { label: "จ่ายงวด 1", done: true },
                            { label: "ตรวจเอกสาร", done: false, active: app.phase === 1 },
                            { label: "จ่ายงวด 2", done: false },
                            { label: "ตรวจประเมิน", done: false, active: app.phase === 2 },
                            { label: "อนุมัติ", done: false },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step.done ? "bg-green-500 text-white" :
                                    step.active ? "bg-blue-500 text-white animate-pulse" :
                                        "bg-slate-600 text-slate-400"
                                    }`}>
                                    {step.done ? "✓" : i + 1}
                                </div>
                                <span className={step.active ? "text-white font-bold" : "text-slate-400"}>{step.label}</span>
                                {i < 5 && <span className="text-slate-600">→</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: "documents", label: "📄 เอกสาร", count: app.documents.length },
                        { id: "history", label: "📋 ประวัติ", count: app.reviewHistory.length },
                        { id: "audit", label: "🔍 ผลตรวจประเมิน", disabled: app.phase < 2 },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id as typeof activeTab)}
                            disabled={tab.disabled}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id
                                ? "bg-slate-800 text-white"
                                : tab.disabled
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {tab.label} {tab.count !== undefined && `(${tab.count})`}
                        </button>
                    ))}

                    {/* Submission Counter */}
                    <div className={`ml-auto px-4 py-3 rounded-xl font-semibold ${app.submissionCount >= 3 ? "bg-red-100 text-red-700" :
                        app.submissionCount === 2 ? "bg-amber-100 text-amber-700" :
                            "bg-green-100 text-green-700"
                        }`}>
                        ส่งครั้งที่: {app.submissionCount}/3
                        {app.submissionCount >= 3 && " ⚠️ ครบโควตาฟรี"}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "documents" && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="font-semibold">เอกสารแนบ ({app.documents.length} รายการ)</h3>
                        </div>
                        <div className="divide-y">
                            {app.documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.status === "verified" ? "bg-green-100" :
                                        doc.status === "issue" ? "bg-red-100" :
                                            "bg-amber-100"
                                        }`}>
                                        {doc.status === "verified" ? "✅" : doc.status === "issue" ? "❌" : "⏳"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{doc.name}</p>
                                        <p className={`text-sm ${doc.status === "verified" ? "text-green-600" :
                                            doc.status === "issue" ? "text-red-600" :
                                                "text-amber-600"
                                            }`}>
                                            {doc.status === "verified" ? "ถูกต้อง" : doc.status === "issue" ? "ต้องแก้ไข" : "รอตรวจสอบ"}
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm">
                                        👁️ Preview
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h3 className="font-semibold">ประวัติการดำเนินการ</h3>
                        </div>
                        <div className="p-6">
                            <div className="relative pl-8">
                                {app.reviewHistory.map((item, i) => (
                                    <div key={i} className="relative pb-8 last:pb-0">
                                        {i < app.reviewHistory.length - 1 && (
                                            <div className="absolute left-[-20px] top-6 w-0.5 h-full bg-slate-200" />
                                        )}
                                        <div className="absolute left-[-24px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                                        <div className="bg-slate-50 rounded-xl p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold">{item.action}</p>
                                                <p className="text-sm text-slate-500">{item.date}</p>
                                            </div>
                                            <p className="text-slate-600">{item.comment}</p>
                                            <p className="text-sm text-slate-400 mt-1">โดย: {item.by}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Bar - Fixed at bottom during Phase 1 */}
                {app.phase === 1 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                        <div className="max-w-7xl mx-auto flex justify-end gap-4">
                            <button
                                onClick={() => handleAction("reject")}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 flex items-center gap-2"
                            >
                                ↩️ ส่งคืนแก้ไข
                            </button>
                            <button
                                onClick={() => handleAction("approve")}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 flex items-center gap-2"
                            >
                                ✅ อนุมัติเอกสาร
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">
                                {actionType === "approve" ? "✅ ยืนยันอนุมัติเอกสาร" : "↩️ ส่งคืนแก้ไข"}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {actionType === "reject" && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                                    ⚠️ ผู้สมัครแก้ไขฟรี {3 - app.submissionCount} ครั้ง หลังจากนั้นต้องชำระค่าธรรมเนียมใหม่
                                </div>
                            )}
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={actionType === "approve" ? "หมายเหตุ (ถ้ามี)..." : "ระบุจุดที่ต้องแก้ไขอย่างละเอียด..."}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg"
                                required={actionType === "reject"}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowActionModal(false)} className="flex-1 py-3 border border-slate-300 rounded-xl">
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={submitAction}
                                    disabled={actionType === "reject" && !comment}
                                    className={`flex-1 py-3 text-white rounded-xl disabled:opacity-50 ${actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
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
