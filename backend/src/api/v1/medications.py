from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from src.dependencies import get_medication_repo, get_current_clinic
from src.repositories.medication import AbstractMedicationRepository
from src.services.fill_risk import calculate_fill_risk
from src.services.alternatives import find_alternatives, build_switch_note
from src.services.confidence import calculate_confidence
from src.schemas.medication import (
    MedicationSummary,
    MedicationDetail,
    CostEstimate,
    PAStatus,
    AlternativeSummary,
    PatientContext,
)

router = APIRouter(prefix="/medications", tags=["medications"])


def _cost_estimate(med: dict) -> CostEstimate:
    return CostEstimate(
        low_usd=med["cost_low_usd"],
        high_usd=med["cost_high_usd"],
        cost_basis=med["cost_basis"],
        data_source=med["data_source"],
    )


def _pa_status(med: dict) -> PAStatus:
    turnaround = None
    if med.get("pa_turnaround_days_min") and med.get("pa_turnaround_days_max"):
        turnaround = f"{med['pa_turnaround_days_min']}–{med['pa_turnaround_days_max']} business days"
    return PAStatus(
        required=med["requires_pa"],
        approval_rate=med.get("pa_approval_rate"),
        turnaround_days=turnaround,
        step_therapy_required=med["step_therapy_required"],
        step_therapy_agents=med.get("step_therapy_agents") or [],
    )


@router.get("/search", response_model=list[MedicationSummary])
def search_medications(
    q: str = Query(..., min_length=2, max_length=100),
    specialty: str | None = Query(None),
    limit: int = Query(10, ge=1, le=50),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
    _clinic: str = Depends(get_current_clinic),
) -> list[MedicationSummary]:
    results = repo.search(q=q, specialty=specialty, limit=limit)
    return [
        MedicationSummary(
            id=m["id"],
            name=m["name"],
            generic_name=m["generic_name"],
            specialty=m["specialty"],
            category=m["category"],
            dosage_form=m["dosage_form"],
            strength=m["strength"],
            formulary_tier=m["formulary_tier"],
            requires_pa=m["requires_pa"],
            is_otc=m.get("is_otc", False),
        )
        for m in results
    ]


@router.get("/{medication_id}", response_model=MedicationDetail)
def get_medication(
    medication_id: str,
    insurance_type: str = Query("commercial"),
    age: int | None = Query(None, ge=0, le=120),
    deductible_met: bool = Query(False),
    specialty: str = Query("dermatology"),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
    _clinic: str = Depends(get_current_clinic),
) -> MedicationDetail:
    med = repo.get_by_id(medication_id)
    if med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    all_meds = repo.get_all(specialty=med["specialty"])
    alt_meds = find_alternatives(med, all_meds)

    fill_risk = calculate_fill_risk(med, specialty=specialty)
    confidence = calculate_confidence(med)

    alternatives = [
        AlternativeSummary(
            id=a["id"],
            name=a["name"],
            generic_name=a["generic_name"],
            cost_estimate=_cost_estimate(a),
            fill_risk_level=calculate_fill_risk(a, specialty=specialty).level,
            confidence_score=calculate_confidence(a),
            switch_note=build_switch_note(a, med),
        )
        for a in alt_meds
    ]

    return MedicationDetail(
        id=med["id"],
        name=med["name"],
        generic_name=med["generic_name"],
        specialty=med["specialty"],
        category=med["category"],
        dosage_form=med["dosage_form"],
        strength=med["strength"],
        formulary_tier=med["formulary_tier"],
        requires_pa=med["requires_pa"],
        is_otc=med.get("is_otc", False),
        brand_names=med.get("brand_names") or [],
        therapeutic_class=med["therapeutic_class"],
        brand_only=med["brand_only"],
        step_therapy_required=med["step_therapy_required"],
        ndc_codes=med.get("ndc_codes") or [],
        confidence_score=confidence,
        cost_estimate=_cost_estimate(med),
        fill_risk_level=fill_risk.level,
        fill_risk_score=int(fill_risk.score),
        fill_risk_reasons=fill_risk.reasons,
        fill_risk_plain_language=fill_risk.plain_language,
        pa_status=_pa_status(med),
        alternatives=alternatives,
    )
