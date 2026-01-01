/**
 * DTAM Staff Authentication Proxy Route
 * Forwards auth-dtam requests to backend API server
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const endpoint = path.join('/');
        const body = await request.json();

        console.log(`[auth-dtam proxy] POST /api/auth-dtam/${endpoint}`);

        const response = await fetch(`${BACKEND_URL}/api/auth-dtam/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Forward response with same status
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('[auth-dtam proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to connect to authentication server' },
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

        console.log(`[auth-dtam proxy] GET /api/auth-dtam/${endpoint}`);

        const response = await fetch(`${BACKEND_URL}/api/auth-dtam/${endpoint}`, {
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
            { success: false, error: 'Failed to connect to authentication server' },
            { status: 500 }
        );
    }
}
