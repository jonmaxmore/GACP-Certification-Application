'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/api-client';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, InfoIcon, WarningIcon } from '@/components/icons/WizardIcons';
import { Icons } from '@/components/ui/icons';

export const StepSubmit = () => {
    const { state, setApplicationId } = useWizardStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmChecks, setConfirmChecks] = useState({
        dataCorrect: false,
        termsAccepted: false,
        paymentUnderstood: false,
    });

    const allChecked = confirmChecks.dataCorrect && confirmChecks.termsAccepted && confirmChecks.paymentUnderstood;

    const handleSubmit = async () => {
        if (!allChecked) return;

        setIsSubmitting(true);
        try {
            const applicationData = {
                applicantData: state.applicantData,
                farmData: state.farmData,
                siteData: state.siteData,
                lots: state.lots,
                documents: state.documents,
                plantId: state.plantId,
                certificationPurpose: state.certificationPurpose,
                locationType: state.locationType,
                fees: state.milestone1,
            };

            const response = await apiClient.post<{ _id: string; applicationNo: string }>('/applications/submit', applicationData);

            if (response.success && response.data) {
                setApplicationId(response.data.applicationNo || response.data._id);
                router.push('/farmer/applications/new/step/13');
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            // In a real app, show a toast. For now, alert is okay but let's make it better if possible.
            alert('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCheck = (key: keyof typeof confirmChecks) => {
        setConfirmChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    12
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ยืนยันการส่งคำขอรับรอง GACP</h2>
                    <p className="text-text-secondary">กรุณายอมรับข้อกำหนดและเงื่อนไขทางกฎหมายก่อนส่งข้อมูลเข้าสู่ระบบ</p>
                </div>
            </div>

            {/* Final Confirmation Hero */}
            <div className="gacp-card bg-gradient-to-br from-primary shadow-soft relative overflow-hidden border-none text-white p-10 animate-slide-up">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative z-10 space-y-8">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                            <Icons.ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2 max-w-2xl">
                            <h3 className="text-2xl font-black tracking-tight">สรุปข้อมูลคำขอ</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                ท่านกำลังจะส่งคำขอรับรองมาตรฐาน GACP สำหรับ <strong>{state.plantId?.toUpperCase() || '-'}</strong>
                                เพื่อวัตถุประสงค์ <strong>{state.certificationPurpose || '-'}</strong> กรุณาตรวจสอบความถูกต้องของข้อมูลผู้ยื่นคำขอและเงื่อนไขด้านล่าง
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">ผู้ยื่นคำขอ / องค์กร</p>
                            <p className="text-2xl font-black font-noto">
                                {state.applicantData?.applicantType === 'INDIVIDUAL'
                                    ? `${state.applicantData?.firstName} ${state.applicantData?.lastName}`
                                    : state.applicantData?.applicantType === 'COMMUNITY'
                                        ? state.applicantData?.communityName
                                        : state.applicantData?.companyName || '-'
                                }
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">สถานที่ผลิต (ฟาร์ม)</p>
                            <p className="text-2xl font-black font-noto">{state.farmData?.farmName || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Checks */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div
                    onClick={() => toggleCheck('dataCorrect')}
                    className={`
                        group flex items-start gap-5 p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2
                        ${confirmChecks.dataCorrect
                            ? 'bg-primary/5 border-primary/20 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50'
                        }
                    `}
                >
                    <div className={`
                        w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 flex-shrink-0 mt-0.5
                        ${confirmChecks.dataCorrect
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300 group-hover:border-primary'
                        }
                    `}>
                        {confirmChecks.dataCorrect && <CheckIcon className="w-5 h-5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-800 text-lg mb-1 leading-tight">ข้าพเจ้ายืนยันความถูกต้องของข้อมูล</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            ข้อมูลและเอกสารประกอบคำขอทั้งหมดที่ระบุในคำขอนี้เป็นความจริงและเป็นปัจจุบันทุกประการ
                            หากมีการตรวจพบว่าข้อมูลเป็นเท็จ ข้าพเจ้ายินยอมให้ยกเลิกคำขอทันที
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => toggleCheck('termsAccepted')}
                    className={`
                        group flex items-start gap-5 p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2
                        ${confirmChecks.termsAccepted
                            ? 'bg-primary/5 border-primary/20 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50'
                        }
                    `}
                >
                    <div className={`
                        w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 flex-shrink-0 mt-0.5
                        ${confirmChecks.termsAccepted
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300 group-hover:border-primary'
                        }
                    `}>
                        {confirmChecks.termsAccepted && <CheckIcon className="w-5 h-5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-800 text-lg mb-1 leading-tight">ข้าพเจ้าได้อ่านและยอมรับข้อกำหนด (GACP Standards)</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            ข้าพเจ้าเข้าใจมาตรฐานการปฏิบัติทางการเกษตรที่ดีสำหรับพืชสมุนไพร (GACP)
                            และตกลงที่จะปฏิบัติตามมาตรฐานอย่างเคร่งครัดตลอดระยะเวลาการรับรอง
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => toggleCheck('paymentUnderstood')}
                    className={`
                        group flex items-start gap-5 p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2
                        ${confirmChecks.paymentUnderstood
                            ? 'bg-primary/5 border-primary/20 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50'
                        }
                    `}
                >
                    <div className={`
                        w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 flex-shrink-0 mt-0.5
                        ${confirmChecks.paymentUnderstood
                            ? 'bg-primary border-primary'
                            : 'bg-white border-gray-300 group-hover:border-primary'
                        }
                    `}>
                        {confirmChecks.paymentUnderstood && <CheckIcon className="w-5 h-5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-800 text-lg mb-1 leading-tight">รับทราบเรื่องค่าธรรมเนียม</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            ข้าพเจ้าเข้าใจว่าจะต้องชำระค่าธรรมเนียมการตรวจประเมินหลังจากได้รับใบแจ้งหนี้ (Invoice)
                            และการไม่ชำระอาจส่งผลให้การพิจารณาคำขอหยุดชะงัก
                        </p>
                    </div>
                </div>
            </div>

            {/* Submission Warning */}
            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                    <InfoIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-blue-900 text-sm italic">คำแนะนำสำหรับการส่งคำขอ</p>
                    <p className="text-xs leading-relaxed text-blue-800/80">
                        เมื่อท่านกดยืนยัน ข้อมูลจะถูกบันทึกเข้าสู่ระบบ และท่านจะไม่สามารถกลับมาแก้ไขข้อมูลได้ด้วยตนเองจนกว่าเจ้าหน้าที่จะทำการตรวจสอบ
                        กรุณาตรวจสอบหน้า <strong>&quot;Preview&quot;</strong> อีกครั้งหากไม่มั่นใจ
                    </p>
                </div>
            </div>

            <WizardNavigation
                onNext={handleSubmit}
                onBack={() => router.push('/farmer/applications/new/step/11')}
                isNextDisabled={!allChecked || isSubmitting}
                nextLabel={isSubmitting ? 'กำลังส่งคำขอเข้าสู่ระบบ...' : 'ยืนยันและส่งคำขอ'}
            />
        </div>
    );
};

export default StepSubmit;
