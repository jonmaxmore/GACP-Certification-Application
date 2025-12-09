import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v2';

export default function DocumentReviewPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/applications`);
            // Filter for submitted (lowercase per Backend Model)
            const list = (res.data.data || res.data.items || []).filter((a: any) =>
                a.status === 'submitted' || a.status === 'SUBMITTED' || a.currentStatus === 'submitted'
            );
            setApplications(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedApp) return;
        if (status === 'REJECTED' && !comment) {
            alert('Please provide a rejection note.');
            return;
        }

        try {
            // Backend OfficerController.reviewDocs expects 'APPROVE' or 'REJECT'
            const actionMap: Record<string, string> = { 'APPROVED': 'APPROVE', 'REJECTED': 'REJECT' };

            await axios.patch(`${API_BASE_URL}/officer/applications/${selectedApp._id || selectedApp.id}/review-docs`, {
                action: actionMap[status],
                comment
            });
            alert(`Documents ${status}`);
            setSelectedApp(null);
            setComment('');
            fetchApplications();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Head><title>Document Review</title></Head>

            <div className="mb-6">
                <Link href="/admin/dashboard" className="text-blue-600 hover:underline flex items-center gap-2">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-gray-800">Application Review Queue</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app._id || app.id}>
                                <td className="px-6 py-4">{app.applicationNumber || app._id || app.id}</td>
                                <td className="px-6 py-4">{app.farmInformation?.name || app.establishmentName || 'Unknown Farm'}</td>
                                <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && !loading && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No applications pending review.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Review Application: {selectedApp.applicationNumber}</h2>

                        <div className="space-y-4 mb-4">
                            <div className="border p-3 rounded">
                                <h3 className="font-semibold text-gray-700">Farm Information</h3>
                                <p><strong>Name:</strong> {selectedApp.farmInformation?.name}</p>
                                <p><strong>Address:</strong> {selectedApp.farmInformation?.address?.street}, {selectedApp.farmInformation?.address?.city}, {selectedApp.farmInformation?.address?.province} {selectedApp.farmInformation?.address?.zipCode}</p>
                                <p><strong>Total Area:</strong> {selectedApp.farmInformation?.area?.total} {selectedApp.farmInformation?.area?.unit}</p>
                            </div>

                            <div className="border p-3 rounded">
                                <h3 className="font-semibold text-gray-700">Crop Information</h3>
                                {selectedApp.cropInformation?.map((crop: any, i: number) => (
                                    <div key={i} className="ml-2">
                                        <p><strong>{crop.name}</strong> ({crop.variety}) - Source: {crop.source}</p>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <p className="font-semibold">Documents:</p>
                                <ul className="list-disc pl-5">
                                    {selectedApp.documents?.map((doc: any, i: number) => (
                                        <li key={i}>
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                                {doc.type}
                                            </a>
                                            <span className="text-gray-500 text-sm ml-2">({doc.status || 'Verified'})</span>
                                        </li>
                                    ))}
                                    {/* Legacy Attachments mapping fallback */}
                                    {selectedApp.attachments?.map((att: any, i: number) => (
                                        <li key={`att-${i}`}>
                                            <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                                {att.fileName || att.slotId}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* National Standard Data (V2) */}
                            {selectedApp.data?.formData && (
                                <div className="border p-3 rounded bg-blue-50">
                                    <h3 className="font-semibold text-blue-800">National Standard Info (V2)</h3>

                                    {/* Video Evidence */}
                                    {selectedApp.data.formData.videoLink && (
                                        <div className="mt-2">
                                            <p className="font-semibold text-sm text-gray-700">Video Evidence:</p>
                                            <a
                                                href={selectedApp.data.formData.videoLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 underline break-all"
                                            >
                                                {selectedApp.data.formData.videoLink}
                                            </a>
                                        </div>
                                    )}

                                    {/* Business Scope (Sales & Export) */}
                                    <div className="mt-4 border-t pt-2">
                                        <p className="font-semibold text-sm text-gray-700">Business Scope:</p>
                                        <ul className="list-inside list-disc text-sm text-gray-600">
                                            {selectedApp.data.formData.salesChannels && selectedApp.data.formData.salesChannels.length > 0 && (
                                                <li><strong>Sales Channels:</strong> {Array.isArray(selectedApp.data.formData.salesChannels) ? selectedApp.data.formData.salesChannels.join(', ') : 'None'}</li>
                                            )}
                                            {selectedApp.data.formData.isExportEnabled && (
                                                <>
                                                    <li><strong>Export Enabled:</strong> Yes</li>
                                                    <li><strong>Destination:</strong> {selectedApp.data.formData.exportDestination || 'N/A'}</li>
                                                    <li><strong>Transport:</strong> {selectedApp.data.formData.transportMethod || 'N/A'}</li>
                                                </>
                                            )}
                                            {!selectedApp.data.formData.isExportEnabled && (
                                                <li><strong>Export Enabled:</strong> No</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Facility Standards (Text Areas) */}
                                    <div className="mt-4 border-t pt-2">
                                        <p className="font-semibold text-sm text-gray-700">Facility Standards:</p>
                                        <div className="text-sm text-gray-600 space-y-2 mt-1">
                                            {selectedApp.data.formData.productionPlanDetails && (
                                                <div>
                                                    <strong>Production Plan:</strong>
                                                    <p className="pl-2 border-l-2 border-gray-300">{selectedApp.data.formData.productionPlanDetails}</p>
                                                </div>
                                            )}
                                            {selectedApp.data.formData.securityMeasures && (
                                                <div>
                                                    <strong>Security Measures:</strong>
                                                    <p className="pl-2 border-l-2 border-gray-300">{selectedApp.data.formData.securityMeasures}</p>
                                                </div>
                                            )}
                                            {selectedApp.data.formData.wasteManagement && (
                                                <div>
                                                    <strong>Waste Management:</strong>
                                                    <p className="pl-2 border-l-2 border-gray-300">{selectedApp.data.formData.wasteManagement}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SOP Checklist */}
                                    {selectedApp.data.formData.sopChecklist && (
                                        <div className="mt-2">
                                            <p className="font-semibold text-sm text-gray-700">SOP Checklist:</p>
                                            <ul className="list-disc pl-5 text-sm">
                                                {Object.entries(selectedApp.data.formData.sopChecklist).map(([key, val]) => (
                                                    <li key={key} className={val ? "text-green-700" : "text-red-700"}>
                                                        {key}: {val ? "Passed" : "Failed"}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <textarea
                            className="w-full border rounded p-2 mb-4"
                            placeholder="Comment/Reason..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => handleReview('REJECTED')}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleReview('APPROVED')}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Approve Docs
                            </button>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
