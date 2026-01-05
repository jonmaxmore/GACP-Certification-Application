"use client";

import { useRef } from "react";

interface ReceiptDocumentProps {
    receiptNumber: string;
    receiptDate: string;
    invoiceReference: string;
    quotationReference: string;
    applicantName: string;
    applicantCompany?: string;
    applicantTaxId?: string;
    applicantAddress: string;
    receiptPhase: 1 | 2;
    amount: number;
    amountText: string;
    paymentMethod: string;
    paymentDate: string;
    officerName?: string;
    officerPosition?: string;
}

// DTAM Official Colors
const colors = {
    headerBg: "#34C759",  // Green for success/receipt
    headerText: "#FFFFFF",
    tableBorder: "#000000",
    tableHeaderBg: "#808080",
    text: "#000000",
    success: "#34C759",
};

export default function ReceiptDocument({
    receiptNumber,
    receiptDate,
    invoiceReference,
    quotationReference,
    applicantName,
    applicantCompany,
    applicantTaxId,
    applicantAddress,
    receiptPhase,
    amount,
    amountText,
    paymentMethod,
    paymentDate,
    officerName = "นายปรีชา หนูทิม",
    officerPosition = "ผู้อำนวยการกองกัญชาทางการแพทย์",
}: ReceiptDocumentProps) {
    const documentRef = useRef<HTMLDivElement>(null);

    const formatAmount = (amt: number) => {
        return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amt);
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
                id="receipt-document"
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
                        ใบเสร็จรับเงิน
                    </div>
                </div>

                {/* Document Info */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <div style={{ textAlign: "right", fontSize: "12pt" }}>
                        <div>เลขที่: <strong>{receiptNumber}</strong></div>
                        <div>วันที่: <strong>{receiptDate}</strong></div>
                        <div>อ้างอิงใบแจ้งหนี้: <strong>{invoiceReference}</strong></div>
                        <div>อ้างอิงใบเสนอราคา: <strong>{quotationReference}</strong></div>
                    </div>
                </div>

                {/* Success Banner */}
                <div style={{
                    backgroundColor: "#E8F5E9",
                    border: "2px solid #34C759",
                    borderRadius: "8px",
                    padding: "16px 24px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                }}>
                    <div style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
                    <div>
                        <div style={{ fontSize: "18pt", fontWeight: 700, color: colors.success }}>ชำระเงินเรียบร้อยแล้ว</div>
                        <div style={{ fontSize: "12pt", color: "#666" }}>Payment Successful</div>
                    </div>
                </div>

                {/* Applicant Info */}
                <div style={{ marginBottom: "24px", fontSize: "12pt" }}>
                    <div><strong>ได้รับเงินจาก:</strong></div>
                    <div style={{ marginLeft: "16px", marginTop: "8px" }}>
                        <div>{applicantName}</div>
                        {applicantCompany && <div>{applicantCompany}</div>}
                        {applicantTaxId && <div>เลขประจำตัวผู้เสียภาษี: {applicantTaxId}</div>}
                        <div>ที่อยู่: {applicantAddress}</div>
                    </div>
                </div>

                {/* Payment Details Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "12pt" }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.tableHeaderBg, color: "#FFF" }}>
                            <th style={{ border: "1px solid #000", padding: "12px", textAlign: "left" }}>รายการ</th>
                            <th style={{ border: "1px solid #000", padding: "12px", width: "25%", textAlign: "right" }}>จำนวนเงิน (บาท)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ border: "1px solid #000", padding: "12px" }}>
                                {receiptPhase === 1
                                    ? "ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น (งวดที่ 1)"
                                    : "ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน (งวดที่ 2)"
                                }
                            </td>
                            <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right", fontWeight: 700 }}>
                                {formatAmount(amount)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right", fontWeight: 700 }}>
                                รวมเงินทั้งสิ้น
                            </td>
                            <td style={{ border: "1px solid #000", padding: "12px", textAlign: "right", fontWeight: 700, fontSize: "14pt" }}>
                                {formatAmount(amount)}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ border: "1px solid #000", padding: "12px", textAlign: "center" }}>
                                ({amountText})
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Payment Method */}
                <div style={{ marginBottom: "24px", fontSize: "12pt", backgroundColor: "#F5F5F5", padding: "16px", borderRadius: "4px" }}>
                    <div><strong>วิธีการชำระเงิน:</strong> {paymentMethod}</div>
                    <div><strong>วันที่ชำระเงิน:</strong> {paymentDate}</div>
                    <div><strong>เข้าบัญชี:</strong> เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร (ธนาคารกรุงไทย 4750134376)</div>
                </div>

                {/* Note */}
                <div style={{ marginBottom: "32px", fontSize: "11pt", fontStyle: "italic", color: "#666" }}>
                    <p>* ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์ต่อเมื่อธนาคารได้เรียกเก็บเงินเรียบร้อยแล้ว</p>
                    <p>* หากต้องการใบกำกับภาษี กรุณาติดต่อกองกัญชาทางการแพทย์</p>
                </div>

                {/* Signature */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "48px", fontSize: "12pt" }}>
                    <div style={{ width: "50%", textAlign: "center" }}>
                        <div>ในนาม กองกัญชาทางการแพทย์</div>
                        <div style={{ marginTop: "48px" }}>
                            <div>.............................................</div>
                            <div>( {officerName} )</div>
                            <div>ตำแหน่ง {officerPosition}</div>
                            <div>ปฏิบัติราชการแทน อธิบดีกรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div>วันที่ {receiptDate}</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: "48px", borderTop: "2px solid #ccc", paddingTop: "16px", fontSize: "10pt", color: "#666", textAlign: "center" }}>
                    <div>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข</div>
                    <div>เลขประจำตัวผู้เสียภาษี: 0994000036540</div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                @media print {
                    body * { visibility: hidden; }
                    #receipt-document, #receipt-document * { visibility: visible; }
                    #receipt-document { position: absolute; left: 0; top: 0; width: 210mm; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

// Demo Receipt
export function ReceiptDocumentDemo() {
    return (
        <ReceiptDocument
            receiptNumber="REC-2568120001"
            receiptDate="3 ธันวาคม 2568"
            invoiceReference="GI-021268017"
            quotationReference="G-011268017"
            applicantName="ประธานกรรมการ บริษัท สมุก ครูว จำกัด"
            applicantCompany="บริษัท สมุก ครูว จำกัด"
            applicantTaxId="0835566002415"
            applicantAddress="เลขที่ 209/44 หมู่ 5 ต.เกาะแก้ว ชะอำ อ.อกอลาง จ.หมู่กลูเกลต 83110"
            receiptPhase={1}
            amount={5000}
            amountText="ห้าพันบาทถ้วน"
            paymentMethod="โอนเงินผ่านธนาคาร (PromptPay QR Code)"
            paymentDate="3 ธันวาคม 2568 เวลา 14:32 น."
        />
    );
}

