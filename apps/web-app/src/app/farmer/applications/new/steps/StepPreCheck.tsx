'use client';

import { useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, InfoIcon, WarningIcon } from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StepPreCheck = () => {
    const { setCurrentStep } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    const checkItems = [
        {
            key: 'confirmTruth' as const,
            title: 'ยืนยันความถูกต้องของข้อมูล',
            desc: 'ข้าพเจ้ายืนยันว่าเอกสารและข้อมูลทั้งหมดที่แนบมาเป็นความจริงทุกประการ',
            icon: <Icons.FileText className="w-5 h-5 text-emerald-600" />
        },
        {
            key: 'acceptAudit' as const,
            title: 'ยินยอมให้เข้าตรวจสถานประกอบการ',
            desc: 'ข้าพเจ้ายินยอมให้เจ้าหน้าที่เข้าตรวจสอบพื้นที่แปลงปลูกและโรงเรือนตามนัดหมาย',
            icon: <Icons.Search className="w-5 h-5 text-emerald-600" />
        },
        {
            key: 'acknowledgePenalty' as const,
            title: 'รับทราบบทลงโทษ',
            desc: 'หากตรวจสอบพบว่ามีการปลอมแปลงเอกสาร หรือให้ข้อมูลเท็จ คำขอจะถูกยกเลิกและอาจถูกดำเนินคดีตามกฎหมาย',
            icon: <WarningIcon className="w-5 h-5 text-amber-500" />
        },
        {
            key: 'consentData' as const,
            title: 'ยินยอมเปิดเผยข้อมูล (PDPA)',
            desc: 'ข้าพเจ้ายินยอมให้หน่วยงานรัฐจัดเก็บและเปิดเผยข้อมูลเพื่อประโยชน์ในการรับรองมาตรฐาน GACP',
            icon: <Icons.FileText className="w-5 h-5 text-blue-500" />
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    10
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ตรวจสอบความเรียบร้อย</h2>
                    <p className="text-slate-500 text-sm">ขั้นตอนสุดท้ายก่อนส่งคำขอ กรุณาตรวจสอบและกดยืนยันข้อกำหนด</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-900">
                <WarningIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-sm">โปรดตรวจสอบข้อมูลอย่างละเอียด</p>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                        การให้ข้อมูลที่เป็นเท็จอาจส่งผลต่อการพิจารณาใบรับรองในอนาคตและมีบทลงโทษตามกฎหมาย
                    </p>
                </div>
            </div>

            {/* Checklist Container */}
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {checkItems.map((item, index) => (
                    <div
                        key={item.key}
                        onClick={() => toggle(item.key)}
                        className={`
                            group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border bg-white
                            ${checks[item.key]
                                ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                                : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                            }
                        `}
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                        <div className={`
                            w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 mt-0.5 shrink-0
                            ${checks[item.key]
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-slate-50 border-slate-300 group-hover:border-emerald-400'
                            }
                        `}>
                            {checks[item.key] && (
                                <CheckIcon className="w-3.5 h-3.5 text-white animate-scale-in" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {item.icon && <span className="opacity-80 scale-90">{item.icon}</span>}
                                <h4 className={`font-bold text-sm transition-colors ${checks[item.key] ? 'text-emerald-900' : 'text-slate-800'}`}>
                                    {item.title}
                                </h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Info */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <InfoIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800/80 font-medium leading-relaxed">
                    หลังจากยืนยันครบทุกข้อ ท่านจะเข้าสู่หน้า <strong>&quot;ตรวจสอบข้อมูลทั้งหมด&quot;</strong> เพื่อรีวิวความถูกต้องก่อนกดส่งคำขออย่างเป็นทางการ
                </p>
            </div>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/11')}
                onBack={() => router.push('/farmer/applications/new/step/9')}
                isNextDisabled={!allChecked}
                nextLabel="รับทราบและดำเนินการต่อ"
            />
        </div>
    );
};

export default StepPreCheck;
