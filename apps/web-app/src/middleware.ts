import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🍎 Zero-Crash Security Middleware

// Routes that require farmer authentication
const protectedFarmerRoutes = [
    '/dashboard',
    '/applications',
    '/establishments',
    '/profile',
    '/notifications',
    '/tracking',
    '/payments',
    '/certificates',
    '/documents',
];

// Routes that require staff authentication
const protectedStaffRoutes = [
    '/staff/dashboard',
    '/staff/applications',
    '/staff/audits',
    '/staff/accounting',
    '/staff/calendar',
    '/staff/analytics',
];

// Routes that are only for unauthenticated users
const authRoutes = ['/login', '/register', '/forgot-password'];
const staffAuthRoutes = ['/staff/login'];

// Security headers for all responses
const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // ========================================
    // 🔒 EARLY EXIT: Apply Security Headers
    // ========================================
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // ========================================
    // 🔒 EARLY EXIT: Block suspicious patterns
    // ========================================
    const suspiciousPatterns = [
        /\.\.\//,           // Path traversal
        /<script/i,         // XSS attempt
        /javascript:/i,     // JS injection
        /\x00/,             // Null byte
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(pathname))) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // ========================================
    // 🔐 Farmer Route Protection
    // ========================================
    const token = request.cookies.get('auth_token')?.value;
    const isProtectedFarmerRoute = protectedFarmerRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isProtectedFarmerRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ========================================
    // 🔐 Staff Route Protection
    // ========================================
    const staffToken = request.cookies.get('staff_token')?.value;
    const isProtectedStaffRoute = protectedStaffRoutes.some(route => pathname.startsWith(route));
    const isStaffAuthRoute = staffAuthRoutes.some(route => pathname.startsWith(route));

    if (isProtectedStaffRoute && !staffToken) {
        const loginUrl = new URL('/staff/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isStaffAuthRoute && staffToken) {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$).*)',
    ],
};

