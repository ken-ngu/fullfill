from typing import Optional
import logging

from abc import ABC, abstractmethod
from sqlalchemy import func, String, or_, text
from sqlalchemy.orm import Session
from src.models.medication import Medication
from src.cache import (
    cache_get, cache_set, build_cache_key,
    CACHE_TTL_SEARCH, CACHE_TTL_MEDICATION, CACHE_TTL_TOP
)

logger = logging.getLogger(__name__)


class AbstractMedicationRepository(ABC):
    @abstractmethod
    def search(self, q: str, specialty: Optional[str] = None, setting: Optional[str] = None, limit: int = 10) -> list[dict]:
        pass

    @abstractmethod
    def get_by_id(self, medication_id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def get_all(self, specialty: Optional[str] = None) -> list[dict]:
        pass

    @abstractmethod
    def get_top(self, specialty: Optional[str] = None, setting: Optional[str] = None, limit: int = 6) -> list[dict]:
        pass


def _to_dict(med: Medication) -> dict:
    result = {c.name: getattr(med, c.name) for c in med.__table__.columns}
    # Include diagnoses relationship if loaded
    if hasattr(med, 'diagnoses') and med.diagnoses is not None:
        result['diagnoses'] = [diag.id for diag in med.diagnoses]
    return result


class PostgresMedicationRepository(AbstractMedicationRepository):
    def __init__(self, session: Session):
        self._session = session

    def search(self, q: str, specialty: Optional[str] = None, setting: Optional[str] = None, limit: int = 10) -> list[dict]:
        # Check cache first
        cache_key = build_cache_key("med", "search", q, specialty or "all", setting or "all", str(limit))
        cached = cache_get(cache_key)
        if cached is not None:
            logger.debug(f"Cache HIT: medication search '{q}'")
            return cached

        logger.debug(f"Cache MISS: medication search '{q}'")
        q_lower = f"%{q.lower()}%"

        # Build efficient JSONB array search using jsonb_array_elements_text
        # Use raw SQL for EXISTS subqueries as SQLAlchemy ORM doesn't handle them elegantly
        query = self._session.query(Medication).filter(
            or_(
                Medication.name.ilike(q_lower),
                Medication.generic_name.ilike(q_lower),
                text("EXISTS (SELECT 1 FROM jsonb_array_elements_text(brand_names) elem WHERE LOWER(elem) LIKE :q)").bindparams(q=q_lower)
            )
        )
        if specialty:
            query = query.filter(Medication.specialty == specialty)
        if setting:
            query = query.filter(Medication.setting == setting)

        results = [_to_dict(m) for m in query.limit(limit).all()]

        # Cache the results
        cache_set(cache_key, results, ttl=CACHE_TTL_SEARCH)

        return results

    def get_by_id(self, medication_id: str) -> Optional[dict]:
        # Check cache first
        cache_key = build_cache_key("med", "detail", medication_id)
        cached = cache_get(cache_key)
        if cached is not None:
            logger.debug(f"Cache HIT: medication detail '{medication_id}'")
            return cached

        logger.debug(f"Cache MISS: medication detail '{medication_id}'")
        from sqlalchemy.orm import joinedload
        med = self._session.query(Medication).options(
            joinedload(Medication.diagnoses)
        ).filter(Medication.id == medication_id).first()

        result = _to_dict(med) if med else None

        # Cache the result (even if None to prevent repeated lookups)
        if result:
            cache_set(cache_key, result, ttl=CACHE_TTL_MEDICATION)

        return result

    def get_all(self, specialty: Optional[str] = None) -> list[dict]:
        query = self._session.query(Medication)
        if specialty:
            query = query.filter(Medication.specialty == specialty)
        return [_to_dict(m) for m in query.all()]

    def get_top(self, specialty: Optional[str] = None, setting: Optional[str] = None, limit: int = 6) -> list[dict]:
        # Check cache first
        cache_key = build_cache_key("med", "top", specialty or "all", setting or "all", str(limit))
        cached = cache_get(cache_key)
        if cached is not None:
            logger.debug(f"Cache HIT: top medications")
            return cached

        logger.debug(f"Cache MISS: top medications")
        query = self._session.query(Medication)
        if specialty:
            query = query.filter(Medication.specialty == specialty)
        if setting:
            query = query.filter(Medication.setting == setting)
        results = (
            query.order_by(Medication.formulary_tier.asc(), Medication.name.asc())
            .limit(limit)
            .all()
        )

        result_list = [_to_dict(m) for m in results]

        # Cache the results
        cache_set(cache_key, result_list, ttl=CACHE_TTL_TOP)

        return result_list
