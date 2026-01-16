// File: src/components/AuthHealthIndicator.tsx
"use client";

import { useAuthHealth } from '@/hooks/useAuthHealth';

export function AuthHealthIndicator() {
  const { health, loading, error, isHealthy } = useAuthHealth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <span>กำลังตรวจสอบระบบ...</span>
      </div>
    );
  }

  if (error || !isHealthy) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span>ระบบ Authentication มีปัญหา</span>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
        >
          รีเฟรช
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span>ระบบ Authentication ปกติ</span>
    </div>
  );
}
