'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SupplementaryCriteria {
    // การทดสอบและตรวจสอบ
    contaminantTesting: boolean;
    contaminantTestingDoc: string;
    identityTesting: boolean;
    identityTestingDoc: string;
    moistureTesting: boolean;
    moistureTestingDoc: string;

    // ขั้นตอนการผลิต
    postHarvestProcessing: boolean;
    postHarvestProcessingDoc: string;
    masterManufacturingRecord: boolean;
    masterManufacturingRecordDoc: string;

    // แหล่งที่มา
    seedSourceDocumentation: boolean;
    seedSourceDocumentationDoc: string;
    propagationRecords: boolean;
    propagationRecordsDoc: string;

    // สุขอนามัยและความปลอดภัย
    personnelHygiene: boolean;
    personnelHygieneDoc: string;
    productRecallProcedure: boolean;
    productRecallProcedureDoc: string;
    complaintRecords: boolean;
    complaintRecordsDoc: string;
}

const defaultCriteria: SupplementaryCriteria = {
    contaminantTesting: false,
    contaminantTestingDoc: '',
    identityTesting: false,
    identityTestingDoc: '',
    moistureTesting: false,
    moistureTestingDoc: '',
    postHarvestProcessing: false,
    postHarvestProcessingDoc: '',
    masterManufacturingRecord: false,
    masterManufacturingRecordDoc: '',
    seedSourceDocumentation: false,
    seedSourceDocumentationDoc: '',
    propagationRecords: false,
    propagationRecordsDoc: '',
    personnelHygiene: false,
    personnelHygieneDoc: '',
    productRecallProcedure: false,
    productRecallProcedureDoc: '',
    complaintRecords: false,
    complaintRecordsDoc: '',
};

const criteriaItems = [
    {
        category: 'การทดสอบและตรวจสอบ',
        icon: '🧪',
        items: [
            { key: 'contaminantTesting', label: 'ผลตรวจสารปนเปื้อน', description: 'รายงานการตรวจสารปนเปื้อน เช่น โลหะหนัก ยาฆ่าแมลง' },
            { key: 'identityTesting', label: 'ผลตรวจอัตลักษณ์', description: 'รายงานยืนยันชนิดพืช/สายพันธุ์' },
            { key: 'moistureTesting', label: 'ผลตรวจความชื้น', description: 'รายงานวัดความชื้นผลิตภัณฑ์' },
        ]
    },
    {
        category: 'ขั้นตอนการผลิต',
        icon: '⚙️',
        items: [
            { key: 'postHarvestProcessing', label: 'บันทึกขั้นตอนหลังเก็บเกี่ยว', description: 'เอกสารกระบวนการอบแห้ง บรรจุ เก็บรักษา' },
            { key: 'masterManufacturingRecord', label: 'บันทึกการผลิตหลัก', description: 'เอกสาร Master Manufacturing Record' },
        ]
    },
    {
        category: 'แหล่งที่มาเมล็ดพันธุ์',
        icon: '🌱',
        items: [
            { key: 'seedSourceDocumentation', label: 'เอกสารแหล่งที่มาเมล็ดพันธุ์', description: 'ใบรับรองแหล่งที่มา/ใบเสร็จซื้อเมล็ด' },
            { key: 'propagationRecords', label: 'บันทึกการขยายพันธุ์', description: 'เอกสารวิธีการขยายพันธุ์' },
        ]
    },
    {
        category: 'สุขอนามัยและความปลอดภัย',
        icon: '🛡️',
        items: [
            { key: 'personnelHygiene', label: 'เอกสารสุขอนามัยพนักงาน', description: 'ใบรับรองสุขภาพ/การอบรมสุขอนามัย' },
            { key: 'productRecallProcedure', label: 'แผนการเรียกคืนสินค้า', description: 'เอกสารขั้นตอนเรียกคืนสินค้า' },
            { key: 'complaintRecords', label: 'ระบบบันทึกข้อร้องเรียน', description: 'เอกสารขั้นตอนรับเรื่องร้องเรียน' },
        ]
    },
];

export default function SupplementaryCriteriaPage() {
    const router = useRouter();
    const [criteria, setCriteria] = useState<SupplementaryCriteria>(defaultCriteria);
    const [saving, setSaving] = useState(false);

    const handleCheckboxChange = (key: string) => {
        setCriteria(prev => ({
            ...prev,
            [key]: !prev[key as keyof SupplementaryCriteria]
        }));
    };

    const handleDocChange = (key: string, value: string) => {
        setCriteria(prev => ({
            ...prev,
            [`${key}Doc`]: value
        }));
    };

    const handleSkip = async () => {
        setSaving(true);
        try {
            // Save as skipped
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
            // Save criteria
            // TODO: Call API to save supplementaryCriteria = criteria
            console.log('Saving supplementary criteria:', criteria);
            router.push('/applications/new/success');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setSaving(false);
        }
    };

    const filledCount = Object.entries(criteria).filter(
        ([key, value]) => !key.endsWith('Doc') && value === true
    ).length;

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
                    <span className="font-bold text-blue-600">{filledCount} / {criteriaItems.reduce((acc, cat) => acc + cat.items.length, 0)} รายการ</span>
                </div>
            </div>

            {/* Criteria Categories */}
            <div className="space-y-6">
                {criteriaItems.map((category, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <span className="text-xl">{category.icon}</span>
                                {category.category}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {category.items.map((item) => (
                                <div key={item.key} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <label className="flex items-start gap-4 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={criteria[item.key as keyof SupplementaryCriteria] as boolean}
                                            onChange={() => handleCheckboxChange(item.key)}
                                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{item.label}</div>
                                            <div className="text-sm text-gray-500">{item.description}</div>

                                            {criteria[item.key as keyof SupplementaryCriteria] && (
                                                <div className="mt-3">
                                                    <input
                                                        type="text"
                                                        placeholder="หมายเหตุหรือเลขที่เอกสาร (ถ้ามี)"
                                                        value={criteria[`${item.key}Doc` as keyof SupplementaryCriteria] as string}
                                                        onChange={(e) => handleDocChange(item.key, e.target.value)}
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
