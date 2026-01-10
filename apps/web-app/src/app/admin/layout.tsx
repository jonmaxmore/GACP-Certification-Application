
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem("staff_token");
        if (!token) {
            // Redirect to staff login if not authenticated
            router.push("/staff/login");
        }
    }, [router]);

    const menuItems = [
        { label: "ภาพรวม (Dashboard)", href: "/admin/dashboard", icon: "📊" },
        { label: "จัดการผู้ใช้งาน (Users)", href: "/admin/users", icon: "👥" },
        { label: "จัดการพืช (Plants)", href: "/admin/plants", icon: "🌿" },
        { label: "รายงาน (Reports)", href: "/admin/reports", icon: "📑" },
        { label: "ตั้งค่าระบบ (Config)", href: "/admin/config", icon: "⚙️" },
    ];

    const handleLogout = () => {
        // Clear Staff Auth
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff_user");
        document.cookie = 'staff_token=; path=/; max-age=0';

        window.location.href = "/staff/login";
    };

    if (!mounted) return null; // Prevent flash of content

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && <h1 className="text-xl font-bold text-emerald-400">GACP Admin</h1>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white">
                        {isSidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all ${!isSidebarOpen && "justify-center"
                            }`}
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-medium text-sm">ออกจากระบบ</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto h-screen">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-slate-500 text-sm">
                        Department of Thai Traditional and Alternative Medicine
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs ring-2 ring-white shadow-sm">
                            A
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Admin User</span>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
