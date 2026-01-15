import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WizardStepWrapperProps {
    children: ReactNode;
    title?: string | ReactNode;
    description?: string | ReactNode;
    icon?: ReactNode;
    className?: string;
    animate?: boolean;
}

const WizardStepWrapper: React.FC<WizardStepWrapperProps> = ({
    children,
    title,
    description,
    icon,
    className = '',
    animate = true,
}) => {
    const content = (
        <div className={`max-w-4xl mx-auto px-4 py-6 md:py-10 ${className}`}>
            {(title || description || icon) && (
                <div className="mb-8 md:mb-12 text-center">
                    {icon && (
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-primary-50 text-primary-600 mb-6 shadow-soft group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                    )}
                    {title && (
                        <h1 className="text-2xl md:text-4xl font-bold text-text-main mb-3 tracking-tight">
                            {title}
                        </h1>
                    )}
                    {description && (
                        <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="relative">
                {children}
            </div>
        </div>
    );

    if (!animate) return content;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {content}
        </motion.div>
    );
};

export default WizardStepWrapper;
