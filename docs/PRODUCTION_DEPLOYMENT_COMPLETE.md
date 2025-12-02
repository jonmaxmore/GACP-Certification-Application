# 🚀 Production Deployment Guide v2.0

## Botanical Audit Framework - Complete Deployment

This comprehensive guide replaces the previous deployment documentation with a complete, production-ready deployment process including Docker, monitoring, CI/CD, and load testing.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Configuration](#environment-configuration)
4. [SSL/TLS Certificates](#ssltls-certificates)
5. [Docker Deployment](#docker-deployment)
6. [Database Setup](#database-setup)
7. [Monitoring Setup](#monitoring-setup)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Load Testing](#load-testing)
10. [Post-Deployment Verification](#post-deployment-verification)
11. [Troubleshooting](#troubleshooting)
12. [Rollback Procedures](#rollback-procedures)

---

## 1. Pre-Deployment Checklist

### ✅ Code Preparation

- [ ] All tests passing (`npm test`)
- [ ] Code linted (`npm run lint`)
- [ ] Security audit clean (`npm audit --audit-level=high`)
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Database migrations ready

### ✅ Infrastructure

- [ ] Production server provisioned (min 4 vCPU, 16GB RAM)
- [ ] Domain names registered
- [ ] DNS records configured
- [ ] SSL certificates obtained
- [ ] Firewall rules configured
- [ ] Backup storage ready (S3/Cloud Storage)

### ✅ Third-Party Services

- [ ] MongoDB production cluster ready
- [ ] Redis instance provisioned
- [ ] Email service configured (SendGrid/SES)
- [ ] Google Cloud project setup (Gemini + Calendar)
- [ ] Monitoring service configured (optional)

### ✅ Security

- [ ] Secrets management setup (AWS Secrets Manager/Vault)
- [ ] JWT secret generated (strong, random)
- [ ] Database credentials secured
- [ ] API keys rotated for production
- [ ] SSL/TLS certificates valid

---

## 2. Infrastructure Requirements

### Minimum Production Server Specs

```yaml
Server Type: AWS EC2 t3.xlarge or equivalent
CPU: 4 vCPUs
RAM: 16 GB
Storage: 100 GB SSD
Network: 1 Gbps
OS: Ubuntu 22.04 LTS
```

### Recommended Production Setup

```yaml
Load Balancer: AWS ALB or Nginx
Web Servers: 2-3 instances (horizontal scaling)
Database: MongoDB Atlas M30+ or self-hosted replica set
Cache: Redis 7+ (persistent, AOF enabled)
CDN: CloudFront or Cloudflare
Monitoring: Grafana + Prometheus
Logs: ELK Stack or CloudWatch
```

### Port Configuration

```bash
# External (via Nginx)
80   → 443 (HTTP to HTTPS redirect)
443  → Backend/Frontend (SSL/TLS)

# Internal (Docker network)
5000 → Backend API
3000 → Frontend portals
27017 → MongoDB
6379 → Redis
```

---

## 3. Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.production.example .env.production
```

### Step 2: Configure Production Variables

```bash
# Application
NODE_ENV=production
APP_NAME="Botanical Audit Framework"
PORT=5000

# Security (CRITICAL - Change these!)
JWT_SECRET="<GENERATE_STRONG_SECRET_HERE>"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Database
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/gacp_prod"
MONGODB_MAX_POOL_SIZE=100

# Redis
REDIS_URL="redis://:password@redis.yourdomain.com:6379"
REDIS_CACHE_TTL=3600

# Email (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<SENDGRID_API_KEY>
EMAIL_FROM=noreply@yourdomain.com

# Google Services
GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/google-service-account.json
GOOGLE_CALENDAR_ID=<PRODUCTION_CALENDAR_ID>
GEMINI_API_KEY=<PRODUCTION_GEMINI_KEY>

# Monitoring
ENABLE_METRICS=true
ALERT_EMAIL=admin@yourdomain.com

# CORS
CORS_ORIGINS=https://admin.yourdomain.com,https://farmer.yourdomain.com,https://cert.yourdomain.com
```

### Step 3: Generate Secrets

```bash
# Generate JWT Secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

---

## 4. SSL/TLS Certificates

### Option A: Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificates
sudo certbot certonly --standalone -d api.yourdomain.com
sudo certbot certonly --standalone -d admin.yourdomain.com
sudo certbot certonly --standalone -d farmer.yourdomain.com
sudo certbot certonly --standalone -d cert.yourdomain.com

# Copy certificates to Nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem nginx/ssl/key.pem

# Auto-renewal (cron job)
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet && docker-compose restart nginx
```

### Option B: Commercial Certificate

```bash
# 1. Generate CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.csr

# 2. Submit CSR to CA (DigiCert, GoDaddy, etc.)
# 3. Download and install certificate
# 4. Place cert.pem and key.pem in nginx/ssl/
```

---

## 5. Docker Deployment

### Step 1: Install Docker

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/botanical-audit-framework.git
cd botanical-audit-framework
```

### Step 3: Build Images

```bash
# Build production images
docker-compose -f docker-compose.production.yml build

# Or pull pre-built images
docker-compose -f docker-compose.production.yml pull
```

### Step 4: Start Services

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f backend
```

### Step 5: Verify Deployment

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check all services
docker ps
```

---

## 6. Database Setup

### MongoDB Production Configuration

#### Option A: MongoDB Atlas (Recommended)

```bash
# 1. Create cluster at https://cloud.mongodb.com
# 2. Choose M30+ for production
# 3. Enable backups (automated)
# 4. Configure network access (whitelist IP)
# 5. Create database user
# 6. Get connection string
```

#### Option B: Self-Hosted Replica Set

```yaml
# docker-compose.production.yml (already configured)
mongodb:
  image: mongo:8.0.3
  command: mongod --replSet rs0
  volumes:
    - mongo-data:/data/db
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: <STRONG_PASSWORD>
```

### Initialize Database

```bash
# Run migrations (if any)
docker-compose exec backend node scripts/migrate-database.js

# Create indexes
docker-compose exec backend node backend/optimize-database.js

# Seed initial data
docker-compose exec backend node scripts/seed-admin-user.js
```

### Database Backups

```bash
# Manual backup
docker exec gacp-mongodb-prod mongodump \
  --archive=/tmp/backup-$(date +%Y%m%d).gz \
  --gzip

# Copy to host
docker cp gacp-mongodb-prod:/tmp/backup-*.gz ./backups/

# Upload to S3
aws s3 cp ./backups/backup-*.gz s3://your-backup-bucket/mongodb/

# Automated backups (cron)
0 2 * * * /opt/botanical-audit-framework/scripts/backup-database.sh
```

---

## 7. Monitoring Setup

### Built-in Monitoring Dashboard

The system includes a comprehensive monitoring dashboard.

```bash
# Access monitoring dashboard
https://admin.yourdomain.com/monitoring

# API endpoints
GET /api/v1/monitoring/metrics
GET /api/v1/monitoring/stream  # Real-time SSE
```

### Configure Alerts

```bash
# Edit alert configuration
# File: backend/services/alertService.js

const ALERT_RULES = {
  highCpuUsage: {
    threshold: 80,  // Alert if CPU > 80%
    email: 'admin@yourdomain.com'
  },
  // ... more rules
};
```

### External Monitoring (Optional)

#### Prometheus + Grafana

```yaml
# Add to docker-compose.production.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: <PASSWORD>
```

#### Uptime Monitoring

- UptimeRobot (free tier)
- Pingdom
- StatusCake

---

## 8. CI/CD Pipeline

### GitHub Actions Setup

The repository includes a complete CI/CD pipeline in `.github/workflows/production-deploy.yml`.

### Configure Secrets

```bash
# In GitHub repository settings > Secrets and variables > Actions
# Add the following secrets:

AWS_ACCESS_KEY_ID          # AWS credentials
AWS_SECRET_ACCESS_KEY
EC2_HOST                   # Production server IP
EC2_USER                   # SSH user (ubuntu)
EC2_SSH_KEY                # Private SSH key
DOCKER_USERNAME            # Docker registry
DOCKER_PASSWORD
STAGING_URL                # For load tests
S3_BACKUP_BUCKET           # Database backups
SLACK_WEBHOOK              # Deployment notifications
SNYK_TOKEN                 # Security scanning
```

### Trigger Deployment

```bash
# Automatic: Push to main branch
git push origin main

# Manual: GitHub Actions UI
# Go to Actions tab > Select workflow > Run workflow
```

### Pipeline Stages

1. **Lint and Test**: Code quality checks
2. **Security Scan**: Vulnerability detection
3. **Build Docker**: Create production images
4. **Load Test**: Validate performance
5. **Deploy**: Update production servers
6. **Backup**: Database snapshot
7. **Smoke Tests**: Verify deployment

---

## 9. Load Testing

### Before First Production Release

Run all load test scenarios to validate system capacity.

```bash
# Install k6
# Windows (Chocolatey)
choco install k6

# Mac
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Run Load Tests

```bash
cd load-tests

# 1. Average Load Test (5 minutes, 100 VU)
k6 run -e BASE_URL=https://api.yourdomain.com api-load-test.js

# 2. Stress Test (find breaking point)
k6 run -e BASE_URL=https://api.yourdomain.com stress-test.js

# 3. Spike Test (sudden traffic)
k6 run -e BASE_URL=https://api.yourdomain.com spike-test.js

# 4. Soak Test (2 hours, stability)
k6 run -e BASE_URL=https://api.yourdomain.com soak-test.js
```

### Expected Results

```javascript
// api-load-test.js (Average Load)
✓ http_req_duration: avg=150ms, p95=180ms, p99=250ms  ✅
✓ http_req_failed: 0.2%  ✅
✓ http_reqs: 30,000 requests (100 req/s)  ✅

// Thresholds
http_req_duration.p95 < 200ms  ✅ PASS
http_req_duration.p99 < 500ms  ✅ PASS
http_req_failed < 1%           ✅ PASS
```

### Performance Tuning

If tests fail, tune these settings:

```bash
# Increase backend replicas
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Increase MongoDB pool size
MONGODB_MAX_POOL_SIZE=200

# Increase Redis cache TTL
REDIS_CACHE_TTL=7200

# Add more indexes (see backend/optimize-database.js)
```

---

## 10. Post-Deployment Verification

### Automated Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

echo "Checking API health..."
curl -f https://api.yourdomain.com/api/health || exit 1

echo "Checking database connection..."
curl -f https://api.yourdomain.com/api/v1/monitoring/metrics | grep "mongodb_connected" || exit 1

echo "Checking Redis connection..."
curl -f https://api.yourdomain.com/api/v1/cache/stats || exit 1

echo "✅ All health checks passed!"
```

### Manual Verification Checklist

- [ ] API health endpoint responds (200 OK)
- [ ] Admin portal loads
- [ ] Farmer portal loads
- [ ] Certificate portal loads
- [ ] Login works (test user)
- [ ] Database queries work
- [ ] Redis cache works
- [ ] AI QC system responds
- [ ] Google Calendar integration works
- [ ] Email notifications send
- [ ] File uploads work
- [ ] Monitoring dashboard loads
- [ ] Alerts trigger correctly
- [ ] SSL/TLS certificates valid

### Smoke Tests

```bash
# Run automated smoke tests
cd tests
npm run smoke-tests

# Or use curl
curl -f https://api.yourdomain.com/api/health
curl -f https://api.yourdomain.com/api/applications?page=1&limit=10
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 11. Troubleshooting

### Issue 1: Services Won't Start

```bash
# Check Docker logs
docker-compose -f docker-compose.production.yml logs backend

# Check container status
docker ps -a

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --force-recreate backend
```

### Issue 2: Database Connection Failed

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec -it gacp-mongodb-prod mongosh

# Verify credentials
echo $MONGODB_URI

# Check network
docker network inspect botanical-audit-framework_default
```

### Issue 3: High Memory Usage

```bash
# Check resource usage
docker stats

# Increase container limits
# In docker-compose.production.yml:
backend:
  deploy:
    resources:
      limits:
        memory: 4G
      reservations:
        memory: 2G
```

### Issue 4: Slow API Responses

```bash
# Check monitoring metrics
curl https://api.yourdomain.com/api/v1/monitoring/metrics

# Check database indexes
docker exec backend node backend/optimize-database.js

# Check Redis cache hit rate
curl https://api.yourdomain.com/api/v1/cache/stats

# Scale backend services
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

### Issue 5: SSL Certificate Errors

```bash
# Verify certificates
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Check expiration
openssl x509 -in nginx/ssl/cert.pem -noout -enddate

# Renew Let's Encrypt
sudo certbot renew

# Restart Nginx
docker-compose restart nginx
```

---

## 12. Rollback Procedures

### Quick Rollback (Git-based)

```bash
# SSH to production server
ssh user@production-server

cd /opt/botanical-audit-framework

# Rollback to previous commit
git log --oneline -5
git reset --hard <PREVIOUS_COMMIT_HASH>

# Restart services
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

### Database Rollback

```bash
# Restore from backup
docker exec -i gacp-mongodb-prod mongorestore \
  --archive=/tmp/backup-YYYYMMDD.gz \
  --gzip \
  --drop

# Or from S3
aws s3 cp s3://your-backup-bucket/mongodb/backup-YYYYMMDD.gz /tmp/
docker cp /tmp/backup-YYYYMMDD.gz gacp-mongodb-prod:/tmp/
docker exec -i gacp-mongodb-prod mongorestore --archive=/tmp/backup-YYYYMMDD.gz --gzip
```

### Blue-Green Deployment (Zero Downtime)

```bash
# 1. Deploy new version to "green" environment
docker-compose -f docker-compose.green.yml up -d

# 2. Test green environment
curl http://green.internal.yourdomain.com/api/health

# 3. Switch traffic (update load balancer)
# AWS ALB: Switch target group
# Nginx: Update upstream servers

# 4. Monitor for issues
# If issues: Switch back to "blue"
# If stable: Shut down "blue"
docker-compose -f docker-compose.blue.yml down
```

---

## 📊 Deployment Checklist

### Before Deployment

- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backup created
- [ ] Load tests passed
- [ ] Monitoring configured
- [ ] Team notified

### During Deployment

- [ ] Services started successfully
- [ ] Health checks passing
- [ ] Database migrations run
- [ ] Smoke tests passed
- [ ] Monitoring active

### After Deployment

- [ ] Users can access system
- [ ] Performance within SLA
- [ ] Alerts configured and tested
- [ ] Documentation updated
- [ ] Team notified of completion
- [ ] Backup verified

---

## 🚨 Emergency Contacts

```yaml
System Administrator: admin@yourdomain.com
DevOps Team: devops@yourdomain.com
Database Admin: dba@yourdomain.com
Security Team: security@yourdomain.com

On-Call Schedule: https://pagerduty.com/your-team
Status Page: https://status.yourdomain.com
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Nginx Optimization](https://www.nginx.com/blog/tuning-nginx/)
- [Load Testing with k6](https://k6.io/docs/)

---

## 🎯 Production Readiness Score

After completing this guide, your system should score:

- ✅ **Security**: 95/100 (SSL/TLS, secrets, firewalls)
- ✅ **Performance**: 90/100 (optimized DB, caching, CDN)
- ✅ **Reliability**: 95/100 (HA, backups, monitoring)
- ✅ **Scalability**: 85/100 (horizontal scaling ready)
- ✅ **Monitoring**: 90/100 (metrics, alerts, dashboards)

**Overall: Production Ready! 🚀**

---

**Last Updated**: 2024-01-20
**Version**: 2.0.0
**Maintainer**: DevOps Team
