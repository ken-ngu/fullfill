from typing import Optional

"""
Confidence score (0–100) for cost estimate reliability.

Reflects how well public data predicts what the patient will actually pay.
Simple additive formula — every point is traceable to a business rule.

Design property: public-data scores cap around 55–65 even for the best generics.
RTPB in v2 pushes clean generics to 80–100.
Specialty biologics (Dupixent) stay low even with RTPB.
"""

_BASE_SCORES = {
    "rtpb": 60,
    "public-data": 30,
    "manual": 20,
}

_GENERIC_BONUS = 15
_BRAND_ONLY_PENALTY = -10
_LOW_TIER_BONUS = 10        # tier <= 2
_HIGH_TIER_PENALTY = -15    # tier >= 4
_NDC_BONUS = 10
_NARROW_RANGE_BONUS = 10    # variability < 0.20
_WIDE_RANGE_PENALTY = -10   # variability >= 0.50
_PA_PENALTY = -5
_OTC_BONUS = 15
_RTPB_BONUS = 25            # live adjudicated data


def calculate_confidence(medication: dict, rtpb_data: Optional[dict] = None) -> int:
    """
    Parameters
    ----------
    medication : dict  Keys from Medication model (SQLAlchemy row as dict or seed dict)
    rtpb_data  : Optional[dict]  Real-time pharmacy benefit response (v2); None = v1 behaviour

    Returns
    -------
    int  Clamped to [0, 100]
    """
    data_source = medication.get("data_source", "public-data")
    base = _BASE_SCORES.get("rtpb" if rtpb_data else data_source, 20)
    score = base

    # Generic vs. brand
    if medication.get("brand_only"):
        score += _BRAND_ONLY_PENALTY
    else:
        score += _GENERIC_BONUS

    # Formulary tier
    tier = medication.get("formulary_tier", 3)
    if tier <= 2:
        score += _LOW_TIER_BONUS
    elif tier >= 4:
        score += _HIGH_TIER_PENALTY

    # NDC codes populated (drug precisely identified)
    if medication.get("ndc_codes"):
        score += _NDC_BONUS

    # Price range width
    high = medication.get("cost_high_usd") or 0.0
    low = medication.get("cost_low_usd") or 0.0
    variability = (high - low) / high if high > 0 else 0.0
    if variability < 0.20:
        score += _NARROW_RANGE_BONUS
    elif variability >= 0.50:
        score += _WIDE_RANGE_PENALTY

    # PA required
    if medication.get("requires_pa"):
        score += _PA_PENALTY

    # OTC drug (shelf price = fixed, no plan variability)
    if medication.get("is_otc"):
        score += _OTC_BONUS

    # RTPB bonus (v2)
    if rtpb_data is not None:
        score += _RTPB_BONUS

    return max(0, min(100, score))


def confidence_label(score: int) -> str:
    """Human-readable label shown in the UI (never raw number)."""
    if score >= 75:
        return "Good estimate"
    if score >= 50:
        return "Estimate may vary"
    return "Limited data"


def confidence_tier(score: int) -> str:
    """Returns 'good' | 'moderate' | 'limited' for UI colour logic."""
    if score >= 75:
        return "good"
    if score >= 50:
        return "moderate"
    return "limited"
