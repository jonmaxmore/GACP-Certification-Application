'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';

export const StepPreCheck = () => {
    const { setCurrentStep } = useWizardStore();
    const router = useRouter();
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
            {/* Official Header */}
            <header className="border-b-2 border-[#00695C] pb-6 mb-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-[#00695C] rounded-full" />
                    <h1 className="text-2xl font-bold text-[#263238]">ตรวจสอบก่อนส่ง</h1>
                </div>
                <p className="text-[#546E7A] text-sm ml-4">กรุณายืนยันความถูกต้องของข้อมูลก่อนดำเนินการต่อ</p>
            </header>

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
            <div className="pt-6 border-t border-[#CFD8DC] flex justify-between">
                <button
                    onClick={() => router.push('/farmer/applications/new/step/9')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[#00695C] border border-[#00695C] rounded-lg hover:bg-[#E0F2F1] transition-colors font-medium"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={() => router.push('/farmer/applications/new/step/11')}
                    disabled={!allChecked}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                        ${allChecked
                            ? 'bg-[#00695C] text-white hover:bg-[#00796B]'
                            : 'bg-[#CFD8DC] text-[#90A4AE] cursor-not-allowed'
                        }`}
                >
                    ยืนยันและดำเนินการต่อ
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};
