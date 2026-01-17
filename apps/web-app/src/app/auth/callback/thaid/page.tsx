'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/services/auth-service';

export default function ThaIDCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('กำลังยืนยันตัวตนกับกรมการปกครอง...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code) {
                setError('ไม่พบรหัสยืนยันตัวตน (Authorization Code)');
                return;
            }

            try {
                setStatus('กำลังเชื่อมต่อฐานข้อมูลประชากร...');

                // Use relative path to ensure Next.js Proxy handles it correctly
                // URL: /api/auth-farmer/thaid-callback -> Proxies to Backward:8000/api/auth-farmer/thaid-callback
                const apiUrl = '/api/auth-farmer/thaid-callback';
                console.log(`[ThaID Callback] Exchanging code via: ${apiUrl}`);

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        redirectUri: window.location.origin + '/auth/callback/thaid'
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Identity Verification Failed');
                }

                const data = await response.json();

                if (data.success && data.token) {
                    setStatus('ยืนยันตัวตนสำเร็จ! กำลังเข้าสู่ระบบ...');
                    // Manually save session
                    AuthService.saveSession(data);

                    // Delay slightly for UX
                    setTimeout(() => {
                        window.location.href = '/farmer/dashboard';
                    }, 1000);
                } else {
                    throw new Error('Invalid Response from Server');
                }

            } catch (err: any) {
                console.error('ThaID Login Error:', err);
                setError(err.message || 'การเชื่อมต่อล้มเหลว');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">การยืนยันตัวตนล้มเหลว</h1>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900"
                    >
                        กลับไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a237e] text-white p-4 relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

            <div className="relative z-10 text-center max-w-md">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl animate-bounce">
                    <span className="text-4xl">🇹🇭</span>
                </div>

                <h1 className="text-3xl font-bold mb-4">ThaID Digital ID</h1>
                <p className="text-blue-200 text-lg mb-8 animate-pulse">{status}</p>

                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-white animate-progress-bar w-1/2"></div>
                </div>
            </div>
        </div>
    );
}
