'use client';

import { useRouter } from 'next/navigation';
import { useWizardStore } from '../hooks/useWizardStore';
import { CheckIcon } from '@/components/icons/WizardIcons';

export const StepSuccess = () => {
    const router = useRouter();
    const { state } = useWizardStore();

    // Use actual Application ID/Number from store (set during StepReview submission)
    const appId = state.applicationId || `GACP-TEMP-${new Date().getTime().toString().slice(-4)}`;

    return (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in max-w-2xl mx-auto text-center font-thai pb-20">
            {/* Success Icon */}
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-success-200 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-success-100 to-emerald-50 rounded-full flex items-center justify-center shadow-green-glow group-hover:scale-105 transition-transform duration-500 ring-8 ring-success-50">
                    <CheckIcon className="w-16 h-16 text-success-600 drop-shadow-sm animate-bounce-small" />
                </div>
            </div>

            <h2 className="text-4xl font-bold text-primary-900 mb-4 tracking-tight">ส่งคำขอสำเร็จ!</h2>
            <p className="text-text-secondary mb-10 text-lg leading-relaxed max-w-lg mx-auto">
                <span className="font-bold text-primary block mb-2 text-sm tracking-wide uppercase">Submission Successful</span>
                ขอบคุณที่สมัครเข้าร่วมโครงการ GACP<br />
                ทีมงานได้รับข้อมูลของท่านเรียบร้อยแล้ว
            </p>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all mb-10 w-full relative overflow-hidden group">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-success-50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none opacity-60"></div>

                <div className="relative z-10">
                    <div className="text-xs font-bold text-text-tertiary mb-3 uppercase tracking-widest">เลขที่คำขอ (Application Case ID)</div>
                    <div className="text-3xl font-mono font-bold text-primary-900 mb-6 bg-gray-50 py-4 px-6 rounded-2xl border border-gray-100 inline-block shadow-inner tracking-tight">
                        {appId}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-text-secondary border-b border-gray-100 pb-6 mb-6">
                        <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                        โปรดบันทึกรหัสนี้ไว้เพื่อติดตามสถานะ
                    </div>

                    <div className="text-left bg-primary-50/50 p-6 rounded-2xl border border-primary-100/50">
                        <p className="text-sm font-bold text-primary-900 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            ข้อมูลงานวิจัย (Research Info):
                        </p>
                        <div className="space-y-3 pl-3 border-l-2 border-primary-200">
                            <div className="text-sm text-text-secondary">
                                <span className="font-semibold text-primary-800 mr-2">โครงการ:</span> พัฒนามาตรฐาน GACP สมุนไพรไทย
                            </div>
                            <div className="text-sm text-text-secondary">
                                <span className="font-semibold text-primary-800 mr-2">ผู้วิจัย:</span> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                            </div>
                            <div className="text-sm text-text-secondary">
                                <span className="font-semibold text-primary-800 mr-2">ติดต่อ:</span> support@gacp-research.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 w-full max-w-sm">
                <button
                    onClick={() => router.push('/farmer/dashboard')}
                    className="w-full btn-primary bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    กลับสู่หน้าหลัก
                </button>
                <button
                    onClick={() => window.print()}
                    className="w-full btn-secondary bg-white text-text-secondary border border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                    พิมพ์ใบเสร็จ/ใบสมัคร
                </button>
            </div>
        </div>
    );
};

export default StepSuccess;
