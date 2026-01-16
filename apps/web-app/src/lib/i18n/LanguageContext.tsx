"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dictionary } from './types';
import { th } from './dictionaries/th';
import { en } from './dictionaries/en';

export type Language = 'th' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    dict: Dictionary;
    t: (key: string) => string; // Helper for dynamic keys if strictly typed dict is not enough
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Initialize language from localStorage on mount
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('language') as Language;
            return (savedLang === 'th' || savedLang === 'en') ? savedLang : 'th';
        }
        return 'th';
    });

    useEffect(() => {
        // Sync with localStorage if language changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'language') {
                const newLang = e.newValue as Language;
                if (newLang === 'th' || newLang === 'en') {
                    setLanguageState(newLang);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const dict = language === 'en' ? en : th;

    // Simple nested key retrieval for t("settings.title") style usage
    const t = (path: string): string => {
        const keys = path.split('.');
        let current: Record<string, unknown> = dict;

        for (const key of keys) {
            if (current[key] === undefined) {
                // If on server or first render before mount, fallback might be needed but we default to 'th'
                return path;
            }
            current = current[key] as Record<string, unknown>;
        }

        return typeof current === 'string' ? current : path;
    };

    // To prevent hydration mismatch, we could render only after mount, 
    // OR we accept that initial render matches server (th) and then client updates.
    // Given 'th' is default, it usually matches. 

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dict, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
