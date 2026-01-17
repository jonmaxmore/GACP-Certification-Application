/**
 * 🍎 Apple-Standard i18n Utility
 * 
 * Simple internationalization helper for client-side string loading
 * 
 * Usage:
 * import { t, setLocale, getLocale } from '@/lib/i18n';
 * const text = t('auth.login'); // Returns "เข้าสู่ระบบ" or "Login"
 */

type Locale = 'th' | 'en';
type NestedStrings = { [key: string]: string | NestedStrings };

let currentLocale: Locale = 'th';
let translations: NestedStrings = {};

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
    currentLocale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
    return currentLocale;
}

/**
 * Load translations from JSON file
 */
export async function loadTranslations(locale: Locale = currentLocale): Promise<void> {
    try {
        const response = await fetch(`/locales/${locale}/common.json`);
        if (response.ok) {
            translations = await response.json();
            currentLocale = locale;
        }
    } catch (error) {
        console.error(`Failed to load translations for ${locale}:`, error);
    }
}

/**
 * Get translated string by key path
 * 
 * @param key - Dot-separated path (e.g., 'auth.login', 'status.approved')
 * @param fallback - Fallback if key not found
 * @returns Translated string
 */
export function t(key: string, fallback?: string): string {
    const keys = key.split('.');
    let result: string | NestedStrings = translations;

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return fallback || key;
        }
    }

    return typeof result === 'string' ? result : fallback || key;
}

/**
 * Translate with parameters
 * 
 * @param key - Translation key
 * @param params - Parameters to replace {0}, {1}, etc.
 * @returns Translated string with replaced parameters
 */
export function tp(key: string, ...params: (string | number)[]): string {
    let text = t(key);

    params.forEach((param, index) => {
        text = text.replace(`{${index}}`, String(param));
    });

    return text;
}

/**
 * Check if translation exists
 */
export function hasTranslation(key: string): boolean {
    const keys = key.split('.');
    let result: string | NestedStrings = translations;

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return false;
        }
    }

    return typeof result === 'string';
}

const i18nUtils = {
    setLocale,
    getLocale,
    loadTranslations,
    t,
    tp,
    hasTranslation,
};

export default i18nUtils;
