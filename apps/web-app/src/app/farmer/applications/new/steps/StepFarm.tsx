'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, FarmData, StepDocument } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useGACPData } from '@/hooks/useGACPData';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { InlineDocumentUpload } from '@/components/InlineDocumentUpload';
import { CheckIcon, WarningIcon, PlantIcon, InfoIcon, SecureIcon } from '@/components/icons/WizardIcons';

// Dynamically import map to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400">กำลังโหลดแผนที่...</div>
});

// GACP Document types for Farm step (Step 4 effectively in logic but Step 3 visually)
const FARM_DOCUMENTS = [
    { id: 'land_title', name: 'เอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.4/ส.ป.ก.)', nameEn: 'Land Title Document', required: true },
    { id: 'rental_contract', name: 'สัญญาเช่า (กรณีเช่าที่ดิน)', nameEn: 'Rental Contract', required: false, condition: 'landOwnership === "RENT"' },
    { id: 'consent_letter', name: 'หนังสือยินยอมใช้ที่ดิน', nameEn: 'Land Use Consent Letter', required: false, condition: 'landOwnership === "CONSENT"' },
    { id: 'farm_map', name: 'แผนที่ฟาร์ม/ผังบริเวณ', nameEn: 'Farm Layout Map', required: true },
    { id: 'water_quality_report', name: 'ผลวิเคราะห์คุณภาพน้ำ', nameEn: 'Water Quality Analysis Report', required: false },
];

export const StepFarm = () => {
    const { state, setFarmData } = useWizardStore();
    const router = useRouter();

    // API-First: Fetch GACP data
    const {
        environmentChecklist,
        waterSources,
        securityRequirements,
        loading: gacpLoading,
    } = useGACPData(4);

    // Initialize form
    const [formData, setFormData] = useState<Partial<FarmData> & { environmentChecks?: Record<string, boolean>; securityChecks?: Record<string, boolean> }>(state.farmData || {
        farmName: '',
        address: '',
        province: '',
        district: '',
        subdistrict: '',
        postalCode: '',
        gpsLat: '',
        gpsLng: '',
        totalAreaSize: '',
        totalAreaUnit: 'Rai',
        landOwnership: 'OWN',
        northBorder: '',
        southBorder: '',
        eastBorder: '',
        westBorder: '',
        waterSource: '',
        electricitySource: '',
        soilType: '',
        soilPH: '',
        soilHistory: '',
        hasFence: false,
        hasCCTV: false,
        hasAccessControl: false,
        hasWarningSign: false,
        documents: [],
    });

    const [envChecks, setEnvChecks] = useState<Record<string, boolean>>({});
    const [securityChecks, setSecurityChecks] = useState<Record<string, boolean>>({});
    const [uploadedDocs, setUploadedDocs] = useState<StepDocument[]>(state.farmData?.documents || []);
    const [waterQualityStatus, setWaterQualityStatus] = useState<'pending' | 'passed' | 'failed' | 'none'>('none');

    // Auto-save
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (formData.farmName) {
                setFarmData({ ...formData, documents: uploadedDocs } as FarmData);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, uploadedDocs, setFarmData]);

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
            // Remove document if url is null (cleared)
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
    const requiredEnvChecks = environmentChecklist.filter(e => e.required).every(e => envChecks[e.id]);
    const hasBasicInfo = formData.farmName && formData.address && formData.province && formData.totalAreaSize;
    const isFormValid = hasBasicInfo && requiredEnvChecks;

    if (gacpLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <span className="text-text-secondary font-medium">กำลังโหลดข้อมูล GACP...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">

            {/* Header */}
            {/* Note: In Step 2 we removed the large header block in favor of compact section headers, keeping consistency here but retaining main title for Step 3 as it's a major section */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    3
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ข้อมูลฟาร์ม</h2>
                    <p className="text-text-secondary">รายละเอียดที่ตั้ง สภาพแวดล้อม และระบบความปลอดภัยตามมาตรฐาน GACP</p>
                </div>
            </div>

            {/* Section 1: Basic Info */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">1</span>
                    <h3 className="font-bold text-lg text-primary">ข้อมูลทั่วไปของฟาร์ม</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <FormLabelWithHint label="ชื่อฟาร์ม/สถานประกอบการ" required />
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="เช่น ไร่สมุนไพรสุขใจ"
                            value={formData.farmName}
                            onChange={(e) => handleChange('farmName', e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormLabelWithHint label="ที่อยู่ฟาร์ม" required />
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed min-h-[100px]"
                            placeholder="บ้านเลขที่, หมู่, ถนน..."
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                    </div>

                    <div>
                        <FormLabelWithHint label="จังหวัด" required />
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={formData.province}
                            onChange={(e) => handleChange('province', e.target.value)}
                        />
                    </div>

                    <div>
                        <FormLabelWithHint label="รหัสไปรษณีย์" />
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            value={formData.postalCode}
                            onChange={(e) => handleChange('postalCode', e.target.value)}
                        />
                    </div>

                    <div>
                        <FormLabelWithHint label="พื้นที่รวม" required />
                        <div className="flex gap-3">
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed flex-1"
                                placeholder="จำนวน"
                                value={formData.totalAreaSize}
                                onChange={(e) => handleChange('totalAreaSize', e.target.value)}
                            />
                            <select
                                className="w-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main hover:border-gray-300 cursor-pointer"
                                value={formData.totalAreaUnit}
                                onChange={(e) => handleChange('totalAreaUnit', e.target.value)}
                            >
                                <option value="Rai">ไร่</option>
                                <option value="Ngan">งาน</option>
                                <option value="Sqm">ตร.ม.</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <FormLabelWithHint label="กรรมสิทธิ์ที่ดิน" />
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main hover:border-gray-300 cursor-pointer"
                            value={formData.landOwnership}
                            onChange={(e) => handleChange('landOwnership', e.target.value)}
                        >
                            <option value="OWN">เป็นเจ้าของ</option>
                            <option value="RENT">เช่า</option>
                            <option value="CONSENT">ได้รับความยินยอม</option>
                        </select>
                    </div>
                </div>

                {/* Borders with directional inputs */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">
                        <PlantIcon className="w-5 h-5 text-primary" />
                        อาณาเขตติดต่อ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'ทิศเหนือ', key: 'northBorder' },
                            { label: 'ทิศใต้', key: 'southBorder' },
                            { label: 'ทิศตะวันออก', key: 'eastBorder' },
                            { label: 'ทิศตะวันตก', key: 'westBorder' }
                        ].map((dir) => (
                            <div key={dir.key} className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary bg-primary-50 px-2 py-0.5 rounded border border-primary-100 z-10">
                                    {dir.label}
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-24 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300"
                                    placeholder="ติดกับ..."
                                    value={formData[dir.key as keyof FarmData] as string || ''}
                                    onChange={e => handleChange(dir.key as keyof FarmData, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* [NEW] Soil Information Section */}
                <div className="mt-8 pt-6 border-t border-gray-100 animate-slide-up" style={{ animationDelay: '50ms' }}>
                    <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        ข้อมูลดินปลูก (Soil Information)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabelWithHint label="ลักษณะดิน (Soil Type)" required />
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main hover:border-gray-300 cursor-pointer"
                                value={formData.soilType || ''}
                                onChange={(e) => handleChange('soilType', e.target.value)}
                            >
                                <option value="">-- เลือกลักษณะดิน --</option>
                                <option value="Loam">ดินร่วน (Loam)</option>
                                <option value="Sandy Loam">ดินร่วนปนทราย (Sandy Loam)</option>
                                <option value="Clay">ดินเหนียว (Clay)</option>
                                <option value="Sandy">ดินทราย (Sandy)</option>
                                <option value="Silt">ดินตะกอน (Silt)</option>
                                <option value="Peat">ดินอินทรีย์/พีท (Peat)</option>
                            </select>
                        </div>

                        <div>
                            <FormLabelWithHint label="ค่า pH ดิน (ถ้าทราบ)" />
                            <input
                                type="number"
                                step="0.1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300"
                                placeholder="เช่น 6.5"
                                value={formData.soilPH || ''}
                                onChange={(e) => handleChange('soilPH', e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <FormLabelWithHint label="ประวัติการใช้ที่ดินย้อนหลัง (Land Use History)" hint="พืชที่เคยปลูก, การใช้สารเคมีในอดีต" />
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main placeholder:text-text-muted hover:border-gray-300 min-h-[80px]"
                                placeholder="ระบุประวัติการใช้พื้นที่ย้อนหลังอย่างน้อย 2 ปี..."
                                value={formData.soilHistory || ''}
                                onChange={(e) => handleChange('soilHistory', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Environment (GACP) */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">2</span>
                    <h3 className="font-bold text-lg text-primary">สภาพแวดล้อมพื้นที่ (GACP)</h3>
                </div>
                <p className="text-sm text-text-muted mb-6">กรุณายืนยันว่าพื้นที่เป็นไปตามเกณฑ์มาตรฐาน</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {environmentChecklist.map(item => {
                        const isChecked = envChecks[item.id] || false;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setEnvChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className={`
                                    relative p-4 rounded-xl text-left border transition-all duration-200 flex items-start gap-4 h-full
                                    ${isChecked
                                        ? 'border-primary bg-primary-50 ring-1 ring-primary shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`
                                    w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                                    ${isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}
                                `}>
                                    {isChecked && <CheckIcon className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1">
                                    <span className={`text-sm font-medium block ${isChecked ? 'text-primary-900' : 'text-text-main'}`}>
                                        {item.nameTH}
                                    </span>
                                    {item.required && <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Required</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {!requiredEnvChecks && (
                    <div className="mt-6 p-4 bg-warning-bg border border-warning-200 rounded-xl flex items-center gap-3 text-warning-text animate-pulse-soft">
                        <WarningIcon className="w-6 h-6 flex-shrink-0" />
                        <span className="font-medium">กรุณายืนยันข้อที่จำเป็น (Required) ทั้งหมดเพื่อดำเนินการต่อ</span>
                    </div>
                )}
            </section>

            {/* [NEW] Section 2.1: Sanitation & Facilities (GACP Pillar 1) */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">2.1</span>
                    <h3 className="font-bold text-lg text-emerald-800">สุขอนามัยและสิ่งอำนวยความสะดวก</h3>
                </div>
                <p className="text-sm text-text-muted mb-6">สิ่งอำนวยความสะดวกพื้นฐานเพื่อสุขอนามัยที่ดี (Sanitation & Facilities)</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'hasToilet', label: 'มีห้องน้ำที่ถูกสุขลักษณะ (Hygienic Toilet)', desc: 'แยกสัดส่วนชัดเจน อยู่ห่างจากแปลงปลูก' },
                        { id: 'hasHandWashing', label: 'มีจุดล้างมือพร้อมสบู่ (Handwashing)', desc: 'ใกล้ห้องน้ำและบริเวณปฏิบัติงาน' },
                        { id: 'hasWasteDisposal', label: 'มีจุดทิ้งขยะชัดเจน (Waste Disposal)', desc: 'มีการแยกประเภทขยะ' },
                        { id: 'hasRestArea', label: 'มีจุดพักผ่อน (Rest Area)', desc: 'แยกจากพื้นที่ปฏิบัติงานและเก็บสารเคมี' }
                    ].map(item => {
                        const isChecked = formData.sanitationInfo?.[item.id] || false;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    const currentInfo = formData.sanitationInfo || {};
                                    setFormData(prev => ({
                                        ...prev,
                                        sanitationInfo: { ...currentInfo, [item.id]: !isChecked }
                                    }));
                                }}
                                className={`
                                    relative p-4 rounded-xl text-left border transition-all duration-200 flex items-start gap-3
                                    ${isChecked
                                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'}`}>
                                    {isChecked && <CheckIcon className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                    <span className={`block font-semibold text-sm ${isChecked ? 'text-emerald-900' : 'text-gray-700'}`}>{item.label}</span>
                                    <span className="text-xs text-gray-500">{item.desc}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 3: Water & Quality */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">3</span>
                    <h3 className="font-bold text-lg text-primary">แหล่งน้ำและคุณภาพน้ำ</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FormLabelWithHint label="แหล่งน้ำหลัก" />
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main hover:border-gray-300 cursor-pointer"
                            value={formData.waterSource}
                            onChange={(e) => handleChange('waterSource', e.target.value)}
                        >
                            <option value="">-- เลือกแหล่งน้ำ --</option>
                            {waterSources.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.nameTH}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <FormLabelWithHint label="สถานะคุณภาพน้ำ" />
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary-50/50 transition-all outline-none bg-white text-text-main hover:border-gray-300 cursor-pointer"
                            value={waterQualityStatus}
                            onChange={(e) => setWaterQualityStatus(e.target.value as any)}
                        >
                            <option value="none">ยังไม่ได้วิเคราะห์</option>
                            <option value="pending">รอผลการวิเคราะห์</option>
                            <option value="passed">ผ่านการวิเคราะห์</option>
                            <option value="failed">ไม่ผ่าน (ต้องปรับปรุง)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Section 4: GPS */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">4</span>
                    <h3 className="font-bold text-lg text-primary">พิกัดฟาร์ม (GPS)</h3>
                </div>

                <div className="h-80 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 mb-6 bg-gray-50 relative z-0">
                    <InteractiveMap
                        initialLat={formData.gpsLat ? parseFloat(formData.gpsLat) : 13.736717}
                        initialLng={formData.gpsLng ? parseFloat(formData.gpsLng) : 100.523186}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
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
                        className="flex-1 py-3 px-4 bg-white border border-primary text-primary rounded-xl font-bold hover:bg-primary-50 transition-all shadow-sm hover:shadow-green-glow active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <InfoIcon className="w-5 h-5" />
                        ใช้ตำแหน่งปัจจุบันของฉัน
                    </button>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-[120px] text-center">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Latitude</label>
                            <div className="font-mono text-primary font-medium">{formData.gpsLat || '-'}</div>
                        </div>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-[120px] text-center">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Longitude</label>
                            <div className="font-mono text-primary font-medium">{formData.gpsLng || '-'}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Security */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">5</span>
                    <h3 className="font-bold text-lg text-primary">ระบบรักษาความปลอดภัย</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {securityRequirements.map(item => {
                        const isChecked = securityChecks[item.id] || false;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSecurityChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                className={`
                                    p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-3
                                    ${isChecked
                                        ? 'border-primary bg-primary-50 text-primary-900 font-bold shadow-sm'
                                        : 'border-gray-200 bg-white text-text-main hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                                    {isChecked && <CheckIcon className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-sm">{item.nameTH}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 6: Documents */}
            <section className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary flex items-center justify-center font-bold text-sm">6</span>
                    <h3 className="font-bold text-lg text-primary">เอกสารประกอบพื้นที่</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
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
                onNext={() => {
                    if (formData.farmName) {
                        setFarmData({ ...formData, documents: uploadedDocs } as FarmData);
                    }
                    router.push('/farmer/applications/new/step/4');
                }}
                onBack={() => router.push('/farmer/applications/new/step/2')}
                isNextDisabled={!isFormValid}
                showBack={true}
            />
        </div>
    );
};

export default StepFarm;
