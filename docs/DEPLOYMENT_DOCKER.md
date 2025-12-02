# Docker Deployment Guide

## GACP Certify Flow Admin Portal

### Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Building Docker Images](#building-docker-images)
4. [Docker Compose Setup](#docker-compose-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Database Management](#database-management)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers deploying the GACP Certify Flow Admin Portal using Docker and Docker Compose. Docker provides consistent environments across development, staging, and production.

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                Load Balancer                     │
│              (Nginx/Traefik)                     │
└────────────┬────────────────────────┬────────────┘
             │                        │
       ┌─────▼─────┐           ┌─────▼─────┐
       │  Next.js  │           │  Next.js  │
       │   App 1   │           │   App 2   │
       └─────┬─────┘           └─────┬─────┘
             │                        │
             └────────────┬───────────┘
                          │
            ┌─────────────▼─────────────┐
            │                           │
      ┌─────▼─────┐            ┌────────▼────────┐
      │ PostgreSQL│            │     Redis       │
      │  Database │            │     Cache       │
      └───────────┘            └─────────────────┘
```

---

## Prerequisites

### Required Software

- **Docker**: Version 20.10.0 or higher
- **Docker Compose**: Version 2.0.0 or higher

### Installation

#### Windows

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run installer
3. Enable WSL 2 backend (recommended)
4. Restart computer

#### macOS

```bash
# Using Homebrew
brew install --cask docker

# Or download from Docker website
```

#### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

---

## Building Docker Images

### Backend Dockerfile

The backend Dockerfile is optimized for production:

```dockerfile
# File: Dockerfile.backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Rebuild source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Building Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t gacp-admin-portal:latest .

# Build with specific version
docker build -f Dockerfile.backend -t gacp-admin-portal:1.0.0 .

# Build with build arguments
docker build -f Dockerfile.backend \
  --build-arg NODE_ENV=production \
  --build-arg BUILD_VERSION=1.0.0 \
  -t gacp-admin-portal:latest .
```

### Multi-Architecture Builds

For deployment on different architectures (ARM, AMD64):

```bash
# Create builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.backend \
  -t gacp-admin-portal:latest \
  --push .
```

---

## Docker Compose Setup

### Production Docker Compose

```yaml
# File: docker-compose.production.yml
version: '3.8'

services:
  # Next.js Application
  app:
    image: gacp-admin-portal:latest
    container_name: gacp-app
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://gacp_admin:${DB_PASSWORD}@postgres:5432/gacp_certify
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - gacp-network
    volumes:
      - app-uploads:/app/uploads
      - app-logs:/app/logs
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--no-verbose',
          '--tries=1',
          '--spider',
          'http://localhost:3000/api/health/live'
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: gacp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: gacp_certify
      POSTGRES_USER: gacp_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: '-E UTF8'
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    networks:
      - gacp-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U gacp_admin -d gacp_certify']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:6-alpine
    container_name: gacp-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    networks:
      - gacp-network
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: gacp-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - gacp-network

networks:
  gacp-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  app-uploads:
  app-logs:
  nginx-logs:
```

---

## Environment Configuration

### Environment Variables

Create `.env.production` file:

```env
# Application
NODE_ENV=production
APP_URL=https://admin.gacp-certify.com

# Database
DB_PASSWORD=your_very_secure_database_password

# Redis
REDIS_PASSWORD=your_secure_redis_password

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_64_characters_minimum
JWT_REFRESH_SECRET=your_refresh_secret_64_characters_minimum
SESSION_SECRET=your_session_secret_64_characters_minimum

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@gacp-certify.com
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=noreply@gacp-certify.com

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=gacp-uploads
AWS_REGION=ap-southeast-1

# Payment Gateway
PROMPTPAY_API_KEY=your_promptpay_key
OMISE_PUBLIC_KEY=your_omise_public_key
OMISE_SECRET_KEY=your_omise_secret_key

# Error Tracking
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Securing Secrets

**Never commit `.env.production` to version control!**

Use one of these methods:

#### Option 1: Docker Secrets

```bash
# Create secrets
echo "your_db_password" | docker secret create db_password -
echo "your_jwt_secret" | docker secret create jwt_secret -

# Use in docker-compose.yml
services:
  app:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

#### Option 2: Environment File

```bash
# Load from secure location
docker-compose --env-file /secure/path/.env.production up -d
```

#### Option 3: Vault/Secret Manager

Use HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault.

---

## Running the Application

### Starting Services

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs -f app

# Check status
docker-compose -f docker-compose.production.yml ps
```

### Stopping Services

```bash
# Stop services
docker-compose -f docker-compose.production.yml stop

# Stop and remove containers
docker-compose -f docker-compose.production.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.production.yml down -v
```

### Updating Application

```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Recreate containers with new images
docker-compose -f docker-compose.production.yml up -d --force-recreate

# Or do zero-downtime update
docker-compose -f docker-compose.production.yml up -d --no-deps --build app
```

---

## Database Management

### Running Migrations

```bash
# Run migrations on startup (add to docker-compose.yml)
services:
  app:
    command: sh -c "npx prisma migrate deploy && node server.js"
```

Or run manually:

```bash
# Execute migration in running container
docker-compose exec app npx prisma migrate deploy

# If container is not running
docker-compose run --rm app npx prisma migrate deploy
```

### Database Backups

#### Automated Backups

```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

docker-compose exec -T postgres pg_dump \
  -U gacp_admin \
  -d gacp_certify \
  > /backups/${BACKUP_FILE}

# Compress backup
gzip /backups/${BACKUP_FILE}

# Delete backups older than 30 days
find /backups -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x backup-database.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup-database.sh
```

#### Manual Backup

```bash
# Backup database
docker-compose exec postgres pg_dump \
  -U gacp_admin \
  gacp_certify \
  > backup_$(date +%Y%m%d).sql

# Backup with compression
docker-compose exec postgres pg_dump \
  -U gacp_admin \
  gacp_certify \
  | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Restore Database

```bash
# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql \
  -U gacp_admin \
  -d gacp_certify

# Restore from compressed backup
gunzip < backup.sql.gz | docker-compose exec -T postgres psql \
  -U gacp_admin \
  -d gacp_certify
```

---

## Monitoring & Logging

### Container Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app

# Save logs to file
docker-compose logs --no-color > logs.txt
```

### Log Rotation

Configure Docker logging driver:

```yaml
services:
  app:
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
```

### Health Checks

Monitor container health:

```bash
# Check health status
docker-compose ps

# Inspect health check details
docker inspect gacp-app --format='{{json .State.Health}}' | jq

# View health check logs
docker inspect gacp-app --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

### Monitoring Tools

#### Prometheus & Grafana

```yaml
# Add to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Scaling

### Horizontal Scaling

Scale application instances:

```bash
# Scale to 3 instances
docker-compose up -d --scale app=3

# View scaled instances
docker-compose ps
```

### Load Balancing

Add Nginx load balancer:

```nginx
# nginx/nginx.conf
upstream app_servers {
    least_conn;
    server gacp-app-1:3000 max_fails=3 fail_timeout=30s;
    server gacp-app-2:3000 max_fails=3 fail_timeout=30s;
    server gacp-app-3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name admin.gacp-certify.com;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Inspect container
docker inspect gacp-app

# Try running interactively
docker-compose run --rm app sh
```

#### Database Connection Error

```bash
# Check database container
docker-compose ps postgres

# Test database connection
docker-compose exec postgres psql -U gacp_admin -d gacp_certify

# Check database logs
docker-compose logs postgres
```

#### Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm gacp_postgres-data
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Limit container resources
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

---

**Next:** [Kubernetes Deployment Guide](./DEPLOYMENT_KUBERNETES.md)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
