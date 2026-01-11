import { apiClient } from "@/lib/api/api-client";

export interface Application {
    _id: string;
    applicationNumber?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    plantId?: string;
    rejectCount?: number;
    data?: {
        applicantInfo?: { name: string };
        formData?: { plantId: string };
    };
    scheduledDate?: string;
    audit?: {
        mode?: "ONLINE" | "ONSITE";
        meetingUrl?: string;
        location?: string;
        scheduledDate?: string; // Legacy or redundant, keeping for safe measure
    };
}

export interface DashboardStats {
    total: number;
    pending: number;
    approved: number;
    todayChecked: number;
}

export const ApplicationService = {
    /**
     * Get statistics for Staff Dashboard
     */
    /**
     * Get statistics for Staff Dashboard
     */
    getStats: async () => {
        // Updated to use the new Reports API
        const response = await apiClient.get<any>("/reports/dashboard");
        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    total: response.data.total,
                    pending: response.data.pendingReview, // Map 'pendingReview' to 'pending'
                    approved: response.data.approved,
                    todayChecked: 0 // Not yet implemented in backend
                }
            };
        }
        return response;
    },

    /**
     * Get applications for Farmer Dashboard
     */
    getMyApplications: async () => {
        return apiClient.get<Application[]>("/applications/my");
    },

    /**
     * Get pending reviews for Staff (Document Review)
     */
    getPendingReviews: async () => {
        return apiClient.get<Application[]>("/applications/pending-reviews");
    },

    /**
     * Get pending audits for Staff (Auditor)
     */
    getPendingAudits: async () => {
        return apiClient.get<Application[]>("/applications/auditor/assignments");
    },

    /**
     * Get single application by ID
     */
    getMyCertificates: async () => {
        return apiClient.get<Certificate[]>("/certificates/my");
    },

    /**
     * Download Certificate (Mock)
     */
    downloadCertificate: async (id: string) => {
        // This would typically trigger a blob download
        // For now, we return the URL to open in new tab
        return {
            success: true,
            data: `/api/certificates/${id}/download`
        };
    }
};

export interface Certificate {
    _id: string;
    certificateNumber: string;
    siteName: string; // Farm Name
    plantType: string;
    issuedDate: string;
    expiryDate: string;
    status: string;
    qrCode: string;
}
