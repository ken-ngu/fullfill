
"""
Simple JWT auth service.
v1: clinic code + PIN → HS256 JWT with 8h expiry.
No patient PHI is ever stored or transmitted through auth.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from src.config import settings

# v1: hardcoded clinic registry — code, pin, default specialty
# v2: move to DB-backed clinic table
_CLINIC_REGISTRY: dict[str, dict[str, str]] = {
    "DEMO":      {"pin": "demo123",   "specialty": "dermatology"},
    "ER001":     {"pin": "er123",     "specialty": "emergency"},
    "UC001":     {"pin": "uc123",     "specialty": "urgent_care"},
    "CLINIC001": {"pin": "change-me", "specialty": "dermatology"},
}

_ALGORITHM = "HS256"


def authenticate_clinic(clinic_code: str, pin: str) -> bool:
    entry = _CLINIC_REGISTRY.get(clinic_code.upper())
    return entry is not None and entry["pin"] == pin


def get_clinic_specialty(clinic_code: str) -> str:
    entry = _CLINIC_REGISTRY.get(clinic_code.upper())
    return entry["specialty"] if entry else "dermatology"


def create_token(clinic_code: str) -> str:
    code = clinic_code.upper()
    expires = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours)
    payload = {
        "sub": code,
        "specialty": get_clinic_specialty(code),
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITHM)


def verify_token(token: str) -> Optional[str]:
    """Returns clinic_code if valid, None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def verify_token_payload(token: str) -> Optional[dict]:
    """Returns full decoded payload if valid, None if invalid/expired."""
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITHM])
    except JWTError:
        return None
