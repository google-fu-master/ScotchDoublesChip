#!/bin/bash

# Development Environment Setup Script
# Usage: ./setup-dev-environment.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "🛠️ Setting up development environment..."

# Check if required tools are installed
echo "🔍 Checking required tools..."

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "   Installation guide: https://github.com/google-fu-master/ScotchDoublesChip/blob/main/docs/development-setup.md"
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

check_command "node"
check_command "npm"
check_command "git"
check_command "psql"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+"
    exit 1
fi

# Install dependencies
echo "📦 Installing root dependencies..."
cd "$PROJECT_ROOT"
npm install

# Install app dependencies
echo "📦 Installing app dependencies..."

# Tournament Director Web App
if [ -f "apps/tournament-director/web/package.json" ]; then
    echo "📱 Installing Tournament Director Web App dependencies..."
    cd "$PROJECT_ROOT/apps/tournament-director/web"
    npm install
fi

# Player Web App
if [ -f "apps/player/web/package.json" ]; then
    echo "👥 Installing Player Web App dependencies..."
    cd "$PROJECT_ROOT/apps/player/web"
    npm install
fi

cd "$PROJECT_ROOT"

# Setup environment files
echo "⚙️ Setting up environment configuration..."

# Copy example environment files
for env_file in \
    ".env.development.example" \
    "apps/tournament-director/web/.env.local.example" \
    "apps/player/web/.env.local.example"; do
    
    if [ -f "$env_file" ]; then
        target_file=$(echo "$env_file" | sed 's/\.example$//')
        if [ ! -f "$target_file" ]; then
            cp "$env_file" "$target_file"
            echo "📝 Created $target_file"
        fi
    fi
done

# Setup development database
echo "🗄️ Setting up development database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   macOS: brew services start postgresql"
    echo "   Ubuntu: sudo systemctl start postgresql"
    exit 1
fi

# Create development database if it doesn't exist
DEV_DB_NAME="tournament_dev"
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DEV_DB_NAME"; then
    echo "📋 Creating development database: $DEV_DB_NAME"
    createdb "$DEV_DB_NAME"
else
    echo "✅ Development database already exists"
fi

# Run database migrations
echo "🏗️ Running database migrations..."
npm run db:migrate:dev

# Seed development data
echo "🌱 Seeding development data..."
npm run db:seed:dev

# Setup Git hooks
echo "🎣 Setting up Git hooks..."
if [ -d ".git" ]; then
    # Copy pre-commit hook
    cp "$SCRIPT_DIR/git-hooks/pre-commit" ".git/hooks/pre-commit"
    chmod +x ".git/hooks/pre-commit"
    
    # Copy commit-msg hook
    cp "$SCRIPT_DIR/git-hooks/commit-msg" ".git/hooks/commit-msg"
    chmod +x ".git/hooks/commit-msg"
    
    echo "✅ Git hooks installed"
fi

# Install Playwright for E2E testing
echo "🎭 Installing Playwright for E2E testing..."
npx playwright install

# Setup monitoring (development)
echo "📊 Setting up development monitoring..."
mkdir -p logs

# Create development convenience scripts
echo "🔧 Creating development convenience scripts..."

# Create start-dev script
cat > "$PROJECT_ROOT/start-dev.sh" << 'EOF'
#!/bin/bash
echo "🚀 Starting development servers..."

# Start all development servers concurrently
npm run dev &
cd apps/tournament-director/web && npm run dev -- --port 3001 &
cd ../../player/web && npm run dev -- --port 3002 &

# Wait for any process to exit
wait
EOF

chmod +x "$PROJECT_ROOT/start-dev.sh"

# Create stop-dev script
cat > "$PROJECT_ROOT/stop-dev.sh" << 'EOF'
#!/bin/bash
echo "🛑 Stopping development servers..."
pkill -f "next dev"
echo "✅ All development servers stopped"
EOF

chmod +x "$PROJECT_ROOT/stop-dev.sh"

# Final setup verification
echo "🔍 Running setup verification..."

# Check if apps can build
echo "📦 Verifying builds..."
npm run build:check

echo "✅ Development environment setup completed!"
echo ""
echo "🎉 You're ready to start developing!"
echo ""
echo "Quick start commands:"
echo "  📚 Start all dev servers: ./start-dev.sh"
echo "  🛑 Stop all dev servers:  ./stop-dev.sh"
echo "  🧪 Run tests:            npm run test"
echo "  🗄️ Reset database:       npm run db:reset:dev"
echo "  📋 View logs:            tail -f logs/development.log"
echo ""
echo "📖 For more information, see: docs/development-guide.md"