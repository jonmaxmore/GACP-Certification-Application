"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

interface Application {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
    submissionCount?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    SUBMITTED: { label: "ยื่นคำขอ", color: "bg-slate-100 text-slate-700" },
    PENDING_REVIEW: { label: "รอตรวจเอกสาร", color: "bg-amber-100 text-amber-700" },
    REVISION_REQUIRED: { label: "แก้ไขเอกสาร", color: "bg-red-100 text-red-700" },
    DOCUMENT_APPROVED: { label: "เอกสารผ่าน", color: "bg-green-100 text-green-700" },
    PENDING_AUDIT: { label: "รอตรวจประเมิน", color: "bg-purple-100 text-purple-700" },
    APPROVED: { label: "อนุมัติ", color: "bg-emerald-100 text-emerald-700" },
};

export default function StaffApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        const token = localStorage.getItem("staff_token");
        if (!token) {
            router.push("/staff/login");
            return;
        }
        fetchApplications();
    }, [router]);

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const result = await api.get<{ data: { applications: Application[] } }>('/v2/applications');
            if (result.success && result.data?.data?.applications) {
                setApplications(result.data.data.applications);
            } else {
                // Mock data for demo
                setApplications([
                    { id: "APP-2024-001", applicantName: "นายสมชาย ใจดี", plantType: "กัญชา", status: "PENDING_REVIEW", submittedAt: "2024-12-08", submissionCount: 1 },
                    { id: "APP-2024-002", applicantName: "บริษัท สมุนไพรไทย จำกัด", plantType: "กระท่อม", status: "DOCUMENT_APPROVED", submittedAt: "2024-12-05", submissionCount: 2 },
                    { id: "APP-2024-003", applicantName: "วิสาหกิจชุมชนสมุนไพร", plantType: "ขมิ้นชัน", status: "REVISION_REQUIRED", submittedAt: "2024-12-01", submissionCount: 3 },
                ]);
            }
        } catch {
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredApps = applications.filter(app => {
        if (filter === "all") return true;
        return app.status === filter;
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
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/staff/dashboard" className="text-slate-400 hover:text-white">
                            ← กลับ
                        </Link>
                        <div className="h-6 w-px bg-slate-600" />
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <div>
                                <h1 className="text-xl font-bold">คำขอรับรองทั้งหมด</h1>
                                <p className="text-slate-400 text-sm">Applications Management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { key: "all", label: "ทั้งหมด" },
                        { key: "PENDING_REVIEW", label: "รอตรวจ" },
                        { key: "REVISION_REQUIRED", label: "แก้ไข" },
                        { key: "DOCUMENT_APPROVED", label: "เอกสารผ่าน" },
                        { key: "APPROVED", label: "อนุมัติ" },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key
                                    ? "bg-slate-800 text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">หมายเลข</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ผู้ยื่น</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">พืช</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">สถานะ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ยื่นเมื่อ</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredApps.map(app => {
                                const status = STATUS_LABELS[app.status] || { label: app.status, color: "bg-slate-100" };
                                return (
                                    <tr key={app.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-sm">{app.id}</td>
                                        <td className="px-6 py-4 font-medium">{app.applicantName}</td>
                                        <td className="px-6 py-4">{app.plantType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{app.submittedAt}</td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/staff/applications/${app.id}`}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                            >
                                                ดูรายละเอียด
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredApps.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <p className="text-5xl mb-4">📋</p>
                            <p>ไม่พบคำขอ</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
