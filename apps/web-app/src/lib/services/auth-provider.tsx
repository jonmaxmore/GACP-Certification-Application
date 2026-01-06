'use client';

/**
 * AuthProvider - React component to initialize AuthService
 * 
 * Usage in layout.tsx:
 *   import { AuthProvider } from '@/lib/services/auth-provider';
 *   
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <AuthProvider>{children}</AuthProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 */

import { useEffect, createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AuthService, type AuthUser, type AuthEventType } from './auth-service';

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: AuthUser) => void;
    logout: () => Promise<void>;
    updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth service and sync state
    useEffect(() => {
        // Initialize service (sets up cross-tab sync, timers, etc.)
        AuthService.initialize();

        // Load initial state
        const currentUser = AuthService.getUser();
        const isAuth = AuthService.isAuthenticated();

        if (isAuth && currentUser) {
            setUser(currentUser);
        }
        setIsLoading(false);

        // Subscribe to auth events
        const unsubscribe = AuthService.onAuthChange((event: AuthEventType, data?: unknown) => {
            switch (event) {
                case 'login':
                    setUser(AuthService.getUser());
                    break;
                case 'logout':
                case 'session_expired':
                    setUser(null);
                    break;
                case 'tab_sync':
                    // Sync user state from storage
                    if (AuthService.isAuthenticated()) {
                        setUser(AuthService.getUser());
                    } else {
                        setUser(null);
                    }
                    break;
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const login = useCallback((token: string, user: AuthUser) => {
        AuthService.saveSession({ token, user });
        setUser(user);
    }, []);

    const logout = useCallback(async () => {
        await AuthService.logout();
        setUser(null);
    }, []);

    const updateUser = useCallback((updatedUser: AuthUser) => {
        AuthService.updateUser(updatedUser);
        setUser(updatedUser);
    }, []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user && AuthService.isAuthenticated(),
        isLoading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login'): AuthContextValue {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            window.location.href = redirectTo;
        }
    }, [auth.isLoading, auth.isAuthenticated, redirectTo]);

    return auth;
}
