/**
 * 🍎 Secure Cookie Utility
 * Apple Security Standards - HttpOnly Cookie Management
 * 
 * Features:
 * - HttpOnly cookies (prevent XSS)
 * - Secure flag (HTTPS only in production)
 * - SameSite protection (CSRF prevention)
 */

const COOKIE_OPTIONS = {
    httpOnly: true,           // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',       // CSRF protection
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
};

/**
 * Set authentication token as HttpOnly cookie
 * @param {Response} res - Express response object
 * @param {string} token - JWT token
 * @param {number} maxAge - Max age in milliseconds (default: 7 days)
 */
function setAuthCookie(res, token, maxAge = 7 * 24 * 60 * 60 * 1000) {
    res.cookie('auth_token', token, {
        ...COOKIE_OPTIONS,
        maxAge,
    });
}

/**
 * Set refresh token as HttpOnly cookie
 * @param {Response} res - Express response object
 * @param {string} refreshToken - Refresh token
 * @param {number} maxAge - Max age in milliseconds (default: 30 days)
 */
function setRefreshCookie(res, refreshToken, maxAge = 30 * 24 * 60 * 60 * 1000) {
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge,
    });
}

/**
 * Set staff authentication token
 * @param {Response} res - Express response object
 * @param {string} token - Staff JWT token
 */
function setStaffCookie(res, token, maxAge = 24 * 60 * 60 * 1000) {
    res.cookie('staff_token', token, {
        ...COOKIE_OPTIONS,
        maxAge,
    });
}

/**
 * Clear authentication cookies
 * @param {Response} res - Express response object
 */
function clearAuthCookies(res) {
    res.clearCookie('auth_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
}

/**
 * Clear staff cookies
 * @param {Response} res - Express response object
 */
function clearStaffCookies(res) {
    res.clearCookie('staff_token', COOKIE_OPTIONS);
}

/**
 * Extract token from HttpOnly cookie or Authorization header
 * @param {Request} req - Express request object
 * @returns {string|null} Token or null
 */
function extractToken(req) {
    // Try HttpOnly cookie first (more secure)
    if (req.cookies && req.cookies.auth_token) {
        return req.cookies.auth_token;
    }

    // Fallback to Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

/**
 * Extract staff token
 * @param {Request} req - Express request object
 * @returns {string|null} Staff token or null
 */
function extractStaffToken(req) {
    if (req.cookies && req.cookies.staff_token) {
        return req.cookies.staff_token;
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

module.exports = {
    setAuthCookie,
    setRefreshCookie,
    setStaffCookie,
    clearAuthCookies,
    clearStaffCookies,
    extractToken,
    extractStaffToken,
    COOKIE_OPTIONS,
};
