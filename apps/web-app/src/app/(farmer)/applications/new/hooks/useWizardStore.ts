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
    { id: 'cannabis', name: 'กัญชา', icon: '', group: 'HIGH_CONTROL' },
    { id: 'kratom', name: 'กระท่อม', icon: '', group: 'HIGH_CONTROL' },
    { id: 'turmeric', name: 'ขมิ้นชัน', icon: '', group: 'GENERAL' },
    { id: 'ginger', name: 'ขิง', icon: '', group: 'GENERAL' },
    { id: 'black_galangal', name: 'กระชายดำ', icon: '', group: 'GENERAL' },
    { id: 'plai', name: 'ไพล', icon: '', group: 'GENERAL' },
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
    presidentName?: string;            // พื่อประธาน
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

// [NEW] General Information
export interface GeneralInfo {
    projectName: string;
    certType: string;
}

// [NEW] Plot Definition
export interface Plot {
    id: string; // uuid or temp-id
    name: string; // e.g., "Greenhouse A"
    areaSize: string; // e.g., "2"
    areaUnit: string; // e.g., "Rai"
    solarSystem: 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE';
    latitude?: number;
    longitude?: number;
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
    soilType?: string;          // Added for GACP
    waterSource?: string;       // Added for GACP
    hasCCTV?: boolean;
    hasFence2m?: boolean;
    hasAccessLog?: boolean;
    hasBiometric?: boolean;
    hasAnimalFence?: boolean;
    hasZoneSign?: boolean;

    // [NEW] Plot Management
    plots?: Plot[];
}

// Expanded ProductionData with all fields from original Step5Production
export interface ProductionData {
    plantParts?: string[];
    plantPartsOther?: string;
    propagationType?: 'SEED' | 'CUTTING' | 'TISSUE' | 'OTHER';
    cultivationMethod?: 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE'; // Added for GACP
    irrigationType?: 'DRIP' | 'SPRINKLER' | 'MANUAL' | 'FLOOD'; // Added for GACP
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
    spacing?: string;
    plantCount?: string;
}

export interface SecurityData {
    hasFence: boolean;
    hasCCTV: boolean;
    hasGuard: boolean;
    hasAccessControl: boolean;
    securityNotes?: string;
}

// [NEW] Harvest & Post-Harvest
export interface HarvestData {
    harvestMethod: 'MANUAL' | 'MACHINE' | '';
    dryingMethod: 'SUN' | 'OVEN' | 'DEHYDRATOR' | 'OTHER' | '';
    dryingDetail?: string; // If OTHER
    storageSystem: 'CONTROLLED' | 'AMBIENT' | '';
    packaging: string;
}

export interface DocumentUpload {
    id: string;
    name?: string;
    type?: string;
    url?: string;
    uploaded: boolean;
    metadata?: any; // [NEW] For storing extracted data (e.g., Land Area)
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
    harvestData: HarvestData | null; // [NEW]
    securityData: SecurityData | null;
    documents: DocumentUpload[];
    youtubeUrl?: string; // Added for GACP V2
    locationType: SiteType | null; // [NEW] Added for Step 1.5
    generalInfo: GeneralInfo | null; // [NEW] Added for Step 1
    applicationId?: string;
    createdAt?: string;
    updatedAt?: string;
}

const STORAGE_KEY = 'gacp_wizard_state_v2'; // Changed key to force reset state

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
    harvestData: null, // [NEW]
    securityData: null,
    documents: [],
    youtubeUrl: '',
    locationType: null,
    generalInfo: null,
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

    const setHarvestData = useCallback((harvestData: HarvestData) => {
        setState(prev => ({ ...prev, harvestData }));
    }, []);

    const setSecurityData = useCallback((securityData: SecurityData) => {
        setState(prev => ({ ...prev, securityData }));
    }, []);

    const setDocuments = useCallback((documents: DocumentUpload[]) => {
        setState(prev => ({ ...prev, documents }));
    }, []);

    const setLocationType = useCallback((locationType: SiteType) => {
        setState(prev => ({ ...prev, locationType }));
    }, []);

    const setYoutubeUrl = useCallback((youtubeUrl: string) => {
        setState(prev => ({ ...prev, youtubeUrl }));
    }, []);

    const setGeneralInfo = useCallback((generalInfo: GeneralInfo) => {
        setState(prev => ({ ...prev, generalInfo }));
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
    // 0: Plant, 1: General, 2: Land, 3: Plots, 4: Production, 5: Harvest, 6: Docs, 7: PreCheck, 8: Review, 9: Quote, 10: Invoice, 11: Success
    const canProceedFromStep = useCallback((step: number): boolean => {
        switch (step) {
            case 0: return !!state.plantId && !!state.certificationPurpose && state.siteTypes.length > 0;
            case 1: return !!state.generalInfo?.projectName;
            case 2: return !!state.siteData?.siteName && !!state.siteData?.gpsLat;
            case 3: return true; // Plots
            case 4: return true; // Production
            case 5: return !!state.harvestData?.harvestMethod; // [NEW] Harvest
            case 6: return state.documents.filter(d => d.uploaded).length > 0;
            case 7: return true; // PreCheck
            case 8: return true; // Review
            case 9: return true; // Quote
            case 10: return true; // Invoice
            case 11: return true; // Success
            default: return false;
        }
    }, [state]);

    const getCompletedSteps = useCallback((): number[] => {
        const completed: number[] = [];
        for (let i = 0; i <= 10; i++) {
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
        setHarvestData,
        setSecurityData,
        setDocuments,
        setYoutubeUrl,
        setGeneralInfo,
        setCurrentStep,
        consentPDPA,
        acknowledgeStandards,
        resetWizard,
        setApplicationId,
        canProceedFromStep,
        getCompletedSteps,
        setLocationType,
    };
}
