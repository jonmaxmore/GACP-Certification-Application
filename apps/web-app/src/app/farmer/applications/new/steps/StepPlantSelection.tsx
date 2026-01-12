'use client';

import { useEffect, useState } from 'react';
import { useWizardStore, CultivationMethod } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/api-client';
import { PurposeSelector, CertificationPurpose } from '@/components/PurposeSelector';
import { CultivationMethodSelector } from '@/components/CultivationMethodSelector';

interface Plant {
    id: string;
    code: string;
    nameTH: string;
    nameEN: string;
    group: 'HIGH_CONTROL' | 'GENERAL';
    imageUrl?: string;
    enabled?: boolean; // NEW: whether plant is enabled for applications
    availableServiceTypes?: string[]; // NEW: which service types are available
}

// Plant data with availability status
const FALLBACK_PLANTS: Plant[] = [
    {
        id: '1',
        code: 'CANNABIS',
        nameTH: 'กัญชา',
        nameEN: 'Cannabis',
        group: 'HIGH_CONTROL',
        enabled: true, // Only Cannabis is enabled
        availableServiceTypes: ['NEW', 'RENEWAL', 'MODIFY'], // Cannabis has all 3 options
    },
    {
        id: '3',
        code: 'KRATOM',
        nameTH: 'กระท่อม',
        nameEN: 'Kratom',
        group: 'HIGH_CONTROL',
        enabled: false, // Coming soon
        availableServiceTypes: ['NEW'], // Only NEW for non-Cannabis
    },
    {
        id: '4',
        code: 'TURMERIC',
        nameTH: 'ขมิ้นชัน',
        nameEN: 'Turmeric',
        group: 'GENERAL',
        enabled: false,
        availableServiceTypes: ['NEW'], // Only NEW for non-Cannabis
    },
    {
        id: '5',
        code: 'GINGER',
        nameTH: 'ขิง',
        nameEN: 'Ginger',
        group: 'GENERAL',
        enabled: false,
        availableServiceTypes: ['NEW'], // Only NEW for non-Cannabis
    },
    {
        id: '6',
        code: 'PLAI',
        nameTH: 'ไพล',
        nameEN: 'Plai',
        group: 'GENERAL',
        enabled: false,
        availableServiceTypes: ['NEW'], // Only NEW for non-Cannabis
    },
    {
        id: '7',
        code: 'BSD',
        nameTH: 'กระชายดำ',
        nameEN: 'Black Galingale',
        group: 'GENERAL',
        enabled: false,
        availableServiceTypes: ['NEW'], // Only NEW for non-Cannabis
    },
];

// Service types configuration
const SERVICE_TYPES = [
    { id: 'NEW', label: 'ขอใหม่', desc: 'สำหรับผู้ที่ไม่เคยมีใบรับรอง หรือใบรับรองเดิมขาดอายุเกินกำหนด' },
    { id: 'RENEWAL', label: 'ต่ออายุ', desc: 'สำหรับใบเดิมที่ใกล้หมดอายุ (ล่วงหน้า 90 วัน)' },
    { id: 'MODIFY', label: 'เปลี่ยนแปลงรายการ', desc: 'แก้ไขข้อมูลในใบรับรองเดิม เช่น เปลี่ยนผู้ดำเนินกิจการ' }
];

export const StepPlantSelection = () => {
    const {
        state,
        setPlant,
        setServiceType,
        setCertificationPurpose,
        setLocationType,
        setCurrentStep,
        updateState
    } = useWizardStore();

    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                // Try fetching from API
                const res = await api.get<Plant[]>('/plants');
                if (res.success && res.data && res.data.length > 0) {
                    // Filter: Only include plants that exist in FALLBACK_PLANTS (exclude Test, duplicate Cannabis)
                    const allowedCodes = FALLBACK_PLANTS.map(f => f.code);
                    const filteredPlants = res.data.filter(p => allowedCodes.includes(p.code));

                    // Merge with enabled status from fallback
                    const mergedPlants = filteredPlants.map(p => {
                        const fallback = FALLBACK_PLANTS.find(f => f.code === p.code);
                        return {
                            ...p,
                            enabled: fallback?.enabled ?? false,
                            availableServiceTypes: fallback?.availableServiceTypes ?? ['NEW'],
                        };
                    });

                    // Use merged if we have matching plants, otherwise use fallback
                    setPlants(mergedPlants.length > 0 ? mergedPlants : FALLBACK_PLANTS);
                } else {
                    console.warn('API returned empty plants, using fallback.');
                    setPlants(FALLBACK_PLANTS);
                }
            } catch (err) {
                console.error('Failed to fetch plants, using fallback.', err);
                setPlants(FALLBACK_PLANTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const router = useRouter();

    // Get selected plant config
    const selectedPlant = plants.find(p => p.code === state.plantId);
    const availableServiceTypes = selectedPlant?.availableServiceTypes || ['NEW', 'RENEWAL', 'MODIFY'];

    const handleNext = () => {
        if (state.plantId && state.serviceType && state.certificationPurpose && state.cultivationMethod) {
            router.push('/farmer/applications/new/step/2');
        }
    };

    // Updated validation for 9-step flow: need plant + purpose + cultivation method
    const isReady = state.plantId && state.serviceType && state.certificationPurpose && state.cultivationMethod;

    return (
        <div className="space-y-10 animate-fadeIn">
            <div className="border-b pb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    ข้อมูลพืชและคำขอ
                </h2>
                <p className="text-slate-500 mt-1 text-sm">กรุณาระบุข้อมูลให้ครบถ้วนเพื่อดำเนินการต่อ</p>
            </div>

            {/* 1. Plant Selection */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">1</div>
                    <h3 className="text-lg font-semibold text-slate-700">เลือกพืชสมุนไพร</h3>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse"></div>
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
                                    onClick={() => !isDisabled && setPlant(plant.code as any)}
                                    disabled={isDisabled}
                                    className={`
                                        relative group p-4 rounded-xl border transition-all duration-200 text-left
                                        ${isDisabled
                                            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                                            : isSelected
                                                ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm cursor-pointer'
                                        }
                                    `}
                                >
                                    {/* Coming Soon Badge */}
                                    {isDisabled && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-200 shadow-sm">
                                            เร็วๆ นี้
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center text-xl
                                            ${isDisabled ? 'bg-slate-100' : isSelected ? 'bg-white' : 'bg-slate-50'}
                                        `}>
                                            {plant.code === 'CANNABIS' ? '🌿' :
                                                plant.code === 'KRATOM' ? '🍃' :
                                                    plant.code === 'TURMERIC' ? '🧡' :
                                                        plant.code === 'GINGER' ? '🫚' :
                                                            plant.code === 'PLAI' ? '🌱' :
                                                                plant.code === 'BSD' ? '🌾' : '🌿'}
                                        </div>
                                        {isSelected && !isDisabled && (
                                            <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${isDisabled ? 'text-slate-400' : isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                            {plant.nameTH}
                                        </div>
                                        <div className="text-xs text-slate-500 font-normal mt-0.5">{plant.nameEN}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 2. Service Type - Dynamic based on plant */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">2</div>
                    <h3 className="text-lg font-semibold text-slate-700">ประเภทคำขอ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SERVICE_TYPES.filter(type => availableServiceTypes.includes(type.id)).map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setServiceType(type.id as any)}
                            className={`
                                p-5 rounded-xl border text-left transition-all duration-200
                                ${state.serviceType === type.id
                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="font-semibold text-slate-800 mb-1">{type.label}</div>
                            <div className="text-sm text-slate-500 leading-relaxed font-light">{type.desc}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. Purpose - Using PurposeSelector with document preview */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">3</div>
                    <h3 className="text-lg font-semibold text-slate-700">วัตถุประสงค์การปลูก</h3>
                </div>
                <PurposeSelector
                    value={state.certificationPurpose as CertificationPurpose | undefined}
                    onChange={(purpose) => setCertificationPurpose(purpose)}
                    showDocPreview={true}
                />
            </section>

            {/* 4. Cultivation Method - Single select only */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">4</div>
                    <h3 className="text-lg font-semibold text-slate-700">รูปแบบการปลูก</h3>
                </div>

                {/* Info Banner - 1 app = 1 cultivation type */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <span className="text-blue-500 text-xl">ℹ️</span>
                        <div>
                            <p className="text-sm text-blue-800 font-medium">1 ใบคำขอ = 1 รูปแบบการปลูก</p>
                            <p className="text-xs text-blue-600 mt-1">
                                หากฟาร์มมีหลายรูปแบบการปลูก (เช่น กลางแจ้ง และ โรงเรือน) กรุณายื่นคำขอแยกต่างหาก
                                เพื่อให้แต่ละใบมีเลขที่ใบรับรองเฉพาะ
                            </p>
                        </div>
                    </div>
                </div>

                <CultivationMethodSelector
                    value={state.cultivationMethod as CultivationMethod | undefined}
                    onChange={(method) => updateState({ cultivationMethod: method })}
                    multiSelect={false} // Single select only
                />
            </section>

            {/* Next Button */}
            <div className="pt-10 border-t flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isReady}
                    className={`
                        px-10 py-4 rounded-xl font-bold text-base shadow-lg transition-all duration-200 flex items-center gap-2
                        ${isReady
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    ดำเนินการต่อ (Next Step)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};
