"""
Admin endpoints for database management.
For development/staging use only - should be protected in production.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.dependencies import get_db
import subprocess
import sys

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/seed-database")
def seed_database(
    db: Session = Depends(get_db)
):
    """
    Seed the database with initial data.

    WARNING: This is for development/staging only.
    In production, this should be protected with authentication.
    """
    try:
        # Import and run seed function
        from src.data import seed

        # Run the seed
        seed.seed_medications(db)
        seed.seed_diagnoses(db)
        seed.seed_goodrx_prices(db)

        db.commit()

        return {
            "status": "success",
            "message": "Database seeded successfully",
            "details": {
                "medications": "seeded",
                "diagnoses": "seeded",
                "goodrx_prices": "seeded"
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")


@router.get("/migration-status")
def migration_status():
    """Check current Alembic migration version."""
    try:
        result = subprocess.run(
            ["alembic", "current"],
            capture_output=True,
            text=True,
            check=True
        )

        return {
            "status": "success",
            "current_version": result.stdout.strip(),
            "python_version": sys.version
        }
    except subprocess.CalledProcessError as e:
        return {
            "status": "error",
            "error": e.stderr,
            "python_version": sys.version
        }
