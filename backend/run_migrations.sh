#!/bin/bash
# One-time script to run migrations on Railway production database

echo "Running Alembic migrations on Railway production..."
echo "Current directory: $(pwd)"
echo ""

# Run migrations
alembic upgrade head

# Check current version
echo ""
echo "Current migration version:"
alembic current

# Seed database
echo ""
echo "Seeding database..."
python -m src.data.seed

echo ""
echo "✅ Migration and seeding complete!"
