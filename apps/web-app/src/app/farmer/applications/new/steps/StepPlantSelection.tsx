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

// ...imports remain same...

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
        <div className="space-y-8 animate-fade-in pb-12 px-4 max-w-xl mx-auto">

            {/* Section 1: Plant */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-bold">{dict.wizard.plantSelection.sections.plant}</h2>
                    <p className="text-slate-500 text-sm">{dict.wizard.plantSelection.sections.plantDesc}</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {plants.map((plant) => {
                            const isSelected = state.plantId === plant.code;
                            const isDisabled = !plant.enabled;
                            return (
                                <button
                                    key={plant.id}
                                    onClick={() => !isDisabled && setPlant(plant.code as PlantId)}
                                    disabled={isDisabled}
                                    className={`
                                        relative p-4 rounded-2xl flex flex-col items-center justify-center min-h-[160px] transition-all duration-200 border-2
                                        ${isDisabled
                                            ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-emerald-50 border-emerald-500 shadow-md scale-95'
                                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg active:scale-95'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-emerald-600 animate-scale-in bg-white rounded-full p-1 shadow-sm">
                                            <CheckIcon className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className={`
                                        w-14 h-14 mb-3 rounded-full flex items-center justify-center transition-all
                                        ${isSelected ? 'scale-110 drop-shadow-md' : 'grayscale group-hover:grayscale-0'}
                                    `}>
                                        {getPlantIcon(plant.code, { size: 40 })}
                                    </div>

                                    <div className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                                        {language === 'th' ? plant.nameTH : plant.nameEN}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-medium mt-1">
                                        {language === 'th' ? plant.nameEN : plant.nameTH}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Section 2: Service Type */}
            <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="mb-4">
                    <h2 className="text-xl font-bold">{dict.wizard.plantSelection.sections.serviceType}</h2>
                    <p className="text-slate-500 text-sm">{dict.wizard.plantSelection.sections.serviceTypeDesc}</p>
                </div>

                <div className="flex flex-col gap-3">
                    {serviceTypes.filter(t => availableServiceTypes.includes(t.id)).map((type) => {
                        const isSelected = state.serviceType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setServiceType(type.id as ServiceType)}
                                className={`
                                    p-4 rounded-2xl text-left transition-all border-2 active:scale-95
                                    ${isSelected
                                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                        : 'border-slate-100 bg-white hover:border-emerald-200'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-900'}`}>
                                        {type.label}
                                    </span>
                                    {isSelected && (
                                        <span className="text-emerald-600 bg-white rounded-full p-0.5"><CheckIcon className="w-4 h-4" /></span>
                                    )}
                                </div>
                                <p className={`text-xs ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {type.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 3 & 4 */}
            <div className="space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {/* Section 3: Purpose */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">{dict.wizard.plantSelection.sections.purpose}</h2>
                        <p className="text-slate-500 text-sm">{dict.wizard.plantSelection.sections.purposeDesc}</p>
                    </div>
                    <PurposeSelector
                        value={state.certificationPurpose as CertificationPurpose | undefined}
                        onChange={(purpose) => setCertificationPurpose(purpose)}
                        showDocPreview={true}
                    />
                </section>

                {/* Section 4: Cultivation Method */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">{dict.wizard.plantSelection.sections.method}</h2>
                        <p className="text-slate-500 text-sm">{dict.wizard.plantSelection.sections.methodDesc}</p>
                    </div>

                    <CultivationMethodSelector
                        value={state.cultivationMethod as CultivationMethod | undefined}
                        onChange={(method) => updateState({ cultivationMethod: method })}
                        multiSelect={false}
                    />
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
