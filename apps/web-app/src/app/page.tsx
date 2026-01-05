"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * GACP Loading Page - Eco-Premium Design System (2025)
 * 
 * Design: Apple HIG + Thai Government CI
 * Colors: Emerald primary, Stone background
 */

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("กำลังเริ่มต้นระบบ...");

  useEffect(() => {
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
        setTimeout(() => router.push("/login"), 400);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-6 relative overflow-hidden font-sans">
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(16,185,129,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* DTAM Logo */}
      <div className="mb-12 flex items-center justify-center animate-scale-in drop-shadow-lg">
        <Image
          src="/images/dtam-logo.png"
          alt="กรมการแพทย์แผนไทยและการแพทย์ทางเลือก"
          width={200}
          height={240}
          className="object-contain max-w-[60vw] h-auto"
          priority
        />
      </div>

      {/* Liquid Glass Loading Bar */}
      <div className="w-[min(320px,80vw)] h-5 rounded-2xl bg-white/25 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden mb-5 relative border border-white/30">
        {/* Glass reflection */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl pointer-events-none" />

        {/* Progress Fill */}
        <div
          className="h-full rounded-2xl bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 shadow-[0_0_16px_rgba(16,185,129,0.5),0_0_32px_rgba(16,185,129,0.25)] transition-all duration-400 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Status Text */}
      <p className="text-primary-700 text-lg font-medium tracking-wide text-center animate-fade-in">
        {statusText}
      </p>

      {/* Progress Percentage */}
      <p className="text-primary-600 text-sm font-normal mt-2 tabular-nums">
        {progress}%
      </p>

      {/* Footer Branding */}
      <div className="fixed bottom-8 text-center text-primary-600 text-sm animate-fade-in">
        <p className="font-semibold m-0">ระบบรับรองมาตรฐาน GACP</p>
        <p className="font-normal text-xs mt-1 text-slate-500">
          กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
