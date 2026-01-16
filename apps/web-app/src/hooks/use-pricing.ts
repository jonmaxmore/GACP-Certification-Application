/**
 * usePricing Hook - "One Brain, Many Faces" Architecture
 * 
 * Fetches pricing information from backend API
 * instead of hardcoding prices in frontend.
 */

"use client";

import { useState, useEffect } from "react";

export interface PricingFees {
    applicationFee: number;
    inspectionFee: number;
    renewalFee: number;
    expediteFee: number;
    currency: string;
    vatRate: number;
    lastUpdated: string;
    validUntil: string;
}

export interface InvoicePhase {
    phase: number;
    description: string;
    amount: number;
    currency: string;
}

interface UsePricingResult {
    fees: PricingFees | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UseInvoiceResult {
    invoice: InvoicePhase | null;
    loading: boolean;
    error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Hook to fetch platform fees from backend
 */
export function usePricing(): UsePricingResult {
    const [fees, setFees] = useState<PricingFees | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFees = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/pricing/fees`);
            const data = await response.json();

            if (data.success) {
                setFees(data.data);
            } else {
                setError(data.error || 'ไม่สามารถดึงข้อมูลราคาได้');
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            console.error('Pricing API error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    return { fees, loading, error, refetch: fetchFees };
}

/**
 * Hook to fetch invoice for specific payment phase
 */
export function useInvoice(phase: 'phase1' | 'phase2'): UseInvoiceResult {
    const [invoice, setInvoice] = useState<InvoicePhase | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE}/pricing/invoice/${phase}`);
                const data = await response.json();

                if (data.success) {
                    setInvoice(data.data);
                } else {
                    setError(data.error || 'ไม่สามารถดึงข้อมูลใบแจ้งหนี้ได้');
                }
            } catch (err) {
                setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
                console.error('Invoice API error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [phase]);

    return { invoice, loading, error };
}

/**
 * Default fees for fallback when API is unavailable
 * (kept for graceful degradation, but API should be primary source)
 */
export const DEFAULT_FEES: PricingFees = {
    applicationFee: 5000,
    inspectionFee: 25000,
    renewalFee: 15000,
    expediteFee: 10000,
    currency: 'THB',
    vatRate: 0,
    lastUpdated: '2025-01-01',
    validUntil: '2025-12-31',
};

/**
 * Generate quotation items from pricing data
 */
export function generateQuotationItems(fees: PricingFees | null, includeInspection: boolean = false) {
    const f = fees || DEFAULT_FEES;

    const items = [
        {
            description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น',
            quantity: 1,
            unitPrice: f.applicationFee,
        },
    ];

    if (includeInspection) {
        items.push({
            description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน',
            quantity: 1,
            unitPrice: f.inspectionFee,
        });
    }

    return items;
}

