'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCultivationConfig, type FarmLayout, type GrowingStyle } from '@/hooks/useCultivationConfig';

/**
 * FarmLayoutSelector Component
 * 
 * Select farm layout based on cultivation method
 * - Outdoor: แปลงยาว, แปลงยกร่อง, แปลงบล็อก, กระถาง
 * - Greenhouse: แปลงพื้น, โต๊ะยกสูง, ไฮโดรโปนิกส์
 * - Indoor: ไฮโดรโปนิกส์ + Growing styles (SOG/ScrOG/Vertical)
 * 
 * @author กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
 */

// Icon components
const LayoutIcon = ({ type, size = 20 }: { type: string; size?: number }) => {
    const iconMap: Record<string, React.ReactNode> = {
        rows: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        ),
        layer: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,8.5 12,15 2,8.5" />
                <polyline points="2,15.5 12,22 22,15.5" />
            </svg>
        ),
        grid: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
        pot: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9h18l-2 12H5L3 9z" />
                <path d="M7 9V7a5 5 0 0 1 10 0v2" />
            </svg>
        ),
        table: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="8" />
                <line x1="6" y1="12" x2="6" y2="20" />
                <line x1="18" y1="12" x2="18" y2="20" />
            </svg>
        ),
        drop: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
        ),
        plant: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22V8" />
                <path d="M12 8c-3 0-5.5-2.5-5.5-5.5" />
                <path d="M12 8c3 0 5.5-2.5 5.5-5.5" />
            </svg>
        ),
        'grid-3x3': (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="5" height="5" />
                <rect x="9.5" y="3" width="5" height="5" />
                <rect x="16" y="3" width="5" height="5" />
                <rect x="3" y="9.5" width="5" height="5" />
                <rect x="9.5" y="9.5" width="5" height="5" />
                <rect x="16" y="9.5" width="5" height="5" />
                <rect x="3" y="16" width="5" height="5" />
                <rect x="9.5" y="16" width="5" height="5" />
                <rect x="16" y="16" width="5" height="5" />
            </svg>
        ),
        net: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
        ),
        layers: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 22,8.5 12,15 2,8.5" />
                <polyline points="2,12 12,18.5 22,12" />
                <polyline points="2,15.5 12,22 22,15.5" />
            </svg>
        ),
    };
    return iconMap[type] || iconMap.rows;
};

interface FarmLayoutSelectorProps {
    cultivationMethod: 'outdoor' | 'greenhouse' | 'indoor';
    selectedLayoutId?: string;
    selectedStyleId?: string;
    tiers?: number;
    onLayoutChange: (layoutId: string) => void;
    onStyleChange?: (styleId: string) => void;
    onTiersChange?: (tiers: number) => void;
    disabled?: boolean;
    showPlantEstimate?: boolean;
    areaSqm?: number;
}

export function FarmLayoutSelector({
    cultivationMethod,
    selectedLayoutId,
    selectedStyleId,
    tiers = 1,
    onLayoutChange,
    onStyleChange,
    onTiersChange,
    disabled = false,
    showPlantEstimate = true,
    areaSqm = 0,
}: FarmLayoutSelectorProps) {
    const { getLayoutsForMethod, growingStyles, estimatePlantCount, isIndoorMethod, loading } = useCultivationConfig();

    // Get layouts for current method
    const layouts = useMemo(() => getLayoutsForMethod(cultivationMethod), [cultivationMethod, getLayoutsForMethod]);

    // Show growing styles only for indoor
    const showGrowingStyles = isIndoorMethod(cultivationMethod);

    // Calculate estimated plant count
    const plantEstimate = useMemo(() => {
        if (!selectedLayoutId || areaSqm <= 0) return null;
        return estimatePlantCount(areaSqm, selectedLayoutId, selectedStyleId, tiers);
    }, [selectedLayoutId, selectedStyleId, tiers, areaSqm, estimatePlantCount]);

    if (loading) {
        return (
            <div className="p-4 text-center text-[#78909C]">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-[#00695C] border-t-transparent rounded-full" />
                <p className="mt-2 text-sm">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Farm Layout Selection */}
            <div>
                <label className="block text-sm font-semibold text-[#263238] mb-3">
                    รูปแบบแปลงปลูก <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {layouts.map((layout) => {
                        const isSelected = selectedLayoutId === layout.id;
                        return (
                            <button
                                key={layout.id}
                                type="button"
                                onClick={() => onLayoutChange(layout.id)}
                                disabled={disabled}
                                className={`
                                    p-4 rounded-lg border-2 text-left transition-all
                                    ${isSelected
                                        ? 'border-[#00695C] bg-[#E0F2F1]'
                                        : 'border-[#E0E0E0] bg-white hover:border-[#80CBC4]'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-[#00695C] text-white' : 'bg-[#ECEFF1] text-[#546E7A]'
                                    }`}>
                                    <LayoutIcon type={layout.icon} size={20} />
                                </div>
                                <div className={`font-medium text-sm ${isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>
                                    {layout.nameTH}
                                </div>
                                <div className="text-xs text-[#90A4AE] mt-1">
                                    {layout.nameEN}
                                </div>
                                {layout.plantsPerSqm > 0 && (
                                    <div className="text-xs text-[#78909C] mt-2 flex items-center gap-1">
                                        <span className="inline-block w-2 h-2 bg-[#4CAF50] rounded-full" />
                                        {layout.plantsPerSqm} ต้น/㎡
                                    </div>
                                )}
                                {layout.manualPlantCount && (
                                    <div className="text-xs text-[#FF9800] mt-2">
                                        กรอกจำนวนเอง
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Growing Styles (Indoor Only) */}
            {showGrowingStyles && (
                <div>
                    <label className="block text-sm font-semibold text-[#263238] mb-3">
                        รูปแบบการปลูก (Indoor) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {growingStyles.map((style) => {
                            const isSelected = selectedStyleId === style.id;
                            return (
                                <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => onStyleChange?.(style.id)}
                                    disabled={disabled}
                                    className={`
                                        p-4 rounded-lg border-2 text-left transition-all
                                        ${isSelected
                                            ? 'border-[#00695C] bg-[#E0F2F1]'
                                            : 'border-[#E0E0E0] bg-white hover:border-[#80CBC4]'
                                        }
                                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-[#00695C] text-white' : 'bg-[#ECEFF1] text-[#546E7A]'
                                        }`}>
                                        <LayoutIcon type={style.icon} size={20} />
                                    </div>
                                    <div className={`font-medium text-sm ${isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>
                                        {style.nameTH}
                                    </div>
                                    <div className="text-xs text-[#90A4AE] mt-1">
                                        {style.nameEN}
                                    </div>
                                    <div className="text-xs text-[#78909C] mt-2 flex items-center gap-1">
                                        <span className="inline-block w-2 h-2 bg-[#4CAF50] rounded-full" />
                                        {style.plantsPerSqm} ต้น/㎡
                                    </div>
                                    {style.supportsMultipleTiers && (
                                        <div className="text-xs text-[#2196F3] mt-1">
                                            รองรับหลายชั้น (สูงสุด {style.maxTiers} ชั้น)
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tier Selector (for Vertical style) */}
            {selectedStyleId === 'vertical' && onTiersChange && (
                <div>
                    <label className="block text-sm font-semibold text-[#263238] mb-3">
                        จำนวนชั้น (Tiers)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={tiers}
                            onChange={(e) => onTiersChange(parseInt(e.target.value))}
                            disabled={disabled}
                            className="flex-1 h-2 bg-[#E0E0E0] rounded-lg appearance-none cursor-pointer accent-[#00695C]"
                        />
                        <div className="w-16 text-center">
                            <span className="text-2xl font-bold text-[#00695C]">{tiers}</span>
                            <span className="text-sm text-[#78909C] ml-1">ชั้น</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Plant Estimate Display */}
            {showPlantEstimate && plantEstimate && plantEstimate.count > 0 && (
                <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-[#2E7D32]">
                                จำนวนต้นโดยประมาณ
                            </div>
                            <div className="text-xs text-[#66BB6A] mt-1">
                                {plantEstimate.formula}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-[#2E7D32]">
                                {plantEstimate.count.toLocaleString()}
                            </div>
                            <div className="text-sm text-[#66BB6A]">ต้น</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FarmLayoutSelector;
