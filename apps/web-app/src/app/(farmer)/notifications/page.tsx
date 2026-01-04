"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api-client";

interface Notification {
    id: string;
    _id?: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
    read: boolean;
    createdAt: string;
    actionUrl?: string;
    actionLabel?: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
    { id: "1", title: "ยินดีต้อนรับสู่ระบบ GACP", message: "ระบบพร้อมให้บริการแล้ว คุณสามารถเริ่มยื่นคำขอรับรองมาตรฐานได้เลย", type: "SUCCESS", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), actionUrl: "/applications/new", actionLabel: "ยื่นคำขอใหม่" },
    { id: "2", title: "เอกสารถูกตรวจสอบแล้ว", message: "คำขอ #APP-2024-001 ผ่านการตรวจเอกสารเบื้องต้น กรุณาชำระเงินงวดที่ 2", type: "INFO", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), actionUrl: "/payments?app=APP-2024-001", actionLabel: "ชำระเงิน" },
    { id: "3", title: "นัดหมายตรวจประเมินสถานที่", message: "เจ้าหน้าที่จะเข้าตรวจประเมินสถานที่ในวันที่ 20 ธ.ค. 2567 เวลา 10:00 น.", type: "WARNING", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), actionUrl: "/tracking", actionLabel: "ดูรายละเอียด" },
];

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        if (!localStorage.getItem("user")) { router.push("/login"); return; }
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const result = await api.get<{ data: Notification[] }>("/v2/notifications");
            setNotifications(result.success && result.data?.data ? result.data.data : DEMO_NOTIFICATIONS);
        } catch { setNotifications(DEMO_NOTIFICATIONS); }
        finally { setLoading(false); }
    };

    const markAsRead = async (id: string) => {
        try { await api.post(`/v2/notifications/${id}/read`, {}); } catch { }
        setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    };

    const markAllAsRead = async () => {
        try { await api.post("/v2/notifications/read-all", {}); } catch { }
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); window.location.href = "/api/auth/logout"; };

    const formatTime = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
        if (mins < 60) return `${mins} นาทีที่แล้ว`;
        if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
        if (days < 7) return `${days} วันที่แล้ว`;
        return new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const getTypeClasses = (type: string, read: boolean) => {
        const base = read ? 'bg-white border-surface-200 dark:bg-slate-800 dark:border-slate-700' : '';
        switch (type) {
            case 'SUCCESS': return read ? base : 'bg-primary-50 border-primary-200 dark:bg-primary-500/15 dark:border-primary-500/30';
            case 'WARNING': return read ? base : 'bg-secondary-50 border-secondary-300 dark:bg-secondary-500/15 dark:border-secondary-500/30';
            case 'DANGER': return read ? base : 'bg-red-50 border-red-300 dark:bg-red-500/15 dark:border-red-500/30';
            default: return read ? base : 'bg-blue-50 border-blue-200 dark:bg-blue-500/15 dark:border-blue-500/30';
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400';
            case 'WARNING': return 'bg-secondary-100 text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-400';
            case 'DANGER': return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
            default: return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
        }
    };

    const getDotColor = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'bg-primary-500';
            case 'WARNING': return 'bg-secondary-500';
            case 'DANGER': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    if (!mounted) return null;

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'UNREAD' ? notifications.filter(n => !n.read) : notifications;

    const navItems = [
        { href: "/dashboard", icon: "🏠", label: "หน้าหลัก" },
        { href: "/applications", icon: "📄", label: "คำขอ" },
        { href: "/certificates", icon: "🏅", label: "ใบรับรอง" },
        { href: "/tracking", icon: "🧭", label: "ติดตาม" },
        { href: "/payments", icon: "💳", label: "การเงิน" },
        { href: "/profile", icon: "👤", label: "โปรไฟล์" },
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors ${isDark ? 'dark bg-slate-900 text-slate-100' : 'bg-surface-50 text-slate-900'}`}>
            {/* Sidebar */}
            <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] flex-col items-center py-5 border-r z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-xl font-semibold text-white mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full px-2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-700`}>
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>{isDark ? '☀️' : '🌙'}</button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500">🚪</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`lg:hidden fixed bottom-0 inset-x-0 h-[72px] flex justify-around items-center z-50 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                {navItems.slice(0, 5).map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="lg:ml-[72px] p-6 lg:p-10 pb-24 lg:pb-10 max-w-3xl">
                {/* Header */}
                <header className="flex justify-between items-start flex-wrap gap-4 mb-7">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-medium flex items-center gap-3">
                            การแจ้งเตือน
                            {unreadCount > 0 && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-500 text-white">{unreadCount} ใหม่</span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">ข้อความและการอัปเดตจากระบบ</p>
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-surface-200 text-slate-600'}`}>
                            ✓✓ อ่านทั้งหมด
                        </button>
                    )}
                </header>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-5">
                    {[{ key: 'ALL', label: 'ทั้งหมด', count: notifications.length }, { key: 'UNREAD', label: 'ยังไม่อ่าน', count: unreadCount }].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key as 'ALL' | 'UNREAD')} className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${filter === tab.key ? 'bg-primary-500 text-white' : `${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-surface-200 text-slate-600'}`}`}>
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-surface-200'}`}>
                        <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                        <p className="mt-4 text-slate-500">กำลังโหลด...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {filteredNotifications.map(n => (
                            <div
                                key={n.id || n._id}
                                onClick={() => !n.read && markAsRead(n.id || n._id || '')}
                                className={`rounded-2xl p-5 border transition-all relative ${n.read ? '' : 'cursor-pointer'} ${getTypeClasses(n.type, n.read)}`}
                            >
                                {!n.read && <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full ${getDotColor(n.type)}`} />}
                                <div className="flex gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${getIconBg(n.type)}`}>
                                        {n.type === 'SUCCESS' ? '✓' : n.type === 'WARNING' ? '⚠️' : n.type === 'DANGER' ? '✕' : 'ℹ️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-base font-medium">{n.title}</h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{n.message}</p>
                                        {n.actionUrl && (
                                            <Link href={n.actionUrl} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium">
                                                {n.actionLabel || "ดูรายละเอียด"} →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`rounded-2xl p-16 text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-surface-200'}`}>
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl ${isDark ? 'bg-primary-500/15' : 'bg-primary-50'}`}>🔔</div>
                        <h3 className="text-lg font-medium mb-2">{filter === 'UNREAD' ? "ไม่มีการแจ้งเตือนที่ยังไม่อ่าน" : "ไม่มีการแจ้งเตือน"}</h3>
                        <p className="text-sm text-slate-500">เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่</p>
                    </div>
                )}
            </main>
        </div>
    );
}
