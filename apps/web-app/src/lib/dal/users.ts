/**
 * User Data Access Functions
 * 
 * 🛡️ All functions check authorization before returning data
 * 🛡️ Only safe DTOs are returned (no passwords, tokens, etc.)
 */

import 'server-only';
import { cookies } from 'next/headers';
import type { SafeUserDTO, SessionData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get current session from cookies
 * Returns null if not authenticated
 */
export async function getSession(): Promise<SessionData | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('staff_token')?.value || cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        // Verify token with backend
        const response = await fetch(`${API_BASE}/api/auth-dtam/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data.success) {
            return null;
        }

        return {
            userId: data.data.id,
            userType: 'DTAM_STAFF',
            role: data.data.role,
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        };
    } catch {
        return null;
    }
}

/**
 * Get current user data (safe DTO only)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<SafeUserDTO | null> {
    const session = await getSession();
    if (!session) {
        return null;
    }

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('staff_token')?.value;

        const response = await fetch(`${API_BASE}/api/auth-dtam/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (!data.success) {
            return null;
        }

        // Return only safe fields
        return {
            id: data.data.id,
            uuid: data.data.uuid,
            name: `${data.data.firstName} ${data.data.lastName}`,
            role: data.data.role,
            department: data.data.department,
        };
    } catch {
        return null;
    }
}

/**
 * Check if current user has required role
 */
export async function requireRole(allowedRoles: string[]): Promise<SafeUserDTO> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized: Not authenticated');
    }

    if (!allowedRoles.includes(user.role)) {
        throw new Error(`Unauthorized: Required role ${allowedRoles.join(' or ')}`);
    }

    return user;
}
