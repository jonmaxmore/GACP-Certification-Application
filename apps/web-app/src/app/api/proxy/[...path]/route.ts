import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

/**
 * Forward cookies and authorization headers to backend
 */
function getForwardHeaders(request: NextRequest): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Forward cookies (for httpOnly auth_token)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    // Forward authorization header (for mobile apps)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    // Forward client IP for audit logging
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        headers['X-Forwarded-For'] = forwardedFor;
    }

    return headers;
}

/**
 * Forward Set-Cookie from backend to client
 */
function forwardSetCookie(backendResponse: Response, nextResponse: NextResponse): void {
    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
        nextResponse.headers.set('Set-Cookie', setCookie);
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    try {
        const path = pathArray.join('/');
        const searchParams = request.nextUrl.searchParams.toString();
        const url = `${BACKEND_URL}/api/v2/${path}${searchParams ? `?${searchParams}` : ''}`;

        const response = await fetch(url, {
            headers: getForwardHeaders(request),
            cache: 'no-store',
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });
        forwardSetCookie(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    try {
        const path = pathArray.join('/');
        const url = `${BACKEND_URL}/api/v2/${path}`;

        let body;
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });
        forwardSetCookie(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    try {
        const path = pathArray.join('/');
        const url = `${BACKEND_URL}/api/v2/${path}`;

        let body;
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });
        forwardSetCookie(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    try {
        const path = pathArray.join('/');
        const url = `${BACKEND_URL}/api/v2/${path}`;

        let body;
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: getForwardHeaders(request),
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });
        forwardSetCookie(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    try {
        const path = pathArray.join('/');
        const url = `${BACKEND_URL}/api/v2/${path}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: getForwardHeaders(request),
        });

        const data = await response.json();
        const nextResponse = NextResponse.json(data, { status: response.status });
        forwardSetCookie(response, nextResponse);
        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Backend connection failed' },
            { status: 500 }
        );
    }
}
