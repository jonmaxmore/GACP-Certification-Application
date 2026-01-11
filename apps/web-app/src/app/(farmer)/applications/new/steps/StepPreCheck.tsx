'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';

export const StepPreCheck = () => {
    const { setCurrentStep } = useWizardStore();
    const [checks, setChecks] = useState({
        confirmTruth: false,
        acceptAudit: false,
        acknowledgePenalty: false,
        consentData: false
    });

    const allChecked = Object.values(checks).every(Boolean);

    const toggle = (key: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    ตรวจสอบก่อนส่ง (Pre-Submission Checklist)
                </h2>
                <p className="text-gray-500 mt-2">กรุณายืนยันความถูกต้องของข้อมูลก่อนดำเนินการต่อ</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div onClick={() => toggle('confirmTruth')} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all">
                    <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.confirmTruth ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                        {checks.confirmTruth && '✓'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">ยืนยันความถูกต้องของข้อมูล</h4>
                        <p className="text-sm text-slate-500">ข้าพเจ้ายืนยันว่าเอกสารและข้อมูลทั้งหมดที่แนบมาเป็นความจริงทุกประการ</p>
                    </div>
                </div>

                <div onClick={() => toggle('acceptAudit')} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all">
                    <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.acceptAudit ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                        {checks.acceptAudit && '✓'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">ยินยอมให้เข้าตรวจสถานประกอบการ</h4>
                        <p className="text-sm text-slate-500">ข้าพเจ้ายินยอมให้เจ้าหน้าที่เข้าตรวจสอบพื้นที่แปลงปลูกและโรงเรือนตามนัดหมาย</p>
                    </div>
                </div>

                <div onClick={() => toggle('acknowledgePenalty')} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all">
                    <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.acknowledgePenalty ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                        {checks.acknowledgePenalty && '✓'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">รับทราบบทลงโทษ</h4>
                        <p className="text-sm text-slate-500">หากตรวจสอบพบว่ามีการปลอมแปลงเอกสาร หรือให้ข้อมูลเท็จ คำขอจะถูกยกเลิกและอาจถูกดำเนินคดีตามกฎหมาย</p>
                    </div>
                </div>

                <div onClick={() => toggle('consentData')} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-emerald-100 transition-all">
                    <div className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.consentData ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                        {checks.consentData && '✓'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">ยินยอมเปิดเผยข้อมูล (PDPA)</h4>
                        <p className="text-sm text-slate-500">ข้าพเจ้ายินยอมให้หน่วยงานรัฐจัดเก็บและเปิดเผยข้อมูลเพื่อประโยชน์ในการรับรองมาตรฐาน GACP</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(4)} // Back to Docs
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => setCurrentStep(6)} // Go to Review (Since we insert at 5)
                    disabled={!allChecked}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${allChecked
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ยืนยันและดำเนินการต่อ (Next) →
                </button>
            </div>
        </div>
    );
};
