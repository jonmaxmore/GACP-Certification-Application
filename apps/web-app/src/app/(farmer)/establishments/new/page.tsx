"use client";

import Link from "next/link";

const colors = { primary: "#1B5E20", background: "#F5F7FA", card: "#FFFFFF", textDark: "#1E293B", textGray: "#64748B", heroStart: "#1E293B", heroEnd: "#0F172A" };

export default function NewEstablishmentPage() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.background, fontFamily: "'Sarabun', sans-serif" }}>
            <div style={{ background: `linear-gradient(135deg, ${colors.heroStart}, ${colors.heroEnd})`, padding: "24px", color: "#FFF" }}>
                <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link href="/establishments" style={{ color: "#FFF", textDecoration: "none" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2"><path d="M15 18L9 12L15 6" /></svg>
                    </Link>
                    <h1 style={{ fontSize: "20px", fontWeight: 700 }}>เพิ่มแปลงปลูกใหม่</h1>
                </div>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
                <div style={{ backgroundColor: colors.card, borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
                    <form>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>ชื่อแปลงปลูก</label>
                            <input type="text" placeholder="แปลงสมุนไพรบ้านใหม่" style={{ width: "100%", padding: "14px 16px", border: "1px solid #E0E0E0", borderRadius: "12px", fontSize: "16px" }} />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>ที่อยู่</label>
                            <textarea placeholder="123 หมู่ 4 ต.บางนา อ.เมือง จ.สมุทรปราการ" style={{ width: "100%", padding: "14px 16px", border: "1px solid #E0E0E0", borderRadius: "12px", fontSize: "16px", minHeight: "100px", resize: "vertical" }}></textarea>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ fontSize: "13px", fontWeight: 600, color: colors.primary, display: "block", marginBottom: "8px" }}>พื้นที่ (ไร่)</label>
                            <input type="number" placeholder="10" style={{ width: "100%", padding: "14px 16px", border: "1px solid #E0E0E0", borderRadius: "12px", fontSize: "16px" }} />
                        </div>
                        <button type="submit" style={{ width: "100%", padding: "16px", backgroundColor: colors.primary, color: "#FFF", fontSize: "16px", fontWeight: 700, border: "none", borderRadius: "12px", cursor: "pointer" }}>บันทึกแปลงปลูก</button>
                    </form>
                </div>
            </div>

            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        </div>
    );
}
