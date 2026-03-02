#!/usr/bin/env python3
"""
One-time script to run migrations and seed the Railway production database.
"""
import subprocess
import sys

def run_command(cmd, description):
    """Run a shell command and print the output."""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}\n")

    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    print(result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)

    if result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    else:
        print(f"✅ {description} completed successfully")

    return result

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting Railway Database Migration and Seeding")
    print("="*60)

    # Run Alembic migrations
    run_command("alembic upgrade head", "Running database migrations")

    # Show current migration version
    run_command("alembic current", "Checking current migration version")

    # Seed the database
    run_command("python -m src.data.seed", "Seeding database with initial data")

    print("\n" + "="*60)
    print("🎉 All done! Database is migrated and seeded.")
    print("="*60 + "\n")
