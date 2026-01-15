'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/api-client';

/**
 * GACP Data Types from API
 */
export interface GACPCategory {
    id: number;
    nameTH: string;
    nameEN: string;
    steps: number[];
}

export interface EnvironmentCheck {
    id: string;
    nameTH: string;
    nameEN: string;
    required: boolean;
    gacpCategory: number;
}

export interface WaterSource {
    id: string;
    nameTH: string;
    nameEN: string;
}

export interface SecurityRequirement {
    id: string;
    nameTH: string;
    nameEN: string;
    category: string;
}

export interface DocumentDef {
    id: string;
    nameTH: string;
    nameEN: string;
    category: string;
    required: boolean;
}

export interface StepRequirements {
    step: number;
    gacpCategories: GACPCategory[];
    fields: string[];
    requiredDocuments: DocumentDef[];
    optionalDocuments: DocumentDef[];
}

// Step 5: Plot GACP Data Types
export interface SoilType {
    id: string;
    nameTH: string;
    nameEN: string;
}

export interface SeedSource {
    id: string;
    nameTH: string;
    nameEN: string;
}

export interface IPMMethod {
    id: string;
    nameTH: string;
    nameEN: string;
    description?: string;
}

/**
 * Hook to fetch GACP-specific data from API
 * Implements API-First principle for GACP standards
 */
export function useGACPData(stepNumber?: number) {
    // Step 4 data
    const [gacpCategories, setGacpCategories] = useState<GACPCategory[]>([]);
    const [environmentChecklist, setEnvironmentChecklist] = useState<EnvironmentCheck[]>([]);
    const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
    const [securityRequirements, setSecurityRequirements] = useState<SecurityRequirement[]>([]);
    const [stepRequirements, setStepRequirements] = useState<StepRequirements | null>(null);

    // Step 5 data
    const [soilTypes, setSoilTypes] = useState<SoilType[]>([]);
    const [seedSources, setSeedSources] = useState<SeedSource[]>([]);
    const [ipmMethods, setIpmMethods] = useState<IPMMethod[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGACPCategories = useCallback(async () => {
        try {
            const response = await api.get<{ data: GACPCategory[] }>('/master-data/gacp-categories');
            if (response.success && response.data) {
                setGacpCategories(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching categories:', err);
        }
    }, []);

    const fetchEnvironmentChecklist = useCallback(async () => {
        try {
            const response = await api.get<{ data: EnvironmentCheck[] }>('/master-data/environment-checklist');
            if (response.success && response.data) {
                setEnvironmentChecklist(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching environment checklist:', err);
        }
    }, []);

    const fetchWaterSources = useCallback(async () => {
        try {
            const response = await api.get<{ data: WaterSource[] }>('/master-data/water-sources');
            if (response.success && response.data) {
                setWaterSources(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching water sources:', err);
        }
    }, []);

    const fetchSecurityRequirements = useCallback(async () => {
        try {
            const response = await api.get<{ data: SecurityRequirement[] }>('/master-data/security-requirements');
            if (response.success && response.data) {
                setSecurityRequirements(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching security requirements:', err);
        }
    }, []);

    const fetchStepRequirements = useCallback(async (step: number) => {
        try {
            const response = await api.get<{ data: StepRequirements }>(`/master-data/step-requirements/${step}`);
            if (response.success && response.data) {
                setStepRequirements(response.data.data || null);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching step requirements:', err);
        }
    }, []);

    // Step 5 fetch functions
    const fetchSoilTypes = useCallback(async () => {
        try {
            const response = await api.get<{ data: SoilType[] }>('/master-data/soil-types');
            if (response.success && response.data) {
                setSoilTypes(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching soil types:', err);
        }
    }, []);

    const fetchSeedSources = useCallback(async () => {
        try {
            const response = await api.get<{ data: SeedSource[] }>('/master-data/seed-sources');
            if (response.success && response.data) {
                setSeedSources(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching seed sources:', err);
        }
    }, []);

    const fetchIPMMethods = useCallback(async () => {
        try {
            const response = await api.get<{ data: IPMMethod[] }>('/master-data/ipm-methods');
            if (response.success && response.data) {
                setIpmMethods(response.data.data || []);
            }
        } catch (err) {
            console.error('[useGACPData] Error fetching IPM methods:', err);
        }
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchGACPCategories(),
                    fetchEnvironmentChecklist(),
                    fetchWaterSources(),
                    fetchSecurityRequirements(),
                    fetchSoilTypes(),
                    fetchSeedSources(),
                    fetchIPMMethods(),
                ]);

                if (stepNumber) {
                    await fetchStepRequirements(stepNumber);
                }
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูล GACP ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [fetchGACPCategories, fetchEnvironmentChecklist, fetchWaterSources, fetchSecurityRequirements, fetchSoilTypes, fetchSeedSources, fetchIPMMethods, fetchStepRequirements, stepNumber]);

    // Fallback data for offline/error scenarios
    const fallbackEnvironmentChecklist: EnvironmentCheck[] = [
        { id: 'no_waste_dump', nameTH: 'พื้นที่ไม่เคยเป็นที่ทิ้งขยะ/สารเคมี', nameEN: 'Not former waste dump', required: true, gacpCategory: 2 },
        { id: 'no_contamination', nameTH: 'ไม่อยู่ใกล้แหล่งปนเปื้อน', nameEN: 'Not near contamination', required: true, gacpCategory: 2 },
        { id: 'no_chemicals_3y', nameTH: 'ไม่เคยใช้สารเคมีเข้มข้นในช่วง 3 ปี', nameEN: 'No chemicals last 3 years', required: false, gacpCategory: 2 },
        { id: 'suitable_environment', nameTH: 'สภาพแวดล้อมเหมาะสม', nameEN: 'Suitable environment', required: true, gacpCategory: 2 },
    ];

    const fallbackWaterSources: WaterSource[] = [
        { id: 'WELL', nameTH: 'บ่อบาดาล', nameEN: 'Well' },
        { id: 'RAIN', nameTH: 'น้ำฝน', nameEN: 'Rainwater' },
        { id: 'RIVER', nameTH: 'แม่น้ำ/ลำคลอง', nameEN: 'River' },
        { id: 'TAP', nameTH: 'น้ำประปา', nameEN: 'Tap Water' },
        { id: 'POND', nameTH: 'สระ/อ่างเก็บน้ำ', nameEN: 'Pond' },
    ];

    const fallbackSecurityRequirements: SecurityRequirement[] = [
        { id: 'fence_2m', nameTH: 'รั้วรอบขอบชิด สูง 2 เมตร', nameEN: 'Fence 2m', category: 'perimeter' },
        { id: 'cctv_entry', nameTH: 'กล้อง CCTV ทางเข้า-ออก', nameEN: 'CCTV Entry', category: 'surveillance' },
        { id: 'cctv_plot', nameTH: 'กล้อง CCTV แปลงปลูก', nameEN: 'CCTV Plot', category: 'surveillance' },
        { id: 'access_control', nameTH: 'ระบบควบคุมการเข้าออก', nameEN: 'Access Control', category: 'access' },
        { id: 'access_log', nameTH: 'บันทึกการเข้าออก', nameEN: 'Access Log', category: 'access' },
        { id: 'warning_signs', nameTH: 'ป้ายเตือน', nameEN: 'Warning Signs', category: 'signage' },
    ];

    const fallbackSoilTypes: SoilType[] = [
        { id: 'clay', nameTH: 'ดินเหนียว', nameEN: 'Clay' },
        { id: 'loam', nameTH: 'ดินร่วน', nameEN: 'Loam' },
        { id: 'sandy', nameTH: 'ดินทราย', nameEN: 'Sandy' },
    ];

    const fallbackSeedSources: SeedSource[] = [
        { id: 'own', nameTH: 'เพาะเอง', nameEN: 'Self-propagated' },
        { id: 'certified', nameTH: 'ซื้อจากร้านพันธุ์พืชรับรอง', nameEN: 'Certified Seed Shop' },
        { id: 'government', nameTH: 'จากหน่วยงานราชการ', nameEN: 'Government Agency' },
    ];

    const fallbackIPMMethods: IPMMethod[] = [
        { id: 'biological', nameTH: 'การควบคุมทางชีวภาพ', nameEN: 'Biological Control' },
        { id: 'cultural', nameTH: 'การจัดการทางเขตกรรม', nameEN: 'Cultural Control' },
        { id: 'mechanical', nameTH: 'การควบคุมโดยกล', nameEN: 'Mechanical Control' },
    ];

    return {
        // Step 4 Data with fallbacks
        gacpCategories: gacpCategories.length > 0 ? gacpCategories : [],
        environmentChecklist: environmentChecklist.length > 0 ? environmentChecklist : fallbackEnvironmentChecklist,
        waterSources: waterSources.length > 0 ? waterSources : fallbackWaterSources,
        securityRequirements: securityRequirements.length > 0 ? securityRequirements : fallbackSecurityRequirements,
        stepRequirements,

        // Step 5 Data with fallbacks
        soilTypes: soilTypes.length > 0 ? soilTypes : fallbackSoilTypes,
        seedSources: seedSources.length > 0 ? seedSources : fallbackSeedSources,
        ipmMethods: ipmMethods.length > 0 ? ipmMethods : fallbackIPMMethods,

        // State
        loading,
        error,

        // Refetch functions
        refetchStepRequirements: fetchStepRequirements,
    };
}

export default useGACPData;
