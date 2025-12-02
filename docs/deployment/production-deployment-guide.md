# GACP Platform - Production Deployment Guide

Complete guide for deploying the Botanical Audit Framework to production with Docker.

## 🏗️ Architecture Overview

The GACP Platform consists of:

- **3 Next.js Portals**: Farmer (3001), Admin (3002), Certificate (3003)
- **Backend API**: Node.js/Express (3004)
- **Databases**: MongoDB (27017), Redis (6379)
- **Reverse Proxy**: Nginx (80/443) with SSL termination

## 📋 Prerequisites

### Required Software

- Docker v24.0+
- Docker Compose v2.20+
- Domain with DNS control
- SSL certificates (Let's Encrypt recommended)

### System Requirements

- **Production Server**: 4 CPU cores, 8GB RAM, 100GB SSD
- **Minimum**: 2 CPU cores, 4GB RAM, 50GB SSD
- **OS**: Ubuntu 22.04 LTS or compatible Linux

## 🚀 Quick Start (Production)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/botanical-audit-framework.git
cd botanical-audit-framework
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.production.template .env.production

# Generate secure secrets (PowerShell)
# MongoDB Password (32 chars)
[System.Web.Security.Membership]::GeneratePassword(32, 10)

# JWT Secret (64 chars base64)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Edit .env.production with generated secrets
nano .env.production
```

### 3. Update Domain Configuration

Edit `.env.production`:

```env
DOMAIN=yourdomain.com
FARMER_API_URL=https://api.yourdomain.com
ADMIN_API_URL=https://api.yourdomain.com
CERT_API_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://farmer.yourdomain.com,https://admin.yourdomain.com,https://cert.yourdomain.com
```

### 4. Configure DNS Records

Add these A/CNAME records to your DNS:

```
farmer.yourdomain.com    → Your Server IP
admin.yourdomain.com     → Your Server IP
cert.yourdomain.com      → Your Server IP
api.yourdomain.com       → Your Server IP
```

### 5. Set Up SSL Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
# Install certbot
sudo apt install certbot

# Generate certificates for all subdomains
sudo certbot certonly --standalone \
  -d farmer.yourdomain.com \
  -d admin.yourdomain.com \
  -d cert.yourdomain.com \
  -d api.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos --non-interactive

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/farmer.yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/farmer.yourdomain.com/privkey.pem nginx/ssl/
```

**Option B: Self-Signed (Development/Testing)**

```bash
mkdir -p nginx/ssl
cd nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=*.yourdomain.com"
```

### 6. Validate Configuration

```bash
# Check Docker Compose syntax
docker-compose -f docker-compose.prod.yml config

# Verify environment variables are set
docker-compose -f docker-compose.prod.yml config | grep -i "CHANGE_ME"
# Should return nothing if all secrets are set
```

### 7. Deploy Services

```bash
# Pull/build images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 8. Verify Deployment

```bash
# Health checks
curl -f http://localhost:3001/api/health  # Farmer Portal
curl -f http://localhost:3002/api/health  # Admin Portal
curl -f http://localhost:3003/api/health  # Certificate Portal
curl -f http://localhost:3004/api/monitoring/health  # Backend API

# Check via domain (requires DNS + SSL)
curl -f https://farmer.yourdomain.com/api/health
curl -f https://admin.yourdomain.com/api/health
curl -f https://cert.yourdomain.com/api/health
curl -f https://api.yourdomain.com/api/monitoring/health
```

## 📊 Monitoring & Maintenance

### View Service Status

```bash
# All services
docker-compose -f docker-compose.prod.yml ps

# Specific service
docker-compose -f docker-compose.prod.yml ps farmer-portal

# Resource usage
docker stats
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service with tail
docker-compose -f docker-compose.prod.yml logs -f --tail=100 gacp-backend

# Filter by time
docker-compose -f docker-compose.prod.yml logs --since 30m farmer-portal
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart gacp-backend

# Restart with rebuild
docker-compose -f docker-compose.prod.yml up -d --build gacp-backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Verify health
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw enable

# Verify rules
sudo ufw status
```

### 2. SSL/TLS Best Practices

- Use TLS 1.2+ only (configured in nginx.production.conf)
- Enable HTTP/2 (configured)
- Implement HSTS headers
- Regular certificate renewal (Let's Encrypt auto-renews)

### 3. Database Security

- Strong passwords (32+ characters)
- MongoDB authentication enabled
- Redis password protection
- Network isolation (Docker network)
- Regular backups

### 4. Application Security

- JWT secrets rotation (every 90 days)
- Session timeout configuration
- Rate limiting (configured in Nginx)
- CORS restrictions
- Input validation

## 💾 Backup & Recovery

### Manual Backup

```bash
# MongoDB backup
docker exec gacp-mongodb mongodump \
  --username admin \
  --password ${MONGO_ROOT_PASSWORD} \
  --authenticationDatabase admin \
  --out /backup/$(date +%Y%m%d)

# Copy backup to host
docker cp gacp-mongodb:/backup ./backups/

# Backup uploaded files
docker cp gacp-backend:/app/uploads ./backups/uploads-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop

# Restore MongoDB
docker exec gacp-mongodb mongorestore \
  --username admin \
  --password ${MONGO_ROOT_PASSWORD} \
  --authenticationDatabase admin \
  /backup/20240115

# Restore uploaded files
docker cp ./backups/uploads-20240115 gacp-backend:/app/uploads

# Start services
docker-compose -f docker-compose.prod.yml start
```

## 🔧 Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
docker-compose -f docker-compose.prod.yml logs gacp-backend

# Check container status
docker inspect gacp-backend

# Verify environment variables
docker-compose -f docker-compose.prod.yml exec gacp-backend env | grep MONGODB

# Test database connectivity
docker-compose -f docker-compose.prod.yml exec gacp-backend \
  curl mongodb://admin:password@mongodb:27017
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Limit container memory (in docker-compose.prod.yml)
deploy:
  resources:
    limits:
      memory: 1G

# Restart with new limits
docker-compose -f docker-compose.prod.yml up -d
```

### SSL Certificate Issues

```bash
# Verify certificate expiry
openssl x509 -in nginx/ssl/fullchain.pem -noout -dates

# Renew Let's Encrypt certificates
sudo certbot renew

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/farmer.yourdomain.com/*.pem nginx/ssl/

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Database Connection Errors

```bash
# Test MongoDB connection
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongosh -u admin -p ${MONGO_ROOT_PASSWORD} --authenticationDatabase admin

# Check MongoDB logs
docker-compose -f docker-compose.prod.yml logs mongodb

# Verify network connectivity
docker network inspect botanical-audit-framework_gacp-network
```

## 📈 Performance Optimization

### Enable HTTP/2

Already configured in `nginx.production.conf`:

```nginx
listen 443 ssl http2;
```

### Enable Gzip Compression

Already configured in `nginx.production.conf`:

```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;
```

### Redis Caching

Ensure Redis is used for session storage and caching:

```env
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
```

### Database Indexing

MongoDB indexes should be created in `mongo-init.js`:

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.certificates.createIndex({ certificateId: 1 }, { unique: true });
db.inspections.createIndex({ createdAt: -1 });
```

## 🚨 Emergency Procedures

### Complete System Failure

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Check Docker daemon
sudo systemctl status docker
sudo systemctl restart docker

# Clean up containers/volumes (WARNING: Data loss)
docker system prune -a --volumes

# Restore from backup
# (Follow backup restoration steps above)

# Redeploy from scratch
docker-compose -f docker-compose.prod.yml up -d
```

### Database Corruption

```bash
# Stop application servers
docker-compose -f docker-compose.prod.yml stop farmer-portal admin-portal certificate-portal gacp-backend

# Repair MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongod --repair

# Restart all services
docker-compose -f docker-compose.prod.yml start
```

## 📞 Support & Documentation

- **Architecture**: See `COMPLETE_SYSTEM_INVENTORY.md`
- **API Documentation**: See `BACKEND_API_STATUS.md`
- **Testing**: See `TEST_README.md`
- **Business Logic**: See `BUSINESS_LOGIC_VERIFICATION_REPORT.md`

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Generate and set all secrets (MongoDB, Redis, JWT)
- [ ] Update `DOMAIN` in `.env.production`
- [ ] Configure DNS records for all subdomains
- [ ] Generate/install SSL certificates
- [ ] Configure firewall rules
- [ ] Test all health endpoints
- [ ] Verify database connectivity
- [ ] Set up monitoring/alerting
- [ ] Configure automated backups
- [ ] Document recovery procedures
- [ ] Test rollback process
- [ ] Update team on deployment procedures

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows:

- **Lint & Test**: Automatic on all PRs
- **Build**: Creates artifacts for all apps
- **Security Scan**: Snyk + npm audit
- **Docker Build**: Pushes to GitHub Container Registry
- **Deploy Staging**: Automatic on main branch
- **Deploy Production**: Manual approval required

See `.github/workflows/ci-cd-pipeline.yml` for details.

## 📚 Additional Resources

- Docker Compose docs: https://docs.docker.com/compose/
- Nginx configuration: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- MongoDB production notes: https://docs.mongodb.com/manual/administration/production-notes/
- Next.js deployment: https://nextjs.org/docs/deployment
