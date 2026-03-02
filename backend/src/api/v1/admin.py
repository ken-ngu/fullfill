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


@router.post("/migrate")
def run_migrations():
    """
    Run pending Alembic migrations.

    WARNING: This is for development/staging only.
    In production, this should be protected with authentication.
    """
    try:
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            check=True,
            cwd="/app"  # Railway working directory, falls back to current dir locally
        )

        return {
            "status": "success",
            "message": "Migrations completed successfully",
            "output": result.stdout,
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Migration failed: {e.stderr}"
        )


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


@router.get("/seed-info")
def seed_info():
    """Check how many medications are in the seed data."""
    from src.data.seed import MEDICATIONS

    # Check if acetaminophen-500mg-tablet is in the list
    has_tylenol = any(m["id"] == "acetaminophen-500mg-tablet" for m in MEDICATIONS)
    tylenol_med = next((m for m in MEDICATIONS if m["id"] == "acetaminophen-500mg-tablet"), None)

    return {
        "total_medications_in_seed": len(MEDICATIONS),
        "has_acetaminophen_500mg": has_tylenol,
        "tylenol_details": tylenol_med if tylenol_med else "Not found",
    }
