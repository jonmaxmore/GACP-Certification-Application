'use client';

import { useWizardStore } from '../hooks/useWizardStore';
import Image from 'next/image';

export const StepReview = () => {
    const { state, setCurrentStep } = useWizardStore();

    // Simulated uploaded documents (In a real app, these would come from state.documents)
    // Using placeholders for visualization as requested by "Preview uploaded documents"
    const attachedDocs = [
        { title: 'บัตรประชาชน (National ID Card)', src: 'https://via.placeholder.com/600x400/e2e8f0/64748b?text=ID+Card+Preview' },
        { title: 'ทะเบียนบ้าน (House Registration)', src: 'https://via.placeholder.com/600x400/e2e8f0/64748b?text=House+Registration+Preview' }
    ];

    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 min-h-screen font-thai print:p-0 print:bg-white">

            {/* Action Bar (Hidden when printing) */}
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-xl font-bold text-slate-800">ตรวจสอบข้อมูล (Review Application)</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        พิมพ์เอกสาร (Print All)
                    </button>
                    <button
                        onClick={() => setCurrentStep(6)} // Go to Quote
                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
                    >
                        ถัดไป (Next) →
                    </button>
                </div>
            </div>

            {/* A4 Form Container */}
            <div className="w-full max-w-[210mm] bg-white rounded-none md:rounded-xl shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:w-full">

                {/* Page 1: Application Form */}
                <div className="p-[20mm] min-h-[297mm] relative">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 relative mb-4">
                            <img src="/dtam_logo_new.png" alt="DTAM Seal" className="object-contain w-full h-full" />
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-900 text-center leading-relaxed">
                            คำขอรับรองมาตรฐานการปฏิบัติทางการเกษตรที่ดีสำหรับพืชสมุนไพร<br />
                            (GACP Application Form)
                        </h1>
                        <p className="text-sm font-medium text-emerald-700 mt-2">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข</p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div className="border border-slate-300 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">1. ข้อมูลทั่วไป (General Information)</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <label className="text-xs text-slate-500 block">ประเภทคำขอ</label>
                                    <div className="font-medium">{state.serviceType === 'NEW' ? 'ขอใหม่ (New Application)' : 'ต่ออายุ (Renewal)'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block">วันที่ยื่น</label>
                                    <div className="font-medium">{new Date().toLocaleDateString('th-TH')}</div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 block">วัตถุประสงค์</label>
                                    <div className="font-medium">{state.certificationPurpose === 'COMMERCIAL' ? 'เพื่อการพาณิชย์ (Commercial)' : 'ไม่ใช่เพื่อการพาณิชย์ (Non-Commercial)'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="border border-slate-300 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">2. ข้อมูลสถานที่ผลิต (Production Site)</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 block">ชื่อสถานที่</label>
                                    <div className="font-medium">{state.siteData?.siteName || '-'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block">ที่ตั้ง</label>
                                    <div className="font-medium">{state.siteData?.address} {state.siteData?.province} {state.siteData?.postalCode}</div>
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-700 mt-6 mb-2 text-sm">รายการแปลงเพาะปลูก (Plots)</h4>
                            <table className="w-full text-sm border-collapse border border-slate-300">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="border border-slate-300 p-2 text-left">ชื่อแปลง</th>
                                        <th className="border border-slate-300 p-2 text-left">ระบบ</th>
                                        <th className="border border-slate-300 p-2 text-right">ขนาด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.siteData?.plots?.map((p, i) => (
                                        <tr key={i}>
                                            <td className="border border-slate-300 p-2">{p.name}</td>
                                            <td className="border border-slate-300 p-2">{p.solarSystem}</td>
                                            <td className="border border-slate-300 p-2 text-right">{p.areaSize} {p.areaUnit}</td>
                                        </tr>
                                    ))}
                                    {(!state.siteData?.plots?.length) && <tr><td colSpan={3} className="p-4 text-center text-slate-400">ไม่มีข้อมูล</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        {/* Signature Section */}
                        <div className="mt-12 pt-8 border-t border-slate-300">
                            <div className="flex justify-end">
                                <div className="text-center w-64">
                                    <div className="border-b border-dotted border-slate-400 h-10 mb-2"></div>
                                    <p className="font-medium text-slate-800">ลงชื่อผู้ยื่นคำขอ (Applicant Signature)</p>
                                    <p className="text-xs text-slate-500">วันที่ (Date): ______/______/______</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Break for Printing */}
                <div className="print:break-before-page"></div>

                {/* Page 2: Attached Documents Preview */}
                <div className="p-[20mm] min-h-[297mm] bg-white border-t-4 border-slate-100 print:border-none">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 pb-4 border-b border-slate-300">เอกสารแนบ (Attached Documents)</h3>

                    <div className="grid grid-cols-1 gap-8">
                        {attachedDocs.map((doc, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <h4 className="self-start font-bold text-slate-700 mb-2">{index + 1}. {doc.title}</h4>
                                <div className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50">
                                    {/* Using img tag directly for print compatibility often better than Next Image for full page width handling in some cases, but sticking to img for simplicity in previews */}
                                    <img
                                        src={doc.src}
                                        alt={doc.title}
                                        className="w-full h-auto object-contain max-h-[100mm]"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
