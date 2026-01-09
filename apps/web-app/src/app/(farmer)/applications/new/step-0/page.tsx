"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS, PlantId } from '../hooks/useWizardStore';

export default function Step0Plant() {
    const router = useRouter();
    const { state, setPlant, isLoaded } = useWizardStore();
    const [selectedPlant, setSelectedPlant] = useState<PlantId | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (state.plantId) setSelectedPlant(state.plantId);
    }, [state.plantId]);

    const handleSelect = (plantId: PlantId) => {
        setSelectedPlant(plantId);
        setPlant(plantId);
    };

    const handleNext = () => {
        if (selectedPlant && !isNavigating) {
            setIsNavigating(true);
            router.push('/applications/new/step-1');
        }
    };

    if (!isLoaded) return (
        <div className="text-center py-16 text-gray-500">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            กำลังโหลด...
        </div>
    );

    const highControlPlants = PLANTS.filter(p => p.group === 'HIGH_CONTROL');
    const generalPlants = PLANTS.filter(p => p.group === 'GENERAL');

    const PlantCard = ({ plant, isSelected }: { plant: typeof PLANTS[0]; isSelected: boolean }) => (
        <button
            onClick={() => handleSelect(plant.id)}
            className={`
                relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200
                ${isSelected
                    ? 'bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-100'
                    : 'bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-md'
                }
            `}
        >
            {/* Plant Emoji Icon */}
            <div className={`text-4xl ${isSelected ? 'scale-110' : ''} transition-transform`}>
                {plant.icon}
            </div>

            {/* Plant Name */}
            <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-800'}`}>
                {plant.name}
            </span>

            {/* Selected Badge */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17L4 12" />
                    </svg>
                </div>
            )}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M12 8v4m0 0v4m0-4h4m-4 0H8" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">เลือกชนิดพืชสมุนไพร</h1>
                <p className="text-gray-600">เลือกพืชที่ต้องการขอรับรองมาตรฐาน GACP</p>
            </div>

            {/* High Control Plants Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        สมุนไพรควบคุม
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {highControlPlants.map(plant => (
                        <PlantCard key={plant.id} plant={plant} isSelected={selectedPlant === plant.id} />
                    ))}
                </div>
            </div>

            {/* General Plants Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        สมุนไพรทั่วไป
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {generalPlants.map(plant => (
                        <PlantCard key={plant.id} plant={plant} isSelected={selectedPlant === plant.id} />
                    ))}
                </div>
            </div>

            {/* Selected Plant Info */}
            {selectedPlant && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{PLANTS.find(p => p.id === selectedPlant)?.icon}</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-emerald-700 font-medium">พืชที่เลือก</div>
                        <div className="text-lg font-bold text-emerald-900">{PLANTS.find(p => p.id === selectedPlant)?.name}</div>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                        <path d="M20 6L9 17L4 12" />
                    </svg>
                </div>
            )}

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={!selectedPlant || isNavigating}
                className={`
                    w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all
                    ${selectedPlant && !isNavigating
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                `}
            >
                {isNavigating ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        กำลังโหลด...
                    </>
                ) : (
                    <>
                        ถัดไป
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18L15 12L9 6" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
}
