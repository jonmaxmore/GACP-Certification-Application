
import { apiClient } from '@/lib/api/api-client';

export interface Plant {
    id: string;
    name: string;
    productionInputs: Record<string, unknown>;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SystemConfig {
    key: string;
    value: string;
    type: string;
    description?: string;
    updatedAt?: string;
}

export const AdminService = {
    // --- Plants Management ---
    async getPlants() {
        return await apiClient.get<Plant[]>('/admin/plants');
    },

    async createPlant(data: { name: string; productionInputs: Record<string, unknown> }) {
        return await apiClient.post<Plant>('/admin/plants', data);
    },

    async updatePlant(id: string, data: Partial<Plant>) {
        return await apiClient.patch<Plant>(`/admin/plants/${id}`, data);
    },

    async deletePlant(id: string) {
        return await apiClient.delete(`/admin/plants/${id}`);
    },

    // --- System Configuration ---
    async getConfigs() {
        return await apiClient.get<SystemConfig[]>('/admin/config');
    },

    async updateConfig(key: string, value: string) {
        return await apiClient.patch<SystemConfig>(`/admin/config/${key}`, { value });
    },

    // --- Dashboard Stats ---
    async getDashboardStats() {
        return await apiClient.get<{
            total: number;
            pending: number;
            approved: number;
            revenue: number;
            todayChecked: number;
        }>('/applications/stats');
    }
};
