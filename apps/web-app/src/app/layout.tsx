import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import SystemGuard from "@/components/system-guard";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
      <body className={`${kanit.variable} font-kanit antialiased`} suppressHydrationWarning>
        <SystemGuard>
          {children}
        </SystemGuard>
      </body>
    </html>
  );
}

