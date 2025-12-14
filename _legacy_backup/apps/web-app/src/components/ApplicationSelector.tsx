"use client";

import { useState, useEffect } from 'react';
import api from '@/services/apiClient';

interface PricingConfig {
    config: {
        docReviewFee: number;
        baseInspectionFee: number;
        areaSurcharge: number;
    };
    areaTypes: { id: string; label: string; labelEn: string }[];
    objectives: { id: string; label: string; labelEn: string }[];
    serviceTypes: { id: string; label: string }[];
}

interface FeeBreakdown {
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    total: number;
    totalText: string;
    requiresTeamReview: boolean;
    message?: string;
}

// Theme support
const getTheme = (isDark: boolean) => isDark ? {
    bg: "rgba(15, 23, 42, 0.6)", border: "rgba(255, 255, 255, 0.08)",
    text: "#F8FAFC", textSecondary: "#94A3B8", textMuted: "#64748B",
    accent: "#3B82F6", accentLight: "#60A5FA", success: "#10B981"
} : {
    bg: "#FFFFFF", border: "rgba(0, 0, 0, 0.08)",
    text: "#1A1A1A", textSecondary: "#5A5A5A", textMuted: "#8A8A8A",
    accent: "#2563EB", accentLight: "#3B82F6", success: "#16A34A"
};

// Plant options (6 สมุนไพร)
const PLANTS = [
    { id: 'cannabis', label: 'กัญชา', emoji: '🌿' },
    { id: 'kratom', label: 'กระท่อม', emoji: '🍃' },
    { id: 'turmeric', label: 'ขมิ้นชัน', emoji: '🟡' },
    { id: 'ginger', label: 'ขิง', emoji: '🫚' },
    { id: 'black_galingale', label: 'กระชายดำ', emoji: '🟤' },
    { id: 'plai', label: 'ไพล', emoji: '🌱' }
];

interface ApplicationSelectorProps {
    isDark?: boolean;
    onSelectionChange?: (selection: {
        plant: string;
        objective: string;
        areaTypes: string[];
        serviceType: string;
    }) => void;
    onFeeCalculated?: (fee: FeeBreakdown | null) => void;
}

export default function ApplicationSelector({
    isDark = false,
    onSelectionChange,
    onFeeCalculated
}: ApplicationSelectorProps) {
    const t = getTheme(isDark);

    const [config, setConfig] = useState<PricingConfig | null>(null);
    const [loading, setLoading] = useState(true);

    // Selections
    const [plant, setPlant] = useState<string>('');
    const [objective, setObjective] = useState<string>('');
    const [areaTypes, setAreaTypes] = useState<string[]>([]);
    const [serviceType, setServiceType] = useState<string>('new_application');

    // Calculated fee
    const [fee, setFee] = useState<FeeBreakdown | null>(null);
    const [calculating, setCalculating] = useState(false);

    // Load config
    useEffect(() => {
        loadConfig();
    }, []);

    // Calculate fee when selections change
    useEffect(() => {
        if (serviceType && areaTypes.length > 0) {
            calculateFee();
        }
        onSelectionChange?.({ plant, objective, areaTypes, serviceType });
    }, [plant, objective, areaTypes, serviceType]);

    const loadConfig = async () => {
        try {
            const result = await api.get<any>('/v2/pricing/fees');
            if (result.success && result.data?.data) {
                setConfig(result.data.data);
            }
        } catch (error) {
            console.error('Failed to load pricing config');
        } finally {
            setLoading(false);
        }
    };

    const calculateFee = async () => {
        setCalculating(true);
        try {
            const result = await api.post<any>('/v2/pricing/calculate', {
                serviceType,
                areaTypes,
                plantType: plant,
                objective
            });
            if (result.success && result.data?.data) {
                setFee(result.data.data);
                onFeeCalculated?.(result.data.data);
            }
        } catch (error) {
            console.error('Failed to calculate fee');
        } finally {
            setCalculating(false);
        }
    };

    const toggleArea = (areaId: string) => {
        setAreaTypes(prev =>
            prev.includes(areaId)
                ? prev.filter(a => a !== areaId)
                : [...prev, areaId]
        );
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: t.textMuted }}>กำลังโหลด...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Plant Selection */}
            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '12px' }}>
                    1. เลือกประเภทสมุนไพร <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {PLANTS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPlant(p.id)}
                            style={{
                                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                border: plant === p.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                background: plant === p.id ? `${t.accent}15` : 'transparent',
                                color: t.text, fontSize: '13px', textAlign: 'center'
                            }}
                        >
                            <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{p.emoji}</span>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Objective Selection */}
            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '12px' }}>
                    2. วัตถุประสงค์การผลิต <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {config?.objectives.map(obj => (
                        <label
                            key={obj.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                                border: objective === obj.id ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                background: objective === obj.id ? `${t.accent}15` : 'transparent'
                            }}
                        >
                            <input
                                type="radio"
                                name="objective"
                                value={obj.id}
                                checked={objective === obj.id}
                                onChange={() => setObjective(obj.id)}
                                style={{ accentColor: t.accent }}
                            />
                            <span style={{ color: t.text, fontSize: '14px' }}>{obj.label}</span>
                            <span style={{ color: t.textMuted, fontSize: '12px' }}>({obj.labelEn})</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Area Type Selection (Multi-select) */}
            <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '8px' }}>
                    3. ลักษณะพื้นที่ <span style={{ color: '#EF4444' }}>*</span>
                    <span style={{ fontWeight: 400, fontSize: '12px', color: t.textMuted, marginLeft: '8px' }}>
                        (เลือกได้หลายรายการ, คิด 5,000 บาท/ประเภท)
                    </span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {config?.areaTypes.map(area => (
                        <label
                            key={area.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                                border: areaTypes.includes(area.id) ? `2px solid ${t.success}` : `1px solid ${t.border}`,
                                background: areaTypes.includes(area.id) ? `${t.success}15` : 'transparent'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={areaTypes.includes(area.id)}
                                onChange={() => toggleArea(area.id)}
                                style={{ accentColor: t.success, width: '18px', height: '18px' }}
                            />
                            <span style={{ color: t.text, fontSize: '14px' }}>{area.label}</span>
                            <span style={{ color: t.textMuted, fontSize: '12px' }}>({area.labelEn})</span>
                            {areaTypes.includes(area.id) && (
                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: t.success, fontWeight: 600 }}>
                                    +5,000 ฿
                                </span>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Fee Preview */}
            {fee && !fee.requiresTeamReview && (
                <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: `linear-gradient(135deg, ${t.accent}10, ${t.accentLight}10)`,
                    border: `1px solid ${t.accent}30`
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: t.text, marginBottom: '12px' }}>
                        💰 สรุปค่าธรรมเนียม
                    </div>

                    {fee.items.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '13px', color: t.textSecondary, marginBottom: '8px'
                        }}>
                            <span>{item.description}</span>
                            <span>{item.total.toLocaleString()} ฿</span>
                        </div>
                    ))}

                    <div style={{
                        borderTop: `1px solid ${t.border}`, paddingTop: '12px', marginTop: '8px',
                        display: 'flex', justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: t.text }}>รวมทั้งสิ้น</span>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: t.accent }}>
                            {fee.total.toLocaleString()} ฿
                        </span>
                    </div>
                    <div style={{ fontSize: '12px', color: t.textMuted, textAlign: 'right', marginTop: '4px' }}>
                        ({fee.totalText})
                    </div>
                </div>
            )}

            {fee?.requiresTeamReview && (
                <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: '#FEF3C7', border: '1px solid #F59E0B'
                }}>
                    <div style={{ fontSize: '14px', color: '#92400E' }}>
                        ⚠️ {fee.message || 'ทีมงานจะประเมินและส่งใบเสนอราคาให้ภายหลัง'}
                    </div>
                </div>
            )}
        </div>
    );
}
