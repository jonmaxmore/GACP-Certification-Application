'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, DocumentUpload } from '../hooks/useWizardStore';
import { api } from '@/lib/api/api-client';

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
    const { state, setDocuments, setYoutubeUrl: saveToStoreYoutubeUrl, setCurrentStep } = useWizardStore();
    const [requirements, setRequirements] = useState<DocRequirement[]>([]);
    const [loadingReqs, setLoadingReqs] = useState(true);
    const [youtubeUrl, setYoutubeUrl] = useState(state.youtubeUrl || ''); // local state
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [aiResults, setAiResults] = useState<Record<string, { valid: boolean; message: string; confidence?: number }>>({});

    // Sync store state to local state on mount
    useEffect(() => {
        if (state.youtubeUrl) setYoutubeUrl(state.youtubeUrl);
    }, [state.youtubeUrl]);

    // ... (useEffect for loading reqs remains same)

    useEffect(() => {
        const fetchRequirements = async () => {
            setLoadingReqs(true);
            try {
                const isHighControl = ['cannabis', 'kratom'].includes(state.plantId || '');

                // --- 1. CORE MANDATORY (GACP) ---
                // Based on User's provided list
                const coreReqs: DocRequirement[] = [
                    {
                        slotId: 'APP_FORM',
                        name: 'แบบลงทะเบียนยื่นคำขอ *',
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

                // Add Plant Specifics
                if (isHighControl) {
                    coreReqs.push({ slotId: 'elearning_cert', name: 'หนังสือรับรอง E-learning GACP', required: true });
                    coreReqs.push({ slotId: 'strain_cert', name: 'หนังสือรับรองสายพันธุ์', required: true });
                }

                // --- 2. EXPORT SPECIFIC (Step 1 Selected 'EXPORT') ---
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

                // Filter logic
                const isExport = state.certificationPurpose === 'EXPORT';
                const finalReqs = [...coreReqs];

                if (isExport) {
                    finalReqs.push(...exportReqs);
                }

                setRequirements(finalReqs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingReqs(false);
            }
        };
        fetchRequirements();
    }, [state.plantId, state.siteData?.landOwnership, state.certificationPurpose]); // Added dep on landOwnership

    // ... (handleFileUpload and rest remain same) ...

    const handleFileUpload = async (slotId: string, file: File) => {
        setUploading(prev => ({ ...prev, [slotId]: true }));
        setAiResults(prev => {
            const n = { ...prev }; delete n[slotId]; return n;
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('expectedType', AI_DOC_TYPES[slotId] || 'UNKNOWN');

        try {
            // Using fetch directly as workaround for ApiClient content-type issue
            const verifyRes = await fetch('/api/documents/verify', {
                method: 'POST',
                body: formData,
            });
            const result = await verifyRes.json();

            // 3. Process Result
            if (result.success && result.data.verification) {
                const { isMatch, confidence, message } = result.data.verification;

                setAiResults(prev => ({
                    ...prev,
                    [slotId]: {
                        valid: isMatch,
                        message: isMatch ? '✅ เอกสารถูกต้อง (AI Verified)' : `❌ ${message || 'เอกสารไม่ตรงประเภท'}`,
                        confidence
                    }
                }));

                // Update Store
                const newDocs = [...state.documents.filter(d => d.id !== slotId)];
                newDocs.push({
                    id: slotId,
                    name: file.name,
                    uploaded: true,
                    url: URL.createObjectURL(file),
                    metadata: result.data.extractedData || {}
                });
                setDocuments(newDocs);

            } else {
                throw new Error(result.error || 'Verification failed');
            }

        } catch (error) {
            console.error(error);
            setAiResults(prev => ({
                ...prev,
                [slotId]: { valid: false, message: 'เกิดข้อผิดพลาด/ไม่สามารถระบุประเภท' }
            }));
            // Allow upload anyway
            const newDocs = [...state.documents.filter(d => d.id !== slotId)];
            newDocs.push({ id: slotId, name: file.name, uploaded: true, url: URL.createObjectURL(file) });
            setDocuments(newDocs);
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

    const isNextDisabled = requirements.filter(r => r.required || r.conditionalRequired).some(r =>
        !state.documents.find(d => d.id === r.slotId && d.uploaded)
    );

    // Grouping
    const mandatoryDocs = requirements.filter(r => r.required || (r.conditionalRequired));
    const optionalDocs = requirements.filter(r => !r.required && !r.conditionalRequired);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    หลักฐานและเอกสาร (Documents)
                </h2>
                <p className="text-gray-500 mt-2">กรุณาอัปโหลดเอกสารสำคัญและเอกสารเพิ่มเติมสำหรับการส่งออก</p>
            </div>

            {loadingReqs ? (
                <div className="text-center py-10 text-gray-400">Loading requirements...</div>
            ) : (
                <>
                    {/* SECTION 1: CORE GACP */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm">ส่วนที่ 1</span>
                            เอกสารบังคับ (GACP Core)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mandatoryDocs.map((req) => renderDocCard(req))}
                        </div>
                    </div>

                    {/* SECTION 2: YOUTUBE VIDEO & LINKS */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 ลิงก์และเอกสารเพิ่มเติม</h3>

                        {/* YouTube Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">ลิงก์วิดีโอสถานที่/คลิปแนะนำฟาร์ม (YouTube/Drive)</label>
                            <input
                                type="text"
                                placeholder="https://youtube.com/..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        </div>

                        {/* Optional Docs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {optionalDocs.map((req) => renderDocCard(req))}
                        </div>
                    </div>


                </>
            )}

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(5)} // Back to Harvest
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => {
                        saveToStoreYoutubeUrl(youtubeUrl);
                        setCurrentStep(7); // Next to PreCheck
                    }}
                    disabled={isNextDisabled}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${!isNextDisabled
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>
        </div>
    );

    function renderDocCard(req: DocRequirement) {
        const doc = state.documents.find(d => d.id === req.slotId);
        const isUploading = uploading[req.slotId];
        const aiResult = aiResults[req.slotId];

        return (
            <div key={req.slotId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            {req.name}
                            {req.required && <span className="text-red-500 text-xs">*</span>}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                            {AI_DOC_TYPES[req.slotId] ? 'รองรับ AI Scan 🤖' : 'อัปโหลดทั่วไป'}
                        </p>
                    </div>
                    {doc && (
                        <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-medium">
                            อัปโหลดแล้ว
                        </span>
                    )}
                </div>

                {/* Helper Text & Template Link */}
                <div className="mb-4 text-xs text-slate-500">
                    {req.helperText && <p className="mb-1">ℹ️ {req.helperText}</p>}
                    {req.templateUrl && (
                        <a href={req.templateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            📥 ดาวน์โหลดแบบฟอร์ม
                        </a>
                    )}
                </div>

                {/* Upload Area */}
                {!doc ? (
                    <label className={`
                        border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-all
                        ${isUploading
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                        }
                    `}>
                        {isUploading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-blue-600 text-sm font-semibold">AI กำลังสแกน...</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-3xl text-gray-400 mb-2">☁️</span>
                                <span className="text-sm text-gray-500">คลิกเพื่ออัปโหลด</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(req.slotId, file);
                                    }}
                                />
                            </>
                        )}
                    </label>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center text-xl">📄</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 truncate">{doc.name}</div>
                                <div className="text-xs text-emerald-600">พร้อมส่ง</div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setDocuments(state.documents.filter(d => d.id !== req.slotId));
                                setAiResults(prev => { const n = { ...prev }; delete n[req.slotId]; return n; });
                            }}
                            className="text-red-400 hover:text-red-600 p-2"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* [NEW] Metadata / Manual Input (Specifically for Land Deed) */}
                {doc && req.slotId === 'land_deed' && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-700 mb-2 flex justify-between items-center">
                            <span>ข้อมูลโฉนด (Land Info)</span>
                            {!doc.metadata?.manualEntry && (
                                <button
                                    onClick={() => handleUpdateMetadata(req.slotId, { manualEntry: true })}
                                    className="text-[10px] text-blue-600 underline"
                                >
                                    แก้ไข (Edit)
                                </button>
                            )}
                        </h5>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[10px] text-slate-500">ไร่ (Rai)</label>
                                <input
                                    type="number"
                                    className="w-full text-xs border rounded p-1 text-center"
                                    value={doc.metadata?.area?.rai ?? ''}
                                    placeholder="0"
                                    onChange={(e) => handleAreaChange(req.slotId, 'rai', e.target.value)}
                                    readOnly={!doc.metadata?.manualEntry && !!doc.metadata?.area}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500">งาน (Ngan)</label>
                                <input
                                    type="number"
                                    className="w-full text-xs border rounded p-1 text-center"
                                    value={doc.metadata?.area?.ngan ?? ''}
                                    placeholder="0"
                                    onChange={(e) => handleAreaChange(req.slotId, 'ngan', e.target.value)}
                                    readOnly={!doc.metadata?.manualEntry && !!doc.metadata?.area}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500">ตร.ว. (Sq.Wa)</label>
                                <input
                                    type="number"
                                    className="w-full text-xs border rounded p-1 text-center"
                                    value={doc.metadata?.area?.sqWa ?? ''}
                                    placeholder="0"
                                    onChange={(e) => handleAreaChange(req.slotId, 'sqWa', e.target.value)}
                                    readOnly={!doc.metadata?.manualEntry && !!doc.metadata?.area}
                                />
                            </div>
                        </div>
                        {doc.metadata?.manualEntry && (
                            <p className="text-[10px] text-amber-600 mt-1">* กรุณาระบุขนาดพื้นที่ตามหน้าโฉนด</p>
                        )}
                    </div>
                )}

                {/* AI Result Feedback */}
                {aiResult && (
                    <div className={`mt-3 text-xs p-2 rounded-lg flex items-center gap-2 ${aiResult.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                        <span>{aiResult.message}</span>
                        {aiResult.confidence && aiResult.valid && (
                            <span className="bg-emerald-200 text-emerald-800 px-1.5 rounded text-[10px]">
                                {Math.round(aiResult.confidence)}%
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }
};
