'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { Icons } from '@/components/ui/icons';
import { CheckIcon, InfoIcon, DocIcon, WarningIcon } from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SectionHeaderProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    editStep: number;
    router: ReturnType<typeof useRouter>;
}

const SectionHeader = ({ title, icon, isOpen, onToggle, editStep, router }: SectionHeaderProps) => (
    <div className={`flex flex-col border-b last:border-0 transition-all duration-500 ${isOpen ? 'bg-white' : 'bg-gray-50/30'}`}>
        <div className="flex items-center justify-between p-6">
            <button
                onClick={onToggle}
                className="flex items-center gap-4 group text-left"
            >
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shadow-sm
                    ${isOpen ? 'bg-primary text-white shadow-md scale-100' : 'bg-white border border-gray-100 text-gray-400 scale-95'}
                `}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-black text-gray-900 tracking-tight">{title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {isOpen ? 'Click to collapse' : 'Click to expand'}
                    </p>
                </div>
            </button>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push(`/farmer/applications/new/step/${editStep}`)}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2 group/btn"
                >
                    <Icons.Edit className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Edit</span>
                </button>
                <button
                    onClick={onToggle}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isOpen ? 'bg-primary-50 border-primary-100 text-primary rotate-180' : 'bg-white border-gray-200 text-gray-400 rotate-0'}`}
                >
                    <Icons.ChevronDown className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

interface InfoItemProps {
    label: string;
    value?: string | number | null;
    fullWidth?: boolean;
}

const InfoItem = ({ label, value, fullWidth }: InfoItemProps) => (
    <div className={`space-y-1.5 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-900 bg-gray-50/50 px-3 py-2 rounded-xl border border-gray-100/50">{value || '-'}</p>
    </div>
);

export const StepPreview = () => {
    const { state } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        applicant: true,
        farm: true,
        production: true,
        documents: true,
    });

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Data extraction
    const applicant = state.applicantData;
    const farm = state.farmData;
    const plots = (state as any).siteData?.plots || [];
    const lots = state.lots || [];
    const documents = state.documents || [];

    // Summary calculations
    const totalPlants = lots.reduce((sum, lot) => sum + (Number(lot.plantCount) || 0), 0);
    const totalArea = parseFloat(farm?.totalAreaSize || '0');
    const totalDocs = documents.filter(d => d.uploaded).length;

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                        11
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary-900">ตรวจสอบข้อมูลสรุป (Application Review)</h2>
                        <p className="text-text-secondary">ตรวจสอบความถูกต้องทั้งหมดอีกครั้งก่อนยืนยันส่งคำขอ</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm bg-white hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Icons.Printer className="w-4 h-4" />
                        พิมพ์ PDF
                    </button>
                    <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                    <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-emerald-700 flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-wider">Ready to Submit</span>
                    </div>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <div className="gacp-card bg-white p-6 border-gray-100 flex flex-col items-center justify-center group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{plots.length}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">แปลงปลูก</p>
                </div>
                <div className="gacp-card bg-white p-6 border-gray-100 flex flex-col items-center justify-center group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{totalPlants.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">จำนวนต้นรวม</p>
                </div>
                <div className="gacp-card bg-white p-6 border-gray-100 flex flex-col items-center justify-center group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{totalArea}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">พื้นที่ปลูก (ไร่)</p>
                </div>
                <div className="gacp-card bg-white p-6 border-gray-100 flex flex-col items-center justify-center group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                    <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{totalDocs}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">เอกสารแนบ</p>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="gacp-card border-gray-200 shadow-premium overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>

                {/* 1. Applicant */}
                <SectionHeader
                    title="ข้อมูลผู้ยื่นคำขอ"
                    icon={<Icons.User className="w-6 h-6" />}
                    isOpen={expandedSections.applicant}
                    onToggle={() => toggleSection('applicant')}
                    editStep={2}
                    router={router}
                />
                {expandedSections.applicant && (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-down bg-white">
                        <InfoItem label="ชื่อ-นามสกุล" value={`${applicant?.firstName || ''} ${applicant?.lastName || ''}`} />
                        <InfoItem label="เลขบัตรประชาชน / นิติบุคคล" value={applicant?.idCard} />
                        <InfoItem label="เบอร์โทรศัพท์" value={applicant?.phone} />
                        <InfoItem label="อีเมล" value={applicant?.email} />
                        <InfoItem label="ที่อยู่" fullWidth value={`${applicant?.address || ''} ${applicant?.subdistrict || ''} ${applicant?.district || ''} ${applicant?.province || ''} ${applicant?.postalCode || ''}`} />
                    </div>
                )}

                {/* 2. Farm */}
                <SectionHeader
                    title="ข้อมูลสถานที่และระบบ"
                    icon={<Icons.Home className="w-6 h-6" />}
                    isOpen={expandedSections.farm}
                    onToggle={() => toggleSection('farm')}
                    editStep={3}
                    router={router}
                />
                {expandedSections.farm && (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-down bg-white">
                        <InfoItem label="ชื่อสถานที่ผลิต" value={farm?.farmName} />
                        <InfoItem label="จังหวัด" value={farm?.province} />
                        <InfoItem label="ขนาดพื้นที่รวม" value={`${farm?.totalAreaSize || '0'} ไร่`} />
                        <InfoItem label="กรรมสิทธิ์" value={farm?.landOwnership} />
                        <InfoItem label="แหล่งน้ำ" value={farm?.waterSource} />
                        <InfoItem label="พิกัด GPS" value={`${farm?.gpsLat || '-'}, ${farm?.gpsLng || '-'}`} />
                    </div>
                )}

                {/* 3. Production & Plots */}
                <SectionHeader
                    title="แผนการผลิตและแปลงปลูก"
                    icon={<Icons.Leaf className="w-6 h-6" />}
                    isOpen={expandedSections.production}
                    onToggle={() => toggleSection('production')}
                    editStep={6}
                    router={router}
                />
                {expandedSections.production && (
                    <div className="p-8 space-y-8 animate-slide-down bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InfoItem label="ระบบการเพาะปลูก" value={state.cultivationMethod} />
                            <InfoItem label="วัตถุประสงค์" value={state.certificationPurpose} />
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">รายการล็อตการผลิต ({lots.length})</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lots.map((lot, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex justify-between items-center group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary font-bold shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{lot.lotCode}</p>
                                                <p className="text-[10px] text-gray-400">{lot.plotName || 'Plot'} • {lot.plantCount} ต้น</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-md">ID: {lot.id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Documents */}
                <SectionHeader
                    title="เอกสารประกอบคำขอ"
                    icon={<Icons.FileText className="w-6 h-6" />}
                    isOpen={expandedSections.documents}
                    onToggle={() => toggleSection('documents')}
                    editStep={9}
                    router={router}
                />
                {expandedSections.documents && (
                    <div className="p-8 space-y-6 animate-slide-down bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.filter(d => d.uploaded).map((doc, idx) => (
                                <div key={idx} className="p-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 shadow-sm group hover:shadow-md transition-all">
                                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                                        <CheckIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-xs font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Verified</p>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-primary hover:bg-primary-50 rounded-lg">
                                        <Icons.Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {documents.filter(d => d.uploaded).length === 0 && (
                            <div className="p-12 text-center rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">ไม่พบข้อมูลเอกสารแนบ</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Note Banner */}
            <div className="p-6 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-3xl flex gap-4 text-blue-900 shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                    <InfoIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-blue-900 text-sm">ขั้นตอนต่อไป</p>
                    <p className="text-xs leading-relaxed text-blue-800/80">
                        หลังจากกดยืนยัน ระบบจะนำท่านไปสู่หน้าการลงนามดิจิทัล (E-Signature) เพื่อส่งคำขอเข้าสู่ระบบการตรวจสอบ
                        กรุณาเตรียมบัตรประชาชนหรือรหัส OTP ให้พร้อม
                    </p>
                </div>
            </div>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/12')}
                onBack={() => router.push('/farmer/applications/new/step/10')}
                nextLabel="ไปที่หน้าส่งคำขอ"
            />
        </div>
    );
};

export default StepPreview;
