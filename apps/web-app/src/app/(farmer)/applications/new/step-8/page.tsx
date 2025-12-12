"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';
import api from '@/services/apiClient';

const SITE_TYPE_LABELS: Record<string, string> = {
    OUTDOOR: 'กลางแจ้ง (Outdoor)',
    INDOOR: 'โรงเรือนระบบปิด (Indoor)',
    GREENHOUSE: 'โรงเรือนทั่วไป (Greenhouse)',
};

const PURPOSE_LABELS: Record<string, string> = {
    RESEARCH: 'เพื่อการศึกษาวิจัย',
    COMMERCIAL: 'เพื่อการพาณิชย์ (จำหน่าย/แปรรูป)',
    EXPORT: 'เพื่อการพาณิชย์ (ส่งออก)',
};

const PROPAGATION_LABELS: Record<string, string> = {
    SEED: 'เมล็ด',
    CUTTING: 'ปักชำ',
    TISSUE: 'เพาะเลี้ยงเนื้อเยื่อ',
};

const PLANT_PART_LABELS: Record<string, string> = {
    SEED: 'เมล็ด', STEM: 'ลำต้น', FLOWER: 'ช่อดอก', LEAF: 'ใบ', ROOT: 'ราก/หัว', OTHER: 'อื่นๆ',
};

const FEE_PER_SITE_TYPE = 5000;

// Official Header Component
const OfficialHeader = ({ docType, docNumber }: { docType: string; docNumber: string }) => (
    <div style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left: Logo & Organization */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                    width: '50px', height: '50px', border: '2px solid #000', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                    <img src="/images/dtam-logo.png" alt="DTAM" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                </div>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>กองกัญชาทางการแพทย์</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                    <div style={{ fontSize: '9px', color: '#374151', marginTop: '2px' }}>
                        88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000
                    </div>
                    <div style={{ fontSize: '9px', color: '#374151' }}>
                        โทรศัพท์ (02) 5647889 หรือ 061-4219701 อีเมล tdc.cannabis.gacp@gmail.com
                    </div>
                </div>
            </div>
            {/* Right: Document Type */}
            <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#000', color: '#fff', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
                    {docType}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '4px' }}>
                    {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>
        </div>
    </div>
);

// Footer with signature areas
const OfficialFooter = ({ applicantName }: { applicantName: string }) => (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #374151' }}>
        {/* หมายเหตุ */}
        <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '9px', color: '#374151' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>หมายเหตุ:</div>
            <div>1. การชำระเงิน: ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
            <div style={{ marginLeft: '12px' }}>โอนเงินเข้าบัญชี: ชื่อบัญชีเงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</div>
            <div style={{ marginLeft: '12px' }}>บัญชีธนาคารกรุงไทย เลขที่ 4750134376 สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต</div>
            <div style={{ marginLeft: '12px' }}>เลขประจำตัวผู้เสียภาษี 0994000036540</div>
            <div>2. เมื่อชำระเงินแล้วกรุณาส่ง ชื่อ-ที่อยู่ในการออกใบเสร็จรับเงิน และการส่งหลักฐานชำระเงิน</div>
        </div>
        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '10px' }}>
            <div style={{ textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>ผู้รับบริการ</div>
                <div style={{ height: '40px', borderBottom: '1px solid #374151', marginBottom: '4px' }}></div>
                <div>(.......................................)</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>ตำแหน่ง...</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>วันที่........./........../...........</div>
            </div>
            <div style={{ textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>ผู้ให้บริการ</div>
                <div style={{ height: '40px', borderBottom: '1px solid #374151', marginBottom: '4px' }}></div>
                <div>(นายรชต ไมตรีมิตร)</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>ตำแหน่ง นักวิชาการสาธารณสุข</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>วันที่........./........../...........</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>กองกัญชาทางการแพทย์</div>
            </div>
            <div style={{ textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>ผู้มีอำนาจลงนาม</div>
                <div style={{ height: '40px', borderBottom: '1px solid #374151', marginBottom: '4px' }}></div>
                <div>(นายปริชา พนูทิม)</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>ตำแหน่ง ผู้อำนวยการกองกัญชาทางการแพทย์</div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>ปฏิบัติราชการแทน อธิบดีกรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
            </div>
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
    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    // Create draft in backend and navigate to step-9
    const handleNext = async () => {
        setSubmitting(true);
        setError(null);

        try {
            // If we already have an applicationId, skip creation
            if (state.applicationId) {
                router.push('/applications/new/step-9');
                return;
            }

            // Prepare data for backend API
            const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
                ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`
                : state.applicantData?.applicantType === 'COMMUNITY'
                    ? state.applicantData?.communityName || ''
                    : state.applicantData?.companyName || '';

            const draftData = {
                requestType: state.serviceType || 'NEW',
                certificationType: 'GACP',
                objective: state.certificationPurpose,
                applicantType: state.applicantData?.applicantType || 'INDIVIDUAL',
                applicantInfo: {
                    name: applicantName,
                    ...state.applicantData,
                },
                siteInfo: state.siteData,
                formData: {
                    plantId: state.plantId,
                    siteTypes: state.siteTypes,
                    production: state.productionData,
                    documents: state.documents,
                    consentedPDPA: state.consentedPDPA,
                    acknowledgedStandards: state.acknowledgedStandards,
                },
            };

            // Call backend API to create draft
            console.log('[Step-8] Creating draft with data:', draftData);
            const result = await api.post<{ success: boolean; data: { _id: string; applicationNumber?: string } }>('/v2/applications/draft', draftData);
            console.log('[Step-8] API Response:', result);

            // Handle different response structures
            if (result.success) {
                // Try different response paths
                const appId = result.data?.data?._id || result.data?._id || (result.data as unknown as { _id: string })?._id;
                console.log('[Step-8] Application ID:', appId);

                if (appId) {
                    setApplicationId(appId);
                    router.push('/applications/new/step-9');
                } else {
                    console.error('[Step-8] No application ID in response:', result);
                    setError('สร้างคำขอสำเร็จแต่ไม่พบรหัสคำขอ');
                }
            } else {
                console.error('[Step-8] API call failed:', result);
                setError(`ไม่สามารถบันทึกคำขอได้: ${result.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error creating draft:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => router.push('/applications/new/step-7');
    const handlePrint = () => window.print();

    const plant = PLANTS.find(p => p.id === state.plantId);
    const uploadedDocs = state.documents?.filter(d => d.uploaded) || [];
    const siteTypesCount = state.siteTypes?.length || 1;
    const totalFee = FEE_PER_SITE_TYPE * siteTypesCount;
    const appId = state.applicationId || `G-${Date.now().toString(36).toUpperCase()}`;

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    const FormField = ({ label, value, colSpan = 1 }: { label: string; value?: string; colSpan?: number }) => (
        <div style={{ gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined, marginBottom: '6px' }}>
            <div style={{ fontSize: '9px', color: '#6B7280', marginBottom: '1px' }}>{label}</div>
            <div style={{
                minHeight: '24px', padding: '3px 6px', fontSize: '11px',
                borderBottom: '1px solid #374151', fontWeight: 500, color: '#111827',
                background: value ? 'transparent' : '#FEF3C7',
            }}>
                {value || '(ไม่ได้กรอก)'}
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
                <button onClick={handlePrint} style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #10B981',
                    background: 'white', color: '#10B981', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}>
                    📥 ดาวน์โหลด/พิมพ์
                </button>
            </div>

            {/* ===== OFFICIAL DOCUMENT: แบบ ภท.11 ===== */}
            <div id="official-document" style={{
                background: 'white', color: '#111827', padding: '20px',
                border: '2px solid #10B981', borderRadius: '8px', marginBottom: '16px',
            }}>
                <OfficialHeader docType="แบบ ภท.11" docNumber={appId} />

                {/* Document Title */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h1 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>
                        คำขอใบรับรองมาตรฐานแหล่งผลิตและเก็บเกี่ยวที่ดีของพืชสมุนไพร
                    </h1>
                    <div style={{ fontSize: '11px', color: '#059669' }}>
                        Good Agricultural and Collection Practices (GACP)
                    </div>
                </div>

                {/* Applicant Info Header */}
                <div style={{ background: '#F9FAFB', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><strong>เรียน</strong> ประธานกรรมการ กองกัญชาทางการแพทย์</div>
                        <div style={{ textAlign: 'right' }}><strong>เลขที่เอกสาร:</strong> {appId}</div>
                        <div><strong>หน่วยงานผู้รับบริการ:</strong> {applicantName}</div>
                        <div style={{ textAlign: 'right' }}><strong>วันที่เอกสาร:</strong> {new Date().toLocaleDateString('th-TH')}</div>
                        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {state.applicantData?.registrationNumber || state.applicantData?.idCard || '-'}</div>
                        <div style={{ textAlign: 'right' }}><strong>พืชสมุนไพร:</strong> {plant?.icon} {plant?.name}</div>
                    </div>
                </div>

                {/* Section 1: Purpose */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#10B981', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ส่วนที่ 1: วัตถุประสงค์และลักษณะพื้นที่
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', padding: '10px', borderRadius: '0 0 4px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <FormField label="วัตถุประสงค์" value={state.certificationPurpose ? PURPOSE_LABELS[state.certificationPurpose] : undefined} />
                            <FormField label="ประเภทบริการ" value={state.serviceType === 'NEW' ? 'ขอรับรองใหม่' : state.serviceType === 'RENEWAL' ? 'ต่ออายุ' : state.serviceType} />
                            <FormField label="ลักษณะพื้นที่" value={state.siteTypes?.map(t => SITE_TYPE_LABELS[t]).join(', ')} colSpan={2} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Applicant */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#10B981', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ส่วนที่ 2: ข้อมูลผู้ขอใบรับรอง ({state.applicantData?.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : state.applicantData?.applicantType === 'COMMUNITY' ? 'วิสาหกิจชุมชน' : 'นิติบุคคล'})
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', padding: '10px', borderRadius: '0 0 4px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {state.applicantData?.applicantType === 'INDIVIDUAL' && (
                                <>
                                    <FormField label="ชื่อ-นามสกุล" value={`${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`} />
                                    <FormField label="เลขบัตรประชาชน" value={state.applicantData?.idCard} />
                                    <FormField label="โทรศัพท์" value={state.applicantData?.phone} />
                                    <FormField label="Line ID" value={state.applicantData?.lineId} />
                                    <FormField label="อีเมล" value={state.applicantData?.email} colSpan={2} />
                                </>
                            )}
                            {state.applicantData?.applicantType === 'COMMUNITY' && (
                                <>
                                    <FormField label="ชื่อวิสาหกิจชุมชน" value={state.applicantData?.communityName} colSpan={2} />
                                    <FormField label="ชื่อประธาน" value={state.applicantData?.presidentName} />
                                    <FormField label="เลขบัตรประชาชน" value={state.applicantData?.presidentIdCard} />
                                    <FormField label="รหัส สวช.01" value={state.applicantData?.registrationSVC01} />
                                    <FormField label="รหัส ท.ว.ช.3" value={state.applicantData?.registrationTVC3} />
                                    <FormField label="เลขรหัสประจำบ้าน" value={state.applicantData?.houseRegistrationCode} />
                                    <FormField label="โทรศัพท์" value={state.applicantData?.phone} />
                                    <FormField label="อีเมล" value={state.applicantData?.email} />
                                    <FormField label="Line ID" value={state.applicantData?.lineId} />
                                </>
                            )}
                            {state.applicantData?.applicantType === 'JURISTIC' && (
                                <>
                                    <FormField label="ชื่อบริษัท/สถานประกอบการ" value={state.applicantData?.companyName} colSpan={2} />
                                    <FormField label="ที่อยู่" value={state.applicantData?.companyAddress} colSpan={2} />
                                    <FormField label="โทรศัพท์สถานที่" value={state.applicantData?.companyPhone} />
                                    <FormField label="เลขทะเบียนนิติบุคคล" value={state.applicantData?.registrationNumber} />
                                    <FormField label="ชื่อประธานกรรมการ" value={state.applicantData?.directorName} />
                                    <FormField label="โทรศัพท์ประธาน" value={state.applicantData?.directorPhone} />
                                    <FormField label="อีเมล" value={state.applicantData?.directorEmail} colSpan={2} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Site */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#10B981', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ส่วนที่ 3: ข้อมูลสถานที่ปลูก/เก็บเกี่ยว
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', padding: '10px', borderRadius: '0 0 4px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
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
                        {/* Map Preview */}
                        {state.siteData?.gpsLat && state.siteData?.gpsLng && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontSize: '9px', color: '#6B7280', marginBottom: '4px' }}>📍 แผนที่ตำแหน่งสถานที่</div>
                                <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                    <iframe
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(state.siteData.gpsLng) - 0.01}%2C${parseFloat(state.siteData.gpsLat) - 0.006}%2C${parseFloat(state.siteData.gpsLng) + 0.01}%2C${parseFloat(state.siteData.gpsLat) + 0.006}&layer=mapnik&marker=${state.siteData.gpsLat}%2C${state.siteData.gpsLng}`}
                                        style={{ width: '100%', height: '120px', border: 'none' }} loading="lazy"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 4: Production */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#10B981', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ส่วนที่ 4: ข้อมูลการผลิต
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', padding: '10px', borderRadius: '0 0 4px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <FormField label="ส่วนของพืชที่ใช้ประโยชน์" value={state.productionData?.plantParts?.map(p => PLANT_PART_LABELS[p] || p).join(', ')} colSpan={2} />
                            <FormField label="วิธีการขยายพันธุ์" value={state.productionData?.propagationType ? PROPAGATION_LABELS[state.productionData.propagationType] : undefined} />
                            <FormField label="ที่มาของผลผลิต" value="ปลูกเอง (ในแหล่งผลิตนี้)" />
                            <FormField label="ชื่อสายพันธุ์" value={state.productionData?.varietyName} />
                            <FormField label="แหล่งที่มาสายพันธุ์" value={state.productionData?.varietySource} />
                            <FormField label="แหล่งที่มาเมล็ดพันธุ์" value={state.productionData?.seedSource} colSpan={2} />
                            <FormField label="จำนวนต้นที่ปลูก" value={state.productionData?.quantityWithUnit} />
                            <FormField label="รอบการเก็บเกี่ยว/ปี" value={state.productionData?.harvestCycles ? `${state.productionData.harvestCycles} รอบ` : undefined} />
                            <FormField label="ผลผลิตคาดการณ์ (กก./ปี)" value={state.productionData?.estimatedYield?.toLocaleString()} />
                            <FormField label="รายละเอียดเพิ่มเติม" value={state.productionData?.sourceDetail} />
                            <FormField label="ใบรับรอง GAP" value={state.productionData?.hasGAPCert ? '✓ มี' : '✗ ไม่มี'} />
                            <FormField label="ใบรับรอง Organic" value={state.productionData?.hasOrganicCert ? '✓ มี' : '✗ ไม่มี'} />
                        </div>
                    </div>
                </div>

                {/* Section 5: Documents with Preview */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#10B981', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ส่วนที่ 5: เอกสารประกอบ ({uploadedDocs.length} รายการ)
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', padding: '10px', borderRadius: '0 0 4px 4px' }}>
                        {uploadedDocs.length > 0 ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                    {uploadedDocs.map((doc, i) => (
                                        <div key={i} onClick={() => setSelectedDoc(selectedDoc === i ? null : i)}
                                            style={{
                                                border: selectedDoc === i ? '2px solid #10B981' : '1px solid #E5E7EB',
                                                borderRadius: '6px', padding: '6px', textAlign: 'center', cursor: 'pointer',
                                                background: selectedDoc === i ? '#ECFDF5' : '#F9FAFB',
                                            }}>
                                            <div style={{ fontSize: '20px', marginBottom: '2px' }}>
                                                {doc.name?.includes('รูป') || doc.name?.includes('photo') ? '🖼️' : '📄'}
                                            </div>
                                            <div style={{ fontSize: '8px', color: '#374151', wordBreak: 'break-all', lineHeight: 1.2 }}>
                                                {doc.name || `เอกสาร ${i + 1}`}
                                            </div>
                                            <div style={{ fontSize: '7px', color: '#10B981', marginTop: '2px' }}>✓ อัปโหลดแล้ว</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Document Preview Area */}
                                {selectedDoc !== null && uploadedDocs[selectedDoc] && (
                                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px', background: '#F9FAFB' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 600, marginBottom: '6px' }}>
                                            📎 พรีวิว: {uploadedDocs[selectedDoc].name || `เอกสาร ${selectedDoc + 1}`}
                                        </div>
                                        <div style={{
                                            background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '4px',
                                            minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '16px', textAlign: 'center',
                                        }}>
                                            {uploadedDocs[selectedDoc].url ? (
                                                <img
                                                    src={uploadedDocs[selectedDoc].url}
                                                    alt={uploadedDocs[selectedDoc].name}
                                                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ color: '#6B7280', fontSize: '11px' }}>
                                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                                                    <div>ไฟล์: {uploadedDocs[selectedDoc].name}</div>
                                                    <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '4px' }}>
                                                        (พรีวิวจะแสดงเมื่อเชื่อมต่อกับระบบจัดเก็บไฟล์จริง)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '16px', color: '#9CA3AF', fontSize: '11px' }}>
                                ⚠️ ยังไม่ได้อัปโหลดเอกสาร กรุณากลับไปอัปโหลดที่ขั้นตอนก่อนหน้า
                            </div>
                        )}
                    </div>
                </div>

                {/* Fee Table */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ background: '#F59E0B', color: 'white', padding: '6px 10px', fontSize: '11px', fontWeight: 600, borderRadius: '4px 4px 0 0' }}>
                        ค่าธรรมเนียม
                    </div>
                    <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 4px 4px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F9FAFB' }}>
                                <tr>
                                    <th style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>ลำดับที่</th>
                                    <th style={{ padding: '6px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>รายการ</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>จำนวน</th>
                                    <th style={{ padding: '6px', textAlign: 'center', borderBottom: '1px solid #E5E7EB' }}>หน่วย</th>
                                    <th style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>ราคา/หน่วย</th>
                                    <th style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>จำนวนเงิน (บาท)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '6px' }}>1.</td>
                                    <td style={{ padding: '6px' }}>ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>{siteTypesCount}</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>ต่อคำขอ</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>5,000.00</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>{totalFee.toLocaleString()}.00</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '6px' }}>2.</td>
                                    <td style={{ padding: '6px' }}>ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>1</td>
                                    <td style={{ padding: '6px', textAlign: 'center' }}>ต่อคำขอ</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>25,000.00</td>
                                    <td style={{ padding: '6px', textAlign: 'right' }}>25,000.00</td>
                                </tr>
                            </tbody>
                            <tfoot style={{ background: '#FEF3C7' }}>
                                <tr>
                                    <td colSpan={5} style={{ padding: '8px', fontWeight: 600, textAlign: 'right' }}>จำนวนเงินทั้งสิ้น</td>
                                    <td style={{ padding: '8px', fontWeight: 700, textAlign: 'right', fontSize: '12px' }}>
                                        {(totalFee + 25000).toLocaleString()}.00
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={6} style={{ padding: '6px', fontSize: '9px', color: '#B45309' }}>
                                        ({['สามหมื่น', 'สามหมื่นห้าพัน', 'สี่หมื่น', 'สี่หมื่นห้าพัน', 'ห้าหมื่น'][siteTypesCount - 1] || 'สามหมื่น'}บาทถ้วน)
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <OfficialFooter applicantName={applicantName} />
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '8px',
                    padding: '12px', marginBottom: '12px', color: '#DC2626', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} disabled={submitting} style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white',
                    color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.5 : 1,
                }}>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} disabled={submitting} style={{
                    flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                    background: submitting
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    color: 'white', fontSize: '14px', fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: submitting ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                    {submitting ? (
                        <>
                            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                            กำลังบันทึกคำขอ...
                        </>
                    ) : (
                        <>✅ ยืนยันและไปดูใบเสนอราคา</>
                    )}
                </button>
            </div>

            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #official-document, #official-document * { visibility: visible; }
                    #official-document { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
}
