#!/bin/bash

# Production Deployment Script
# This script handles the production deployment process with safety checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "🚀 Starting production deployment..."
echo "📅 Deployment time: $(date)"
echo "🔍 Git commit: $(git rev-parse HEAD)"

# Pre-deployment safety checks
echo "🛡️ Running pre-deployment safety checks..."

# Check if we're on the correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Not on main branch. Currently on: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Uncommitted changes detected. Please commit or stash changes."
    git status --short
    exit 1
fi

# Run tests before deployment
echo "🧪 Running test suite..."
npm run test:all

# Create pre-deployment backup
echo "🗄️ Creating pre-deployment backup..."
"$SCRIPT_DIR/../backup/create-backup.sh" production pre-deployment

# Build all applications
echo "🏗️ Building applications..."
npm run build:all

# Deploy database migrations (if any)
echo "🗄️ Applying database migrations..."
npm run db:migrate:production

# Deploy applications
echo "📦 Deploying applications..."

# Tournament Director Web App
echo "📱 Deploying Tournament Director Web App..."
cd "$PROJECT_ROOT/apps/tournament-director/web"
npm run deploy:production

# Player Web App
echo "👥 Deploying Player Web App..."
cd "$PROJECT_ROOT/apps/player/web"
npm run deploy:production

# Public Interface
echo "🌐 Deploying Public Interface..."
cd "$PROJECT_ROOT/apps/public"
npm run deploy:production

cd "$PROJECT_ROOT"

# Wait for deployments to stabilize
echo "⏳ Waiting for deployments to stabilize..."
sleep 30

# Run post-deployment verification
echo "✅ Running post-deployment verification..."
"$SCRIPT_DIR/verify-deployment.sh" production

# Clear CDN cache if configured
if [ ! -z "$CDN_CACHE_CLEAR_URL" ]; then
    echo "🧹 Clearing CDN cache..."
    curl -X POST "$CDN_CACHE_CLEAR_URL" -H "Authorization: Bearer $CDN_API_TOKEN"
fi

# Send deployment notification
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    COMMIT_MSG=$(git log -1 --pretty=%B)
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Production deployment completed successfully!\n\n📋 Commit: \`$(git rev-parse --short HEAD)\`\n📝 Message: $COMMIT_MSG\n⏰ Time: $(date)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo "✅ Production deployment completed successfully!"
echo "🎉 Deployment finished at: $(date)"