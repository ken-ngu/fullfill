from __future__ import annotations

"""
Fill risk scoring engine.

Specialty-aware additive point system.
All weights are config-driven — tune per specialty without code changes.
Designed to accept optional rtpb_data in v2 without interface changes.
"""

from dataclasses import dataclass

FILL_RISK_WEIGHTS: dict[str, dict[str, float]] = {
    "default": {
        "requires_pa": 2.0,
        "brand_only": 1.0,
        "high_tier": 1.0,    # tier >= 3
        "step_therapy": 1.0,
    },
    "dermatology": {
        "requires_pa": 2.0,
        "brand_only": 1.0,
        "high_tier": 1.0,
        "step_therapy": 1.0,
    },
    "endocrinology": {
        "requires_pa": 3.0,
        "brand_only": 2.0,
        "high_tier": 1.5,
        "step_therapy": 1.5,
    },
    "primary_care": {
        "requires_pa": 1.5,
        "brand_only": 0.5,
        "high_tier": 1.0,
        "step_therapy": 1.5,
    },
    "urgent_care": {
        "requires_pa": 1.5,
        "brand_only": 1.5,
        "high_tier": 1.5,
        "step_therapy": 2.0,
    },
    "emergency": {
        "requires_pa": 0.5,
        "brand_only": 2.5,
        "high_tier": 2.0,
        "step_therapy": 2.5,
    },
}

_HIGH_TIER_THRESHOLD = 3
_MEDIUM_MIN = 1
_HIGH_MIN = 3


@dataclass
class FillRiskResult:
    level: str          # LOW | MEDIUM | HIGH
    score: float
    max_score: float
    reasons: list[str]
    plain_language: str
    is_rtpb_enhanced: bool = False


_PLAIN_LANGUAGE = {
    "LOW": "This prescription is likely to be filled without barriers.",
    "MEDIUM": "Some patients may face cost or coverage barriers with this drug.",
    "HIGH": "Most patients will encounter significant barriers to filling this prescription.",
}


def calculate_fill_risk(
    medication: dict,
    specialty: str = "dermatology",
    rtpb_data: dict | None = None,
) -> FillRiskResult:
    """
    Parameters
    ----------
    medication : dict   Medication fields
    specialty  : str    Used to select weights
    rtpb_data  : dict | None  If present, adjusts score based on live benefit data

    Returns
    -------
    FillRiskResult
    """
    weights = FILL_RISK_WEIGHTS.get(specialty, FILL_RISK_WEIGHTS["default"])
    max_score = sum(weights.values())
    score = 0.0
    reasons: list[str] = []

    if medication.get("requires_pa"):
        score += weights["requires_pa"]
        approval_rate = medication.get("pa_approval_rate")
        min_days = medication.get("pa_turnaround_days_min")
        max_days = medication.get("pa_turnaround_days_max")
        reason = "Prior authorization required"
        if approval_rate is not None:
            reason += f" — typical approval rate {int(approval_rate * 100)}%"
        if min_days and max_days:
            reason += f", {min_days}–{max_days} business days"
        reasons.append(reason)

    if medication.get("brand_only"):
        score += weights["brand_only"]
        reasons.append("No generic available")

    tier = medication.get("formulary_tier", 2)
    if tier >= _HIGH_TIER_THRESHOLD:
        score += weights["high_tier"]
        tier_label = "Specialty formulary tier" if tier >= 4 else f"Formulary tier {tier}"
        reasons.append(f"{tier_label} (higher cost-share)")

    if medication.get("step_therapy_required"):
        score += weights["step_therapy"]
        agents = medication.get("step_therapy_agents", [])
        reason = "Step therapy required"
        if agents:
            reason += f" — must document failure of {', '.join(agents[:2])} first"
        reasons.append(reason)

    # v2: apply RTPB adjustments when live data is present
    if rtpb_data is not None:
        score = _apply_rtpb_adjustments(score, rtpb_data, weights)

    if score < _MEDIUM_MIN:
        level = "LOW"
    elif score < _HIGH_MIN:
        level = "MEDIUM"
    else:
        level = "HIGH"

    if not reasons:
        reasons.append("No fill barriers identified")

    return FillRiskResult(
        level=level,
        score=score,
        max_score=max_score,
        reasons=reasons,
        plain_language=_PLAIN_LANGUAGE[level],
        is_rtpb_enhanced=rtpb_data is not None,
    )


def _apply_rtpb_adjustments(
    score: float,
    rtpb_data: dict,
    weights: dict[str, float],
) -> float:
    """Placeholder for v2 RTPB score adjustment logic."""
    # In v2: use rtpb_data["pa_required"], rtpb_data["formulary_tier"], etc.
    # to override or supplement the static score.
    return score
