import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5000';

/**
 * Auth DTAM Proxy - Properly forwards Set-Cookie headers from backend
 * For staff authentication with httpOnly cookies
 */

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const backendUrl = `${BACKEND_URL}/api/auth-dtam/${endpoint}`;

        console.log('[Auth DTAM Proxy] Forwarding to:', backendUrl);

        let body: string | undefined;
        try {
            const jsonBody = await request.json();
            body = JSON.stringify(jsonBody);
        } catch {
            body = undefined;
        }

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

        // Forward Set-Cookie headers from backend
        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Auth DTAM Proxy] Error:', error);
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
        const backendUrl = `${BACKEND_URL}/api/auth-dtam/${endpoint}`;

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

        const setCookies = response.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            setCookies.forEach(cookie => {
                nextResponse.headers.append('Set-Cookie', cookie);
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Auth DTAM Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' },
            { status: 500 }
        );
    }
}
