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
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    12
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ยืนยันการส่งคำขอ</h2>
                    <p className="text-slate-500 text-sm">กรุณายอมรับข้อกำหนดและเงื่อนไขทางกฎหมายก่อนส่งข้อมูล</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-slide-up text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Icons.ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">สรุปข้อมูลคำขอ</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                    ท่านกำลังจะส่งคำขอรับรองมาตรฐาน GACP สำหรับ <strong className="text-slate-800">{state.plantId?.toUpperCase() || '-'}</strong>
                    <br />เพื่อวัตถุประสงค์ <strong className="text-slate-800">{state.certificationPurpose || '-'}</strong>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-left">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ผู้ยื่นคำขอ</p>
                        <p className="font-bold text-slate-800 truncate">
                            {state.applicantData?.applicantType === 'INDIVIDUAL'
                                ? `${state.applicantData?.firstName} ${state.applicantData?.lastName}`
                                : state.applicantData?.applicantType === 'COMMUNITY'
                                    ? state.applicantData?.communityName
                                    : state.applicantData?.companyName || '-'
                            }
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สถานที่ผลิต</p>
                        <p className="font-bold text-slate-800 truncate">{state.farmData?.farmName || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Legal Checks */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div
                    onClick={() => toggleCheck('dataCorrect')}
                    className={`
                        group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border bg-white
                        ${confirmChecks.dataCorrect
                            ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                        }
                    `}
                >
                    <div className={`
                        w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 mt-0.5 shrink-0
                        ${confirmChecks.dataCorrect
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-slate-50 border-slate-300 group-hover:border-emerald-400'
                        }
                    `}>
                        {confirmChecks.dataCorrect && <CheckIcon className="w-3.5 h-3.5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm mb-1 transition-colors ${confirmChecks.dataCorrect ? 'text-emerald-900' : 'text-slate-800'}`}>
                            ยืนยันความถูกต้องของข้อมูล
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            ข้อมูลและเอกสารทั้งหมดเป็นความจริง หากตรวจพบว่าเป็นเท็จ ยินยอมให้ยกเลิกคำขอทันที
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => toggleCheck('termsAccepted')}
                    className={`
                         group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border bg-white
                        ${confirmChecks.termsAccepted
                            ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                        }
                    `}
                >
                    <div className={`
                        w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 mt-0.5 shrink-0
                        ${confirmChecks.termsAccepted
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-slate-50 border-slate-300 group-hover:border-emerald-400'
                        }
                    `}>
                        {confirmChecks.termsAccepted && <CheckIcon className="w-3.5 h-3.5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm mb-1 transition-colors ${confirmChecks.termsAccepted ? 'text-emerald-900' : 'text-slate-800'}`}>
                            ยอมรับข้อกำหนด (GACP Standards)
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            ข้าพเจ้าเข้าใจและตกลงที่จะปฏิบัติตามมาตรฐาน GACP อย่างเคร่งครัด
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => toggleCheck('paymentUnderstood')}
                    className={`
                         group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border bg-white
                        ${confirmChecks.paymentUnderstood
                            ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                            : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                        }
                    `}
                >
                    <div className={`
                        w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 mt-0.5 shrink-0
                        ${confirmChecks.paymentUnderstood
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-slate-50 border-slate-300 group-hover:border-emerald-400'
                        }
                    `}>
                        {confirmChecks.paymentUnderstood && <CheckIcon className="w-3.5 h-3.5 text-white animate-scale-in" />}
                    </div>
                    <div>
                        <h4 className={`font-bold text-sm mb-1 transition-colors ${confirmChecks.paymentUnderstood ? 'text-emerald-900' : 'text-slate-800'}`}>
                            รับทราบเรื่องค่าธรรมเนียม
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            จะต้องชำระค่าธรรมเนียมหลังจากได้รับใบแจ้งหนี้ (Invoice) เพื่อดำเนินการต่อ
                        </p>
                    </div>
                </div>
            </div>

            {/* Submission Warning */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <InfoIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-blue-900 text-sm">คำแนะนำ</p>
                    <p className="text-xs leading-relaxed text-blue-800/80">
                        เมื่อกดยืนยัน ข้อมูลจะถูกบันทึกเข้าระบบทันทีและไม่สามารถแก้ไขได้จนกว่าจะได้รับการตรวจสอบ
                    </p>
                </div>
            </div>

            <WizardNavigation
                onNext={handleSubmit}
                onBack={() => router.push('/farmer/applications/new/step/11')}
                isNextDisabled={!allChecked || isSubmitting}
                nextLabel={isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันและส่งคำขอ'}
            />
        </div>
    );
};

export default StepSubmit;
