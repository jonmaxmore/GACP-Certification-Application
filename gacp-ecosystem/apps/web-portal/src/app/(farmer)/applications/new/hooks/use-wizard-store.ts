"use client";

import { useState, useEffect, useCallback } from 'react';

// Types
export type PlantId = 'cannabis' | 'kratom' | 'turmeric' | 'ginger' | 'black_galangal' | 'plai';
export type ServiceType = 'NEW' | 'RENEWAL' | 'MODIFY' | 'REPLACEMENT';
export type PlantGroup = 'HIGH_CONTROL' | 'GENERAL';
export type CertificationPurpose = 'RESEARCH' | 'COMMERCIAL' | 'EXPORT';
export type SiteType = 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE';

export interface Plant {
    id: PlantId;
    name: string;
    icon: string;
    group: PlantGroup;
}

export const PLANTS: Plant[] = [
    { id: 'cannabis', name: 'กัญชา', icon: '🌿', group: 'HIGH_CONTROL' },
    { id: 'kratom', name: 'กระท่อม', icon: '🌱', group: 'HIGH_CONTROL' },
    { id: 'turmeric', name: 'ขมิ้นชัน', icon: '🟡', group: 'GENERAL' },
    { id: 'ginger', name: 'ขิง', icon: '🟤', group: 'GENERAL' },
    { id: 'black_galangal', name: 'กระชายดำ', icon: '⚫', group: 'GENERAL' },
    { id: 'plai', name: 'ไพล', icon: '🟢', group: 'GENERAL' },
];

// Expanded ApplicantData with all fields for INDIVIDUAL, JURISTIC, COMMUNITY
export interface ApplicantData {
    applicantType: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY';

    // บุคคลธรรมดา (Individual)
    firstName?: string;
    lastName?: string;
    fullName?: string;
    idCard?: string;
    phone?: string;
    email?: string;
    lineId?: string;
    address?: string;
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;

    // วิสาหกิจชุมชน (Community Enterprise)
    communityName?: string;           // ชื่อวิสาหกิจชุมชน
    presidentName?: string;            // ชื่อประธาน
    presidentIdCard?: string;          // เลขบัตรประชาชนประธาน
    registrationSVC01?: string;        // รหัส สวช.01
    registrationTVC3?: string;         // รหัส ท.ว.ช.3
    houseRegistrationCode?: string;    // เลขรหัสประจำบ้าน
    registeredAddress?: string;        // ที่อยู่ตามทะเบียนบ้าน

    // นิติบุคคล (Juristic Person)
    companyName?: string;              // ชื่อสถานประกอบการ/บริษัท
    companyAddress?: string;           // ที่อยู่สถานที่จัดตั้ง
    companyPhone?: string;             // โทรศัพท์สถานที่จัดตั้ง
    directorName?: string;             // ชื่อประธานกรรมการ
    registrationNumber?: string;       // เลขทะเบียนนิติบุคคล/เลขผู้เสียภาษี
    directorPhone?: string;            // โทรศัพท์ประธานกรรมการ
    directorEmail?: string;            // อีเมลประธาน
    powerOfAttorneyUrl?: string;       // หนังสือมอบอำนาจ (PDF URL)
    coordinatorName?: string;          // ชื่อผู้ประสานงาน (กรณีมอบอำนาจ)
    coordinatorPhone?: string;         // โทรศัพท์ผู้ประสานงาน
    coordinatorLineId?: string;        // Line ID ผู้ประสานงาน

    // Legacy fields
    responsibleName?: string;
    qualification?: string;
    plantingStatus?: 'NOTIFY' | 'LICENSED';
    licenseNumber?: string;
    licenseType?: 'BHT11' | 'BHT13' | 'BHT16';
}

// Expanded SiteData with all fields from original Step6SiteSecurity
export interface SiteData {
    siteName: string;
    siteAddress?: string;
    address: string;
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    gpsLat?: string;
    gpsLng?: string;
    latitude?: number;
    longitude?: number;
    areaSize?: string;
    areaUnit?: string;
    northBorder?: string;
    southBorder?: string;
    eastBorder?: string;
    westBorder?: string;
    landOwnership?: 'OWN' | 'RENT' | 'CONSENT';
    hasCCTV?: boolean;
    hasFence2m?: boolean;
    hasAccessLog?: boolean;
    hasBiometric?: boolean;
    hasAnimalFence?: boolean;
    hasZoneSign?: boolean;
}

// Expanded ProductionData with all fields from original Step5Production
export interface ProductionData {
    plantParts?: string[];
    plantPartsOther?: string;
    propagationType?: 'SEED' | 'CUTTING' | 'TISSUE' | 'OTHER';
    varietyName?: string;
    seedSource?: string;
    varietySource?: string;
    treeCount?: number;
    areaSizeRai?: number;
    quantityWithUnit?: string;
    harvestCycles?: number;
    estimatedYield?: number;
    sourceType?: 'SELF' | 'BUY' | 'IMPORT';
    sourceDetail?: string;
    hasGAPCert?: boolean;
    hasOrganicCert?: boolean;
    cultivationArea?: string;
    annualProduction?: string;
    harvestMethod?: string;
    storageMethod?: string;
    qualityControl?: string;
}

export interface SecurityData {
    hasFence: boolean;
    hasCCTV: boolean;
    hasGuard: boolean;
    hasAccessControl: boolean;
    securityNotes?: string;
}

export interface DocumentUpload {
    id: string;
    name?: string;
    type?: string;
    url?: string;
    uploaded: boolean;
}

export interface WizardState {
    currentStep: number;
    plantId: PlantId | null;
    serviceType: ServiceType | null;
    certificationPurpose: CertificationPurpose | null;
    siteTypes: SiteType[];
    licensePdfUrl: string | null;
    consentedPDPA: boolean;
    acknowledgedStandards: boolean;
    applicantData: ApplicantData | null;
    siteData: SiteData | null;
    productionData: ProductionData | null;
    securityData: SecurityData | null;
    documents: DocumentUpload[];
    applicationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

const STORAGE_KEY = 'gacp_wizard_state';

const initialState: WizardState = {
    currentStep: 0,
    plantId: null,
    serviceType: null,
    certificationPurpose: null,
    siteTypes: [],
    licensePdfUrl: null,
    consentedPDPA: false,
    acknowledgedStandards: false,
    applicantData: null,
    siteData: null,
    productionData: null,
    securityData: null,
    documents: [],
};

export function useWizardStore() {
    const [state, setState] = useState<WizardState>(initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setState(parsed);
            }
        } catch (e) {
            console.error('Failed to load wizard state:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on every state change
    useEffect(() => {
        if (isLoaded) {
            try {
                const toSave = { ...state, updatedAt: new Date().toISOString() };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
            } catch (e) {
                console.error('Failed to save wizard state:', e);
            }
        }
    }, [state, isLoaded]);

    // Update functions
    const updateState = useCallback((updates: Partial<WizardState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const setPlant = useCallback((plantId: PlantId) => {
        setState(prev => ({ ...prev, plantId, currentStep: Math.max(prev.currentStep, 0) }));
    }, []);

    const setServiceType = useCallback((serviceType: ServiceType) => {
        setState(prev => ({ ...prev, serviceType }));
    }, []);

    const setCertificationPurpose = useCallback((purpose: CertificationPurpose) => {
        setState(prev => ({ ...prev, certificationPurpose: purpose }));
    }, []);

    const setSiteTypes = useCallback((siteTypes: SiteType[]) => {
        setState(prev => ({ ...prev, siteTypes }));
    }, []);

    const setLicensePdfUrl = useCallback((url: string | null) => {
        setState(prev => ({ ...prev, licensePdfUrl: url }));
    }, []);

    const setApplicantData = useCallback((applicantData: ApplicantData) => {
        setState(prev => ({ ...prev, applicantData }));
    }, []);

    const setSiteData = useCallback((siteData: SiteData) => {
        setState(prev => ({ ...prev, siteData }));
    }, []);

    const setProductionData = useCallback((productionData: ProductionData) => {
        setState(prev => ({ ...prev, productionData }));
    }, []);

    const setSecurityData = useCallback((securityData: SecurityData) => {
        setState(prev => ({ ...prev, securityData }));
    }, []);

    const setDocuments = useCallback((documents: DocumentUpload[]) => {
        setState(prev => ({ ...prev, documents }));
    }, []);

    const setCurrentStep = useCallback((step: number) => {
        setState(prev => ({ ...prev, currentStep: step }));
    }, []);

    const consentPDPA = useCallback(() => {
        setState(prev => ({ ...prev, consentedPDPA: true }));
    }, []);

    const acknowledgeStandards = useCallback(() => {
        setState(prev => ({ ...prev, acknowledgedStandards: true }));
    }, []);

    const resetWizard = useCallback(() => {
        setState(initialState);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const setApplicationId = useCallback((applicationId: string) => {
        setState(prev => ({ ...prev, applicationId }));
    }, []);

    // Validation helpers
    const canProceedFromStep = useCallback((step: number): boolean => {
        switch (step) {
            case 0: return !!state.plantId;
            case 1: return !!state.certificationPurpose && state.siteTypes.length > 0;
            case 2: return !!state.serviceType;
            case 3: return state.consentedPDPA;
            case 4: return state.acknowledgedStandards;
            case 5: return !!state.applicantData?.firstName || !!state.applicantData?.companyName;
            case 6: return !!state.siteData?.siteName;
            case 7: return true; // Production data optional
            case 8: return state.documents.filter(d => d.uploaded).length > 0;
            case 9: return true; // Review step
            case 10: return true; // Payment step
            default: return false;
        }
    }, [state]);

    const getCompletedSteps = useCallback((): number[] => {
        const completed: number[] = [];
        for (let i = 0; i <= 9; i++) {
            if (canProceedFromStep(i)) {
                completed.push(i);
            } else {
                break;
            }
        }
        return completed;
    }, [canProceedFromStep]);

    return {
        state,
        isLoaded,
        updateState,
        setPlant,
        setServiceType,
        setCertificationPurpose,
        setSiteTypes,
        setLicensePdfUrl,
        setApplicantData,
        setSiteData,
        setProductionData,
        setSecurityData,
        setDocuments,
        setCurrentStep,
        consentPDPA,
        acknowledgeStandards,
        resetWizard,
        setApplicationId,
        canProceedFromStep,
        getCompletedSteps,
    };
}
