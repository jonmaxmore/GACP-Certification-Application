"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';
import { apiClient as api } from '@/lib/api';

const SITE_TYPE_LABELS: Record<string, string> = {
    OUTDOOR: 'กลางแจ้ง',
    INDOOR: 'โรงเรือนระบบปิด',
    GREENHOUSE: 'โรงเรือนทั่วไป'
};
const PURPOSE_LABELS: Record<string, string> = {
    RESEARCH: 'เพื่อการศึกษาวิจัย',
    COMMERCIAL: 'เพื่อการพาณิชย์',
    EXPORT: 'เพื่อการส่งออก'
};
const PROPAGATION_LABELS: Record<string, string> = {
    SEED: 'เมล็ด',
    CUTTING: 'ปักชำ',
    TISSUE: 'เพาะเลี้ยงเนื้อเยื่อ'
};
const PLANT_PART_LABELS: Record<string, string> = {
    SEED: 'เมล็ด',
    STEM: 'ลำต้น',
    FLOWER: 'ช่อดอก',
    LEAF: 'ใบ',
    ROOT: 'ราก/หัว',
    OTHER: 'อื่นๆ'
};

export default function Step9Review() {
    const router = useRouter();
    const { state, isLoaded, setApplicationId } = useWizardStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPrintView, setShowPrintView] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<number | null>(null);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const plant = PLANTS.find(p => p.id === state.plantId);
    const uploadedDocs = state.documents?.filter(d => d.uploaded) || [];
    const siteTypesCount = state.siteTypes?.length || 1;
    const reviewFee = 5000 * siteTypesCount;
    const certFee = 25000;
    const totalFee = reviewFee + certFee;
    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const docNumber = state.applicationId || `GACP-${Date.now().toString(36).toUpperCase()}`;

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`.trim()
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';

    const handleNext = async () => {
        setSubmitting(true);
        setError(null);
        try {
            // If already have application ID, just navigate
            if (state.applicationId) {
                router.push('/applications/new/step-10');
                return;
            }

            const draftData = {
                plantId: state.plantId,
                plantName: plant?.name || state.plantId,
                serviceType: state.serviceType || 'new_application',
                purpose: state.certificationPurpose,
                areaType: state.siteTypes?.[0] || 'OUTDOOR',
                applicantData: { name: applicantName, ...state.applicantData },
                locationData: state.siteData,
                productionData: state.productionData,
                documents: state.documents,
                estimatedFee: totalFee,
                submissionDate: new Date(),
            };

            console.log('[Step9] Submitting draft:', draftData);

            const result = await api.post<{ success: boolean; data: { _id: string }; error?: string }>('/api/applications/draft', draftData);

            console.log('[Step9] API Response:', result);

            if (result.success) {
                const responseData = result.data as { _id?: string; data?: { _id: string } };
                const appId = responseData?.data?._id || responseData?._id;
                if (appId) {
                    setApplicationId(appId);
                    router.push('/applications/new/step-10');
                } else {
                    // API returned success but no ID - still proceed
                    console.warn('[Step9] No application ID returned, proceeding anyway');
                    router.push('/applications/new/step-10');
                }
            } else {
                // Show error but also offer to continue
                const errorMsg = result.error || 'Unknown error';
                console.error('[Step9] API Error:', errorMsg);

                // If error is auth-related, show specific message
                if (errorMsg.includes('401') || errorMsg.includes('Session') || errorMsg.includes('Unauthorized')) {
                    setError('กรุณาเข้าสู่ระบบก่อนยื่นคำขอ หรือกดปุ่ม "ข้ามไปขั้นตอนถัดไป" เพื่อดูตัวอย่าง');
                } else {
                    setError(`ไม่สามารถบันทึกคำขอได้: ${errorMsg} (กดปุ่มด้านล่างเพื่อดำเนินการต่อ)`);
                }
            }
        } catch (err: any) {
            console.error('[Step9] Exception:', err);
            setError(`เกิดข้อผิดพลาด: ${err.message || 'Unknown error'} (กดปุ่มด้านล่างเพื่อดำเนินการต่อ)`);
        } finally {
            setSubmitting(false);
        }
    };

    // Skip API and go directly to step-10 (for development/testing)
    const handleSkipToNext = () => {
        router.push('/applications/new/step-10');
    };

    const handleBack = () => router.push('/applications/new/step-8');
    const handlePrint = () => window.print();

    if (!isLoaded) return <div className="text-center py-16 text-gray-500">กำลังโหลด...</div>;

    // FormField for official document
    const FormField = ({ label, value, span = 1 }: { label: string; value?: string | null; span?: number }) => (
        <div className={span === 2 ? 'col-span-2' : ''}>
            <div className="text-xs text-gray-600 mb-1">{label}</div>
            <div className={`border-b border-gray-400 min-h-[24px] px-1 py-0.5 text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                {value || '.........................................................'}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Action Bar - Hide on Print */}
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">ตรวจสอบคำขอใบรับรอง GACP</h1>
                    <p className="text-sm text-gray-600">กรุณาตรวจสอบความถูกต้องก่อนยืนยัน</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPrintView(!showPrintView)}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        {showPrintView ? 'ดูแบบปกติ' : 'ดูแบบเอกสาร'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        พิมพ์/บันทึก PDF
                    </button>
                </div>
            </div>

            {/* ==================== OFFICIAL DOCUMENT ==================== */}
            <div id="official-document" className={`bg-white border-2 border-gray-300 rounded-lg overflow-hidden ${showPrintView ? '' : 'print:block'}`}>

                {/* Document Header - Thai Government Style */}
                <div className="border-b-2 border-gray-800 p-6 bg-gray-50">
                    <div className="flex items-start justify-between">
                        {/* Left - Logo & Organization */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                                <img src="/images/dtam-logo.png" alt="DTAM" className="w-14 h-14 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                                <div className="text-sm text-gray-700">กระทรวงสาธารณสุข</div>
                                <div className="text-xs text-gray-600 mt-1">88/23 หมู่ 4 ถ.ติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</div>
                                <div className="text-xs text-gray-600">โทร. 02-564-7889 | อีเมล tdc.cannabis.gacp@gmail.com</div>
                            </div>
                        </div>
                        {/* Right - Document Number */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500 mb-1">เลขที่เอกสาร</div>
                            <div className="text-sm font-mono font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded">{docNumber}</div>
                            <div className="text-xs text-gray-500 mt-2">วันที่ {docDate}</div>
                        </div>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center py-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">คำขอใบรับรองมาตรฐานแหล่งผลิตและเก็บเกี่ยวที่ดีของพืชสมุนไพร</h1>
                    <div className="text-sm text-gray-600 mt-1">Good Agricultural and Collection Practices (GACP)</div>
                </div>

                {/* Document Content */}
                <div className="p-6 space-y-6">

                    {/* Section: Plant & Purpose */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{plant?.icon || '🌿'}</span>
                                <div>
                                    <div className="font-bold text-gray-900">{plant?.name || 'พืชสมุนไพร'}</div>
                                    <div className="text-sm text-emerald-700">{PURPOSE_LABELS[state.certificationPurpose || ''] || '-'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">ลักษณะพื้นที่</div>
                                <div className="text-sm font-medium text-gray-900">{state.siteTypes?.map(t => SITE_TYPE_LABELS[t]).join(', ') || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Applicant */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                            <h2 className="font-bold text-gray-900">ข้อมูลผู้ยื่นคำขอ</h2>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {state.applicantData?.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' :
                                    state.applicantData?.applicantType === 'COMMUNITY' ? 'วิสาหกิจชุมชน' : 'นิติบุคคล'}
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                                {state.applicantData?.applicantType === 'INDIVIDUAL' && (
                                    <>
                                        <FormField label="ชื่อ-นามสกุล" value={applicantName} />
                                        <FormField label="เลขประจำตัวประชาชน" value={state.applicantData?.idCard} />
                                        <FormField label="โทรศัพท์" value={state.applicantData?.phone} />
                                        <FormField label="อีเมล" value={state.applicantData?.email} />
                                        <FormField label="Line ID" value={state.applicantData?.lineId} />
                                        <FormField label="ที่อยู่" value={state.applicantData?.address} />
                                    </>
                                )}
                                {state.applicantData?.applicantType === 'COMMUNITY' && (
                                    <>
                                        <FormField label="ชื่อวิสาหกิจชุมชน" value={state.applicantData?.communityName} span={2} />
                                        <FormField label="ชื่อประธาน" value={state.applicantData?.presidentName} />
                                        <FormField label="เลขประจำตัวประชาชน" value={state.applicantData?.presidentIdCard} />
                                        <FormField label="โทรศัพท์" value={state.applicantData?.phone} />
                                        <FormField label="อีเมล" value={state.applicantData?.email} />
                                    </>
                                )}
                                {state.applicantData?.applicantType === 'JURISTIC' && (
                                    <>
                                        <FormField label="ชื่อบริษัท/สถานประกอบการ" value={state.applicantData?.companyName} span={2} />
                                        <FormField label="ที่อยู่" value={state.applicantData?.companyAddress} span={2} />
                                        <FormField label="เลขทะเบียนนิติบุคคล" value={state.applicantData?.registrationNumber} />
                                        <FormField label="โทรศัพท์" value={state.applicantData?.companyPhone} />
                                        <FormField label="ชื่อประธานกรรมการ" value={state.applicantData?.directorName} />
                                        <FormField label="อีเมล" value={state.applicantData?.directorEmail} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                            <h2 className="font-bold text-gray-900">ข้อมูลสถานที่ปลูก/เก็บเกี่ยว</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="ชื่อสถานที่/ฟาร์ม" value={state.siteData?.siteName} span={2} />
                                <FormField label="ที่อยู่" value={state.siteData?.address} span={2} />
                                <FormField label="ตำบล/แขวง" value={state.siteData?.subdistrict} />
                                <FormField label="อำเภอ/เขต" value={state.siteData?.district} />
                                <FormField label="จังหวัด" value={state.siteData?.province} />
                                <FormField label="รหัสไปรษณีย์" value={state.siteData?.postalCode} />
                                <FormField label="พื้นที่ (ไร่)" value={state.siteData?.areaSize} />
                                <FormField label="พิกัด GPS" value={state.siteData?.gpsLat && state.siteData?.gpsLng ? `${state.siteData.gpsLat}, ${state.siteData.gpsLng}` : undefined} />
                            </div>
                            {/* Borders */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-2">อาณาเขตติดต่อ</div>
                                <div className="grid grid-cols-4 gap-3">
                                    <FormField label="ทิศเหนือ จรด" value={state.siteData?.northBorder} />
                                    <FormField label="ทิศใต้ จรด" value={state.siteData?.southBorder} />
                                    <FormField label="ทิศตะวันออก จรด" value={state.siteData?.eastBorder} />
                                    <FormField label="ทิศตะวันตก จรด" value={state.siteData?.westBorder} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Production */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                            <h2 className="font-bold text-gray-900">ข้อมูลการผลิต</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="ส่วนของพืชที่ใช้ประโยชน์" value={state.productionData?.plantParts?.map(p => PLANT_PART_LABELS[p] || p).join(', ')} span={2} />
                                <FormField label="วิธีการขยายพันธุ์" value={state.productionData?.propagationType ? PROPAGATION_LABELS[state.productionData.propagationType] : undefined} />
                                <FormField label="ชื่อสายพันธุ์" value={state.productionData?.varietyName} />
                                <FormField label="แหล่งที่มาสายพันธุ์" value={state.productionData?.varietySource} />
                                <FormField label="จำนวนที่ปลูก" value={state.productionData?.quantityWithUnit} />
                                <FormField label="รอบการเก็บเกี่ยว/ปี" value={state.productionData?.harvestCycles?.toString()} />
                                <FormField label="ผลผลิตคาดการณ์ (กก./ปี)" value={state.productionData?.estimatedYield?.toLocaleString()} />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Documents */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">4</div>
                            <h2 className="font-bold text-gray-900">เอกสารประกอบ</h2>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{uploadedDocs.length} รายการ</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            {uploadedDocs.length > 0 ? (
                                <div className="space-y-2">
                                    {uploadedDocs.map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{doc.name || `เอกสาร ${idx + 1}`}</div>
                                                <div className="text-xs text-emerald-600">อัปโหลดแล้ว</div>
                                            </div>
                                            {/* AI Ready Badge - Hide on Print */}
                                            <div className="print:hidden px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded flex items-center gap-1">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                </svg>
                                                AI Ready
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-sm">ยังไม่ได้อัปโหลดเอกสาร</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 5: Fee Table */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">5</div>
                            <h2 className="font-bold text-gray-900">ค่าธรรมเนียม (ประมาณการ)</h2>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b border-gray-200">ลำดับ</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b border-gray-200">รายการ</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700 border-b border-gray-200 w-20">จำนวน</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b border-gray-200 w-28">ราคา/หน่วย</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b border-gray-200 w-28">รวม (บาท)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">1</td>
                                        <td className="py-3 px-4 text-gray-700">ค่าตรวจสอบและประเมินคำขอเบื้องต้น</td>
                                        <td className="py-3 px-4 text-center text-gray-600">{siteTypesCount}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">5,000.00</td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-900">{reviewFee.toLocaleString()}.00</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 px-4 text-gray-600">2</td>
                                        <td className="py-3 px-4 text-gray-700">ค่ารับรองผลและจัดทำหนังสือรับรอง</td>
                                        <td className="py-3 px-4 text-center text-gray-600">1</td>
                                        <td className="py-3 px-4 text-right text-gray-600">25,000.00</td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-900">25,000.00</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-emerald-50">
                                    <tr>
                                        <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-900">จำนวนเงินทั้งสิ้น</td>
                                        <td className="py-4 px-4 text-right font-bold text-lg text-emerald-700">{totalFee.toLocaleString()}.00</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
                        <div className="font-semibold text-gray-700 mb-2">หมายเหตุ:</div>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>ค่าธรรมเนียมข้างต้นเป็นประมาณการเบื้องต้น อาจมีการเปลี่ยนแปลงตามผลการตรวจประเมิน</li>
                            <li>การชำระเงินจะดำเนินการหลังได้รับใบเสนอราคาและใบวางบิลอย่างเป็นทางการ</li>
                            <li>ข้าพเจ้าขอรับรองว่าข้อมูลทั้งหมดถูกต้องตามความเป็นจริงทุกประการ</li>
                        </ol>
                    </div>

                    {/* Signature Area */}
                    <div className="grid grid-cols-2 gap-8 pt-8">
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-8">ลงนามผู้ยื่นคำขอ</div>
                            <div className="border-b border-gray-400 mb-2 h-12"></div>
                            <div className="text-sm text-gray-700">( {applicantName || '..................................................'} )</div>
                            <div className="text-xs text-gray-500 mt-1">วันที่ ........./........../............</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600 mb-8">ผู้รับคำขอ</div>
                            <div className="border-b border-gray-400 mb-2 h-12"></div>
                            <div className="text-sm text-gray-700">( ................................................. )</div>
                            <div className="text-xs text-gray-500 mt-1">วันที่ ........./........../............</div>
                        </div>
                    </div>
                </div>

                {/* Document Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 text-center text-xs text-gray-500">
                    เอกสารนี้พิมพ์จากระบบ GACP Thailand | กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 print:hidden">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 flex-shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <div className="flex-1">
                        <div className="text-red-700 text-sm">{error}</div>
                    </div>
                    <button
                        onClick={handleSkipToNext}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg flex-shrink-0"
                    >
                        ข้ามไปขั้นตอนถัดไป →
                    </button>
                </div>
            )}

            {/* Navigation - Hide on Print */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 print:hidden">
                <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18L9 12L15 6" />
                    </svg>
                    ย้อนกลับ
                </button>
                <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex-[2] py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                    {submitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            กำลังบันทึกคำขอ...
                        </>
                    ) : (
                        <>
                            ยืนยันและดูใบเสนอราคา
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18L15 12L9 6" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #official-document, #official-document * { visibility: visible; }
                    #official-document { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%;
                        border: none !important;
                        border-radius: 0 !important;
                    }
                    .print\\:hidden { display: none !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
}
