/**
 * Docker Stop Script - Stop all GACP containers on production server
 */
const { execSync } = require('child_process');

const SSH_KEY = process.env.HOME + '/.ssh/2P_GACP_Application.pem';
const SSH_HOST = 'ec2-user@ec2-47-129-167-71.ap-southeast-1.compute.amazonaws.com';

console.log('🛑 Stopping all Docker containers on production server...\n');

try {
    const cmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${SSH_HOST} "docker stop gacp-nginx gacp-backend gacp-frontend && docker ps -a --format 'table {{.Names}}\\t{{.Status}}'"`;

    execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });

    console.log('\n✅ All containers stopped');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
