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
}

export const StepDocuments = () => {
    const { state, setDocuments, setCurrentStep } = useWizardStore();
    const [requirements, setRequirements] = useState<DocRequirement[]>([]);
    const [loadingReqs, setLoadingReqs] = useState(true);

    // Upload Status State
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [aiResults, setAiResults] = useState<Record<string, { valid: boolean; message: string; confidence?: number }>>({});

    useEffect(() => {
        const fetchRequirements = async () => {
            try {
                // Determine Plant Type (Mock logic based on ID for now, ideal is API)
                // In real app, we might call /api/documents/requirements/:plantId
                // Here we use the static hardcoded list from validation.js logic for simplicity in demo
                const isHighControl = ['cannabis', 'kratom'].includes(state.plantId || '');

                const reqs: DocRequirement[] = [
                    { slotId: 'id_card', name: 'สำเนาบัตรประชาชน', required: true },
                    { slotId: 'house_reg', name: 'สำเนาทะเบียนบ้าน', required: true },
                    { slotId: 'land_deed', name: 'เอกสารสิทธิ์ที่ดิน (โฉนด/น.ส.3)', required: true },
                    { slotId: 'site_map', name: 'แผนผังฟาร์ม (Map)', required: true },
                    { slotId: 'photos_exterior', name: 'ภาพถ่ายแปลงปลูก', required: true },
                ];

                if (isHighControl) {
                    reqs.push({ slotId: 'license_bt11', name: 'ใบอนุญาตปลูก (บท.11)', required: true });
                }

                setRequirements(reqs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingReqs(false);
            }
        };
        fetchRequirements();
    }, [state.plantId]);

    const handleFileUpload = async (slotId: string, file: File) => {
        // 1. Set Uploading State
        setUploading(prev => ({ ...prev, [slotId]: true }));
        setAiResults(prev => {
            const newRes = { ...prev };
            delete newRes[slotId];
            return newRes;
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('expectedType', AI_DOC_TYPES[slotId] || 'UNKNOWN');

        try {
            // 2. Call AI Verification API
            // Note: In real world, we upload to storage first, then verify. 
            // Here we send file directly to verify endpoint for demo.
            const res = await api.post<any>('/documents/verify', null, {
                body: formData as any, // Bypass type check for FormData
                headers: {} // Let browser set boundary
                // Note: ApiClient might force Content-Type: application/json. 
                // We need to handle this. For now let's assume we can pass FormData to fetch.
            });

            // Hack: ApiClient automatically sets JSON content type. 
            // We should use fetch directly for FormData or modify ApiClient to support it.
            // Let's us native fetch here for safety.
            const token = localStorage.getItem('auth_token'); // Or get from cookie
            const verifyRes = await fetch('/api/documents/verify', {
                method: 'POST',
                body: formData,
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Do NOT set this manually
                    // Authorization: `Bearer ${token}` // If needed
                }
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
                    url: URL.createObjectURL(file) // Mock URL for preview
                });
                setDocuments(newDocs);

            } else {
                throw new Error(result.error || 'Verification failed');
            }

        } catch (error) {
            console.error(error);
            setAiResults(prev => ({
                ...prev,
                [slotId]: { valid: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' }
            }));
        } finally {
            setUploading(prev => ({ ...prev, [slotId]: false }));
        }
    };

    const isNextDisabled = requirements.filter(r => r.required).some(r =>
        !state.documents.find(d => d.id === r.slotId && d.uploaded)
    );

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    เอกสารประกอบ (Smart Docs)
                </h2>
                <p className="text-gray-500 mt-2">ระบบ AI จะช่วยตรวจสอบความถูกต้องของเอกสารอัตโนมัติ</p>
            </div>

            {loadingReqs ? (
                <div className="text-center py-10 text-gray-400">Loading requirements...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map((req) => {
                        const doc = state.documents.find(d => d.id === req.slotId);
                        const isUploading = uploading[req.slotId];
                        const aiResult = aiResults[req.slotId];

                        return (
                            <div key={req.slotId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                            {req.name}
                                            {req.required && <span className="text-red-500 text-xs">*</span>}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {AI_DOC_TYPES[req.slotId] ? 'รองรับ AI Scan 🤖' : 'อัปโหลดทั่วไป'}
                                        </p>
                                    </div>
                                    {doc && (
                                        <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-medium">
                                            อัปโหลดแล้ว
                                        </span>
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
                    })}
                </div>
            )}

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => setCurrentStep(5)}
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
};
