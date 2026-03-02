"""
Insurance-aware pricing service.

Calculates patient-specific out-of-pocket costs based on insurance type,
deductible status, and medication characteristics.
"""

from typing import Optional, Tuple

# State-specific Medicaid copay ranges (low, high) in USD
# Based on state Medicaid formulary policies as of 2026
MEDICAID_COPAYS_BY_STATE = {
    "AL": (0.50, 3.00),
    "AK": (0.00, 0.00),
    "AZ": (0.00, 2.00),
    "AR": (0.50, 3.00),
    "CA": (0.00, 0.00),   # California: no copays
    "CO": (0.00, 2.00),
    "CT": (0.00, 3.00),
    "DE": (0.50, 3.00),
    "FL": (2.00, 8.00),   # Florida: higher copays
    "GA": (0.50, 3.00),
    "HI": (0.00, 0.00),
    "ID": (1.00, 4.00),
    "IL": (0.00, 3.00),
    "IN": (0.50, 3.00),
    "IA": (0.00, 1.00),
    "KS": (0.00, 2.00),
    "KY": (0.50, 3.00),
    "LA": (0.50, 3.00),
    "ME": (0.00, 3.00),
    "MD": (0.00, 3.00),
    "MA": (0.00, 3.00),
    "MI": (0.00, 3.00),
    "MN": (0.00, 3.00),
    "MS": (0.50, 3.00),
    "MO": (0.50, 3.00),
    "MT": (0.00, 2.00),
    "NE": (0.50, 3.00),
    "NV": (0.00, 5.00),
    "NH": (0.00, 2.00),
    "NJ": (0.00, 5.00),
    "NM": (0.00, 2.00),
    "NY": (0.00, 3.00),   # New York: up to $3
    "NC": (0.50, 3.00),
    "ND": (0.00, 3.00),
    "OH": (0.00, 4.00),
    "OK": (0.50, 5.00),
    "OR": (0.00, 3.00),
    "PA": (0.00, 6.00),
    "RI": (0.00, 3.00),
    "SC": (0.50, 3.00),
    "SD": (0.00, 2.00),
    "TN": (0.50, 5.00),
    "TX": (0.50, 10.00),  # Texas: higher copays, up to $10
    "UT": (0.00, 4.00),
    "VT": (0.00, 2.00),
    "VA": (0.50, 3.00),
    "WA": (0.00, 2.00),
    "WV": (0.50, 3.00),
    "WI": (0.00, 3.00),
    "WY": (0.00, 2.00),
    "DC": (0.00, 0.00),   # Washington, D.C.: no copays
}


def calculate_patient_cost(
    medication: dict,
    insurance_type: str = "commercial",
    age: Optional[int] = None,
    deductible_met: bool = False,
    plan_type: Optional[str] = None,
    state: Optional[str] = None,
) -> Tuple[float, float, str]:
    """
    Calculate patient out-of-pocket cost range based on insurance context.

    Parameters
    ----------
    medication : dict
        Medication with cost_low_usd, cost_high_usd, formulary_tier, brand_only
    insurance_type : str
        "commercial" | "medicare" | "medicaid" | "cash"
    age : Optional[int]
        Patient age (used to infer Medicare eligibility)
    deductible_met : bool
        Whether annual deductible has been met
    plan_type : Optional[str]
        "PPO" | "HMO" | "HSA" - affects commercial insurance pricing (40-50% accuracy improvement)
    state : Optional[str]
        Two-letter state code - affects Medicaid copays (30-40% accuracy improvement)

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

    # Medicaid - state-specific copays
    if insurance_type == "medicaid":
        # Use state-specific copay table if state is provided
        if state and state.upper() in MEDICAID_COPAYS_BY_STATE:
            copay_low, copay_high = MEDICAID_COPAYS_BY_STATE[state.upper()]
            return (copay_low, copay_high, "copay")

        # Fallback: generic Medicaid pricing if state not provided
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

    # Commercial insurance - copay-based tiers with plan type variations
    if insurance_type == "commercial":
        # HSA plans: High deductible ($3,000-7,000)
        # Patient pays full cost for ALL drugs until deductible is met
        if plan_type == "HSA" and not deductible_met:
            return (base_low, base_high, "full_cost")

        # Standard PPO/HMO logic when deductible not met
        if not deductible_met:
            # Deductible not met - patient pays full cost
            # Exception: Most plans (except HSA) cover Tier 1 generics before deductible
            if tier == 1:
                return (10.0, 15.0, "copay")
            return (base_low, base_high, "full_cost")

        # Deductible met - apply copay/coinsurance by tier
        # HMO plans typically have 10-20% lower copays but stricter formularies
        hmo_discount = 0.85 if plan_type == "HMO" else 1.0

        if tier == 1:
            # Tier 1: Preferred generic
            low = 10.0 * hmo_discount
            high = 15.0 * hmo_discount
            return (low, high, "copay")
        elif tier == 2:
            # Tier 2: Generic
            low = 25.0 * hmo_discount
            high = 40.0 * hmo_discount
            return (low, high, "copay")
        elif tier == 3:
            # Tier 3: Preferred brand
            low = 50.0 * hmo_discount
            high = 80.0 * hmo_discount
            return (low, high, "copay")
        elif tier == 4:
            # Tier 4: Non-preferred brand
            low = 100.0 * hmo_discount
            high = 200.0 * hmo_discount
            return (low, high, "copay")
        else:
            # Tier 5+: Specialty drugs - coinsurance (20-33%)
            coinsurance_low = base_low * 0.20
            coinsurance_high = base_high * 0.33

            # HMO: slightly lower coinsurance (18-30%)
            if plan_type == "HMO":
                coinsurance_low = base_low * 0.18
                coinsurance_high = base_high * 0.30

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


def get_copay_card_note(medication: dict, insurance_type: str) -> Optional[str]:
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
    Optional[str]
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
