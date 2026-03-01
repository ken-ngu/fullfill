from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from src.dependencies import get_medication_repo
from src.repositories.medication import AbstractMedicationRepository
from src.services.fill_risk import calculate_fill_risk
from src.services.alternatives import find_alternatives, build_switch_note
from src.services.confidence import calculate_confidence
from src.services.pricing import calculate_patient_cost, get_price_type_label, get_copay_card_note
from src.schemas.medication import (
    MedicationSummary,
    MedicationDetail,
    CostEstimate,
    PAStatus,
    AlternativeSummary,
    PatientContext,
)

router = APIRouter(prefix="/medications", tags=["medications"])


def _cost_estimate(med: dict, ctx: PatientContext | None = None) -> CostEstimate:
    if ctx is None:
        # Default patient context - show generic pricing
        low_usd = med["cost_low_usd"]
        high_usd = med["cost_high_usd"]
        label = "Estimated range"
    else:
        # Calculate insurance-specific pricing with plan type and state
        low_usd, high_usd, price_type = calculate_patient_cost(
            med,
            insurance_type=ctx.insurance_type,
            age=ctx.age,
            deductible_met=ctx.deductible_met,
            plan_type=ctx.plan_type,
            state=ctx.state,
        )
        label = get_price_type_label(price_type)

        # Add copay card note if applicable
        copay_note = get_copay_card_note(med, ctx.insurance_type)
        if copay_note:
            label = f"{label} (copay card may apply)"

    return CostEstimate(
        low_usd=low_usd,
        high_usd=high_usd,
        cost_basis=med["cost_basis"],
        label=label,
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


def _resolve_specialty(explicit: str | None, default: str = "dermatology") -> str:
    return explicit if explicit is not None else default


def _to_summary(m: dict) -> MedicationSummary:
    return MedicationSummary(
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
        setting=m.get("setting", "outpatient"),
        discharge_only=m.get("discharge_only", False),
    )


@router.get("/top", response_model=list[MedicationSummary])
def top_medications(
    specialty: str | None = Query(None),
    setting: str | None = Query(None),
    limit: int = Query(6, ge=1, le=20),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
) -> list[MedicationSummary]:
    resolved = _resolve_specialty(specialty)
    return [_to_summary(m) for m in repo.get_top(specialty=resolved, limit=limit, setting=setting)]


@router.get("/search", response_model=list[MedicationSummary])
def search_medications(
    q: str = Query(..., min_length=2, max_length=100),
    specialty: str | None = Query(None),
    setting: str | None = Query(None),
    limit: int = Query(10, ge=1, le=50),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
) -> list[MedicationSummary]:
    resolved = _resolve_specialty(specialty)
    return [_to_summary(m) for m in repo.search(q=q, specialty=resolved, limit=limit, setting=setting)]


@router.get("/{medication_id}", response_model=MedicationDetail)
def get_medication(
    medication_id: str,
    insurance_type: str = Query("commercial"),
    age: int | None = Query(None, ge=0, le=120),
    deductible_met: bool = Query(False),
    plan_type: str | None = Query(None),
    state: str | None = Query(None),
    specialty: str | None = Query(None),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
) -> MedicationDetail:
    resolved_specialty = _resolve_specialty(specialty)

    med = repo.get_by_id(medication_id)
    if med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    all_meds = repo.get_all(specialty=med["specialty"])
    alt_meds = find_alternatives(med, all_meds)

    fill_risk = calculate_fill_risk(med, specialty=resolved_specialty)
    confidence = calculate_confidence(med)

    # Create patient context for pricing
    patient_ctx = PatientContext(
        insurance_type=insurance_type,
        age=age,
        deductible_met=deductible_met,
        plan_type=plan_type,
        state=state,
    )

    alternatives = [
        AlternativeSummary(
            id=a["id"],
            name=a["name"],
            generic_name=a["generic_name"],
            cost_estimate=_cost_estimate(a, patient_ctx),
            fill_risk_level=calculate_fill_risk(a, specialty=resolved_specialty).level,
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
        setting=med.get("setting", "outpatient"),
        discharge_only=med.get("discharge_only", False),
        brand_names=med.get("brand_names") or [],
        therapeutic_class=med["therapeutic_class"],
        brand_only=med["brand_only"],
        step_therapy_required=med["step_therapy_required"],
        ndc_codes=med.get("ndc_codes") or [],
        confidence_score=confidence,
        cost_estimate=_cost_estimate(med, patient_ctx),
        fill_risk_level=fill_risk.level,
        fill_risk_score=int(fill_risk.score),
        fill_risk_reasons=fill_risk.reasons,
        fill_risk_plain_language=fill_risk.plain_language,
        pa_status=_pa_status(med),
        alternatives=alternatives,
    )
