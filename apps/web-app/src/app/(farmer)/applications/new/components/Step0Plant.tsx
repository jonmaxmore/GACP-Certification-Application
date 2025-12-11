"use client";

import { useEffect, useState } from 'react';
import { PLANTS, PlantId } from '../hooks/useWizardState';

// Theme System - matching Dashboard
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
    }
};

// Plant-specific colors (keep for identity)
const plantColors: Record<string, { bg: string; icon: string }> = {
    cannabis: { bg: "#E5F9E7", icon: "#16A34A" },
    kratom: { bg: "#ECFDF5", icon: "#059669" },
    turmeric: { bg: "#FEF3C7", icon: "#D97706" },
    ginger: { bg: "#FED7AA", icon: "#C2410C" },
    black_galangal: { bg: "#E5E7EB", icon: "#374151" },
    plai: { bg: "#D1FAE5", icon: "#047857" },
};

// SVG Plant Icons
const PlantIcons = {
    cannabis: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22V8" /><path d="M5.5 8.5c3-3-1-8 6.5-8 7.5 0 3.5 5 6.5 8" /><path d="M6 16c-1.5-1.5-3-3.5-3-7" /><path d="M18 16c1.5-1.5 3-3.5 3-7" /></svg>,
    kratom: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 2v20" /><path d="M4 7l8 5 8-5" /><path d="M4 17l8-5 8 5" /></svg>,
    turmeric: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /><path d="M4 12h16" /></svg>,
    ginger: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 6v12" /></svg>,
    black_galangal: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></svg>,
    plai: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>,
};

interface Props {
    selectedPlant: PlantId | null;
    onSelect: (plantId: PlantId) => void;
}

export default function Step0Plant({ selectedPlant, onSelect }: Props) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");
    }, []);

    const t = isDark ? themes.dark : themes.light;

    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: t.text, marginBottom: "8px" }}>เลือกประเภทพืช</h2>
            <p style={{ color: t.textMuted, fontSize: "14px", marginBottom: "24px" }}>เลือกพืชที่ต้องการยื่นขอรับรองมาตรฐาน GACP</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {PLANTS.map((plant) => {
                    const isSelected = selectedPlant === plant.id;
                    const isHighControl = plant.group === 'HIGH_CONTROL';
                    const pc = plantColors[plant.id] || { bg: t.iconBg, icon: t.iconColor };
                    const PlantIcon = PlantIcons[plant.id as keyof typeof PlantIcons];

                    return (
                        <button
                            key={plant.id}
                            onClick={() => onSelect(plant.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                padding: "16px",
                                borderRadius: "14px",
                                border: isSelected ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                                backgroundColor: isSelected ? (isDark ? t.iconBg : "#F0FDF4") : t.bgCard,
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                            }}
                        >
                            <div style={{
                                width: "52px", height: "52px", borderRadius: "14px",
                                backgroundColor: isDark ? `${pc.icon}20` : pc.bg,
                                border: `1px solid ${pc.icon}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {PlantIcon ? PlantIcon(pc.icon) : <span style={{ fontSize: "24px" }}>{plant.icon}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "16px", fontWeight: 500, color: t.text }}>{plant.name}</div>
                                <div style={{
                                    fontSize: "12px",
                                    color: isHighControl ? "#DC2626" : t.accent,
                                    fontWeight: 500,
                                }}>
                                    {isHighControl ? "ควบคุมเข้มงวด" : "ทั่วไป"}
                                </div>
                            </div>
                            {isSelected && (
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "8px",
                                    backgroundColor: t.accent,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedPlant && PLANTS.find(p => p.id === selectedPlant)?.group === 'HIGH_CONTROL' && (
                <div style={{
                    marginTop: "20px", padding: "14px 18px",
                    backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
                    borderRadius: "12px",
                    borderLeft: "4px solid #DC2626"
                }}>
                    <p style={{ fontSize: "13px", color: isDark ? "#FCA5A5" : "#991B1B", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        พืชกลุ่มควบคุมเข้มงวดต้องมีใบอนุญาตและมาตรการความปลอดภัยเพิ่มเติม
                    </p>
                </div>
            )}
        </div>
    );
}
