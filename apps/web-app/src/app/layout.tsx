import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import SystemGuard from "@/components/SystemGuard";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GACP - ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร",
  description: "กรมการแพทย์แผนไทยและการแพทย์ทางเลือก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sarabun antialiased`}>
        <SystemGuard>
          {children}
        </SystemGuard>
      </body>
    </html>
  );
}
