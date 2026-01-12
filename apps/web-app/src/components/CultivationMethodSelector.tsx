'use client';

import React, { useState, useEffect } from 'react';
import { useMasterData, type GACPFees } from '@/hooks/useMasterData';

// Main cultivation types (3 types that affect fees)
export type MainCultivationType = 'outdoor' | 'greenhouse' | 'indoor';

// Sub-types that can be applied to main types
export type SubCultivationType = 'vertical' | 'hydroponic' | 'none';

// Combined cultivation method for backwards compatibility
export type CultivationType = MainCultivationType | 'vertical' | 'hydroponic';
export type CultivationMethod = CultivationType; // Backwards compat alias

// Fee constants (FALLBACK - actual data comes from API)
export const GACP_FEES: GACPFees = {
    documentReview: 5000,   // ค่าตรวจเอกสาร
    siteInspection: 25000,  // ค่าตรวจพื้นที่
    perTypeTotal: 30000,    // Total per cultivation type
    platformFeePercent: 10,
};

interface MainMethodOption {
    id: MainCultivationType;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    pros: string[];
    cons: string[];
    yieldMultiplier: number;
}

interface SubMethodOption {
    id: SubCultivationType;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    applicableTo: MainCultivationType[]; // Which main types this can apply to
}

// Only 3 main cultivation types
const MAIN_CULTIVATION_METHODS: MainMethodOption[] = [
    {
        id: 'outdoor',
        name: 'ปลูกกลางแจ้ง',
        nameEn: 'Outdoor',
        icon: '🌞',
        description: 'ปลูกในแปลงกลางแจ้ง อาศัยแสงแดดธรรมชาติ',
        pros: ['ต้นทุนต่ำ', 'เหมาะกับพื้นที่กว้าง', 'แสงธรรมชาติเต็มที่'],
        cons: ['ควบคุมสภาพแวดล้อมยาก', 'เสี่ยงต่อศัตรูพืช', 'ขึ้นกับสภาพอากาศ'],
        yieldMultiplier: 1.0,
    },
    {
        id: 'greenhouse',
        name: 'โรงเรือน',
        nameEn: 'Greenhouse',
        icon: '🏠',
        description: 'ปลูกในโรงเรือนที่มีหลังคาโปร่งแสง',
        pros: ['ควบคุมสภาพแวดล้อมได้บางส่วน', 'ป้องกันฝนและแมลง', 'ปลูกได้ตลอดปี'],
        cons: ['ต้นทุนสูงกว่ากลางแจ้ง', 'ต้องมีระบบระบายอากาศ'],
        yieldMultiplier: 1.2,
    },
    {
        id: 'indoor',
        name: 'ฟาร์มแบบปิด',
        nameEn: 'Indoor Controlled',
        icon: '🏭',
        description: 'ปลูกในอาคารปิดที่ควบคุมสภาพแวดล้อมทั้งหมด',
        pros: ['ควบคุมทุกปัจจัยได้', 'คุณภาพสม่ำเสมอ', 'ปลอดภัยจากศัตรูพืช'],
        cons: ['ต้นทุนสูงมาก', 'ค่าไฟฟ้าสูง', 'ต้องการความชำนาญ'],
        yieldMultiplier: 1.5,
    },
];

// Sub-types that can be combined with main types
const SUB_CULTIVATION_METHODS: SubMethodOption[] = [
    {
        id: 'none',
        name: 'ไม่มี',
        nameEn: 'None',
        icon: '➖',
        description: 'ใช้วิธีการปลูกปกติ',
        applicableTo: ['outdoor', 'greenhouse', 'indoor'],
    },
    {
        id: 'vertical',
        name: 'ฟาร์มแนวตั้ง',
        nameEn: 'Vertical Farm',
        icon: '🗼',
        description: 'ปลูกเป็นชั้นๆ ในแนวตั้ง ประหยัดพื้นที่',
        applicableTo: ['greenhouse', 'indoor'],
    },
    {
        id: 'hydroponic',
        name: 'ไฮโดรโปนิกส์',
        nameEn: 'Hydroponic',
        icon: '💧',
        description: 'ปลูกในน้ำยาธาตุอาหารโดยไม่ใช้ดิน',
        applicableTo: ['greenhouse', 'indoor'],
    },
];

// Selected cultivation types configuration
export interface CultivationConfig {
    mainTypes: MainCultivationType[];  // Can select multiple main types
    subType?: SubCultivationType;       // Optional sub-type
}

interface CultivationMethodSelectorProps {
    value?: CultivationMethod;
    selectedTypes?: MainCultivationType[];  // For multi-select mode
    subType?: SubCultivationType;
    onChange?: (method: CultivationMethod, option?: MainMethodOption) => void;
    onConfigChange?: (config: CultivationConfig) => void;  // For detailed config
    error?: string;
    disabled?: boolean;
    multiSelect?: boolean;  // Allow selecting multiple main types
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
        return {
            type: method?.name || type,
            fee: GACP_FEES.perTypeTotal,
        };
    });

    return {
        documentReview,
        siteInspection,
        total,
        typeCount,
        breakdown,
    };
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
    // Fetch fees from API (falls back to GACP_FEES constant)
    const { fees } = useMasterData();
    const activeFees = fees || GACP_FEES;

    const [localSelectedTypes, setLocalSelectedTypes] = useState<MainCultivationType[]>(
        selectedTypes.length > 0 ? selectedTypes : (value ? [value as MainCultivationType] : [])
    );
    const [localSubType, setLocalSubType] = useState<SubCultivationType>(subType);

    useEffect(() => {
        if (selectedTypes.length > 0) {
            setLocalSelectedTypes(selectedTypes);
        }
    }, [selectedTypes]);

    const handleMainTypeSelect = (typeId: MainCultivationType) => {
        if (disabled) return;

        if (multiSelect) {
            // Toggle selection in multi-select mode
            let newTypes: MainCultivationType[];
            if (localSelectedTypes.includes(typeId)) {
                newTypes = localSelectedTypes.filter(t => t !== typeId);
            } else {
                newTypes = [...localSelectedTypes, typeId];
            }
            setLocalSelectedTypes(newTypes);

            // Notify parent
            onConfigChange?.({
                mainTypes: newTypes,
                subType: localSubType,
            });

            // Also call legacy onChange with first selected type
            if (newTypes.length > 0) {
                const method = MAIN_CULTIVATION_METHODS.find(m => m.id === newTypes[0]);
                onChange?.(newTypes[0], method);
            }
        } else {
            // Single select mode (legacy behavior)
            setLocalSelectedTypes([typeId]);
            const method = MAIN_CULTIVATION_METHODS.find(m => m.id === typeId);
            onChange?.(typeId, method);
            onConfigChange?.({
                mainTypes: [typeId],
                subType: localSubType,
            });
        }
    };

    const handleSubTypeSelect = (subId: SubCultivationType) => {
        if (disabled) return;
        setLocalSubType(subId);
        onConfigChange?.({
            mainTypes: localSelectedTypes,
            subType: subId,
        });
    };

    // Calculate fees preview
    const feeInfo = calculateGACPFee(localSelectedTypes);

    // Get applicable sub-types based on selected main types
    const applicableSubTypes = SUB_CULTIVATION_METHODS.filter(sub => {
        if (sub.id === 'none') return true;
        return localSelectedTypes.some(mainType => sub.applicableTo.includes(mainType));
    });

    return (
        <div className="space-y-6">
            {/* Multi-select info banner */}
            {multiSelect && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">ℹ️</span>
                        <div>
                            <p className="font-medium mb-1">เลือกได้หลายรูปแบบ</p>
                            <p className="text-blue-700">
                                หากฟาร์มมีหลายรูปแบบการปลูก จะต้องแยกเคส และคำนวนค่าธรรมเนียมแยกต่างหาก
                                <br />
                                <span className="font-medium">
                                    ค่าตรวจเอกสาร: ฿{activeFees.documentReview.toLocaleString()}/รูปแบบ |
                                    ค่าตรวจพื้นที่: ฿{activeFees.siteInspection.toLocaleString()}/รูปแบบ
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main cultivation types (3 options) */}
            <div>
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">1</span>
                    เลือกรูปแบบการปลูกหลัก
                    {multiSelect && <span className="text-xs text-slate-500">(เลือกได้มากกว่า 1)</span>}
                </h4>
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
                                    relative p-4 rounded-xl border-2 text-left transition-all
                                    ${isSelected
                                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Icon & Name */}
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{method.icon}</span>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{method.name}</h4>
                                        <p className="text-xs text-slate-500">{method.nameEn}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-600 mb-2">
                                    {method.description}
                                </p>

                                {/* Pros/Cons (shown when selected) */}
                                {isSelected && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                                        <div>
                                            <span className="text-xs font-medium text-green-600">✓ ข้อดี</span>
                                            <ul className="mt-1 space-y-0.5">
                                                {method.pros.map((pro, i) => (
                                                    <li key={i} className="text-xs text-slate-600">• {pro}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-amber-600">✗ ข้อจำกัด</span>
                                            <ul className="mt-1 space-y-0.5">
                                                {method.cons.map((con, i) => (
                                                    <li key={i} className="text-xs text-slate-600">• {con}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Selection indicator */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-type selection (only show when main type is selected) */}
            {localSelectedTypes.length > 0 && applicableSubTypes.length > 1 && (
                <div>
                    <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 bg-slate-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
                        รูปแบบเสริม (ถ้ามี)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {applicableSubTypes.map((sub) => {
                            const isSelected = localSubType === sub.id;
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => handleSubTypeSelect(sub.id)}
                                    disabled={disabled}
                                    className={`
                                        p-3 rounded-lg border text-left transition-all text-sm
                                        ${isSelected
                                            ? 'border-slate-400 bg-slate-100'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }
                                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{sub.icon}</span>
                                        <div>
                                            <span className="font-medium text-slate-700">{sub.name}</span>
                                            <span className="text-xs text-slate-500 ml-1">({sub.nameEn})</span>
                                        </div>
                                        {isSelected && (
                                            <span className="ml-auto text-slate-600">✓</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{sub.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Fee calculation preview */}
            {localSelectedTypes.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                    <h4 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                        💰 ค่าธรรมเนียม GACP (ประมาณการ)
                    </h4>

                    {/* Breakdown by type */}
                    <div className="space-y-2 mb-3">
                        {feeInfo.breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-emerald-700">
                                    {idx + 1}. {item.type}
                                    <span className="text-xs text-emerald-600 ml-2">
                                        (ค่าเอกสาร ฿{activeFees.documentReview.toLocaleString()} + ค่าพื้นที่ ฿{activeFees.siteInspection.toLocaleString()})
                                    </span>
                                </span>
                                <span className="font-semibold text-emerald-800">฿{item.fee.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                        <span className="font-bold text-emerald-800">
                            รวมค่าธรรมเนียม ({feeInfo.typeCount} รูปแบบ)
                        </span>
                        <span className="text-xl font-bold text-emerald-700">
                            ฿{feeInfo.total.toLocaleString()}
                        </span>
                    </div>

                    {/* Notice for multiple types */}
                    {feeInfo.typeCount > 1 && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                            <span className="font-bold">⚠️ หมายเหตุ:</span> ฟาร์มที่มี {feeInfo.typeCount} รูปแบบการปลูก จะแยกเป็น {feeInfo.typeCount} เคส และ {feeInfo.typeCount} บิลชำระเงิน
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

export { MAIN_CULTIVATION_METHODS, SUB_CULTIVATION_METHODS };
export type { MainMethodOption, SubMethodOption };
export default CultivationMethodSelector;
