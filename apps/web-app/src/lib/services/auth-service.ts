/**
 * AuthService - Enterprise-Grade Authentication Service for Next.js
 * 
 * Features:
 * - Centralized token + user storage (fixes State Amnesia)
 * - JWT decode & expiry checking
 * - Auto token refresh before expiry
 * - Cross-tab synchronization (logout syncs all tabs)
 * - Session timeout after inactivity
 * - Auth event system for reactive updates
 * - Cookie sync for middleware compatibility
 * 
 * @version 2.0.0
 */

import { apiClient } from '../api/api-client';

// Storage keys - centralized to prevent typos
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    REMEMBER_LOGIN: 'remember_login',
    LAST_ACTIVITY: 'lastActivity',
} as const;

// Event types for auth state changes
export type AuthEventType = 'login' | 'logout' | 'token_refresh' | 'session_expired' | 'tab_sync';

export type AuthEventCallback = (event: AuthEventType, data?: unknown) => void;

// User type definition
export interface AuthUser {
    id: string;
    uuid?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    accountType?: string;
    userType?: string;
    role?: string;
    status?: string;
    verificationStatus?: string;
    verificationNote?: string;
    verificationSubmittedAt?: string;
    taxId?: string;
    laserCode?: string;
    idCard?: string;
    address?: string;
    province?: string;
    companyName?: string;
    phone?: string;
    applicantType?: string;
    [key: string]: unknown;
}

// JWT Payload type
interface JWTPayload {
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

// Session data from API response
export interface SessionData {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
    tokens?: {
        accessToken?: string;
        refreshToken?: string;
    };
}

// Configuration options
interface AuthConfig {
    sessionTimeoutMinutes: number;
    tokenRefreshBufferMinutes: number;
    enableCrossTabSync: boolean;
    enableSessionTimeout: boolean;
    onAuthEvent?: AuthEventCallback;
}

const DEFAULT_CONFIG: AuthConfig = {
    sessionTimeoutMinutes: 30,
    tokenRefreshBufferMinutes: 5,
    enableCrossTabSync: true,
    enableSessionTimeout: true,
};

class AuthServiceClass {
    private config: AuthConfig;
    private refreshTimer: ReturnType<typeof setTimeout> | null = null;
    private activityTimer: ReturnType<typeof setTimeout> | null = null;
    private eventListeners: AuthEventCallback[] = [];
    private initialized = false;

    constructor(config: Partial<AuthConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // ==================== API ACTIONS ====================

    /**
     * Login with centralized API client
     */
    async login(credentials: { identifier: string; password: string; accountType?: string }): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await apiClient.post<SessionData>('/auth-farmer/login', credentials);

            if (!response.success || !response.data) {
                return {
                    success: false,
                    error: response.error || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
                };
            }

            const data = response.data;
            const token = data.tokens?.accessToken || data.token || data.accessToken;

            if (!token) {
                return { success: false, error: 'ไม่ได้รับ Token จากระบบ' };
            }

            // Auto-save session
            this.saveSession({
                ...data,
                token
            });

            return { success: true };
        } catch (error) {
            console.error('[AuthService] Login failed:', error);
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    }

    /**
     * Register new farmer
     */
    async register(data: unknown): Promise<{ success: boolean; error?: string; data?: unknown }> {
        try {
            const response = await apiClient.post<{ user: AuthUser }>('/auth-farmer/register', data);

            if (!response.success) {
                return { success: false, error: response.error };
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('[AuthService] Register failed:', error);
            return { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        }
    }

    /**
     * Check if identifier exists
     */
    async checkIdentifier(identifier: string, accountType: string): Promise<{ available: boolean; error?: string }> {
        try {
            const response = await apiClient.post<{ available: boolean; error?: string }>('/auth-farmer/check-identifier', {
                identifier,
                accountType
            });

            if (!response.success) {
                return { available: false, error: response.error };
            }

            // API returns success: true even if available: false
            // The available flag is inside data if success is true?
            // Checking api-client wrapper response structure vs controller response
            // Controller returns: { success: true, available: false, error: "..." }
            // ApiClient returns: { success: true, data: { available, error } }

            const result = response.data;
            if (!result) return { available: false, error: 'No data' };

            return {
                available: !!result.available,
                error: result.error
            };
        } catch (error) {
            return { available: false, error: 'Connection Error' };
        }
    }

    /**
     * Initialize auth service (call once in app layout/provider)
     */
    initialize(): void {
        if (this.initialized || !this.isBrowser()) return;

        this.initialized = true;

        // Setup cross-tab synchronization
        if (this.config.enableCrossTabSync) {
            this.setupCrossTabSync();
        }

        // Setup session timeout tracking
        if (this.config.enableSessionTimeout) {
            this.setupActivityTracking();
        }

        // Schedule token refresh if authenticated
        if (this.isAuthenticated()) {
            this.scheduleTokenRefresh();
        }

        console.log('[AuthService] Initialized with config:', {
            sessionTimeout: this.config.sessionTimeoutMinutes,
            crossTabSync: this.config.enableCrossTabSync,
        });
    }

    /**
     * Check if running in browser environment
     */
    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Emit auth event to all listeners
     */
    private emit(event: AuthEventType, data?: unknown): void {
        this.eventListeners.forEach(cb => cb(event, data));
        this.config.onAuthEvent?.(event, data);
    }

    /**
     * Subscribe to auth events
     */
    onAuthChange(callback: AuthEventCallback): () => void {
        this.eventListeners.push(callback);
        return () => {
            this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
        };
    }

    // ==================== JWT UTILITIES ====================

    /**
     * Decode JWT token without verification (client-side only)
     */
    decodeToken(token?: string): JWTPayload | null {
        const t = token || this.getToken();
        if (!t) return null;

        try {
            const parts = t.split('.');
            if (parts.length !== 3) return null;

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch {
            console.error('[AuthService] Failed to decode JWT');
            return null;
        }
    }

    /**
     * Get token expiration timestamp (ms)
     */
    getTokenExpiry(): number | null {
        const payload = this.decodeToken();
        if (!payload?.exp) return null;
        return payload.exp * 1000; // Convert to milliseconds
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(): boolean {
        const expiry = this.getTokenExpiry();
        if (!expiry) return true;
        return Date.now() >= expiry;
    }

    /**
     * Get time until token expires (ms)
     */
    getTimeUntilExpiry(): number {
        const expiry = this.getTokenExpiry();
        if (!expiry) return 0;
        return Math.max(0, expiry - Date.now());
    }

    // ==================== SESSION MANAGEMENT ====================

    /**
     * Save complete auth session (token + user)
     */
    saveSession(data: SessionData): void {
        if (!this.isBrowser()) return;

        const accessToken = data.tokens?.accessToken || data.accessToken || data.token;
        const refreshToken = data.tokens?.refreshToken || data.refreshToken;

        if (accessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            // Sync cookie for middleware
            const isSecure = window.location.protocol === 'https:';
            document.cookie = `auth_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        }

        if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        if (data.user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        }

        // Update last activity
        this.updateLastActivity();

        // Schedule token refresh
        this.scheduleTokenRefresh();

        // Emit login event
        this.emit('login', { user: data.user });

        console.log('[AuthService] Session saved:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            expiresIn: this.getTimeUntilExpiry(),
        });
    }

    /**
     * Get access token
     */
    getToken(): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    /**
     * Get current user data
     */
    getUser(): AuthUser | null {
        if (!this.isBrowser()) return null;

        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    }

    /**
     * Update user data without changing token
     */
    updateUser(user: AuthUser): void {
        if (!this.isBrowser()) return;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    /**
     * Check if user is authenticated (token exists and not expired)
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getUser();

        if (!token || !user?.id) return false;

        // Check token expiry
        if (this.isTokenExpired()) {
            console.log('[AuthService] Token expired');
            return false;
        }

        return true;
    }

    /**
     * Clear all auth data (logout)
     */
    clearSession(): void {
        if (!this.isBrowser()) return;

        // Clear timers
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);

        // Clear auth cookie
        document.cookie = 'auth_token=; path=/; max-age=0';

        // Emit logout event
        this.emit('logout');

        console.log('[AuthService] Session cleared');
    }

    // ==================== TOKEN REFRESH ====================

    /**
     * Schedule automatic token refresh
     */
    private scheduleTokenRefresh(): void {
        if (!this.isBrowser()) return;

        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const timeUntilExpiry = this.getTimeUntilExpiry();
        if (timeUntilExpiry <= 0) return;

        // Refresh 5 minutes before expiry
        const bufferMs = this.config.tokenRefreshBufferMinutes * 60 * 1000;
        const refreshIn = Math.max(0, timeUntilExpiry - bufferMs);

        if (refreshIn > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshToken();
            }, refreshIn);

            console.log('[AuthService] Token refresh scheduled in', Math.round(refreshIn / 1000 / 60), 'minutes');
        }
    }

    /**
     * Refresh the access token using refresh token
     */
    async refreshToken(): Promise<boolean> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            console.log('[AuthService] No refresh token available');
            return false;
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Refresh failed');
            }

            const data = await response.json();

            if (data.success && data.data?.accessToken) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
                const isSecure = window.location.protocol === 'https:';
                document.cookie = `auth_token=${data.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

                // Schedule next refresh
                this.scheduleTokenRefresh();

                this.emit('token_refresh');
                console.log('[AuthService] Token refreshed successfully');
                return true;
            }

            throw new Error('Invalid refresh response');
        } catch (error) {
            console.error('[AuthService] Token refresh failed:', error);
            // Clear session on refresh failure
            this.clearSession();
            this.emit('session_expired');
            return false;
        }
    }

    // ==================== CROSS-TAB SYNC ====================

    /**
     * Setup cross-tab synchronization
     */
    private setupCrossTabSync(): void {
        if (!this.isBrowser()) return;

        window.addEventListener('storage', (e) => {
            // Logout synced across tabs
            if (e.key === STORAGE_KEYS.ACCESS_TOKEN && !e.newValue) {
                console.log('[AuthService] Logout detected from another tab');
                this.emit('tab_sync', { action: 'logout' });

                // Redirect to login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // Login synced across tabs
            if (e.key === STORAGE_KEYS.ACCESS_TOKEN && e.newValue && !e.oldValue) {
                console.log('[AuthService] Login detected from another tab');
                this.emit('tab_sync', { action: 'login' });
            }
        });
    }

    // ==================== SESSION TIMEOUT ====================

    /**
     * Update last activity timestamp
     */
    updateLastActivity(): void {
        if (!this.isBrowser()) return;
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
        this.resetActivityTimer();
    }

    /**
     * Get last activity timestamp
     */
    private getLastActivity(): number {
        const stored = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        return stored ? parseInt(stored, 10) : Date.now();
    }

    /**
     * Check if session has timed out due to inactivity
     */
    isSessionTimedOut(): boolean {
        const lastActivity = this.getLastActivity();
        const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;
        return Date.now() - lastActivity > timeoutMs;
    }

    /**
     * Setup activity tracking for session timeout
     */
    private setupActivityTracking(): void {
        if (!this.isBrowser()) return;

        const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

        const handleActivity = () => {
            if (this.isAuthenticated()) {
                this.updateLastActivity();
            }
        };

        // Throttle activity updates
        let lastUpdate = 0;
        const throttledHandler = () => {
            const now = Date.now();
            if (now - lastUpdate > 60000) { // Update max once per minute
                lastUpdate = now;
                handleActivity();
            }
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, throttledHandler, { passive: true });
        });

        // Initial activity timer
        this.resetActivityTimer();
    }

    /**
     * Reset activity timer
     */
    private resetActivityTimer(): void {
        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
        }

        if (!this.isAuthenticated()) return;

        const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;

        this.activityTimer = setTimeout(() => {
            if (this.isSessionTimedOut()) {
                console.log('[AuthService] Session timed out due to inactivity');
                this.logout(false);
                this.emit('session_expired');
                window.location.href = '/login?timeout=true';
            }
        }, timeoutMs);
    }

    // ==================== REMEMBER ME ====================

    saveRememberMe(accountType: string, identifier: string): void {
        if (!this.isBrowser()) return;
        localStorage.setItem(STORAGE_KEYS.REMEMBER_LOGIN, JSON.stringify({ accountType, identifier }));
    }

    getRememberMe(): { accountType: string; identifier: string } | null {
        if (!this.isBrowser()) return null;
        const data = localStorage.getItem(STORAGE_KEYS.REMEMBER_LOGIN);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    clearRememberMe(): void {
        if (!this.isBrowser()) return;
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_LOGIN);
    }

    // ==================== LOGOUT ====================

    /**
     * Logout - clear session and optionally call logout API
     */
    async logout(callApi = true): Promise<void> {
        if (callApi) {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch {
                // Ignore API errors during logout
            }
        }
        this.clearSession();
    }
}

// Export singleton instance
export const AuthService = new AuthServiceClass();

// Export class for custom instances
export { AuthServiceClass };

// Export config type for customization
export type { AuthConfig };
