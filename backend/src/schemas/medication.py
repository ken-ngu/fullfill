from pydantic import BaseModel
from typing import Optional


class CostEstimate(BaseModel):
    low_usd: float
    high_usd: float
    cost_basis: str
    label: str = "Estimated range"
    disclaimer: str = (
        "Actual cost depends on your patient's specific plan and deductible status. "
        "Manufacturer copay assistance may apply for commercially insured patients."
    )
    data_source: str


class PAStatus(BaseModel):
    required: bool
    approval_rate: Optional[float] = None
    turnaround_days: Optional[str] = None
    step_therapy_required: bool = False
    step_therapy_agents: list[str] = []


class AlternativeSummary(BaseModel):
    id: str
    name: str
    generic_name: str
    brand_names: list[str] = []
    cost_estimate: CostEstimate
    fill_risk_level: str
    confidence_score: int
    switch_note: str


class MedicationSummary(BaseModel):
    id: str
    name: str
    generic_name: str
    brand_names: list[str] = []
    specialty: str
    category: str
    dosage_form: str
    strength: str
    formulary_tier: int
    requires_pa: bool
    is_otc: bool
    setting: str = "outpatient"
    discharge_only: bool = False


class PatientContext(BaseModel):
    """Simple patient context — no PHI, just plan descriptors."""
    insurance_type: str = "commercial"   # commercial | medicare | medicaid | cash
    age: Optional[int] = None            # Used to infer age_group; not stored
    deductible_met: bool = False         # Has annual deductible been met?
    plan_type: Optional[str] = None      # PPO | HMO | HSA (for commercial only)
    state: Optional[str] = None          # Two-letter state code (for Medicaid)


class MedicationDetail(MedicationSummary):
    brand_names: list[str]
    therapeutic_class: str
    brand_only: bool
    step_therapy_required: bool
    ndc_codes: list[str]

    confidence_score: int
    cost_estimate: CostEstimate
    fill_risk_level: str
    fill_risk_score: int
    fill_risk_reasons: list[str]
    fill_risk_plain_language: str
    pa_status: PAStatus
    alternatives: list[AlternativeSummary]
