'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api/api-client';

/**
 * useCultivationConfig Hook
 * 
 * Fetches cultivation configuration from backend API including:
 * - Certification purposes (วัตถุประสงค์)
 * - Cultivation methods (ระบบปลูก)
 * - Farm layouts (รูปแบบแปลง)
 * - Growing styles (รูปแบบปลูก - Indoor)
 * - Plant count calculations
 * 
 * @author กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)
 */

// =====================
// TYPE DEFINITIONS
// =====================

export interface CertificationPurpose {
    id: string;
    nameTH: string;
    nameEN: string;
    description: string;
    requirements: string[];
    sortOrder: number;
}

export interface CultivationMethod {
    id: string;
    nameTH: string;
    nameEN: string;
    description: string;
    icon: string;
    pros: string[];
    cons: string[];
    feeMultiplier: number;
    sortOrder: number;
}

export interface FarmLayout {
    id: string;
    nameTH: string;
    nameEN: string;
    description: string;
    applicableTo: string[];
    plantsPerSqm: number;
    spacingRowCm?: number;
    spacingPlantCm?: number;
    manualPlantCount?: boolean;
    icon: string;
    subTypes?: string[];
}

export interface GrowingStyle {
    id: string;
    nameTH: string;
    nameEN: string;
    description: string;
    applicableTo: string[];
    plantsPerSqm: number;
    supportsMultipleTiers?: boolean;
    maxTiers?: number;
    icon: string;
}

export interface JourneyConfig {
    id: string;
    purpose: string;
    method: string;
    level: string;
    requiredFields: string[];
    documents: DocumentRequirement[];
    security: SecurityRequirement[];
    layouts: FarmLayout[];
    styles?: GrowingStyle[];
}

export interface DocumentRequirement {
    id: string;
    nameTH: string;
    nameEN: string;
    category: string;
    required: boolean;
}

export interface SecurityRequirement {
    id: string;
    nameTH: string;
    nameEN: string;
    category: string;
}

export interface PlantCalculation {
    input: {
        area: number;
        unit: string;
        layoutId: string;
        styleId?: string;
        tiers?: number;
    };
    areaSqm: number;
    count: number;
    formula: string;
    density: number;
    tiers?: number;
    densitySource?: string;
    manualInput?: boolean;
}

// =====================
// FALLBACK DATA
// =====================

const FALLBACK_PURPOSES: CertificationPurpose[] = [
    { id: 'domestic', nameTH: 'จำหน่ายในประเทศ', nameEN: 'Domestic Sales (B2B)', description: 'จำหน่ายให้กับผู้ประกอบการในประเทศ', requirements: ['GACP'], sortOrder: 1 },
    { id: 'export', nameTH: 'ส่งออก', nameEN: 'Export (International)', description: 'ส่งออกไปต่างประเทศ', requirements: ['GACP_ADVANCED'], sortOrder: 2 },
    { id: 'research', nameTH: 'วิจัย', nameEN: 'Research', description: 'การวิจัยและพัฒนา', requirements: ['GACP', 'RESEARCH_PROTOCOL'], sortOrder: 3 },
];

const FALLBACK_METHODS: CultivationMethod[] = [
    { id: 'outdoor', nameTH: 'กลางแจ้ง', nameEN: 'Outdoor', description: 'ปลูกในแปลงกลางแจ้ง', icon: 'sun', pros: ['ต้นทุนต่ำ'], cons: ['ควบคุมยาก'], feeMultiplier: 1.0, sortOrder: 1 },
    { id: 'greenhouse', nameTH: 'โรงเรือน', nameEN: 'Greenhouse', description: 'ปลูกในโรงเรือน', icon: 'home', pros: ['ควบคุมได้บางส่วน'], cons: ['ต้นทุนสูงกว่า'], feeMultiplier: 1.0, sortOrder: 2 },
    { id: 'indoor', nameTH: 'ระบบปิด', nameEN: 'Indoor', description: 'ปลูกในอาคารปิด', icon: 'building', pros: ['ควบคุมทุกปัจจัย'], cons: ['ต้นทุนสูง'], feeMultiplier: 1.0, sortOrder: 3 },
];

// =====================
// MAIN HOOK
// =====================

export function useCultivationConfig() {
    const [purposes, setPurposes] = useState<CertificationPurpose[]>([]);
    const [methods, setMethods] = useState<CultivationMethod[]>([]);
    const [allLayouts, setAllLayouts] = useState<FarmLayout[]>([]);
    const [growingStyles, setGrowingStyles] = useState<GrowingStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all master data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all endpoints in parallel
                const [purposesRes, methodsRes, layoutsRes, stylesRes] = await Promise.all([
                    api.get<{ data: CertificationPurpose[] }>('/master-data/certification-purposes'),
                    api.get<{ data: CultivationMethod[] }>('/master-data/cultivation-methods'),
                    api.get<{ data: FarmLayout[] }>('/master-data/farm-layouts'),
                    api.get<{ data: GrowingStyle[] }>('/master-data/growing-styles'),
                ]);

                if (purposesRes.success && purposesRes.data) {
                    setPurposes(purposesRes.data.data || FALLBACK_PURPOSES);
                }
                if (methodsRes.success && methodsRes.data) {
                    setMethods(methodsRes.data.data || FALLBACK_METHODS);
                }
                if (layoutsRes.success && layoutsRes.data) {
                    setAllLayouts(layoutsRes.data.data || []);
                }
                if (stylesRes.success && stylesRes.data) {
                    setGrowingStyles(stylesRes.data.data || []);
                }
            } catch (err) {
                console.error('[useCultivationConfig] Error fetching data:', err);
                setError('ไม่สามารถโหลดข้อมูลการปลูกได้');
                // Use fallback data
                setPurposes(FALLBACK_PURPOSES);
                setMethods(FALLBACK_METHODS);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get layouts filtered by cultivation method
    const getLayoutsForMethod = useCallback((methodId: string): FarmLayout[] => {
        return allLayouts.filter(l => l.applicableTo.includes(methodId));
    }, [allLayouts]);

    // Get growing styles (for indoor only)
    const getGrowingStyles = useCallback((): GrowingStyle[] => {
        return growingStyles;
    }, [growingStyles]);

    // Fetch journey config for specific purpose and method
    const getJourneyConfig = useCallback(async (purpose: string, method: string): Promise<JourneyConfig | null> => {
        try {
            const response = await api.get<{ data: JourneyConfig }>(`/applications/config/${purpose}/${method}`);
            if (response.success && response.data) {
                return response.data.data;
            }
            return null;
        } catch (err) {
            console.error('[useCultivationConfig] Error fetching journey config:', err);
            return null;
        }
    }, []);

    // Calculate plant count using API
    const calculatePlantCount = useCallback(async (
        area: number,
        unit: 'Rai' | 'Ngan' | 'Sqm',
        layoutId: string,
        styleId?: string,
        tiers?: number
    ): Promise<PlantCalculation | null> => {
        try {
            const response = await api.post<{ data: PlantCalculation }>('/calculations/plant-count', {
                area,
                unit,
                layoutId,
                styleId,
                tiers,
            });
            if (response.success && response.data) {
                return response.data.data;
            }
            return null;
        } catch (err) {
            console.error('[useCultivationConfig] Error calculating plants:', err);
            return null;
        }
    }, []);

    // Quick local calculation (fallback)
    const estimatePlantCount = useCallback((
        areaSqm: number,
        layoutId: string,
        styleId?: string,
        tiers: number = 1
    ): { count: number; formula: string } => {
        const layout = allLayouts.find(l => l.id === layoutId);
        if (!layout) {
            return { count: 0, formula: 'ไม่พบข้อมูล layout' };
        }

        if (layout.manualPlantCount) {
            return { count: 0, formula: 'กรุณากรอกจำนวนต้นด้วยตนเอง' };
        }

        let density = layout.plantsPerSqm;

        // If style provided, use style's density
        if (styleId) {
            const style = growingStyles.find(s => s.id === styleId);
            if (style) {
                density = style.plantsPerSqm;
                if (style.supportsMultipleTiers && tiers > 1) {
                    tiers = Math.min(tiers, style.maxTiers || 5);
                }
            }
        }

        const count = Math.floor(areaSqm * density * tiers);
        const formula = tiers > 1
            ? `${areaSqm} ㎡ × ${density} ต้น/㎡ × ${tiers} ชั้น = ${count} ต้น`
            : `${areaSqm} ㎡ × ${density} ต้น/㎡ = ${count} ต้น`;

        return { count, formula };
    }, [allLayouts, growingStyles]);

    // Convert area units to sqm
    const convertToSqm = useCallback((value: number, unit: 'Rai' | 'Ngan' | 'Sqm'): number => {
        switch (unit) {
            case 'Rai': return value * 1600;
            case 'Ngan': return value * 400;
            default: return value;
        }
    }, []);

    return {
        // State
        loading,
        error,

        // Master data
        purposes,
        methods,
        allLayouts,
        growingStyles,

        // Methods
        getLayoutsForMethod,
        getGrowingStyles,
        getJourneyConfig,
        calculatePlantCount,
        estimatePlantCount,
        convertToSqm,

        // Check if method is indoor (for showing growing styles)
        isIndoorMethod: (methodId: string) => methodId === 'indoor',
    };
}

export default useCultivationConfig;
