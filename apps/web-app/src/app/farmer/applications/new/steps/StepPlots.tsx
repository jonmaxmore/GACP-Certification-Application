'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWizardStore, Plot } from '../hooks/useWizardStore';
import { useGACPData } from '@/hooks/useGACPData';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { PlantIcon, CheckIcon, WarningIcon } from '@/components/icons/WizardIcons';

export const StepPlots = () => {
    const { state, setSiteData } = useWizardStore();
    const router = useRouter();

    // API-First: Fetch GACP data
    const { soilTypes, seedSources, ipmMethods } = useGACPData(5);

    const [plots, setPlots] = useState<Plot[]>(state.siteData?.plots || []);

    // Inline form state
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [showGACPFields, setShowGACPFields] = useState(false);
    const [currentPlot, setCurrentPlot] = useState<Partial<Plot>>({
        name: '',
        areaSize: '',
        areaUnit: 'Rai',
        solarSystem: state.locationType || 'OUTDOOR',
        soilType: '',
        soilAnalysisStatus: 'none',
        seedSource: '',
        seedCertificate: false,
        hasIPMPlan: false,
        ipmMethods: [],
    });

    // Cultivation Systems Display
    const cultivationSystems: Record<string, { label: string; icon: string; color: string }> = {
        'OUTDOOR': { label: 'กลางแจ้ง (Outdoor)', icon: '🌿', color: 'bg-green-50 text-green-700 border-green-200' },
        'GREENHOUSE': { label: 'โรงเรือน (Greenhouse)', icon: '🏠', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        'INDOOR': { label: 'ระบบปิด (Indoor)', icon: '🏭', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    };

    const currentSystem = cultivationSystems[state.locationType || 'OUTDOOR'];

    // Calculate summary
    const summary = useMemo(() => {
        const totalSiteArea = parseFloat(state.farmData?.totalAreaSize || '0');
        const siteUnit = state.farmData?.totalAreaUnit || 'Rai';

        const allocatedArea = plots.reduce((sum, plot) => {
            let plotArea = parseFloat(plot.areaSize || '0');
            // Simple unit conversion logic for display estimation
            if (plot.areaUnit !== siteUnit) {
                if (plot.areaUnit === 'Sqm' && siteUnit === 'Rai') plotArea /= 1600;
                else if (plot.areaUnit === 'Rai' && siteUnit === 'Sqm') plotArea *= 1600;
                else if (plot.areaUnit === 'Ngan' && siteUnit === 'Rai') plotArea /= 4;
                else if (plot.areaUnit === 'Rai' && siteUnit === 'Ngan') plotArea *= 4;
            }
            return sum + plotArea;
        }, 0);

        return {
            totalArea: totalSiteArea,
            allocatedArea: allocatedArea.toFixed(2),
            remainingArea: (totalSiteArea - allocatedArea).toFixed(2),
            unit: siteUnit === 'Rai' ? 'ไร่' : siteUnit === 'Ngan' ? 'งาน' : 'ตร.ม.',
            plotCount: plots.length,
            qrCount: plots.length,
        };
    }, [plots, state.farmData]);

    useEffect(() => {
        if (state.siteData) {
            setSiteData({ ...state.siteData, plots });
        }
    }, [plots, setSiteData, state.siteData]);

    const handleAddPlot = () => {
        if (!currentPlot.name || !currentPlot.areaSize) return;

        const newArea = parseFloat(currentPlot.areaSize || '0');
        const remaining = parseFloat(summary.remainingArea);

        if (remaining > 0 && newArea > remaining) {
            alert(`❌ พื้นที่ที่เพิ่ม (${newArea} ${summary.unit}) เกินกว่าพื้นที่คงเหลือ (${remaining} ${summary.unit})`);
            return;
        }

        const newPlot: Plot = {
            id: crypto.randomUUID(),
            name: currentPlot.name,
            areaSize: currentPlot.areaSize,
            areaUnit: currentPlot.areaUnit || 'Rai',
            solarSystem: state.locationType || 'OUTDOOR',
            soilType: currentPlot.soilType,
            soilAnalysisStatus: currentPlot.soilAnalysisStatus,
            seedSource: currentPlot.seedSource,
            seedCertificate: currentPlot.seedCertificate,
            hasIPMPlan: currentPlot.hasIPMPlan,
            ipmMethods: currentPlot.ipmMethods,
        };

        setPlots([...plots, newPlot]);
        setCurrentPlot({
            name: '',
            areaSize: '',
            areaUnit: 'Rai',
            solarSystem: state.locationType || 'OUTDOOR',
            soilType: '',
            soilAnalysisStatus: 'none',
            seedSource: '',
            seedCertificate: false,
            hasIPMPlan: false,
            ipmMethods: [],
        });
        setIsFormExpanded(false);
        setShowGACPFields(false);
    };

    const handleRemovePlot = (id: string) => {
        setPlots(plots.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    4
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">การแบ่งแปลงปลูก (Zoning)</h2>
                    <p className="text-text-secondary">กำหนดโซนและแปลงย่อยสำหรับสร้าง QR Code และติดตามผลผลิต</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="gacp-card bg-gradient-to-br from-primary-50 to-white border-primary-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary-100/40 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-primary-900 flex items-center gap-3 text-lg">
                        <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">📊</span>
                        สรุปพื้นที่ทั้งหมด
                    </h3>

                    {/* Locked Cultivation System Badge */}
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${currentSystem.color}`}>
                        <span>{currentSystem.icon}</span>
                        <span>{currentSystem.label}</span>
                    </div>
                </div>

                {summary.totalArea === 0 && (
                    <div className="mb-6 p-4 bg-warning-bg border border-warning-200 rounded-xl text-warning-text text-sm flex items-center gap-3 shadow-sm animate-pulse-soft">
                        <WarningIcon className="w-5 h-5 flex-shrink-0" />
                        <span><strong>ไม่พบข้อมูลพื้นที่รวม:</strong> กรุณากรอกข้อมูลในขั้นตอนที่ 3 (ข้อมูลฟาร์ม) ก่อน</span>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center border border-white shadow-sm">
                        <div className="text-2xl font-bold text-primary-900 mb-1">{summary.totalArea}</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">พื้นที่ทั้งหมด ({summary.unit})</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center border border-white shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-1">{summary.allocatedArea}</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">แบ่งแล้ว ({summary.unit})</div>
                    </div>
                    <div className={`bg-white/60 backdrop-blur rounded-xl p-4 text-center border shadow-sm ${parseFloat(summary.remainingArea) < 0 ? 'border-red-200 bg-red-50/50' : 'border-white'}`}>
                        <div className={`text-2xl font-bold mb-1 ${parseFloat(summary.remainingArea) < 0 ? 'text-red-600' : 'text-amber-500'}`}>
                            {summary.remainingArea}
                        </div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">คงเหลือ ({summary.unit})</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 text-center border border-white shadow-sm">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{summary.qrCount}</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">QR Code</div>
                    </div>
                </div>
            </div>

            {/* Plot List & Add Button */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg text-primary-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs shadow-sm">
                            {plots.length}
                        </span>
                        รายการแปลงปลูก
                    </h4>
                </div>

                {plots.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-text-muted group hover:border-primary-300 hover:bg-white transition-all duration-300 cursor-pointer" onClick={() => setIsFormExpanded(true)}>
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-50 group-hover:text-primary transition-all duration-300">
                            <PlantIcon className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                        </div>
                        <div>
                            <p className="font-medium text-lg text-primary-900">ยังไม่มีแปลงปลูก</p>
                            <p className="text-sm">กดที่นี่ หรือปุ่มด้านล่างเพื่อเพิ่มแปลงใหม่</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plots.map((plot, index) => (
                            <div
                                key={plot.id}
                                className="gacp-card p-5 hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary-50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none opacity-50"></div>

                                <span className="absolute top-3 right-3 text-[10px] font-bold text-primary-400 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                    #{String(index + 1).padStart(2, '0')}
                                </span>

                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                                        {currentSystem.icon}
                                    </div>
                                    <div className="pt-0.5">
                                        <h5 className="font-bold text-lg text-primary-900 leading-tight">{plot.name}</h5>
                                        <span className="text-xs font-medium text-text-secondary">
                                            {plot.areaSize} {plot.areaUnit === 'Rai' ? 'ไร่' : plot.areaUnit === 'Ngan' ? 'งาน' : 'ตร.ม.'}
                                        </span>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                                    {plot.soilType && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">ดิน</span>}
                                    {plot.seedSource && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">เมล็ดพันธุ์</span>}
                                    {plot.hasIPMPlan && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">IPM</span>}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemovePlot(plot.id); }}
                                    className="absolute bottom-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    title="ลบแปลง"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inline Add Form */}
            <div className={`
                bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                ${isFormExpanded
                    ? 'border-primary shadow-lg ring-1 ring-primary-100'
                    : 'border-dashed border-gray-300 hover:border-primary-300 hover:shadow-md'
                }
            `}>
                <button
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                    className={`w-full p-5 text-left flex items-center justify-between transition-colors ${isFormExpanded ? 'bg-gray-50 border-b border-gray-200' : 'hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isFormExpanded ? 'bg-primary text-white rotate-45' : 'bg-gray-100 text-gray-400'}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </div>
                        <div>
                            <span className={`font-bold block ${isFormExpanded ? 'text-primary-900' : 'text-text-secondary'}`}>เพิ่มแปลงใหม่</span>
                            {!isFormExpanded && <span className="text-xs text-text-muted">คลิกเพื่อกรอกรายละเอียดแปลง</span>}
                        </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-400 transition-transform ${isFormExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                </button>

                {isFormExpanded && (
                    <div className="p-6 space-y-6 animate-slide-down">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="md:col-span-1">
                                <FormLabelWithHint label="ชื่อแปลง" required />
                                <input
                                    autoFocus
                                    placeholder="เช่น A1, โซน B"
                                    className="gacp-input"
                                    value={currentPlot.name}
                                    onChange={e => setCurrentPlot({ ...currentPlot, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint label="ขนาดพื้นที่" required />
                                <input
                                    type="number"
                                    placeholder="จำนวน"
                                    className="gacp-input"
                                    value={currentPlot.areaSize}
                                    onChange={e => setCurrentPlot({ ...currentPlot, areaSize: e.target.value })}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint label="หน่วย" />
                                <select
                                    className="gacp-input"
                                    value={currentPlot.areaUnit}
                                    onChange={e => setCurrentPlot({ ...currentPlot, areaUnit: e.target.value })}
                                >
                                    <option value="Rai">ไร่</option>
                                    <option value="Ngan">งาน</option>
                                    <option value="Sqm">ตร.ม.</option>
                                </select>
                            </div>
                        </div>

                        {/* GACP Toggle */}
                        <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowGACPFields(!showGACPFields)}
                                className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <PlantIcon className="w-4 h-4 text-amber-600" />
                                    <span className="font-bold text-sm text-amber-900">ข้อมูลคุณภาพ (GACP)</span>
                                    <span className="text-[10px] bg-white text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">Optional</span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-500 transition-transform ${showGACPFields ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                            </button>

                            {showGACPFields && (
                                <div className="p-5 border-t border-amber-100 space-y-5 animate-slide-down">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <FormLabelWithHint label="ประเภทดิน" />
                                            <select
                                                className="gacp-input bg-white"
                                                value={currentPlot.soilType || ''}
                                                onChange={e => setCurrentPlot({ ...currentPlot, soilType: e.target.value })}
                                            >
                                                <option value="">-- เลือก --</option>
                                                {soilTypes.map(soil => (
                                                    <option key={soil.id} value={soil.id}>{soil.nameTH}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <FormLabelWithHint label="แหล่งเมล็ดพันธุ์" />
                                            <select
                                                className="gacp-input bg-white"
                                                value={currentPlot.seedSource || ''}
                                                onChange={e => setCurrentPlot({ ...currentPlot, seedSource: e.target.value })}
                                            >
                                                <option value="">-- เลือก --</option>
                                                {seedSources.map(seed => (
                                                    <option key={seed.id} value={seed.id}>{seed.nameTH}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="hasIPMPlan"
                                                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                                                checked={currentPlot.hasIPMPlan || false}
                                                onChange={e => setCurrentPlot({ ...currentPlot, hasIPMPlan: e.target.checked })}
                                            />
                                            <label htmlFor="hasIPMPlan" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                                                มีแผนการจัดการศัตรูพืชแบบผสมผสาน (IPM)
                                            </label>
                                        </div>

                                        {currentPlot.hasIPMPlan && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 animate-fade-in">
                                                {ipmMethods.map(method => (
                                                    <label key={method.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-primary-300">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3.5 h-3.5 rounded text-primary border-gray-300 focus:ring-primary"
                                                            checked={currentPlot.ipmMethods?.includes(method.id) || false}
                                                            onChange={e => {
                                                                const methods = currentPlot.ipmMethods || [];
                                                                const newMethods = e.target.checked ? [...methods, method.id] : methods.filter(m => m !== method.id);
                                                                setCurrentPlot({ ...currentPlot, ipmMethods: newMethods });
                                                            }}
                                                        />
                                                        <span className="text-xs text-gray-700">{method.nameTH}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleAddPlot}
                                disabled={!currentPlot.name || !currentPlot.areaSize}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                เพิ่มแปลง
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/5')}
                onBack={() => router.push('/farmer/applications/new/step/3')} // Correctly point back to Step 3 (Farm/Land)
                isNextDisabled={plots.length === 0}
            />
        </div>
    );
};

export default StepPlots;
