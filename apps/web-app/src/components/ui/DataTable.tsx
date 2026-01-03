"use client";

import React from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    linkPrefix?: string;
    onRowClick?: (item: T) => void;
}

/**
 * DataTable Component
 * 🍎 Apple Design: Consistent table styling across staff pages
 */
export function DataTable<T extends { id: string }>({
    columns,
    data,
    loading = false,
    emptyMessage = "ไม่พบข้อมูล",
    linkPrefix,
    onRowClick,
}: DataTableProps<T>) {

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '60px 0',
                color: '#6B7280',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: '3px solid #E5E7EB',
                        borderTopColor: '#3B82F6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    กำลังโหลด...
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6B7280',
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                {emptyMessage}
            </div>
        );
    }

    const renderCell = (item: T, column: TableColumn<T>) => {
        if (column.render) {
            return column.render(item);
        }

        const value = item[column.key as keyof T];

        // Auto-detect status fields
        if (column.key === 'status' && typeof value === 'string') {
            return <StatusBadge status={value} size="sm" />;
        }

        return String(value ?? '-');
    };

    const RowWrapper = ({ item, children }: { item: T; children: React.ReactNode }) => {
        const rowStyle = {
            borderBottom: '1px solid #E5E7EB',
            transition: 'background 0.15s',
            cursor: linkPrefix || onRowClick ? 'pointer' : 'default',
        };

        if (linkPrefix) {
            return (
                <Link
                    href={`${linkPrefix}/${item.id}`}
                    style={{ display: 'contents' }}
                >
                    <tr style={rowStyle} className="hover:bg-gray-50">
                        {children}
                    </tr>
                </Link>
            );
        }

        return (
            <tr
                style={rowStyle}
                className="hover:bg-gray-50"
                onClick={() => onRowClick?.(item)}
            >
                {children}
            </tr>
        );
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{
                        backgroundColor: '#F9FAFB',
                        borderBottom: '2px solid #E5E7EB',
                    }}>
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                style={{
                                    padding: '12px 16px',
                                    textAlign: 'left',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    color: '#374151',
                                    width: column.width,
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <RowWrapper key={item.id} item={item}>
                            {columns.map((column) => (
                                <td
                                    key={String(column.key)}
                                    style={{
                                        padding: '14px 16px',
                                        fontSize: 14,
                                        color: '#1F2937',
                                    }}
                                >
                                    {renderCell(item, column)}
                                </td>
                            ))}
                        </RowWrapper>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
