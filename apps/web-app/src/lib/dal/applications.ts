/**
 * Application Data Access Functions
 * 
 * 🛡️ All functions check authorization before returning data
 */

import 'server-only';
import { cookies } from 'next/headers';
import { getSession } from './users';
import type { SafeApplicationDTO } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get applications for current user
 * Staff see assigned applications, farmers see their own
 */
export async function getMyApplications(): Promise<SafeApplicationDTO[]> {
    const session = await getSession();
    if (!session) {
        return [];
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('staff_token')?.value || cookieStore.get('auth_token')?.value;

        const endpoint = session.userType === 'DTAM_STAFF'
            ? '/api/applications/pending-reviews'
            : '/api/applications/my';

        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.data)) {
            return [];
        }

        // Map to safe DTOs
        return data.data.map((app: Record<string, unknown>) => ({
            id: app.id as string,
            uuid: app.uuid as string,
            status: app.status as string,
            plantType: app.plantType as string,
            serviceType: app.serviceType as string,
            createdAt: new Date(app.createdAt as string),
            updatedAt: new Date(app.updatedAt as string),
        }));
    } catch {
        return [];
    }
}

/**
 * Get single application by ID (with authorization check)
 */
export async function getApplicationById(id: string): Promise<SafeApplicationDTO | null> {
    const session = await getSession();
    if (!session) {
        return null;
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('staff_token')?.value || cookieStore.get('auth_token')?.value;

        const response = await fetch(`${API_BASE}/api/applications/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data.success || !data.data) {
            return null;
        }

        const app = data.data;

        // Return only safe fields
        return {
            id: app.id,
            uuid: app.uuid,
            status: app.status,
            plantType: app.plantType,
            serviceType: app.serviceType,
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt),
        };
    } catch {
        return null;
    }
}
