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
    <div className={`flex flex-col border-b last:border-0 transition-all duration-300 ${isOpen ? 'bg-white' : 'bg-slate-50/50'}`}>
        <div className="flex items-center justify-between p-4">
            <button
                onClick={onToggle}
                className="flex items-center gap-3 group text-left flex-1"
            >
                <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm
                        ${isOpen ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400'}
                    `}>
                    {icon}
                </div>
                <div>
                    <h3 className={`font-bold tracking-tight text-sm ${isOpen ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                        {isOpen ? 'ย่อข้อมูล' : 'แสดงข้อมูล'}
                    </p>
                </div>
            </button>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push(`/farmer/applications/new/step/${editStep}`)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-1.5 group/btn"
                >
                    <Icons.Edit className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">แก้ไข</span>
                </button>
                <button
                    onClick={onToggle}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-50 border-emerald-100 text-emerald-600 rotate-180' : 'bg-white border-slate-200 text-slate-300 rotate-0'}`}
                >
                    <Icons.ChevronDown className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const InfoItem = ({ label, value, fullWidth }: InfoItemProps) => (
    <div className={`space-y-1 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 truncate">{value || '-'}</p>
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
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                        11
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary-900">สรุปข้อมูล (Review)</h2>
                        <p className="text-slate-500 text-sm">ตรวจสอบความถูกต้องทั้งหมดอีกครั้งก่อนยืนยัน</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-700 flex items-center gap-2 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-wider">พร้อมส่งคำขอ</span>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                    <p className="text-2xl font-black text-slate-800">{plots.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">แปลงปลูก</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                    <p className="text-2xl font-black text-slate-800">{totalPlants.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">จำนวนต้น</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                    <p className="text-2xl font-black text-slate-800">{totalArea}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">พื้นที่ (ไร่)</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
                    <p className="text-2xl font-black text-slate-800">{totalDocs}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">เอกสาร</p>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>

                {/* 1. Applicant */}
                <SectionHeader
                    title="ข้อมูลผู้ยื่นคำขอ"
                    icon={<Icons.User className="w-5 h-5" />}
                    isOpen={expandedSections.applicant}
                    onToggle={() => toggleSection('applicant')}
                    editStep={2}
                    router={router}
                />
                {expandedSections.applicant && (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down bg-white border-b border-slate-100">
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
                    icon={<Icons.Home className="w-5 h-5" />}
                    isOpen={expandedSections.farm}
                    onToggle={() => toggleSection('farm')}
                    editStep={3}
                    router={router}
                />
                {expandedSections.farm && (
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down bg-white border-b border-slate-100">
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
                    icon={<Icons.Leaf className="w-5 h-5" />}
                    isOpen={expandedSections.production}
                    onToggle={() => toggleSection('production')}
                    editStep={6}
                    router={router}
                />
                {expandedSections.production && (
                    <div className="p-5 space-y-6 animate-slide-down bg-white border-b border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="ระบบการเพาะปลูก" value={state.cultivationMethod} />
                            <InfoItem label="วัตถุประสงค์" value={state.certificationPurpose} />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">รายการล็อตการผลิต ({lots.length})</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {lots.map((lot, idx) => (
                                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex justify-between items-center group hover:border-emerald-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 font-bold shadow-sm text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{lot.lotCode}</p>
                                                <p className="text-[10px] text-slate-400">{lot.plotName || 'Plot'} • {lot.plantCount} ต้น</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ID: {lot.id}</p>
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
                    icon={<Icons.FileText className="w-5 h-5" />}
                    isOpen={expandedSections.documents}
                    onToggle={() => toggleSection('documents')}
                    editStep={9}
                    router={router}
                />
                {expandedSections.documents && (
                    <div className="p-5 space-y-4 animate-slide-down bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {documents.filter(d => d.uploaded).map((doc, idx) => (
                                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm group hover:border-emerald-300 transition-all">
                                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                        <CheckIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-xs font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Verified</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {documents.filter(d => d.uploaded).length === 0 && (
                            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">ไม่พบข้อมูลเอกสารแนบ</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Note Banner */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3 text-blue-900 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <InfoIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-sm">ขั้นตอนต่อไป</p>
                    <p className="text-xs leading-relaxed text-blue-800/80">
                        หลังจากกดยืนยัน ระบบจะนำท่านไปสู่หน้าส่งคำขออย่างเป็นทางการเพื่อเข้าสู่ระบบการตรวจสอบ
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
