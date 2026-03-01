from __future__ import annotations

"""
Simple JWT auth service.
v1: clinic code + PIN → HS256 JWT with 8h expiry.
No patient PHI is ever stored or transmitted through auth.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from src.config import settings

# v1: hardcoded clinic credentials for prototype
# v2: move to DB-backed clinic table
_CLINIC_CREDENTIALS: dict[str, str] = {
    "DEMO": "demo123",
    "CLINIC001": "change-me",
}

_ALGORITHM = "HS256"


def authenticate_clinic(clinic_code: str, pin: str) -> bool:
    expected = _CLINIC_CREDENTIALS.get(clinic_code.upper())
    return expected is not None and expected == pin


def create_token(clinic_code: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours)
    payload = {
        "sub": clinic_code.upper(),
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITHM)


def verify_token(token: str) -> str | None:
    """Returns clinic_code if valid, None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
