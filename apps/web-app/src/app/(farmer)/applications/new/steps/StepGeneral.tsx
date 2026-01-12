'use client';

import { useWizardStore } from '../hooks/useWizardStore';

export const StepGeneral = () => {
    const { state, setGeneralInfo, setCurrentStep } = useWizardStore();

    // Ensure state exists
    const info = state.generalInfo || { projectName: '', certType: 'GACP' };

    const handleUpdate = (field: keyof typeof info, value: string) => {
        setGeneralInfo({ ...info, [field]: value });
    };

    // Mock User Data (In real app, fetch from auth profile)
    const farmerName = "สมชาย ใจดี";
    const farmerID = "3-1005-00000-00-0";

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-800 bg-clip-text text-transparent">
                    ข้อมูลทั่วไป (General Information)
                </h2>
                <p className="text-gray-500 mt-2">ตรวจสอบข้อมูลผู้ยื่นคำขอและระบุรายละเอียดเบื้องต้น</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อผู้ยื่นคำขอ (Applicant Name)</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-medium">
                            {farmerName}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">เลขบัตรประชาชน (ID Card)</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-medium font-mono">
                            {farmerID}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อโครงการ/ฟาร์ม (Project Name)</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                        placeholder="เช่น ฟาร์มสมุนไพรบ้านหนองขาว, โครงการปลูกกัญชาเพื่อการแพทย์"
                        value={info.projectName}
                        onChange={(e) => handleUpdate('projectName', e.target.value)}
                        autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-2">ชื่อนี้จะปรากฏบนใบรับรอง (Certificate)</p>
                </div>

                <div>
                    <label htmlFor="certType" className="block text-sm font-semibold text-gray-700 mb-2">ประเภทการขอรับรอง (Certification Type)</label>
                    <select
                        id="certType"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all"
                        value={info.certType}
                        onChange={(e) => handleUpdate('certType', e.target.value)}
                    >
                        <option value="GACP">GACP (Good Agricultural and Collection Practices)</option>
                        <option value="ORGANIC">Organic (เกษตรอินทรีย์ - Coming Soon)</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
                <button
                    onClick={() => setCurrentStep(2)} // Next to Land
                    disabled={!info.projectName}
                    className={`
                        px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform
                        ${info.projectName
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    ถัดไป (Next) →
                </button>
            </div>
        </div>
    );
};
