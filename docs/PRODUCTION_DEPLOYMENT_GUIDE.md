# 🚀 GACP Platform Production Deployment Guide

## Overview

Complete deployment guide for the GACP (Good Agricultural and Collection Practices) Platform to production environment with full monitoring, security, and performance optimization.

## 📋 Pre-Deployment Checklist

### ✅ Infrastructure Requirements

- [ ] MongoDB Atlas cluster configured and accessible
- [ ] Node.js 18.x or 20.x installed on target servers
- [ ] SSL certificates for HTTPS
- [ ] Domain names configured
- [ ] Load balancer configured (if applicable)
- [ ] Backup system in place

### ✅ Environment Configuration

- [ ] Production environment variables configured in `config/production.env`
- [ ] JWT secrets generated and secured
- [ ] Database connection strings updated
- [ ] CORS origins configured for production domains
- [ ] API rate limits configured appropriately

### ✅ Security Checklist

- [ ] All default passwords changed
- [ ] Security headers enabled (Helmet.js)
- [ ] HTTPS enforced
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication middleware secured

## 🛠️ Deployment Steps

### Step 1: Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/gacp-certify-flow-main.git
cd gacp-certify-flow-main

# Install dependencies
npm install
cd apps/backend && npm install

# Copy production environment configuration
cp config/production.env apps/backend/.env
```

### Step 2: Configure Production Environment

Edit `apps/backend/.env` with your production values:

```env
# Critical configurations to update
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/gacp-production
JWT_SECRET=your-super-secure-jwt-secret-256-bit-key
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

### Step 3: Database Setup

```bash
# Run database migrations (if any)
npm run db:migrate

# Seed initial data (production-safe data only)
npm run db:seed:production
```

### Step 4: Build and Test

```bash
# Build the application
npm run build

# Run comprehensive tests
npm run test:comprehensive

# Run security audit
npm audit --audit-level high
```

### Step 5: Deploy Backend Service

#### Option A: Direct Server Deployment

```bash
# Start the production server
npm run start:production

# Or with PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Option B: Docker Deployment

```bash
# Build Docker image
docker build -f Dockerfile.backend -t gacp-platform-backend:latest .

# Run with Docker Compose
docker-compose -f docker-compose.yml up -d
```

#### Option C: Kubernetes Deployment

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/
```

### Step 6: Configure Load Balancer & SSL

```nginx
# Nginx configuration example
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/monitoring/health {
        proxy_pass http://localhost:3004;
        access_log off;
    }
}
```

### Step 7: Configure Monitoring

#### Health Monitoring Dashboard

Access the built-in monitoring dashboard at:

- `https://your-api-domain.com/monitoring-dashboard.html`

#### Key Monitoring Endpoints

- Health Check: `GET /api/monitoring/health`
- Detailed Health: `GET /api/monitoring/health/detailed`
- System Status: `GET /api/monitoring/status`
- Performance Metrics: `GET /api/monitoring/health/metrics`

#### External Monitoring Setup (Optional)

```bash
# Install monitoring agents
# New Relic
npm install newrelic

# DataDog
npm install dd-trace --save

# Configure in your main server file
```

### Step 8: Setup Automated Backups

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/gacp_backup_$DATE"
tar -czf "/backups/gacp_backup_$DATE.tar.gz" "/backups/gacp_backup_$DATE"
rm -rf "/backups/gacp_backup_$DATE"

# Add to crontab for daily backups
# 0 2 * * * /path/to/backup-script.sh
```

## 🔧 Post-Deployment Configuration

### Step 1: Verify Deployment

```bash
# Test all endpoints
curl -X GET https://your-api-domain.com/api/monitoring/health
curl -X GET https://your-api-domain.com/api/gacp/workflow
curl -X GET https://your-api-domain.com/api/gacp/ccps

# Run comprehensive test suite
node tests/comprehensive-test-suite.js
```

### Step 2: Configure Alerting

Set up alerts for:

- API response time > 500ms
- Error rate > 1%
- Database connection failures
- Memory usage > 80%
- Disk space < 20%

### Step 3: Setup Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/gacp-platform

# Log rotation configuration
/path/to/gacp-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 node node
}
```

## 📊 Performance Optimization

### Database Optimization

```javascript
// Create database indexes for performance
db.applications.createIndex({ farmerId: 1, status: 1 });
db.applications.createIndex({ createdAt: -1 });
db.applications.createIndex({ gacpScore: -1 });
db.inspections.createIndex({ applicationId: 1, inspectionDate: -1 });
db.certificates.createIndex({ applicationId: 1, validUntil: 1 });
```

### Caching Configuration

```javascript
// Redis caching (optional)
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
app.use('/api/gacp/workflow', cacheMiddleware(300)); // 5 minutes
app.use('/api/gacp/ccps', cacheMiddleware(600)); // 10 minutes
```

### CDN Configuration

Set up CDN for static assets:

- Frontend assets
- API documentation
- Monitoring dashboard assets

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check MongoDB Atlas connectivity
mongo "mongodb+srv://your-cluster.mongodb.net/test" --username your-username

# Verify environment variables
echo $MONGODB_URI
```

#### 2. High Memory Usage

```bash
# Monitor memory usage
pm2 monit

# Restart application if needed
pm2 restart gacp-platform-backend
```

#### 3. API Response Time Issues

```bash
# Check database performance
# Monitor slow queries in MongoDB Atlas

# Review API endpoint performance
curl -w "%{time_total}" https://your-api-domain.com/api/monitoring/health
```

### Emergency Procedures

#### 1. Service Restart

```bash
# Graceful restart
pm2 reload gacp-platform-backend

# Force restart if needed
pm2 restart gacp-platform-backend
```

#### 2. Database Recovery

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /path/to/backup
```

#### 3. Rollback Deployment

```bash
# Git rollback
git revert HEAD
npm run deploy

# Docker rollback
docker pull gacp-platform-backend:previous-tag
docker-compose up -d
```

## 📈 Scaling Considerations

### Horizontal Scaling

- Deploy multiple backend instances
- Configure load balancer
- Use Redis for session storage
- Implement database read replicas

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching strategies
- Use MongoDB Atlas auto-scaling

## 🔐 Security Hardening

### Server Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
```

### Application Security

- Regular dependency updates
- Security audit with `npm audit`
- Implement rate limiting
- Use HTTPS everywhere
- Validate all inputs
- Implement proper error handling

## 📋 Maintenance Schedule

### Daily

- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Monitor performance metrics

### Weekly

- [ ] Run comprehensive test suite
- [ ] Review security alerts
- [ ] Check backup integrity
- [ ] Update documentation

### Monthly

- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Backup strategy review

## 📞 Support Contacts

- **Technical Support**: tech-support@gacp-platform.com
- **Emergency Contact**: +1-xxx-xxx-xxxx
- **Documentation**: https://docs.gacp-platform.com
- **Status Page**: https://status.gacp-platform.com

## 📚 Additional Resources

- [WHO-GACP Guidelines](https://www.who.int/medicines/areas/quality_safety/quality_assurance/GACP2003.pdf)
- [Thai FDA Regulations](https://www.fda.moph.go.th/)
- [ASEAN Traditional Medicine Standards](https://asean.org/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Production Deployment](https://nodejs.org/en/docs/guides/getting-started-guide/)

---

## ✅ Deployment Verification Checklist

After deployment, verify the following:

- [ ] All API endpoints respond correctly
- [ ] Database connectivity is stable
- [ ] Health monitoring is operational
- [ ] Performance metrics are within acceptable ranges
- [ ] Security headers are properly configured
- [ ] SSL certificates are valid
- [ ] Backup systems are functional
- [ ] Logging is working correctly
- [ ] Error handling is properly configured
- [ ] API documentation is accessible

**Deployment completed successfully!** 🎉

The GACP Platform is now ready for production use with comprehensive monitoring, security, and performance optimization.
