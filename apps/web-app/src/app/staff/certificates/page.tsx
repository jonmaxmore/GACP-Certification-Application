"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient as api } from "@/lib/api";

interface Certificate {
    id: string; // The backend returns 'id', keeping it standard or need to check prisma response
    certificateNumber: string;
    siteName: string;
    plantType: string;
    issuedDate: string;
    expiryDate: string;
    status: string;
}

export default function StaffCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        setLoading(true);
        try {
            // The route in certificates.js for staff is GET /api/certificates
            const result = await api.get<{ data: Certificate[] }>("/api/certificates");
            if (result.success && result.data?.data) {
                setCertificates(result.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">จัดการใบรับรอง (Certificates)</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">เลขที่ใบรับรอง</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">ชื่อสถานที่</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">พืช</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">วันที่ออก</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">สถานะ</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">กำลังโหลด...</td></tr>
                        ) : certificates.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">ไม่พบใบรับรอง</td></tr>
                        ) : (
                            certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{cert.certificateNumber}</td>
                                    <td className="px-6 py-4 text-slate-600">{cert.siteName}</td>
                                    <td className="px-6 py-4 text-slate-600">{cert.plantType}</td>
                                    <td className="px-6 py-4 text-slate-600">{new Date(cert.issuedDate).toLocaleDateString("th-TH")}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cert.status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                cert.status.toUpperCase() === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => window.open(`/api/certificates/${cert.id}/download`, '_blank')}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium text-xs border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                                        >
                                            ดาวน์โหลด PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
