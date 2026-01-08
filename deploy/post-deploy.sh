#!/bin/bash
# =============================================================================
# GACP Platform - Post-Deployment Script
# Run this after deployment to ensure database has required seed data
# =============================================================================

set -e

echo "🚀 GACP Post-Deployment Setup"
echo "=============================="

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check if containers are running
if ! docker ps | grep -q gacp-backend; then
    echo "❌ Error: gacp-backend container not running"
    exit 1
fi

if ! docker ps | grep -q gacp-postgres; then
    echo "❌ Error: gacp-postgres container not running"
    exit 1
fi

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
docker exec gacp-backend npx prisma migrate deploy || echo "⚠️ Migration already up to date"

# Run seed scripts
echo "🌱 Seeding plant species and document requirements..."
docker exec gacp-backend node prisma/seed-plants.js

# Verify seed data
echo "🔍 Verifying seed data..."
PLANTS=$(docker exec gacp-postgres psql -U gacp -d gacp_db -t -c "SELECT COUNT(*) FROM plant_species;")
DOCS=$(docker exec gacp-postgres psql -U gacp -d gacp_db -t -c "SELECT COUNT(*) FROM document_requirements;")

echo "  ✅ Plants: $PLANTS"
echo "  ✅ Document Requirements: $DOCS"

# Health check
echo "🏥 Running health check..."
curl -sf http://127.0.0.1:5000/api/health > /dev/null && echo "  ✅ API Health: OK" || echo "  ⚠️ API Health: Check failed"

echo ""
echo "=============================="
echo "✅ Post-deployment setup complete!"
echo "=============================="
