'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CriterionItem {
    id: string;
    code: string;
    label: string;
    description: string;
    isRequired: boolean;
    inputType: string;
}

interface CriteriaCategory {
    category: string;
    categoryTH: string;
    icon: string;
    items: CriterionItem[];
}

interface CriteriaValues {
    [code: string]: {
        checked: boolean;
        note: string;
    };
}

export default function SupplementaryCriteriaPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<CriteriaCategory[]>([]);
    const [values, setValues] = useState<CriteriaValues>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCriteria();
    }, []);

    async function fetchCriteria() {
        try {
            const res = await fetch('/api/proxy/v2/criteria');
            const data = await res.json();

            if (data.success && data.data) {
                setCategories(data.data);

                // Initialize values
                const initialValues: CriteriaValues = {};
                data.data.forEach((cat: CriteriaCategory) => {
                    cat.items.forEach((item) => {
                        initialValues[item.code] = { checked: false, note: '' };
                    });
                });
                setValues(initialValues);
            } else {
                setError('ไม่สามารถโหลดข้อมูลเกณฑ์ได้');
            }
        } catch (err) {
            console.error('Error fetching criteria:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    }

    const handleCheckChange = (code: string) => {
        setValues(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                checked: !prev[code]?.checked
            }
        }));
    };

    const handleNoteChange = (code: string, note: string) => {
        setValues(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                note
            }
        }));
    };

    const handleSkip = async () => {
        setSaving(true);
        try {
            // TODO: Call API to save supplementarySkipped = true
            console.log('Skipping supplementary criteria');
            router.push('/applications/new/success');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // TODO: Call API to save supplementaryCriteria = values
            console.log('Saving supplementary criteria:', values);
            router.push('/applications/new/success');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSaving(false);
        }
    };

    const filledCount = Object.values(values).filter(v => v.checked).length;
    const totalCount = Object.keys(values).length;

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchCriteria}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">เกณฑ์เสริม (ไม่บังคับ)</h2>
                        <p className="text-gray-600">
                            ข้อมูลเพิ่มเติมเหล่านี้จะช่วยเสริมมาตรฐานการผลิตของคุณ
                            <span className="font-medium text-blue-600"> หากไม่มี หรือไม่เข้าใจ สามารถข้ามขั้นตอนนี้ได้</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg p-4 mb-6 border shadow-sm">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">กรอกไปแล้ว</span>
                    <span className="font-bold text-blue-600">{filledCount} / {totalCount} รายการ</span>
                </div>
            </div>

            {/* Dynamic Criteria Categories */}
            {categories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <p className="text-gray-500">ยังไม่มีเกณฑ์เสริมในระบบ</p>
                    <button
                        onClick={handleSkip}
                        className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        ข้ามขั้นตอนนี้
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {categories.map((category) => (
                        <div key={category.category} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-xl">{category.icon}</span>
                                    {category.categoryTH || category.category}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {category.items.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <label className="flex items-start gap-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={values[item.code]?.checked || false}
                                                onChange={() => handleCheckChange(item.code)}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">
                                                    {item.label}
                                                    {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                </div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500">{item.description}</div>
                                                )}

                                                {values[item.code]?.checked && (
                                                    <div className="mt-3">
                                                        <input
                                                            type="text"
                                                            placeholder="หมายเหตุหรือเลขที่เอกสาร (ถ้ามี)"
                                                            value={values[item.code]?.note || ''}
                                                            onChange={(e) => handleNoteChange(item.code, e.target.value)}
                                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <button
                        onClick={handleSkip}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        ข้ามขั้นตอนนี้
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                บันทึกและดำเนินการต่อ
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
