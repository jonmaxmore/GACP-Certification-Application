'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/services/auth-provider';
import { Icons } from '@/components/ui/icons';
import StaffLayout from '../components/StaffLayout';

interface PendingUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accountType: string;
    verificationSubmittedAt: string;
}

export default function StaffVerificationPage() {
    const { user: staffUser } = useAuth(); // Actually staff user
    const router = useRouter();
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem('staff_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/identity/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StaffLayout title="Identity Verification" subtitle="Review pending identity documents">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                        <Icons.Clock className="w-5 h-5 text-amber-500" />
                        Pending Requests
                        <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full">{users.length}</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Icons.CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-50" />
                        <p>No pending verifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                className="p-4 hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between group"
                                onClick={() => router.push(`/staff/verification/${u.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                        <Icons.User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-200">{u.firstName} {u.lastName}</h3>
                                        <p className="text-sm text-slate-400">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full ${u.accountType === 'JURISTIC' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {u.accountType}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(u.verificationSubmittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Icons.ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
