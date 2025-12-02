# Load Testing Guide

## Overview

Load testing suite using k6 to test system performance under various conditions.

## Installation

### Windows (PowerShell as Admin)
```powershell
choco install k6
```

### Mac
```bash
brew install k6
```

### Linux
```bash
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Test Scenarios

### 1. API Load Test (api-load-test.js)

**Purpose**: Test normal API operations under load

**Load Profile**:
- Warm up: 10 users (30s)
- Ramp up: 50 users (1m)
- Steady: 100 users (3m)
- Spike: 200 users (1m)
- Back: 100 users (2m)
- Ramp down: 0 users (30s)

**Tests**:
- Health check
- Get applications (paginated)
- Dashboard statistics
- Cache metrics
- Queue metrics
- Create application

**Run**:
```bash
k6 run load-tests/api-load-test.js
```

**With Custom Settings**:
```bash
k6 run --vus 100 --duration 60s load-tests/api-load-test.js
```

**With Custom Base URL**:
```bash
k6 run -e BASE_URL=https://api.production.com load-tests/api-load-test.js
```

### 2. Stress Test (stress-test.js)

**Purpose**: Find system breaking point

**Load Profile**:
- Gradually increase from 50 → 500 users
- Hold at 500 users for 5 minutes
- Ramp down

**Run**:
```bash
k6 run load-tests/stress-test.js
```

**Expected Results**:
- Identify maximum concurrent users
- Find performance degradation points
- Detect resource bottlenecks

### 3. Spike Test (spike-test.js)

**Purpose**: Test system recovery from sudden traffic surge

**Load Profile**:
- Normal: 50 users (1m)
- SPIKE: 500 users (10s)
- Hold: 500 users (3m)
- Back: 50 users (10s)
- Recovery: 50 users (2m)

**Run**:
```bash
k6 run load-tests/spike-test.js
```

**Expected Results**:
- System handles sudden spikes
- Quick recovery to normal
- No lasting degradation

### 4. Soak Test (soak-test.js)

**Purpose**: Test system stability over time

**Load Profile**:
- Ramp up: 50 users (2m)
- Hold: 50 users (30m)
- Ramp down

**Run**:
```bash
k6 run load-tests/soak-test.js
```

**Expected Results**:
- No memory leaks
- No resource exhaustion
- Stable performance over time

## Performance Targets

### Response Time Targets
- **Average**: <200ms
- **P95**: <500ms
- **P99**: <1000ms

### Error Rate Targets
- **Normal Load**: <1%
- **Peak Load**: <5%
- **Stress Test**: <10%

### Throughput Targets
- **Requests/Second**: >100 rps
- **Concurrent Users**: >200 users
- **Peak Capacity**: >500 users

## Interpreting Results

### Good Results ✅
```
✓ http_req_duration..............: avg=145ms  p(95)=320ms  p(99)=580ms
✓ http_req_failed................: 0.23%
✓ http_reqs......................: 12000 (200/s)
✓ vus............................: 100
```

### Warning Signs ⚠️
```
✗ http_req_duration..............: avg=850ms  p(95)=2100ms  p(99)=4500ms
✗ http_req_failed................: 8.5%
  http_reqs......................: 8500 (142/s)
  vus............................: 100
```

### Critical Issues ❌
```
✗ http_req_duration..............: avg=5200ms  p(95)=15000ms  p(99)=30000ms
✗ http_req_failed................: 45%
  http_reqs......................: 3200 (53/s)
  vus............................: 100
```

## Metrics Explained

### HTTP Metrics
- `http_reqs`: Total number of HTTP requests
- `http_req_duration`: Request duration (response time)
- `http_req_failed`: Percentage of failed requests
- `http_req_blocked`: Time spent blocked before request
- `http_req_connecting`: Time spent establishing TCP connection
- `http_req_sending`: Time spent sending data
- `http_req_waiting`: Time spent waiting for response (TTFB)
- `http_req_receiving`: Time spent receiving response

### Custom Metrics
- `errors`: Custom error rate
- `api_response_time`: API-specific response time
- `request_count`: Total request counter

### Statistical Values
- `avg`: Average (mean) value
- `min`: Minimum value
- `max`: Maximum value
- `med`: Median (50th percentile)
- `p(90)`: 90th percentile
- `p(95)`: 95th percentile
- `p(99)`: 99th percentile

## Optimization Steps

### If Response Time Too High

1. **Check Database**:
   ```bash
   node apps/backend/scripts/optimize-database.js
   ```

2. **Enable Caching**:
   - Verify Redis is running
   - Check cache hit rate
   - Increase cache TTL

3. **Optimize Queries**:
   - Review slow queries
   - Add missing indexes
   - Use pagination

4. **Scale Resources**:
   - Increase server CPU/RAM
   - Add more workers
   - Scale horizontally

### If Error Rate Too High

1. **Check Logs**:
   ```bash
   tail -f apps/backend/logs/error.log
   ```

2. **Monitor Resources**:
   - Check CPU usage
   - Check memory usage
   - Check disk space

3. **Review Queue**:
   - Check failed jobs
   - Review queue workers
   - Check Redis connection

### If Throughput Too Low

1. **Connection Pool**:
   - Increase maxPoolSize
   - Optimize minPoolSize

2. **Enable Compression**:
   - Already enabled in server.js
   - Verify it's working

3. **Load Balancing**:
   - Add load balancer
   - Multiple server instances
   - Round-robin distribution

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Load Tests
        run: |
          k6 run -e BASE_URL=${{ secrets.STAGING_URL }} load-tests/api-load-test.js
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: load-tests/summary.json
```

## Best Practices

1. **Test in Staging First**: Never run load tests on production
2. **Start Small**: Begin with low load, gradually increase
3. **Monitor During Tests**: Watch CPU, memory, disk, network
4. **Document Results**: Keep historical data for comparison
5. **Test Regularly**: Run tests after major changes
6. **Test Realistic Scenarios**: Use actual user patterns
7. **Include Think Time**: Add sleep() to simulate real users

## Troubleshooting

### k6 Command Not Found

**Windows**:
```powershell
# Restart PowerShell after installation
# Or add to PATH manually
```

**Linux/Mac**:
```bash
which k6
echo $PATH
```

### Connection Refused

- Ensure server is running
- Check BASE_URL
- Verify firewall rules

### Out of Memory

- Reduce VUs (virtual users)
- Increase system RAM
- Optimize test script

### SSL Certificate Errors

```bash
k6 run --insecure-skip-tls-verify load-tests/api-load-test.js
```

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Best Practices](https://k6.io/docs/misc/fine-tuning-os/)
