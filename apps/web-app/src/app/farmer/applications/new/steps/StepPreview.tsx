'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, DocIcon } from '@/components/icons/WizardIcons';

export const StepPreview = () => {
    const { state } = useWizardStore();
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        applicant: true,
        farm: true,
        plots: true,
        production: true,
        documents: true,
    });

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Get data
    const applicant = state.applicantData;
    const farm = state.farmData;
    const plots = state.siteData?.plots || [];
    const lots = state.lots || [];
    const documents = state.documents || [];

    // Calculate totals
    const totalPlots = plots.length;
    const totalLots = lots.length;
    // Fix: lots structure might vary, ensure we access plantCount correctly
    const totalPlants = lots.reduce((sum, lot: any) => sum + (Number(lot.plantCount) || 0), 0);
    const totalDocs = documents.filter(d => d.uploaded).length;

    interface SectionHeaderProps {
        title: string;
        icon: React.ReactNode;
        isOpen: boolean;
        onToggle: () => void;
        count?: number;
    }

    const SectionHeader = ({ title, icon, isOpen, onToggle, count }: SectionHeaderProps) => (
        <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-5 transition-all duration-300 group
                ${isOpen
                    ? 'text-primary-900 bg-primary-50/50'
                    : 'text-gray-600 hover:text-primary-900 hover:bg-gray-50'
                }
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 shadow-sm
                    ${isOpen ? 'bg-primary text-white scale-100 shadow-md' : 'bg-white border border-gray-100 text-gray-400 group-hover:border-primary-200 group-hover:text-primary scale-95'}
                `}>
                    {icon}
                </div>
                <span className="font-bold text-lg">{title}</span>
                {count !== undefined && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-colors ${isOpen ? 'bg-primary-100 text-primary border-primary-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {count}
                    </span>
                )}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${isOpen ? 'bg-primary-100 text-primary border-primary-200 rotate-180' : 'bg-white text-gray-400 border-gray-200 group-hover:border-gray-300'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
        </button>
    );

    const InfoRow = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
        <div className="flex flex-col pb-3 border-b border-gray-100 last:border-0 last:pb-0">
            <span className="text-xs text-text-tertiary font-medium mb-1 uppercase tracking-wide">{label}</span>
            <span className="font-bold text-gray-900 text-base">{value || '-'}</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                        7
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary-900">ตรวจสอบข้อมูล (Preview)</h2>
                        <p className="text-text-secondary">กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนดำเนินการขอใบเสนอราคา</p>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors text-sm font-bold shadow-sm"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                    พิมพ์ / บันทึก PDF
                </button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="gacp-card bg-gradient-to-br from-teal-50 to-white border-teal-100 group">
                    <div className="relative z-10 text-center">
                        <p className="text-4xl font-black text-teal-600 mb-1 group-hover:scale-110 transition-transform drop-shadow-sm">{totalPlots}</p>
                        <p className="text-xs font-bold text-teal-600/70 uppercase tracking-widest">แปลงปลูก</p>
                    </div>
                </div>
                <div className="gacp-card bg-gradient-to-br from-emerald-50 to-white border-emerald-100 group">
                    <div className="relative z-10 text-center">
                        <p className="text-4xl font-black text-emerald-600 mb-1 group-hover:scale-110 transition-transform drop-shadow-sm">{totalPlants.toLocaleString()}</p>
                        <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">จำนวนต้น</p>
                    </div>
                </div>
                <div className="gacp-card bg-gradient-to-br from-blue-50 to-white border-blue-100 group">
                    <div className="relative z-10 text-center">
                        {/* Safe access for estimatedYieldKg */}
                        <p className="text-4xl font-black text-blue-600 mb-1 group-hover:scale-110 transition-transform drop-shadow-sm">{(lots[0] as any)?.estimatedYieldKg?.toLocaleString() || '0'}</p>
                        <p className="text-xs font-bold text-blue-600/70 uppercase tracking-widest">กก./รอบ</p>
                    </div>
                </div>
                <div className="gacp-card bg-gradient-to-br from-indigo-50 to-white border-indigo-100 group">
                    <div className="relative z-10 text-center">
                        <p className="text-4xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform drop-shadow-sm">{totalDocs}</p>
                        <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest">เอกสารแนบ</p>
                    </div>
                </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-6">

                {/* 1. Applicant */}
                <div className="gacp-card p-0 overflow-hidden hover:shadow-md transition-shadow">
                    <SectionHeader
                        title="ข้อมูลผู้ขอใบรับรอง"
                        icon="👤"
                        isOpen={expandedSections.applicant}
                        onToggle={() => toggleSection('applicant')}
                    />
                    {expandedSections.applicant && (
                        <div className="p-6 pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up bg-white/50 backdrop-blur-sm">
                            <InfoRow label="ชื่อ-นามสกุล / นิติบุคคล" value={applicant?.firstName && applicant?.lastName ? `${applicant.firstName} ${applicant.lastName}` : applicant?.fullName} />
                            <InfoRow label="เลขบัตรประชาชน / เลขนิติบุคคล" value={applicant?.idCard} />
                            <InfoRow label="เบอร์โทรศัพท์" value={applicant?.phone} />
                            <InfoRow label="อีเมล" value={applicant?.email} />
                            <div className="col-span-1 md:col-span-2">
                                <InfoRow label="ที่อยู่" value={`${applicant?.addressNo || ''} ${applicant?.subdistrict || ''} ${applicant?.district || ''} ${applicant?.province || ''} ${applicant?.zipCode || ''}`} />
                            </div>
                            <InfoRow
                                label="สุขอนามัยบุคลากร (GACP)"
                                value={applicant?.personnelHygiene ?
                                    (applicant.personnelHygiene.trainingProvided && applicant.personnelHygiene.healthCheck && applicant.personnelHygiene.protectiveGear
                                        ? '✅ ครบถ้วน (Complete)'
                                        : '⚠️ ไม่ครบถ้วน (Incomplete)')
                                    : '-'}
                            />
                        </div>
                    )}
                </div>

                {/* 2. Farm */}
                <div className="gacp-card p-0 overflow-hidden hover:shadow-md transition-shadow">
                    <SectionHeader
                        title="ข้อมูลสถานที่ผลิต (ฟาร์ม)"
                        icon="🏡"
                        isOpen={expandedSections.farm}
                        onToggle={() => toggleSection('farm')}
                    />
                    {expandedSections.farm && (
                        <div className="p-6 pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up bg-white/50 backdrop-blur-sm">
                            <InfoRow label="ชื่อสถานที่ผลิต" value={farm?.farmName} />
                            <InfoRow label="ที่ตั้ง (จังหวัด)" value={farm?.province} />
                            <InfoRow label="ขนาดพื้นที่ทั้งหมด" value={`${farm?.totalAreaSize || 0} ${farm?.totalAreaUnit === 'rai' ? 'ไร่' : 'ตร.ม.'}`} />
                            <InfoRow label="กรรมสิทธิ์" value={farm?.landOwnership === 'OWN' ? 'เจ้าของกรรมสิทธิ์' : (farm?.landOwnership === 'RENT' ? 'เช่า' : 'ความยินยอม')} />
                            <InfoRow label="แหล่งน้ำ" value={farm?.waterSource} />
                            <InfoRow label="พิกัด GPS" value={`${farm?.gpsLat || '-'}, ${farm?.gpsLng || '-'}`} />
                            <InfoRow
                                label="สุขาภิบาล (Sanitation)"
                                value={farm?.sanitationInfo ?
                                    `${Object.values(farm.sanitationInfo).filter(Boolean).length}/4 รายการ`
                                    : '-'}
                            />
                        </div>
                    )}
                </div>

                {/* 3. Plots */}
                <div className="gacp-card p-0 overflow-hidden hover:shadow-md transition-shadow">
                    <SectionHeader
                        title="แปลงปลูก"
                        icon="🌿"
                        isOpen={expandedSections.plots}
                        onToggle={() => toggleSection('plots')}
                        count={totalPlots}
                    />
                    {expandedSections.plots && (
                        <div className="p-6 pt-4 border-t border-gray-100 space-y-3 animate-slide-up bg-white/50 backdrop-blur-sm">
                            {plots.length === 0 ? (
                                <p className="text-text-tertiary text-center py-4 italic text-sm">ยังไม่มีแปลงปลูก</p>
                            ) : (
                                plots.map((plot, idx) => (
                                    <div key={plot.id} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <span className="w-10 h-10 bg-primary-50 text-primary-700 rounded-lg border border-primary-100 flex items-center justify-center text-lg font-bold shadow-sm">{idx + 1}</span>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">{plot.name}</p>
                                                <p className="text-xs text-text-secondary mt-0.5 uppercase tracking-wide font-medium">{plot.solarSystem} • {plot.areaSize} {plot.areaUnit === 'sqm' ? 'ตร.ม.' : plot.areaUnit === 'rai' ? 'ไร่' : plot.areaUnit}</p>
                                            </div>
                                        </div>
                                        {plot.soilType && (
                                            <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-100 shadow-sm uppercase tracking-wide">{plot.soilType}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Production */}
                <div className="gacp-card p-0 overflow-hidden hover:shadow-md transition-shadow">
                    <SectionHeader
                        title="ประมาณการผลผลิต"
                        icon="📊"
                        isOpen={expandedSections.production}
                        onToggle={() => toggleSection('production')}
                    />
                    {expandedSections.production && (
                        <div className="p-6 pt-4 border-t border-gray-100 animate-slide-up bg-white/50 backdrop-blur-sm">
                            {lots.length === 0 ? (
                                <p className="text-text-tertiary text-center py-4 italic text-sm">ยังไม่ได้ระบุประมาณการ</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                                        <p className="text-xs font-bold text-teal-600 mb-2 uppercase tracking-wide">จำนวนต้นรวม</p>
                                        <p className="text-3xl font-black text-teal-800">{totalPlants.toLocaleString()} <span className="text-base font-medium text-teal-600">ต้น</span></p>
                                    </div>
                                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">ผลผลิตคาดการณ์</p>
                                        <p className="text-3xl font-black text-emerald-800">{(lots[0] as any)?.estimatedYieldKg?.toLocaleString() || '-'} <span className="text-base font-medium text-emerald-600">กก./รอบ</span></p>
                                    </div>
                                    {lots[0].estimatedPlantingDate && (
                                        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 md:col-span-2 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📅</div>
                                            <div>
                                                <p className="text-xs font-bold text-blue-600 mb-0.5 uppercase tracking-wide">วันที่เริ่มปลูก</p>
                                                <p className="text-lg font-bold text-blue-800">{new Date(lots[0].estimatedPlantingDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 5. Documents */}
                <div className="gacp-card p-0 overflow-hidden hover:shadow-md transition-shadow">
                    <SectionHeader
                        title="เอกสารประกอบ"
                        icon="📄"
                        isOpen={expandedSections.documents}
                        onToggle={() => toggleSection('documents')}
                        count={totalDocs}
                    />
                    {expandedSections.documents && (
                        <div className="p-6 pt-4 border-t border-gray-100 animate-slide-up bg-white/50 backdrop-blur-sm">
                            {totalDocs === 0 ? (
                                <p className="text-text-tertiary text-center py-4 italic text-sm">ยังไม่มีเอกสาร</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {documents.filter(d => d.uploaded).map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-110 transition-all">
                                                <DocIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="truncate font-bold text-sm text-gray-800 group-hover:text-emerald-800 transition-colors" title={doc.name}>{doc.name}</div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full mt-1">
                                                    <CheckIcon className="w-3 h-3" />
                                                    อัปโหลดแล้ว
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-emerald-400">
                                                <CheckIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-4">
                <WizardNavigation
                    onNext={() => router.push('/farmer/applications/new/step/12')} // Go to Submit
                    onBack={() => router.push('/farmer/applications/new/step/10')}
                    nextLabel="ยืนยันและดำเนินการต่อ"
                />
            </div>
        </div>
    );
};

export default StepPreview;



