#!/bin/bash
# ===============================================
# Database Initialization Script
# Runs all migrations and seeds in order
# ===============================================

set -e

echo "========================================"
echo "🚀 Initializing Library Platform Database"
echo "========================================" 
echo ""

# Set defaults if not provided
export POSTGRES_USER=${POSTGRES_USER:-abdelmounaim}
export POSTGRES_DB=${POSTGRES_DB:-library_db}
export DB_APP_ROLE=${DB_APP_ROLE:-library_app}
export DB_APP_PASSWORD=${DB_APP_PASSWORD:-library_app_password}

# Export environment variables for psql
export PGUSER="$POSTGRES_USER"
export PGDATABASE="$POSTGRES_DB"

echo "📋 Database: $POSTGRES_DB"
echo "👤 User: $POSTGRES_USER"
echo "🔑 App Role: $DB_APP_ROLE"
echo ""

# Run migrations in order
echo "📦 Running migrations..."
echo ""

for migration in /docker-entrypoint-initdb.d/migrations/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "  → $filename"
        psql -v ON_ERROR_STOP=1 \
             -v app_role="$DB_APP_ROLE" \
             -v app_password="$DB_APP_PASSWORD" \
             -f "$migration"
    fi
done

echo ""
echo "✓ All migrations completed"
echo ""

# Run seeds in order
echo "🌱 Running seeds..."
echo ""

for seed in /docker-entrypoint-initdb.d/seeds/*.sql; do
    if [ -f "$seed" ]; then
        filename=$(basename "$seed")
        echo "  → $filename"
        psql -v ON_ERROR_STOP=1 -f "$seed"
    fi
done

echo ""
echo "✓ All seeds completed"
echo ""

# Display summary
echo "========================================"
echo "✅ Database initialization complete!"
echo "========================================"
echo ""
echo "Tables created:"
psql -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
echo ""
echo "Ready to accept connections."
echo "========================================"

