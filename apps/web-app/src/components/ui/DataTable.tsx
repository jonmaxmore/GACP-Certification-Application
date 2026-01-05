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
 * Eco-Professional with Pure Tailwind CSS
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
            <div className="flex justify-center items-center py-16 text-slate-500">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="animate-pulse">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-16 px-5 text-slate-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                </div>
                <p>{emptyMessage}</p>
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
        const cursorClass = linkPrefix || onRowClick ? 'cursor-pointer' : '';

        if (linkPrefix) {
            return (
                <Link href={`${linkPrefix}/${item.id}`} className="contents">
                    <tr className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/30 ${cursorClass}`}>
                        {children}
                    </tr>
                </Link>
            );
        }

        return (
            <tr
                className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/30 ${cursorClass}`}
                onClick={() => onRowClick?.(item)}
            >
                {children}
            </tr>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                                style={column.width ? { width: column.width } : undefined}
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
                                    className="px-4 py-3.5 text-sm text-slate-800"
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
