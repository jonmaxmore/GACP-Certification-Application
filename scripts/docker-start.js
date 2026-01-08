/**
 * Docker Start Script - Start all GACP containers on production server
 */
const { execSync } = require('child_process');

const path = require('path');
const os = require('os');
const SSH_KEY = path.join(os.homedir(), '.ssh', '2P_GACP_Application.pem');
const SSH_HOST = 'ec2-user@ec2-47-129-167-71.ap-southeast-1.compute.amazonaws.com';

console.log('▶️ Starting all Docker containers on production server...\n');

try {
    const cmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${SSH_HOST} "docker start gacp-postgres gacp-redis gacp-backend gacp-frontend gacp-nginx && sleep 5 && docker ps --format 'table {{.Names}}\\t{{.Status}}'"`;

    execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });

    console.log('\n✅ All containers started');
    console.log('🌐 Website: http://47.129.167.71');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
