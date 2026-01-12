'use client';

import React from 'react';

interface Strain {
    id: string;
    name: string;
    nameEn: string;
    thc: string;
    cbd: string;
    aroma: string;
    origin: 'thai' | 'imported' | 'hybrid';
    description: string;
}

const THAI_STRAINS: Strain[] = [
    {
        id: 'thai-stick',
        name: 'หางกระรอก',
        nameEn: 'Thai Stick',
        thc: '18-22%',
        cbd: '1:1 ratio',
        aroma: 'มะม่วงสุก',
        origin: 'thai',
        description: 'สายพันธุ์ไทยแท้ที่ได้รับการยกย่องว่าดีที่สุดในโลก เหมาะสำหรับลดความเครียดและเจริญอาหาร',
    },
    {
        id: 'tanaosri-white',
        name: 'ตะนาวศรีก้านขาว',
        nameEn: 'Tanaosri White Stem',
        thc: '10-15%',
        cbd: 'สูง',
        aroma: 'เปลือกส้มผสมตะไคร้',
        origin: 'thai',
        description: 'สายพันธุ์ที่ให้ CBD สูง เหมาะสำหรับการใช้ทางการแพทย์',
    },
    {
        id: 'tanaosri-red',
        name: 'ตะนาวศรีก้านแดง',
        nameEn: 'Tanaosri Red Stem',
        thc: '10-15%',
        cbd: 'สูง',
        aroma: 'ผลไม้สุกหอมหวาน',
        origin: 'thai',
        description: 'คล้ายตะนาวศรีก้านขาว แต่มีกิ่ง ก้าน และใบเป็นสีแดง',
    },
    {
        id: 'hang-sua',
        name: 'หางเสือ',
        nameEn: 'Hang Sua',
        thc: '15-20%',
        cbd: 'ต่ำ',
        aroma: 'เปลือกส้มฉุน',
        origin: 'thai',
        description: 'ช่อดอกยาวคล้ายหางเสือ THC สูง เหมาะสำหรับผ่อนคลายความเครียด',
    },
    {
        id: 'other',
        name: 'สายพันธุ์อื่นๆ',
        nameEn: 'Other',
        thc: 'ไม่ระบุ',
        cbd: 'ไม่ระบุ',
        aroma: '-',
        origin: 'imported',
        description: 'สายพันธุ์นำเข้าหรือสายพันธุ์ลูกผสม',
    },
];

interface StrainSelectorProps {
    value?: string;
    onChange?: (strainId: string, strain: Strain | null) => void;
    error?: string;
    disabled?: boolean;
    /** Allow multiple selection */
    multiple?: boolean;
    /** Selected strain IDs for multiple mode */
    values?: string[];
    onMultiChange?: (strainIds: string[], strains: Strain[]) => void;
}

export function StrainSelector({
    value,
    onChange,
    error,
    disabled = false,
    multiple = false,
    values = [],
    onMultiChange,
}: StrainSelectorProps) {
    const handleSelect = (strain: Strain) => {
        if (disabled) return;

        if (multiple) {
            const isSelected = values.includes(strain.id);
            const newIds = isSelected
                ? values.filter(id => id !== strain.id)
                : [...values, strain.id];
            const newStrains = THAI_STRAINS.filter(s => newIds.includes(s.id));
            onMultiChange?.(newIds, newStrains);
        } else {
            onChange?.(strain.id, strain);
        }
    };

    const isSelected = (strainId: string) => {
        if (multiple) {
            return values.includes(strainId);
        }
        return value === strainId;
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {THAI_STRAINS.map((strain) => (
                    <button
                        key={strain.id}
                        type="button"
                        onClick={() => handleSelect(strain)}
                        disabled={disabled}
                        className={`
                            relative p-4 rounded-xl border-2 text-left transition-all
                            ${isSelected(strain.id)
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                : 'border-slate-200 hover:border-emerald-300 bg-white'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {/* Origin Badge */}
                        <div className="absolute top-2 right-2">
                            <span className={`
                                text-xs px-2 py-0.5 rounded-full
                                ${strain.origin === 'thai'
                                    ? 'bg-amber-100 text-amber-700'
                                    : strain.origin === 'hybrid'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                }
                            `}>
                                {strain.origin === 'thai' ? '🇹🇭 ไทย' : strain.origin === 'hybrid' ? '🧬 ลูกผสม' : '🌍 นำเข้า'}
                            </span>
                        </div>

                        {/* Strain Name */}
                        <h4 className="font-semibold text-slate-800">
                            {strain.name}
                        </h4>
                        <p className="text-xs text-slate-500">{strain.nameEn}</p>

                        {/* Stats */}
                        {strain.id !== 'other' && (
                            <div className="mt-2 flex gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400">THC:</span>
                                    <span className="text-xs font-medium text-red-600">{strain.thc}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-slate-400">CBD:</span>
                                    <span className="text-xs font-medium text-green-600">{strain.cbd}</span>
                                </div>
                            </div>
                        )}

                        {/* Aroma */}
                        {strain.aroma !== '-' && (
                            <p className="mt-1 text-xs text-slate-500">
                                🌿 กลิ่น: {strain.aroma}
                            </p>
                        )}

                        {/* Description (shown when selected) */}
                        {isSelected(strain.id) && (
                            <p className="mt-2 text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
                                {strain.description}
                            </p>
                        )}

                        {/* Selection indicator */}
                        {isSelected(strain.id) && (
                            <div className="absolute top-1/2 left-2 -translate-y-1/2">
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

export { THAI_STRAINS };
export type { Strain };
export default StrainSelector;
