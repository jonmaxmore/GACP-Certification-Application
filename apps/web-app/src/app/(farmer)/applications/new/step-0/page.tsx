"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS, PlantId } from '../hooks/useWizardStore';

// Modern Plant Icons as SVG
const PlantIcons: Record<string, React.ReactNode> = {
    cannabis: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="currentColor" fillOpacity="0.1" /><path d="M24 10C24 10 27 16 27 19C27 22 25.5 24 24 25.5C22.5 24 21 22 21 19C21 16 24 10 24 10Z" fill="currentColor" /><path d="M17 15C17 15 20 18 21.5 21C23 24 21.5 27 21.5 27C18.5 25.5 15.5 22.5 15.5 19.5C15.5 16.5 17 15 17 15Z" fill="currentColor" fillOpacity="0.8" /><path d="M31 15C31 15 28 18 26.5 21C25 24 26.5 27 26.5 27C29.5 25.5 32.5 22.5 32.5 19.5C32.5 16.5 31 15 31 15Z" fill="currentColor" fillOpacity="0.8" /><rect x="22.5" y="25" width="3" height="10" rx="1.5" fill="currentColor" fillOpacity="0.6" /></svg>),
    kratom: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="currentColor" fillOpacity="0.1" /><ellipse cx="24" cy="21" rx="10" ry="7" fill="currentColor" /><path d="M24 28C24 28 21 31 21 34C21 35.5 22.5 37 24 37C25.5 37 27 35.5 27 34C27 31 24 28 24 28Z" fill="currentColor" fillOpacity="0.7" /></svg>),
    turmeric: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="#FCD34D" fillOpacity="0.2" /><ellipse cx="24" cy="26" rx="9" ry="5" fill="#F59E0B" /><ellipse cx="19" cy="23" rx="5" ry="3.5" fill="#FBBF24" /><ellipse cx="29" cy="23" rx="5" ry="3.5" fill="#FBBF24" /><path d="M24 14L25.5 19H22.5L24 14Z" fill="#10B981" /></svg>),
    ginger: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="#FCD34D" fillOpacity="0.15" /><ellipse cx="24" cy="27" rx="7" ry="4.5" fill="#D97706" /><ellipse cx="19" cy="24" rx="4.5" ry="3.5" fill="#F59E0B" /><ellipse cx="29" cy="24" rx="4.5" ry="3.5" fill="#F59E0B" /><ellipse cx="24" cy="21" rx="3.5" ry="2.5" fill="#FBBF24" /></svg>),
    black_galangal: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="#6B7280" fillOpacity="0.15" /><ellipse cx="24" cy="27" rx="9" ry="5" fill="#374151" /><ellipse cx="19" cy="24" rx="5" ry="3.5" fill="#4B5563" /><ellipse cx="29" cy="24" rx="5" ry="3.5" fill="#4B5563" /><path d="M24 14L25.5 19H22.5L24 14Z" fill="#10B981" /></svg>),
    plai: (<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="#10B981" fillOpacity="0.15" /><ellipse cx="24" cy="29" rx="7" ry="4.5" fill="#059669" /><ellipse cx="19" cy="26" rx="4.5" ry="3.5" fill="#10B981" /><ellipse cx="29" cy="26" rx="4.5" ry="3.5" fill="#10B981" /><path d="M23 14C23 14 24 20 24 23" stroke="#10B981" strokeWidth="2" strokeLinecap="round" /><path d="M25 14C25 14 24 20 24 23" stroke="#10B981" strokeWidth="2" strokeLinecap="round" /></svg>),
};

export default function Step0Plant() {
    const router = useRouter();
    const { state, setPlant, isLoaded } = useWizardStore();
    const [selectedPlant, setSelectedPlant] = useState<PlantId | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.plantId) setSelectedPlant(state.plantId);
    }, [state.plantId]);

    const handleSelect = (plantId: PlantId) => { setSelectedPlant(plantId); setPlant(plantId); };
    const handleNext = () => { if (selectedPlant && !isNavigating) { setIsNavigating(true); router.push('/applications/new/step-1'); } };

    if (!isLoaded) return (
        <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="w-9 h-9 border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            กำลังโหลด...
        </div>
    );

    const highControlPlants = PLANTS.filter(p => p.group === 'HIGH_CONTROL');
    const generalPlants = PLANTS.filter(p => p.group === 'GENERAL');

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-emerald-500/25 ${isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-400'}`}>
                    <span className="text-2xl">🌿</span>
                </div>
                <h2 className={`text-xl font-semibold mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>เลือกชนิดพืชสมุนไพร</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>เลือกพืชที่ต้องการขอรับรองมาตรฐาน GACP</p>
            </div>

            {/* High Control Section */}
            <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>🔒 สมุนไพรควบคุม</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {highControlPlants.map(plant => {
                        const isSelected = selectedPlant === plant.id;
                        return (
                            <button key={plant.id} onClick={() => handleSelect(plant.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all min-h-28 ${isSelected ? (isDark ? 'bg-emerald-900/30 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20') : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200')} `}>
                                <div className="text-emerald-500">{PlantIcons[plant.id]}</div>
                                <span className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{plant.name}</span>
                                {isSelected && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs font-medium">✓ เลือก</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* General Plants Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>🌱 สมุนไพรทั่วไป</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {generalPlants.map(plant => {
                        const isSelected = selectedPlant === plant.id;
                        return (
                            <button key={plant.id} onClick={() => handleSelect(plant.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all min-h-28 ${isSelected ? (isDark ? 'bg-emerald-900/30 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20') : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200')} `}>
                                <div className={plant.id === 'turmeric' || plant.id === 'ginger' ? 'text-amber-500' : 'text-emerald-500'}>{PlantIcons[plant.id]}</div>
                                <span className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{plant.name}</span>
                                {isSelected && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-xs font-medium">✓ เลือก</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Next Button */}
            <button onClick={handleNext} disabled={!selectedPlant || isNavigating}
                className={`w-full py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${selectedPlant && !isNavigating ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/35 cursor-pointer' : (isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400') + ' cursor-not-allowed'}`}>
                {isNavigating ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังโหลด...</>) : (<>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>)}
            </button>
        </div>
    );
}
