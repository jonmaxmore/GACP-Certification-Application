"use client";

import { useState, useCallback } from 'react';
import { apiClient as api } from '@/lib/api';

// Account types
export const ACCOUNT_TYPES = [
    { type: "INDIVIDUAL", label: "บุคคลธรรมดา", subtitle: "เกษตรกรรายย่อย", idLabel: "เลขบัตรประชาชน 13 หลัก", idHint: "X-XXXX-XXXXX-XX-X" },
    { type: "JURISTIC", label: "นิติบุคคล", subtitle: "บริษัท / ห้างหุ้นส่วน", idLabel: "เลขทะเบียนนิติบุคคล", idHint: "0-1055-12345-67-8" },
    { type: "COMMUNITY_ENTERPRISE", label: "วิสาหกิจชุมชน", subtitle: "กลุ่มเกษตรกร", idLabel: "เลขทะเบียนวิสาหกิจชุมชน", idHint: "XXXX-XXXX-XXX" },
];

export const STEPS = ["ยินยอม PDPA", "ประเภทบัญชี", "ยืนยันตัวตน", "ข้อมูลส่วนตัว", "ตั้งรหัสผ่าน"];

export interface RegistrationData {
    accountType: string;
    agreedPDPA: boolean;
    identifier: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    companyName: string;
    communityName: string;
    password: string;
    confirmPassword: string;
    // Optional fields
    email?: string;
    address?: string;
    province?: string;
}

export interface UseRegistrationReturn {
    step: number;
    data: RegistrationData;
    errors: Record<string, string>;
    isLoading: boolean;
    isCheckingId: boolean;

    setStep: (step: number) => void;
    updateField: (field: keyof RegistrationData, value: string | boolean) => void;
    validateField: (field: string, value: string) => Promise<string>;
    canProceed: () => boolean;
    handleSubmit: () => Promise<boolean>;
    getPasswordStrength: (pwd: string) => { level: number; label: string; color: string };
    validateThaiId: (id: string) => boolean;
}

/**
 * useRegistration Hook
 * 🍎 Apple Single Responsibility: All registration logic
 */
export function useRegistration(): UseRegistrationReturn {
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [data, setData] = useState<RegistrationData>({
        accountType: 'INDIVIDUAL',
        agreedPDPA: false,
        identifier: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        companyName: '',
        communityName: '',
        password: '',
        confirmPassword: '',
    });

    const updateField = useCallback((field: keyof RegistrationData, value: string | boolean) => {
        setData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    /**
     * Thai ID Checksum Validation (Modulo 11)
     */
    const validateThaiId = useCallback((id: string): boolean => {
        const cleanId = id.replace(/-/g, '');
        if (cleanId.length !== 13 || !/^\d+$/.test(cleanId)) return false;

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleanId[i]) * (13 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return parseInt(cleanId[12]) === checkDigit;
    }, []);

    /**
     * Password Strength Calculator
     */
    const getPasswordStrength = useCallback((pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        const levels = [
            { level: 0, label: "อ่อนมาก", color: "#EF4444" },
            { level: 1, label: "อ่อน", color: "#F97316" },
            { level: 2, label: "ปานกลาง", color: "#EAB308" },
            { level: 3, label: "แข็งแรง", color: "#22C55E" },
            { level: 4, label: "แข็งแรงมาก", color: "#16A34A" },
        ];

        return levels[Math.min(score, 4)];
    }, []);

    /**
     * Field Validation with API check
     */
    const validateField = useCallback(async (field: string, value: string): Promise<string> => {
        switch (field) {
            case 'identifier':
                const cleanId = value.replace(/-/g, '');
                if (data.accountType !== 'COMMUNITY_ENTERPRISE') {
                    if (cleanId.length !== 13) return 'ต้องมี 13 หลัก';
                    if (data.accountType === 'INDIVIDUAL' && !validateThaiId(value)) {
                        return 'เลขบัตรประชาชนไม่ถูกต้อง';
                    }
                }
                // Check availability via API
                setIsCheckingId(true);
                try {
                    const result = await api.post('/auth/check-identifier', {
                        identifier: cleanId,
                        accountType: data.accountType
                    }) as any;
                    if (result.success && !result.data?.available) {
                        return result.data?.error || 'ข้อมูลนี้ถูกลงทะเบียนแล้ว';
                    }
                } catch {
                    // Ignore API errors, continue with form
                } finally {
                    setIsCheckingId(false);
                }
                return '';

            case 'phoneNumber':
                if (!/^0\d{9}$/.test(value.replace(/-/g, ''))) {
                    return 'เบอร์โทรไม่ถูกต้อง (10 หลัก เริ่มด้วย 0)';
                }
                return '';

            case 'password':
                if (value.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
                if (!/[A-Z]/.test(value)) return 'ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว';
                if (!/[a-z]/.test(value)) return 'ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว';
                if (!/\d/.test(value)) return 'ต้องมีตัวเลขอย่างน้อย 1 ตัว';
                return '';

            case 'confirmPassword':
                if (value !== data.password) return 'รหัสผ่านไม่ตรงกัน';
                return '';

            default:
                return '';
        }
    }, [data.accountType, data.password, validateThaiId]);

    /**
     * Check if current step can proceed
     */
    const canProceed = useCallback((): boolean => {
        switch (step) {
            case 0: return data.agreedPDPA;
            case 1: return !!data.accountType;
            case 2: return data.identifier.replace(/-/g, '').length >= 10 && !errors.identifier;
            case 3:
                if (data.accountType === 'INDIVIDUAL') {
                    return !!data.firstName && !!data.lastName && !!data.phoneNumber;
                } else if (data.accountType === 'JURISTIC') {
                    return !!data.companyName && !!data.phoneNumber;
                } else {
                    return !!data.communityName && !!data.phoneNumber;
                }
            case 4:
                return data.password.length >= 8 &&
                    data.password === data.confirmPassword &&
                    !errors.password;
            default: return false;
        }
    }, [step, data, errors]);

    /**
     * Submit Registration
     */
    const handleSubmit = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);

        // Sanitize inputs
        const sanitize = (str: string) => str.replace(/[<>'"&]/g, '');

        const payload = {
            accountType: data.accountType,
            identifier: data.identifier.replace(/-/g, ''),
            password: data.password,
            phoneNumber: data.phoneNumber.replace(/-/g, ''),
            ...(data.accountType === 'INDIVIDUAL' && {
                firstName: sanitize(data.firstName),
                lastName: sanitize(data.lastName),
                idCard: data.identifier.replace(/-/g, ''),
            }),
            ...(data.accountType === 'JURISTIC' && {
                companyName: sanitize(data.companyName),
                taxId: data.identifier.replace(/-/g, ''),
            }),
            ...(data.accountType === 'COMMUNITY_ENTERPRISE' && {
                communityName: sanitize(data.communityName),
                communityRegistrationNo: data.identifier.replace(/-/g, ''),
            }),
        };

        try {
            const result = await api.post('/auth/register', payload) as any;
            if (result.success) {
                return true;
            } else {
                setErrors({ submit: result.error || 'เกิดข้อผิดพลาด' });
                return false;
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    return {
        step, data, errors, isLoading, isCheckingId,
        setStep, updateField, validateField, canProceed,
        handleSubmit, getPasswordStrength, validateThaiId,
    };
}
