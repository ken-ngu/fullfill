"""
Insurance-aware pricing service.

Calculates patient-specific out-of-pocket costs based on insurance type,
deductible status, and medication characteristics.
"""

from __future__ import annotations
from typing import Tuple


def calculate_patient_cost(
    medication: dict,
    insurance_type: str = "commercial",
    age: int | None = None,
    deductible_met: bool = False,
) -> Tuple[float, float, str]:
    """
    Calculate patient out-of-pocket cost range based on insurance context.

    Parameters
    ----------
    medication : dict
        Medication with cost_low_usd, cost_high_usd, formulary_tier, brand_only
    insurance_type : str
        "commercial" | "medicare" | "medicaid" | "cash"
    age : int | None
        Patient age (used to infer Medicare eligibility)
    deductible_met : bool
        Whether annual deductible has been met

    Returns
    -------
    (low_usd, high_usd, price_type) : tuple
        - low_usd: Minimum estimated patient cost
        - high_usd: Maximum estimated patient cost
        - price_type: "copay" | "coinsurance" | "cash" | "full_cost"
    """
    base_low = medication["cost_low_usd"]
    base_high = medication["cost_high_usd"]
    tier = medication.get("formulary_tier", 2)
    brand_only = medication.get("brand_only", False)

    # Infer Medicare if age >= 65
    if age is not None and age >= 65 and insurance_type == "commercial":
        insurance_type = "medicare"

    # Cash pricing - baseline, no insurance benefit
    if insurance_type == "cash":
        return (base_low, base_high, "cash")

    # Medicaid - minimal cost-share regardless of tier
    if insurance_type == "medicaid":
        # Medicaid typically has $0-$10 copays regardless of drug cost
        # Some states have no cost-share at all
        if base_high < 50:  # Inexpensive generics
            return (0.0, 3.0, "copay")
        else:
            return (0.0, 10.0, "copay")

    # Medicare Part D - complex coverage phases
    if insurance_type == "medicare":
        if not deductible_met:
            # In deductible phase ($505 in 2026)
            # Patient pays full cost until deductible is met
            return (base_low, base_high, "full_cost")

        # After deductible, in initial coverage phase
        if tier <= 2:
            # Preferred generics - minimal copay
            return (0.0, 10.0, "copay")
        else:
            # Brand drugs - typically 25% coinsurance
            coinsurance_low = base_low * 0.25
            coinsurance_high = base_high * 0.25
            return (coinsurance_low, coinsurance_high, "coinsurance")

    # Commercial insurance - copay-based tiers
    if insurance_type == "commercial":
        if not deductible_met:
            # Deductible not met - patient pays full cost
            # Exception: Some plans cover generics before deductible
            if tier == 1:
                return (10.0, 15.0, "copay")
            return (base_low, base_high, "full_cost")

        # Deductible met - apply copay/coinsurance by tier
        if tier == 1:
            # Tier 1: Preferred generic
            return (10.0, 15.0, "copay")
        elif tier == 2:
            # Tier 2: Generic
            return (25.0, 40.0, "copay")
        elif tier == 3:
            # Tier 3: Preferred brand
            return (50.0, 80.0, "copay")
        elif tier == 4:
            # Tier 4: Non-preferred brand
            return (100.0, 200.0, "copay")
        else:
            # Tier 5+: Specialty drugs - coinsurance (20-33%)
            coinsurance_low = base_low * 0.20
            coinsurance_high = base_high * 0.33

            # Cap at full cost (can't exceed actual price)
            coinsurance_low = min(coinsurance_low, base_low)
            coinsurance_high = min(coinsurance_high, base_high)

            return (coinsurance_low, coinsurance_high, "coinsurance")

    # Fallback: return base pricing
    return (base_low, base_high, "cash")


def get_price_type_label(price_type: str) -> str:
    """
    Get human-readable label for price type.

    Parameters
    ----------
    price_type : str
        "copay" | "coinsurance" | "cash" | "full_cost"

    Returns
    -------
    str
        Label explaining the price type
    """
    labels = {
        "copay": "Estimated copay",
        "coinsurance": "Estimated coinsurance",
        "cash": "Cash price",
        "full_cost": "Full cost (deductible not met)",
    }
    return labels.get(price_type, "Estimated range")


def get_copay_card_note(medication: dict, insurance_type: str) -> str | None:
    """
    Check if medication may be eligible for manufacturer copay card.

    Copay cards are ONLY available for commercial insurance (illegal for Medicare/Medicaid).
    Typically available for brand-name specialty drugs (tier 4-5).

    Parameters
    ----------
    medication : dict
        Medication details
    insurance_type : str
        Patient's insurance type

    Returns
    -------
    str | None
        Note about copay card availability, or None
    """
    if insurance_type != "commercial":
        return None

    tier = medication.get("formulary_tier", 2)
    brand_only = medication.get("brand_only", False)

    # Manufacturer copay cards typically for brand specialty drugs
    if brand_only and tier >= 4:
        return "Manufacturer copay assistance may reduce cost to $0-$25 for eligible patients"

    return None
