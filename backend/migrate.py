#!/usr/bin/env python3
"""
Auto-migration script for Railway deployments.
Runs database migrations before starting the application.
"""
import subprocess
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


def run_migrations():
    """Run alembic migrations to bring database to latest version."""
    try:
        logger.info("=" * 60)
        logger.info("Running database migrations...")
        logger.info("=" * 60)

        # Check current version
        logger.info("Checking current migration version...")
        result = subprocess.run(
            ["alembic", "current"],
            capture_output=True,
            text=True,
            check=False
        )
        logger.info(f"Current version: {result.stdout.strip()}")

        # Run migrations
        logger.info("Applying migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True
        )

        if result.stdout:
            logger.info(result.stdout)
        if result.stderr:
            logger.warning(result.stderr)

        # Verify new version
        logger.info("Verifying migration...")
        result = subprocess.run(
            ["alembic", "current"],
            capture_output=True,
            text=True,
            check=False
        )
        logger.info(f"New version: {result.stdout.strip()}")

        logger.info("=" * 60)
        logger.info("✅ Migrations completed successfully!")
        logger.info("=" * 60)
        return 0

    except subprocess.CalledProcessError as e:
        logger.error("=" * 60)
        logger.error("❌ Migration failed!")
        logger.error("=" * 60)
        logger.error(f"Error: {e}")
        if e.stdout:
            logger.error(f"stdout: {e.stdout}")
        if e.stderr:
            logger.error(f"stderr: {e.stderr}")
        return 1
    except Exception as e:
        logger.error("=" * 60)
        logger.error("❌ Unexpected error during migration!")
        logger.error("=" * 60)
        logger.error(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(run_migrations())
