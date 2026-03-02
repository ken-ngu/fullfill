
from fastapi import Depends, HTTPException, Header
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from src.config import settings
from src.repositories.medication import PostgresMedicationRepository, AbstractMedicationRepository
from src.repositories.diagnosis import PostgresDiagnosisRepository, AbstractDiagnosisRepository
from src.repositories.goodrx_price import PostgresGoodRxPriceRepository, AbstractGoodRxPriceRepository
from src.repositories.replenishment import PostgresReplenishmentRepository, AbstractReplenishmentRepository
from src.auth.service import verify_token_payload

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


def get_diagnosis_repo(db: Session = Depends(get_db)) -> AbstractDiagnosisRepository:
    return PostgresDiagnosisRepository(db)


def get_goodrx_price_repo(db: Session = Depends(get_db)) -> AbstractGoodRxPriceRepository:
    return PostgresGoodRxPriceRepository(db)


def get_replenishment_repo(db: Session = Depends(get_db)) -> AbstractReplenishmentRepository:
    return PostgresReplenishmentRepository(db)


# Legacy function - no longer used (auth removed for public access)
def get_current_clinic() -> str:
    return "public"


# Legacy function - no longer used (auth removed for public access)
def get_current_clinic_specialty() -> str:
    return "dermatology"


# Role-based access control helpers for 340B features
def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Extract and validate user from JWT token.

    Returns user info including role and organization_id.
    For 340B features, user must be authenticated.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    # Verify token and get payload
    payload = verify_token_payload(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # For now, we'll use the clinic code as a stub user system
    # In production, you'd query the User table here
    # This is a STUB implementation - replace with real user lookup
    return {
        "user_id": payload.get("sub", "unknown"),
        "role": "hospital_admin",  # STUB - would come from User table
        "organization_id": "childrens-hospital-seattle",  # STUB - would come from User table
        "email": f"{payload.get('sub')}@example.com",  # STUB
    }


def require_340b_role(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Require user to have hospital_admin or pharmacy_staff role.

    This dependency should be used on all 340B replenishment endpoints.
    """
    allowed_roles = ["hospital_admin", "pharmacy_staff", "system_admin"]

    if current_user["role"] not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
        )

    return current_user
