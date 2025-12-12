/**
 * GACP Platform - Centralized API Client
 * Single source of truth for all backend communication
 * 
 * Features:
 * - Environment-based URL configuration
 * - Automatic retry with exponential backoff
 * - Health check monitoring
 * - Consistent Thai error messages
 * - Network status tracking
 */

// API Configuration
// NOTE: API calls now go through local proxy (/api/v2/...) which forwards to backend
// with Authorization header extracted from httpOnly cookie
const API_CONFIG = {
    baseUrl: '/api', // Local proxy - handles cookie auth automatically
    backendUrl: 'http://localhost:3000', // Direct backend URL for health checks
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000, // Base delay in ms, will be multiplied exponentially
    healthCheckInterval: 30000, // 30 seconds
};

// Network Status
let isServerOnline = true;
let lastHealthCheck: Date | null = null;
const subscribers: Set<(online: boolean) => void> = new Set();

// Error Translation Map
const ERROR_TRANSLATIONS: Record<string, string> = {
    'Network Error': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต',
    'Failed to fetch': 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต',
    'Invalid credentials': 'เลขประจำตัวหรือรหัสผ่านไม่ถูกต้อง',
    'User not found': 'ไม่พบบัญชีผู้ใช้นี้ในระบบ',
    'Account is locked': 'บัญชีถูกล็อค กรุณารอ 30 นาทีแล้วลองใหม่',
    'Too many requests': 'มีการพยายามมากเกินไป กรุณารอสักครู่',
    'Internal Server Error': 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง',
    'Unauthorized': 'กรุณาเข้าสู่ระบบใหม่',
};

/**
 * Translate error message to Thai
 */
function translateError(error: string): string {
    // Check exact match
    if (ERROR_TRANSLATIONS[error]) {
        return ERROR_TRANSLATIONS[error];
    }

    // Check partial match
    for (const [key, value] of Object.entries(ERROR_TRANSLATIONS)) {
        if (error.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    // Return original if already Thai
    if (/[ก-๙]/.test(error)) {
        return error;
    }

    return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}

/**
 * Sleep utility for retry logic
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Subscribe to server status changes
 */
export function onServerStatusChange(callback: (online: boolean) => void): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

/**
 * Notify all subscribers of status change
 */
function notifyStatusChange(online: boolean) {
    if (online !== isServerOnline) {
        isServerOnline = online;
        subscribers.forEach(cb => cb(online));
    }
}

/**
 * Check if server is online
 */
export async function checkHealth(): Promise<boolean> {
    try {
        // Use backend URL directly for health check
        const response = await fetch(`${API_CONFIG.backendUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        const isOnline = response.ok;
        lastHealthCheck = new Date();
        notifyStatusChange(isOnline);
        return isOnline;
    } catch {
        notifyStatusChange(false);
        return false;
    }
}

/**
 * Get current server status
 */
export function getServerStatus(): { online: boolean; lastCheck: Date | null } {
    return { online: isServerOnline, lastCheck: lastHealthCheck };
}

/**
 * Main API request function with retry logic
 */
export async function apiRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
): Promise<{ success: true; data: T } | { success: false; error: string; status?: number }> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Note: auth_token is now stored in httpOnly cookie
    // Cookies are sent automatically with credentials: 'include'

    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Send httpOnly cookies with request
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            signal: AbortSignal.timeout(API_CONFIG.timeout),
        });

        // Server is online if we got a response
        notifyStatusChange(true);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = data.error || data.message || `HTTP ${response.status}`;
            return {
                success: false,
                error: translateError(errorMessage),
                status: response.status,
            };
        }

        return { success: true, data: data as T };

    } catch (error) {
        // Network error - server might be down
        const isNetworkError = error instanceof TypeError ||
            (error instanceof Error && error.name === 'AbortError');

        if (isNetworkError && retryCount < API_CONFIG.retryAttempts) {
            // Exponential backoff
            const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount);
            console.log(`[API] Retry ${retryCount + 1}/${API_CONFIG.retryAttempts} in ${delay}ms...`);
            await sleep(delay);
            return apiRequest<T>(endpoint, options, retryCount + 1);
        }

        // All retries failed
        notifyStatusChange(false);
        return {
            success: false,
            error: translateError('Failed to fetch'),
        };
    }
}

/**
 * Convenience methods
 */
export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    }),

    put: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    }),

    delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),

    health: checkHealth,
    status: getServerStatus,
    onStatusChange: onServerStatusChange,
};

export default api;
