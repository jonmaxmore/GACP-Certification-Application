'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWizardStore, Plot } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for Leaflet (SSR compatibility)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const UseMapEvents = dynamic(() => import('react-leaflet').then(mod => {
    const { useMapEvents } = mod;
    return function MapEvents({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
        useMapEvents({
            click(e) {
                onLocationFound(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };
}), { ssr: false });

export const StepPlots = () => {
    const { state, setSiteData, setCurrentStep } = useWizardStore();
    const router = useRouter();
    const { data: masterData } = useMasterData();

    const [plots, setPlots] = useState<Plot[]>(state.siteData?.plots || []);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlot, setCurrentPlot] = useState<Partial<Plot> & { latitude?: number; longitude?: number }>({
        name: '',
        areaSize: '',
        areaUnit: 'Rai',
        solarSystem: state.locationType || 'OUTDOOR', // Initialize with global selection
        latitude: 13.7563, // Default Bangkok
        longitude: 100.5018
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
            solarSystem: currentPlot.solarSystem as any || 'OUTDOOR',
            // @ts-ignore - Check if Plot type supports lat/long, if not handled in store yet
            latitude: currentPlot.latitude,
            longitude: currentPlot.longitude
        };

        setPlots([...plots, newPlot]);
        setIsModalOpen(false);
        setCurrentPlot({
            name: '',
            areaSize: '',
            areaUnit: 'Rai',
            solarSystem: state.locationType || 'OUTDOOR', // Reset to global
            latitude: 13.7563,
            longitude: 100.5018
        });
    };

    const handleRemovePlot = (id: string) => {
        setPlots(plots.filter(p => p.id !== id));
    };

    const handleFindMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPlot(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("ไม่สามารถระบุตำแหน่งได้ กรุณาเปิด GPS");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const cultivationSystems = [
        { id: 'OUTDOOR', label: 'กลางแจ้ง (Outdoor)', icon: '☀️' },
        { id: 'GREENHOUSE', label: 'โรงเรือน (Greenhouse)', icon: '🏠' },
        { id: 'INDOOR', label: 'ระบบปิด (Indoor)', icon: '💡' },
    ];

    // Fix for Leaflet Default Icon
    useEffect(() => {
        // Only run on client
        if (typeof window !== 'undefined') {
            // @ts-ignore
            import('leaflet').then(L => {
                // @ts-ignore
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
            });
        }
    }, []);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    การแบ่งแปลงปลูก (Zoning)
                </h2>
                <p className="text-gray-500 mt-2">กำหนดโซนและระบบการปลูก พร้อมระบุพิกัด GPS เพื่อการตรวจสอบ</p>
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
                                {/* @ts-ignore */}
                                {plot.latitude && (
                                    <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                        <span>📍</span>
                                        {/* @ts-ignore */}
                                        {plot.latitude.toFixed(4)}, {plot.longitude.toFixed(4)}
                                    </div>
                                )}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl scale-100 animate-scaleIn my-auto">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex justify-between items-center">
                            <span>เพิ่มแปลงปลูก (New Plot)</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Form */}
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ระบบการปลูก</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {cultivationSystems.map(sys => {
                                            const isLocked = !!state.locationType;
                                            const isSelected = currentPlot.solarSystem === sys.id;

                                            if (isLocked && !isSelected) return null;

                                            return (
                                                <label
                                                    key={sys.id}
                                                    className={`
                                                        flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                                        ${isSelected
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                        }
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
                                                        <span className="font-medium text-sm">{sys.label}</span>
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

                                {/* Yield Prediction Widget */}
                                {currentPlot.areaSize && state.plantId && (
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden">
                                        <h4 className="text-xs font-bold text-blue-800 flex items-center gap-2 mb-1">
                                            ✨ AI Yield Prediction
                                        </h4>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-xl font-bold text-blue-900">
                                                    {/* Simplified Yield Calc for Display */}
                                                    {(() => {
                                                        const size = parseFloat(currentPlot.areaSize || '0');
                                                        return (size * 250).toLocaleString(); // Mock calc
                                                    })()}
                                                </span>
                                                <span className="text-xs text-blue-700 ml-1">kg/รอบ</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-emerald-600">
                                                    ฿{(() => {
                                                        const size = parseFloat(currentPlot.areaSize || '0');
                                                        return (size * 80000).toLocaleString(); // Mock calc
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Map */}
                            <div className="space-y-4 flex flex-col">
                                <label className="block text-sm font-semibold text-gray-700">พิกัดแปลง (GPS Location)</label>

                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1 relative">
                                        <input
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            value={`${currentPlot.latitude?.toFixed(6) || ''}, ${currentPlot.longitude?.toFixed(6) || ''}`}
                                            readOnly
                                            placeholder="Latitude, Longitude"
                                        />
                                    </div>
                                    <button
                                        onClick={handleFindMe}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                    >
                                        📍 Find Me
                                    </button>
                                </div>

                                <div className="flex-1 min-h-[300px] border-2 border-gray-200 rounded-xl overflow-hidden relative z-0">
                                    <MapContainer
                                        // @ts-ignore
                                        center={[currentPlot.latitude || 13.7563, currentPlot.longitude || 100.5018]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            // @ts-ignore
                                            attribution='&copy; OpenStreetMap contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <UseMapEvents
                                            onLocationFound={(lat, lng) => setCurrentPlot(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                        />
                                        {currentPlot.latitude && currentPlot.longitude && (
                                            <Marker position={[currentPlot.latitude, currentPlot.longitude]}>
                                                <Popup>พิกัดแปลงปลูก</Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>

                                    <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs z-[1000] pointer-events-none">
                                        Click map to set pin
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 border-t pt-6">
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
                    onClick={() => router.push('/farmer/applications/new/step/3')} // Back to Land
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => {
                        router.push('/farmer/applications/new/step/5'); // Next to Production
                    }}
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
