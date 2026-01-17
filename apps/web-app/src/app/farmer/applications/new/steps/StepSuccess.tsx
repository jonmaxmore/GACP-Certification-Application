'use client';

import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';
import { CheckIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StepSuccess = () => {
    const router = useRouter();
    const { state } = useWizardStore();
    const { dict } = useLanguage();

    // Use actual Application ID/Number from store
    const appId = state.applicationId || `GACP-TMP-${new Date().getTime().toString().slice(-6)}`;

    return (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in max-w-2xl mx-auto text-center pb-24">

            {/* Celebratory Icon */}
            <div className="mb-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckIcon className="w-12 h-12 text-emerald-600" />
                </div>
            </div>

            <div className="space-y-4 mb-12 animate-slide-up">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ส่งคำขอรับรองสำเร็จ!</h2>
                <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto">
                    ขอบคุณที่ร่วมเป็นส่วนหนึ่งของการยกระดับมาตรฐานพืชสมุนไพรไทย
                    ทีมงานได้รับข้อมูลและหลักฐานการชำระเงินเรียบร้อยแล้ว
                </p>
            </div>

            <div className="w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 relative overflow-hidden group/card">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.wizard.success.caseId}</p>
                        <div className="text-2xl font-mono font-bold text-emerald-600 flex items-center gap-2">
                            {appId}
                            <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600">
                                <Icons.Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            สถานะ: รอการตรวจสอบ
                        </p>
                    </div>

                    <div className="space-y-4 flex flex-col justify-center">
                        <div className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Icons.Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">ใช้เวลาตรวจสอบ</p>
                                <p className="text-xs text-slate-500">ประมาณ 3-5 วันทำการ</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Icons.Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">แจ้งเตือนสถานะ</p>
                                <p className="text-xs text-slate-500">ผ่าน SMS & Email</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Research Info Banner -- Simplified */}
                <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                    <div className="flex gap-3 items-start">
                        <Icons.Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-blue-900 text-sm mb-1">{dict.wizard.success.researchInfo.title}</p>
                            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1">
                                <p className="text-xs text-blue-700/80">Project: {dict.wizard.success.researchInfo.project}</p>
                                <p className="text-xs text-blue-700/80">Lead: {dict.wizard.success.researchInfo.researcher}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <button
                        onClick={() => router.push('/farmer/dashboard')}
                        className="flex-1 py-3 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Icons.Home className="w-4 h-4" />
                        กลับสู่หน้าหลัก
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-3 px-6 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Icons.Printer className="w-4 h-4" />
                        พิมพ์
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ระบบจัดการคำขอมาตรฐาน GACP กรมการแพทย์แผนไทยฯ
                </p>
            </div>
        </div>
    );
};

export default StepSuccess;
