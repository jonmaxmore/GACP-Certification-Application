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

export const StepPlantSelection = () => {
    const {
        state,
        setPlant,
        setServiceType,
        setCertificationPurpose,
        setCurrentStep
    } = useWizardStore();

    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get<Plant[]>('/plants');
                if (res.success && res.data) {
                    setPlants(res.data);
                } else {
                    setError('ไม่สามารถดึงข้อมูลพืชได้');
                }
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
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

    const isReady = state.plantId && state.serviceType && state.certificationPurpose;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    เริ่มการยื่นคำขอ
                </h2>
                <p className="text-gray-500 mt-2">กรุณาเลือกประเภทพืชและวัตถุประสงค์เพื่อเริ่มต้น</p>
            </div>

            {/* 1. Plant Selection */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">1</span>
                    เลือกพืชสมุนไพร
                </h3>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {plants.map((plant) => {
                            const isSelected = state.plantId === plant.code; // code matches PlantId type
                            return (
                                <button
                                    key={plant.id}
                                    onClick={() => setPlant(plant.code as any)}
                                    className={`
                                        relative group p-4 rounded-xl border-2 transition-all duration-300
                                        flex flex-col items-center justify-center gap-3
                                        hover:shadow-lg hover:-translate-y-1
                                        ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 shadow-emerald-100'
                                            : 'border-gray-200 bg-white hover:border-emerald-200'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                                        ${isSelected ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50'}
                                    `}>
                                        🌿
                                    </div>
                                    <div className="text-center">
                                        <div className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                                            {plant.nameTH}
                                        </div>
                                        <div className="text-xs text-gray-400">{plant.nameEN}</div>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-emerald-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 2. Service Type */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">2</span>
                    ประเภทคำขอ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'NEW', label: 'ขอใหม่', desc: 'สำหรับผู้ที่ไม่เคยมีใบรับรอง' },
                        { id: 'RENEWAL', label: 'ต่ออายุ', desc: 'สำหรับใบเดิมที่ใกล้หมดอายุ' },
                        { id: 'MODIFY', label: 'เปลี่ยนแปลงรายการ', desc: 'แก้ไขข้อมูลในใบรับรองเดิม' }
                    ].map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setServiceType(type.id as any)}
                            className={`
                                p-4 rounded-xl border text-left transition-all
                                ${state.serviceType === type.id
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 bg-white hover:border-blue-200'
                                }
                            `}
                        >
                            <div className="font-semibold text-gray-800">{type.label}</div>
                            <div className="text-sm text-gray-500">{type.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Purpose */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm">3</span>
                    วัตถุประสงค์
                </h3>
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
                                px-6 py-3 rounded-full border transition-all
                                ${state.certificationPurpose === purpose.id
                                    ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }
                            `}
                        >
                            {purpose.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Next Button */}
            <div className="pt-6 border-t flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isReady}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${isReady
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>
        </div>
    );
};
