"use client";

import { WizardState, PLANTS } from '../hooks/useWizardState';

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0", success: "#10B981" };

const SERVICE_LABELS = { NEW: 'ยื่นคำขอรายใหม่', RENEWAL: 'ต่ออายุ', REPLACEMENT: 'ขอใบแทน' };
const APPLICANT_LABELS = { INDIVIDUAL: 'บุคคลธรรมดา', JURISTIC: 'นิติบุคคล', COMMUNITY: 'วิสาหกิจชุมชน' };
const PURPOSE_LABELS = { RESEARCH: 'ศึกษาวิจัย', COMMERCIAL_DOMESTIC: 'พาณิชย์ (จำหน่าย/แปรรูป)', COMMERCIAL_EXPORT: 'พาณิชย์ (ส่งออก)', OTHER: 'อื่นๆ' };
const AREA_LABELS = { OUTDOOR: 'กลางแจ้ง', INDOOR: 'Indoor', GREENHOUSE: 'Greenhouse', OTHER: 'อื่นๆ' };
const PART_LABELS = { SEED: 'เมล็ด', STEM: 'ก้าน', FLOWER: 'ช่อดอก', CUTTING: 'กิ่งชำ', LEAF: 'ใบ', ROOT: 'ราก/หัว', OTHER: 'อื่นๆ' };

// SVG Icons
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

interface Props {
    state: WizardState;
}

export default function Step8Review({ state }: Props) {
    const plant = PLANTS.find(p => p.id === state.plantId);

    const Section = ({ title, children, isComplete }: { title: string; children: React.ReactNode; isComplete?: boolean }) => (
        <div style={{ marginBottom: "14px", padding: "14px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: isComplete === false ? `1px solid #F59E0B` : `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                {isComplete !== undefined && (
                    <span style={{ color: isComplete ? colors.success : "#F59E0B" }}>
                        {isComplete ? <CheckIcon /> : <AlertIcon />}
                    </span>
                )}
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: colors.textDark }}>{title}</h3>
            </div>
            {children}
        </div>
    );

    const Row = ({ label, value }: { label: string; value: string | number | undefined }) => (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
            <span style={{ color: colors.textGray }}>{label}</span>
            <span style={{ color: colors.textDark, fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{value || '-'}</span>
        </div>
    );

    // Validation checks
    const hasApplicant = !!state.applicantData?.fullName && !!state.applicantData?.idCard && !!state.applicantData?.email;
    const hasProduction = !!(state.productionData?.harvestCycles) && (state.productionData?.plantParts?.length || 0) > 0;
    const hasSite = !!state.siteSecurityData?.siteName && !!state.siteSecurityData?.latitude;
    const hasDocuments = state.documents.length > 0;
    const hasCertification = !!(state.certificationData?.certificationTypes?.length);

    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: colors.textDark, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: colors.primary }}>🔍</span>
                ตรวจสอบข้อมูล
            </h2>
            <p style={{ color: colors.textGray, fontSize: "13px", marginBottom: "20px" }}>กรุณาตรวจสอบข้อมูลก่อนไปขั้นตอนชำระเงิน</p>

            <Section title="📋 ข้อมูลคำขอ" isComplete={true}>
                <Row label="พืช" value={plant ? `${plant.icon} ${plant.name}` : '-'} />
                <Row label="ประเภทคำขอ" value={state.serviceType ? SERVICE_LABELS[state.serviceType] : '-'} />
            </Section>

            {/* NEW: Certification Section */}
            <Section title="🎯 ประเภทการรับรอง" isComplete={hasCertification}>
                <Row label="ประเภท" value={state.certificationData?.certificationTypes?.map(t => t === 'PRODUCTION' ? 'ปลูก' : 'แปรรูป').join(', ')} />
                <Row label="วัตถุประสงค์" value={state.certificationData?.purpose ? PURPOSE_LABELS[state.certificationData.purpose] : '-'} />
                <Row label="ลักษณะพื้นที่" value={state.certificationData?.areaType ? AREA_LABELS[state.certificationData.areaType] : '-'} />
            </Section>

            <Section title="👤 ข้อมูลผู้ยื่น" isComplete={hasApplicant}>
                <Row label="ประเภท" value={state.applicantData ? APPLICANT_LABELS[state.applicantData.applicantType] : '-'} />
                <Row label="ชื่อ" value={state.applicantData?.fullName} />
                <Row label="บัตร ปชช." value={state.applicantData?.idCard} />
                <Row label="โทร" value={state.applicantData?.phone} />
                <Row label="อีเมล" value={state.applicantData?.email} />
                <Row label="Line ID" value={state.applicantData?.lineId} />
            </Section>

            <Section title="🌱 ข้อมูลการผลิต" isComplete={hasProduction}>
                <Row label="ส่วนที่ใช้" value={state.productionData?.plantParts?.map(p => PART_LABELS[p]).join(', ')} />
                <Row label="สายพันธุ์" value={state.productionData?.varietyName} />
                <Row label="แหล่งที่มา" value={state.productionData?.varietySource} />
                <Row label="ปริมาณ" value={state.productionData?.quantityWithUnit || `${state.productionData?.treeCount || state.productionData?.areaSizeRai || 0} ${state.productionData?.treeCount ? 'ต้น' : 'ไร่'}`} />
                <Row label="รอบเก็บเกี่ยว" value={`${state.productionData?.harvestCycles || 0} ครั้ง/ปี`} />
            </Section>

            <Section title="📍 สถานที่ & ความปลอดภัย" isComplete={hasSite}>
                <Row label="ชื่อสถานที่" value={state.siteSecurityData?.siteName} />
                <Row label="พิกัด GPS" value={state.siteSecurityData?.latitude ? `${state.siteSecurityData.latitude.toFixed(5)}, ${state.siteSecurityData.longitude.toFixed(5)}` : '-'} />
                <Row label="สิทธิ์ที่ดิน" value={state.siteSecurityData?.landOwnership === 'OWN' ? 'เจ้าของ' : state.siteSecurityData?.landOwnership === 'RENT' ? 'เช่า' : 'ยินยอม'} />
            </Section>

            <Section title="📄 เอกสารแนบ" isComplete={hasDocuments}>
                <Row label="จำนวนเอกสาร" value={`${state.documents.length} รายการ`} />
                {state.videoUrl && <Row label="วิดีโอ" value="✅ มีลิงก์วิดีโอ" />}
            </Section>

            {/* Payment Info */}
            <div style={{ padding: "14px", backgroundColor: "#FEF3C7", borderRadius: "10px", marginTop: "14px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#92400E", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    💳 ค่าธรรมเนียม
                </h3>
                <p style={{ fontSize: "13px", color: "#92400E" }}>
                    งวดที่ 1 (ตรวจเอกสาร): <strong>5,000 บาท</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#B45309", marginTop: "4px" }}>
                    งวดที่ 2 (ตรวจภาคสนาม): 25,000 บาท (ชำระหลังเอกสารผ่าน)
                </p>
                <p style={{ fontSize: "11px", color: "#B45309", marginTop: "6px" }}>
                    * กดปุ่ม "ไปชำระเงิน" เพื่อดำเนินการชำระค่าธรรมเนียมงวดแรก
                </p>
            </div>
        </div>
    );
}
