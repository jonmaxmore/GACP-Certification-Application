"use client";

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

// SVG Icons for steps
const StepIcons = {
    plant: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22V8" /><path d="M5.5 8.5c3-3-1-8 6.5-8 7.5 0 3.5 5 6.5 8" /><path d="M6 16c-1.5-1.5-3-3.5-3-7" /><path d="M18 16c1.5-1.5 3-3.5 3-7" /></svg>,
    clipboard: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>,
    fileText: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    lock: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    user: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>,
    mapPin: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    production: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" /></svg>,
    upload: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    search: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    creditCard: (c: string) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    check: (c: string) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>,
};

// 10 Steps (0-9) - Consolidated flow with icons
const STEPS = [
    { label: "พืช", icon: StepIcons.plant },
    { label: "มาตรฐาน", icon: StepIcons.clipboard },
    { label: "ประเภท", icon: StepIcons.fileText },
    { label: "PDPA", icon: StepIcons.lock },
    { label: "ผู้ยื่น", icon: StepIcons.user },
    { label: "สถานที่", icon: StepIcons.mapPin },
    { label: "การผลิต", icon: StepIcons.production },
    { label: "เอกสาร", icon: StepIcons.upload },
    { label: "ตรวจสอบ", icon: StepIcons.search },
    { label: "ชำระเงิน", icon: StepIcons.creditCard },
];

interface Props {
    currentStep: number;
    onStepClick?: (step: number) => void;
    isDark?: boolean;
}

export default function WizardProgress({ currentStep, onStepClick, isDark = false }: Props) {
    const t = isDark ? themes.dark : themes.light;

    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 8px", overflowX: "auto", gap: "4px" }}>
            {STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isComplete = i < currentStep;
                return (
                    <div
                        key={i}
                        onClick={() => isComplete && onStepClick?.(i)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: isComplete ? "pointer" : "default",
                            opacity: isActive || isComplete ? 1 : 0.5,
                            minWidth: "58px",
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "12px",
                                backgroundColor: isComplete ? t.accent : isActive ? t.iconBg : t.border,
                                border: isActive ? `2px solid ${t.accent}` : isComplete ? "none" : "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isComplete
                                ? StepIcons.check("#FFF")
                                : step.icon(isActive ? t.iconColor : t.textMuted)
                            }
                        </div>
                        <span style={{
                            fontSize: "10px",
                            color: isActive ? t.accent : isComplete ? t.iconColor : t.textMuted,
                            marginTop: "6px",
                            textAlign: "center",
                            fontWeight: isActive || isComplete ? 600 : 400,
                        }}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
