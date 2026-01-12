'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData } from '../hooks/useWizardStore';
import { useAuth } from '@/lib/services/auth-provider';
import { InlineDocumentUpload } from '@/components/InlineDocumentUpload';
import { FormLabelWithHint } from '@/components/FormHint';

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', labelEN: 'Individual', icon: '👤' },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', labelEN: 'Community Enterprise', icon: '👥' },
    { id: 'JURISTIC', label: 'นิติบุคคล', labelEN: 'Juristic Person', icon: '🏢' },
];

export const StepGeneral = () => {
    const router = useRouter();
    const { user } = useAuth(); // Get user data from registration
    const { state, setApplicantData, updateState } = useWizardStore();

    // Local form state - pre-fill from user auth context if available
    const [formData, setFormData] = useState<Partial<ApplicantData>>(() => {
        // If we have existing state, use it
        if (state.applicantData?.applicantType) {
            return state.applicantData;
        }
        // Otherwise, pre-fill from user registration data (cast to any for flexible user object)
        const u = user as Record<string, string | undefined> | null;
        return {
            applicantType: 'INDIVIDUAL' as const,
            // Pre-fill from user registration
            firstName: u?.firstName ?? '',
            lastName: u?.lastName ?? '',
            idCard: u?.idCard ?? '',
            phone: u?.phone ?? '',
            address: u?.address ?? '',
            email: u?.email ?? '',
        };
    });

    // Document states - Individual
    const [idCardDoc, setIdCardDoc] = useState<string | null>(null);
    const [houseRegDoc, setHouseRegDoc] = useState<string | null>(null);

    // Document states - Community Enterprise
    const [communityRegDoc, setCommunityRegDoc] = useState<string | null>(null); // ทว.ช.3
    const [communityMeetingDoc, setCommunityMeetingDoc] = useState<string | null>(null);
    const [presidentIdCardDoc, setPresidentIdCardDoc] = useState<string | null>(null);

    // Document states - Juristic Person
    const [companyRegDoc, setCompanyRegDoc] = useState<string | null>(null); // หนังสือรับรองบริษัท
    const [directorListDoc, setDirectorListDoc] = useState<string | null>(null); // บอจ.3
    const [mou20Doc, setMou20Doc] = useState<string | null>(null); // หนังสือมอบอำนาจ
    const [directorIdCardDoc, setDirectorIdCardDoc] = useState<string | null>(null);
    const [vatRegDoc, setVatRegDoc] = useState<string | null>(null); // ภพ.20

    // Re-populate from user auth on mount
    useEffect(() => {
        const u = user as Record<string, string | undefined> | null;
        if (u && !state.applicantData?.firstName) {
            setFormData(prev => ({
                ...prev,
                firstName: u.firstName ?? prev.firstName,
                lastName: u.lastName ?? prev.lastName,
                idCard: u.idCard ?? prev.idCard,
                phone: u.phone ?? prev.phone,
                address: u.address ?? prev.address,
                email: u.email ?? prev.email,
            }));
        }
    }, [user, state.applicantData]);

    const handleChange = (field: keyof ApplicantData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Sync to store
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (formData.applicantType) {
                setApplicantData(formData as ApplicantData);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setApplicantData]);

    // Form validation
    const isReady = formData.applicantType && (
        formData.applicantType === 'INDIVIDUAL'
            ? formData.firstName && formData.lastName && formData.idCard && formData.phone
            : formData.applicantType === 'COMMUNITY'
                ? formData.communityName && formData.registrationSVC01 && formData.presidentName && formData.presidentIdCard
                : formData.companyName && formData.registrationNumber && formData.directorName && formData.directorIdCard
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    ข้อมูลผู้ขอรับรอง
                </h2>
                <p className="text-gray-500 mt-2">ระบุข้อมูลผู้ยื่นคำขอและอัปโหลดเอกสารประกอบ</p>
            </div>

            {/* Pre-fill Info Banner */}
            {user?.firstName && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-blue-500 text-xl">ℹ️</span>
                    <div>
                        <p className="text-sm text-blue-800 font-medium">ข้อมูลถูกดึงจากการลงทะเบียน</p>
                        <p className="text-xs text-blue-600 mt-1">
                            ระบบดึงข้อมูลจากบัญชีผู้ใช้: {user.firstName} {user.lastName} - กรุณาตรวจสอบและแก้ไขหากจำเป็น
                        </p>
                    </div>
                </div>
            )}

            {/* Applicant Type Selection */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">ประเภทผู้ขอ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {APPLICANT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => handleChange('applicantType', type.id)}
                            className={`
                                p-4 rounded-xl border-2 text-left transition-all
                                ${formData.applicantType === type.id
                                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                    : 'border-slate-200 hover:border-emerald-300'
                                }
                            `}
                        >
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="font-semibold text-slate-800">{type.label}</div>
                            <div className="text-xs text-slate-500">{type.labelEN}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ================================ */}
            {/* Individual Form */}
            {/* ================================ */}
            {formData.applicantType === 'INDIVIDUAL' && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        👤 ข้อมูลบุคคลธรรมดา
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint
                                label="ชื่อ"
                                hint="ชื่อตามบัตรประชาชน"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="สมชาย"
                                value={formData.firstName || ''}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="นามสกุล"
                                hint="นามสกุลตามบัตรประชาชน"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="ใจดี"
                                value={formData.lastName || ''}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint
                                label="เลขบัตรประชาชน"
                                hint="เลข 13 หลัก ใช้สำหรับตรวจประวัติ"
                                hintExample="1-2345-67890-12-3"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                placeholder="1-2345-67890-12-3"
                                value={formData.idCard || ''}
                                onChange={(e) => handleChange('idCard', e.target.value)}
                                maxLength={17}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="โทรศัพท์"
                                hint="เบอร์ติดต่อหลัก"
                                required
                            />
                            <input
                                type="tel"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="08x-xxx-xxxx"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint
                                label="อีเมล"
                                hint="สำหรับรับเอกสารและการแจ้งเตือน"
                            />
                            <input
                                type="email"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="email@example.com"
                                value={formData.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="Line ID"
                                hint="สำหรับติดต่อประสานงาน"
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="@lineid หรือ 08xxxxxxxx"
                                value={formData.lineId || ''}
                                onChange={(e) => handleChange('lineId', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabelWithHint
                            label="ที่อยู่ตามบัตรประชาชน"
                            hint="ที่อยู่ที่จะใช้ในใบรับรอง"
                            required
                        />
                        <textarea
                            className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none h-20 resize-none"
                            placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>

                    {/* Inline Document Uploads */}
                    <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-slate-700">📎 เอกสารประกอบ (อัปโหลดในขั้นตอนนี้)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InlineDocumentUpload
                                id="id-card"
                                label="สำเนาบัตรประชาชน"
                                labelEn="ID Card Copy"
                                required={true}
                                hint="ถ่ายสำเนาหน้า-หลัง หรือสแกนเป็น PDF"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={idCardDoc || undefined}
                                onChange={(file, url) => setIdCardDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="house-reg"
                                label="สำเนาทะเบียนบ้าน"
                                labelEn="House Registration"
                                required={true}
                                hint="หน้าที่มีชื่อผู้ยื่นคำขอ"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={houseRegDoc || undefined}
                                onChange={(file, url) => setHouseRegDoc(url)}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ================================ */}
            {/* Community Enterprise Form */}
            {/* ================================ */}
            {formData.applicantType === 'COMMUNITY' && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        👥 ข้อมูลวิสาหกิจชุมชน
                    </h3>

                    {/* Community Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormLabelWithHint
                                label="ชื่อวิสาหกิจชุมชน"
                                hint="ชื่อตามทะเบียน ทว.ช.3 (กรมส่งเสริมการเกษตร)"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="วิสาหกิจชุมชนกลุ่มผู้ปลูกสมุนไพร..."
                                value={formData.communityName || ''}
                                onChange={(e) => handleChange('communityName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="รหัสทะเบียน ทว.ช.3"
                                hint="รหัสทะเบียนจากกรมส่งเสริมการเกษตร"
                                hintExample="01-12-34-56-78"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                placeholder="01-12-34-56-78"
                                value={formData.registrationSVC01 || ''}
                                onChange={(e) => handleChange('registrationSVC01', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="วันที่จดทะเบียน"
                                hint="วันที่จดทะเบียนตาม ทว.ช.3"
                            />
                            <input
                                type="date"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                value={formData.communityRegDate || ''}
                                onChange={(e) => handleChange('communityRegDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabelWithHint
                            label="ที่อยู่วิสาหกิจชุมชน"
                            hint="ที่ตั้งตามทะเบียน ทว.ช.3"
                            required
                        />
                        <textarea
                            className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none h-20 resize-none"
                            placeholder="บ้านเลขที่, หมู่, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                            value={formData.communityAddress || ''}
                            onChange={(e) => handleChange('communityAddress', e.target.value)}
                        />
                    </div>

                    {/* President Info */}
                    <div className="pt-4 border-t">
                        <h4 className="font-medium text-slate-700 mb-4">👤 ข้อมูลประธานวิสาหกิจชุมชน</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabelWithHint
                                    label="ชื่อ-นามสกุล ประธาน"
                                    hint="ผู้มีอำนาจลงนาม"
                                    required
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="นางสาวสมหญิง ใจดี"
                                    value={formData.presidentName || ''}
                                    onChange={(e) => handleChange('presidentName', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="เลขบัตรประชาชนประธาน"
                                    hint="เลข 13 หลัก ใช้ตรวจประวัติ"
                                    required
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                    placeholder="1-2345-67890-12-3"
                                    value={formData.presidentIdCard || ''}
                                    onChange={(e) => handleChange('presidentIdCard', e.target.value)}
                                    maxLength={17}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="โทรศัพท์ประธาน"
                                    hint="เบอร์ติดต่อหลัก"
                                    required
                                />
                                <input
                                    type="tel"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="08x-xxx-xxxx"
                                    value={formData.presidentPhone || ''}
                                    onChange={(e) => handleChange('presidentPhone', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="จำนวนสมาชิก"
                                    hint="จำนวนสมาชิกตามทะเบียน"
                                />
                                <input
                                    type="number"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="25"
                                    value={formData.memberCount || ''}
                                    onChange={(e) => handleChange('memberCount', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-slate-700">📎 เอกสารประกอบ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InlineDocumentUpload
                                id="community-reg"
                                label="สำเนาทะเบียน ทว.ช.3"
                                labelEn="Community Enterprise Registration"
                                required={true}
                                hint="ใบทะเบียนจากกรมส่งเสริมการเกษตร"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={communityRegDoc || undefined}
                                onChange={(file, url) => setCommunityRegDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="community-meeting"
                                label="รายงานการประชุมมอบหมายอำนาจ"
                                labelEn="Meeting Minutes with Authorization"
                                required={true}
                                hint="ประชุมมอบหมายให้ประธานดำเนินการยื่นขอ GACP"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={communityMeetingDoc || undefined}
                                onChange={(file, url) => setCommunityMeetingDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="president-id-card"
                                label="สำเนาบัตรประชาชนประธาน"
                                labelEn="President ID Card"
                                required={true}
                                hint="บัตรประชาชนประธานวิสาหกิจ"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={presidentIdCardDoc || undefined}
                                onChange={(file, url) => setPresidentIdCardDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="president-house-reg"
                                label="สำเนาทะเบียนบ้านประธาน"
                                labelEn="President House Registration"
                                required={true}
                                hint="ทะเบียนบ้านประธาน"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={houseRegDoc || undefined}
                                onChange={(file, url) => setHouseRegDoc(url)}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ================================ */}
            {/* Juristic Person Form */}
            {/* ================================ */}
            {formData.applicantType === 'JURISTIC' && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        🏢 ข้อมูลนิติบุคคล
                    </h3>

                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormLabelWithHint
                                label="ชื่อบริษัท/ห้างหุ้นส่วน"
                                hint="ตามหนังสือรับรองนิติบุคคล"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="บริษัท สมุนไพรไทย จำกัด"
                                value={formData.companyName || ''}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="เลขทะเบียนนิติบุคคล"
                                hint="เลข 13 หลัก จาก DBD"
                                hintExample="0105564012345"
                                required
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                placeholder="0105564012345"
                                value={formData.registrationNumber || ''}
                                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                                maxLength={13}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="ประเภทนิติบุคคล"
                                hint="รูปแบบการจดทะเบียน"
                                required
                            />
                            <select
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none bg-white"
                                value={formData.companyType || ''}
                                onChange={(e) => handleChange('companyType', e.target.value)}
                            >
                                <option value="">-- เลือกประเภท --</option>
                                <option value="COMPANY_LIMITED">บริษัทจำกัด</option>
                                <option value="PUBLIC_COMPANY_LIMITED">บริษัทมหาชนจำกัด</option>
                                <option value="LIMITED_PARTNERSHIP">ห้างหุ้นส่วนจำกัด</option>
                                <option value="ORDINARY_PARTNERSHIP">ห้างหุ้นส่วนสามัญนิติบุคคล</option>
                                <option value="COOPERATIVE">สหกรณ์</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <FormLabelWithHint
                            label="ที่อยู่จดทะเบียน"
                            hint="ที่อยู่ตามหนังสือรับรองนิติบุคคล"
                            required
                        />
                        <textarea
                            className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none h-20 resize-none"
                            placeholder="เลขที่, อาคาร, ชั้น, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                            value={formData.companyAddress || ''}
                            onChange={(e) => handleChange('companyAddress', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint
                                label="เลขประจำตัวผู้เสียภาษี"
                                hint="TAX ID หรือใช้เลขทะเบียนนิติบุคคล"
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                placeholder="0105564012345"
                                value={formData.taxId || ''}
                                onChange={(e) => handleChange('taxId', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint
                                label="ทุนจดทะเบียน (บาท)"
                                hint="ทุนจดทะเบียนตามหนังสือรับรอง"
                            />
                            <input
                                type="text"
                                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                placeholder="1,000,000"
                                value={formData.registeredCapital || ''}
                                onChange={(e) => handleChange('registeredCapital', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Director Info */}
                    <div className="pt-4 border-t">
                        <h4 className="font-medium text-slate-700 mb-4">👤 ข้อมูลกรรมการผู้มีอำนาจ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabelWithHint
                                    label="ชื่อ-นามสกุล กรรมการ"
                                    hint="ผู้มีอำนาจลงนามตามหนังสือรับรอง"
                                    required
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="นายสมชาย ใจดี"
                                    value={formData.directorName || ''}
                                    onChange={(e) => handleChange('directorName', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="เลขบัตรประชาชนกรรมการ"
                                    hint="เลข 13 หลัก ใช้ตรวจประวัติ"
                                    required
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none font-mono"
                                    placeholder="1-2345-67890-12-3"
                                    value={formData.directorIdCard || ''}
                                    onChange={(e) => handleChange('directorIdCard', e.target.value)}
                                    maxLength={17}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="ตำแหน่ง"
                                    hint="ตำแหน่งในบริษัท"
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="กรรมการผู้จัดการ"
                                    value={formData.directorPosition || ''}
                                    onChange={(e) => handleChange('directorPosition', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="โทรศัพท์กรรมการ"
                                    hint="เบอร์ติดต่อหลัก"
                                    required
                                />
                                <input
                                    type="tel"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="08x-xxx-xxxx"
                                    value={formData.directorPhone || ''}
                                    onChange={(e) => handleChange('directorPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Person */}
                    <div className="pt-4 border-t">
                        <h4 className="font-medium text-slate-700 mb-4">📞 ผู้ประสานงาน (ถ้าต่างจากกรรมการ)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <FormLabelWithHint
                                    label="ชื่อ-นามสกุล"
                                    hint="ผู้ประสานงานหลัก"
                                />
                                <input
                                    type="text"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="นางสาวสมหญิง รักงาน"
                                    value={formData.contactName || ''}
                                    onChange={(e) => handleChange('contactName', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="โทรศัพท์"
                                    hint="เบอร์ติดต่อ"
                                />
                                <input
                                    type="tel"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="08x-xxx-xxxx"
                                    value={formData.contactPhone || ''}
                                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint
                                    label="อีเมล"
                                    hint="อีเมลติดต่อ"
                                />
                                <input
                                    type="email"
                                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none"
                                    placeholder="contact@company.com"
                                    value={formData.contactEmail || ''}
                                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-slate-700">📎 เอกสารประกอบ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InlineDocumentUpload
                                id="company-reg"
                                label="หนังสือรับรองบริษัท (ไม่เกิน 6 เดือน)"
                                labelEn="Company Registration Certificate"
                                required={true}
                                hint="หนังสือรับรองจากกรมพัฒนาธุรกิจการค้า"
                                accept=".pdf"
                                value={companyRegDoc || undefined}
                                onChange={(file, url) => setCompanyRegDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="director-list"
                                label="บัญชีรายชื่อผู้ถือหุ้น (บอจ.5)"
                                labelEn="BOJ.5 Shareholder List"
                                required={true}
                                hint="หรือ บอจ.3 สำหรับห้างหุ้นส่วน"
                                accept=".pdf"
                                value={directorListDoc || undefined}
                                onChange={(file, url) => setDirectorListDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="director-id-card"
                                label="สำเนาบัตรประชาชนกรรมการ"
                                labelEn="Director ID Card"
                                required={true}
                                hint="กรรมการผู้มีอำนาจลงนาม"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={directorIdCardDoc || undefined}
                                onChange={(file, url) => setDirectorIdCardDoc(url)}
                            />
                            <InlineDocumentUpload
                                id="mou-20"
                                label="หนังสือมอบอำนาจ (ถ้ามี)"
                                labelEn="Power of Attorney"
                                hint="กรณีผู้รับมอบอำนาจยื่นแทน"
                                accept=".pdf"
                                value={mou20Doc || undefined}
                                onChange={(file, url) => setMou20Doc(url)}
                            />
                            <InlineDocumentUpload
                                id="vat-reg"
                                label="ใบทะเบียนภาษีมูลค่าเพิ่ม (ภพ.20)"
                                labelEn="VAT Registration"
                                hint="ถ้าจดทะเบียน VAT"
                                accept=".pdf,.jpg,.jpeg,.png"
                                value={vatRegDoc || undefined}
                                onChange={(file, url) => setVatRegDoc(url)}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
                <button
                    onClick={() => router.push('/farmer/applications/new/step/1')}
                    className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    ← ย้อนกลับ
                </button>
                <button
                    onClick={() => router.push('/farmer/applications/new/step/3')}
                    disabled={!isReady}
                    className={`
                        px-8 py-2 rounded-lg font-medium shadow-sm transition-all
                        ${isReady
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป →
                </button>
            </div>
        </div>
    );
};
