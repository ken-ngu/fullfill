from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import joinedload
from src.dependencies import get_medication_repo, get_goodrx_price_repo
from src.repositories.medication import AbstractMedicationRepository
from src.repositories.goodrx_price import AbstractGoodRxPriceRepository
from src.services.fill_risk import calculate_fill_risk
from src.services.alternatives import find_alternatives, build_switch_note
from src.services.confidence import calculate_confidence
from src.services.pricing import calculate_patient_cost, get_price_type_label, get_copay_card_note
from src.services.goodrx_scraper import GoodRxScraperService
from src.schemas.medication import (
    MedicationSummary,
    MedicationDetail,
    CostEstimate,
    GoodRxPrice,
    PAStatus,
    AlternativeSummary,
    PatientContext,
)
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/medications", tags=["medications"])


def _cost_estimate(
    med: dict,
    ctx: Optional[PatientContext] = None,
    goodrx_data: Optional[dict] = None,
) -> CostEstimate:
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

    # Add GoodRx price if available
    goodrx_price = None
    if goodrx_data:
        goodrx_price = GoodRxPrice(
            cash_price_low_usd=goodrx_data["cash_price_low_usd"],
            cash_price_high_usd=goodrx_data["cash_price_high_usd"],
            coupon_price_usd=goodrx_data.get("coupon_price_usd"),
            last_updated=goodrx_data.get("fetched_at"),
        )

    return CostEstimate(
        low_usd=low_usd,
        high_usd=high_usd,
        cost_basis=med["cost_basis"],
        label=label,
        data_source=med["data_source"],
        goodrx_price=goodrx_price,
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


def _to_summary(m: dict) -> MedicationSummary:
    return MedicationSummary(
        id=m["id"],
        name=m["name"],
        generic_name=m["generic_name"],
        brand_names=m.get("brand_names") or [],
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
    specialty: Optional[str] = Query(None),
    setting: Optional[str] = Query(None),
    limit: int = Query(6, ge=1, le=20),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
) -> list[MedicationSummary]:
    return [_to_summary(m) for m in repo.get_top(specialty=specialty, limit=limit, setting=setting)]


@router.get("/search", response_model=list[MedicationSummary])
def search_medications(
    q: str = Query(..., min_length=2, max_length=100),
    specialty: Optional[str] = Query(None),
    setting: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
) -> list[MedicationSummary]:
    return [_to_summary(m) for m in repo.search(q=q, specialty=specialty, limit=limit, setting=setting)]


@router.get("/{medication_id}", response_model=MedicationDetail)
async def get_medication(
    medication_id: str,
    insurance_type: str = Query("commercial"),
    age: Optional[int] = Query(None, ge=0, le=120),
    deductible_met: bool = Query(False),
    plan_type: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    repo: AbstractMedicationRepository = Depends(get_medication_repo),
    goodrx_repo: AbstractGoodRxPriceRepository = Depends(get_goodrx_price_repo),
) -> MedicationDetail:
    med = repo.get_by_id(medication_id)
    if med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    all_meds = repo.get_all(specialty=med["specialty"])
    alt_meds = find_alternatives(med, all_meds)

    fill_risk = calculate_fill_risk(med, specialty=specialty or med["specialty"])
    confidence = calculate_confidence(med)

    # Create patient context for pricing
    patient_ctx = PatientContext(
        insurance_type=insurance_type,
        age=age,
        deductible_met=deductible_met,
        plan_type=plan_type,
        state=state,
    )

    # Fetch GoodRx price - use cached data only (real-time scraping disabled)
    goodrx_price = goodrx_repo.get_by_medication_id(medication_id)

    # DISABLED: Real-time GoodRx scraping (was causing 403 errors and slowness)
    # Check if we need to fetch fresh data (expired or missing)
    # needs_fetch = goodrx_price is None or (
    #     goodrx_price.get("expires_at") and
    #     goodrx_price["expires_at"] < datetime.utcnow()
    # )
    #
    # if needs_fetch:
    #     logger.info(f"Fetching real-time GoodRx data for: {med['generic_name']}")
    #     scraper = GoodRxScraperService()
    #
    #     try:
    #         # Fetch real-time price
    #         fresh_price = await scraper.fetch_price(
    #             medication_name=med["generic_name"],
    #             ndc_code=med.get("ndc_codes")[0] if med.get("ndc_codes") else None
    #         )
    #
    #         if fresh_price:
    #             # Save to database for future use
    #             fresh_price["id"] = f"goodrx-{medication_id}"
    #             fresh_price["medication_id"] = medication_id
    #             fresh_price["fetched_at"] = datetime.utcnow()
    #
    #             goodrx_repo.upsert(fresh_price)
    #             goodrx_price = fresh_price
    #             logger.info(f"Successfully fetched and cached GoodRx price for: {med['generic_name']}")
    #         else:
    #             logger.warning(f"Failed to fetch GoodRx price for: {med['generic_name']}")
    #     except Exception as e:
    #         logger.error(f"Error fetching GoodRx price for {med['generic_name']}: {e}")

    alternatives = [
        AlternativeSummary(
            id=a["id"],
            name=a["name"],
            generic_name=a["generic_name"],
            brand_names=a.get("brand_names") or [],
            cost_estimate=_cost_estimate(a, patient_ctx),
            fill_risk_level=calculate_fill_risk(a, specialty=specialty or a["specialty"]).level,
            confidence_score=calculate_confidence(a),
            switch_note=build_switch_note(a, med),
        )
        for a in alt_meds
    ]

    # Get diagnosis IDs for this medication
    # Note: This requires the medication model to be queried with joinedload
    # For now, return empty list until we update the repository to support this
    diagnoses_ids = med.get("diagnoses", [])

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
        cost_estimate=_cost_estimate(med, patient_ctx, goodrx_price),
        fill_risk_level=fill_risk.level,
        fill_risk_score=int(fill_risk.score),
        fill_risk_reasons=fill_risk.reasons,
        fill_risk_plain_language=fill_risk.plain_language,
        pa_status=_pa_status(med),
        alternatives=alternatives,
        diagnoses=diagnoses_ids,
    )
