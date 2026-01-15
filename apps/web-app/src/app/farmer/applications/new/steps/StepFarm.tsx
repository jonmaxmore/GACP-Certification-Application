"use client";

import { useState, useEffect } from 'react';
import { useWizardStore, FarmData, StepDocument } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useGACPData } from '@/hooks/useGACPData';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { InlineDocumentUpload } from '@/components/InlineDocumentUpload';
import { CheckIcon, WarningIcon, PlantIcon, InfoIcon, SecureIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Dynamically import map to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-50 rounded-[2rem] animate-pulse flex items-center justify-center text-slate-400 font-bold">กำลังโหลดแผนภาพพื้นที่...</div>
});

interface FarmDoc {
    id: string;
    name: string;
    nameEn: string;
    required: boolean;
    condition?: string;
}

const FARM_DOCUMENTS: FarmDoc[] = [
    { id: 'land_title', name: 'เอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.4/ส.ป.ก.)', nameEn: 'Land Title Document', required: true },
    { id: 'rental_contract', name: 'สัญญาเช่า (กรณีเช่าที่ดิน)', nameEn: 'Rental Contract', required: false, condition: 'landOwnership === "RENT"' },
    { id: 'consent_letter', name: 'หนังสือยินยอมใช้ที่ดิน', nameEn: 'Land Use Consent Letter', required: false, condition: 'landOwnership === "CONSENT"' },
    { id: 'farm_map', name: 'แผนที่ฟาร์ม/ผังบริเวณ', nameEn: 'Farm Layout Map', required: true },
    { id: 'water_quality_report', name: 'ผลวิเคราะห์คุณภาพน้ำ', nameEn: 'Water Quality Analysis Report', required: false },
];

export const StepFarm = () => {
    const { state, setFarmData } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    // API-First: Fetch GACP data
    const {
        environmentChecklist,
        waterSources,
        securityRequirements,
        loading: gacpLoading,
    } = useGACPData(4);

    const [formData, setFormData] = useState<Partial<FarmData> & { environmentChecks?: Record<string, boolean>; securityChecks?: Record<string, boolean> }>(state.farmData || {
        farmName: '',
        address: '',
        province: '',
        totalAreaSize: '',
        totalAreaUnit: 'Rai',
        landOwnership: 'OWN',
        waterSource: '',
        hasFence: false,
        hasCCTV: false,
        documents: [],
    });

    const [envChecks, setEnvChecks] = useState<Record<string, boolean>>(state.farmData?.environmentChecks || {});
    const [securityChecks, setSecurityChecks] = useState<Record<string, boolean>>(state.farmData?.securityChecks || {});
    const [uploadedDocs, setUploadedDocs] = useState<StepDocument[]>((state.farmData?.documents || []) as StepDocument[]);

    // Auto-save to store
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (formData.farmName) {
                setFarmData({
                    ...formData,
                    documents: uploadedDocs,
                    environmentChecks: envChecks,
                    securityChecks: securityChecks
                } as FarmData);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, uploadedDocs, envChecks, securityChecks, setFarmData]);

    const handleChange = (field: keyof FarmData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            gpsLat: lat.toFixed(6),
            gpsLng: lng.toFixed(6)
        }));
    };

    const handleDocUpload = (docId: string, url: string | null, fileName?: string) => {
        if (!url) {
            setUploadedDocs(prev => prev.filter(d => d.docType !== docId));
            return;
        }

        const newDoc: StepDocument = {
            stepNumber: 4,
            docType: docId,
            fileName: fileName || 'Uploaded Document',
            fileUrl: url,
            uploadedAt: new Date().toISOString(),
            required: FARM_DOCUMENTS.find(d => d.id === docId)?.required || false,
        };

        setUploadedDocs(prev => {
            const filtered = prev.filter(d => d.docType !== docId);
            return [...filtered, newDoc];
        });
    };

    // Validation
    const requiredEnvChecksPassed = environmentChecklist.filter(e => e.required).every(e => envChecks[e.id]);
    const hasBasicInfo = formData.farmName && formData.address && formData.province && formData.totalAreaSize;
    const isFormValid = hasBasicInfo && requiredEnvChecksPassed;

    if (gacpLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin ring-8 ring-primary/10"></div>
                <div className="text-center">
                    <p className="text-primary-900 font-black text-lg">กำลังโหลดมาตรฐาน GACP</p>
                    <p className="text-slate-400 text-sm">กรุณารอสักครู่เพื่อดึงข้อมูลเกณฑ์การตรวจประเมิน...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">

            {/* Step Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    3
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.farm.title}</h2>
                    <p className="text-text-secondary">{dict.wizard.farm.subtitle}</p>
                </div>
            </div>

            {/* Section 1: Basic Info */}
            <section className="gacp-card p-10 animate-slide-up">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        1
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{dict.wizard.farm.sections.general}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.fields.farmName} required />
                        <input
                            type="text"
                            className="gacp-input"
                            placeholder="เช่น ไร่สมุนไพรสุขใจ"
                            value={formData.farmName}
                            onChange={(e) => handleChange('farmName', e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.fields.address} required />
                        <textarea
                            className="gacp-input min-h-[120px] resize-none py-4"
                            placeholder="บ้านเลขที่, หมู่, ถนน..."
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.fields.province} required />
                        <input
                            type="text"
                            className="gacp-input"
                            value={formData.province}
                            onChange={(e) => handleChange('province', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.fields.totalArea} required />
                        <div className="flex gap-4">
                            <input
                                type="number"
                                className="gacp-input flex-1"
                                placeholder="จำนวน"
                                value={formData.totalAreaSize}
                                onChange={(e) => handleChange('totalAreaSize', e.target.value)}
                            />
                            <select
                                className="gacp-input w-40"
                                value={formData.totalAreaUnit}
                                onChange={(e) => handleChange('totalAreaUnit', e.target.value)}
                            >
                                <option value="Rai">ไร่</option>
                                <option value="Ngan">งาน</option>
                                <option value="Sqm">ตร.ม.</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.fields.ownership} />
                        <select
                            className="gacp-input"
                            value={formData.landOwnership}
                            onChange={(e) => handleChange('landOwnership', e.target.value)}
                        >
                            <option value="OWN">{dict.wizard.farm.fields.ownershipOptions.owner}</option>
                            <option value="RENT">{dict.wizard.farm.fields.ownershipOptions.rented}</option>
                            <option value="CONSENT">{dict.wizard.farm.fields.ownershipOptions.consent}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <FormLabelWithHint label={dict.wizard.farm.water.source} />
                        <select
                            className="gacp-input"
                            value={formData.waterSource}
                            onChange={(e) => handleChange('waterSource', e.target.value)}
                        >
                            <option value="">-- เลือกแหล่งน้ำ --</option>
                            {waterSources.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.nameTH}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* GPS Section */}
                <div className="mt-12 pt-10 border-t border-slate-100 space-y-8">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-800 flex items-center gap-3">
                            <Icons.MapPin className="w-5 h-5 text-primary" />
                            ตำแหน่งพิกัดแปลง (GPS)
                        </h4>
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => handleLocationSelect(pos.coords.latitude, pos.coords.longitude),
                                        () => alert('ไม่สามารถระบุตำแหน่งได้')
                                    );
                                }
                            }}
                            className="bg-primary/5 hover:bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
                        >
                            <Icons.Target className="w-4 h-4" />
                            ใช้ตำแหน่งปัจจุบัน
                        </button>
                    </div>

                    <div className="h-96 w-full rounded-[2.5rem] overflow-hidden shadow-inner border-[6px] border-slate-50 relative z-0 group">
                        <InteractiveMap
                            initialLat={formData.gpsLat ? parseFloat(formData.gpsLat) : 13.736717}
                            initialLng={formData.gpsLng ? parseFloat(formData.gpsLng) : 100.523186}
                            onLocationSelect={handleLocationSelect}
                        />
                        <div className="absolute bottom-6 left-6 flex gap-3 z-10">
                            <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-premium flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3">Lat</span>
                                <span className="font-mono text-primary-900 font-black">{formData.gpsLat || '-'}</span>
                            </div>
                            <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-premium flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3">Lng</span>
                                <span className="font-mono text-primary-900 font-black">{formData.gpsLng || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: GACP Environment & Security */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Environment Checks */}
                <section className="gacp-card p-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            2
                        </div>
                        <h3 className="text-xl font-black text-slate-800">{dict.wizard.farm.sections.environment}</h3>
                    </div>

                    <div className="space-y-4">
                        {environmentChecklist.map(item => {
                            const isChecked = envChecks[item.id] || false;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setEnvChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className={`
                                        w-full p-5 rounded-[2rem] text-left border-2 transition-all duration-300 flex items-center gap-5 group
                                        ${isChecked
                                            ? 'border-primary bg-primary-50/50 shadow-soft'
                                            : 'border-slate-50 bg-white hover:border-primary/20 hover:shadow-premium-hover'
                                        }
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                                        <CheckIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-black leading-snug ${isChecked ? 'text-primary-900' : 'text-slate-600'}`}>{item.nameTH}</p>
                                        {item.required && <span className="text-[9pt] font-black text-rose-500 uppercase tracking-tighter mt-1 block">จำเป็นตามมาตรฐาน GACP</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Security Checks */}
                <section className="gacp-card p-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            3
                        </div>
                        <h3 className="text-xl font-black text-slate-800">{dict.wizard.farm.sections.security}</h3>
                    </div>

                    <div className="space-y-4">
                        {securityRequirements.map(item => {
                            const isChecked = securityChecks[item.id] || false;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSecurityChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className={`
                                        w-full p-5 rounded-[2rem] text-left border-2 transition-all duration-300 flex items-center gap-5 group
                                        ${isChecked
                                            ? 'border-primary bg-primary-50/50 shadow-soft'
                                            : 'border-slate-50 bg-white hover:border-primary/20 hover:shadow-premium-hover'
                                        }
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                                        <SecureIcon className="w-5 h-5" />
                                    </div>
                                    <p className={`text-sm font-black ${isChecked ? 'text-primary-900' : 'text-slate-600'}`}>{item.nameTH}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Section 4: Documents */}
            <section className="gacp-card p-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        4
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{dict.wizard.farm.sections.documents}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {FARM_DOCUMENTS.map(doc => {
                        // Check conditions
                        if (doc.condition) {
                            if (doc.condition === 'landOwnership === "RENT"' && formData.landOwnership !== 'RENT') return null;
                            if (doc.condition === 'landOwnership === "CONSENT"' && formData.landOwnership !== 'CONSENT') return null;
                        }
                        const currentDoc = uploadedDocs.find(d => d.docType === doc.id);

                        return (
                            <InlineDocumentUpload
                                key={doc.id}
                                id={doc.id}
                                label={doc.name}
                                labelEn={doc.nameEn}
                                required={doc.required}
                                value={currentDoc?.fileUrl}
                                onChange={(file, url) => handleDocUpload(doc.id, url, file?.name)}
                            />
                        );
                    })}
                </div>
            </section>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/4')}
                onBack={() => router.push('/farmer/applications/new/step/2')}
                isNextDisabled={!isFormValid}
                showBack={true}
                nextLabel={dict.wizard.navigation.next}
                backLabel={dict.wizard.navigation.back}
            />
        </div>
    );
};

export default StepFarm;
