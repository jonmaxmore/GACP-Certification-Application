// API Service for GACP Application
// Connects frontend wizard to backend /api/v2/applications endpoints

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApplicationData {
    farmId?: string;
    requestType: 'NEW' | 'RENEWAL' | 'REPLACEMENT';
    applicantType: 'INDIVIDUAL' | 'JURISTIC' | 'COMMUNITY';
    applicantInfo: {
        name: string;
        idCard: string;
        mobile: string;
        email?: string;
        lineId?: string;
        address: string;
        purpose?: string;
    };
    siteInfo: {
        areaType: string[];
        address: string;
        coordinates?: string;
        siteName?: string;
    };
    formData: Record<string, unknown>;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('authToken');
};

/**
 * Create Draft Application
 * POST /api/v2/applications/draft
 */
export async function createApplication(data: ApplicationData): Promise<ApiResponse> {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE}/api/v2/applications/draft`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || result.message || 'Failed to create application',
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error('[API] createApplication error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Confirm Review (Unlock Payment 1)
 * POST /api/v2/applications/:id/confirm-review
 */
export async function confirmReview(applicationId: string): Promise<ApiResponse> {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE}/api/v2/applications/${applicationId}/confirm-review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

/**
 * Submit Payment Phase 1
 * POST /api/v2/applications/:id/pay-phase1
 */
export async function submitPayment1(applicationId: string): Promise<ApiResponse> {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE}/api/v2/applications/${applicationId}/pay-phase1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

/**
 * Get My Applications
 * GET /api/v2/applications/my
 */
export async function getMyApplications(): Promise<ApiResponse> {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE}/api/v2/applications/my`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

/**
 * Get Application Details
 * GET /api/v2/applications/:id
 */
export async function getApplicationById(applicationId: string): Promise<ApiResponse> {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE}/api/v2/applications/${applicationId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return await response.json();
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}
