'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useWizardStore } from '../hooks/useWizardStore';

export const StepSuccess = () => {
    const router = useRouter();
    const { state } = useWizardStore();

    // Use actual Application ID/Number from store (set during StepReview submission)
    // Fallback to "PENDING" if undefined (should not happen in happy path)
    const appId = state.applicationId || `GACP-TEMP-${new Date().getTime().toString().slice(-4)}`;

    return (
        <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <span className="text-4xl">🎉</span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">ส่งคำขอสำเร็จ!</h2>
            <p className="text-gray-500 mb-8 mt-2 text-center max-w-md">
                Submission Successful
                <br />
                ขอบคุณที่สมัครเข้าร่วมโครงการ GACP
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center mb-6 w-full max-w-sm">
                <div className="text-sm text-gray-500 mb-1">เลขที่คำขอ (Application Case ID)</div>
                <div className="text-2xl font-mono font-bold text-emerald-600 mb-2">{appId}</div>
                <div className="text-xs text-gray-400 pb-4 border-b border-gray-200">โปรดบันทึกไว้เพื่อติดตามสถานะ</div>

                <div className="pt-4 text-left">
                    <p className="text-xs font-bold text-gray-600 mb-2">ข้อมูลงานวิจัย (Research Info):</p>
                    <p className="text-xs text-gray-500 mb-1">• โครงการ: พัฒนามาตรฐาน GACP สมุนไพรไทย</p>
                    <p className="text-xs text-gray-500 mb-1">• ผู้วิจัย: กรมการแพทย์แผนไทยฯ</p>
                    <p className="text-xs text-gray-500">• ติดต่อ: support@gacp-research.com</p>
                </div>
            </div>

            <div className="space-y-3 w-full max-w-xs">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                    กลับสู่หน้าหลัก (Dashboard)
                </button>
                <button
                    onClick={() => window.print()}
                    className="w-full py-3 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                    พิมพ์ใบเสร็จ/ใบสมัคร
                </button>
            </div>
        </div>
    );
};
