import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v2';

export default function AssignmentPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [auditors, setAuditors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [selectedAuditorId, setSelectedAuditorId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appRes, auditorRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/applications`),
                axios.get(`${API_BASE_URL}/officer/auditors`) // Ensure OfficerController has this
            ]);

            // Filter for apps ready for audit (e.g., PAYMENT_2_PAID or AUDIT_PENDING)
            // Or just submitted/paid ones.
            // Based on Golden Loop: Payment 2 Paid -> AUDIT_PENDING
            const readyApps = (appRes.data.data || appRes.data.items || []).filter((a: any) =>
                a.status === 'AUDIT_PENDING' || a.status === 'PAYMENT_2_PAID' || a.status === 'audit_pending'
            );
            setApplications(readyApps);
            setAuditors(auditorRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedApp || !selectedAuditorId) return;

        try {
            await axios.patch(`${API_BASE_URL}/officer/applications/${selectedApp._id || selectedApp.id}/assign-auditor`, {
                auditorId: selectedAuditorId,
                date: new Date().toISOString() // Mock immediate assignment
            });
            alert('Auditor Assigned Successfully');
            setSelectedApp(null);
            setSelectedAuditorId('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Assignment Failed');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Head><title>Auditor Assignment</title></Head>
            <h1 className="text-2xl font-bold mb-6">Auditor Assignment Queue</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">App ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app._id || app.id}>
                                <td className="px-6 py-4">{app.applicationNumber || app._id}</td>
                                <td className="px-6 py-4">{app.farmInformation?.name || app.establishmentName}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                        Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && !loading && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No applications pending assignment.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Assign Auditor</h2>
                        <p className="mb-4">Select an auditor for <strong>{selectedApp.farmInformation?.name}</strong></p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Auditors</label>
                            <select
                                className="w-full border rounded p-2"
                                value={selectedAuditorId}
                                onChange={e => setSelectedAuditorId(e.target.value)}
                            >
                                <option value="">-- Select Auditor --</option>
                                {auditors.map(aud => (
                                    <option key={aud._id || aud.id} value={aud._id || aud.id}>
                                        {aud.firstName} {aud.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleAssign}
                                disabled={!selectedAuditorId}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                Confirm Assignment
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
