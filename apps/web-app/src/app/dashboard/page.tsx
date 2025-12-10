"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    communityName?: string;
    accountType?: string;
    email?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch {
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const getDisplayName = () => {
        if (!user) return "";
        if (user.accountType === "JURISTIC" && user.companyName) {
            return user.companyName;
        }
        if (user.accountType === "COMMUNITY_ENTERPRISE" && user.communityName) {
            return user.communityName;
        }
        return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    };

    const getAccountTypeLabel = () => {
        switch (user?.accountType) {
            case "INDIVIDUAL":
                return "👤 บุคคลธรรมดา";
            case "JURISTIC":
                return "🏢 นิติบุคคล";
            case "COMMUNITY_ENTERPRISE":
                return "👥 วิสาหกิจชุมชน";
            default:
                return "ผู้ใช้งาน";
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-[#1B5E20] text-white shadow-lg">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌿</span>
                        <div>
                            <h1 className="font-bold">GACP</h1>
                            <p className="text-xs opacity-80">ระบบรับรองมาตรฐาน</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold">{getDisplayName()}</p>
                            <p className="text-xs opacity-80">{getAccountTypeLabel()}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
                        >
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-[#1B5E20] mb-2">
                        ยินดีต้อนรับ, {getDisplayName()}!
                    </h2>
                    <p className="text-gray-600">
                        คุณสามารถยื่นคำขอรับรองมาตรฐาน GACP และติดตามสถานะได้ที่นี่
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                        href="/application/new"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#1B5E20] group"
                    >
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-[#1B5E20] group-hover:underline">
                            ยื่นคำขอใหม่
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            เริ่มต้นยื่นคำขอรับรองมาตรฐาน GACP
                        </p>
                    </Link>

                    <Link
                        href="/applications"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#1B5E20] group"
                    >
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-[#1B5E20] group-hover:underline">
                            คำขอของฉัน
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            ดูและติดตามสถานะคำขอทั้งหมด
                        </p>
                    </Link>

                    <Link
                        href="/profile"
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#1B5E20] group"
                    >
                        <div className="text-4xl mb-4">⚙️</div>
                        <h3 className="text-lg font-semibold text-[#1B5E20] group-hover:underline">
                            ตั้งค่าบัญชี
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            แก้ไขข้อมูลส่วนตัวและรหัสผ่าน
                        </p>
                    </Link>
                </div>

                {/* Status Overview */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                    <h3 className="text-lg font-semibold text-[#1B5E20] mb-4">
                        สถานะคำขอ
                    </h3>
                    <div className="text-center py-12 text-gray-400">
                        <div className="text-5xl mb-4">📭</div>
                        <p>ยังไม่มีคำขอ</p>
                        <Link
                            href="/application/new"
                            className="inline-block mt-4 px-6 py-2 bg-[#1B5E20] text-white rounded-lg hover:bg-[#0D3612] transition-colors"
                        >
                            เริ่มยื่นคำขอ
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-gray-400">
                <p>© 2024 กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
            </footer>
        </div>
    );
}
