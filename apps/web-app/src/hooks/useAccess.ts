/**
 * useAccess Hook - "One Brain, Many Faces" Architecture
 * 
 * Frontend calls backend for access control decisions.
 * Never check roles directly in frontend code.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface AccessCheckResult {
    resource: string;
    allowed: boolean;
    role: string;
    redirect: string;
    message: string;
}

interface VerifyStaffResult {
    isStaff: boolean;
    isAdmin: boolean;
    redirect: string;
    message: string;
}

interface UseAccessCheckResult {
    access: AccessCheckResult | null;
    loading: boolean;
    error: string | null;
    checkAccess: (resource: string) => Promise<AccessCheckResult | null>;
}

interface UseVerifyStaffResult {
    result: VerifyStaffResult | null;
    loading: boolean;
    error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Hook to check access to a specific resource
 * @param resource - Resource to check (e.g., 'staff-dashboard', 'admin-panel')
 */
export function useAccessCheck(resource?: string): UseAccessCheckResult {
    const [access, setAccess] = useState<AccessCheckResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAccess = useCallback(async (resourceToCheck: string): Promise<AccessCheckResult | null> => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('staff_token') || localStorage.getItem('auth_token');

            const response = await fetch(`${API_BASE}/v2/access/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ resource: resourceToCheck })
            });

            const data = await response.json();

            if (data.success) {
                setAccess(data.data);
                return data.data;
            } else {
                setError(data.error || 'ไม่สามารถตรวจสอบสิทธิ์ได้');
                return null;
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            console.error('Access check error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (resource) {
            checkAccess(resource);
        }
    }, [resource, checkAccess]);

    return { access, loading, error, checkAccess };
}

/**
 * Hook to verify if a role is a valid staff role
 * Used after login to determine redirect destination
 * @param role - User role to verify
 */
export function useVerifyStaff(role: string | null): UseVerifyStaffResult {
    const [result, setResult] = useState<VerifyStaffResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!role) return;

        const verifyStaff = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE}/v2/access/verify-staff`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ role })
                });

                const data = await response.json();

                if (data.success) {
                    setResult(data.data);
                } else {
                    setError(data.error || 'ไม่สามารถตรวจสอบสิทธิ์ได้');
                }
            } catch (err) {
                setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
                console.error('Verify staff error:', err);
            } finally {
                setLoading(false);
            }
        };

        verifyStaff();
    }, [role]);

    return { result, loading, error };
}

/**
 * Helper function to verify staff role synchronously (for non-hook usage)
 * Returns redirect path based on role
 */
export async function verifyStaffRole(role: string): Promise<VerifyStaffResult | null> {
    try {
        const response = await fetch(`${API_BASE}/v2/access/verify-staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });

        const data = await response.json();
        return data.success ? data.data : null;
    } catch (err) {
        console.error('Verify staff error:', err);
        return null;
    }
}

/**
 * Staff roles constant (for fallback only - prefer API calls)
 */
export const STAFF_ROLES = ['REVIEWER_AUDITOR', 'SCHEDULER', 'ADMIN', 'SUPER_ADMIN'];
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
