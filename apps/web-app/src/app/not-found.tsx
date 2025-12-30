import Link from 'next/link';

/**
 * 🍎 Custom 404 Page
 * Apple-Standard "Page Not Found" with Thai locale
 */

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* Apple-style 404 illustration */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-6xl">🔍</span>
                </div>

                <h1 className="text-6xl font-bold text-emerald-600 mb-2">404</h1>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    ไม่พบหน้าที่ต้องการ
                </h2>

                <p className="text-gray-600 mb-8">
                    หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
                    <br />
                    กรุณาตรวจสอบ URL อีกครั้ง
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                        🏠 กลับหน้าแรก
                    </Link>
                    <Link
                        href="/tracking"
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        📋 ติดตามคำขอ
                    </Link>
                </div>

                {/* GACP branding */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        ระบบรับรองมาตรฐาน GACP
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
                    </p>
                </div>
            </div>
        </div>
    );
}
