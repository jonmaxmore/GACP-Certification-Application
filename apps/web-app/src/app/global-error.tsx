'use client';

/**
 * 🍎 Custom 500 Error Page
 * Apple-Standard Global Error Handler with Thai locale
 */

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        {/* Apple-style error illustration */}
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-6xl">⚠️</span>
                        </div>

                        <h1 className="text-6xl font-bold text-red-600 mb-2">500</h1>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            เกิดข้อผิดพลาดของระบบ
                        </h2>

                        <p className="text-gray-600 mb-8">
                            ขออภัย ระบบเกิดข้อผิดพลาดภายใน
                            <br />
                            ทีมงานได้รับแจ้งแล้วและกำลังดำเนินการแก้ไข
                        </p>

                        {/* Error digest for support */}
                        {error.digest && (
                            <p className="mb-6 text-sm text-gray-500 bg-gray-100 rounded-lg p-3">
                                รหัสข้อผิดพลาด: <code className="font-mono">{error.digest}</code>
                            </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={reset}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                            >
                                🔄 ลองใหม่
                            </button>
                            <a
                                href="/"
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                🏠 กลับหน้าแรก
                            </a>
                        </div>

                        {/* Support contact */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                                หากปัญหายังคงอยู่ กรุณาติดต่อ
                            </p>
                            <a
                                href="mailto:support@gacp.go.th"
                                className="text-emerald-600 hover:underline font-medium"
                            >
                                support@gacp.go.th
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
