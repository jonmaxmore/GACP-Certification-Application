'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import {
    CheckIcon,
    UploadIcon,
    WarningIcon,
    InfoIcon,
    DocIcon
} from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Icons } from '@/components/ui/icons';

// Mapping slotId to ExpectedType for AI Analysis
const AI_DOC_TYPES: Record<string, string> = {
    'id_card': 'ID_CARD',
    'house_reg': 'HOUSE_REGISTRATION',
    'land_deed': 'LAND_TITLE_DEED',
    'company_reg': 'COMPANY_REGISTRATION',
    'license_bt11': 'LICENSE_BT11',
};

interface DocRequirement {
    slotId: string;
    nameKey: keyof import('@/lib/i18n/types').Dictionary['wizard']['documents']['docNames'];
    required: boolean;
    conditionalRequired?: boolean;
    helperText?: string;
    templateUrl?: string;
}

export const StepDocuments = () => {
    const { state, setDocuments, setYoutubeUrl: saveToStoreYoutubeUrl } = useWizardStore();
    const router = useRouter();
    const { dict, language } = useLanguage();

    // State
    const [requirements, setRequirements] = useState<DocRequirement[]>([]);
    const [loadingReqs, setLoadingReqs] = useState(true);
    const [youtubeUrl, setYoutubeUrl] = useState(state.youtubeUrl || '');
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [aiResults, setAiResults] = useState<Record<string, { valid: boolean; message: string; confidence?: number }>>({});

    // Sync store state to local state on mount
    useEffect(() => {
        if (state.youtubeUrl) setYoutubeUrl(state.youtubeUrl);
    }, [state.youtubeUrl]);

    // Fetch Requirements
    useEffect(() => {
        const fetchRequirements = async () => {
            setLoadingReqs(true);
            try {
                // Determine requirements based on state
                const isHighControl = ['cannabis', 'kratom'].includes(state.plantId || '');
                const isExport = state.certificationPurpose === 'EXPORT';

                const coreReqs: DocRequirement[] = [
                    {
                        slotId: 'APP_FORM',
                        nameKey: 'APP_FORM',
                        required: true,
                        templateUrl: '/templates/application_form_v2.pdf'
                    },
                    { slotId: 'house_reg', nameKey: 'house_reg', required: true },
                    { slotId: 'land_deed', nameKey: 'land_deed', required: true },
                    {
                        slotId: 'land_consent',
                        nameKey: 'land_consent',
                        required: false,
                        conditionalRequired: state.siteData?.landOwnership === 'RENT' || state.siteData?.landOwnership === 'CONSENT',
                        templateUrl: '/templates/land_consent_form.pdf'
                    },
                    { slotId: 'site_map', nameKey: 'site_map', required: true },
                    { slotId: 'building_plan', nameKey: 'building_plan', required: true },
                    { slotId: 'photos_exterior', nameKey: 'photos_exterior', required: true },
                    { slotId: 'photos_interior', nameKey: 'photos_interior', required: true },
                    { slotId: 'production_plan', nameKey: 'production_plan', required: true, templateUrl: '/templates/production_plan_template.xlsx' },
                    { slotId: 'security_measures', nameKey: 'security_measures', required: true },
                    { slotId: 'medical_cert', nameKey: 'medical_cert', required: false },
                ];

                if (isHighControl) {
                    coreReqs.push({ slotId: 'elearning_cert', nameKey: 'elearning_cert', required: true });
                    coreReqs.push({ slotId: 'strain_cert', nameKey: 'strain_cert', required: true });
                }

                const exportReqs: DocRequirement[] = [
                    { slotId: 'sop_thai', nameKey: 'sop_thai', required: true, templateUrl: '/templates/sop_guideline.pdf' },
                    { slotId: 'training_records', nameKey: 'training_records', required: true },
                    { slotId: 'staff_test', nameKey: 'staff_test', required: true },
                    { slotId: 'soil_water_test', nameKey: 'soil_water_test', required: true },
                    { slotId: 'flower_test', nameKey: 'flower_test', required: true },
                    { slotId: 'input_report', nameKey: 'input_report', required: true },
                    { slotId: 'cp_ccp_plan', nameKey: 'cp_ccp_plan', required: true },
                    { slotId: 'calibration_cert', nameKey: 'calibration_cert', required: true },
                ];

                const finalReqs = [...coreReqs];
                if (isExport) {
                    finalReqs.push(...exportReqs);
                }

                setTimeout(() => {
                    setRequirements(finalReqs);
                    setLoadingReqs(false);
                }, 800);

            } catch (err) {
                console.error(err);
                setLoadingReqs(false);
            }
        };
        fetchRequirements();
    }, [state.plantId, state.siteData?.landOwnership, state.certificationPurpose]);

    // Derived State
    const uploadedDocIds = state.documents.filter(doc => doc.uploaded && doc.id).map(doc => doc.id!);
    const missingRequirements = requirements.filter(req => !uploadedDocIds.includes(req.slotId));
    const completedRequirements = requirements.filter(req => uploadedDocIds.includes(req.slotId));
    const mandatoryDocs = requirements.filter(r => r.required || r.conditionalRequired);
    const optionalDocs = requirements.filter(r => !r.required && !r.conditionalRequired);

    // Handlers
    const handleFileUpload = async (slotId: string, file: File) => {
        setUploading(prev => ({ ...prev, [slotId]: true }));
        setAiResults(prev => {
            const n = { ...prev }; delete n[slotId]; return n;
        });

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const isMatch = true;
            const confidence = 98;

            if (isMatch) {
                setAiResults(prev => ({
                    ...prev,
                    [slotId]: {
                        valid: isMatch,
                        message: language === 'th' ? 'เอกสารถูกต้อง (AI Verified)' : 'Document Valid (AI Verified)',
                        confidence
                    }
                }));
            }

            const newDocs = [...state.documents.filter(d => d.id !== slotId)];
            newDocs.push({
                id: slotId,
                name: file.name,
                uploaded: true,
                url: URL.createObjectURL(file),
                metadata: { manualEntry: false }
            });
            setDocuments(newDocs);

        } catch (error) {
            console.error(error);
            setAiResults(prev => ({
                ...prev,
                [slotId]: { valid: false, message: language === 'th' ? 'เกิดข้อผิดพลาดในการอัปโหลด' : 'Upload Error' }
            }));
        } finally {
            setUploading(prev => ({ ...prev, [slotId]: false }));
        }
    };

    const handleUpdateMetadata = (slotId: string, updates: any) => {
        const newDocs = state.documents.map(d => {
            if (d.id === slotId) {
                return { ...d, metadata: { ...d.metadata, ...updates } };
            }
            return d;
        });
        setDocuments(newDocs);
    };

    const handleAreaChange = (slotId: string, field: 'rai' | 'ngan' | 'sqWa', value: string) => {
        const numVal = parseFloat(value) || 0;
        const currentDoc = state.documents.find(d => d.id === slotId);
        const currentArea = currentDoc?.metadata?.area || { rai: 0, ngan: 0, sqWa: 0 };

        handleUpdateMetadata(slotId, {
            area: { ...currentArea, [field]: numVal },
            manualEntry: true
        });
    };

    // Render Helpers
    const renderDocCard = (req: DocRequirement) => {
        const doc = state.documents.find(d => d.id === req.slotId);
        const isUploading = uploading[req.slotId];
        const aiResult = aiResults[req.slotId];
        const isAiSupported = !!AI_DOC_TYPES[req.slotId];
        const displayName = dict.wizard.documents.docNames[req.nameKey] || req.nameKey;

        return (
            <div key={req.slotId} className={`
                relative bg-white rounded-2xl transition-all duration-300 overflow-hidden group border
                ${doc
                    ? 'border-emerald-200 shadow-sm'
                    : 'border-slate-200 shadow-sm hover:border-emerald-300'
                }
            `}>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className={`font-bold text-sm mb-1 flex flex-wrap items-center gap-2 ${doc ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {displayName}
                                {(req.required || req.conditionalRequired) && !doc && (
                                    <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-bold">
                                        * จำเป็น
                                    </span>
                                )}
                            </h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                {isAiSupported && <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">✨ AI Scan</span>}
                                {req.helperText || 'PDF, JPG, PNG'}
                            </p>
                        </div>
                        {doc && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-scale-in">
                                <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    {req.templateUrl && !doc && (
                        <div className="mb-3">
                            <a href={req.templateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold hover:underline bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100 transition-all">
                                <Icons.Download className="w-3 h-3" />
                                โหลดแบบฟอร์ม
                            </a>
                        </div>
                    )}

                    {!doc ? (
                        <label className={`
                            relative h-24 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden bg-slate-50
                            ${isUploading
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10'
                            }
                        `}>
                            {isUploading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-6 h-6 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-[10px] font-bold text-emerald-600">กำลังตรวจสอบ...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-white text-slate-400 flex items-center justify-center mb-1 shadow-sm border border-slate-100">
                                        <UploadIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">แตะเพื่ออัปโหลด</span>
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,application/pdf"
                                disabled={isUploading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(req.slotId, file);
                                }}
                            />
                        </label>
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                                        <DocIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-bold text-slate-800 truncate">{doc.name}</div>
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckIcon className="w-2.5 h-2.5" />
                                            ตรวจสอบแล้ว
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                        setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                    <Icons.Trash className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Specialized Fields: Land Deed */}
                            {req.slotId === 'land_deed' && (
                                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 animate-slide-up">
                                    <div className="flex justify-between items-center mb-1.5 px-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขนาดพื้นที่ (โฉนด)</span>
                                        {!doc.metadata?.manualEntry && (
                                            <button
                                                onClick={() => handleUpdateMetadata(req.slotId, { manualEntry: true })}
                                                className="text-[10px] text-emerald-600 hover:underline font-bold"
                                            >
                                                แก้ไข
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['rai', 'ngan', 'sqWa'].map((unit) => (
                                            <div key={unit} className="bg-white rounded-lg border border-slate-200 p-1.5 text-center shadow-sm">
                                                <label className="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">
                                                    {unit === 'sqWa' ? 'ตร.ว.' : (unit === 'rai' ? 'ไร่' : 'งาน')}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full text-center text-[10px] font-black text-slate-800 bg-transparent outline-none p-0"
                                                    value={doc.metadata?.area?.[unit as keyof typeof doc.metadata.area] ?? ''}
                                                    placeholder="0"
                                                    onChange={(e) => handleAreaChange(req.slotId, unit as any, e.target.value)}
                                                    readOnly={!doc.metadata?.manualEntry && !!doc.metadata?.area}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI Result Feedback */}
                            {aiResult && (
                                <div className={`mt-2 text-[10px] p-2 rounded-lg flex items-center justify-between font-bold animate-slide-down ${aiResult.valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                    <span className="flex items-center gap-1.5 leading-none">
                                        {aiResult.valid ? <CheckIcon className="w-3 h-3" /> : <WarningIcon className="w-3 h-3" />}
                                        {aiResult.message}
                                    </span>
                                    {aiResult.confidence && aiResult.valid && (
                                        <span className="bg-white/60 px-1.5 py-0.5 rounded shadow-sm font-black text-[9px]">
                                            {Math.round(aiResult.confidence)}%
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in px-4 max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    9
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.documents.title || 'เอกสารประกอบ'}</h2>
                    <p className="text-slate-500 text-sm">อัปโหลดเอกสารเพื่อยืนยันตัวตนและสิทธิ์การใช้พื้นที่</p>
                </div>
            </div>

            {loadingReqs ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4 bg-white rounded-2xl border border-slate-200">
                    <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span className="text-slate-400 font-bold text-xs">กำลังเตรียมรายการเอกสาร...</span>
                </div>
            ) : (
                <>
                    {/* Simplified Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ต้องใช้ทั้งหมด</p>
                            <p className="text-2xl font-black text-slate-800">{mandatoryDocs.length}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm text-center transition-colors ${missingRequirements.length === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-white border-slate-200 text-slate-800'}`}>
                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mb-1">อัปโหลดแล้ว</p>
                            <p className="text-2xl font-black">{completedRequirements.length}</p>
                        </div>
                    </div>

                    {/* Missing Documents Section */}
                    {missingRequirements.length > 0 && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-amber-400 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                                    สิ่งที่ต้องอัปโหลด ({missingRequirements.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {missingRequirements.map((req) => renderDocCard(req))}
                            </div>
                        </div>
                    )}

                    {/* Completed Documents Section */}
                    {completedRequirements.length > 0 && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                                    เรียบร้อยแล้ว ({completedRequirements.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                                {completedRequirements.map((req) => {
                                    const doc = state.documents.find(d => d.id === req.slotId);
                                    if (!doc) return null;
                                    return (
                                        <div key={req.slotId} className="bg-white border border-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden group">
                                            <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                                <CheckIcon className="w-4 h-4" />
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-600 truncate w-full px-1">{doc.name}</div>
                                            <button
                                                onClick={() => {
                                                    setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                                    setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                                }}
                                                className="absolute top-1 right-1 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Icons.Trash className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Extra Links */}
                    <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 mt-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Icons.Video className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700">{dict.wizard.documents.extra.video}</h3>
                                <p className="text-[10px] text-slate-400">ลิงก์วิดีโอแนะนำแปลงปลูก (ถ้ามี)</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                                <Icons.Link className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        </div>

                        {optionalDocs.length > 0 && (
                            <div className="pt-2">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest px-1 mb-2">เอกสารเพิ่มเติม</h4>
                                <div className="space-y-3">
                                    {optionalDocs.map((req) => renderDocCard(req))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <WizardNavigation
                onNext={() => {
                    saveToStoreYoutubeUrl(youtubeUrl);
                    router.push('/farmer/applications/new/step/10');
                }}
                onBack={() => router.push('/farmer/applications/new/step/8')}
                isNextDisabled={false}
                nextLabel={dict.wizard.navigation.next}
                backLabel={dict.wizard.navigation.back}
            />
        </div>
    );
};

export default StepDocuments;
