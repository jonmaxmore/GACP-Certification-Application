'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, ApplicantData } from '../hooks/useWizardStore';
import { useAuth } from '@/lib/services/auth-provider';
import { InlineDocumentUpload } from '@/components/InlineDocumentUpload';
import { FormLabelWithHint } from '@/components/FormHint';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, InfoIcon } from '@/components/icons/WizardIcons';

// Enhanced SVG Icons for applicant types (Keeping local as they are specific to this step for now)
const IndividualIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CommunityIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const JuristicIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M12 7v14" />
        <line x1="2" y1="13" x2="22" y2="13" />
    </svg>
);

const APPLICANT_TYPES = [
    { id: 'INDIVIDUAL', label: 'บุคคลธรรมดา', labelEN: 'Individual', icon: IndividualIcon },
    { id: 'COMMUNITY', label: 'วิสาหกิจชุมชน', labelEN: 'Community Enterprise', icon: CommunityIcon },
    { id: 'JURISTIC', label: 'นิติบุคคล', labelEN: 'Juristic Person', icon: JuristicIcon },
];

export const StepGeneral = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { state, setApplicantData } = useWizardStore();

    // Local form state
    const [formData, setFormData] = useState<Partial<ApplicantData>>(() => {
        if (state.applicantData?.applicantType) return state.applicantData;
        const u = user;
        return {
            applicantType: 'INDIVIDUAL' as const,
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
    const [communityRegDoc, setCommunityRegDoc] = useState<string | null>(null);
    const [communityMeetingDoc, setCommunityMeetingDoc] = useState<string | null>(null);
    const [presidentIdCardDoc, setPresidentIdCardDoc] = useState<string | null>(null);
    // Document states - Juristic Person
    const [companyRegDoc, setCompanyRegDoc] = useState<string | null>(null);
    const [directorListDoc, setDirectorListDoc] = useState<string | null>(null);

    useEffect(() => {
        if (user && !state.applicantData?.firstName) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName ?? prev.firstName,
                lastName: user.lastName ?? prev.lastName,
                idCard: user.idCard ?? prev.idCard,
                phone: user.phone ?? prev.phone,
                address: user.address ?? prev.address,
                email: user.email ?? prev.email,
            }));
        }
    }, [user, state.applicantData]);

    const handleChange = (field: keyof ApplicantData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-save to store
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (formData.applicantType) {
                setApplicantData(formData as ApplicantData);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setApplicantData]);

    // Validation
    const isReady = formData.applicantType && (
        formData.applicantType === 'INDIVIDUAL'
            ? formData.firstName && formData.lastName && formData.idCard && formData.phone
            : formData.applicantType === 'COMMUNITY'
                ? formData.communityName && formData.registrationSVC01 && formData.presidentName && formData.presidentIdCard
                : formData.companyName && formData.registrationNumber && formData.directorName && formData.directorIdCard
    );

    const handleNext = () => {
        if (isReady) {
            setApplicantData(formData as ApplicantData);
            router.push('/farmer/applications/new/step/3');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">

            {/* Header / Info Banner */}
            {user?.firstName && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
                    <div className="p-2 bg-white rounded-lg text-primary shadow-sm flex-shrink-0">
                        <InfoIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-primary-800 font-bold mb-1">ข้อมูลถูกดึงอัตโนมัติ</p>
                        <p className="text-sm text-primary-700 leading-relaxed">
                            ระบบได้ดึงข้อมูลจากบัญชีของท่าน <span className="font-semibold px-2 py-0.5 bg-white rounded text-primary-900 mx-1 border border-primary-200">{user.firstName} {user.lastName}</span> มาให้อัตโนมัติ กรุณาตรวจสอบความถูกต้องก่อนดำเนินการต่อ
                        </p>
                    </div>
                </div>
            )}

            {/* Section 1: Applicant Type */}
            <section className="gacp-card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        1
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">ประเภทผู้ขอรับรอง</h2>
                        <p className="text-text-secondary text-sm">เลือกประเภทสถานะของผู้ยื่นคำขอ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {APPLICANT_TYPES.map((type) => {
                        const isSelected = formData.applicantType === type.id;
                        const isLocked = user?.applicantType && user.applicantType !== type.id;
                        const Icon = type.icon;

                        return (
                            <button
                                key={type.id}
                                onClick={() => !isLocked && handleChange('applicantType', type.id)}
                                disabled={!!isLocked}
                                className={`
                                    relative p-6 rounded-xl flex flex-col items-center justify-center min-h-[160px] transition-all duration-200 border-2 text-center
                                    ${isLocked
                                        ? 'bg-gray-50 border-gray-100 grayscale opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'bg-primary-50 border-primary shadow-md ring-2 ring-primary/20 scale-105 z-10'
                                            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg hover:-translate-y-1'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <span className="absolute top-3 right-3 text-primary animate-scale-in">
                                        <CheckIcon className="w-5 h-5" />
                                    </span>
                                )}
                                <div className={`mb-4 transition-colors ${isSelected ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                                    <Icon className="w-12 h-12 stroke-[1.5]" />
                                </div>
                                <div className={`font-bold text-base mb-1 ${isSelected ? 'text-primary-800' : 'text-text-main'}`}>
                                    {type.label}
                                </div>
                                <div className="text-xs text-text-muted uppercase font-medium">
                                    {type.labelEN}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 2: Form Details */}
            <section className="gacp-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        2
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">
                            {formData.applicantType === 'INDIVIDUAL' ? 'ข้อมูลบุคคลธรรมดา' :
                                formData.applicantType === 'COMMUNITY' ? 'ข้อมูลวิสาหกิจชุมชน' : 'ข้อมูลนิติบุคคล'}
                        </h2>
                        <p className="text-text-secondary text-sm">กรอกข้อมูลรายละเอียดผู้ขอ</p>
                    </div>
                </div>

                {/* INDIVIDUAL FORM */}
                {formData.applicantType === 'INDIVIDUAL' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint label="ชื่อ" required hint="ไม่ต้องระบุคำนำหน้า" />
                            <input
                                type="text"
                                className="gacp-input"
                                placeholder="สมชาย"
                                value={formData.firstName || ''}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="นามสกุล" required />
                            <input
                                type="text"
                                className="gacp-input"
                                placeholder="ใจดี"
                                value={formData.lastName || ''}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="เลขบัตรประชาชน" required hint="13 หลัก" />
                            <input
                                type="text"
                                className="gacp-input font-mono tracking-wide"
                                placeholder="0-0000-00000-00-0"
                                value={formData.idCard || ''}
                                onChange={(e) => handleChange('idCard', e.target.value)}
                                maxLength={17}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="เบอร์โทรศัพท์" required />
                            <input
                                type="tel"
                                className="gacp-input"
                                placeholder="08x-xxx-xxxx"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <FormLabelWithHint label="ที่อยู่ตามบัตรประชาชน" required />
                            <textarea
                                className="gacp-input min-h-[100px] resize-none"
                                placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล, อำเภอ, จังหวัด..."
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                เอกสารประกอบ (บุคคลธรรมดา)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InlineDocumentUpload
                                    id="id-card"
                                    label="สำเนาบัตรประชาชน"
                                    labelEn="ID Card Copy"
                                    required={true}
                                    value={idCardDoc || undefined}
                                    onChange={(file, url) => setIdCardDoc(url)}
                                />
                                <InlineDocumentUpload
                                    id="house-reg"
                                    label="สำเนาทะเบียนบ้าน"
                                    labelEn="House Registration"
                                    required={true}
                                    value={houseRegDoc || undefined}
                                    onChange={(file, url) => setHouseRegDoc(url)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMUNITY FORM */}
                {formData.applicantType === 'COMMUNITY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormLabelWithHint label="ชื่อวิสาหกิจชุมชน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                placeholder="วิสาหกิจชุมชนกลุ่มผู้ปลูกสมุนไพร..."
                                value={formData.communityName || ''}
                                onChange={(e) => handleChange('communityName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="รหัสทะเบียน ทว.ช.3" required />
                            <input
                                type="text"
                                className="gacp-input font-mono"
                                placeholder="00-00-00-00-00"
                                value={formData.registrationSVC01 || ''}
                                onChange={(e) => handleChange('registrationSVC01', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="ชื่อ-นามสกุล ประธาน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                value={formData.presidentName || ''}
                                onChange={(e) => handleChange('presidentName', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <FormLabelWithHint label="ที่อยู่วิสาหกิจชุมชน" required />
                            <textarea
                                className="gacp-input min-h-[100px] resize-none"
                                placeholder="ที่ตั้งวิสาหกิจ..."
                                value={formData.communityAddress || ''}
                                onChange={(e) => handleChange('communityAddress', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                เอกสารประกอบ (วิสาหกิจชุมชน)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InlineDocumentUpload
                                    id="community-reg"
                                    label="สำเนาทะเบียน ทว.ช.3"
                                    labelEn="Certificate"
                                    required={true}
                                    value={communityRegDoc || undefined}
                                    onChange={(file, url) => setCommunityRegDoc(url)}
                                />
                                <InlineDocumentUpload
                                    id="community-meeting"
                                    label="รายงานการประชุม"
                                    labelEn="Meeting Minutes"
                                    required={true}
                                    value={communityMeetingDoc || undefined}
                                    onChange={(file, url) => setCommunityMeetingDoc(url)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* JURISTIC FORM */}
                {formData.applicantType === 'JURISTIC' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormLabelWithHint label="ชื่อบริษัท/ห้างหุ้นส่วน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                value={formData.companyName || ''}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="เลขทะเบียนนิติบุคคล" required hint="13 หลัก" />
                            <input
                                type="text"
                                className="gacp-input font-mono"
                                value={formData.registrationNumber || ''}
                                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                                maxLength={13}
                            />
                        </div>
                        <div>
                            <FormLabelWithHint label="ประเภทนิติบุคคล" required />
                            <select
                                className="gacp-input"
                                value={formData.companyType || ''}
                                onChange={(e) => handleChange('companyType', e.target.value)}
                            >
                                <option value="">-- เลือกประเภท --</option>
                                <option value="COMPANY_LIMITED">บริษัทจำกัด</option>
                                <option value="PUBLIC_COMPANY_LIMITED">บริษัทมหาชนจำกัด</option>
                                <option value="LIMITED_PARTNERSHIP">ห้างหุ้นส่วนจำกัด</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                            <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                เอกสารประกอบ (นิติบุคคล)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InlineDocumentUpload
                                    id="company-reg"
                                    label="หนังสือรับรองบริษัท"
                                    labelEn="Company Registration"
                                    required={true}
                                    value={companyRegDoc || undefined}
                                    onChange={(file, url) => setCompanyRegDoc(url)}
                                />
                                <InlineDocumentUpload
                                    id="director-list"
                                    label="รายชื่อผู้ถือหุ้น (บอจ.5)"
                                    labelEn="Shareholder List"
                                    required={true}
                                    value={directorListDoc || undefined}
                                    onChange={(file, url) => setDirectorListDoc(url)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Section 3: Personnel & Hygiene (GACP) */}
            <section className="gacp-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        3
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">บุคลากรและสุขอนามัย</h2>
                        <p className="text-text-secondary text-sm">การจัดการด้านบุคลากรตามมาตรฐาน GACP</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {[
                        { id: 'trainingProvided', label: 'มีการอบรมพนักงาน (Training)', desc: 'พนักงานได้รับความรู้เรื่อง GACP และสุขลักษณะส่วนบุคคล' },
                        { id: 'healthCheck', label: 'มีการตรวจสุขภาพประจำปี (Health Check)', desc: 'พนักงานได้รับการตรวจสุขภาพและไม่มีโรคติดต่อร้ายแรง' },
                        { id: 'protectiveGear', label: 'มีชุดป้องกัน/อุปกรณ์ป้องกัน (PPE)', desc: 'สวมใส่ชุดปฏิบัติงานที่เหมาะสม หมวก ถุงมือ รองเท้าบูท' }
                    ].map((item) => {
                        const isChecked = formData.personnelHygiene?.[item.id as keyof typeof formData.personnelHygiene] || false;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    const current = formData.personnelHygiene || { trainingProvided: false, healthCheck: false, protectiveGear: false };
                                    setFormData(prev => ({
                                        ...prev,
                                        personnelHygiene: { ...current, [item.id]: !isChecked }
                                    }));
                                }}
                                className={`
                                    relative p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-4
                                    ${isChecked
                                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                                    {isChecked && <CheckIcon className="w-4 h-4" />}
                                </div>
                                <div>
                                    <span className={`block font-bold text-base ${isChecked ? 'text-emerald-900' : 'text-gray-800'}`}>{item.label}</span>
                                    <span className="text-sm text-gray-500">{item.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <WizardNavigation
                onNext={handleNext}
                onBack={() => router.push('/farmer/applications/new/step/1')}
                isNextDisabled={!isReady}
                showBack={true}
            />
        </div>
    );
};

export default StepGeneral;
