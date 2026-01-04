"use client";

import { LoginState } from '@/hooks/useLogin';

interface LoginOverlaysProps {
    loginState: LoginState;
}

export function LoginOverlays({ loginState }: LoginOverlaysProps) {
    if (loginState === 'loading') {
        return (
            <div className="fixed inset-0 bg-primary-700/95 flex flex-col items-center justify-center z-[9999] animate-fade-in">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-white text-lg font-semibold">กำลังเข้าสู่ระบบ...</p>
                <p className="text-white/70 text-sm mt-2">กรุณารอสักครู่</p>
            </div>
        );
    }

    if (loginState === 'success') {
        return (
            <div className="fixed inset-0 bg-primary-600/97 flex flex-col items-center justify-center z-[9999] animate-fade-in">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17L4 12" />
                    </svg>
                </div>
                <p className="text-white text-xl font-bold">เข้าสู่ระบบสำเร็จ!</p>
                <p className="text-white/80 text-sm mt-2">กำลังพาคุณไปยังหน้าหลัก...</p>
            </div>
        );
    }

    return null;
}
