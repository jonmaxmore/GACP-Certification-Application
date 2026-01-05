"use client";

import { useRef } from "react";
import { useInvoice, DEFAULT_FEES } from "@/hooks/use-pricing";

interface InvoiceDocumentProps {
    invoiceNumber: string;
    invoiceDate: string;
    quotationReference: string;
    applicantName: string;
    applicantCompany?: string;
    applicantTaxId?: string;
    applicantAddress: string;
    applicantPhone?: string;
    invoicePhase: 1 | 2;  // งวด 1 = 5,000 บาท, งวด 2 = 25,000 บาท
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
    }>;
    totalAmount: number;
    totalAmountText: string;
    officerName?: string;
    officerPosition?: string;
}

// DTAM Official Colors
const colors = {
    headerBg: "#4472C4",
    headerText: "#FFFFFF",
    tableBorder: "#000000",
    tableHeaderBg: "#808080",
    text: "#000000",
};

export default function InvoiceDocument({
    invoiceNumber,
    invoiceDate,
    quotationReference,
    applicantName,
    applicantCompany,
    applicantTaxId,
    applicantAddress,
    applicantPhone,
    invoicePhase,
    items,
    totalAmount,
    totalAmountText,
    officerName = "นายรชต โมฆพันธุ์",
    officerPosition = "นักวิชาการสาธารณสุข",
}: InvoiceDocumentProps) {
    const documentRef = useRef<HTMLDivElement>(null);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ backgroundColor: "#F5F5F5", padding: "24px", minHeight: "100vh" }}>
            {/* Print Button */}
            <div style={{ maxWidth: "210mm", margin: "0 auto 16px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                    onClick={handlePrint}
                    style={{
                        padding: "12px 24px", backgroundColor: "#34C759", color: "#FFF",
                        border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer"
                    }}
                >
                    พิมพ์เอกสาร / ดาวน์โหลด PDF
                </button>
            </div>

            {/* Document */}
            <div
                ref={documentRef}
                id="invoice-document"
                style={{
                    width: "210mm",
                    minHeight: "297mm",
                    margin: "0 auto",
                    backgroundColor: "#FFFFFF",
                    padding: "20mm",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif",
                    fontSize: "14pt",
                    lineHeight: 1.4,
                    color: colors.text,
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    {/* Left: Logo + Department Info */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", textAlign: "center" }}>
                            กรมการ<br />แพทย์<br />แผนไทยฯ
                        </div>
                        <div style={{ fontSize: "12pt" }}>
                            <div style={{ fontWeight: 700, fontSize: "14pt" }}>กองกัญชาทางการแพทย์</div>
                            <div>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div style={{ fontSize: "11pt" }}>88/23 หมู่ 4 ถนนติวานนท์ ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</div>
                            <div style={{ fontSize: "11pt" }}>โทรศัพท์ (02) 5647889 หรือ 061-4219701 อีเมล tdc.cannabis.gacp@gmail.com</div>
                        </div>
                    </div>

                    {/* Right: Document Type Badge */}
                    <div style={{ backgroundColor: colors.headerBg, color: colors.headerText, padding: "8px 20px", fontWeight: 700, fontSize: "16pt" }}>
                        ใบวางบิล/ใบแจ้งหนี้
                    </div>
                </div>

                {/* Document Info */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <div style={{ textAlign: "right", fontSize: "12pt" }}>
                        <div>ที่ว. 18 ธันวาคม 2568</div>
                        <div>เลขที่เอกสาร: <strong>{invoiceNumber}</strong></div>
                        <div>วันที่: <strong>{invoiceDate}</strong></div>
                        <div>เลขเสนอราคาเลขที่: <strong>{quotationReference}</strong></div>
                    </div>
                </div>

                {/* Applicant Info */}
                <div style={{ marginBottom: "16px", fontSize: "12pt" }}>
                    <div><strong>เรียน</strong> {applicantName}</div>
                    {applicantCompany && <div><strong>หน่วยงาน/ผู้รับบริการ:</strong> {applicantCompany}</div>}
                    {applicantTaxId && <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> {applicantTaxId}</div>}
                    <div><strong>ที่อยู่:</strong> {applicantAddress}</div>
                    {applicantPhone && <div><strong>ผู้ประสานงาน:</strong> {applicantPhone}</div>}
                </div>

                {/* Description */}
                <div style={{ marginBottom: "16px", fontSize: "12pt" }}>
                    <p>
                        กองกัญชาทางการแพทย์ขอส่งใบวางบิล/ใบแจ้งหนี้ ดังรายการต่อไปนี้
                    </p>
                </div>

                {/* Items Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "12pt" }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.tableHeaderBg, color: "#FFF" }}>
                            <th style={{ border: "1px solid #000", padding: "8px", width: "8%", textAlign: "center" }}>ลำดับที่</th>
                            <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>รายการ</th>
                            <th style={{ border: "1px solid #000", padding: "8px", width: "12%", textAlign: "center" }}>จำนวน</th>
                            <th style={{ border: "1px solid #000", padding: "8px", width: "12%", textAlign: "center" }}>หน่วย</th>
                            <th style={{ border: "1px solid #000", padding: "8px", width: "15%", textAlign: "center" }}>ราคา/<br />หน่วย</th>
                            <th style={{ border: "1px solid #000", padding: "8px", width: "15%", textAlign: "center" }}>จำนวนเงิน<br />(บาท)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{index + 1}.</td>
                                <td style={{ border: "1px solid #000", padding: "8px" }}>{item.description}</td>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>ต่อคำขอ</td>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{formatAmount(item.unitPrice)}</td>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{formatAmount(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={4} style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
                                ({totalAmountText})
                            </td>
                            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontWeight: 700 }}>จำนวนเงินทั้งสิ้น</td>
                            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right", fontWeight: 700 }}>{formatAmount(totalAmount)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Payment Instructions */}
                <div style={{ marginBottom: "24px", fontSize: "11pt", backgroundColor: "#F9F9F9", padding: "16px", borderRadius: "4px" }}>
                    <div style={{ fontWeight: 700, marginBottom: "8px" }}>หมายเหตุ:</div>
                    <div>1. การชำระเงิน : ภายใน 3 วัน หลังได้รับใบวางบิล/ใบแจ้งหนี้</div>
                    <div style={{ marginTop: "8px", marginLeft: "16px" }}>
                        <strong>โอนเงินเข้าบัญชี</strong><br />
                        ชื่อบัญชี: <strong>เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</strong><br />
                        บัญชีธนาคารกรุงไทย เลขที่ <strong>4750134376</strong> สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต<br />
                        เลขประจำตัวผู้เสียภาษี <strong>0994000036540</strong>
                    </div>
                    <div style={{ marginTop: "12px", color: "#D32F2F" }}>
                        <strong>กรณีทำเช็คสั่งจ่ายในนาม:</strong> เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร
                    </div>
                    <div style={{ marginTop: "8px" }}>
                        2. ชื่อ-ที่อยู่ในการออกใบเสร็จรับเงิน และการส่งหลักฐานชำระเงิน :<br />
                        เมื่อชำระเงินแล้วกรุณาส่ง ชื่อ-ที่อยู่ในการออกใบเสร็จ พร้อมแนบเอกสารหลักฐานชำระเงิน<br />
                        มายัง กองพัฒนายาแผนไทยและสมุนไพร ทาง Google Form
                    </div>
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "12pt" }}>
                    {/* Left: Receiver Signature */}
                    <div style={{ width: "30%", textAlign: "center" }}>
                        <div style={{ fontWeight: 700, marginBottom: "8px" }}>ผู้รับบริการ</div>
                        <div style={{ marginTop: "40px" }}>
                            <div>.............................................</div>
                            <div>(............................................)</div>
                            <div>ตำแหน่ง............................</div>
                            <div>วันที่........../............./.............</div>
                            <div>{applicantCompany}</div>
                        </div>
                    </div>

                    {/* Center: DTAM Officer Signature */}
                    <div style={{ width: "30%", textAlign: "center" }}>
                        <div style={{ fontWeight: 700, marginBottom: "8px" }}>ผู้ให้บริการ</div>
                        <div style={{ marginTop: "40px" }}>
                            <div>.............................................</div>
                            <div>( {officerName} )</div>
                            <div>ตำแหน่ง {officerPosition}</div>
                            <div>วันที่........../............./.............</div>
                            <div>กองกัญชาทางการแพทย์</div>
                        </div>
                    </div>

                    {/* Right: Director Signature */}
                    <div style={{ width: "30%", textAlign: "center" }}>
                        <div style={{ fontWeight: 700, marginBottom: "8px" }}>ผู้มีอำนาจลงนาม</div>
                        <div style={{ marginTop: "40px" }}>
                            <div>.............................................</div>
                            <div>( นายปรีชา หนูทิม )</div>
                            <div>ตำแหน่ง ผู้อำนวยการกองกัญชาทางการแพทย์</div>
                            <div>ปฏิบัติราชการแทน อธิบดีกรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div>วันที่........../............./.............</div>
                            <div>กองกัญชาทางการแพทย์</div>
                        </div>
                    </div>
                </div>

                {/* QR Code placeholder */}
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "80px", height: "80px", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", textAlign: "center" }}>
                        [QR Code<br />PromptPay]
                    </div>
                    <div style={{ fontSize: "11pt" }}>กรุณาสแกนคิวอาร์โค้ด</div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                @media print {
                    body * { visibility: hidden; }
                    #invoice-document, #invoice-document * { visibility: visible; }
                    #invoice-document { position: absolute; left: 0; top: 0; width: 210mm; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

// Demo with Phase 1 invoice - fetches price from API (One Brain, Many Faces)
export function InvoiceDocumentDemoPhase1() {
    const { invoice, loading, error } = useInvoice('phase1');

    // Use API data or fallback
    const amount = invoice?.amount ?? DEFAULT_FEES.applicationFee;
    const description = invoice?.description ?? 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น';

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <div>กำลังโหลดข้อมูลใบแจ้งหนี้...</div>
            </div>
        );
    }

    if (error) {
        console.warn('Using fallback prices for Phase 1:', error);
    }

    return (
        <InvoiceDocument
            invoiceNumber="GI-021268017"
            invoiceDate="2 ธันวาคม 2568"
            quotationReference="G-011268017"
            applicantName="ประธานกรรมการ บริษัท สมุก ครูว จำกัด"
            applicantCompany="บริษัท สมุก ครูว จำกัด"
            applicantTaxId="0835566002415"
            applicantAddress="เลขที่ 209/44 หมู่ 5 ต.เกาะแก้ว ชะอำ อ.อกอลาง จ.หมู่กลูเกลต 83110"
            applicantPhone="คุณบุญจวบริทนร์ ปวงรี โทรศัพท์ 0851914649"
            invoicePhase={1}
            items={[
                { description, quantity: 1, unitPrice: amount },
            ]}
            totalAmount={amount}
            totalAmountText="ห้าพันบาทถ้วน"
        />
    );
}

// Demo with Phase 2 invoice - fetches price from API (One Brain, Many Faces)
export function InvoiceDocumentDemoPhase2() {
    const { invoice, loading, error } = useInvoice('phase2');

    // Use API data or fallback
    const amount = invoice?.amount ?? DEFAULT_FEES.inspectionFee;
    const description = invoice?.description ?? 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน';

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <div>กำลังโหลดข้อมูลใบแจ้งหนี้...</div>
            </div>
        );
    }

    if (error) {
        console.warn('Using fallback prices for Phase 2:', error);
    }

    return (
        <InvoiceDocument
            invoiceNumber="GI-021268018"
            invoiceDate="15 ธันวาคม 2568"
            quotationReference="G-011268017"
            applicantName="ประธานกรรมการ บริษัท สมุก ครูว จำกัด"
            applicantCompany="บริษัท สมุก ครูว จำกัด"
            applicantTaxId="0835566002415"
            applicantAddress="เลขที่ 209/44 หมู่ 5 ต.เกาะแก้ว ชะอำ อ.อกอลาง จ.หมู่กลูเกลต 83110"
            applicantPhone="คุณบุญจวบริทนร์ ปวงรี โทรศัพท์ 0851914649"
            invoicePhase={2}
            items={[
                { description, quantity: 1, unitPrice: amount },
            ]}
            totalAmount={amount}
            totalAmountText="สองหมื่นห้าพันบาทถ้วน"
        />
    );
}


