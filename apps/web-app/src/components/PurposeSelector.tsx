'use client';

import React from 'react';
import { CheckIcon } from './icons/PlantIcons';

export type CertificationPurpose = 'RESEARCH' | 'COMMERCIAL' | 'EXPORT';

interface PurposeOption {
    id: CertificationPurpose;
    name: string;
    nameEn: string;
    description: string;
    requiredDocs: string[];
}

// SVG Icons for purposes
const ResearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="4" />
        <path d="M11 7v8" />
        <path d="M7 11h8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const CommercialIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M9 22V12h6v10" />
    </svg>
);

const ExportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const getPurposeIcon = (id: CertificationPurpose) => {
    switch (id) {
        case 'RESEARCH': return <ResearchIcon />;
        case 'COMMERCIAL': return <CommercialIcon />;
        case 'EXPORT': return <ExportIcon />;
    }
};

const PURPOSE_OPTIONS: PurposeOption[] = [
    {
        id: 'RESEARCH',
        name: 'เพื่อการวิจัย',
        nameEn: 'Research',
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
                {PURPOSE_OPTIONS.map((option) => {
                    const isSelected = value === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option)}
                            disabled={disabled}
                            className={`
                                relative p-5 rounded-lg border-2 text-left transition-all duration-150
                                ${isSelected
                                    ? 'border-[#00695C] bg-[#E0F2F1]'
                                    : 'border-[#CFD8DC] bg-white hover:border-[#00695C]'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <span className="absolute top-3 right-3 w-5 h-5 bg-[#00695C] rounded-full flex items-center justify-center">
                                    <CheckIcon className="text-white" size={12} />
                                </span>
                            )}

                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'text-[#00695C] bg-white' : 'text-[#546E7A] bg-[#ECEFF1]'}`}>
                                    {getPurposeIcon(option.id)}
                                </div>
                                <div>
                                    <div className={`font-semibold ${isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>
                                        {option.name}
                                    </div>
                                    <div className="text-[10px] text-[#90A4AE]">{option.nameEn}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-[#546E7A]">
                                {option.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Document Requirements Preview */}
            {showDocPreview && selectedOption && (
                <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-4">
                    <h4 className="font-medium text-[#EF6C00] mb-2 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        เอกสารที่ต้องเตรียม
                    </h4>
                    <ul className="space-y-1">
                        {selectedOption.requiredDocs.map((doc, i) => (
                            <li key={i} className="text-xs text-[#F57C00] flex items-start gap-2">
                                <span className="text-[#FFB74D] mt-0.5">•</span>
                                <span>{doc}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-[10px] text-[#FB8C00] mt-2">
                        *เอกสารบางส่วนจะถูกขอให้อัปโหลดในขั้นตอนที่เกี่ยวข้อง
                    </p>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

export { PURPOSE_OPTIONS };
export type { PurposeOption };
export default PurposeSelector;
