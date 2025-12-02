# Monitoring Dashboard System - Complete Guide

## Overview

The Monitoring Dashboard System provides comprehensive real-time monitoring and alerting for the Botanical Audit Framework. It tracks system health, performance metrics, and automatically alerts administrators when thresholds are exceeded.

## Table of Contents

1. [Architecture](#architecture)
2. [Metrics Collection](#metrics-collection)
3. [Monitoring Dashboard](#monitoring-dashboard)
4. [Alert System](#alert-system)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard UI                    │
│              (React + Chart.js + Material-UI)           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/SSE
┌────────────────────▼────────────────────────────────────┐
│              Monitoring API Endpoints                    │
│         (Express Routes + Controllers)                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼───────┐        ┌───────▼───────┐
│ Metrics       │        │ Alert         │
│ Service       │───────▶│ Service       │
└───────┬───────┘        └───────┬───────┘
        │                        │
        │ Collect               │ Notify
        │                        │
┌───────▼────────────────────────▼───────┐
│  System Resources                      │
│  - CPU, Memory, Disk                   │
│  - MongoDB (Queries, Pool)             │
│  - Redis (Cache, Queue)                │
│  - API (Requests, Response Times)      │
└────────────────────────────────────────┘
```

### Data Flow

1. **Metrics Collection**: Automatic collection every 10-30 seconds
2. **Threshold Monitoring**: Continuous checking against alert rules
3. **Alert Triggering**: Email/SMS notifications when thresholds exceeded
4. **Dashboard Updates**: Real-time updates via Server-Sent Events (SSE)
5. **History Storage**: In-memory storage (last 1 hour) + database persistence

---

## Metrics Collection

### System Metrics

**CPU Usage**
- Measurement: Average CPU utilization across all cores
- Update Interval: 30 seconds
- Warning Threshold: 70%
- Critical Threshold: 85%

**Memory Usage**
- Measurement: RAM utilization percentage
- Update Interval: 30 seconds
- Warning Threshold: 75%
- Critical Threshold: 90%

**Disk Usage**
- Measurement: Heap memory usage (process-based)
- Update Interval: 30 seconds
- Warning Threshold: 80%
- Critical Threshold: 95%

**Uptime**
- Measurement: Server uptime in seconds
- Format: `Xd Yh Zm`

### Database Metrics

**Query Performance**
- Average query time (ms)
- P95 query time (ms)
- P99 query time (ms)
- Slow queries count (>500ms)

**Operations Count**
- Find operations
- Insert operations
- Update operations
- Delete operations

**Connection Pool**
- Current connections
- Available connections
- Total created
- Utilization percentage

### Cache Metrics (Redis)

**Hit Rate**
- Cache hits
- Cache misses
- Hit rate percentage
- Warning: <60%
- Critical: <40%

**Memory Usage**
- Used memory
- Peak memory
- Fragmentation ratio

### Queue Metrics (Bull)

**Job Status**
- Active jobs
- Completed jobs
- Failed jobs
- Delayed jobs
- Waiting jobs

**Performance**
- Average processing time
- Throughput (jobs/minute)

### API Metrics

**Request Statistics**
- Total requests
- Successful requests (2xx)
- Error requests (4xx, 5xx)
- By endpoint breakdown

**Response Times**
- Average response time
- P95 response time
- P99 response time
- Warning: >500ms
- Critical: >2000ms

**Status Codes Distribution**
- 2xx (Success)
- 3xx (Redirect)
- 4xx (Client Error)
- 5xx (Server Error)

---

## Monitoring Dashboard

### Accessing the Dashboard

```
URL: https://your-domain.com/admin/monitoring
Authorization: Admin role required
```

### Dashboard Tabs

#### 1. Overview Tab

**System Resources Card**
- Real-time CPU, Memory, Disk usage bars
- Color-coded (green → yellow → red)
- Current uptime display

**API Statistics Card**
- Total requests counter
- Success/Error breakdown
- Average response time

**Cache Performance Card**
- Hit rate percentage
- Hits/Misses counts
- Doughnut chart visualization

#### 2. System Tab

**CPU Chart**
- Line chart showing CPU usage over time
- Time windows: 1min, 5min, 15min, 1hr

**Memory Chart**
- Line chart showing memory usage
- Peak usage indicator

**Disk Chart**
- Line chart showing disk usage
- Growth trend analysis

#### 3. Database Tab

**Query Performance**
- Average query time trend
- Slow queries list
- Query type breakdown (bar chart)

**Connection Pool**
- Current utilization gauge
- Available connections
- Connection creation trend

#### 4. Cache Tab

**Hit Rate Trend**
- Line chart over time
- Target line (70%)

**Operations**
- Hits vs Misses comparison
- Memory usage trend

#### 5. Queue Tab

**Job Status**
- Stacked bar chart
- Active, Completed, Failed, Waiting

**Throughput**
- Jobs per minute trend
- Peak throughput indicator

#### 6. API Tab

**Top Endpoints**
- Table with request count, avg time
- Sortable columns

**Response Time Distribution**
- Histogram chart
- P50, P95, P99 markers

**Status Codes**
- Pie chart
- Error rate calculation

### Real-Time Updates

Dashboard uses Server-Sent Events (SSE) for real-time updates:

```javascript
// Automatic connection on page load
// Updates every 5 seconds
// Auto-reconnect on disconnect
```

**Manual Refresh**
- Click refresh icon in header
- Forces immediate data fetch

**Export Metrics**
- Click download icon
- Downloads JSON file with all metrics
- Filename: `metrics-{timestamp}.json`

---

## Alert System

### Alert Rules

Default threshold configuration:

```javascript
{
  cpu: {
    warning: 70,    // 70% usage
    critical: 85,   // 85% usage
    enabled: true
  },
  memory: {
    warning: 75,
    critical: 90,
    enabled: true
  },
  disk: {
    warning: 80,
    critical: 95,
    enabled: true
  },
  queryTime: {
    warning: 300,   // 300ms
    critical: 1000, // 1000ms (1 second)
    enabled: true
  },
  cacheHitRate: {
    warning: 60,    // 60% hit rate
    critical: 40,   // 40% hit rate
    enabled: true
  },
  apiResponseTime: {
    warning: 500,   // 500ms
    critical: 2000, // 2 seconds
    enabled: true
  },
  errorRate: {
    warning: 2,     // 2% error rate
    critical: 5,    // 5% error rate
    enabled: true
  },
  queueFailed: {
    warning: 5,     // 5 failed jobs
    critical: 20,   // 20 failed jobs
    enabled: true
  }
}
```

### Alert Severity Levels

**Warning**
- Yellow indicator
- Email notification
- Recommended action: Investigate

**Critical**
- Red indicator
- Email + SMS notification (if configured)
- Recommended action: Immediate attention required

### Alert Deduplication

To prevent alert spam:
- Duplicate alerts suppressed for 5 minutes
- Same metric + same severity + similar value
- Deduplication window: 300 seconds (5 minutes)

### Notification Channels

#### Email Alerts

**Configuration** (.env):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=alerts@botanicalaudit.com
ALERT_EMAILS=admin@example.com,ops@example.com
```

**Email Content**:
- Alert severity (color-coded)
- Metric name and current value
- Threshold exceeded
- Timestamp
- Recommended actions
- Auto-generated from system

#### SMS Alerts (Optional)

**Configuration** (.env):
```env
ALERT_SMS=+66812345678,+66898765432
```

**Implementation**:
```javascript
// Requires integration with:
// - Twilio
// - AWS SNS
// - Line Notify
// Currently placeholder - implement based on provider
```

### Alert History

**Storage**:
- In-memory: Last 100 alerts
- Database: Persistent storage (optional)

**Viewing History**:
```bash
GET /api/v1/alerts/history?limit=50&severity=critical
```

**Statistics**:
```bash
GET /api/v1/alerts/stats
```

Response:
```json
{
  "total": 45,
  "lastHour": 3,
  "last24Hours": 12,
  "byMetric": {
    "cpu": 15,
    "memory": 8,
    "queryTime": 22
  },
  "bySeverity": {
    "warning": 30,
    "critical": 15
  },
  "mostRecent": { ... }
}
```

### Recommended Actions by Metric

**CPU High Usage**:
1. Check for runaway processes
2. Review application performance
3. Consider scaling horizontally
4. Optimize heavy computations

**Memory High Usage**:
1. Check for memory leaks
2. Review cache size configuration
3. Clear unused data
4. Consider increasing server memory

**Disk High Usage**:
1. Clean up old logs
2. Remove temporary files
3. Archive old data
4. Expand disk storage

**Slow Queries**:
1. Review slow queries
2. Check database indexes
3. Optimize query patterns
4. Consider query caching

**Low Cache Hit Rate**:
1. Review cache TTL settings
2. Implement cache warming
3. Check cache key generation
4. Analyze cache usage patterns

**High API Response Time**:
1. Check server load
2. Review endpoint performance
3. Implement caching
4. Optimize database queries

**High Error Rate**:
1. Check application logs
2. Review recent deployments
3. Investigate error patterns
4. Check external service status

**Queue Jobs Failed**:
1. Check queue worker status
2. Review failed job errors
3. Check Redis connection
4. Retry failed jobs if safe

---

## API Reference

### Monitoring Endpoints

#### Get All Metrics
```http
GET /api/v1/monitoring/metrics?timeWindow=realtime
Authorization: Bearer {admin_token}
```

**Time Windows**:
- `realtime`: Last 1 minute
- `short`: Last 5 minutes
- `medium`: Last 15 minutes
- `long`: Last 1 hour

**Response**:
```json
{
  "success": true,
  "data": {
    "system": { ... },
    "database": { ... },
    "cache": { ... },
    "queue": { ... },
    "api": { ... },
    "timestamp": "2025-11-04T10:30:00Z",
    "timeWindow": "realtime"
  }
}
```

#### Get Health Status
```http
GET /api/v1/monitoring/health
Authorization: Bearer {admin_token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "system": { "status": "healthy", "issues": [] },
      "database": { "status": "healthy", "issues": [] },
      "cache": { "status": "healthy", "issues": [] },
      "queue": { "status": "healthy", "issues": [] }
    },
    "timestamp": "2025-11-04T10:30:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: System healthy
- `503 Service Unavailable`: System critical

#### Stream Real-Time Metrics (SSE)
```http
GET /api/v1/monitoring/stream
Authorization: Bearer {admin_token}
```

**SSE Events**:
```javascript
// Connection established
data: {"type":"connected"}

// Metrics update (every 5 seconds)
data: {"type":"update","metrics":{...},"health":{...}}
```

#### Get System Metrics
```http
GET /api/v1/monitoring/system?timeWindow=short
Authorization: Bearer {admin_token}
```

#### Get Database Metrics
```http
GET /api/v1/monitoring/database?timeWindow=short
Authorization: Bearer {admin_token}
```

#### Get Cache Metrics
```http
GET /api/v1/monitoring/cache?timeWindow=short
Authorization: Bearer {admin_token}
```

#### Get Queue Metrics
```http
GET /api/v1/monitoring/queue
Authorization: Bearer {admin_token}
```

#### Get API Metrics
```http
GET /api/v1/monitoring/api?timeWindow=short
Authorization: Bearer {admin_token}
```

#### Export Metrics
```http
GET /api/v1/monitoring/export
Authorization: Bearer {admin_token}
```

Downloads JSON file.

#### Reset Metrics
```http
POST /api/v1/monitoring/reset
Authorization: Bearer {admin_token}
```

Resets counters (cache hits/misses, API requests, etc.).

### Alert Endpoints

#### Get Alert History
```http
GET /api/v1/alerts/history?limit=50&severity=critical
Authorization: Bearer {admin_token}
```

**Query Parameters**:
- `limit`: Number of alerts (default: 50)
- `severity`: `warning` or `critical`

#### Get Alert Statistics
```http
GET /api/v1/alerts/stats
Authorization: Bearer {admin_token}
```

#### Get Alert Rules
```http
GET /api/v1/alerts/rules
Authorization: Bearer {admin_token}
```

#### Update Alert Rule
```http
PUT /api/v1/alerts/rules/cpu
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "warning": 75,
  "critical": 90,
  "enabled": true
}
```

#### Clear Alert History
```http
DELETE /api/v1/alerts/history
Authorization: Bearer {admin_token}
```

#### Test Alert System
```http
POST /api/v1/alerts/test
Authorization: Bearer {admin_token}
```

Sends test alert to configured email.

---

## Configuration

### Environment Variables

```env
# SMTP Configuration (Email Alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=alerts@botanicalaudit.com
SMTP_PASS=your-app-password
SMTP_FROM=alerts@botanicalaudit.com

# Alert Recipients
ALERT_EMAILS=admin@example.com,ops@example.com
ALERT_SMS=+66812345678

# Metrics Collection Intervals (optional)
METRICS_SYSTEM_INTERVAL=30000      # 30 seconds
METRICS_CACHE_INTERVAL=10000       # 10 seconds
METRICS_QUEUE_INTERVAL=15000       # 15 seconds
METRICS_CLEANUP_INTERVAL=300000    # 5 minutes
```

### Customizing Thresholds

**Via API** (recommended):
```javascript
// Update threshold via API
fetch('/api/v1/alerts/rules/cpu', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    warning: 75,
    critical: 90
  })
});
```

**Via Code**:
```javascript
// In alertService.js
alertService.updateAlertRule('cpu', {
  warning: 75,
  critical: 90,
  enabled: true
});
```

### Disabling Alerts

Disable specific metric alerts:
```javascript
alertService.updateAlertRule('cpu', { enabled: false });
```

Disable all email alerts:
```env
# Remove or comment out SMTP configuration
# SMTP_HOST=
```

---

## Troubleshooting

### Dashboard Not Loading

**Problem**: Dashboard shows loading spinner indefinitely

**Solution**:
1. Check network tab for API errors
2. Verify admin authentication token
3. Check server logs for errors
4. Ensure monitoring routes are registered

### Metrics Not Updating

**Problem**: Metrics stuck at same values

**Solution**:
1. Check SSE connection in Network tab
2. Verify metricsService is running
3. Check collection intervals
4. Restart metrics collection:
   ```javascript
   metricsService.stopCollection();
   metricsService.startCollection();
   ```

### Alerts Not Sending

**Problem**: No email alerts received

**Solution**:
1. Verify SMTP configuration
2. Check SMTP credentials
3. Test alert system:
   ```bash
   POST /api/v1/alerts/test
   ```
4. Check email spam folder
5. Review alert deduplication logs

### High Memory Usage from Metrics

**Problem**: Metrics service consuming too much memory

**Solution**:
1. Reduce history size:
   ```javascript
   metricsService.maxHistorySize = 50; // Default: 100
   ```
2. Decrease collection intervals
3. Clear old metrics manually:
   ```javascript
   metricsService.cleanupOldMetrics();
   ```

### SSE Connection Dropping

**Problem**: Real-time updates stop after a while

**Solution**:
1. Check reverse proxy timeout settings (nginx/Apache)
2. Increase SSE timeout:
   ```nginx
   proxy_read_timeout 300s;
   proxy_connect_timeout 300s;
   ```
3. Dashboard auto-reconnects after 5 seconds

### Database Queries Not Tracked

**Problem**: Query metrics showing zero

**Solution**:
1. Ensure mongoose metrics plugin is applied:
   ```javascript
   const { mongooseMetricsPlugin } = require('./middleware/metricsMiddleware');
   yourSchema.plugin(mongooseMetricsPlugin);
   ```
2. Check if metricsMiddleware is registered in server.js

---

## Best Practices

### Monitoring Strategy

1. **Start with Default Thresholds**: Adjust based on actual usage patterns
2. **Monitor Trends**: Look for gradual increases over time
3. **Act on Warnings**: Don't wait for critical alerts
4. **Regular Reviews**: Review metrics weekly
5. **Document Actions**: Track what actions resolved issues

### Performance Impact

Metrics collection has minimal performance impact:
- CPU: <1% additional usage
- Memory: ~10-20 MB for metrics storage
- Network: ~1 KB/sec for SSE updates

### Security

1. **Admin-Only Access**: All monitoring endpoints require admin role
2. **Token Authentication**: Use JWT tokens with expiration
3. **Rate Limiting**: Apply to monitoring endpoints
4. **Audit Logs**: Track who accessed monitoring data

### Scaling Considerations

For high-traffic deployments:
1. **Increase Collection Intervals**: 60s instead of 30s
2. **Use Database Storage**: Store metrics in MongoDB
3. **Implement Aggregation**: Hourly/daily aggregates
4. **Separate Monitoring Server**: Dedicated monitoring instance

---

## Related Documentation

- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
- [Queue System Guide](./PHASE2_QUEUE_SYSTEM_GUIDE.md)
- [Redis Caching Guide](./REDIS_CACHING_GUIDE.md)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)

---

**Last Updated**: November 4, 2025  
**Version**: 2.0  
**Phase**: 2 - Monitoring Dashboard (75% Complete)
