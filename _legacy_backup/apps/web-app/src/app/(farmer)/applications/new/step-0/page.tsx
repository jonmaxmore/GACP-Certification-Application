"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS, PlantId } from '../hooks/useWizardStore';

// Modern Plant Icons as SVG
const PlantIcons: Record<string, React.ReactNode> = {
    cannabis: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="currentColor" fillOpacity="0.1" />
            <path d="M24 10C24 10 27 16 27 19C27 22 25.5 24 24 25.5C22.5 24 21 22 21 19C21 16 24 10 24 10Z" fill="currentColor" />
            <path d="M17 15C17 15 20 18 21.5 21C23 24 21.5 27 21.5 27C18.5 25.5 15.5 22.5 15.5 19.5C15.5 16.5 17 15 17 15Z" fill="currentColor" fillOpacity="0.8" />
            <path d="M31 15C31 15 28 18 26.5 21C25 24 26.5 27 26.5 27C29.5 25.5 32.5 22.5 32.5 19.5C32.5 16.5 31 15 31 15Z" fill="currentColor" fillOpacity="0.8" />
            <rect x="22.5" y="25" width="3" height="10" rx="1.5" fill="currentColor" fillOpacity="0.6" />
        </svg>
    ),
    kratom: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="currentColor" fillOpacity="0.1" />
            <ellipse cx="24" cy="21" rx="10" ry="7" fill="currentColor" />
            <path d="M24 28C24 28 21 31 21 34C21 35.5 22.5 37 24 37C25.5 37 27 35.5 27 34C27 31 24 28 24 28Z" fill="currentColor" fillOpacity="0.7" />
        </svg>
    ),
    turmeric: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#FCD34D" fillOpacity="0.2" />
            <ellipse cx="24" cy="26" rx="9" ry="5" fill="#F59E0B" />
            <ellipse cx="19" cy="23" rx="5" ry="3.5" fill="#FBBF24" />
            <ellipse cx="29" cy="23" rx="5" ry="3.5" fill="#FBBF24" />
            <path d="M24 14L25.5 19H22.5L24 14Z" fill="#10B981" />
        </svg>
    ),
    ginger: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#FCD34D" fillOpacity="0.15" />
            <ellipse cx="24" cy="27" rx="7" ry="4.5" fill="#D97706" />
            <ellipse cx="19" cy="24" rx="4.5" ry="3.5" fill="#F59E0B" />
            <ellipse cx="29" cy="24" rx="4.5" ry="3.5" fill="#F59E0B" />
            <ellipse cx="24" cy="21" rx="3.5" ry="2.5" fill="#FBBF24" />
        </svg>
    ),
    black_galangal: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#6B7280" fillOpacity="0.15" />
            <ellipse cx="24" cy="27" rx="9" ry="5" fill="#374151" />
            <ellipse cx="19" cy="24" rx="5" ry="3.5" fill="#4B5563" />
            <ellipse cx="29" cy="24" rx="5" ry="3.5" fill="#4B5563" />
            <path d="M24 14L25.5 19H22.5L24 14Z" fill="#10B981" />
        </svg>
    ),
    plai: (
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#10B981" fillOpacity="0.15" />
            <ellipse cx="24" cy="29" rx="7" ry="4.5" fill="#059669" />
            <ellipse cx="19" cy="26" rx="4.5" ry="3.5" fill="#10B981" />
            <ellipse cx="29" cy="26" rx="4.5" ry="3.5" fill="#10B981" />
            <path d="M23 14C23 14 24 20 24 23" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 14C25 14 24 20 24 23" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
};

export default function Step0Plant() {
    const router = useRouter();
    const { state, setPlant, isLoaded } = useWizardStore();
    const [selectedPlant, setSelectedPlant] = useState<PlantId | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        if (state.plantId) {
            setSelectedPlant(state.plantId);
        }
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

    if (!isLoaded) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                <div style={{
                    width: '36px', height: '36px', border: '3px solid',
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                }} />
                กำลังโหลด...
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Separate plants by group
    const highControlPlants = PLANTS.filter(p => p.group === 'HIGH_CONTROL');
    const generalPlants = PLANTS.filter(p => p.group === 'GENERAL');

    const cardStyle = (isSelected: boolean) => ({
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
        padding: '16px 12px',
        borderRadius: '14px',
        border: isSelected
            ? '2px solid #10B981'
            : `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
        background: isSelected
            ? (isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5')
            : (isDark ? '#1F2937' : '#FFFFFF'),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected
            ? '0 4px 16px rgba(16, 185, 129, 0.2)'
            : '0 1px 4px rgba(0, 0, 0, 0.04)',
        minHeight: '110px',
    });

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: isDark
                        ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
                }}>
                    <span style={{ fontSize: '24px' }}>🌿</span>
                </div>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: isDark ? '#F9FAFB' : '#111827',
                    marginBottom: '6px',
                }}>
                    เลือกชนิดพืชสมุนไพร
                </h2>
                <p style={{
                    fontSize: '14px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                    เลือกพืชที่ต้องการขอรับรองมาตรฐาน GACP
                </p>
            </div>

            {/* High Control Section */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                }}>
                    <span style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                        color: '#DC2626',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 500,
                    }}>
                        🔒 สมุนไพรควบคุม
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {highControlPlants.map(plant => (
                        <button key={plant.id} onClick={() => handleSelect(plant.id)} style={cardStyle(selectedPlant === plant.id)}>
                            <div style={{ color: '#10B981' }}>
                                {PlantIcons[plant.id]}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isDark ? '#F9FAFB' : '#111827',
                            }}>
                                {plant.name}
                            </span>
                            {selectedPlant === plant.id && (
                                <span style={{
                                    background: '#10B981',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                }}>
                                    ✓ เลือก
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* General Plants Section */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                }}>
                    <span style={{
                        background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                        color: '#059669',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 500,
                    }}>
                        🌱 สมุนไพรทั่วไป
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {generalPlants.map(plant => (
                        <button key={plant.id} onClick={() => handleSelect(plant.id)} style={cardStyle(selectedPlant === plant.id)}>
                            <div style={{ color: plant.id === 'turmeric' || plant.id === 'ginger' ? '#F59E0B' : '#10B981' }}>
                                {PlantIcons[plant.id]}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isDark ? '#F9FAFB' : '#111827',
                            }}>
                                {plant.name}
                            </span>
                            {selectedPlant === plant.id && (
                                <span style={{
                                    background: '#10B981',
                                    color: 'white',
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                }}>
                                    ✓ เลือก
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={!selectedPlant || isNavigating}
                style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: selectedPlant && !isNavigating
                        ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                        : (isDark ? '#374151' : '#E5E7EB'),
                    color: selectedPlant && !isNavigating ? 'white' : (isDark ? '#6B7280' : '#9CA3AF'),
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: selectedPlant && !isNavigating ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: selectedPlant && !isNavigating
                        ? '0 4px 16px rgba(16, 185, 129, 0.35)'
                        : 'none',
                    transition: 'all 0.2s ease',
                }}
            >
                {isNavigating ? (
                    <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> กำลังโหลด...</>
                ) : (
                    <>ถัดไป <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg></>
                )}
            </button>
        </div>
    );
}
