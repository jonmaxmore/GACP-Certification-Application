# 🛠️ Development Guide

## 📋 Table of Contents
- [Quick Setup](#quick-setup)
- [Environment Setup](#environment-setup)
- [Docker Setup](#docker-setup)
- [MongoDB Setup](#mongodb-setup)
- [PM2 Process Management](#pm2-process-management)
- [Git Hooks](#git-hooks)
- [Team Setup](#team-setup)

## 🚀 Quick Setup

### Prerequisites
- Node.js 18.0.0+
- PNPM 8.0.0+
- MongoDB (local or Atlas)
- Redis (optional)

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd Botanical-Audit-Framework

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/farmer-portal/.env.example apps/farmer-portal/.env

# 4. Start development
pnpm dev
```

## 🔧 Environment Setup

### Backend Environment (.env)
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gacp_platform
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET_FARMER=your_farmer_secret_key
JWT_SECRET_DTAM=your_dtam_secret_key
SESSION_SECRET=your_session_secret

# External Services
SENDGRID_API_KEY=your_sendgrid_key
LINE_NOTIFY_TOKEN=your_line_token
```

### Frontend Environment (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🐳 Docker Setup

### Development with Docker
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d mongodb
docker-compose up -d redis

# View logs
docker-compose logs -f backend
```

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: gacp_platform

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/gacp_platform
      - REDIS_URL=redis://redis:6379

volumes:
  mongodb_data:
```

## 🗄️ MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Ubuntu: apt install mongodb

# Start MongoDB
mongod --dbpath /data/db

# Connect to MongoDB
mongosh mongodb://localhost:27017/gacp_platform
```

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create new cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Database Initialization
```bash
# Seed database with sample data
cd apps/backend
node scripts/seed-data.js

# Create indexes
node scripts/create-indexes.js
```

## ⚡ PM2 Process Management

### Installation
```bash
npm install -g pm2
```

### Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'gacp-backend',
      script: './apps/backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'gacp-farmer-portal',
      script: 'npm',
      args: 'start',
      cwd: './apps/farmer-portal',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

### PM2 Commands
```bash
# Start applications
pm2 start ecosystem.config.js

# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔗 Git Hooks

### Husky Setup
```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"
```

### Lint-staged Configuration
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Pre-commit Hooks
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test
```

## 👥 Team Setup

### Development Workflow
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Botanical-Audit-Framework
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Environment**
   - Copy `.env.example` files
   - Configure database connections
   - Setup external service keys

4. **Start Development**
   ```bash
   pnpm dev
   ```

### Code Quality Standards
- **ESLint:** Enforced via pre-commit hooks
- **Prettier:** Auto-formatting on save
- **TypeScript:** Strict mode enabled
- **Testing:** Jest for unit tests, Playwright for E2E

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Development Commands
```bash
# Development
pnpm dev                    # Start all apps
pnpm dev:backend           # Start backend only
pnpm dev:farmer-portal     # Start farmer portal only

# Building
pnpm build                 # Build all apps
pnpm build:backend         # Build backend only

# Testing
pnpm test                  # Run all tests
pnpm test:unit            # Run unit tests
pnpm test:e2e             # Run E2E tests

# Code Quality
pnpm lint                  # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm type-check           # TypeScript checking
pnpm format               # Format with Prettier
```

### IDE Setup
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code

### Troubleshooting

#### Common Issues
1. **Port already in use**
   ```bash
   # Kill process on port
   npx kill-port 3000
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB status
   brew services list | grep mongodb
   # Restart MongoDB
   brew services restart mongodb-community
   ```

3. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules
   pnpm install
   ```

4. **TypeScript errors**
   ```bash
   # Restart TypeScript server in VS Code
   Cmd+Shift+P -> "TypeScript: Restart TS Server"
   ```

## 📚 Additional Resources
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [User Guides](./docs/USER_GUIDES.md)