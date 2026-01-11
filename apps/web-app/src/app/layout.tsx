import type { Metadata } from "next";
import { Kanit, Sarabun, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/services/auth-provider";
import SystemGuard from "@/components/system-guard";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body className={`${kanit.variable} ${sarabun.variable} ${inter.variable} font-kanit antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <SystemGuard>
            {children}
          </SystemGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

