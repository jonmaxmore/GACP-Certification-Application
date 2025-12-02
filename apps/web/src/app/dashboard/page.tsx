'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/dashboard/stats');
            return response.data.data;
        },
    });

    if (isLoading) {
        return <div>Loading stats...</div>;
    }

    const statCards = [
        {
            title: 'Total Applications',
            value: stats?.totalApplications || 0,
            icon: FileText,
            description: 'All time applications',
        },
        {
            title: 'Pending Review',
            value: stats?.pendingReview || 0, // Assuming backend provides this
            icon: AlertCircle,
            description: 'Awaiting officer action',
            className: 'text-orange-600',
        },
        {
            title: 'Unassigned Inspections',
            value: stats?.unassignedInspections || 0, // Assuming backend provides this
            icon: Users,
            description: 'Ready for assignment',
            className: 'text-blue-600',
        },
        {
            title: 'Completed Certifications',
            value: stats?.totalCertificates || 0,
            icon: CheckCircle,
            description: 'Successfully certified',
            className: 'text-green-600',
        },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.className}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recentActivity?.map((activity: any, index: number) => (
                                <div key={index} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.message}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
