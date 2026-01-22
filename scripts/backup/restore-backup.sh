#!/bin/bash

# Database Restore Script
# Usage: ./restore-backup.sh [environment] [backup-file]
# Example: ./restore-backup.sh development tournament_development_manual_20260122_143022.sql.gz

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

ENVIRONMENT=${1:-development}
BACKUP_FILE=$2

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Please specify backup file"
    echo "Usage: ./restore-backup.sh [environment] [backup-file]"
    echo ""
    echo "Available backups for $ENVIRONMENT:"
    find "$PROJECT_ROOT/database/backups/$ENVIRONMENT" -name "*.sql.gz" -type f | sort -r | head -10
    exit 1
fi

# Environment-specific settings
case $ENVIRONMENT in
    "development")
        DATABASE_URL=${DEV_DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/tournament_dev"}
        ;;
    "staging")
        DATABASE_URL=${STAGING_DATABASE_URL}
        ;;
    "production")
        echo "❌ Production restore requires additional confirmation!"
        echo "This will overwrite the production database. Are you absolutely sure? (type 'YES' to confirm)"
        read -r confirmation
        if [ "$confirmation" != "YES" ]; then
            echo "❌ Restore cancelled"
            exit 1
        fi
        DATABASE_URL=${PRODUCTION_DATABASE_URL}
        ;;
esac

# Create restore backup first
echo "🛡️ Creating safety backup before restore..."
SAFETY_BACKUP_DIR="$PROJECT_ROOT/database/backups/$ENVIRONMENT/safety"
mkdir -p "$SAFETY_BACKUP_DIR"
SAFETY_BACKUP="$SAFETY_BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql"

pg_dump "$DATABASE_URL" > "$SAFETY_BACKUP"
gzip "$SAFETY_BACKUP"
echo "✅ Safety backup created: ${SAFETY_BACKUP}.gz"

# Restore from backup
BACKUP_PATH="$PROJECT_ROOT/database/backups/$ENVIRONMENT/$BACKUP_FILE"

if [ ! -f "$BACKUP_PATH" ]; then
    echo "❌ Backup file not found: $BACKUP_PATH"
    exit 1
fi

echo "🔄 Restoring database from: $BACKUP_FILE"
echo "🌍 Environment: $ENVIRONMENT"
echo "⚠️  This will overwrite the current database!"

# Drop and recreate database
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
echo "🗑️ Dropping existing database: $DB_NAME"

# Extract connection params
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Drop and recreate database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"

# Restore data
echo "📥 Restoring data..."
if [[ "$BACKUP_PATH" == *.gz ]]; then
    gunzip -c "$BACKUP_PATH" | psql "$DATABASE_URL"
else
    psql "$DATABASE_URL" < "$BACKUP_PATH"
fi

echo "✅ Database restored successfully!"
echo "📅 Restored at: $(date)"

# Send notification
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🔄 Database restored for $ENVIRONMENT environment from $BACKUP_FILE\"}" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || echo "⚠️ Slack notification failed"
fi