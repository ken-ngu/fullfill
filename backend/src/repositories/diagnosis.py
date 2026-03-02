from typing import Optional

from abc import ABC, abstractmethod
from sqlalchemy import func, String, or_
from sqlalchemy.orm import Session, joinedload
from src.models.diagnosis import Diagnosis


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
    result = {c.name: getattr(diagnosis, c.name) for c in diagnosis.__table__.columns}
    if include_medications and hasattr(diagnosis, 'medications'):
        result['medications'] = [med.id for med in diagnosis.medications]
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
        q_lower = f"%{q.lower()}%"

        query = self._session.query(Diagnosis).filter(
            or_(
                # Search by name
                Diagnosis.name.ilike(q_lower),
                # Search in synonyms JSON array
                func.lower(func.cast(Diagnosis.synonyms, String)).ilike(q_lower),
                # Search in ICD-10 codes JSON array
                func.lower(func.cast(Diagnosis.icd10_codes, String)).ilike(q_lower),
            )
        )

        results = query.limit(limit).all()
        return [_to_dict(d) for d in results]

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
        diagnosis = self._session.query(Diagnosis).options(
            joinedload(Diagnosis.medications)
        ).filter(
            Diagnosis.id == diagnosis_id
        ).first()

        if not diagnosis:
            return None

        return _to_dict(diagnosis, include_medications=True)
