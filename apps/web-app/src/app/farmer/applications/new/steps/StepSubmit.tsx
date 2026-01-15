'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/api-client';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, InfoIcon, WarningIcon } from '@/components/icons/WizardIcons';

export const StepSubmit = () => {
    const { state, setApplicationId } = useWizardStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmChecks, setConfirmChecks] = useState({
        dataCorrect: false,
        termsAccepted: false,
        paymentUnderstood: false,
    });

    // Calculate summary
    const totalPlots = state.siteData?.plots?.length || 0;
    const totalLots = state.lots?.length || 0;
    const totalPlants = state.lots?.reduce((sum, lot) => sum + (lot.plantCount || 0), 0) || 0;
    const totalDocs = state.documents?.filter(d => d.uploaded).length || 0;

    const allChecked = confirmChecks.dataCorrect && confirmChecks.termsAccepted && confirmChecks.paymentUnderstood;

    const handleSubmit = async () => {
        if (!allChecked) return;

        setIsSubmitting(true);
        try {
            // Prepare application data
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

            // Submit to API
            const response = await apiClient.post<{ _id: string; applicationNo: string }>('/applications/submit', applicationData);

            if (response.success && response.data) {
                // Save application ID for success page
                setApplicationId(response.data.applicationNo || response.data._id);
                router.push('/farmer/applications/new/step/13'); // Proceed to Quote (Step 13)
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    12
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ยืนยันการส่งคำขอ</h2>
                    <p className="text-text-secondary">ตรวจสอบความถูกต้องและยืนยันเพื่อดำเนินการต่อ</p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'แปลงปลูก', value: totalPlots, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1', color: 'primary', bg: 'from-primary-50 to-white', text: 'text-primary-600' },
                    { label: 'ล็อตการผลิต', value: totalLots, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'blue', bg: 'from-blue-50 to-white', text: 'text-blue-600' },
                    { label: 'จำนวนต้น', value: totalPlants.toLocaleString(), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'purple', bg: 'from-purple-50 to-white', text: 'text-purple-600' },
                    { label: 'เอกสารแนบ', value: totalDocs, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'orange', bg: 'from-orange-50 to-white', text: 'text-orange-600' },
                ].map((item, idx) => (
                    <div key={idx} className={`gacp-card bg-gradient-to-br ${item.bg} border-${item.color}-100 group`}>
                        <div className={`w-12 h-12 rounded-xl bg-${item.color}-50/50 ${item.text} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mb-0.5 tracking-tight group-hover:translate-x-1 transition-transform">{item.value}</p>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Info Card */}
            <div className="gacp-card relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none group-hover:bg-primary-200/40 transition-colors duration-700"></div>

                <h3 className="font-bold text-xl text-primary-900 mb-8 flex items-center gap-3 relative z-10">
                    <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                        <InfoIcon className="w-5 h-5" />
                    </span>
                    ข้อมูลผู้ยื่นคำขอ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 relative z-10">
                    <div className="group/item">
                        <label className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2 block group-hover/item:text-primary-700 transition-colors">ชื่อผู้ขอรับรอง</label>
                        <div className="text-xl font-medium text-gray-900 pb-2 border-b-2 border-primary-100 group-hover/item:border-primary-400 transition-colors font-noto">
                            {state.applicantData?.applicantType === 'INDIVIDUAL'
                                ? `${state.applicantData?.firstName} ${state.applicantData?.lastName}`
                                : state.applicantData?.applicantType === 'COMMUNITY'
                                    ? state.applicantData?.communityName
                                    : state.applicantData?.companyName
                            }
                        </div>
                    </div>
                    <div className="group/item">
                        <label className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2 block group-hover/item:text-primary-700 transition-colors">ชื่อฟาร์ม</label>
                        <div className="text-xl font-medium text-gray-900 pb-2 border-b-2 border-primary-100 group-hover/item:border-primary-400 transition-colors font-noto">{state.farmData?.farmName || '-'}</div>
                    </div>
                    <div className="group/item">
                        <label className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2 block group-hover/item:text-primary-700 transition-colors">ที่ตั้งฟาร์ม</label>
                        <div className="text-xl font-medium text-gray-900 pb-2 border-b-2 border-primary-100 group-hover/item:border-primary-400 transition-colors font-noto">
                            {state.farmData?.province} {state.farmData?.district ? `อ.${state.farmData.district}` : ''}
                        </div>
                    </div>
                    <div className="group/item">
                        <label className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2 block group-hover/item:text-primary-700 transition-colors">พืชที่ขอรับรอง</label>
                        <div className="text-xl font-medium text-gray-900 pb-2 border-b-2 border-primary-100 group-hover/item:border-primary-400 transition-colors capitalize">
                            {state.plantId || '-'} <span className="text-text-tertiary text-base font-normal">({state.certificationPurpose})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-orange-100/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
                <div className="relative z-10">
                    <h3 className="font-bold text-xl text-orange-900 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-orange-100 rounded-xl text-orange-600 flex items-center justify-center shadow-sm animate-pulse-slow">
                            <WarningIcon className="w-6 h-6" />
                        </span>
                        ยืนยันความถูกต้องและยอมรับเงื่อนไข
                    </h3>

                    <div className="space-y-4">
                        <label className={`
                        flex items-start gap-4 cursor-pointer group p-5 rounded-2xl transition-all border-2
                        ${confirmChecks.dataCorrect
                                ? 'bg-white border-orange-300 shadow-md scale-[1.01]'
                                : 'bg-white/60 border-transparent hover:bg-white hover:border-orange-200'
                            }
                    `}>
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-6 h-6 border-2 border-orange-300 rounded-lg checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer"
                                    checked={confirmChecks.dataCorrect}
                                    onChange={e => setConfirmChecks({ ...confirmChecks, dataCorrect: e.target.checked })}
                                />
                                <CheckIcon className="absolute w-4 h-4 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className={`text-base font-medium leading-relaxed transition-colors ${confirmChecks.dataCorrect ? 'text-gray-900' : 'text-gray-600'}`}>
                                ข้าพเจ้ายืนยันว่าข้อมูลทั้งหมดถูกต้องและเป็นความจริงทุกประการ หากมีการตรวจสอบพบว่าเป็นเท็จ ข้าพเจ้ายินยอมให้ยกเลิกคำขอทันที
                            </span>
                        </label>

                        <label className={`
                        flex items-start gap-4 cursor-pointer group p-5 rounded-2xl transition-all border-2
                        ${confirmChecks.termsAccepted
                                ? 'bg-white border-orange-300 shadow-md scale-[1.01]'
                                : 'bg-white/60 border-transparent hover:bg-white hover:border-orange-200'
                            }
                    `}>
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-6 h-6 border-2 border-orange-300 rounded-lg checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer"
                                    checked={confirmChecks.termsAccepted}
                                    onChange={e => setConfirmChecks({ ...confirmChecks, termsAccepted: e.target.checked })}
                                />
                                <CheckIcon className="absolute w-4 h-4 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className={`text-base font-medium leading-relaxed transition-colors ${confirmChecks.termsAccepted ? 'text-gray-900' : 'text-gray-600'}`}>
                                ข้าพเจ้ายอมรับเงื่อนไขและข้อกำหนดการรับรองมาตรฐาน GACP ของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                            </span>
                        </label>

                        <label className={`
                        flex items-start gap-4 cursor-pointer group p-5 rounded-2xl transition-all border-2
                        ${confirmChecks.paymentUnderstood
                                ? 'bg-white border-orange-300 shadow-md scale-[1.01]'
                                : 'bg-white/60 border-transparent hover:bg-white hover:border-orange-200'
                            }
                    `}>
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-6 h-6 border-2 border-orange-300 rounded-lg checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer"
                                    checked={confirmChecks.paymentUnderstood}
                                    onChange={e => setConfirmChecks({ ...confirmChecks, paymentUnderstood: e.target.checked })}
                                />
                                <CheckIcon className="absolute w-4 h-4 text-white left-1 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className={`text-base font-medium leading-relaxed transition-colors ${confirmChecks.paymentUnderstood ? 'text-gray-900' : 'text-gray-600'}`}>
                                ข้าพเจ้าเข้าใจว่าจะต้องชำระค่าธรรมเนียมการตรวจประเมินหลังจากได้รับใบแจ้งหนี้ (Invoice)
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-4">
                <WizardNavigation
                    onNext={handleSubmit}
                    onBack={() => router.push('/farmer/applications/new/step/11')}
                    isNextDisabled={!allChecked || isSubmitting}
                    nextLabel={isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการส่งคำขอ'}
                />
            </div>
        </div>
    );
};

export default StepSubmit;


