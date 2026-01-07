import { NextRequest, NextResponse } from 'next/server';

// Use port 8000 for backend API
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * GET /api/auth-farmer/me
 * Returns current user profile using httpOnly cookie authentication
 */
export async function GET(request: NextRequest) {
    try {
        // Get auth token from httpOnly cookie
        const authToken = request.cookies.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบ session กรุณาเข้าสู่ระบบ' },
                { status: 401 }
            );
        }

        // Forward request to backend with token
        const response = await fetch(`${BACKEND_URL}/api/v2/auth-farmer/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // If token expired, clear cookies
            if (response.status === 401) {
                const res = NextResponse.json(
                    { success: false, error: 'Session หมดอายุ' },
                    { status: 401 }
                );
                res.cookies.delete('auth_token');
                res.cookies.delete('refresh_token');
                return res;
            }
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Farmer Me Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' },
            { status: 500 }
        );
    }
}
