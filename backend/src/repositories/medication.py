from __future__ import annotations

from abc import ABC, abstractmethod
from sqlalchemy import func, String
from sqlalchemy.orm import Session
from src.models.medication import Medication


class AbstractMedicationRepository(ABC):
    @abstractmethod
    def search(self, q: str, specialty: str | None = None, setting: str | None = None, limit: int = 10) -> list[dict]:
        pass

    @abstractmethod
    def get_by_id(self, medication_id: str) -> dict | None:
        pass

    @abstractmethod
    def get_all(self, specialty: str | None = None) -> list[dict]:
        pass

    @abstractmethod
    def get_top(self, specialty: str | None = None, setting: str | None = None, limit: int = 6) -> list[dict]:
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

    def search(self, q: str, specialty: str | None = None, setting: str | None = None, limit: int = 10) -> list[dict]:
        q_lower = f"%{q.lower()}%"
        # Search by name, generic name, and brand names (JSON array)
        query = self._session.query(Medication).filter(
            Medication.name.ilike(q_lower)
            | Medication.generic_name.ilike(q_lower)
            | func.lower(func.cast(Medication.brand_names, String)).ilike(q_lower)
        )
        if specialty:
            query = query.filter(Medication.specialty == specialty)
        if setting:
            query = query.filter(Medication.setting == setting)
        return [_to_dict(m) for m in query.limit(limit).all()]

    def get_by_id(self, medication_id: str) -> dict | None:
        from sqlalchemy.orm import joinedload
        med = self._session.query(Medication).options(
            joinedload(Medication.diagnoses)
        ).filter(Medication.id == medication_id).first()
        return _to_dict(med) if med else None

    def get_all(self, specialty: str | None = None) -> list[dict]:
        query = self._session.query(Medication)
        if specialty:
            query = query.filter(Medication.specialty == specialty)
        return [_to_dict(m) for m in query.all()]

    def get_top(self, specialty: str | None = None, setting: str | None = None, limit: int = 6) -> list[dict]:
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
        return [_to_dict(m) for m in results]
