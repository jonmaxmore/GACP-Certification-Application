# Developer Setup Guide

## GACP Certify Flow Admin Portal

### Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Code Quality](#code-quality)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following software before starting:

| Software       | Version        | Purpose             |
| -------------- | -------------- | ------------------- |
| **Node.js**    | 18.x or higher | Runtime environment |
| **npm**        | 9.x or higher  | Package manager     |
| **PostgreSQL** | 14.x or higher | Database            |
| **Redis**      | 6.x or higher  | Caching & sessions  |
| **Git**        | Latest         | Version control     |

### Optional Tools

| Tool        | Purpose             |
| ----------- | ------------------- |
| **Docker**  | Containerization    |
| **VS Code** | Recommended IDE     |
| **Postman** | API testing         |
| **pgAdmin** | Database management |

### System Requirements

- **OS**: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB, recommended 16GB
- **Disk Space**: At least 10GB free space
- **Network**: Stable internet connection for dependencies

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/gacp-certify/admin-portal.git

# Navigate to project directory
cd admin-portal

# Checkout development branch
git checkout develop
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install global tools (if not already installed)
npm install -g prisma @nestjs/cli
```

**Note:** If you encounter permission errors on macOS/Linux, use `sudo` or configure npm to use a different directory.

### Step 3: Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Start PostgreSQL service
# macOS with Homebrew
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows
# Use Services app to start PostgreSQL service

# Create database
createdb gacp_certify_dev

# Create user (if not exists)
psql postgres
CREATE USER gacp_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gacp_certify_dev TO gacp_admin;
\q
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name gacp-postgres \
  -e POSTGRES_DB=gacp_certify_dev \
  -e POSTGRES_USER=gacp_admin \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14
```

### Step 4: Setup Redis

#### Option A: Local Redis

```bash
# macOS with Homebrew
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Windows
# Download and run Redis from GitHub releases
```

#### Option B: Docker Redis

```bash
# Run Redis in Docker
docker run --name gacp-redis \
  -p 6379:6379 \
  -d redis:6-alpine
```

### Step 5: Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://gacp_admin:your_secure_password@localhost:5432/gacp_certify_dev?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Session
SESSION_SECRET=your_session_secret_change_in_production

# Email (for development, use Mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
SMTP_FROM_EMAIL=noreply@gacp-certify.com
SMTP_FROM_NAME="GACP Certify Flow"

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=ap-southeast-1

# Payment Gateway (optional for local dev)
PROMPTPAY_API_KEY=
OMISE_PUBLIC_KEY=
OMISE_SECRET_KEY=

# Error Tracking
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs
```

### Step 6: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

### Step 7: Build Frontend Assets

```bash
# Build Material Dashboard theme
npm run build:frontend

# Or use the batch file (Windows)
build-frontend.bat

# Or shell script (macOS/Linux)
chmod +x build-frontend.sh
./build-frontend.sh
```

### Step 8: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Or start with debug mode
npm run dev:debug
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
gacp-certify-flow-main/
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard widgets
│   ├── errors/             # Error boundaries
│   ├── forms/              # Form components
│   └── layout/             # Layout components
├── lib/                    # Core libraries
│   ├── auth/               # Authentication logic
│   ├── db/                 # Database utilities
│   ├── errors/             # Error handling
│   ├── monitoring/         # Performance monitoring
│   ├── security/           # Security utilities
│   └── utils/              # Helper functions
├── pages/                  # Next.js pages
│   ├── api/                # API routes
│   ├── auth/               # Auth pages
│   ├── applications/       # Application management
│   ├── dashboard/          # Dashboard pages
│   └── _app.tsx            # App wrapper
├── prisma/                 # Database schema
│   ├── schema.prisma       # Prisma schema
│   ├── migrations/         # Migration files
│   └── seed.ts             # Database seeder
├── public/                 # Static files
│   ├── assets/             # Images, icons
│   └── material-dashboard/ # Material Dashboard theme
├── styles/                 # Global styles
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                   # Documentation
├── .env.example            # Environment template
├── .eslintrc.json          # ESLint config
├── .prettierrc             # Prettier config
├── next.config.js          # Next.js config
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── README.md               # Project readme
```

### Key Directories Explained

**`/components`**: Reusable React components organized by feature area. Use atomic design principles.

**`/lib`**: Core business logic and utilities. Keep framework-agnostic when possible.

**`/pages`**: Next.js file-based routing. Each file becomes a route.

**`/pages/api`**: Backend API endpoints. Follows RESTful conventions.

**`/prisma`**: Database schema and migrations using Prisma ORM.

**`/tests`**: All test files. Mirror the source structure.

---

## Environment Configuration

### Environment Files

The project uses multiple environment files:

- `.env`: Local development (git-ignored)
- `.env.example`: Template with all variables
- `.env.test`: Testing environment
- `.env.production`: Production settings (never commit!)

### Required Variables

#### Database Configuration

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

Format: `postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]`

#### Redis Configuration

```env
REDIS_URL="redis://localhost:6379"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional
```

#### Authentication Secrets

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use generated values for:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`

### Validating Configuration

Run configuration check:

```bash
npm run config:check
```

This validates all required environment variables are set.

---

## Database Setup

### Prisma Schema

The database schema is defined in `prisma/schema.prisma`:

```prisma
// Example model
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  password      String
  role          Role     @default(FARMER)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  applications  Application[]
  @@map("users")
}
```

### Creating Migrations

When you modify the schema:

```bash
# Create a new migration
npx prisma migrate dev --name add_user_fields

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Database Seeding

Seed the database with sample data:

```bash
# Run seeder
npx prisma db seed
```

This creates:

- Admin user (admin@example.com / admin123)
- Sample farmers
- Sample applications
- Test data for development

### Prisma Studio

Explore database visually:

```bash
npx prisma studio
```

Opens at [http://localhost:5555](http://localhost:5555)

---

## Running the Application

### Development Mode

```bash
# Standard development server
npm run dev

# With debug logging
npm run dev:debug

# With specific port
PORT=3001 npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Development

```bash
# Start all services (app, database, redis)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Running Specific Services

```bash
# Start only database
docker-compose up postgres

# Start only redis
docker-compose up redis
```

---

## Development Workflow

### Code Style

We use ESLint and Prettier for consistent code formatting.

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Git Workflow

1. **Create Feature Branch**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **Make Changes & Commit**

```bash
git add .
git commit -m "feat: add user authentication"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

3. **Push & Create Pull Request**

```bash
git push origin feature/your-feature-name
```

Then create PR on GitHub targeting `develop` branch.

### Pre-commit Hooks

Husky runs checks before commits:

- ESLint checks
- Prettier formatting
- TypeScript compilation
- Unit tests (optional)

Skip hooks (not recommended):

```bash
git commit -m "message" --no-verify
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Structure

```typescript
// tests/unit/lib/auth/auth-service.spec.ts
import { AuthService } from '@/lib/auth/auth-service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid credentials', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong_password'
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Test Coverage Goals

Maintain minimum coverage:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

---

## Code Quality

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"]
    }
  }
}
```

### ESLint Rules

Key rules enforced:

- No unused variables
- Consistent import order
- Explicit function return types
- No `any` types (prefer `unknown`)
- Consistent naming conventions

### Code Review Checklist

Before submitting PR:

- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is formatted
- [ ] TypeScript types are correct
- [ ] Documentation updated
- [ ] No console.logs left
- [ ] Error handling implemented
- [ ] Security best practices followed
- [ ] Performance considered

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Error: Port 3000 is already in use

# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

#### Database Connection Error

```bash
# Error: Can't reach database server

# Check PostgreSQL is running
pg_isready  # Returns "accepting connections"

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### Redis Connection Error

```bash
# Error: Could not connect to Redis

# Check Redis is running
redis-cli ping  # Should return "PONG"

# Check Redis URL
echo $REDIS_URL

# Start Redis
redis-server
```

#### Prisma Client Issues

```bash
# Error: Prisma Client not generated

# Regenerate client
npx prisma generate

# If persists, delete and reinstall
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

#### Module Not Found

```bash
# Error: Cannot find module

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Getting Help

- **Documentation**: [https://docs.gacp-certify.com](https://docs.gacp-certify.com)
- **GitHub Issues**: [https://github.com/gacp-certify/admin-portal/issues](https://github.com/gacp-certify/admin-portal/issues)
- **Discord**: [https://discord.gg/gacp-certify](https://discord.gg/gacp-certify)
- **Email**: dev-support@gacp-certify.com

---

**Next Steps:**

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Review [API Integration Guide](./API_INTEGRATION.md)
- Check [Contributing Guidelines](./CONTRIBUTING.md)
- Explore [Testing Guide](./TESTING.md)

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.0
