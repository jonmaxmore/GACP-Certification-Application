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
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in max-w-3xl mx-auto text-center pb-24">

            {/* Celebratory Icon */}
            <div className="relative mb-12 group">
                <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20 scale-150"></div>
                <div className="absolute inset-0 bg-primary-200 rounded-full animate-pulse opacity-20 scale-125"></div>
                <div className="relative w-40 h-40 bg-gradient-to-br from-primary to-primary-700 rounded-full flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform duration-700 ring-8 ring-primary-50">
                    <CheckIcon className="w-20 h-20 text-white drop-shadow-xl animate-bounce-small" />
                </div>
            </div>

            <div className="space-y-4 mb-12 animate-slide-up">
                <h2 className="text-5xl font-black text-primary-900 tracking-tighter">ส่งคำขอรับรองสำเร็จ!</h2>
                <div className="flex flex-col items-center gap-2">
                    <div className="h-1 w-20 bg-primary/20 rounded-full"></div>
                    <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-lg mx-auto">
                        ขอบคุณที่ร่วมเป็นส่วนหนึ่งของการยกระดับมาตรฐานพืชสมุนไพรไทย
                        ทีมงานได้รับข้อมูลและหลักฐานการชำระเงินเรียบร้อยแล้ว
                    </p>
                </div>
            </div>

            <div className="w-full bg-white rounded-[3rem] p-10 shadow-premium border border-gray-100 relative overflow-hidden group animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary-100/50 transition-colors duration-1000"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 relative overflow-hidden group/card shadow-inner">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{dict.wizard.success.caseId}</p>
                        <div className="text-3xl font-black text-primary font-mono tracking-tight flex items-center gap-3">
                            {appId}
                            <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-300 hover:text-primary">
                                <Icons.Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            สถานะ: รอการตรวจสอบเอกสารเบื้องต้น
                        </p>
                    </div>

                    <div className="space-y-4 flex flex-col justify-center">
                        <div className="flex gap-4 items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-800">ใช้เวลาตรวจสอบบรื้องต้น</p>
                                <p className="text-[10px] text-gray-500 font-bold">ประมาณ 3-5 วันทำการ</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Icons.Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-800">แจ้งเตือนผ่าน SMS & Email</p>
                                <p className="text-[10px] text-gray-500 font-bold">เมื่อมีการอัปเดตสถานะคำขอ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Research Info Banner */}
                <div className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl p-6 mb-10 text-left shadow-sm">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                            <Icons.Info className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-blue-900 text-sm mb-1">{dict.wizard.success.researchInfo.title}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                <p className="text-[10px] font-bold text-blue-800/60 uppercase tracking-tight">Project: {dict.wizard.success.researchInfo.project}</p>
                                <p className="text-[10px] font-bold text-blue-800/60 uppercase tracking-tight">Lead: {dict.wizard.success.researchInfo.researcher}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <button
                        onClick={() => router.push('/farmer/dashboard')}
                        className="flex-[2] py-4 px-8 bg-gray-900 text-white rounded-3xl font-black text-sm hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Icons.Home className="w-5 h-5" />
                        เข้าสู่หน้าจัดการคำขอ (Dashboard)
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-4 px-8 bg-white text-gray-700 border border-gray-100 rounded-3xl font-black text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-soft hover:shadow-premium-hover active:scale-95"
                    >
                        <Icons.Printer className="w-5 h-5" />
                        พิมพ์หน้านี้
                    </button>
                </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                ระบบจัดการคำขอมาตรฐาน GACP กรมการแพทย์แผนไทยฯ
            </p>
        </div>
    );
};

export default StepSuccess;
