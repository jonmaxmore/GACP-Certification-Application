'use client';

import React, { useState, useEffect } from 'react';
import { useMasterData, type GACPFees } from '@/hooks/useMasterData';
import { getCultivationIcon, CheckIcon } from './icons/PlantIcons';

// Main cultivation types (3 types that affect fees)
export type MainCultivationType = 'outdoor' | 'greenhouse' | 'indoor';
export type SubCultivationType = 'vertical' | 'hydroponic' | 'none';
export type CultivationType = MainCultivationType | 'vertical' | 'hydroponic';
export type CultivationMethod = CultivationType;

// Fee constants (FALLBACK - actual data comes from API)
export const GACP_FEES: GACPFees = {
    documentReview: 5000,
    siteInspection: 25000,
    perTypeTotal: 30000,
    platformFeePercent: 10,
};

interface MainMethodOption {
    id: MainCultivationType;
    name: string;
    nameEn: string;
    description: string;
    pros: string[];
    cons: string[];
}

// Only 3 main cultivation types
const MAIN_CULTIVATION_METHODS: MainMethodOption[] = [
    {
        id: 'outdoor',
        name: 'กลางแจ้ง',
        nameEn: 'Outdoor',
        description: 'ปลูกในแปลงกลางแจ้ง อาศัยแสงแดดธรรมชาติ',
        pros: ['ต้นทุนต่ำ', 'เหมาะกับพื้นที่กว้าง'],
        cons: ['ควบคุมสภาพแวดล้อมยาก'],
    },
    {
        id: 'greenhouse',
        name: 'โรงเรือน',
        nameEn: 'Greenhouse',
        description: 'ปลูกในโรงเรือนที่มีหลังคาโปร่งแสง',
        pros: ['ควบคุมสภาพแวดล้อมได้บางส่วน', 'ปลูกได้ตลอดปี'],
        cons: ['ต้นทุนสูงกว่ากลางแจ้ง'],
    },
    {
        id: 'indoor',
        name: 'อาคารควบคุม',
        nameEn: 'Indoor Controlled',
        description: 'ปลูกในอาคารปิดที่ควบคุมสภาพแวดล้อมทั้งหมด',
        pros: ['ควบคุมทุกปัจจัยได้', 'คุณภาพสม่ำเสมอ'],
        cons: ['ต้นทุนสูง', 'ค่าไฟฟ้าสูง'],
    },
];

export interface CultivationConfig {
    mainTypes: MainCultivationType[];
    subType?: SubCultivationType;
}

interface CultivationMethodSelectorProps {
    value?: CultivationMethod;
    selectedTypes?: MainCultivationType[];
    subType?: SubCultivationType;
    onChange?: (method: CultivationMethod, option?: MainMethodOption) => void;
    onConfigChange?: (config: CultivationConfig) => void;
    error?: string;
    disabled?: boolean;
    multiSelect?: boolean;
}

// Calculate total fee based on selected cultivation types
export function calculateGACPFee(selectedTypes: MainCultivationType[]): {
    documentReview: number;
    siteInspection: number;
    total: number;
    typeCount: number;
    breakdown: Array<{ type: string; fee: number }>;
} {
    const typeCount = selectedTypes.length;
    const documentReview = GACP_FEES.documentReview * typeCount;
    const siteInspection = GACP_FEES.siteInspection * typeCount;
    const total = documentReview + siteInspection;
    const breakdown = selectedTypes.map(type => {
        const method = MAIN_CULTIVATION_METHODS.find(m => m.id === type);
        return { type: method?.name || type, fee: GACP_FEES.perTypeTotal };
    });
    return { documentReview, siteInspection, total, typeCount, breakdown };
}

export function CultivationMethodSelector({
    value,
    selectedTypes = [],
    subType = 'none',
    onChange,
    onConfigChange,
    error,
    disabled = false,
    multiSelect = false,
}: CultivationMethodSelectorProps) {
    const { fees } = useMasterData();
    const activeFees = fees || GACP_FEES;

    const [localSelectedTypes, setLocalSelectedTypes] = useState<MainCultivationType[]>(
        selectedTypes.length > 0 ? selectedTypes : (value ? [value as MainCultivationType] : [])
    );

    useEffect(() => {
        if (selectedTypes.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalSelectedTypes(selectedTypes);
        }
    }, [selectedTypes]);

    const handleMainTypeSelect = (typeId: MainCultivationType) => {
        if (disabled) return;

        // Single select mode only now
        setLocalSelectedTypes([typeId]);
        const method = MAIN_CULTIVATION_METHODS.find(m => m.id === typeId);
        onChange?.(typeId, method);
        onConfigChange?.({ mainTypes: [typeId], subType: 'none' });
    };

    const feeInfo = calculateGACPFee(localSelectedTypes);

    return (
        <div className="space-y-6">
            {/* Main cultivation types (3 options) */}
            <div className="grid grid-cols-1 desktop:grid-cols-3 gap-5">
                {MAIN_CULTIVATION_METHODS.map((method) => {
                    const isSelected = localSelectedTypes.includes(method.id);
                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => handleMainTypeSelect(method.id)}
                            disabled={disabled}
                            className={`
                                group relative p-5 rounded-xl text-left transition-all duration-300 transform
                                ${isSelected
                                    ? 'bg-gradient-to-br from-dtam-100 via-dtam-200 to-dtam-300 shadow-3d-hover scale-[1.02] border-2 border-dtam'
                                    : 'bg-white shadow-3d hover:shadow-3d-hover hover:scale-[1.02] hover:-translate-y-1 border border-surface-200'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-dtam-light to-dtam rounded-full flex items-center justify-center shadow-green-glow">
                                    <CheckIcon className="text-white" size={14} />
                                </span>
                            )}

                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`
                                    w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-dtam-light to-dtam text-white shadow-lg'
                                        : 'bg-gradient-to-br from-surface-100 to-surface-200 text-dtam group-hover:from-dtam-100 group-hover:to-dtam-200 group-hover:text-dtam-dark'
                                    }
                                `}>
                                    {getCultivationIcon(method.id, { size: 24 })}
                                </div>
                                <div>
                                    <div className={`font-bold ${isSelected ? 'text-dtam-dark' : 'text-content-primary group-hover:text-dtam-dark'}`}>
                                        {method.name}
                                    </div>
                                    <div className={`text-[10px] ${isSelected ? 'text-dtam' : 'text-content-muted'}`}>{method.nameEn}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className={`text-xs leading-relaxed mb-3 ${isSelected ? 'text-dtam-dark' : 'text-content-secondary group-hover:text-content-primary'}`}>
                                {method.description}
                            </p>

                            {/* Pros/Cons (shown when selected) */}
                            {isSelected && (
                                <div className="pt-3 border-t border-dtam-300 space-y-2 text-xs">
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-dtam-light">ข้อดี:</span>
                                        <span className="text-dtam-dark"> {method.pros.join(', ')}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold text-amber-500">ข้อจำกัด:</span>
                                        <span className="text-dtam-dark"> {method.cons.join(', ')}</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Fee calculation preview */}
            {localSelectedTypes.length > 0 && (
                <div className="bg-gradient-to-r from-dtam-50 via-surface-50 to-dtam-100 border-2 border-dtam-200 rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-bold text-dtam-dark">ค่าธรรมเนียม GACP (ประมาณการ)</p>
                            <p className="text-sm text-content-secondary mt-1">
                                ค่าตรวจเอกสาร ฿{activeFees.documentReview.toLocaleString()} + ค่าตรวจพื้นที่ ฿{activeFees.siteInspection.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold bg-gradient-to-r from-dtam-light to-dtam bg-clip-text text-transparent">฿{feeInfo.total.toLocaleString()}</p>
                            <p className="text-xs text-dtam">ต่อใบคำขอ</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

export { MAIN_CULTIVATION_METHODS };
export type { MainMethodOption };
export default CultivationMethodSelector;
