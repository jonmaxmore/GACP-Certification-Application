# ============================================================
# GACP Backend - Production Dockerfile
# ============================================================
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache curl dumb-init openssl compat-openssl11

# Copy package.json ONLY (Ignore lockfile for fresh install reliability)
COPY package.json ./

# Install app dependencies (using install instead of ci to ignore lockfile)
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Bundle app source
# Bundle app source - Explicitly copy critical folders first to debug missing files
COPY middleware ./middleware
COPY routes ./routes
COPY services ./services
COPY shared ./shared
COPY utils ./utils
COPY config ./config
COPY controllers ./controllers
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create necessary directories
RUN mkdir -p uploads logs certificates

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port (internal only - not accessible from public)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
