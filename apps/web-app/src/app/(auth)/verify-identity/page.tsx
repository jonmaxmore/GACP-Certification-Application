'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/services/auth-provider';
import { Icons } from '@/components/ui/icons';

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
                router.push('/dashboard');
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

            // Check manual request
            if (isManualRequest) {
                formData.append('forceManual', 'true');
            }

            // Validation (Frontend)
            if (!idCardFile && !companyCertFile) {
                throw new Error('กรุณาอัปโหลดเอกสารยืนยันตัวตน');
            }

            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/identity/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            // Set AI Analysis if available
            if (data.aiAnalysis) {
                setAiResult(data.aiAnalysis);
            }

            // Handling Success (VERIFIED or PENDING manual)
            if (res.ok) {
                setSuccess(true);
                // Optimistic Update
                if (user) {
                    updateUser({
                        ...user,
                        verificationStatus: data.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
                        verificationSubmittedAt: new Date().toISOString()
                    });
                }
                return;
            }

            // Handling Failure (400, 429)
            if (!data.success) {
                // Update States based on Backend response
                if (data.attempts !== undefined) setRetryCount(data.attempts);
                if (data.canManual) setCanManual(true);
                if (data.isLocked) setIsLocked(true);

                throw new Error(data.error || 'การยืนยันตัวตนล้มเหลว');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsSubmitting(false);
            setManualRequest(false); // reset
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

    // View: Pending Review
    if (user?.verificationStatus === 'PENDING' || success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.Clock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">กำลังดำเนินการตรวจสอบ</h2>
                    <p className="text-slate-600 mb-6">
                        เอกสารของคุณถูกส่งเรียบร้อยแล้ว เจ้าหน้าที่กำลังตรวจสอบความถูกต้อง
                        <br />(ใช้เวลา 1-2 วันทำการ)
                    </p>

                    <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                        <p className="text-sm text-slate-500">ส่งเมื่อ:</p>
                        <p className="font-medium text-slate-900">
                            {user?.verificationSubmittedAt
                                ? new Date(user.verificationSubmittedAt).toLocaleString('th-TH')
                                : new Date().toLocaleString('th-TH')}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        ไปที่หน้าแดชบอร์ด
                    </button>
                </div>
            </div>
        );
    }

    // View: Rejected?
    const isRejected = user?.verificationStatus === 'REJECTED';

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900">ยืนยันตัวตน (e-KYC)</h1>
                    <p className="mt-2 text-slate-600">
                        เพื่อความปลอดภัยและความน่าเชื่อถือของใบรับรอง GACP โปรดยืนยันตัวตนก่อนเริ่มใช้งาน
                    </p>
                </div>

                {isRejected && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Icons.Warning className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">การยืนยันตัวตนไม่ผ่าน</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{user?.verificationNote || 'เอกสารไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <form id="verify-form" onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Section 1: Personal Info */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                                <Icons.User className="w-5 h-5 text-emerald-600" />
                                {isJuristic ? 'ข้อมูลนิติบุคคล/กลุ่มวิสาหกิจ' : 'ข้อมูลส่วนบุคคล'}
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                                {isJuristic ? (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            เลขประจำตัวผู้เสียภาษี
                                        </label>
                                        <input
                                            type="text"
                                            value={taxId}
                                            onChange={e => setTaxId(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 py-2.5 px-3 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm border"
                                            placeholder="เช่น 010555..."
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            รหัสหลังบัตรประชาชน (Laser Code)
                                        </label>
                                        <input
                                            type="text"
                                            value={laserCode}
                                            onChange={e => setLaserCode(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 py-2.5 px-3 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm border"
                                            placeholder="เช่น ME0-1234567-89"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-slate-500">รหัสตัวอักษรและตัวเลขด้านหลังบัตร</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Documents */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                                <Icons.Document className="w-5 h-5 text-emerald-600" />
                                เอกสารแนบ
                            </h3>

                            <div className="space-y-6">
                                {/* ID Card Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {isJuristic ? 'สำเนาบัตรประชาชนกรรมการ' : 'รูปถ่ายหน้าบัตรประชาชน'}
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                        <div className="space-y-1 text-center">
                                            <Icons.Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-emerald-500" />
                                            <div className="flex text-sm text-slate-600 justify-center">
                                                <label htmlFor="id-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                                    <span>อัปโหลดรูปภาพ</span>
                                                    <input id="id-upload" name="id-upload" type="file" className="sr-only" onChange={e => handleFileChange(e, 'id')} accept="image/*,.pdf" />
                                                </label>
                                                <p className="pl-1">หรือลากไฟล์มาวาง</p>
                                            </div>
                                            <p className="text-xs text-slate-500">รองรับ PNG, JPG, PDF (ขนาดไม่เกิน 10MB)</p>
                                        </div>
                                        {idCardFile && (
                                            <div className="absolute inset-0 bg-emerald-50 bg-opacity-90 flex items-center justify-center rounded-lg">
                                                <div className="flex items-center text-emerald-700 font-medium">
                                                    <Icons.CheckCircle className="w-5 h-5 mr-2" />
                                                    {idCardFile.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* [NEW] AI Advice Box */}
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                            <span>💡</span> ข้อแนะนำสำหรับระบบ AI Verification (อนุมัติทันที)
                                        </h4>
                                        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                            <li>โปรดใช้ไฟล์ <b>.JPG หรือ .PNG</b> เพื่อให้ AI อ่านข้อมูลได้แม่นยำที่สุด</li>
                                            <li>ถ่ายภาพให้ <b>ชัดเจน เห็นตัวเลขครบถ้วน</b> และไม่มีแสงสะท้อนทับตัวหนังสือ</li>
                                            <li>หากใช้ไฟล์ PDF อาจต้องรอเจ้าหน้าที่ตรวจสอบในภายหลัง (Manual Review)</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Company Cert Upload (Juristic Only) */}
                                {isJuristic && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            หนังสือรับรองบริษัท (อายุไม่เกิน 6 เดือน)
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                            <div className="space-y-1 text-center">
                                                <Icons.Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-emerald-500" />
                                                <div className="flex text-sm text-slate-600 justify-center">
                                                    <label htmlFor="company-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                                                        <span>อัปโหลดเอกสาร</span>
                                                        <input id="company-upload" name="company-upload" type="file" className="sr-only" onChange={e => handleFileChange(e, 'company')} accept="image/*,.pdf" />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-slate-500">รองรับ PNG, JPG, PDF</p>
                                            </div>
                                            {companyCertFile && (
                                                <div className="absolute inset-0 bg-emerald-50 bg-opacity-90 flex items-center justify-center rounded-lg">
                                                    <div className="flex items-center text-emerald-700 font-medium">
                                                        <Icons.CheckCircle className="w-5 h-5 mr-2" />
                                                        {companyCertFile.name}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Analysis Result (Debug Info) */}
                        {(aiResult || ((error && error.includes('AI')))) && !success ? (
                            <div className={`mb-4 p-4 rounded-lg border animate-fadeIn ${aiResult && aiResult.confidence > 80 ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200'}`}>
                                <h4 className={`text-sm font-bold flex items-center gap-2 mb-2 ${aiResult && aiResult.confidence > 80 ? 'text-green-800' : 'text-slate-700'}`}>
                                    <Icons.Search className="w-4 h-4" />
                                    ผลการตรวจสอบโดย AI {aiResult ? `(${aiResult.confidence}%)` : ''}
                                </h4>
                                <div className="text-xs space-y-1 font-mono">
                                    <p className="text-slate-700">{aiResult ? aiResult.message : error}</p>
                                    {aiResult && aiResult.extractedSnippet && (
                                        <p className="text-slate-500 truncate mt-1">Found: "{aiResult.extractedSnippet.substring(0, 50)}..."</p>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                <p className="font-bold flex items-center gap-2">
                                    <Icons.Warning className="w-4 h-4" />
                                    {error}
                                </p>

                                {canManual && !isLocked && (
                                    <div className="mt-3">
                                        <p className="text-xs text-red-500 mb-2">
                                            หากคุณมั่นใจว่ารูปชัดเจนแต่ระบบ AI ขัดข้อง คุณสามารถส่งให้เจ้าหน้าที่ตรวจสอบได้
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setManualRequest(true);
                                                // Trigger submit after state update
                                                setTimeout(() => {
                                                    const form = document.getElementById('verify-form') as HTMLFormElement;
                                                    if (form) form.requestSubmit();
                                                }, 100);
                                            }}
                                            className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors w-full"
                                        >
                                            ส่งให้เจ้าหน้าที่ตรวจสอบ (Manual Review)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4">
                            {!isLocked ? (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-colors"
                                >
                                    {isSubmitting ? 'กำลังส่งข้อมูล...' : (retryCount > 0 ? `ลองใหม่อีกครั้ง (ครั้งที่ ${retryCount + 1})` : 'ยืนยันและส่งตรวจสอบ')}
                                </button>
                            ) : (
                                <button disabled className="w-full bg-slate-300 text-slate-500 py-3 rounded-lg cursor-not-allowed">
                                    ระบบระงับการใช้งานชั่วคราว
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
