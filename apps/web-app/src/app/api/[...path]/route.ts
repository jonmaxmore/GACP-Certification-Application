import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Production Server - Always use this
// Production Server - Always use this (Dev Override)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Generic API Proxy for all /api/* endpoints (excluding /api/v2, /api/auth-*, /api/health, /api/proxy)
 * Forwards requests to backend with auth_token from httpOnly cookie
 */
async function proxyRequest(request: NextRequest, path: string, method: string) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token')?.value;

        // Start with empty headers
        const headers: Record<string, string> = {};

        // 1. Copy Content-Type (Essential for multipart/form-data boundaries)
        const contentType = request.headers.get('content-type');
        if (contentType) {
            headers['Content-Type'] = contentType;
        }

        // 2. Add Authorization header
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        // 3. Forward test headers if needed
        const testUserId = request.headers.get('X-User-ID');
        if (testUserId && !authToken) {
            headers['X-User-ID'] = testUserId;
        }

        // Build the full backend URL
        const backendUrl = `${BACKEND_URL}/api/${path}`;

        console.log(`[API Proxy] ${method} ${backendUrl}`);

        // 4. Forward Body as Stream (don't parse JSON)
        // For GET/HEAD, body must be undefined/null
        const body = (method === 'GET' || method === 'HEAD') ? undefined : request.body;

        const response = await fetch(backendUrl, {
            method,
            headers,
            body,
            // @ts-ignore - Required for Node.js fetch with ReadableStream body
            duplex: 'half'
        });

        // 5. Return Response
        // Use blob() to handle both JSON and Binary responses correctly
        const responseBody = await response.blob();

        return new NextResponse(responseBody, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json'
            }
        });

    } catch (error: any) {
        console.error('[API Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Proxy Error: ' + (error.message || 'Unknown') },
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
