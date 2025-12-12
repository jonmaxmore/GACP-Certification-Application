import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward login request to backend
        const response = await fetch(`${BACKEND_URL}/v2/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('[Login Proxy] Backend response:', JSON.stringify(data).substring(0, 200));
        console.log('[Login Proxy] Has accessToken:', !!data.data?.tokens?.accessToken);

        if (!response.ok || !data.success) {
            return NextResponse.json(data, { status: response.status });
        }

        // Create response with data
        const nextResponse = NextResponse.json(data);

        // Set cookies from the same origin (port 3001)
        if (data.data?.tokens?.accessToken) {
            console.log('[Login Proxy] Setting auth_token cookie');
            nextResponse.cookies.set('auth_token', data.data.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60, // 24 hours in seconds
                path: '/',
            });
        } else {
            console.log('[Login Proxy] No accessToken found in data.data.tokens');
        }

        if (data.data?.tokens?.refreshToken) {
            nextResponse.cookies.set('refresh_token', data.data.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
                path: '/',
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('[Login Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' },
            { status: 500 }
        );
    }
}
