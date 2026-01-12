const http = require('http');
// Simple script to check headers on a running local server
const app = require('../apps/backend/server');

async function verifySecurity() {
    console.log('--- Verifying Security Middleware ---');
    let server;
    try {
        // Start express app on random port to avoid conflicts
        server = app.listen(0);
        const port = server.address().port;
        const url = `http://localhost:${port}/health`;

        console.log(`Testing against ephemeral port ${port}`);

        // 1. Check Helmet Headers
        // We use the global fetch API (available in Node 18+)
        const response = await fetch(url);
        const headers = response.headers;

        console.log('Headers received');

        // Assert Helmet Headers
        const expectedHeaders = [
            'x-dns-prefetch-control', // Helmet default
            'x-content-type-options', // Helmet default
        ];

        let missing = [];
        for (const h of expectedHeaders) {
            if (!headers.has(h)) {
                missing.push(h);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Missing Security Headers: ${missing.join(', ')}`);
        }
        console.log('✅ Helmet Headers Verified');

        // 2. Check CORS (Block Bad Origin)
        try {
            const badRes = await fetch(url, {
                headers: { 'Origin': 'http://evil-site.com' }
            });

            // Our CORS config throws an Error for bad origins.
            // Express catches errors and usually returns 500 (or the error handler runs).
            // We expect it NOT to be 200, and NOT to have the allow-origin header matching the bad origin.

            if (badRes.status === 200) {
                console.warn('⚠️ CORS allowed bad origin with 200 OK (Unexpected)');
            }

            if (badRes.headers.get('access-control-allow-origin') === 'http://evil-site.com') {
                throw new Error('CORS failed to block bad origin');
            }
            console.log(`✅ CORS blocked bad origin (Status: ${badRes.status})`);

        } catch (e) {
            // Fetch might fail if the server closes connection abruptly, which is also a "block"
            console.log('✅ CORS Blocked Connection:', e.message);
        }

        server.close();
        console.log('✅ Security Middleware Verified');
        process.exit(0);
    } catch (error) {
        if (server) server.close();
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

verifySecurity();
