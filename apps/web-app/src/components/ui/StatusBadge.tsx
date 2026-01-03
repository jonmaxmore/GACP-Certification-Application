"use client";

import React from 'react';

// Status configuration with Thai labels and colors
export const STATUS_CONFIG: Record<string, {
    label: string;
    bg: string;
    text: string;
    icon: string
}> = {
    // Application statuses
    DRAFT: { label: "ร่าง", bg: "#F3F4F6", text: "#374151", icon: "📝" },
    SUBMITTED: { label: "ยื่นคำขอ", bg: "#E0E7FF", text: "#3730A3", icon: "📤" },
    UNDER_REVIEW: { label: "กำลังตรวจสอบ", bg: "#DBEAFE", text: "#1E40AF", icon: "🔍" },
    PENDING_PAYMENT: { label: "รอชำระเงิน", bg: "#FEF3C7", text: "#92400E", icon: "💳" },
    PAID: { label: "ชำระเงินแล้ว", bg: "#D1FAE5", text: "#065F46", icon: "✓" },
    PENDING_AUDIT: { label: "รอตรวจประเมิน", bg: "#E9D5FF", text: "#6B21A8", icon: "📋" },
    AUDIT_SCHEDULED: { label: "นัดตรวจประเมิน", bg: "#FED7AA", text: "#9A3412", icon: "📆" },
    APPROVED: { label: "อนุมัติแล้ว", bg: "#D1FAE5", text: "#065F46", icon: "✅" },
    REJECTED: { label: "ไม่อนุมัติ", bg: "#FEE2E2", text: "#991B1B", icon: "❌" },

    // Payment statuses
    PENDING: { label: "รอดำเนินการ", bg: "#FEF3C7", text: "#92400E", icon: "⏳" },
    COMPLETED: { label: "เสร็จสิ้น", bg: "#D1FAE5", text: "#065F46", icon: "✓" },
    CANCELLED: { label: "ยกเลิก", bg: "#FEE2E2", text: "#991B1B", icon: "✗" },

    // Certificate statuses
    ACTIVE: { label: "ใช้งาน", bg: "#D1FAE5", text: "#065F46", icon: "✓" },
    EXPIRED: { label: "หมดอายุ", bg: "#FEE2E2", text: "#991B1B", icon: "⚠️" },
    REVOKED: { label: "ถูกเพิกถอน", bg: "#FEE2E2", text: "#991B1B", icon: "❌" },
};

interface StatusBadgeProps {
    status: string;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * StatusBadge Component
 * 🍎 Apple Design: Consistent status display across the app
 */
export function StatusBadge({
    status,
    showIcon = true,
    size = 'md',
    className = ''
}: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || {
        label: status,
        bg: "#F3F4F6",
        text: "#374151",
        icon: "•"
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
            style={{
                backgroundColor: config.bg,
                color: config.text
            }}
        >
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}

/**
 * Get status label only
 */
export function getStatusLabel(status: string): string {
    return STATUS_CONFIG[status]?.label || status;
}

/**
 * Get status color for charts/graphs
 */
export function getStatusColor(status: string): string {
    return STATUS_CONFIG[status]?.bg || "#F3F4F6";
}

export default StatusBadge;
