"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Step configuration for new flow
const STEPS = [
    { id: 0, path: 'step-0', label: 'เลือกพืช', icon: '🌿' },
    { id: 1, path: 'step-1', label: 'วัตถุประสงค์', icon: '🎯' },
    { id: 2, path: 'step-2', label: 'บริการ', icon: '🔖' },
    { id: 3, path: 'step-3', label: 'ยินยอม', icon: '✅' },
    { id: 4, path: 'step-4', label: 'ผู้ยื่น', icon: '👤' },
    { id: 5, path: 'step-5', label: 'สถานที่', icon: '📍' },
    { id: 6, path: 'step-6', label: 'การผลิต', icon: '🌱' },
    { id: 7, path: 'step-7', label: 'เอกสาร', icon: '📄' },
    { id: 8, path: 'step-8', label: 'ตรวจสอบ', icon: '🔍' },
    { id: 9, path: 'step-9', label: 'ใบเสนอราคา', icon: '📝' },
    { id: 10, path: 'step-10', label: 'ใบวางบิล', icon: '📋' },
    { id: 11, path: 'step-11', label: 'ชำระเงิน', icon: '💳' },
];

export default function WizardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
        // Check last save time from localStorage
        const savedTime = localStorage.getItem('gacp_wizard_last_saved');
        if (savedTime) setLastSaved(savedTime);
    }, []);

    // Update last saved time periodically
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem('gacp_wizard_last_saved', now);
            setLastSaved(now);
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Get current step from pathname
    const currentPath = pathname.split('/').pop() || 'step-0';
    const currentStep = STEPS.find(s => s.path === currentPath)?.id || 0;
    const isSuccess = currentPath === 'success';

    const progressPercent = isSuccess ? 100 : ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div style={{
            minHeight: '100vh',
            background: isDark ? '#0A0F1C' : '#F3F4F6',
            fontFamily: "'Kanit', sans-serif",
        }}>
            {/* Desktop Sidebar Container */}
            <div style={{
                display: 'flex',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: '100vh',
            }}>
                {/* Sidebar for Desktop */}
                <aside className="desktop-sidebar" style={{
                    width: '280px',
                    background: isDark ? '#1F2937' : 'white',
                    borderRight: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                    padding: '24px 20px',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                    flexShrink: 0,
                }}>
                    {/* Logo */}
                    <div style={{ marginBottom: '32px' }}>
                        <Link href="/dashboard" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none',
                        }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '22px' }}>🌿</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#F9FAFB' : '#111827' }}>GACP</div>
                                <div style={{ fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280' }}>มาตรฐานสมุนไพร</div>
                            </div>
                        </Link>
                    </div>

                    {/* Step List */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ขั้นตอนการยื่นคำขอ
                        </div>
                        {STEPS.map((step, i) => {
                            const isCompleted = i < currentStep;
                            const isCurrent = i === currentStep;
                            const stepContent = (
                                <>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        background: isCompleted
                                            ? '#10B981'
                                            : isCurrent
                                                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                                                : (isDark ? '#374151' : '#E5E7EB'),
                                        color: (isCompleted || isCurrent) ? 'white' : (isDark ? '#9CA3AF' : '#6B7280'),
                                        fontWeight: 600,
                                    }}>
                                        {isCompleted ? '✓' : step.icon}
                                    </div>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: isCurrent ? 600 : 400,
                                        color: isCurrent
                                            ? '#10B981'
                                            : isCompleted ? '#059669' : (isDark ? '#D1D5DB' : '#374151'),
                                    }}>
                                        {step.label}
                                    </span>
                                    {isCompleted && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                                            <path d="M9 18L15 12L9 6" />
                                        </svg>
                                    )}
                                </>
                            );
                            const stepStyle: React.CSSProperties = {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                marginBottom: '4px',
                                background: isCurrent
                                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5')
                                    : 'transparent',
                                cursor: isCompleted ? 'pointer' : 'default',
                                opacity: i > currentStep ? 0.5 : 1,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                            };
                            return isCompleted ? (
                                <Link key={step.id} href={`/applications/new/${step.path}`} style={stepStyle}>
                                    {stepContent}
                                </Link>
                            ) : (
                                <div key={step.id} style={stepStyle}>
                                    {stepContent}
                                </div>
                            );
                        })}
                    </div>

                    {/* Help Link */}
                    <div style={{
                        marginTop: 'auto',
                        padding: '16px',
                        background: isDark ? '#374151' : '#F9FAFB',
                        borderRadius: '12px',
                    }}>
                        <p style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '8px' }}>ต้องการความช่วยเหลือ?</p>
                        <a href="tel:02-123-4567" style={{ fontSize: '14px', color: '#10B981', fontWeight: 500, textDecoration: 'none' }}>📞 02-123-4567</a>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '100%',
                    overflow: 'hidden',
                }}>
                    {/* Mobile Header */}
                    {!isSuccess && (
                        <div className="mobile-header" style={{
                            background: isDark
                                ? 'linear-gradient(135deg, #047857 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                            padding: '16px 20px 28px',
                            borderRadius: '0 0 24px 24px',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
                        }}>
                            {/* Top Bar */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}>
                                <button onClick={() => setShowExitDialog(true)} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'white',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    opacity: 0.9,
                                    fontSize: '13px',
                                    fontFamily: "'Kanit', sans-serif",
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 18L9 12L15 6" />
                                    </svg>
                                    ออก
                                </button>

                                <div style={{
                                    color: 'white',
                                    fontSize: '12px',
                                    opacity: 0.9,
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '5px 12px',
                                    borderRadius: '16px',
                                }}>
                                    {currentStep + 1} / {STEPS.length}
                                </div>
                            </div>

                            {/* Title */}
                            <h1 style={{
                                color: 'white',
                                fontSize: '18px',
                                fontWeight: 600,
                                marginBottom: '4px',
                            }}>
                                ยื่นขอรับรอง GACP
                            </h1>
                            <p style={{
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: '13px',
                                marginBottom: '16px',
                            }}>
                                {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
                            </p>

                            {/* Progress Bar */}
                            <div style={{
                                height: '5px',
                                background: 'rgba(255,255,255,0.3)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${progressPercent}%`,
                                    background: 'white',
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Desktop Header */}
                    {!isSuccess && (
                        <div className="desktop-header" style={{
                            padding: '24px 32px 16px',
                            borderBottom: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h1 style={{
                                        fontSize: '22px',
                                        fontWeight: 700,
                                        color: isDark ? '#F9FAFB' : '#111827',
                                        marginBottom: '4px',
                                    }}>
                                        {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
                                    </h1>
                                    <p style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                        ขั้นตอนที่ {currentStep + 1} จาก {STEPS.length}
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}>
                                    <div style={{
                                        width: '120px',
                                        height: '8px',
                                        background: isDark ? '#374151' : '#E5E7EB',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progressPercent}%`,
                                            background: 'linear-gradient(90deg, #059669, #10B981)',
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>
                                        {Math.round(progressPercent)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Container */}
                    <div style={{
                        flex: 1,
                        padding: isSuccess ? '24px' : '20px',
                        overflowY: 'auto',
                    }}>
                        {/* Main Card */}
                        <div className="content-card" style={{
                            background: isDark ? '#1F2937' : 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: isDark
                                ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                                : '0 2px 12px rgba(0, 0, 0, 0.05)',
                            maxWidth: '680px',
                            margin: '0 auto',
                            animation: 'slideUp 0.3s ease-out',
                        }}>
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Exit Confirmation Dialog */}
            {showExitDialog && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        background: isDark ? '#1F2937' : 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        maxWidth: '340px',
                        width: '90%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        animation: 'slideUp 0.3s ease-out',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '8px' }}>
                                ยกเลิกคำขอ?
                            </h3>
                            <p style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                ข้อมูลที่กรอกจะถูกบันทึกไว้ คุณสามารถกลับมาดำเนินการต่อได้
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowExitDialog(false)} style={{
                                flex: 1, padding: '12px', borderRadius: '10px',
                                border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                                background: isDark ? '#374151' : 'white',
                                color: isDark ? '#F9FAFB' : '#374151',
                                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                fontFamily: "'Kanit', sans-serif",
                            }}>
                                ดำเนินการต่อ
                            </button>
                            <Link href="/dashboard" style={{
                                flex: 1, padding: '12px', borderRadius: '10px',
                                border: 'none',
                                background: '#EF4444',
                                color: 'white',
                                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Kanit', sans-serif",
                            }}>
                                ออกจากหน้านี้
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-Save Indicator */}
            {!isSuccess && lastSaved && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
                    border: `1px solid ${isDark ? '#10B981' : '#A7F3D0'}`,
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    zIndex: 100,
                    animation: 'fadeIn 0.3s ease-out',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกอัตโนมัติ {lastSaved}
                </div>
            )}

            {/* Responsive Styles */}
            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Mobile First - Hide desktop elements */
                .desktop-sidebar {
                    display: none !important;
                }
                .desktop-header {
                    display: none !important;
                }
                .mobile-header {
                    display: block !important;
                }

                /* Desktop - 768px and above */
                @media (min-width: 768px) {
                    .desktop-sidebar {
                        display: flex !important;
                        flex-direction: column;
                    }
                    .desktop-header {
                        display: block !important;
                    }
                    .mobile-header {
                        display: none !important;
                    }
                    .content-card {
                        margin: 0 auto;
                    }
                }

                /* Large Desktop - 1024px and above */
                @media (min-width: 1024px) {
                    .content-card {
                        max-width: 720px !important;
                        padding: 32px !important;
                    }
                }
            `}</style>
        </div>
    );
}

