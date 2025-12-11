"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';

export default function Step8Review() {
    const router = useRouter();
    const { state, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(localStorage.getItem("theme") === "dark");
    }, []);

    useEffect(() => {
        if (isLoaded && !state.siteData) router.replace('/applications/new/step-0');
    }, [isLoaded, state.siteData, router]);

    const handleNext = () => router.push('/applications/new/step-9');
    const handleBack = () => router.push('/applications/new/step-7');

    const plant = PLANTS.find(p => p.id === state.plantId);
    const uploadedDocs = state.documents?.filter(d => d.uploaded).length || 0;

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    const SectionCard = ({ title, icon, children, editStep }: { title: string; icon: string; children: React.ReactNode; editStep: number }) => (
        <div style={{ background: isDark ? '#374151' : '#F9FAFB', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon} {title}
                </h3>
                <button onClick={() => router.push(`/applications/new/step-${editStep}`)} style={{
                    padding: '4px 12px', borderRadius: '16px', border: 'none',
                    background: isDark ? '#4B5563' : '#E5E7EB',
                    color: isDark ? '#D1D5DB' : '#374151',
                    fontSize: '11px', cursor: 'pointer',
                }}>
                    แก้ไข
                </button>
            </div>
            {children}
        </div>
    );

    const InfoRow = ({ label, value }: { label: string; value?: string }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}` }}>
            <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: isDark ? '#F9FAFB' : '#111827' }}>{value || '-'}</span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}>
                    <span style={{ fontSize: '24px' }}>🔍</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827', marginBottom: '6px' }}>ตรวจสอบข้อมูล</h2>
                <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280' }}>กรุณาตรวจสอบข้อมูลก่อนดำเนินการต่อ</p>
            </div>

            {/* Plant & Service */}
            <SectionCard title="ประเภทคำขอ" icon="🌿" editStep={0}>
                <InfoRow label="พืชสมุนไพร" value={plant ? `${plant.icon} ${plant.name}` : undefined} />
                <InfoRow label="ประเภทบริการ" value={state.serviceType === 'NEW' ? 'ขอรับรองใหม่' : state.serviceType === 'RENEWAL' ? 'ต่ออายุ' : state.serviceType === 'MODIFY' ? 'แก้ไขข้อมูล' : 'ทดแทน'} />
            </SectionCard>

            {/* Applicant */}
            <SectionCard title="ผู้ยื่นคำขอ" icon="👤" editStep={4}>
                <InfoRow label="ประเภทผู้ยื่น" value={state.applicantData?.applicantType === 'INDIVIDUAL' ? 'บุคคลธรรมดา' : state.applicantData?.applicantType === 'JURISTIC' ? 'นิติบุคคล' : 'วิสาหกิจชุมชน'} />
                <InfoRow label="ชื่อ" value={state.applicantData?.applicantType === 'INDIVIDUAL' ? `${state.applicantData?.firstName} ${state.applicantData?.lastName}` : state.applicantData?.companyName} />
                <InfoRow label="โทรศัพท์" value={state.applicantData?.phone} />
                <InfoRow label="อีเมล" value={state.applicantData?.email} />
            </SectionCard>

            {/* Site */}
            <SectionCard title="สถานที่" icon="📍" editStep={5}>
                <InfoRow label="ชื่อสถานที่" value={state.siteData?.siteName} />
                <InfoRow label="จังหวัด" value={state.siteData?.province} />
                <InfoRow label="พิกัด GPS" value={state.siteData?.gpsLat && state.siteData?.gpsLng ? `${state.siteData.gpsLat}, ${state.siteData.gpsLng}` : undefined} />
            </SectionCard>

            {/* Production */}
            <SectionCard title="การผลิต" icon="🌱" editStep={6}>
                <InfoRow label="สายพันธุ์" value={state.productionData?.varietyName} />
                <InfoRow label="ปริมาณ" value={state.productionData?.quantityWithUnit} />
                <InfoRow label="ใบรับรอง" value={[state.productionData?.hasGAPCert && 'GAP', state.productionData?.hasOrganicCert && 'Organic'].filter(Boolean).join(', ') || 'ไม่มี'} />
            </SectionCard>

            {/* Documents */}
            <SectionCard title="เอกสาร" icon="📄" editStep={7}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 600 }}>
                        {uploadedDocs}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#F9FAFB' : '#111827' }}>อัปโหลดแล้ว {uploadedDocs} รายการ</div>
                        <div style={{ fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' }}>จากทั้งหมด 22 รายการ</div>
                    </div>
                </div>
            </SectionCard>

            {/* Confirmation */}
            <div style={{ background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB', border: '1px solid #F59E0B', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#B45309', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>⚠️</span>
                    <span>กรุณาตรวจสอบข้อมูลให้ครบถ้วน หากข้อมูลไม่ถูกต้อง กดปุ่ม "แก้ไข" เพื่อกลับไปแก้ไข</span>
                </p>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`, background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    ย้อนกลับ
                </button>
                <button onClick={handleNext} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}>
                    💳 ไปชำระเงิน
                </button>
            </div>
        </div>
    );
}
