'use client';

import { useEffect, useState } from 'react';
import { useWizardStore, CultivationMethod } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/api-client';
import { PurposeSelector, CertificationPurpose } from '@/components/PurposeSelector';
import { CultivationMethodSelector } from '@/components/CultivationMethodSelector';
import { getPlantIcon, CheckIcon, InfoIcon, ArrowRightIcon } from '@/components/icons/PlantIcons';

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
    { id: '1', code: 'CANNABIS', nameTH: 'กัญชา', nameEN: 'Cannabis', group: 'HIGH_CONTROL', enabled: true, availableServiceTypes: ['NEW', 'RENEWAL', 'MODIFY'] },
    { id: '3', code: 'KRATOM', nameTH: 'กระท่อม', nameEN: 'Kratom', group: 'HIGH_CONTROL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '4', code: 'TURMERIC', nameTH: 'ขมิ้นชัน', nameEN: 'Turmeric', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '5', code: 'GINGER', nameTH: 'ขิง', nameEN: 'Ginger', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '6', code: 'PLAI', nameTH: 'ไพล', nameEN: 'Plai', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
    { id: '7', code: 'BSD', nameTH: 'กระชายดำ', nameEN: 'Black Galingale', group: 'GENERAL', enabled: false, availableServiceTypes: ['NEW'] },
];

const SERVICE_TYPES = [
    { id: 'NEW', label: 'ขอใหม่', labelEN: 'New Application', desc: 'สำหรับผู้ที่ยังไม่เคยมีใบรับรอง GACP หรือใบรับรองเดิมหมดอายุเกินกำหนดต่ออายุ' },
    { id: 'RENEWAL', label: 'ต่ออายุ', labelEN: 'Renewal', desc: 'สำหรับใบรับรองเดิมที่ใกล้หมดอายุ สามารถยื่นล่วงหน้าได้ 90 วัน' },
    { id: 'MODIFY', label: 'เปลี่ยนแปลงรายการ', labelEN: 'Amendment', desc: 'แก้ไขข้อมูลในใบรับรองเดิม เช่น เปลี่ยนแปลงผู้ดำเนินกิจการ หรือพื้นที่ปลูก' }
];

export const StepPlantSelection = () => {
    const { state, setPlant, setServiceType, setCertificationPurpose, updateState } = useWizardStore();
    const [plants, setPlants] = useState<Plant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get<Plant[]>('/plants');
                if (res.success && res.data && res.data.length > 0) {
                    const allowedCodes = FALLBACK_PLANTS.map(f => f.code);
                    const filteredPlants = res.data.filter(p => allowedCodes.includes(p.code));
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
    const isReady = state.plantId && state.serviceType && state.certificationPurpose && state.cultivationMethod;

    const handleNext = () => {
        if (isReady) router.push('/farmer/applications/new/step/2');
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Official Header */}
            <header className="border-b-2 border-[#00695C] pb-6 mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-[#00695C] rounded-full" />
                    <h1 className="text-2xl font-bold text-[#263238]">ยื่นคำขอใบรับรอง GACP</h1>
                </div>
                <p className="text-[#546E7A] text-sm ml-4">กรุณากรอกข้อมูลให้ครบถ้วนตามแบบฟอร์มด้านล่าง</p>
            </header>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-10 px-4">
                {['ข้อมูลพืช', 'ผู้ขอ', 'ที่ตั้ง', 'แปลง', 'ผลผลิต', 'เก็บเกี่ยว', 'เอกสาร', 'ตรวจสอบ', 'ชำระเงิน'].map((step, i) => (
                    <div key={i} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${i === 0 ? 'bg-[#00695C] text-white' : 'bg-[#ECEFF1] text-[#90A4AE]'}`}>
                            {i + 1}
                        </div>
                        {i < 8 && <div className={`w-6 h-0.5 ${i === 0 ? 'bg-[#00695C]' : 'bg-[#CFD8DC]'}`} />}
                    </div>
                ))}
            </div>

            {/* Section 1: Plant Selection */}
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-[#00695C] pl-3">
                    <span className="text-sm font-semibold text-[#00695C]">ขั้นตอนที่ 1</span>
                    <h2 className="text-lg font-semibold text-[#263238]">เลือกชนิดพืชสมุนไพร</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-32 bg-[#ECEFF1] rounded-lg animate-pulse" />
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
                                        relative p-4 rounded-lg border-2 text-center transition-all duration-150
                                        ${isDisabled
                                            ? 'border-[#CFD8DC] bg-[#FAFAFA] cursor-not-allowed opacity-60'
                                            : isSelected
                                                ? 'border-[#00695C] bg-[#E0F2F1] shadow-sm'
                                                : 'border-[#CFD8DC] bg-white hover:border-[#00695C] hover:bg-[#F5F5F5]'
                                        }
                                    `}
                                >
                                    {isDisabled && (
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FFA000] text-white text-[10px] font-medium rounded whitespace-nowrap">
                                            เร็วๆ นี้
                                        </span>
                                    )}
                                    {isSelected && (
                                        <span className="absolute top-2 right-2 w-5 h-5 bg-[#00695C] rounded-full flex items-center justify-center">
                                            <CheckIcon className="text-white" size={12} />
                                        </span>
                                    )}
                                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${isSelected ? 'text-[#00695C]' : 'text-[#546E7A]'}`}>
                                        {getPlantIcon(plant.code, { size: 32 })}
                                    </div>
                                    <div className={`font-semibold text-sm ${isDisabled ? 'text-[#90A4AE]' : isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>
                                        {plant.nameTH}
                                    </div>
                                    <div className="text-[10px] text-[#90A4AE] mt-0.5">{plant.nameEN}</div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Section 2: Service Type */}
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-[#00695C] pl-3">
                    <span className="text-sm font-semibold text-[#00695C]">ขั้นตอนที่ 2</span>
                    <h2 className="text-lg font-semibold text-[#263238]">ประเภทคำขอ</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SERVICE_TYPES.filter(t => availableServiceTypes.includes(t.id)).map((type) => {
                        const isSelected = state.serviceType === type.id;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setServiceType(type.id as any)}
                                className={`
                                    p-5 rounded-lg border-2 text-left transition-all duration-150
                                    ${isSelected
                                        ? 'border-[#00695C] bg-[#E0F2F1]'
                                        : 'border-[#CFD8DC] bg-white hover:border-[#00695C]'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-semibold ${isSelected ? 'text-[#00695C]' : 'text-[#263238]'}`}>{type.label}</span>
                                    {isSelected && (
                                        <span className="w-5 h-5 bg-[#00695C] rounded-full flex items-center justify-center">
                                            <CheckIcon className="text-white" size={12} />
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[#546E7A] leading-relaxed">{type.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Section 3: Purpose */}
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-[#00695C] pl-3">
                    <span className="text-sm font-semibold text-[#00695C]">ขั้นตอนที่ 3</span>
                    <h2 className="text-lg font-semibold text-[#263238]">วัตถุประสงค์การผลิต</h2>
                </div>
                <PurposeSelector
                    value={state.certificationPurpose as CertificationPurpose | undefined}
                    onChange={(purpose) => setCertificationPurpose(purpose)}
                    showDocPreview={true}
                />
            </section>

            {/* Section 4: Cultivation Method */}
            <section className="mb-10">
                <div className="flex items-center gap-3 mb-4 border-l-4 border-[#00695C] pl-3">
                    <span className="text-sm font-semibold text-[#00695C]">ขั้นตอนที่ 4</span>
                    <h2 className="text-lg font-semibold text-[#263238]">รูปแบบการเพาะปลูก</h2>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-[#E3F2FD] border border-[#90CAF9] rounded-lg mb-4">
                    <InfoIcon className="text-[#1976D2] flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-sm font-medium text-[#1565C0]">หนึ่งใบคำขอ = หนึ่งรูปแบบการเพาะปลูก</p>
                        <p className="text-xs text-[#1976D2] mt-1">
                            หากท่านมีหลายรูปแบบการเพาะปลูก (เช่น กลางแจ้ง และโรงเรือน) กรุณายื่นคำขอแยกต่างหาก เพื่อให้แต่ละใบรับรองมีเลขที่เฉพาะ
                        </p>
                    </div>
                </div>

                <CultivationMethodSelector
                    value={state.cultivationMethod as CultivationMethod | undefined}
                    onChange={(method) => updateState({ cultivationMethod: method })}
                    multiSelect={false}
                />
            </section>

            {/* Submit Button */}
            <div className="pt-8 border-t border-[#CFD8DC] flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isReady}
                    className={`
                        px-8 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-150
                        ${isReady
                            ? 'bg-[#00695C] text-white hover:bg-[#004D40] shadow-md hover:shadow-lg'
                            : 'bg-[#CFD8DC] text-[#90A4AE] cursor-not-allowed'
                        }
                    `}
                >
                    ดำเนินการขั้นตอนถัดไป
                    <ArrowRightIcon size={18} />
                </button>
            </div>
        </div>
    );
};
