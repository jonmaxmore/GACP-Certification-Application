"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type PlantId = 'cannabis' | 'kratom' | 'turmeric' | 'ginger' | 'black_galangal' | 'plai';
export type ServiceType = 'NEW' | 'RENEWAL' | 'MODIFY' | 'REPLACEMENT';
export type PlantGroup = 'HIGH_CONTROL' | 'GENERAL';
export type CertificationPurpose = 'RESEARCH' | 'COMMERCIAL' | 'EXPORT';
export type SiteType = 'OUTDOOR' | 'INDOOR' | 'GREENHOUSE';
export type CultivationMethod = 'outdoor' | 'greenhouse' | 'indoor' | 'vertical' | 'hydroponic';

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
    communityAddress?: string;        // ที่อยู่วิสาหกิจชุมชน
    communityRegDate?: string;        // วันที่จดทะเบียน
    presidentName?: string;           // ชื่อประธาน
    presidentIdCard?: string;         // เลขบัตรประชาชนประธาน
    presidentPhone?: string;          // โทรศัพท์ประธาน
    memberCount?: number;             // จำนวนสมาชิก
    registrationSVC01?: string;       // รหัส สวช.01
    registrationTVC3?: string;        // รหัส ท.ว.ช.3
    houseRegistrationCode?: string;   // เลขรหัสประจำบ้าน
    registeredAddress?: string;       // ที่อยู่ตามทะเบียนบ้าน

    // นิติบุคคล (Juristic Person)
    companyName?: string;             // ชื่อสถานประกอบการ/บริษัท
    companyAddress?: string;          // ที่อยู่สถานที่จัดตั้ง
    companyPhone?: string;            // โทรศัพท์สถานที่จัดตั้ง
    companyType?: string;             // ประเภทนิติบุคคล
    taxId?: string;                   // เลขประจำตัวผู้เสียภาษี
    registeredCapital?: string;       // ทุนจดทะเบียน
    directorName?: string;            // ชื่อประธานกรรมการ
    directorIdCard?: string;          // เลขบัตรประชาชนกรรมการ
    directorPhone?: string;           // โทรศัพท์ประธานกรรมการ
    directorEmail?: string;           // อีเมลประธาน
    directorPosition?: string;        // ตำแหน่ง
    registrationNumber?: string;      // เลขทะเบียนนิติบุคคล/เลขผู้เสียภาษี
    powerOfAttorneyUrl?: string;      // หนังสือมอบอำนาจ (PDF URL)
    coordinatorName?: string;         // ชื่อผู้ประสานงาน (กรณีมอบอำนาจ)
    coordinatorPhone?: string;        // โทรศัพท์ผู้ประสานงาน
    coordinatorLineId?: string;       // Line ID ผู้ประสานงาน
    contactName?: string;             // ชื่อผู้ติดต่อ
    contactPhone?: string;            // โทรศัพท์ผู้ติดต่อ
    contactEmail?: string;            // อีเมลผู้ติดต่อ

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

// [NEW] Cultivation Details for dynamic form based on method
export interface CultivationDetails {
    method: CultivationMethod;
    strainId: string;
    strainName?: string;
    // For outdoor/ground
    plantsPerRai?: number;
    plantSpacing?: string;
    // For greenhouse
    greenhouseCount?: number;
    greenhouseSize?: string;
    // For vertical/rack
    rackLayers?: number;
    racksPerLayer?: number;
    plantsPerRack?: number;
    // For hydroponic
    hydroSystem?: 'NFT' | 'DWC' | 'DRIP';
    potCount?: number;
    // Common
    totalPlants: number;
    plantingDate: string; // ISO date
    estimatedHarvestDate?: string; // ISO date
    harvestCyclesPerYear?: number;
    estimatedYieldPerCycle?: number; // kg
}

// [NEW] QR Tracking Data per plant
export interface PlantTrackingData {
    plantId: string;
    qrCode?: string;
    plantingDate: string;
    actualHarvestDate?: string;
    status: 'PLANTED' | 'GROWING' | 'HARVESTED' | 'DESTROYED';
}

// [NEW] Per-step documents (inline uploads)
export interface StepDocument {
    stepNumber: number;
    docType: string;
    fileName?: string;
    fileUrl?: string;
    uploadedAt?: string;
    required: boolean;
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
    harvestData: HarvestData | null;
    securityData: SecurityData | null;
    documents: DocumentUpload[];
    youtubeUrl?: string;
    locationType: SiteType | null;
    generalInfo: GeneralInfo | null;
    applicationId?: string;
    createdAt?: string;
    updatedAt?: string;
    // [NEW] V4 Fields for 9-step redesign
    cultivationMethod: CultivationMethod | null;
    cultivationDetails: CultivationDetails | null;
    stepDocuments: StepDocument[];
    plantTracking: PlantTrackingData[];
    qrCount: number;
    estimatedQRCost: number;
}

interface WizardActions {
    // State update actions
    updateState: (updates: Partial<WizardState>) => void;
    setPlant: (plantId: PlantId) => void;
    setServiceType: (serviceType: ServiceType) => void;
    setCertificationPurpose: (purpose: CertificationPurpose) => void;
    setSiteTypes: (siteTypes: SiteType[]) => void;
    setLicensePdfUrl: (url: string | null) => void;
    setApplicantData: (applicantData: ApplicantData) => void;
    setSiteData: (siteData: SiteData) => void;
    setProductionData: (productionData: ProductionData) => void;
    setHarvestData: (harvestData: HarvestData) => void;
    setSecurityData: (securityData: SecurityData) => void;
    setDocuments: (documents: DocumentUpload[]) => void;
    setLocationType: (locationType: SiteType) => void;
    setYoutubeUrl: (youtubeUrl: string) => void;
    setGeneralInfo: (generalInfo: GeneralInfo) => void;
    setCurrentStep: (step: number) => void;
    consentPDPA: () => void;
    acknowledgeStandards: () => void;
    resetWizard: () => void;
    setApplicationId: (applicationId: string) => void;
}

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
    harvestData: null,
    securityData: null,
    documents: [],
    youtubeUrl: '',
    locationType: null,
    generalInfo: null,
    // [NEW] V4 Fields
    cultivationMethod: null,
    cultivationDetails: null,
    stepDocuments: [],
    plantTracking: [],
    qrCount: 0,
    estimatedQRCost: 0,
};

const STORAGE_KEY = 'gacp_wizard_state_v3'; // Bumped version for Zustand migration

// Create the Zustand store with persistence
const useWizardStoreBase = create<WizardState & WizardActions>()(
    persist(
        (set, get) => ({
            // Initial state
            ...initialState,

            // Actions
            updateState: (updates) => set((state) => ({ ...state, ...updates })),

            setPlant: (plantId) => set((state) => ({
                plantId,
                currentStep: Math.max(state.currentStep, 0)
            })),

            setServiceType: (serviceType) => set({ serviceType }),

            setCertificationPurpose: (purpose) => set({ certificationPurpose: purpose }),

            setSiteTypes: (siteTypes) => set({ siteTypes }),

            setLicensePdfUrl: (url) => set({ licensePdfUrl: url }),

            setApplicantData: (applicantData) => set({ applicantData }),

            setSiteData: (siteData) => set({ siteData }),

            setProductionData: (productionData) => set({ productionData }),

            setHarvestData: (harvestData) => set({ harvestData }),

            setSecurityData: (securityData) => set({ securityData }),

            setDocuments: (documents) => set({ documents }),

            setLocationType: (locationType) => set({ locationType }),

            setYoutubeUrl: (youtubeUrl) => set({ youtubeUrl }),

            setGeneralInfo: (generalInfo) => set({ generalInfo }),

            setCurrentStep: (step) => set({ currentStep: step }),

            consentPDPA: () => set({ consentedPDPA: true }),

            acknowledgeStandards: () => set({ acknowledgedStandards: true }),

            resetWizard: () => set(initialState),

            setApplicationId: (applicationId) => set({ applicationId }),
        }),
        {
            name: STORAGE_KEY,
            // Only persist on client side
            skipHydration: true,
        }
    )
);

// Validation helpers - Updated for 9-step flow
export function canProceedFromStep(state: WizardState, step: number): boolean {
    switch (step) {
        case 0: return !!state.plantId && !!state.certificationPurpose && !!state.cultivationMethod; // Plant & Purpose
        case 1: return !!state.applicantData?.applicantType; // Applicant
        case 2: return !!state.siteData?.siteName && !!state.siteData?.gpsLat; // Site
        case 3: return !!state.cultivationDetails?.totalPlants; // Cultivation
        case 4: return !!state.securityData; // Security
        case 5: return !!state.harvestData?.harvestMethod; // Harvest
        case 6: return state.documents.filter(d => d.uploaded).length >= 1; // Additional Documents
        case 7: return true; // Review
        case 8: return true; // Submit & Payment
        default: return false;
    }
}

export function getCompletedSteps(state: WizardState): number[] {
    const completed: number[] = [];
    for (let i = 0; i <= 8; i++) { // 9 steps (0-8)
        if (canProceedFromStep(state, i)) {
            completed.push(i);
        } else {
            break;
        }
    }
    return completed;
}

// Wrapper hook for compatibility with existing code
export function useWizardStore() {
    const store = useWizardStoreBase();

    // Extract state object for compatibility
    const state: WizardState = {
        currentStep: store.currentStep,
        plantId: store.plantId,
        serviceType: store.serviceType,
        certificationPurpose: store.certificationPurpose,
        siteTypes: store.siteTypes,
        licensePdfUrl: store.licensePdfUrl,
        consentedPDPA: store.consentedPDPA,
        acknowledgedStandards: store.acknowledgedStandards,
        applicantData: store.applicantData,
        siteData: store.siteData,
        productionData: store.productionData,
        harvestData: store.harvestData,
        securityData: store.securityData,
        documents: store.documents,
        youtubeUrl: store.youtubeUrl,
        locationType: store.locationType,
        generalInfo: store.generalInfo,
        applicationId: store.applicationId,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        // V4 Fields
        cultivationMethod: store.cultivationMethod,
        cultivationDetails: store.cultivationDetails,
        stepDocuments: store.stepDocuments,
        plantTracking: store.plantTracking,
        qrCount: store.qrCount,
        estimatedQRCost: store.estimatedQRCost,
    };

    return {
        state,
        isLoaded: true, // Zustand handles hydration
        updateState: store.updateState,
        setPlant: store.setPlant,
        setServiceType: store.setServiceType,
        setCertificationPurpose: store.setCertificationPurpose,
        setSiteTypes: store.setSiteTypes,
        setLicensePdfUrl: store.setLicensePdfUrl,
        setApplicantData: store.setApplicantData,
        setSiteData: store.setSiteData,
        setProductionData: store.setProductionData,
        setHarvestData: store.setHarvestData,
        setSecurityData: store.setSecurityData,
        setDocuments: store.setDocuments,
        setYoutubeUrl: store.setYoutubeUrl,
        setGeneralInfo: store.setGeneralInfo,
        setCurrentStep: store.setCurrentStep,
        consentPDPA: store.consentPDPA,
        acknowledgeStandards: store.acknowledgeStandards,
        resetWizard: store.resetWizard,
        setApplicationId: store.setApplicationId,
        setLocationType: store.setLocationType,
        canProceedFromStep: (step: number) => canProceedFromStep(state, step),
        getCompletedSteps: () => getCompletedSteps(state),
    };
}

// Export the base store for direct access if needed
export { useWizardStoreBase };
