"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient as api } from "@/lib/api/api-client";
import { AuthService } from "@/lib/services/auth-service";
import { Icons, IconUser, IconLock } from "@/components/ui/icons";

interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    identifier?: string;
    companyName?: string;
    communityName?: string;
    accountType?: string;
    createdAt?: string;
    lastLogin?: string;
    verificationStatus?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [mounted, setMounted] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [originalValues, setOriginalValues] = useState({ firstName: "", lastName: "", email: "", phone: "", companyName: "" });

    const hasChanges = isEditing && (
        firstName !== originalValues.firstName ||
        lastName !== originalValues.lastName ||
        email !== originalValues.email ||
        phone !== originalValues.phone ||
        companyName !== originalValues.companyName
    );

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const validatePhone = (v: string) => /^0[689]\d{8}$/.test(v);

    const initForm = (u: User) => {
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setCompanyName(u.companyName || u.communityName || "");
        setOriginalValues({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            phone: u.phone || "",
            companyName: u.companyName || u.communityName || ""
        });
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const fetchProfile = async () => {
            const res = await api.get<User>('/auth/me');
            if (res.success && res.data) {
                const u = res.data;
                setUser(u);
                initForm(u);
            } else {
                const u = AuthService.getUser();
                if (u) {
                    setUser(u as User);
                    initForm(u as User);
                } else {
                    router.push("/login");
                }
            }
        };
        fetchProfile();
    }, [router]);



    const handleSaveProfile = async () => {
        if (email && !validateEmail(email)) { setMessage("❌ รูปแบบอีเมลไม่ถูกต้อง"); return; }
        if (phone && !validatePhone(phone)) { setMessage("❌ เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 06, 08, 09"); return; }
        setIsSaving(true);
        setMessage("");

        const result = await api.put("/auth-farmer/profile", { firstName, lastName, email, phone, companyName });

        if (result.success) {
            const updatedUser = { ...user, firstName, lastName, email, phone, companyName };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage("✅ บันทึกข้อมูลเรียบร้อยแล้ว");
            setIsEditing(false);
            setOriginalValues({ firstName, lastName, email, phone, companyName });
        } else {
            setMessage("❌ " + (result.error || "เกิดข้อผิดพลาดในการบันทึก"));
        }
        setIsSaving(false);
    };

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = "/login";
    };

    const getAccountTypeThai = () => {
        switch (user?.accountType) {
            case "INDIVIDUAL": return "บุคคลธรรมดา";
            case "JURISTIC": return "นิติบุคคล";
            case "COMMUNITY_ENTERPRISE": return "วิสาหกิจชุมชน";
            default: return "เกษตรกร";
        }
    };

    if (!user || !mounted) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
    );

    const inputClass = `w-full py-3.5 px-5 rounded-2xl border-2 transition-all outline-none font-medium ${isEditing ? 'bg-white border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/5' : 'bg-slate-50 border-slate-50 text-slate-500 cursor-not-allowed'}`;

    return (
        <div className="container mx-auto max-w-5xl py-10 px-6 animate-fade-in group">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">ข้อมูลผู้ใช้งาน</h1>
                    <p className="text-slate-500 font-medium">จัดการข้อมูลส่วนบุคคลและการตั้งค่าบัญชีของคุณ</p>
                </div>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2"
                        >
                            <Icons.Edit className="w-5 h-5" />
                            แก้ไขโปรไฟล์
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => { initForm(user); setIsEditing(false); setMessage(""); }}
                                className="btn btn-outline border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-8 py-3.5 rounded-2xl font-black"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving || !hasChanges}
                                className="btn btn-primary text-white px-8 py-3.5 rounded-2xl font-black disabled:opacity-50"
                            >
                                {isSaving ? "กกำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {message && (
                <div className={`mb-10 p-5 rounded-3xl border animate-head-shake flex items-center gap-3 font-bold text-sm ${message.includes('เรียบร้อย') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: User Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card bg-base-100 shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden group/card">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary to-emerald-600 opacity-10"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-elevated mx-auto mb-6 flex items-center justify-center border-4 border-white">
                                <IconUser className="w-12 h-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight">
                                {firstName || lastName ? `${firstName} ${lastName}` : companyName || 'ยังไม่ระบุชื่อ'}
                            </h2>
                            <p className="text-sm font-black text-primary uppercase tracking-widest mt-2">{getAccountTypeThai()}</p>

                            <div className="mt-8 flex flex-col gap-2">
                                <div className={`py-2 px-4 rounded-full text-xs font-black uppercase tracking-widest ${user.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {user.verificationStatus === 'APPROVED' ? 'Verified Account' : 'Pending Verification'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-lg border border-slate-100 p-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                            <Icons.Info className="w-4 h-4" />
                            ข้อมูลการใช้งาน
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Registered On</p>
                                <p className="text-sm font-bold text-slate-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Last Logged In</p>
                                <p className="text-sm font-bold text-slate-700">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "ไม่ระบุ"}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full py-5 rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 font-black flex items-center justify-center gap-2 hover:bg-rose-100 transition-all shadow-soft"
                    >
                        <Icons.Logout className="w-5 h-5 font-black" />
                        ออกจากระบบ
                    </button>
                </div>

                {/* Right: Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card bg-base-100 shadow-xl border border-slate-100 p-10">
                        <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <IconUser className="w-5 h-5" />
                            </div>
                            รายละเอียดข้อมูลส่วนบุคคล
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">ชื่อ</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">นามสกุล</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">อีเมล</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">เบอร์โทรศัพท์</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">เลขประจำตัว (ชื่อผู้ใช้งาน)</label>
                                <div className="py-4 px-6 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-400 font-mono text-lg tracking-wider">
                                    {user.identifier || "-"}
                                </div>
                            </div>
                            {(companyName || user.accountType !== 'INDIVIDUAL') && (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">ชื่อองค์กร/บริษัท</label>
                                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isEditing} className={inputClass} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-lg border border-slate-100 p-10">
                        <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <IconLock className="w-5 h-5" />
                            </div>
                            ความปลอดภัยของบัญชี
                        </h3>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-soft flex items-center justify-center">
                                    <Icons.Key className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-700">รหัสผ่านสำหรับเข้าสู่ระบบ</p>
                                    <p className="text-xs font-bold text-slate-400">อัปเดตรหัสผ่านล่าสุดเมื่อ 3 เดือนที่ผ่านมา</p>
                                </div>
                            </div>
                            <button
                                onClick={() => alert("ระบบเปลี่ยนรหัสผ่านกำลังจะเปิดให้บริการเร็วๆ นี้")}
                                className="btn btn-outline border-slate-200 bg-white text-slate-600 hover:bg-slate-50 px-6 py-2.5 rounded-xl font-black text-sm"
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
