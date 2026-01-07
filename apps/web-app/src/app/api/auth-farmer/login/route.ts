import { NextRequest, NextResponse } from 'next/server';

// Use port 8000 for backend API (not 3002)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward login request to backend auth-farmer endpoint (v2 API)
        const response = await fetch(`${BACKEND_URL}/api/v2/auth-farmer/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json(data, { status: response.status });
        }

        // Create response with data
        const nextResponse = NextResponse.json(data);

        // Set cookies from the same origin
        if (data.data?.tokens?.accessToken) {
            nextResponse.cookies.set('auth_token', data.data.tokens.accessToken, {
                httpOnly: false, // Debugging: Check if cookie is set
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60,
                path: '/',
            });
        }

        if (data.data?.tokens?.refreshToken) {
            nextResponse.cookies.set('refresh_token', data.data.tokens.refreshToken, {
                httpOnly: false, // Debugging
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Farmer Login Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' },
            { status: 500 }
        );
    }
}
