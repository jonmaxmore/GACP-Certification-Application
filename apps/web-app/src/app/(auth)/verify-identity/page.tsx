'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/services/auth-provider';
import { Icons, PersonIcon, BuildingIcon, GroupIcon } from '@/components/ui/icons';

export default function VerifyIdentityPage() {
    const { user, isAuthenticated, isLoading, updateUser } = useAuth();
    const router = useRouter();

    // Form State
    const [laserCode, setLaserCode] = useState('');
    const [taxId, setTaxId] = useState('');
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [companyCertFile, setCompanyCertFile] = useState<File | null>(null);

    // Status State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [canManual, setCanManual] = useState(false);
    const [isManualRequest, setManualRequest] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [aiResult, setAiResult] = useState<{ confidence: number; message: string; extractedSnippet: string } | null>(null);

    // Redirect if not logged in OR if already verified
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.verificationStatus === 'APPROVED') {
                router.push('/farmer/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    const isJuristic = user?.role === 'JURISTIC_FARMER' || user?.role === 'ENTREPRENEUR';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'company') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
                return;
            }
            if (type === 'id') setIdCardFile(file);
            else setCompanyCertFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            if (laserCode) formData.append('laserCode', laserCode);
            if (taxId) formData.append('taxId', taxId);
            if (idCardFile) formData.append('idCardImage', idCardFile);
            if (companyCertFile) formData.append('companyCertImage', companyCertFile);

            if (isManualRequest) formData.append('forceManual', 'true');

            if (!idCardFile && !companyCertFile) {
                throw new Error('กรุณาอัปโหลดเอกสารยืนยันตัวตน');
            }

            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/identity/verify`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (data.aiAnalysis) setAiResult(data.aiAnalysis);

            if (res.ok) {
                setSuccess(true);
                if (user) {
                    updateUser({
                        ...user,
                        verificationStatus: data.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
                        verificationSubmittedAt: new Date().toISOString()
                    });
                }
                return;
            }

            if (!data.success) {
                if (data.attempts !== undefined) setRetryCount(data.attempts);
                if (data.canManual) setCanManual(true);
                if (data.isLocked) setIsLocked(true);
                throw new Error(data.error || 'การยืนยันตัวตนล้มเหลว');
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsSubmitting(false);
            setManualRequest(false);
        }
    };

    if (isLoading) return (
        <div className="auth-card flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Security Context...</p>
        </div>
    );

    // View: Pending Review
    if (user?.verificationStatus === 'PENDING' || success) {
        return (
            <div className="auth-card animate-scale-in text-center">
                <div className="relative mb-10 inline-block">
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center relative z-10 shadow-premium">
                        <Icons.Clock className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">กำลังรอการตรวจสอบ</h2>
                <p className="text-slate-500 font-medium mb-10">ระบบได้รับเอกสารของท่านแล้ว และกำลังอยู่ในระหว่างการยืนยันความถูกต้อง</p>

                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-left mb-10 shadow-inner">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submission Date</span>
                            <span className="text-sm font-black text-slate-700">
                                {new Date(user?.verificationSubmittedAt || new Date()).toLocaleDateString('th-TH', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estimate Time</span>
                            <span className="text-sm font-black text-primary">1-2 วันทำการ</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 mb-10 text-left flex gap-4">
                    <Icons.Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm font-bold text-primary/80 leading-relaxed">
                        ระหว่างรอการตรวจสอบ ท่านยังสามารถสำรวจเมนูต่างๆ และเตรียมข้อมูลเบื้องต้นสำหรับเริ่มขอรับรองมาตรฐานได้
                    </p>
                </div>

                <button
                    onClick={() => router.push('/farmer/dashboard')}
                    className="gacp-btn-primary w-full py-5 rounded-2.5xl text-lg font-black"
                >
                    เข้าสู่หน้าแดชบอร์ด
                    <Icons.ArrowRight className="w-6 h-6 ml-2" />
                </button>
            </div>
        );
    }

    const isRejected = user?.verificationStatus === 'REJECTED';

    return (
        <div className="auth-card animate-slide-up max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 leading-tight">ยืนยันตัวตน (e-KYC)</h2>
                <p className="text-slate-500 font-medium mt-2">เพื่อความปลอดภัยและมาตรฐาน GACP โปรดยืนยันตัวตนเพื่อเริ่มใช้งานระบบอย่างเต็มรูปแบบ</p>
            </div>

            {isRejected && (
                <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 animate-head-shake">
                    <div className="flex gap-4">
                        <Icons.Warning className="w-6 h-6 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-black uppercase tracking-wider text-sm mb-1">การยืนยันตัวตนไม่ผ่าน</h4>
                            <p className="text-sm font-bold opacity-80">{user?.verificationNote || 'เอกสารไม่ชัดเจนหรือไม่ถูกต้อง กรุณาอัปโหลดเอกสารใหม่อีกครั้ง'}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 pb-4">
                {/* Section 1: Data */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            {isJuristic ? <BuildingIcon className="w-5 h-5" /> : <PersonIcon className="w-5 h-5" />}
                        </div>
                        <h3 className="text-lg font-black text-slate-700 tracking-tight">{isJuristic ? 'ข้อมูลนิติบุคคล' : 'ข้อมูลรหัสหลังบัตร'}</h3>
                    </div>

                    {isJuristic ? (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">เลขประจำตัวผู้เสียภาษี</label>
                            <input
                                type="text"
                                value={taxId}
                                onChange={e => setTaxId(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-all font-mono"
                                placeholder="01055XXXXXXXX"
                                required
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Laser Code (รหัสหลังบัตร)</label>
                            <input
                                type="text"
                                value={laserCode}
                                onChange={e => setLaserCode(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-all font-mono uppercase tracking-widest"
                                placeholder="ME0-1234567-89"
                                required
                            />
                        </div>
                    )}
                </div>

                {/* Section 2: Uploads */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Icons.Document className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700 tracking-tight">อัปโหลดเอกสาร</h3>
                    </div>

                    <div className="grid gap-4">
                        {/* File Area */}
                        <label className={`
                            relative h-44 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                            ${idCardFile ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-100'}
                         `}>
                            {idCardFile ? (
                                <div className="text-center animate-scale-in p-4">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                                        <Icons.CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-sm font-black text-primary truncate max-w-[200px]">{idCardFile.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">ไฟล์ได้รับการเลือกแล้ว คลิกเพื่อเปลี่ยน</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Icons.Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-black text-slate-500">{isJuristic ? 'สำเนาบัตรประชาชนกรรมการ' : 'รูปถ่ายหน้าบัตรประชาชน'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Supports JPG, PNG (Max 10MB)</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={e => handleFileChange(e, 'id')} accept="image/*,.pdf" />
                        </label>

                        {isJuristic && (
                            <label className={`
                                relative h-44 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                                ${companyCertFile ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-slate-100'}
                             `}>
                                {companyCertFile ? (
                                    <div className="text-center animate-scale-in p-4">
                                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                                            <Icons.CheckCircle className="w-8 h-8 text-white" />
                                        </div>
                                        <p className="text-sm font-black text-primary truncate max-w-[200px]">{companyCertFile.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">ไฟล์ได้รับการเลือกแล้ว คลิกเพื่อเปลี่ยน</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Icons.Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm font-black text-slate-500">หนังสือรับรองบริษัท</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Registration Document (Max 10MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={e => handleFileChange(e, 'company')} accept="image/*,.pdf" />
                            </label>
                        )}
                    </div>
                </div>

                {/* AI & Errors */}
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex flex-col gap-3">
                        <div className="flex gap-3">
                            <Icons.Warning className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                        {canManual && !isLocked && (
                            <button
                                type="button"
                                onClick={() => {
                                    setManualRequest(true);
                                    setTimeout(() => {
                                        const form = document.getElementById('verify-form') as HTMLFormElement;
                                        if (form) form.requestSubmit();
                                    }, 100);
                                }}
                                className="w-full py-3 bg-white border border-rose-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                            >
                                ส่งให้เจ้าหน้าที่ตรวจสอบ (Manual Review)
                            </button>
                        )}
                    </div>
                )}

                {aiResult && !success && (
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl animate-fade-in">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                            <Icons.Search className="w-4 h-4" />
                            AI Analysis Engine
                        </h4>
                        <p className="text-sm font-bold text-indigo-700 leading-snug">{aiResult.message}</p>
                    </div>
                )}

                <div className="pt-4">
                    {isLocked ? (
                        <div className="w-full bg-slate-100 border border-slate-200 text-slate-400 py-5 rounded-3xl text-center font-black uppercase tracking-widest text-sm">
                            Account Temporarily Locked
                        </div>
                    ) : (
                        <button
                            type="submit"
                            id="verify-form-btn"
                            disabled={isSubmitting}
                            className="w-full gacp-btn-primary py-5 rounded-3xl text-lg font-black tracking-tight"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    ยืนยันและส่งตรวจสอบ
                                    <Icons.ArrowRight className="w-6 h-6 ml-2" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
