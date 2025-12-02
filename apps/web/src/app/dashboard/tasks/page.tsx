'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function TaskQueuePage() {
    const queryClient = useQueryClient();
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [selectedAuditor, setSelectedAuditor] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch unassigned jobs
    const { data: jobs, isLoading: isLoadingJobs } = useQuery({
        queryKey: ['unassigned-jobs'],
        queryFn: async () => {
            const response = await api.get('/job-assignment/unassigned');
            return response.data.data;
        },
    });

    // Fetch available auditors (Mock for now, should be real API)
    const { data: auditors } = useQuery({
        queryKey: ['auditors'],
        queryFn: async () => {
            // In a real app, we would fetch this from /api/users?role=auditor
            // For now, returning mock data
            return [
                { id: 'auditor1', name: 'Somchai Auditor', expertise: ['Chiang Mai', 'Indoor'] },
                { id: 'auditor2', name: 'Somsri Inspector', expertise: ['Chiang Rai', 'Outdoor'] },
            ];
        },
    });

    // Assign job mutation
    const assignMutation = useMutation({
        mutationFn: async (data: { applicationId: string; auditorId: string }) => {
            return await api.post('/job-assignment/assign', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unassigned-jobs'] });
            setIsDialogOpen(false);
            setSelectedJob(null);
            setSelectedAuditor('');
        },
    });

    const handleAssign = () => {
        if (selectedJob && selectedAuditor) {
            assignMutation.mutate({
                applicationId: selectedJob._id || selectedJob.id,
                auditorId: selectedAuditor,
            });
        }
    };

    if (isLoadingJobs) {
        return <div>Loading tasks...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Task Queue</h2>
                <Badge variant="secondary">{jobs?.length || 0} Pending</Badge>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Application No.</TableHead>
                            <TableHead>Farmer</TableHead>
                            <TableHead>Province</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    No unassigned tasks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs?.map((job: any) => (
                                <TableRow key={job._id || job.id}>
                                    <TableCell className="font-medium">{job.applicationNumber}</TableCell>
                                    <TableCell>{job.applicantName || 'Unknown'}</TableCell>
                                    <TableCell>{job.farmLocation?.province || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{job.currentStatus}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedJob(job)}
                                                >
                                                    Assign
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Assign Auditor</DialogTitle>
                                                    <DialogDescription>
                                                        Assign an auditor for Application {selectedJob?.applicationNumber}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="auditor" className="text-right">
                                                            Auditor
                                                        </Label>
                                                        <Select
                                                            value={selectedAuditor}
                                                            onValueChange={setSelectedAuditor}
                                                        >
                                                            <SelectTrigger className="col-span-3">
                                                                <SelectValue placeholder="Select auditor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {auditors?.map((auditor: any) => (
                                                                    <SelectItem key={auditor.id} value={auditor.id}>
                                                                        {auditor.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        onClick={handleAssign}
                                                        disabled={!selectedAuditor || assignMutation.isPending}
                                                    >
                                                        {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
