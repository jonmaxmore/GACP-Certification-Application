'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';
import { useAuth } from '@/lib/services/auth-provider';
import { InlineDocumentUpload } from '@/components/InlineDocumentUpload';
import { FormLabelWithHint } from '@/components/FormHint';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Icons } from '@/components/ui/icons';

// Local Icons to avoid build crash
const CheckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const PersonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const BuildingIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
    </svg>
);

const GroupIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

// Local interface definition to prevent import mismatches
interface LocalApplicantData {
    applicantType: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY';
    firstName?: string;
    lastName?: string;
    idCard?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
    communityName?: string;
    communityAddress?: string;
    communityRegDate?: string;
    presidentName?: string;
    presidentIdCard?: string;
    presidentPhone?: string;
    memberCount?: number;
    registrationSVC01?: string;
    registrationTVC3?: string;
    houseRegistrationCode?: string;
    registeredAddress?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyType?: string;
    taxId?: string;
    registeredCapital?: string;
    directorName?: string;
    directorIdCard?: string;
    directorPhone?: string;
    directorEmail?: string;
    directorPosition?: string;
    registrationNumber?: string;
    powerOfAttorneyUrl?: string;
    coordinatorName?: string;
    coordinatorPhone?: string;
    coordinatorLineId?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    idCardDoc?: string;
    houseRegDoc?: string;
    communityRegDoc?: string;
    communityMeetingDoc?: string;
    companyRegDoc?: string;
    directorListDoc?: string;
    contact?: string;
}

const StepGeneralComponent = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { state, setApplicantData } = useWizardStore();
    const { dict } = useLanguage();

    const [formData, setFormData] = useState<Partial<LocalApplicantData>>(() => {
        const existingData = state.applicantData as unknown as LocalApplicantData | null;
        if (existingData?.applicantType) return existingData;

        return {
            applicantType: 'INDIVIDUAL',
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            idCard: user?.idCard ?? '',
            phone: user?.phone ?? '',
            address: user?.address ?? '',
            email: user?.email ?? '',
        };
    });

    const [idCardDoc, setIdCardDoc] = useState<string | null>(null);
    const [houseRegDoc, setHouseRegDoc] = useState<string | null>(null);
    const [communityRegDoc, setCommunityRegDoc] = useState<string | null>(null);
    const [communityMeetingDoc, setCommunityMeetingDoc] = useState<string | null>(null);
    const [companyRegDoc, setCompanyRegDoc] = useState<string | null>(null);
    const [directorListDoc, setDirectorListDoc] = useState<string | null>(null);

    useEffect(() => {
        // Hydrate docs from state if available
        const existing = state.applicantData as unknown as LocalApplicantData | null;
        if (existing) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIdCardDoc(existing.idCardDoc || null);
            setHouseRegDoc(existing.houseRegDoc || null);
            setCommunityRegDoc(existing.communityRegDoc || null);
            setCommunityMeetingDoc(existing.communityMeetingDoc || null);
            setCompanyRegDoc(existing.companyRegDoc || null);
            setDirectorListDoc(existing.directorListDoc || null);
        }
    }, [state.applicantData]);

    useEffect(() => {
        if (user && !formData.firstName) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || prev.firstName,
                lastName: user.lastName || prev.lastName,
                idCard: user.idCard || prev.idCard,
                phone: user.phone || prev.phone,
                address: user.address || prev.address,
                email: user.email || prev.email,
            }));
        }
    }, [user]); // Removed formData.firstName to prevent cyclic dependency

    const handleTypeChange = (typeId: string) => {
        setFormData(prev => ({
            ...prev,
            applicantType: typeId as any
        }));
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        const completeData: LocalApplicantData = {
            ...formData as LocalApplicantData,
            idCardDoc: idCardDoc || undefined,
            houseRegDoc: houseRegDoc || undefined,
            communityRegDoc: communityRegDoc || undefined,
            communityMeetingDoc: communityMeetingDoc || undefined,
            companyRegDoc: companyRegDoc || undefined,
            directorListDoc: directorListDoc || undefined,
        };

        setApplicantData(completeData as any);
        router.push('/farmer/applications/new?step=2');
    };

    const renderInput = (id: string, label: string, value?: string, required = false, placeholder = '') => (
        <div className="space-y-2">
            <FormLabelWithHint label={label} required={required} />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => handleChange(id, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );

    const isUserType = user && (user as any).applicantType;

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    2
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.general.title}</h2>
                    <p className="text-text-secondary">{dict.wizard.general.subtitle}</p>
                </div>
            </div>

            <section className="gacp-card p-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        1
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{dict.wizard.general.typeHeader || 'เลือกประเภทผู้ยื่นคำขอ'}</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* INDIVIDUAL BUTTON */}
                    <button
                        onClick={() => !(isUserType && isUserType !== 'INDIVIDUAL') && handleTypeChange('INDIVIDUAL')}
                        disabled={!!(isUserType && isUserType !== 'INDIVIDUAL')}
                        className={`
                            relative p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 group
                            ${formData.applicantType === 'INDIVIDUAL'
                                ? 'border-primary-500 bg-primary-50/50 shadow-md ring-4 ring-primary-500/10'
                                : isUserType && isUserType !== 'INDIVIDUAL'
                                    ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                    : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-lg hover:-translate-y-1'
                            }
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300
                            ${formData.applicantType === 'INDIVIDUAL' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'}
                        `}>
                            <PersonIcon className="w-7 h-7" />
                        </div>
                        <h4 className={`font-bold text-lg mb-1 ${formData.applicantType === 'INDIVIDUAL' ? 'text-primary-900' : 'text-slate-700'}`}>
                            บุคคลธรรมดา
                        </h4>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Individual</p>
                        {formData.applicantType === 'INDIVIDUAL' && (
                            <div className="absolute top-4 right-4 text-primary animate-scale-in">
                                <CheckIcon className="w-6 h-6" />
                            </div>
                        )}
                    </button>

                    {/* COMMUNITY BUTTON */}
                    <button
                        onClick={() => !(isUserType && isUserType !== 'COMMUNITY') && handleTypeChange('COMMUNITY')}
                        disabled={!!(isUserType && isUserType !== 'COMMUNITY')}
                        className={`
                            relative p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 group
                            ${formData.applicantType === 'COMMUNITY'
                                ? 'border-primary-500 bg-primary-50/50 shadow-md ring-4 ring-primary-500/10'
                                : isUserType && isUserType !== 'COMMUNITY'
                                    ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                    : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-lg hover:-translate-y-1'
                            }
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300
                            ${formData.applicantType === 'COMMUNITY' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'}
                        `}>
                            <GroupIcon className="w-7 h-7" />
                        </div>
                        <h4 className={`font-bold text-lg mb-1 ${formData.applicantType === 'COMMUNITY' ? 'text-primary-900' : 'text-slate-700'}`}>
                            วิสาหกิจชุมชน
                        </h4>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Community Enterprise</p>
                        {formData.applicantType === 'COMMUNITY' && (
                            <div className="absolute top-4 right-4 text-primary animate-scale-in">
                                <CheckIcon className="w-6 h-6" />
                            </div>
                        )}
                    </button>

                    {/* JURISTIC BUTTON */}
                    <button
                        onClick={() => !(isUserType && isUserType !== 'JURISTIC') && handleTypeChange('JURISTIC')}
                        disabled={!!(isUserType && isUserType !== 'JURISTIC')}
                        className={`
                            relative p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 group
                            ${formData.applicantType === 'JURISTIC'
                                ? 'border-primary-500 bg-primary-50/50 shadow-md ring-4 ring-primary-500/10'
                                : isUserType && isUserType !== 'JURISTIC'
                                    ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                    : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-lg hover:-translate-y-1'
                            }
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300
                            ${formData.applicantType === 'JURISTIC' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'}
                        `}>
                            <BuildingIcon className="w-7 h-7" />
                        </div>
                        <h4 className={`font-bold text-lg mb-1 ${formData.applicantType === 'JURISTIC' ? 'text-primary-900' : 'text-slate-700'}`}>
                            นิติบุคคล
                        </h4>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Juristic Person</p>
                        {formData.applicantType === 'JURISTIC' && (
                            <div className="absolute top-4 right-4 text-primary animate-scale-in">
                                <CheckIcon className="w-6 h-6" />
                            </div>
                        )}
                    </button>
                </div>
            </section>

            <section className="gacp-card p-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        2
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{dict.wizard.general.infoHeader || 'ข้อมูลผู้สมัคร'}</h3>
                </div>

                {formData.applicantType === 'INDIVIDUAL' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {renderInput('firstName', 'ชื่อ', formData.firstName, true)}
                        {renderInput('lastName', 'นามสกุล', formData.lastName, true)}
                        {renderInput('idCard', 'เลขบัตรประชาชน', formData.idCard, true)}
                        {renderInput('phone', 'เบอร์โทรศัพท์', formData.phone, true)}
                        <div className="md:col-span-2">
                            {renderInput('address', 'ที่อยู่ตามทะเบียนบ้าน', formData.address, true)}
                        </div>
                        <div className="md:col-span-2 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 mt-4">
                            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                                <Icons.FileText className="w-5 h-5 text-primary" />
                                เอกสารยืนยันตัวตน
                            </h4>
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

                {formData.applicantType === 'COMMUNITY' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <FormLabelWithHint label="ชื่อวิสาหกิจชุมชน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                placeholder="วิสาหกิจชุมชนกลุ่มผู้ปลูกสมุนไพร..."
                                value={formData.communityName || ''}
                                onChange={(e) => handleChange('communityName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <FormLabelWithHint label="รหัสทะเบียน ทว.ช.3" required />
                            <input
                                type="text"
                                className="gacp-input font-mono"
                                placeholder="00-00-00-00-00"
                                value={formData.registrationSVC01 || ''}
                                onChange={(e) => handleChange('registrationSVC01', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <FormLabelWithHint label="ชื่อ-นามสกุล ประธาน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                value={formData.presidentName || ''}
                                onChange={(e) => handleChange('presidentName', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <FormLabelWithHint label="ที่อยู่วิสาหกิจชุมชน" required />
                            <textarea
                                className="gacp-input min-h-[120px] resize-none py-4"
                                placeholder="ที่ตั้งวิสาหกิจ..."
                                value={formData.communityAddress || ''}
                                onChange={(e) => handleChange('communityAddress', e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 mt-4">
                            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                                <Icons.FileText className="w-5 h-5 text-primary" />
                                เอกสารประกอบวิสาหกิจชุมชน
                            </h4>
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

                {formData.applicantType === 'JURISTIC' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <FormLabelWithHint label="ชื่อบริษัท/ห้างหุ้นส่วน" required />
                            <input
                                type="text"
                                className="gacp-input"
                                value={formData.companyName || ''}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <FormLabelWithHint label="เลขทะเบียนนิติบุคคล" required hint="13 หลัก" />
                            <input
                                type="text"
                                className="gacp-input font-mono tracking-widest"
                                value={formData.registrationNumber || ''}
                                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                                maxLength={13}
                            />
                        </div>
                        <div className="space-y-2">
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

                        <div className="md:col-span-2 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 mt-4">
                            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                                <Icons.FileText className="w-5 h-5 text-primary" />
                                เอกสารประกอบนิติบุคคล
                            </h4>
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

            <WizardNavigation
                onNext={handleNext}
                onBack={() => router.push('/farmer/dashboard')}
                isNextDisabled={!formData.firstName || !formData.lastName || !formData.phone}
                nextLabel={dict.wizard.navigation.next}
                backLabel={dict.wizard.navigation.back}
            />
        </div>
    );
};

export const StepGeneral = StepGeneralComponent;
