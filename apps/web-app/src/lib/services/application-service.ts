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
    audit?: {
        scheduledDate?: string;
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
    getStats: async () => {
        return apiClient.get<{ total: number; pending: number; approved: number; todayChecked: number }>("/applications/stats");
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
    getApplicationById: async (id: string) => {
        return apiClient.get<Application>(`/applications/${id}`);
    }
};
