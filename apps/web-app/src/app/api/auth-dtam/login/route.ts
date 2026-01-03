import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward login request to backend
        const response = await fetch(`${BACKEND_URL}/api/auth-dtam/login`, {
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

        // Set staff_token cookie
        if (data.data?.token) {
            nextResponse.cookies.set('staff_token', data.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 8 * 60 * 60, // 8 hours
                path: '/',
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
