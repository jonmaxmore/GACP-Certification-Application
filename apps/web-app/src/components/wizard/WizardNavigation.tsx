'use client';

import React from 'react';

interface WizardNavigationProps {
    onBack?: () => void;
    onNext?: () => void;
    isNextDisabled?: boolean;
    isBackDisabled?: boolean; // New prop for Step 1
    nextLabel?: string;
    backLabel?: string;
    isSubmitting?: boolean;
    showBack?: boolean;
    customNextButton?: React.ReactNode;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
    onBack,
    onNext,
    isNextDisabled = false,
    isBackDisabled = false,
    nextLabel = 'ดำเนินการต่อ',
    backLabel = 'ย้อนกลับ',
    isSubmitting = false,
    showBack = true,
    customNextButton
}) => {
    return (
        <div className="flex items-center justify-between pt-8 mt-10 border-t border-gray-100 animate-slide-up delay-100">
            {/* Back Button */}
            <div className="flex-1">
                {showBack && onBack && (
                    <button
                        onClick={onBack}
                        disabled={isBackDisabled}
                        className="gacp-btn-secondary group"
                    >
                        <svg
                            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="transition-transform group-hover:-translate-x-1"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        {backLabel}
                    </button>
                )}
            </div>

            {/* Next Button */}
            <div className="flex-1 flex justify-end">
                {customNextButton ? (
                    customNextButton
                ) : (
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled || isSubmitting}
                        className="gacp-btn-primary group min-w-[160px]"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            <>
                                <span>{nextLabel}</span>
                                <svg
                                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className={`transition-transform duration-300 ${!isNextDisabled ? 'group-hover:translate-x-1' : ''}`}
                                >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
