'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, Lot } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { CheckIcon, InfoIcon } from '@/components/icons/WizardIcons';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StepLots = () => {
    const { state, setLots } = useWizardStore();
    const router = useRouter();
    const { dict } = useLanguage();

    // Local lots state (sync with store)
    const [lots, setLotsLocal] = useState<Lot[]>(state.lots || []);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLot, setCurrentLot] = useState<Partial<Lot>>({
        lotCode: '',
        plotId: '',
        plantCount: 0,
        estimatedPlantingDate: '',
        status: 'PLANNED',
        notes: '',
    });

    // Sync with store when lots change
    useEffect(() => {
        setLots(lots);
    }, [lots, setLots]);

    // Generate lot code
    const generateLotCode = () => {
        const year = new Date().getFullYear() % 100; // เอา 2 หลักท้าย เช่น 67
        const count = lots.length + 1;
        return `LOT-${year}-${String(count).padStart(3, '0')}`;
    };

    // Get available plots from state (check both locations for compatibility)
    const availablePlots = (state.siteData?.plots && state.siteData.plots.length > 0)
        ? state.siteData.plots
        : (state.plots || []);

    // Handle add lot
    const handleAddLot = () => {
        if (!currentLot.plotId || !currentLot.plantCount) return;

        const selectedPlot = availablePlots.find(p => p.id === currentLot.plotId);

        const newLot: Lot = {
            id: crypto.randomUUID(),
            lotCode: currentLot.lotCode || generateLotCode(),
            plotId: currentLot.plotId,
            plotName: selectedPlot?.name || '',
            plantCount: currentLot.plantCount || 0,
            estimatedPlantingDate: currentLot.estimatedPlantingDate,
            status: 'PLANNED',
            notes: currentLot.notes,
        };

        setLotsLocal([...lots, newLot]);
        setIsModalOpen(false);
        setCurrentLot({
            lotCode: '',
            plotId: '',
            plantCount: 0,
            estimatedPlantingDate: '',
            status: 'PLANNED',
            notes: '',
        });
    };

    // Handle remove lot
    const handleRemoveLot = (id: string) => {
        setLotsLocal(lots.filter(l => l.id !== id));
    };

    // Calculate total plants across all lots
    const totalPlants = lots.reduce((sum, lot) => sum + (lot.plantCount || 0), 0);

    // Get status badge color
    const getStatusBadge = (status: Lot['status']) => {
        switch (status) {
            case 'PLANNED': return 'badge-warning';
            case 'ACTIVE': return 'badge-success';
            case 'HARVESTED': return 'badge-neutral';
            case 'CANCELLED': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    // Get status label
    const getStatusLabel = (status: Lot['status']) => {
        switch (status) {
            case 'PLANNED': return 'วางแผน';
            case 'ACTIVE': return 'กำลังปลูก';
            case 'HARVESTED': return 'เก็บเกี่ยวแล้ว';
            case 'CANCELLED': return 'ยกเลิก';
            default: return status;
        }
    };

    // Validation
    const canProceed = lots.length > 0;

    return (
        <div className="space-y-6 animate-fade-in px-4 max-w-xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    6
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">{dict.wizard.steps.lots || 'จัดการล็อตการผลิต'}</h2>
                    <p className="text-slate-500 text-sm">วางแผนและจัดการล็อตการปลูกเพื่อการติดตามย้อนกลับ</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="rounded-2xl p-5 bg-emerald-50/50 border border-emerald-100">
                <div className="flex justify-between items-center text-center">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600/80 mb-1">จำนวนล็อต</p>
                        <p className="text-2xl font-black text-emerald-700">{lots.length}</p>
                    </div>
                    <div className="w-px h-8 bg-emerald-200/50"></div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600/80 mb-1">ต้นรวม</p>
                        <p className="text-2xl font-black text-emerald-700">{totalPlants.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 bg-emerald-200/50"></div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600/80 mb-1">แปลง</p>
                        <p className="text-2xl font-black text-emerald-700">{availablePlots.length}</p>
                    </div>
                </div>
            </div>

            {/* Lots List */}
            <div className="space-y-4">
                {/* Existing Lots */}
                {lots.map((lot) => (
                    <div key={lot.id} className="p-4 rounded-2xl border border-slate-200 bg-white relative hover:border-emerald-200 transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono font-bold tracking-wider">
                                    {lot.lotCode}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${lot.status === 'PLANNED' ? 'bg-amber-50 text-amber-600' :
                                        lot.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-slate-50 text-slate-600'
                                    }`}>
                                    {getStatusLabel(lot.status)}
                                </span>
                            </div>
                            <button
                                onClick={() => handleRemoveLot(lot.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-2">{lot.plotName || 'ไม่ระบุแปลง'}</h3>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>{lot.plantCount.toLocaleString()} ต้น</span>
                            </div>
                            {lot.estimatedPlantingDate && (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <span>•</span>
                                    <span>ปลูก {new Date(lot.estimatedPlantingDate).toLocaleDateString('th-TH')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add New Button */}
                <button
                    onClick={() => {
                        setCurrentLot({
                            lotCode: generateLotCode(),
                            plotId: '',
                            plantCount: 0,
                            estimatedPlantingDate: '',
                            status: 'PLANNED',
                            notes: '',
                        });
                        setIsModalOpen(true);
                    }}
                    disabled={availablePlots.length === 0}
                    className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all active:scale-[0.99]
                        ${availablePlots.length === 0
                            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                            : 'border-emerald-200 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-bold'
                        }`}
                >
                    <span className="text-xl font-light">+</span>
                    <span>เพิ่มล็อตการผลิตใหม่</span>
                </button>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <InfoIcon className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-blue-800 mb-0.5">เกร็ดความรู้: ล็อตการผลิต (Lot)</p>
                    <p className="text-[11px] leading-relaxed text-blue-700/80">
                        ล็อตการผลิตคือหน่วยสำคัญในการตรวจสอบย้อนกลับ (Traceability) ระบบจะสร้าง QR Code ประจำต้นเมื่อได้รับการอนุมัติ
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-[2rem] sm:rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-slide-up border border-white/20 ring-1 ring-black/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">เพิ่มล็อตใหม่</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-5 max-h-[70vh] overflow-y-auto pb-4 custom-scrollbar">
                            {/* Lot Code Display */}
                            <div className="flex justify-center mb-6">
                                <div className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <span className="text-sm font-bold text-slate-400 block text-center mb-1">รหัสล็อต</span>
                                    <span className="font-mono text-2xl font-bold text-emerald-600 tracking-wider block text-center">{currentLot.lotCode}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">เลือกแปลงปลูก <span className="text-rose-500">*</span></label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
                                        value={currentLot.plotId || ''}
                                        onChange={e => setCurrentLot({ ...currentLot, plotId: e.target.value })}
                                    >
                                        <option value="">-- กรุณาเลือกแปลง --</option>
                                        {availablePlots.map(plot => (
                                            <option key={plot.id} value={plot.id}>
                                                {plot.name} ({plot.areaSize} {plot.areaUnit})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">จำนวนต้น <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium pr-10"
                                                placeholder="0"
                                                value={currentLot.plantCount || ''}
                                                onChange={e => setCurrentLot({ ...currentLot, plantCount: parseInt(e.target.value) || 0 })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">ต้น</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">วันที่เริ่มปลูก</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                                            value={currentLot.estimatedPlantingDate || ''}
                                            onChange={e => setCurrentLot({ ...currentLot, estimatedPlantingDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">หมายเหตุ</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium h-24 resize-none placeholder:text-slate-400"
                                        placeholder="ข้อมูลเพิ่มเติม..."
                                        value={currentLot.notes || ''}
                                        onChange={e => setCurrentLot({ ...currentLot, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAddLot}
                                disabled={!currentLot.plotId || !currentLot.plantCount}
                                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                สร้างล็อต
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <WizardNavigation
                onNext={() => router.push('/farmer/applications/new/step/7')}
                onBack={() => router.push('/farmer/applications/new/step/5')}
                isNextDisabled={!canProceed}
            />
        </div>
    );
};

export default StepLots;
