'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, Plot } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';

export const StepPlots = () => {
    const { state, setSiteData, setCurrentStep } = useWizardStore();
    const { data: masterData } = useMasterData();

    const [plots, setPlots] = useState<Plot[]>(state.siteData?.plots || []);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlot, setCurrentPlot] = useState<Partial<Plot>>({
        name: '',
        areaSize: '',
        areaUnit: 'Rai',
        areaUnit: 'Rai',
        solarSystem: state.locationType || 'OUTDOOR' // Initialize with global selection
    });

    // Reset current plot system when global location type changes (if valid)
    useEffect(() => {
        if (state.locationType) {
            setCurrentPlot(prev => ({ ...prev, solarSystem: state.locationType! }));
        }
    }, [state.locationType]);

    useEffect(() => {
        // Update store when plots change
        if (state.siteData) {
            setSiteData({ ...state.siteData, plots });
        }
    }, [plots, setSiteData, state.siteData]);

    const handleAddPlot = () => {
        if (!currentPlot.name || !currentPlot.areaSize) return;

        const newPlot: Plot = {
            id: crypto.randomUUID(),
            name: currentPlot.name,
            areaSize: currentPlot.areaSize,
            areaUnit: currentPlot.areaUnit || 'Rai',
            solarSystem: currentPlot.solarSystem as any || 'OUTDOOR'
        };

        setPlots([...plots, newPlot]);
        setIsModalOpen(false);
        setPlots([...plots, newPlot]);
        setIsModalOpen(false);
        setCurrentPlot({
            name: '',
            areaSize: '',
            areaUnit: 'Rai',
            solarSystem: state.locationType || 'OUTDOOR' // Reset to global
        });
    };

    const handleRemovePlot = (id: string) => {
        setPlots(plots.filter(p => p.id !== id));
    };

    const cultivationSystems = [
        { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', icon: '☀️' },
        { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', icon: '🏠' },
        { id: 'INDOOR', label: 'ระบบปิด (Indoor)', icon: '💡' },
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    การแบ่งแปลงปลูก (Zoning)
                </h2>
                <p className="text-gray-500 mt-2">กำหนดโซนและระบบการปลูกสำหรับการตรวจสอบย้อนกลับ (Traceability)</p>
            </div>

            {/* Plot List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-48 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                        <span className="text-3xl">+</span>
                    </div>
                    <span className="font-semibold">เพิ่มแปลงปลูกใหม่</span>
                </button>

                {/* Existing Plots */}
                {plots.map((plot, index) => (
                    <div key={plot.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
                        <div className="absolute top-4 right-4 text-xs font-mono text-gray-400">
                            #0{index + 1}
                        </div>

                        <div className="mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-2xl mb-3">
                                {cultivationSystems.find(c => c.id === plot.solarSystem)?.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{plot.name}</h3>
                            <p className="text-sm text-gray-500">
                                {cultivationSystems.find(c => c.id === plot.solarSystem)?.label}
                            </p>
                        </div>

                        <div className="flex items-end justify-between border-t pt-4">
                            <div>
                                <span className="text-2xl font-bold text-gray-700">{plot.areaSize}</span>
                                <span className="text-sm text-gray-500 ml-1">{plot.areaUnit === 'Rai' ? 'ไร่' : 'ตร.ม.'}</span>
                            </div>
                            <button
                                onClick={() => handleRemovePlot(plot.id)}
                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                ลบรายการ
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl scale-100 animate-scaleIn">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">เพิ่มแปลงปลูก (New Plot)</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อแปลง (Plot Name)</label>
                                <input
                                    autoFocus
                                    placeholder="เช่น A1, โซนโรงเรือน 1"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                    value={currentPlot.name}
                                    onChange={e => setCurrentPlot({ ...currentPlot, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ระบบการปลูก (Cultivation System)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {cultivationSystems.map(sys => {
                                        const isLocked = !!state.locationType;
                                        const isSelected = currentPlot.solarSystem === sys.id;

                                        // If locked, hide others or show disabled style?
                                        // Better UX: Show only the selected one if locked, or show all but disable interaction?
                                        // User request: "Why is this not locked?" => So it should be non-editable.

                                        if (isLocked && !isSelected) return null; // Hide non-selected options if locked

                                        return (
                                            <label
                                                key={sys.id}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg border transition-all
                                                    ${isSelected
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                                                    }
                                                    ${!isLocked ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="system"
                                                    className="hidden"
                                                    disabled={isLocked}
                                                    checked={isSelected}
                                                    onChange={() => !isLocked && setCurrentPlot({ ...currentPlot, solarSystem: sys.id as any })}
                                                />
                                                <span className="text-xl">{sys.icon}</span>
                                                <div className="flex-1">
                                                    <span className="font-medium">{sys.label}</span>
                                                    {isLocked && <span className="ml-2 text-xs text-emerald-600 font-bold">(Locked by Step 1)</span>}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ขนาดพื้นที่</label>
                                    <input
                                        type="number"
                                        placeholder="จำนวน"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                        value={currentPlot.areaSize}
                                        onChange={e => setCurrentPlot({ ...currentPlot, areaSize: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">หน่วย</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                        value={currentPlot.areaUnit}
                                        onChange={e => setCurrentPlot({ ...currentPlot, areaUnit: e.target.value })}
                                    >
                                        <option value="Rai">ไร่</option>
                                        <option value="Sqm">ตร.ม.</option>
                                        <option value="Ngan">งาน</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAddPlot}
                                disabled={!currentPlot.name || !currentPlot.areaSize}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => setCurrentStep(3)}
                    disabled={plots.length === 0}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${plots.length > 0
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
