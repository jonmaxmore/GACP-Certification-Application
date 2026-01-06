"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient as api } from "@/lib/api";

const Icons = {
    home: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    fileText: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    creditCard: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    user: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    logout: (c: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="5" /></svg>,
    compass: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
    lock: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    info: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
    check: (c: string) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
};

interface User { id?: string; firstName?: string; lastName?: string; email?: string; phone?: string; identifier?: string; companyName?: string; communityName?: string; accountType?: string; createdAt?: string; lastLogin?: string; }

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [originalValues, setOriginalValues] = useState({ firstName: "", lastName: "", email: "", phone: "", companyName: "" });

    const hasChanges = isEditing && (firstName !== originalValues.firstName || lastName !== originalValues.lastName || email !== originalValues.email || phone !== originalValues.phone || companyName !== originalValues.companyName);

    useEffect(() => {
        setMounted(true);
        setIsDark(localStorage.getItem("theme") === "dark");
        const userData = localStorage.getItem("user");
        if (!userData) { router.push("/login"); return; }
        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setFirstName(parsed.firstName || ""); setLastName(parsed.lastName || ""); setEmail(parsed.email || ""); setPhone(parsed.phone || ""); setCompanyName(parsed.companyName || parsed.communityName || "");
            setOriginalValues({ firstName: parsed.firstName || "", lastName: parsed.lastName || "", email: parsed.email || "", phone: parsed.phone || "", companyName: parsed.companyName || parsed.communityName || "" });
        } catch { router.push("/login"); }
    }, [router]);

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const validatePhone = (v: string) => /^0[689]\d{8}$/.test(v);

    const handleSaveProfile = async () => {
        if (email && !validateEmail(email)) { setMessage("รูปแบบอีเมลไม่ถูกต้อง"); return; }
        if (phone && !validatePhone(phone)) { setMessage("เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08, 09"); return; }
        setIsSaving(true); setMessage("");
        const result = await api.put("/auth-farmer/profile", { firstName, lastName, email, phone, companyName });
        if (result.success) {
            const updatedUser = { ...user, firstName, lastName, email, phone, companyName };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
            setIsEditing(false);
        } else { setMessage((result.error || "เกิดข้อผิดพลาด")); }
        setIsSaving(false);
    };

    const toggleTheme = () => { setIsDark(!isDark); localStorage.setItem("theme", !isDark ? "dark" : "light"); };
    const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("gacp_wizard_state"); window.location.href = "/api/auth/logout"; };
    const getAccountTypeThai = () => { switch (user?.accountType) { case "INDIVIDUAL": return "บุคคลธรรมดา"; case "JURISTIC": return "นิติบุคคล"; case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน"; default: return "ผู้สมัคร"; } };
    const getName = () => user?.companyName || user?.communityName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "ผู้ใช้";

    const accentColor = isDark ? "#10B981" : "#16A34A";
    const mutedColor = isDark ? "#64748B" : "#9CA3AF";

    if (!user || !mounted) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}><div className="w-10 h-10 border-3 border-slate-300 border-t-emerald-500 rounded-full animate-spin" /></div>;

    const navItems = [
        { href: "/dashboard", icon: Icons.home, label: "หน้าหลัก" },
        { href: "/applications", icon: Icons.fileText, label: "คำขอ" },
        { href: "/tracking", icon: Icons.compass, label: "ติดตาม" },
        { href: "/payments", icon: Icons.creditCard, label: "การเงิน" },
        { href: "/profile", icon: Icons.user, label: "โปรไฟล์", active: true },
    ];

    const inputClass = `w-full py-3.5 px-4 border rounded-xl text-sm outline-none transition-colors ${isEditing ? (isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200') : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')} ${isDark ? 'text-slate-100' : 'text-slate-800'} focus:border-emerald-500`;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-stone-50 text-slate-800'}`}>
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-[72px] border-r flex-col items-center py-5 hidden lg:flex ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-xl mb-8">G</div>
                <nav className="flex-1 flex flex-col gap-1 w-full">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-3 relative">
                            {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r" />}
                            {item.icon(item.active ? accentColor : mutedColor)}
                            <span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-col items-center gap-3">
                    <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{isDark ? Icons.sun(accentColor) : Icons.moon(accentColor)}</button>
                    <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">{Icons.logout(mutedColor)}</button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className={`fixed bottom-0 left-0 right-0 h-[72px] border-t flex justify-around items-center z-50 lg:hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {navItems.map(item => <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 py-2 px-3">{item.icon(item.active ? accentColor : mutedColor)}<span className={`text-[10px] font-medium ${item.active ? 'text-emerald-500' : 'text-slate-400'}`}>{item.label}</span></Link>)}
            </nav>

            <main className="lg:ml-[72px] p-6 lg:p-8 max-w-4xl pb-24 lg:pb-8">
                <header className="mb-7"><h1 className="text-2xl lg:text-3xl font-medium">ตั้งค่าบัญชี</h1><p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p></header>

                {message && <div className={`p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2 ${message.includes('เรียบร้อย') ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')}`}>{Icons.check(message.includes('เรียบร้อย') ? accentColor : "#EF4444")} {message}</div>}

                {/* Personal Info Card */}
                <div className={`rounded-2xl p-6 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.user(accentColor)}</div>
                        <div><h2 className="text-lg font-semibold">ข้อมูลส่วนตัว</h2><p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>อัปเดตข้อมูลโปรไฟล์และข้อมูลติดต่อ</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ชื่อ-นามสกุล</label><input type="text" value={`${firstName} ${lastName}`.trim() || getName()} onChange={(e) => { const p = e.target.value.split(" "); setFirstName(p[0] || ""); setLastName(p.slice(1).join(" ") || ""); }} disabled={!isEditing} className={inputClass} /></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>อีเมล</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} className={inputClass} /></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เบอร์โทรศัพท์</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} className={inputClass} /></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เลขบัตรประชาชน</label><input type="text" value={user.identifier || ""} disabled className={`${inputClass} text-slate-400`} /></div>
                        {(user.companyName || user.communityName) && <div className="md:col-span-2"><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ชื่อองค์กร/บริษัท</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditing} className={inputClass} /></div>}
                    </div>
                    <div className="mt-5 flex justify-between items-center">
                        {hasChanges && <span className="text-xs text-amber-500">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>}
                        {!hasChanges && <div />}
                        <div className="flex gap-3">
                            {isEditing ? (<>
                                <button onClick={() => { setFirstName(originalValues.firstName); setLastName(originalValues.lastName); setEmail(originalValues.email); setPhone(originalValues.phone); setCompanyName(originalValues.companyName); setIsEditing(false); setMessage(""); }} className={`px-5 py-2.5 rounded-xl text-sm border ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}>ยกเลิก</button>
                                <button onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-semibold">{isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</button>
                            </>) : (
                                <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-semibold">แก้ไขข้อมูล</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className={`rounded-2xl p-6 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.lock(accentColor)}</div>
                        <div><h2 className="text-lg font-semibold">ความปลอดภัย</h2><p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>จัดการรหัสผ่านและการตั้งค่าความปลอดภัย</p></div>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                        <div><p className="font-medium">รหัสผ่าน</p><p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เปลี่ยนรหัสผ่านเพื่อความปลอดภัย</p></div>
                        <button onClick={() => alert("ฟีเจอร์นี้จะเปิดให้บริการเร็วๆ นี้")} className={`px-5 py-2.5 rounded-xl text-sm border ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}>เปลี่ยนรหัสผ่าน</button>
                    </div>
                </div>

                {/* Account Info */}
                <div className={`rounded-2xl p-6 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>{Icons.info(accentColor)}</div>
                        <div><h2 className="text-lg font-semibold">ข้อมูลบัญชี</h2><p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>ข้อมูลบัญชีและสถานะการใช้งาน</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>บทบาท</label><div className={`py-3.5 px-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>{getAccountTypeThai()}</div></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>สถานะบัญชี</label><div className={`py-3.5 px-4 rounded-xl font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>ใช้งานได้</div></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>วันที่สร้างบัญชี</label><div className={`py-3.5 px-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("th-TH") : "-"}</div></div>
                        <div><label className={`text-sm block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>เข้าสู่ระบบล่าสุด</label><div className={`py-3.5 px-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("th-TH") : "ไม่ระบุ"}</div></div>
                    </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className={`w-full py-4 rounded-2xl text-sm font-semibold border ${isDark ? 'bg-red-900/20 border-red-800/50 text-red-400' : 'bg-red-50 border-red-100 text-red-500'}`}>ออกจากระบบ</button>
            </main>
        </div>
    );
}
