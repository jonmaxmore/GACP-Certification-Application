"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore, PLANTS } from '../hooks/useWizardStore';

const FEE_PER_SITE_TYPE = 5000;

export default function Step10Invoice() {
    const router = useRouter();
    const { state, isLoaded } = useWizardStore();
    const [isDark, setIsDark] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => { setIsDark(localStorage.getItem("theme") === "dark"); }, []);
    useEffect(() => { if (isLoaded && !state.siteData) router.replace('/applications/new/step-0'); }, [isLoaded, state.siteData, router]);

    const siteTypesCount = state.siteTypes?.length || 1;
    const installment1Fee = FEE_PER_SITE_TYPE * siteTypesCount; // งวดที่ 1

    const docDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const quoteId = `G-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const invoiceId = `GI-${quoteId.slice(2)}`;

    const applicantName = state.applicantData?.applicantType === 'INDIVIDUAL'
        ? `${state.applicantData?.firstName || ''} ${state.applicantData?.lastName || ''}`
        : state.applicantData?.applicantType === 'COMMUNITY'
            ? state.applicantData?.communityName || ''
            : state.applicantData?.companyName || '';

    const taxId = state.applicantData?.registrationNumber || state.applicantData?.idCard || '-';

    const handleNext = () => router.push('/applications/new/step-11');
    const handleBack = () => router.push('/applications/new/step-9');
    const handlePrint = () => window.print();

    if (!isLoaded) return <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>กำลังโหลด...</div>;

    return (
        <div style={{ fontFamily: "'Kanit', sans-serif" }}>
            {/* Document Preview - Full Container */}
            <div id="print-area" style={{
                background: 'white', borderRadius: '8px', padding: '24px',
                marginBottom: '16px', border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1E3A5F', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <img src="/images/dtam-logo.png" alt="DTAM" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F' }}>กองกัญชาทางการแพทย์</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A5F' }}>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>88/23 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ อำเภอเมือง จังหวัดนนทบุรี 11000</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>โทรศัพท์ (02) 5647889 หรือ 061-4219701 อีเมล tdc.cannabis.gacp@gmail.com</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ background: '#1E3A5F', color: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}>ใบวางบิล/ใบแจ้งหนี้</div>
                        <div style={{ fontSize: '12px', marginTop: '6px', color: '#374151' }}>{docDate}</div>
                        <div style={{ fontSize: '12px', color: '#374151' }}>เลขที่: {invoiceId}</div>
                        <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600 }}>งวดที่ 1</div>
                    </div>
                </div>

                {/* Recipient Info */}
                <div style={{ fontSize: '13px', marginBottom: '16px', color: '#111827' }}>
                    <div style={{ marginBottom: '4px' }}><strong>เรียน</strong> ประธานกรรมการ {applicantName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <div><strong>หน่วยงานผู้รับบริการ:</strong> {applicantName}</div>
                        <div style={{ textAlign: 'right' }}><strong>เลขที่เอกสาร:</strong> {invoiceId}</div>
                        <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {taxId}</div>
                        <div style={{ textAlign: 'right' }}><strong>วันที่:</strong> {docDate}</div>
                    </div>
                    <div style={{ marginTop: '4px' }}><strong>ที่อยู่:</strong> {state.siteData?.address || '-'}, จ.{state.siteData?.province || '-'}</div>
                    <div><strong>ผู้ประสานงาน:</strong> {state.applicantData?.coordinatorName || applicantName} โทรศัพท์: {state.applicantData?.phone || '-'}</div>
                    <div><strong>ใบเสนอราคาเลขที่:</strong> {quoteId}</div>
                </div>

                {/* Installment Info */}
                <div style={{ fontSize: '12px', marginBottom: '16px', padding: '10px', background: '#DBEAFE', borderRadius: '6px', color: '#1E40AF' }}>
                    <strong>📋 งวดที่ 1:</strong> ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น (ชำระก่อนเริ่มตรวจสอบเอกสาร)
                </div>

                {/* Fee Table - งวดที่ 1 เท่านั้น */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '12px' }}>
                    <thead>
                        <tr style={{ background: '#4B5563', color: 'white' }}>
                            <th style={{ border: '1px solid #4B5563', padding: '8px', width: '8%' }}>ลำดับที่</th>
                            <th style={{ border: '1px solid #4B5563', padding: '8px' }}>รายการ</th>
                            <th style={{ border: '1px solid #4B5563', padding: '8px', width: '10%' }}>จำนวน</th>
                            <th style={{ border: '1px solid #4B5563', padding: '8px', width: '10%' }}>หน่วย</th>
                            <th style={{ border: '1px solid #4B5563', padding: '8px', width: '12%' }}>ราคา/หน่วย</th>
                            <th style={{ border: '1px solid #4B5563', padding: '8px', width: '14%' }}>จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'center' }}>1.</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px' }}>ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'center' }}>{siteTypesCount}</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'center' }}>ต่อคำขอ</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'right' }}>5,000.00</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'right' }}>{installment1Fee.toLocaleString()}.00</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#DBEAFE' }}>
                            <td colSpan={5} style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'right', fontWeight: 600 }}>ยอดชำระงวดที่ 1</td>
                            <td style={{ border: '1px solid #E5E7EB', padding: '8px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>{installment1Fee.toLocaleString()}.00</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Thai text amount */}
                <div style={{ fontSize: '12px', marginBottom: '16px', color: '#1E40AF' }}>
                    ({installment1Fee === 5000 ? 'ห้าพันบาทถ้วน' : installment1Fee === 10000 ? 'หนึ่งหมื่นบาทถ้วน' : 'หนึ่งหมื่นห้าพันบาทถ้วน'})
                </div>

                {/* หมายเหตุ */}
                <div style={{ fontSize: '11px', marginBottom: '20px', padding: '12px', background: '#FEF3C7', borderRadius: '6px', lineHeight: 1.6 }}>
                    <strong>หมายเหตุ:</strong>
                    <div>1. การชำระเงิน: ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
                    <div style={{ paddingLeft: '16px' }}>โอนเงินเข้าบัญชี: <strong>ชื่อบัญชีเงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</strong></div>
                    <div style={{ paddingLeft: '16px' }}>บัญชีธนาคารกรุงไทย เลขที่ <strong>4750134376</strong> สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต</div>
                    <div style={{ paddingLeft: '16px' }}>เลขประจำตัวผู้เสียภาษี 0994000036540</div>
                    <div style={{ color: '#DC2626', marginTop: '4px' }}>กรณีโอนสิ่งจ่ายในนาม: เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</div>
                    <div style={{ marginTop: '4px' }}>2. ชื่อ-ที่อยู่ในการออกใบเสร็จรับเงิน และการส่งหลักฐานชำระเงิน:</div>
                    <div style={{ paddingLeft: '16px' }}>เมื่อชำระเงินแล้วกรุณาส่ง ชื่อ-ที่อยู่ในการออกใบเสร็จ พร้อมแนบเอกสารหลักฐานชำระเงิน</div>
                    <div style={{ paddingLeft: '16px' }}>มายังกองพัฒนายาแผนไทยและสมุนไพรทาง Google Form</div>
                </div>

                {/* Installment Summary */}
                <div style={{ fontSize: '11px', marginBottom: '16px', padding: '10px', background: '#F3F4F6', borderRadius: '6px' }}>
                    <strong>สรุปงวดชำระเงินทั้งหมด:</strong>
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#DBEAFE', padding: '4px 8px', borderRadius: '4px' }}>
                            <span>งวดที่ 1: ค่าตรวจเอกสาร</span>
                            <span style={{ fontWeight: 600 }}>฿{installment1Fee.toLocaleString()} ← ชำระครั้งนี้</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280', padding: '4px 8px' }}>
                            <span>งวดที่ 2: ค่ารับรอง (หลังตรวจผ่าน)</span>
                            <span>฿25,000 ชำระภายหลัง</span>
                        </div>
                    </div>
                </div>

                {/* Signature Section - 3 Columns */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1, textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>ผู้รับบริการ</div>
                        <div style={{ height: '50px', marginBottom: '8px' }}></div>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '11px' }}>
                            <div>({applicantName || '............................'})</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>ตำแหน่ง............................</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>วันที่......./......./.......</div>
                            <div style={{ fontWeight: 500, marginTop: '4px' }}>{applicantName}</div>
                        </div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>ผู้ให้บริการ</div>
                        <div style={{ height: '50px', marginBottom: '8px' }}></div>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '11px' }}>
                            <div>(นายรชต โมฆรมิตร)</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>ตำแหน่ง นักวิชาการสาธารณสุข</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>วันที่......./......./.......</div>
                            <div style={{ fontWeight: 500, marginTop: '4px' }}>กองกัญชาทางการแพทย์</div>
                        </div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}>ผู้มีอำนาจลงนาม</div>
                        <div style={{ height: '50px', marginBottom: '8px' }}></div>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '6px', fontSize: '11px' }}>
                            <div>(นายปริชา พนูทิม)</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>ผู้อำนวยการกองกัญชาทางการแพทย์</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>ปฏิบัติราชการแทน</div>
                            <div style={{ color: '#6B7280', fontSize: '10px' }}>วันที่......./......./.......</div>
                            <div style={{ fontWeight: 500, marginTop: '4px' }}>กองกัญชาทางการแพทย์</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Button */}
            <button onClick={handlePrint} style={{
                width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '12px',
                border: '1px solid #3B82F6', background: '#EFF6FF',
                color: '#1E40AF', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
                🖨️ พิมพ์
            </button>

            {/* Accept Checkbox */}
            <div style={{
                background: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF',
                border: '1px solid #3B82F6', borderRadius: '10px', padding: '14px', marginBottom: '14px',
            }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: '#3B82F6', marginTop: '2px' }} />
                    <span style={{ fontSize: '13px', color: isDark ? '#F9FAFB' : '#111827', fontWeight: 500 }}>
                        ข้าพเจ้ารับทราบใบวางบิลนี้และตกลงชำระเงินงวดที่ 1 (฿{installment1Fee.toLocaleString()})
                    </span>
                </label>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleBack} style={{
                    flex: 1, padding: '14px', borderRadius: '10px',
                    border: `1px solid ${isDark ? '#4B5563' : '#E5E7EB'}`,
                    background: isDark ? '#374151' : 'white', color: isDark ? '#F9FAFB' : '#374151',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                }}>ย้อนกลับ</button>
                <button onClick={handleNext} disabled={!accepted} style={{
                    flex: 2, padding: '14px', borderRadius: '10px', border: 'none',
                    background: accepted ? 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' : '#9CA3AF',
                    color: 'white', fontSize: '14px', fontWeight: 600, cursor: accepted ? 'pointer' : 'not-allowed',
                }}>
                    💳 ยอมรับและไปชำระเงิน
                </button>
            </div>

            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area {
                        position: absolute; left: 0; top: 0;
                        width: 100%; padding: 20mm !important;
                        margin: 0 !important; box-shadow: none !important;
                        border: none !important; border-radius: 0 !important;
                    }
                    @page { size: A4; margin: 10mm; }
                }
            `}</style>
        </div>
    );
}
