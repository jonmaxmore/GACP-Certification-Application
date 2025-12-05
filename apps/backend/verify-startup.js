
const logger = require('./shared/logger');

console.log('Starting server verification...');

try {
    const app = require('./server');
    console.log('Server module loaded successfully.');

    // Optional: Check if critical services are loaded
    const AuthService = require('./services/AuthService');
    const ApplicationWorkflowService = require('./services/ApplicationWorkflowService');

    console.log('Critical services loaded successfully.');
    console.log('VERIFICATION SUCCESS');
    process.exit(0);
} catch (error) {
    console.error('VERIFICATION FAILED:', error);
    process.exit(1);
}
