"use client";

import { useRef } from "react";
import { usePricing, generateQuotationItems, DEFAULT_FEES } from "@/hooks/use-pricing";

interface QuotationDocumentProps {
    quotationNumber: string;
    quotationDate: string;
    applicantName: string;
    applicantCompany?: string;
    applicantTaxId?: string;
    applicantAddress: string;
    applicantPhone?: string;
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

export default function QuotationDocument({
    quotationNumber,
    quotationDate,
    applicantName,
    applicantCompany,
    applicantTaxId,
    applicantAddress,
    applicantPhone,
    items,
    totalAmount,
    totalAmountText,
    officerName = "นายปรีชา หนูทิม",
    officerPosition = "ผู้อำนวยการกองกัญชาทางการแพทย์",
}: QuotationDocumentProps) {
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
                        {/* DTAM Logo placeholder */}
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
                        ใบเสนอราคา
                    </div>
                </div>

                {/* Document Info */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <div style={{ textAlign: "right", fontSize: "12pt" }}>
                        <div>ที่ว. 16 ธันวาคม 2568</div>
                        <div>เลขที่เอกสาร: <strong>{quotationNumber}</strong></div>
                        <div>วันที่เอกสาร: <strong>{quotationDate}</strong></div>
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
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก โดยกองกัญชาทางการแพทย์
                        มีความยินดีที่จะเสนอราคาค่าบริการตรวจประเมินและรับรองมาตรฐานการเพาะปลูกและเก็บเกี่ยว
                        ที่ดีของพืชกัญชา (Good Agricultural and Collection Practices) ดังรายการต่อไปนี้
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
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{formatAmount(item.unitPrice)},-</td>
                                <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right" }}>{formatAmount(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={4} style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>
                                ({totalAmountText})
                            </td>
                            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center", fontWeight: 700 }}>จำนวนเงินทั้งสิ้น</td>
                            <td style={{ border: "1px solid #000", padding: "8px", textAlign: "right", fontWeight: 700 }}>{formatAmount(totalAmount)},-</td>
                        </tr>
                    </tbody>
                </table>

                {/* Verification Note */}
                <div style={{ marginBottom: "24px", fontSize: "11pt" }}>
                    <p>ทั้งนี้ท่านได้ตรวจสอบรายการจำนวนและราคาข้างต้นเรียบร้อยแล้ว</p>
                </div>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "12pt" }}>
                    {/* Left: Applicant Signature */}
                    <div style={{ width: "45%", textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #000", marginBottom: "8px", paddingTop: "8px" }}>
                            ยืนยันคำขอรับการตรวจสอบและประเมิน
                        </div>
                        <div style={{ marginTop: "40px" }}>
                            <div>.............................................</div>
                            <div>(...............................................)</div>
                            <div>ตำแหน่ง..............................................</div>
                            <div>วันที่........../............./.............</div>
                            <div style={{ fontWeight: 700, marginTop: "8px" }}>ผู้อนุมัติคำขอ</div>
                        </div>
                    </div>

                    {/* Right: DTAM Officer Signature */}
                    <div style={{ width: "45%", textAlign: "center" }}>
                        <div style={{ borderTop: "1px solid #000", marginBottom: "8px", paddingTop: "8px" }}>
                            ในนาม กองกัญชาทางการแพทย์
                        </div>
                        <div style={{ marginTop: "40px" }}>
                            <div>.............................................</div>
                            <div>( {officerName} )</div>
                            <div>ตำแหน่ง {officerPosition}</div>
                            <div>ปฏิบัติราชการแทน อธิบดีกรมการแพทย์แผนไทยและการแพทย์ทางเลือก</div>
                            <div>วันที่........../............./.............</div>
                            <div style={{ fontWeight: 700, marginTop: "8px" }}>(ผู้เสนอราคา)</div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div style={{ marginTop: "32px", fontSize: "10pt", borderTop: "1px solid #ccc", paddingTop: "16px" }}>
                    <div><strong>หมายเหตุ:</strong> เนื่องจาก บริจิตอัล สมุก ว่ากิจ ยืนยอกสารเมื่อวันที่ 6 สิงหาคม 2568 จึงสมควรได้รับการอนุมัติตราสารงบประมาณเบิก กองพัฒนายาและสมุนไพร</div>
                    <div>ณ วันที่ 26 มิถุนายน 2568</div>
                    <div style={{ marginTop: "8px" }}><strong>เงื่อนไขการชำระเงิน:</strong> กรุณาชำระเงินภายใน 3 วัน</div>
                    <div>ส่งเอกสารชุดคำขอผ่าน 2 ช่องทาง ทางไปรษณีย์หรืออีเมที่ระบุตามด้วยทางเอง</div>
                    <div><strong>ชื่อบัญชี:</strong> เงินบำรุงศูนย์พัฒนายาไทยและสมุนไพร</div>
                    <div><strong>บัญชีธนาคารกรุงไทย</strong> เลขที่ 4750134376 สาขามหาวิทยาลัยธรรมศาสตร์ รังสิต</div>
                    <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> 0994000036540</div>
                </div>

                {/* QR Code placeholder */}
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "80px", height: "80px", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", textAlign: "center" }}>
                        [QR Code]
                    </div>
                    <div style={{ fontSize: "11pt" }}>กรุณาสแกนคิวอาร์โค้ด</div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
                @media print {
                    body * { visibility: hidden; }
                    #quotation-document, #quotation-document * { visibility: visible; }
                    #quotation-document { position: absolute; left: 0; top: 0; width: 210mm; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
}

// Demo component that fetches prices from API (One Brain, Many Faces)
export function QuotationDocumentDemo() {
    const { fees, loading, error } = usePricing();

    // Use API fees or fallback to defaults
    const items = generateQuotationItems(fees, true); // true = include inspection fee
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <div>กำลังโหลดข้อมูลราคา...</div>
            </div>
        );
    }

    if (error) {
        console.warn('Using fallback prices:', error);
    }

    return (
        <QuotationDocument
            quotationNumber="G-011268017"
            quotationDate="1 ธันวาคม 2568"
            applicantName="ประธานกรรมการ บริษัท สมุก ครูว จำกัด"
            applicantCompany="บริษัท สมุก ครูว จำกัด"
            applicantTaxId="0835566002415"
            applicantAddress="เลขที่ 209/44 หมู่ 5 ต.เกาะแก้ว ชะอำ อ.อกอลาง จ.หมู่กลูเกลต 83110"
            applicantPhone="คุณบุญจวบริทนร์ ปวงรี โทรศัพท์ 0851914649"
            items={items}
            totalAmount={totalAmount}
            totalAmountText="สามหมื่นบาทถ้วน"
        />
    );
}


