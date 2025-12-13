/**
 * Prometheus Metrics Endpoint for GACP Backend
 * Exposes application metrics for monitoring
 */

const express = require('express');
const router = express.Router();

// Simple in-memory metrics storage
const metrics = {
    counters: {
        http_requests_total: 0,
        http_errors_total: 0,
        auth_success_total: 0,
        auth_failure_total: 0,
        file_uploads_total: 0,
        file_downloads_total: 0,
    },
    gauges: {
        active_users: 0,
        pending_applications: 0,
        database_connections: 0,
    },
    histograms: {
        http_request_duration_ms: [],
    },
    startTime: Date.now(),
};

// Helper to format metrics in Prometheus format
const formatPrometheusMetrics = () => {
    const lines = [];
    const prefix = 'gacp';

    // Counters
    lines.push(`# HELP ${prefix}_http_requests_total Total HTTP requests`);
    lines.push(`# TYPE ${prefix}_http_requests_total counter`);
    lines.push(`${prefix}_http_requests_total ${metrics.counters.http_requests_total}`);

    lines.push(`# HELP ${prefix}_http_errors_total Total HTTP errors`);
    lines.push(`# TYPE ${prefix}_http_errors_total counter`);
    lines.push(`${prefix}_http_errors_total ${metrics.counters.http_errors_total}`);

    lines.push(`# HELP ${prefix}_auth_success_total Total successful authentications`);
    lines.push(`# TYPE ${prefix}_auth_success_total counter`);
    lines.push(`${prefix}_auth_success_total ${metrics.counters.auth_success_total}`);

    lines.push(`# HELP ${prefix}_auth_failure_total Total failed authentications`);
    lines.push(`# TYPE ${prefix}_auth_failure_total counter`);
    lines.push(`${prefix}_auth_failure_total ${metrics.counters.auth_failure_total}`);

    lines.push(`# HELP ${prefix}_file_uploads_total Total file uploads`);
    lines.push(`# TYPE ${prefix}_file_uploads_total counter`);
    lines.push(`${prefix}_file_uploads_total ${metrics.counters.file_uploads_total}`);

    // Gauges
    lines.push(`# HELP ${prefix}_active_users Current active users`);
    lines.push(`# TYPE ${prefix}_active_users gauge`);
    lines.push(`${prefix}_active_users ${metrics.gauges.active_users}`);

    lines.push(`# HELP ${prefix}_pending_applications Current pending applications`);
    lines.push(`# TYPE ${prefix}_pending_applications gauge`);
    lines.push(`${prefix}_pending_applications ${metrics.gauges.pending_applications}`);

    // Uptime
    const uptimeSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);
    lines.push(`# HELP ${prefix}_uptime_seconds Server uptime in seconds`);
    lines.push(`# TYPE ${prefix}_uptime_seconds gauge`);
    lines.push(`${prefix}_uptime_seconds ${uptimeSeconds}`);

    // Process metrics
    const memUsage = process.memoryUsage();
    lines.push(`# HELP ${prefix}_memory_heap_used_bytes Heap memory used`);
    lines.push(`# TYPE ${prefix}_memory_heap_used_bytes gauge`);
    lines.push(`${prefix}_memory_heap_used_bytes ${memUsage.heapUsed}`);

    lines.push(`# HELP ${prefix}_memory_heap_total_bytes Total heap memory`);
    lines.push(`# TYPE ${prefix}_memory_heap_total_bytes gauge`);
    lines.push(`${prefix}_memory_heap_total_bytes ${memUsage.heapTotal}`);

    return lines.join('\n');
};

// Middleware to track request metrics
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        metrics.counters.http_requests_total++;

        if (res.statusCode >= 400) {
            metrics.counters.http_errors_total++;
        }

        const duration = Date.now() - start;
        metrics.histograms.http_request_duration_ms.push(duration);

        // Keep only last 1000 measurements
        if (metrics.histograms.http_request_duration_ms.length > 1000) {
            metrics.histograms.http_request_duration_ms.shift();
        }
    });

    next();
};

// Track specific events
const trackEvent = (eventType) => {
    switch (eventType) {
        case 'auth_success':
            metrics.counters.auth_success_total++;
            break;
        case 'auth_failure':
            metrics.counters.auth_failure_total++;
            break;
        case 'file_upload':
            metrics.counters.file_uploads_total++;
            break;
        case 'file_download':
            metrics.counters.file_downloads_total++;
            break;
    }
};

// Update gauge values
const setGauge = (name, value) => {
    if (metrics.gauges.hasOwnProperty(name)) {
        metrics.gauges[name] = value;
    }
};

/**
 * @route GET /api/v2/metrics
 * @desc Prometheus metrics endpoint
 * @access Public (for Prometheus scraper)
 */
router.get('/', (req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(formatPrometheusMetrics());
});

/**
 * @route GET /api/v2/metrics/json
 * @desc JSON format metrics for debugging
 * @access Private
 */
router.get('/json', (req, res) => {
    res.json({
        success: true,
        data: {
            counters: metrics.counters,
            gauges: metrics.gauges,
            uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
            memory: process.memoryUsage(),
        },
    });
});

module.exports = router;
module.exports.metricsMiddleware = metricsMiddleware;
module.exports.trackEvent = trackEvent;
module.exports.setGauge = setGauge;
