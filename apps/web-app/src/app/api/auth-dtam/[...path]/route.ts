/**
 * DTAM Staff Authentication Proxy Route
 * Forwards auth-dtam requests to backend API server
 * Uses centralized API configuration - no hardcoded URLs
 */

import { NextRequest, NextResponse } from 'next/server';

// Use environment variables for backend URL configuration
const getBackendBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL ||
        `http://${process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost'}:${process.env.NEXT_PUBLIC_BACKEND_PORT || '3002'}`;
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const backendUrl = getBackendBaseUrl();

    try {
        const { path } = await params;
        const endpoint = path.join('/');

        // Parse request body with error handling
        let body;
        try {
            body = await request.json();
        } catch {
            console.error('[auth-dtam proxy] Failed to parse request body');
            return NextResponse.json(
                { success: false, error: 'รูปแบบข้อมูลไม่ถูกต้อง' },
                { status: 400 }
            );
        }

        console.log(`[auth-dtam proxy] POST ${backendUrl}/api/auth-dtam/${endpoint}`);

        // Forward request to backend
        const response = await fetch(`${backendUrl}/api/auth-dtam/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // Parse response
        let data;
        try {
            data = await response.json();
        } catch {
            console.error('[auth-dtam proxy] Failed to parse backend response');
            return NextResponse.json(
                { success: false, error: 'การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง' },
                { status: 502 }
            );
        }

        console.log(`[auth-dtam proxy] Response: ${response.status}`);

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('[auth-dtam proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const backendUrl = getBackendBaseUrl();

    try {
        const { path } = await params;
        const endpoint = path.join('/');

        console.log(`[auth-dtam proxy] GET ${backendUrl}/api/auth-dtam/${endpoint}`);

        const response = await fetch(`${backendUrl}/api/auth-dtam/${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        let data;
        try {
            data = await response.json();
        } catch {
            console.error('[auth-dtam proxy] Failed to parse backend response');
            return NextResponse.json(
                { success: false, error: 'การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง' },
                { status: 502 }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('[auth-dtam proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' },
            { status: 500 }
        );
    }
}
