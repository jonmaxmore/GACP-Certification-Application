'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/api-client';

/**
 * Master Data Types from API
 */
export interface Purpose {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    requiredDocs?: string[];
}

export interface CultivationMethod {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    pros?: string[];
    cons?: string[];
    yieldMultiplier: number;
}

export interface SubCultivationMethod {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    description?: string;
    applicableTo: string[];
}

export interface GACPFees {
    documentReview: number;
    siteInspection: number;
    perTypeTotal: number;
    platformFeePercent: number;
    notes?: {
        th: string;
        en: string;
    };
}

export interface QRPricingTier {
    min: number;
    max: number;
    pricePerQR: number;
}

export interface MasterData {
    purposes: Purpose[];
    cultivationMethods: CultivationMethod[];
    subCultivationMethods: SubCultivationMethod[];
    fees: GACPFees;
    qrPricing: QRPricingTier[];
    soilTypes: Array<{ id: string; label: string; labelEN: string }>;
    waterSources: Array<{ id: string; label: string; labelEN: string }>;
    cultivationSystems: Array<{ id: string; label: string; labelEN: string }>;
    plotTypes: Array<{ id: string; label: string; icon: string }>;
    plantParts: Array<{ id: string; label: string; labelEN: string }>;
    ownershipTypes: Array<{ id: string; label: string; labelEN: string }>;
    applicantTypes: Array<{ id: string; label: string; labelEN: string; icon: string }>;
    _version?: string;
}

// Fallback data for offline/error scenarios
const FALLBACK_FEES: GACPFees = {
    documentReview: 5000,
    siteInspection: 25000,
    perTypeTotal: 30000,
    platformFeePercent: 10,
};

const FALLBACK_QR_PRICING: QRPricingTier[] = [
    { min: 1, max: 100, pricePerQR: 5 },
    { min: 101, max: 500, pricePerQR: 4 },
    { min: 501, max: 1000, pricePerQR: 3 },
    { min: 1001, max: 999999, pricePerQR: 2 },
];

const FALLBACK_CULTIVATION_METHODS: CultivationMethod[] = [
    { id: 'outdoor', name: 'ปลูกกลางแจ้ง', nameEn: 'Outdoor', icon: '🌞', yieldMultiplier: 1.0 },
    { id: 'greenhouse', name: 'โรงเรือน', nameEn: 'Greenhouse', icon: '🏠', yieldMultiplier: 1.2 },
    { id: 'indoor', name: 'ฟาร์มแบบปิด', nameEn: 'Indoor', icon: '🏭', yieldMultiplier: 1.5 },
];

const FALLBACK_PURPOSES: Purpose[] = [
    { id: 'RESEARCH', name: 'เพื่อการวิจัย', nameEn: 'Research', icon: '🔬' },
    { id: 'COMMERCIAL', name: 'เพื่อจำหน่าย', nameEn: 'Commercial', icon: '🏪' },
    { id: 'EXPORT', name: 'เพื่อส่งออก', nameEn: 'Export', icon: '🌍' },
];

/**
 * Hook to fetch and cache master data from API
 * Implements API-First principle: all configurable data comes from backend
 */
export function useMasterData() {
    const [data, setData] = useState<MasterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMasterData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get<MasterData>('/master-data');

            if (response.success && response.data) {
                setData(response.data);
                setError(null);
            } else {
                setError(response.error || 'Failed to fetch master data');
            }
        } catch (err) {
            console.error('[useMasterData] Error:', err);
            setError('ไม่สามารถโหลดข้อมูลระบบได้');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);

    // Helper function to calculate GACP fee based on cultivation types
    const calculateGACPFee = useCallback((selectedTypes: string[]) => {
        const fees = data?.fees || FALLBACK_FEES;
        const typeCount = selectedTypes.length || 1;
        const documentReview = fees.documentReview * typeCount;
        const siteInspection = fees.siteInspection * typeCount;
        const total = documentReview + siteInspection;

        return {
            documentReview,
            siteInspection,
            total,
            typeCount,
            perTypeTotal: fees.perTypeTotal,
        };
    }, [data?.fees]);

    // Helper function to calculate QR cost
    const calculateQRCost = useCallback((plantCount: number) => {
        const pricing = data?.qrPricing || FALLBACK_QR_PRICING;
        const tier = pricing.find(t => plantCount >= t.min && plantCount <= t.max);
        return {
            count: plantCount,
            pricePerQR: tier?.pricePerQR || 5,
            total: plantCount * (tier?.pricePerQR || 5),
        };
    }, [data?.qrPricing]);

    return {
        // Raw data
        data,
        loading,
        error,
        refetch: fetchMasterData,

        // Convenience accessors with fallbacks
        purposes: data?.purposes || FALLBACK_PURPOSES,
        cultivationMethods: data?.cultivationMethods || FALLBACK_CULTIVATION_METHODS,
        subCultivationMethods: data?.subCultivationMethods || [],
        fees: data?.fees || FALLBACK_FEES,
        qrPricing: data?.qrPricing || FALLBACK_QR_PRICING,
        soilTypes: data?.soilTypes || [],
        waterSources: data?.waterSources || [],
        plotTypes: data?.plotTypes || [],
        plantParts: data?.plantParts || [],
        ownershipTypes: data?.ownershipTypes || [],
        applicantTypes: data?.applicantTypes || [],

        // Helper functions
        calculateGACPFee,
        calculateQRCost,
    };
}

export default useMasterData;
