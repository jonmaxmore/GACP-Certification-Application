"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient as api } from "@/lib/api/api-client";
import { AuthService } from "@/lib/services/auth-service";
import {
    IconUser, IconDocument, IconCheckCircle, LockIcon
} from "@/components/ui/icons";

/* Additional local icons if not in shared lib */
const IconInfo = ({ color = "currentColor", size = 24 }: { color?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
    </svg>
);

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

        const currentUser = AuthService.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }

        // We use the user from localStorage first, but ideally we should fetch fresh profile
        // For now, consistent with other pages, stick to localStorage user or fetch profile if needed.
        // The original code used localStorage directly. AuthService.getUser() also uses localStorage/cookies logic.
        // Let's rely on AuthService.getUser() but it returns a User object.
        // We might need to cast or just use what we have.
        // Actually, let's fetch profile to be sure.
        fetchProfile();
    }, [router]);

    const fetchProfile = async () => {
        const res = await api.get<User>('/auth/me'); // Assuming an endpoint exists or we rely on stored user
        // If /auth/me doesn't exist, fall back to localStorage user
        if (res.success && res.data) {
            const u = res.data;
            setUser(u);
            initForm(u);
        } else {
            // Fallback
            const u = AuthService.getUser();
            if (u) {
                setUser(u as User);
                initForm(u as User);
            }
        }
    };

    const initForm = (u: User) => {
        setFirstName(u.firstName || ""); setLastName(u.lastName || ""); setEmail(u.email || ""); setPhone(u.phone || ""); setCompanyName(u.companyName || u.communityName || "");
        setOriginalValues({ firstName: u.firstName || "", lastName: u.lastName || "", email: u.email || "", phone: u.phone || "", companyName: u.companyName || u.communityName || "" });
    };

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const validatePhone = (v: string) => /^0[689]\d{8}$/.test(v);

    const handleSaveProfile = async () => {
        if (email && !validateEmail(email)) { setMessage("รูปแบบอีเมลไม่ถูกต้อง"); return; }
        if (phone && !validatePhone(phone)) { setMessage("เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08, 09"); return; }
        setIsSaving(true); setMessage("");

        // Use api client
        const result = await api.put("/auth-farmer/profile", { firstName, lastName, email, phone, companyName });

        if (result.success) {
            const updatedUser = { ...user, firstName, lastName, email, phone, companyName };
            // Update auth service storage if possible, but AuthService might not expose direct setter easily if it uses cookies primarily.
            // But we can update localStorage "user" manually as the app seems to rely on it for UI
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setUser(updatedUser);
            setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
            setIsEditing(false);
            setOriginalValues({ firstName, lastName, email, phone, companyName });
        } else {
            setMessage((result.error || "เกิดข้อผิดพลาด"));
        }
        setIsSaving(false);
    };

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = "/login";
    };

    const getAccountTypeThai = () => { switch (user?.accountType) { case "INDIVIDUAL": return "บุคคลธรรมดา"; case "JURISTIC": return "นิติบุคคล"; case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน"; default: return "ผู้สมัคร"; } };
    const getName = () => user?.companyName || user?.communityName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "ผู้ใช้";

    const accentColor = isDark ? "#10B981" : "#16A34A";

    if (!user || !mounted) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-stone-50'}`}><div className="w-10 h-10 border-3 border-slate-300 border-t-emerald-500 rounded-full animate-spin" /></div>;

    const inputClass = `w-full py-3.5 px-4 border rounded-xl text-sm outline-none transition-colors ${isEditing ? (isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200') : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')} ${isDark ? 'text-slate-100' : 'text-slate-800'} focus:border-emerald-500`;

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-24 lg:pb-8">
            <header className="mb-7"><h1 className="text-2xl lg:text-3xl font-medium">ตั้งค่าบัญชี</h1><p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p></header>

            {message && <div className={`p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2 ${message.includes('เรียบร้อย') ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')}`}>
                <IconCheckCircle color={message.includes('เรียบร้อย') ? accentColor : "#EF4444"} size={20} /> {message}
            </div>}

            {/* Personal Info Card */}
            <div className={`rounded-2xl p-6 mb-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <IconUser color={accentColor} size={24} />
                    </div>
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
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <LockIcon color={accentColor} size={24} />
                    </div>
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
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <IconInfo color={accentColor} size={24} />
                    </div>
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
        </div>
    );
}
