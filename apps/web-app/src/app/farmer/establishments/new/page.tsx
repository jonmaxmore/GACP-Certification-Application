"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewEstablishmentPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [area, setArea] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { window.location.href = "/login"; }
    }, []);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); alert("ฟีเจอร์นี้จะเปิดให้บริการเร็วๆ นี้"); };

    if (!mounted) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-surface-100'}`}><div className="w-10 h-10 border-[3px] border-surface-200 border-t-primary-600 rounded-full animate-spin" /></div>;

    return (
        <div className={`min-h-screen font-sans transition-all ${isDark ? 'bg-slate-900 text-surface-100' : 'bg-surface-100 text-slate-900'}`}>
            {/* Header */}
            <header className={`px-6 py-5 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                <div className="max-w-[700px] mx-auto flex items-center gap-4">
                    <Link href="/establishments" className={`flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    </Link>
                    <h1 className="text-xl font-medium">เพิ่มแปลงปลูกใหม่</h1>
                </div>
            </header>

            {/* Form */}
            <main className="max-w-[700px] mx-auto p-6">
                <div className={`rounded-2xl p-7 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-surface-200'}`}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ชื่อแปลงปลูก</label>
                            <input type="text" placeholder="แปลงสมุนไพรบ้านใหม่" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100 focus:border-primary-500' : 'bg-white border-surface-200 text-slate-900 focus:border-primary-600'}`} required />
                        </div>
                        <div className="mb-5">
                            <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ที่อยู่</label>
                            <textarea placeholder="123 หมู่ 4 ต.บางนา อ.เมือง จ.สมุทรปราการ" value={address} onChange={(e) => setAddress(e.target.value)} className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border min-h-[100px] resize-y ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100 focus:border-primary-500' : 'bg-white border-surface-200 text-slate-900 focus:border-primary-600'}`} required />
                        </div>
                        <div className="mb-7">
                            <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>พื้นที่ (ไร่)</label>
                            <input type="number" placeholder="10" value={area} onChange={(e) => setArea(e.target.value)} className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${isDark ? 'bg-slate-700 border-slate-600 text-surface-100 focus:border-primary-500' : 'bg-white border-surface-200 text-slate-900 focus:border-primary-600'}`} required />
                        </div>
                        <button type="submit" className="w-full py-4 bg-gradient-to-br from-primary-700 to-primary-500 text-white text-base font-semibold rounded-xl shadow-lg shadow-primary-500/40">บันทึกแปลงปลูก</button>
                    </form>
                </div>
            </main>
        </div>
    );
}
