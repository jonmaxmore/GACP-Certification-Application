import { useState, useEffect, useMemo } from 'react';
import { useWizardStore, Plot } from '../hooks/useWizardStore';
import { useGACPData } from '@/hooks/useGACPData';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { FormLabelWithHint } from '@/components/FormHint';
import { PlantIcon, WarningIcon } from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StepPlots = () => {
    const { state, setSiteData } = useWizardStore();
    const router = useRouter();
    const { dict, language } = useLanguage();

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
        'OUTDOOR': { label: language === 'th' ? 'กลางแจ้ง (Outdoor)' : 'Outdoor', icon: '🌿', color: 'bg-green-50 text-green-700 border-green-200' },
        'GREENHOUSE': { label: language === 'th' ? 'โรงเรือน (Greenhouse)' : 'Greenhouse', icon: '🏠', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        'INDOOR': { label: language === 'th' ? 'ระบบปิด (Indoor)' : 'Indoor', icon: '🏭', color: 'bg-purple-50 text-purple-700 border-purple-200' },
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
        <div className="space-y-8 animate-fade-in pb-12 px-4 max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    4
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.plots.title}</h2>
                    <p className="text-slate-500 text-sm">{dict.wizard.plots.subtitle}</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">📊</span>
                        {dict.wizard.plots.summary.title}
                    </h3>
                    <div className={`hidden md:flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${currentSystem.color}`}>
                        <span>{currentSystem.icon}</span>
                        <span>{currentSystem.label}</span>
                    </div>
                </div>

                {summary.totalArea === 0 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                        <WarningIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{dict.wizard.plots.summary.noTotalArea}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <div className="text-xl font-bold text-slate-900 mb-0.5">{summary.totalArea}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.wizard.plots.summary.totalArea} ({summary.unit})</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <div className="text-xl font-bold text-emerald-600 mb-0.5">{summary.allocatedArea}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.wizard.plots.summary.allocatedArea} ({summary.unit})</div>
                    </div>
                    <div className={`rounded-xl p-3 text-center border ${parseFloat(summary.remainingArea) < 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`text-xl font-bold mb-0.5 ${parseFloat(summary.remainingArea) < 0 ? 'text-rose-600' : 'text-amber-500'}`}>
                            {summary.remainingArea}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.wizard.plots.summary.remainingArea} ({summary.unit})</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <div className="text-xl font-bold text-blue-600 mb-0.5">{summary.qrCount}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.wizard.plots.summary.qrCount}</div>
                    </div>
                </div>
            </div>

            {/* Plot List & Add Button */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-sm">
                            {plots.length}
                        </span>
                        {dict.wizard.plots.list.title}
                    </h4>
                </div>

                {plots.length === 0 ? (
                    <div
                        className="text-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 cursor-pointer hover:bg-white hover:border-emerald-300 transition-all active:scale-[0.99]"
                        onClick={() => setIsFormExpanded(true)}
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                            <PlantIcon className="w-6 h-6 opacity-50" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{dict.wizard.plots.list.empty.title}</p>
                            <p className="text-xs">{dict.wizard.plots.list.empty.subtitle}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plots.map((plot, index) => (
                            <div
                                key={plot.id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-200 hover:shadow-sm transition-all relative group"
                            >
                                <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                    #{String(index + 1).padStart(2, '0')}
                                </span>

                                <div className="flex items-start gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-lg">
                                        {currentSystem.icon}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-base text-slate-900 leading-tight">{plot.name}</h5>
                                        <span className="text-xs font-medium text-slate-500 block mt-0.5">
                                            {plot.areaSize} {plot.areaUnit === 'Rai' ? 'ไร่' : plot.areaUnit === 'Ngan' ? 'งาน' : 'ตร.ม.'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-50">
                                    {plot.soilType && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">{dict.wizard.plots.list.badges.soil}</span>}
                                    {plot.seedSource && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{dict.wizard.plots.list.badges.seed}</span>}
                                    {plot.hasIPMPlan && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{dict.wizard.plots.list.badges.ipm}</span>}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemovePlot(plot.id); }}
                                    className="absolute bottom-3 right-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
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
                    ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/10'
                    : 'border-dashed border-slate-300'
                }
            `}>
                <button
                    onClick={() => setIsFormExpanded(!isFormExpanded)}
                    className={`w-full p-4 text-left flex items-center justify-between transition-colors ${isFormExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50/50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isFormExpanded ? 'bg-emerald-500 text-white rotate-45' : 'bg-slate-100 text-slate-400'}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </div>
                        <div>
                            <span className={`font-bold text-sm block ${isFormExpanded ? 'text-slate-900' : 'text-slate-500'}`}>{dict.wizard.plots.list.addTitle}</span>
                        </div>
                    </div>
                </button>

                {isFormExpanded && (
                    <div className="p-5 space-y-5 animate-slide-down">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                                <FormLabelWithHint label={dict.wizard.plots.form.name} required />
                                <input
                                    autoFocus
                                    placeholder={dict.wizard.plots.form.namePlaceholder}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                                    value={currentPlot.name}
                                    onChange={e => setCurrentPlot({ ...currentPlot, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint label={dict.wizard.plots.form.area} required />
                                <input
                                    type="number"
                                    placeholder={dict.wizard.plots.form.areaPlaceholder}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                                    value={currentPlot.areaSize}
                                    onChange={e => setCurrentPlot({ ...currentPlot, areaSize: e.target.value })}
                                />
                            </div>
                            <div>
                                <FormLabelWithHint label={dict.wizard.plots.form.unit} />
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
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
                        <div className="bg-amber-50/50 rounded-xl border border-amber-100/50 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowGACPFields(!showGACPFields)}
                                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <PlantIcon className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="font-bold text-xs text-amber-900">{dict.wizard.plots.form.gacpTitle}</span>
                                    <span className="text-[9px] bg-white text-amber-600 px-1 py-0.5 rounded border border-amber-200 uppercase tracking-wide">Optional</span>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-500 transition-transform ${showGACPFields ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                            </button>

                            {showGACPFields && (
                                <div className="p-4 border-t border-amber-100 space-y-4 animate-slide-down bg-white/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <FormLabelWithHint label={dict.wizard.plots.form.soilType} />
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                                                value={currentPlot.soilType || ''}
                                                onChange={e => setCurrentPlot({ ...currentPlot, soilType: e.target.value })}
                                            >
                                                <option value="">{dict.wizard.plots.form.select}</option>
                                                {soilTypes.map(soil => (
                                                    <option key={soil.id} value={soil.id}>{soil.nameTH}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <FormLabelWithHint label={dict.wizard.plots.form.seedSource} />
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                                                value={currentPlot.seedSource || ''}
                                                onChange={e => setCurrentPlot({ ...currentPlot, seedSource: e.target.value })}
                                            >
                                                <option value="">{dict.wizard.plots.form.select}</option>
                                                {seedSources.map(seed => (
                                                    <option key={seed.id} value={seed.id}>{seed.nameTH}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="hasIPMPlan"
                                                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                checked={currentPlot.hasIPMPlan || false}
                                                onChange={e => setCurrentPlot({ ...currentPlot, hasIPMPlan: e.target.checked })}
                                            />
                                            <label htmlFor="hasIPMPlan" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                                                {dict.wizard.plots.form.ipmLabel}
                                            </label>
                                        </div>

                                        {currentPlot.hasIPMPlan && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 animate-fade-in">
                                                {ipmMethods.map(method => (
                                                    <label key={method.id} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100 cursor-pointer hover:border-emerald-200">
                                                        <input
                                                            type="checkbox"
                                                            className="w-3 h-3 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                                            checked={currentPlot.ipmMethods?.includes(method.id) || false}
                                                            onChange={e => {
                                                                const methods = currentPlot.ipmMethods || [];
                                                                const newMethods = e.target.checked ? [...methods, method.id] : methods.filter(m => m !== method.id);
                                                                setCurrentPlot({ ...currentPlot, ipmMethods: newMethods });
                                                            }}
                                                        />
                                                        <span className="text-[10px] text-slate-700">{method.nameTH}</span>
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
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center gap-2 text-sm"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                {dict.wizard.plots.list.addBtn}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/5')}
                onBack={() => router.push('/farmer/applications/new/step/3')}
                isNextDisabled={plots.length === 0}
                nextLabel={dict.wizard.navigation.next}
                backLabel={dict.wizard.navigation.back}
            />
        </div>
    );
};

export default StepPlots;
