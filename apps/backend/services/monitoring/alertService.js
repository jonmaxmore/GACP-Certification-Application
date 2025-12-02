/**
 * Alert Service
 *
 * Threshold-based alerting system with multiple notification channels
 * Monitors metrics and triggers alerts when thresholds are exceeded
 *
 * Features:
 * - Threshold monitoring
 * - Email notifications
 * - SMS notifications (optional)
 * - Alert history tracking
 * - Alert deduplication
 * - Alert escalation
 * - Configurable alert rules
 */

const EventEmitter = require('events');
const nodemailer = require('nodemailer');
const logger = require('../../shared/logger');

class AlertService extends EventEmitter {
  constructor() {
    super();

    // Alert history (last 100 alerts)
    this.alertHistory = [];
    this.maxHistorySize = 100;

    // Alert deduplication (prevent duplicate alerts within time window)
    this.recentAlerts = new Map();
    this.deduplicationWindow = 300000; // 5 minutes

    // Email configuration
    this.emailTransporter = null;
    this.setupEmailTransporter();

    // Alert rules (can be configured)
    this.alertRules = {
      cpu: {
        warning: 70,
        critical: 85,
        enabled: true,
      },
      memory: {
        warning: 75,
        critical: 90,
        enabled: true,
      },
      disk: {
        warning: 80,
        critical: 95,
        enabled: true,
      },
      queryTime: {
        warning: 300,
        critical: 1000,
        enabled: true,
      },
      cacheHitRate: {
        warning: 60,
        critical: 40,
        enabled: true,
      },
      apiResponseTime: {
        warning: 500,
        critical: 2000,
        enabled: true,
      },
      errorRate: {
        warning: 2,
        critical: 5,
        enabled: true,
      },
      queueFailed: {
        warning: 5,
        critical: 20,
        enabled: true,
      },
    };

    // Alert recipients
    this.recipients = {
      email: process.env.ALERT_EMAILS?.split(',') || ['admin@example.com'],
      sms: process.env.ALERT_SMS?.split(',') || [],
    };

    console.log('✅ Alert Service initialized');
  }

  /**
   * Setup email transporter
   */
  setupEmailTransporter() {
    if (!process.env.SMTP_HOST) {
      console.warn('⚠️  SMTP not configured. Email alerts disabled.');
      return;
    }

    try {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('✅ Email transporter configured');
    } catch (error) {
      console.error('❌ Error setting up email transporter:', error);
    }
  }

  /**
   * Check metric against thresholds
   */
  checkMetric(metricName, value, metadata = {}) {
    const rule = this.alertRules[metricName];

    if (!rule || !rule.enabled) {
      return;
    }

    let severity = null;
    let threshold = null;

    // Determine severity
    if (value >= rule.critical) {
      severity = 'critical';
      threshold = rule.critical;
    } else if (value >= rule.warning) {
      severity = 'warning';
      threshold = rule.warning;
    }

    // Trigger alert if threshold exceeded
    if (severity) {
      this.triggerAlert({
        metric: metricName,
        value,
        threshold,
        severity,
        ...metadata,
      });
    }
  }

  /**
   * Trigger alert
   */
  async triggerAlert(alert) {
    // Add timestamp
    alert.timestamp = new Date();
    alert.id = `${alert.metric}-${alert.timestamp.getTime()}`;

    // Check for duplicate alerts
    if (this.isDuplicateAlert(alert)) {
      console.log(`🔕 Suppressed duplicate alert: ${alert.metric}`);
      return;
    }

    // Add to history
    this.addToHistory(alert);

    // Log alert
    const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
    logger[logLevel](
      `🚨 ALERT: ${alert.metric} = ${alert.value} (threshold: ${alert.threshold})`,
      alert,
    );

    // Send notifications
    await this.sendNotifications(alert);

    // Emit alert event
    this.emit('alert', alert);

    // Update recent alerts for deduplication
    this.recentAlerts.set(alert.metric, alert);
    setTimeout(() => {
      this.recentAlerts.delete(alert.metric);
    }, this.deduplicationWindow);
  }

  /**
   * Check if alert is duplicate
   */
  isDuplicateAlert(alert) {
    const recent = this.recentAlerts.get(alert.metric);

    if (!recent) {
      return false;
    }

    // Check if same severity and similar value
    const isSameSeverity = recent.severity === alert.severity;
    const valueDiff = Math.abs(recent.value - alert.value);
    const isSimilarValue = valueDiff < alert.threshold * 0.05; // Within 5%

    return isSameSeverity && isSimilarValue;
  }

  /**
   * Send notifications
   */
  async sendNotifications(alert) {
    const promises = [];

    // Send email
    if (this.emailTransporter && this.recipients.email.length > 0) {
      promises.push(this.sendEmailAlert(alert));
    }

    // Send SMS (if configured)
    if (this.recipients.sms.length > 0) {
      promises.push(this.sendSMSAlert(alert));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(alert) {
    try {
      const subject = `[${alert.severity.toUpperCase()}] System Alert: ${alert.metric}`;

      const html = `
        <h2>System Alert</h2>
        <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
        <p><strong>Metric:</strong> ${alert.metric}</p>
        <p><strong>Current Value:</strong> ${alert.value}</p>
        <p><strong>Threshold:</strong> ${alert.threshold}</p>
        <p><strong>Time:</strong> ${alert.timestamp.toISOString()}</p>
        
        ${alert.message ? `<p><strong>Message:</strong> ${alert.message}</p>` : ''}
        
        <h3>Recommended Actions:</h3>
        <ul>
          ${this.getRecommendedActions(alert.metric)
            .map(action => `<li>${action}</li>`)
            .join('')}
        </ul>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from Botanical Audit Framework Monitoring System.
        </p>
      `;

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'alerts@botanicalaudit.com',
        to: this.recipients.email.join(','),
        subject,
        html,
      });

      console.log(`📧 Email alert sent for ${alert.metric}`);
    } catch (error) {
      console.error('❌ Error sending email alert:', error);
    }
  }

  /**
   * Send SMS alert (placeholder - implement with Twilio/AWS SNS)
   */
  async sendSMSAlert(alert) {
    try {
      // TODO: Implement SMS provider (Twilio, AWS SNS, etc.)
      const message = `[${alert.severity.toUpperCase()}] ${alert.metric}: ${alert.value} (threshold: ${alert.threshold})`;

      console.log(`📱 SMS alert (not implemented): ${message}`);

      // Example with Twilio:
      // await twilioClient.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE,
      //   to: this.recipients.sms
      // });
    } catch (error) {
      console.error('❌ Error sending SMS alert:', error);
    }
  }

  /**
   * Get recommended actions for metric
   */
  getRecommendedActions(metric) {
    const actions = {
      cpu: [
        'Check for runaway processes',
        'Review application performance',
        'Consider scaling horizontally',
        'Optimize heavy computations',
      ],
      memory: [
        'Check for memory leaks',
        'Review cache size configuration',
        'Clear unused data',
        'Consider increasing server memory',
      ],
      disk: [
        'Clean up old logs',
        'Remove temporary files',
        'Archive old data',
        'Expand disk storage',
      ],
      queryTime: [
        'Review slow queries',
        'Check database indexes',
        'Optimize query patterns',
        'Consider query caching',
      ],
      cacheHitRate: [
        'Review cache TTL settings',
        'Implement cache warming',
        'Check cache key generation',
        'Analyze cache usage patterns',
      ],
      apiResponseTime: [
        'Check server load',
        'Review endpoint performance',
        'Implement caching',
        'Optimize database queries',
      ],
      errorRate: [
        'Check application logs',
        'Review recent deployments',
        'Investigate error patterns',
        'Check external service status',
      ],
      queueFailed: [
        'Check queue worker status',
        'Review failed job errors',
        'Check Redis connection',
        'Retry failed jobs if safe',
      ],
    };

    return actions[metric] || ['Review system logs', 'Contact system administrator'];
  }

  /**
   * Add alert to history
   */
  addToHistory(alert) {
    this.alertHistory.unshift(alert);

    // Keep only last N alerts
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 50, severity = null) {
    let history = this.alertHistory;

    if (severity) {
      history = history.filter(alert => alert.severity === severity);
    }

    return history.slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStats() {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;

    const recentAlerts = this.alertHistory.filter(
      alert => now - alert.timestamp.getTime() < oneHour,
    );

    const todayAlerts = this.alertHistory.filter(alert => now - alert.timestamp.getTime() < oneDay);

    const byMetric = {};
    this.alertHistory.forEach(alert => {
      byMetric[alert.metric] = (byMetric[alert.metric] || 0) + 1;
    });

    const bySeverity = {
      warning: this.alertHistory.filter(a => a.severity === 'warning').length,
      critical: this.alertHistory.filter(a => a.severity === 'critical').length,
    };

    return {
      total: this.alertHistory.length,
      lastHour: recentAlerts.length,
      last24Hours: todayAlerts.length,
      byMetric,
      bySeverity,
      mostRecent: this.alertHistory[0] || null,
    };
  }

  /**
   * Update alert rule
   */
  updateAlertRule(metric, updates) {
    if (this.alertRules[metric]) {
      this.alertRules[metric] = {
        ...this.alertRules[metric],
        ...updates,
      };
      console.log(`✅ Alert rule updated for ${metric}`, updates);
    }
  }

  /**
   * Get alert rules
   */
  getAlertRules() {
    return this.alertRules;
  }

  /**
   * Clear alert history
   */
  clearHistory() {
    this.alertHistory = [];
    console.log('🧹 Alert history cleared');
  }

  /**
   * Test alert system
   */
  async testAlert() {
    const testAlert = {
      metric: 'test',
      value: 100,
      threshold: 50,
      severity: 'warning',
      message: 'This is a test alert',
    };

    await this.triggerAlert(testAlert);
    console.log('✅ Test alert sent');
  }
}

// Singleton instance
const alertService = new AlertService();

// Listen to metric alerts from metrics service
if (global.eventEmitter) {
  global.eventEmitter.on('metric:alert', alert => {
    alertService.triggerAlert(alert);
  });
}

module.exports = alertService;
