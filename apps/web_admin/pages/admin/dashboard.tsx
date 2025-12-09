import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v2';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch Stats from Application Controller
            const res = await axios.get(`${API_BASE_URL}/applications/dashboard/stats`);
            setStats(res.data.data || res.data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <Head><title>Officer Dashboard</title></Head>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Officer Command Center</h1>
                <button onClick={fetchStats} className="text-blue-600 hover:text-blue-800">Refresh Stats</button>
            </div>

            {loading ? (
                <p>Loading overview...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Applications" value={stats?.total || 0} color="bg-blue-500" />
                    <StatCard title="Review Pending" value={stats?.pendingReview || 0} color="bg-yellow-500" />
                    <StatCard title="Audit Pending" value={stats?.pendingAudit || 0} color="bg-orange-500" />
                    <StatCard title="Certified" value={stats?.certified || 0} color="bg-green-500" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Actions Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link href="/admin/applications/review" className="block p-4 border rounded hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-lg">Document Review</span>
                                <p className="text-gray-500 text-sm">Review submitted applications & docs.</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                {stats?.pendingReview || 0} Pending
                            </span>
                        </Link>

                        <Link href="/admin/applications/assign" className="block p-4 border rounded hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-lg">Auditor Assignment</span>
                                <p className="text-gray-500 text-sm">Assign auditors to paid applications.</p>
                            </div>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                {stats?.pendingAudit || 0} Pending
                            </span>
                        </Link>

                        <Link href="/admin/payments" className="block p-4 border rounded hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <span className="font-semibold text-lg">Payment Verifications</span>
                                <p className="text-gray-500 text-sm">Verify Phase 1 & 2 slips.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity / System Health (Placeholder) */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">System Status</h2>
                    <div className="space-y-2">
                        <p className="flex justify-between"><span>API Connection:</span> <span className="text-green-600 font-bold">Online</span></p>
                        <p className="flex justify-between"><span>Database:</span> <span className="text-green-600 font-bold">Connected</span></p>
                        <p className="flex justify-between"><span>Version:</span> <span className="text-gray-600">2.0.0 (Deep QA Edition)</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className={`${color} text-white p-6 rounded-lg shadow hover:opacity-90 transition`}>
            <h3 className="text-lg font-medium opacity-90">{title}</h3>
            <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
    );
}
