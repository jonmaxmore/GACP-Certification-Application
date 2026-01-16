import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

/**
 * Auth Farmer Proxy - Properly forwards Set-Cookie headers from backend
 * Critical for login to work correctly with httpOnly cookies
 */

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const backendUrl = `${BACKEND_URL}/api/auth-farmer/${endpoint}`;

        console.log('[Auth Proxy] Forwarding to:', backendUrl);

        // Get request body
        let body: string | undefined;
        try {
            const jsonBody = await request.json();
            body = JSON.stringify(jsonBody);
        } catch {
            body = undefined;
        }

        // Forward cookies (for authenticated requests like /me)
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body,
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });

        // 🔐 CRITICAL: Forward ALL Set-Cookie headers from backend to browser
        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            console.log('[Auth Proxy] Forwarding cookies:', setCookies.length);
            setCookies.forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Auth Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const backendUrl = `${BACKEND_URL}/api/auth-farmer/${endpoint}`;

        // Forward cookies for authentication
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
        }

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward Set-Cookie headers
        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Auth Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}
