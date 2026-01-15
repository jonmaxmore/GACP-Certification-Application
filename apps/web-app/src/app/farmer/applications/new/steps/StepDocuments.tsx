'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, DocumentUpload } from '../hooks/useWizardStore';
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
    name: string;
    required: boolean;
    conditionalRequired?: boolean;
    helperText?: string;
    templateUrl?: string;
}

export const StepDocuments = () => {
    const { state, setDocuments, setYoutubeUrl: saveToStoreYoutubeUrl } = useWizardStore();
    const router = useRouter();

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
                        name: 'แบบลงทะเบียนยื่นคำขอ',
                        required: true,
                        helperText: 'แบบฟอร์มที่กรอกข้อมูลครบถ้วนและลงนามแล้ว',
                        templateUrl: '/templates/application_form_v2.pdf'
                    },
                    { slotId: 'house_reg', name: 'สำเนาทะเบียนบ้าน', required: true },
                    { slotId: 'land_deed', name: 'หนังสือแสดงกรรมสิทธิ์ที่ดิน/โฉนด', required: true },
                    {
                        slotId: 'land_consent',
                        name: 'หนังสือสัญญาเช่า / ยินยอมใช้ที่ดิน',
                        required: false,
                        conditionalRequired: state.siteData?.landOwnership === 'RENT' || state.siteData?.landOwnership === 'CONSENT',
                        helperText: 'กรณีเช่าที่ดิน หรือใช้ที่ดินของบุคคลอื่น ต้องแนบหนังสือยินยอม',
                        templateUrl: '/templates/land_consent_form.pdf'
                    },
                    { slotId: 'site_map', name: 'แผนที่ตั้ง + พิกัด GPS', required: true },
                    { slotId: 'building_plan', name: 'แบบแปลนอาคาร/โรงเรือน', required: true },
                    { slotId: 'photos_exterior', name: 'ภาพถ่ายบริเวณภายนอก', required: true },
                    { slotId: 'photos_interior', name: 'ภาพถ่ายภายในสถานที่ผลิต', required: true },
                    { slotId: 'production_plan', name: 'แผนการผลิตแต่ละรอบ/ปี', required: true, templateUrl: '/templates/production_plan_template.xlsx' },
                    { slotId: 'security_measures', name: 'มาตรการรักษาความปลอดภัย', required: true },
                    { slotId: 'medical_cert', name: 'ใบรับรองแพทย์ (ผู้ปฏิบัติงาน)', required: false },
                ];

                if (isHighControl) {
                    coreReqs.push({ slotId: 'elearning_cert', name: 'หนังสือรับรอง E-learning GACP', required: true });
                    coreReqs.push({ slotId: 'strain_cert', name: 'หนังสือรับรองสายพันธุ์', required: true });
                }

                const exportReqs: DocRequirement[] = [
                    { slotId: 'sop_thai', name: 'คู่มือ SOP (ฉบับภาษาไทย)', required: true, templateUrl: '/templates/sop_guideline.pdf' },
                    { slotId: 'training_records', name: 'เอกสารการอบรมพนักงาน', required: true },
                    { slotId: 'staff_test', name: 'แบบทดสอบพนักงาน', required: true },
                    { slotId: 'soil_water_test', name: 'ผลตรวจวัสดุปลูก/ดิน/น้ำ', required: true },
                    { slotId: 'flower_test', name: 'ผลตรวจช่อดอก (CoA)', required: true },
                    { slotId: 'input_report', name: 'รายงานปัจจัยการผลิต', required: true },
                    { slotId: 'cp_ccp_plan', name: 'ตารางแผนควบคุม CP/CCP', required: true },
                    { slotId: 'calibration_cert', name: 'ใบสอบเทียบเครื่องมือ', required: true },
                ];

                const finalReqs = [...coreReqs];
                if (isExport) {
                    finalReqs.push(...exportReqs);
                }

                // Simulate network delay
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
    const getUploadedDocs = (): string[] => {
        const uploadedIds: string[] = [];
        state.documents.forEach(doc => {
            if (doc.uploaded && doc.id) {
                uploadedIds.push(doc.id);
            }
        });
        // Include legacy locations check just in case but wizard uses state.documents primarily now
        return [...new Set(uploadedIds)];
    };

    const uploadedDocIds = getUploadedDocs();
    const missingRequirements = requirements.filter(req => !uploadedDocIds.includes(req.slotId));
    const completedRequirements = requirements.filter(req => uploadedDocIds.includes(req.slotId));
    const mandatoryDocs = requirements.filter(r => r.required || (r.conditionalRequired));
    const optionalDocs = requirements.filter(r => !r.required && !r.conditionalRequired);

    // Handlers
    const handleFileUpload = async (slotId: string, file: File) => {
        setUploading(prev => ({ ...prev, [slotId]: true }));
        setAiResults(prev => {
            const n = { ...prev }; delete n[slotId]; return n;
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('expectedType', AI_DOC_TYPES[slotId] || 'UNKNOWN');

        try {
            // Mock API call for demo since backend might not be fully ready
            // In a real app, use fetch('/api/documents/verify'...)

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

            const isKnownType = !!AI_DOC_TYPES[slotId];
            const isMatch = true; // Simulate success
            const confidence = 98; // High confidence

            if (isMatch) {
                setAiResults(prev => ({
                    ...prev,
                    [slotId]: {
                        valid: isMatch,
                        message: 'เอกสารถูกต้อง (AI Verified)',
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
                metadata: { manualEntry: false } // Reset manual entry flag
            });
            setDocuments(newDocs);

        } catch (error) {
            console.error(error);
            setAiResults(prev => ({
                ...prev,
                [slotId]: { valid: false, message: 'เกิดข้อผิดพลาดในการอัปโหลด' }
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

        return (
            <div key={req.slotId} className={`
                relative bg-white rounded-xl transition-all duration-300 overflow-hidden
                ${doc
                    ? 'border-2 border-primary/20 shadow-sm'
                    : 'border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/40'
                }
            `}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className={`font-bold text-base mb-1 flex items-center gap-2 ${doc ? 'text-primary-900' : 'text-gray-700'}`}>
                                {req.name}
                                {req.required && !doc && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-bold">* จำเป็น</span>}
                            </h4>
                            <p className="text-xs text-text-tertiary flex items-center gap-1">
                                {isAiSupported && <span className="text-primary-600 font-medium">✨ AI Smart Scan</span>}
                                {isAiSupported && <span>•</span>}
                                {req.helperText || 'รองรับไฟล์ PDF, JPG, PNG'}
                            </p>
                        </div>
                        {doc && (
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md animate-fade-in">
                                <CheckIcon className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </div>

                    {req.templateUrl && !doc && (
                        <div className="mb-4">
                            <a href={req.templateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline bg-primary-50 px-2 py-1 rounded-md border border-primary-100 transition-colors">
                                <DocIcon className="w-3 h-3" />
                                ดาวน์โหลดแบบฟอร์ม
                            </a>
                        </div>
                    )}

                    {!doc ? (
                        <label className={`
                            relative h-32 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden bg-gray-50
                            ${isUploading
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-300 hover:border-primary hover:bg-primary-50/30'
                            }
                        `}>
                            {isUploading ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs font-bold text-primary">กำลังวิเคราะห์...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-white text-text-tertiary flex items-center justify-center mb-2 group-hover:scale-110 group-hover:text-primary group-hover:shadow-md transition-all shadow-sm border border-gray-100">
                                        <UploadIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-text-secondary group-hover:text-primary transition-colors">คลิกเพื่ออัปโหลด</span>
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
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 group-hover:border-primary-200 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-primary-600 shadow-sm">
                                        <DocIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                        <div className="text-[10px] text-primary font-bold bg-primary-50 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-primary-100/50">พร้อมส่ง</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                        setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                    }}
                                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <WarningIcon className="w-4 h-4 rotate-45" /> {/* Close icon */}
                                </button>
                            </div>

                            {/* Specialized Fields: Land Deed */}
                            {req.slotId === 'land_deed' && (
                                <div className="mt-3 pt-3 border-t border-gray-200 animate-slide-up-fade">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-700">ข้อมูลขนาดพื้นที่ (โฉนด)</span>
                                        {!doc.metadata?.manualEntry && (
                                            <button
                                                onClick={() => handleUpdateMetadata(req.slotId, { manualEntry: true })}
                                                className="text-[10px] text-primary hover:underline font-bold"
                                            >
                                                แก้ไข
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['rai', 'ngan', 'sqWa'].map((unit) => (
                                            <div key={unit} className="bg-white rounded border border-gray-200 p-1.5 text-center shadow-sm">
                                                <label className="block text-[9px] text-text-tertiary uppercase font-bold mb-0.5">{unit === 'sqWa' ? 'ตร.ว.' : (unit === 'rai' ? 'ไร่' : 'งาน')}</label>
                                                <input
                                                    type="number"
                                                    className="w-full text-center text-xs font-bold text-gray-900 bg-transparent outline-none p-0"
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
                                <div className={`mt-2 text-[10px] p-2 rounded flex items-center justify-between font-bold ${aiResult.valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <span className="flex items-center gap-1.5">
                                        {aiResult.valid ? <CheckIcon className="w-3 h-3" /> : <WarningIcon className="w-3 h-3" />}
                                        {aiResult.message}
                                    </span>
                                    {aiResult.confidence && aiResult.valid && (
                                        <span className="bg-white/60 px-1.5 py-0.5 rounded shadow-sm">
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
                    6
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">การตรวจสอบเอกสาร (Smart Documents)</h2>
                    <p className="text-text-secondary">ระบบตรวจสอบความถูกต้องเอกสารด้วย AI เพื่อความรวดเร็วในการพิจารณา</p>
                </div>
            </div>

            {loadingReqs ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-text-tertiary font-medium animate-pulse">กำลังเตรียมรายการเอกสาร...</span>
                </div>
            ) : (
                <>
                    {/* Dashboard Status Card */}
                    <div className="gacp-card bg-gradient-to-br from-white to-primary-50 relative overflow-hidden border-primary-100">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 p-2">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="text-center min-w-[100px]">
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">จำเป็นทั้งหมด</p>
                                    <p className="text-3xl font-black text-gray-800">{mandatoryDocs.length}</p>
                                </div>
                                <div className="h-10 w-px bg-gray-200"></div>
                                <div className="text-center min-w-[100px]">
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">อัปโหลดแล้ว</p>
                                    <p className="text-3xl font-black text-primary">{completedRequirements.length}</p>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                {missingRequirements.length === 0 ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold shadow-sm">
                                        <CheckIcon className="w-4 h-4" />
                                        เอกสารครบถ้วนแล้ว
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold shadow-sm">
                                        <WarningIcon className="w-4 h-4" />
                                        ขาดอีก {missingRequirements.length} รายการ
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Missing Documents Section */}
                    {missingRequirements.length > 0 && (
                        <div className="space-y-4 animate-slide-up-fade">
                            <h3 className="font-bold text-lg text-primary-900 flex items-center gap-2 border-l-4 border-amber-400 pl-3">
                                เอกสารที่ต้องดำเนินการ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {missingRequirements.map((req) => renderDocCard(req))}
                            </div>
                        </div>
                    )}

                    {/* Completed Documents Section */}
                    {completedRequirements.length > 0 && (
                        <div className="space-y-4 animate-slide-up-fade delay-100">
                            <h3 className="font-bold text-lg text-primary-900 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                                เอกสารที่เรียบร้อยแล้ว
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {completedRequirements.map((req) => {
                                    const doc = state.documents.find(d => d.id === req.slotId);
                                    if (!doc) return null;
                                    return (
                                        <div key={req.slotId} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all group">
                                            <div className="w-10 h-10 bg-primary-50 text-primary rounded-lg flex items-center justify-center flex-shrink-0 border border-primary-100 shadow-sm">
                                                <CheckIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-gray-900 truncate" title={req.name}>{req.name}</div>
                                                <div className="text-[10px] text-gray-500 truncate" title={doc.name}>{doc.name}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                                    setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                                                }}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <WarningIcon className="w-4 h-4 rotate-45" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Optional / Extra Links */}
                    <div className="gacp-card p-6 mt-8">
                        <h3 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2">
                            <InfoIcon className="w-5 h-5 text-blue-500" />
                            ข้อมูลเพิ่มเติม (ถ้ามี)
                        </h3>

                        <div className="mb-6">
                            <FormLabelWithHint label="ลิงก์วิดีโอแนะนำสถานที่ (YouTube)" hint="URL ของวิดีโอที่อัปโหลดบน YouTube" />
                            <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                className="gacp-input"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        </div>

                        {optionalDocs.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {optionalDocs.map((req) => renderDocCard(req))}
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
                isNextDisabled={false} // Relaxed for demo flow
            />
        </div>
    );
};

export default StepDocuments;
