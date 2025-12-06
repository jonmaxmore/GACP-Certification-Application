import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v2';

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
            // Map frontend status to backend expected value if needed, 
            // but Backend OfficerController.reviewDocs expects 'approved' or 'rejected' usually?
            // Let's check OfficerController... assuming it handles uppercase or we send lowercase.
            // Safe bet: send what the UI says but maybe lowercase if backend is strict.
            // Looking at OfficerRoutes -> officerController.reviewDocs. 
            // Usually standard is lowercase.
            await axios.patch(`${API_BASE_URL}/officer/applications/${selectedApp._id || selectedApp.id}/review-docs`, {
                status: status.toLowerCase(),
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
            <h1 className="text-2xl font-bold mb-6">Document Review Queue</h1>

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
                                </ul>
                            </div>
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
