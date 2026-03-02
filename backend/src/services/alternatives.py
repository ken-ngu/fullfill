
"""
Alternative medication lookup.

Priority:
1. Explicit alternative_ids (curated clinically)
2. Dynamic: same clinical_equivalence_group, lower cost_high_usd
3. Fallback: same therapeutic_class, lower cost_high_usd

Capped at 3 alternatives, sorted by cost_low_usd ascending.
"""

_MAX_ALTERNATIVES = 3


def find_alternatives(medication: dict, all_medications: list[dict]) -> list[dict]:
    """
    Parameters
    ----------
    medication      : dict  The currently selected medication
    all_medications : list  Full medication list from the repository

    Returns
    -------
    list[dict]  Up to 3 cheaper alternatives
    """
    explicit_ids = medication.get("alternative_ids") or []

    if explicit_ids:
        candidates = [m for m in all_medications if m["id"] in explicit_ids]
    else:
        group = medication.get("clinical_equivalence_group")
        if group:
            candidates = [
                m for m in all_medications
                if m.get("clinical_equivalence_group") == group
                and m["id"] != medication["id"]
                and m.get("cost_high_usd", 0) < medication.get("cost_high_usd", 0)
            ]
        else:
            candidates = [
                m for m in all_medications
                if m.get("therapeutic_class") == medication.get("therapeutic_class")
                and m["id"] != medication["id"]
                and m.get("cost_high_usd", 0) < medication.get("cost_high_usd", 0)
            ]

    candidates.sort(key=lambda m: m.get("cost_low_usd", 0))
    return candidates[:_MAX_ALTERNATIVES]


def build_switch_note(candidate: dict, source: dict) -> str:
    tc = candidate.get("therapeutic_class", "").replace("_", " ")
    return (
        f"Same class ({tc}), lower estimated cost"
        if not candidate.get("step_therapy_agents")
        else f"Same class ({tc}), lower estimated cost — also accepted as step therapy"
    )
