"use client";

const colors = { primary: "#0D9488", primaryLight: "#0D948815", textDark: "#1E293B", textGray: "#64748B", border: "#E2E8F0" };

interface Props {
    consented: boolean;
    onConsent: (consented: boolean) => void;
}

export default function Step3PDPA({ consented, onConsent }: Props) {
    return (
        <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: colors.textDark, marginBottom: "8px" }}>นโยบายคุ้มครองข้อมูลส่วนบุคคล</h2>
            <p style={{ color: colors.textGray, fontSize: "14px", marginBottom: "24px" }}>กรุณาอ่านและยินยอมข้อกำหนด PDPA</p>

            <div style={{ maxHeight: "300px", overflowY: "auto", padding: "20px", backgroundColor: "#F8FAFC", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", lineHeight: 1.7, color: colors.textDark }}>
                <h3 style={{ marginBottom: "12px" }}>ประกาศความเป็นส่วนตัว</h3>
                <p style={{ marginBottom: "12px" }}>
                    บริษัทฯ ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ("PDPA")
                </p>

                <h4 style={{ marginTop: "16px", marginBottom: "8px" }}>ข้อมูลที่เก็บรวบรวม:</h4>
                <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                    <li>ชื่อ-นามสกุล, เลขบัตรประชาชน</li>
                    <li>ที่อยู่, เบอร์โทรศัพท์, อีเมล</li>
                    <li>ข้อมูลสถานประกอบการ, พิกัด GPS</li>
                    <li>เอกสารประกอบการยื่นคำขอ</li>
                </ul>

                <h4 style={{ marginTop: "16px", marginBottom: "8px" }}>วัตถุประสงค์:</h4>
                <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                    <li>ดำเนินการตามคำขอรับรองมาตรฐาน GACP</li>
                    <li>ติดต่อประสานงานเกี่ยวกับคำขอ</li>
                    <li>ปฏิบัติตามกฎหมายที่เกี่ยวข้อง</li>
                </ul>

                <h4 style={{ marginTop: "16px", marginBottom: "8px" }}>สิทธิของท่าน:</h4>
                <ul style={{ paddingLeft: "20px" }}>
                    <li>สิทธิในการเข้าถึงข้อมูลส่วนบุคคล</li>
                    <li>สิทธิในการแก้ไขข้อมูลให้ถูกต้อง</li>
                    <li>สิทธิในการขอลบข้อมูล</li>
                    <li>สิทธิในการคัดค้านการประมวลผล</li>
                </ul>
            </div>

            <label
                style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px", backgroundColor: consented ? colors.primaryLight : "#FFF", border: `1px solid ${consented ? colors.primary : colors.border}`, borderRadius: "12px", cursor: "pointer" }}
            >
                <input
                    type="checkbox"
                    checked={consented}
                    onChange={(e) => onConsent(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: colors.primary, marginTop: "2px" }}
                />
                <div>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: colors.textDark }}>
                        ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
                    </span>
                    <p style={{ fontSize: "13px", color: colors.textGray, marginTop: "4px" }}>
                        ตามวัตถุประสงค์ที่ระบุไว้ในประกาศความเป็นส่วนตัวข้างต้น
                    </p>
                </div>
            </label>

            {!consented && (
                <p style={{ marginTop: "16px", fontSize: "13px", color: "#DC2626" }}>
                    ⚠️ กรุณายินยอมข้อกำหนด PDPA เพื่อดำเนินการต่อ
                </p>
            )}
        </div>
    );
}
