"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient as api } from '@/lib/api';

// Role labels
export const ROLE_LABELS: Record<string, { label: string; icon: string }> = {
    REVIEWER_AUDITOR: { label: "ผู้ตรวจเอกสาร/ตรวจประเมิน", icon: "📋" },
    SCHEDULER: { label: "ผู้จัดตารางนัดหมาย", icon: "📆" },
    ACCOUNTANT: { label: "เจ้าหน้าที่การเงิน", icon: "💰" },
    ADMIN: { label: "ผู้ดูแลระบบ", icon: "⚙️" },
    SUPER_ADMIN: { label: "ผู้ดูแลระบบสูงสุด", icon: "👑" },
    reviewer: { label: "ผู้ตรวจสอบ", icon: "📋" },
    manager: { label: "ผู้จัดการ", icon: "👔" },
    inspector: { label: "ผู้ตรวจประเมิน", icon: "🔍" },
};

export interface StaffUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

export interface PendingItem {
    id: string;
    applicantName: string;
    plantType: string;
    status: string;
    submittedAt: string;
    submissionCount?: number;
    waitTime: string;
}

export interface DashboardStats {
    pendingReview: number;
    pendingAudit: number;
    pendingPayment: number;
    completed: number;
}

export interface UseStaffDashboardReturn {
    user: StaffUser | null;
    pendingItems: PendingItem[];
    stats: DashboardStats;
    isLoading: boolean;
    error: string | null;

    fetchData: () => Promise<void>;
    handleLogout: () => Promise<void>;
    getWaitTime: (submittedAt: string) => string;
    getStatusBadge: (status: string) => { bg: string; text: string; label: string };
}

/**
 * useStaffDashboard Hook
 * 🍎 Apple Single Responsibility: Staff dashboard data management
 */
export function useStaffDashboard(): UseStaffDashboardReturn {
    const router = useRouter();
    const [user, setUser] = useState<StaffUser | null>(null);
    const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        pendingReview: 0,
        pendingAudit: 0,
        pendingPayment: 0,
        completed: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Calculate wait time from submission
     */
    const getWaitTime = useCallback((submittedAt: string): string => {
        const submitted = new Date(submittedAt);
        const now = new Date();
        const days = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));

        if (days === 0) return "วันนี้";
        if (days === 1) return "1 วัน";
        if (days < 7) return `${days} วัน`;
        if (days < 30) return `${Math.floor(days / 7)} สัปดาห์`;
        return `${Math.floor(days / 30)} เดือน`;
    }, []);

    /**
     * Get status badge styling
     */
    const getStatusBadge = useCallback((status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            SUBMITTED: { bg: "#FEF3C7", text: "#92400E", label: "รอตรวจสอบ" },
            UNDER_REVIEW: { bg: "#DBEAFE", text: "#1E40AF", label: "กำลังตรวจ" },
            PENDING_PAYMENT: { bg: "#FCE7F3", text: "#9D174D", label: "รอชำระเงิน" },
            PAID: { bg: "#D1FAE5", text: "#065F46", label: "ชำระแล้ว" },
            PENDING_AUDIT: { bg: "#FED7AA", text: "#9A3412", label: "รอตรวจประเมิน" },
            APPROVED: { bg: "#D1FAE5", text: "#065F46", label: "อนุมัติ" },
            REJECTED: { bg: "#FEE2E2", text: "#991B1B", label: "ไม่อนุมัติ" },
        };
        return badges[status] || { bg: "#F3F4F6", text: "#374151", label: status };
    }, []);

    /**
     * Fetch dashboard data
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch staff profile
            const userResult = await api.get('/dtam/me') as any;
            if (!userResult.success) {
                router.push('/staff/login');
                return;
            }
            setUser(userResult.data?.user);

            // Fetch pending applications
            const appsResult = await api.get('/applications?status=SUBMITTED,UNDER_REVIEW,PENDING_PAYMENT,PENDING_AUDIT') as any;
            if (appsResult.success && appsResult.data?.applications) {
                const items = appsResult.data.applications.map((app: any) => ({
                    id: app.applicationNumber || app.id,
                    applicantName: app.farmer?.firstName
                        ? `${app.farmer.firstName} ${app.farmer.lastName || ''}`
                        : app.farmer?.companyName || 'ไม่ระบุ',
                    plantType: app.formData?.plantType || 'กัญชง',
                    status: app.status,
                    submittedAt: app.createdAt,
                    submissionCount: app.rejectCount ? app.rejectCount + 1 : 1,
                    waitTime: getWaitTime(app.createdAt),
                }));
                setPendingItems(items);

                // Calculate stats
                const newStats = {
                    pendingReview: items.filter((i: PendingItem) =>
                        i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW'
                    ).length,
                    pendingAudit: items.filter((i: PendingItem) =>
                        i.status === 'PENDING_AUDIT'
                    ).length,
                    pendingPayment: items.filter((i: PendingItem) =>
                        i.status === 'PENDING_PAYMENT'
                    ).length,
                    completed: 0, // Would need separate query
                };
                setStats(newStats);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            if (err.status === 401) {
                router.push('/staff/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router, getWaitTime]);

    /**
     * Handle logout
     */
    const handleLogout = useCallback(async () => {
        try {
            await api.post('/dtam/logout', {});
        } catch {
            // Ignore logout errors
        }
        document.cookie = 'dtam_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/staff/login');
    }, [router]);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        user, pendingItems, stats, isLoading, error,
        fetchData, handleLogout, getWaitTime, getStatusBadge,
    };
}
