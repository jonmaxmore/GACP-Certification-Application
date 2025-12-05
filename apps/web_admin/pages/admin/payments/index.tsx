import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

// --- Types ---
interface Application {
    _id: string; // or id
    id: string;
    formType: string;
    applicantType: string;
    establishmentId: any;
    workflowState: string;
    createdAt: string;
    payment?: {
        [key: string]: {
            amount: number;
            slipImagePath?: string;
            paidAt?: string;
        }
    };
}

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api/v2';
const IMAGE_BASE_URL = 'http://localhost:3000'; // middleware mounts /uploads at root

export default function PaymentReviewPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Fetch all and filter client-side (or use query params if supported)
            const response = await axios.get(`${API_BASE_URL}/applications`);
            if (response.data.success) {
                const allApps = response.data.data || response.data.items;
                // Filter for WAITING_PAYMENT
                const paymentApps = allApps.filter((app: Application) =>
                    ['WAITING_PAYMENT_1', 'WAITING_PAYMENT_2'].includes(app.workflowState)
                );
                setApplications(paymentApps);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
        setShowRejectInput(false);
        setRejectReason('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApp(null);
    };

    const handleApprove = async () => {
        if (!selectedApp) return;
        if (!confirm('Confirm payment approval?')) return;

        try {
            setIsProcessing(true);
            // Determine which phase we are approving based on state
            const nextStatus = selectedApp.workflowState === 'WAITING_PAYMENT_1'
                ? 'PAYMENT_1_VERIFIED' // or whatever the workflow requires. Usually moves to REVIEW
                : 'PAYMENT_2_VERIFIED';

            // Using generic status update for flexibility
            await axios.patch(`${API_BASE_URL}/applications/${selectedApp.id}/status`, {
                status: nextStatus,
                note: 'Payment Approved by Admin'
            });

            alert('Payment Approved!');
            await fetchApplications(); // Refresh list
            handleCloseModal();
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Failed to approve payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp) return;
        if (!rejectReason) {
            alert('Please provide a reason');
            return;
        }

        try {
            setIsProcessing(true);
            await axios.patch(`${API_BASE_URL}/applications/${selectedApp.id}/status`, {
                status: 'PAYMENT_REJECTED',
                note: rejectReason
            });

            alert('Payment Rejected');
            await fetchApplications();
            handleCloseModal();
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Failed to reject payment');
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper to get slip image URL
    const getSlipUrl = (app: Application) => {
        // Check payment object
        const phase = app.workflowState === 'WAITING_PAYMENT_2' ? 'PAYMENT_2' : 'PAYMENT_1'; // simplified
        // Our backend controller stores 'slipImagePath'. 
        // We need to construct the full URL.
        // Example path: apps/backend/uploads/slips/image.jpg (absolute) or uploads/slips/image.jpg (relative)
        // The previous controller logic: `slipImage.path`. 
        // Multer `path` is usually absolute or relative to cwd.
        // If backend serves `/uploads`, we need the filename or relative path.
        // Let's assume the API returns the FULL stored path, we need to extract filename or fix the path.

        // For this demo, let's assume the API calculates a public URL or we rely on the filename convention?
        // Controller `PaymentController.js` saved `slipImagePath`.
        // It also saved `slipImageFilename`.

        // Check if we have payment details in the fetched object.
        // Assuming backend populates it.

        // Fallback: If not populated, we might not see the image. 
        // BUT user requirement says: "Show slip image (Use URL from Backend)".
        // Let's safe guard.

        // Accessing typical V2 response structure
        const payData = app.payment?.[phase] || app.payment?.['PAYMENT_1']; // Fallback
        if (payData && payData.slipImageFilename) {
            return `${IMAGE_BASE_URL}/uploads/slips/${payData.slipImageFilename}`;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Head>
                <title>Payment Review | GACP Admin</title>
            </Head>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Payment Review Dashboard</h1>

                {/* List View */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form/Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No pending payments found.</td></tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {app.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Form {app.formType} ({app.applicantType})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {app.workflowState}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenDetail(app)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedApp && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Payment Review: {selectedApp.id}
                                        </h3>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-500">Details</p>
                                                <p className="text-sm">Status: {selectedApp.workflowState}</p>
                                                <p className="text-sm">Farmer: {selectedApp.applicantType}</p>
                                                <p className="text-sm">EST ID: {JSON.stringify(selectedApp.establishmentId)}</p>
                                            </div>
                                            <div>
                                                {/* Slip Image Display */}
                                                <p className="text-sm font-bold text-gray-500 mb-2">Payment Slip</p>
                                                {getSlipUrl(selectedApp) ? (
                                                    <div className="border rounded p-1">
                                                        <a href={getSlipUrl(selectedApp)!} target="_blank" rel="noreferrer">
                                                            <img
                                                                src={getSlipUrl(selectedApp)!}
                                                                alt="Slip"
                                                                className="w-full h-48 object-cover cursor-zoom-in"
                                                            />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                                        No Slip Image Found
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reject Input */}
                                        {showRejectInput && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                                                <textarea
                                                    className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                                    rows={3}
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Why is it rejected?"
                                                ></textarea>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                {!showRejectInput ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={handleApprove}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            {isProcessing ? 'Processing...' : 'Approve Payment'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectInput(true)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            disabled={isProcessing}
                                            onClick={handleReject}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Confirm Rejection
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectInput(false)}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
