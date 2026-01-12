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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MAIN_CULTIVATION_METHODS.map((method) => {
                    const isSelected = localSelectedTypes.includes(method.id);
                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => handleMainTypeSelect(method.id)}
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
                                    {getCultivationIcon(method.id, { size: 24 })}
                                </div>
                                <div>
                                    <div className={`font-semibold ${isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>
                                        {method.name}
                                    </div>
                                    <div className="text-[10px] text-[#90A4AE]">{method.nameEn}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-[#546E7A] mb-3">
                                {method.description}
                            </p>

                            {/* Pros/Cons (shown when selected) */}
                            {isSelected && (
                                <div className="pt-3 border-t border-[#B2DFDB] space-y-2 text-xs">
                                    <div>
                                        <span className="font-medium text-[#2E7D32]">ข้อดี:</span>
                                        <span className="text-[#546E7A]"> {method.pros.join(', ')}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#E65100]">ข้อจำกัด:</span>
                                        <span className="text-[#546E7A]"> {method.cons.join(', ')}</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Fee calculation preview */}
            {localSelectedTypes.length > 0 && (
                <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#2E7D32]">ค่าธรรมเนียม GACP (ประมาณการ)</p>
                            <p className="text-xs text-[#66BB6A] mt-1">
                                ค่าตรวจเอกสาร ฿{activeFees.documentReview.toLocaleString()} + ค่าตรวจพื้นที่ ฿{activeFees.siteInspection.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-[#2E7D32]">฿{feeInfo.total.toLocaleString()}</p>
                            <p className="text-[10px] text-[#81C784]">ต่อใบคำขอ</p>
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
