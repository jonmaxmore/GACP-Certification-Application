"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import WizardProgress from './WizardProgress';

// Theme System - matching Dashboard
const themes = {
    light: {
        bg: "#F8FAF9", bgCard: "#FFFFFF", surface: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.08)", text: "#1A1A1A", textMuted: "#8A8A8A",
        accent: "#16A34A", accentLight: "#22C55E",
        iconBg: "#E5F9E7", iconColor: "#16A34A",
        headerBg: "#0F172A",
    },
    dark: {
        bg: "#0A0F1C", bgCard: "rgba(15, 23, 42, 0.6)", surface: "#0F172A",
        border: "rgba(255, 255, 255, 0.08)", text: "#F8FAFC", textMuted: "#64748B",
        accent: "#10B981", accentLight: "#34D399",
        iconBg: "rgba(16, 185, 129, 0.15)", iconColor: "#34D399",
        headerBg: "#0F172A",
    }
};

interface Props {
    currentStep: number;
    title: string;
    children: ReactNode;
    onNext?: () => void;
    onPrev?: () => void;
    onStepClick?: (step: number) => void;
    nextLabel?: string;
    prevLabel?: string;
    nextDisabled?: boolean;
    showPrev?: boolean;
    hideNavigation?: boolean;
}

export default function WizardLayout({
    currentStep,
    title,
    children,
    onNext,
    onPrev,
    onStepClick,
    nextLabel = "ถัดไป",
    prevLabel = "ย้อนกลับ",
    nextDisabled = false,
    showPrev = true,
    hideNavigation = false,
}: Props) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        setIsDark(savedTheme === "dark");
    }, []);

    const t = isDark ? themes.dark : themes.light;
    const shouldHideNav = hideNavigation || currentStep >= 10;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'Kanit', sans-serif", transition: "all 0.3s" }}>
            {/* Header - Green Gradient */}
            <div style={{ background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`, padding: "16px 24px", color: "#FFF" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/applications" style={{
                        color: "#FFF", textDecoration: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: "40px", height: "40px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        transition: "all 0.2s",
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0, letterSpacing: "-0.3px" }}>ยื่นคำขอใบรับรอง GACP</h1>
                        <p style={{ fontSize: "12px", opacity: 0.9, margin: 0, marginTop: "2px" }}>{title}</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div style={{ backgroundColor: t.bgCard, borderBottom: `1px solid ${t.border}` }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
                    <WizardProgress currentStep={currentStep} onStepClick={onStepClick} isDark={isDark} />
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 24px 24px" }}>
                <div style={{
                    backgroundColor: t.bgCard,
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
                    border: `1px solid ${t.border}`
                }}>
                    {children}
                </div>

                {/* Navigation */}
                {!shouldHideNav && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", gap: "12px" }}>
                        {showPrev && currentStep > 0 ? (
                            <button
                                onClick={onPrev}
                                style={{
                                    flex: 1, padding: "14px",
                                    backgroundColor: t.bgCard,
                                    border: `1px solid ${t.border}`,
                                    borderRadius: "12px",
                                    fontSize: "15px", fontWeight: 500,
                                    color: t.text,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                    transition: "all 0.2s",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                                {prevLabel}
                            </button>
                        ) : <div style={{ flex: 1 }} />}

                        {onNext && (
                            <button
                                onClick={onNext}
                                disabled={nextDisabled}
                                style={{
                                    flex: 1, padding: "14px",
                                    background: nextDisabled ? t.textMuted : `linear-gradient(135deg, ${t.accent} 0%, ${t.accentLight} 100%)`,
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "15px", fontWeight: 500,
                                    color: "#FFF",
                                    cursor: nextDisabled ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                    boxShadow: nextDisabled ? "none" : `0 4px 16px ${isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(22, 163, 74, 0.25)"}`,
                                    transition: "all 0.2s",
                                }}
                            >
                                {nextLabel}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18L15 12L9 6" /></svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
            `}</style>
        </div>
    );
}
