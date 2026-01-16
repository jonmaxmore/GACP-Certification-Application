# Environment Variables Configuration
# Copy this file to .env.local and update values

# Backend API URL
BACKEND_URL=http://127.0.0.1:3000

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/gacp

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000

# Environment
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
