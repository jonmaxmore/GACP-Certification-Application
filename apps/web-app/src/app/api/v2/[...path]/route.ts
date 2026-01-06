import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * Generic API Proxy for V2 endpoints
 * Forwards requests to backend with auth_token from httpOnly cookie
 */
async function proxyRequest(request: NextRequest, path: string, method: string) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token')?.value;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add Authorization header from cookie
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Development/Test Mode: Allow X-User-ID header for testing without real JWT
        // This is useful when testing pages without going through full login flow
        const testUserId = request.headers.get('X-User-ID');
        if (testUserId && !authToken) {
            headers['X-User-ID'] = testUserId;
        }

        // Build the full backend URL
        const backendUrl = `${BACKEND_URL}/api/v2/${path}`;

        // Forward request body for POST/PUT/PATCH
        let body: string | undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                body = JSON.stringify(await request.json());
            } catch {
                body = undefined;
            }
        }

        const response = await fetch(backendUrl, {
            method,
            headers,
            body,
        });

        // Use text() then JSON.parse to avoid stream issues
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[API Proxy] Error:', error);
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
    const { path } = await params;
    return proxyRequest(request, path.join('/'), 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path.join('/'), 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path.join('/'), 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path.join('/'), 'DELETE');
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    return proxyRequest(request, path.join('/'), 'PATCH');
}
