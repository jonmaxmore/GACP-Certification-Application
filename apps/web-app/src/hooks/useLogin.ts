"use client";

import { useState } from 'react';
import { formatThaiId } from '@/utils/thai-id-validator';

export type LoginState = 'idle' | 'loading' | 'success' | 'error';

export interface UseLoginReturn {
    // State
    accountType: string;
    identifier: string;
    password: string;
    showPassword: boolean;
    isLoading: boolean;
    loginState: LoginState;
    error: string;
    rememberMe: boolean;
    capsLockOn: boolean;

    // Setters
    setAccountType: (type: string) => void;
    setIdentifier: (value: string) => void;
    setPassword: (value: string) => void;
    setShowPassword: (show: boolean) => void;
    setRememberMe: (remember: boolean) => void;
    setCapsLockOn: (isOn: boolean) => void;

    // Actions
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    formatIdentifier: (value: string) => string;
}

/**
 * useLogin Hook
 * 🍎 Apple Single Responsibility: Handles all login logic
 */
export function useLogin(): UseLoginReturn {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginState, setLoginState] = useState<LoginState>('idle');
    const [error, setError] = useState("");
    const [capsLockOn, setCapsLockOn] = useState(false);

    // Initialize with lazy state from localStorage
    const [accountType, setAccountType] = useState(() => {
        if (typeof window !== 'undefined') {
            const remembered = localStorage.getItem("remember_login");
            if (remembered) {
                try {
                    const data = JSON.parse(remembered);
                    return data.accountType || "INDIVIDUAL";
                } catch { }
            }
        }
        return "INDIVIDUAL";
    });
    
    const [identifier, setIdentifier] = useState(() => {
        if (typeof window !== 'undefined') {
            const remembered = localStorage.getItem("remember_login");
            if (remembered) {
                try {
                    const data = JSON.parse(remembered);
                    return data.identifier || "";
                } catch { }
            }
        }
        return "";
    });
    
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("remember_login") !== null;
        }
        return false;
    });

    const formatIdentifier = (value: string): string => {
        return formatThaiId(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setLoginState('loading');

        // Input sanitization
        const cleanIdentifier = identifier.replace(/-/g, "").replace(/[<>'"&]/g, "");
        const cleanPassword = password.trim();

        // Validation
        if (!cleanIdentifier || cleanIdentifier.length < 10) {
            setError("กรุณากรอกเลขประจำตัวให้ครบถ้วน (อย่างน้อย 10 หลัก)");
            setIsLoading(false);
            setLoginState('error');
            return;
        }
        if (!cleanPassword || cleanPassword.length < 8) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            setIsLoading(false);
            setLoginState('error');
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('/api/auth-farmer/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountType,
                    identifier: cleanIdentifier,
                    password: cleanPassword,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (!result.success) {
                let errorMsg = result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
                if (response.status === 401) {
                    errorMsg = "เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
                } else if (response.status === 429) {
                    errorMsg = "มีการเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณารอ 5 นาทีแล้วลองใหม่";
                } else if (response.status >= 500) {
                    errorMsg = "เซิร์ฟเวอร์มีปัญหาชั่วคราว กรุณาลองใหม่ในอีกสักครู่";
                }
                setError(errorMsg);
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            const responseData = result.data?.data || result.data;
            const token = responseData?.tokens?.accessToken || responseData?.token;

            if (!token) {
                setError("ไม่พบข้อมูล Token จากเซิร์ฟเวอร์ กรุณาติดต่อผู้ดูแลระบบ");
                setIsLoading(false);
                setLoginState('error');
                return;
            }

            localStorage.setItem("user", JSON.stringify(responseData?.user || {}));

            if (rememberMe) {
                localStorage.setItem("remember_login", JSON.stringify({ accountType, identifier: cleanIdentifier }));
            } else {
                localStorage.removeItem("remember_login");
            }

            setIsLoading(false);
            setLoginState('success');

            setTimeout(() => {
                window.location.href = "/farmer/dashboard";
            }, 1500);

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError("การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
            } else {
                setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง");
            }
            setIsLoading(false);
            setLoginState('error');
        }
    };

    return {
        accountType, identifier, password, showPassword,
        isLoading, loginState, error, rememberMe, capsLockOn,
        setAccountType, setIdentifier, setPassword, setShowPassword,
        setRememberMe, setCapsLockOn,
        handleSubmit, formatIdentifier,
    };
}
