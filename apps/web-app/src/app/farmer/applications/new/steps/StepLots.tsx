'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, Lot } from '../hooks/useWizardStore';
import { useRouter } from 'next/navigation';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { PlantIcon } from '@/components/icons/WizardIcons';

export const StepLots = () => {
    const { state, setLots, addLot, removeLot } = useWizardStore();
    const router = useRouter();

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
            case 'PLANNED': return 'gacp-badge-warning';
            case 'ACTIVE': return 'gacp-badge-success';
            case 'HARVESTED': return 'gacp-badge-neutral';
            case 'CANCELLED': return 'gacp-badge-danger';
            default: return 'gacp-badge-neutral';
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
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary gradient-mask rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50">
                    6
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary-900">จัดการล็อตการผลิต (Lots Management)</h2>
                    <p className="text-text-secondary">วางแผนและจัดการล็อตการปลูกเพื่อการติดตามย้อนกลับ (Traceability)</p>
                </div>
            </div>

            {/* Summary Card */}
            <div className="gacp-card bg-gradient-to-br from-teal-50 to-white border-teal-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">จำนวนล็อตทั้งหมด</p>
                        <p className="text-3xl font-bold text-teal-700">{lots.length} <span className="text-lg text-text-secondary font-medium">ล็อต</span></p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">จำนวนต้นพืชรวม</p>
                        <p className="text-3xl font-bold text-emerald-700">{totalPlants.toLocaleString()} <span className="text-lg text-text-secondary font-medium">ต้น</span></p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">แปลงปลูกที่มี</p>
                        <p className="text-3xl font-bold text-primary-900">{availablePlots.length} <span className="text-lg text-text-secondary font-medium">แปลง</span></p>
                    </div>
                </div>
            </div>

            {/* Lots List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all group relative overflow-hidden
                        ${availablePlots.length === 0
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-primary-300 bg-primary-50/30 text-primary-700 hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg'
                        }`}
                >
                    <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-2xl text-primary-600">
                        +
                    </div>
                    <span className="font-bold text-lg">เพิ่มล็อตใหม่</span>
                    {availablePlots.length === 0 ? (
                        <span className="text-xs text-gray-400 mt-2 bg-white px-2 py-1 rounded-md">กรุณาเพิ่มแปลงปลูกก่อน</span>
                    ) : (
                        <span className="text-xs text-primary-600/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">คลิกเพื่อสร้างล็อต</span>
                    )}
                </button>

                {/* Existing Lots */}
                {lots.map((lot) => (
                    <div key={lot.id} className="gacp-card group hover:border-primary-300 hover:shadow-premium-hover transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-mono font-medium">
                                        {lot.lotCode}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={lot.plotName}>
                                    {lot.plotName || 'ไม่ระบุแปลง'}
                                </h3>
                            </div>
                            <span className={`gacp-badge ${getStatusBadge(lot.status)}`}>
                                {getStatusLabel(lot.status)}
                            </span>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-text-secondary">จำนวนต้น</span>
                                <span className="font-bold text-xl text-primary-700">{lot.plantCount.toLocaleString()}</span>
                            </div>
                            {lot.estimatedPlantingDate && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary">วันที่ปลูก</span>
                                    <span className="font-medium text-gray-900">{new Date(lot.estimatedPlantingDate).toLocaleDateString('th-TH')}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleRemoveLot(lot.id)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all p-2 text-danger hover:bg-danger-bg rounded-full hover:shadow-sm"
                            title="ลบล็อต"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl flex gap-3 text-blue-900 text-sm shadow-sm">
                <span className="text-xl">💡</span>
                <p className="leading-relaxed">
                    <strong>ล็อตการผลิต (Lot)</strong> คือหน่วยสำคัญในการตรวจสอบย้อนกลับ (Traceability) ระบบจะสร้าง QR Code ประจำต้นสำหรับทุกต้นในล็อตนี้เมื่อได้รับอนุมัติ ซึ่งจะใช้ในการติดตามดูแลรักษาและการเก็บเกี่ยวต่อไป
                </p>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/50 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">เพิ่มล็อตการผลิตใหม่</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Lot Code */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">รหัสล็อต (Auto)</label>
                                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 font-mono text-lg font-medium tracking-wide text-center">
                                    {currentLot.lotCode}
                                </div>
                            </div>

                            {/* Plot Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">เลือกแปลงปลูก <span className="text-danger">*</span></label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none bg-white transition-all appearance-none"
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

                            {/* Plant Count */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">จำนวนต้น <span className="text-danger">*</span></label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                                        placeholder="0"
                                        value={currentLot.plantCount || ''}
                                        onChange={e => setCurrentLot({ ...currentLot, plantCount: parseInt(e.target.value) || 0 })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ต้น</span>
                                </div>
                            </div>

                            {/* Estimated Planting Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">วันที่คาดว่าจะปลูก</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                                    value={currentLot.estimatedPlantingDate || ''}
                                    onChange={e => setCurrentLot({ ...currentLot, estimatedPlantingDate: e.target.value })}
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">หมายเหตุ</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all text-sm"
                                    placeholder="ข้อมูลเพิ่มเติม..."
                                    value={currentLot.notes || ''}
                                    onChange={e => setCurrentLot({ ...currentLot, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleAddLot}
                                disabled={!currentLot.plotId || !currentLot.plantCount}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold shadow-md transition-all ${currentLot.plotId && currentLot.plantCount
                                    ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                ยืนยันสร้างล็อต
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
