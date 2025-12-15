/**
 * Shared Utils - Common Functions
 */

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
    }).format(amount);
}

export function isValidEmail(email: string): boolean {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

export function isValidThaiId(id: string): boolean {
    const clean = id.replace(/-/g, '');
    return /^\d{13}$/.test(clean);
}
