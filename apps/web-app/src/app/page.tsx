import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1B5E20]/5 to-[#1B5E20]/10">
      {/* Hero Section */}
      <div className="text-center max-w-2xl px-6">
        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
          <span className="text-5xl">🌿</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#1B5E20] mb-4">
          ระบบรับรองมาตรฐาน GACP
        </h1>
        <h2 className="text-xl text-[#1B5E20]/80 mb-2">
          Good Agricultural and Collection Practice
        </h2>
        <p className="text-gray-600 mb-8">
          กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
          <br />
          Department of Thai Traditional and Alternative Medicine
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-4 bg-[#1B5E20] text-white rounded-xl font-semibold hover:bg-[#0D3612] transition-all shadow-lg hover:shadow-xl"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 border-2 border-[#1B5E20] text-[#1B5E20] rounded-xl font-semibold hover:bg-[#1B5E20]/5 transition-all"
          >
            ลงทะเบียนใหม่
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-semibold text-[#1B5E20] mb-2">บุคคลธรรมดา</h3>
            <p className="text-sm text-gray-500">เกษตรกรรายย่อย</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="font-semibold text-[#1B5E20] mb-2">นิติบุคคล</h3>
            <p className="text-sm text-gray-500">บริษัท / ห้างหุ้นส่วน</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-semibold text-[#1B5E20] mb-2">วิสาหกิจชุมชน</h3>
            <p className="text-sm text-gray-500">กลุ่มเกษตรกร</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-sm text-gray-400">
        <p>© 2024 กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</p>
        <p className="mt-1">v2.6.0</p>
      </div>
    </div>
  );
}
