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

    const checkItems = [
        {
            key: 'confirmTruth' as const,
            title: 'ยืนยันความถูกต้องของข้อมูล',
            desc: 'ข้าพเจ้ายืนยันว่าเอกสารและข้อมูลทั้งหมดที่แนบมาเป็นความจริงทุกประการ',
            icon: '📝'
        },
        {
            key: 'acceptAudit' as const,
            title: 'ยินยอมให้เข้าตรวจสถานประกอบการ',
            desc: 'ข้าพเจ้ายินยอมให้เจ้าหน้าที่เข้าตรวจสอบพื้นที่แปลงปลูกและโรงเรือนตามนัดหมาย',
            icon: '🛡️'
        },
        {
            key: 'acknowledgePenalty' as const,
            title: 'รับทราบบทลงโทษ',
            desc: 'หากตรวจสอบพบว่ามีการปลอมแปลงเอกสาร หรือให้ข้อมูลเท็จ คำขอจะถูกยกเลิกและอาจถูกดำเนินคดีตามกฎหมาย',
            icon: '⚠️'
        },
        {
            key: 'consentData' as const,
            title: 'ยินยอมเปิดเผยข้อมูล (PDPA)',
            desc: 'ข้าพเจ้ายินยอมให้หน่วยงานรัฐจัดเก็บและเปิดเผยข้อมูลเพื่อประโยชน์ในการรับรองมาตรฐาน GACP',
            icon: '🔒'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    10
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">ตรวจสอบความเรียบร้อย (Self-Audit)</h2>
                    <p className="text-text-secondary">ขั้นตอนสุดท้ายก่อนส่งคำขอ กรุณาตรวจสอบและกดยืนยันข้อกำหนด</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="p-6 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-3xl flex gap-4 text-amber-900 shadow-sm animate-slide-up">
                <div className="p-2 bg-white rounded-2xl shadow-sm h-fit">
                    <WarningIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-amber-900 text-sm">โปรดตรวจสอบข้อมูลอย่างละเอียด</p>
                    <p className="text-xs leading-relaxed text-amber-800/80">
                        การให้ข้อมูลที่เป็นเท็จอาจส่งผลต่อการพิจารณาใบรับรองในอนาคตและมีบทลงโทษตามกฎหมาย
                        ท่านสามารถย้อนกลับไปแก้ไขข้อมูลในขั้นตอนก่อนหน้าได้ในหน้ารวมสรุป (Step 11)
                    </p>
                </div>
            </div>

            {/* Checklist Container */}
            <div className="gacp-card p-4 space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                {checkItems.map((item, index) => (
                    <div
                        key={item.key}
                        onClick={() => toggle(item.key)}
                        className={`
                            group flex items-start gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-300 border
                            ${checks[item.key]
                                ? 'bg-primary/5 border-primary/20 shadow-sm'
                                : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-gray-50/50 hover:shadow-md'
                            }
                        `}
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                        {/* Custom Checkbox Design */}
                        <div className="relative mt-1">
                            <div className={`
                                w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500
                                ${checks[item.key]
                                    ? 'bg-primary border-primary rotate-0 scale-100'
                                    : 'bg-white border-gray-300 rotate-45 scale-90 group-hover:rotate-0 group-hover:scale-100 group-hover:border-primary'
                                }
                            `}>
                                {checks[item.key] && (
                                    <CheckIcon className="w-4 h-4 text-white animate-scale-in" />
                                )}
                            </div>
                            {/* Decorative ring when checked */}
                            {checks[item.key] && (
                                <div className="absolute inset-0 rounded-xl ring-4 ring-primary/20 animate-pulse"></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg grayscale group-hover:grayscale-0 transition-all duration-500">{item.icon}</span>
                                <h4 className={`font-bold text-base transition-colors ${checks[item.key] ? 'text-primary-900' : 'text-gray-700'}`}>
                                    {item.title}
                                </h4>
                            </div>
                            <p className={`text-xs leading-relaxed transition-colors ${checks[item.key] ? 'text-primary-700/70' : 'text-gray-500'}`}>
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Info */}
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="p-2 bg-white rounded-xl shadow-sm">
                    <InfoIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xs text-blue-800/80 font-medium">
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
