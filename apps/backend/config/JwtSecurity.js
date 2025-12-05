const jwt = require('jsonwebtoken');

const getJWTConfiguration = () => {
    return {
        public: {
            secret: process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod',
            expiry: process.env.JWT_EXPIRES_IN || '24h',
            issuer: process.env.JWT_ISSUER || 'gacp-backend',
            audience: process.env.JWT_AUDIENCE || 'gacp-users',
            algorithm: 'HS256'
        },
        dtam: {
            secret: process.env.DTAM_JWT_SECRET || 'default-dtam-secret',
            expiry: '12h',
            issuer: 'gacp-backend',
            audience: 'gacp-staff',
            algorithm: 'HS256'
        }
    };
};

const verifyToken = (token, type, config) => {
    const secret = type === 'dtam' ? config.dtam.secret : config.public.secret;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            error.code = 'TOKEN_EXPIRED';
            error.expiredAt = error.expiredAt;
        } else {
            error.code = 'INVALID_TOKEN';
        }
        throw error;
    }
};

const generateToken = (payload, type = 'public') => {
    const config = getJWTConfiguration();
    const secret = type === 'dtam' ? config.dtam.secret : config.public.secret;
    const options = {
        expiresIn: type === 'dtam' ? config.dtam.expiry : config.public.expiry,
        issuer: type === 'dtam' ? config.dtam.issuer : config.public.issuer,
        audience: type === 'dtam' ? config.dtam.audience : config.public.audience,
        algorithm: type === 'dtam' ? config.dtam.algorithm : config.public.algorithm
    };
    return jwt.sign(payload, secret, options);
};

module.exports = {
    getJWTConfiguration,
    loadJWTConfiguration: getJWTConfiguration, // Alias
    verifyToken,
    generateToken
};
