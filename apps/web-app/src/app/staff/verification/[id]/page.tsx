'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// import { useAuth } from '@/lib/services/auth-provider'; // Assume context exists or handled by layout
import { Icons } from '@/components/ui/icons';
import StaffLayout from '../../components/StaffLayout';

interface UserDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accountType: string;
    verificationSubmittedAt: string;
    taxId?: string;
    laserCode?: string;
    companyName?: string;
    verificationDocuments: {
        idCard?: string;
        companyCert?: string;
        selfie?: string;
    };
}

export default function VerificationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    useEffect(() => {
        if (params.id) fetchUser(params.id as string);
    }, [params.id]);

    const fetchUser = async (id: string) => {
        try {
            const token = localStorage.getItem('staff_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/identity/user/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        setProcessing(true);

        try {
            const token = localStorage.getItem('staff_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/identity/review/${user?.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    note: action === 'REJECT' ? rejectReason : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`User ${action}D successfully`);
                router.push('/staff/verification');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to process request');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <StaffLayout><div className="text-slate-400">Loading...</div></StaffLayout>;
    if (!user) return <StaffLayout><div className="text-red-400">User not found</div></StaffLayout>;

    const getImageUrl = (path?: string) => {
        if (!path) return null;
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`;
    };

    return (
        <StaffLayout title="Review Identity" subtitle={`Request from ${user.firstName} ${user.lastName}`}>
            <button
                onClick={() => router.back()}
                className="flex items-center text-slate-400 hover:text-slate-200 mb-6 transition-colors"
            >
                <Icons.ArrowLeft className="w-4 h-4 mr-2" /> Back to list
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: User Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                            <Icons.User className="w-5 h-5 text-indigo-400" />
                            Applicant Info
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="text-slate-500 block mb-1">Name</label>
                                <p className="text-slate-200 font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <label className="text-slate-500 block mb-1">Email</label>
                                <p className="text-slate-200 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-slate-500 block mb-1">Account Type</label>
                                <span className="inline-block px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                                    {user.accountType}
                                </span>
                            </div>
                            {user.accountType !== 'INDIVIDUAL' && (
                                <div>
                                    <label className="text-slate-500 block mb-1">Company Name</label>
                                    <p className="text-slate-200 font-medium">{user.companyName || '-'}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-slate-500 block mb-1">ID / Tax Number</label>
                                <p className="text-slate-200 font-mono bg-slate-900 p-2 rounded border border-slate-700">
                                    {user.taxId || user.laserCode || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-slate-500 block mb-1">Submitted At</label>
                                <p className="text-slate-400">
                                    {new Date(user.verificationSubmittedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-4">Actions</h3>

                        {!showRejectForm ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={processing}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Icons.CheckCircle className="w-5 h-5" />
                                    Approve & Activate
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={processing}
                                    className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-900/50 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Icons.XCircle className="w-5 h-5" />
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Reason for Rejection</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        placeholder="e.g. ID card blurred, Name mismatch..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-red-500 focus:border-red-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRejectForm(false)}
                                        className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleAction('REJECT')}
                                        disabled={!rejectReason || processing}
                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Confirm Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Documents */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                            <Icons.Document className="w-5 h-5 text-indigo-400" />
                            Submitted Evidence
                        </h3>

                        <div className="space-y-8">
                            {/* ID Card */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                                    {user.accountType === 'INDIVIDUAL' ? 'ID Card Photo' : 'Director ID Card'}
                                </h4>
                                {user.verificationDocuments?.idCard ? (
                                    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                                        <img
                                            src={getImageUrl(user.verificationDocuments.idCard)!}
                                            alt="ID Card"
                                            className="w-full h-auto max-h-[500px] object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-lg border border-slate-700 border-dashed">
                                        No ID card image uploaded
                                    </div>
                                )}
                            </div>

                            {/* Company Cert */}
                            {user.accountType !== 'INDIVIDUAL' && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                                        Company Affidavit
                                    </h4>
                                    {user.verificationDocuments?.companyCert ? (
                                        <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                                            <img
                                                src={getImageUrl(user.verificationDocuments.companyCert)!}
                                                alt="Certificate"
                                                className="w-full h-auto max-h-[500px] object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-lg border border-slate-700 border-dashed">
                                            No certificate uploaded
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
