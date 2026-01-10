/**
 * GACP Master UAT Suite
 * 
 * Objective: Execute all E2E scenarios (Chaos + Golden) to validate the entire system.
 * Flow:
 * 1. Reset Environment (Restart Server)
 * 2. Run Chaos Journey (Robustness, Edge Cases)
 * 3. Reset Environment
 * 4. Run QC Golden Journey (Critical Business Path)
 * 5. Report Aggregate Results
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function runScript(scriptName, logFile) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔵 [UAT] Starting: ${scriptName}...`);
        const logStream = fs.createWriteStream(logFile);

        const proc = spawn('node', [scriptName], {
            cwd: process.cwd(),
            env: { ...process.env, FORCE_COLOR: 'true' }, // Keep colors
            shell: true,
        });

        proc.stdout.pipe(process.stdout); // Stream to console
        proc.stdout.pipe(logStream);      // Stream to log
        proc.stderr.pipe(process.stderr);
        proc.stderr.pipe(logStream);

        proc.on('close', (code) => {
            console.log(`\n${code === 0 ? '✅' : '❌'} [UAT] Finished: ${scriptName} (Exit Code: ${code})`);
            if (code === 0) {resolve();}
            else {reject(new Error(`${scriptName} failed`));}
        });
    });
}

async function killPort5000() {
    return new Promise((resolve) => {
        // Find PID on port 5000
        const cmd = "netstat -ano | findstr :5000";
        require('child_process').exec(cmd, (err, stdout) => {
            if (err || !stdout) {return resolve();} // No process found
            const lines = stdout.trim().split('\n');
            const pids = lines.map(l => l.trim().split(/\s+/).pop()).filter(p => p !== '0');
            if (pids.length === 0) {return resolve();}

            const uniquePids = [...new Set(pids)];
            console.log(`   -> Killing PIDs on port 5000: ${uniquePids.join(', ')}`);

            // Kill each PID
            const killCmd = `taskkill /F /PID ${uniquePids.join(' /PID ')}`;
            require('child_process').exec(killCmd, () => resolve());
        });
    });
}

async function restartServer() {
    console.log('\n🔄 [UAT] Restarting Backend Server...');
    await killPort5000();

    // 2. Wait
    await new Promise(r => setTimeout(r, 2000));

    // 3. Start Server (Detached)
    const out = fs.openSync('server_uat.log', 'a');
    const err = fs.openSync('server_uat.log', 'a');
    const server = spawn('node', ['apps/backend/server.js'], {
        detached: true,
        stdio: ['ignore', out, err],
    });
    server.unref();
    console.log('   -> Server Process Spawed. Waiting 10s for init...');
    await new Promise(r => setTimeout(r, 10000));
}

async function runUAT() {
    console.log('🚀 INITIALIZING GACP MASTER UAT SUITE 🚀');
    const logsDir = 'logs/uat';
    if (!fs.existsSync(logsDir)) {fs.mkdirSync(logsDir, { recursive: true });}

    try {
        // --- PHASE 1: CHAOS ---
        await restartServer();
        await runScript('apps/backend/scripts/e2e_chaos_journey.js', 'logs/uat/chaos.log');

        // --- PHASE 2: GOLDEN ---
        await restartServer();
        await runScript('apps/backend/scripts/e2e_qc_golden.js', 'logs/uat/golden.log');

        console.log('\n\n🏆🏆🏆 ALL UAT SCENARIOS PASSED 🏆🏆🏆');
        console.log('Review logs in logs/uat/');
    } catch (e) {
        console.error('\n💥 UAT FAILED:', e.message);
        process.exit(1);
    }
}

runUAT();
