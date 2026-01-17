/**
 * Mock ThaID Controller
 * Simulates ThaID OpenID Connect Provider for Local Development
 */

const crypto = require('crypto');

// Simulated User Database
const MOCK_USERS = [
    {
        sub: "1234567890123", // Thai ID
        name: "นายสมชาย ใจดี",
        given_name: "สมชาย",
        family_name: "ใจดี",
        gender: "male",
        birthdate: "1980-01-01",
        address: {
            formatted: "123 หมู่ 1 ต.บ้านใหม่ อ.เมือง จ.เชียงใหม่ 50000",
            street_address: "123 หมู่ 1",
            locality: "บ้านใหม่",
            district: "เมือง",
            province: "เชียงใหม่",
            postal_code: "50000",
        },
        pid: "1234567890123",
        ial: "2.3", // Identity Assurance Level
        aal: "2.2",  // Authenticator Assurance Level
    },
];

// In-memory code store (for exchange)
const authCodes = new Map();

exports.authorize = (req, res) => {
    const { client_id, redirect_uri, response_type, state, scope } = req.query;

    // Validate request
    if (!client_id || !redirect_uri) {
        return res.status(400).send('Missing client_id or redirect_uri');
    }

    // Generate a simple HTML page to simulate ThaID Login Screen
    const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ThaID Simulation</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body class="bg-slate-50 font-['Sarabun'] min-h-screen flex items-center justify-center p-4">
        <div class="bg-white max-w-sm w-full rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div class="bg-[#1a237e] p-6 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.bora.dopa.go.th/app-thaid/img/bg-app.png')] opacity-20 bg-cover"></div>
                <img src="https://imagedelivery.net/QZ6TuL-3r02W7wQjQrv5DA/5c4e09a0-6218-450f-2007-6b0433100000/public" alt="ThaID Logo" class="h-20 mx-auto relative z-10 drop-shadow-lg mb-2">
                <p class="text-white/80 text-sm font-bold relative z-10">Department of Provincial Administration</p>
            </div>
            
            <div class="p-8">
                <h2 class="text-2xl font-bold text-slate-800 text-center mb-2">เข้าสู่ระบบด้วย ThaID</h2>
                <p class="text-center text-slate-500 mb-8 text-sm">ระบบจำลองสำหรับนักพัฒนา (Developer Sandbox)</p>

                <div class="space-y-4">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xl font-bold">ส</div>
                        <div>
                            <p class="font-bold text-slate-800">สมชาย ใจดี</p>
                            <p class="text-xs text-slate-500">1-2345-67890-12-3</p>
                        </div>
                    </div>

                    <form action="/api/mock-thaid/approve" method="POST">
                        <input type="hidden" name="redirect_uri" value="${redirect_uri}">
                        <input type="hidden" name="state" value="${state || ''}">
                        <input type="hidden" name="user_id" value="mock_user_1">
                        
                        <button type="submit" class="w-full bg-[#1a237e] hover:bg-[#283593] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2">
                            <span>ยินยอม (Approve)</span>
                        </button>
                    </form>

                    <button onclick="window.history.back()" class="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-all">
                        ยกเลิก (Cancel)
                    </button>
                </div>
                
                <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p class="text-[10px] text-slate-400">
                        This is a simulated screen for development purposes only.<br>
                        GACP Certification Platform
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(html);
};

exports.approve = (req, res) => {
    console.log('-------------- MOCK THAID APPROVE HIT --------------');
    console.log('req.body:', JSON.stringify(req.body));
    const { redirect_uri, state, user_id } = req.body;

    // Generates a one-time authorization code
    const code = crypto.randomBytes(16).toString('hex');

    // Store code mapping (short-lived in memory)
    authCodes.set(code, {
        user_id,
        expiresAt: Date.now() + 60000, // 1 minute expiry
    });

    // Cleanup old codes
    if (authCodes.size > 100) {authCodes.clear();}

    try {
        const url = new URL(redirect_uri);
        url.searchParams.set('code', code);
        if (state) {url.searchParams.set('state', state);}

        console.log('REDIRECTING TO:', url.toString());
        res.redirect(url.toString());
    } catch (error) {
        console.error('REDIRECT ERROR:', error);
        res.status(500).send('Redirect Error: ' + error.message);
    }
};

exports.token = (req, res) => {
    const { code, grant_type } = req.body;

    if (grant_type !== 'authorization_code') {
        return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    const data = authCodes.get(code);
    if (!data || Date.now() > data.expiresAt) {
        return res.status(400).json({ error: 'invalid_grant' });
    }

    // Remove used code
    authCodes.delete(code);

    // Mock ID Token (JWT) - Simplified for dev
    // Real implementation would sign this properly
    const id_token = "mock_id_token_" + Buffer.from(JSON.stringify(MOCK_USERS[0])).toString('base64');
    const access_token = "mock_access_token_" + crypto.randomBytes(16).toString('hex');

    res.json({
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
        id_token,
    });
};

exports.userinfo = (req, res) => {
    // In real world, check Bearer token
    // Here we just return the mock user
    res.json(MOCK_USERS[0]);
};
