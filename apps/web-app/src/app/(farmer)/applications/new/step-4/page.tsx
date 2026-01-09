"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData, PLANTS } from '../hooks/useWizardStore';

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา' },
    { id: 'JURISTIC', label: 'นิติบุคคล' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน' },
] as const;

// Power of Attorney Upload Component with Preview
function PowerOfAttorneyUpload({ isDark }: { isDark: boolean }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        setError(null);

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(f.type)) {
            setError('รองรับเฉพาะไฟล์ PDF, JPG, PNG');
            return;
        }

        // Validate size (10MB max)
        if (f.size > 10 * 1024 * 1024) {
            setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
            return;
        }

        setFile(f);

        // Create preview for images
        if (f.type.startsWith('image/')) {
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
        } else {
            setPreviewUrl('pdf');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleRemove = () => {
        if (previewUrl && previewUrl !== 'pdf') {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        setError(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    if (file && previewUrl) {
        return (
            <div className={`border-2 rounded-xl overflow-hidden ${isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-500 bg-emerald-50'}`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 ${isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-100/50'} border-b`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <div>
                            <p className={`text-sm font-medium truncate max-w-[200px] ${isDark ? 'text-white' : 'text-gray-800'}`}>{file.name}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{formatSize(file.size)}</p>
                        </div>
                    </div>
                    <button onClick={handleRemove} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'} hover:opacity-80`}>
                        ลบ
                    </button>
                </div>
                {/* Preview */}
                <div className="p-4">
                    {previewUrl !== 'pdf' ? (
                        <div className={`relative rounded-lg overflow-hidden border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-contain" />
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span className="text-xs text-white">พร้อมให้ AI ตรวจสอบ</span>
                            </div>
                        </div>
                    ) : (
                        <div className={`flex items-center justify-center h-32 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
                            <div className="text-center">
                                <svg className="mx-auto text-red-500 mb-2" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>PDF Document</p>
                                <p className={`text-xs mt-1 flex items-center justify-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                    พร้อมให้ AI ตรวจสอบ
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${isDragging
                        ? (isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-500 bg-emerald-50')
                        : (isDark ? 'border-slate-600 bg-slate-700 hover:border-emerald-500' : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30')
                    }
                    ${error ? 'border-red-400 bg-red-50' : ''}
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
                    className="hidden"
                />
                <svg className={`mx-auto mb-3 ${isDragging ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-gray-400'}`} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {isDragging ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือก'}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    PDF, JPG, PNG • สูงสุด 10 MB
                </p>
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                </p>
            )}
        </div>
    );
}


export default function Step4Applicant() {
    const router = useRouter();
    const { state, setApplicantData, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<ApplicantData>({
        applicantType: 'INDIVIDUAL', firstName: '', lastName: '', idCard: '', phone: '', email: '', lineId: '',
        address: '', province: '', district: '', subdistrict: '', postalCode: '',
    });

    const isHighControl = PLANTS.find(p => p.id === state.plantId)?.group === 'HIGH_CONTROL';

    const validateThaiId = (id: string): boolean => {
        const digits = id.replace(/-/g, "");
        if (digits.length !== 13 || !/^\d{13}$/.test(digits)) return false;
        let sum = 0;
        for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (13 - i);
        return (11 - (sum % 11)) % 10 === parseInt(digits[12]);
    };

    const validateField = (field: string, value: string) => {
        const errors = { ...fieldErrors };
        if (field === 'idCard' && form.applicantType === 'INDIVIDUAL') {
            if (value.length === 13) { if (!validateThaiId(value)) errors.idCard = 'เลขบัตรประชาชนไม่ถูกต้อง'; else delete errors.idCard; }
            else if (value.length > 0) errors.idCard = `กรอกแล้ว ${value.length}/13 หลัก`; else delete errors.idCard;
        }
        if (field === 'phone') {
            if (value.length > 0 && value.length < 10) errors.phone = `กรอกแล้ว ${value.length}/10 หลัก`;
            else if (value.length === 10 && !/^0[689]\d{8}$/.test(value)) errors.phone = 'เบอร์ต้องขึ้นต้นด้วย 06, 08, 09';
            else delete errors.phone;
        }
        if (field === 'email') { if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'; else delete errors.email; }
        setFieldErrors(errors);
    };

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); if (state.applicantData) setForm(state.applicantData); }, [state.applicantData]);
    useEffect(() => { if (isLoaded && !state.consentedPDPA) router.replace('/applications/new/step-0'); }, [isLoaded, state.consentedPDPA, router]);

    // Auto-fill user profile data on first load
    useEffect(() => {
        const fetchUserProfile = async () => {
            // Skip if already has data
            if (state.applicantData?.firstName || state.applicantData?.companyName || state.applicantData?.communityName) return;

            try {
                const response = await fetch('/api/auth-farmer/me', { credentials: 'include' });
                if (!response.ok) return;

                const data = await response.json();
                if (!data.success || !data.data?.user) return;

                const user = data.data.user;
                const updatedForm: ApplicantData = { ...form };

                if (user.accountType === 'INDIVIDUAL') {
                    updatedForm.applicantType = 'INDIVIDUAL';
                    updatedForm.firstName = user.firstName || '';
                    updatedForm.lastName = user.lastName || '';
                    updatedForm.phone = user.phoneNumber || '';
                    updatedForm.email = user.email || '';
                } else if (user.accountType === 'JURISTIC') {
                    updatedForm.applicantType = 'JURISTIC';
                    updatedForm.companyName = user.companyName || '';
                    updatedForm.directorName = user.representativeName || '';
                    updatedForm.companyPhone = user.phoneNumber || '';
                    updatedForm.directorPhone = user.phoneNumber || '';
                    updatedForm.directorEmail = user.email || '';
                } else if (user.accountType === 'COMMUNITY_ENTERPRISE') {
                    updatedForm.applicantType = 'COMMUNITY';
                    updatedForm.communityName = user.communityName || '';
                    updatedForm.presidentName = user.representativeName || '';
                    updatedForm.phone = user.phoneNumber || '';
                    updatedForm.email = user.email || '';
                }

                setForm(updatedForm);
                setApplicantData(updatedForm);
            } catch (error) {
                console.error('[Step4] Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    const handleChange = (field: keyof ApplicantData, value: string) => { const updated = { ...form, [field]: value }; setForm(updated); setApplicantData(updated); validateField(field, value); };
    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); router.push('/applications/new/step-5'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-3'); };

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-500'}`;
    const labelCls = `block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;
    const sectionCls = `rounded-2xl p-5 mb-5 border-2 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">ข้อมูลผู้ขอใบรับรอง</h1>
                <p className="text-gray-600">กรอกข้อมูลผู้ยื่นคำขอ</p>
            </div>

            {/* Applicant Type Selection */}
            <div className="mb-4">
                <label className={labelCls}>ประเภทผู้ยื่น<span className="text-red-500 ml-0.5">*</span></label>
                <div className="flex gap-1.5">
                    {APPLICANT_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('applicantType', type.id)}
                            className={`flex-1 py-2.5 px-1.5 rounded-lg text-center transition-all ${form.applicantType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Individual Form */}
            {form.applicantType === 'INDIVIDUAL' && (
                <div className={sectionCls}>
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ข้อมูลบุคคลธรรมดา</div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>ชื่อ<span className="text-red-500">*</span></label><input type="text" value={form.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} placeholder="ชื่อจริง" className={inputCls} /></div>
                        <div><label className={labelCls}>นามสกุล<span className="text-red-500">*</span></label><input type="text" value={form.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} placeholder="นามสกุล" className={inputCls} /></div>
                    </div>
                    <div className="mb-2.5">
                        <label className={labelCls}>เลขบัตรประชาชน<span className="text-red-500">*</span></label>
                        <input type="text" value={form.idCard || ''} onChange={e => handleChange('idCard', e.target.value.replace(/\D/g, '').slice(0, 13))} placeholder="1234567890123" maxLength={13}
                            className={`${inputCls} border-2 ${fieldErrors.idCard?.includes('ไม่ถูกต้อง') ? 'border-red-500' : (form.idCard?.length === 13 && !fieldErrors.idCard) ? 'border-green-500' : ''}`} />
                        {fieldErrors.idCard && <p className={`text-xs mt-1 ${fieldErrors.idCard.includes('ไม่ถูกต้อง') ? 'text-red-500' : 'text-slate-500'}`}>{fieldErrors.idCard}</p>}
                        {form.idCard?.length === 13 && !fieldErrors.idCard && <p className="text-xs mt-1 text-green-500 flex items-center gap-1">เลขบัตรประชาชนถูกต้อง</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div>
                            <label className={labelCls}>โทรศัพท์<span className="text-red-500">*</span></label>
                            <input type="tel" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0812345678" maxLength={10}
                                className={`${inputCls} border-2 ${fieldErrors.phone?.includes('ขึ้นต้น') ? 'border-red-500' : (form.phone?.length === 10 && !fieldErrors.phone) ? 'border-green-500' : ''}`} />
                            {fieldErrors.phone && <p className={`text-xs mt-1 ${fieldErrors.phone.includes('ขึ้นต้น') ? 'text-red-500' : 'text-slate-500'}`}>{fieldErrors.phone}</p>}
                        </div>
                        <div><label className={labelCls}>Line ID<span className="text-red-500">*</span></label><input type="text" value={form.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} placeholder="Line ID" className={inputCls} /></div>
                    </div>
                    <div>
                        <label className={labelCls}>อีเมล<span className="text-red-500">*</span></label>
                        <input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com"
                            className={`${inputCls} ${form.email ? 'border-2' : ''} ${fieldErrors.email ? 'border-red-500' : (form.email && !fieldErrors.email) ? 'border-green-500' : ''}`} />
                        {fieldErrors.email && <p className="text-xs mt-1 text-red-500">{fieldErrors.email}</p>}
                    </div>
                </div>
            )}

            {/* Community Enterprise Form */}
            {form.applicantType === 'COMMUNITY' && (
                <div className={sectionCls}>
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ข้อมูลวิสาหกิจชุมชน</div>
                    <div className="mb-2.5"><label className={labelCls}>ชื่อวิสาหกิจชุมชน<span className="text-red-500">*</span></label><input type="text" value={form.communityName || ''} onChange={e => handleChange('communityName', e.target.value)} placeholder="ชื่อวิสาหกิจชุมชน" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>ชื่อประธาน<span className="text-red-500">*</span></label><input type="text" value={form.presidentName || ''} onChange={e => handleChange('presidentName', e.target.value)} placeholder="ชื่อ-นามสกุล ประธาน" className={inputCls} /></div>
                        <div><label className={labelCls}>เลขบัตรประชาชน<span className="text-red-500">*</span></label><input type="text" value={form.presidentIdCard || ''} onChange={e => handleChange('presidentIdCard', e.target.value)} placeholder="13 หลัก" maxLength={13} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>รหัส สวช.01<span className="text-red-500">*</span></label><input type="text" value={form.registrationSVC01 || ''} onChange={e => handleChange('registrationSVC01', e.target.value)} placeholder="รหัสทะเบียน" className={inputCls} /></div>
                        <div><label className={labelCls}>รหัส ท.ว.ช.3<span className="text-red-500">*</span></label><input type="text" value={form.registrationTVC3 || ''} onChange={e => handleChange('registrationTVC3', e.target.value)} placeholder="รหัสทะเบียน" className={inputCls} /></div>
                    </div>
                    <div className="mb-2.5"><label className={labelCls}>เลขรหัสประจำบ้าน<span className="text-red-500">*</span></label><input type="text" value={form.houseRegistrationCode || ''} onChange={e => handleChange('houseRegistrationCode', e.target.value)} placeholder="ตามทะเบียนราษฎร" className={inputCls} /></div>
                    <div className="mb-2.5"><label className={labelCls}>ที่อยู่ตามทะเบียนบ้าน<span className="text-red-500">*</span></label><input type="text" value={form.registeredAddress || ''} onChange={e => handleChange('registeredAddress', e.target.value)} placeholder="บ้านเลขที่ หมู่ ตำบล อำเภอ จังหวัด" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>โทรศัพท์<span className="text-red-500">*</span></label><input type="tel" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} placeholder="08X-XXX-XXXX" className={inputCls} /></div>
                        <div><label className={labelCls}>Line ID<span className="text-red-500">*</span></label><input type="text" value={form.lineId || ''} onChange={e => handleChange('lineId', e.target.value)} placeholder="Line ID" className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>อีเมล<span className="text-red-500">*</span></label><input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" className={inputCls} /></div>
                </div>
            )}

            {/* Juristic Person Form */}
            {form.applicantType === 'JURISTIC' && (
                <div className={sectionCls}>
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ข้อมูลนิติบุคคล</div>
                    <div className="mb-2.5"><label className={labelCls}>ชื่อสถานประกอบการ/บริษัท<span className="text-red-500">*</span></label><input type="text" value={form.companyName || ''} onChange={e => handleChange('companyName', e.target.value)} placeholder="ชื่อบริษัท จำกัด" className={inputCls} /></div>
                    <div className="mb-2.5"><label className={labelCls}>ที่อยู่สถานที่จัดตั้ง<span className="text-red-500">*</span></label><input type="text" value={form.companyAddress || ''} onChange={e => handleChange('companyAddress', e.target.value)} placeholder="ที่อยู่บริษัท" className={inputCls} /></div>
                    <div className="mb-2.5"><label className={labelCls}>โทรศัพท์สถานที่จัดตั้ง<span className="text-red-500">*</span></label><input type="tel" value={form.companyPhone || ''} onChange={e => handleChange('companyPhone', e.target.value)} placeholder="02-XXX-XXXX" className={inputCls} /></div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>ชื่อประธานกรรมการ<span className="text-red-500">*</span></label><input type="text" value={form.directorName || ''} onChange={e => handleChange('directorName', e.target.value)} placeholder="ชื่อ-นามสกุล" className={inputCls} /></div>
                        <div><label className={labelCls}>เลขทะเบียนนิติบุคคล<span className="text-red-500">*</span></label><input type="text" value={form.registrationNumber || ''} onChange={e => handleChange('registrationNumber', e.target.value)} placeholder="เลขผู้เสียภาษี" className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>โทรศัพท์ประธาน<span className="text-red-500">*</span></label><input type="tel" value={form.directorPhone || ''} onChange={e => handleChange('directorPhone', e.target.value)} placeholder="08X-XXX-XXXX" className={inputCls} /></div>
                        <div><label className={labelCls}>อีเมล<span className="text-red-500">*</span></label><input type="email" value={form.directorEmail || ''} onChange={e => handleChange('directorEmail', e.target.value)} placeholder="email@company.com" className={inputCls} /></div>
                    </div>
                    {/* Power of Attorney */}
                    <div className={`rounded-lg p-4 mt-3 ${isDark ? 'bg-slate-800' : 'bg-amber-50'}`}>
                        <div className="text-sm font-semibold text-amber-600 mb-3">กรณีมอบอำนาจให้กระทำการแทน</div>

                        {/* File Upload with Preview */}
                        <div className="mb-4">
                            <label className={`${labelCls} mb-2 block`}>หนังสือมอบอำนาจ (PDF/รูปภาพ)</label>
                            <PowerOfAttorneyUpload isDark={isDark} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div><label className={labelCls}>ชื่อผู้ประสานงาน</label><input type="text" value={form.coordinatorName || ''} onChange={e => handleChange('coordinatorName', e.target.value)} placeholder="ชื่อ-นามสกุล" className={inputCls} /></div>
                            <div><label className={labelCls}>โทรศัพท์ผู้ประสานงาน</label><input type="tel" value={form.coordinatorPhone || ''} onChange={e => handleChange('coordinatorPhone', e.target.value)} placeholder="08X-XXX-XXXX" className={inputCls} /></div>
                        </div>
                        <div><label className={labelCls}>Line ID ผู้ประสานงาน</label><input type="text" value={form.coordinatorLineId || ''} onChange={e => handleChange('coordinatorLineId', e.target.value)} placeholder="Line ID" className={inputCls} /></div>
                    </div>
                </div>
            )}

            {/* High Control Warning */}
            {isHighControl && (
                <div className={`rounded-lg p-2.5 mb-4 border border-amber-500 ${isDark ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">พืชควบคุม: กรุณาเตรียมใบอนุญาตประกอบกิจการ</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    className="flex-[2] py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 transition-all"
                >
                    ถัดไป
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
