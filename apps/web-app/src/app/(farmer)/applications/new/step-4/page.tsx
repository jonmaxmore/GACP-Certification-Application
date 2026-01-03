"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData, PLANTS } from '../hooks/useWizardStore';

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', icon: '👤' },
    { id: 'JURISTIC', label: 'นิติบุคคล', icon: '🏢' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', icon: '👥' },
] as const;

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

    const handleChange = (field: keyof ApplicantData, value: string) => { const updated = { ...form, [field]: value }; setForm(updated); setApplicantData(updated); validateField(field, value); };
    const handleNext = () => { if (!isNavigating) { setIsNavigating(true); router.push('/applications/new/step-5'); } };
    const handleBack = () => { setIsNavigating(true); router.push('/applications/new/step-3'); };

    if (!isLoaded) return <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลด...</div>;

    const inputCls = `w-full px-3 py-2.5 rounded-lg border text-sm outline-none font-[Kanit] ${isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900'}`;
    const labelCls = `block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const sectionCls = `rounded-xl p-4 mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`;

    return (
        <div className="font-[Kanit]">
            {/* Header */}
            <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-emerald-500/25">
                    <span className="text-xl">👤</span>
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>ข้อมูลผู้ขอใบรับรอง</h2>
            </div>

            {/* Applicant Type Selection */}
            <div className="mb-4">
                <label className={labelCls}>ประเภทผู้ยื่น<span className="text-red-500 ml-0.5">*</span></label>
                <div className="flex gap-1.5">
                    {APPLICANT_TYPES.map(type => (
                        <button key={type.id} onClick={() => handleChange('applicantType', type.id)}
                            className={`flex-1 py-2.5 px-1.5 rounded-lg text-center transition-all ${form.applicantType === type.id ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : `border ${isDark ? 'border-slate-600' : 'border-slate-200'}`}`}>
                            <div className="text-lg">{type.icon}</div>
                            <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Individual Form */}
            {form.applicantType === 'INDIVIDUAL' && (
                <div className={sectionCls}>
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>👤 ข้อมูลบุคคลธรรมดา</div>
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div><label className={labelCls}>ชื่อ<span className="text-red-500">*</span></label><input type="text" value={form.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} placeholder="ชื่อจริง" className={inputCls} /></div>
                        <div><label className={labelCls}>นามสกุล<span className="text-red-500">*</span></label><input type="text" value={form.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} placeholder="นามสกุล" className={inputCls} /></div>
                    </div>
                    <div className="mb-2.5">
                        <label className={labelCls}>เลขบัตรประชาชน<span className="text-red-500">*</span></label>
                        <input type="text" value={form.idCard || ''} onChange={e => handleChange('idCard', e.target.value.replace(/\D/g, '').slice(0, 13))} placeholder="1234567890123" maxLength={13}
                            className={`${inputCls} border-2 ${fieldErrors.idCard?.includes('ไม่ถูกต้อง') ? 'border-red-500' : (form.idCard?.length === 13 && !fieldErrors.idCard) ? 'border-green-500' : ''}`} />
                        {fieldErrors.idCard && <p className={`text-xs mt-1 ${fieldErrors.idCard.includes('ไม่ถูกต้อง') ? 'text-red-500' : 'text-slate-500'}`}>{fieldErrors.idCard}</p>}
                        {form.idCard?.length === 13 && !fieldErrors.idCard && <p className="text-xs mt-1 text-green-500 flex items-center gap-1">✓ เลขบัตรประชาชนถูกต้อง</p>}
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
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>👥 ข้อมูลวิสาหกิจชุมชน</div>
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
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>🏢 ข้อมูลนิติบุคคล</div>
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
                    <div className={`rounded-lg p-3 mt-3 ${isDark ? 'bg-slate-800' : 'bg-amber-50'}`}>
                        <div className="text-xs font-semibold text-amber-600 mb-2">📄 กรณีมอบอำนาจให้กระทำการแทน</div>
                        <div className="mb-2.5"><label className={labelCls}>หนังสือมอบอำนาจ (PDF)</label>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'}`}>
                                <span className="text-2xl">📎</span>
                                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>คลิกเพื่ออัปโหลด PDF (Max 100MB)</div>
                            </div>
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
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">⚠️ พืชควบคุม: กรุณาเตรียมใบอนุญาตประกอบกิจการ</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2.5">
                <button onClick={handleBack} className={`flex-1 py-3 rounded-lg text-sm font-medium border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-700'}`}>ย้อนกลับ</button>
                <button onClick={handleNext} className="flex-[2] py-3 rounded-lg text-sm font-semibold bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/35">ถัดไป →</button>
            </div>
        </div>
    );
}
