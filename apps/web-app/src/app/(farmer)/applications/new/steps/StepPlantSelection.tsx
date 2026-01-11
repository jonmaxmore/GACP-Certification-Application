'use client';

import { useEffect, useState } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { api } from '@/lib/api/api-client';

interface Plant {
    id: string;
    code: string;
    nameTH: string;
    nameEN: string;
    group: 'HIGH_CONTROL' | 'GENERAL';
    imageUrl?: string;
}

// Fallback data if API fails or is empty (Guarantees UI works)
// Fallback data if API fails or is empty (Guarantees UI works)
const FALLBACK_PLANTS: Plant[] = [
    { id: '1', code: 'CANNABIS', nameTH: 'กัญชา', nameEN: 'Cannabis', group: 'HIGH_CONTROL' },
    // Hemp Removed as per user request (User stated they only have 6 herbs)
    { id: '3', code: 'KRATOM', nameTH: 'กระท่อม', nameEN: 'Kratom', group: 'HIGH_CONTROL' },
    { id: '4', code: 'TURMERIC', nameTH: 'ขมิ้นชัน', nameEN: 'Turmeric', group: 'GENERAL' },
    { id: '5', code: 'GINGER', nameTH: 'ขิง', nameEN: 'Ginger', group: 'GENERAL' },
    { id: '6', code: 'PLAI', nameTH: 'ไพล', nameEN: 'Plai', group: 'GENERAL' },
    { id: '7', code: 'BSD', nameTH: 'กระชายดำ', nameEN: 'Black Galingale', group: 'GENERAL' },
];

export const StepPlantSelection = () => {
    const {
        state,
        setPlant,
        setServiceType,
        setCertificationPurpose,
        setLocationType,
        setCurrentStep
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
                    setPlants(res.data);
                } else {
                    console.warn('API returned empty plants, using fallback.');
                    setPlants(FALLBACK_PLANTS);
                }
            } catch (err) {
                console.error('Failed to fetch plants, using fallback.', err);
                // Fallback to static list so user is never blocked
                setPlants(FALLBACK_PLANTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPlants();
    }, []);

    const handleNext = () => {
        if (state.plantId && state.serviceType && state.certificationPurpose) {
            setCurrentStep(1);
        }
    };


    const isReady = state.plantId && state.serviceType && state.certificationPurpose && state.locationType;

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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {plants.map((plant) => {
                            const isSelected = state.plantId === plant.code;
                            return (
                                <button
                                    key={plant.id}
                                    onClick={() => setPlant(plant.code as any)}
                                    className={`
                                        relative group p-4 rounded-xl border transition-all duration-200 text-left
                                        ${isSelected
                                            ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 shadow-md'
                                            : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center text-xl
                                            ${isSelected ? 'bg-white' : 'bg-slate-50'}
                                        `}>
                                            🌿
                                        </div>
                                        {isSelected && (
                                            <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
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

            {/* 2. Service Type */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">2</div>
                    <h3 className="text-lg font-semibold text-slate-700">ประเภทคำขอ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'NEW', label: 'ขอใหม่', desc: 'สำหรับผู้ที่ไม่เคยมีใบรับรอง หรือใบรับรองเดิมขาดอายุเกินกำหนด' },
                        { id: 'RENEWAL', label: 'ต่ออายุ', desc: 'สำหรับใบเดิมที่ใกล้หมดอายุ (ล่วงหน้า 90 วัน)' },
                        { id: 'MODIFY', label: 'เปลี่ยนแปลงรายการ', desc: 'แก้ไขข้อมูลในใบรับรองเดิม เช่น เปลี่ยนผู้ดำเนินกิจการ' }
                    ].map((type) => (
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

            {/* 3. Purpose */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">3</div>
                    <h3 className="text-lg font-semibold text-slate-700">วัตถุประสงค์</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {[
                        { id: 'COMMERCIAL', label: 'เพื่อการพาณิชย์' },
                        { id: 'RESEARCH', label: 'เพื่อการศึกษาวิจัย' },
                        { id: 'EXPORT', label: 'เพื่อการส่งออก' }
                    ].map((purpose) => (
                        <button
                            key={purpose.id}
                            onClick={() => setCertificationPurpose(purpose.id as any)}
                            className={`
                                px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-200
                                ${state.certificationPurpose === purpose.id
                                    ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }
                            `}
                        >
                            {purpose.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* 4. Location Type (Moved from Step 4 to Step 1 per user request) */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-100">4</div>
                    <h3 className="text-lg font-semibold text-slate-700">ลักษณะพื้นที่ (Cultivation System)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', icon: '☀️', desc: 'ปลูกลงดิน ไม่มีหลังคาคลุม' },
                        { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', icon: '🌿', desc: 'มีหลังคาและตาข่ายกันแมลง' },
                        { id: 'INDOOR', label: 'ระบบปิด (Indoor)', icon: '🏠', desc: 'ควบคุมแสง อุณหภูมิ ความชื้น 100%' }
                    ].map((loc) => (
                        <button
                            key={loc.id}
                            onClick={() => setLocationType(loc.id as any)}
                            className={`
                                p-5 rounded-xl border text-left transition-all duration-200 group
                                ${state.locationType === loc.id
                                    ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{loc.icon}</div>
                            <div className="font-semibold text-slate-800 mb-1">{loc.label}</div>
                            <div className="text-sm text-slate-500 font-light">{loc.desc}</div>
                        </button>
                    ))}
                </div>
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
