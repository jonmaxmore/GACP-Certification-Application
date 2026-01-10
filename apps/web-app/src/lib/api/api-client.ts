/**
 * API Client - Centralized HTTP Client with Auth Interceptor
 * 
 * This client fixes "Broken Chain" by automatically attaching
 * Authorization headers to all requests.
 * 
 * Usage:
 *   import { apiClient } from '@/lib/api/api-client';
 *   
 *   // GET request:
 *   const data = await apiClient.get('/api/users/me');
 *   
 *   // POST request:
 *   const result = await apiClient.post('/api/applications', { name: 'test' });
 */

import { AuthService } from '../services/auth-service';

// Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Request options
interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    skipAuth?: boolean;
    timeout?: number;
}

class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number;

    constructor(baseUrl = '', timeout = 30000) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = timeout;
    }

    /**
     * Make HTTP request with automatic auth header injection
     */
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const { skipAuth = false, timeout = this.defaultTimeout, body, ...init } = options;

        // Build headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(init.headers as Record<string, string>),
        };

        // Fallback: Only attach Authorization header if no httpOnly cookie available
        // Primary auth is via httpOnly cookie (credentials: 'include')
        // This fallback is for mobile apps that don't use cookies
        if (!skipAuth) {
            const token = AuthService.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Smart Path Handling: Auto-prefix with /api if needed
        let fullEndpoint = endpoint;
        if (!endpoint.startsWith('http')) {
            if (!endpoint.startsWith('/api')) {
                // Prefix with /api for all paths
                fullEndpoint = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
            }
        }

        // Build full URL
        const url = fullEndpoint.startsWith('http') ? fullEndpoint : `${this.baseUrl}${fullEndpoint}`;

        // Setup abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...init,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
                credentials: 'include', // 🔐 Send httpOnly cookies automatically
            });

            clearTimeout(timeoutId);

            // Handle 401 Unauthorized - auto logout
            if (response.status === 401) {
                console.warn('[ApiClient] 401 Received - Session expired');
                AuthService.clearSession();

                // Redirect to login if in browser
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?expired=true';
                }

                return {
                    success: false,
                    error: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่',
                };
            }

            // Parse JSON response
            const data = await response.json();

            // Handle API error responses
            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || `HTTP Error: ${response.status}`,
                };
            }

            return {
                success: true,
                data: data.data ?? data,
            };
        } catch (error) {
            clearTimeout(timeoutId);

            // Handle abort/timeout
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout - กรุณาลองใหม่',
                };
            }

            // Handle network errors
            console.error('[ApiClient] Request failed:', error);
            return {
                success: false,
                error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
            };
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * Health check - for backwards compatibility
     */
    async health(): Promise<boolean> {
        try {
            const response = await this.get('/api/health', { skipAuth: true, timeout: 5000 });
            return response.success;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
export const api = apiClient;
