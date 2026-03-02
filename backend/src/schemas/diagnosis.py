from pydantic import BaseModel
from src.schemas.medication import CostEstimate


class DiagnosisSummary(BaseModel):
    """Diagnosis search result"""
    id: str
    name: str
    icd10_codes: list[str]
    category: str


class DiagnosisMedicationSummary(BaseModel):
    """Simplified medication view for diagnosis page"""
    id: str
    name: str
    generic_name: str
    brand_names: list[str] = []
    dosage_form: str
    strength: str
    formulary_tier: int
    requires_pa: bool
    cost_estimate: CostEstimate


class DiagnosisDetail(BaseModel):
    """Full diagnosis with all treatment medications"""
    id: str
    name: str
    icd10_codes: list[str]
    description: str | None = None
    category: str
    synonyms: list[str] = []
    medications: list[DiagnosisMedicationSummary]
