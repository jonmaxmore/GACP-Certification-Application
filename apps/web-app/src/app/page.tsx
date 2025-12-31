"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { colors } from "@/lib/design-tokens";

/**
 * 🍎 GACP Loading Page - Apple HIG Liquid Glass Design (2025)
 * 
 * Design Spec:
 * - Sage Green gradient background
 * - DTAM logo centered prominently  
 * - Liquid Glass loading bar (translucent, corner radius 16pt, neon green fill)
 * - SF Pro typography with "Loading GACP Data..." text
 * - Determinate progress with smooth animation
 * - Pharmaceutical grade trust aesthetic
 */

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("กำลังเริ่มต้นระบบ...");

  useEffect(() => {
    // Smooth determinate progress - 5 stages at 20% each
    const stages = [
      { progress: 20, text: "Loading GACP Data..." },
      { progress: 40, text: "กำลังตรวจสอบการเชื่อมต่อ..." },
      { progress: 60, text: "กำลังเตรียมข้อมูล..." },
      { progress: 80, text: "กำลังโหลดส่วนประกอบ..." },
      { progress: 100, text: "พร้อมใช้งาน!" },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress);
        setStatusText(stages[currentStage].text);
        currentStage++;
      } else {
        clearInterval(interval);
        // Redirect to login after brief pause
        setTimeout(() => {
          router.push("/login");
        }, 400);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // 🤍 White Background
        backgroundColor: "#FFFFFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle depth effect overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* 🏛️ Central Logo - DTAM */}
      <div
        style={{
          marginBottom: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeInScale 0.8s ease-out",
          filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))",
        }}
      >
        <Image
          src="/images/dtam-logo.png"
          alt="กรมการแพทย์แผนไทยและการแพทย์ทางเลือก"
          width={200}
          height={240}
          style={{
            objectFit: "contain",
            maxWidth: "60vw",
            height: "auto",
          }}
          priority
        />
      </div>

      {/* 💧 Liquid Glass Loading Bar */}
      <div
        style={{
          width: "min(320px, 80vw)",
          height: "20px",
          borderRadius: "16px",
          // Liquid Glass - Translucent frosted effect
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `
                        inset 0 2px 4px rgba(0, 0, 0, 0.1),
                        0 4px 16px rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(255, 255, 255, 0.3)
                    `,
          overflow: "hidden",
          marginBottom: "20px",
          position: "relative",
        }}
      >
        {/* Inner glass reflection */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
            borderRadius: "16px 16px 0 0",
            pointerEvents: "none",
          }}
        />

        {/* Neon Green Progress Fill */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: "16px",
            // Neon green with glow
            background: "linear-gradient(90deg, #7FFF00 0%, #00FF7F 50%, #7FFF00 100%)",
            boxShadow: `
                            0 0 16px rgba(127, 255, 0, 0.6),
                            0 0 32px rgba(127, 255, 0, 0.3),
                            inset 0 2px 4px rgba(255, 255, 255, 0.4)
                        `,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
          }}
        >
          {/* Shimmer animation on progress */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      </div>

      {/* 📝 Typography - SF Pro, Green */}
      <p
        style={{
          color: "#1B5E20",
          fontSize: "17px",
          fontWeight: 500,
          letterSpacing: "0.3px",
          margin: 0,
          textAlign: "center",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {statusText}
      </p>

      {/* Progress Percentage */}
      <p
        style={{
          color: "#2E7D32",
          fontSize: "14px",
          fontWeight: 400,
          marginTop: "8px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {progress}%
      </p>

      {/* Footer Branding */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          textAlign: "center",
          color: "#388E3C",
          fontSize: "13px",
          animation: "fadeIn 1s ease-out 0.5s both",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          ระบบรับรองมาตรฐาน GACP
        </p>
        <p style={{ margin: "4px 0 0 0", fontWeight: 400, fontSize: "12px" }}>
          กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.92);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
    </div>
  );
}
