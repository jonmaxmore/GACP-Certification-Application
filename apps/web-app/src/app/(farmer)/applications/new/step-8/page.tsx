"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';
import api from '@/services/api-client';

const SITE_TYPE_LABELS: Record<string, string> = { OUTDOOR: 'กลางแจ้ง (Outdoor)', INDOOR: 'โรงเรือนระบบปิด (Indoor)', GREENHOUSE: 'โรงเรือนทั่วไป (Greenhouse)' };
const PURPOSE_LABELS: Record<string, string> = { RESEARCH: 'เพื่อการศึกษาวิจัย', COMMERCIAL: 'เพื่อการพาณิชย์ (จำหน่าย/แปรรูป)', EXPORT: 'เพื่อการพาณิชย์ (ส่งออก)' };
const PROPAGATION_LABELS: Record<string, string> = { SEED: 'เมล็ด', CUTTING: 'ปักชำ', TISSUE: 'เพาะเลี้ยงเนื้อเยื่อ' };
const PLANT_PART_LABELS: Record<string, string> = { SEED: 'เมล็ด', STEM: 'ลำต้น', FLOWER: 'ช่อดอก', LEAF: 'ใบ', ROOT: 'ราก/หัว', OTHER: 'อื่นๆ' };
const FEE_PER_SITE_TYPE = 5000;

const OfficialHeader = ({ docType, docNumber }: { docType: string; docNumber: string }) => (
    <div className="border-b-2 border-black pb-3 mb-4">
        <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center overflow-hidden">
                    <img src="/images/dtam-logo.png" alt="DTAM" className="w-11 h-11 object-contain" />
                </div>
                <div>
                    <div className="text-sm font-bold">กองกัญชาทางการแพทย์</div>
                    <div className="text-xs font-semibold">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                    <div className="text-[9px] text-slate-700 mt-0.5">88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</div>
                    <div className="text-[9px] text-slate-700">โทรศัพท์ (02) 5647889 หรือ 061-4219701 อีเมล tdc.cannabis.gacp@gmail.com</div>
                </div>
            </div>
            <div className="text-right">
                <div className="bg-black text-white px-3 py-1 text-xs font-semibold">{docType}</div>
                <div className="text-[9px] text-slate-500 mt-1">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
        </div>
    </div>
);

const OfficialFooter = ({ applicantName }: { applicantName: string }) => (
    <div className="mt-6 pt-4 border-t border-dashed border-slate-600">
        <div className="bg-surface-100 p-2.5 rounded-md mb-4 text-[9px] text-slate-700">
            <div className="font-semibold mb-1">หมายเหตุ:</div>
            <div>1. การชำระเงิน: ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
            <div className="ml-3">โอนเงินเข้าบัญชี: ชื่อบัญชีเงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</div>
            <div className="ml-3">บัญชีธนาคารกรุงไทย เลขที่ 4750134376 สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต</div>
            <div className="ml-3">เลขประจำตัวผู้เสียภาษี 0994000036540</div>
            <div>2. เมื่อชำระเงินแล้วกรุณาส่ง ชื่อ-ที่อยู่ในการออกใบเสร็จรับเงิน และการส่งหลักฐานชำระเงิน</div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-[10px]">
            {[{ title: 'ผู้รับบริการ', name: '(.......................................)', pos: 'ตำแหน่ง...' },
            { title: 'ผู้ให้บริการ', name: '(นายรชต ไมตรีมิตร)', pos: 'ตำแหน่ง นักวิชาการสาธารณสุข' },
            { title: 'ผู้มีอำนาจลงนาม', name: '(นายปริชา พนูทิม)', pos: 'ตำแหน่ง ผู้อำนวยการกองกัญชาทางการแพทย์' }
            ].map((sig, i) => (
                <div key={i} className="text-center border border-surface-200 p-3 rounded-md">
                    <div className="font-semibold mb-2">{sig.title}</div>
                    <div className="h-10 border-b border-slate-600 mb-1"></div>
                    <div>{sig.name}</div>
                    <div className="text-[9px] text-slate-500">{sig.pos}</div>
                    <div className="text-[9px] text-slate-500">วันที่........./........../...........</div>
                </div>
            ))}
        </div>
    </div>
);

export default function Step8Review() {
    const router = useRouter();
    const { state, isLoaded, setApplicationId } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const handleNext = async () => {
        setSubmitting(true); setError(null);
        try {
            if (state.applicationId) { router.push('/applications/new/step-9'); return; }
            const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}` : state.applicantData?.applicantType === 'COMMUNITY' ? state.applicantData?.communityName || '' : state.applicantData?.companyName || '';
            const draftData = { requestType: state.serviceType || 'NEW', certificationType: 'GACP', objective: state.certificationPurpose, applicantType: state.applicantData?.applicantType || 'INDIVIDUAL', applicantInfo: { name: applicantName, ...state.applicantData }, siteInfo: state.siteData, formData: { plantId: state.plantId, siteTypes: state.siteTypes, production: state.productionData, documents: state.documents, consentedPDPA: state.consentedPDPA, acknowledgedStandards: state.acknowledgedStandards } };
            const result = await api.post<{ success: boolean; data: { _id: string; applicationNumber?: string }; error?: string }>('/api/v2/applications/draft', draftData);
            if (result.success) {
                const responseData = result.data as { _id?: string; data?: { _id: string } };
                const appId = responseData?.data?._id || responseData?._id;
                if (appId) { setApplicationId(appId); router.push('/applications/new/step-9'); }
                else setError('สร้างคำขอสำเร็จแต่ไม่พบรหัสคำขอ');
            } else setError(`ไม่สามารถบันทึกคำขอได้: ${result.error || 'Unknown error'}`);
        } catch { setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'); }
        finally { setSubmitting(false); }
    };

    const handleBack = () => router.push('/applications/new/step-7');
    const handlePrint = () => window.print();
    const plant = PLANTS.find(p => p.id === state.plantId);
    const uploadedDocs = state.documents?.filter(d => d.uploaded) || [];
    const siteTypesCount = state.siteTypes?.length || 1;
    const totalFee = FEE_PER_SITE_TYPE * siteTypesCount;
    const appId = state.applicationId || `G-${Date.now().toString(36).toUpperCase()}`;
    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}` : state.applicantData?.applicantType === 'COMMUNITY' ? state.applicantData?.communityName || '' : state.applicantData?.companyName || '';

    if (!isLoaded) return <div className="text-center py-16 text-slate-500">กำลังโหลด...</div>;

    const FormField = ({ label, value, colSpan = 1 }: { label: string; value?: string; colSpan?: number }) => (
        <div className={colSpan > 1 ? 'col-span-2' : ''}>
            <div className="text-[9px] text-slate-500 mb-0.5">{label}</div>
            <div className={`min-h-[24px] px-1.5 py-0.5 text-[11px] border-b border-slate-600 font-medium text-slate-900 ${value ? '' : 'bg-secondary-100'}`}>{value || '(ไม่ได้กรอก)'}</div>
        </div>
    );

    const SectionHeader = ({ title, color = 'primary' }: { title: string; color?: 'primary' | 'secondary' }) => (
        <div className={`${color === 'secondary' ? 'bg-secondary-500' : 'bg-primary-600'} text-white px-2.5 py-1.5 text-[11px] font-semibold rounded-t`}>{title}</div>
    );

    return (
        <div className="font-sans">
            {/* Action Bar */}
            <div className="flex justify-end gap-2 mb-3">
                <button onClick={handlePrint} className="px-4 py-2 rounded-lg border border-primary-600 bg-white text-primary-600 text-xs font-medium hover:bg-primary-50 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    ดาวน์โหลด/พิมพ์
                </button>
            </div>

            {/* Official Document */}
            <div id="official-document" className="bg-white text-slate-900 p-5 border-2 border-primary-600 rounded-lg mb-4 print:border-0 print:p-0">
                <OfficialHeader docType="แบบ ภท.11" docNumber={appId} />

                {/* Title */}
                <div className="text-center mb-4">
                    <h1 className="text-sm font-bold mb-1">คำขอใบรับรองมาตรฐานแหล่งผลิตและเก็บเกี่ยวที่ดีของพืชสมุนไพร</h1>
                    <div className="text-[11px] text-primary-600">Good Agricultural and Collection Practices (GACP)</div>
                </div>

                {/* Quick Info */}
                <div className="bg-surface-100 p-2.5 rounded-md mb-3 text-[10px]">
                    <div className="grid grid-cols-2 gap-2">
                        <div><strong>เรียน</strong> ประธานกรรมการ กองกัญชาทางการแพทย์</div>
                        <div className="text-right"><strong>เลขที่เอกสาร:</strong> {appId}</div>
                        <div><strong>หน่วยงานผู้รับบริการ:</strong> {applicantName}</div>
                        <div className="text-right"><strong>วันที่เอกสาร:</strong> {new Date().toLocaleDateString('th-TH')}</div>
                        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {state.applicantData?.registrationNumber || state.applicantData?.idCard || '-'}</div>
                        <div className="text-right"><strong>พืชสมุนไพร:</strong> {plant?.icon} {plant?.name}</div>
                    </div>
                </div>

                {/* Section 1: Purpose */}
                <div className="mb-3">
                    <SectionHeader title="ส่วนที่ 1: วัตถุประสงค์และลักษณะพื้นที่" />
                    <div className="border border-surface-200 border-t-0 p-2.5 rounded-b">
                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField label="วัตถุประสงค์" value={state.certificationPurpose ? PURPOSE_LABELS[state.certificationPurpose] : undefined} />
                            <FormField label="ประเภทบริการ" value={state.serviceType === 'NEW' ? 'ขอรับรองใหม่' : state.serviceType === 'RENEWAL' ? 'ต่ออายุ' : state.serviceType ?? undefined} />
                            <FormField label="ลักษณะพื้นที่" value={state.siteTypes?.map(t => SITE_TYPE_LABELS[t]).join(', ')} colSpan={2} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Applicant */}
                <div className="mb-3">
                    <SectionHeader title={`ส่วนที่ 2: ข้อมูลผู้ขอใบรับรอง (${state.applicantData?.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : state.applicantData?.applicantType === 'COMMUNITY' ? 'วิสาหกิจชุมชน' : 'นิติบุคคล'})`} />
                    <div className="border border-surface-200 border-t-0 p-2.5 rounded-b">
                        <div className="grid grid-cols-2 gap-1.5">
                            {state.applicantData?.applicantType === 'INDIVIDUAL' && (<><FormField label="ชื่อ-นามสกุล" value={`${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`} /><FormField label="เลขบัตรประชาชน" value={state.applicantData?.idCard} /><FormField label="โทรศัพท์" value={state.applicantData?.phone} /><FormField label="Line ID" value={state.applicantData?.lineId} /><FormField label="อีเมล" value={state.applicantData?.email} colSpan={2} /></>)}
                            {state.applicantData?.applicantType === 'COMMUNITY' && (<><FormField label="ชื่อวิสาหกิจชุมชน" value={state.applicantData?.communityName} colSpan={2} /><FormField label="ชื่อประธาน" value={state.applicantData?.presidentName} /><FormField label="เลขบัตรประชาชน" value={state.applicantData?.presidentIdCard} /><FormField label="รหัส สวช.01" value={state.applicantData?.registrationSVC01} /><FormField label="รหัส ท.ว.ช.3" value={state.applicantData?.registrationTVC3} /><FormField label="โทรศัพท์" value={state.applicantData?.phone} /><FormField label="อีเมล" value={state.applicantData?.email} /></>)}
                            {state.applicantData?.applicantType === 'JURISTIC' && (<><FormField label="ชื่อบริษัท/สถานประกอบการ" value={state.applicantData?.companyName} colSpan={2} /><FormField label="ที่อยู่" value={state.applicantData?.companyAddress} colSpan={2} /><FormField label="โทรศัพท์สถานที่" value={state.applicantData?.companyPhone} /><FormField label="เลขทะเบียนนิติบุคคล" value={state.applicantData?.registrationNumber} /><FormField label="ชื่อประธานกรรมการ" value={state.applicantData?.directorName} /><FormField label="โทรศัพท์ประธาน" value={state.applicantData?.directorPhone} /><FormField label="อีเมล" value={state.applicantData?.directorEmail} colSpan={2} /></>)}
                        </div>
                    </div>
                </div>

                {/* Section 3: Site */}
                <div className="mb-3">
                    <SectionHeader title="ส่วนที่ 3: ข้อมูลสถานที่ปลูก/เก็บเกี่ยว" />
                    <div className="border border-surface-200 border-t-0 p-2.5 rounded-b">
                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField label="ชื่อสถานที่/ฟาร์ม" value={state.siteData?.siteName} colSpan={2} />
                            <FormField label="ที่อยู่" value={state.siteData?.address} colSpan={2} />
                            <FormField label="จังหวัด" value={state.siteData?.province} />
                            <FormField label="พื้นที่ (ไร่)" value={state.siteData?.areaSize} />
                            <FormField label="ละติจูด" value={state.siteData?.gpsLat} />
                            <FormField label="ลองจิจูด" value={state.siteData?.gpsLng} />
                            <FormField label="ทิศเหนือ จรด" value={state.siteData?.northBorder} />
                            <FormField label="ทิศใต้ จรด" value={state.siteData?.southBorder} />
                            <FormField label="ทิศตะวันออก จรด" value={state.siteData?.eastBorder} />
                            <FormField label="ทิศตะวันตก จรด" value={state.siteData?.westBorder} />
                        </div>
                        {state.siteData?.gpsLat && state.siteData?.gpsLng && (
                            <div className="mt-2.5">
                                <div className="text-[9px] text-slate-500 mb-1">แผนที่ตำแหน่งสถานที่</div>
                                <div className="rounded-md overflow-hidden border border-surface-200">
                                    <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(state.siteData.gpsLng) - 0.01}%2C${parseFloat(state.siteData.gpsLat) - 0.006}%2C${parseFloat(state.siteData.gpsLng) + 0.01}%2C${parseFloat(state.siteData.gpsLat) + 0.006}&layer=mapnik&marker=${state.siteData.gpsLat}%2C${state.siteData.gpsLng}`} className="w-full h-[120px] border-0" loading="lazy" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 4: Production */}
                <div className="mb-3">
                    <SectionHeader title="ส่วนที่ 4: ข้อมูลการผลิต" />
                    <div className="border border-surface-200 border-t-0 p-2.5 rounded-b">
                        <div className="grid grid-cols-2 gap-1.5">
                            <FormField label="ส่วนของพืชที่ใช้ประโยชน์" value={state.productionData?.plantParts?.map(p => PLANT_PART_LABELS[p] || p).join(', ')} colSpan={2} />
                            <FormField label="วิธีการขยายพันธุ์" value={state.productionData?.propagationType ? PROPAGATION_LABELS[state.productionData.propagationType] : undefined} />
                            <FormField label="ที่มาของผลผลิต" value="ปลูกเอง (ในแหล่งผลิตนี้)" />
                            <FormField label="ชื่อสายพันธุ์" value={state.productionData?.varietyName} />
                            <FormField label="แหล่งที่มาสายพันธุ์" value={state.productionData?.varietySource} />
                            <FormField label="จำนวนต้นที่ปลูก" value={state.productionData?.quantityWithUnit} />
                            <FormField label="รอบการเก็บเกี่ยว/ปี" value={state.productionData?.harvestCycles ? `${state.productionData.harvestCycles} รอบ` : undefined} />
                            <FormField label="ผลผลิตคาดการณ์ (กก./ปี)" value={state.productionData?.estimatedYield?.toLocaleString()} />
                            <FormField label="ใบรับรอง GAP" value={state.productionData?.hasGAPCert ? 'มี' : 'ไม่มี'} />
                        </div>
                    </div>
                </div>

                {/* Section 5: Documents */}
                <div className="mb-3">
                    <SectionHeader title={`ส่วนที่ 5: เอกสารประกอบ (${uploadedDocs.length} รายการ)`} />
                    <div className="border border-surface-200 border-t-0 p-2.5 rounded-b">
                        {uploadedDocs.length > 0 ? (
                            <>
                                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                                    {uploadedDocs.map((doc, i) => (
                                        <div key={i} onClick={() => setSelectedDoc(selectedDoc === i ? null : i)} className={`p-1.5 rounded-md text-center cursor-pointer ${selectedDoc === i ? 'border-2 border-primary-600 bg-primary-50' : 'border border-surface-200 bg-surface-100'}`}>
                                            <div className="text-xl mb-0.5">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                            </div>
                                            <div className="text-[8px] text-slate-700 break-all leading-tight">{doc.name || `เอกสาร ${i + 1}`}</div>
                                            <div className="text-[7px] text-primary-600 mt-0.5">อัปโหลดแล้ว</div>
                                        </div>
                                    ))}
                                </div>
                                {selectedDoc !== null && uploadedDocs[selectedDoc] && (
                                    <div className="border border-surface-200 rounded-md p-2.5 bg-surface-100">
                                        <div className="text-[10px] font-semibold mb-1.5">พรีวิว: {uploadedDocs[selectedDoc].name}</div>
                                        <div className="bg-white border border-surface-200 rounded min-h-[100px] flex items-center justify-center p-4">
                                            {uploadedDocs[selectedDoc].url ? <img src={uploadedDocs[selectedDoc].url} alt={uploadedDocs[selectedDoc].name} className="max-w-full max-h-[200px] object-contain" /> : <div className="text-center text-slate-500 text-[11px]"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" className="mx-auto mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>ไฟล์: {uploadedDocs[selectedDoc].name}</div>}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : <div className="text-center py-4 text-slate-400 text-[11px]">ยังไม่ได้อัปโหลดเอกสาร</div>}
                    </div>
                </div>

                {/* Fee Table */}
                <div className="mb-3">
                    <SectionHeader title="ค่าธรรมเนียม" color="secondary" />
                    <div className="border border-surface-200 border-t-0 rounded-b overflow-hidden">
                        <table className="w-full text-[10px]">
                            <thead className="bg-surface-100"><tr><th className="p-1.5 text-left border-b border-surface-200">ลำดับที่</th><th className="p-1.5 text-left border-b border-surface-200">รายการ</th><th className="p-1.5 text-center border-b border-surface-200">จำนวน</th><th className="p-1.5 text-center border-b border-surface-200">หน่วย</th><th className="p-1.5 text-right border-b border-surface-200">ราคา/หน่วย</th><th className="p-1.5 text-right border-b border-surface-200">จำนวนเงิน (บาท)</th></tr></thead>
                            <tbody>
                                <tr className="border-b border-surface-200"><td className="p-1.5">1.</td><td className="p-1.5">ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td><td className="p-1.5 text-center">{siteTypesCount}</td><td className="p-1.5 text-center">ต่อคำขอ</td><td className="p-1.5 text-right">5,000.00</td><td className="p-1.5 text-right">{totalFee.toLocaleString()}.00</td></tr>
                                <tr className="border-b border-surface-200"><td className="p-1.5">2.</td><td className="p-1.5">ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน</td><td className="p-1.5 text-center">1</td><td className="p-1.5 text-center">ต่อคำขอ</td><td className="p-1.5 text-right">25,000.00</td><td className="p-1.5 text-right">25,000.00</td></tr>
                            </tbody>
                            <tfoot className="bg-secondary-100">
                                <tr><td colSpan={5} className="p-2 font-semibold text-right">จำนวนเงินทั้งสิ้น</td><td className="p-2 font-bold text-right text-xs">{(totalFee + 25000).toLocaleString()}.00</td></tr>
                                <tr><td colSpan={6} className="p-1.5 text-[9px] text-secondary-700">({['สามหมื่น', 'สามหมื่นห้าพัน', 'สี่หมื่น', 'สี่หมื่นห้าพัน', 'ห้าหมื่น'][siteTypesCount - 1] || 'สามหมื่น'}บาทถ้วน)</td></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <OfficialFooter applicantName={applicantName} />
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-50 border border-red-500 rounded-lg p-3 mb-3 text-red-600 text-sm flex items-center gap-2">{error}</div>}

            {/* Navigation */}
            <div className="flex gap-3">
                <button onClick={handleBack} disabled={submitting} className={`flex-1 py-3.5 rounded-xl font-medium border ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-surface-200 text-slate-700'} disabled:opacity-50`}>ย้อนกลับ</button>
                <button onClick={handleNext} disabled={submitting} className={`flex-[2] py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${submitting ? 'bg-slate-400' : 'bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg shadow-primary-500/40'} text-white disabled:cursor-not-allowed`}>
                    {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> กำลังบันทึกคำขอ...</> : <>ยืนยันและไปดูใบเสนอราคา</>}
                </button>
            </div>

            <style jsx global>{`@media print { body * { visibility: hidden; } #official-document, #official-document * { visibility: visible; } #official-document { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
        </div>
    );
}
