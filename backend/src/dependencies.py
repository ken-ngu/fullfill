from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from src.config import settings
from src.auth.service import verify_token
from src.repositories.medication import PostgresMedicationRepository, AbstractMedicationRepository

_engine = create_engine(settings.database_url)
_SessionLocal = sessionmaker(bind=_engine)

_bearer = HTTPBearer()


def get_db() -> Session:
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_medication_repo(db: Session = Depends(get_db)) -> AbstractMedicationRepository:
    return PostgresMedicationRepository(db)


def get_current_clinic(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    clinic_code = verify_token(credentials.credentials)
    if clinic_code is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return clinic_code
