#!/bin/bash
# Railway startup script - runs migrations then starts the application

set -e  # Exit on error

echo "🚀 Starting Fullfill Backend..."
echo ""

# Run migrations
echo "📦 Running database migrations..."
python3 migrate.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations complete. Starting application..."
    echo ""

    # Start the application
    uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
else
    echo ""
    echo "❌ Migration failed. Not starting application."
    exit 1
fi
