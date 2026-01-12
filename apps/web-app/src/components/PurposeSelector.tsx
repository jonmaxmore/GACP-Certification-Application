'use client';

import React from 'react';

export type CertificationPurpose = 'RESEARCH' | 'COMMERCIAL' | 'EXPORT';

interface PurposeOption {
    id: CertificationPurpose;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    requiredDocs: string[];
}

const PURPOSE_OPTIONS: PurposeOption[] = [
    {
        id: 'RESEARCH',
        name: 'เพื่อการวิจัย',
        nameEn: 'Research',
        icon: '🔬',
        description: 'ปลูกเพื่อการวิจัยและพัฒนาภายใต้หน่วยงานที่ได้รับอนุญาต',
        requiredDocs: [
            'แผนการปลูกและใช้ประโยชน์',
            'หนังสือรับรองจากหน่วยงานสนับสนุน',
        ],
    },
    {
        id: 'COMMERCIAL',
        name: 'เพื่อจำหน่าย',
        nameEn: 'Commercial Sale',
        icon: '🏪',
        description: 'ปลูกเพื่อจำหน่ายภายในประเทศตามใบอนุญาต',
        requiredDocs: [
            'แบบ ภ.ท. 11 (คำขออนุญาตจำหน่าย/แปรรูป)',
            'หนังสือแสดงกรรมสิทธิ์ที่ดิน/สัญญาเช่า',
            'แผนที่แสดงที่ตั้ง + พิกัด GPS',
            'แบบแปลนอาคารโรงเรือน',
            'มาตรการรักษาความปลอดภัย',
            'หนังสือผลตรวจประวัติอาชญากรรม',
        ],
    },
    {
        id: 'EXPORT',
        name: 'เพื่อส่งออก',
        nameEn: 'Export',
        icon: '🌍',
        description: 'ปลูกเพื่อส่งออกต่างประเทศ ต้องมีใบรับรอง GACP',
        requiredDocs: [
            'ทุกเอกสารของ "เพื่อจำหน่าย" +',
            'แบบ ภ.ท. 10 (คำขออนุญาตส่งออก)',
            'ใบรับรอง GACP',
            'ใบรับรองห้องปฏิบัติการ (Lab Certificate)',
            'หนังสือรับรองประเทศปลายทาง',
        ],
    },
];

interface PurposeSelectorProps {
    value?: CertificationPurpose;
    onChange?: (purpose: CertificationPurpose, option: PurposeOption) => void;
    error?: string;
    disabled?: boolean;
    showDocPreview?: boolean;
}

export function PurposeSelector({
    value,
    onChange,
    error,
    disabled = false,
    showDocPreview = true,
}: PurposeSelectorProps) {
    const handleSelect = (option: PurposeOption) => {
        if (!disabled) {
            onChange?.(option.id, option);
        }
    };

    const selectedOption = PURPOSE_OPTIONS.find(p => p.id === value);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PURPOSE_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        disabled={disabled}
                        className={`
                            relative p-4 rounded-xl border-2 text-left transition-all
                            ${value === option.id
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                : 'border-slate-200 hover:border-emerald-300 bg-white'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {/* Icon & Name */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{option.icon}</span>
                            <div>
                                <h4 className="font-semibold text-slate-800">{option.name}</h4>
                                <p className="text-xs text-slate-500">{option.nameEn}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-2">
                            {option.description}
                        </p>



                        {/* Selection indicator */}
                        {value === option.id && (
                            <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Document Requirements Preview */}
            {showDocPreview && selectedOption && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        เอกสารที่ต้องเตรียม
                    </h4>
                    <ul className="space-y-1">
                        {selectedOption.requiredDocs.map((doc, i) => (
                            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{doc}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-amber-600 mt-2">
                        *เอกสารบางส่วนจะถูกขอให้อัปโหลดในขั้นตอนที่เกี่ยวข้อง
                    </p>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

export { PURPOSE_OPTIONS };
export type { PurposeOption };
export default PurposeSelector;
