/**
 * Health Check Service
 * MIS Team Solution for Server Monitoring
 *
 * Features:
 * - Monitor main server health
 * - Check MongoDB connection
 * - Check API endpoints
 * - Send alerts on failures
 * - Auto-restart if needed
 */

const logger = require('../shared/logger');
const http = require('http');
const https = require('https');

class HealthCheckService {
  constructor() {
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 seconds
    this.failureCount = 0;
    this.maxFailures = 3;
    this.isRunning = false;
  }

  /**
   * Start health check service
   */
  start() {
    logger.info('[Health Check] Starting service...');
    logger.info(`[Health Check] Check interval: ${this.checkInterval}ms`);

    this.isRunning = true;
    this.runChecks();

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runChecks();
    }, this.checkInterval);
  }

  /**
   * Stop health check service
   */
  stop() {
    logger.info('[Health Check] Stopping service...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    if (!this.isRunning) {
      return;
    }

    logger.info(`\n[Health Check] Running checks at ${new Date().toISOString()}`);

    try {
      // Get port from environment (UAT uses 3001, production uses 5000)
      const port = process.env.PORT || 5000;
      const baseUrl = `http://localhost:${port}`;

      // Check 1: Main server health
      const serverHealth = await this.checkServer(`${baseUrl}/health`);
      logger.info(`[Health Check] Main Server (port ${port});: ${serverHealth.status}`);

      // Check 2: Auth service (optional - may not exist in all environments)
      const authHealth = await this.checkServer(`${baseUrl}/api/auth/health`);
      logger.info(`[Health Check] Auth Service: ${authHealth.status}`);

      // Check 3: DTAM service (optional)
      const dtamHealth = await this.checkServer(`${baseUrl}/api/auth/dtam/health`);
      logger.info(`[Health Check] DTAM Service: ${dtamHealth.status}`);

      // All checks passed (only require main server to be healthy)
      if (serverHealth.ok) {
        this.failureCount = 0;
        logger.info('[Health Check] ✅ All critical checks passed');

        // Log warnings for non-critical services
        if (!authHealth.ok) {
          logger.info('[Health Check] ⚠️  Auth service unavailable (non-critical);');
        }
        if (!dtamHealth.ok) {
          logger.info('[Health Check] ⚠️  DTAM service unavailable (non-critical);');
        }
      } else {
        this.failureCount++;
        console.log(
          `[Health Check] ⚠️  Critical checks failed (${this.failureCount}/${this.maxFailures})`,
        );

        if (this.failureCount >= this.maxFailures) {
          logger.error('[Health Check] ❌ Max failures reached! Alerting...');
          this.sendAlert({
            serverHealth,
            authHealth,
            dtamHealth,
          });
        }
      }
    } catch (error) {
      logger.error('[Health Check] ❌ Error during checks:', error.message);
      this.failureCount++;
    }
  }

  /**
   * Check server endpoint
   */
  checkServer(url, timeout = 5000) {
    return new Promise(resolve => {
      const client = url.startsWith('https') ? https : http;

      const req = client.get(url, { timeout }, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({
              ok: res.statusCode === 200,
              status: json.status || 'unknown',
              statusCode: res.statusCode,
              data: json,
            });
          } catch (e) {
            resolve({
              ok: res.statusCode === 200,
              status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
              statusCode: res.statusCode,
              data: data,
            });
          }
        });
      });

      req.on('error', error => {
        resolve({
          ok: false,
          status: 'error',
          error: error.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          ok: false,
          status: 'timeout',
          error: 'Request timeout',
        });
      });
    });
  }

  /**
   * Send alert (console for now, can integrate with email/Slack)
   */
  sendAlert(healthData) {
    logger.error('\n========================================');
    logger.error('🚨 HEALTH CHECK ALERT');
    logger.error('========================================');
    logger.error('Time:', new Date().toISOString());
    logger.error('Failure Count:', this.failureCount);
    logger.error('Health Data:', JSON.stringify(healthData, null, 2));
    logger.error('========================================\n');

    // TODO: Send email, Slack notification, or SMS
    // TODO: Trigger auto-restart via PM2 API
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
    };
  }
}

// Run if called directly
if (require.main === module) {
  const service = new HealthCheckService();
  service.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('\n[Health Check] Received SIGINT, shutting down...');
    service.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('\n[Health Check] Received SIGTERM, shutting down...');
    service.stop();
    process.exit(0);
  });
}

module.exports = HealthCheckService;
