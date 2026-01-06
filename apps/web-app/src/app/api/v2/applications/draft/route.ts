import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

/**
 * POST /api/v2/applications/draft
 * Save application as draft using httpOnly cookie authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Get auth token from httpOnly cookie
        const authToken = request.cookies.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบ session กรุณาเข้าสู่ระบบ' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Forward request to backend
        const response = await fetch(`${BACKEND_URL}/v2/applications/draft`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Applications Draft Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถบันทึกคำขอได้' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/v2/applications/draft
 * Get current draft application
 */
export async function GET(request: NextRequest) {
    try {
        const authToken = request.cookies.get('auth_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { success: false, error: 'ไม่พบ session กรุณาเข้าสู่ระบบ' },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/v2/applications/draft`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Applications Draft Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถดึงข้อมูลคำขอได้' },
            { status: 500 }
        );
    }
}
