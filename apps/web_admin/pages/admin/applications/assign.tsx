import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

const API_BASE_URL = 'http://localhost:3000/api/v2';

export default function AuditorAssignmentPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [auditors, setAuditors] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [selectedAuditorId, setSelectedAuditorId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appRes, auditorRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/applications`),
                axios.get(`${API_BASE_URL}/officer/auditors`)
            ]);

            const list = (appRes.data.data || appRes.data.items || [])
                .filter((a: any) => a.workflowState === 'AUDITOR_ASSIGNMENT');

            setApplications(list);
            setAuditors(auditorRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async () => {
        if (!selectedApp || !selectedAuditorId) return;

        try {
            await axios.patch(`${API_BASE_URL}/officer/applications/${selectedApp.id}/assign-auditor`, {
                auditorId: selectedAuditorId
            });
            alert('Auditor Assigned Successfully!');
            setSelectedApp(null);
            setSelectedAuditorId('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Assignment failed');
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
                            <th className="px-6 py-3 text-left w-1/4">App ID</th>
                            <th className="px-6 py-3 text-left w-1/4">Establishment</th>
                            <th className="px-6 py-3 text-left w-1/4">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app.id}>
                                <td className="px-6 py-4">{app.id}</td>
                                <td className="px-6 py-4">{JSON.stringify(app.establishmentId)}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{app.workflowState}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setSelectedApp(app); setSelectedAuditorId(''); }}
                                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                                    >
                                        Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No applications waiting for assignment.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assignment Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-bold mb-4">Assign Auditor</h2>
                        <p className="mb-2 text-sm text-gray-600">Application: {selectedApp.id}</p>

                        <label className="block mb-2 font-medium">Select Auditor:</label>
                        <select
                            className="w-full border p-2 rounded mb-6"
                            value={selectedAuditorId}
                            onChange={e => setSelectedAuditorId(e.target.value)}
                        >
                            <option value="">-- Choose Auditor --</option>
                            {auditors.map(aud => (
                                <option key={aud.id} value={aud.id}>
                                    {aud.firstName} {aud.lastName}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
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
