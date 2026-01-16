# GACP Frontend Dockerfile
# Multi-stage build for optimized production image

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-slim AS deps

WORKDIR /app

# Copy package manifest (avoid lockfile mismatch across OS for optional deps like lightningcss)
COPY package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# ===========================================
# Stage 2: Builder
# ===========================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN npm run build

# ===========================================
# Stage 3: Production Runner
# ===========================================
FROM node:20-slim AS runner

WORKDIR /app

# Security: Run as non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -m nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', r => process.exit(r.statusCode && r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1));"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
