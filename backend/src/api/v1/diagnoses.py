from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from src.dependencies import get_diagnosis_repo
from src.repositories.diagnosis import AbstractDiagnosisRepository
from src.schemas.diagnosis import DiagnosisSummary, DiagnosisDetail, DiagnosisMedicationSummary
from src.schemas.medication import PatientContext, CostEstimate
from src.services.pricing import calculate_patient_cost, get_price_type_label, get_copay_card_note

router = APIRouter(prefix="/diagnoses", tags=["diagnoses"])


def _cost_estimate(med: dict, ctx: Optional[PatientContext] = None) -> CostEstimate:
    """Calculate cost estimate for a medication (same logic as medications endpoint)"""
    if ctx is None:
        # Default patient context - show generic pricing
        low_usd = med["cost_low_usd"]
        high_usd = med["cost_high_usd"]
        label = "Estimated range"
    else:
        # Calculate insurance-specific pricing
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


@router.get("/search", response_model=list[DiagnosisSummary])
def search_diagnoses(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(10, ge=1, le=50),
    repo: AbstractDiagnosisRepository = Depends(get_diagnosis_repo),
) -> list[DiagnosisSummary]:
    """
    Search diagnoses by name, ICD-10 code, or synonyms.

    Examples:
    - "uti" matches "Urinary Tract Infection" (via synonyms)
    - "N39" matches "Urinary Tract Infection" (via ICD-10 code)
    - "acne" matches "Acne Vulgaris" (via name)
    """
    results = repo.search(q=q, limit=limit)
    return [
        DiagnosisSummary(
            id=d["id"],
            name=d["name"],
            icd10_codes=d["icd10_codes"],
            category=d["category"],
        )
        for d in results
    ]


@router.get("/{diagnosis_id}", response_model=DiagnosisDetail)
def get_diagnosis(
    diagnosis_id: str,
    insurance_type: str = Query("commercial"),
    age: Optional[int] = Query(None, ge=0, le=120),
    deductible_met: bool = Query(False),
    plan_type: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    diagnosis_repo: AbstractDiagnosisRepository = Depends(get_diagnosis_repo),
) -> DiagnosisDetail:
    """
    Get diagnosis details with all medications that treat it.

    Medications are sorted by cost (cheapest first) and include patient-specific pricing.
    """
    # Get diagnosis with medication IDs
    diagnosis_data = diagnosis_repo.get_medications_for_diagnosis(diagnosis_id)
    if diagnosis_data is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    # Create patient context for pricing
    patient_ctx = PatientContext(
        insurance_type=insurance_type,
        age=age,
        deductible_met=deductible_met,
        plan_type=plan_type,
        state=state,
    )

    # Use already-loaded medication data (no additional queries needed!)
    # The repository returns full medication dictionaries via joinedload
    medications = []
    for med in diagnosis_data.get("medications", []):
        cost_est = _cost_estimate(med, patient_ctx)
        medications.append(
            DiagnosisMedicationSummary(
                id=med["id"],
                name=med["name"],
                generic_name=med["generic_name"],
                brand_names=med.get("brand_names") or [],
                dosage_form=med["dosage_form"],
                strength=med["strength"],
                formulary_tier=med["formulary_tier"],
                requires_pa=med["requires_pa"],
                cost_estimate=cost_est,
            )
        )

    # Sort medications by cost (cheapest first)
    medications.sort(key=lambda m: m.cost_estimate.low_usd)

    return DiagnosisDetail(
        id=diagnosis_data["id"],
        name=diagnosis_data["name"],
        icd10_codes=diagnosis_data["icd10_codes"],
        description=diagnosis_data.get("description"),
        category=diagnosis_data["category"],
        synonyms=diagnosis_data.get("synonyms") or [],
        medications=medications,
    )
