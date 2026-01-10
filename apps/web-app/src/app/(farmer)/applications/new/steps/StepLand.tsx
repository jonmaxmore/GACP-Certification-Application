'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '../hooks/useWizardStore';
import { useMasterData } from '@/hooks/useMasterData';
import { api } from '@/lib/api/api-client';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export const StepLand = () => {
    const { state, setSiteData, setCurrentStep } = useWizardStore();
    const { data: masterData } = useMasterData();

    // Local state for form
    const [formData, setFormData] = useState(state.siteData || {
        siteName: '',
        address: '',
        province: '',
        district: '',
        subdistrict: '',
        postalCode: '',
        landOwnership: 'OWN',
        soilType: '',
        waterSource: '',
        gpsLat: '',
        gpsLng: '',
        northBorder: '',
        southBorder: '',
        eastBorder: '',
        westBorder: '',
    });

    // Validation State
    const [checkingLand, setCheckingLand] = useState(false);
    const [landStatus, setLandStatus] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
    const [landMessage, setLandMessage] = useState('');

    useEffect(() => {
        // Debounce update to store
        const timeout = setTimeout(() => {
            setSiteData(formData as any);
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData, setSiteData]);

    const handleLocationSelect = async (lat: number, lng: number) => {
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);

        setFormData(prev => ({
            ...prev,
            gpsLat: latStr,
            gpsLng: lngStr
        }));

        // Trigger Smart Check
        setCheckingLand(true);
        setLandStatus('IDLE');
        setLandMessage('กำลังตรวจสอบพื้นที่กับฐานข้อมูล...');

        try {
            const res = await api.post<any>('/validation/land-check', { lat: latStr, lng: lngStr });

            if (res.success && res.data.valid) {
                setLandStatus('VALID');
                setLandMessage('✅ พื้นที่นี้สามารถขออนุญาตได้ (ไม่อยู่ในเขตหวงห้าม)');
            } else {
                setLandStatus('INVALID');
                setLandMessage(`❌ ไม่ผ่านการตรวจสอบ: ${res.data?.reason || 'พื้นที่ไม่เหมาะสม'}`);
            }
        } catch (error) {
            console.error(error);
            setLandStatus('INVALID');
            setLandMessage('เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่');
        } finally {
            setCheckingLand(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isNextDisabled = !formData.siteName ||
        !formData.address ||
        !formData.gpsLat ||
        landStatus === 'INVALID';

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    ข้อมูลสถานที่ผลิต
                </h2>
                <p className="text-gray-500 mt-2">ระบุพิกัดที่ตั้งและรายละเอียดของแปลงปลูก (Smart Check)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Map & Coordinates */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">📍 พิกัดแปลงปลูก (ปักหมุดบนแผนที่)</label>
                        <div className="h-80 w-full rounded-xl overflow-hidden relative z-0 border border-gray-200">
                            <InteractiveMap
                                initialLat={formData.gpsLat ? parseFloat(formData.gpsLat) : 13.736717}
                                initialLng={formData.gpsLng ? parseFloat(formData.gpsLng) : 100.523186}
                                onLocationSelect={handleLocationSelect}
                            />
                        </div>

                        {/* Smart Check Result */}
                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 transition-all ${checkingLand ? 'bg-blue-50 text-blue-700' :
                            landStatus === 'VALID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                landStatus === 'INVALID' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-gray-50 text-gray-500'
                            }`}>
                            {checkingLand ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    <span>AI กำลังวิเคราะห์พื้นที่...</span>
                                </>
                            ) : (
                                <span className="font-medium">{landMessage || 'กรุณาปักหมุดเพื่อตรวจสอบพื้นที่'}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-xs text-gray-500">Latitude</label>
                                <input
                                    type="text"
                                    value={formData.gpsLat || ''}
                                    readOnly
                                    className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm text-gray-600 font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Longitude</label>
                                <input
                                    type="text"
                                    value={formData.gpsLng || ''}
                                    readOnly
                                    className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm text-gray-600 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-semibold text-gray-800">อาณาเขตติดต่อ (Borders)</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                placeholder="ทิศเหนือ ติดกับ..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.northBorder}
                                onChange={e => handleChange('northBorder', e.target.value)}
                            />
                            <input
                                placeholder="ทิศใต้ ติดกับ..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.southBorder}
                                onChange={e => handleChange('southBorder', e.target.value)}
                            />
                            <input
                                placeholder="ทิศตะวันออก ติดกับ..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.eastBorder}
                                onChange={e => handleChange('eastBorder', e.target.value)}
                            />
                            <input
                                placeholder="ทิศตะวันตก ติดกับ..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.westBorder}
                                onChange={e => handleChange('westBorder', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 h-fit">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อสถานที่ผลิต (Farm Name)</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                            placeholder="เช่น ไร่สมุนไพรสุขใจ"
                            value={formData.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ที่อยู่ (Address)</label>
                        <textarea
                            className="input-premium w-full h-24 resize-none"
                            placeholder="บ้านเลขที่, หมู่, ถนน..."
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <input
                                placeholder="จังหวัด"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.province}
                                onChange={e => handleChange('province', e.target.value)}
                            />
                            <input
                                placeholder="รหัสไปรษณีย์"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.postalCode}
                                onChange={e => handleChange('postalCode', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <h3 className="font-semibold text-gray-800">ข้อมูลกายภาพ</h3>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">กรรมสิทธิ์ที่ดิน</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                value={formData.landOwnership}
                                onChange={e => handleChange('landOwnership', e.target.value)}
                            >
                                {masterData?.ownershipTypes.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label} ({opt.labelEN})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ลักษณะดิน</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                    value={formData.soilType}
                                    onChange={e => handleChange('soilType', e.target.value)}
                                >
                                    <option value="">-- เลือก --</option>
                                    {masterData?.soilTypes.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">แหล่งน้ำ</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                                    value={formData.waterSource}
                                    onChange={e => handleChange('waterSource', e.target.value)}
                                >
                                    <option value="">-- เลือก --</option>
                                    {masterData?.waterSources.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 border-t flex justify-between">
                <button
                    onClick={() => setCurrentStep(0)}
                    className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    ← ย้อนกลับ (Back)
                </button>
                <button
                    onClick={() => setCurrentStep(2)}
                    disabled={isNextDisabled}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${!isNextDisabled
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>


// End of component
        </div>
    );
};
