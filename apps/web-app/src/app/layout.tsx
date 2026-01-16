import type { Metadata } from "next";
import { Kanit, Sarabun, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/services/auth-provider";
import SystemGuard from "@/components/system-guard";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
  description: "ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร ประเทศไทย บริหาราร่วมกับระบบ DTAM",
  keywords: "GACP, ผลิตพืชสมุนไพร, รับรองมาตรฐาน, การเกษตรกรรม, ประเทศไทย, DTAM, มาตรฐาน",
  authors: [{ name: "GACP Platform" }],
  creator: "GACP Platform",
  publisher: "GACP Platform",
  formatDetection: { email: "support@gacp-platform.com" },
  metadataBase: new URL("https://gacp-platform.com"),
  alternates: {
    canonical: "https://gacp-platform.com",
    languages: {
      "th": "https://gacp-platform.com/th",
      "en": "https://gacp-platform.com/en",
    },
  },
  openGraph: {
    title: "GACP - ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร",
    description: "ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร ประเทศไทย",
    url: "https://gacp-platform.com",
    siteName: "GACP Platform",
    images: [
      {
        url: "https://gacp-platform.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GACP Platform - ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GACP - ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร",
    description: "ระบบรับรองมาตรฐานการผลิตพืชสมุนไพร ประเทศไทย",
    images: ["https://gacp-platform.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: {
      other: {
        content: "your-google-verification-code",
      },
    },
  },
};
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
          <LanguageProvider>
            <SystemGuard>
              {children}
            </SystemGuard>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

