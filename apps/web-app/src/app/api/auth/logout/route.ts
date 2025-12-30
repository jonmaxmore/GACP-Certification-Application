import { NextRequest, NextResponse } from 'next/server';

/**
 * Logout API Endpoint
 * Clears httpOnly cookies and redirects to login
 */
export async function POST(request: NextRequest) {
    try {
        // Get redirect URL from query or default to /login
        const url = new URL('/login', request.url);
        const response = NextResponse.redirect(url);

        // Clear httpOnly cookies with delete
        response.cookies.delete('auth_token');
        response.cookies.delete('refresh_token');

        return response;
    } catch (error) {
        console.error('[Logout] Error:', error);
        // Even on error, try to go to login
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Also support GET for direct navigation
export async function GET(request: NextRequest) {
    const url = new URL('/login', request.url);
    const response = NextResponse.redirect(url);
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    return response;
}


