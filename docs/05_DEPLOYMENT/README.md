# 🚀 05 - Deployment

**Category**: Deployment & DevOps  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains deployment guides, environment setup instructions, and DevOps documentation.

---

## 📚 Documents in this Folder

### 1. ⭐⭐ [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Complete deployment guide

**Contents:**

- Environment setup (Dev, Staging, Production)
- Docker deployment
- Kubernetes deployment
- CI/CD pipeline
- Environment variables
- SSL/TLS setup
- Monitoring setup
- Troubleshooting

**Who should read:** MIS, DevOps, Backend developers

---

### 2. ⭐ [PM_QUICK_START_GUIDE.md](./PM_QUICK_START_GUIDE.md)

Quick start guide for project managers

**Contents:**

- Project setup overview
- Team onboarding
- Development workflow
- Common commands
- Testing procedures
- Deployment process

**Who should read:** PM, Team leads, New team members

---

### 3. [HOW_TO_START_FRONTEND.md](./HOW_TO_START_FRONTEND.md)

Frontend-specific setup guide

**Contents:**

- Frontend project structure
- Installation steps
- Development server
- Build process
- Environment configuration
- Troubleshooting

**Who should read:** Frontend developers

---

## 🎯 Quick Start

### 1. Initial Setup:

```bash
# Clone repository
git clone https://github.com/yourusername/gacp-certify-flow-main.git
cd gacp-certify-flow-main

# Install dependencies
pnpm install

# Setup environment
cp .env.development .env

# Start services
docker-compose up -d mongodb redis rabbitmq
```

### 2. Start Development:

```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:farmer       # Farmer portal (Port 3001)
pnpm dev:dtam         # DTAM portal (Port 3002)
pnpm dev:public       # Public services (Port 3003)
pnpm dev:backend      # Backend API (Port 3000)
```

### 3. Build for Production:

```bash
# Build all
pnpm build

# Test build
pnpm start

# Deploy
pnpm deploy:production
```

---

## 🌍 Environments

### Development (Local):

```
URL: http://localhost:3000
Database: MongoDB (localhost:27017)
Redis: localhost:6379
RabbitMQ: localhost:5672
Purpose: Local development
```

### Staging:

```
URL: https://staging.gacp.go.th
Database: MongoDB Atlas (Staging cluster)
Redis: ElastiCache (Staging)
RabbitMQ: CloudAMQP (Staging)
Purpose: Testing & UAT
```

### Production:

```
URL: https://gacp.go.th
Database: MongoDB Atlas (Production cluster - M30)
Redis: ElastiCache (Production)
RabbitMQ: CloudAMQP (Production)
Purpose: Live system
```

---

## 🐳 Docker Commands

### Start Services:

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d mongodb

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart service
docker-compose restart mongodb
```

### Build Docker Images:

```bash
# Build backend image
docker build -f Dockerfile.backend -t gacp-backend:latest .

# Build frontend images
docker build -f apps/farmer-portal/Dockerfile -t gacp-farmer:latest ./apps/farmer-portal

# Push to registry
docker push your-registry/gacp-backend:latest
```

---

## ☸️ Kubernetes Commands

### Deploy to Kubernetes:

```bash
# Apply all configs
kubectl apply -f k8s/

# Check deployments
kubectl get deployments -n gacp

# Check pods
kubectl get pods -n gacp

# View logs
kubectl logs -f <pod-name> -n gacp

# Scale deployment
kubectl scale deployment gacp-backend --replicas=3 -n gacp
```

### Helm Deployment:

```bash
# Install chart
helm install gacp ./helm/gacp -n gacp

# Upgrade
helm upgrade gacp ./helm/gacp -n gacp

# Rollback
helm rollback gacp -n gacp

# Uninstall
helm uninstall gacp -n gacp
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow:

```
Push to branch
    ↓
Run tests
    ↓
Build Docker images
    ↓
Push to registry
    ↓
Deploy to staging (auto)
    ↓
Run E2E tests
    ↓
Deploy to production (manual approval)
    ↓
Smoke tests
    ↓
Notify team
```

### Deployment Process:

```bash
# 1. Create PR
git checkout -b feature/my-feature
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 2. Wait for CI/CD
# - Tests run automatically
# - Build succeeds
# - Review approved

# 3. Merge to main
# - Auto-deploy to staging

# 4. Approve production deployment
# - Manual approval in GitHub Actions
# - Deploy to production
```

---

## 🔗 Related Documentation

- **System Architecture**: [../01_SYSTEM_ARCHITECTURE/](../01_SYSTEM_ARCHITECTURE/)
- **Database Setup**: [../04_DATABASE/](../04_DATABASE/)
- **Kubernetes Configs**: [../../k8s/](../../k8s/)
- **Docker Compose**: [../../docker-compose.yml](../../docker-compose.yml)

---

## 📞 Contact

**DevOps Team:**

- MIS Lead: คุณสมคำ - somkam@gacp.go.th
- DevOps: devops@gacp.go.th

**Slack Channels:**

- #gacp-devops
- #gacp-deployment
- #gacp-incidents

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: Database](../04_DATABASE/)
- ➡️ [Next: Frontend](../06_FRONTEND/)
