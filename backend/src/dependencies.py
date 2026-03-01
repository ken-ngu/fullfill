from __future__ import annotations

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from src.config import settings
from src.repositories.medication import PostgresMedicationRepository, AbstractMedicationRepository

_engine = create_engine(settings.database_url)
_SessionLocal = sessionmaker(bind=_engine)


def get_db() -> Session:
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_medication_repo(db: Session = Depends(get_db)) -> AbstractMedicationRepository:
    return PostgresMedicationRepository(db)


# Legacy function - no longer used (auth removed for public access)
def get_current_clinic() -> str:
    return "public"


# Legacy function - no longer used (auth removed for public access)
def get_current_clinic_specialty() -> str:
    return "dermatology"
