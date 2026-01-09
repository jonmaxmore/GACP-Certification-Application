'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Requirement {
    id: string;
    category: string;
    name: string;
    nameTH: string;
    description: string;
}

interface Standard {
    id: string;
    code: string;
    name: string;
    nameTH: string;
    description: string;
    targetMarket: string;
    requirements: Requirement[];
}

// Detailed information for each standard
const STANDARD_DETAILS: Record<string, {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    fullName: string;
    organization: string;
    targetRegion: string;
    overview: string;
    keyPoints: string[];
    documents: string[];
    tips: string;
}> = {
    'THAI_GACP': {
        icon: '🇹🇭',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        fullName: 'มาตรฐาน GACP ประเทศไทย',
        organization: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (กรมแพทย์แผนไทยฯ)',
        targetRegion: 'ตลาดในประเทศไทย',
        overview: 'มาตรฐานหลักสำหรับการผลิตพืชสมุนไพรในประเทศไทย กำหนดโดยกรมแพทย์แผนไทยฯ เพื่อควบคุมคุณภาพและความปลอดภัยของสมุนไพรไทย',
        keyPoints: [
            'การขึ้นทะเบียนเกษตรกรกับสำนักงานเกษตรจังหวัด/อำเภอ',
            'การเลือกพื้นที่ปลูกที่เหมาะสม ไม่มีสารปนเปื้อน',
            'การใช้น้ำที่สะอาดและปลอดภัย',
            'การบันทึกข้อมูลการผลิตอย่างเป็นระบบ',
            'การจัดการหลังการเก็บเกี่ยวอย่างถูกสุขลักษณะ'
        ],
        documents: [
            'ใบทะเบียนเกษตรกร (ทบก.1)',
            'เอกสารสิทธิ์ที่ดินหรือสัญญาเช่า',
            'ผลตรวจคุณภาพน้ำ',
            'บันทึกการใช้ปุ๋ยและสารเคมี',
            'ใบรับรองการอบรม GACP'
        ],
        tips: 'เริ่มต้นด้วยการขึ้นทะเบียนเกษตรกรและเข้าร่วมอบรม GACP กับกรมแพทย์แผนไทยฯ'
    },
    'WHO': {
        icon: '🌍',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        fullName: 'WHO Guidelines on GACP for Medicinal Plants',
        organization: 'World Health Organization (องค์การอนามัยโลก)',
        targetRegion: 'ตลาดโลก (Global Market)',
        overview: 'แนวทางสากลสำหรับการผลิตพืชสมุนไพรที่ดี ประกาศใช้ตั้งแต่ปี 2003 เป็นมาตรฐานอ้างอิงหลักสำหรับการส่งออกไปทั่วโลก โดยเฉพาะยุโรปและตะวันออกกลาง',
        keyPoints: [
            'การตรวจวิเคราะห์โลหะหนัก (Arsenic < 4 ppm, Cadmium < 0.3 ppm, Lead < 10 ppm)',
            'การตรวจสารตกค้างกำจัดศัตรูพืช (ตาม Codex Alimentarius)',
            'การควบคุมอะฟลาท็อกซิน (Aflatoxins < 20 ppb)',
            'ระบบตรวจสอบย้อนกลับ (Batch Traceability)',
            'การควบคุมอุณหภูมิและความชื้นในการอบแห้ง'
        ],
        documents: [
            'ผลตรวจโลหะหนัก (Heavy Metals Certificate)',
            'ผลตรวจสารกำจัดศัตรูพืชตกค้าง',
            'ผลตรวจเชื้อจุลินทรีย์',
            'บันทึกการควบคุมการอบแห้ง',
            'Certificate of Analysis (COA) จากห้องแล็บที่ได้รับรอง'
        ],
        tips: 'ควรส่งตัวอย่างตรวจกับห้องปฏิบัติการที่ได้รับการรับรอง ISO 17025'
    },
    'FDA': {
        icon: '🇺🇸',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        fullName: 'FDA cGMP (21 CFR Part 111) + FSMA',
        organization: 'U.S. Food and Drug Administration (อย. สหรัฐอเมริกา)',
        targetRegion: 'สหรัฐอเมริกา',
        overview: 'กฎระเบียบบังคับใช้สำหรับอาหารเสริมและสมุนไพรที่จำหน่ายในสหรัฐฯ ต้องปฏิบัติตาม Current Good Manufacturing Practice (cGMP) และ Food Safety Modernization Act (FSMA)',
        keyPoints: [
            'ลงทะเบียน FDA Facility Registration',
            'จัดทำแผนความปลอดภัยอาหาร (HACCP)',
            'มีระบบควบคุมคุณภาพ (Quality Control)',
            'ผ่าน Foreign Supplier Verification Program (FSVP)',
            'มีสถานที่ผลิตที่เป็นไปตามมาตรฐาน cGMP'
        ],
        documents: [
            'FDA Facility Registration Number',
            'HACCP Plan',
            'บันทึก QC/QA ครบถ้วน',
            'Supplier Qualification Documents',
            'COA สำหรับทุก Batch'
        ],
        tips: 'การส่งออกไปสหรัฐฯ ต้องผ่าน U.S. Importer ที่มี FSVP พร้อม ควรติดต่อกับ FDA Agent'
    },
    'ASEAN': {
        icon: '🌏',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        fullName: 'ASEAN Good Hygiene Practice (GHP)',
        organization: 'ASEAN Secretariat',
        targetRegion: 'ประเทศสมาชิก ASEAN',
        overview: 'มาตรฐานสุขอนามัยที่ดีสำหรับยาแผนโบราณและผลิตภัณฑ์เสริมอาหารในกลุ่มประเทศอาเซียน เน้นการควบคุมสุขอนามัยพนักงานและสถานที่ผลิต',
        keyPoints: [
            'การฝึกอบรมสุขอนามัยพนักงานประจำปี',
            'ระบบควบคุมสัตว์พาหะนำโรค (Pest Control)',
            'การจัดการของเสียอย่างถูกวิธี',
            'บันทึกการทำความสะอาดประจำวัน',
            'แยกพื้นที่บริโภคออกจากพื้นที่ผลิต'
        ],
        documents: [
            'บันทึกการอบรมพนักงาน',
            'สัญญาควบคุมสัตว์พาหะ + แผนผังจุดวางเหยื่อ',
            'บันทึกการทำความสะอาดและฆ่าเชื้อ',
            'ผลตรวจสุขภาพพนักงาน',
            'SOP การจัดการของเสีย'
        ],
        tips: 'มาตรฐาน ASEAN เน้นเรื่องสุขอนามัย สามารถพัฒนาจากมาตรฐานไทยได้ง่าย'
    }
};

export default function Step8InternationalStandards() {
    const router = useRouter();
    const [standards, setStandards] = useState<Standard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

    useEffect(() => {
        fetchStandards();
    }, []);

    async function fetchStandards() {
        try {
            const res = await fetch('/api/standards');
            const data = await res.json();

            if (data.success && data.data) {
                setStandards(data.data);
            } else {
                setError('ไม่สามารถโหลดข้อมูลมาตรฐานได้');
            }
        } catch (err) {
            console.error('Error fetching standards:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    }

    const handleNext = () => {
        router.push('/applications/new/step-9');
    };

    const handleBack = () => {
        router.push('/applications/new/step-7');
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchStandards} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
                    ลองใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                    <span className="text-3xl">📚</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ข้อมูลมาตรฐานสากลสำหรับส่งออก
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    ศึกษาข้อกำหนดและเอกสารที่ต้องเตรียมสำหรับการส่งออกสมุนไพรไปยังตลาดต่างประเทศ
                    <br />
                    <span className="text-indigo-600 font-medium">คลิกที่แต่ละมาตรฐานเพื่อดูรายละเอียด</span>
                </p>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">ทำไมต้องรู้มาตรฐานสากล?</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            หากท่านต้องการส่งออกสมุนไพรไปยังต่างประเทศ การทำความเข้าใจข้อกำหนดของแต่ละตลาดจะช่วยให้ท่าน
                            <strong> เตรียมเอกสารได้ถูกต้อง</strong> และ <strong>หลีกเลี่ยงปัญหาการถูกปฏิเสธที่ด่านศุลกากร</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Standards List - Accordion Style */}
            <div className="space-y-3">
                {standards.map((std) => {
                    const details = STANDARD_DETAILS[std.code];
                    if (!details) return null;

                    const isExpanded = expandedStandard === std.code;

                    return (
                        <div
                            key={std.id}
                            className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${isExpanded ? details.borderColor : 'border-gray-200'
                                }`}
                        >
                            {/* Accordion Header */}
                            <button
                                onClick={() => setExpandedStandard(isExpanded ? null : std.code)}
                                className={`w-full flex items-center justify-between p-5 transition-colors ${isExpanded ? details.bgColor : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{details.icon}</span>
                                    <div className="text-left">
                                        <div className={`text-lg font-bold ${isExpanded ? details.color : 'text-gray-900'}`}>
                                            {details.fullName}
                                        </div>
                                        <div className="text-sm text-gray-600">{details.targetRegion}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${details.bgColor} ${details.color}`}>
                                        {std.requirements.length} ข้อกำหนด
                                    </span>
                                    <svg
                                        className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Accordion Content */}
                            {isExpanded && (
                                <div className="p-5 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                    {/* Organization */}
                                    <div className="mb-5">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">หน่วยงานที่รับผิดชอบ</div>
                                        <div className="text-gray-800 font-medium">{details.organization}</div>
                                    </div>

                                    {/* Overview */}
                                    <div className="mb-5">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ภาพรวม</div>
                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                            {details.overview}
                                        </p>
                                    </div>

                                    {/* Key Points */}
                                    <div className="mb-5">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            🎯 ข้อกำหนดสำคัญที่ต้องเตรียม
                                        </div>
                                        <div className="grid gap-2">
                                            {details.keyPoints.map((point, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className={`w-6 h-6 rounded-full ${details.bgColor} ${details.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-gray-700 text-sm">{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Documents Required */}
                                    <div className="mb-5">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            📄 เอกสารที่ต้องจัดเตรียม
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {details.documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                                                    <svg className={`w-4 h-4 ${details.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-700">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Requirements from API */}
                                    {std.requirements.length > 0 && (
                                        <div className="mb-5">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                📋 รายละเอียดเกณฑ์ตามมาตรฐาน
                                            </div>
                                            <div className="space-y-2">
                                                {std.requirements.map((req) => (
                                                    <div key={req.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                        <div className="flex items-start gap-3">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${details.bgColor} ${details.color}`}>
                                                                {req.category}
                                                            </span>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-gray-900">{req.nameTH}</div>
                                                                <div className="text-sm text-gray-600 mt-0.5">{req.name}</div>
                                                                {req.description && (
                                                                    <p className="text-sm text-gray-500 mt-2 bg-white p-3 rounded border border-gray-100">
                                                                        💡 {req.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    <div className={`p-4 rounded-lg ${details.bgColor} border ${details.borderColor}`}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl">💬</span>
                                            <div>
                                                <div className={`font-semibold ${details.color} mb-1`}>คำแนะนำ</div>
                                                <p className="text-sm text-gray-700">{details.tips}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary Note */}
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">✅</div>
                    <div>
                        <h3 className="font-bold text-emerald-800 mb-2">สรุป: เริ่มต้นอย่างไร?</h3>
                        <ol className="text-sm text-emerald-700 space-y-2 list-decimal list-inside">
                            <li><strong>เริ่มจากมาตรฐานไทย (Thai GACP)</strong> - เป็นพื้นฐานที่ต้องมีก่อน</li>
                            <li><strong>ระบุตลาดเป้าหมาย</strong> - เลือกประเทศ/ภูมิภาคที่ต้องการส่งออก</li>
                            <li><strong>เตรียมเอกสารตามมาตรฐาน</strong> - รวบรวมและจัดเก็บอย่างเป็นระบบ</li>
                            <li><strong>ติดต่อหน่วยงานที่เกี่ยวข้อง</strong> - สอบถามรายละเอียดเพิ่มเติม</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                    onClick={handleBack}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    className="flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 transition-all"
                >
                    รับทราบและดำเนินการต่อ
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18L15 12L9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
