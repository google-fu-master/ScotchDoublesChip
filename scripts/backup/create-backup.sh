#!/bin/bash

# Tournament App Database Backup Script
# Usage: ./create-backup.sh [environment] [backup-type]
# Examples:
#   ./create-backup.sh production daily
#   ./create-backup.sh staging manual

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Default values
ENVIRONMENT=${1:-development}
BACKUP_TYPE=${2:-manual}

# Environment-specific settings
case $ENVIRONMENT in
    "development")
        DATABASE_URL=${DEV_DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/tournament_dev"}
        BACKUP_BUCKET=${DEV_BACKUP_BUCKET:-"tournament-backups-dev"}
        ;;
    "staging")
        DATABASE_URL=${STAGING_DATABASE_URL}
        BACKUP_BUCKET=${STAGING_BACKUP_BUCKET}
        ;;
    "production")
        DATABASE_URL=${PRODUCTION_DATABASE_URL}
        BACKUP_BUCKET=${PRODUCTION_BACKUP_BUCKET}
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set for environment: $ENVIRONMENT"
    exit 1
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="$PROJECT_ROOT/database/backups/$ENVIRONMENT"
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILENAME="tournament_${ENVIRONMENT}_${BACKUP_TYPE}_${TIMESTAMP}.sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

echo "🗄️ Starting database backup..."
echo "📅 Timestamp: $(date)"
echo "🌍 Environment: $ENVIRONMENT"
echo "📝 Backup type: $BACKUP_TYPE"
echo "📁 Backup path: $BACKUP_PATH"

# Create database backup
echo "📦 Creating database dump..."
if ! pg_dump "$DATABASE_URL" > "$BACKUP_PATH"; then
    echo "❌ Database backup failed!"
    exit 1
fi

# Compress backup
echo "🗜️ Compressing backup..."
gzip "$BACKUP_PATH"
COMPRESSED_BACKUP="$BACKUP_PATH.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$COMPRESSED_BACKUP" | cut -f1)
echo "📏 Backup size: $BACKUP_SIZE"

# Upload to cloud storage if configured
if [ ! -z "$BACKUP_BUCKET" ] && [ "$ENVIRONMENT" != "development" ]; then
    echo "☁️ Uploading to cloud storage..."
    
    # Upload to S3 (requires AWS CLI configured)
    if command -v aws &> /dev/null; then
        aws s3 cp "$COMPRESSED_BACKUP" "s3://$BACKUP_BUCKET/database/" --storage-class STANDARD_IA
        echo "✅ Backup uploaded to S3: s3://$BACKUP_BUCKET/database/$(basename "$COMPRESSED_BACKUP")"
    else
        echo "⚠️ AWS CLI not found. Backup stored locally only."
    fi
fi

# Create backup metadata
METADATA_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.json"
cat > "$METADATA_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "$ENVIRONMENT",
    "backup_type": "$BACKUP_TYPE",
    "filename": "$(basename "$COMPRESSED_BACKUP")",
    "size_bytes": $(stat -c%s "$COMPRESSED_BACKUP"),
    "size_human": "$BACKUP_SIZE",
    "database_url_hash": "$(echo "$DATABASE_URL" | sha256sum | cut -d' ' -f1)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "created_by": "$(whoami)"
}
EOF

echo "📋 Backup metadata saved: $METADATA_FILE"

# Clean up old local backups (keep last 10 for each type)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "tournament_${ENVIRONMENT}_${BACKUP_TYPE}_*.sql.gz" -type f | sort | head -n -10 | xargs -r rm
find "$BACKUP_DIR" -name "backup_*.json" -type f | sort | head -n -10 | xargs -r rm

echo "✅ Database backup completed successfully!"
echo "📁 Local backup: $COMPRESSED_BACKUP"

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
if gzip -t "$COMPRESSED_BACKUP"; then
    echo "✅ Backup integrity verified"
else
    echo "❌ Backup integrity check failed!"
    exit 1
fi

# Send notification (if configured)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🗄️ Database backup completed for $ENVIRONMENT environment. Size: $BACKUP_SIZE\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || echo "⚠️ Slack notification failed"
fi

echo "🎉 Backup process completed at $(date)"