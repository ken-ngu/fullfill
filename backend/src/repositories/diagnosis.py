from typing import Optional
import logging

from abc import ABC, abstractmethod
from sqlalchemy import func, String, or_, text
from sqlalchemy.orm import Session, joinedload
from src.models.diagnosis import Diagnosis
from src.cache import (
    cache_get, cache_set, build_cache_key,
    CACHE_TTL_SEARCH, CACHE_TTL_DIAGNOSIS
)

logger = logging.getLogger(__name__)

# Cache column names to avoid repeated reflection (performance optimization)
_DIAGNOSIS_COLUMNS = None


def _get_diagnosis_columns():
    """Get cached list of diagnosis column names."""
    global _DIAGNOSIS_COLUMNS
    if _DIAGNOSIS_COLUMNS is None:
        _DIAGNOSIS_COLUMNS = [c.name for c in Diagnosis.__table__.columns]
    return _DIAGNOSIS_COLUMNS


class AbstractDiagnosisRepository(ABC):
    @abstractmethod
    def search(self, q: str, limit: int = 10) -> list[dict]:
        """Search diagnoses by name, ICD-10 code, or synonyms"""
        pass

    @abstractmethod
    def get_by_id(self, diagnosis_id: str) -> Optional[dict]:
        """Get single diagnosis by ID"""
        pass

    @abstractmethod
    def get_medications_for_diagnosis(self, diagnosis_id: str) -> Optional[dict]:
        """Get diagnosis with all associated medications (with joinedload)"""
        pass


def _to_dict(diagnosis: Diagnosis, include_medications: bool = False) -> dict:
    """Convert Diagnosis model to dictionary"""
    # Use cached column names instead of reflecting every time (performance optimization)
    columns = _get_diagnosis_columns()
    result = {col: getattr(diagnosis, col) for col in columns}
    if include_medications and hasattr(diagnosis, 'medications'):
        # Import _to_dict from medication repo to avoid circular imports
        from src.repositories.medication import _to_dict as med_to_dict
        # Return full medication dictionaries, not just IDs
        result['medications'] = [med_to_dict(med) for med in diagnosis.medications]
    return result


class PostgresDiagnosisRepository(AbstractDiagnosisRepository):
    def __init__(self, session: Session):
        self._session = session

    def search(self, q: str, limit: int = 10) -> list[dict]:
        """
        Search diagnoses by name, ICD-10 code, or synonyms using case-insensitive LIKE.

        Examples:
        - "uti" matches "Urinary Tract Infection" (via synonyms)
        - "N39" matches "Urinary Tract Infection" (via ICD-10 code)
        - "acne" matches "Acne Vulgaris" (via name)
        """
        # Check cache first
        cache_key = build_cache_key("diag", "search", q, str(limit))
        cached = cache_get(cache_key)
        if cached is not None:
            logger.debug(f"Cache HIT: diagnosis search '{q}'")
            return cached

        logger.debug(f"Cache MISS: diagnosis search '{q}'")
        q_lower = f"%{q.lower()}%"

        # Build efficient JSONB array search using jsonb_array_elements_text
        # Use raw SQL for EXISTS subqueries as SQLAlchemy ORM doesn't handle them elegantly
        query = self._session.query(Diagnosis).filter(
            or_(
                Diagnosis.name.ilike(q_lower),
                text("EXISTS (SELECT 1 FROM jsonb_array_elements_text(synonyms) elem WHERE LOWER(elem) LIKE :q)").bindparams(q=q_lower),
                text("EXISTS (SELECT 1 FROM jsonb_array_elements_text(icd10_codes) elem WHERE LOWER(elem) LIKE :q)").bindparams(q=q_lower),
            )
        )

        results = query.limit(limit).all()
        result_list = [_to_dict(d) for d in results]

        # Cache the results
        cache_set(cache_key, result_list, ttl=CACHE_TTL_SEARCH)

        return result_list

    def get_by_id(self, diagnosis_id: str) -> Optional[dict]:
        """Get single diagnosis by ID without medications"""
        diagnosis = self._session.query(Diagnosis).filter(
            Diagnosis.id == diagnosis_id
        ).first()

        return _to_dict(diagnosis) if diagnosis else None

    def get_medications_for_diagnosis(self, diagnosis_id: str) -> Optional[dict]:
        """
        Get diagnosis with all associated medications eagerly loaded.
        This is used for the diagnosis detail page to show all treatment options.
        """
        # Check cache first
        cache_key = build_cache_key("diag", "detail", diagnosis_id)
        cached = cache_get(cache_key)
        if cached is not None:
            logger.debug(f"Cache HIT: diagnosis detail '{diagnosis_id}'")
            return cached

        logger.debug(f"Cache MISS: diagnosis detail '{diagnosis_id}'")
        diagnosis = self._session.query(Diagnosis).options(
            joinedload(Diagnosis.medications)
        ).filter(
            Diagnosis.id == diagnosis_id
        ).first()

        if not diagnosis:
            return None

        result = _to_dict(diagnosis, include_medications=True)

        # Cache the result
        cache_set(cache_key, result, ttl=CACHE_TTL_DIAGNOSIS)

        return result
