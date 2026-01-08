/**
 * Docker Status Script - View status of all GACP containers
 */
const { execSync } = require('child_process');

const path = require('path');
const os = require('os');
const SSH_KEY = path.join(os.homedir(), '.ssh', '2P_GACP_Application.pem');
const SSH_HOST = 'ec2-user@ec2-47-129-167-71.ap-southeast-1.compute.amazonaws.com';

console.log('📊 Checking Docker container status on production server...\n');

try {
    const cmd = `ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${SSH_HOST} "docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'"`;

    execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });

    console.log('\n✅ Status check complete');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
