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
                relative bg-white rounded-2xl transition-all duration-300 overflow-hidden group
                ${doc
                    ? 'border-2 border-primary/20 shadow-sm'
                    : 'border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/40'
                }
            `}>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className={`font-bold text-sm mb-1 flex flex-wrap items-center gap-2 ${doc ? 'text-primary-900' : 'text-gray-700'}`}>
                                {displayName}
                                {(req.required || req.conditionalRequired) && !doc && (
                                    <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-bold">
                                        * {language === 'th' ? 'จำเป็น' : 'Required'}
                                    </span>
                                )}
                            </h4>
                            <p className="text-[10px] text-text-tertiary flex items-center gap-1">
                                {isAiSupported && <span className="text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded-md">✨ AI Smart Scan</span>}
                                {req.helperText || (language === 'th' ? 'รองรับ PDF, JPG, PNG' : 'Supports PDF, JPG, PNG')}
                            </p>
                        </div>
                        {doc && (
                            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-scale-in">
                                <CheckIcon className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    {req.templateUrl && !doc && (
                        <div className="mb-4">
                            <a href={req.templateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-primary font-bold hover:bg-primary hover:text-white bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 transition-all">
                                <Icons.Download className="w-3 h-3" />
                                {dict.wizard.documents.downloadForm}
                            </a>
                        </div>
                    )}

                    {!doc ? (
                        <label className={`
                            relative h-32 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden bg-gray-50/50
                            ${isUploading
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
                            }
                        `}>
                            {isUploading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-[10px] font-bold text-primary">{dict.wizard.documents.messages.analyzing}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-white text-gray-400 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:text-primary group-hover:shadow-md transition-all shadow-sm border border-gray-100">
                                        <UploadIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-primary transition-colors">{dict.wizard.documents.upload}</span>
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
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 group-hover:border-primary-100 transition-all shadow-inner">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                                        <DocIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-gray-900 truncate">{doc.name}</div>
                                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                                            <CheckIcon className="w-3 h-3" />
                                            {dict.wizard.documents.messages.valid}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                        setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                    }}
                                    className="p-1.5 rounded-xl text-gray-300 hover:text-danger hover:bg-danger-50 transition-all"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Specialized Fields: Land Deed */}
                            {req.slotId === 'land_deed' && (
                                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-slide-up">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{language === 'th' ? 'ข้อมูลขนาดพื้นที่ (โฉนด)' : 'Title Deed Area'}</span>
                                        {!doc.metadata?.manualEntry && (
                                            <button
                                                onClick={() => handleUpdateMetadata(req.slotId, { manualEntry: true })}
                                                className="text-[10px] text-primary hover:underline font-black"
                                            >
                                                {language === 'th' ? 'แก้ไข' : 'Edit'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['rai', 'ngan', 'sqWa'].map((unit) => (
                                            <div key={unit} className="bg-white rounded-xl border border-gray-100 p-2 text-center shadow-sm">
                                                <label className="block text-[8px] text-gray-400 uppercase font-bold mb-0.5">
                                                    {unit === 'sqWa' ? (language === 'th' ? 'ตร.ว.' : 'Sq.Wa') :
                                                        (unit === 'rai' ? (language === 'th' ? 'ไร่' : 'Rai') :
                                                            (language === 'th' ? 'งาน' : 'Ngan'))}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full text-center text-xs font-black text-gray-900 bg-transparent outline-none"
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
                                <div className={`mt-3 text-[10px] p-2.5 rounded-xl flex items-center justify-between font-bold animate-slide-down ${aiResult.valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <span className="flex items-center gap-1.5 leading-none">
                                        {aiResult.valid ? <CheckIcon className="w-3.5 h-3.5" /> : <WarningIcon className="w-3.5 h-3.5" />}
                                        {aiResult.message}
                                    </span>
                                    {aiResult.confidence && aiResult.valid && (
                                        <span className="bg-white/60 px-1.5 py-0.5 rounded-lg shadow-sm font-black">
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
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    9
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.documents.title}</h2>
                    <p className="text-text-secondary">{dict.wizard.documents.subtitle}</p>
                </div>
            </div>

            {loadingReqs ? (
                <div className="flex flex-col items-center justify-center h-80 gap-6 bg-white rounded-[2rem] border border-gray-100 shadow-premium">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s] mx-1"></span>
                            <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                        </div>
                    </div>
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{language === 'th' ? 'กำลังเตรียมรายการเอกสาร...' : 'Preparing document list...'}</span>
                </div>
            ) : (
                <>
                    {/* Dashboard Status Card */}
                    <div className="gacp-card bg-gradient-to-br from-primary shadow-soft relative overflow-hidden border-none text-white p-8 animate-slide-up">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">{dict.wizard.documents.status.mandatory}</p>
                                    <p className="text-4xl font-black">{mandatoryDocs.length}</p>
                                </div>
                                <div className="h-12 w-px bg-white/20"></div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">{dict.wizard.documents.status.uploaded}</p>
                                    <p className="text-4xl font-black text-emerald-300">{completedRequirements.length}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-3">
                                {missingRequirements.length === 0 ? (
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl text-sm font-black shadow-lg border border-white/30 animate-pulse-soft">
                                        <CheckIcon className="w-5 h-5 text-emerald-300" />
                                        {dict.wizard.documents.status.complete}
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-2xl text-sm font-black shadow-lg">
                                        <Icons.Info className="w-5 h-5 text-amber-500" />
                                        {dict.wizard.documents.status.missingCount.replace('{n}', missingRequirements.length.toString())}
                                    </div>
                                )}
                                <p className="text-[10px] text-white/50 font-medium italic">* แนะนำให้อัปโหลดไฟล์ PDF เพื่อความชัดเจนสูงสุด</p>
                            </div>
                        </div>
                    </div>

                    {/* Missing Documents Section */}
                    {missingRequirements.length > 0 && (
                        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                                <h3 className="font-black text-xl text-gray-800 tracking-tight">
                                    {dict.wizard.documents.headers.todo}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {missingRequirements.map((req) => renderDocCard(req))}
                            </div>
                        </div>
                    )}

                    {/* Completed Documents Section */}
                    {completedRequirements.length > 0 && (
                        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                <h3 className="font-black text-xl text-gray-800 tracking-tight">
                                    {dict.wizard.documents.headers.done}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {completedRequirements.map((req) => {
                                    const doc = state.documents.find(d => d.id === req.slotId);
                                    const displayName = String(dict.wizard.documents.docNames[req.nameKey as keyof typeof dict.wizard.documents.docNames] || req.nameKey);
                                    if (!doc) return null;
                                    return (
                                        <div key={req.slotId} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-100">
                                                <Icons.CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-black text-emerald-500 uppercase mb-0.5 tracking-wider">Completed</div>
                                                <div className="text-xs font-bold text-gray-900 truncate" title={displayName}>{displayName}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                                    setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                                }}
                                                className="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <Icons.Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Optional / Extra Links */}
                    <div className="gacp-card p-8 mt-12 animate-slide-up bg-gradient-to-br from-white to-blue-50/30 border-blue-100" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
                                <Icons.Video className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">{dict.wizard.documents.extra.video}</h3>
                                <p className="text-xs text-gray-500">{dict.wizard.documents.extra.hint}</p>
                            </div>
                        </div>

                        <div className="mb-10 max-w-2xl">
                            <FormLabelWithHint label={dict.wizard.documents.extra.video} hint={dict.wizard.documents.extra.hint} />
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Icons.Link className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="gacp-input pl-12 bg-white"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        {optionalDocs.length > 0 && (
                            <div className="space-y-6">
                                <h4 className="font-bold text-sm text-gray-600 uppercase tracking-widest px-1">เอกสารเพิ่มเติม (Optional)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
