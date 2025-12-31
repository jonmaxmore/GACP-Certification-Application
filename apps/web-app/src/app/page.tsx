"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * 🍎 GACP Loading Page - Simple White Design
 * White background with DTAM logo centered
 * Auto-redirect to login after loading
 */

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simple loading animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Redirect to login after loading complete
          setTimeout(() => {
            router.push("/login");
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 400);

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
        // White background
        backgroundColor: "#FFFFFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Sarabun', sans-serif",
        padding: "24px",
      }}
    >
      {/* DTAM Logo - Centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.8s ease-out",
        }}
      >
        <Image
          src="/images/dtam-logo.png"
          alt="กรมการแพทย์แผนไทยและการแพทย์ทางเลือก"
          width={300}
          height={350}
          style={{
            objectFit: "contain",
            maxWidth: "80vw",
            height: "auto",
          }}
          priority
        />
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
    </div>
  );
}
