"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * 🍎 GACP Loading Page - Liquid Glass Design
 * Based on Apple HIG and Ministry of Public Health branding
 * 
 * Features:
 * - Sage green gradient background (สีเขียว Sage)
 * - Ministry of Public Health logo centered
 * - Liquid Glass translucent loading bar
 * - SF Pro typography
 * - Auto-redirect to login after loading complete
 */

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("กำลังเริ่มต้นระบบ...");

  useEffect(() => {
    // Simulate loading progress
    const loadingSteps = [
      { progress: 20, text: "กำลังโหลดข้อมูล GACP..." },
      { progress: 40, text: "กำลังตรวจสอบการเชื่อมต่อ..." },
      { progress: 60, text: "กำลังเตรียมระบบ..." },
      { progress: 80, text: "กำลังโหลดส่วนประกอบ..." },
      { progress: 100, text: "พร้อมใช้งาน!" },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        // Redirect to login after a brief pause
        setTimeout(() => {
          router.push("/login");
        }, 500);
      }
    }, 600);

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
        // Sage Green Gradient Background
        background: "linear-gradient(180deg, #A8B5A0 0%, #8FA085 50%, #7A8C70 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        padding: "24px",
      }}
    >
      {/* Ministry Logo */}
      <div
        style={{
          width: "180px",
          height: "180px",
          marginBottom: "48px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        <Image
          src="/images/moph-logo.png"
          alt="กระทรวงสาธารณสุข"
          width={160}
          height={160}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Liquid Glass Loading Bar Container */}
      <div
        style={{
          width: "min(320px, 80vw)",
          height: "16px",
          borderRadius: "16px",
          // Liquid Glass effect - translucent background
          background: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        {/* Progress Bar - Neon Green */}
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: "16px",
            // Neon green gradient
            background: "linear-gradient(90deg, #7FFF00 0%, #00FF7F 50%, #7FFF00 100%)",
            boxShadow: "0 0 12px rgba(127, 255, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Loading Text - SF Pro style, white */}
      <p
        style={{
          color: "#FFFFFF",
          fontSize: "17px",
          fontWeight: 500,
          letterSpacing: "0.5px",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {loadingText}
      </p>

      {/* Percentage */}
      <p
        style={{
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          fontWeight: 400,
          marginTop: "8px",
        }}
      >
        {progress}%
      </p>

      {/* Footer Text */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "13px",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          ระบบรับรองมาตรฐาน GACP
        </p>
        <p style={{ margin: "4px 0 0 0", fontWeight: 400 }}>
          กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    50% {
                        transform: scale(1.02);
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
    </div>
  );
}
