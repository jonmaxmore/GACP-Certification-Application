/**
 * DTAM Staff Authentication Proxy Route
 * Forwards auth-dtam requests to backend API server
 * Uses centralized API configuration - no hardcoded URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/api.config';

// Use centralized config for backend URL
const getBackendBaseUrl = () => {
    // In server-side, NEXT_PUBLIC vars are available
    return process.env.NEXT_PUBLIC_API_URL ||
        `http://${process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost'}:${process.env.NEXT_PUBLIC_BACKEND_PORT || '3002'}`;
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const body = await request.json();
        const backendUrl = getBackendBaseUrl();

        console.log(`[auth-dtam proxy] POST to ${backendUrl}/api/auth-dtam/${endpoint}`);
        console.log(`[auth-dtam proxy] Body:`, JSON.stringify(body));

        const response = await fetch(`${backendUrl}/api/auth-dtam/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        console.log(`[auth-dtam proxy] Response status: ${response.status}`);

        // Forward response with same status
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
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const backendUrl = getBackendBaseUrl();

        console.log(`[auth-dtam proxy] GET ${backendUrl}/api/auth-dtam/${endpoint}`);

        const response = await fetch(`${backendUrl}/api/auth-dtam/${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('[auth-dtam proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' },
            { status: 500 }
        );
    }
}
