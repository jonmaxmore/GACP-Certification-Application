'use client';

import { useEffect, useState } from 'react';
import { useWizardStore, CultivationMethod, PlantId, ServiceType } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/api-client';
import { PurposeSelector, CertificationPurpose } from '@/components/PurposeSelector';
import { CultivationMethodSelector } from '@/components/CultivationMethodSelector';
import { getPlantIcon } from '@/components/icons/PlantIcons';
import { CheckIcon, InfoIcon } from '@/components/icons/WizardIcons';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Plant {
    id: string;
    code: string;
    nameTH: string;
    nameEN: string;
    group: 'HIGH_CONTROL' | 'GENERAL';
    imageUrl?: string;
    enabled?: boolean;
    availableServiceTypes?: string[];
}

// Plant data with availability status
const FALLBACK_PLANTS: Plant[] = [
    { id: '1', code: 'cannabis', nameTH: 'กัญชา', nameEN: 'Cannabis', group: 'HIGH_CONTROL', enabled: true, availableServiceTypes: ['NEW', 'RENEWAL', 'MODIFY'] },
    { id: '3', code: 'kratom', nameTH: 'กระท่อม', nameEN: 'Kratom', group: 'HIGH_CONTROL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '4', code: 'turmeric', nameTH: 'ขมิ้นชัน', nameEN: 'Turmeric', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '5', code: 'ginger', nameTH: 'ขิง', nameEN: 'Ginger', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '6', code: 'plai', nameTH: 'ไพล', nameEN: 'Plai', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '7', code: 'bsd', nameTH: 'กระชายดำ', nameEN: 'Black Galingale', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
];

export const StepPlantSelection = () => {
    const { state, setPlant, setServiceType, setCertificationPurpose, updateState } = useWizardStore();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { dict, language } = useLanguage();

    const serviceTypes = [
        { id: 'NEW', ...dict.wizard.plantSelection.serviceTypes.new },
        { id: 'RENEWAL', ...dict.wizard.plantSelection.serviceTypes.renewal },
        { id: 'MODIFY', ...dict.wizard.plantSelection.serviceTypes.modify }
    ];

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get<Plant[]>('/plants');
                if (res.success && res.data && res.data.length > 0) {
                    const allowedCodes = FALLBACK_PLANTS.map(f => f.code);
                    const normalizedData = res.data.map(p => ({ ...p, code: p.code.toLowerCase() }));
                    const filteredPlants = normalizedData.filter(p => allowedCodes.includes(p.code));
                    const mergedPlants = filteredPlants.map(p => {
                        const fallback = FALLBACK_PLANTS.find(f => f.code === p.code);
                        return { ...p, enabled: fallback?.enabled ?? false, availableServiceTypes: fallback?.availableServiceTypes ?? ['NEW'] };
                    });
                    setPlants(mergedPlants.length > 0 ? mergedPlants : FALLBACK_PLANTS);
                } else {
                    setPlants(FALLBACK_PLANTS);
                }
            } catch {
                setPlants(FALLBACK_PLANTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const selectedPlant = plants.find(p => p.code === state.plantId);
    const availableServiceTypes = selectedPlant?.availableServiceTypes || ['NEW', 'RENEWAL', 'MODIFY'];
    const isReady = !!(state.plantId && state.serviceType && state.certificationPurpose && state.cultivationMethod);

    const handleNext = () => {
        if (isReady) router.push('/farmer/applications/new/step/2');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">

            {/* Section 1: Plant Selection */}
            <section className="gacp-card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-primary-50">
                        1
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">{dict.wizard.plantSelection.sections.plant}</h2>
                        <p className="text-text-secondary text-sm">{dict.wizard.plantSelection.sections.plantDesc}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {plants.map((plant) => {
                            const isSelected = state.plantId === plant.code;
                            const isDisabled = !plant.enabled;
                            return (
                                <button
                                    key={plant.id}
                                    onClick={() => !isDisabled && setPlant(plant.code as PlantId)}
                                    disabled={isDisabled}
                                    className={`
                                        relative p-4 rounded-xl flex flex-col items-center justify-center min-h-[180px] transition-all duration-200 border-2
                                        ${isDisabled
                                            ? 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-primary-50 border-primary shadow-md ring-2 ring-primary/20 scale-105 z-10'
                                                : 'bg-white border-transparent hover:border-gray-200 hover:shadow-lg hover:-translate-y-1'
                                        }
                                    `}
                                >
                                    {isDisabled && (
                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold rounded-full">
                                            เร็วๆ นี้
                                        </span>
                                    )}
                                    {isSelected && (
                                        <span className="absolute top-2 right-2 text-primary animate-scale-in">
                                            <CheckIcon className="w-6 h-6" />
                                        </span>
                                    )}

                                    <div className={`
                                        w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isSelected ? 'scale-110 drop-shadow-md' : 'grayscale-[0.3] group-hover:grayscale-0'}
                                    `}>
                                        {getPlantIcon(plant.code, { size: 48 })}
                                    </div>

                                    <div className={`font-bold text-base mb-0.5 ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                                        {language === 'th' ? plant.nameTH : plant.nameEN}
                                    </div>
                                    <div className="text-xs text-text-muted uppercase font-medium">
                                        {language === 'th' ? plant.nameEN : plant.nameTH}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Section 2: Service Type */}
            <section className="gacp-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-primary-50">
                        2
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-primary">{dict.wizard.plantSelection.sections.serviceType}</h2>
                        <p className="text-text-secondary text-sm">{dict.wizard.plantSelection.sections.serviceTypeDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceTypes.filter(t => availableServiceTypes.includes(t.id)).map((type) => {
                        const isSelected = state.serviceType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setServiceType(type.id as ServiceType)}
                                className={`gacp-selection text-left group ${isSelected ? 'selected' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                                        {type.label}
                                    </span>
                                    {isSelected ? (
                                        <span className="text-primary animate-scale-in"><CheckIcon className="w-5 h-5" /></span>
                                    ) : (
                                        <span className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-primary-300"></span>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed ${isSelected ? 'text-primary-700' : 'text-text-secondary'}`}>
                                    {type.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 3 & 4 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {/* Section 3: Purpose */}
                <section className="gacp-card h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-primary-50">
                            3
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">{dict.wizard.plantSelection.sections.purpose}</h2>
                            <p className="text-text-secondary text-sm">{dict.wizard.plantSelection.sections.purposeDesc}</p>
                        </div>
                    </div>
                    <PurposeSelector
                        value={state.certificationPurpose as CertificationPurpose | undefined}
                        onChange={(purpose) => setCertificationPurpose(purpose)}
                        showDocPreview={true}
                    />
                </section>

                {/* Section 4: Cultivation Method */}
                <section className="gacp-card h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-primary-50">
                            4
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">{dict.wizard.plantSelection.sections.method}</h2>
                            <p className="text-text-secondary text-sm">{dict.wizard.plantSelection.sections.methodDesc}</p>
                        </div>
                    </div>

                    <CultivationMethodSelector
                        value={state.cultivationMethod as CultivationMethod | undefined}
                        onChange={(method) => updateState({ cultivationMethod: method })}
                        multiSelect={false}
                    />

                    <div className="mt-6 flex items-start gap-3 p-4 bg-background-subtle rounded-xl border border-gray-100">
                        <InfoIcon className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-text-secondary leading-relaxed">
                            {dict.wizard.plantSelection.note}
                        </p>
                    </div>
                </section>
            </div>

            <WizardNavigation
                onNext={handleNext}
                isNextDisabled={!isReady}
                showBack={false}
                nextLabel={dict.wizard.navigation.next}
            />
        </div>
    );
};
